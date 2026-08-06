import { describe, it, expect } from "vitest";
import {
  createPkcePair,
  isAllowedSender,
  parseSenderAllowlist,
  extractCodeFromRawEmail,
  readSubjectFromRaw,
  addressesMatch,
  createMailboxClient,
  extractVerificationCode,
  isAccessTokenUsable,
  readCodesFromMessages,
} from "../server/lib/mailbox.js";

describe("verification code extraction", () => {
  it("reads the Facebook / Meta phrasing", () => {
    expect(extractVerificationCode("123456 is your Facebook code")?.code).toBe("123456");
    expect(extractVerificationCode("60411 is your Instagram code")?.code).toBe("60411");
  });

  it("reads the explicit-label phrasing in several languages", () => {
    expect(extractVerificationCode("Your security code is 447291")?.code).toBe("447291");
    expect(extractVerificationCode("Seu código: 883021")?.code).toBe("883021");
    expect(extractVerificationCode("Verification code 55120")?.code).toBe("55120");
    expect(extractVerificationCode("Doğrulama kodu: 903113")?.code).toBe("903113");
  });

  it("falls back to a standalone code", () => {
    expect(extractVerificationCode("Microsoft account 7391042")?.code).toBe("7391042");
  });

  it("does not mistake a year or a repeated digit run for a code", () => {
    expect(extractVerificationCode("Your 2024 account summary")).toBeNull();
    expect(extractVerificationCode("code 000000")).toBeNull();
  });

  it("returns null when there is no code at all", () => {
    expect(extractVerificationCode("Welcome to Outlook")).toBeNull();
    expect(extractVerificationCode("")).toBeNull();
  });

  it("prefers the explicit phrasing over a stray number", () => {
    // The weak pattern would grab 20250 first if ordering were wrong.
    const found = extractVerificationCode("Order 20250 — your code is 665511");
    expect(found.code).toBe("665511");
  });
});

describe("picking the right message", () => {
  const now = Date.parse("2026-08-05T12:00:00Z");
  const messages = [
    {
      id: "old",
      subject: "445566 is your Facebook code",
      bodyPreview: "",
      from: { emailAddress: { address: "security@facebookmail.com" } },
      receivedDateTime: "2026-08-05T09:00:00Z", // 3 hours ago
    },
    {
      id: "fresh",
      subject: "778899 is your Facebook code",
      bodyPreview: "",
      from: { emailAddress: { address: "security@facebookmail.com" } },
      receivedDateTime: "2026-08-05T11:58:00Z", // 2 minutes ago
    },
    {
      id: "newsletter",
      subject: "Your weekly digest",
      bodyPreview: "Nothing to see",
      from: { emailAddress: { address: "news@example.com" } },
      receivedDateTime: "2026-08-05T11:59:00Z",
    },
  ];

  it("puts the freshest real code first", () => {
    const [top] = readCodesFromMessages(messages, { now });
    expect(top.id).toBe("fresh");
    expect(top.code).toBe("778899");
  });

  it("ranks a stale code below a fresh one", () => {
    const ranked = readCodesFromMessages(messages, { now });
    expect(ranked.findIndex((m) => m.id === "fresh")).toBeLessThan(
      ranked.findIndex((m) => m.id === "old")
    );
  });

  it("keeps codeless mail in the list but without a code", () => {
    const newsletter = readCodesFromMessages(messages, { now }).find((m) => m.id === "newsletter");
    expect(newsletter.code).toBeNull();
  });

  it("reports how old each message is", () => {
    const fresh = readCodesFromMessages(messages, { now }).find((m) => m.id === "fresh");
    expect(fresh.ageMs).toBe(2 * 60_000);
  });

  it("survives junk input", () => {
    expect(readCodesFromMessages(null)).toEqual([]);
    expect(readCodesFromMessages([{}])).toHaveLength(1);
  });
});

describe("confirming the right mailbox signed in", () => {
  it("accepts the same address in any casing or spacing", () => {
    expect(addressesMatch("Random47@outlook.com", " random47@OUTLOOK.com ")).toBe(true);
  });

  it("accepts the guest/external spelling Microsoft sometimes returns", () => {
    expect(addressesMatch("random47@outlook.com", "random47_outlook.com#EXT#@tenant.onmicrosoft.com")).toBe(
      true
    );
  });

  it("rejects a different mailbox — the whole point of the check", () => {
    expect(addressesMatch("random47@outlook.com", "leo@deusaffiliates.com")).toBe(false);
    // Same local part, different provider: still the wrong inbox.
    expect(addressesMatch("random47@outlook.com", "random47@gmail.com")).toBe(false);
  });

  it("refuses to match on missing information", () => {
    expect(addressesMatch("random47@outlook.com", "")).toBe(false);
    expect(addressesMatch("", "random47@outlook.com")).toBe(false);
    expect(addressesMatch(null, null)).toBe(false);
  });

  it("reads the address from mail, falling back to userPrincipalName", async () => {
    const make = (data) =>
      createMailboxClient({
        clientId: "c",
        fetchImpl: async () => ({ ok: true, status: 200, json: async () => data }),
      });
    expect(await make({ mail: "a@outlook.com" }).getSignedInAddress("AT")).toBe("a@outlook.com");
    expect(await make({ userPrincipalName: "b@outlook.com" }).getSignedInAddress("AT")).toBe(
      "b@outlook.com"
    );
  });
});

describe("token freshness", () => {
  const now = Date.parse("2026-08-05T12:00:00Z");

  it("treats a token expiring within the skew as unusable", () => {
    expect(isAccessTokenUsable(new Date(now + 30_000).toISOString(), now)).toBe(false);
  });

  it("accepts a token with real time left", () => {
    expect(isAccessTokenUsable(new Date(now + 20 * 60_000).toISOString(), now)).toBe(true);
  });

  it("treats a missing expiry as unusable", () => {
    expect(isAccessTokenUsable(null, now)).toBe(false);
  });
});

describe("device code flow", () => {
  const makeClient = (responses) => {
    const calls = [];
    const fetchImpl = async (url, options) => {
      calls.push({ url, body: options?.body });
      const next = responses.shift();
      return {
        ok: next.ok ?? true,
        status: next.status ?? 200,
        json: async () => next.data,
      };
    };
    return { client: createMailboxClient({ clientId: "test-client", fetchImpl }), calls };
  };

  it("returns the code the user has to type", async () => {
    const { client, calls } = makeClient([
      {
        data: {
          device_code: "DEV",
          user_code: "H7J2K9",
          verification_uri: "https://microsoft.com/devicelogin",
          expires_in: 900,
          interval: 5,
        },
      },
    ]);
    const started = await client.startDeviceCode();
    expect(started.userCode).toBe("H7J2K9");
    expect(started.deviceCode).toBe("DEV");
    expect(calls[0].url).toContain("/devicecode");
    expect(calls[0].body).toContain("offline_access");
  });

  it("reports pending while the user has not finished", async () => {
    const { client } = makeClient([{ ok: false, status: 400, data: { error: "authorization_pending" } }]);
    expect(await client.pollDeviceCode("DEV")).toEqual({ state: "pending" });
  });

  it("returns the tokens once they approve", async () => {
    const { client } = makeClient([
      { data: { access_token: "AT", refresh_token: "RT", expires_in: 3600 } },
    ]);
    const result = await client.pollDeviceCode("DEV");
    expect(result.state).toBe("connected");
    expect(result.refreshToken).toBe("RT");
  });

  it("distinguishes expiry from refusal", async () => {
    const expired = makeClient([{ ok: false, status: 400, data: { error: "expired_token" } }]);
    expect((await expired.client.pollDeviceCode("D")).state).toBe("expired");
    const declined = makeClient([{ ok: false, status: 400, data: { error: "authorization_declined" } }]);
    expect((await declined.client.pollDeviceCode("D")).state).toBe("declined");
  });

  it("keeps the rotated refresh token", async () => {
    const { client } = makeClient([
      { data: { access_token: "AT2", refresh_token: "RT2", expires_in: 3600 } },
    ]);
    expect((await client.refreshAccessToken("RT1")).refreshToken).toBe("RT2");
  });

  it("keeps the old refresh token when Microsoft does not send a new one", async () => {
    const { client } = makeClient([{ data: { access_token: "AT2", expires_in: 3600 } }]);
    expect((await client.refreshAccessToken("RT1")).refreshToken).toBe("RT1");
  });

  it("asks for a reconnect when the refresh token is dead", async () => {
    const { client } = makeClient([
      { ok: false, status: 400, data: { error_description: "AADSTS70008: expired" } },
    ]);
    await expect(client.refreshAccessToken("RT")).rejects.toMatchObject({ needsReconnect: true });
  });

  it("flags a 401 from Graph as needing a reconnect", async () => {
    const { client } = makeClient([{ ok: false, status: 401, data: { error: { message: "bad token" } } }]);
    await expect(client.listMessages("AT")).rejects.toMatchObject({ needsReconnect: true });
  });

  it("fails closed when no client id is configured", async () => {
    const client = createMailboxClient({ clientId: "" });
    expect(client.enabled).toBe(false);
    await expect(client.startDeviceCode()).rejects.toThrow(/not configured/i);
  });
});

describe("authorization-code flow", () => {
  const client = createMailboxClient({ clientId: "test-client" });

  it("forces a fresh sign-in and pre-fills the mailbox", () => {
    const url = new URL(
      client.buildAuthorizeUrl({
        redirectUri: "https://api.example.com/api/mailbox/oauth/callback",
        state: "ST",
        codeChallenge: "CH",
        loginHint: "random47@outlook.com",
      })
    );
    const q = url.searchParams;
    // prompt=login is what stops Microsoft silently reusing the browser's
    // current account and connecting the wrong inbox.
    expect(q.get("prompt")).toBe("login");
    expect(q.get("login_hint")).toBe("random47@outlook.com");
    expect(q.get("response_type")).toBe("code");
    expect(q.get("code_challenge_method")).toBe("S256");
    expect(q.get("code_challenge")).toBe("CH");
    expect(q.get("state")).toBe("ST");
    expect(q.get("scope")).toContain("offline_access");
    expect(url.pathname).toContain("/consumers/oauth2/v2.0/authorize");
  });

  it("derives a PKCE challenge that verifies against its verifier", async () => {
    const crypto = await import("node:crypto");
    const { verifier, challenge } = createPkcePair(crypto.randomBytes);
    expect(challenge).toBe(crypto.createHash("sha256").update(verifier).digest("base64url"));
    expect(verifier).not.toBe(challenge);
    // base64url only — a "+" or "/" would break the query string.
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("sends the verifier when exchanging the code", async () => {
    let sentBody = "";
    const spy = createMailboxClient({
      clientId: "test-client",
      fetchImpl: async (_url, options) => {
        sentBody = options.body;
        return { ok: true, status: 200, json: async () => ({ access_token: "AT", refresh_token: "RT", expires_in: 3600 }) };
      },
    });
    const result = await spy.exchangeCode({
      code: "CODE",
      redirectUri: "https://api.example.com/cb",
      codeVerifier: "VERIFIER",
    });
    expect(sentBody).toContain("code_verifier=VERIFIER");
    expect(sentBody).toContain("grant_type=authorization_code");
    expect(result.refreshToken).toBe("RT");
  });

  it("surfaces Microsoft's reason when it rejects the exchange", async () => {
    const failing = createMailboxClient({
      clientId: "c",
      fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ error_description: "AADSTS70000: bad code" }) }),
    });
    await expect(
      failing.exchangeCode({ code: "x", redirectUri: "y", codeVerifier: "z" })
    ).rejects.toThrow(/AADSTS70000/);
  });
});

describe("forwarded mail", () => {
  const message = (headers, body) => `${headers}\r\n\r\n${body}`;

  it("takes the code from the subject when it is there", () => {
    const raw = message("From: security@facebookmail.com\r\nSubject: 604112 is your Facebook code", "ignore 999999");
    expect(extractCodeFromRawEmail(raw, "604112 is your Facebook code")).toBe("604112");
  });

  it("falls back to the body when the subject has none", () => {
    const raw = message("Subject: Security alert", "Your verification code is 883021. It expires soon.");
    expect(extractCodeFromRawEmail(raw, "Security alert")).toBe("883021");
  });

  it("reassembles a code split by a quoted-printable soft break", () => {
    const raw = message("Subject: Alert", "Your code is 44=\r\n7291 and expires shortly");
    expect(extractCodeFromRawEmail(raw, "Alert")).toBe("447291");
  });

  it("decodes quoted-printable escapes", () => {
    const raw = message("Subject: Alert", "C=C3=B3digo: 550132");
    expect(extractCodeFromRawEmail(raw, "Alert")).toBe("550132");
  });

  it("reads through HTML mail", () => {
    const raw = message(
      "Subject: Alert",
      "<html><style>.x{color:#123456}</style><body><p>Your code is <b>729104</b></p></body></html>"
    );
    // The stylesheet hex must not be mistaken for the code.
    expect(extractCodeFromRawEmail(raw, "Alert")).toBe("729104");
  });

  it("never reads a code out of the headers", () => {
    // Message-IDs and DKIM headers are full of long digit runs.
    const raw = message(
      "Subject: Welcome\r\nMessage-ID: <209471043@mx.example.com>\r\nX-Ref: 5567281",
      "Nothing useful here."
    );
    expect(extractCodeFromRawEmail(raw, "Welcome")).toBeNull();
  });

  it("returns null rather than guessing", () => {
    expect(extractCodeFromRawEmail("", "")).toBeNull();
    expect(extractCodeFromRawEmail(message("Subject: Hi", "No numbers at all"), "Hi")).toBeNull();
  });

  it("reads and unfolds the subject header", () => {
    expect(readSubjectFromRaw("From: a@b.c\r\nSubject: 604112 is your code\r\n\r\nbody")).toBe(
      "604112 is your code"
    );
    expect(readSubjectFromRaw("Subject: a very long\r\n  folded subject\r\n\r\nbody")).toBe(
      "a very long folded subject"
    );
    expect(readSubjectFromRaw("From: a@b.c\r\n\r\nbody")).toBe("");
  });
});

describe("reading the whole mailbox, Junk included", () => {
  const makeClient = (byPath) =>
    createMailboxClient({
      clientId: "c",
      fetchImpl: async (url) => {
        const hit = Object.entries(byPath).find(([path]) => url.includes(path));
        if (!hit) return { ok: false, status: 404, json: async () => ({ error: { message: "no" } }) };
        return { ok: true, status: 200, json: async () => ({ value: hit[1] }) };
      },
    });

  const msg = (id, subject, when) => ({ id, subject, bodyPreview: "", receivedDateTime: when });

  it("merges Junk in and marks where each message was found", async () => {
    const client = makeClient({
      "/me/mailFolders/JunkEmail/messages": [msg("j1", "778899 is your Facebook code", "2026-08-06T10:05:00Z")],
      "/me/messages": [msg("m1", "Welcome", "2026-08-06T10:00:00Z")],
    });
    const rows = await client.listMessages("AT");
    expect(rows.map((r) => r.id)).toEqual(["j1", "m1"]); // newest first
    expect(rows.find((r) => r.id === "j1").folder).toBe("junk");
    expect(rows.find((r) => r.id === "m1").folder).toBe("inbox");
  });

  it("finds a code that only exists in Junk — the case forwarding can never see", async () => {
    const client = makeClient({
      "/me/mailFolders/JunkEmail/messages": [msg("j1", "604112 is your Facebook code", "2026-08-06T10:05:00Z")],
      "/me/messages": [],
    });
    const ranked = readCodesFromMessages(await client.listMessages("AT"));
    expect(ranked[0].code).toBe("604112");
    expect(ranked[0].folder).toBe("junk");
  });

  it("does not double-count a message returned by both queries", async () => {
    const shared = msg("same", "123456 is your code", "2026-08-06T10:00:00Z");
    const client = makeClient({
      "/me/mailFolders/JunkEmail/messages": [shared],
      "/me/messages": [shared],
    });
    expect(await client.listMessages("AT")).toHaveLength(1);
  });

  it("still returns the mailbox when the Junk folder is missing", async () => {
    const client = makeClient({ "/me/messages": [msg("m1", "hi", "2026-08-06T10:00:00Z")] });
    const rows = await client.listMessages("AT");
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("m1");
  });
});

describe("only the senders that actually issue codes", () => {
  const list = parseSenderAllowlist();

  it("defaults to exactly the two Facebook addresses", () => {
    expect(list).toEqual(["security@facebookmail.com", "notification@facebookmail.com"]);
  });

  it("accepts those two, in any casing or with a display name", () => {
    expect(isAllowedSender("security@facebookmail.com", list)).toBe(true);
    expect(isAllowedSender("Notification@FacebookMail.com", list)).toBe(true);
    expect(isAllowedSender("Facebook <security@facebookmail.com>", list)).toBe(true);
  });

  it("rejects everything else, including near misses", () => {
    expect(isAllowedSender("advertise@facebookmail.com", list)).toBe(false);
    // Lookalike domains are the whole reason this exists.
    expect(isAllowedSender("security@facebook-mail.com", list)).toBe(false);
    expect(isAllowedSender("security@facebookmail.com.evil.tld", list)).toBe(false);
    expect(isAllowedSender("attacker@gmail.com", list)).toBe(false);
    expect(isAllowedSender("", list)).toBe(false);
    expect(isAllowedSender(null, list)).toBe(false);
  });

  it("supports whole-domain entries", () => {
    const domainList = parseSenderAllowlist("@facebookmail.com, security@microsoft.com");
    expect(isAllowedSender("anything@facebookmail.com", domainList)).toBe(true);
    expect(isAllowedSender("security@microsoft.com", domainList)).toBe(true);
    expect(isAllowedSender("someone@elsewhere.com", domainList)).toBe(false);
  });

  it("treats an empty list as an explicit opt-out", () => {
    expect(isAllowedSender("anyone@anywhere.com", parseSenderAllowlist(""))).toBe(true);
  });

  it("drops disallowed senders from the mailbox read", async () => {
    const message = (id, address) => ({
      id,
      subject: `${id}0000 is your Facebook code`,
      bodyPreview: "",
      receivedDateTime: "2026-08-06T10:00:00Z",
      from: { emailAddress: { address } },
    });
    const client = createMailboxClient({
      clientId: "c",
      fetchImpl: async (url) => ({
        ok: true,
        status: 200,
        json: async () => ({
          value: url.includes("JunkEmail")
            ? [message("77", "security@facebookmail.com")]
            : [message("11", "security@facebookmail.com"), message("22", "spam@elsewhere.com")],
        }),
      }),
    });
    const rows = await client.listMessages("AT", { allowSenders: list });
    expect(rows.map((r) => r.id).sort()).toEqual(["11", "77"]);
  });
});
