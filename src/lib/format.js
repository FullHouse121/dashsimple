// Pure formatting utilities used across all dashboards.
// No React imports — safe to use anywhere.

let activeFxRate = 1;

export const setActiveFxRate = (rate) => {
  if (!Number.isFinite(rate) || rate <= 0) return;
  activeFxRate = rate;
};

export const getActiveFxRate = () => activeFxRate;

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value, rate = activeFxRate) => {
  if (value === null || value === undefined || value === "" || Number.isNaN(value)) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  const fxRate = Number.isFinite(rate) ? rate : 1;
  return currencyFormatter.format(numeric * fxRate);
};

export const wholeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Money that is an aggregate, not a price. "$10,000.00" spends two characters
// on precision nobody acts on, and a column of them is measurably harder to
// scan than a column of "$10,000". Unit rates — a per-FTD price — keep their
// cents via formatCurrency, because there the cents are the number.
export const formatCurrencyWhole = (value, rate = activeFxRate) => {
  if (value === null || value === undefined || value === "" || Number.isNaN(value)) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  const fxRate = Number.isFinite(rate) ? rate : 1;
  return wholeCurrencyFormatter.format(numeric * fxRate);
};

// Percentages are read here, not audited. "12.00%" and "12%" carry the same
// decision; only one of them is quick to scan. Trailing zeros go, real
// precision stays.
export const formatPercent = (value, maxDigits = 2) => {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `${Number(numeric.toFixed(maxDigits))}%`;
};

// Short currency for axis ticks and on-bar labels: "$1.2k" / "$45" / "$0.15".
// Full precision stays in tooltips via formatCurrency.
export const formatCurrencyCompact = (value, rate = activeFxRate) => {
  if (value === null || value === undefined || value === "" || Number.isNaN(value)) return "—";
  const numeric = Number(value) * (Number.isFinite(rate) ? rate : 1);
  if (!Number.isFinite(numeric)) return "—";
  const abs = Math.abs(numeric);
  const sign = numeric < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  if (abs >= 100) return `${sign}$${Math.round(abs)}`;
  // Whole values stay clean ("$45", "$0"); only true cents get decimals.
  return abs % 1 === 0 ? `${sign}$${abs}` : `${sign}$${abs.toFixed(2)}`;
};

export const formatAxis = (value) => {
  if (value === 0) return "0k";
  const thousands = value / 1000;
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
};

export const formatVolumeAxis = (value) => (value >= 1000 ? formatAxis(value) : value);

export const formatValue = (value) =>
  Number.isInteger(value) ? value : Number(value).toFixed(2);

export const toGradientId = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Shared Recharts styling tokens
export const axisTickStyle = { fill: "#8b909a", fontSize: 11 };

// Recharts colours each tooltip row from the series' fill; with Cell-based or
// gradient fills that resolves to nothing readable — force light text.
export const tooltipItemStyle = { color: "#f2f2f4" };
export const tooltipLabelStyle = { color: "#9aa0aa", fontWeight: 600, marginBottom: 4 };

export const tooltipStyle = {
  background: "linear-gradient(180deg, rgba(33, 35, 41, 0.96), rgba(25, 27, 32, 0.98))",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "10px",
  padding: "10px 12px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.45), inset 0 1px rgba(255,255,255,0.04)",
  backdropFilter: "blur(12px) saturate(140%)",
  WebkitBackdropFilter: "blur(12px) saturate(140%)",
  color: "#f2f2f4",
  fontSize: "12px",
};

// CSV cell escaping incl. spreadsheet-formula neutralisation: values that
// start with = + - @ (or tab/CR) execute as formulas when the export is
// opened in Excel/Sheets, and sub/external_id values arrive from public
// postbacks — attacker-controllable. Prefix with ' to keep them inert.
export const csvCell = (value) => {
  let s = String(value ?? "").replace(/"/g, '""');
  // A negative number is not a formula. Guarding on the leading character
  // alone turned every negative ROI, profit and delta into Excel *text*,
  // which is worse than the risk it was defending against.
  const isPlainNumber = /^-?\d+(?:\.\d+)?$/.test(s);
  if (!isPlainNumber && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s}"`;
};

// One CSV download for every registry, so a new export never reinvents the
// escaping or forgets the BOM (without it Excel mangles accented domains).
export const downloadCsv = (filename, headers, rows) => {
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ];
  const blob = new Blob([`\ufeff${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
