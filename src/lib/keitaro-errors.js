// Keitaro returns raw i18n error keys for Facebook-costs failures; map the
// common ones to human-readable text (raw stays in the cell's tooltip).
export const KEITARO_ERROR_MAP = {
  "third_party_integration.errors.token": "Invalid or expired Meta token",
  "third_party_integration.errors.account": "Ad account not accessible by this token",
  "third_party_integration.errors.permissions": "Token missing ad-account permissions",
  "third_party_integration.errors.rate_limit": "Facebook rate limit — try again later",
};

export const friendlyKeitaroError = (raw) => {
  const key = String(raw || "").trim();
  if (!key) return "";
  if (KEITARO_ERROR_MAP[key]) return KEITARO_ERROR_MAP[key];
  // Turn "third_party_integration.errors.something_here" into "Something here"
  const tail = key.split(".").pop().replace(/_/g, " ");
  return /errors?\b/i.test(key) ? tail.charAt(0).toUpperCase() + tail.slice(1) : key;
};
