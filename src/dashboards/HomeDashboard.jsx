import React from "react";
import { ChartTooltip } from "../components/ChartTooltip.jsx";
import GeoTreemap from "../components/GeoTreemap.jsx";
import { ACCENT as MAP_ACCENT } from "../components/GeoTreemap.jsx";
import { PeriodSelect, formatShortDate } from "../components/PeriodSelect.jsx";
import { SkeletonCards, SkeletonChart } from "../components/Skeleton.jsx";
import { Sparkline } from "../components/Sparkline.jsx";
import { CountryFlag, OsGlyph, osHasGlyph } from "../components/flags.jsx";
import { ClicksIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { readSwrCache, writeSwrCache } from "../lib/cache.js";
import { useCostIntegrity } from "../lib/costIntegrity.js";
import { getPeriodDateRange, isDateInRange, normalizeDateRange, previousRangeOf } from "../lib/date.js";
import { isAllSelection, matchesCampaignListFilter, normalizeBuyerKey, normalizeFilterValue } from "../lib/filters.js";
import { formatCurrency, formatValue, formatVolumeAxis, toGradientId, tooltipStyle } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { liveClickSubIssues } from "../lib/live.js";
import { METRIC_COLORS, RATE_COLORS, STAGE_COLORS } from "../lib/metricColors.js";
import { DURATION, EASE, stagger } from "../lib/motion.js";
import { goToView } from "../lib/navigation.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { EMPTY_FLOW_FILTER, geoPalette, geoReference, homeChartSeries } from "../lib/view-helpers.js";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  MousePointerClick,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function HomeDashboard({
  period,
  setPeriod,
  customRange,
  onCustomChange,
  filters,
  onSeeGeos,
  onSeeLiveClicks,
  authUser,
  viewerBuyer,
}) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const [hoverSeries, setHoverSeries] = React.useState(null);
  const [selectedSeries, setSelectedSeries] = React.useState([]);
  const [hoverGeo, setHoverGeo] = React.useState(null);
  const [selectedGeo, setSelectedGeo] = React.useState(null);
  const [activeRateIndex, setActiveRateIndex] = React.useState(null);
  // Revenue is the default lens: a GEO that converts well but earns little
  // is not the top GEO, and the old default said it was.
  const [geoMetric, setGeoMetric] = React.useState("revenue");
  const [homeRows, setHomeRows] = React.useState([]);
  const [homeState, setHomeState] = React.useState({ loading: true, error: null });
  const [overviewFilters, setOverviewFilters] = React.useState(["ftds"]);
  const [recentClicks, setRecentClicks] = React.useState([]);
  const [recentClicksMeta, setRecentClicksMeta] = React.useState({ trackerNow: null, fetchedAt: null });
  const [recentClicksState, setRecentClicksState] = React.useState({ loading: true, error: null });

  // Small live-clicks preview for the dashboard — the newest handful of clicks,
  // scoped to the viewer server-side, refreshed on the same 20s cadence.
  const loadRecentClicks = React.useCallback(async () => {
    try {
      const response = await apiFetch("/api/keitaro/clicks-live?minutes=120&limit=60");
      if (!response.ok) throw new Error("Failed to load recent clicks.");
      const data = await response.json();
      setRecentClicks((Array.isArray(data?.rows) ? data.rows : []).slice(0, 7));
      setRecentClicksMeta({ trackerNow: data?.trackerNow || null, fetchedAt: Date.now() });
      setRecentClicksState({ loading: false, error: null });
    } catch (error) {
      setRecentClicksState({ loading: false, error: error.message || "Failed to load recent clicks." });
    }
  }, []);
  const recentClickAgo = React.useCallback(
    (datetime) => {
      const base = recentClicksMeta.trackerNow
        ? Date.parse(`${recentClicksMeta.trackerNow.replace(" ", "T")}Z`)
        : null;
      const ms = datetime ? Date.parse(`${String(datetime).replace(" ", "T")}Z`) : null;
      if (base === null || ms === null) return "";
      const drift = recentClicksMeta.fetchedAt ? Date.now() - recentClicksMeta.fetchedAt : 0;
      const seconds = Math.max(0, Math.floor((base + drift - ms) / 1000));
      if (seconds < 45) return "just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      return `${Math.floor(seconds / 3600)}h ago`;
    },
    [recentClicksMeta]
  );

  React.useEffect(() => {
    loadRecentClicks();
    const id = setInterval(() => {
      if (!document.hidden) loadRecentClicks();
    }, 20000);
    return () => clearInterval(id);
  }, [loadRecentClicks]);

  // Compute the active fetch range inline (periodRange itself is declared
  // further down, so we can't reference it here without a TDZ error). The
  // Filters modal also supplies dateFrom/dateTo; we honour the *union* of
  // both ranges so client-side filters never reference rows that weren't
  // downloaded — that's what was breaking "filter May shows nothing".
  const loadHomeStats = React.useCallback(async () => {
    const periodRangeInline = getPeriodDateRange(period, customRange);
    const fFrom = filters?.dateFrom || null;
    const fTo = filters?.dateTo || null;
    let fetchFrom =
      [periodRangeInline.from, fFrom].filter(Boolean).sort()[0] || null;
    const fetchTo =
      [periodRangeInline.to, fTo].filter(Boolean).sort().slice(-1)[0] || null;
    // When "compare to previous period" is on, pull the fetch window back to
    // the start of the previous period so both periods arrive in one request
    // and can be bucketed client-side.
    if (filters?.compareToPrev) {
      const curFrom = fFrom || periodRangeInline.from;
      const curTo = fTo || periodRangeInline.to;
      const prev = previousRangeOf(curFrom, curTo);
      if (prev.from) fetchFrom = [fetchFrom, prev.from].filter(Boolean).sort()[0] || fetchFrom;
    }
    const isoRe = /^\d{4}-\d{2}-\d{2}$/;
    const qs = new URLSearchParams();
    if (isoRe.test(fetchFrom || "")) qs.set("from", fetchFrom);
    if (isoRe.test(fetchTo || "")) qs.set("to", fetchTo);
    const liveUrl = `/api/keitaro/live-stats${qs.toString() ? `?${qs}` : ""}`;
    const cacheKey = `live-home:${fetchFrom || "_"}:${fetchTo || "_"}`;
    const cached = readSwrCache(cacheKey);
    if (cached && Array.isArray(cached)) {
      setHomeRows(cached);
      setHomeState({ loading: false, error: null });
    } else {
      setHomeState({ loading: true, error: null });
    }
    try {
      let rows = null;
      // Primary path: live, aggregated data straight from Keitaro.
      const response = await apiFetch(liveUrl);
      if (response.ok) {
        const data = await response.json();
        rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        // Fallback to the synced table when the live endpoint is unavailable.
        const sq = new URLSearchParams({ limit: "100000", strict: "1" });
        if (fetchFrom) sq.set("from", fetchFrom);
        if (fetchTo) sq.set("to", fetchTo);
        const fb = await apiFetch(`/api/media-stats?${sq.toString()}`);
        if (!fb.ok) throw new Error("Failed to load media buyer stats.");
        const fbData = await fb.json();
        rows = Array.isArray(fbData) ? fbData : [];
      }
      writeSwrCache(cacheKey, rows);
      setHomeRows(rows);
      setHomeState({ loading: false, error: null });
    } catch (error) {
      if (!cached) {
        setHomeState({ loading: false, error: error.message || "Failed to load stats." });
      }
    }
  }, [period, customRange.from, customRange.to, filters?.dateFrom, filters?.dateTo, filters?.compareToPrev]);

  React.useEffect(() => {
    loadHomeStats();
  }, [loadHomeStats]);

  React.useEffect(() => {
    const handleSync = () => {
      loadHomeStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [loadHomeStats]);

  const buyerFilter = filters?.buyer || "All";
  const countryFilter = filters?.country || "All";
  const flowFilter = Array.isArray(filters?.statsCampaign) ? filters.statsCampaign : EMPTY_FLOW_FILTER;

  const sum = (value) => Number(value || 0);
  const readNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };
  const readFtdRevenue = (row) =>
    readNumeric(row?.ftdRevenue ?? row?.ftd_revenue ?? 0);
  const readRedepositRevenue = (row) =>
    readNumeric(row?.redepositRevenue ?? row?.redeposit_revenue ?? 0);
  const readTotalRevenue = (row) => {
    const direct = row?.revenue;
    const ftdValue = readFtdRevenue(row);
    const redepositValue = readRedepositRevenue(row);
    if (direct !== undefined && direct !== null && direct !== "") {
      const numeric = Number(direct);
      if (Number.isFinite(numeric)) {
        if (numeric === 0 && (ftdValue > 0 || redepositValue > 0)) {
          return ftdValue + redepositValue;
        }
        return numeric;
      }
    }
    return ftdValue + redepositValue;
  };
  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCount = (value) => {
    if (value === null || value === undefined) return "—";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return Number.isInteger(numeric) ? numeric.toLocaleString() : numeric.toFixed(2);
  };
  const normalizeBuyerKey = (value) =>
    String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();
  const isAllSelection = (value) => !value || normalizeFilterValue(value) === "all";
  const matchesBuyer = (buyer) => {
    const normalizedBuyer = normalizeBuyerKey(buyer);
    if (!normalizedBuyer) return false;
    if (isAllSelection(buyerFilter)) {
      if (isLeadership) return true;
      if (viewerBuyer) {
        const normalizedViewer = normalizeBuyerKey(viewerBuyer);
        return normalizedBuyer.includes(normalizedViewer);
      }
      return true;
    }
    const normalizedFilter = normalizeBuyerKey(buyerFilter);
    if (!normalizedFilter) return false;
    return normalizedBuyer.includes(normalizedFilter) || normalizedFilter.includes(normalizedBuyer);
  };
  const matchesCountry = (country) => {
    if (isAllSelection(countryFilter)) return true;
    return normalizeFilterValue(country) === normalizeFilterValue(countryFilter);
  };

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const filterRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveRange = filterRange.from || filterRange.to ? filterRange : periodRange;

  const filteredRows = React.useMemo(() => {
    return homeRows.filter((row) => {
      if (!matchesBuyer(row.buyer)) return false;
      if (!matchesCountry(row.country)) return false;
      if (!matchesCampaignListFilter(row.campaign || row.campaign_name, flowFilter)) return false;
      if (!isDateInRange(row.date, effectiveRange)) return false;
      return true;
    });
  }, [
    homeRows,
    buyerFilter,
    countryFilter,
    flowFilter,
    effectiveRange.from,
    effectiveRange.to,
    isLeadership,
    viewerBuyer,
  ]);

  const totals = React.useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => ({
          spend: acc.spend + sum(row.spend),
          clicks: acc.clicks + sum(row.clicks),
          uniqueClicks: acc.uniqueClicks + sum(row.unique_clicks),
          installs: acc.installs + sum(row.installs),
          registers: acc.registers + sum(row.registers),
          ftds: acc.ftds + sum(row.ftds),
          redeposits: acc.redeposits + sum(row.redeposits),
        }),
        { spend: 0, clicks: 0, uniqueClicks: 0, installs: 0, registers: 0, ftds: 0, redeposits: 0 }
      ),
    [filteredRows]
  );

  // Conversion rates divide by unique clicks, not raw clicks.
  //
  // Only 37% of clicks here are unique, so dividing by the raw count answered
  // "what share of visits converted" when the question is "what share of
  // visitors converted" — and it disagreed with the rest of the app, which
  // already uses uniques. Click→Register read 7.77% on this page and 20.88%
  // on Campaigns and Statistics, under the same name.
  //
  // The fallback matters: 202 rows report a click count with no uniques at
  // all, which cannot be literally true, so a source that reports none falls
  // back to raw clicks rather than dividing by zero. Those rows carry 718 of
  // 28,438 clicks, so the fallback is a guard, not the usual path.
  const uniqueClickBase = totals.uniqueClicks > 0 ? totals.uniqueClicks : totals.clicks;
  const usingUniqueClicks = totals.uniqueClicks > 0;
  const c2i = toPercent(totals.installs, uniqueClickBase);
  const c2r = toPercent(totals.registers, uniqueClickBase);
  const i2r = toPercent(totals.registers, totals.installs);
  const r2d = toPercent(totals.ftds, totals.registers);
  const cpc = safeDivide(totals.spend, totals.clicks);
  const costPerRegister = safeDivide(totals.spend, totals.registers);
  const costPerFtd = safeDivide(totals.spend, totals.ftds);
  // One definition of revenue for the whole page.
  //
  // The KPI card used to sum ftd_revenue + redeposit_revenue while the
  // Statistics panel used readTotalRevenue (which prefers the tracker's own
  // `revenue`). Both were labelled "Total Revenue" and they disagreed by
  // $229.98 over 2026-08-01..20 — 15 rows carry revenue with no FTD and no
  // redeposit attached to them. That money is real, so the total includes it
  // and the split below names it rather than hiding it.
  // One pass, so the parts and the whole can never be computed off different
  // row sets. (`ftdRevenueTotal` further down is the Statistics panel's own
  // copy of the same figure, derived from revenueTotals.)
  const revenueSplit = React.useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => ({
          total: acc.total + readTotalRevenue(row),
          ftd: acc.ftd + readFtdRevenue(row),
          redeposit: acc.redeposit + readRedepositRevenue(row),
        }),
        { total: 0, ftd: 0, redeposit: 0 }
      ),
    [filteredRows]
  );
  const totalRevenue = revenueSplit.total;
  // Revenue the tracker reports that is attributed to neither conversion type.
  // Shown only when it exists, because a permanent "Other $0.00" is noise.
  const otherRevenueTotal = revenueSplit.total - revenueSplit.ftd - revenueSplit.redeposit;
  const roi = totals.spend > 0 ? ((totalRevenue - totals.spend) / totals.spend) * 100 : null;
  const periodLabel =
    effectiveRange.from && effectiveRange.to
      ? `${effectiveRange.from} → ${effectiveRange.to}`
      : period === "Custom range" && periodRange.from && periodRange.to
        ? `${periodRange.from} → ${periodRange.to}`
        : t(period);

  // The period now sits in the topbar, where it is true for the whole page.
  // Repeating it under three cards said the same thing four times on one
  // screen and pushed every card taller to do it. The caption survives for the
  // case it was actually useful in — when this card is NOT on the page period
  // — and says nothing when it would only be echoing the chip.
  const globalPeriodLabel =
    filters?.dateFrom && filters?.dateTo ? `${filters.dateFrom} → ${filters.dateTo}` : "";
  const periodMetaIfOverride = periodLabel === globalPeriodLabel ? "" : periodLabel;

  // ── Compare to previous period ──────────────────────────────────────────
  // The fetch (loadHomeStats) already pulled the prior window's rows when the
  // toggle is on, so we just bucket + aggregate them the same way.
  const compareOn = Boolean(filters?.compareToPrev);
  const prevRange = React.useMemo(
    () => (compareOn ? previousRangeOf(effectiveRange.from, effectiveRange.to) : { from: null, to: null }),
    [compareOn, effectiveRange.from, effectiveRange.to]
  );
  const prevTotals = React.useMemo(() => {
    if (!compareOn || !prevRange.from) return null;
    return homeRows
      .filter(
        (row) =>
          matchesBuyer(row.buyer) &&
          matchesCountry(row.country) &&
          matchesCampaignListFilter(row.campaign || row.campaign_name, flowFilter) &&
          isDateInRange(row.date, prevRange)
      )
      .reduce(
        (acc, row) => ({
          spend: acc.spend + sum(row.spend),
          clicks: acc.clicks + sum(row.clicks),
          registers: acc.registers + sum(row.registers),
          ftds: acc.ftds + sum(row.ftds),
          revenue: acc.revenue + readTotalRevenue(row),
        }),
        { spend: 0, clicks: 0, registers: 0, ftds: 0, revenue: 0 }
      );
  }, [compareOn, prevRange.from, prevRange.to, homeRows, buyerFilter, countryFilter, flowFilter, isLeadership, viewerBuyer]);

  // Relative % change vs the previous period. `positiveIsGood` flips the
  // good/bad colour for cost metrics (a drop in CPC is good).
  const mkDelta = (curr, prev, positiveIsGood = true) => {
    if (!compareOn || prev === null || prev === undefined) return null;
    const p = Number(prev);
    const c = Number(curr);
    if (!Number.isFinite(p) || p === 0 || !Number.isFinite(c)) return null;
    const pct = ((c - p) / Math.abs(p)) * 100;
    if (!Number.isFinite(pct)) return null;
    const up = pct >= 0;
    return { pct, up, good: up === positiveIsGood };
  };
  const prevCpc = prevTotals ? safeDivide(prevTotals.spend, prevTotals.clicks) : null;
  const prevCostPerRegister = prevTotals ? safeDivide(prevTotals.spend, prevTotals.registers) : null;
  const prevCostPerFtd = prevTotals ? safeDivide(prevTotals.spend, prevTotals.ftds) : null;
  const prevRoi =
    prevTotals && prevTotals.spend > 0 ? ((prevTotals.revenue - prevTotals.spend) / prevTotals.spend) * 100 : null;

  // Every figure below that divides by spend is fiction when the cost pipeline
  // is down. Crucially the test is NOT `spend === 0`: a broken pipeline still
  // records a trickle, and $128 against 22,845 clicks renders as a $0.01 CPC
  // and 704% ROI — plausible enough that nobody questions it. Only the tracker
  // knows whether any ad account is actually delivering spend, so ask it.
  // Marked rather than hidden: a buyer who cannot see a number assumes it is
  // fine, whereas a struck-through one with a reason is unmistakable.
  const costIntegrity = useCostIntegrity();
  const costUntrusted = totals.clicks > 0 && costIntegrity && !costIntegrity.trustworthy;
  // When NO account is delivering spend, a cost-derived figure is not merely
  // uncertain — it is arithmetic on a number we know to be wrong. $114 of
  // spend against 28,430 clicks printed "CPC $0.00" and "ROI 846.20%", and a
  // caption under a headline does not undo a headline. So the value is
  // withheld and the reason takes its place: a blank that explains itself
  // beats a confident wrong number.
  const spendAccounts = Number(costIntegrity?.accounts ?? 0);
  const spendDelivering = Number(costIntegrity?.delivering ?? 0);
  const costBlind = Boolean(costUntrusted) && spendAccounts > 0 && spendDelivering === 0;
  // Same sentence for every cost card, so the failure is stated once and reads
  // the same wherever it appears.
  const spendCoverageNote = spendAccounts > 0
    ? `${spendDelivering}/${spendAccounts} ${t("ad accounts reporting spend")}`
    : t("cost data incomplete");
  const costValue = (rendered) => (costBlind ? "—" : rendered);

  // Outcomes lead, inputs and costs support.
  //
  // The rail was eight cards of equal width in two rows of four, separated
  // only by 30px against 22px type, with revenue and cost interleaved. Nothing
  // said what to read first. Revenue is what the page is for, so it is the
  // hero; FTDs and ROI are the result beside it; volume and unit costs sit
  // below at a size that matches how often they decide anything.
  // Outcomes lead, inputs and costs support.
  //
  // The rail was eight cards of equal width in two rows of four, separated
  // only by 30px against 22px type, with revenue and cost interleaved.
  // Nothing said what to read first. Revenue is what the page is for, so it
  // takes double width and the largest figure; FTDs and ROI are the result
  // beside it; volume and unit costs sit below at a size matching how often
  // they decide anything.
  const homePrimaryStats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: Wallet,
      // Names every part of the number, so the total is checkable against the
      // Statistics panel by eye instead of being taken on trust.
      meta:
        otherRevenueTotal > 0.005
          ? `${t("FTD")} ${formatCurrency(revenueSplit.ftd)} · ${t("Redeposit")} ${formatCurrency(revenueSplit.redeposit)} · ${t("Other")} ${formatCurrency(otherRevenueTotal)}`
          : `${t("FTD")} ${formatCurrency(revenueSplit.ftd)} · ${t("Redeposit")} ${formatCurrency(revenueSplit.redeposit)}`,
      delta: mkDelta(totalRevenue, prevTotals?.revenue, true),
    },
    {
      label: "FTD",
      value: fmtCount(totals.ftds),
      icon: CreditCard,
      meta: periodMetaIfOverride,
      delta: mkDelta(totals.ftds, prevTotals?.ftds, true),
    },
    {
      label: "ROI",
      value: costValue(fmtPercent(roi)),
      icon: BarChart3,
      meta: "Revenue vs Spend",
      untrustedLabel: spendCoverageNote,
      delta: mkDelta(roi, prevRoi, true),
      untrusted: costUntrusted,
    },
  ];

  const homeSecondaryStats = [
    {
      label: "Clicks",
      value: fmtCount(totals.clicks),
      icon: MousePointerClick,
      meta: periodMetaIfOverride,
      sub: totals.uniqueClicks > 0 ? { value: fmtCount(totals.uniqueClicks), label: "Unique clicks" } : null,
      delta: mkDelta(totals.clicks, prevTotals?.clicks, true),
    },
    {
      label: "Register",
      value: fmtCount(totals.registers),
      icon: UserPlus,
      meta: periodMetaIfOverride,
      delta: mkDelta(totals.registers, prevTotals?.registers, true),
    },
    {
      label: "CPC",
      value: costValue(cpc === null ? "—" : formatCurrency(cpc)),
      icon: Wallet,
      meta: "Cost per click",
      untrustedLabel: spendCoverageNote,
      delta: mkDelta(cpc, prevCpc, false),
      untrusted: costUntrusted,
    },
    {
      label: "Cost per Register",
      value: costValue(costPerRegister === null ? "—" : formatCurrency(costPerRegister)),
      icon: Wallet,
      meta: "Cost per register",
      untrustedLabel: spendCoverageNote,
      delta: mkDelta(costPerRegister, prevCostPerRegister, false),
      untrusted: costUntrusted,
    },
    {
      label: "Cost per FTD",
      value: costValue(costPerFtd === null ? "—" : formatCurrency(costPerFtd)),
      icon: Wallet,
      meta: "Cost per FTD",
      untrustedLabel: spendCoverageNote,
      delta: mkDelta(costPerFtd, prevCostPerFtd, false),
      untrusted: costUntrusted,
    },
  ];

  const isSingleDayRange = Boolean(
    effectiveRange.from && effectiveRange.to && String(effectiveRange.from) === String(effectiveRange.to)
  );

  const getDateBucket = React.useCallback(
    (row) => {
      const dateValue = String(row?.date || "");
      const createdAtValue = String(row?.created_at || row?.createdAt || "");
      if (!isSingleDayRange) {
        const base = dateValue.split(" ")[0];
        return { key: base, label: formatShortDate(base), sortKey: base };
      }
      const parseTimestamp = (value) => {
        if (!value) return null;
        const normalized = value.includes("T") ? value : value.replace(" ", "T");
        const parsed = new Date(normalized);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      };
      const stamp = parseTimestamp(dateValue) || parseTimestamp(createdAtValue);
      if (!stamp) return { key: "00:00", label: "00:00", sortKey: "00:00" };
      const hour = String(stamp.getHours()).padStart(2, "0");
      return { key: `${hour}:00`, label: `${hour}:00`, sortKey: `${hour}:00` };
    },
    [isSingleDayRange]
  );

  const overviewData = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const bucket = getDateBucket(row);
      if (!bucket?.key) return;
      if (!map.has(bucket.key)) {
        map.set(bucket.key, {
          bucket: bucket.key,
          label: bucket.label,
          sortKey: bucket.sortKey,
          clicks: 0,
          installs: 0,
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
      current.registrations += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.spend += sum(row.spend);
      current.revenue += readTotalRevenue(row);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey)))
      .map((item) => ({
        ...item,
        roi: item.spend > 0 ? ((item.revenue - item.spend) / item.spend) * 100 : null,
      }));
  }, [filteredRows, getDateBucket]);

  const overviewMetricOptions = React.useMemo(
    () => [
      { key: "clicks", label: "Clicks", color: METRIC_COLORS.clicks, type: "count" },
      { key: "registrations", label: "Registration", color: METRIC_COLORS.registration, type: "count" },
      { key: "ftds", label: "FTDs", color: METRIC_COLORS.ftd, type: "count" },
      { key: "redeposits", label: "Redeposits", color: METRIC_COLORS.redeposit, type: "count" },
      { key: "roi", label: "ROI", color: METRIC_COLORS.roi, type: "percent" },
      { key: "revenue", label: "Revenue", color: METRIC_COLORS.revenue, type: "currency" },
    ],
    []
  );

  const activeOverviewMetrics = overviewMetricOptions.filter((metric) =>
    overviewFilters.includes(metric.key)
  );
  const formatOverviewMetricValue = (value, type) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    if (type === "currency") return formatCurrency(value);
    if (type === "percent") return fmtPercent(value);
    return fmtCount(value);
  };
  const toggleOverviewMetric = (key) => {
    setOverviewFilters((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const overviewPeak = React.useMemo(
    () => overviewData.reduce((max, item) => Math.max(max, item.ftds || 0), 0),
    [overviewData]
  );
  const overviewAvg =
    overviewData.length > 0
      ? overviewData.reduce((acc, item) => acc + (item.ftds || 0), 0) / overviewData.length
      : 0;

  const chartData = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = row.date;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          date: key,
          clicks: 0,
          uniqueClicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
        });
      }
      const current = map.get(key);
      current.clicks += sum(row.clicks);
      current.uniqueClicks += sum(row.unique_clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
    });
    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({
        day: formatShortDate(row.date),
        clicks: row.clicks,
        installs: row.installs,
        registers: row.registers,
        ftds: row.ftds,
        // Same denominator as the period figure, per day. Without this the
        // sparkline and the headline rate beside it describe different things.
        c2i: toPercent(row.installs, row.uniqueClicks > 0 ? row.uniqueClicks : row.clicks),
        c2r: toPercent(row.registers, row.uniqueClicks > 0 ? row.uniqueClicks : row.clicks),
        i2r: toPercent(row.registers, row.installs),
        r2d: toPercent(row.ftds, row.registers),
      }));
  }, [filteredRows]);

  const revenueSeries = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = row.date;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          date: key,
          revenue: 0,
          ftdRevenue: 0,
          redepositRevenue: 0,
          ftds: 0,
          redeposits: 0,
        });
      }
      const current = map.get(key);
      current.revenue += readTotalRevenue(row);
      current.ftdRevenue += readFtdRevenue(row);
      current.redepositRevenue += readRedepositRevenue(row);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  const revenueTotals = React.useMemo(
    () => revenueSeries.reduce(
      (acc, item) => ({
        revenue: acc.revenue + item.revenue,
        ftdRevenue: acc.ftdRevenue + item.ftdRevenue,
        redepositRevenue: acc.redepositRevenue + item.redepositRevenue,
        ftds: acc.ftds + item.ftds,
        redeposits: acc.redeposits + item.redeposits,
      }),
      { revenue: 0, ftdRevenue: 0, redepositRevenue: 0, ftds: 0, redeposits: 0 }
    ),
    [revenueSeries]
  );

  const avg = (values) =>
    values.length ? values.reduce((sumValue, value) => sumValue + value, 0) / values.length : null;
  const dailyFtdRevenue = revenueSeries
    .filter((item) => item.ftdRevenue > 0)
    .map((item) => item.ftdRevenue);
  const dailyRedepositRevenue = revenueSeries
    .filter((item) => item.redepositRevenue > 0)
    .map((item) => item.redepositRevenue);
  const dailyCrFtdToRedeposit = revenueSeries
    .filter((item) => item.ftds > 0)
    .map((item) => (item.redeposits / item.ftds) * 100);

  const benchmark = {
    ftdRevenue: avg(dailyFtdRevenue),
    redepositRevenue: avg(dailyRedepositRevenue),
    ftdToRedepositCr: avg(dailyCrFtdToRedeposit),
  };

  const classifyMetric = (value, baseline) => {
    if (value === null || baseline === null || !Number.isFinite(baseline)) {
      return { tone: "neutral", label: t("No benchmark") };
    }
    const ratio = value / baseline;
    if (ratio >= 1.1) return { tone: "good", label: t("Above avg") };
    if (ratio <= 0.9) return { tone: "bad", label: t("Below avg") };
    return { tone: "neutral", label: t("On target") };
  };

  const ftdRevenueTotal = revenueTotals.ftdRevenue;
  const redepositRevenueTotal = revenueTotals.redepositRevenue;
  const ftdToRedepositCr =
    revenueTotals.ftds > 0 ? (revenueTotals.redeposits / revenueTotals.ftds) * 100 : null;

  const ftdRevenueStatus = classifyMetric(ftdRevenueTotal, benchmark.ftdRevenue);
  const redepositRevenueStatus = classifyMetric(
    redepositRevenueTotal,
    benchmark.redepositRevenue
  );
  const ftdToRedepositStatus = classifyMetric(ftdToRedepositCr, benchmark.ftdToRedepositCr);

  const funnelData = React.useMemo(() => {
    const stages = [
      // The funnel opens where the rates are measured. Opening on raw clicks
      // while Click→Register divided by uniques made the first drop look 2.7x
      // worse than it is. Statistics already opens on uniques for this reason.
      {
        name: usingUniqueClicks ? "Unique clicks" : "Clicks",
        value: uniqueClickBase,
        color: STAGE_COLORS.Clicks,
      },
      { name: "Install", value: totals.installs, color: STAGE_COLORS.Install },
      { name: "Register", value: totals.registers, color: STAGE_COLORS.Register },
      { name: "FTD", value: totals.ftds, color: STAGE_COLORS.FTD },
    ];
    // A stage reading zero while later stages do not is not a step everybody
    // failed — it is a step this business does not track. Casino traffic has
    // no app installs (0 across all 1,504 rows for 2026-08-01..20), and
    // keeping the stage drew an empty bar and made the funnel read
    // Install 0 < Register 2,209, which cannot happen in a funnel.
    return stages.filter((stage, index) => index === 0 || stage.value > 0);
  }, [totals]);

  // The counts are not the insight — the drop between them is. 28,430 clicks
  // next to 209 FTDs on a linear axis put three of four bars under 15px,
  // which said nothing that "clicks are big" did not already say.
  const funnelSteps = React.useMemo(() => {
    const first = funnelData[0]?.value || 0;
    return funnelData.map((stage, index) => {
      const prev = index === 0 ? null : funnelData[index - 1]?.value || 0;
      return {
        ...stage,
        ofFirst: first > 0 ? (stage.value / first) * 100 : null,
        fromPrev: index === 0 || !prev ? null : (stage.value / prev) * 100,
        prevName: index === 0 ? null : funnelData[index - 1]?.name,
      };
    });
  }, [funnelData]);

  const conversionData = React.useMemo(
    () =>
      [
        { key: "c2i", name: "Click2Install", value: c2i ? Math.round(c2i) : 0, color: RATE_COLORS.c2i, rate: c2i },
        { key: "c2r", name: "Click2Register", value: c2r ? Math.round(c2r) : 0, color: RATE_COLORS.c2r, rate: c2r },
        { key: "i2r", name: "Install2Reg", value: i2r ? Math.round(i2r) : 0, color: RATE_COLORS.i2r, rate: i2r },
        { key: "r2d", name: "Reg2Dep", value: r2d ? Math.round(r2d) : 0, color: RATE_COLORS.r2d, rate: r2d },
      ]
        // Both install rates are structurally zero here — nothing reports an
        // install — and averaging two real rates with two permanent zeros is
        // what produced a headline "4% Avg rate" when the two rates that
        // exist are 7.8% and 9.5%. A stage nobody measures is not a stage
        // everybody failed, so it is left out rather than counted as zero.
        .filter((item) => item.rate !== null && item.rate !== undefined && Number.isFinite(item.rate) && item.rate > 0),
    [c2i, c2r, i2r, r2d]
  );

  const avgRate = conversionData.length
    ? Math.round(conversionData.reduce((sumValue, item) => sumValue + item.value, 0) / conversionData.length)
    : 0;
  const donutValue =
    activeRateIndex !== null ? `${conversionData[activeRateIndex].value}%` : `${avgRate}%`;
  const donutLabel =
    activeRateIndex !== null ? t(conversionData[activeRateIndex].name) : t("Avg rate");

  // Only draw the rates this business measures.
  //
  // homeChartSeries lists all four handoffs, but nothing here reports an app
  // install, so Click2Install and Install2Reg are flat zero on every day of
  // every range — two lines pinned to the axis, and two legend entries that
  // toggle nothing. Same reason the funnel drops its Install stage.
  const activeChartSeries = React.useMemo(
    () =>
      homeChartSeries.filter((series) =>
        chartData.some((point) => {
          const value = Number(point?.[series.key]);
          return Number.isFinite(value) && value > 0;
        })
      ),
    [chartData]
  );

  const geoMetrics = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!country) return;
      if (!map.has(country)) {
        map.set(country, { clicks: 0, uniqueClicks: 0, registers: 0, ftds: 0, revenue: 0 });
      }
      const current = map.get(country);
      current.clicks += sum(row.clicks);
      current.uniqueClicks += sum(row.unique_clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      // The panel used to carry no money at all, which is how a GEO worth $56
      // came to be presented as the best one on the page.
      current.revenue += readTotalRevenue(row);
    });
    return Array.from(map.entries()).map(([country, stats], index) => {
      // Per-visitor, not per-visit — the same basis as the funnel and the
      // handoff rates, so a GEO's numbers mean the same thing wherever they
      // are read.
      const geoUniques = stats.uniqueClicks > 0 ? stats.uniqueClicks : stats.clicks;
      const ftdRate = toPercent(stats.ftds, geoUniques) ?? 0;
      const reg2depRate = toPercent(stats.ftds, stats.registers) ?? 0;
      const ref = geoReference[country] || {};
      return {
        name: country,
        iso: ref.iso || country,
        coordinates: ref.coordinates || null,
        color: geoPalette[index % geoPalette.length],
        clicks: stats.clicks,
        uniqueClicks: geoUniques,
        registers: stats.registers,
        ftds: stats.ftds,
        revenue: stats.revenue,
        // Revenue per unique click — the one efficiency measure that compares
        // a GEO with 573 clicks against one with 9,912 without favouring
        // either. On raw clicks this measured how often the same visitor
        // returned as much as it measured what a visitor was worth.
        epc: geoUniques > 0 ? stats.revenue / geoUniques : 0,
        // Kept at one decimal: rounding 1.9% to 2% and 17.2% to 17% threw away
        // the difference between the GEOs being ranked.
        ftdRate: Number(ftdRate.toFixed(1)),
        reg2depRate: Number(reg2depRate.toFixed(1)),
      };
    });
  }, [filteredRows]);

  // A rate needs a denominator big enough to mean something. Bolivia's 17.2%
  // Reg→Dep came off 93 registrations and $56.02 of revenue, and it outranked
  // Brazil, which converts at 14.3% on 676 registrations and $462.12. Ranking
  // by rate with no floor promotes whichever GEO has the smallest sample.
  //
  // The floor is relative so it survives a one-day range as well as a quarter,
  // and it is stated in the UI rather than applied silently.


  // What the map draws: one row per country that produced something, valued
  // by the active lens. The map fits its own projection to these, so there is
  // no centre, scale or padding to keep in sync here.
  // Each handoff as a rate plus the shape of that rate over the period.
  //
  // This replaces a donut. A ring says "parts of a whole", but Click→Register
  // and Register→Deposit are independent ratios over different denominators —
  // they sum to nothing, so sizing each arc by its share of that sum encoded a
  // quantity that does not exist, and the figure in the middle averaged two
  // unrelated rates into "9%".
  //
  // The period rate is computed from period totals, not by averaging the daily
  // rates: a day with 4 clicks would otherwise weigh as much as a day with
  // 4,000. The sparkline shows the daily values behind it.
  const handoffRates = React.useMemo(
    () =>
      conversionData.map((item) => {
        const daily = chartData
          .map((point) => {
            const value = Number(point?.[item.key]);
            return Number.isFinite(value) ? value : null;
          })
          .filter((value) => value !== null);
        const peak = daily.length ? Math.max(...daily) : null;
        const trough = daily.length ? Math.min(...daily) : null;
        return { ...item, daily, peak, trough };
      }),
    [conversionData, chartData]
  );

  // Who produced it.
  //
  // Eight people run this traffic and the main dashboard had no per-buyer view
  // at all — the question went to Campaigns or Reports. Same measures as the
  // GEO table, on the same basis, so the two can be read against each other.
  const buyerRows = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const buyer = String(row.buyer || "").trim();
      if (!buyer) return;
      if (!map.has(buyer)) {
        map.set(buyer, { buyer, clicks: 0, uniqueClicks: 0, registers: 0, ftds: 0, revenue: 0 });
      }
      const current = map.get(buyer);
      current.clicks += sum(row.clicks);
      current.uniqueClicks += sum(row.unique_clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.revenue += readTotalRevenue(row);
    });
    return Array.from(map.values())
      .map((entry) => {
        const uniques = entry.uniqueClicks > 0 ? entry.uniqueClicks : entry.clicks;
        return {
          ...entry,
          uniques,
          reg2dep: toPercent(entry.ftds, entry.registers) ?? 0,
          epc: uniques > 0 ? entry.revenue / uniques : 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredRows]);
  const buyerRevenueMax = buyerRows.reduce((acc, row) => Math.max(acc, row.revenue), 0);

  const geoMapRows = React.useMemo(
    () =>
      geoMetrics
        .filter((geo) => (Number(geo[geoMetric]) || 0) > 0)
        .map((geo) => ({
          key: geo.iso,
          label: geo.name,
          name: geo.name,
          iso: geo.iso,
          value: Number(geo[geoMetric]) || 0,
        })),
    [geoMetrics, geoMetric]
  );

  const geoSampleFloor = React.useMemo(() => {
    const totalRegisters = geoMetrics.reduce((acc, geo) => acc + geo.registers, 0);
    // 5% of the period's registrations. At 2% the floor sat around 44, which
    // still let Bolivia's 17.2% off 93 registrations lead the rate ranking —
    // and that rate carries a 95% interval of roughly 9–25%, wide enough to
    // overlap Brazil's 14.3% off 677 completely. A rate that cannot be
    // distinguished from the one below it should not be sorted above it.
    return Math.max(30, Math.round(totalRegisters * 0.05));
  }, [geoMetrics]);

  const geoMetricKey = geoMetric;
  // "Combined" used to average an FTD rate (per click) with a Reg→Dep rate
  // (per registration). Two different denominators do not average into
  // anything, so the lens is gone and revenue takes its place as the default.
  const geoMetricsWithCombined = geoMetrics;
  const geoIsRateMetric = geoMetricKey === "ftdRate" || geoMetricKey === "reg2depRate";
  const geoSorted = React.useMemo(() => {
    const ranked = [...geoMetrics];
    if (!geoIsRateMetric) {
      return ranked.sort((a, b) => b[geoMetricKey] - a[geoMetricKey]);
    }
    // Under-sampled GEOs keep their place in the list but fall below the ones
    // that clear the floor, rather than vanishing — hiding them would answer
    // "where did Bolivia go" with silence.
    const clears = (geo) => geo.registers >= geoSampleFloor;
    return ranked.sort((a, b) => {
      const ac = clears(a);
      const bc = clears(b);
      if (ac !== bc) return ac ? -1 : 1;
      return b[geoMetricKey] - a[geoMetricKey];
    });
  }, [geoMetrics, geoMetricKey, geoIsRateMetric, geoSampleFloor]);
  const topGeoList = geoSorted.slice(0, 3);
  // Ten rows, not three. The panel is full width now, and 33 countries behind
  // a "See more" button was mostly a consequence of the old 268px column.
  const geoTableRows = geoSorted.slice(0, 10);
  const metricValues = geoSorted.map((item) => item[geoMetricKey]);
  const metricMax = metricValues.length ? Math.max(...metricValues) : 0;
  // One formatter, so the toggle, the headline and the list can never disagree
  // about what a number means.
  const formatGeoMetric = React.useCallback(
    (value) => {
      if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
      const numeric = Number(value);
      if (geoMetricKey === "revenue") return formatCurrency(numeric);
      if (geoMetricKey === "epc") return formatCurrency(numeric);
      return `${numeric.toFixed(1)}%`;
    },
    [geoMetricKey]
  );
  const activeGeo = selectedGeo ?? hoverGeo;
  const activeGeoData = geoMetricsWithCombined.find((marker) => marker.iso === activeGeo) || null;
  const topGeo = geoSorted[0] || null;
  const focusGeo = activeGeoData || topGeo;
  const mapGeo = focusGeo || topGeo;

  const geoMetricOptions = [
    { value: "revenue", label: t("Revenue") },
    { value: "epc", label: t("Rev / unique") },
    { value: "reg2depRate", label: t("Reg2Dep rate") },
  ];

  const activeGeoName = focusGeo?.name;

  const handleSeriesToggle = (key) => {
    setSelectedSeries((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const effectiveHover = selectedSeries.length ? null : hoverSeries;
  const tooltipVisibleKeys = selectedSeries.length
    ? selectedSeries
    : effectiveHover
    ? [effectiveHover]
    : null;

  const isSeriesActive = (key) => {
    if (selectedSeries.length) return selectedSeries.includes(key);
    if (effectiveHover) return effectiveHover === key;
    return true;
  };

  const isSeriesMuted = (key) => {
    if (selectedSeries.length) return !selectedSeries.includes(key);
    if (effectiveHover) return effectiveHover !== key;
    return false;
  };

  const handleGeoEnter = (iso) => {
    if (!selectedGeo) setHoverGeo(iso);
  };

  const handleGeoLeave = () => {
    if (!selectedGeo) setHoverGeo(null);
  };

  const handleGeoToggle = (iso) => {
    setSelectedGeo((prev) => (prev === iso ? null : iso));
    setHoverGeo(null);
  };


  // First load — show only skeletons (early-return) so the zero-state real
  // cards don't pile up below the placeholders. Error case falls through so
  // the retry banner + cached/zero data render normally.
  if (homeState.loading && homeRows.length === 0 && !homeState.error) {
    return (
      <>
        <SkeletonCards count={4} />
        <SkeletonCards count={4} />
        <SkeletonChart height={240} />
      </>
    );
  }

  return (
    <>
      {homeState.error ? (
        <div className="empty-state error stats-error">
          <span className="stats-error-icon" aria-hidden="true">!</span>
          <div className="stats-error-text">
            <strong>{t("Couldn't load media buyer stats")}</strong>
            <span>{homeState.error}</span>
          </div>
          <button
            type="button"
            className="stats-error-retry"
            onClick={loadHomeStats}
            disabled={homeState.loading}
          >
            <RotateCcw size={12} className={homeState.loading ? "is-spinning" : ""} />
            {homeState.loading ? t("Retrying…") : t("Retry")}
          </button>
        </div>
      ) : null}
      <section className="cards hero">
        {homePrimaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stagger(idx), duration: DURATION.settle, ease: EASE }}
            >
              <div className="card-head">
                <Icon size={20} />
                {t(stat.label)}
                {stat.delta ? (
                  <span className={`kpi-delta${stat.delta.good ? " is-good" : " is-bad"}`} title={t("vs previous period")}>
                    {stat.delta.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(stat.delta.pct).toFixed(1)}%
                  </span>
                ) : null}
              </div>
              <div className={`card-value${stat.untrusted ? " is-untrusted" : ""}`}>{stat.value}</div>
              {stat.untrusted ? (
                <button
                  type="button"
                  className="card-untrusted"
                  onClick={() => goToView("health")}
                  title={t("Spend is missing for some ad accounts, so this figure is computed from incomplete cost. Open Health to see why.")}
                >
                  <AlertTriangle size={11} /> {stat.untrustedLabel || t("cost data incomplete")}
                </button>
              ) : null}
              {stat.sub ? (
                <div className="card-sub">
                  <span className="card-sub-dot" />
                  <span className="card-sub-value">{stat.sub.value}</span>
                  <span className="card-sub-label">{t(stat.sub.label)}</span>
                </div>
              ) : null}
              {stat.meta ? <div className="card-meta">{t(stat.meta)}</div> : null}
            </motion.div>
          );
        })}
      </section>

      <section className="cards secondary">
        {homeSecondaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.08, duration: 0.5 }}
            >
              <div className="card-head">
                <Icon size={20} />
                {t(stat.label)}
                {stat.delta ? (
                  <span className={`kpi-delta${stat.delta.good ? " is-good" : " is-bad"}`} title={t("vs previous period")}>
                    {stat.delta.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(stat.delta.pct).toFixed(1)}%
                  </span>
                ) : null}
              </div>
              <div className={`card-value${stat.untrusted ? " is-untrusted" : ""}`}>{stat.value}</div>
              {stat.untrusted ? (
                <button
                  type="button"
                  className="card-untrusted"
                  onClick={() => goToView("health")}
                  title={t("Spend is missing for some ad accounts, so this figure is computed from incomplete cost. Open Health to see why.")}
                >
                  <AlertTriangle size={11} /> {stat.untrustedLabel || t("cost data incomplete")}
                </button>
              ) : null}
              {stat.meta ? <div className="card-meta">{t(stat.meta)}</div> : null}
            </motion.div>
          );
        })}
      </section>

      <section className="panels panels-single">
        <motion.div
          className="panel ftd-volume-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Overview")}</h2>
              <p className="panel-subtitle">
                {isSingleDayRange ? t("Performance by hour") : t("Performance by date")}
              </p>
            </div>
            <div className="summary-inline">
              <span>{`${t("Peak")}: ${fmtCount(overviewPeak)}`}</span>
              <span>{`${isSingleDayRange ? t("Avg/hour") : t("Avg/day")}: ${fmtCount(overviewAvg)}`}</span>
            </div>
          </div>
          <div className="chart">
            <div className="chart-surface">
              {overviewData.length ? (
                activeOverviewMetrics.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={overviewData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      {activeOverviewMetrics.map((metric) => (
                        <linearGradient
                          key={metric.key}
                          id={`overview-gradient-${metric.key}`}
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
                      // Every day was labelled, which put 20 labels almost
                      // touching across a 20-day range while the Statistics
                      // chart below drew 10 over the same dates. Thin to a
                      // readable count and let the tooltip carry the rest.
                      interval={overviewData.length > 12 ? Math.ceil(overviewData.length / 10) - 1 : 0}
                      minTickGap={8}
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
                              const metric = overviewMetricOptions.find((entry) => entry.key === item.dataKey);
                              if (!metric) return null;
                              return (
                                <div className="tooltip-row" key={item.dataKey}>
                                  <span className="tooltip-dot" style={{ background: metric.color }} />
                                  <span>{t(metric.label)}</span>
                                  <span className="tooltip-value">
                                    {formatOverviewMetricValue(item.value, metric.type)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }}
                    />
                    {activeOverviewMetrics.map((metric) => (
                      <Area
                        key={metric.key}
                        type="monotone"
                        dataKey={metric.key}
                        name={t(metric.label)}
                        yAxisId={metric.type === "percent" ? "right" : "left"}
                        stroke={metric.color}
                        strokeWidth={2.1}
                        fill={`url(#overview-gradient-${metric.key})`}
                        dot={{ r: 2.4, fill: metric.color, stroke: "#0f1216", strokeWidth: 1.2 }}
                        activeDot={{ r: 4, fill: "#0f1216", stroke: metric.color, strokeWidth: 1.8 }}
                        isAnimationActive
                        animationDuration={700}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
                ) : (
                  <div className="empty-state">{t("Select at least one metric filter.")}</div>
                )
              ) : (
                <div className="empty-state">{t("No overview data available.")}</div>
              )}
            </div>
            <div className="overview-filters">
              {overviewMetricOptions.map((metric) => {
                const active = overviewFilters.includes(metric.key);
                return (
                  <button
                    type="button"
                    key={metric.key}
                    className={`overview-filter${active ? " is-active" : ""}`}
                    onClick={() => toggleOverviewMetric(metric.key)}
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
                    {t(metric.label)}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.5 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#58b1ff" }}>
                <ClicksIcon size={15} strokeWidth={2.2} />
              </span>
              <div>
                <h2 className="panel-title">{t("Last Clicks")}</h2>
                <p className="panel-subtitle">{t("Newest clicks from the tracker — live.")}</p>
              </div>
            </div>
            <div className="campaign-table-actions">
              <span className="live-indicator"><i aria-hidden="true" />{t("Live")}</span>
              {onSeeLiveClicks ? (
                <button type="button" className="ghost" onClick={() => onSeeLiveClicks()}>
                  {t("View all")}
                </button>
              ) : null}
            </div>
          </div>
          {recentClicksState.loading && !recentClicks.length ? (
            <div className="empty-state">{t("Loading recent clicks…")}</div>
          ) : recentClicksState.error && !recentClicks.length ? (
            <div className="empty-state error">{recentClicksState.error}</div>
          ) : !recentClicks.length ? (
            <div className="empty-state">{t("No clicks in the last 2 hours.")}</div>
          ) : (
            <div className="last-clicks-list">
              <div className="last-click-head">
                <span>Time</span>
                <span />
                <span>Buyer · Campaign</span>
                <span>Source</span>
                <span>Device</span>
                <span className="lc-head-status">Status</span>
              </div>
              {recentClicks.map((row) => {
                const issues = liveClickSubIssues(row);
                const source = String(row.subs?.[1] ?? "").trim();
                const geoLine = [row.country, row.city].filter(Boolean).join(" · ");
                return (
                  <button
                    type="button"
                    key={row.id}
                    className={`last-click-item${row.isBot ? " is-bot" : ""}`}
                    onClick={() => onSeeLiveClicks?.()}
                    title={row.campaign}
                  >
                    <span className="lc-col-time">
                      <b>{String(row.datetime).slice(11) || "—"}</b>
                      <em>{recentClickAgo(row.datetime)}</em>
                    </span>
                    <span className="lc-col-flag">
                      <CountryFlag value={row.countryCode || row.country} size={16} />
                    </span>
                    <span className="lc-col-main">
                      <span className="lc-main-top">
                        <b className="lc-buyer">{row.buyer || "—"}</b>
                        {geoLine ? <span className="lc-geo">{geoLine}</span> : null}
                      </span>
                      <span className="lc-camp">{row.campaign || "—"}</span>
                    </span>
                    <span className="lc-col-source" title={source || "no source"}>
                      {source || <span className="lc-dim-dash">—</span>}
                    </span>
                    <span className="lc-col-device">
                      {osHasGlyph(row.os) ? <OsGlyph os={row.os} size={14} /> : null}
                      {row.browser ? <span>{row.browser}</span> : <span className="lc-dim-dash">—</span>}
                    </span>
                    <span className="lc-col-badges">
                      {row.isUnique ? <span className="lc-flag lc-flag-unique" title="Unique click">U</span> : null}
                      {row.isBot ? <span className="lc-flag lc-flag-bot" title="Bot">BOT</span> : null}
                      {row.isProxy ? <span className="lc-flag lc-flag-proxy" title="Proxy/VPN">PXY</span> : null}
                      {issues.length ? (
                        <span className="lc-flag lc-flag-issue" title={`${issues.length} empty/unfilled sub(s)`}>
                          UTM
                        </span>
                      ) : null}
                      {!row.isUnique && !row.isBot && !row.isProxy && !issues.length ? (
                        <span className="lc-flag lc-flag-clean" title="Clean">OK</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </section>

      <section className="panels panels-single">
        <motion.div
          className="panel stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Statistics")}</h2>
              <p className="panel-subtitle">{t("Daily conversion rates")}</p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {activeChartSeries.map((series) => (
                    <linearGradient
                      key={series.key}
                      id={`smooth-${toGradientId(series.key)}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={series.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b909a", fontSize: 11 }}
                />
                <YAxis
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  tick={{ fill: "#8b909a", fontSize: 11 }}
                  // This chart plots rates. Without the unit it is styled
                  // identically to the Overview chart, which plots counts.
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={(props) => (
                    <ChartTooltip {...props} visibleKeys={tooltipVisibleKeys} />
                  )}
                />
                {activeChartSeries.map((series) => {
                  const active = isSeriesActive(series.key);
                  const muted = isSeriesMuted(series.key);
                  return (
                    <Area
                      key={series.key}
                      type="monotone"
                      dataKey={series.key}
                      name={t(series.label)}
                      stroke={series.color}
                      strokeWidth={active ? series.width + 0.8 : series.width + 0.4}
                      strokeOpacity={muted ? 0.2 : 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={`url(#smooth-${toGradientId(series.key)})`}
                      fillOpacity={muted ? 0.05 : active ? 0.28 : 0.18}
                      dot={false}
                      activeDot={
                        active
                          ? { r: 4, fill: "#0f1216", stroke: series.color, strokeWidth: 2 }
                          : false
                      }
                      isAnimationActive
                      animationDuration={900}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
            <div className="legend">
              {activeChartSeries.map((item) => {
                const active = selectedSeries.length
                  ? selectedSeries.includes(item.key)
                  : hoverSeries === item.key;
                const muted = isSeriesMuted(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={`legend-item is-interactive${active ? " is-active" : ""}${
                      muted ? " is-muted" : ""
                    }`}
                    onMouseEnter={() => setHoverSeries(item.key)}
                    onMouseLeave={() => setHoverSeries(null)}
                    onClick={() => handleSeriesToggle(item.key)}
                    aria-pressed={selectedSeries.includes(item.key)}
                  >
                    <span className="dot" style={{ background: item.color }} />
                    {t(item.label)}
                  </button>
                );
              })}
            </div>
            <p className="chart-hint">{t("Tip: hover or click legends to isolate a series.")}</p>
            <div className="revenue-blocks">
              <div className="revenue-head">
                <div>
                  <h3>{t("Revenue by date")}</h3>
                  <p>{t("Daily revenue trend for the selected period.")}</p>
                </div>
                <div className="revenue-total">
                  <span>{t("Total Revenue")}</span>
                  <strong>{formatCurrency(revenueTotals.revenue)}</strong>
                </div>
              </div>
              {/* The heading promised a daily trend and the section showed three
                  summary cards. This is that trend. */}
              {revenueSeries.length > 1 ? (
                <div className="revenue-trend">
                  <Sparkline
                    values={revenueSeries.map((item) => item.revenue)}
                    color={METRIC_COLORS.revenue}
                    width={560}
                    height={54}
                  />
                  <div className="revenue-trend-foot">
                    <span>{formatShortDate(revenueSeries[0].date)}</span>
                    <span>
                      {t("peak")}{" "}
                      {formatCurrency(Math.max(...revenueSeries.map((item) => item.revenue)))}
                    </span>
                    <span>{formatShortDate(revenueSeries[revenueSeries.length - 1].date)}</span>
                  </div>
                </div>
              ) : null}
              <div className="revenue-grid">
                <div className={`revenue-card ${ftdRevenueStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("FTD Revenue")}</span>
                    <span className={`revenue-chip ${ftdRevenueStatus.tone}`}>
                      {ftdRevenueStatus.label}
                    </span>
                  </div>
                  <strong>
                    {Number.isFinite(ftdRevenueTotal) ? formatCurrency(ftdRevenueTotal) : "—"}
                  </strong>
                </div>
                <div className={`revenue-card ${redepositRevenueStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("Redeposit Revenue")}</span>
                    <span className={`revenue-chip ${redepositRevenueStatus.tone}`}>
                      {redepositRevenueStatus.label}
                    </span>
                  </div>
                  <strong>
                    {Number.isFinite(redepositRevenueTotal)
                      ? formatCurrency(redepositRevenueTotal)
                      : "—"}
                  </strong>
                </div>
                <div className={`revenue-card ${ftdToRedepositStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("FTD to Redeposit CR")}</span>
                    <span className={`revenue-chip ${ftdToRedepositStatus.tone}`}>
                      {ftdToRedepositStatus.label}
                    </span>
                  </div>
                  <strong>
                    {ftdToRedepositCr === null ? "—" : `${ftdToRedepositCr.toFixed(2)}%`}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Its own full-width row. Sharing a row with Statistics left the
          country list 268px wide, which is why it showed three of 33 GEOs
          with no room for the numbers behind them. */}
      <section className="panels panels-single">

        <motion.div
          className="panel map"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, delay: 0.10, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Top GEO")}</h2>
              <p className="panel-subtitle">
                {geoIsRateMetric
                  ? `${t("Ranked by rate, with at least")} ${geoSampleFloor.toLocaleString()} ${t("registrations")}`
                  : t("Where the money came from")}
              </p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="map-wrap">
            <div className="map-controls">
              {geoMetricOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`map-toggle${geoMetric === option.value ? " is-active" : ""}`}
                  onClick={() => setGeoMetric(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="map-grid">
              <div className="map-visual">
                <GeoTreemap
                  rows={geoMapRows}
                  activeKey={focusGeo?.iso || null}
                  onHover={(tile) => (tile ? handleGeoEnter(tile.key) : handleGeoLeave())}
                  onSelect={(tile) => handleGeoToggle(tile.key)}
                  formatValue={formatGeoMetric}
                  height={460}
                  emptyLabel={t("No countries in range")}
                />
                <p className="geo-tree-note">
                  {t("Every country with activity, sized by share")}
                </p>
              </div>
              <div className="geo-board">
                <div className="map-info-card">
                  <div className="map-info-head">
                    <span>{t("Active GEO")}</span>
                    <span className="map-info-metric">
                      {geoMetricOptions.find((option) => option.value === geoMetric)?.label}
                    </span>
                  </div>
                  <div className="map-info-main">
                    <div className="map-info-name">{activeGeoName || t("None")}</div>
                    <span className="map-info-score">
                      {focusGeo ? formatGeoMetric(focusGeo[geoMetricKey]) : "--"}
                    </span>
                  </div>
                </div>
                {/* A table, now that there is width for one. The ranked list
                    showed three of 33 countries and had to hide volume in a
                    caption; every column here was already computed. */}
                <div className="geo-table-wrap">
                  <table className="geo-table">
                    <thead>
                      <tr>
                        <th className="geo-col-rank" scope="col">#</th>
                        <th scope="col">{t("Country")}</th>
                        <th className="geo-num" scope="col" title={t("Unique clicks")}>{t("Unique")}</th>
                        <th className="geo-num" scope="col" title={t("Registrations")}>{t("Regs")}</th>
                        <th className="geo-num" scope="col">{t("FTD")}</th>
                        <th className="geo-num" scope="col" title={t("Reg2Dep rate")}>{t("Reg→Dep")}</th>
                        <th className="geo-num" scope="col" title={t("Rev / unique")}>{t("Rev/uniq")}</th>
                        <th className="geo-num" scope="col">{t("Revenue")}</th>
                        <th className="geo-col-share" scope="col">
                          <span className="sr-only">{t("Share of the ranked metric")}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {geoTableRows.map((marker, index) => {
                        const value = marker[geoMetricKey] || 0;
                        const width = metricMax ? Math.round((value / metricMax) * 100) : 0;
                        const thin = geoIsRateMetric && marker.registers < geoSampleFloor;
                        return (
                          <tr
                            key={marker.iso}
                            className={`geo-row${activeGeo === marker.iso ? " is-active" : ""}`}
                            onMouseEnter={() => handleGeoEnter(marker.iso)}
                            onMouseLeave={() => handleGeoLeave()}
                            onClick={() => handleGeoToggle(marker.iso)}
                          >
                            <td className="geo-col-rank">{index + 1}</td>
                            <td>
                              <span className="geo-name">
                                <span className="dot geo-dot" />
                                {marker.name}
                                {thin ? (
                                  <span
                                    className="map-rank-thin"
                                    title={t("Too few registrations for this rate to be reliable")}
                                  >
                                    {t("low sample")}
                                  </span>
                                ) : null}
                              </span>
                            </td>
                            <td className="geo-num">{marker.uniqueClicks.toLocaleString()}</td>
                            <td className="geo-num">{marker.registers.toLocaleString()}</td>
                            <td className="geo-num">{marker.ftds.toLocaleString()}</td>
                            <td className="geo-num">{marker.reg2depRate.toFixed(1)}%</td>
                            <td className="geo-num">{formatCurrency(marker.epc)}</td>
                            <td className="geo-num geo-strong">{formatCurrency(marker.revenue)}</td>
                            <td className="geo-col-share">
                              <span className="geo-bar">
                                <span style={{ width: `${width}%`, background: MAP_ACCENT }} />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="geo-table-foot">
                  <span>
                    {geoSorted.length > geoTableRows.length
                      ? `${geoTableRows.length} ${t("of")} ${geoSorted.length} ${t("countries")}`
                      : `${geoSorted.length} ${t("countries")}`}
                  </span>
                  <button type="button" className="ghost map-see-more" onClick={() => onSeeGeos?.()}>
                    {t("See more")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Who produced it, beside where it came from. */}
      <section className="panels panels-single">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Buyers")}</h2>
              <p className="panel-subtitle">{t("Who produced it")}</p>
            </div>
          </div>
          {buyerRows.length === 0 ? (
            <div className="empty-state">{t("No buyer data available.")}</div>
          ) : (
            <div className="geo-table-wrap">
              <table className="geo-table">
                <thead>
                  <tr>
                    <th className="geo-col-rank" scope="col">#</th>
                    <th scope="col">{t("Buyer")}</th>
                    <th className="geo-num" scope="col" title={t("Unique clicks")}>{t("Unique")}</th>
                    <th className="geo-num" scope="col" title={t("Registrations")}>{t("Regs")}</th>
                    <th className="geo-num" scope="col">{t("FTD")}</th>
                    <th className="geo-num" scope="col" title={t("Reg2Dep rate")}>{t("Reg→Dep")}</th>
                    <th className="geo-num" scope="col" title={t("Rev / unique")}>{t("Rev/uniq")}</th>
                    <th className="geo-num" scope="col">{t("Revenue")}</th>
                    <th className="geo-col-share" scope="col">
                      <span className="sr-only">{t("Share of revenue")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {buyerRows.map((row, index) => (
                    <tr key={row.buyer} className="geo-row">
                      <td className="geo-col-rank">{index + 1}</td>
                      <td>
                        <span className="geo-name">
                          <span className="dot geo-dot" />
                          {row.buyer}
                        </span>
                      </td>
                      <td className="geo-num">{row.uniques.toLocaleString()}</td>
                      <td className="geo-num">{row.registers.toLocaleString()}</td>
                      <td className="geo-num">{row.ftds.toLocaleString()}</td>
                      <td className="geo-num">{row.reg2dep.toFixed(1)}%</td>
                      <td className="geo-num">{formatCurrency(row.epc)}</td>
                      <td className="geo-num geo-strong">{formatCurrency(row.revenue)}</td>
                      <td className="geo-col-share">
                        <span className="geo-bar">
                          <span
                            style={{
                              width: `${buyerRevenueMax ? Math.round((row.revenue / buyerRevenueMax) * 100) : 0}%`,
                              background: MAP_ACCENT,
                            }}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>

      {/* One panel, not two.
          The funnel printed 20.9% and 9.46%; the handoff panel printed 20.87%
          and 9.46% beside it; the Statistics chart drew the same two rates
          daily above them. Three panels, the same two numbers. The stages and
          the rate between them belong in one place — the drop is the subject,
          and it only means anything next to the counts it happened between. */}
      <section className="panels panels-single">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Conversion")}</h2>
              <p className="panel-subtitle">
                {t("Every stage, and the drop between them")}
              </p>
            </div>
          </div>
          {funnelSteps.length === 0 ? (
            <div className="empty-state">{t("No conversion data available.")}</div>
          ) : (
            <div className="cvr">
              {funnelSteps.map((stage, stageIndex) => {
                // The handoff that produced this stage — its rate, and how
                // that rate moved across the period.
                const handoff = stageIndex === 0 ? null : handoffRates[stageIndex - 1] || null;
                return (
                  <React.Fragment key={stage.name}>
                    {handoff ? (
                      <div className="cvr-step">
                        <div className="cvr-step-rate">
                          <span className="cvr-step-value">
                            {stage.fromPrev === null ? "—" : `${stage.fromPrev.toFixed(2)}%`}
                          </span>
                          <span className="cvr-step-label">{t(handoff.name)}</span>
                        </div>
                        <Sparkline values={handoff.daily} color={handoff.color} width={220} height={30} />
                        <div className="cvr-step-range">
                          <span>
                            {t("low")}{" "}
                            {handoff.trough === null ? "—" : `${handoff.trough.toFixed(1)}%`}
                          </span>
                          <span>
                            {t("peak")}{" "}
                            {handoff.peak === null ? "—" : `${handoff.peak.toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <div className="cvr-stage">
                      <span className="cvr-stage-name">
                        <span className="dot" style={{ background: stage.color }} />
                        {t(stage.name)}
                      </span>
                      <span className="cvr-stage-count">
                        {Number(stage.value || 0).toLocaleString()}
                      </span>
                      <span className="cvr-stage-share">
                        {stageIndex === 0
                          ? periodLabel
                          : stage.ofFirst === null
                            ? "—"
                            : `${stage.ofFirst.toFixed(stage.ofFirst < 10 ? 2 : 1)}% ${t("of")} ${t(funnelSteps[0]?.name || "Clicks")}`}
                      </span>
                      <span className="cvr-stage-bar">
                        <span
                          style={{
                            width: `${Math.max(stage.ofFirst ?? 0, stage.value > 0 ? 1.5 : 0)}%`,
                            background: stage.color,
                          }}
                        />
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </motion.div>
      </section>

    </>
  );
}
