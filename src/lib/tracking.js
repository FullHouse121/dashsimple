import { ALL_COUNTRIES } from "./constants.js";

// ── Tracking Links ────────────────────────────────────────────────────
// Compose Keitaro campaigns from the dashboard: Buyer | Tool | Game |
// Geo | Brand naming, domain/alias?params link, optional push to the
// Keitaro Admin API — stored locally either way.
// Keitaro traffic-source name → short code used in the campaign-name Tool segment.
export const TRACKING_SOURCE_SHORTCODES = {
  "pwa.group": "PWA.GROUP",
  "linki.group": "LINKI.GROUP",
  "zm.app": "ZMAPPS",
  "skakapp.com": "SKAK",
  "facebook.com": "FB",
  "pwa partners": "PWA PARTNERS",
  "trafficjunky.com": "TRAFFIC JUNKY",
  "youtarget.com": "YOUTARGET",
  "google ads": "GOOGLE",
  "tiktok.com": "TIKTOK",
};

export const trackingSourceShortcode = (name) => {
  const key = String(name || "").trim().toLowerCase();
  return TRACKING_SOURCE_SHORTCODES[key] || String(name || "").trim().toUpperCase();
};

// Frequent geos stay pinned on top; every other country follows alphabetically.
export const TRACKING_GEO_PRIORITY = [
  "GLOBAL", "MX", "BR", "TR", "AR", "CL", "CO", "PE", "EC", "PY",
  "DE", "FR", "GB", "IT", "CA", "AU", "NZ", "NO", "SE", "CH", "JP", "PL", "RO",
];

export const TRACKING_GEO_PRESETS = [
  ...TRACKING_GEO_PRIORITY,
  ...ALL_COUNTRIES.map(([, iso]) => iso.toUpperCase())
    .filter((code) => !TRACKING_GEO_PRIORITY.includes(code))
    .sort(),
];

export const TRACKING_GEO_NAMES = Object.fromEntries(
  ALL_COUNTRIES.map(([name, iso]) => [iso.toUpperCase(), name])
);

// Only these Keitaro tracking/redirect domains may back a tracking link
// (everyone sees exactly this list). PWA landing domains are never used here.
export const ALLOWED_TRACKING_DOMAINS = [
  "tracker.deusmachine-trk.com",
  "go.deuskt.click",
  "deuskt.click",
];

export const normalizeTrackingHost = (name) =>
  String(name || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");

export const DEFAULT_TRACKING_PARAMS =
  "external_id={external_id}&sub1={sub1}&sub2={sub2}&sub3={sub3}&sub4={sub4}&sub5={sub5}&adset_id={{adset.id}}&sub7={sub7}&sub8={sub8}&sub9={sub9}&sub10={sub10}&sub11={sub11}&fbclid={{fbclid}}";

// Each traffic tool passes its click identifier under a different macro, so the
// external_id value must follow the selected tool (keyed by shortcode).
// Before a tool is picked, the neutral {external_id} placeholder stays put —
// picking a tool swaps in that source's real macro from its Keitaro config.

// Each traffic tool passes its click identifier under a different macro, so the
// external_id value must follow the selected tool (keyed by shortcode).
// Before a tool is picked, the neutral {external_id} placeholder stays put —
// picking a tool swaps in that source's real macro from its Keitaro config.
export const DEFAULT_EXTERNAL_ID_MACRO = "{external_id}";

export const TRACKING_TOOL_EXTERNAL_ID = {
  "PWA.GROUP": "{USER_ID}",
  "PWA PARTNERS": "{user_id}",
  "LINKI.GROUP": "{client_id}",
  "ZMAPPS": "{exid}",
  "SKAK": "{clickId}",
};

export const externalIdMacroForTool = (tool) =>
  TRACKING_TOOL_EXTERNAL_ID[String(tool || "").trim().toUpperCase()] || DEFAULT_EXTERNAL_ID_MACRO;
// Swap only the external_id value in a params string, preserving any custom subs.

// Swap only the external_id value in a params string, preserving any custom subs.
export const applyExternalIdMacro = (params, tool) => {
  const macro = externalIdMacroForTool(tool);
  const s = String(params || "");
  if (/(?:^|&)external_id=/i.test(s)) {
    return s.replace(/((?:^|&)external_id=)[^&]*/i, `$1${macro}`);
  }
  return `external_id=${macro}${s ? `&${s}` : ""}`;
};

// Keitaro stream filter catalog. name = API filter name; bool = no values.
export const TRACKING_FILTER_CATALOG = [
  { group: "Traffic", name: "keyword", label: "Keyword" },
  { group: "Traffic", name: "search_engine", label: "Search engine", bool: true },
  { group: "Traffic", name: "ad_campaign_id", label: "Ad campaign ID" },
  { group: "Traffic", name: "creative_id", label: "Creative ID" },
  { group: "Traffic", name: "empty_referrer", label: "Empty referer", bool: true },
  { group: "Traffic", name: "referrer", label: "Referrer" },
  { group: "Geo", name: "country", label: "Country / GEO" },
  { group: "Geo", name: "region", label: "Region" },
  { group: "Geo", name: "city", label: "City" },
  { group: "Geo", name: "language", label: "Language" },
  { group: "Geo", name: "connection_type", label: "Connection type" },
  { group: "Geo", name: "isp", label: "ISP / Carrier" },
  { group: "Security", name: "bot", label: "Bot", bool: true },
  { group: "Security", name: "proxy", label: "Proxy detected", bool: true },
  { group: "Security", name: "ipv_6", label: "IPv6", bool: true },
  { group: "Security", name: "unique_click", label: "Unique click", bool: true },
  { group: "Device", name: "device_type", label: "Device type", options: ["mobile", "desktop", "tablet", "tv"] },
  { group: "Device", name: "os", label: "OS" },
  { group: "Device", name: "os_version", label: "OS version" },
  { group: "Device", name: "browser", label: "Browser" },
  { group: "Device", name: "browser_version", label: "Browser version" },
  ...Array.from({ length: 11 }, (_, i) => ({
    group: "Sub IDs",
    name: `sub_id_${i + 1}`,
    label: `Sub ID ${i + 1}`,
  })),
];

export const TRACKING_FILTER_BY_NAME = Object.fromEntries(TRACKING_FILTER_CATALOG.map((f) => [f.name, f]));
