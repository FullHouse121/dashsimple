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
  return `${sign}$${abs.toFixed(2)}`;
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
