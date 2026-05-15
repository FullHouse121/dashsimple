// Filter helpers — pure, no React.
// Used by every dashboard to match the active buyer/country selection.

export const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();

export const isAllSelection = (value) =>
  !value || normalizeFilterValue(value) === "all";

export const normalizeBuyerKey = (value) =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const escapeRegExp = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const matchesBuyerName = (buyer, selectedBuyer) => {
  const normalizedBuyer = normalizeBuyerKey(buyer);
  const normalizedSelected = normalizeBuyerKey(selectedBuyer);
  if (!normalizedBuyer || !normalizedSelected) return false;
  if (normalizedBuyer === normalizedSelected || normalizedBuyer.startsWith(normalizedSelected)) {
    return true;
  }
  const rawBuyer = normalizeFilterValue(buyer);
  const rawSelected = normalizeFilterValue(selectedBuyer);
  if (!rawBuyer || !rawSelected) return false;
  const boundary = new RegExp(`(^|[^a-z0-9])${escapeRegExp(rawSelected)}([^a-z0-9]|$)`);
  return boundary.test(rawBuyer);
};

export const matchesBuyerFilter = (buyer, selectedBuyer, viewerBuyer, isLeadership) => {
  if (!isLeadership) {
    if (!viewerBuyer) return true;
    return matchesBuyerName(buyer, viewerBuyer);
  }
  if (isAllSelection(selectedBuyer)) return true;
  return matchesBuyerName(buyer, selectedBuyer);
};

export const matchesCountryFilter = (country, selectedCountry) => {
  if (isAllSelection(selectedCountry)) return true;
  return normalizeFilterValue(country) === normalizeFilterValue(selectedCountry);
};
