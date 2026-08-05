import crypto from "node:crypto";

// TOTP (RFC 6238) — the same algorithm behind 2fa.live, Google Authenticator
// and Meta's authenticator prompt. It is a pure function of (secret, clock),
// so the dashboard computes codes itself: the secret never leaves this server
// and there is no third party to rate-limit us or go down mid-login.

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const DEFAULT_PERIOD = 30;
export const DEFAULT_DIGITS = 6;

export const decodeBase32 = (input) => {
  const clean = String(input || "")
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/=+$/, "");
  if (!clean) return Buffer.alloc(0);
  let bits = 0;
  let value = 0;
  const out = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      const error = new Error("2FA secret contains characters that are not valid base32.");
      error.statusCode = 400;
      throw error;
    }
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
};

// Accepts what people actually paste: a bare secret, a spaced secret as shown
// in Meta's "can't scan the code" panel, or a full otpauth:// URI copied out
// of an authenticator export.
export const normalizeTotpSecret = (input) => {
  const raw = String(input || "").trim();
  if (!raw) return { secret: "", digits: DEFAULT_DIGITS, period: DEFAULT_PERIOD, algorithm: "sha1" };
  if (/^otpauth:\/\//i.test(raw)) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      const error = new Error("That otpauth:// link could not be read.");
      error.statusCode = 400;
      throw error;
    }
    const params = url.searchParams;
    const digits = Number.parseInt(params.get("digits") || "", 10);
    const period = Number.parseInt(params.get("period") || "", 10);
    return {
      secret: String(params.get("secret") || "").replace(/[\s-]/g, "").toUpperCase(),
      digits: Number.isFinite(digits) && digits >= 6 && digits <= 10 ? digits : DEFAULT_DIGITS,
      period: Number.isFinite(period) && period >= 15 && period <= 120 ? period : DEFAULT_PERIOD,
      algorithm: String(params.get("algorithm") || "sha1").toLowerCase(),
    };
  }
  return {
    secret: raw.replace(/[\s-]/g, "").toUpperCase(),
    digits: DEFAULT_DIGITS,
    period: DEFAULT_PERIOD,
    algorithm: "sha1",
  };
};

// Throws on anything we could not turn into a code, so a bad secret is caught
// when it is saved rather than at 3am when someone needs to log in.
export const assertUsableTotpSecret = (input) => {
  const parsed = normalizeTotpSecret(input);
  if (!parsed.secret) {
    const error = new Error("2FA secret is empty.");
    error.statusCode = 400;
    throw error;
  }
  const key = decodeBase32(parsed.secret);
  if (key.length < 10) {
    const error = new Error("2FA secret is too short to be a real authenticator key.");
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

export const generateTotp = (input, { at = Date.now() } = {}) => {
  const { secret, digits, period, algorithm } = normalizeTotpSecret(input);
  const key = decodeBase32(secret);
  if (!key.length) {
    const error = new Error("2FA secret is empty.");
    error.statusCode = 400;
    throw error;
  }
  const seconds = Math.floor(at / 1000);
  const counter = Math.floor(seconds / period);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = crypto.createHmac(algorithm, key).update(counterBuffer).digest();
  // Dynamic truncation, RFC 4226 §5.3.
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return {
    code: String(binary % 10 ** digits).padStart(digits, "0"),
    period,
    digits,
    // What the countdown ring needs: seconds until this code rolls over.
    expiresIn: period - (seconds % period),
    validUntil: (counter + 1) * period * 1000,
  };
};
