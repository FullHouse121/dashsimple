// Everything a buyer needs to get into an ad account, one click from the
// registry row: UID, password, a live 2FA code, and the backup mailbox.
//
// Secrets are never in the list payload — the row only carries has_* flags.
// A value arrives only when someone asks for it, through POST endpoints the
// audit middleware records.
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { apiFetch } from "../lib/api.js";

export const CREDENTIAL_MASK = "••••••••";

const copyText = async (value) => {
  if (!value) return false;
  try {
    await navigator.clipboard?.writeText(value);
    return true;
  } catch {
    return false;
  }
};

// ── Live 2FA code ─────────────────────────────────────────────────────
// The code is computed server-side from the stored secret and refetched when
// the current one expires, so what is on screen is always usable.
// Auto-refresh stops after this many rollovers (~5 minutes). A vault left
// open all afternoon would otherwise generate a code every 30 seconds — server
// load and audit-log noise for codes nobody is looking at.
const MAX_AUTO_REFRESHES = 10;

export function useTotpCode(accountId, { enabled = true } = {}) {
  const [state, setState] = React.useState({ code: "", expiresIn: 0, period: 30, error: "" });
  const [loading, setLoading] = React.useState(false);
  const [idle, setIdle] = React.useState(false);
  const refreshCountRef = React.useRef(0);
  const timerRef = React.useRef(null);

  const fetchCode = React.useCallback(async ({ manual = false } = {}) => {
    if (!accountId || !enabled) return;
    if (manual) {
      refreshCountRef.current = 0;
      setIdle(false);
    }
    setLoading(true);
    try {
      const response = await apiFetch(`/api/accounts/${accountId}/totp`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Could not generate a code.");
      setState({
        code: data.code,
        expiresIn: data.expiresIn,
        period: data.period || 30,
        error: "",
      });
    } catch (error) {
      setState((prev) => ({ ...prev, code: "", error: error.message || "Could not generate a code." }));
    } finally {
      setLoading(false);
    }
  }, [accountId, enabled]);

  React.useEffect(() => {
    if (!enabled || !accountId) return undefined;
    fetchCode();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [accountId, enabled, fetchCode]);

  // Tick the countdown locally; refetch only at the rollover, so one open
  // panel costs two requests a minute rather than one a second.
  React.useEffect(() => {
    if (!enabled || !state.code || idle) return undefined;
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.expiresIn <= 1) {
          refreshCountRef.current += 1;
          if (refreshCountRef.current >= MAX_AUTO_REFRESHES) {
            setIdle(true);
            return { ...prev, expiresIn: 0 };
          }
          fetchCode();
          return { ...prev, expiresIn: prev.period };
        }
        return { ...prev, expiresIn: prev.expiresIn - 1 };
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [enabled, state.code, idle, fetchCode]);

  return { ...state, loading, idle, refresh: () => fetchCode({ manual: true }) };
}

export function TotpCode({ accountId, active, label }) {
  const { code, expiresIn, period, error, loading, idle, refresh } = useTotpCode(accountId, {
    enabled: Boolean(active),
  });
  const [copied, setCopied] = React.useState(false);
  const progress = period ? Math.max(0, Math.min(1, expiresIn / period)) : 0;
  // Under 5s left the code is about to roll — warn rather than let someone
  // paste a code that dies mid-submit.
  const urgent = expiresIn > 0 && expiresIn <= 5;

  const handleCopy = async () => {
    if (!code) return;
    if (await copyText(code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  if (error) {
    return (
      <div className="totp-code is-error">
        <span className="totp-error">{error}</span>
        <button type="button" className="icon-btn" onClick={refresh} aria-label={label?.retry || "Retry"}>
          <RefreshCw size={13} />
        </button>
      </div>
    );
  }

  // Stopped refreshing: the code on screen is stale, so offer a click rather
  // than showing a number that will not work.
  if (idle) {
    return (
      <div className="totp-code is-idle">
        <button type="button" className="totp-digits is-stale" onClick={refresh}>
          {label?.show || "Show code"}
        </button>
        <RefreshCw size={13} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={`totp-code${urgent ? " is-urgent" : ""}`}>
      <button
        type="button"
        className="totp-digits"
        onClick={handleCopy}
        disabled={!code}
        title={label?.copy || "Copy code"}
      >
        {loading && !code ? "······" : code ? `${code.slice(0, 3)} ${code.slice(3)}` : "······"}
      </button>
      <span className="totp-ring" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle className="totp-ring-track" cx="12" cy="12" r="9" />
          <circle
            className="totp-ring-progress"
            cx="12"
            cy="12"
            r="9"
            style={{
              strokeDasharray: 2 * Math.PI * 9,
              strokeDashoffset: 2 * Math.PI * 9 * (1 - progress),
            }}
          />
        </svg>
        <em>{expiresIn}</em>
      </span>
      <AnimatePresence>
        {copied ? (
          <motion.span
            className="totp-copied"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check size={11} /> {label?.copied || "Copied"}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ── One secret row ────────────────────────────────────────────────────
function SecretRow({ accountId, field, label, present, t }) {
  const [value, setValue] = React.useState("");
  const [shown, setShown] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState("");

  const reveal = React.useCallback(async () => {
    if (value) return value;
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(`/api/accounts/${accountId}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || t("Could not read that credential."));
      setValue(data.value);
      return data.value;
    } catch (requestError) {
      setError(requestError.message || t("Could not read that credential."));
      return "";
    } finally {
      setBusy(false);
    }
  }, [accountId, field, value, t]);

  const handleToggle = async () => {
    if (shown) {
      setShown(false);
      return;
    }
    if (await reveal()) setShown(true);
  };

  // Copying does not put the secret on screen — the common case is paste
  // straight into a login form.
  const handleCopy = async () => {
    const secret = await reveal();
    if (secret && (await copyText(secret))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <div className="credential-row">
      <span className="credential-label">{label}</span>
      <span className={`credential-value mono${shown ? " is-revealed" : ""}`}>
        {!present ? (
          <em className="credential-empty">{t("Not set")}</em>
        ) : shown ? (
          value
        ) : (
          CREDENTIAL_MASK
        )}
      </span>
      {present ? (
        <span className="credential-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={handleToggle}
            disabled={busy}
            aria-label={shown ? t("Hide") : t("Reveal")}
            title={shown ? t("Hide") : t("Reveal")}
          >
            {shown ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            type="button"
            className={`icon-btn${copied ? " is-done" : ""}`}
            onClick={handleCopy}
            disabled={busy}
            aria-label={t("Copy")}
            title={t("Copy")}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </span>
      ) : null}
      {error ? <span className="credential-error">{error}</span> : null}
    </div>
  );
}

function PlainRow({ label, value, t }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };
  return (
    <div className="credential-row">
      <span className="credential-label">{label}</span>
      <span className="credential-value mono">
        {value || <em className="credential-empty">{t("Not set")}</em>}
      </span>
      {value ? (
        <span className="credential-actions">
          <button
            type="button"
            className={`icon-btn${copied ? " is-done" : ""}`}
            onClick={handleCopy}
            aria-label={t("Copy")}
            title={t("Copy")}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </span>
      ) : null}
    </div>
  );
}

// ── Backup mailbox ────────────────────────────────────────────────────
// Connect once (device code), then pull verification codes without anyone
// opening Outlook.
const relativeAge = (ageMs, t) => {
  if (ageMs === null || ageMs === undefined) return "";
  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 1) return t("just now");
  if (minutes < 60) return t("{n} min ago").replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("{n} h ago").replace("{n}", String(hours));
  return t("{n} d ago").replace("{n}", String(Math.floor(hours / 24)));
};

function MailboxPanel({ accountId, email, forwardAddress: seededAddress, requestNonce, t }) {
  const [state, setState] = React.useState({ loading: true, connected: false, configured: true });
  const [connect, setConnect] = React.useState(null);
  const [messages, setMessages] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState("");
  const pollRef = React.useRef(null);
  // The registry row can be stale; whatever the mailbox endpoint reports wins.
  const forwardAddress = state.forwardAddress || seededAddress || "";

  const loadState = React.useCallback(async () => {
    try {
      const response = await apiFetch(`/api/accounts/${accountId}/mailbox`);
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || t("Could not check the mailbox."));

      // When the server offers forwarding, this account needs an address of
      // its own. Minting it on first open is what makes the forwarding route
      // reachable at all — without it the panel would fall through to the
      // Microsoft path and fail on a server that has no Graph credentials.
      if (data.forwardingAvailable && !data.forwardAddress) {
        const minted = await apiFetch(`/api/accounts/${accountId}/forward-address`, {
          method: "POST",
        });
        const mintedData = await minted.json().catch(() => null);
        if (minted.ok && mintedData?.forwardAddress) {
          data.forwardAddress = mintedData.forwardAddress;
        }
      }

      setState({ ...data, loading: false });
    } catch (loadError) {
      setState({ loading: false, connected: false, configured: true });
      setError(loadError.message);
    }
  }, [accountId, t]);

  React.useEffect(() => {
    loadState();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadState]);

  // Preferred path: Microsoft's real login in a popup. Nothing to type, and
  // the server forces a fresh sign-in so the browser's existing session cannot
  // connect the wrong inbox.
  const startPopupConnect = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(`/api/accounts/${accountId}/mailbox/oauth/prepare`, {
        method: "POST",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || t("Could not start the sign-in."));

      const popup = window.open(
        `/api/mailbox/oauth/start?state=${encodeURIComponent(data.state)}`,
        "dashsimple-mailbox",
        "width=520,height=680,menubar=no,toolbar=no"
      );
      if (!popup) {
        throw new Error(t("Allow pop-ups for this site, then try again."));
      }

      const onMessage = async (event) => {
        let payload = null;
        try {
          payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        } catch {
          return;
        }
        if (payload?.source !== "dashsimple-mailbox-oauth") return;
        window.removeEventListener("message", onMessage);
        setBusy(false);
        if (payload.ok) await loadState();
        else setError(payload.message || t("The sign-in did not complete."));
      };
      window.addEventListener("message", onMessage);

      // The popup may be closed without ever reporting back.
      const watch = setInterval(() => {
        if (!popup.closed) return;
        clearInterval(watch);
        window.removeEventListener("message", onMessage);
        setBusy(false);
        loadState();
      }, 800);
    } catch (startError) {
      setError(startError.message);
      setBusy(false);
    }
  };

  // Fallback for a blocked popup or a mailbox being connected on a phone.
  const startConnect = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(`/api/accounts/${accountId}/mailbox/connect`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || t("Could not start the sign-in."));
      setConnect(data);
      // Microsoft tells us how often it is willing to be asked.
      pollRef.current = setInterval(async () => {
        const pollResponse = await apiFetch(`/api/accounts/${accountId}/mailbox/connect/poll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: data.handle }),
        });
        const pollData = await pollResponse.json().catch(() => null);
        if (pollData?.state === "pending") return;
        clearInterval(pollRef.current);
        setConnect(null);
        if (pollData?.state === "connected") {
          await loadState();
        } else {
          setError(pollData?.error || t("The sign-in did not complete."));
        }
      }, Math.max(3, Number(data.interval) || 5) * 1000);
    } catch (startError) {
      setError(startError.message);
    } finally {
      setBusy(false);
    }
  };

  const fetchMessages = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(`/api/accounts/${accountId}/mailbox/messages`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (data?.needsReconnect) await loadState();
        throw new Error(data?.error || t("Could not read the mailbox."));
      }
      setMessages(data.messages || []);
    } catch (readError) {
      setError(readError.message);
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async (code) => {
    if (await copyText(code)) {
      setCopied(code);
      setTimeout(() => setCopied(""), 1400);
    }
  };

  const renderMessages = () => (
    <ul className="mailbox-list">
      {messages.slice(0, 6).map((message, index) => (
        <li key={message.id || index} className={message.code ? "has-code" : ""}>
          <div className="mailbox-msg-main">
            <span className="mailbox-msg-subject">{message.subject || t("(no subject)")}</span>
            <span className="mailbox-msg-meta">
              {message.fromName || message.from} · {relativeAge(message.ageMs, t)}
            </span>
          </div>
          {message.code ? (
            <button
              type="button"
              className="mailbox-code"
              onClick={() => copyCode(message.code)}
              title={t("Copy code")}
            >
              {message.code}
              {copied === message.code ? <Check size={12} /> : <Copy size={12} />}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );

  // "Request email code" in the modal footer drives this panel: fetch if the
  // inbox is already connected, otherwise start the one-time sign-in. Held in
  // a ref so the effect depends only on the nonce, never re-firing on
  // unrelated state changes.
  const requestRef = React.useRef(() => {});
  requestRef.current = () => {
    if (busy) return;
    // Forwarding needs no connection — just read what has arrived.
    if (forwardAddress || state.connected) fetchMessages();
    else if (!connect) startPopupConnect();
  };
  React.useEffect(() => {
    if (requestNonce) requestRef.current();
  }, [requestNonce]);

  if (state.loading) {
    return <div className="mailbox-panel is-muted">{t("Checking mailbox…")}</div>;
  }

  if (!state.configured) {
    return (
      <div className="mailbox-panel is-muted">
        {t("Mailbox reading is not configured on the server yet.")}
      </div>
    );
  }

  // Mid-connect: show the code and where to type it.
  if (connect) {
    return (
      <div className="mailbox-panel mailbox-connecting">
        <p className="mailbox-step">
          {t("1. Open")}{" "}
          <a href={connect.verificationUri} target="_blank" rel="noreferrer">
            {connect.verificationUri.replace(/^https?:\/\//, "")}
          </a>
        </p>
        <p className="mailbox-step">{t("2. Enter this code, then sign in as")} <strong>{email}</strong></p>
        <button type="button" className="mailbox-usercode" onClick={() => copyCode(connect.userCode)}>
          {connect.userCode}
          {copied === connect.userCode ? <Check size={13} /> : <Copy size={13} />}
        </button>
        <p className="mailbox-warning">
          <AlertTriangle size={12} aria-hidden="true" />
          {t("Use a private window — if your browser is already signed into another Microsoft account it will connect that one instead.")}
        </p>
        <p className="mailbox-waiting">
          <RefreshCw size={12} className="spin" /> {t("Waiting for you to finish…")}
        </p>
      </div>
    );
  }

  // Forwarding set up: nothing to connect, the codes arrive on their own.
  if (forwardAddress) {
    return (
      <div className="mailbox-panel">
        <div className="mailbox-toolbar">
          <span className="mailbox-connected">
            <Check size={12} /> {t("Forwarding to")}
          </span>
          <button
            type="button"
            className="mailbox-forward-address mono"
            onClick={() => copyCode(forwardAddress)}
            title={t("Copy")}
          >
            {forwardAddress}
            {copied === forwardAddress ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
        {error ? <p className="credential-error">{error}</p> : null}
        {messages !== null ? (
          messages.length === 0 ? (
            <p className="mailbox-hint">{t("No codes yet. They appear here the moment one arrives.")}</p>
          ) : (
            renderMessages()
          )
        ) : null}
      </div>
    );
  }

  if (!state.connected) {
    return (
      <div className="mailbox-panel">
        <p className="mailbox-hint">
          {state.status === "needs_reconnect"
            ? t("This mailbox needs to be reconnected.")
            : t("Connect this inbox once to read its verification codes here.")}
        </p>
        <button type="button" className="action-pill" onClick={startPopupConnect} disabled={busy}>
          <Mail size={13} /> {busy ? t("Waiting for sign-in…") : t("Sign in to this inbox")}
        </button>
        <button type="button" className="ghost mailbox-alt-connect" onClick={startConnect} disabled={busy}>
          {t("Pop-up blocked? Use a code instead")}
        </button>
        {error ? <p className="credential-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mailbox-panel">
      <div className="mailbox-toolbar">
        <span className="mailbox-connected">
          <Check size={12} /> {t("Connected")}
        </span>
        {busy ? (
          <span className="mailbox-waiting">
            <RefreshCw size={12} className="spin" /> {t("Reading…")}
          </span>
        ) : messages !== null ? (
          <button type="button" className="ghost mailbox-refresh" onClick={fetchMessages}>
            <RefreshCw size={12} /> {t("Refresh")}
          </button>
        ) : null}
      </div>

      {error ? <p className="credential-error">{error}</p> : null}

      {messages !== null ? (
        messages.length === 0 ? <p className="mailbox-hint">{t("Inbox is empty.")}</p> : renderMessages()
      ) : null}
    </div>
  );
}

// ── The vault ─────────────────────────────────────────────────────────
export function AccountCredentialsModal({ row, onClose, t }) {
  // Nothing is fetched until asked for. Keeps codes off the screen until
  // someone needs one, and keeps the audit trail meaningful.
  const [totpRequested, setTotpRequested] = React.useState(false);
  const [mailNonce, setMailNonce] = React.useState(0);

  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!row) return null;
  const anything =
    row.account_uid ||
    row.backup_email ||
    row.has_login_password ||
    row.has_totp ||
    row.has_backup_email_password;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal credentials-modal"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head">
          <div className="credentials-head-title">
            <span className="stats-icon-tile" style={{ "--tile-accent": "#8b5cf6" }}>
              <KeyRound size={16} />
            </span>
            <div>
              <p className="modal-kicker">{t("Account access")}</p>
              <h2>{row.account_number}</h2>
              {row.nickname ? <p className="panel-subtitle">{row.nickname}</p> : null}
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t("Close")}>
            <X size={18} />
          </button>
        </div>

        {!anything ? (
          <div className="empty-state">
            {t("No credentials saved for this account yet. Add them from Edit.")}
          </div>
        ) : (
          <div className="credentials-body">
            <PlainRow label={t("UID")} value={row.account_uid} t={t} />
            <SecretRow
              accountId={row.id}
              field="password"
              label={t("Password")}
              present={Boolean(row.has_login_password)}
              t={t}
            />

            <div className="credential-row credential-row-totp">
              <span className="credential-label">
                {t("2FA")}
                <ShieldCheck size={12} aria-hidden="true" />
              </span>
              {!row.has_totp ? (
                <span className="credential-value">
                  <em className="credential-empty">{t("Not set")}</em>
                </span>
              ) : totpRequested ? (
                <TotpCode
                  accountId={row.id}
                  active
                  label={{
                    copy: t("Copy code"),
                    copied: t("Copied"),
                    retry: t("Retry"),
                    show: t("Show code"),
                  }}
                />
              ) : (
                <span className="credential-value">
                  <em className="credential-empty">{t("Press Request 2FA code")}</em>
                </span>
              )}
            </div>

            <div className="credentials-divider">
              <span>{t("Backup email")}</span>
            </div>

            <PlainRow label={t("Address")} value={row.backup_email} t={t} />
            <SecretRow
              accountId={row.id}
              field="backupEmailPassword"
              label={t("Password")}
              present={Boolean(row.has_backup_email_password)}
              t={t}
            />
            {row.backup_email ? (
              <MailboxPanel
                accountId={row.id}
                email={row.backup_email}
                forwardAddress={row.forward_address}
                requestNonce={mailNonce}
                t={t}
              />
            ) : null}

            <div className="credentials-actions">
              <button
                type="button"
                className="action-pill"
                onClick={() => setTotpRequested(true)}
                disabled={!row.has_totp || totpRequested}
                title={row.has_totp ? undefined : t("No 2FA secret saved for this account.")}
              >
                <ShieldCheck size={14} /> {t("Request 2FA code")}
              </button>
              <button
                type="button"
                className="action-pill"
                onClick={() => setMailNonce((value) => value + 1)}
                disabled={!row.backup_email}
                title={row.backup_email ? undefined : t("No backup email saved for this account.")}
              >
                <Mail size={14} /> {t("Request email code")}
              </button>
            </div>
          </div>
        )}

        <p className="credentials-footnote">
          {t("Codes are generated on our server — the 2FA secret never leaves it. Every reveal is logged.")}
        </p>
      </motion.div>
    </motion.div>
  );
}
