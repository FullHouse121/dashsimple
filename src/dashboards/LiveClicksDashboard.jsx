import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Play, Pause, RefreshCw, Download, Search, X, Copy, CheckCircle, Filter } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { apiFetch } from "../lib/api.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { isAllSelection } from "../lib/filters.js";
import { formatCurrency, axisTickStyle, tooltipStyle, csvCell } from "../lib/format.js";
import { CountryFlag, OsGlyph, osHasGlyph } from "../components/flags.jsx";
import { Select } from "../components/Select.jsx";
import {
  LIVE_CLICKS_WINDOWS,
  LIVE_CLICKS_IS_ROLLING,
  LIVE_CLICKS_RENDER_CAP,
  SUB_MEANINGS,
  liveClickSubIssues,
} from "../lib/live.js";

// Near-real-time click stream from Keitaro's click log. Polls every 15s
// (pausable); the server caches briefly so several open dashboards don't
// hammer the tracker. The point is flow debugging: watch clicks arrive with
// their full UTM set (sub1–11) and destination, and catch broken tagging —
// empty subs or unfilled {macro} literals — the minute a campaign launches.
export default function LiveClicksDashboard({ authUser, viewerBuyer }) {
  const isLeadership = isLeadershipRole(authUser?.role);
  const [rows, setRows] = React.useState([]);
  const [meta, setMeta] = React.useState(null); // { trackerNow, window, timezone }
  const [clicksState, setClicksState] = React.useState({ loading: true, error: null });
  const [windowMinutes, setWindowMinutes] = React.useState("today");
  const [paused, setPaused] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [buyerFilter, setBuyerFilter] = React.useState("All");
  const [issuesOnly, setIssuesOnly] = React.useState(false);
  const [lastFetchedAt, setLastFetchedAt] = React.useState(null);
  const [expandedId, setExpandedId] = React.useState(null); // row inspected
  const [, setClock] = React.useState(0); // 1s re-render so "Xs ago" ticks
  const [copyToast, setCopyToast] = React.useState({
    visible: false, type: "success", message: "", left: 0, top: 0, above: true,
  });
  const copyToastTimeoutRef = React.useRef(null);
  React.useEffect(() => () => {
    if (copyToastTimeoutRef.current) clearTimeout(copyToastTimeoutRef.current);
  }, []);
  const showCopyToast = React.useCallback((type, message, anchorRect) => {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
    const rawLeft = anchorRect ? anchorRect.left + anchorRect.width / 2 : viewportWidth / 2;
    const clampedLeft = Math.max(170, Math.min(viewportWidth - 170, rawLeft));
    const showAbove = anchorRect ? anchorRect.top > 72 : true;
    const top = anchorRect ? (showAbove ? anchorRect.top - 10 : anchorRect.bottom + 10) : 72;
    if (copyToastTimeoutRef.current) clearTimeout(copyToastTimeoutRef.current);
    setCopyToast({ visible: true, type, message, left: clampedLeft, top, above: showAbove });
    copyToastTimeoutRef.current = setTimeout(() => {
      setCopyToast((prev) => ({ ...prev, visible: false }));
    }, 1400);
  }, []);

  const fetchClicks = React.useCallback(async () => {
    try {
      const rolling = LIVE_CLICKS_IS_ROLLING(windowMinutes);
      const limit = rolling && Number(windowMinutes) < 180 ? 600 : 1000;
      const query = rolling ? `minutes=${windowMinutes}` : `interval=${windowMinutes}`;
      const response = await apiFetch(`/api/keitaro/clicks-live?${query}&limit=${limit}`);
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load live clicks.");
      }
      const data = await response.json();
      setRows(Array.isArray(data?.rows) ? data.rows : []);
      setMeta({ trackerNow: data?.trackerNow, window: data?.window, timezone: data?.timezone, truncated: Boolean(data?.truncated) });
      setLastFetchedAt(Date.now());
      setClicksState({ loading: false, error: null });
    } catch (error) {
      setClicksState({ loading: false, error: error.message || "Failed to load live clicks." });
    }
  }, [windowMinutes]);

  React.useEffect(() => {
    setClicksState((prev) => ({ ...prev, loading: true }));
    fetchClicks();
  }, [fetchClicks]);

  React.useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) fetchClicks();
    }, 15000);
    return () => clearInterval(id);
  }, [fetchClicks, paused]);

  React.useEffect(() => {
    // 5s, not 1s: every tick re-renders the visible table rows (they are not
    // memoized), and second-precision "ago" labels aren't worth 5x the work.
    const id = setInterval(() => setClock((tick) => tick + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const buyers = React.useMemo(() => {
    const set = new Set();
    rows.forEach((row) => {
      if (row.buyer) set.add(row.buyer);
    });
    return ["All", ...Array.from(set).sort()];
  }, [rows]);

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (isLeadership && !isAllSelection(buyerFilter) && row.buyer !== buyerFilter) return false;
      if (issuesOnly && liveClickSubIssues(row).length === 0) return false;
      if (!q) return true;
      const subsText = Object.values(row.subs || {}).join(" ");
      const hay = `${row.campaign} ${row.buyer} ${row.clickId} ${row.externalId} ${row.country} ${row.city} ${row.destination} ${subsText}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, buyerFilter, issuesOnly, isLeadership]);

  const parseTrackerMs = (value) => {
    if (!value) return null;
    const parsed = Date.parse(`${String(value).replace(" ", "T")}Z`);
    return Number.isFinite(parsed) ? parsed : null;
  };
  // Tracker-time "now", advanced locally between polls so the ages tick.
  const trackerNowMs = (() => {
    const base = parseTrackerMs(meta?.trackerNow);
    if (base === null) return null;
    const drift = lastFetchedAt ? Date.now() - lastFetchedAt : 0;
    return base + drift;
  })();
  const agoLabel = (datetime) => {
    const ms = parseTrackerMs(datetime);
    if (ms === null || trackerNowMs === null) return "—";
    const seconds = Math.max(0, Math.floor((trackerNowMs - ms) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ago`;
  };

  const newestClick = filteredRows[0] || null;
  const clickCount = filteredRows.length;
  // The API caps at 1000 rows; when Keitaro had more, counts are a floor.
  const isCapped = Boolean(meta?.truncated) && filteredRows.length === rows.length;
  const plus = isCapped ? "+" : "";
  const windowElapsedMinutes = (() => {
    if (LIVE_CLICKS_IS_ROLLING(windowMinutes)) return Number(windowMinutes);
    const now = meta?.trackerNow ? new Date(`${meta.trackerNow.replace(" ", "T")}Z`) : null;
    if (!now) return 60;
    const midnightMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    if (windowMinutes === "today") return Math.max(1, midnightMinutes);
    if (windowMinutes === "yesterday") return 1440;
    if (windowMinutes === "this_week") {
      const weekday = (now.getUTCDay() + 6) % 7; // Monday = 0
      return Math.max(1, weekday * 1440 + midnightMinutes);
    }
    if (windowMinutes === "this_month") {
      return Math.max(1, (now.getUTCDate() - 1) * 1440 + midnightMinutes);
    }
    if (windowMinutes === "previous_month") {
      const days = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
      return days * 1440;
    }
    return 60;
  })();
  const perMinute = clickCount / Math.max(1, windowElapsedMinutes);

  // Clicks-over-time buckets for the chart: adaptive step, zero-filled from
  // the oldest LOADED click (capped windows chart only what's loaded).
  const clicksSeries = React.useMemo(() => {
    if (!filteredRows.length) return [];
    const stepMin =
      windowElapsedMinutes <= 90 ? 2
      : windowElapsedMinutes <= 240 ? 5
      : windowElapsedMinutes <= 900 ? 15
      : windowElapsedMinutes <= 2 * 1440 ? 60
      : 1440;
    const stepMs = stepMin * 60 * 1000;
    const parse = (dt) => Date.parse(`${String(dt).replace(" ", "T")}Z`);
    const counts = new Map();
    let oldest = Infinity;
    let newest = -Infinity;
    filteredRows.forEach((row) => {
      const ms = parse(row.datetime);
      if (!Number.isFinite(ms)) return;
      const bucket = Math.floor(ms / stepMs) * stepMs;
      const entry = counts.get(bucket) || { clicks: 0, uniques: 0 };
      entry.clicks += 1;
      if (row.isUnique) entry.uniques += 1;
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
        clicks: entry?.clicks || 0,
        uniques: entry?.uniques || 0,
      });
    }
    return series;
  }, [filteredRows, windowElapsedMinutes]);
  const uniqueCount = filteredRows.filter((row) => row.isUnique).length;
  const botCount = filteredRows.filter((row) => row.isBot).length;
  const proxyCount = filteredRows.filter((row) => row.isProxy).length;
  const issueRows = filteredRows.filter((row) => liveClickSubIssues(row).length > 0);
  const pct = (num) => (clickCount > 0 ? `${((num / clickCount) * 100).toFixed(1)}%` : "—");

  const visibleRows = filteredRows.slice(0, LIVE_CLICKS_RENDER_CAP);
  const copyText = (value, event) => {
    const anchorRect = event?.currentTarget?.getBoundingClientRect?.() || null;
    try {
      navigator.clipboard?.writeText(String(value || ""));
      showCopyToast("success", "Has been copied successfully", anchorRect);
    } catch {
      showCopyToast("error", "Copy failed", anchorRect);
    }
  };
  const destinationHost = (url) => {
    try {
      return new URL(url).host;
    } catch {
      return String(url || "").slice(0, 32) || "—";
    }
  };

  const exportCsv = () => {
    const quote = csvCell;
    const header = [
      "Time", "Buyer", "Campaign", "Click ID", "External ID", "Country", "City",
      "OS", "Browser", ...Array.from({ length: 11 }, (_, i) => `Sub ${i + 1}`),
      "Unique", "Bot", "Proxy", "Destination",
    ].join(",");
    const lines = filteredRows.map((row) =>
      [
        quote(row.datetime), quote(row.buyer), quote(row.campaign), quote(row.clickId),
        quote(row.externalId), quote(row.country), quote(row.city), quote(row.os),
        quote(row.browser),
        ...Array.from({ length: 11 }, (_, i) => quote(row.subs?.[i + 1] ?? "")),
        row.isUnique ? 1 : 0, row.isBot ? 1 : 0, row.isProxy ? 1 : 0,
        quote(row.destination),
      ].join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `live-clicks-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const healthCards = [
    {
      label: "Clicks",
      value: `${clickCount.toLocaleString()}${plus}`,
      meta: isCapped ? "showing the newest 1,000" : `${perMinute.toFixed(1)}/min in window`,
      tone: clickCount > 0 ? "ok" : "bad",
    },
    {
      label: "Unique Clicks",
      value: uniqueCount.toLocaleString(),
      meta: `${pct(uniqueCount)} of clicks unique`,
      tone: "none",
    },
    {
      label: "Bots / Proxy",
      value: pct(botCount),
      meta: `${botCount.toLocaleString()} bots · ${proxyCount.toLocaleString()} proxy`,
      tone: botCount / Math.max(1, clickCount) > 0.2 ? "warn" : "none",
    },
    {
      label: "UTM Issues",
      value: issueRows.length.toLocaleString(),
      meta: issueRows.length ? "empty or unfilled {macro} subs" : "all subs filled",
      tone: issueRows.length ? "warn" : "ok",
    },
  ];

  return (
    <>
      <AnimatePresence>
        {copyToast.visible ? (
          <div
            className={`copy-toast-anchor${copyToast.above ? "" : " is-below"}`}
            style={{ left: copyToast.left, top: copyToast.top }}
          >
            <motion.div
              className={`copy-toast ${copyToast.type}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              {copyToast.type === "success" ? <CheckCircle size={14} /> : <X size={14} />}
              <span>{copyToast.message}</span>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <section className="cards live-clicks-cards">
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
              <h3 className="panel-title">Clicks Timeline</h3>
              <p className="panel-subtitle">
                {LIVE_CLICKS_WINDOWS.find((w) => w.value === windowMinutes)?.label || "Window"} — clicks vs unique clicks.
              </p>
            </div>
          </div>
          <div className="chart chart-surface">
            {clicksSeries.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={clicksSeries} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="liveClicksArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3987e5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3987e5" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="liveUniquesArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#36d07c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#36d07c" stopOpacity={0.03} />
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
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [Number(value).toLocaleString(), name]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 6, color: "#9aa0aa", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    name="Clicks"
                    stroke="#3987e5"
                    strokeWidth={2}
                    fill="url(#liveClicksArea)"
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="uniques"
                    name="Unique Clicks"
                    stroke="#36d07c"
                    strokeWidth={2}
                    fill="url(#liveUniquesArea)"
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">Not enough clicks in this window to chart.</div>
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
              <span className="stats-icon-tile" style={{ "--tile-accent": "#58b1ff" }}>
                <Activity size={15} strokeWidth={2.2} />
              </span>
              <div>
                <h3 className="panel-title">Live Clicks</h3>
              </div>
            </div>
            <div className="campaign-table-actions">
              <span className={`live-indicator${paused ? " is-paused" : ""}`}>
                <i aria-hidden="true" />
                {paused ? "Paused" : "Live"}
              </span>
              <span className="roles-count">
                {filteredRows.length.toLocaleString()}{plus} clicks · updated {lastFetchedAt ? `${Math.max(0, Math.floor((Date.now() - lastFetchedAt) / 1000))}s ago` : "—"}
              </span>
              <button
                type="button"
                className="icon-btn"
                title={paused ? "Resume auto-refresh" : "Pause auto-refresh"}
                onClick={() => setPaused((prev) => !prev)}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button type="button" className="icon-btn" title="Refresh now" onClick={fetchClicks}>
                <RefreshCw size={14} />
              </button>
              <button type="button" className="icon-btn" title="Export CSV" onClick={exportCsv}>
                <Download size={14} />
              </button>
            </div>
          </div>

          <div className="pixel-table-toolbar live-clicks-toolbar">
            <div className="field registry-search-field">
              <label>Search</label>
              <div className="registry-search">
                <Search size={14} aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Campaign, click id, sub, destination…"
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
            <div className="field live-clicks-issues-field">
              <label>Filter</label>
              <button
                type="button"
                className={`ghost live-clicks-issues-toggle${issuesOnly ? " is-active" : ""}`}
                onClick={() => setIssuesOnly((prev) => !prev)}
              >
                UTM issues only
              </button>
            </div>
          </div>

          {clicksState.loading && !rows.length ? (
            <div className="empty-state">Loading live clicks…</div>
          ) : clicksState.error && !rows.length ? (
            <div className="empty-state error">{clicksState.error}</div>
          ) : !filteredRows.length ? (
            <div className="empty-state">No clicks in this window.</div>
          ) : (
            <>
              <div className="table-wrap live-clicks-wrap">
                <table className="entries-table stats-table live-clicks-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Buyer</th>
                      <th>Campaign</th>
                      <th>Click ID</th>
                      <th>External ID</th>
                      <th>GEO</th>
                      <th>Device</th>
                      {Array.from({ length: 11 }, (_, i) => (
                        <th key={`sub-${i + 1}`} title={SUB_MEANINGS[i + 1]}>
                          <span className="lc-th-sub">
                            Sub {i + 1}
                            <em>{SUB_MEANINGS[i + 1]}</em>
                          </span>
                        </th>
                      ))}
                      <th>Flags</th>
                      <th>Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => {
                      const issues = liveClickSubIssues(row);
                      const isExpanded = expandedId === row.id;
                      return (
                        <React.Fragment key={row.id}>
                        <tr
                          className={`live-click-row${row.isBot ? " live-click-row-bot" : ""}${isExpanded ? " is-expanded" : ""}`}
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
                          <td
                            className="live-click-geo"
                            title={`${row.country}${row.city ? ` · ${row.city}` : ""}${row.isp ? ` · ${row.isp}` : ""}`}
                          >
                            <CountryFlag value={row.countryCode || row.country} size={15} />
                            {row.city ? <em className="live-click-dim">{row.city}</em> : null}
                            {!row.countryCode && !row.country && !row.city ? "—" : null}
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
                          {Array.from({ length: 11 }, (_, i) => {
                            const value = String(row.subs?.[i + 1] ?? "").trim();
                            const bad = issues.includes(i + 1);
                            return (
                              <td
                                key={`sub-${row.id}-${i + 1}`}
                                className={bad ? "live-click-sub-bad" : "live-click-sub"}
                                title={value || "empty"}
                              >
                                {value || "—"}
                              </td>
                            );
                          })}
                          <td className="live-click-flags">
                            {row.isUnique || row.isBot || row.isProxy || row.isLead || row.isSale ? (
                              <span className="live-click-flags-inner">
                                {row.isUnique ? <span className="lc-flag lc-flag-unique" title="Unique (campaign)">U</span> : null}
                                {row.isBot ? <span className="lc-flag lc-flag-bot" title="Bot">BOT</span> : null}
                                {row.isProxy ? <span className="lc-flag lc-flag-proxy" title="Proxy/VPN">PXY</span> : null}
                                {row.isLead ? <span className="lc-flag lc-flag-lead" title="Lead">L</span> : null}
                                {row.isSale ? <span className="lc-flag lc-flag-sale" title="Sale">S</span> : null}
                              </span>
                            ) : (
                              <span className="live-click-dim">—</span>
                            )}
                          </td>
                          <td className="live-click-dest" title={row.destination}>
                            <span>{destinationHost(row.destination)}</span>
                            {row.destination ? (
                              <button
                                type="button"
                                className="icon-btn live-click-copy"
                                title="Copy destination URL"
                                onClick={(e) => { e.stopPropagation(); copyText(row.destination, e); }}
                              >
                                <Copy size={11} />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr className="live-click-detail-row">
                            <td colSpan={20}>
                              <div className="live-click-detail">
                                <div className="live-click-detail-head">
                                  <span className="live-click-detail-title">
                                    {row.campaign || "Click detail"}
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
                                <div className="live-click-detail-grid">
                                  {Array.from({ length: 11 }, (_, i) => {
                                    const value = String(row.subs?.[i + 1] ?? "").trim();
                                    const bad = issues.includes(i + 1);
                                    return (
                                      <div
                                        className={`lc-detail-field${bad ? " is-bad" : ""}`}
                                        key={`d-sub-${i + 1}`}
                                      >
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
                                <div className="live-click-detail-meta">
                                  <div className="lc-detail-field lc-detail-wide">
                                    <span className="lc-detail-label">Destination</span>
                                    <span className="lc-detail-value lc-detail-url">
                                      {row.destination || "—"}
                                      {row.destination ? (
                                        <button
                                          type="button"
                                          className="icon-btn lc-detail-copy"
                                          title="Copy destination URL"
                                          onClick={(e) => { e.stopPropagation(); copyText(row.destination, e); }}
                                        >
                                          <Copy size={10} />
                                        </button>
                                      ) : null}
                                    </span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Click ID</span>
                                    <span className="lc-detail-value">{row.clickId || "—"}</span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">External ID</span>
                                    <span className="lc-detail-value">{row.externalId || "—"}</span>
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
                                    <span className="lc-detail-label">IP · ISP</span>
                                    <span className="lc-detail-value">
                                      {[row.ip, row.isp].filter(Boolean).join(" · ") || "—"}
                                    </span>
                                  </div>
                                  <div className="lc-detail-field">
                                    <span className="lc-detail-label">Referrer</span>
                                    <span className="lc-detail-value lc-detail-url">{row.referrer || "—"}</span>
                                  </div>
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
                  Showing the {LIVE_CLICKS_RENDER_CAP} most recent of {filteredRows.length.toLocaleString()}{plus} clicks — narrow the window or search, or export the CSV for everything loaded.
                </p>
              ) : null}
            </>
          )}
        </motion.div>
      </section>
    </>
  );
}

