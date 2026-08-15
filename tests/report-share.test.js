// A share link is a bearer credential with no login behind it, so these are
// the tests that matter: every one of them is a way the report could be read
// by someone who should not be reading it.
import { describe, it, expect } from "vitest";
import {
  createShareToken,
  resolveExpiry,
  checkShareAccess,
  tokensMatch,
  toPublicReport,
  fingerprintViewer,
} from "../server/lib/report-share.js";

describe("createShareToken", () => {
  it("is long enough that guessing is not an attack", () => {
    const token = createShareToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
    // base64url only — must survive being pasted into a URL untouched.
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("does not repeat", () => {
    const seen = new Set(Array.from({ length: 500 }, () => createShareToken()));
    expect(seen.size).toBe(500);
  });
});

describe("resolveExpiry", () => {
  const now = Date.parse("2026-08-16T00:00:00Z");

  it("honours the requested window", () => {
    expect(resolveExpiry(7, now).toISOString()).toBe("2026-08-23T00:00:00.000Z");
  });

  it("defaults rather than creating an immortal link", () => {
    // Every bad input lands on a real expiry — never "no expiry".
    for (const bad of [undefined, null, 0, -5, NaN, "abc"]) {
      expect(resolveExpiry(bad, now).getTime()).toBeGreaterThan(now);
    }
    expect(resolveExpiry(undefined, now).toISOString()).toBe("2026-09-15T00:00:00.000Z");
  });

  it("caps a wildly long request", () => {
    const capped = resolveExpiry(99999, now);
    expect(capped.getTime()).toBeLessThanOrEqual(now + 365 * 86400000);
  });
});

describe("checkShareAccess", () => {
  const now = Date.parse("2026-08-16T12:00:00Z");
  const live = { expires_at: "2026-09-01T00:00:00Z", revoked_at: null };

  it("opens a live link", () => {
    expect(checkShareAccess(live, now).ok).toBe(true);
  });

  it("refuses an expired one", () => {
    const r = checkShareAccess({ ...live, expires_at: "2026-08-15T00:00:00Z" }, now);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("expired");
  });

  it("refuses a revoked one even while it is still in date", () => {
    // Revocation has to beat expiry, or "undo" does not actually undo.
    const r = checkShareAccess({ ...live, revoked_at: "2026-08-16T09:00:00Z" }, now);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("revoked");
  });

  it("refuses one that does not exist", () => {
    expect(checkShareAccess(null, now).reason).toBe("not_found");
    expect(checkShareAccess(undefined, now).ok).toBe(false);
  });

  it("fails closed when the expiry is missing or unparseable", () => {
    // A bad write must not mint a permanent link.
    expect(checkShareAccess({ expires_at: null }, now).ok).toBe(false);
    expect(checkShareAccess({ expires_at: "not a date" }, now).ok).toBe(false);
  });

  it("treats the expiry instant itself as closed", () => {
    const at = Date.parse("2026-09-01T00:00:00Z");
    expect(checkShareAccess(live, at).ok).toBe(false);
    expect(checkShareAccess(live, at - 1).ok).toBe(true);
  });
});

describe("tokensMatch", () => {
  it("matches only an exact token", () => {
    const t = createShareToken();
    expect(tokensMatch(t, t)).toBe(true);
    expect(tokensMatch(t, `${t}x`)).toBe(false);
    expect(tokensMatch(t, t.slice(0, -1))).toBe(false);
  });

  it("rejects a prefix, which is what a timing attack builds", () => {
    expect(tokensMatch("abcdef", "abc")).toBe(false);
  });

  it("survives null and undefined without throwing", () => {
    expect(tokensMatch(null, undefined)).toBe(true); // both empty
    expect(tokensMatch("abc", null)).toBe(false);
  });
});

describe("toPublicReport", () => {
  it("passes the report sections through", () => {
    const out = toPublicReport({ period: { from: "a", to: "b" }, summary: { ftds: 3 }, trend: [1] });
    expect(out.summary.ftds).toBe(3);
    expect(out.trend).toEqual([1]);
  });

  it("drops anything not on the allowlist — including fields added later", () => {
    // The whole point: a new upstream field cannot leak by default.
    const out = toPublicReport({
      summary: { ftds: 1 },
      metaToken: "EAAsecret",
      credentials: [{ password: "hunter2" }],
      externalIds: ["019f..."],
      someFutureField: "added next quarter",
    });
    expect(out.metaToken).toBeUndefined();
    expect(out.credentials).toBeUndefined();
    expect(out.externalIds).toBeUndefined();
    expect(out.someFutureField).toBeUndefined();
    expect(Object.keys(out)).toEqual(["summary"]);
  });

  it("survives empty input", () => {
    expect(toPublicReport(null)).toEqual({});
    expect(toPublicReport({})).toEqual({});
  });
});

describe("fingerprintViewer", () => {
  it("coarsens IPv4 to a /24 — enough to spot extra readers, not to track one", () => {
    expect(fingerprintViewer("203.0.113.47", "Mozilla").ipCoarse).toBe("203.0.113.0");
  });

  it("coarsens IPv6", () => {
    expect(fingerprintViewer("2001:db8:85a3:8d3:1319:8a2e:370:7348", "x").ipCoarse)
      .toBe("2001:db8:85a3:8d3");
  });

  it("truncates the user agent and tolerates nothing at all", () => {
    expect(fingerprintViewer("1.2.3.4", "u".repeat(500)).agent.length).toBe(180);
    expect(fingerprintViewer(null, null)).toEqual({ ipCoarse: null, agent: null });
  });
});
