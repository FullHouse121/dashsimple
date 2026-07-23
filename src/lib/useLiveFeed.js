// Shared engine of the live log views (Live Clicks / Conversions): windowed
// fetch with visibility-aware polling, tracker-time "now" advanced between
// polls, relative-age labels, elapsed-minutes math for rate/bucket sizing.
import React from "react";
import { apiFetch } from "./api.js";
import { LIVE_CLICKS_IS_ROLLING, LIVE_CLICKS_IS_CUSTOM } from "./live.js";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const isValidRange = (range) =>
  Boolean(range) && ISO_DAY.test(range.from) && ISO_DAY.test(range.to) && range.from <= range.to;

export const parseTrackerMs = (value) => {
  if (!value) return null;
  const parsed = Date.parse(`${String(value).replace(" ", "T")}Z`);
  return Number.isFinite(parsed) ? parsed : null;
};

export const useLiveFeed = ({ endpoint, failLabel, defaultWindow = "today", pollMs = 15000, extraParams = null }) => {
  const [rows, setRows] = React.useState([]);
  const [meta, setMeta] = React.useState(null);
  const [feedState, setFeedState] = React.useState({ loading: true, error: null });
  const [windowValue, setWindowValue] = React.useState(defaultWindow);
  // Custom calendar range (tracker-tz dates, inclusive); defaults to today so
  // picking "Custom range" shows data immediately.
  const [customRange, setCustomRange] = React.useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return { from: today, to: today };
  });
  const [paused, setPaused] = React.useState(false);
  const [lastFetchedAt, setLastFetchedAt] = React.useState(null);
  const [, setClock] = React.useState(0);

  // Extra query params (e.g. the server-side status filter). Serialized to a
  // string so refresh only changes when a VALUE changes, not on every render's
  // fresh object identity.
  const extraQuery = extraParams
    ? Object.entries(extraParams)
        .filter(([, value]) => value !== undefined && value !== null && String(value) !== "")
        .map(([key, value]) => `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("")
    : "";

  const refresh = React.useCallback(async () => {
    try {
      const rolling = LIVE_CLICKS_IS_ROLLING(windowValue);
      const custom = LIVE_CLICKS_IS_CUSTOM(windowValue);
      if (custom && !isValidRange(customRange)) {
        // Mid-edit (a cleared input) — keep whatever is on screen, no fetch.
        setFeedState((prev) => ({ ...prev, loading: false }));
        return;
      }
      const limit = rolling && Number(windowValue) < 180 ? 600 : 1000;
      const query = rolling
        ? `minutes=${windowValue}`
        : custom
          ? `from=${customRange.from}&to=${customRange.to}`
          : `interval=${windowValue}`;
      const response = await apiFetch(`${endpoint}?${query}&limit=${limit}${extraQuery}`);
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || failLabel);
      }
      const data = await response.json();
      setRows(Array.isArray(data?.rows) ? data.rows : []);
      setMeta({
        trackerNow: data?.trackerNow,
        window: data?.window,
        timezone: data?.timezone,
        truncated: Boolean(data?.truncated),
      });
      setLastFetchedAt(Date.now());
      setFeedState({ loading: false, error: null });
    } catch (error) {
      setFeedState({ loading: false, error: error.message || failLabel });
    }
  }, [endpoint, failLabel, windowValue, customRange, extraQuery]);

  React.useEffect(() => {
    setFeedState((prev) => ({ ...prev, loading: true }));
    refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) refresh();
    }, pollMs);
    return () => clearInterval(id);
  }, [refresh, paused, pollMs]);

  React.useEffect(() => {
    // 5s, not 1s: every tick re-renders the visible table rows (they are not
    // memoized), and second-precision "ago" labels aren't worth 5x the work.
    const id = setInterval(() => setClock((tick) => tick + 1), 5000);
    return () => clearInterval(id);
  }, []);

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
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const windowElapsedMinutes = (() => {
    if (LIVE_CLICKS_IS_ROLLING(windowValue)) return Number(windowValue);
    if (LIVE_CLICKS_IS_CUSTOM(windowValue)) {
      if (!isValidRange(customRange)) return 1440;
      const fromMs = Date.parse(`${customRange.from}T00:00:00Z`);
      const toMs = Date.parse(`${customRange.to}T00:00:00Z`);
      return (toMs - fromMs) / 60000 + 1440; // inclusive days
    }
    const now = meta?.trackerNow ? new Date(`${meta.trackerNow.replace(" ", "T")}Z`) : null;
    if (!now) return 60;
    const midnightMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    if (windowValue === "today") return Math.max(1, midnightMinutes);
    if (windowValue === "yesterday") return 1440;
    if (windowValue === "this_week") {
      const weekday = (now.getUTCDay() + 6) % 7; // Monday = 0
      return Math.max(1, weekday * 1440 + midnightMinutes);
    }
    if (windowValue === "this_month") {
      return Math.max(1, (now.getUTCDate() - 1) * 1440 + midnightMinutes);
    }
    if (windowValue === "previous_month") {
      const days = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
      return days * 1440;
    }
    return 60;
  })();

  return {
    rows,
    meta,
    feedState,
    windowValue,
    setWindowValue,
    customRange,
    setCustomRange,
    paused,
    setPaused,
    lastFetchedAt,
    refresh,
    trackerNowMs,
    agoLabel,
    windowElapsedMinutes,
  };
};

// Calendar windows larger than a day can't chart from the capped raw rows —
// "this week" at the 1,000-row cap holds only the newest day. For those
// windows the timeline/count cards read Keitaro's aggregated day×campaign
// report instead (uncapped, 45s-cached and viewer-scoped server-side).
export const calendarRangeFor = (windowValue, trackerNow, customRange) => {
  if (LIVE_CLICKS_IS_CUSTOM(windowValue)) {
    // Always aggregate custom ranges — even a single past day can exceed the
    // raw-row cap; single-bucket charts fall back to raw rows in the caller.
    return isValidRange(customRange) ? { from: customRange.from, to: customRange.to } : null;
  }
  if (!trackerNow) return null;
  const today = String(trackerNow).slice(0, 10);
  const d = new Date(`${today}T00:00:00Z`);
  if (windowValue === "this_week") {
    const weekday = (d.getUTCDay() + 6) % 7; // Monday = 0
    const from = new Date(d.getTime() - weekday * 86400000).toISOString().slice(0, 10);
    return { from, to: today };
  }
  if (windowValue === "this_month") {
    return { from: `${today.slice(0, 7)}-01`, to: today };
  }
  if (windowValue === "previous_month") {
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const from = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
    const to = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    return { from, to };
  }
  return null; // today / yesterday / rolling — raw rows cover the window
};

export const useWindowSeries = ({ windowValue, trackerNow, customRange }) => {
  const range = calendarRangeFor(windowValue, trackerNow, customRange);
  const from = range?.from || null;
  const to = range?.to || null;
  // Tag the payload with the range it belongs to: while a new window loads,
  // the previous window's totals must never be shown under the new label —
  // callers fall back to the raw rows until the matching aggregate lands.
  const [entry, setEntry] = React.useState(null); // { key, rows }
  const rangeKey = from && to ? `${from}|${to}` : null;
  React.useEffect(() => {
    if (!from || !to) {
      setEntry(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetch(`/api/keitaro/live-stats?group=daily&from=${from}&to=${to}`);
        if (!response.ok) throw new Error("series fetch failed");
        const data = await response.json();
        if (!cancelled) {
          setEntry({ key: `${from}|${to}`, rows: Array.isArray(data?.rows) ? data.rows : [] });
        }
      } catch {
        if (!cancelled) setEntry(null); // callers fall back to raw rows
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [from, to]);
  return entry && entry.key === rangeKey ? entry.rows : null;
};
