import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
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

export const CopyId = ({ value, onCopy }) => {
  const [copied, setCopied] = React.useState(false);
  if (!value) return <span className="ub-id ub-id-empty">—</span>;
  return (
    <button
      type="button"
      className={`ub-id${copied ? " is-copied" : ""}`}
      title={value}
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
      <span className="ub-id-text">{shortId(value)}</span>
      <span className="ub-id-hint">{copied ? "copied" : "copy"}</span>
    </button>
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

  return (
    <div className="ub-tiers">
      <div className="ub-tiers-bar" role="img" aria-label={t("Player mix by depth")}>
        {tiers.map((tier) =>
          tier.count ? (
            <span
              key={tier.key}
              className="ub-tiers-seg"
              style={{ flexGrow: tier.count, background: tier.color }}
              title={`${t(tier.label)} — ${tier.count.toLocaleString()}`}
            />
          ) : null
        )}
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
export const TopPlayers = ({ users, t = (x) => x, onSelect, metric = "revenue" }) => {
  const data = React.useMemo(
    () =>
      [...users]
        .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
        .slice(0, 8)
        .map((user, index) => ({ ...user, rank: index + 1, label: shortId(user.externalId) })),
    [users, metric]
  );
  if (!data.length) return <div className="empty-state">{t("No user behavior data available.")}</div>;

  const isMoney = metric === "revenue" || metric === "ftdRevenue";
  return (
    <div className="chart chart-surface">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, left: 4, bottom: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
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
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={tooltipSurface}
            formatter={(value) => [isMoney ? formatCurrency(value) : Number(value).toLocaleString(), t("Value")]}
            labelFormatter={(_label, payload) => payload?.[0]?.payload?.externalId || ""}
          />
          <Bar dataKey={metric} radius={[0, 8, 8, 0]} barSize={22} cursor="pointer"
               onClick={(entry) => onSelect?.(entry?.payload || entry)}>
            {data.map((row) => (
              <Cell key={row.externalId} fill={row.rank === 1 ? "var(--green)" : "rgba(54, 208, 124, 0.42)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── revenue concentration ─────────────────────────────────────────────────
// The question this answers is "how exposed am I?" — if 3% of players carry
// 80% of revenue, losing one of them is a bad month, and that risk is
// invisible in any per-user bar chart.
export const buildConcentration = (users) => {
  const earners = users.filter((user) => (user.revenue || 0) > 0).sort((a, b) => b.revenue - a.revenue);
  const total = earners.reduce((acc, user) => acc + user.revenue, 0);
  if (!earners.length || total <= 0) return { points: [], total: 0, earners: 0, p10: 0, top1: 0 };
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
  return { points, total, earners: earners.length, p10: at(10), top1: at(1) };
};

export const Concentration = ({ users, t = (x) => x }) => {
  const { points, earners, p10 } = React.useMemo(() => buildConcentration(users), [users]);
  if (!points.length) return <div className="empty-state">{t("No revenue in this period.")}</div>;

  return (
    <>
      <div className="ub-conc-callout">
        <strong>{p10.toFixed(0)}%</strong>
        <span>
          {t("of revenue comes from the top 10% of paying players")}
          <em>{` (${Math.max(1, Math.ceil(earners * 0.1)).toLocaleString()} ${t("of")} ${earners.toLocaleString()})`}</em>
        </span>
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
// Built entirely from rows already in memory: /api/user-behavior returns the
// (date, external_id, buyer, campaign, country) grain, so a player's campaigns,
// geos and daily timeline need no extra request.
export const buildUserDetail = (rows, externalId) => {
  const mine = rows.filter(
    (row) => String(row.external_id || row.externalId || "").trim() === externalId
  );
  const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
  const revenueOf = (row) => {
    const direct = num(row.revenue);
    return direct > 0 ? direct : num(row.ftd_revenue ?? row.ftdRevenue) + num(row.redeposit_revenue ?? row.redepositRevenue);
  };

  const totals = { clicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0 };
  const byCampaign = new Map();
  const byCountry = new Map();
  const byDay = new Map();

  mine.forEach((row) => {
    const revenue = revenueOf(row);
    totals.clicks += num(row.clicks);
    totals.registers += num(row.registers);
    totals.ftds += num(row.ftds);
    totals.redeposits += num(row.redeposits);
    totals.revenue += revenue;

    const bump = (map, key, extra = {}) => {
      if (!key) return;
      const cur = map.get(key) || { key, clicks: 0, ftds: 0, redeposits: 0, revenue: 0, ...extra };
      cur.clicks += num(row.clicks);
      cur.ftds += num(row.ftds);
      cur.redeposits += num(row.redeposits);
      cur.revenue += revenue;
      map.set(key, cur);
    };
    bump(byCampaign, String(row.campaign || "").trim());
    bump(byCountry, String(row.country || "").trim());
    bump(byDay, String(row.date || "").slice(0, 10));
  });

  const desc = (map) => [...map.values()].sort((a, b) => b.revenue - a.revenue || b.clicks - a.clicks);
  return {
    externalId,
    rowCount: mine.length,
    buyer: mine.find((row) => row.buyer)?.buyer || "",
    totals,
    campaigns: desc(byCampaign),
    countries: desc(byCountry),
    days: [...byDay.values()].sort((a, b) => String(a.key).localeCompare(String(b.key))),
  };
};

export const UserDetail = ({ externalId, rows, onClose, t = (x) => x }) => {
  const detail = React.useMemo(
    () => (externalId ? buildUserDetail(rows, externalId) : null),
    [externalId, rows]
  );

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
              <div>
                <p className="ub-drawer-eyebrow">{t("Player")}</p>
                <h3 className="ub-drawer-id">{detail.externalId}</h3>
                <p className="ub-drawer-sub">
                  {detail.buyer ? `${detail.buyer} · ` : ""}
                  {detail.rowCount.toLocaleString()} {t("tracked rows")}
                </p>
              </div>
              <button type="button" className="ub-drawer-close" onClick={onClose} aria-label={t("Close")}>
                ×
              </button>
            </header>

            <div className="ub-drawer-totals">
              {[
                { label: t("Revenue"), value: formatCurrency(detail.totals.revenue), accent: true },
                { label: t("Clicks"), value: detail.totals.clicks.toLocaleString() },
                { label: t("Registers"), value: detail.totals.registers.toLocaleString() },
                { label: t("FTDs"), value: detail.totals.ftds.toLocaleString() },
                { label: t("Redeposits"), value: detail.totals.redeposits.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className={`ub-drawer-total${item.accent ? " is-accent" : ""}`}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            {detail.days.length > 1 ? (
              <section className="ub-drawer-block">
                <h4>{t("Activity")}</h4>
                <div className="chart chart-surface">
                  <ResponsiveContainer width="100%" height={116}>
                    <AreaChart data={detail.days} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <XAxis dataKey="key" tickLine={false} axisLine={false} tick={axisTick} minTickGap={24} />
                      <Tooltip
                        contentStyle={tooltipSurface}
                        formatter={(value, name) => [
                          name === "revenue" ? formatCurrency(value) : Number(value).toLocaleString(),
                          name === "revenue" ? t("Revenue") : t("Clicks"),
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="var(--blue)"
                        strokeWidth={1.5}
                        fill="rgba(100,184,255,0.12)"
                        isAnimationActive={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--green)"
                        strokeWidth={2}
                        fill="rgba(54,208,124,0.16)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            ) : null}

            {[
              { title: t("Campaigns"), items: detail.campaigns },
              { title: t("Countries"), items: detail.countries },
            ].map((block) =>
              block.items.length ? (
                <section className="ub-drawer-block" key={block.title}>
                  <h4>{block.title}</h4>
                  <ul className="ub-breakdown">
                    {block.items.slice(0, 8).map((item) => (
                      <li key={item.key}>
                        <span className="ub-breakdown-key" title={item.key}>
                          {item.key}
                        </span>
                        <span className="ub-breakdown-num">{item.clicks.toLocaleString()}</span>
                        <span className="ub-breakdown-rev">
                          {item.revenue > 0 ? formatCurrency(item.revenue) : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
