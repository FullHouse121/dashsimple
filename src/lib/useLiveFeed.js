// Shared engine of the live log views (Live Clicks / Conversions): windowed
// fetch with visibility-aware polling, tracker-time "now" advanced between
// polls, relative-age labels, elapsed-minutes math for rate/bucket sizing.
import React from "react";
import { apiFetch } from "./api.js";
import { LIVE_CLICKS_IS_ROLLING } from "./live.js";

export const parseTrackerMs = (value) => {
  if (!value) return null;
  const parsed = Date.parse(`${String(value).replace(" ", "T")}Z`);
  return Number.isFinite(parsed) ? parsed : null;
};

export const useLiveFeed = ({ endpoint, failLabel, defaultWindow = "today", pollMs = 15000 }) => {
  const [rows, setRows] = React.useState([]);
  const [meta, setMeta] = React.useState(null);
  const [feedState, setFeedState] = React.useState({ loading: true, error: null });
  const [windowValue, setWindowValue] = React.useState(defaultWindow);
  const [paused, setPaused] = React.useState(false);
  const [lastFetchedAt, setLastFetchedAt] = React.useState(null);
  const [, setClock] = React.useState(0);

  const refresh = React.useCallback(async () => {
    try {
      const rolling = LIVE_CLICKS_IS_ROLLING(windowValue);
      const limit = rolling && Number(windowValue) < 180 ? 600 : 1000;
      const query = rolling ? `minutes=${windowValue}` : `interval=${windowValue}`;
      const response = await apiFetch(`${endpoint}?${query}&limit=${limit}`);
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
  }, [endpoint, failLabel, windowValue]);

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
    paused,
    setPaused,
    lastFetchedAt,
    refresh,
    trackerNowMs,
    agoLabel,
    windowElapsedMinutes,
  };
};
