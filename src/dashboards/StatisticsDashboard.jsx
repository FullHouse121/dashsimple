import React from "react";
import { formatShortDate } from "../components/PeriodSelect.jsx";
import { Select } from "../components/Select.jsx";
import { StatsFunnelFlow } from "../components/StatsFunnelFlow.jsx";
import { AwardIcon, StatsIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { readSwrCache, writeSwrCache } from "../lib/cache.js";
import { defaultCountryOption, priorityBuyers } from "../lib/constants.js";
import { useCostIntegrity } from "../lib/costIntegrity.js";
import { isDateInRange, normalizeDateRange } from "../lib/date.js";
import { isAllSelection, matchesBuyerFilter, matchesCountryFilter } from "../lib/filters.js";
import { axisTickStyle, csvCell, formatCurrency, formatVolumeAxis, tooltipStyle } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, stagger } from "../lib/motion.js";
import { goToView } from "../lib/navigation.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { compareSortValues, getSortIndicator, toggleSortConfig } from "../lib/sort.js";
import { motion } from "framer-motion";
import { AlertTriangle, Download } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function StatisticsDashboard({ authUser, viewerBuyer, filters, buyerFilterOptions = [] }) {
  const { t } = useLanguage();
  const statsCostIntegrity = useCostIntegrity();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "DeusInsta";
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";
  const globalUserDomainFilter = filters?.userDomain || "All";
  const globalUserCampaignFilter = filters?.userCampaign || "All";
  const globalUserExternalIdFilter = filters?.userExternalId || "";
  const globalUserMinRevenue = Number(filters?.userMinRevenue || 0);
  const globalUserMinFtds = Number(filters?.userMinFtds || 0);
  const globalUserMinRedeposits = Number(filters?.userMinRedeposits || 0);
  const globalUserRevenueOnly = Boolean(filters?.userRevenueOnly);
  const globalBrandFilter = String(filters?.statsBrand || "").trim();
  const globalGameFilter = String(filters?.statsGame || "").trim();
  const globalToolFilter = String(filters?.statsTool || "").trim();
  const globalPlacementFilter = String(filters?.statsPlacement || "").trim();
  const globalCampaignFilter = React.useMemo(() => {
    const raw = filters?.statsCampaign;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return new Set(list.map((v) => String(v || "").trim()).filter(Boolean));
  }, [filters?.statsCampaign]);
  const globalMinClicks = Number(filters?.statsMinClicks || 0);
  const globalMinFtds = Number(filters?.statsMinFtds || 0);
  const globalProfitableOnly = Boolean(filters?.statsProfitableOnly);
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const [statsForm, setStatsForm] = React.useState({
    date: "2026-02-07",
    buyer: effectiveBuyer,
    country: defaultCountryOption,
    spend: "",
    clicks: "",
    installs: "",
    registers: "",
    ftds: "",
  });
  const [statsEntries, setStatsEntries] = React.useState([]);
  const [prevStatsEntries, setPrevStatsEntries] = React.useState([]);
  const [statsState, setStatsState] = React.useState({ loading: true, error: null });
  const [buyerFilter, setBuyerFilter] = React.useState(isLeadership ? "All" : effectiveBuyer);
  const [showAllStatsRows, setShowAllStatsRows] = React.useState(false);
  const [statsOverviewFilters, setStatsOverviewFilters] = React.useState(["ftds"]);
  const [statsCostMode, setStatsCostMode] = React.useState(null); // null = auto: revenue when no spend

  const updateStatsForm = (key) => (event) => {
    setStatsForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetStatsForm = () => {
    setStatsForm({
      date: "2026-02-07",
      buyer: effectiveBuyer,
      country: defaultCountryOption,
      spend: "",
      clicks: "",
      installs: "",
      registers: "",
      ftds: "",
    });
  };

  React.useEffect(() => {
    if (!isLeadership && effectiveBuyer) {
      setStatsForm((prev) => ({ ...prev, buyer: effectiveBuyer }));
      setBuyerFilter(effectiveBuyer);
    }
  }, [effectiveBuyer, isLeadership]);

  const fetchStats = React.useCallback(async () => {
    const isoRe = /^\d{4}-\d{2}-\d{2}$/;
    const from = isoRe.test(filters?.dateFrom || "") ? filters.dateFrom : "";
    const to = isoRe.test(filters?.dateTo || "") ? filters.dateTo : "";
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    // The equally-long window immediately before the current one (for deltas).
    let prevRange = null;
    if (from && to) {
      const dayMs = 86400000;
      const fromMs = Date.parse(`${from}T00:00:00Z`);
      const toMs = Date.parse(`${to}T00:00:00Z`);
      const lengthDays = Math.max(1, Math.round((toMs - fromMs) / dayMs) + 1);
      prevRange = {
        from: new Date(fromMs - dayMs * lengthDays).toISOString().slice(0, 10),
        to: new Date(fromMs - dayMs).toISOString().slice(0, 10),
      };
    }
    const liveUrl = `/api/keitaro/live-stats${qs.toString() ? `?${qs}` : ""}`;
    const cacheKey = `live-stats:${qs.toString()}`;
    const cached = readSwrCache(cacheKey);

    if (cached && Array.isArray(cached)) {
      setStatsEntries(cached);
      setStatsState({ loading: false, error: null });
    } else {
      setStatsState({ loading: true, error: null });
    }

    try {
      let rows = null;
      // Primary path: live, aggregated data straight from Keitaro.
      const requests = [apiFetch(liveUrl)];
      if (prevRange) {
        requests.push(apiFetch(`/api/keitaro/live-stats?from=${prevRange.from}&to=${prevRange.to}`));
      }
      const [response, prevResponse] = await Promise.all(requests);
      if (response.ok) {
        const data = await response.json();
        rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        // Fallback to the synced table when the live endpoint is unavailable
        // (e.g. backend not yet redeployed).
        const fb = await apiFetch("/api/media-stats?limit=100000");
        if (!fb.ok) throw new Error("Failed to load media buyer stats.");
        const fbData = await fb.json();
        rows = Array.isArray(fbData) ? fbData : [];
      }
      if (prevRange && prevResponse?.ok) {
        const prevData = await prevResponse.json().catch(() => null);
        setPrevStatsEntries(
          Array.isArray(prevData) ? prevData : Array.isArray(prevData?.rows) ? prevData.rows : []
        );
      } else {
        setPrevStatsEntries([]);
      }
      writeSwrCache(cacheKey, rows);
      setStatsEntries(rows);
      setStatsState({ loading: false, error: null });
    } catch (error) {
      if (!cached) {
        setStatsState({ loading: false, error: error.message || "Failed to load stats." });
      }
    }
  }, [filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchStats]);

  const handleStatsSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/media-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statsForm),
      });
      if (!response.ok) {
        throw new Error("Failed to save stats entry.");
      }
      await fetchStats();
      resetStatsForm();
    } catch (error) {
      setStatsState({ loading: false, error: error.message || "Failed to save stats entry." });
    }
  };

  const sum = (value) => Number(value || 0);
  const readNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };
  const readRevenue = (row) => {
    const direct = readNumeric(row?.revenue);
    const ftd = readNumeric(row?.ftdRevenue ?? row?.ftd_revenue);
    const redeposit = readNumeric(row?.redepositRevenue ?? row?.redeposit_revenue);
    if (direct === 0 && (ftd > 0 || redeposit > 0)) return ftd + redeposit;
    return direct || ftd + redeposit;
  };

  const matchesAttr = (value, needle) =>
    !needle || String(value || "").toLowerCase().includes(String(needle).toLowerCase());

  const normalizedEntries = React.useMemo(() => {
    const map = new Map();
    // Brand/game/tool/placement live on the RAW rows — grouping by
    // date|buyer|country drops them, so these filters apply before grouping.
    statsEntries.forEach((row) => {
      if (!matchesAttr(row.brand, globalBrandFilter)) return;
      if (!matchesAttr(row.game, globalGameFilter)) return;
      if (!matchesAttr(row.tool, globalToolFilter)) return;
      if (
        globalPlacementFilter &&
        !String(row.placement || "").toLowerCase().includes(globalPlacementFilter.toLowerCase())
      ) {
        return;
      }
      if (
        globalCampaignFilter.size &&
        !globalCampaignFilter.has(String(row.campaign || row.campaign_name || ""))
      ) {
        return;
      }
      const date = String(row.date || "");
      const buyer = String(row.buyer || "");
      const country = String(row.country || "");
      const key = `${date}|${buyer}|${country}`;
      if (!map.has(key)) {
        map.set(key, {
          id: row.id,
          date,
          buyer,
          country,
          spend: 0,
          clicks: 0,
          uniqueClicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
          ftdRevenue: 0,
          redepositRevenue: 0,
        });
      }
      const current = map.get(key);
      current.spend += sum(row.spend);
      current.clicks += sum(row.clicks);
      current.uniqueClicks += sum(row.unique_clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += readRevenue(row);
      current.ftdRevenue += readNumeric(row.ftdRevenue ?? row.ftd_revenue);
      current.redepositRevenue += readNumeric(row.redepositRevenue ?? row.redeposit_revenue);
      if (!current.id && row.id) current.id = row.id;
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateSort = String(b.date || "").localeCompare(String(a.date || ""));
      if (dateSort !== 0) return dateSort;
      return (b.id || 0) - (a.id || 0);
    });
  }, [statsEntries, globalBrandFilter, globalGameFilter, globalToolFilter, globalPlacementFilter, globalCampaignFilter]);

  // Only the system's active buyers are selectable. The Keitaro data carries
  // many raw buyer/source segments (Leomarketing, KarenFarias, Daniel, Ersan,
  // "Traffic Junkey"…) that would otherwise clutter this picker, so we use the
  // same Keitaro-sourced roster the performance filters use instead of the row
  // buyers. Falls back to the static roster when the roster prop is empty.
  const buyers = isLeadership
    ? ["All", ...(buyerFilterOptions.length ? buyerFilterOptions : priorityBuyers)]
    : [effectiveBuyer].filter(Boolean);
  // Traffic-analysis filters from the Refine modal (brand/game/tool/placement
  // + minimum thresholds) — applied on the grouped rows so the KPI cards,
  // charts and table all agree.
  const statsRowMatchesFilters = (row) => {
    if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
      return false;
    }
    if (
      isLeadership &&
      !isAllSelection(buyerFilter) &&
      !String(row.buyer || "").toLowerCase().includes(String(buyerFilter).toLowerCase())
    ) {
      return false;
    }
    if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
    if (!isDateInRange(row.date, globalDateRange)) return false;
    // (brand/game/tool/placement already applied on the raw rows above)
    if (globalMinClicks > 0 && sum(row.clicks) < globalMinClicks) return false;
    if (globalMinFtds > 0 && sum(row.ftds) < globalMinFtds) return false;
    if (globalProfitableOnly && sum(row.revenue) <= sum(row.spend)) return false;
    return true;
  };
  const filteredEntries = normalizedEntries.filter(statsRowMatchesFilters);

  React.useEffect(() => {
    setShowAllStatsRows(false);
  }, [buyerFilter, globalBuyerFilter, globalCountryFilter, globalDateRange.from, globalDateRange.to]);

  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const toCost = (spend, denom) => {
    if (!spend || spend <= 0) return null;
    const value = safeDivide(spend, denom);
    return value === null ? null : value;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCost = (value) =>
    value === null || Number.isNaN(value) ? "—" : formatCurrency(value);

  const totals = filteredEntries.reduce(
    (acc, row) => ({
      spend: acc.spend + sum(row.spend),
      clicks: acc.clicks + sum(row.clicks),
      uniqueClicks: acc.uniqueClicks + sum(row.uniqueClicks),
      installs: acc.installs + sum(row.installs),
      registers: acc.registers + sum(row.registers),
      ftds: acc.ftds + sum(row.ftds),
      redeposits: acc.redeposits + sum(row.redeposits),
      revenue: acc.revenue + sum(row.revenue),
    }),
    { spend: 0, clicks: 0, uniqueClicks: 0, installs: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0 }
  );

  // Comparison window for the top-card deltas. With an explicit date range we
  // compare against the equally-long window fetched before it; on an unbounded
  // view we compare the trailing 7 days in the data against the 7 before them.
  const statsComparison = React.useMemo(() => {
    const scopeFilter = (row) => {
      if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) return false;
      if (
        isLeadership &&
        !isAllSelection(buyerFilter) &&
        !String(row.buyer || "").toLowerCase().includes(String(buyerFilter).toLowerCase())
      ) {
        return false;
      }
      if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
      // Deltas must compare like with like: the previous period is scoped by
      // the same brand/game/tool/placement filters as the current view.
      if (!matchesAttr(row.brand, globalBrandFilter)) return false;
      if (!matchesAttr(row.game, globalGameFilter)) return false;
      if (!matchesAttr(row.tool, globalToolFilter)) return false;
      if (
        globalPlacementFilter &&
        !String(row.placement || "").toLowerCase().includes(globalPlacementFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        globalCampaignFilter.size &&
        !globalCampaignFilter.has(String(row.campaign || row.campaign_name || ""))
      ) {
        return false;
      }
      return true;
    };
    const totalsOf = (rows) =>
      rows.reduce(
        (acc, row) => {
          acc.spend += sum(row.spend);
          acc.clicks += sum(row.clicks);
          acc.uniqueClicks += sum(row.unique_clicks);
          acc.registers += sum(row.registers);
          acc.ftds += sum(row.ftds);
          acc.redeposits += sum(row.redeposits);
          acc.revenue += readRevenue(row);
          return acc;
        },
        { spend: 0, clicks: 0, uniqueClicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0 }
      );
    if (prevStatsEntries.length) {
      return { current: null, prev: totalsOf(prevStatsEntries.filter(scopeFilter)), label: "vs prev period" };
    }
    const scoped = statsEntries.filter(scopeFilter);
    const dayOf = (row) => String(row.date || "").slice(0, 10);
    const maxDate = scoped.reduce((max, row) => (dayOf(row) > max ? dayOf(row) : max), "");
    if (!maxDate) return null;
    const dayMs = 86400000;
    const maxMs = Date.parse(`${maxDate}T00:00:00Z`);
    const within = (row, startMs, endMs) => {
      const ms = Date.parse(`${dayOf(row)}T00:00:00Z`);
      return Number.isFinite(ms) && ms >= startMs && ms <= endMs;
    };
    const prevRows = scoped.filter((row) => within(row, maxMs - 13 * dayMs, maxMs - 7 * dayMs));
    if (!prevRows.length) return null;
    const currentRows = scoped.filter((row) => within(row, maxMs - 6 * dayMs, maxMs));
    return { current: totalsOf(currentRows), prev: totalsOf(prevRows), label: "7d vs prior" };
  }, [
    prevStatsEntries,
    statsEntries,
    globalBuyerFilter,
    globalCountryFilter,
    buyerFilter,
    effectiveBuyer,
    isLeadership,
    globalBrandFilter,
    globalGameFilter,
    globalToolFilter,
    globalPlacementFilter,
    globalCampaignFilter,
  ]);

  const statsDeltaFor = (key) => {
    if (!statsComparison) return null;
    const base = statsComparison.current || totals;
    const prev = Number(statsComparison.prev?.[key]) || 0;
    const current = Number(base[key]) || 0;
    if (prev === 0) return current > 0 ? Infinity : null;
    return ((current - prev) / prev) * 100;
  };
  const renderStatsDelta = (delta) => {
    if (delta === null || delta === undefined || !statsComparison) return null;
    if (delta === Infinity) return <span className="kpi-delta is-up">▲ new</span>;
    const rounded = Math.round(delta * 10) / 10;
    if (!Number.isFinite(rounded) || Math.abs(rounded) < 0.05) {
      return <span className="kpi-delta">— 0% {statsComparison.label}</span>;
    }
    // A near-zero baseline (a campaign that barely ran last period) produces
    // percentages like 349,042% — arithmetically true, unreadable. Past 10x
    // the story is "this is new", not a number worth reading.
    if (rounded > 999) {
      return <span className="kpi-delta is-up">▲ &gt;999% {statsComparison.label}</span>;
    }
    return (
      <span className={`kpi-delta${rounded > 0 ? " is-up" : " is-down"}`}>
        {rounded > 0 ? "▲" : "▼"} {Math.abs(rounded).toFixed(1)}% {statsComparison.label}
      </span>
    );
  };

  const isStatsSingleDayRange = Boolean(
    globalDateRange.from &&
      globalDateRange.to &&
      String(globalDateRange.from) === String(globalDateRange.to)
  );
  const getStatsBucket = React.useCallback(
    (row) => {
      const dateValue = String(row?.date || "");
      const createdAtValue = String(row?.created_at || row?.createdAt || "");
      if (!isStatsSingleDayRange) {
        const base = dateValue.split(" ")[0];
        return { key: base, label: formatShortDate(base), sortKey: base };
      }
      const parseTimestamp = (value) => {
        if (!value) return null;
        const normalized = value.includes("T") ? value : value.replace(" ", "T");
        const parsed = new Date(normalized);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      };
      const stamp = parseTimestamp(createdAtValue) || parseTimestamp(dateValue);
      if (!stamp) return { key: "00:00", label: "00:00", sortKey: "00:00" };
      const hour = String(stamp.getHours()).padStart(2, "0");
      return { key: `${hour}:00`, label: `${hour}:00`, sortKey: `${hour}:00` };
    },
    [isStatsSingleDayRange]
  );

  const filteredRawEntries = React.useMemo(
    () =>
      statsEntries.filter((row) => {
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (
          isLeadership &&
          !isAllSelection(buyerFilter) &&
          !String(row.buyer || "").toLowerCase().includes(String(buyerFilter).toLowerCase())
        ) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        if (!isDateInRange(row.date, globalDateRange)) return false;
        if (!matchesAttr(row.brand, globalBrandFilter)) return false;
        if (!matchesAttr(row.game, globalGameFilter)) return false;
        if (!matchesAttr(row.tool, globalToolFilter)) return false;
        if (
          globalPlacementFilter &&
          !String(row.placement || "").toLowerCase().includes(globalPlacementFilter.toLowerCase())
        ) {
          return false;
        }
        if (
          globalCampaignFilter.size &&
          !globalCampaignFilter.has(String(row.campaign || row.campaign_name || ""))
        ) {
          return false;
        }
        return true;
      }),
    [
      statsEntries,
      globalBuyerFilter,
      effectiveBuyer,
      isLeadership,
      buyerFilter,
      globalCountryFilter,
      globalDateRange.from,
      globalDateRange.to,
      globalBrandFilter,
      globalGameFilter,
      globalToolFilter,
      globalPlacementFilter,
      globalCampaignFilter,
    ]
  );

  const statsOverviewData = React.useMemo(() => {
    const map = new Map();
    filteredRawEntries.forEach((row) => {
      const bucket = getStatsBucket(row);
      if (!bucket?.key) return;
      if (!map.has(bucket.key)) {
        map.set(bucket.key, {
          bucket: bucket.key,
          label: bucket.label,
          sortKey: bucket.sortKey,
          clicks: 0,
          registrations: 0,
          ftds: 0,
          redeposits: 0,
          spend: 0,
          revenue: 0,
          roi: null,
        });
      }
      const current = map.get(bucket.key);
      current.clicks += sum(row.clicks);
      current.installs += sum(row.installs);
      current.registrations += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.spend += sum(row.spend);
      current.revenue += readRevenue(row);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey)))
      .map((item) => ({
        ...item,
        c2i: toPercent(item.installs, item.clicks),
        c2reg: toPercent(item.registrations, item.clicks),
        c2dep: toPercent(item.ftds, item.clicks),
        epc: safeDivide(item.revenue, item.clicks),
        i2reg: toPercent(item.registrations, item.installs),
        i2dep: toPercent(item.ftds, item.installs),
        reg2dep: toPercent(item.ftds, item.registrations),
        dep2red: toPercent(item.redeposits, item.ftds),
        roi: item.spend > 0 ? ((item.revenue - item.spend) / item.spend) * 100 : null,
      }));
  }, [filteredRawEntries, getStatsBucket]);

  const statsOverviewOptions = React.useMemo(
    () => [
      { key: "ftds", label: "FTDs", color: "var(--green)", type: "count" },
      { key: "c2i", label: "Click2Install", color: "#58b1ff", type: "percent" },
      { key: "c2reg", label: "Click2Reg", color: "#8e5bff", type: "percent" },
      { key: "c2dep", label: "Click2Dep", color: "#3ddc97", type: "percent" },
      { key: "epc", label: "EPC", color: "#ffd86b", type: "currency" },
      { key: "i2reg", label: "Install2Reg", color: "#24c5d4", type: "percent" },
      { key: "i2dep", label: "Install2Dep", color: "#00d18c", type: "percent" },
      { key: "reg2dep", label: "Reg2Dep", color: "#ff9d57", type: "percent" },
      { key: "dep2red", label: "Dep2Red", color: "#ff6f91", type: "percent" },
    ],
    []
  );
  const activeStatsOverviewMetrics = statsOverviewOptions.filter((metric) =>
    statsOverviewFilters.includes(metric.key)
  );
  const toggleStatsOverviewMetric = (key) => {
    setStatsOverviewFilters((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };
  const formatStatsOverviewValue = (value, type) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    if (type === "currency") return formatCurrency(value);
    if (type === "percent") return fmtPercent(value);
    return Number(value).toLocaleString();
  };
  const statsOverviewPeak = React.useMemo(
    () => statsOverviewData.reduce((max, item) => Math.max(max, item.ftds || 0), 0),
    [statsOverviewData]
  );
  const statsOverviewAvg =
    statsOverviewData.length > 0
      ? statsOverviewData.reduce((acc, item) => acc + (item.ftds || 0), 0) / statsOverviewData.length
      : 0;

  const uc = totals.uniqueClicks;
  const ucSub = (num, formatter) =>
    uc > 0 ? { value: formatter(num, uc), label: "on unique" } : null;
  // Rates lead with UNIQUE clicks because that's what Keitaro's own `cr`
  // metric reports and what buyers compare against; the raw-click rate stays
  // as the secondary line. Install cards only appear when installs are
  // actually tracked (this tracker doesn't, so they'd read 0.00%/—).
  const rateBase = uc > 0 ? uc : totals.clicks;
  const rateBaseLabel = uc > 0 ? "of unique clicks" : "of clicks";
  const rawSub = (num) =>
    uc > 0 ? { value: fmtPercent(toPercent(num, totals.clicks)), label: "of all clicks" } : null;
  const statsKpis = [
    ...(totals.installs > 0
      ? [
          {
            label: "Click2Install",
            value: fmtPercent(toPercent(totals.installs, rateBase)),
            meta: rateBaseLabel,
            sub: rawSub(totals.installs),
          },
          { label: "Install2Reg", value: fmtPercent(toPercent(totals.registers, totals.installs)), meta: "of installs" },
          { label: "Install2Dep", value: fmtPercent(toPercent(totals.ftds, totals.installs)), meta: "of installs" },
        ]
      : []),
    {
      label: "Click2Reg",
      value: fmtPercent(toPercent(totals.registers, rateBase)),
      meta: rateBaseLabel,
      sub: rawSub(totals.registers),
    },
    {
      label: "Click2Dep",
      value: fmtPercent(toPercent(totals.ftds, rateBase)),
      meta: rateBaseLabel,
      sub: rawSub(totals.ftds),
    },
    {
      label: "Reg2Dep",
      value: fmtPercent(toPercent(totals.ftds, totals.registers)),
      meta: "registrations that deposited",
    },
    {
      // Redeposits are EVENTS, not people — one depositor can redeposit many
      // times, so a percentage reads as a broken >100% "rate". Show the ratio.
      label: "Redeposits / FTD",
      value: totals.ftds > 0 ? `${(totals.redeposits / totals.ftds).toFixed(2)}×` : "—",
      meta: "redeposit events per depositor",
    },
    // Cost line: what a unique click, a registration and an FTD each cost,
    // then what a click earns back. Reads left-to-right down the funnel.
    {
      label: "Cost per Unique Click",
      value: totals.spend > 0 ? fmtCost(toCost(totals.spend, rateBase)) : "—",
      meta: totals.spend > 0 ? (uc > 0 ? "spend / unique click" : "spend / click") : "no spend in range",
    },
    {
      label: "Cost per Reg",
      value: totals.spend > 0 ? fmtCost(toCost(totals.spend, totals.registers)) : "—",
      meta: totals.spend > 0 ? "spend / registration" : "no spend in range",
    },
    {
      label: "Cost per FTD",
      value: totals.spend > 0 ? fmtCost(toCost(totals.spend, totals.ftds)) : "—",
      meta: totals.spend > 0 ? "spend / FTD" : "no spend in range",
    },
    {
      label: "EPC",
      value: fmtCost(safeDivide(totals.revenue, rateBase)),
      meta: uc > 0 ? "revenue / unique click" : "revenue / click",
      sub:
        uc > 0
          ? { value: fmtCost(safeDivide(totals.revenue, totals.clicks)), label: "per raw click" }
          : null,
    },
  ];

  const chartMap = new Map();
  filteredEntries.forEach((row) => {
    const key = row.date;
    if (!chartMap.has(key)) {
      chartMap.set(key, {
        date: key,
        spend: 0,
        clicks: 0,
        installs: 0,
        registers: 0,
        ftds: 0,
        revenue: 0,
        ftdRevenue: 0,
        redepositRevenue: 0,
      });
    }
    const current = chartMap.get(key);
    current.spend += sum(row.spend);
    current.clicks += sum(row.clicks);
    current.installs += sum(row.installs);
    current.registers += sum(row.registers);
    current.ftds += sum(row.ftds);
    current.revenue += sum(row.revenue);
    current.ftdRevenue += sum(row.ftdRevenue);
    current.redepositRevenue += sum(row.redepositRevenue);
  });

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      ...row,
      c2i: toPercent(row.installs, row.clicks),
      c2r: toPercent(row.registers, row.clicks),
      c2f: toPercent(row.ftds, row.clicks),
      r2d: toPercent(row.ftds, row.registers),
      cpc: toCost(row.spend, row.clicks),
      cpr: toCost(row.spend, row.registers),
      cpp: toCost(row.spend, row.ftds),
      epc: safeDivide(row.revenue, row.clicks),
    }));

  // Conversion funnel stages (colors match the Campaigns page series colors so
  // the same entity keeps the same hue everywhere). Uniques lead the funnel;
  // falls back to raw clicks when the source has no uniques.
  const funnelStages = React.useMemo(() => {
    const uniques = totals.uniqueClicks > 0 ? totals.uniqueClicks : totals.clicks;
    const stages = [
      {
        key: "uniques",
        label: totals.uniqueClicks > 0 ? "Uniques" : "Clicks",
        value: uniques,
        color: "#3987e5",
      },
      { key: "registers", label: "Registers", value: totals.registers, color: "#9085e9" },
      { key: "ftds", label: "FTDs", value: totals.ftds, color: "#199e70" },
      { key: "redeposits", label: "Redeposits", value: totals.redeposits, color: "#c98500" },
    ];
    return stages.map((stage, idx) => ({
      ...stage,
      rate: idx > 0 ? toPercent(stage.value, stages[idx - 1].value) : null,
      share: toPercent(stage.value, stages[0].value),
    }));
  }, [totals.uniqueClicks, totals.clicks, totals.registers, totals.ftds, totals.redeposits]);

  // Per-buyer rollup of the filtered view, ranked by FTDs.
  const buyerLeaderboard = React.useMemo(() => {
    const map = new Map();
    filteredEntries.forEach((row) => {
      const buyer = String(row.buyer || "").trim() || "Unknown";
      if (!map.has(buyer)) {
        map.set(buyer, { buyer, clicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0 });
      }
      const current = map.get(buyer);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += sum(row.revenue);
    });
    return Array.from(map.values())
      .map((row) => ({ ...row, r2d: toPercent(row.ftds, row.registers) }))
      .sort((a, b) => b.ftds - a.ftds || b.registers - a.registers)
      .slice(0, 8);
  }, [filteredEntries]);
  const leaderboardMaxFtds = buyerLeaderboard.reduce((max, row) => Math.max(max, row.ftds), 0);
  const leaderboardTotalFtds = buyerLeaderboard.reduce((acc, row) => acc + row.ftds, 0);

  const volumeMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.clicks || 0, row.registers || 0, row.ftds || 0))
  );
  const rateMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.c2r || 0, row.r2d || 0, row.c2f || 0))
  );
  const costMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.cpc || 0, row.cpr || 0, row.cpp || 0))
  );

  const volumeDomainMax = volumeMax > 0 ? Math.ceil(volumeMax * 1.15) : 10;
  const rateDomainMax = Math.min(100, Math.max(10, Math.ceil((rateMax || 0) / 5) * 5));
  const costDomainMax = costMax > 0 ? Math.ceil(costMax * 1.2) : 10;
  const revenueMax = Math.max(0, ...chartData.map((row) => row.revenue || 0));
  const revenueDomainMax = revenueMax > 0 ? Math.ceil(revenueMax * 1.15) : 10;
  // The daily revenue split is only meaningful when Keitaro reports it.
  const hasRevenueSplit = chartData.some((row) => row.ftdRevenue > 0 || row.redepositRevenue > 0);
  const resolvedCostMode = statsCostMode || (totals.spend > 0 ? "cost" : "revenue");
  const [statsTableSort, setStatsTableSort] = React.useState({ key: "ftds", dir: "desc" });
  const toggleStatsSort = (key) => {
    setStatsTableSort((prev) => toggleSortConfig(prev, key, "desc"));
  };
  const getStatsSortValue = (row, key) => {
    switch (key) {
      case "date":
        return String(row.date || "");
      case "buyer":
        return String(row.buyer || "");
      case "country":
        return String(row.country || "");
      case "spend":
        return sum(row.spend);
      case "clicks":
        return sum(row.clicks);
      case "installs":
        return sum(row.installs);
      case "registers":
        return sum(row.registers);
      case "ftds":
        return sum(row.ftds);
      case "redeposits":
        return sum(row.redeposits);
      case "revenue":
        return sum(row.revenue);
      case "c2i":
        return toPercent(sum(row.installs), sum(row.clicks));
      case "c2r":
        return toPercent(sum(row.registers), sum(row.clicks));
      case "c2ftd":
        return toPercent(sum(row.ftds), sum(row.clicks));
      case "r2d":
        return toPercent(sum(row.ftds), sum(row.registers));
      case "cpc":
        return toCost(sum(row.spend), sum(row.clicks));
      case "cpi":
        return toCost(sum(row.spend), sum(row.installs));
      case "cpr":
        return toCost(sum(row.spend), sum(row.registers));
      case "cpp":
        return toCost(sum(row.spend), sum(row.ftds));
      default:
        return null;
    }
  };
  const statsSortType = (key) =>
    key === "date" ? "date" : key === "buyer" || key === "country" ? "text" : "number";
  const sortedEntries = React.useMemo(() => {
    const rows = [...filteredEntries];
    return rows.sort((a, b) =>
      compareSortValues(
        getStatsSortValue(a, statsTableSort.key),
        getStatsSortValue(b, statsTableSort.key),
        statsTableSort.dir,
        statsSortType(statsTableSort.key)
      )
    );
  }, [filteredEntries, statsTableSort]);
  const visibleEntries = showAllStatsRows ? sortedEntries : sortedEntries.slice(0, 10);

  // Columns with no data in the filtered view (no spend → no cost metrics,
  // no installs → no install funnel) are dropped instead of rendering dashes.
  const hasSpendData = totals.spend > 0;
  const hasInstallData = totals.installs > 0;
  const statsColumns = [
    { key: "date", label: "Date" },
    { key: "buyer", label: "Buyer" },
    { key: "country", label: "Country" },
    ...(hasSpendData ? [{ key: "spend", label: "Spend" }] : []),
    { key: "clicks", label: "Clicks" },
    ...(hasInstallData ? [{ key: "installs", label: "Installs" }] : []),
    { key: "registers", label: "Registers" },
    { key: "ftds", label: "FTDs" },
    { key: "redeposits", label: "Redeposits" },
    { key: "revenue", label: "Revenue" },
    ...(hasInstallData ? [{ key: "c2i", label: "C2I" }] : []),
    { key: "c2r", label: "C2R" },
    { key: "c2ftd", label: "C2FTD" },
    { key: "r2d", label: "R2D" },
    ...(hasSpendData
      ? [
          { key: "cpc", label: "CPC" },
          ...(hasInstallData ? [{ key: "cpi", label: "CPI" }] : []),
          { key: "cpr", label: "CPR" },
          { key: "cpp", label: "CPP" },
        ]
      : []),
  ];
  React.useEffect(() => {
    setStatsTableSort((prev) =>
      statsColumns.some((col) => col.key === prev.key) ? prev : { key: "ftds", dir: "desc" }
    );
     
  }, [hasSpendData, hasInstallData]);

  const statsRowCells = (row) => {
    const spend = sum(row.spend);
    const clicks = sum(row.clicks);
    const installs = sum(row.installs);
    const registers = sum(row.registers);
    const ftds = sum(row.ftds);
    const redeposits = sum(row.redeposits);
    const revenue = sum(row.revenue);
    return {
      date: row.date,
      buyer: row.buyer,
      country: row.country || "—",
      spend: spend ? formatCurrency(spend) : "—",
      clicks: clicks.toLocaleString(),
      installs: installs ? installs.toLocaleString() : "—",
      registers: registers.toLocaleString(),
      ftds: ftds.toLocaleString(),
      redeposits: redeposits ? redeposits.toLocaleString() : "—",
      revenue: revenue ? formatCurrency(revenue) : "—",
      c2i: fmtPercent(toPercent(installs, clicks)),
      c2r: fmtPercent(toPercent(registers, clicks)),
      c2ftd: fmtPercent(toPercent(ftds, clicks)),
      r2d: fmtPercent(toPercent(ftds, registers)),
      cpc: fmtCost(toCost(spend, clicks)),
      cpi: fmtCost(toCost(spend, installs)),
      cpr: fmtCost(toCost(spend, registers)),
      cpp: fmtCost(toCost(spend, ftds)),
    };
  };
  const statsTotalsCells = {
    date: "Totals",
    buyer: "",
    country: "",
    spend: totals.spend ? formatCurrency(totals.spend) : "—",
    clicks: totals.clicks.toLocaleString(),
    installs: totals.installs ? totals.installs.toLocaleString() : "—",
    registers: totals.registers.toLocaleString(),
    ftds: totals.ftds.toLocaleString(),
    redeposits: totals.redeposits ? totals.redeposits.toLocaleString() : "—",
    revenue: totals.revenue ? formatCurrency(totals.revenue) : "—",
    c2i: fmtPercent(toPercent(totals.installs, totals.clicks)),
    c2r: fmtPercent(toPercent(totals.registers, totals.clicks)),
    c2ftd: fmtPercent(toPercent(totals.ftds, totals.clicks)),
    r2d: fmtPercent(toPercent(totals.ftds, totals.registers)),
    cpc: fmtCost(toCost(totals.spend, totals.clicks)),
    cpi: fmtCost(toCost(totals.spend, totals.installs)),
    cpr: fmtCost(toCost(totals.spend, totals.registers)),
    cpp: fmtCost(toCost(totals.spend, totals.ftds)),
  };

  const exportStatsCsv = () => {
    const quote = csvCell;
    const rawCell = (row, key) => {
      const value = getStatsSortValue(row, key);
      if (value === null || value === undefined) return "";
      if (key === "date" || key === "buyer" || key === "country") return quote(value);
      return Number.isFinite(Number(value)) ? Number(value).toFixed(2).replace(/\.00$/, "") : "";
    };
    const header = statsColumns.map((col) => col.label).join(",");
    const lines = sortedEntries.map((row) => statsColumns.map((col) => rawCell(row, col.key)).join(","));
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `funnel-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="cards">
        {[
          { label: "Total Spend", value: fmtCost(totals.spend), meta: "Filtered view", untrusted: !statsCostIntegrity.trustworthy },
          { label: "Unique Clicks", value: totals.uniqueClicks.toLocaleString(), meta: "Filtered view", delta: statsDeltaFor("uniqueClicks") },
          { label: "Total Registers", value: totals.registers.toLocaleString(), meta: "Filtered view", delta: statsDeltaFor("registers") },
          { label: "Total FTDs", value: totals.ftds.toLocaleString(), meta: "Filtered view", delta: statsDeltaFor("ftds") },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stagger(idx), duration: DURATION.settle, ease: EASE }}
          >
            <div className="card-head">{stat.label}</div>
            <div className={`card-value${stat.untrusted ? " is-untrusted" : ""}`}>{stat.value}</div>
            {stat.untrusted ? (
              <button
                type="button"
                className="card-untrusted"
                onClick={() => goToView("health")}
                title={t("Spend is missing for some ad accounts, so this figure is computed from incomplete cost. Open Health to see why.")}
              >
                <AlertTriangle size={11} /> {t("cost data incomplete")}
              </button>
            ) : null}
            {renderStatsDelta(stat.delta)}
            <div className="card-meta">{stat.meta}</div>
          </motion.div>
        ))}
      </section>

      <section className="cards stats-secondary">
        {statsKpis.map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card stats-kpi-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + idx * 0.05, duration: 0.45 }}
          >
            <div className="card-head">{stat.label}</div>
            <div className={`card-value${stat.untrusted ? " is-untrusted" : ""}`}>{stat.value}</div>
            {stat.untrusted ? (
              <button
                type="button"
                className="card-untrusted"
                onClick={() => goToView("health")}
                title={t("Spend is missing for some ad accounts, so this figure is computed from incomplete cost. Open Health to see why.")}
              >
                <AlertTriangle size={11} /> {t("cost data incomplete")}
              </button>
            ) : null}
            {stat.sub ? (
              <div className="card-sub">
                <span className="card-sub-dot" />
                <span className="card-sub-value">{stat.sub.value}</span>
                <span className="card-sub-label">{stat.sub.label}</span>
              </div>
            ) : null}
            <div className="card-meta">{stat.meta}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels panels-single">
        <motion.div
          className="panel ftd-volume-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Overview</h2>
              <p className="panel-subtitle">
                {isStatsSingleDayRange ? "Performance by hour" : "Performance by date"}
              </p>
            </div>
            <div className="summary-inline">
              <span>{`Peak: ${Math.round(statsOverviewPeak).toLocaleString()}`}</span>
              <span>{`${isStatsSingleDayRange ? "Avg/hour" : "Avg/day"}: ${statsOverviewAvg.toFixed(2)}`}</span>
            </div>
          </div>
          <div className="chart">
            <div className="chart-surface">
              {statsOverviewData.length ? (
                activeStatsOverviewMetrics.length ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={statsOverviewData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        {activeStatsOverviewMetrics.map((metric) => (
                          <linearGradient
                            key={metric.key}
                            id={`stats-overview-gradient-${metric.key}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor={metric.color} stopOpacity={0.34} />
                            <stop offset="100%" stopColor={metric.color} stopOpacity={0.02} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#7f848f"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8b909a", fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#7f848f"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8b909a", fontSize: 11 }}
                        width={40}
                        tickFormatter={formatVolumeAxis}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#7f848f"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8b909a", fontSize: 11 }}
                        width={44}
                        tickFormatter={(value) => `${Math.round(value)}%`}
                      />
                      <Tooltip
                        cursor={{ stroke: "rgba(69, 226, 205, 0.28)", strokeWidth: 1 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="chart-tooltip ftd-volume-tooltip" style={tooltipStyle}>
                              <p className="tooltip-label">{label}</p>
                              {payload.map((item) => {
                                const metric = statsOverviewOptions.find(
                                  (entry) => entry.key === item.dataKey
                                );
                                if (!metric) return null;
                                return (
                                  <div className="tooltip-row" key={item.dataKey}>
                                    <span className="tooltip-dot" style={{ background: metric.color }} />
                                    <span>{metric.label}</span>
                                    <span className="tooltip-value">
                                      {formatStatsOverviewValue(item.value, metric.type)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                      {activeStatsOverviewMetrics.map((metric) => (
                        <Area
                          key={metric.key}
                          type="monotone"
                          dataKey={metric.key}
                          name={metric.label}
                          yAxisId={metric.type === "percent" ? "right" : "left"}
                          stroke={metric.color}
                          strokeWidth={2.1}
                          fill={`url(#stats-overview-gradient-${metric.key})`}
                          dot={{ r: 2.4, fill: metric.color, stroke: "#0f1216", strokeWidth: 1.2 }}
                          activeDot={{ r: 4, fill: "#0f1216", stroke: metric.color, strokeWidth: 1.8 }}
                          isAnimationActive
                          animationDuration={700}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">Select at least one metric filter.</div>
                )
              ) : (
                <div className="empty-state">No overview data available.</div>
              )}
            </div>
            <div className="overview-filters">
              {statsOverviewOptions.map((metric) => {
                const active = statsOverviewFilters.includes(metric.key);
                return (
                  <button
                    type="button"
                    key={metric.key}
                    className={`overview-filter${active ? " is-active" : ""}`}
                    onClick={() => toggleStatsOverviewMetric(metric.key)}
                    style={
                      active
                        ? {
                            borderColor: metric.color,
                            color: metric.color,
                            boxShadow: `inset 0 0 0 1px ${metric.color}33`,
                          }
                        : undefined
                    }
                  >
                    <span className="overview-filter-dot" style={{ background: metric.color }} />
                    {metric.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="panels extra stats-insight-row">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#36d07c" }}>
                <StatsIcon size={15} strokeWidth={2.2} />
              </span>
              <div>
                <h2 className="panel-title">Conversion Funnel</h2>
                <p className="panel-subtitle">Stage-to-stage conversion for the filtered view.</p>
              </div>
            </div>
            <span className="stats-head-chip">
              U → FTD <strong>{fmtPercent(funnelStages[2].share)}</strong>
            </span>
          </div>
          {funnelStages[0].value > 0 ? (
            <div className="stats-funnel">
              <div className="chart-surface stats-funnel-surface">
                <StatsFunnelFlow stages={funnelStages} />
              </div>
              <div className="stats-funnel-foot">
                <span>{funnelStages[0].label} → Reg</span>
                <strong>{fmtPercent(funnelStages[1].share)}</strong>
                <span className="stats-funnel-foot-sep" aria-hidden="true" />
                <span>{funnelStages[0].label} → FTD</span>
                <strong>{fmtPercent(funnelStages[2].share)}</strong>
                <span className="stats-funnel-foot-push">
                  EPC <strong>{fmtCost(safeDivide(totals.revenue, funnelStages[0].value))}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state">No traffic in this view.</div>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#f7c625" }}>
                <AwardIcon size={15} strokeWidth={2.2} />
              </span>
              <div>
                <h2 className="panel-title">Buyer Leaderboard</h2>
                <p className="panel-subtitle">Ranked by FTDs in the filtered view.</p>
              </div>
            </div>
            <span className="stats-head-chip">
              {buyerLeaderboard.length} <strong>buyers</strong>
            </span>
          </div>
          {buyerLeaderboard.length ? (
            <div className="stats-leaderboard">
              <div className="stats-leader-grid stats-leader-head">
                <span aria-hidden="true" />
                <span className="stats-leader-head-name">Buyer</span>
                <span>FTD</span>
                <span className="is-optional">Regs</span>
                <span className="is-optional">R2D</span>
                <span>Revenue</span>
              </div>
              {buyerLeaderboard.map((row, idx) => {
                const share =
                  leaderboardTotalFtds > 0 ? (row.ftds / leaderboardTotalFtds) * 100 : 0;
                const barWidth =
                  leaderboardMaxFtds > 0
                    ? Math.max(row.ftds > 0 ? 3 : 0, (row.ftds / leaderboardMaxFtds) * 100)
                    : 0;
                return (
                  <div
                    className={`stats-leader-grid stats-leader-row${idx < 3 ? ` is-rank-${idx + 1}` : ""}`}
                    key={row.buyer}
                  >
                    <span className="stats-leader-rank">{idx + 1}</span>
                    <div className="stats-leader-main">
                      <div className="stats-leader-top">
                        <span className="stats-leader-name">{row.buyer}</span>
                        <span className="stats-leader-share">
                          {share > 0 ? `${share.toFixed(1)}% of FTDs` : "—"}
                        </span>
                      </div>
                      <div className="stats-leader-track">
                        <i style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                    <span className="stats-leader-cell stats-leader-cell-ftd">
                      {row.ftds.toLocaleString()}
                    </span>
                    <span className="stats-leader-cell is-optional">
                      {row.registers.toLocaleString()}
                    </span>
                    <span className="stats-leader-cell is-optional">{fmtPercent(row.r2d)}</span>
                    <span className="stats-leader-cell">{formatCurrency(row.revenue)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No buyer data in this view.</div>
          )}
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Media Buyer Funnel Log</h2>
              <p className="panel-subtitle">Calculated funnel metrics per entry.</p>
            </div>
            <div className="campaign-table-actions">
              <span className="roles-count">{sortedEntries.length} rows</span>
              <button type="button" className="icon-btn" title="Export CSV" onClick={exportStatsCsv}>
                <Download size={14} />
              </button>
              {isLeadership ? (
                <Select
                  className="stats-log-select"
                  value={buyerFilter}
                  onChange={(v) => setBuyerFilter(v)}
                  options={buyers.map((buyer) => ({ value: buyer, label: buyer }))}
                  placeholder="Select buyer"
                  searchPlaceholder="Find buyer"
                />
              ) : (
                <div className="select select-static">{effectiveBuyer}</div>
              )}
            </div>
          </div>

          {statsState.loading ? (
            <div className="empty-state">Loading entries…</div>
          ) : statsState.error ? (
            <div className="empty-state error">{statsState.error}</div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-state">No entries yet. Add your first stats row above.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="entries-table stats-table">
                  <thead>
                    <tr>
                      {statsColumns.map((col) => {
                        const isActive = statsTableSort.key === col.key;
                        return (
                          <th key={col.key}>
                            <button
                              type="button"
                              className={`sortable-header ${isActive ? "active" : ""}`}
                              onClick={() => toggleStatsSort(col.key)}
                            >
                              {col.label}
                              <span className="sort-indicator">
                                {getSortIndicator(statsTableSort, col.key)}
                              </span>
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEntries.map((row) => {
                      const cells = statsRowCells(row);
                      return (
                        <tr key={`${row.id || "stat"}-${row.date}-${row.buyer}-${row.country || ""}`}>
                          {statsColumns.map((col) => (
                            <td key={col.key}>{cells[col.key]}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="stats-totals-row">
                      {statsColumns.map((col) => (
                        <td key={col.key}>{statsTotalsCells[col.key]}</td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
              {sortedEntries.length > 10 ? (
                <div className="api-actions" style={{ marginTop: 10 }}>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => setShowAllStatsRows((prev) => !prev)}
                  >
                    {showAllStatsRows ? "Show Less" : "See More"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </motion.div>
      </section>

      <section className="panels stats-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Volume Trend</h2>
              <p className="panel-subtitle">Clicks, registers, and FTDs over time.</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="statsVolumeClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickMargin={10}
                  minTickGap={16}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={axisTickStyle}
                  domain={[0, volumeDomainMax]}
                  tickFormatter={formatVolumeAxis}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatShortDate}
                  formatter={(value, name) => [value?.toLocaleString?.() ?? value, name]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="var(--blue)"
                  strokeWidth={2}
                  fill="url(#statsVolumeClicks)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="registers"
                  name="Registers"
                  stroke="var(--purple)"
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="ftds"
                  name="FTDs"
                  stroke="var(--green)"
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, delay: 0.10, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Funnel Rates</h2>
              <p className="panel-subtitle">Conversion rates per day.</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="statsRateC2R" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="statsRateR2D" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="statsRateC2F" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--orange)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickMargin={10}
                  minTickGap={16}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={axisTickStyle}
                  domain={[0, rateDomainMax]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatShortDate}
                  formatter={(value, name) => [fmtPercent(value), name]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="c2r"
                  name="Click2Register"
                  stroke="var(--purple)"
                  strokeWidth={2}
                  fill="url(#statsRateC2R)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="r2d"
                  name="Reg2Dep"
                  stroke="var(--green)"
                  strokeWidth={2}
                  fill="url(#statsRateR2D)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="c2f"
                  name="Click2FTD"
                  stroke="var(--orange)"
                  strokeWidth={2}
                  fill="url(#statsRateC2F)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, delay: 0.12, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">
                {resolvedCostMode === "cost" ? "Cost Metrics" : "Revenue & EPC"}
              </h2>
              <p className="panel-subtitle">
                {resolvedCostMode === "cost"
                  ? "Cost per click, register, and FTD."
                  : "Daily revenue with earnings per click."}
              </p>
            </div>
            <div className="stats-chart-toggle">
              {[
                { key: "cost", label: "Cost" },
                { key: "revenue", label: "Revenue" },
              ].map((mode) => (
                <button
                  type="button"
                  key={mode.key}
                  className={`overview-filter${resolvedCostMode === mode.key ? " is-active" : ""}`}
                  onClick={() => setStatsCostMode(mode.key)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div className="chart chart-surface">
            {resolvedCostMode === "cost" ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={chartData}
                  margin={{ top: 12, right: 24, left: 4, bottom: 4 }}
                  barCategoryGap={18}
                  barGap={6}
                >
                  <defs>
                    <linearGradient id="statsCostCpc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.25} />
                    </linearGradient>
                    <linearGradient id="statsCostCpr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.25} />
                    </linearGradient>
                    <linearGradient id="statsCostCpp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickMargin={10}
                    minTickGap={16}
                    tickFormatter={formatShortDate}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tick={axisTickStyle}
                    domain={[0, costDomainMax]}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={formatShortDate}
                    formatter={(value, name) => [fmtCost(value), name]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                  />
                  <Bar dataKey="cpc" name="CPC" fill="url(#statsCostCpc)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="cpr" name="CPR" fill="url(#statsCostCpr)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="cpp" name="CPP" fill="url(#statsCostCpp)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 12, right: 8, left: 4, bottom: 4 }}
                  barCategoryGap={18}
                >
                  <defs>
                    <linearGradient id="statsRevFtd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="statsRevRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c98500" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#c98500" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="statsRevTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickMargin={10}
                    minTickGap={16}
                    tickFormatter={formatShortDate}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tick={axisTickStyle}
                    domain={[0, revenueDomainMax]}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis
                    yAxisId="epc"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={formatShortDate}
                    formatter={(value, name) => [fmtCost(value), name]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                  />
                  {hasRevenueSplit ? (
                    <>
                      <Bar
                        dataKey="ftdRevenue"
                        name="FTD Revenue"
                        stackId="rev"
                        fill="url(#statsRevFtd)"
                        maxBarSize={36}
                      />
                      <Bar
                        dataKey="redepositRevenue"
                        name="Redeposit Revenue"
                        stackId="rev"
                        fill="url(#statsRevRed)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={36}
                      />
                    </>
                  ) : (
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="url(#statsRevTotal)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={36}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="epc"
                    name="EPC"
                    yAxisId="epc"
                    stroke="#ffd86b"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 2.6, strokeWidth: 1.6, fill: "#0f1217" }}
                    activeDot={{ r: 4.5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </section>
    </>
  );
}
