import crypto from "node:crypto";

// Reading verification codes out of an account's backup mailbox, so a buyer
// never has to log into Outlook to finish a login.
//
// Microsoft turned off basic auth (IMAP/POP with a password) for personal
// Outlook accounts, so the only way in is OAuth against Microsoft Graph. We
// use the device-code flow: the mailbox owner authorises once at
// microsoft.com/devicelogin, we keep an encrypted refresh token, and from then
// on the dashboard reads the inbox on its own.

const LOGIN_HOST = "https://login.microsoftonline.com";
const GRAPH_HOST = "https://graph.microsoft.com/v1.0";

// Mail.Read is the default because it includes bodyPreview, and some senders
// put the code in the body rather than the subject. Mail.ReadBasic is the
// tighter grant (no body, no attachments) and works whenever the code is in
// the subject line — which is the common case for Meta and Microsoft.
const DEFAULT_SCOPES = "offline_access User.Read Mail.Read";

const sha256Base64Url = (value) => crypto.createHash("sha256").update(value).digest("base64url");

// Access tokens last about an hour. Refresh a minute early so a code request
// never races the expiry.
const TOKEN_SKEW_MS = 60_000;

// ── Code extraction ───────────────────────────────────────────────────
// Ordered by how sure we can be. The first pattern that matches wins, so an
// explicit "your code is 123456" beats a bare number sitting in the subject.
const CODE_PATTERNS = [
  // "123456 is your Facebook code", "12345 is your login code"
  { weight: 100, re: /\b(\d{4,8})\b\s+(?:is|é|es|ist)\s+your\b/i },
  // "Your code is 123456", "security code: 123456", "código: 123456"
  {
    weight: 95,
    re: /(?:c[oó]digo|code|kod|codice|passcode|otp)\b[^0-9\n]{0,24}?(\d{4,8})\b/i,
  },
  // "Use 123456 to confirm"
  { weight: 80, re: /\buse\s+(\d{4,8})\b/i },
  // Standalone 5-8 digits — plausible on its own, weak by itself.
  { weight: 40, re: /(?<!\d)(\d{5,8})(?!\d)/ },
];

// Years and other obvious non-codes that the weak pattern would otherwise grab.
const isImplausibleCode = (code) => {
  if (/^(19|20)\d{2}$/.test(code)) return true; // a year
  if (/^(\d)\1+$/.test(code)) return true; // 000000, 111111
  return false;
};

export const extractVerificationCode = (text) => {
  const haystack = String(text || "");
  if (!haystack) return null;
  for (const { re, weight } of CODE_PATTERNS) {
    const match = haystack.match(re);
    if (match && match[1] && !isImplausibleCode(match[1])) {
      return { code: match[1], weight };
    }
  }
  return null;
};

// ── Forwarded mail ────────────────────────────────────────────────────
// A Cloudflare Worker hands us the raw RFC-822 message. We are not building a
// mail client — just enough decoding to find a six-digit code, which lives in
// the subject far more often than not.

// Quoted-printable is what most transactional senders use, and it happily
// splits a code across a soft line break ("12=\r\n3456").
const decodeQuotedPrintable = (text) =>
  String(text || "")
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/gi, (_match, hex) => String.fromCharCode(parseInt(hex, 16)));

const stripHtml = (text) =>
  String(text || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ");

export const extractCodeFromRawEmail = (raw, subject = "") => {
  // Subject first — it is the least noisy place a code appears.
  const fromSubject = extractVerificationCode(subject);
  if (fromSubject) return fromSubject.code;

  const text = String(raw || "");
  if (!text) return null;
  // Headers end at the first blank line; everything after is body.
  const split = text.search(/\r?\n\r?\n/);
  const body = split === -1 ? text : text.slice(split);
  const readable = stripHtml(decodeQuotedPrintable(body)).slice(0, 8000);
  return extractVerificationCode(readable)?.code || null;
};

// Pull the Subject header out of a raw message, unfolding continuation lines.
export const readSubjectFromRaw = (raw) => {
  const match = String(raw || "").match(/^subject:[ \t]*(.*(?:\r?\n[ \t]+.*)*)/im);
  return match ? match[1].replace(/\r?\n[ \t]+/g, " ").trim() : "";
};

const SENDER_HINTS = /facebook|meta|instagram|microsoft|outlook|account|security|noreply|no-reply/i;

// Scores every message and returns them newest-first with whatever code each
// one yielded. The caller shows the list; the top scorer is pre-selected.
export const readCodesFromMessages = (messages, { now = Date.now() } = {}) =>
  (Array.isArray(messages) ? messages : [])
    .map((message) => {
      const subject = String(message?.subject || "");
      const preview = String(message?.bodyPreview || "");
      const fromAddress = String(
        message?.from?.emailAddress?.address || message?.sender?.emailAddress?.address || ""
      );
      const fromName = String(message?.from?.emailAddress?.name || "");
      const received = message?.receivedDateTime ? Date.parse(message.receivedDateTime) : NaN;
      const ageMs = Number.isFinite(received) ? Math.max(0, now - received) : null;

      // Subject first: verification mails almost always put the code there,
      // and the preview can carry unrelated numbers.
      const found = extractVerificationCode(subject) || extractVerificationCode(preview);
      let score = found ? found.weight : 0;
      if (found && SENDER_HINTS.test(`${fromAddress} ${fromName} ${subject}`)) score += 25;
      // A code more than 15 minutes old is almost certainly spent.
      if (found && ageMs !== null && ageMs <= 15 * 60_000) score += 30;
      else if (found && ageMs !== null && ageMs > 60 * 60_000) score -= 40;

      return {
        id: message?.id || null,
        subject,
        preview: preview.slice(0, 180),
        from: fromAddress,
        fromName,
        receivedDateTime: message?.receivedDateTime || null,
        ageMs,
        code: found?.code || null,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || (b.receivedDateTime || "").localeCompare(a.receivedDateTime || ""));

// ── Graph client ──────────────────────────────────────────────────────
export const createMailboxClient = ({
  clientId,
  // Optional. The authorization-code exchange happens on our server, which
  // makes this a confidential client — Azure's "Web" platform expects a
  // secret. Device code stays public and never sends it.
  clientSecret = "",
  // "consumers" = personal Outlook/Hotmail/Live accounts, which is what the
  // team's backup mailboxes are. "common" would also accept work accounts.
  tenant = "consumers",
  scopes = DEFAULT_SCOPES,
  fetchImpl = globalThis.fetch,
} = {}) => {
  const enabled = Boolean(clientId);
  const SCOPES = scopes;

  const requireConfig = () => {
    if (!enabled) {
      const error = new Error(
        "Mailbox reading is not configured. Set MS_GRAPH_CLIENT_ID to the Azure app's Application (client) ID."
      );
      error.statusCode = 503;
      throw error;
    }
  };

  const postForm = async (url, body) => {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  };

  // Step 1: ask Microsoft for a code the mailbox owner will type in.
  const startDeviceCode = async () => {
    requireConfig();
    const { ok, data } = await postForm(`${LOGIN_HOST}/${tenant}/oauth2/v2.0/devicecode`, {
      client_id: clientId,
      scope: SCOPES,
    });
    if (!ok || !data.device_code) {
      const error = new Error(data.error_description || "Microsoft would not start the sign-in.");
      error.statusCode = 502;
      throw error;
    }
    return {
      deviceCode: data.device_code,
      userCode: data.user_code,
      verificationUri: data.verification_uri || "https://microsoft.com/devicelogin",
      expiresIn: data.expires_in || 900,
      interval: data.interval || 5,
    };
  };

  // Step 2: poll until they finish. "pending" is the normal case, not an error.
  const pollDeviceCode = async (deviceCode) => {
    requireConfig();
    const { ok, data } = await postForm(`${LOGIN_HOST}/${tenant}/oauth2/v2.0/token`, {
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      client_id: clientId,
      device_code: deviceCode,
    });
    if (ok && data.access_token) {
      return {
        state: "connected",
        accessToken: data.access_token,
        refreshToken: data.refresh_token || "",
        expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
      };
    }
    if (data.error === "authorization_pending") return { state: "pending" };
    if (data.error === "slow_down") return { state: "pending", slowDown: true };
    if (data.error === "expired_token") return { state: "expired" };
    if (data.error === "authorization_declined") return { state: "declined" };
    return { state: "error", message: data.error_description || "Sign-in failed." };
  };

  // ── Authorization-code flow (the "sign in from the dashboard" path) ──
  // A popup goes to Microsoft's real login page and comes back to us with a
  // code. Nicer than device code — nothing to type — and `prompt=login` stops
  // Microsoft silently reusing whatever account the browser already has, which
  // is the failure mode that connects the wrong inbox.
  const buildAuthorizeUrl = ({ redirectUri, state, codeChallenge, loginHint }) => {
    requireConfig();
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope: SCOPES,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "login",
    });
    if (loginHint) params.set("login_hint", loginHint);
    return `${LOGIN_HOST}/${tenant}/oauth2/v2.0/authorize?${params}`;
  };

  const exchangeCode = async ({ code, redirectUri, codeVerifier }) => {
    requireConfig();
    const { ok, data } = await postForm(`${LOGIN_HOST}/${tenant}/oauth2/v2.0/token`, {
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      ...(clientSecret ? { client_secret: clientSecret } : {}),
    });
    if (!ok || !data.access_token) {
      const error = new Error(data.error_description || "Microsoft rejected the sign-in.");
      error.statusCode = 502;
      throw error;
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || "",
      expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    };
  };

  const refreshAccessToken = async (refreshToken) => {
    requireConfig();
    const { ok, data } = await postForm(`${LOGIN_HOST}/${tenant}/oauth2/v2.0/token`, {
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
      scope: SCOPES,
      ...(clientSecret ? { client_secret: clientSecret } : {}),
    });
    if (!ok || !data.access_token) {
      const error = new Error(
        data.error_description || "The mailbox connection expired. Reconnect the inbox."
      );
      error.statusCode = 401;
      error.needsReconnect = true;
      throw error;
    }
    return {
      accessToken: data.access_token,
      // Microsoft rotates refresh tokens — keep the new one or the next
      // refresh fails.
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    };
  };

  // Which mailbox actually signed in. Device-code sign-in happens in whatever
  // browser the person has open, so it is entirely possible to approve as the
  // wrong account — we check rather than trust.
  const getSignedInAddress = async (accessToken) => {
    const response = await fetchImpl(`${GRAPH_HOST}/me?$select=mail,userPrincipalName`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || "Could not confirm which mailbox signed in.");
      error.statusCode = 502;
      throw error;
    }
    return String(data.mail || data.userPrincipalName || "").trim();
  };

  const listMessages = async (accessToken, { top = 15 } = {}) => {
    const params = new URLSearchParams({
      $top: String(top),
      $select: "id,subject,bodyPreview,from,receivedDateTime",
      $orderby: "receivedDateTime desc",
    });
    const response = await fetchImpl(`${GRAPH_HOST}/me/messages?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || "Could not read the mailbox.");
      error.statusCode = response.status === 401 ? 401 : 502;
      error.needsReconnect = response.status === 401;
      throw error;
    }
    return Array.isArray(data.value) ? data.value : [];
  };

  return {
    enabled,
    startDeviceCode,
    pollDeviceCode,
    buildAuthorizeUrl,
    exchangeCode,
    refreshAccessToken,
    getSignedInAddress,
    listMessages,
    TOKEN_SKEW_MS,
  };
};

// PKCE: proves the browser that started the sign-in is the one finishing it,
// so an intercepted code is useless on its own. Required for a public client
// (we hold no client secret).
export const createPkcePair = (randomBytes) => {
  const verifier = randomBytes(32).toString("base64url");
  return { verifier, challenge: sha256Base64Url(verifier) };
};

// Personal Microsoft accounts sign in under several equivalent spellings, so
// compare leniently — but only on the parts that identify the mailbox.
export const addressesMatch = (expected, actual) => {
  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      // Guest/external accounts arrive as "name_outlook.com#EXT#@tenant"
      .replace(/#ext#@.*$/, "")
      .replace(/_([a-z0-9.-]+\.[a-z]{2,})$/, "@$1");
  const left = normalize(expected);
  const right = normalize(actual);
  return Boolean(left) && Boolean(right) && left === right;
};

export const isAccessTokenUsable = (expiresAt, now = Date.now()) =>
  Boolean(expiresAt) && new Date(expiresAt).getTime() - TOKEN_SKEW_MS > now;
