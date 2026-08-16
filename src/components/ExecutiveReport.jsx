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
  BarChart, Bar, Cell, PieChart, Pie, RadialBarChart, RadialBar, PolarAngleAxis,
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
  const { placements, campaigns, topPlayers, quality } = report;
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
            <strong className="xr-tile-value">
              {summary.epc === null ? "—" : `$${summary.epc.toFixed(4)}`}
            </strong>
            {summary.epcPrev ? (
              <Delta value={((summary.epc - summary.epcPrev) / summary.epcPrev) * 100} />
            ) : null}
          </div>
          <p className="xr-tile-note">
            {formatCurrencyWhole(summary.revenue)} from {int(summary.clicks)} clicks
          </p>
        </div>

        {quality ? (
          <>
            <div className="xr-tile xr-tile-gauge">
              <div className="xr-tile-head">
                <span className="xr-tile-icon is-blue"><ShieldCheck size={14} /></span>
                <span className="xr-tile-label">Clean traffic</span>
              </div>
              {/* Half-dial with the value below the arc rather than across
                  it — at 98% the bar closes over the centre and the number
                  was being printed on top of its own stroke. */}
              <div className="xr-gauge">
                <ResponsiveContainer width="100%" height={104}>
                  <RadialBarChart
                    innerRadius="76%" outerRadius="100%" startAngle={180} endAngle={0}
                    data={[{ name: "clean", value: Math.max(0, Math.min(100, quality.cleanRate || 0)) }]}
                    cy="100%"
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={6} fill="#36d07c" background={{ fill: "rgba(255,255,255,0.07)" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="xr-gauge-read">
                  <strong>{(quality.cleanRate || 0).toFixed(1)}%</strong>
                  <span>of {quality.clicks.toLocaleString()} clicks</span>
                </div>
              </div>
              {/* The parts, not a sentence: a manager who sees 98.3% will
                  next ask what the other 1.7% was. */}
              <div className="xr-tile-split">
                <span><em>{quality.bots.toLocaleString()}</em>bots</span>
                <span><em>{quality.proxies.toLocaleString()}</em>proxies</span>
                <span><em>{(quality.clicks - quality.bots - quality.proxies).toLocaleString()}</em>real</span>
              </div>
            </div>

            <div className="xr-tile">
              <div className="xr-tile-head">
                <span className="xr-tile-icon is-purple"><Fingerprint size={14} /></span>
                <span className="xr-tile-label">Unique clicks</span>
              </div>
              <div className="xr-tile-body">
                <strong className="xr-tile-value">{(quality.uniqueRate || 0).toFixed(1)}%</strong>
              </div>
              <p className="xr-tile-note">{quality.unique.toLocaleString()} of {quality.clicks.toLocaleString()}</p>
            </div>
          </>
        ) : null}
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
                    <span className="xr-donut-swatch" style={{ background: BRAND_COLOURS[i % BRAND_COLOURS.length] }} />
                    <span className="xr-donut-name"><BrandMark value={entry.brand} height={13} /></span>
                    <span className="xr-donut-value">{formatCurrencyWhole(entry.revenue)}</span>
                    <span className="xr-donut-share">{share.toFixed(1)}%</span>
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
          {buyers.slice(0, 8).map((row, i) => {
            const top = buyers[0]?.revenue || 0;
            return (
              <div key={row.buyer} className={`xr-rank-row${i === 0 ? " is-first" : ""}`}>
                <span className="xr-rank-pos">{i + 1}</span>
                <span className="xr-rank-name">{row.buyer}</span>
                <span className="xr-rank-bar">
                  <span style={{ width: `${top > 0 ? Math.max((row.revenue / top) * 100, 2) : 0}%` }} />
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
              {countries.map((row) => {
                const max = Math.max(...countries.map((c) => c.revenue), 0);
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
