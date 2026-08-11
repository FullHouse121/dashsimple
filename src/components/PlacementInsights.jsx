import React from "react";
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
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

// Keitaro leaves the raw macro in place when a network sends no placement, and
// occasionally a click id lands in the field. Both are data faults rather than
// placements, and averaging them into "best converting" is how a 1-click row
// wins the leaderboard.
export const UNRESOLVED_PLACEMENT = /^\{*\s*(placement|sub_?id_?1|sub_?1)\s*\}*$/i;

// Label for rows whose placement is empty. They are aggregated under this name
// rather than discarded, so the traffic stays in the totals and shows up as a
// tracking gap instead of quietly vanishing.
export const UNATTRIBUTED_PLACEMENT = "(no placement)";

export const classifyPlacement = (name, clicks = 0) => {
  const raw = String(name || "").trim();
  if (!raw || raw === UNATTRIBUTED_PLACEMENT) return "unattributed";
  if (UNRESOLVED_PLACEMENT.test(raw)) return "macro";
  // A long token with no spaces and mixed case is a click id, not a placement.
  if (/^[A-Za-z0-9_-]{16,}$/.test(raw) && /[a-z]/.test(raw) && /[A-Z]/.test(raw)) return "junk";
  if (clicks > 0 && clicks < 3 && !/[ _]/.test(raw)) return "junk";
  return "ok";
};

export const summarisePlacements = (rows) => {
  const ok = [];
  const problems = [];
  let unattributedClicks = 0;
  let unattributedRevenue = 0;
  rows.forEach((row) => {
    const kind = classifyPlacement(row.placement, row.clicks);
    if (kind === "unattributed") {
      unattributedClicks += row.clicks || 0;
      unattributedRevenue += row.revenue || 0;
      return;
    }
    if (kind === "ok") ok.push(row);
    else problems.push({ ...row, kind });
  });
  const totalClicks = rows.reduce((acc, row) => acc + (row.clicks || 0), 0);
  return {
    ok,
    problems,
    unattributedClicks,
    unattributedRevenue,
    unattributedShare: totalClicks > 0 ? (unattributedClicks / totalClicks) * 100 : 0,
    totalClicks,
  };
};

// Ratios computed on a handful of events are noise, and sorting by them puts
// the smallest sample on top every time. Anything under the floor is still
// shown, but never ranked as "best".
export const MIN_SAMPLE = 100;
export const bestBy = (rows, key, { minClicks = MIN_SAMPLE } = {}) => {
  const eligible = rows.filter((row) => (row.clicks || 0) >= minClicks);
  const pool = eligible.length ? eligible : rows;
  return [...pool].sort((a, b) => (b[key] || 0) - (a[key] || 0))[0] || null;
};

// ── data quality ──────────────────────────────────────────────────────────
export const PlacementQuality = ({ summary, t = (x) => x }) => {
  const { unattributedClicks, unattributedShare, unattributedRevenue, problems } = summary;
  if (!unattributedClicks && !problems.length) return null;
  return (
    <div className="pl-quality">
      {unattributedClicks > 0 ? (
        <div className="pl-quality-item">
          <span className="pl-quality-value">{unattributedClicks.toLocaleString()}</span>
          <span className="pl-quality-label">
            {t("clicks carry no placement")}
            <em>
              {` ${unattributedShare.toFixed(0)}% ${t("of traffic")}`}
              {unattributedRevenue > 0 ? ` · ${formatCurrency(unattributedRevenue)} ${t("revenue")}` : ""}
            </em>
          </span>
        </div>
      ) : null}
      {problems.length ? (
        <div className="pl-quality-item">
          <span className="pl-quality-value">{problems.length}</span>
          <span className="pl-quality-label">
            {t("broken placement values")}
            <em>{` ${problems.slice(0, 3).map((p) => p.placement).join(", ")}${problems.length > 3 ? "…" : ""}`}</em>
          </span>
        </div>
      ) : null}
    </div>
  );
};

// ── volume vs efficiency ──────────────────────────────────────────────────
// The buying question is not "which placement is biggest" or "which converts
// best" but where those two disagree: high volume and low EPC is where money
// leaks, low volume and high EPC is where it should go next.
const MatrixTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="pl-tip">
      <p className="pl-tip-name">{row.placement}</p>
      <dl className="pl-tip-grid">
        <dt>{t("Clicks")}</dt><dd>{row.clicks.toLocaleString()}</dd>
        <dt>{t("Revenue")}</dt><dd>{formatCurrency(row.revenue)}</dd>
        <dt>{t("EPC")}</dt><dd>{formatCurrency(row.epc)}</dd>
        <dt>{t("Registers")}</dt><dd>{row.registers.toLocaleString()}</dd>
        <dt>{t("FTDs")}</dt><dd>{row.ftds.toLocaleString()}</dd>
        {row.spend > 0 ? (<><dt>{t("Spend")}</dt><dd>{formatCurrency(row.spend)}</dd></>) : null}
        {row.roas !== null ? (<><dt>{t("ROAS")}</dt><dd>{row.roas.toFixed(2)}x</dd></>) : null}
      </dl>
    </div>
  );
};

export const MATRIX_MIN_CLICKS = 10;

export const PlacementMatrix = ({ rows, t = (x) => x, onSelect }) => {
  // Below this the point carries no information — a 1-click placement plots at
  // EPC 0 or at some wild value, and a dozen of them pile up on the y axis and
  // crowd out the placements worth reading.
  const data = rows.filter((row) => (row.clicks || 0) >= MATRIX_MIN_CLICKS);
  const hidden = rows.length - data.length;
  if (!data.length) return <div className="empty-state">{t("No placement data available.")}</div>;

  const avgEpc =
    data.reduce((acc, row) => acc + (row.revenue || 0), 0) /
    Math.max(data.reduce((acc, row) => acc + (row.clicks || 0), 0), 1);
  const maxRevenue = Math.max(...data.map((row) => row.revenue || 0), 1);

  return (
    <>
      <div className="chart chart-surface">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <ScatterChart margin={{ top: 16, right: 24, left: 8, bottom: 28 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis
              type="number"
              dataKey="clicks"
              name={t("Clicks")}
              scale="log"
              domain={["dataMin", "dataMax"]}
              allowDataOverflow
              ticks={[10, 100, 1000, 10000]}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
              label={{ value: t("Clicks (log)"), position: "insideBottom", offset: -14, fill: "#6b7079", fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="epc"
              name={t("EPC")}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={(v) => formatCurrencyCompact(v)}
              label={{ value: t("Revenue per click"), angle: -90, position: "insideLeft", fill: "#6b7079", fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="revenue" range={[60, 900]} domain={[0, maxRevenue]} />
            {/* Average EPC: everything below this line earns less per click than
                the account as a whole. */}
            <ReferenceLine
              y={avgEpc}
              stroke="rgba(255,255,255,0.22)"
              strokeDasharray="4 4"
              label={{
                value: `${t("account average")} ${formatCurrency(avgEpc)}`,
                fill: "#8b8f98",
                fontSize: 10,
                position: "insideTopLeft",
              }}
            />
            <Tooltip content={<MatrixTooltip t={t} />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.2)" }} />
            <Scatter data={data} cursor="pointer" onClick={(entry) => onSelect?.(entry?.placement || entry?.payload?.placement)}>
              {data.map((row) => (
                <Cell
                  key={row.placement}
                  fill={row.epc >= avgEpc ? "var(--green)" : "var(--orange)"}
                  fillOpacity={0.62}
                  stroke={row.epc >= avgEpc ? "var(--green)" : "var(--orange)"}
                  strokeOpacity={0.9}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="pl-legend">
        <span className="pl-legend-item"><span className="pl-legend-dot" style={{ background: "var(--green)" }} />{t("Above average EPC")}</span>
        <span className="pl-legend-item"><span className="pl-legend-dot" style={{ background: "var(--orange)" }} />{t("Below average")}</span>
        <span className="pl-legend-note">
          {t("Bubble size is revenue; clicks on a log scale.")}
          {hidden > 0 ? ` ${hidden} ${t("placements under")} ${MATRIX_MIN_CLICKS} ${t("clicks hidden.")}` : ""}
        </span>
      </div>
    </>
  );
};

// ── funnel comparison ─────────────────────────────────────────────────────
// Replaces a line chart that ran across placement names: a smooth curve between
// "Facebook Mobile Feed" and "Instagram Feed" implies a progression that does
// not exist, and one 200% redeposit ratio flattened every other series to zero.
export const PlacementFunnel = ({ rows, t = (x) => x, metric = "clickToReg" }) => {
  const data = React.useMemo(
    () =>
      [...rows]
        .filter((row) => (row.clicks || 0) >= 10)
        .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
        .slice(0, 10),
    [rows, metric]
  );
  if (!data.length) return <div className="empty-state">{t("Not enough traffic to compare.")}</div>;

  const label = {
    clickToReg: t("Click → register"),
    regToFtd: t("Register → FTD"),
    ftdToRedeposit: t("FTD → redeposit"),
  }[metric];

  return (
    <div className="chart chart-surface">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 64, left: 4, bottom: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="placement"
            width={148}
            tickLine={false}
            axisLine={false}
            tick={{ ...axisTick, fontSize: 10.5 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={tooltipSurface}
            formatter={(value, _n, item) => [
              `${Number(value).toFixed(1)}%  (${(item?.payload?.clicks || 0).toLocaleString()} ${t("clicks")})`,
              label,
            ]}
          />
          <Bar dataKey={metric} radius={[0, 7, 7, 0]} barSize={18} fill="var(--teal)">
            <LabelList
              dataKey={metric}
              position="right"
              offset={8}
              formatter={(v) => `${Number(v).toFixed(1)}%`}
              style={{ fill: "#c9cdd5", fontSize: 11, fontVariantNumeric: "tabular-nums" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── revenue contribution ──────────────────────────────────────────────────
export const PlacementRevenue = ({ rows, t = (x) => x }) => {
  const data = React.useMemo(
    () => [...rows].filter((r) => (r.revenue || 0) > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 9),
    [rows]
  );
  if (!data.length) return <div className="empty-state">{t("No revenue in this period.")}</div>;
  const total = rows.reduce((acc, row) => acc + (row.revenue || 0), 0);

  return (
    <div className="chart chart-surface">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 76, left: 4, bottom: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} tickFormatter={formatCurrencyCompact} />
          <YAxis type="category" dataKey="placement" width={148} tickLine={false} axisLine={false} tick={{ ...axisTick, fontSize: 10.5 }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={tooltipSurface}
            formatter={(value) => [
              `${formatCurrency(value)} · ${total > 0 ? ((value / total) * 100).toFixed(0) : 0}% ${t("of revenue")}`,
              t("Revenue"),
            ]}
          />
          <Bar dataKey="revenue" radius={[0, 7, 7, 0]} barSize={18} fill="var(--green)" fillOpacity={0.75}>
            <LabelList
              dataKey="revenue"
              position="right"
              offset={8}
              formatter={(v) => formatCurrency(v)}
              style={{ fill: "#c9cdd5", fontSize: 11, fontVariantNumeric: "tabular-nums" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
