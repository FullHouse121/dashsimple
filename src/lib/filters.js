// Filter helpers — pure, no React.
// Used by every dashboard to match the active buyer/country selection.

import { isDateInRange } from "./date.js";

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

// Flow / campaign multi-select: an empty selection matches everything,
// otherwise the row's campaign name must equal one of the picked names.
export const matchesCampaignListFilter = (campaign, selectedList) => {
  const list = Array.isArray(selectedList) ? selectedList : [];
  if (!list.length) return true;
  const row = normalizeFilterValue(campaign);
  if (!row) return false;
  return list.some((name) => normalizeFilterValue(name) === row);
};

// ── User Behavior ─────────────────────────────────────────────────────────
// Extracted from the dashboard so the global filters can be tested against
// real API rows instead of clicked through one at a time. /api/user-behavior
// returns exactly: external_id, buyer, country, campaign, date and the
// measures — any predicate reading a field outside that set silently matches
// nothing and empties the section, which is how the Domain/Source filter
// behaved before it was removed from this view.
export const USER_BEHAVIOR_ROW_FIELDS = [
  "external_id",
  "buyer",
  "country",
  "campaign",
  "date",
  "clicks",
  "registers",
  "ftds",
  "redeposits",
  "revenue",
  "ftd_revenue",
  "redeposit_revenue",
];

export const matchesUserBehaviorRow = (row, ctx = {}) => {
  const {
    dateRange,
    buyer = "All",
    country = "All",
    flows = [],
    campaign = "All",
    viewerBuyer = "",
    isLeadership = false,
  } = ctx;
  if (dateRange && !isDateInRange(row.date || row.day || row.created_at, dateRange)) return false;
  if (!matchesBuyerFilter(row.buyer, buyer, viewerBuyer, isLeadership)) return false;
  if (!matchesCountryFilter(row.country, country)) return false;
  if (!matchesCampaignListFilter(row.campaign, flows)) return false;
  if (!isAllSelection(campaign)) {
    const rowCampaign = normalizeFilterValue(row.campaign || row.buyer);
    if (!rowCampaign.includes(normalizeFilterValue(campaign))) return false;
  }
  return true;
};

// Applied after per-player aggregation: these thresholds are about the player,
// not the row.
export const matchesUserAggregate = (user, ctx = {}) => {
  const {
    search = "",
    externalId = "",
    minRevenue = 0,
    minFtds = 0,
    minRedeposits = 0,
    revenueOnly = false,
  } = ctx;
  const normalizedSearch = normalizeFilterValue(search);
  if (normalizedSearch) {
    const idMatch = normalizeFilterValue(user.externalId).includes(normalizedSearch);
    const campaignMatch = normalizeFilterValue(user.campaign).includes(normalizedSearch);
    if (!idMatch && !campaignMatch) return false;
  }
  const normalizedExternal = normalizeFilterValue(externalId);
  if (normalizedExternal && !normalizeFilterValue(user.externalId).includes(normalizedExternal)) {
    return false;
  }
  if (Number.isFinite(minRevenue) && minRevenue > 0 && (user.revenue || 0) < minRevenue) return false;
  if (Number.isFinite(minFtds) && minFtds > 0 && (user.ftds || 0) < minFtds) return false;
  if (Number.isFinite(minRedeposits) && minRedeposits > 0 && (user.redeposits || 0) < minRedeposits) {
    return false;
  }
  if (revenueOnly && (user.revenue || 0) <= 0) return false;
  return true;
};
