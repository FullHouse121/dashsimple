import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Pause, RefreshCw, Download, Search, X, Copy, CheckCircle, CreditCard } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { apiFetch } from "../lib/api.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { isAllSelection } from "../lib/filters.js";
import { formatCurrency, axisTickStyle, tooltipStyle, csvCell } from "../lib/format.js";
import { CountryFlag, OsGlyph, osHasGlyph } from "../components/flags.jsx";
import { Select } from "../components/Select.jsx";
import { useLiveFeed, parseTrackerMs, useWindowSeries } from "../lib/useLiveFeed.js";
import { CopyToast, useCopyToast } from "../components/CopyToast.jsx";
import {
  LIVE_CLICKS_WINDOWS,
  LIVE_CLICKS_IS_ROLLING,
  LIVE_CLICKS_RENDER_CAP,
  SUB_MEANINGS,
  liveClickSubIssues,
} from "../lib/live.js";

// Conversion log from Keitaro: every postback (registration / ftd /
// redeposit) with revenue, original payout, click→conversion lag and the full
// UTM set — the buyer-facing deep-dive companion to Live Clicks.
// Chips follow the Tracking Links flow-pill shape: neutral surface, the
// status meaning carried by the dot colour (blue reg / green FTD / amber
// redeposit) rather than by tinting the whole pill.
const CONVERSION_STATUS_META = {
  registration: { label: "Registration", dot: "#58b1ff" },
  ftd: { label: "FTD", dot: "#36d07c" },
  redeposit: { label: "Redeposit", dot: "#ffbf5c" },
};

export default function ConversionsDashboard({ authUser, viewerBuyer }) {
  const isLeadership = isLeadershipRole(authUser?.role);
  const [statusFilter, setStatusFilter] = React.useState("All");
  // null when "All"; otherwise the status the whole view is narrowed to.
  const statusKey = isAllSelection(statusFilter) ? null : statusFilter;
  // Flow filter — the viewer's Keitaro campaigns (buyer-scoped server-side).
  // Like status, filtered IN Keitaro via campaign_id so the row cap can't
  // hide matches outside the newest slice.
  const [flowOptions, setFlowOptions] = React.useState([]);
  const [flowFilter, setFlowFilter] = React.useState("");
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetch("/api/keitaro/buyer-campaigns");
        const data = response.ok ? await response.json() : { campaigns: [] };
        if (!cancelled) setFlowOptions(Array.isArray(data?.campaigns) ? data.campaigns : []);
      } catch {
        if (!cancelled) setFlowOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const flowName = React.useMemo(
    () => flowOptions.find((c) => String(c.id) === String(flowFilter))?.name || "",
    [flowOptions, flowFilter]
  );
  const {
    rows,
    meta,
    feedState: convState,
    windowValue: windowMinutes,
    setWindowValue: setWindowMinutes,
    customRange,
    setCustomRange,
    paused,
    setPaused,
    lastFetchedAt,
    refresh: fetchConversions,
    trackerNowMs,
    agoLabel,
    windowElapsedMinutes,
  } = useLiveFeed({
    endpoint: "/api/keitaro/conversions-live",
    failLabel: "Failed to load conversions.",
    // Filter in Keitaro, not client-side: the raw fetch caps at the 1,000
    // NEWEST rows, so filtering locally over a multi-day window only ever saw
    // matches inside the newest slice.
    extraParams: { status: statusKey || "", campaign_id: flowFilter || "" },
  });
  const { toast: copyToast, copyText } = useCopyToast();
  // Multi-day windows exceed the 1,000-row cap — chart and count those from
  // Keitaro's daily aggregate (null for today/yesterday/rolling).
  const aggregateRows = useWindowSeries({ windowValue: windowMinutes, trackerNow: meta?.trackerNow, customRange });
  const [search, setSearch] = React.useState("");
  const [buyerFilter, setBuyerFilter] = React.useState("All");
  const [expandedId, setExpandedId] = React.useState(null);

  // Union raw + aggregate buyers: a status-filtered (or capped) raw feed only
  // holds a slice, and the dropdown must not lose options because of it.
  const buyers = React.useMemo(() => {
    const set = new Set();
    rows.forEach((row) => {
      if (row.buyer) set.add(row.buyer);
    });
    (aggregateRows || []).forEach((row) => {
      if (row.buyer) set.add(row.buyer);
    });
    return ["All", ...Array.from(set).sort()];
  }, [rows, aggregateRows]);
  // Known statuses always offered — with the filter applied server-side the
  // loaded rows are all one status, which must not collapse the options.
  const statuses = React.useMemo(() => {
    const set = new Set(Object.keys(CONVERSION_STATUS_META));
    rows.forEach((row) => {
      if (row.status) set.add(row.status);
    });
    return ["All", ...Array.from(set).sort()];
  }, [rows]);

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (isLeadership && !isAllSelection(buyerFilter) && row.buyer !== buyerFilter) return false;
      if (!isAllSelection(statusFilter) && row.status !== statusFilter) return false;
      if (!q) return true;
      const subsText = Object.values(row.subs || {}).join(" ");
      const hay = `${row.campaign} ${row.buyer} ${row.clickId} ${row.externalId} ${row.tid} ${row.status} ${row.country} ${row.city} ${row.offer} ${subsText}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, buyerFilter, statusFilter, isLeadership]);

  // Click → conversion lag, the "how long did this take to convert" signal.
  const lagLabel = (clickDatetime, convDatetime) => {
    const a = parseTrackerMs(clickDatetime);
    const b = parseTrackerMs(convDatetime);
    if (a === null || b === null || b < a) return null;
    const seconds = Math.floor((b - a) / 1000);
    if (seconds < 60) return `${seconds}s after click`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m after click`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h after click`;
    return `${Math.floor(seconds / 86400)}d after click`;
  };

  // Buyer/flow scoping on the aggregate (uncapped, so a client-side campaign
  // match is safe — unlike the capped raw log).
  const scopedAggregate = React.useMemo(() => {
    if (!aggregateRows) return null;
    let scoped = aggregateRows;
    if (flowName) scoped = scoped.filter((row) => row.campaign === flowName);
    if (isLeadership && !isAllSelection(buyerFilter)) {
      scoped = scoped.filter((row) => row.buyer === buyerFilter);
    }
    return scoped;
  }, [aggregateRows, isLeadership, buyerFilter, flowName]);
  const aggregateTotals = React.useMemo(() => {
    if (!scopedAggregate) return null;
    return scopedAggregate.reduce(
      (acc, row) => ({
        registrations: acc.registrations + (Number(row.registers) || 0),
        ftds: acc.ftds + (Number(row.ftds) || 0),
        redeposits: acc.redeposits + (Number(row.redeposits) || 0),
        revenue: acc.revenue + (Number(row.revenue) || 0),
      }),
      { registrations: 0, ftds: 0, redeposits: 0, revenue: 0 }
    );
  }, [scopedAggregate]);
  // The daily aggregate splits counts per status (registers/ftds/redeposits),
  // so it can stand in under a status filter. But the filter runs in Keitaro
  // now, so a filtered fetch that fits under the row cap is the exact full
  // window — then the raw rows drive everything and cards/table/chart agree.
  // The aggregate steps in only when the filtered log overflows the cap (its
  // counts are Keitaro's deduped metrics, which can differ from log rows).
  const STATUS_AGG_FIELD = { registration: "registrations", ftd: "ftds", redeposit: "redeposits" };
  const usingAggregate = Boolean(
    aggregateTotals &&
      !search.trim() &&
      aggregateTotals.registrations + aggregateTotals.ftds + aggregateTotals.redeposits > 0 &&
      (!statusKey || (STATUS_AGG_FIELD[statusKey] && Boolean(meta?.truncated)))
  );
  const registrations = usingAggregate ? aggregateTotals.registrations : filteredRows.filter((row) => row.status === "registration").length;
  const ftds = usingAggregate ? aggregateTotals.ftds : filteredRows.filter((row) => row.status === "ftd").length;
  const redeposits = usingAggregate ? aggregateTotals.redeposits : filteredRows.filter((row) => row.status === "redeposit").length;
  const convCount = usingAggregate
    ? statusKey
      ? aggregateTotals[STATUS_AGG_FIELD[statusKey]]
      : registrations + ftds + redeposits
    : filteredRows.length;
  // Any count derived from a truncated fetch is a lower bound — filtered or
  // not — so the cap marker must not disappear when a filter trims the rows.
  const isCapped = !usingAggregate && Boolean(meta?.truncated);
  const plus = isCapped ? "+" : "";
  // Revenue under a status filter: the aggregate splits FTD and redeposit
  // revenue; registrations carry the remainder (≈0 on this tracker). Older API
  // payloads lack the split — fall back to the loaded rows' sum then.
  const rawRevenue = filteredRows.reduce((acc, row) => acc + (row.revenue || 0), 0);
  const aggregateHasSplit = Boolean(scopedAggregate?.some((row) => row.ftd_revenue !== undefined));
  const revenueTotal = usingAggregate
    ? statusKey
      ? aggregateHasSplit
        ? scopedAggregate.reduce((acc, row) => {
            const ftdRev = Number(row.ftd_revenue) || 0;
            const redepRev = Number(row.redeposit_revenue) || 0;
            if (statusKey === "ftd") return acc + ftdRev;
            if (statusKey === "redeposit") return acc + redepRev;
            return acc + Math.max(0, (Number(row.revenue) || 0) - ftdRev - redepRev);
          }, 0)
        : rawRevenue
      : aggregateTotals.revenue
    : rawRevenue;


  // Conversions + revenue per bucket for the timeline.
  const convSeries = React.useMemo(() => {
    // Aggregate path: one point per day, exact totals, no cap.
    if (usingAggregate && scopedAggregate?.length) {
      const byDay = new Map();
      scopedAggregate.forEach((row) => {
        const day = String(row.date || "").slice(0, 10);
        if (!day) return;
        const entry = byDay.get(day) || { conversions: 0, revenue: 0 };
        const regs = Number(row.registers) || 0;
        const ftdCount = Number(row.ftds) || 0;
        const redepCount = Number(row.redeposits) || 0;
        const rev = Number(row.revenue) || 0;
        const ftdRev = Number(row.ftd_revenue) || 0;
        const redepRev = Number(row.redeposit_revenue) || 0;
        entry.conversions +=
          statusKey === "registration" ? regs
          : statusKey === "ftd" ? ftdCount
          : statusKey === "redeposit" ? redepCount
          : regs + ftdCount + redepCount;
        entry.revenue +=
          statusKey === "ftd" ? ftdRev
          : statusKey === "redeposit" ? redepRev
          : statusKey === "registration" ? Math.max(0, rev - ftdRev - redepRev)
          : rev;
        byDay.set(day, entry);
      });
      return [...byDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, entry]) => ({
          label: day.slice(5),
          conversions: entry.conversions,
          revenue: Number(entry.revenue.toFixed(2)),
        }));
    }
    if (!filteredRows.length) return [];
    const stepMin =
      windowElapsedMinutes <= 90 ? 2
      : windowElapsedMinutes <= 240 ? 5
      : windowElapsedMinutes <= 900 ? 15
      : windowElapsedMinutes <= 2 * 1440 ? 60
      : 1440;
    const stepMs = stepMin * 60 * 1000;
    const counts = new Map();
    let oldest = Infinity;
    let newest = -Infinity;
    filteredRows.forEach((row) => {
      const ms = parseTrackerMs(row.datetime);
      if (ms === null) return;
      const bucket = Math.floor(ms / stepMs) * stepMs;
      const entry = counts.get(bucket) || { conversions: 0, revenue: 0 };
      entry.conversions += 1;
      entry.revenue += row.revenue || 0;
      counts.set(bucket, entry);
      if (bucket < oldest) oldest = bucket;
      if (bucket > newest) newest = bucket;
    });
    if (!Number.isFinite(oldest)) return [];
    const series = [];
    for (let bucket = oldest; bucket <= newest; bucket += stepMs) {
      const iso = new Date(bucket).toISOString();
      const entry = counts.get(bucket);
      series.push({
        label: stepMin >= 1440 ? iso.slice(5, 10) : iso.slice(11, 16),
        conversions: entry?.conversions || 0,
        revenue: Number((entry?.revenue || 0).toFixed(2)),
      });
    }
    return series;
  }, [filteredRows, windowElapsedMinutes, usingAggregate, scopedAggregate, statusKey]);

  const visibleRows = filteredRows.slice(0, LIVE_CLICKS_RENDER_CAP);
  const statusChip = (status) => {
    const statusMeta = CONVERSION_STATUS_META[status];
    return (
      <span className="conv-status">
        <i
          className="conv-status-dot"
          style={{ background: statusMeta?.dot || "var(--muted)" }}
          aria-hidden="true"
        />
        {statusMeta?.label || status || "—"}
      </span>
    );
  };

  const exportCsv = () => {
    const quote = csvCell;
    const header = [
      "Postback Time", "Click Time", "Buyer", "Campaign", "Status", "Revenue",
      "Payout", "Currency", "Country", "City", "Click ID", "External ID", "TID",
      "Offer", "Stream", ...Array.from({ length: 11 }, (_, i) => `Sub ${i + 1}`),
    ].join(",");
    const lines = filteredRows.map((row) =>
      [
        quote(row.datetime), quote(row.clickDatetime), quote(row.buyer), quote(row.campaign),
        quote(row.status), row.revenue.toFixed(2), quote(row.payout), quote(row.currency),
        quote(row.country), quote(row.city), quote(row.clickId), quote(row.externalId),
        quote(row.tid), quote(row.offer), quote(row.stream),
        ...Array.from({ length: 11 }, (_, i) => quote(row.subs?.[i + 1] ?? "")),
      ].join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversions-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const healthCards = [
    {
      label: "Conversions",
      value: `${convCount.toLocaleString()}${plus}`,
      meta: isCapped ? "newest 1,000 loaded — older rows not counted" : "in window",
      tone: convCount > 0 ? "ok" : "bad",
    },
    {
      label: "Registrations",
      value: registrations.toLocaleString(),
      meta: convCount ? `${((registrations / convCount) * 100).toFixed(1)}% of conversions` : "—",
      tone: "none",
    },
    {
      label: "FTDs",
      value: ftds.toLocaleString(),
      meta: registrations ? `${((ftds / registrations) * 100).toFixed(1)}% Reg → FTD` : "no registrations",
      tone: ftds > 0 ? "ok" : "none",
    },
    {
      label: "Redeposits",
      value: redeposits.toLocaleString(),
      meta: ftds ? `${(redeposits / Math.max(1, ftds)).toFixed(1)}× per FTD` : "—",
      tone: "none",
    },
    {
      label: "Revenue",
      value: formatCurrency(revenueTotal),
      meta: convCount ? `${formatCurrency(revenueTotal / convCount)} avg per conversion` : "—",
      tone: revenueTotal > 0 ? "ok" : "none",
    },
  ];

  return (
    <>
      <CopyToast toast={copyToast} />

      <section className="cards conversions-cards">
        {healthCards.map((card, idx) => (
          <motion.div
            key={card.label}
            className={`card live-click-card tone-${card.tone}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.45 }}
          >
            <div className="card-head">{card.label}</div>
            <div className="card-value">{card.value}</div>
            <div className="card-meta">{card.meta}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels panels-single">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Conversions Timeline</h3>
              <p className="panel-subtitle">
                {windowMinutes === "custom"
                  ? `${customRange.from} → ${customRange.to}`
                  : LIVE_CLICKS_WINDOWS.find((w) => w.value === windowMinutes)?.label || "Window"} — conversions and revenue.
              </p>
            </div>
          </div>
          <div className="chart chart-surface">
            {convSeries.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={convSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="convArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#36d07c" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#36d07c" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    tick={axisTickStyle}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) =>
                      name === "Revenue"
                        ? [formatCurrency(Number(value) || 0), name]
                        : [Number(value).toLocaleString(), name]
                    }
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 6, color: "#9aa0aa", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    name="Conversions"
                    stroke="#36d07c"
                    strokeWidth={2}
                    fill="url(#convArea)"
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    yAxisId="revenue"
                    stroke="#ffd86b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">Not enough conversions in this window to chart.</div>
            )}
          </div>
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#36d07c" }}>
                <CreditCard size={15} strokeWidth={2.2} />
              </span>
              <div>
                <h3 className="panel-title">Conversion Log</h3>
              </div>
            </div>
            <div className="campaign-table-actions">
              <span className={`live-indicator${paused ? " is-paused" : ""}`}>
                <i aria-hidden="true" />
                {paused ? "Paused" : "Live"}
              </span>
              <span className="roles-count">
                {filteredRows.length.toLocaleString()}{plus} conversions · updated {lastFetchedAt ? `${Math.max(0, Math.floor((Date.now() - lastFetchedAt) / 1000))}s ago` : "—"}
              </span>
              <button
                type="button"
                className="icon-btn"
                title={paused ? "Resume auto-refresh" : "Pause auto-refresh"}
                onClick={() => setPaused((prev) => !prev)}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button type="button" className="icon-btn" title="Refresh now" onClick={fetchConversions}>
                <RefreshCw size={14} />
              </button>
              <button type="button" className="icon-btn" title="Export CSV" onClick={exportCsv}>
                <Download size={14} />
              </button>
            </div>
          </div>

          <div className={`pixel-table-toolbar conversions-toolbar${windowMinutes === "custom" ? " has-custom-range" : ""}`}>
            <div className="field registry-search-field">
              <label>Search</label>
              <div className="registry-search">
                <Search size={14} aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Campaign, click id, tid, sub…"
                />
                {search ? (
                  <button
                    type="button"
                    className="registry-search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="field">
              <label>Window</label>
              <Select
                value={windowMinutes}
                onChange={(v) => setWindowMinutes(v)}
                options={LIVE_CLICKS_WINDOWS}
                placeholder="Window"
              />
            </div>
            {windowMinutes === "custom" ? (
              <div className="field live-custom-range">
                <label>From — To</label>
                <div className="live-custom-range-inputs">
                  <input
                    type="date"
                    value={customRange.from}
                    max={customRange.to || undefined}
                    onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))}
                  />
                  <input
                    type="date"
                    value={customRange.to}
                    min={customRange.from || undefined}
                    onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>
            ) : null}
            <div className="field">
              <label>Status</label>
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                options={statuses.map((status) => ({
                  value: status,
                  label: status === "All" ? "All" : CONVERSION_STATUS_META[status]?.label || status,
                }))}
                placeholder="Status"
              />
            </div>
            {isLeadership ? (
              <div className="field">
                <label>Buyer</label>
                <Select
                  value={buyerFilter}
                  onChange={(v) => setBuyerFilter(v)}
                  options={buyers.map((buyer) => ({ value: buyer, label: buyer }))}
                  placeholder="Buyer"
                  searchPlaceholder="Find buyer"
                />
              </div>
            ) : null}
            {flowOptions.length ? (
              <div className="field">
                <label>Flow</label>
                <Select
                  value={flowFilter}
                  onChange={(v) => setFlowFilter(v === "" ? "" : String(v))}
                  options={flowOptions.map((c) => ({ value: String(c.id), label: c.name }))}
                  allOption={{ value: "", label: "All flows" }}
                  placeholder="All flows"
                  searchPlaceholder="Find flow"
                />
              </div>
            ) : null}
          </div>

          {convState.loading && !rows.length ? (
            <div className="empty-state">Loading conversions…</div>
          ) : convState.error && !rows.length ? (
            <div className="empty-state error">{convState.error}</div>
          ) : !filteredRows.length ? (
            <div className="empty-state">No conversions in this window.</div>
          ) : (
            <>
              <div className="table-wrap live-clicks-wrap">
                <table className="entries-table stats-table live-clicks-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Buyer</th>
                      <th>Campaign</th>
                      <th>Status</th>
                      <th>Revenue</th>
                      <th>GEO</th>
                      <th>Click ID</th>
                      <th>External ID</th>
                      <th>TID</th>
                      <th>Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => {
                      const isExpanded = expandedId === row.id;
                      const lag = lagLabel(row.clickDatetime, row.datetime);
                      return (
                        <React.Fragment key={row.id}>
                        <tr
                          className={`live-click-row${isExpanded ? " is-expanded" : ""}`}
                          onClick={() => setExpandedId((prev) => (prev === row.id ? null : row.id))}
                        >
                          <td className="live-click-time" title={row.datetime}>
                            <span>{String(row.datetime).slice(11) || "—"}</span>
                            <em>{agoLabel(row.datetime)}</em>
                          </td>
                          <td>{row.buyer || "—"}</td>
                          <td className="live-click-campaign" title={row.campaign}>
                            {row.campaign || "—"}
                          </td>
                          <td>{statusChip(row.status)}</td>
                          <td className={row.revenue > 0 ? "conv-revenue" : undefined}>
                            {row.revenue > 0 ? formatCurrency(row.revenue) : <span className="lc-dim-dash">—</span>}
                          </td>
                          <td
                            className="live-click-geo"
                            title={`${row.country}${row.city ? ` · ${row.city}` : ""}`}
                          >
                            <CountryFlag value={row.countryCode || row.country} size={15} />
                            {row.city ? <em className="live-click-dim">{row.city}</em> : null}
                            {!row.countryCode && !row.country && !row.city ? "—" : null}
                          </td>
                          <td>
                            {row.clickId ? (
                              <button
                                type="button"
                                className="lc-id-pill"
                                title={`${row.clickId} — click to copy`}
                                onClick={(e) => { e.stopPropagation(); copyText(row.clickId, e); }}
                              >
                                <i className="lc-id-dot lc-id-dot-click" aria-hidden="true" />
                                <span>{row.clickId}</span>
                              </button>
                            ) : (
                              <span className="lc-dim-dash">—</span>
                            )}
                          </td>
                          <td>
                            {row.externalId ? (
                              <button
                                type="button"
                                className="lc-id-pill"
                                title={`${row.externalId} — click to copy`}
                                onClick={(e) => { e.stopPropagation(); copyText(row.externalId, e); }}
                              >
                                <i className="lc-id-dot lc-id-dot-ext" aria-hidden="true" />
                                <span>{row.externalId}</span>
                              </button>
                            ) : (
                              <span className="lc-dim-dash">—</span>
                            )}
                          </td>
                          <td className="conv-tid" title={row.tid}>
                            {row.tid || <span className="lc-dim-dash">—</span>}
                          </td>
                          <td
                            className="live-click-device"
                            title={`${row.os} · ${row.browser} · ${row.deviceType}`}
                          >
                            {osHasGlyph(row.os) ? (
                              <span className="live-click-os" title={row.os}>
                                <OsGlyph os={row.os} size={15} />
                              </span>
                            ) : (
                              <span>{row.os || "—"}</span>
                            )}
                            {row.browser ? <em className="live-click-dim">{row.browser}</em> : null}
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr className="live-click-detail-row">
                            <td colSpan={10}>
                              <div className="live-click-detail">
                                <div className="live-click-detail-head">
                                  <span className="live-click-detail-title">
                                    {row.campaign || "Conversion detail"}
                                  </span>
                                  <button
                                    type="button"
                                    className="icon-btn"
                                    title="Close"
                                    onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                                <div className="live-click-detail-meta" style={{ borderTop: 0, paddingTop: 0, marginBottom: 14 }}>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Status</span>
                                    <span className="lc-detail-value">{statusChip(row.status)}</span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Revenue</span>
                                    <span className="lc-detail-value">
                                      {row.revenue > 0 ? formatCurrency(row.revenue) : "—"}
                                      {row.payout ? (
                                        <em className="live-click-dim"> ({row.payout} {row.currency})</em>
                                      ) : null}
                                    </span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Conversion time</span>
                                    <span className="lc-detail-value">
                                      {row.datetime || "—"}
                                      {lag ? <em className="live-click-dim"> · {lag}</em> : null}
                                    </span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Click time</span>
                                    <span className="lc-detail-value">{row.clickDatetime || "—"}</span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">TID</span>
                                    <span className="lc-detail-value">{row.tid || "—"}</span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Offer</span>
                                    <span className="lc-detail-value">{row.offer || "—"}</span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Stream</span>
                                    <span className="lc-detail-value">{row.stream || "—"}</span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Device</span>
                                    <span className="lc-detail-value">
                                      {[row.os, row.browser, row.deviceType].filter(Boolean).join(" · ") || "—"}
                                    </span>
                                  </div>
                                </div>
                                <div className="live-click-detail-grid">
                                  {Array.from({ length: 11 }, (_, i) => {
                                    const value = String(row.subs?.[i + 1] ?? "").trim();
                                    return (
                                      <div className="lc-detail-field" key={`conv-sub-${i + 1}`}>
                                        <span className="lc-detail-label">Sub {i + 1} · {SUB_MEANINGS[i + 1]}</span>
                                        <span className="lc-detail-value">
                                          {value || "—"}
                                          {value ? (
                                            <button
                                              type="button"
                                              className="icon-btn lc-detail-copy"
                                              title={`Copy Sub ${i + 1}`}
                                              onClick={(e) => { e.stopPropagation(); copyText(value, e); }}
                                            >
                                              <Copy size={10} />
                                            </button>
                                          ) : null}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > LIVE_CLICKS_RENDER_CAP ? (
                <p className="field-hint" style={{ marginTop: 8 }}>
                  Showing the {LIVE_CLICKS_RENDER_CAP} most recent of {filteredRows.length.toLocaleString()}{plus} conversions — narrow the window or search, or export the CSV for everything loaded.
                </p>
              ) : null}
            </>
          )}
        </motion.div>
      </section>
    </>
  );
}

