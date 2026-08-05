import crypto from "node:crypto";

// Reversible encryption for credentials the team must read back (ad account
// passwords, TOTP secrets, mailbox passwords). Deliberately NOT the scrypt
// hashing used for dashboard logins — that is one-way by design, and a buyer
// needs the actual password back.
//
// Envelope: "v1:<iv b64>:<auth tag b64>:<ciphertext b64>", AES-256-GCM.
// GCM authenticates as well as encrypts, so a tampered or wrong-key row throws
// instead of returning plausible garbage.

const VERSION = "v1";
const KEY_BYTES = 32;
const IV_BYTES = 12;

// Fixed salt on purpose: the key has to derive identically on every boot or
// every stored credential becomes unreadable. Secrecy lives in the passphrase.
const KDF_SALT = "dashsimple.credential.v1";
const MIN_PASSPHRASE_LENGTH = 16;

export const deriveCredentialKey = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return null;
  // 64 hex chars = a real 32-byte key, used as-is.
  if (/^[0-9a-f]{64}$/i.test(value)) return Buffer.from(value, "hex");
  // Anything else is a passphrase — stretched, but only if it is long enough
  // to be worth stretching. A short one is rejected rather than accepted
  // quietly, so a weak key can never look like a working setup.
  if (value.length < MIN_PASSPHRASE_LENGTH) return null;
  return crypto.scryptSync(value, KDF_SALT, KEY_BYTES);
};

export const isCiphertext = (value) =>
  typeof value === "string" && value.startsWith(`${VERSION}:`) && value.split(":").length === 4;

export const createSecretBox = (rawKey) => {
  const key = deriveCredentialKey(rawKey);
  const enabled = Boolean(key);

  const requireKey = () => {
    if (!enabled) {
      const error = new Error(
        "Credential storage is not configured. Set CREDENTIAL_KEY (64 hex chars, or a passphrase of at least 16 characters)."
      );
      error.statusCode = 503;
      throw error;
    }
  };

  // Empty in, null out: an untouched field stores nothing rather than an
  // encrypted empty string, so "has a password" stays a simple NULL check.
  const encrypt = (plain) => {
    requireKey();
    const text = plain === null || plain === undefined ? "" : String(plain);
    if (!text) return null;
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const body = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    return [
      VERSION,
      iv.toString("base64"),
      cipher.getAuthTag().toString("base64"),
      body.toString("base64"),
    ].join(":");
  };

  const decrypt = (payload) => {
    requireKey();
    const raw = typeof payload === "string" ? payload : "";
    if (!raw) return "";
    const [version, ivPart, tagPart, bodyPart] = raw.split(":");
    if (version !== VERSION || !ivPart || !tagPart || !bodyPart) {
      const error = new Error("Stored credential is not in a readable format.");
      error.statusCode = 500;
      throw error;
    }
    try {
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivPart, "base64"));
      decipher.setAuthTag(Buffer.from(tagPart, "base64"));
      return Buffer.concat([
        decipher.update(Buffer.from(bodyPart, "base64")),
        decipher.final(),
      ]).toString("utf8");
    } catch {
      // Wrong key or tampered row — never fall back to returning the bytes.
      const error = new Error(
        "Stored credential could not be decrypted. CREDENTIAL_KEY may have changed since it was saved."
      );
      error.statusCode = 500;
      throw error;
    }
  };

  return { enabled, encrypt, decrypt, isCiphertext };
};

// The mask the client renders for a stored secret. Sent back unchanged when
// the user did not retype the field.
export const CREDENTIAL_MASK = "••••••••";

// Maps a request body to the columns to write. Extracted from the route so the
// rules below are testable — they decide whether a typed value is actually
// stored, which is the first thing to suspect when "it didn't save".
//
//   key absent      → leave the column alone (not in the returned object)
//   key === mask    → leave the column alone (a form round-trip, not an edit)
//   empty string    → null (an explicit clear)
//   anything else   → stored (encrypted for secrets)
export const buildCredentialFields = (body = {}, { encrypt, validateTotp } = {}) => {
  const fields = {};

  const assignText = (bodyKey, column, maxLength) => {
    if (body[bodyKey] === undefined) return;
    const value = String(body[bodyKey] ?? "").trim();
    fields[column] = value ? value.slice(0, maxLength) : null;
  };

  const assignSecret = (bodyKey, column, validate) => {
    if (body[bodyKey] === undefined) return;
    const raw = String(body[bodyKey] ?? "");
    if (raw === CREDENTIAL_MASK) return;
    const value = raw.trim();
    if (!value) {
      fields[column] = null;
      return;
    }
    if (validate) validate(value);
    fields[column] = encrypt(value);
  };

  assignText("accountUid", "account_uid", 120);
  assignText("backupEmail", "backup_email", 190);
  assignSecret("password", "login_password_enc");
  // Validated on the way in: a secret that cannot produce codes should fail
  // here, not at 3am when someone is locked out of an account.
  assignSecret("totpSecret", "totp_secret_enc", validateTotp);
  assignSecret("backupEmailPassword", "backup_email_password_enc");

  return fields;
};

// UID and mailbox address follow normal edit permissions — they are
// identifiers, not secrets. The three real secrets need the owner-or-Boss gate.
export const SECRET_BODY_KEYS = ["password", "totpSecret", "backupEmailPassword"];

export const hasSecretInput = (body = {}) =>
  SECRET_BODY_KEYS.some((key) => body[key] !== undefined && body[key] !== CREDENTIAL_MASK);
