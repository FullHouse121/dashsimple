import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "../lib/format.js";

// ── shared ────────────────────────────────────────────────────────────────
const axisTick = { fill: "#8b8f98", fontSize: 11 };
const tooltipSurface = {
  background: "#1b1d21",
  border: "1px solid #2b2e35",
  borderRadius: 14,
  color: "#f2f2f4",
  fontSize: 12,
};

// External IDs are 16-char hashes. Never truncate one to the point where two
// different players read identically — show head and tail, drop the middle.
export const shortId = (id) => {
  const s = String(id || "");
  return s.length > 14 ? `${s.slice(0, 7)}…${s.slice(-4)}` : s;
};

// full: show the whole ID rather than the head…tail form. Keitaro's hashes are
// 16 characters and fit comfortably where there is room; UUIDs are 36 and never
// do, so this still shortens those.
export const CopyId = ({ value, onCopy, full = false }) => {
  const [copied, setCopied] = React.useState(false);
  if (!value) return <span className="ub-id ub-id-empty">—</span>;
  const label = full && String(value).length <= 20 ? String(value) : shortId(value);
  return (
    <button
      type="button"
      className={`ub-id${copied ? " is-copied" : ""}`}
      title={`${value} — click to copy`}
      aria-label={`Copy ${value}`}
      onClick={(event) => {
        event.stopPropagation();
        navigator.clipboard?.writeText(value).then(
          () => {
            setCopied(true);
            onCopy?.(value);
            window.setTimeout(() => setCopied(false), 1200);
          },
          () => {}
        );
      }}
    >
      <span className="ub-id-text">{label}</span>
      {/* An icon rather than the word "copy": the text version was only visible
          on hover but still reserved its width, which left a dead gap that read
          as a cut-off input. */}
      <svg className="ub-id-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        {copied ? (
          <path
            d="M3.5 8.5l3 3 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <rect x="5.75" y="5.75" width="7.5" height="7.5" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.25 3.75H4.4c-.36 0-.65.29-.65.65v5.85" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
};

// ── brand ─────────────────────────────────────────────────────────────────
// Campaigns follow "Buyer | Tool | Game | Geo | Brand" — all 190 in the live
// table have exactly five segments, so the last one is the brand. Upper-cased
// because Keitaro still holds both "JASINO" and "Jasino" (and ZLOTMX/ZlotMX);
// grouping on the raw string would split one brand into two.
export const campaignBrand = (campaign) => {
  const parts = String(campaign || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length >= 5 ? parts[parts.length - 1].toUpperCase() : "";
};

export const buildBrandOptions = (rows) => {
  const counts = new Map();
  rows.forEach((row) => {
    const brand = campaignBrand(row.campaign);
    if (brand) counts.set(brand, (counts.get(brand) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => ({ value: brand, label: brand }));
};

// ── economics ─────────────────────────────────────────────────────────────
// ARPU spreads revenue over everyone acquired; LTV over the ones who actually
// paid. Buyers need both: ARPU tells you what a click is worth, LTV tells you
// what a depositor is worth, and the gap between them is the conversion problem.
export const buildEconomics = (users) => {
  const totals = users.reduce(
    (acc, user) => {
      acc.revenue += user.revenue || 0;
      acc.clicks += user.clicks || 0;
      acc.registers += user.registers || 0;
      acc.ftds += user.ftds || 0;
      acc.redeposits += user.redeposits || 0;
      const deposits = (user.ftds || 0) + (user.redeposits || 0);
      if (deposits > 0) acc.depositors += 1;
      if (deposits >= 2) acc.repeat += 1;
      return acc;
    },
    { revenue: 0, clicks: 0, registers: 0, ftds: 0, redeposits: 0, depositors: 0, repeat: 0 }
  );
  const players = users.length;
  return {
    ...totals,
    players,
    // user_behavior carries no cost, so the client path can never know spend.
    // Returning the same keys as shapeEconomics (rather than omitting them)
    // keeps the two shapes interchangeable — an absent key reads as undefined
    // and slips past a `=== null` guard.
    spend: 0,
    roas: null,
    profit: null,
    arpu: players > 0 ? totals.revenue / players : 0,
    ltv: totals.depositors > 0 ? totals.revenue / totals.depositors : 0,
    clickToDeposit: totals.clicks > 0 ? (totals.depositors / totals.clicks) * 100 : 0,
    registerToDeposit: totals.registers > 0 ? (totals.depositors / totals.registers) * 100 : 0,
    repeatRate: totals.depositors > 0 ? (totals.repeat / totals.depositors) * 100 : 0,
  };
};

// Derives the same shape from an API economics payload as buildEconomics does
// from client rows, so both paths render through one component.
export const shapeEconomics = (side) => {
  if (!side) return null;
  const revenue = Number(side.revenue || 0);
  const spend = Number(side.spend || 0);
  const players = Number(side.players || 0);
  const depositors = Number(side.depositors || 0);
  const clicks = Number(side.clicks || 0);
  const repeat = Number(side.repeatDepositors ?? side.repeat ?? 0);
  return {
    revenue,
    spend,
    players,
    depositors,
    clicks,
    repeat,
    arpu: players > 0 ? revenue / players : 0,
    ltv: depositors > 0 ? revenue / depositors : 0,
    clickToDeposit: clicks > 0 ? (depositors / clicks) * 100 : 0,
    repeatRate: depositors > 0 ? (repeat / depositors) * 100 : 0,
    // Only meaningful where cost was actually recorded. Dividing by zero spend
    // renders as infinite profit, which is worse than showing nothing.
    roas: spend > 0 ? revenue / spend : null,
    profit: spend > 0 ? revenue - spend : null,
  };
};

const Delta = ({ current, previous, invert = false, t }) => {
  if (previous === null || previous === undefined || !Number.isFinite(previous) || previous === 0) {
    return <span className="ub-delta is-flat">{t("no prior data")}</span>;
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  if (!Number.isFinite(change)) return null;
  const flat = Math.abs(change) < 0.05;
  const magnitude = Math.abs(change) >= 10 ? Math.abs(change).toFixed(0) : Math.abs(change).toFixed(1);
  // invert: for cost, spending less is the good direction.
  const good = invert ? change < 0 : change > 0;
  return (
    <span className={`ub-delta${flat ? " is-flat" : good ? " is-up" : " is-down"}`}>
      {flat ? "0%" : `${change > 0 ? "▲" : "▼"} ${magnitude}%`}
      <em>{t("vs prior")}</em>
    </span>
  );
};

export const PlayerEconomics = ({
  users,
  economics,
  loading = false,
  t = (x) => x,
  periodLabel,
  priorLabel,
}) => {
  // Revenue-side measures come from the rows actually on screen, so every
  // global filter (min revenue, external ID, country…) moves them. Spend cannot
  // follow: it is recorded per campaign-day in media_stats, not per player, so
  // there is no honest way to apportion it to a filtered subset — it stays the
  // brand+period figure the API returned, and the footnote says so.
  const live = React.useMemo(() => buildEconomics(users || []), [users]);
  const apiCurrent = economics?.current ? shapeEconomics(economics.current) : null;
  const apiPrevious = economics?.previous ? shapeEconomics(economics.previous) : null;
  if (!users?.length && !economics) return null;

  // A delta only means something when the visible population is the one the
  // API measured; any extra client-side narrowing makes the two incomparable,
  // so the comparison is dropped rather than shown against a different base.
  const narrowed = Boolean(apiCurrent) && live.players !== apiCurrent.players;
  const previous = narrowed ? null : apiPrevious;
  const current = {
    ...live,
    spend: apiCurrent ? apiCurrent.spend : live.spend,
    roas: apiCurrent ? apiCurrent.roas : null,
    sectionRevenue: apiCurrent ? apiCurrent.revenue : live.revenue,
  };

  const pct = (value) =>
    value > 0 && value < 1 ? `${value.toFixed(2)}%` : `${value.toFixed(value >= 10 ? 0 : 1)}%`;

  const metrics = [
    {
      label: t("ARPU"),
      value: formatCurrency(current.arpu),
      hint: `${t("Revenue ÷ all")} ${current.players.toLocaleString()} ${t("players")}`,
      accent: "var(--blue)",
      delta: previous ? { current: current.arpu, previous: previous.arpu } : null,
    },
    {
      label: t("LTV"),
      value: formatCurrency(current.ltv),
      // Not lifetime: the window is capped at 45 days. Saying "LTV" without the
      // period would overstate what this number covers.
      hint: `${t("Revenue ÷")} ${current.depositors.toLocaleString()} ${t("depositors")}${
        periodLabel ? ` · ${periodLabel}` : ""
      }`,
      accent: "var(--green)",
      delta: previous ? { current: current.ltv, previous: previous.ltv } : null,
    },
    {
      label: t("Spend"),
      value: current.spend > 0 ? formatCurrency(current.spend) : "—",
      hint:
        current.spend > 0
          ? t("Cost recorded in this window")
          : t("No spend recorded for this selection"),
      accent: "var(--orange)",
      delta:
        previous && current.spend > 0
          ? { current: current.spend, previous: previous.spend, invert: true }
          : null,
      muted: current.spend <= 0,
    },
    {
      label: t("ROAS"),
      value: current.roas === null ? "—" : `${current.roas.toFixed(2)}x`,
      hint:
        current.roas === null
          ? t("Needs spend data to calculate")
          : `${formatCurrency(current.sectionRevenue)} ${t("back on")} ${formatCurrency(current.spend)}`,
      accent: current.roas === null ? "var(--faint)" : current.roas >= 1 ? "var(--green)" : "var(--red)",
      delta:
        previous && current.roas !== null && previous.roas !== null
          ? { current: current.roas, previous: previous.roas }
          : null,
      muted: current.roas === null,
    },
    {
      label: t("Click → deposit"),
      value: pct(current.clickToDeposit),
      hint: `${current.depositors.toLocaleString()} ${t("of")} ${current.clicks.toLocaleString()} ${t("clicks")}`,
      accent: "var(--purple)",
      delta: previous ? { current: current.clickToDeposit, previous: previous.clickToDeposit } : null,
    },
    {
      label: t("Repeat rate"),
      value: `${current.repeatRate.toFixed(0)}%`,
      hint: `${current.repeat.toLocaleString()} ${t("of")} ${current.depositors.toLocaleString()} ${t("deposit again")}`,
      accent: "var(--pink)",
      delta: previous ? { current: current.repeatRate, previous: previous.repeatRate } : null,
    },
  ];

  return (
    <>
      <div className={`ub-econ${loading ? " is-loading" : ""}`}>
        {metrics.map((metric) => (
          <div
            className={`ub-econ-cell${metric.muted ? " is-muted" : ""}`}
            key={metric.label}
            style={{ "--accent": metric.accent }}
          >
            <span className="ub-econ-label">{metric.label}</span>
            <strong className="ub-econ-value">{metric.value}</strong>
            {metric.delta ? (
              <Delta
                current={metric.delta.current}
                previous={metric.delta.previous}
                invert={metric.delta.invert}
                t={t}
              />
            ) : null}
            <span className="ub-econ-hint">{metric.hint}</span>
          </div>
        ))}
      </div>
      {priorLabel || narrowed ? (
        <p className="ub-econ-foot">
          {narrowed
            ? `${t("ARPU, LTV and the rates describe the")} ${live.players.toLocaleString()} ${t(
                "players matching your filters. Spend and ROAS cover the whole brand and period, because cost is recorded per campaign rather than per player — so they cannot be narrowed, and the comparison is hidden while filters are active."
              )}`
            : `${t("Economics cover the selected brand and period, compared with")} ${priorLabel}.`}
          {current.roas === null
            ? ` ${t("Spend is only recorded on some campaigns, so ROAS is unavailable here.")}`
            : ""}
        </p>
      ) : null}
    </>
  );
};

// ── value tiers ───────────────────────────────────────────────────────────
// Where a player stopped tells you more than any average does: a funnel that
// ends at "clicked" is a targeting problem, one that ends at "registered" is
// an offer problem, and repeat depositors are the only ones worth re-targeting.
export const buildTiers = (users) => {
  const tiers = [
    { key: "repeat", label: "Repeat depositors", color: "var(--green)", users: [], hint: "2+ deposits" },
    { key: "ftd", label: "First deposit only", color: "var(--teal)", users: [], hint: "exactly 1" },
    { key: "registered", label: "Registered, no deposit", color: "var(--yellow)", users: [], hint: "signed up" },
    { key: "clicked", label: "Clicked only", color: "var(--faint)", users: [], hint: "no signup" },
  ];
  const byKey = Object.fromEntries(tiers.map((tier) => [tier.key, tier]));
  users.forEach((user) => {
    const deposits = (user.ftds || 0) + (user.redeposits || 0);
    if (deposits >= 2) byKey.repeat.users.push(user);
    else if (deposits === 1) byKey.ftd.users.push(user);
    else if ((user.registers || 0) > 0) byKey.registered.users.push(user);
    else byKey.clicked.users.push(user);
  });
  const total = users.length || 1;
  return tiers.map((tier) => ({
    ...tier,
    count: tier.users.length,
    share: tier.users.length / total,
    revenue: tier.users.reduce((acc, user) => acc + (user.revenue || 0), 0),
  }));
};

export const ValueTiers = ({ users, t = (x) => x, activeTier, onSelectTier }) => {
  const tiers = React.useMemo(() => buildTiers(users), [users]);
  const totalRevenue = tiers.reduce((acc, tier) => acc + tier.revenue, 0);
  if (!users.length) return null;

  // Two bars, not one. A single count bar is dominated by "clicked only" —
  // the 0.5% of players who produce 85% of revenue become an invisible sliver,
  // which is the opposite of the point. Stacking share-of-players against
  // share-of-revenue makes that asymmetry the thing you see first.
  const bars = [
    { key: "players", label: t("Share of players"), valueOf: (tier) => tier.count },
    { key: "revenue", label: t("Share of revenue"), valueOf: (tier) => tier.revenue },
  ];

  return (
    <div className="ub-tiers">
      <div className="ub-tiers-bars">
        {bars.map((bar) => {
          const total = tiers.reduce((acc, tier) => acc + bar.valueOf(tier), 0);
          return (
            <div className="ub-tiers-row" key={bar.key}>
              <span className="ub-tiers-caption">{bar.label}</span>
              <div className="ub-tiers-bar" role="img" aria-label={bar.label}>
                {total > 0 ? (
                  tiers.map((tier) => {
                    const value = bar.valueOf(tier);
                    if (value <= 0) return null;
                    const pct = (value / total) * 100;
                    return (
                      <span
                        key={tier.key}
                        className="ub-tiers-seg"
                        style={{ width: `${pct}%`, background: tier.color }}
                        title={`${t(tier.label)} — ${pct < 1 ? pct.toFixed(2) : pct.toFixed(0)}%`}
                      >
                        {pct >= 8 ? (
                          <em>{pct < 1 ? pct.toFixed(1) : pct.toFixed(0)}%</em>
                        ) : null}
                      </span>
                    );
                  })
                ) : (
                  <span className="ub-tiers-seg is-empty" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="ub-tiers-grid">
        {tiers.map((tier) => {
          const isActive = activeTier === tier.key;
          return (
            <button
              type="button"
              key={tier.key}
              className={`ub-tier${isActive ? " is-active" : ""}`}
              onClick={() => onSelectTier?.(isActive ? null : tier.key)}
              aria-pressed={isActive}
            >
              <span className="ub-tier-dot" style={{ background: tier.color }} />
              <span className="ub-tier-body">
                <span className="ub-tier-label">{t(tier.label)}</span>
                <span className="ub-tier-count">
                  {tier.count.toLocaleString()}
                  <em>{(tier.share * 100).toFixed(tier.share < 0.01 && tier.share > 0 ? 2 : 0)}%</em>
                </span>
                <span className="ub-tier-meta">
                  {tier.revenue > 0
                    ? `${formatCurrency(tier.revenue)} · ${
                        totalRevenue > 0 ? Math.round((tier.revenue / totalRevenue) * 100) : 0
                      }% ${t("of revenue")}`
                    : t(tier.hint)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── top players ───────────────────────────────────────────────────────────
// Horizontal, because the category label is a 16-character hash: on a vertical
// axis it gets truncated into something you cannot tell apart from the next
// player, which is exactly the readability problem this chart had.
const TopPlayerTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const deposits = (row.ftds || 0) + (row.redeposits || 0);
  return (
    <div className="ub-tip">
      <p className="ub-tip-id">{row.externalId}</p>
      {row.campaign ? <p className="ub-tip-sub">{row.campaign}</p> : null}
      <dl className="ub-tip-grid">
        <dt>{t("Revenue")}</dt>
        <dd>{formatCurrency(row.revenue || 0)}</dd>
        <dt>{t("Deposits")}</dt>
        <dd>{deposits.toLocaleString()}</dd>
        <dt>{t("Clicks")}</dt>
        <dd>{(row.clicks || 0).toLocaleString()}</dd>
        <dt>{t("Rev / click")}</dt>
        <dd>{row.clicks > 0 ? formatCurrency((row.revenue || 0) / row.clicks) : "—"}</dd>
      </dl>
      <p className="ub-tip-hint">{t("Select to open full detail")}</p>
    </div>
  );
};

export const TopPlayers = ({ users, t = (x) => x, onSelect, metric = "revenue" }) => {
  const data = React.useMemo(
    () =>
      [...users]
        .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
        .slice(0, 8)
        .map((user, index) => {
          const deposits = (user.ftds || 0) + (user.redeposits || 0);
          return {
            ...user,
            rank: index + 1,
            label: shortId(user.externalId),
            tier: deposits >= 2 ? "repeat" : deposits === 1 ? "ftd" : "none",
          };
        }),
    [users, metric]
  );
  if (!data.length) return <div className="empty-state">{t("No user behavior data available.")}</div>;

  const isMoney = metric === "revenue" || metric === "ftdRevenue";
  const fmt = (value) => (isMoney ? formatCurrency(value) : Number(value).toLocaleString());
  // Colour carries the tier, so the chart says who these players are and not
  // only how much they are worth.
  const fillFor = (row) =>
    row.tier === "repeat" ? "var(--green)" : row.tier === "ftd" ? "var(--teal)" : "rgba(139,143,152,0.5)";

  return (
    <>
      <div className="chart chart-surface">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 72, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={(value) => (isMoney ? formatCurrencyCompact(value) : Number(value).toLocaleString())}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={104}
              tickLine={false}
              axisLine={false}
              tick={{ ...axisTick, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<TopPlayerTooltip t={t} />} />
            <Bar
              dataKey={metric}
              radius={[0, 7, 7, 0]}
              barSize={22}
              cursor="pointer"
              onClick={(entry) => onSelect?.(entry?.payload || entry)}
            >
              {data.map((row) => (
                <Cell key={row.externalId} fill={fillFor(row)} />
              ))}
              {/* The value belongs on the bar: reading it off the axis is a
                  second step nobody takes. */}
              <LabelList
                dataKey={metric}
                position="right"
                offset={10}
                formatter={fmt}
                style={{ fill: "#c9cdd5", fontSize: 11, fontVariantNumeric: "tabular-nums" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="ub-legend">
        {[
          { label: t("Repeat depositor"), color: "var(--green)" },
          { label: t("First deposit"), color: "var(--teal)" },
          { label: t("No deposit"), color: "rgba(139,143,152,0.5)" },
        ].map((item) => (
          <span className="ub-legend-item" key={item.label}>
            <span className="ub-legend-dot" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </>
  );
};

// ── revenue concentration ─────────────────────────────────────────────────
// The question this answers is "how exposed am I?" — if 3% of players carry
// 80% of revenue, losing one of them is a bad month, and that risk is
// invisible in any per-user bar chart.
export const buildConcentration = (users) => {
  const earners = users.filter((user) => (user.revenue || 0) > 0).sort((a, b) => b.revenue - a.revenue);
  const total = earners.reduce((acc, user) => acc + user.revenue, 0);
  if (!earners.length || total <= 0)
    return { points: [], total: 0, earners: 0, p10: 0, top1: 0, at: () => 0 };
  const points = [{ share: 0, cumulative: 0, players: 0 }];
  let running = 0;
  earners.forEach((user, index) => {
    running += user.revenue;
    points.push({
      share: ((index + 1) / earners.length) * 100,
      cumulative: (running / total) * 100,
      players: index + 1,
    });
  });
  const at = (pct) => {
    const cut = Math.max(1, Math.ceil((pct / 100) * earners.length));
    return (earners.slice(0, cut).reduce((acc, user) => acc + user.revenue, 0) / total) * 100;
  };
  return { points, total, earners: earners.length, p10: at(10), top1: at(1), at };
};

export const Concentration = ({ users, t = (x) => x }) => {
  const { points, earners, p10, top1, at } = React.useMemo(() => buildConcentration(users), [users]);
  if (!points.length) return <div className="empty-state">{t("No revenue in this period.")}</div>;

  // Three checkpoints rather than one: a single "top 10%" number hides whether
  // the risk is one whale or a broad base of good players.
  const checkpoints = [
    { pct: 1, share: top1 },
    { pct: 10, share: p10 },
    { pct: 25, share: at ? at(25) : 0 },
  ];

  return (
    <>
      <div className="ub-conc-callout">
        <strong>{p10.toFixed(0)}%</strong>
        <span>
          {t("of revenue comes from the top 10% of paying players")}
          <em>{` (${Math.max(1, Math.ceil(earners * 0.1)).toLocaleString()} ${t("of")} ${earners.toLocaleString()})`}</em>
        </span>
      </div>
      <div className="ub-conc-checks">
        {checkpoints.map((check) => (
          <div className="ub-conc-check" key={check.pct}>
            <span className="ub-conc-check-head">
              {t("Top")} {check.pct}%
            </span>
            <strong>{check.share.toFixed(0)}%</strong>
            <span className="ub-conc-check-foot">
              {Math.max(1, Math.ceil((earners * check.pct) / 100)).toLocaleString()} {t("players")}
            </span>
          </div>
        ))}
      </div>
      <div className="chart chart-surface">
        <ResponsiveContainer width="100%" height={232}>
          <AreaChart data={points} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="ubConcentration" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.55} />
                <stop offset="95%" stopColor="var(--teal)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="share"
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={(value) => `${value}%`}
            />
            {/* Perfect equality: every player worth the same. Distance from this
                line is the concentration. */}
            <ReferenceLine
              segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 4"
            />
            <ReferenceLine x={10} stroke="rgba(255,255,255,0.14)" />
            <Tooltip
              contentStyle={tooltipSurface}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, t("of revenue")]}
              labelFormatter={(value) => `${t("Top")} ${Number(value).toFixed(1)}% ${t("of players")}`}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--teal)"
              strokeWidth={2}
              fill="url(#ubConcentration)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

// ── per-user drill-down ───────────────────────────────────────────────────
// Fed by /api/user-behavior/:externalId, NOT by the list rows already in
// memory: that endpoint groups by (external_id, buyer, country, campaign) and
// returns MAX(date), so a timeline built from it would plot last-seen dates
// rather than activity, and region/city/device never reach the client at all.
export const buildUserDetail = (rows, externalId) => {
  const mine = rows.filter((row) => {
    const id = String(row.external_id ?? row.externalId ?? "").trim();
    // The detail endpoint returns rows for one player and omits the id column;
    // the in-memory fallback carries it. Accept both.
    return id === "" || id === externalId;
  });
  const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
  const revenueOf = (row) => {
    const direct = num(row.revenue);
    return direct > 0 ? direct : num(row.ftd_revenue ?? row.ftdRevenue) + num(row.redeposit_revenue ?? row.redepositRevenue);
  };

  const totals = { clicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0, ftdRevenue: 0, redepositRevenue: 0 };
  const byCampaign = new Map();
  const byCountry = new Map();
  const byCity = new Map();
  const byDevice = new Map();
  const byDay = new Map();

  mine.forEach((row) => {
    const revenue = revenueOf(row);
    totals.clicks += num(row.clicks);
    totals.registers += num(row.registers);
    totals.ftds += num(row.ftds);
    totals.redeposits += num(row.redeposits);
    totals.revenue += revenue;
    totals.ftdRevenue += num(row.ftd_revenue ?? row.ftdRevenue);
    totals.redepositRevenue += num(row.redeposit_revenue ?? row.redepositRevenue);

    const bump = (map, key) => {
      if (!key) return;
      const cur = map.get(key) || { key, clicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0 };
      cur.clicks += num(row.clicks);
      cur.registers += num(row.registers);
      cur.ftds += num(row.ftds);
      cur.redeposits += num(row.redeposits);
      cur.revenue += revenue;
      map.set(key, cur);
    };
    bump(byCampaign, String(row.campaign || "").trim());
    bump(byCountry, String(row.country || "").trim());
    bump(byCity, String(row.city || "").trim());
    bump(byDay, String(row.date || "").slice(0, 10));

    // "Unknown" is Keitaro's placeholder, not a device. Counting it would
    // invent a device breakdown out of missing data.
    const device = String(row.device || "").trim();
    if (device && device.toLowerCase() !== "unknown") {
      const os = String(row.os || "").trim();
      bump(byDevice, os ? `${device} · ${os}` : device);
    }
  });

  const desc = (map) => [...map.values()].sort((a, b) => b.revenue - a.revenue || b.clicks - a.clicks);
  const days = [...byDay.values()].sort((a, b) => String(a.key).localeCompare(String(b.key)));
  const deposits = totals.ftds + totals.redeposits;

  return {
    externalId,
    rowCount: mine.length,
    buyer: mine.find((row) => row.buyer)?.buyer || "",
    totals,
    deposits,
    // Derived measures the table cannot show, and the reason to open a player
    // at all: is this someone worth acquiring more of?
    revenuePerClick: totals.clicks > 0 ? totals.revenue / totals.clicks : 0,
    avgDeposit: deposits > 0 ? totals.revenue / deposits : 0,
    firstSeen: days[0]?.key || "",
    lastSeen: days[days.length - 1]?.key || "",
    activeDays: days.filter((day) => day.clicks > 0 || day.revenue > 0).length,
    tier:
      deposits >= 2 ? "repeat" : deposits === 1 ? "ftd" : totals.registers > 0 ? "registered" : "clicked",
    campaigns: desc(byCampaign),
    countries: desc(byCountry),
    cities: desc(byCity),
    devices: desc(byDevice),
    days,
  };
};

const TIER_BADGE = {
  repeat: { label: "Repeat depositor", color: "var(--green)" },
  ftd: { label: "First deposit", color: "var(--teal)" },
  registered: { label: "Registered", color: "var(--yellow)" },
  clicked: { label: "Clicked only", color: "var(--faint)" },
};

// Funnel as explicit stages with drop-off between them: the interesting number
// is not how many clicked, it is where this player stopped.
const FunnelBars = ({ detail, t }) => {
  const stages = [
    { key: "clicks", label: t("Clicks"), value: detail.totals.clicks, color: "var(--blue)" },
    { key: "registers", label: t("Registers"), value: detail.totals.registers, color: "var(--yellow)" },
    { key: "ftds", label: t("First deposits"), value: detail.totals.ftds, color: "var(--teal)" },
    { key: "redeposits", label: t("Redeposits"), value: detail.totals.redeposits, color: "var(--green)" },
  ];
  const top = Math.max(...stages.map((stage) => stage.value), 1);
  return (
    <ul className="ub-funnel">
      {stages.map((stage, index) => {
        const prev = index > 0 ? stages[index - 1].value : null;
        const rate = prev && prev > 0 ? (stage.value / prev) * 100 : null;
        return (
          <li key={stage.key}>
            <span className="ub-funnel-label">{stage.label}</span>
            <span className="ub-funnel-track">
              <span
                className="ub-funnel-fill"
                style={{
                  width: `${stage.value > 0 ? Math.max((stage.value / top) * 100, 1.5) : 0}%`,
                  background: stage.color,
                }}
              />
            </span>
            <span className="ub-funnel-value">{stage.value.toLocaleString()}</span>
            <span className="ub-funnel-rate">
              {rate === null ? "" : `${rate >= 10 ? rate.toFixed(0) : rate.toFixed(1)}%`}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

const Breakdown = ({ items, t, money = true, limit = 6 }) => {
  const top = items.reduce((acc, item) => Math.max(acc, money ? item.revenue : item.clicks), 0);
  return (
    <ul className="ub-breakdown">
      {items.slice(0, limit).map((item) => {
        const value = money ? item.revenue : item.clicks;
        return (
          <li key={item.key}>
            <span className="ub-breakdown-key" title={item.key}>
              {item.key}
            </span>
            <span
              className="ub-breakdown-share"
              style={{ "--share": `${top > 0 ? Math.max((value / top) * 100, 2) : 0}%` }}
            />
            <span className="ub-breakdown-num">{item.clicks.toLocaleString()}</span>
            <span className="ub-breakdown-rev">
              {item.revenue > 0 ? formatCurrency(item.revenue) : "—"}
            </span>
          </li>
        );
      })}
      {items.length > limit ? (
        <li className="ub-breakdown-more">
          {`+${(items.length - limit).toLocaleString()} ${t("more")}`}
        </li>
      ) : null}
    </ul>
  );
};

export const UserDetail = ({ externalId, rows, onClose, t = (x) => x, range, fetcher }) => {
  const [detailRows, setDetailRows] = React.useState(null);
  const [state, setState] = React.useState({ loading: false, error: null, truncated: false });

  React.useEffect(() => {
    if (!externalId || !fetcher) {
      setDetailRows(null);
      return undefined;
    }
    let cancelled = false;
    setState({ loading: true, error: null, truncated: false });
    const params = new URLSearchParams();
    if (range?.from) params.set("from", range.from);
    if (range?.to) params.set("to", range.to);
    fetcher(`/api/user-behavior/${encodeURIComponent(externalId)}?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load player detail.");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setDetailRows(Array.isArray(data?.rows) ? data.rows : []);
        setState({ loading: false, error: null, truncated: Boolean(data?.truncated) });
      })
      .catch((error) => {
        if (cancelled) return;
        // Fall back to the list rows rather than showing nothing — they are
        // coarser (no per-day series, no city) but still describe the player.
        setDetailRows(null);
        setState({ loading: false, error: error.message || "Failed to load player detail.", truncated: false });
      });
    return () => {
      cancelled = true;
    };
  }, [externalId, fetcher, range?.from, range?.to]);

  const detail = React.useMemo(() => {
    if (!externalId) return null;
    const source = detailRows ?? rows;
    return buildUserDetail(source, externalId);
  }, [externalId, detailRows, rows]);

  const usingFallback = detailRows === null && !state.loading;

  React.useEffect(() => {
    if (!externalId) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [externalId, onClose]);

  return (
    <AnimatePresence>
      {detail ? (
        <>
          <motion.div
            className="ub-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="ub-drawer"
            role="dialog"
            aria-label={t("Player detail")}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="ub-drawer-head">
              <div className="ub-drawer-headings">
                <p className="ub-drawer-eyebrow">{t("Player")}</p>
                <h3 className="ub-drawer-id">{detail.externalId}</h3>
                <div className="ub-drawer-tags">
                  <span className="ub-badge" style={{ "--badge": TIER_BADGE[detail.tier].color }}>
                    {t(TIER_BADGE[detail.tier].label)}
                  </span>
                  {detail.buyer ? <span className="ub-badge is-plain">{detail.buyer}</span> : null}
                </div>
                {detail.firstSeen ? (
                  <p className="ub-drawer-sub">
                    {detail.firstSeen === detail.lastSeen
                      ? `${t("Seen")} ${detail.firstSeen}`
                      : `${detail.firstSeen} → ${detail.lastSeen}`}
                    {` · ${detail.activeDays.toLocaleString()} ${t("active days")}`}
                  </p>
                ) : null}
              </div>
              <button type="button" className="ub-drawer-close" onClick={onClose} aria-label={t("Close")}>
                ×
              </button>
            </header>

            {state.loading ? <p className="ub-drawer-note">{t("Loading player detail…")}</p> : null}
            {usingFallback && state.error ? (
              <p className="ub-drawer-note is-warn">
                {t("Showing summary only — the per-day detail could not be loaded.")}
              </p>
            ) : null}
            {state.truncated ? (
              <p className="ub-drawer-note is-warn">{t("Showing the most recent rows only.")}</p>
            ) : null}

            <div className="ub-drawer-totals">
              {[
                { label: t("Revenue"), value: formatCurrency(detail.totals.revenue), accent: true },
                { label: t("Deposits"), value: detail.deposits.toLocaleString() },
                {
                  label: t("Avg deposit"),
                  value: detail.avgDeposit > 0 ? formatCurrency(detail.avgDeposit) : "—",
                },
                { label: t("Clicks"), value: detail.totals.clicks.toLocaleString() },
                {
                  label: t("Rev / click"),
                  value: detail.revenuePerClick > 0 ? formatCurrency(detail.revenuePerClick) : "—",
                },
              ].map((item) => (
                <div key={item.label} className={`ub-drawer-total${item.accent ? " is-accent" : ""}`}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <section className="ub-drawer-block">
              <h4>{t("Journey")}</h4>
              <FunnelBars detail={detail} t={t} />
            </section>

            {detail.totals.revenue > 0 ? (
              <section className="ub-drawer-block">
                <h4>{t("Revenue split")}</h4>
                <div className="ub-split">
                  {[
                    { label: t("First deposit"), value: detail.totals.ftdRevenue, color: "var(--teal)" },
                    { label: t("Redeposits"), value: detail.totals.redepositRevenue, color: "var(--green)" },
                  ].map((part) => {
                    const base = detail.totals.ftdRevenue + detail.totals.redepositRevenue;
                    const pct = base > 0 ? (part.value / base) * 100 : 0;
                    return (
                      <div className="ub-split-row" key={part.label}>
                        <span className="ub-split-label">{part.label}</span>
                        <span className="ub-split-track">
                          <span style={{ width: `${pct}%`, background: part.color }} />
                        </span>
                        <span className="ub-split-value">{formatCurrency(part.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {detail.days.length > 1 ? (
              <section className="ub-drawer-block">
                <h4>{t("Activity by day")}</h4>
                {/* Clicks as bars, revenue as a line on its own axis: revenue is
                    orders of magnitude smaller and would be a flat zero if both
                    shared one scale. */}
                <div className="chart chart-surface">
                  <ResponsiveContainer width="100%" height={148}>
                    <ComposedChart data={detail.days} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="key"
                        tickLine={false}
                        axisLine={false}
                        tick={axisTick}
                        minTickGap={28}
                        tickFormatter={(value) => String(value).slice(5)}
                      />
                      <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={axisTick} width={34} />
                      <YAxis yAxisId="right" orientation="right" hide />
                      <Tooltip
                        contentStyle={tooltipSurface}
                        formatter={(value, name) =>
                          name === "revenue"
                            ? [formatCurrency(value), t("Revenue")]
                            : [Number(value).toLocaleString(), t("Clicks")]
                        }
                      />
                      <Bar yAxisId="left" dataKey="clicks" fill="rgba(100,184,255,0.5)" radius={[3, 3, 0, 0]} />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--green)"
                        strokeWidth={2}
                        dot={{ r: 2.5, fill: "var(--green)", strokeWidth: 0 }}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </section>
            ) : null}

            {[
              { title: t("Campaigns"), items: detail.campaigns, money: true },
              { title: t("Countries"), items: detail.countries, money: true },
              { title: t("Cities"), items: detail.cities, money: false },
              { title: t("Devices"), items: detail.devices, money: false },
            ].map((block) =>
              block.items.length ? (
                <section className="ub-drawer-block" key={block.title}>
                  <h4>{block.title}</h4>
                  <Breakdown items={block.items} t={t} money={block.money} />
                </section>
              ) : null
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
