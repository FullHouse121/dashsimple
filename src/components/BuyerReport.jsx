// A buyer's own report.
//
// Deliberately not a smaller executive report. That document asks how the
// business did and opens with a verdict; this one asks what the person
// reading it should change this week, and opens with the answer. Everything
// it reads in the order a buyer checks: am I on target, how do I convert
// against the team, where did the money come from, which of my own campaigns
// disagree, and where is it running.
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
import { Printer } from "lucide-react";
import { formatCurrency, formatCurrencyWhole, formatPercent } from "../lib/format.js";
import { CountryFlag, OsGlyph, osHasGlyph } from "./flags.jsx";
import { BrandMark } from "./BrandMark.jsx";
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





// The "vs last period" cell, as one designed set rather than three unrelated
// treatments.
//
// It carried a blue pill for new, bare red text with an arrow for a fall, and
// a plain dash for nothing — three visual languages in one column, so the eye
// had to re-learn the format on every row. All three are badges now, built
// from the dashboard's own KPI pill: full-round, tinted fill, matching
// border, tabular figures.
//
// "was N" stays outside the badge and stays quiet. It is the reference point,
// not the finding, and putting it inside doubled the badge's width for
// something nobody scans.
function ChangeBadge({ isNew, delta, previous }) {
  if (isNew) {
    return (
      <span className="br-chip is-new" title="No traffic on this in the previous period">
        <span className="br-chip-dot" />
        New
      </span>
    );
  }
  if (delta == null) return <span className="br-dim">—</span>;
  const up = delta >= 0;
  return (
    <span className="br-chip-wrap">
      <span className={`br-chip ${up ? "is-up" : "is-down"}`}>
        <span className="br-chip-arrow">{up ? "▲" : "▼"}</span>
        {Math.abs(delta).toFixed(0)}%
      </span>
      {previous == null ? null : <em className="br-was">was {int(previous)}</em>}
    </span>
  );
}

// ── Sorting ───────────────────────────────────────────────────────────
//
// Every table here arrived sorted by revenue, which was defensible until you
// notice the markets table does not HAVE a revenue column: it was ordered by
// a number the reader could not see, so it read as no order at all.
//
// Two answers, both applied. Each table now shows the column it is sorted by,
// and every column can be sorted — because which column matters depends on
// the question, and a buyer chasing a leak sorts by conversion where one
// chasing money sorts by revenue.
//
// Nulls always sink. A market with no rate on file has no worth to compare,
// and floating those rows to the top of a descending sort would bury the ones
// that do.
function useSorted(rows, initialKey, initialDir = "desc") {
  const [sort, setSort] = React.useState({ key: initialKey, dir: initialDir });
  const sorted = React.useMemo(() => {
    const list = [...(rows || [])];
    const { key, dir } = sort;
    if (!key) return list;
    const sign = dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      const x = a?.[key];
      const y = b?.[key];
      const xEmpty = x == null || x === "";
      const yEmpty = y == null || y === "";
      if (xEmpty && yEmpty) return 0;
      if (xEmpty) return 1;
      if (yEmpty) return -1;
      if (typeof x === "number" && typeof y === "number") return (x - y) * sign;
      return String(x).localeCompare(String(y)) * sign;
    });
  }, [rows, sort]);
  const toggle = React.useCallback((key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        // A new column starts descending for numbers — "most first" is what
        // someone means when they click a money column — and ascending for
        // text, where alphabetical is the expectation.
        : { key, dir: "desc" }
    );
  }, []);
  return { rows: sorted, sort, toggle };
}

// A header cell that says whether it is the one doing the sorting.
function Th({ label, sortKey, sort, toggle, align = "right" }) {
  const active = sort.key === sortKey;
  return (
    <th
      className={`br-th${active ? " is-sorted" : ""}`}
      style={{ textAlign: align }}
      onClick={() => toggle(sortKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(sortKey); } }}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      title={`Sort by ${label}`}
    >
      {label}
      <span className="br-th-caret">{active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}</span>
    </th>
  );
}

// Give every row the keys this page reads, before the page reads them.
//
// The front end and the API deploy separately, so a browser can be running
// this file against a server that predates it — and then a field the page
// treats as "null or a number" is simply absent. `x === null` does not catch
// undefined, so `x.toFixed()` throws and the whole section dies behind an
// error boundary. That is what "Cannot read properties of undefined (reading
// 'toFixed')" was.
//
// Filling the shape once here is worth more than a guard at every use: the
// guards are easy to write correctly and easy to forget, and forgetting one
// costs the entire view rather than one cell. Anything missing becomes null,
// which every formatter below already renders as an em dash.
const NUM = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const normalise = (r) => {
  if (!r || r.needsBuyer) return r;
  const rows = (list, shape) => (Array.isArray(list) ? list : []).map((row) => ({ ...shape, ...row }));
  return {
    ...r,
    summary: { clicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0, reg2dep: null, click2reg: null, epc: null, revenuePerFtd: null, deltas: {}, ...(r.summary || {}) },
    benchmark: { buyers: 0, reg2dep: null, epc: null, click2reg: null, revenuePerFtd: null, ...(r.benchmark || {}) },
    campaigns: rows(r.campaigns, { clicks: 0, registers: 0, ftds: 0, revenue: 0, reg2dep: null, epc: null, thin: false, previous: null, deltaFtds: null, deltaRevenue: null, isNew: false })
      .map((c) => ({ ...c, deltaFtds: NUM(c.deltaFtds), deltaRevenue: NUM(c.deltaRevenue), reg2dep: NUM(c.reg2dep) })),
    countries: rows(r.countries, { clicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0, reg2dep: null, cpa: null, worth: null, repeatPerFtd: null, thin: false })
      .map((c) => ({ ...c, repeatPerFtd: NUM(c.repeatPerFtd), reg2dep: NUM(c.reg2dep), worth: NUM(c.worth) })),
    brands: rows(r.brands, { clicks: 0, ftds: 0, revenue: 0, reg2dep: null, revenuePerFtd: null }),
    tools: rows(r.tools, { clicks: 0, ftds: 0, revenue: 0, reg2dep: null }),
    placements: rows(r.placements, { clicks: 0, ftds: 0, share: null }),
    devices: rows(r.devices, { clicks: 0, ftds: 0, revenue: 0, reg2dep: null, revenuePerFtd: null }),
    creatives: rows(r.creatives, { clicks: 0, registers: 0, ftds: 0, revenue: 0, reg2dep: null, epc: null, thin: false }),
    games: rows(r.games, { clicks: 0, ftds: 0, revenue: 0, reg2dep: null, revenuePerFtd: null, thin: false }),
    funnel: Array.isArray(r.funnel) ? r.funnel : [],
    revenueSource: r.revenueSource || null,
    trend: Array.isArray(r.trend) ? r.trend : [],
    availableCountries: Array.isArray(r.availableCountries) ? r.availableCountries : [],
  };
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
        if (alive) setState({ loading: false, error: null, report: normalise(body) });
      } catch (error) {
        if (alive) setState({ loading: false, error: error.message || "Could not load your report.", report: null });
      }
    })();
    return () => { alive = false; };
  }, [own.from, own.to, marketKey, buyer]);

  // Sorting state for every table. Declared before the early returns below —
  // a hook that only runs on some renders is a hook that breaks React, and
  // putting these after `if (loading) return` is exactly that mistake.
  const rep = state.report && !state.report.needsBuyer ? state.report : null;
  const campaignSort = useSorted(rep?.campaigns, "revenue");
  const creativeSort = useSorted(rep?.creatives, "revenue");
  const offerSort = useSorted(rep?.games, "revenue");
  const marketSort = useSorted((rep?.countries || []).filter((c) => c.clicks > 0), "revenue");
  const brandSort = useSorted(rep?.brands, "revenue");
  const toolSort = useSorted(rep?.tools, "revenue");
  const deviceSort = useSorted((rep?.devices || []).filter((d) => d.clicks > 0), "revenue");

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
          <div className="br-control">
            <label>Export</label>
            <div className="br-export">
              <button type="button" className="ghost" onClick={() => window.print()} title="Print or save as PDF">
                <Printer size={14} /> PDF
              </button>
            </div>
          </div>
        </div>

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
        {r.quality ? (
          <p className="br-quality">
            Of {int(r.quality.clicks)} clicks the tracker saw, {int(r.quality.unique)} were unique
            ({formatPercent(r.quality.uniqueRate, 1)}), {int(r.quality.bots)} were bots and {int(r.quality.proxies)} came
            through proxies — {formatPercent(r.quality.cleanRate, 1)} clean. Rates below are built on tracked clicks, not
            unique ones.
          </p>
        ) : null}

        <div className="br-totals br-totals-cards">
          {[
            { label: "Clicks", value: int(me.clicks), delta: deltas.clicks },
            // Unique clicks come from the tracker, not media_stats: one person
            // reloading five times is one visitor.
            ...(r.quality
              ? [{
                  label: `Unique clicks · ${formatPercent(r.quality.uniqueRate, 0)}`,
                  value: int(r.quality.unique),
                  delta: null,
                }]
              : []),
            { label: "Registrations", value: int(me.registers), delta: deltas.registers },
            { label: "First deposits", value: int(me.ftds), delta: deltas.ftds },
            { label: "Revenue", value: formatCurrencyWhole(me.revenue), delta: deltas.revenue },
          ].map((t) => (
            <span className="br-total" key={t.label}>
              <em>{t.value}</em>
              {t.label}
              {t.delta == null ? null : (
                <b className={t.delta >= 0 ? "is-up" : "is-down"}>
                  {t.delta >= 0 ? "▲" : "▼"} {Math.abs(t.delta).toFixed(1)}%
                </b>
              )}
            </span>
          ))}
        </div>
      </section>

      {r.revenueSource || r.funnel?.length ? (
        <div className="br-two">
          {r.revenueSource ? (
            <section className="br-block">
              <h2 className="br-h2">Where the money came from</h2>
              <p className="br-note">
                New depositors against players you already had. A single revenue total cannot tell a period that
                acquired well from one that lived off earlier wins — and the two call for opposite decisions.
              </p>
              <div className="br-source">
                <span className="br-source-bar">
                  <span className="is-new" style={{ width: `${Math.max(r.revenueSource.newShare, 1)}%` }} />
                  <span className="is-old" style={{ width: `${Math.max(r.revenueSource.returningShare, 1)}%` }} />
                </span>
                <div className="br-source-legend">
                  {[
                    { label: "New depositors", value: r.revenueSource.fromNew, share: r.revenueSource.newShare, delta: r.revenueSource.deltaNew, cls: "is-new" },
                    { label: "Returning players", value: r.revenueSource.fromReturning, share: r.revenueSource.returningShare, delta: r.revenueSource.deltaReturning, cls: "is-old" },
                  ].map((x) => (
                    <span key={x.label} className="br-source-item">
                      <em className={x.cls}>{formatCurrencyWhole(x.value)}</em>
                      <span>{x.label} · {formatPercent(x.share, 0)}</span>
                      {x.delta == null ? null : (
                        <b className={x.delta >= 0 ? "is-up" : "is-down"}>
                          {x.delta >= 0 ? "▲" : "▼"} {Math.abs(x.delta).toFixed(0)}% vs last period
                        </b>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {r.funnel?.length ? (
            <section className="br-block">
              <h2 className="br-h2">Where your funnel loses people</h2>
              <p className="br-note">Each step against the one above it, and the count that did not make it.</p>
              <div className="br-funnel">
                {r.funnel.map((step, i) => {
                  const top = r.funnel[0]?.value || 0;
                  const lost = i > 0 ? Math.max(0, r.funnel[i - 1].value - step.value) : 0;
                  return (
                    <div className="br-funnel-row" key={step.key}>
                      <span className="br-funnel-label">
                        <span className="br-funnel-dot" style={{ background: RAMP[i % RAMP.length] }} />
                        {step.label}
                      </span>
                      <span className="br-funnel-track">
                        <span style={{ width: `${top > 0 ? Math.max((step.value / top) * 100, 1) : 0}%`, background: RAMP[i % RAMP.length] }} />
                        {i > 0 && step.perPrev === undefined && top > 0 ? (
                          <span className="br-funnel-drop" style={{ width: `${(lost / top) * 100}%` }} />
                        ) : null}
                      </span>
                      <span className="br-funnel-value">
                        {int(step.value)}
                        {i > 0 && step.perPrev === undefined ? <em>−{int(lost)}</em> : null}
                      </span>
                      <span className="br-funnel-rate">
                        {i === 0
                          ? "—"
                          : step.perPrev != null
                            ? `×${step.perPrev.toFixed(2)} per FTD`
                            : step.rateFromPrev == null ? "—" : formatPercent(step.rateFromPrev, 2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

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
                <Th label="Campaign" sortKey="campaign" sort={campaignSort.sort} toggle={campaignSort.toggle} align="left" />
                <Th label="Clicks" sortKey="clicks" sort={campaignSort.sort} toggle={campaignSort.toggle} />
                <Th label="Regs" sortKey="registers" sort={campaignSort.sort} toggle={campaignSort.toggle} />
                <Th label="FTDs" sortKey="ftds" sort={campaignSort.sort} toggle={campaignSort.toggle} />
                <Th label="vs last period" sortKey="deltaFtds" sort={campaignSort.sort} toggle={campaignSort.toggle} />
                <Th label="Reg→Dep" sortKey="reg2dep" sort={campaignSort.sort} toggle={campaignSort.toggle} />
                <Th label="Revenue" sortKey="revenue" sort={campaignSort.sort} toggle={campaignSort.toggle} />
              </tr>
            </thead>
            <tbody>
              {campaignSort.rows.map((c) => {
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
                      <ChangeBadge isNew={c.isNew} delta={c.deltaFtds} previous={c.previous?.ftds} />
                    </td>
                    <td className={tone}>
                      {c.reg2dep == null ? "—" : formatPercent(c.reg2dep, 1)}
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

      {r.creatives?.length || r.games?.length ? (
        <div className="br-two">
          {r.creatives?.length ? (
            <section className="br-block">
              <h2 className="br-h2">Your creatives</h2>
              <p className="br-note">
                Ad level, with the adset it ran in — the deepest thing you control, and the fastest to change.
              </p>
              <table className="br-table">
                <thead><tr>
                  <Th label="Ad" sortKey="ad" sort={creativeSort.sort} toggle={creativeSort.toggle} align="left" />
                  <Th label="Clicks" sortKey="clicks" sort={creativeSort.sort} toggle={creativeSort.toggle} />
                  <Th label="FTDs" sortKey="ftds" sort={creativeSort.sort} toggle={creativeSort.toggle} />
                  <Th label="Reg→Dep" sortKey="reg2dep" sort={creativeSort.sort} toggle={creativeSort.toggle} />
                  <Th label="Revenue" sortKey="revenue" sort={creativeSort.sort} toggle={creativeSort.toggle} />
                </tr></thead>
                <tbody>
                  {creativeSort.rows.map((c) => (
                    <tr key={`${c.ad}-${c.adset}`}>
                      <td className="br-strong">
                        {c.ad}
                        {c.adset && c.adset !== "—" ? <span className="br-sub-line">{c.adset}</span> : null}
                      </td>
                      <td>{int(c.clicks)}</td>
                      <td>{int(c.ftds)}</td>
                      <td>
                        {c.reg2dep == null ? "—" : formatPercent(c.reg2dep, 1)}
                        {c.thin ? <span className="br-thin" title="Too few registrations for this rate to mean much">·</span> : null}
                      </td>
                      <td className="br-strong">{formatCurrencyWhole(c.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {r.games?.length ? (
            <section className="br-block">
              <h2 className="br-h2">Your offers</h2>
              <p className="br-note">Which game the traffic was sent to, and what each one returned per depositor.</p>
              <table className="br-table">
                <thead><tr>
                  <Th label="Offer" sortKey="game" sort={offerSort.sort} toggle={offerSort.toggle} align="left" />
                  <Th label="Clicks" sortKey="clicks" sort={offerSort.sort} toggle={offerSort.toggle} />
                  <Th label="FTDs" sortKey="ftds" sort={offerSort.sort} toggle={offerSort.toggle} />
                  <Th label="Reg→Dep" sortKey="reg2dep" sort={offerSort.sort} toggle={offerSort.toggle} />
                  <Th label="Per FTD" sortKey="revenuePerFtd" sort={offerSort.sort} toggle={offerSort.toggle} />
                  <Th label="Revenue" sortKey="revenue" sort={offerSort.sort} toggle={offerSort.toggle} />
                </tr></thead>
                <tbody>
                  {offerSort.rows.map((g) => (
                    <tr key={g.game}>
                      <td className="br-strong">{g.game}</td>
                      <td>{int(g.clicks)}</td>
                      <td>{int(g.ftds)}</td>
                      <td>
                        {g.reg2dep == null ? "—" : formatPercent(g.reg2dep, 1)}
                        {g.thin ? <span className="br-thin" title="Too few registrations for this rate to mean much">·</span> : null}
                      </td>
                      <td>{g.revenuePerFtd == null ? "—" : formatCurrency(g.revenuePerFtd)}</td>
                      <td className="br-strong">{formatCurrencyWhole(g.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
        </div>
      ) : null}

      {countries?.length ? (
        <section className="br-block">
          <h2 className="br-h2">Your markets</h2>
          <p className="br-note">
            Reg→Dep marked with · is built on too few registrations to trust. Repeat is redeposits per depositor —
            where players come back is where money compounds without more spend. Worth is
            {worthTotal > 0 ? ` — ${formatCurrencyWhole(worthTotal)} across the markets with a rate on file.` : "."}
          </p>
          <table className="br-table">
            <thead><tr>
                <Th label="Market" sortKey="country" sort={marketSort.sort} toggle={marketSort.toggle} align="left" />
                <Th label="FTDs" sortKey="ftds" sort={marketSort.sort} toggle={marketSort.toggle} />
                <Th label="Reg→Dep" sortKey="reg2dep" sort={marketSort.sort} toggle={marketSort.toggle} />
                <Th label="Repeat" sortKey="repeatPerFtd" sort={marketSort.sort} toggle={marketSort.toggle} />
                <Th label="CPA" sortKey="cpa" sort={marketSort.sort} toggle={marketSort.toggle} />
                <Th label="Worth" sortKey="worth" sort={marketSort.sort} toggle={marketSort.toggle} />
                {/* The table was ordered by revenue while not showing it,
                    which is indistinguishable from no order at all. */}
                <Th label="Revenue" sortKey="revenue" sort={marketSort.sort} toggle={marketSort.toggle} />
              </tr></thead>
            <tbody>
              {marketSort.rows.map((c) => (
                <tr key={c.country}>
                  <td className="br-strong"><span className="br-cell-mark"><CountryFlag value={c.country} />{c.country}</span></td>
                  <td>{int(c.ftds)}</td>
                  <td>
                    {c.reg2dep == null ? "—" : formatPercent(c.reg2dep, 1)}
                    {c.thin ? <span className="br-thin" title="Too few registrations for this rate to mean much">·</span> : null}
                  </td>
                  {/* Redeposits per depositor. Where players come back is
                      where money compounds without more spend. */}
                  <td>{c.repeatPerFtd == null ? "—" : `×${c.repeatPerFtd.toFixed(2)}`}</td>
                  <td>{c.cpa ? `$${c.cpa}` : <span className="br-dim">no rate</span>}</td>
                  <td>{c.worth == null ? "—" : formatCurrencyWhole(c.worth)}</td>
                  <td className="br-strong">{formatCurrencyWhole(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <div className="br-two">
        {r.brands?.length || r.tools?.length ? (
          <section className="br-block">
            <h2 className="br-h2">Brand and tool</h2>
            <p className="br-note">
              Which brand the money arrived through, and which delivery tool carried it — the two cuts you get asked
              about in a review.
            </p>
            {r.brands?.length ? (
              <table className="br-table">
                <thead><tr>
                  <Th label="Brand" sortKey="brand" sort={brandSort.sort} toggle={brandSort.toggle} align="left" />
                  <Th label="FTDs" sortKey="ftds" sort={brandSort.sort} toggle={brandSort.toggle} />
                  <Th label="Reg→Dep" sortKey="reg2dep" sort={brandSort.sort} toggle={brandSort.toggle} />
                  <Th label="Per FTD" sortKey="revenuePerFtd" sort={brandSort.sort} toggle={brandSort.toggle} />
                  <Th label="Revenue" sortKey="revenue" sort={brandSort.sort} toggle={brandSort.toggle} />
                </tr></thead>
                <tbody>
                  {brandSort.rows.map((x) => (
                    <tr key={x.brand}>
                      <td className="br-strong">
                        <span className="br-cell-mark"><BrandMark value={x.brand} height={14} /></span>
                      </td>
                      <td>{int(x.ftds)}</td>
                      <td>{x.reg2dep == null ? "—" : formatPercent(x.reg2dep, 1)}</td>
                      <td>{x.revenuePerFtd == null ? "—" : formatCurrency(x.revenuePerFtd)}</td>
                      <td className="br-strong">{formatCurrencyWhole(x.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {r.tools?.length ? (
              <table className="br-table br-table-tight">
                <thead><tr>
                  <Th label="Tool" sortKey="tool" sort={toolSort.sort} toggle={toolSort.toggle} align="left" />
                  <Th label="Clicks" sortKey="clicks" sort={toolSort.sort} toggle={toolSort.toggle} />
                  <Th label="FTDs" sortKey="ftds" sort={toolSort.sort} toggle={toolSort.toggle} />
                  <Th label="Reg→Dep" sortKey="reg2dep" sort={toolSort.sort} toggle={toolSort.toggle} />
                  <Th label="Revenue" sortKey="revenue" sort={toolSort.sort} toggle={toolSort.toggle} />
                </tr></thead>
                <tbody>
                  {toolSort.rows.map((x) => (
                    <tr key={x.tool}>
                      <td className="br-strong">
                        <span className="br-cell-mark"><BrandMark value={x.tool} height={13} /></span>
                      </td>
                      <td>{int(x.clicks)}</td>
                      <td>{int(x.ftds)}</td>
                      <td>{x.reg2dep == null ? "—" : formatPercent(x.reg2dep, 1)}</td>
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
              <thead><tr>
                  <Th label="Device" sortKey="device" sort={deviceSort.sort} toggle={deviceSort.toggle} align="left" />
                  <Th label="FTDs" sortKey="ftds" sort={deviceSort.sort} toggle={deviceSort.toggle} />
                  <Th label="Per FTD" sortKey="revenuePerFtd" sort={deviceSort.sort} toggle={deviceSort.toggle} />
                  <Th label="Revenue" sortKey="revenue" sort={deviceSort.sort} toggle={deviceSort.toggle} />
                </tr></thead>
              <tbody>
                {deviceSort.rows.map((d) => (
                  <tr key={`${d.device}-${d.os}`}>
                    <td className="br-strong">
                      <span className="br-cell-mark">
                        {osHasGlyph(d.os) ? <OsGlyph os={d.os} size={15} /> : null}
                        {d.device} · {d.os}
                      </span>
                    </td>
                    <td>{int(d.ftds)}</td>
                    <td>{d.revenuePerFtd == null ? "—" : formatCurrency(d.revenuePerFtd)}</td>
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
