// Why a Meta access token stopped working, in words someone can act on.
//
// Keitaro reports one string for every possible cause —
// "third_party_integration.errors.token" — which is true and useless. It does
// not distinguish a token that expired last night (re-issue it) from one whose
// Meta App was deleted (no token from that app will ever work again, build a
// new app). Those need completely different work, and the dashboard spent
// weeks showing the same red dot for both.
//
// So we ask Meta directly and classify the answer. The verdicts below are the
// ones actually seen on this account; anything else falls through to `unknown`
// with the raw message attached, because a wrong diagnosis is worse than an
// honest "here is what Meta said".

// Graph API error codes we can name. Meta reuses code 200 for several
// unrelated conditions, so the message has to be read as well as the code.
export const classifyMetaError = (error) => {
  const code = Number(error?.code);
  const sub = Number(error?.error_subcode) || null;
  const message = String(error?.message || "");

  // The App the token was minted from no longer exists. Terminal: every token
  // issued by it is dead, including ones that have not expired.
  if (code === 190 && /application has been deleted/i.test(message)) {
    return {
      verdict: "app_deleted",
      fatal: true,
      summary: "The Meta app these tokens came from has been deleted",
      action: "Create a new Meta app, issue fresh tokens (a System User token does not expire), and re-wire each ad account.",
    };
  }
  if (code === 190 && /session has expired|expired/i.test(message)) {
    return {
      verdict: "expired",
      fatal: false,
      summary: "Token expired",
      action: "Re-issue the token. A System User token avoids the 60-day expiry.",
    };
  }
  if (code === 190 && /password|changed their password|checkpoint/i.test(message)) {
    return {
      verdict: "revoked",
      fatal: false,
      summary: "Token revoked — the account password changed or hit a checkpoint",
      action: "Re-issue the token after clearing the checkpoint.",
    };
  }
  if (code === 190) {
    return { verdict: "invalid", fatal: false, summary: "Token rejected by Meta", action: "Re-issue the token.", detail: message };
  }
  // 200 covers both "you may not read this account" and "this app is blocked".
  if (code === 200 && /access blocked|blocked/i.test(message)) {
    return {
      verdict: "blocked",
      fatal: true,
      summary: "Meta has blocked API access for this app or account",
      action: "Check the app's status in Meta Business — this is usually a policy restriction, not a token problem.",
    };
  }
  if (code === 200 || code === 272 || code === 10) {
    return {
      verdict: "no_permission",
      fatal: false,
      summary: "The ad account has not granted ads_read to this app",
      action: "Grant ads_read (or ads_management) for this ad account, then retry.",
      detail: message,
    };
  }
  if (code === 803 || /does not exist|cannot be loaded/i.test(message)) {
    return {
      verdict: "no_account",
      fatal: false,
      summary: "Ad account not found for this token",
      action: "Check the account number, and that the token's user can see it.",
      detail: message,
    };
  }
  if (code === 4 || code === 17 || code === 613 || sub === 2446079) {
    return {
      verdict: "rate_limited",
      fatal: false,
      summary: "Meta is rate-limiting these requests",
      action: "Transient — no action unless it persists for hours.",
    };
  }
  return {
    verdict: "unknown",
    fatal: false,
    summary: message ? `Meta said: ${message.slice(0, 120)}` : "Meta rejected the request",
    action: "Read the message above against Meta's error reference.",
    detail: message,
  };
};

// One line for the whole estate. Counting matters more than listing here: 11
// accounts all failing for the same reason is one job, not eleven, and saying
// so is the difference between "fix the app" and "chase eleven tokens".
export const summariseTokenChecks = (checks) => {
  const list = (checks || []).filter(Boolean);
  const byVerdict = new Map();
  for (const check of list) {
    if (check.ok) continue;
    const key = check.verdict || "unknown";
    if (!byVerdict.has(key)) byVerdict.set(key, { verdict: key, count: 0, summary: check.summary, action: check.action, fatal: !!check.fatal });
    byVerdict.get(key).count += 1;
  }
  const groups = [...byVerdict.values()].sort((a, b) => b.count - a.count);
  const working = list.filter((c) => c.ok).length;
  return {
    total: list.length,
    working,
    broken: list.length - working,
    // The single thing to do first: the largest fatal group, else the largest.
    headline: groups.find((g) => g.fatal) || groups[0] || null,
    groups,
  };
};
