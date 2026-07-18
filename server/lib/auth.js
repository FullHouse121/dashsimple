// HMAC token codec — extracted so the auth boundary is unit-testable
// (tests/auth.test.js) without booting the server.
import crypto from "crypto";

export const createTokenCodec = (authSecret) => {
  const encodeToken = (payload) => {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto.createHmac("sha256", authSecret).update(body).digest("base64url");
    return `${body}.${signature}`;
  };

  const decodeToken = (token) => {
    if (!token) return null;
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;
    const expected = crypto.createHmac("sha256", authSecret).update(body).digest("base64url");
    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expected);
    if (sigBuffer.length !== expBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) return null;
    let payload;
    try {
      payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    } catch (error) {
      return null;
    }
    const exp = Number(payload?.exp || 0);
    if (exp && exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  };

  return { encodeToken, decodeToken };
};
