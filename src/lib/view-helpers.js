import { RATE_COLORS } from "./metricColors.js";

// Canonical single-path Telegram glyph (tint-able via currentColor) — used in
// place of the heavy multi-shade source logo for small inline UI.
// Stable fallback so views' row-filter memos don't recompute when the global
// flow filter is unset (a fresh [] every render would break memoization).
export const EMPTY_FLOW_FILTER = [];

export const homeChartSeries = [
  { key: "c2i", label: "Click2Install", color: RATE_COLORS.c2i, width: 2.2 },
  { key: "c2r", label: "Click2Register", color: RATE_COLORS.c2r, width: 2 },
  { key: "i2r", label: "Install2Reg", color: RATE_COLORS.i2r, width: 2 },
  { key: "r2d", label: "Reg2Dep", color: RATE_COLORS.r2d, width: 2 },
];

export const geoReference = {
  Argentina: { iso: "ARG", coordinates: [-63.6167, -38.4161] },
  Australia: { iso: "AUS", coordinates: [133.7751, -25.2744] },
  Azerbaijan: { iso: "AZE", coordinates: [47.5769, 40.1431] },
  Albania: { iso: "ALB", coordinates: [20.1683, 41.1533] },
  Algeria: { iso: "DZA", coordinates: [1.6596, 28.0339] },
  Bolivia: { iso: "BOL", coordinates: [-63.5887, -16.2902] },
  Brazil: { iso: "BRA", coordinates: [-51.9253, -14.235] },
  Canada: { iso: "CAN", coordinates: [-106.3468, 56.1304] },
  Chile: { iso: "CHL", coordinates: [-71.543, -35.6751] },
  Colombia: { iso: "COL", coordinates: [-74.2973, 4.5709] },
  "Costa Rica": { iso: "CRI", coordinates: [-83.7534, 9.7489] },
  Ecuador: { iso: "ECU", coordinates: [-78.1834, -1.8312] },
  Egypt: { iso: "EGY", coordinates: [30.8025, 26.8206] },
  Estonia: { iso: "EST", coordinates: [25.0136, 58.5953] },
  France: { iso: "FRA", coordinates: [2.2137, 46.2276] },
  Germany: { iso: "DEU", coordinates: [10.4515, 51.1657] },
  India: { iso: "IND", coordinates: [78.9629, 20.5937] },
  Iran: { iso: "IRN", coordinates: [53.688, 32.4279] },
  Iraq: { iso: "IRQ", coordinates: [43.6793, 33.2232] },
  Japan: { iso: "JPN", coordinates: [138.2529, 36.2048] },
  Morocco: { iso: "MAR", coordinates: [-7.0926, 31.7917] },
  "New Zealand": { iso: "NZL", coordinates: [174.8859, -40.9006] },
  Mexico: { iso: "MEX", coordinates: [-102.5528, 23.6345] },
  Nigeria: { iso: "NGA", coordinates: [8.6753, 9.082] },
  Norway: { iso: "NOR", coordinates: [8.4689, 60.472] },
  Paraguay: { iso: "PRY", coordinates: [-58.4438, -23.4425] },
  Peru: { iso: "PER", coordinates: [-75.0152, -9.19] },
  Poland: { iso: "POL", coordinates: [19.1451, 51.9194] },
  Romania: { iso: "ROU", coordinates: [24.9668, 45.9432] },
  Russia: { iso: "RUS", coordinates: [105.3188, 61.524] },
  "South Korea": { iso: "KOR", coordinates: [127.7669, 35.9078] },
  Sweden: { iso: "SWE", coordinates: [18.6435, 60.1282] },
  Switzerland: { iso: "CHE", coordinates: [8.2275, 46.8182] },
  Tunisia: { iso: "TUN", coordinates: [9.5375, 33.8869] },
  Ukraine: { iso: "UKR", coordinates: [31.1656, 48.3794] },
  "United States": { iso: "USA", coordinates: [-98.5795, 39.8283] },
  Venezuela: { iso: "VEN", coordinates: [-66.5897, 6.4238] },
  Vietnam: { iso: "VNM", coordinates: [108.2772, 14.0583] },
  China: { iso: "CHN", coordinates: [104.1954, 35.8617] },
  Turkey: { iso: "TUR", coordinates: [35.2433, 38.9637] },
  Guyana: { iso: "GUY", coordinates: [-58.9302, 4.8604] },
  Netherlands: { iso: "NLD", coordinates: [5.2913, 52.1326] },
  "United Arab Emirates": { iso: "ARE", coordinates: [53.8478, 23.4241] },
};

export const geoPalette = [
  "var(--green)",
  "var(--blue)",
  "var(--purple)",
  "var(--yellow)",
  "var(--pink)",
  "var(--orange)",
];

// Shows enough of an EAAG token to recognise it, never enough to use it.
export const maskEaagToken = (value) => {
  const token = String(value || "");
  if (!token) return "—";
  return token.length <= 14 ? token : `${token.slice(0, 8)}••••${token.slice(-4)}`;
};

// Brands offered by default in the Keitaro import dialog. Module-level so the
// array reference is stable — the dialog re-previews when this changes, and an
// inline literal would make that "every render".
export const IMPORT_DEFAULT_BRANDS = ["JASINO", "ZLOTMX"];

// "2026-08-01 → 2026-08-31" is 23 characters to say "Aug 1–31". On a card
// whose subtitle also carries the period, the country and how long is left,
// the long form crowded out the part a buyer actually reads.
export const formatGoalRange = (from, to) => {
  const parse = (value) => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const start = parse(from);
  const end = parse(to);
  if (!start || !end) return from && to ? `${from} → ${to}` : null;
  const month = (date) => date.toLocaleDateString("en-US", { month: "short" });
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${month(start)} ${start.getDate()}–${end.getDate()}`;
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  const tail = sameYear ? "" : ` ${end.getFullYear()}`;
  return `${month(start)} ${start.getDate()} – ${month(end)} ${end.getDate()}${tail}`;
};
