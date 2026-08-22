import { formatCurrency, formatValue, tooltipStyle } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";

export function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{label}</p>
      {payload.map((item) => (
        <div className="tooltip-row" key={item.dataKey}>
          <span
            className="tooltip-dot"
            style={{ background: item.color || item.fill || item.stroke }}
          />
          <span>{item.name}</span>
          <span className="tooltip-value">{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RateTooltip({ active, payload }) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="chart-tooltip rate-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{item.name}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: item.color }} />
        <span>{t("Rate")}</span>
        <span className="tooltip-value">{item.value}%</span>
      </div>
    </div>
  );
}

export function ShareTooltip({ active, payload }) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="chart-tooltip rate-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{item.name}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: item.color }} />
        <span>{t("Share")}</span>
        <span className="tooltip-value">{item.value}%</span>
      </div>
    </div>
  );
}

export function ChartTooltip({ active, payload, label, visibleKeys }) {
  if (!active || !payload?.length) return null;
  const filtered = visibleKeys
    ? payload.filter((item) => visibleKeys.includes(item.dataKey))
    : payload;
  const formatValue = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return numeric.toFixed(2);
  };
  const formatCount = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return Math.round(numeric).toLocaleString();
  };
  const getRateContext = (item) => {
    const row = item?.payload || {};
    switch (item?.dataKey) {
      case "c2i":
        return { num: row.installs, den: row.clicks };
      case "c2r":
        return { num: row.registers, den: row.clicks };
      case "i2r":
        return { num: row.registers, den: row.installs };
      case "r2d":
        return { num: row.ftds, den: row.registers };
      default:
        return null;
    }
  };

  return (
    <div className="chart-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{label}</p>
      {filtered.map((item) => {
        const context = getRateContext(item);
        return (
          <div className="tooltip-row" key={item.dataKey}>
            <span className="tooltip-dot" style={{ background: item.stroke }} />
            <span>{item.name}</span>
            <span className="tooltip-value">
              {formatValue(item.value)}
              %
              {context ? ` (${formatCount(context.num)} / ${formatCount(context.den)})` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
