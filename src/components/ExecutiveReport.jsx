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
import { Coins, ShieldCheck, Fingerprint, Trophy, MapPin, Crown } from "lucide-react";
import { formatCurrency, formatCurrencyWhole, formatPercent } from "../lib/format.js";
import { axisTickStyle, tooltipStyle, tooltipItemStyle, tooltipLabelStyle } from "../lib/format.js";

const int = (v) => Number(v || 0).toLocaleString();

// A tinted bar behind the row, sized to its share of the column's largest
// value. A table of numbers hides which rows dominate; this shows it without
// spending a column on it.
const ShareCell = ({ value, max, children, tone = "green" }) => {
  const pct = max > 0 ? Math.max((value / max) * 100, 1.5) : 0;
  return (
    <span className="xr-share">
      <span className={`xr-share-bar is-${tone}`} style={{ width: `${pct}%` }} aria-hidden="true" />
      <span className="xr-share-text">{children}</span>
    </span>
  );
};

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
  const { placements, campaigns, topPlayers, quality, growth, uniqueByBuyer } = report;
  const { devices, marketValue } = report;
  // Unique clicks are the honest denominator: one person reloading five times
  // is one person, and every rate built on raw clicks flatters itself.
  const uniqueClicks = quality?.unique ?? null;
  // One accent per series, reused across every chart so a colour means the
  // same thing on page three as it did on page one.
  const BRAND_COLOURS = ["#36d07c", "#64b8ff", "#a15bff", "#f7c625", "#ff9357", "#ff7d88"];
  const money = integrity?.costTrustworthy;
  // One canonical order for people, and one colour per person derived from
  // it. Sorted in the report rather than upstream: the API's order is right
  // for other consumers, but a rank has to agree with the bar beside it.
  const rankedBuyers = [...(buyers || [])].sort((a, b) => b.revenue - a.revenue);
  const earningCountries = [...(countries || [])]
    .filter((c) => c.ftds > 0 || c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);
  const silentCountries = (countries || []).length - earningCountries.length;
  const buyerColour = new Map(rankedBuyers.map((b, i) => [b.buyer, BRAND_COLOURS[i % BRAND_COLOURS.length]]));

  const verdict = (() => {
    const g = Object.fromEntries((growth || []).map((r) => [r.key, r]));
    const rev = g.revenue?.delta;
    const arpu = g.arpu?.delta;
    if (rev === null || rev === undefined) return { tone: "flat", line: "Period under review" };
    if (rev >= 10 && (arpu ?? 0) >= 0) return { tone: "good", line: "Growing, and growing better" };
    if (rev >= 10) return { tone: "warn", line: "Growing on volume, not on quality" };
    if (rev <= -10 && (arpu ?? 0) <= 0) return { tone: "bad", line: "Down on both volume and quality" };
    if (rev <= -10) return { tone: "bad", line: "Revenue down on the previous period" };
    return { tone: "flat", line: "Broadly flat on the previous period" };
  })();

  return (
    <article className="xr">
      {/* Cover. Print-only: on screen the controls above already frame the
          report, but a PDF that opens straight into a KPI grid reads like a
          screenshot rather than a document someone prepared. It carries the
          one-line verdict, the period, and the four figures a manager checks
          before reading anything else. */}
      <section className="xr-cover">
        <div className="xr-cover-top">
          <span className="xr-cover-brand">DEUS<em>MACHINE</em></span>
          <span className="xr-cover-kind">Performance report</span>
        </div>
        <div className="xr-cover-mid">
          <span className={`xr-cover-verdict is-${verdict.tone}`}>{verdict.line}</span>
          <h1 className="xr-cover-title">{report.title || "Performance report"}</h1>
          <p className="xr-cover-period">
            {period.from} → {period.to}
            <em>{period.days} days · measured against {period.previousFrom} → {period.previousTo}</em>
          </p>
        </div>
        <div className="xr-cover-figures">
          {[
            { label: "Revenue", value: formatCurrencyWhole(summary.revenue), delta: summary.deltas.revenue },
            { label: "First deposits", value: int(summary.ftds), delta: summary.deltas.ftds },
            { label: "Registrations", value: int(summary.registers), delta: summary.deltas.registers },
            { label: "Unique clicks", value: uniqueClicks === null ? int(summary.clicks) : int(uniqueClicks), delta: summary.deltas.clicks },
          ].map((f) => (
            <div key={f.label} className="xr-cover-fig">
              <span>{f.label}</span>
              <strong>{f.value}</strong>
              <Delta value={f.delta} />
            </div>
          ))}
        </div>
        {integrity?.note ? (
          <p className="xr-cover-caveat">{integrity.note}</p>
        ) : null}
        <div className="xr-cover-foot">
          <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
          <span>Confidential — internal performance data</span>
        </div>
      </section>

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

      {/* Did the business grow, and did it grow because traffic got bigger or
          because it got better? The first four answer volume, ARPU and LTV
          answer quality — and a period where volume rose while both fell is
          the one worth catching. */}
      {growth?.length ? (
        <section className="xr-growth">
          <h2 className="xr-h2">Market growth vs previous period</h2>
          <div className="xr-growth-grid">
            {growth.map((row) => {
              const show = (v) =>
                v === null || v === undefined
                  ? "—"
                  : row.format === "money"
                    ? formatCurrencyWhole(v)
                    : row.format === "money4"
                      ? `$${Number(v).toFixed(2)}`
                      : int(v);
              const up = row.delta !== null && row.delta >= 0;
              return (
                <div key={row.key} className={`xr-growth-cell${row.delta === null ? "" : up ? " is-up" : " is-down"}`}>
                  <span className="xr-growth-label">{row.label}</span>
                  <strong className="xr-growth-value">{show(row.value)}</strong>
                  <span className="xr-growth-foot">
                    <Delta value={row.delta} />
                    <em>was {show(row.previous)}</em>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="xr-grid">
        {[
          {
            label: "Unique clicks",
            value: uniqueClicks === null ? int(summary.clicks) : int(uniqueClicks),
            delta: summary.deltas.clicks,
          },
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

      {/* Traffic quality and EPC sit together because they answer the same
          question from two sides: was this traffic real, and was it worth
          anything. EPC leads because it survives a broken cost pipeline —
          it divides by clicks, not by spend. */}
      <section className="xr-bento">
        <div className="xr-tile xr-tile-wide">
          <div className="xr-tile-head">
            <span className="xr-tile-icon is-green"><Coins size={14} /></span>
            <span className="xr-tile-label">Earnings per click</span>
          </div>
          <div className="xr-tile-body">
            <strong className="xr-tile-value is-green">
              {summary.epc === null ? "—" : `$${summary.epc.toFixed(4)}`}
            </strong>
            {summary.epcPrev ? (
              <Delta value={((summary.epc - summary.epcPrev) / summary.epcPrev) * 100} />
            ) : null}
          </div>
          <p className="xr-tile-note">
            {summary.epc === null
              ? "No click data for this period."
              : `${formatCurrencyWhole(summary.revenue)} ÷ ${int(summary.clicks)} tracked clicks — every 1,000 returns about $${(summary.epc * 1000).toFixed(0)}.`}
          </p>

          {/* This period against the last, at one scale. The longer bar is the
              better rate, before the percentage is read. */}
          {summary.epc !== null && summary.epcPrev ? (
            <div className="xr-compare">
              {[
                { label: "This period", v: summary.epc, tone: "is-green" },
                { label: "Previous", v: summary.epcPrev, tone: "is-muted" },
              ].map((r) => (
                <span className="xr-compare-row" key={r.label}>
                  <span className="xr-compare-label">{r.label}</span>
                  <span className="xr-compare-track">
                    <span
                      className={`xr-compare-fill ${r.tone}`}
                      style={{ width: `${Math.max((r.v / Math.max(summary.epc, summary.epcPrev)) * 100, 2)}%` }}
                    />
                  </span>
                  <span className="xr-compare-value">${r.v.toFixed(4)}</span>
                </span>
              ))}
            </div>
          ) : null}

          {/* The figures the rate divides, so the working is on the tile. */}
          <div className="xr-tile-foot">
            <span><em>{formatCurrencyWhole(summary.revenue)}</em>revenue</span>
            <span><em>{int(summary.clicks)}</em>tracked clicks</span>
            <span><em>{summary.epcPrev ? `$${summary.epcPrev.toFixed(4)}` : "—"}</em>was</span>
          </div>
        </div>

        {quality ? (
          <>
            <div className="xr-tile xr-tile-gauge">
              <div className="xr-tile-head">
                <span className="xr-tile-icon is-blue"><ShieldCheck size={14} /></span>
                <span className="xr-tile-label">Clean traffic</span>
              </div>
              {/* A closed ring, not a half dial: it shows the composition
                  rather than one rate, and the figure sits in the hole
                  instead of being crowded under an arc. */}
              <div className="xr-ring">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Real", value: Math.max(0, quality.clicks - quality.bots - quality.proxies) },
                        { name: "Bots", value: quality.bots },
                        { name: "Proxies", value: quality.proxies },
                      ]}
                      dataKey="value" nameKey="name"
                      innerRadius="70%" outerRadius="100%"
                      paddingAngle={2} cornerRadius={3} stroke="none"
                      startAngle={90} endAngle={-270}
                    >
                      {["#36d07c", "#ff7d88", "#f7c625"].map((c) => <Cell key={c} fill={c} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}
                      formatter={(v, n) => [Number(v).toLocaleString(), n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="xr-ring-centre">
                  <strong>{(quality.cleanRate || 0).toFixed(1)}%</strong>
                  <span>clean</span>
                </div>
              </div>
              {/* The parts, not a sentence: a manager who sees 98.3% will
                  next ask what the other 1.7% was. */}
              <ul className="xr-legend">
                {[
                  { label: "Real", value: quality.clicks - quality.bots - quality.proxies, colour: "#36d07c" },
                  { label: "Bots", value: quality.bots, colour: "#ff7d88" },
                  { label: "Proxies", value: quality.proxies, colour: "#f7c625" },
                ].map((r) => (
                  <li key={r.label}>
                    <span className="xr-legend-dot" style={{ background: r.colour }} />
                    <span className="xr-legend-name">{r.label}</span>
                    <span className="xr-legend-value">{r.value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="xr-tile">
              <div className="xr-tile-head">
                <span className="xr-tile-icon is-purple"><Fingerprint size={14} /></span>
                <span className="xr-tile-label">Unique clicks</span>
              </div>
              <div className="xr-tile-body">
                <strong className="xr-tile-value is-purple">{(quality.uniqueRate || 0).toFixed(1)}%</strong>
              </div>
              <p className="xr-tile-note">
                {quality.unique.toLocaleString()} of {quality.clicks.toLocaleString()} clicks
              </p>
              <div className="xr-split-bar">
                <span style={{ width: `${Math.max(0, Math.min(100, quality.uniqueRate || 0))}%` }} />
              </div>
              <ul className="xr-legend">
                {[
                  { label: "Unique visitors", value: quality.unique, colour: "#a15bff" },
                  { label: "Return visits", value: Math.max(0, quality.clicks - quality.unique), colour: "rgba(255,255,255,0.22)" },
                ].map((r) => (
                  <li key={r.label}>
                    <span className="xr-legend-dot" style={{ background: r.colour }} />
                    <span className="xr-legend-name">{r.label}</span>
                    <span className="xr-legend-value">{r.value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </section>

      {/* Which device paid. The one dimension in this report a buyer can act
          on the same afternoon, and it has never appeared here. device_stats
          only sees the traffic Keitaro could fingerprint, so the section
          states its own coverage rather than letting a reader subtract these
          totals from the ones above and find them short. */}
      {devices?.rows?.length ? (
        <section className="xr-block xr-avoid-break">
          <h2 className="xr-h2">Which device paid</h2>
          <p className="xr-h2-note">
            {devices.coverage !== null
              ? `Platform and OS, for the ${formatPercent(devices.coverage, 1)} of clicks the tracker could fingerprint — a subset, so these totals sit below the ones above.`
              : "Platform and OS for the traffic the tracker could fingerprint."}
          </p>
          <table className="xr-table">
            <thead>
              <tr><th>Platform</th><th>Clicks</th><th>FTDs</th><th>Reg→Dep</th><th>Per FTD</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {devices.rows.filter((r) => r.clicks > 0).slice(0, 7).map((row, i) => {
                const max = Math.max(...devices.rows.map((r) => r.revenue), 0);
                return (
                  <tr key={`${row.device}-${row.os}`}>
                    <td className="xr-strong">
                      <span className="xr-cell-mark">
                        <span className="xr-legend-dot" style={{ background: BRAND_COLOURS[i % BRAND_COLOURS.length] }} />
                        {row.device} · {row.os}
                      </span>
                    </td>
                    <td>{int(row.clicks)}</td>
                    <td>{int(row.ftds)}</td>
                    <td>{row.reg2dep === null ? "—" : formatPercent(row.reg2dep, 1)}</td>
                    {/* Two platforms can convert alike and be worth twice as
                        much per depositor; this is the column that decides
                        where the next dollar goes. */}
                    <td className="xr-strong">{row.revenuePerFtd === null ? "—" : formatCurrency(row.revenuePerFtd)}</td>
                    <td className="xr-share-td">
                      <ShareCell value={row.revenue} max={max} tone="green">
                        {formatCurrencyWhole(row.revenue)}
                      </ShareCell>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}

      {/* What the deposits are worth at the rate card, against what the
          tracker booked. The only money comparison in this report that does
          not pass through the Meta pipeline — which is exactly why it earns a
          place while that pipeline is down. */}
      {marketValue?.rows?.length ? (
        <section className="xr-block xr-avoid-break">
          <h2 className="xr-h2">What these deposits are worth</h2>
          <p className="xr-h2-note">
            The CPA rate card against what the tracker booked. A gap is a question, not a loss — a stale rate on file, a
            revenue-share deal counted as CPA, or deposits not yet approved would each produce one.
            {marketValue.unpriced > 0
              ? ` ${marketValue.unpriced} market${marketValue.unpriced === 1 ? "" : "s"} with deposits have no rate on file and are excluded.`
              : ""}
          </p>
          <div className="xr-value-band">
            <span className="xr-value-cell">
              <em style={{ color: "var(--yellow)" }}>{formatCurrencyWhole(marketValue.expected)}</em>
              expected at rate card
            </span>
            <span className="xr-value-cell">
              <em style={{ color: "var(--green)" }}>{formatCurrencyWhole(marketValue.booked)}</em>
              booked by the tracker
            </span>
          </div>
          <table className="xr-table">
            <thead><tr><th>Market</th><th>CPA</th><th>FTDs</th><th>Expected</th><th>Booked</th></tr></thead>
            <tbody>
              {marketValue.rows.slice(0, 8).map((row) => {
                const max = Math.max(...marketValue.rows.map((r) => r.expected), 0);
                return (
                  <tr key={row.country}>
                    <td className="xr-strong">
                      <span className="xr-cell-mark"><CountryFlag value={row.country} />{row.country}</span>
                    </td>
                    <td>${row.cpa}</td>
                    <td>{int(row.ftds)}</td>
                    <td style={{ color: "var(--yellow)" }}>{formatCurrencyWhole(row.expected)}</td>
                    <td className="xr-share-td">
                      <ShareCell value={row.booked} max={max} tone="green">
                        {formatCurrencyWhole(row.booked)}
                      </ShareCell>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}

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
          {/* A ring with the total in its hole, and a legend that carries the
              numbers. Coloured words under a donut make you look twice — once
              to match the colour, again to find the value — so the legend
              states the amount and the share itself. */}
          <div className="xr-donut">
            <div className="xr-donut-chart">
              <ResponsiveContainer width="100%" height={188}>
                <PieChart>
                  <Pie
                    data={brands} dataKey="revenue" nameKey="brand"
                    innerRadius={62} outerRadius={88} paddingAngle={2}
                    stroke="none" cornerRadius={4}
                  >
                    {brands.map((entry, i) => (
                      <Cell key={entry.brand} fill={BRAND_COLOURS[i % BRAND_COLOURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}
                    formatter={(v, n) => [formatCurrencyWhole(v), n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="xr-donut-centre">
                <strong>{formatCurrencyWhole(brands.reduce((a, b) => a + b.revenue, 0))}</strong>
                <span>total revenue</span>
              </div>
            </div>
            <ul className="xr-donut-legend">
              {brands.map((entry, i) => {
                const total = brands.reduce((a, b) => a + b.revenue, 0);
                const share = total > 0 ? (entry.revenue / total) * 100 : 0;
                return (
                  <li key={entry.brand}>
                    <span className="xr-donut-row">
                      <span className="xr-donut-swatch" style={{ background: BRAND_COLOURS[i % BRAND_COLOURS.length] }} />
                      <span className="xr-donut-name"><BrandMark value={entry.brand} height={13} /></span>
                      <span className="xr-donut-value">{formatCurrencyWhole(entry.revenue)}</span>
                      <span className="xr-donut-share">{share.toFixed(1)}%</span>
                    </span>
                    <span className="xr-donut-track">
                      <span
                        className="xr-donut-fill"
                        style={{ width: `${Math.max(share, 1.5)}%`, background: BRAND_COLOURS[i % BRAND_COLOURS.length] }}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">Registration → deposit by buyer</h2>
          <div className="xr-chart">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={rankedBuyers.filter((b) => b.reg2dep !== null).slice(0, 8)}
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
                  {rankedBuyers.filter((b) => b.reg2dep !== null).slice(0, 8).map((entry) => (
                    <Cell key={entry.buyer} fill={buyerColour.get(entry.buyer) || BRAND_COLOURS[0]} />
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
                <span className="xr-funnel-label">
                  <span className="xr-funnel-dot" style={{ background: BRAND_COLOURS[i % BRAND_COLOURS.length] }} />
                  {step.label}
                </span>
                <span className="xr-funnel-track">
                  <span
                    className="xr-funnel-fill"
                    style={{ width: `${width}%`, background: BRAND_COLOURS[i % BRAND_COLOURS.length] }}
                  />
                  {/* What was lost at this step, drawn where it was lost. */}
                  {i > 0 && step.perPrev === undefined && top > 0 ? (
                    <span
                      className="xr-funnel-drop"
                      style={{ width: `${(Math.max(0, funnel[i - 1].value - step.value) / top) * 100}%` }}
                    />
                  ) : null}
                </span>
                <span className="xr-funnel-value">
                  {int(step.value)}
                  {i > 0 && funnel[i - 1] && step.perPrev === undefined ? (
                    <em className="xr-funnel-lost">−{int(Math.max(0, funnel[i - 1].value - step.value))}</em>
                  ) : null}
                </span>
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

      {/* A ranking, not a table. Who is carrying the period is a question of
          order and distance, and a bar behind the row shows both at once. */}
      <section className="xr-block xr-avoid-break">
        <h2 className="xr-h2"><Trophy size={13} /> Buyer ranking</h2>
        <div className="xr-rank">
          {rankedBuyers.slice(0, 8).map((row, i) => {
            const top = rankedBuyers[0]?.revenue || 0;
            const colour = buyerColour.get(row.buyer) || BRAND_COLOURS[0];
            return (
              <div key={row.buyer} className={`xr-rank-row${i === 0 ? " is-first" : ""}`}>
                <span
                  className="xr-rank-pos"
                  style={i === 0 ? undefined : { background: `${colour}22`, color: colour }}
                >
                  {i + 1}
                </span>
                <span className="xr-rank-name">{row.buyer}</span>
                <span className="xr-rank-bar">
                  <span style={{ width: `${top > 0 ? Math.max((row.revenue / top) * 100, 2) : 0}%`, background: colour }} />
                </span>
                <span className="xr-rank-metric">{formatCurrencyWhole(row.revenue)}</span>
                <span className="xr-rank-sub">{int(row.ftds)} FTDs</span>
                <span className="xr-rank-sub">{row.epc === null ? "—" : `$${row.epc.toFixed(3)} EPC`}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Campaigns and placements together: what was run, and where it ran. */}
      <section className="xr-two">
        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">Top campaigns</h2>
          <table className="xr-table xr-table-rank">
            <thead>
              <tr><th /><th>Campaign</th><th>Clicks</th><th>FTDs</th><th>Reg→Dep</th><th>EPC</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {(campaigns || []).map((row, i) => {
                const max = campaigns[0]?.revenue || 0;
                return (
                  <tr key={row.campaign}>
                    <td className="xr-pos">{i + 1}</td>
                    <td className="xr-strong xr-clip" title={row.campaign}>{row.campaign}</td>
                    <td>{int(row.clicks)}</td>
                    <td>{int(row.ftds)}</td>
                    <td>{row.reg2dep === null ? "—" : formatPercent(row.reg2dep, 1)}</td>
                    <td>{row.epc === null ? "—" : `$${row.epc.toFixed(3)}`}</td>
                    <td className="xr-share-td">
                      <ShareCell value={row.revenue} max={max}>{formatCurrencyWhole(row.revenue)}</ShareCell>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2"><MapPin size={13} /> Placement</h2>
          <div className="xr-chart">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={(placements || []).slice(0, 6)} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={axisTickStyle} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="placement" tick={{ ...axisTickStyle, fontSize: 10 }} tickLine={false} axisLine={false} width={128} />
                <Tooltip
                  contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}
                  formatter={(v, n) => [n === "clicks" ? int(v) : v, n === "clicks" ? "Clicks" : n]}
                />
                <Bar dataKey="clicks" radius={[0, 4, 4, 0]}>
                  {(placements || []).slice(0, 6).map((entry, i) => (
                    <Cell key={entry.placement} fill={BRAND_COLOURS[i % BRAND_COLOURS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* The players who actually paid for the period. */}
      {topPlayers?.length ? (
        <section className="xr-block xr-avoid-break">
          <h2 className="xr-h2"><Crown size={13} /> Highest-value players</h2>
          <div className="xr-players">
            {topPlayers.map((p, i) => (
              <div key={p.externalId} className={`xr-player${i === 0 ? " is-first" : ""}`}>
                <span className="xr-player-rank">{i + 1}</span>
                <span className="xr-player-geo"><CountryFlag value={p.country} /> {p.country || "—"}</span>
                <strong className="xr-player-value">{formatCurrencyWhole(p.revenue)}</strong>
                <span className="xr-player-sub">
                  {p.redeposits} redeposit{p.redeposits === 1 ? "" : "s"}
                  {p.buyer ? ` · ${p.buyer}` : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="xr-block xr-avoid-break">
        <h2 className="xr-h2">By buyer</h2>
        <table className="xr-table">
          <thead>
            <tr>
              <th>Buyer</th><th>Clicks</th><th>Registrations</th><th>FTDs</th>
              <th>Reg→Dep</th><th>EPC</th><th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((row) => {
              const max = Math.max(...buyers.map((b) => b.revenue), 0);
              return (
                <tr key={row.buyer}>
                  <td className="xr-strong">{row.buyer}</td>
                  <td>{int(row.clicks)}</td>
                  <td>{int(row.registers)}</td>
                  <td className="xr-strong">{int(row.ftds)}</td>
                  <td>{row.reg2dep === null ? "—" : formatPercent(row.reg2dep, 1)}</td>
                  <td>{row.epc === null ? "—" : `$${row.epc.toFixed(3)}`}</td>
                  <td className="xr-share-td">
                    <ShareCell value={row.revenue} max={max}>{formatCurrencyWhole(row.revenue)}</ShareCell>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="xr-two">
        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">By country</h2>
          <table className="xr-table">
            <thead><tr><th>Country</th><th>Clicks</th><th>FTDs</th><th>Reg→Dep</th><th>Revenue</th></tr></thead>
            <tbody>
              {earningCountries.map((row) => {
                const max = Math.max(...earningCountries.map((c) => c.revenue), 0);
                return (
                  <tr key={row.country}>
                    <td className="xr-strong">
                      <span className="xr-cell-mark">
                        <CountryFlag value={row.country} />
                        {row.country}
                      </span>
                    </td>
                    <td>{int(row.clicks)}</td>
                    <td>{int(row.ftds)}</td>
                    <td>{row.reg2dep === null ? "—" : formatPercent(row.reg2dep, 1)}</td>
                    <td className="xr-share-td">
                      <ShareCell value={row.revenue} max={max} tone="blue">
                        {formatCurrencyWhole(row.revenue)}
                      </ShareCell>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {silentCountries > 0 ? (
            <p className="xr-table-note">
              {silentCountries} further countr{silentCountries === 1 ? "y" : "ies"} received traffic but produced no deposit.
            </p>
          ) : null}
        </div>

        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">By tool</h2>
          <table className="xr-table">
            <thead><tr><th>Tool</th><th>Clicks</th><th>Reg→Dep</th><th>FTDs</th></tr></thead>
            <tbody>
              {(tools || []).map((row) => {
                const max = Math.max(...(tools || []).map((t) => t.ftds), 0);
                return (
                  <tr key={row.tool}>
                    <td className="xr-strong">
                      <span className="xr-cell-mark"><BrandMark value={row.tool} height={13} /></span>
                    </td>
                    <td>{int(row.clicks)}</td>
                    <td>{row.reg2dep === null ? "—" : formatPercent(row.reg2dep, 1)}</td>
                    <td className="xr-share-td">
                      <ShareCell value={row.ftds} max={max} tone="purple">{int(row.ftds)}</ShareCell>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="xr-block xr-avoid-break">
          <h2 className="xr-h2">By brand</h2>
          <table className="xr-table">
            <thead><tr><th>Brand</th><th>FTDs</th><th>Per FTD</th><th>Revenue</th></tr></thead>
            <tbody>
              {brands.map((row) => {
                const max = Math.max(...brands.map((b) => b.revenue), 0);
                return (
                  <tr key={row.brand}>
                    <td className="xr-strong">
                      <span className="xr-cell-mark"><BrandMark value={row.brand} height={14} /></span>
                    </td>
                    <td>{int(row.ftds)}</td>
                    <td>{row.revenuePerFtd === null ? "—" : formatCurrency(row.revenuePerFtd)}</td>
                    <td className="xr-share-td">
                      <ShareCell value={row.revenue} max={max} tone="yellow">
                        {formatCurrencyWhole(row.revenue)}
                      </ShareCell>
                    </td>
                  </tr>
                );
              })}
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
