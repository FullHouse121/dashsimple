import { describe, it, expect } from "vitest";
import { createTokenCodec } from "../server/lib/auth.js";

const { encodeToken, decodeToken } = createTokenCodec("test-secret");

describe("token codec", () => {
  it("round-trips a payload", () => {
    const payload = { id: 2, username: "Leo", role: "Team Leader", exp: Math.floor(Date.now() / 1000) + 60 };
    expect(decodeToken(encodeToken(payload))).toEqual(payload);
  });

  it("rejects tampered payloads (role escalation)", () => {
    const token = encodeToken({ id: 3, username: "Sara", role: "Media Buyer Junior", exp: Math.floor(Date.now() / 1000) + 60 });
    const [, signature] = token.split(".");
    const forgedBody = Buffer.from(
      JSON.stringify({ id: 3, username: "Sara", role: "Boss", exp: Math.floor(Date.now() / 1000) + 60 })
    ).toString("base64url");
    expect(decodeToken(`${forgedBody}.${signature}`)).toBeNull();
  });

  it("rejects tokens signed with a different secret", () => {
    const other = createTokenCodec("other-secret");
    const token = other.encodeToken({ id: 1, role: "Boss", exp: Math.floor(Date.now() / 1000) + 60 });
    expect(decodeToken(token)).toBeNull();
  });

  it("rejects expired tokens", () => {
    const token = encodeToken({ id: 2, role: "Boss", exp: Math.floor(Date.now() / 1000) - 10 });
    expect(decodeToken(token)).toBeNull();
  });

  it("rejects malformed input without throwing", () => {
    expect(decodeToken("")).toBeNull();
    expect(decodeToken("abc")).toBeNull();
    expect(decodeToken("a.b")).toBeNull();
    expect(decodeToken(null)).toBeNull();
    expect(decodeToken("!!!.###")).toBeNull();
  });

  it("keeps tokens without exp valid (legacy shape)", () => {
    const token = encodeToken({ id: 2, role: "Boss" });
    expect(decodeToken(token)).toEqual({ id: 2, role: "Boss" });
  });
});
