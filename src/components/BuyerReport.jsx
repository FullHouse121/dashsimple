// A buyer's own report.
//
// Deliberately not a smaller executive report. That document asks how the
// business did and opens with a verdict; this one asks what the person
// reading it should change this week, and opens with the answer. Everything
// below the actions is the evidence for them, in the order a buyer would
// check it: am I on target, how do I convert against the team, which of my
// own campaigns disagree, where is the money.
//
// Three rules, enforced by the endpoint rather than here:
//   · scoped      — the buyer is resolved from the session, never the URL
//   · benchmarked — the team MEDIAN, never a colleague's name or revenue
//   · derived     — every action is computed from a figure printed below it
//
// Cost is absent throughout. With the ad-platform pipeline down, a
// buyer-facing CPA or ROI would be a number the reader cannot check.
import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { apiFetch } from "../lib/api.js";
import { CountryDropdownPicker, DeusDatePicker } from "./Select.jsx";
import { Download, Printer } from "lucide-react";
import { csvCell, formatCurrency, formatCurrencyWhole, formatPercent } from "../lib/format.js";
import { CountryFlag } from "./flags.jsx";
import { AlertIcon, AwardIcon, GoalIcon, HealthIcon } from "./icons.jsx";

const int = (v) => Number(v || 0).toLocaleString();
const RAMP = ["#36d07c", "#64b8ff", "#a15bff", "#f7c625", "#ff9357", "#ff7d88"];

const axisTick = { fill: "#8b8f98", fontSize: 11 };
const tooltipStyle = {
  background: "#1b1d21",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};

// A figure beside the team's middle. The comparison is the point: a buyer has
// no other way to know whether 4.3% is a problem or simply what this traffic
// does.
function Benchmarked({ label, value, median, format, better = "higher" }) {
  const has = value !== null && value !== undefined && median !== null && median !== undefined;
  const ahead = has ? (better === "higher" ? value >= median : value <= median) : null;
  const fmt = (v) =>
    v === null || v === undefined
      ? "—"
      : format === "percent"
        ? formatPercent(v, 1)
        : format === "money4"
          ? formatCurrency(v)
          : format === "money"
            ? formatCurrencyWhole(v)
            : int(v);
  return (
    <div className="br-metric">
      <span className="br-metric-label">{label}</span>
      <strong className={`br-metric-value${has ? (ahead ? " is-ahead" : " is-behind") : ""}`}>{fmt(value)}</strong>
      {has ? (
        <span className="br-metric-bench">
          team median {fmt(median)}
          <em className={ahead ? "is-ahead" : "is-behind"}>{ahead ? "ahead" : "behind"}</em>
        </span>
      ) : (
        <span className="br-metric-bench">no team median yet</span>
      )}
    </div>
  );
}


// Every section of the report as one CSV, sections stacked and labelled, with
// the period and any market filter written at the top — an export that does
// not say what it was filtered to is a trap for whoever opens it later.
const buildCsv = (r) => {
  const lines = [];
  const row = (...cells) => lines.push(cells.map(csvCell).join(","));
  row("DEUS Affiliates — buyer report");
  row("Buyer", r.buyer);
  row("Period", `${r.period?.from} to ${r.period?.to}`);
  row("Markets", r.filters?.countries?.length ? r.filters.countries.join(" / ") : "All");
  row("Generated", new Date(r.generatedAt || Date.now()).toLocaleString());
  row("Note", "Cost figures are omitted while the ad-platform link is down.");
  lines.push("");

  const section = (title, headers, rows) => {
    if (!rows?.length) return;
    row(title);
    row(...headers);
    rows.forEach((cells) => row(...cells));
    lines.push("");
  };

  const s = r.summary || {};
  section("Summary", ["Metric", "Value"], [
    ["Clicks", s.clicks], ["Registrations", s.registers], ["First deposits", s.ftds],
    ["Redeposits", s.redeposits], ["Revenue", s.revenue],
    ["Click to registration %", s.click2reg], ["Registration to deposit %", s.reg2dep],
    ["Earnings per click", s.epc], ["Revenue per deposit", s.revenuePerFtd],
  ]);
  const b = r.benchmark || {};
  section("Team median (for comparison)", ["Metric", "Median"], [
    ["Click to registration %", b.click2reg], ["Registration to deposit %", b.reg2dep],
    ["Earnings per click", b.epc], ["Revenue per deposit", b.revenuePerFtd],
    ["Buyers in median", b.buyers],
  ]);
  section("What to do next", ["#", "Finding", "Detail"],
    (r.actions || []).map((a, i) => [i + 1, a.title, a.body]));
  section("Campaigns",
    ["Campaign", "Clicks", "Registrations", "FTDs", "FTDs last period", "FTD change %", "Reg to dep %", "Sample", "Revenue"],
    (r.campaigns || []).map((c) => [
      c.campaign, c.clicks, c.registers, c.ftds,
      c.isNew ? "new" : c.previous?.ftds ?? "", c.isNew ? "" : c.deltaFtds,
      c.reg2dep, c.thin ? "thin" : "ok", c.revenue,
    ]));
  section("Markets",
    ["Country", "Clicks", "Registrations", "FTDs", "Redeposits", "Repeat per FTD", "Reg to dep %", "Sample", "CPA", "Worth at rate card", "Revenue"],
    (r.countries || []).map((c) => [
      c.country, c.clicks, c.registers, c.ftds, c.redeposits, c.repeatPerFtd,
      c.reg2dep, c.thin ? "thin" : "ok", c.cpa, c.worth, c.revenue,
    ]));
  section("Brands", ["Brand", "Clicks", "FTDs", "Reg to dep %", "Revenue per FTD", "Revenue"],
    (r.brands || []).map((x) => [x.brand, x.clicks, x.ftds, x.reg2dep, x.revenuePerFtd, x.revenue]));
  section("Tools", ["Tool", "Clicks", "FTDs", "Reg to dep %", "Revenue"],
    (r.tools || []).map((x) => [x.tool, x.clicks, x.ftds, x.reg2dep, x.revenue]));
  section("Placements", ["Placement", "Clicks", "FTDs", "Share of clicks %"],
    (r.placements || []).map((x) => [x.placement, x.clicks, x.ftds, x.share]));
  section("Devices", ["Device", "OS", "Clicks", "FTDs", "Revenue per FTD", "Revenue"],
    (r.devices || []).map((x) => [x.device, x.os, x.clicks, x.ftds, x.revenuePerFtd, x.revenue]));
  section("Day by day", ["Date", "Clicks", "Registrations", "FTDs", "Revenue"],
    (r.trend || []).map((t) => [t.date, t.clicks, t.registers, t.ftds, t.revenue]));
  if (r.target?.rows?.length) {
    section("Against target", ["Metric", "Actual", "Target", "Progress %"],
      r.target.rows.map((t) => [t.label, t.actual, t.target, t.progress]));
  }
  return lines.join("\n");
};

const downloadCsv = (r) => {
  const blob = new Blob([`\ufeff${buildCsv(r)}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deus-${String(r.buyer || "buyer").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${r.period?.from}-to-${r.period?.to}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function BuyerReport({ range, buyer = null, onPickBuyer = null }) {
  // The report's own range and market filter, seeded from whatever the page
  // arrived with. A buyer asked to explain a month does not want to be told
  // the page only knows how to show thirty days.
  const [own, setOwn] = React.useState({ from: range?.from || "", to: range?.to || "" });
  React.useEffect(() => {
    setOwn({ from: range?.from || "", to: range?.to || "" });
  }, [range?.from, range?.to]);
  const [markets, setMarkets] = React.useState([]);
  const marketKey = markets.join(",");
  const [state, setState] = React.useState({ loading: true, error: null, report: null });

  React.useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (own.from) qs.set("from", own.from);
        if (own.to) qs.set("to", own.to);
        if (marketKey) qs.set("country", marketKey);
        // Only leadership may name a buyer; for everyone else the server
        // resolves it from the session and ignores this entirely.
        if (buyer) qs.set("buyer", buyer);
        // apiFetch resolves with the Response, not the parsed body — it
        // handles retries and the 401 broadcast, and leaves parsing to the
        // caller like every other consumer in the app.
        const res = await apiFetch(`/api/reports/buyer${qs.toString() ? `?${qs}` : ""}`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          // A 404 here is not "your report failed" — it is this page asking
          // for an endpoint the running server does not have yet, which
          // happens whenever the front end deploys ahead of the API. Saying
          // "could not load" sends someone hunting through their own data for
          // a fault that is in the deployment.
          if (res.status === 404) {
            throw new Error(
              "This report needs a newer version of the API than the server is running. It will work once the backend finishes deploying."
            );
          }
          throw new Error(body?.error || "Could not load your report.");
        }
        if (alive) setState({ loading: false, error: null, report: body });
      } catch (error) {
        if (alive) setState({ loading: false, error: error.message || "Could not load your report.", report: null });
      }
    })();
    return () => { alive = false; };
  }, [own.from, own.to, marketKey, buyer]);

  if (state.loading) return <div className="br-msg">Building your report…</div>;
  if (state.error) return <div className="br-msg is-error">{state.error}</div>;

  const r = state.report;
  if (!r) return null;

  // Leadership has not chosen yet. Only buyers with traffic in the window are
  // offered — a name that would render an empty report is worse than no name.
  if (r.needsBuyer) {
    return (
      <div className="br">
        <header className="br-head">
          <div>
            <h1 className="br-title">Buyer report</h1>
            <p className="br-sub">Choose whose report to open. {r.period?.from} → {r.period?.to}</p>
          </div>
        </header>



        {r.buyers?.length ? (
          <ul className="br-picker">
            {r.buyers.map((b) => (
              <li key={b.buyer}>
                <button type="button" onClick={() => onPickBuyer && onPickBuyer(b.buyer)}>
                  <span className="br-picker-name">{b.buyer}</span>
                  <span className="br-picker-meta">
                    {int(b.ftds)} FTD{b.ftds === 1 ? "" : "s"} · {formatCurrencyWhole(b.revenue)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="br-msg">No buyer had traffic in this window.</p>
        )}
      </div>
    );
  }
  const {
    summary: me = {},
    benchmark = {},
    target = null,
    actions = [],
    campaigns = [],
    countries = [],
    placements = [],
    devices = [],
    trend = [],
  } = r;
  const deltas = me.deltas || {};

  const maxCampaignRevenue = Math.max(...campaigns.map((c) => c.revenue), 0);
  const worthTotal = countries.reduce((a, c) => a + (c.worth || 0), 0);

  return (
    <div className="br">
      <header className="br-head">
        <div>
          <h1 className="br-title">{r.buyer}</h1>
          {r.period ? (
            <p className="br-sub">
              {r.period.from} → {r.period.to} · {r.period.days} days, against the {r.period.days} before it
            </p>
          ) : null}
        </div>
        <span className="br-stamp">
          {onPickBuyer ? (
            <button type="button" className="br-back" onClick={() => onPickBuyer("")}>
              ← Choose another buyer
            </button>
          ) : null}
          {onPickBuyer ? <br /> : null}
          {onPickBuyer ? "This buyer's traffic only" : "Your traffic only"} · cost figures omitted while the
          ad-platform link is down
        </span>
      </header>

        <div className="br-controls br-noprint">
          {/* The report owns its own range and markets. Asking a buyer to
              explain a quarter and giving them a fixed thirty days is how a
              report becomes something people export and rebuild by hand. */}
          <div className="br-control">
            <label>From — to</label>
            <div className="br-dates">
              <DeusDatePicker value={own.from} max={own.to || ""} onChange={(v) => setOwn((p) => ({ ...p, from: v }))} />
              <DeusDatePicker value={own.to} min={own.from || ""} onChange={(v) => setOwn((p) => ({ ...p, to: v }))} />
            </div>
          </div>
          <div className="br-control">
            <label>Markets</label>
            <CountryDropdownPicker
              multiple
              removable
              values={markets}
              onToggle={(c) =>
                setMarkets((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
              }
              options={(r.availableCountries || []).map((c) => ({ value: c, label: c, search: c }))}
              placeholder="All markets"
              searchPlaceholder="Type to find a market"
              emptyResultsLabel="No markets found."
            />
          </div>
          <div className="br-control br-control-actions">
            <label>Export</label>
            <div className="br-export">
              <button type="button" className="ghost" onClick={() => downloadCsv(r)} title="Every section as one CSV">
                <Download size={14} /> CSV
              </button>
              <button type="button" className="ghost" onClick={() => window.print()} title="Print or save as PDF">
                <Printer size={14} /> PDF
              </button>
            </div>
          </div>
        </div>

      {/* The answer first. A buyer handed nine things to do does none of them,
          so the endpoint caps this at four and leads with the biggest gap. */}
      {actions?.length ? (
        <section className="br-actions">
          <h2 className="br-h2"><AwardIcon size={13} /> What to do next</h2>
          <ol className="br-action-list">
            {actions.map((a, i) => (
              <li key={a.title} className={`br-action is-${a.tone}`}>
                <span className="br-action-n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{a.title}</strong>
                  <p>{a.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="br-actions">
          <p className="br-msg">
            Nothing stands out this period — no target shortfall, no campaign far off your own average, no single
            placement carrying the account.
          </p>
        </section>
      )}

      {/* Target vs actual, when a goal has been set for this buyer. */}
      {target?.rows?.length ? (
        <section className="br-block">
          <h2 className="br-h2"><GoalIcon size={13} /> Against target</h2>
          <p className="br-note">
            {target.period || "Goal"} {target.country ? `· ${target.country}` : ""} · {target.from} → {target.to}
            {target.daysLeft > 0 ? ` · ${target.daysLeft} day${target.daysLeft === 1 ? "" : "s"} left` : " · window closed"}
          </p>
          <div className="br-targets">
            {target.rows.map((row) => {
              const pct = Math.max(0, Math.min(100, row.progress ?? 0));
              const done = (row.progress ?? 0) >= 100;
              const fmt = (v) =>
                row.format === "money" ? formatCurrencyWhole(v) : row.format === "percent" ? formatPercent(v, 1) : int(Math.round(v));
              return (
                <div className="br-target" key={row.key}>
                  <span className="br-target-head">
                    <span>{row.label}</span>
                    <em>{fmt(row.actual)} <span>/ {fmt(row.target)}</span></em>
                  </span>
                  <span className="br-target-track">
                    <span className={`br-target-fill${done ? " is-done" : ""}`} style={{ width: `${pct}%` }} />
                  </span>
                  <span className="br-target-foot">
                    {done ? "target met" : `${fmt(Math.max(0, row.short))} to go`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="br-block">
          <h2 className="br-h2"><GoalIcon size={13} /> Against target</h2>
          <p className="br-note is-empty">
            <AlertIcon size={13} /> No target has been set for you covering this period. Ask your team leader to add one
            in Goals — without it this report can only compare you to the team, not to what was agreed.
          </p>
        </section>
      )}

      {/* How this buyer converts, beside the team's middle. */}
      <section className="br-block">
        <h2 className="br-h2"><HealthIcon size={13} /> How you convert</h2>
        <p className="br-note">
          Compared with the median of {benchmark.buyers} buyer{benchmark.buyers === 1 ? "" : "s"} who had enough
          registrations this period to carry a rate. Medians only — never a colleague's figures.
        </p>
        <div className="br-metrics">
          <Benchmarked label="Click → registration" value={me.click2reg} median={benchmark.click2reg} format="percent" />
          <Benchmarked label="Registration → deposit" value={me.reg2dep} median={benchmark.reg2dep} format="percent" />
          <Benchmarked label="Earnings per click" value={me.epc} median={benchmark.epc} format="money4" />
          <Benchmarked label="Revenue per deposit" value={me.revenuePerFtd} median={benchmark.revenuePerFtd} format="money" />
        </div>
        <div className="br-totals">
          {[
            { label: "Clicks", value: int(me.clicks), delta: deltas.clicks },
            { label: "Registrations", value: int(me.registers), delta: deltas.registers },
            { label: "First deposits", value: int(me.ftds), delta: deltas.ftds },
            { label: "Revenue", value: formatCurrencyWhole(me.revenue), delta: deltas.revenue },
          ].map((t) => (
            <span className="br-total" key={t.label}>
              <em>{t.value}</em>
              {t.label}
              {t.delta === null || t.delta === undefined ? null : (
                <b className={t.delta >= 0 ? "is-up" : "is-down"}>
                  {t.delta >= 0 ? "▲" : "▼"} {Math.abs(t.delta).toFixed(1)}%
                </b>
              )}
            </span>
          ))}
        </div>
      </section>

      {trend?.length > 1 ? (
        <section className="br-block">
          <h2 className="br-h2">Your traffic, day by day</h2>
          <div className="br-chart">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="brClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64b8ff" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#64b8ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="brFtds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#36d07c" stopOpacity={0.42} />
                    <stop offset="100%" stopColor="#36d07c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis yAxisId="l" tick={axisTick} tickLine={false} axisLine={false} width={46} />
                <YAxis yAxisId="r" orientation="right" tick={axisTick} tickLine={false} axisLine={false} width={38} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area yAxisId="l" type="monotone" dataKey="clicks" name="Clicks" stroke="#64b8ff" fill="url(#brClicks)" strokeWidth={2} />
                <Area yAxisId="r" type="monotone" dataKey="ftds" name="First deposits" stroke="#36d07c" fill="url(#brFtds)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      {/* The thing a buyer actually changes. */}
      {campaigns?.length ? (
        <section className="br-block">
          <h2 className="br-h2">Your campaigns</h2>
          <p className="br-note">
            Ranked by revenue. The spread in the Reg→Dep column is the cheapest thing to fix, because it is inside your
            own account.
          </p>
          <table className="br-table">
            <thead>
              <tr>
                <th>Campaign</th><th>Clicks</th><th>Regs</th><th>FTDs</th>
                <th>vs last period</th><th>Reg→Dep</th><th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                // Only rates built on a real sample are coloured; a 100% on two
                // registrations is noise and colouring it invites a bad call.
                const rated = !c.thin && c.reg2dep !== null && benchmark.reg2dep !== null;
                const tone = rated ? (c.reg2dep >= benchmark.reg2dep ? "is-ahead" : "is-behind") : "";
                return (
                  <tr key={c.campaign}>
                    <td className="br-strong">{c.campaign}</td>
                    <td>{int(c.clicks)}</td>
                    <td>{int(c.registers)}</td>
                    <td>{int(c.ftds)}</td>
                    {/* Feed it or kill it. A rate alone cannot answer that;
                        the same campaign against last period can. */}
                    <td>
                      {c.isNew ? (
                        <span className="br-tag is-new">new</span>
                      ) : c.deltaFtds === null ? (
                        <span className="br-dim">—</span>
                      ) : (
                        <span className={c.deltaFtds >= 0 ? "is-ahead" : "is-behind"}>
                          {c.deltaFtds >= 0 ? "▲" : "▼"} {Math.abs(c.deltaFtds).toFixed(0)}%
                          <em className="br-was"> was {int(c.previous?.ftds ?? 0)}</em>
                        </span>
                      )}
                    </td>
                    <td className={tone}>
                      {c.reg2dep === null ? "—" : formatPercent(c.reg2dep, 1)}
                      {/* Marked, not hidden: a 100% rate on two signups is
                          noise, and a report that lets someone act on it is
                          worse than one that says less. */}
                      {c.thin ? <span className="br-thin" title="Too few registrations for this rate to mean much">·</span> : null}
                    </td>
                    <td className="br-share-td">
                      <span className="br-share">
                        <span
                          className="br-share-bar"
                          style={{ width: `${maxCampaignRevenue > 0 ? Math.max((c.revenue / maxCampaignRevenue) * 100, 1.5) : 0}%` }}
                        />
                        <span className="br-share-text">{formatCurrencyWhole(c.revenue)}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}

      <div className="br-two">
        {countries?.length ? (
          <section className="br-block">
            <h2 className="br-h2">Your markets</h2>
            <p className="br-note">
              Reg→Dep marked with · is built on too few registrations to trust. Repeat is redeposits per depositor —
              where players come back is where money compounds without more spend. Worth is
              {worthTotal > 0 ? ` — ${formatCurrencyWhole(worthTotal)} across the markets with a rate on file.` : "."}
            </p>
            <table className="br-table">
              <thead><tr><th>Market</th><th>FTDs</th><th>Reg→Dep</th><th>Repeat</th><th>CPA</th><th>Worth</th></tr></thead>
              <tbody>
                {countries.filter((c) => c.clicks > 0).map((c) => (
                  <tr key={c.country}>
                    <td className="br-strong"><span className="br-cell-mark"><CountryFlag value={c.country} />{c.country}</span></td>
                    <td>{int(c.ftds)}</td>
                    <td>
                      {c.reg2dep === null ? "—" : formatPercent(c.reg2dep, 1)}
                      {c.thin ? <span className="br-thin" title="Too few registrations for this rate to mean much">·</span> : null}
                    </td>
                    {/* Redeposits per depositor. Where players come back is
                        where money compounds without more spend. */}
                    <td>{c.repeatPerFtd === null ? "—" : `×${c.repeatPerFtd.toFixed(2)}`}</td>
                    <td>{c.cpa ? `$${c.cpa}` : <span className="br-dim">no rate</span>}</td>
                    <td className="br-strong">{c.worth === null ? "—" : formatCurrencyWhole(c.worth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {r.brands?.length || r.tools?.length ? (
          <section className="br-block">
            <h2 className="br-h2">Brand and tool</h2>
            <p className="br-note">
              Which brand the money arrived through, and which delivery tool carried it — the two cuts you get asked
              about in a review.
            </p>
            {r.brands?.length ? (
              <table className="br-table">
                <thead><tr><th>Brand</th><th>FTDs</th><th>Reg→Dep</th><th>Per FTD</th><th>Revenue</th></tr></thead>
                <tbody>
                  {r.brands.map((x) => (
                    <tr key={x.brand}>
                      <td className="br-strong">{x.brand}</td>
                      <td>{int(x.ftds)}</td>
                      <td>{x.reg2dep === null ? "—" : formatPercent(x.reg2dep, 1)}</td>
                      <td>{x.revenuePerFtd === null ? "—" : formatCurrency(x.revenuePerFtd)}</td>
                      <td className="br-strong">{formatCurrencyWhole(x.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {r.tools?.length ? (
              <table className="br-table br-table-tight">
                <thead><tr><th>Tool</th><th>Clicks</th><th>FTDs</th><th>Reg→Dep</th><th>Revenue</th></tr></thead>
                <tbody>
                  {r.tools.map((x) => (
                    <tr key={x.tool}>
                      <td className="br-strong">{x.tool}</td>
                      <td>{int(x.clicks)}</td>
                      <td>{int(x.ftds)}</td>
                      <td>{x.reg2dep === null ? "—" : formatPercent(x.reg2dep, 1)}</td>
                      <td className="br-strong">{formatCurrencyWhole(x.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </section>
        ) : null}

        <section className="br-block">
          <h2 className="br-h2">Where it ran</h2>
          <p className="br-note">Placement concentration, and the devices your deposits came from.</p>
          {placements?.length ? (
            <ul className="br-bars">
              {placements.map((p, i) => (
                <li key={p.placement}>
                  <span className="br-bars-label">{p.placement}</span>
                  <span className="br-bars-track">
                    <span className="br-bars-fill" style={{ width: `${p.share || 0}%`, background: RAMP[i % RAMP.length] }} />
                  </span>
                  <span className="br-bars-value">{formatPercent(p.share, 0)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {devices?.length ? (
            <table className="br-table br-table-tight">
              <thead><tr><th>Device</th><th>FTDs</th><th>Per FTD</th><th>Revenue</th></tr></thead>
              <tbody>
                {devices.filter((d) => d.clicks > 0).map((d) => (
                  <tr key={`${d.device}-${d.os}`}>
                    <td className="br-strong">{d.device} · {d.os}</td>
                    <td>{int(d.ftds)}</td>
                    <td>{d.revenuePerFtd === null ? "—" : formatCurrency(d.revenuePerFtd)}</td>
                    <td>{formatCurrencyWhole(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>
      </div>
    </div>
  );
}
