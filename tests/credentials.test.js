import { describe, it, expect } from "vitest";
import {
  CREDENTIAL_MASK,
  buildCredentialFields,
  createSecretBox,
  deriveCredentialKey,
  hasSecretInput,
  isCiphertext,
} from "../server/lib/secrets.js";
import {
  assertUsableTotpSecret,
  decodeBase32,
  generateTotp,
  normalizeTotpSecret,
} from "../server/lib/totp.js";
import { DASHBOARD_ENTITIES } from "../server/lib/reports.js";

const KEY = "a".repeat(64); // 32 bytes of hex
const box = createSecretBox(KEY);

describe("credential encryption", () => {
  it("round-trips a password", () => {
    const secret = "Tr0ub4dor&3 — açaí";
    expect(box.decrypt(box.encrypt(secret))).toBe(secret);
  });

  it("never stores the plaintext in the envelope", () => {
    const stored = box.encrypt("hunter2");
    expect(stored).not.toContain("hunter2");
    expect(isCiphertext(stored)).toBe(true);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    expect(box.encrypt("same")).not.toBe(box.encrypt("same"));
  });

  it("stores nothing for an empty value", () => {
    expect(box.encrypt("")).toBeNull();
    expect(box.encrypt(null)).toBeNull();
    expect(box.decrypt(null)).toBe("");
  });

  it("refuses to decrypt with the wrong key rather than returning garbage", () => {
    const other = createSecretBox("b".repeat(64));
    expect(() => other.decrypt(box.encrypt("hunter2"))).toThrow(/could not be decrypted/i);
  });

  it("detects tampering with the ciphertext body", () => {
    const [version, iv, tag, body] = box.encrypt("hunter2").split(":");
    const flipped = Buffer.from(body, "base64");
    flipped[0] ^= 0xff;
    expect(() => box.decrypt([version, iv, tag, flipped.toString("base64")].join(":"))).toThrow();
  });

  it("fails closed when no key is configured", () => {
    const unconfigured = createSecretBox("");
    expect(unconfigured.enabled).toBe(false);
    expect(() => unconfigured.encrypt("x")).toThrow(/not configured/i);
    expect(() => unconfigured.decrypt("v1:a:b:c")).toThrow(/not configured/i);
  });

  it("rejects a passphrase too weak to stretch", () => {
    expect(deriveCredentialKey("short")).toBeNull();
    expect(deriveCredentialKey("a-long-enough-passphrase")).toHaveLength(32);
  });

  it("derives the same key across restarts", () => {
    const passphrase = "a-long-enough-passphrase";
    expect(deriveCredentialKey(passphrase)).toEqual(deriveCredentialKey(passphrase));
  });
});

describe("what actually gets stored", () => {
  const build = (body) =>
    buildCredentialFields(body, {
      encrypt: (value) => `enc(${value})`,
      validateTotp: assertUsableTotpSecret,
    });

  it("stores a typed value", () => {
    expect(build({ accountUid: "61556", password: "s3cret" })).toEqual({
      account_uid: "61556",
      login_password_enc: "enc(s3cret)",
    });
  });

  it("leaves untouched fields out entirely", () => {
    // Not "sets them to null" — absent must mean absent, or editing the UID
    // would wipe the password.
    expect(build({ accountUid: "61556" })).toEqual({ account_uid: "61556" });
  });

  it("treats the mask as 'unchanged', not as a new password", () => {
    expect(build({ password: CREDENTIAL_MASK })).toEqual({});
  });

  it("clears a field on an explicit empty string", () => {
    expect(build({ password: "" })).toEqual({ login_password_enc: null });
  });

  it("trims what the user pasted", () => {
    expect(build({ accountUid: "  61556  " })).toEqual({ account_uid: "61556" });
    expect(build({ password: "  s3cret  " })).toEqual({ login_password_enc: "enc(s3cret)" });
  });

  it("encrypts every secret and never the identifiers", () => {
    const fields = build({
      accountUid: "61556",
      backupEmail: "a@outlook.com",
      password: "pw",
      totpSecret: "GEZDGNBVGY3TQOJQ",
      backupEmailPassword: "mail-pw",
    });
    expect(fields.account_uid).toBe("61556");
    expect(fields.backup_email).toBe("a@outlook.com");
    expect(fields.login_password_enc).toBe("enc(pw)");
    expect(fields.totp_secret_enc).toBe("enc(GEZDGNBVGY3TQOJQ)");
    expect(fields.backup_email_password_enc).toBe("enc(mail-pw)");
  });

  it("rejects an unusable 2FA secret at save time", () => {
    expect(() => build({ totpSecret: "not a real key!" })).toThrow(/base32/i);
  });

  it("caps absurdly long input", () => {
    expect(build({ accountUid: "9".repeat(500) }).account_uid).toHaveLength(120);
  });

  it("knows when a request carries a real secret change", () => {
    expect(hasSecretInput({ accountUid: "61556" })).toBe(false);
    expect(hasSecretInput({ password: CREDENTIAL_MASK })).toBe(false);
    expect(hasSecretInput({ password: "new" })).toBe(true);
    expect(hasSecretInput({ password: "" })).toBe(true); // clearing is a change
  });
});

describe("reports catalog", () => {
  // The catalog is a whitelist, so this is a standing guard: if anyone ever
  // adds a credential column to it, a report could export the whole team's
  // passwords. Fails loudly instead.
  it("cannot name any account credential column", () => {
    const forbidden = /uid|password|totp|secret|_enc$|backup_email/i;
    const named = Object.values(DASHBOARD_ENTITIES).flatMap((entity) =>
      (entity.columns || []).map((column) => column.key || column.column || column.name)
    );
    expect(named.filter((key) => forbidden.test(String(key)))).toEqual([]);
  });
});

describe("base32", () => {
  it("decodes the RFC 4648 test secret", () => {
    expect(decodeBase32("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ").toString("utf8")).toBe(
      "12345678901234567890"
    );
  });

  it("tolerates spaces, dashes, lowercase and padding", () => {
    expect(decodeBase32("gezd gnbv-gy3t qojq====")).toEqual(decodeBase32("GEZDGNBVGY3TQOJQ"));
  });

  it("rejects characters that are not base32", () => {
    expect(() => decodeBase32("NOT-VALID-1808!")).toThrow(/base32/i);
  });
});

describe("TOTP", () => {
  // RFC 6238 Appendix B, SHA-1 column. If these pass, our codes match every
  // authenticator app and 2fa.live.
  const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // "12345678901234567890"
  const VECTORS = [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
    [20000000000, "65353130"],
  ];

  for (const [seconds, expected] of VECTORS) {
    it(`matches RFC 6238 at T=${seconds}`, () => {
      const { code } = generateTotp(`otpauth://totp/x?secret=${RFC_SECRET}&digits=8`, {
        at: seconds * 1000,
      });
      expect(code).toBe(expected);
    });
  }

  it("defaults to a 6-digit, 30-second code", () => {
    const result = generateTotp(RFC_SECRET, { at: 59_000 });
    expect(result.code).toHaveLength(6);
    expect(result.code).toBe("287082"); // last 6 of the RFC vector
    expect(result.period).toBe(30);
  });

  it("holds steady inside a window and rolls over at the boundary", () => {
    const a = generateTotp(RFC_SECRET, { at: 30_000 });
    const b = generateTotp(RFC_SECRET, { at: 59_999 });
    const c = generateTotp(RFC_SECRET, { at: 60_000 });
    expect(a.code).toBe(b.code);
    expect(c.code).not.toBe(a.code);
  });

  it("counts down to the rollover", () => {
    expect(generateTotp(RFC_SECRET, { at: 30_000 }).expiresIn).toBe(30);
    expect(generateTotp(RFC_SECRET, { at: 45_000 }).expiresIn).toBe(15);
    expect(generateTotp(RFC_SECRET, { at: 59_000 }).expiresIn).toBe(1);
    expect(generateTotp(RFC_SECRET, { at: 59_000 }).validUntil).toBe(60_000);
  });

  it("reads a secret however it was pasted", () => {
    const spaced = generateTotp("gezd gnbv gy3t qojq", { at: 59_000 }).code;
    const bare = generateTotp("GEZDGNBVGY3TQOJQ", { at: 59_000 }).code;
    const uri = generateTotp("otpauth://totp/Meta:leo?secret=GEZDGNBVGY3TQOJQ&issuer=Meta", {
      at: 59_000,
    }).code;
    expect(spaced).toBe(bare);
    expect(uri).toBe(bare);
  });

  it("honours digits and period from an otpauth URI", () => {
    const parsed = normalizeTotpSecret(`otpauth://totp/x?secret=${RFC_SECRET}&digits=8&period=60`);
    expect(parsed).toMatchObject({ digits: 8, period: 60 });
  });

  it("rejects a secret that could never produce codes", () => {
    expect(() => assertUsableTotpSecret("")).toThrow(/empty/i);
    expect(() => assertUsableTotpSecret("ABCD")).toThrow(/too short/i);
    expect(() => assertUsableTotpSecret("PASSWORD-1!")).toThrow(/base32/i);
    expect(assertUsableTotpSecret(RFC_SECRET).secret).toBe(RFC_SECRET);
  });
});
