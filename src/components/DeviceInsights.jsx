import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "../lib/format.js";

const axisTick = { fill: "#8b8f98", fontSize: 11 };
const tooltipSurface = {
  background: "#1b1d21",
  border: "1px solid #2b2e35",
  borderRadius: 14,
  color: "#f2f2f4",
  fontSize: 12,
};

// Enough traffic that "no revenue" is a finding rather than an absence of data.
export const WASTE_MIN_CLICKS = 200;

// A segment that takes real volume and returns nothing is the one thing on this
// page worth acting on today — it is a targeting exclusion waiting to be made.
export const findWaste = (rows, { minClicks = WASTE_MIN_CLICKS, labelKey = "name" } = {}) => {
  // Platforms and OSes are searched together, and the OS list falls back to the
  // device name when a row has no OS — so "Desktop" can legitimately arrive
  // twice. Keep the larger and drop the duplicate, otherwise the same segment
  // is both listed twice and counted twice in the total.
  const best = new Map();
  rows.forEach((row) => {
    if ((row.clicks || 0) < minClicks || (row.revenue || 0) > 0) return;
    const key = String(row[labelKey] || "").toLowerCase();
    const existing = best.get(key);
    if (!existing || (row.clicks || 0) > (existing.clicks || 0)) best.set(key, row);
  });
  return [...best.values()].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
};

// ── mix: volume against value ─────────────────────────────────────────────
// One bar of clicks says Desktop is 10% of traffic. Two bars say it is 10% of
// traffic and 0% of revenue, which is a decision.
const MIX_COLORS = ["var(--green)", "var(--teal)", "var(--blue)", "var(--purple)", "var(--faint)"];

export const DeviceMix = ({ rows, t = (x) => x, labelKey = "name" }) => {
  const data = React.useMemo(
    () => [...rows].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5),
    [rows]
  );
  if (!data.length) return null;

  const bars = [
    { key: "clicks", label: t("Share of clicks") },
    { key: "revenue", label: t("Share of revenue") },
  ];

  return (
    <div className="dv-mix">
      {bars.map((bar) => {
        const total = data.reduce((acc, row) => acc + (row[bar.key] || 0), 0);
        return (
          <div className="dv-mix-row" key={bar.key}>
            <span className="dv-mix-caption">{bar.label}</span>
            <div className="dv-mix-bar" role="img" aria-label={bar.label}>
              {total > 0 ? (
                data.map((row, idx) => {
                  const value = row[bar.key] || 0;
                  if (value <= 0) return null;
                  const pct = (value / total) * 100;
                  return (
                    <span
                      key={row[labelKey]}
                      className="dv-mix-seg"
                      style={{ width: `${pct}%`, background: MIX_COLORS[idx % MIX_COLORS.length] }}
                      title={`${row[labelKey]} — ${pct < 1 ? pct.toFixed(1) : pct.toFixed(0)}%`}
                    >
                      {pct >= 10 ? <em>{pct.toFixed(0)}%</em> : null}
                    </span>
                  );
                })
              ) : (
                <span className="dv-mix-seg is-empty" />
              )}
            </div>
          </div>
        );
      })}
      <div className="dv-mix-key">
        {data.map((row, idx) => (
          <span className="dv-mix-key-item" key={row[labelKey]}>
            <span className="dv-mix-dot" style={{ background: MIX_COLORS[idx % MIX_COLORS.length] }} />
            {row[labelKey]}
            <em>{(row.clicks || 0).toLocaleString()}</em>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── waste ─────────────────────────────────────────────────────────────────
export const WasteCallout = ({ rows, totalClicks, t = (x) => x, labelKey = "name" }) => {
  const waste = React.useMemo(() => findWaste(rows), [rows]);
  if (!waste.length) return null;
  const wastedClicks = waste.reduce((acc, row) => acc + (row.clicks || 0), 0);
  const wastedSpend = waste.reduce((acc, row) => acc + (row.spend || 0), 0);

  return (
    <div className="dv-waste">
      <div className="dv-waste-head">
        <span className="dv-waste-value">{wastedClicks.toLocaleString()}</span>
        <span className="dv-waste-label">
          {t("clicks with no revenue at all")}
          <em>
            {totalClicks > 0 ? ` ${((wastedClicks / totalClicks) * 100).toFixed(0)}% ${t("of traffic")}` : ""}
            {wastedSpend > 0 ? ` · ${formatCurrency(wastedSpend)} ${t("spent")}` : ""}
          </em>
        </span>
      </div>
      <ul className="dv-waste-list">
        {waste.slice(0, 4).map((row) => (
          <li key={row[labelKey]}>
            <span className="dv-waste-name">{row[labelKey]}</span>
            <span className="dv-waste-clicks">{(row.clicks || 0).toLocaleString()} {t("clicks")}</span>
            <span className="dv-waste-conv">
              {(row.registers || 0) > 0
                ? `${(row.registers || 0).toLocaleString()} ${t("registers, no deposit")}`
                : t("no registers")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── OS comparison ─────────────────────────────────────────────────────────
// Replaces four separate "by OS" bar charts that each showed one measure. One
// chart, switchable, ranked — the comparison people actually make.
const OsTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="dv-tip">
      <p className="dv-tip-name">{row.name}</p>
      <dl className="dv-tip-grid">
        <dt>{t("Clicks")}</dt><dd>{(row.clicks || 0).toLocaleString()}</dd>
        <dt>{t("Registers")}</dt><dd>{(row.registers || 0).toLocaleString()}</dd>
        <dt>{t("FTDs")}</dt><dd>{(row.ftds || 0).toLocaleString()}</dd>
        <dt>{t("Revenue")}</dt><dd>{formatCurrency(row.revenue || 0)}</dd>
        <dt>{t("EPC")}</dt><dd>{formatCurrency(row.epc || 0)}</dd>
      </dl>
    </div>
  );
};

export const OS_METRICS = [
  { key: "clicks", label: "Clicks", money: false },
  { key: "revenue", label: "Revenue", money: true },
  { key: "epc", label: "Rev / click", money: true },
  { key: "cr", label: "Click → FTD", money: false, percent: true },
];

export const OsComparison = ({ rows, metric = "clicks", t = (x) => x }) => {
  const spec = OS_METRICS.find((m) => m.key === metric) || OS_METRICS[0];
  const data = React.useMemo(
    () =>
      [...rows]
        .filter((row) => (row.clicks || 0) > 0)
        .sort((a, b) => (b[spec.key] || 0) - (a[spec.key] || 0))
        .slice(0, 8),
    [rows, spec.key]
  );
  if (!data.length) return <div className="empty-state">{t("No device data available.")}</div>;

  const fmt = (v) =>
    spec.percent ? `${Number(v).toFixed(2)}%` : spec.money ? formatCurrency(v) : Number(v).toLocaleString();

  return (
    <div className="chart chart-surface">
      <ResponsiveContainer width="100%" height="100%" minHeight={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 78, left: 4, bottom: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={(v) =>
              spec.percent ? `${v}%` : spec.money ? formatCurrencyCompact(v) : Number(v).toLocaleString()
            }
          />
          <YAxis type="category" dataKey="name" width={104} tickLine={false} axisLine={false} tick={axisTick} />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<OsTooltip t={t} />} />
          <Bar dataKey={spec.key} radius={[0, 7, 7, 0]} barSize={20}>
            {data.map((row) => (
              <Cell
                key={row.name}
                // Volume without revenue is the thing to notice, so it is the
                // thing that changes colour.
                fill={(row.revenue || 0) > 0 ? "var(--green)" : "var(--orange)"}
                fillOpacity={0.72}
              />
            ))}
            <LabelList
              dataKey={spec.key}
              position="right"
              offset={8}
              formatter={fmt}
              style={{ fill: "#c9cdd5", fontSize: 11, fontVariantNumeric: "tabular-nums" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── OS version concentration ──────────────────────────────────────────────
// Version spread decides whether a targeting cutoff is safe: if 92% of traffic
// is on one version, excluding the tail costs nothing.
export const OsVersions = ({ rows, t = (x) => x, limit = 8 }) => {
  const data = React.useMemo(() => {
    const sorted = [...rows].filter((r) => (r.clicks || 0) > 0).sort((a, b) => b.clicks - a.clicks);
    const head = sorted.slice(0, limit);
    const tail = sorted.slice(limit);
    if (tail.length) {
      head.push({
        label: `${t("other")} (${tail.length})`,
        clicks: tail.reduce((acc, r) => acc + (r.clicks || 0), 0),
        ftds: tail.reduce((acc, r) => acc + (r.ftds || 0), 0),
        revenue: tail.reduce((acc, r) => acc + (r.revenue || 0), 0),
        isTail: true,
      });
    }
    return head;
  }, [rows, limit, t]);
  if (!data.length) return <div className="empty-state">{t("No version data available.")}</div>;

  const total = data.reduce((acc, row) => acc + (row.clicks || 0), 0);

  return (
    <ul className="dv-versions">
      {data.map((row) => {
        const pct = total > 0 ? ((row.clicks || 0) / total) * 100 : 0;
        return (
          <li key={row.label} className={row.isTail ? "is-tail" : ""}>
            <span className="dv-version-label" title={row.label}>{row.label}</span>
            <span className="dv-version-track">
              <span style={{ width: `${Math.max(pct, 0.8)}%` }} />
            </span>
            <span className="dv-version-pct">{pct >= 1 ? pct.toFixed(0) : pct.toFixed(1)}%</span>
            <span className="dv-version-clicks">{(row.clicks || 0).toLocaleString()}</span>
            <span className="dv-version-ftds">
              {(row.ftds || 0) > 0 ? `${row.ftds} ${t("FTD")}` : "—"}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
