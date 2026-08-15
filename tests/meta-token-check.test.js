// These verdicts decide what someone is told to go and do, so the cases that
// matter are the ones where a wrong classification sends them after the wrong
// job: re-issuing tokens for an app that no longer exists, or rebuilding an app
// when one ad account simply never granted a permission.
import { describe, it, expect } from "vitest";
import { classifyMetaError, summariseTokenChecks } from "../server/lib/meta-token-check.js";

const err = (code, message, error_subcode) => ({ code, message, error_subcode });

describe("classifyMetaError", () => {
  it("names a deleted app, and marks it fatal", () => {
    // The real message from this account: no token from that app will ever
    // work again, so "re-issue the token" would be the wrong instruction.
    const r = classifyMetaError(err(190, "Error validating application. Application has been deleted."));
    expect(r.verdict).toBe("app_deleted");
    expect(r.fatal).toBe(true);
    expect(r.action).toMatch(/new Meta app/i);
  });

  it("separates an expired token from a deleted app", () => {
    const r = classifyMetaError(err(190, "Error validating access token: Session has expired"));
    expect(r.verdict).toBe("expired");
    expect(r.fatal).toBe(false);
  });

  it("treats a password change as revocation, not expiry", () => {
    const r = classifyMetaError(err(190, "The user has changed their password."));
    expect(r.verdict).toBe("revoked");
  });

  it("distinguishes a blocked app from a missing permission — both are code 200", () => {
    expect(classifyMetaError(err(200, "API access blocked.")).verdict).toBe("blocked");
    expect(
      classifyMetaError(err(200, "(#200) Ad account owner has NOT grant ads_management or ads_read permission")).verdict
    ).toBe("no_permission");
  });

  it("only the blocked case is fatal, because a permission can be granted", () => {
    expect(classifyMetaError(err(200, "API access blocked.")).fatal).toBe(true);
    expect(classifyMetaError(err(200, "(#200) Ad account owner has NOT grant ads_read")).fatal).toBe(false);
  });

  it("recognises a missing ad account", () => {
    expect(classifyMetaError(err(803, "Some of the aliases you requested do not exist")).verdict).toBe("no_account");
  });

  it("marks rate limiting as transient", () => {
    expect(classifyMetaError(err(17, "User request limit reached")).verdict).toBe("rate_limited");
    expect(classifyMetaError(err(4, "Application request limit reached")).fatal).toBe(false);
  });

  it("falls through to unknown carrying Meta's own words", () => {
    const r = classifyMetaError(err(99999, "Something nobody has seen before"));
    expect(r.verdict).toBe("unknown");
    // A guess would be worse than quoting the source.
    expect(r.summary).toContain("Something nobody has seen before");
  });

  it("survives a malformed error object", () => {
    expect(classifyMetaError(null).verdict).toBe("unknown");
    expect(classifyMetaError({}).verdict).toBe("unknown");
  });
});

describe("summariseTokenChecks", () => {
  const deleted = { ok: false, verdict: "app_deleted", fatal: true, summary: "app gone", action: "new app" };
  const perm = { ok: false, verdict: "no_permission", fatal: false, summary: "no grant", action: "grant" };
  const good = { ok: true };

  it("counts working and broken", () => {
    const s = summariseTokenChecks([deleted, deleted, perm, good]);
    expect(s.total).toBe(4);
    expect(s.working).toBe(1);
    expect(s.broken).toBe(3);
  });

  it("groups one cause into one job rather than many", () => {
    // Eleven accounts failing for one reason is one piece of work.
    const s = summariseTokenChecks(Array.from({ length: 11 }, () => deleted));
    expect(s.groups).toHaveLength(1);
    expect(s.groups[0].count).toBe(11);
  });

  it("leads with the fatal cause even when another is more numerous", () => {
    const s = summariseTokenChecks([deleted, perm, perm, perm]);
    expect(s.headline.verdict).toBe("app_deleted");
  });

  it("leads with the largest group when nothing is fatal", () => {
    const s = summariseTokenChecks([perm, perm, { ok: false, verdict: "expired", fatal: false }]);
    expect(s.headline.verdict).toBe("no_permission");
  });

  it("has no headline when everything works", () => {
    const s = summariseTokenChecks([good, good]);
    expect(s.headline).toBeNull();
    expect(s.broken).toBe(0);
  });

  it("survives empty and nullish input", () => {
    expect(summariseTokenChecks([]).total).toBe(0);
    expect(summariseTokenChecks(null).total).toBe(0);
    expect(summariseTokenChecks([null, undefined, good]).total).toBe(1);
  });
});
