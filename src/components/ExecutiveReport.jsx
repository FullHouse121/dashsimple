// The executive report.
//
// One component renders it in three places — the Reports tab, the printed PDF,
// and the public share link — because a report that looks different depending
// on how it was opened is three reports to keep true instead of one. The
// print rules live in styles.css against these same class names rather than in
// a separate layout.
//
// Written for someone deciding where money goes, which shapes what is here:
// every headline number carries the previous period beside it, the funnel
// shows the rate between steps rather than four counts, and the data caveat is
// at the top rather than in a footnote — a manager who reads an ROI figure
// without knowing the cost pipeline is down has been misled by us.
import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { CountryFlag } from "./flags.jsx";
import { BrandMark } from "./BrandMark.jsx";
import { formatCurrency, formatCurrencyWhole, formatPercent } from "../lib/format.js";
import { axisTickStyle, tooltipStyle, tooltipItemStyle, tooltipLabelStyle } from "../lib/format.js";

const int = (v) => Number(v || 0).toLocaleString();

// A delta is only meaningful against a period that had something in it.
const Delta = ({ value }) => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className="xr-delta is-none">no prior period</span>;
  }
  const up = value >= 0;
  return (
    <span className={`xr-delta${up ? " is-up" : " is-down"}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
};

export default function ExecutiveReport({ report }) {
  if (!report) return null;
  const { summary, period, trend, buyers, countries, brands, tools, funnel, integrity, highlights } = report;
  // One accent per series, reused across every chart so a colour means the
  // same thing on page three as it did on page one.
  const BRAND_COLOURS = ["#36d07c", "#64b8ff", "#a15bff", "#f7c625", "#ff9357", "#ff7d88"];
  const money = integrity?.costTrustworthy;

  return (
    <article className="xr">
      <header className="xr-head">
        <div>
          <h1 className="xr-title">{report.title || "Performance report"}</h1>
          <p className="xr-period">
            {period.from} → {period.to} · {period.days} days
            <span className="xr-vs">vs {period.previousFrom} → {period.previousTo}</span>
          </p>
        </div>
        <div className="xr-generated">
          Generated {new Date(report.generatedAt).toLocaleString()}
        </div>
      </header>

      {/* Above the numbers, not below them. Someone who reads an ROI figure
          without knowing the cost pipeline is down has been misled. */}
      {integrity?.note ? (
        <div className="xr-caveat">
          <strong>Read cost figures with care.</strong> {integrity.note}
        </div>
      ) : null}

      {/* What the tables would tell you if you read all of them. Stated as
          observations, not advice — the numbers support the first. */}
      {highlights?.length ? (
        <section className="xr-story">
          {highlights.map((h) => (
            <p key={h.text} className={`xr-story-line is-${h.tone}`}>
              <span className="xr-story-mark" aria-hidden="true" />
              {h.text}
            </p>
          ))}
        </section>
      ) : null}

      <section className="xr-grid">
        {[
          { label: "Clicks", value: int(summary.clicks), delta: summary.deltas.clicks },
          { label: "Registrations", value: int(summary.registers), delta: summary.deltas.registers },
          { label: "First deposits", value: int(summary.ftds), delta: summary.deltas.ftds },
          { label: "Revenue", value: formatCurrencyWhole(summary.revenue), delta: summary.deltas.revenue },
        ].map((card) => (
          <div key={card.label} className="xr-card">
            <span className="xr-card-label">{card.label}</span>
            <strong className="xr-card-value">{card.value}</strong>
            <Delta value={card.delta} />
          </div>
        ))}
      </section>

      {/* Cost-derived figures are separated from the counts above, and say so
          when they cannot be trusted, rather than sitting alongside numbers
          that can. */}
      <section className="xr-grid xr-grid-money">
        {[
          { label: "Spend", value: formatCurrencyWhole(summary.spend) },
          {
            label: "ROI",
            value: summary.roi === null ? "—" : `${summary.roi.toFixed(1)}%`,
          },
          {
            label: "Cost per FTD",
            value: summary.ftds > 0 && summary.spend > 0 ? formatCurrency(summary.spend / summary.ftds) : "—",
          },
          {
            label: "Revenue per FTD",
            value: summary.ftds > 0 ? formatCurrency(summary.revenue / summary.ftds) : "—",
          },
        ].map((card) => (
          <div key={card.label} className={`xr-card${money ? "" : " is-unverified"}`}>
            <span className="xr-card-label">{card.label}</span>
            <strong className="xr-card-value">{card.value}</strong>
            {money ? null : <span className="xr-unverified">unverified cost</span>}
          </div>
        ))}
      </section>

      <section className="xr-block">
        <h2 className="xr-h2">Performance over time</h2>
        <div className="xr-chart">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="xrClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64b8ff" stopOpacity={0.34} />
                  <stop offset="100%" stopColor="#64b8ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="xrFtds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#36d07c" stopOpacity={0.42} />
                  <stop offset="100%" stopColor="#36d07c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={axisTickStyle} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis yAxisId="l" tick={axisTickStyle} tickLine={false} axisLine={false} width={48} />
              <YAxis yAxisId="r" orientation="right" tick={axisTickStyle} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="l" type="monotone" dataKey="clicks" name="Clicks" stroke="#64b8ff" fill="url(#xrClicks)" strokeWidth={2} />
              <Area yAxisId="r" type="monotone" dataKey="ftds" name="FTDs" stroke="#36d07c" fill="url(#xrFtds)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Two questions a table answers slowly: how the money splits across
          brands, and whether the team converts evenly. Both are shape
          questions, which is what a chart is for. */}
      <section className="xr-two">
        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">Revenue by brand</h2>
          <div className="xr-chart">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={brands} dataKey="revenue" nameKey="brand"
                  innerRadius={52} outerRadius={82} paddingAngle={2} stroke="none"
                >
                  {brands.map((entry, i) => (
                    <Cell key={entry.brand} fill={BRAND_COLOURS[i % BRAND_COLOURS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}
                  formatter={(v, n) => [formatCurrencyWhole(v), n]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">Registration → deposit by buyer</h2>
          <div className="xr-chart">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={buyers.filter((b) => b.reg2dep !== null).slice(0, 8)}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="buyer" tick={{ ...axisTickStyle, fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={54} />
                <YAxis tick={axisTickStyle} tickLine={false} axisLine={false} width={40} unit="%" />
                <Tooltip
                  contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, "Reg→Dep"]}
                />
                <Bar dataKey="reg2dep" radius={[4, 4, 0, 0]}>
                  {buyers.filter((b) => b.reg2dep !== null).slice(0, 8).map((entry, i) => (
                    <Cell key={entry.buyer} fill={BRAND_COLOURS[i % BRAND_COLOURS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* The funnel as rates, not four counts side by side: where people are
          lost is the question, and only the rate between steps answers it. */}
      <section className="xr-block">
        <h2 className="xr-h2">Where the funnel loses people</h2>
        <div className="xr-funnel">
          {funnel.map((step, i) => {
            const top = funnel[0]?.value || 0;
            const width = top > 0 ? Math.max((step.value / top) * 100, 1.5) : 0;
            return (
              <div key={step.key} className="xr-funnel-row">
                <span className="xr-funnel-label">{step.label}</span>
                <span className="xr-funnel-track">
                  <span className="xr-funnel-fill" style={{ width: `${width}%` }} />
                </span>
                <span className="xr-funnel-value">{int(step.value)}</span>
                <span className="xr-funnel-rate">
                  {i === 0
                    ? "—"
                    : step.perPrev !== null && step.perPrev !== undefined
                      // A multiplier, not a percentage — redeposits are not a
                      // subset of deposits, so "125%" would be meaningless.
                      ? `×${step.perPrev.toFixed(2)} per FTD`
                      : step.rateFromPrev === null
                        ? "—"
                        : formatPercent(step.rateFromPrev, 2)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="xr-block xr-avoid-break">
        <h2 className="xr-h2">By buyer</h2>
        <table className="xr-table">
          <thead>
            <tr>
              <th>Buyer</th><th>Clicks</th><th>Registrations</th><th>FTDs</th>
              <th>Reg→Dep</th><th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((row) => (
              <tr key={row.buyer}>
                <td className="xr-strong">{row.buyer}</td>
                <td>{int(row.clicks)}</td>
                <td>{int(row.registers)}</td>
                <td className="xr-strong">{int(row.ftds)}</td>
                <td>{row.reg2dep === null ? "—" : formatPercent(row.reg2dep, 1)}</td>
                <td>{formatCurrencyWhole(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="xr-two">
        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">By country</h2>
          <table className="xr-table">
            <thead><tr><th>Country</th><th>Clicks</th><th>FTDs</th><th>Revenue</th></tr></thead>
            <tbody>
              {countries.map((row) => (
                <tr key={row.country}>
                  <td className="xr-strong">
                    <span className="xr-cell-mark">
                      <CountryFlag value={row.country} />
                      {row.country}
                    </span>
                  </td>
                  <td>{int(row.clicks)}</td>
                  <td>{int(row.ftds)}</td>
                  <td>{formatCurrencyWhole(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">By tool</h2>
          <table className="xr-table">
            <thead><tr><th>Tool</th><th>Clicks</th><th>FTDs</th><th>Reg→Dep</th></tr></thead>
            <tbody>
              {(tools || []).map((row) => (
                <tr key={row.tool}>
                  <td className="xr-strong">
                    <span className="xr-cell-mark"><BrandMark value={row.tool} height={13} /></span>
                  </td>
                  <td>{int(row.clicks)}</td>
                  <td>{int(row.ftds)}</td>
                  <td>{row.reg2dep === null ? "—" : formatPercent(row.reg2dep, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">By brand</h2>
          <table className="xr-table">
            <thead><tr><th>Brand</th><th>FTDs</th><th>Revenue</th></tr></thead>
            <tbody>
              {brands.map((row) => (
                <tr key={row.brand}>
                  <td className="xr-strong">
                    <span className="xr-cell-mark"><BrandMark value={row.brand} height={14} /></span>
                  </td>
                  <td>{int(row.ftds)}</td>
                  <td>{formatCurrencyWhole(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="xr-foot">
        DeusMachine · {period.from} → {period.to}
        {report.expiresAt ? ` · link expires ${new Date(report.expiresAt).toLocaleDateString()}` : ""}
      </footer>
    </article>
  );
}
