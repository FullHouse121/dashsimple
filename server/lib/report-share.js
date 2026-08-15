// Share links for the executive report.
//
// A link here is a bearer credential: whoever holds the URL sees revenue,
// spend, ROI, buyer names and the geo split, with no login in the way. That is
// the deal we chose — outside managers should not need accounts — so the rules
// below are the whole of the protection and each one is deliberate.
//
//   long random token   guessing is not a viable attack
//   mandatory expiry    a forwarded link stops working on its own
//   revocable           a mistake can be undone immediately
//   scoped payload      the public view can only ever answer with report
//                       figures, never tokens, credentials or player IDs
//
// Kept pure so the parts that decide access can be tested without a database
// or a network — an access check that is only exercised in production is not
// exercised.

import crypto from "crypto";

// 32 bytes of CSPRNG as base64url: 43 characters, ~192 bits. Long enough that
// enumeration is not a threat, short enough to paste into a chat.
export const createShareToken = () => crypto.randomBytes(32).toString("base64url");

export const EXPIRY_CHOICES_DAYS = [7, 30, 90];
const MAX_EXPIRY_DAYS = 365;

// No "never expires" option. A link that outlives the reason it was made is
// the failure mode of every share feature, and the cost of re-issuing one is
// a few seconds.
export const resolveExpiry = (days, now = Date.now()) => {
  const requested = Number(days);
  const safe = Number.isFinite(requested) && requested > 0 ? Math.min(requested, MAX_EXPIRY_DAYS) : 30;
  return new Date(now + safe * 86400000);
};

// One place decides whether a link may be opened, so the endpoint cannot
// forget a case. Returns the reason too — a revoked link and an expired one
// are different messages to whoever is holding it.
export const checkShareAccess = (share, now = Date.now()) => {
  if (!share) return { ok: false, reason: "not_found", message: "This report link does not exist." };
  if (share.revoked_at) return { ok: false, reason: "revoked", message: "This report link has been revoked." };
  const expires = share.expires_at ? new Date(share.expires_at).getTime() : 0;
  // A share with no expiry should be impossible; treat it as expired rather
  // than as permanent, so a bad write fails closed.
  if (!expires || Number.isNaN(expires)) {
    return { ok: false, reason: "no_expiry", message: "This report link is not valid." };
  }
  if (expires <= now) return { ok: false, reason: "expired", message: "This report link has expired." };
  return { ok: true, reason: "ok", expiresAt: new Date(expires).toISOString() };
};

// Timing-safe compare, because the token arrives from the URL and a plain
// === leaks length and prefix through response timing.
export const tokensMatch = (a, b) => {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
};

// What a public viewer is allowed to receive. An allowlist, not a blocklist:
// a new field added upstream must be named here before it can ever escape,
// which is the only version of this that stays correct as the report grows.
const PUBLIC_SECTION_KEYS = new Set([
  "period", "generatedAt", "title", "summary", "trend", "buyers",
  "countries", "funnel", "brands", "integrity",
]);

export const toPublicReport = (report) => {
  const out = {};
  for (const key of PUBLIC_SECTION_KEYS) {
    if (report && report[key] !== undefined) out[key] = report[key];
  }
  return out;
};

// Enough to recognise a viewer in the access log without keeping a full IP.
// The point is "was this opened by more people than I sent it to", which a
// truncated address answers, not surveillance.
export const fingerprintViewer = (ip, userAgent) => {
  const addr = String(ip || "").trim();
  // Guard the empty case first: splitting "" on "." yields [""], which the
  // IPv4 branch would happily turn into the string ".0" — a fingerprint for
  // an address we never had.
  const coarse = !addr
    ? null
    : addr.includes(":")
      ? addr.split(":").slice(0, 4).join(":") // IPv6 /64-ish
      : addr.split(".").slice(0, 3).concat("0").join("."); // IPv4 /24
  return {
    ipCoarse: coarse || null,
    agent: String(userAgent || "").slice(0, 180) || null,
  };
};
