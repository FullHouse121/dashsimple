// Static option arrays and country/domain normalization helpers.
// Pure data + pure helpers — no React, no side effects.

export const supportedCountryOptions = [
  "Australia", "France", "Germany", "New Zealand", "Egypt", "Estonia",
  "Japan", "India", "Vietnam", "Chile", "Argentina", "Peru", "Venezuela",
  "Colombia", "Costa Rica", "Bolivia", "Brazil", "Mexico", "Russia",
  "Nigeria", "Ukraine", "Poland", "Ecuador", "Paraguay", "Romania",
  "Albania", "Norway", "Morocco", "Algeria", "Tunisia", "South Korea",
  "Switzerland", "Sweden", "Canada", "Iran", "Iraq", "Azerbaijan",
];

export const countryOptions = [...supportedCountryOptions];
export const accountRegistryCountryOptions = [...supportedCountryOptions];
export const defaultCountryOption = supportedCountryOptions[0] || "";

export const normalizeCountryValueKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const supportedCountryValueMap = new Map(
  supportedCountryOptions.map((country) => [normalizeCountryValueKey(country), country])
);
supportedCountryValueMap.set("brasil", "Brazil");

export const normalizeCountryListValue = (value) => {
  if (value === null || value === undefined || value === "") return [];
  let source = value;
  if (typeof source === "string") {
    const trimmed = source.trim();
    if (!trimmed) return [];
    try {
      source = JSON.parse(trimmed);
    } catch (error) {
      source = trimmed.includes(",") ? trimmed.split(",") : [trimmed];
    }
  }
  const list = Array.isArray(source) ? source : [source];
  const normalized = [];
  list.forEach((item) => {
    const raw = String(item || "").trim();
    if (!raw) return;
    const canonical = supportedCountryValueMap.get(normalizeCountryValueKey(raw)) || raw;
    if (!normalized.includes(canonical)) {
      normalized.push(canonical);
    }
  });
  return normalized;
};

export const normalizeDomainInputValue = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  const withoutProtocol = text.replace(/^https?:\/\//i, "");
  const hostCandidate = withoutProtocol.split("/")[0].trim();
  if (!hostCandidate) return text;
  return hostCandidate.toLowerCase();
};

export const normalizeDomainInputList = (value) => {
  if (value === null || value === undefined || value === "") return [];
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((item) => normalizeDomainInputValue(item)).filter(Boolean))
    );
  }
  const raw = String(value || "").trim();
  if (!raw) return [];
  const tokens = raw
    .split(/[\s,;]+/g)
    .map((item) => normalizeDomainInputValue(item))
    .filter(Boolean);
  return Array.from(new Set(tokens));
};

// ── Static option arrays used by selects across the app ──────────────
export const categoryOptions = ["Traffic Source", "Tools", "Designs"];
export const billingOptions = ["Crypto", "Bank Transfer", "Card"];
export const statusOptions = ["Requested", "Done", "Expired", "Cancelled"];
export const approachOptions = ["All", "Organic", "Paid Social", "Influencers", "Search"];
export const priorityBuyers = [
  "Leo", "Leticia", "Carvalho", "Akku", "Enzo", "Matheus", "Sara", "ZM apps",
];
export const buyerOptions = ["All", ...priorityBuyers];
export const roleOptions = [
  "Boss",
  "Team Leader",
  "Media Buyer Junior",
  "Media Buyer",
  "Media Buyer Senior",
];

export const permissionOptions = [
  { key: "dashboard", label: "Home Dashboard" },
  { key: "geos", label: "GEOS" },
  { key: "goals", label: "Goals" },
  { key: "finances", label: "Finances" },
  { key: "utm", label: "UTM Builder" },
  { key: "statistics", label: "Statistics" },
  { key: "campaigns", label: "Campaigns" },
  { key: "placements", label: "Placement" },
  { key: "user_behavior", label: "User Behavior" },
  { key: "devices", label: "Devices" },
  { key: "domains", label: "Domains" },
  { key: "pixels", label: "Pixels" },
  { key: "accounts", label: "Accounts" },
  { key: "meta_token", label: "Meta Token $" },
  { key: "api", label: "API" },
  { key: "media_buyers", label: "Media Buyers" },
  { key: "roles", label: "Roles & Permissions" },
];

export const periodOptions = [
  "Today", "Yesterday", "This Week", "Last Week",
  "This Month", "Last Month", "All",
];
