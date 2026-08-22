import React from "react";
import { REGIONS, regionForCountry, resolveCpa } from "../../shared/regions.js";
import { BrandMark, resolveBrandLogo } from "../components/BrandMark.jsx";
import { PeriodSelect } from "../components/PeriodSelect.jsx";
import { CountryDropdownPicker, DeusDatePicker } from "../components/Select.jsx";
import { MiniSparkline } from "../components/Sparkline.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { apiFetch } from "../lib/api.js";
import { apiJson } from "../lib/useResource.js";
import { supportedCountryOptions } from "../lib/constants.js";
import { useCostIntegrity } from "../lib/costIntegrity.js";
import { getPeriodDateRange, isDateInRange, normalizeDateRange } from "../lib/date.js";
import { matchesBuyerFilter, matchesCampaignListFilter, matchesCountryFilter } from "../lib/filters.js";
import { csvCell, formatCurrency, tooltipItemStyle, tooltipLabelStyle, tooltipStyle } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { overlayMotion } from "../lib/motion.js";
import { goToView } from "../lib/navigation.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { compareSortValues, getSortIndicator, toggleSortConfig } from "../lib/sort.js";
import { EMPTY_FLOW_FILTER } from "../lib/view-helpers.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Minus,
  MousePointerClick,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

export default function CampaignsDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  // Raw live-stats rows: one per day × Keitaro campaign × country.
  const [campaignEntries, setCampaignEntries] = React.useState([]);
  const [campaignState, setCampaignState] = React.useState({ loading: true, error: null });
  const [campaignSearch, setCampaignSearch] = React.useState("");
  const [buyerFilterLocal, setBuyerFilterLocal] = React.useState([]);
  const [tableSort, setTableSort] = React.useState({ key: "ftds", dir: "desc" });
  const [expandedCampaign, setExpandedCampaign] = React.useState(null);
  const [spendRows, setSpendRows] = React.useState([]);
  const [prevRows, setPrevRows] = React.useState([]);
  const [campaignStates, setCampaignStates] = React.useState({});
  const [stateBusyId, setStateBusyId] = React.useState(null);
  const [spendEditor, setSpendEditor] = React.useState(null); // { campaign, date, amount, saving, error }
  const [minUniques, setMinUniques] = React.useState("0");
  const [pinnedCampaigns, setPinnedCampaigns] = React.useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("dash-pinned-campaigns") || "[]"));
    } catch {
      return new Set();
    }
  });
  const sum = (value) => Number(value || 0);
  const isoRe = /^\d{4}-\d{2}-\d{2}$/;

  const effectiveRangeIso = React.useMemo(() => {
    const gr = normalizeDateRange(filters?.dateFrom, filters?.dateTo);
    const pr = getPeriodDateRange(period, customRange);
    const eff = gr.from || gr.to ? gr : pr;
    return {
      from: isoRe.test(eff.from || "") ? eff.from : null,
      to: isoRe.test(eff.to || "") ? eff.to : null,
    };
  }, [period, customRange.from, customRange.to, filters?.dateFrom, filters?.dateTo]);

  // The equally-long window immediately before the current one (for deltas).
  const previousRangeIso = React.useMemo(() => {
    const { from, to } = effectiveRangeIso;
    if (!from || !to) return null;
    const dayMs = 86400000;
    const fromMs = Date.parse(`${from}T00:00:00Z`);
    const toMs = Date.parse(`${to}T00:00:00Z`);
    const lengthDays = Math.max(1, Math.round((toMs - fromMs) / dayMs) + 1);
    const prevTo = new Date(fromMs - dayMs).toISOString().slice(0, 10);
    const prevFrom = new Date(fromMs - dayMs * lengthDays).toISOString().slice(0, 10);
    return { from: prevFrom, to: prevTo };
  }, [effectiveRangeIso.from, effectiveRangeIso.to]);

  const fetchSpend = React.useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (effectiveRangeIso.from) qs.set("from", effectiveRangeIso.from);
      if (effectiveRangeIso.to) qs.set("to", effectiveRangeIso.to);
      const response = await apiFetch(`/api/campaign-spend?${qs.toString()}`);
      if (!response.ok) return;
      const data = await response.json();
      setSpendRows(Array.isArray(data) ? data : []);
    } catch {
      /* spend stays empty */
    }
  }, [effectiveRangeIso.from, effectiveRangeIso.to]);

  const fetchCampaigns = React.useCallback(async () => {
    try {
      setCampaignState({ loading: true, error: null });
      const qs = new URLSearchParams();
      if (effectiveRangeIso.from) qs.set("from", effectiveRangeIso.from);
      if (effectiveRangeIso.to) qs.set("to", effectiveRangeIso.to);
      const requests = [apiFetch(`/api/keitaro/live-stats${qs.toString() ? `?${qs}` : ""}`)];
      if (previousRangeIso) {
        requests.push(
          apiFetch(`/api/keitaro/live-stats?from=${previousRangeIso.from}&to=${previousRangeIso.to}`)
        );
      }
      requests.push(apiFetch("/api/keitaro/campaign-states"));
      const [response, ...rest] = await Promise.all(requests);
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load campaign stats from Keitaro.");
      }
      const data = await response.json();
      setCampaignEntries(Array.isArray(data?.rows) ? data.rows : []);
      const prevResponse = previousRangeIso ? rest[0] : null;
      const statesResponse = previousRangeIso ? rest[1] : rest[0];
      if (prevResponse?.ok) {
        const prevData = await prevResponse.json();
        setPrevRows(Array.isArray(prevData?.rows) ? prevData.rows : []);
      } else {
        setPrevRows([]);
      }
      if (statesResponse?.ok) {
        const statesData = await statesResponse.json();
        setCampaignStates(statesData?.states || {});
      }
      setCampaignState({ loading: false, error: null });
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to load campaign stats." });
    }
  }, [effectiveRangeIso.from, effectiveRangeIso.to, previousRangeIso]);

  React.useEffect(() => {
    fetchSpend();
  }, [fetchSpend]);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  React.useEffect(() => {
    const handleSync = () => fetchCampaigns();
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchCampaigns]);

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";
  const globalFlowFilter = Array.isArray(filters?.statsCampaign) ? filters.statsCampaign : EMPTY_FLOW_FILTER;

  // Global scoping: date window, buyer visibility, country + flow filters.
  const scopedRows = React.useMemo(
    () =>
      campaignEntries.filter((row) => {
        if (!isDateInRange(row.date, effectiveDateRange)) return false;
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) return false;
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        if (!matchesCampaignListFilter(row.campaign || row.campaign_name, globalFlowFilter)) return false;
        return true;
      }),
    [
      campaignEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      globalFlowFilter,
      effectiveBuyer,
      isLeadership,
    ]
  );

  // Manual spend per campaign over the selected window.
  const spendByCampaign = React.useMemo(() => {
    const map = new Map();
    spendRows.forEach((row) => {
      const key = String(row.campaign || "").trim();
      if (!key) return;
      map.set(key, (map.get(key) || 0) + (Number(row.amount) || 0));
    });
    return map;
  }, [spendRows]);

  // ── One row per Keitaro campaign, with per-country + per-day sub-maps ──
  const campaignAgg = React.useMemo(() => {
    const map = new Map();
    scopedRows.forEach((row) => {
      const name = String(row.campaign || row.campaign_name || "").trim() || "Unknown campaign";
      if (!map.has(name)) {
        map.set(name, {
          campaign: name,
          campaignId: row.campaign_id ?? null,
          buyer: row.buyer || null,
          tool: row.tool || null,
          game: row.game || null,
          geo: row.geo || null,
          brand: row.brand || null,
          uniqueClicks: 0,
          clicks: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
          ftdRevenue: 0,
          redepositRevenue: 0,
          spend: 0,
          countries: new Map(),
          dailyFtds: new Map(),
        });
      }
      const agg = map.get(name);
      if (agg.campaignId == null && row.campaign_id != null) agg.campaignId = row.campaign_id;
      const day = String(row.date || "").trim();
      if (day) agg.dailyFtds.set(day, (agg.dailyFtds.get(day) || 0) + sum(row.ftds));
      agg.uniqueClicks += sum(row.unique_clicks);
      agg.clicks += sum(row.clicks);
      agg.registers += sum(row.registers);
      agg.ftds += sum(row.ftds);
      agg.redeposits += sum(row.redeposits);
      agg.revenue += sum(row.revenue);
      agg.ftdRevenue += sum(row.ftd_revenue);
      agg.redepositRevenue += sum(row.redeposit_revenue);
      agg.spend += sum(row.spend);
      const country = String(row.country || "").trim();
      if (country) {
        if (!agg.countries.has(country)) {
          agg.countries.set(country, { country, clicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0 });
        }
        const c = agg.countries.get(country);
        c.clicks += sum(row.clicks);
        c.registers += sum(row.registers);
        c.ftds += sum(row.ftds);
        c.redeposits += sum(row.redeposits);
        c.revenue += sum(row.revenue);
      }
    });
    return Array.from(map.values()).map((row) => {
      const spark = Array.from(row.dailyFtds.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => value);
      const half = Math.floor(spark.length / 2);
      const ftdDelta =
        spark.length >= 2
          ? spark.slice(half).reduce((s, v) => s + v, 0) - spark.slice(0, half).reduce((s, v) => s + v, 0)
          : 0;
      // Auto cost (Meta integrations → Keitaro) is authoritative; manual
      // entries only fill the gap for campaigns without a wired account.
      const manualSpend = spendByCampaign.get(row.campaign) || 0;
      const totalSpend = row.spend > 0 ? row.spend : manualSpend;
      const spendSource = row.spend > 0 ? "auto" : manualSpend > 0 ? "manual" : null;
      return {
        ...row,
        click2reg: row.uniqueClicks > 0 ? (row.registers / row.uniqueClicks) * 100 : 0,
        click2dep: row.uniqueClicks > 0 ? (row.ftds / row.uniqueClicks) * 100 : 0,
        r2d: row.registers > 0 ? (row.ftds / row.registers) * 100 : 0,
        ftd2red: row.ftds > 0 ? (row.redeposits / row.ftds) * 100 : 0,
        totalSpend,
        spendSource,
        cpa: row.ftds > 0 && totalSpend > 0 ? totalSpend / row.ftds : 0,
        roi: totalSpend > 0 ? ((row.revenue - totalSpend) / totalSpend) * 100 : null,
        profit: row.revenue - totalSpend,
        spark,
        ftdDelta,
        countryRows: Array.from(row.countries.values()).sort((a, b) => b.ftds - a.ftds || b.clicks - a.clicks),
      };
    });
  }, [scopedRows, spendByCampaign]);

  const buyerOptionsLocal = React.useMemo(
    () =>
      Array.from(new Set(campaignAgg.map((row) => String(row.buyer || "").trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [campaignAgg]
  );

  const visibleCampaigns = React.useMemo(() => {
    const q = campaignSearch.trim().toLowerCase();
    const minUc = Number(minUniques) || 0;
    let rows = campaignAgg;
    if (minUc > 0) rows = rows.filter((row) => row.uniqueClicks >= minUc);
    if (buyerFilterLocal.length) {
      rows = rows.filter((row) => buyerFilterLocal.includes(String(row.buyer || "").trim()));
    }
    if (q) {
      rows = rows.filter((row) =>
        `${row.campaign} ${row.buyer || ""} ${row.tool || ""} ${row.game || ""} ${row.geo || ""} ${row.brand || ""}`
          .toLowerCase()
          .includes(q)
      );
    }
    const { key, dir } = tableSort;
    const type = key === "campaign" ? "text" : "number";
    return [...rows].sort((a, b) => {
      // Pinned campaigns float above everything, keeping their own order.
      const aPin = pinnedCampaigns.has(a.campaign) ? 1 : 0;
      const bPin = pinnedCampaigns.has(b.campaign) ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      return compareSortValues(a[key], b[key], dir, type);
    });
  }, [campaignAgg, campaignSearch, buyerFilterLocal, tableSort, minUniques, pinnedCampaigns]);

  const togglePin = (campaign) => {
    setPinnedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(campaign)) next.delete(campaign);
      else next.add(campaign);
      try {
        localStorage.setItem("dash-pinned-campaigns", JSON.stringify(Array.from(next)));
      } catch { /* quota */ }
      return next;
    });
  };

  const totals = React.useMemo(
    () =>
      visibleCampaigns.reduce(
        (acc, row) => {
          acc.uniqueClicks += row.uniqueClicks;
          acc.clicks += row.clicks;
          acc.registers += row.registers;
          acc.ftds += row.ftds;
          acc.redeposits += row.redeposits;
          acc.revenue += row.revenue;
          acc.spend += row.totalSpend;
          return acc;
        },
        { uniqueClicks: 0, clicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0, spend: 0 }
      ),
    [visibleCampaigns]
  );

  // Previous-window totals under the same buyer/country scope (for deltas).
  const prevTotals = React.useMemo(() => {
    if (!prevRows.length) return null;
    return prevRows
      .filter((row) => {
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) return false;
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        if (!matchesCampaignListFilter(row.campaign || row.campaign_name, globalFlowFilter)) return false;
        return true;
      })
      .reduce(
        (acc, row) => {
          acc.uniqueClicks += sum(row.unique_clicks);
          acc.registers += sum(row.registers);
          acc.ftds += sum(row.ftds);
          acc.redeposits += sum(row.redeposits);
          acc.revenue += sum(row.revenue);
          return acc;
        },
        { uniqueClicks: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0 }
      );
  }, [prevRows, globalBuyerFilter, globalCountryFilter, globalFlowFilter, effectiveBuyer, isLeadership]);

  const deltaFor = (key) => {
    if (!prevTotals) return null;
    const prev = Number(prevTotals[key]) || 0;
    const current = Number(totals[key]) || 0;
    if (prev === 0) return current > 0 ? Infinity : null;
    return ((current - prev) / prev) * 100;
  };

  // Daily trend across the visible scope (clicks axis vs conversions axis).
  const growthSeries = React.useMemo(() => {
    const q = campaignSearch.trim().toLowerCase();
    const map = new Map();
    scopedRows.forEach((row) => {
      if (buyerFilterLocal.length && !buyerFilterLocal.includes(String(row.buyer || "").trim())) return;
      if (q) {
        const hay = `${row.campaign || ""} ${row.buyer || ""} ${row.tool || ""} ${row.game || ""} ${row.geo || ""} ${row.brand || ""}`.toLowerCase();
        if (!hay.includes(q)) return;
      }
      const date = String(row.date || "").trim();
      if (!date) return;
      if (!map.has(date)) map.set(date, { date, clicks: 0, uniqueClicks: 0, registers: 0, ftds: 0, redeposits: 0 });
      const current = map.get(date);
      current.clicks += sum(row.clicks);
      current.uniqueClicks += sum(row.unique_clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [scopedRows, campaignSearch, buyerFilterLocal]);

  // Fixed series colors (validated for the dark surface, CVD-safe order) —
  // the same entity keeps the same hue in every chart on this page.
  const SERIES_COLORS = { clicks: "#3987e5", registers: "#9085e9", ftds: "#199e70", redeposits: "#c98500" };
  const shortCampaignLabel = (row) => {
    const bits = [row.buyer, row.game || row.tool, row.geo].filter(Boolean);
    return bits.length >= 2 ? bits.join(" · ") : String(row.campaign).slice(0, 28);
  };
  // Top-10 slices for the comparison charts (they follow search + filters).
  const topByFtd = React.useMemo(
    () =>
      [...visibleCampaigns]
        .sort((a, b) => b.ftds - a.ftds)
        .slice(0, 10)
        .filter((row) => row.ftds > 0)
        .map((row) => ({ name: shortCampaignLabel(row), ftds: row.ftds, redeposits: row.redeposits })),
    [visibleCampaigns]
  );
  const topByRevenue = React.useMemo(
    () =>
      [...visibleCampaigns]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .filter((row) => row.revenue > 0)
        .map((row) => ({
          name: shortCampaignLabel(row),
          ftdRevenue: Math.round(row.ftdRevenue * 100) / 100,
          redepositRevenue: Math.round(row.redepositRevenue * 100) / 100,
        })),
    [visibleCampaigns]
  );

  const median = (values) => {
    const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  // Per-tool cohort medians — a PWA campaign is judged against PWA numbers,
  // not against Telegram or Facebook ones.
  const toolMedians = React.useMemo(() => {
    const byTool = new Map();
    visibleCampaigns
      .filter((row) => row.uniqueClicks >= 50)
      .forEach((row) => {
        const tool = String(row.tool || "—").trim() || "—";
        if (!byTool.has(tool)) byTool.set(tool, { c2r: [], r2d: [] });
        byTool.get(tool).c2r.push(row.click2reg);
        byTool.get(tool).r2d.push(row.r2d);
      });
    const result = new Map();
    byTool.forEach((lists, tool) => {
      result.set(tool, { c2r: median(lists.c2r), r2d: median(lists.r2d) });
    });
    return result;
  }, [visibleCampaigns]);

  // Efficiency map: only campaigns with enough traffic to judge (≥50 uniques).
  const scatterData = React.useMemo(
    () =>
      visibleCampaigns
        .filter((row) => row.uniqueClicks >= 50)
        .map((row) => {
          const tool = String(row.tool || "—").trim() || "—";
          const cohort = toolMedians.get(tool);
          return {
            name: shortCampaignLabel(row),
            tool,
            x: Math.round(row.click2reg * 10) / 10,
            y: Math.round(row.r2d * 10) / 10,
            z: row.uniqueClicks,
            ftds: row.ftds,
            cohortC2r: cohort ? Math.round(cohort.c2r * 10) / 10 : null,
            cohortR2d: cohort ? Math.round(cohort.r2d * 10) / 10 : null,
          };
        }),
    [visibleCampaigns, toolMedians]
  );
  const scatterMedians = React.useMemo(
    () => ({ x: median(scatterData.map((d) => d.x)), y: median(scatterData.map((d) => d.y)) }),
    [scatterData]
  );

  // Rule-based reading of the table — the "what should I do" strip.
  //
  // Signals that divide by spend are withheld when no spend reached the tracker.
  // This strip does not describe data, it tells someone to cut or scale a
  // campaign; issuing "losing money" off a spend column that is empty because
  // the Meta pipeline is down could kill a profitable campaign, and the
  // converse could scale a bleeding one. Silence is the honest output, with one
  // signal explaining why the rest are missing.
  const campaignCostIntegrity = useCostIntegrity();
  const spendTrusted = campaignCostIntegrity ? campaignCostIntegrity.trustworthy !== false : true;

  const actionSignals = React.useMemo(() => {
    const rows = visibleCampaigns;
    if (!rows.length) return [];
    const judged = rows.filter((row) => row.uniqueClicks >= 50);
    const medR2d = median(judged.map((row) => row.r2d));
    const signals = [];
    if (!spendTrusted) {
      signals.push({
        tone: "warn",
        Icon: AlertTriangle,
        title: t("Spend missing"),
        campaign: t("Cost is not reaching the tracker"),
        detail: t("Profit and ROI advice is withheld until spend data returns — see Health."),
      });
    }
    const winner = [...rows].sort((a, b) => b.ftds - a.ftds)[0];
    if (winner && winner.ftds > 0) {
      signals.push({
        tone: "good",
        Icon: TrendingUp,
        title: "Scale",
        campaign: shortCampaignLabel(winner),
        detail: `${winner.ftds.toLocaleString()} FTD · R2D ${winner.r2d.toFixed(1)}% · ${formatCurrency(winner.revenue)}`,
      });
    }
    const loser = spendTrusted
      ? rows.filter((row) => row.totalSpend >= 50 && row.profit < 0).sort((a, b) => a.profit - b.profit)[0]
      : null;
    if (loser) {
      signals.push({
        tone: "bad",
        Icon: DollarSign,
        title: "Losing money",
        campaign: shortCampaignLabel(loser),
        detail: `${formatCurrency(loser.profit)} ${t("profit on")} ${formatCurrency(loser.totalSpend)} ${t("spend — cut or fix")}`,
      });
    }
    const retention = rows
      .filter((row) => row.ftds >= 10 && row.ftd2red >= 100)
      .sort((a, b) => b.ftd2red - a.ftd2red)[0];
    if (retention) {
      signals.push({
        tone: "good",
        Icon: Trophy,
        title: "Retention star",
        campaign: shortCampaignLabel(retention),
        detail: `${retention.redeposits.toLocaleString()} ${t("redeposits on")} ${retention.ftds.toLocaleString()} FTD (${retention.ftd2red.toFixed(0)}%)`,
      });
    }
    const leak = rows
      .filter((row) => {
        if (row.registers < 100) return false;
        const cohort = toolMedians.get(String(row.tool || "—").trim() || "—");
        const benchmark = cohort?.r2d || medR2d;
        return row.r2d < Math.max(5, benchmark / 2);
      })
      .sort((a, b) => b.registers - a.registers)[0];
    if (leak) {
      signals.push({
        tone: "warn",
        Icon: AlertTriangle,
        title: "Funnel leak",
        campaign: shortCampaignLabel(leak),
        detail: `${leak.registers.toLocaleString()} ${t("regs but R2D only")} ${leak.r2d.toFixed(1)}% (${leak.tool || "—"} ${t("median")} ${(toolMedians.get(String(leak.tool || "—").trim() || "—")?.r2d || medR2d).toFixed(1)}%) — ${t("check offer & brand")}`,
      });
    }
    const dead = rows.filter((row) => row.uniqueClicks >= 300 && row.ftds === 0);
    if (dead.length) {
      signals.push({
        tone: "bad",
        Icon: AlertTriangle,
        title: "Dead traffic",
        campaign: dead.length === 1 ? shortCampaignLabel(dead[0]) : `${dead.length} ${t("campaigns")}`,
        detail: `${dead.reduce((s, row) => s + row.uniqueClicks, 0).toLocaleString()} ${t("unique clicks, 0 FTD — pause or rework")}`,
      });
    }
    return signals.slice(0, 5);
  }, [visibleCampaigns, toolMedians, spendTrusted, t]);

  const [actionError, setActionError] = React.useState(null);
  // Market ROI (Boss + Team Leader only): FTDs valued at per-country CPA rates.
  const [campaignTab, setCampaignTab] = React.useState("performance");
  const [cpaRates, setCpaRates] = React.useState([]); // [{country, cpa}]
  const [cpaDraft, setCpaDraft] = React.useState({});
  const [regionRates, setRegionRates] = React.useState([]);
  const [regionDraft, setRegionDraft] = React.useState({});
  const [cpaState, setCpaState] = React.useState({ loading: false, saving: false, error: null, loaded: false });

  const fetchCpaRates = React.useCallback(async () => {
    if (!isLeadership) return;
    try {
      setCpaState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await apiFetch("/api/market-cpa");
      if (!response.ok) throw new Error("Failed to load CPA rates.");
      const data = await response.json();
      // The endpoint used to return a bare array; accept both so a stale
      // deploy on either side does not blank the editor.
      const rows = Array.isArray(data) ? data : Array.isArray(data?.rates) ? data.rates : [];
      const regions = Array.isArray(data?.regions) ? data.regions : [];
      setCpaRates(rows);
      setCpaDraft(Object.fromEntries(rows.map((row) => [row.country, String(row.cpa)])));
      setRegionRates(regions);
      setRegionDraft(Object.fromEntries(regions.map((row) => [row.region, String(row.cpa)])));
      setCpaState({ loading: false, saving: false, error: null, loaded: true });
    } catch (error) {
      setCpaState({ loading: false, saving: false, error: error.message, loaded: true });
    }
  }, [isLeadership]);

  React.useEffect(() => {
    if ((campaignTab === "marketroi" || campaignTab === "rates") && !cpaState.loaded) fetchCpaRates();
  }, [campaignTab, cpaState.loaded, fetchCpaRates]);

  const saveCpaRates = async () => {
    try {
      setCpaState((prev) => ({ ...prev, saving: true, error: null }));
      const rates = Object.entries(cpaDraft).map(([country, cpa]) => ({ country, cpa: Number(cpa) || 0 }));
      const regions = Object.entries(regionDraft).map(([region, cpa]) => ({ region, cpa: Number(cpa) || 0 }));
      const response = await apiFetch("/api/market-cpa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates, regions }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to save CPA rates.");
      }
      const data = await response.json();
      setCpaRates(Array.isArray(data) ? data : []);
      setCpaState((prev) => ({ ...prev, saving: false }));
    } catch (error) {
      setCpaState((prev) => ({ ...prev, saving: false, error: error.message }));
    }
  };

  const explicitRateMap = React.useMemo(
    () => new Map(cpaRates.map((row) => [row.country, Number(row.cpa) || 0])),
    [cpaRates]
  );
  const regionRateMap = React.useMemo(
    () => new Map(regionRates.map((row) => [row.region, Number(row.cpa) || 0])),
    [regionRates]
  );
  // The rate Market ROI actually uses: the country's own price, or its
  // region's when it has none. Every consumer reads through this, so a
  // regional default takes effect everywhere at once.
  const cpaRateMap = React.useMemo(() => {
    const map = new Map(explicitRateMap);
    const countries = new Set([
      ...explicitRateMap.keys(),
      ...visibleCampaigns.flatMap((row) => row.countryRows.map((c) => c.country)),
    ]);
    countries.forEach((country) => {
      if (!country) return;
      const { cpa } = resolveCpa(country, explicitRateMap, regionRateMap);
      if (cpa > 0) map.set(country, cpa);
    });
    return map;
  }, [explicitRateMap, regionRateMap, visibleCampaigns]);

  // Every country seen in the current data — the rate card grows with reality.
  const marketCountries = React.useMemo(() => {
    const set = new Set(cpaRates.map((row) => row.country));
    visibleCampaigns.forEach((row) => row.countryRows.forEach((c) => set.add(c.country)));
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [visibleCampaigns, cpaRates]);

  // ── Rates tab ────────────────────────────────────────────────────────
  // Rates are reference data, not a report, so the editable set must not be
  // scoped by the current date filter. Doing that is why seven countries that
  // earn FTDs never got a price: they simply were not offered while the filter
  // sat on a period they had no traffic in. Every country is reachable here.
  const [rateSearch, setRateSearch] = React.useState("");

  // FTDs per country in the selected period — what a missing rate actually costs.
  const ftdsByCountry = React.useMemo(() => {
    const map = new Map();
    visibleCampaigns.forEach((row) =>
      row.countryRows.forEach((c) => {
        if (!c.country) return;
        map.set(c.country, (map.get(c.country) || 0) + (Number(c.ftds) || 0));
      })
    );
    return map;
  }, [visibleCampaigns]);

  const rateMeta = React.useMemo(
    () => new Map(cpaRates.map((row) => [row.country, row])),
    [cpaRates]
  );

  // Earning-but-unpriced first, because those are the ones distorting the
  // number; then priced; then everywhere else, reachable by search.
  const rateRows = React.useMemo(() => {
    const priced = new Set(cpaRates.map((r) => r.country));
    const known = new Set([...priced, ...ftdsByCountry.keys()]);
    const rows = supportedCountryOptions.map((country) => ({
      country,
      ftds: ftdsByCountry.get(country) || 0,
      rate: rateMeta.get(country) || null,
      known: known.has(country),
    }));
    const q = rateSearch.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) => r.country.toLowerCase().includes(q))
      : rows.filter((r) => r.known);
    return filtered.sort((a, b) => {
      const rank = (r) => (r.ftds > 0 && !r.rate ? 0 : r.ftds > 0 ? 1 : r.rate ? 2 : 3);
      const d = rank(a) - rank(b);
      return d !== 0 ? d : b.ftds - a.ftds || a.country.localeCompare(b.country);
    });
  }, [cpaRates, ftdsByCountry, rateMeta, rateSearch]);

  const rateCoverage = React.useMemo(() => {
    let unpricedCountries = 0;
    let unpricedFtds = 0;
    let pricedFtds = 0;
    ftdsByCountry.forEach((ftds, country) => {
      if (!ftds) return;
      // Inherited counts as priced — the deposit is being valued, just not by
      // a number somebody typed for that country specifically.
      if ((cpaRateMap.get(country) || 0) > 0) pricedFtds += ftds;
      else {
        unpricedCountries += 1;
        unpricedFtds += ftds;
      }
    });
    const stale = cpaRates.filter((r) => !(ftdsByCountry.get(r.country) > 0)).map((r) => r.country);
    return { unpricedCountries, unpricedFtds, pricedFtds, stale };
  }, [ftdsByCountry, cpaRateMap, cpaRates]);

  // FTDs × market CPA per country — what the traffic is worth at market price.
  const marketRows = React.useMemo(
    () =>
      visibleCampaigns
        .map((row) => {
          let marketRevenue = 0;
          let ratedFtds = 0;
          row.countryRows.forEach((c) => {
            const rate = cpaRateMap.get(c.country) || 0;
            if (rate > 0) {
              marketRevenue += c.ftds * rate;
              ratedFtds += c.ftds;
            }
          });
          const marketProfit = marketRevenue - row.totalSpend;
          return {
            ...row,
            marketRevenue,
            ratedFtds,
            unratedFtds: row.ftds - ratedFtds,
            marketProfit,
            marketRoi: row.totalSpend > 0 ? (marketProfit / row.totalSpend) * 100 : null,
          };
        })
        .filter((row) => row.ftds > 0 || row.totalSpend > 0)
        .sort((a, b) => b.marketProfit - a.marketProfit),
    [visibleCampaigns, cpaRateMap]
  );

  const marketTotals = React.useMemo(
    () =>
      marketRows.reduce(
        (acc, row) => {
          acc.revenue += row.marketRevenue;
          acc.spend += row.totalSpend;
          acc.ftds += row.ftds;
          acc.unrated += row.unratedFtds;
          return acc;
        },
        { revenue: 0, spend: 0, ftds: 0, unrated: 0 }
      ),
    [marketRows]
  );

  const toggleCampaignState = async (row) => {
    if (row.campaignId == null) return;
    const current = campaignStates[String(row.campaignId)] || "active";
    const nextState = current === "disabled" ? "active" : "disabled";
    setStateBusyId(row.campaignId);
    setActionError(null);
    try {
      await apiJson(`/api/keitaro/campaigns/${row.campaignId}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: nextState }),
      }, "Failed to update campaign state.");
      setCampaignStates((prev) => ({ ...prev, [String(row.campaignId)]: nextState }));
    } catch (error) {
      setActionError(error.message || "Failed to update campaign state.");
    } finally {
      setStateBusyId(null);
    }
  };

  const saveSpend = async () => {
    if (!spendEditor) return;
    const amount = Number(spendEditor.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      setSpendEditor((prev) => ({ ...prev, error: t("Enter a valid amount.") }));
      return;
    }
    setSpendEditor((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const data = await apiJson("/api/campaign-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: spendEditor.campaign, date: spendEditor.date, amount }),
      }, "Failed to save spend.");
      setSpendEditor(null);
      fetchSpend();
    } catch (error) {
      setSpendEditor((prev) => ({ ...prev, saving: false, error: error.message || "Failed to save spend." }));
    }
  };

  const exportCsv = () => {
    const header = [
      "Campaign", "UC", "Click2Reg %", "Registrations", "Click2Dep %", "R2D %",
      "FTD", "FTD2RED %", "Redeposit", "Revenue", "Redeposit revenue", "FTD revenue",
      "Spend", "CPA", "ROI %",
    ].join(",");
    const lines = visibleCampaigns.map((row) =>
      [
        csvCell(row.campaign),
        row.uniqueClicks,
        row.click2reg.toFixed(1),
        row.registers,
        row.click2dep.toFixed(1),
        row.r2d.toFixed(1),
        row.ftds,
        row.ftd2red.toFixed(1),
        row.redeposits,
        row.revenue.toFixed(2),
        row.redepositRevenue.toFixed(2),
        row.ftdRevenue.toFixed(2),
        row.totalSpend.toFixed(2),
        row.cpa > 0 ? row.cpa.toFixed(2) : "",
        row.roi === null ? "" : row.roi.toFixed(1),
      ].join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `keitaro-campaigns-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key) => setTableSort((prev) => toggleSortConfig(prev, key, "desc"));
  const fmtInt = (value) => Number(value || 0).toLocaleString();
  const fmtPct = (value) => `${(Number(value) || 0).toFixed(1)}%`;

  const profitTotal = totals.revenue - totals.spend;
  const topCampaign = [...visibleCampaigns].sort((a, b) => b.ftds - a.ftds)[0] || null;
  const topCr = visibleCampaigns
    .filter((row) => row.uniqueClicks >= 50 && row.registers >= 20)
    .sort((a, b) => b.r2d - a.r2d)[0] || null;
  const kpiCards = [
    { label: "Unique Clicks", value: fmtInt(totals.uniqueClicks), meta: "Deduplicated by campaign", icon: MousePointerClick, delta: deltaFor("uniqueClicks") },
    { label: "Registrations", value: fmtInt(totals.registers), meta: "Sign-ups", icon: UserPlus, delta: deltaFor("registers") },
    { label: "FTD", value: fmtInt(totals.ftds), meta: "First-time deposits", icon: CreditCard, delta: deltaFor("ftds") },
    { label: "Redeposit", value: fmtInt(totals.redeposits), meta: "Repeat deposits", icon: TrendingUp, delta: deltaFor("redeposits") },
    { label: "Spend", value: formatCurrency(totals.spend), meta: "Auto from Meta via Keitaro · manual fallback", icon: CreditCard, neutralDelta: true, untrusted: !spendTrusted },
    {
      label: "Profit",
      value: formatCurrency(profitTotal),
      meta: totals.spend > 0 ? `ROI ${(((totals.revenue - totals.spend) / totals.spend) * 100).toFixed(0)}%` : "Revenue − Spend",
      icon: DollarSign,
      // Profit is revenue minus a spend figure that is missing accounts, so the
      // headline ROI overstates by however much cost never arrived.
      accent: spendTrusted && profitTotal >= 0,
      negative: spendTrusted && profitTotal < 0,
      delta: deltaFor("revenue"),
      untrusted: !spendTrusted,
    },
    {
      label: "Top Campaign",
      value: topCampaign && topCampaign.ftds > 0 ? shortCampaignLabel(topCampaign) : "—",
      meta: topCampaign && topCampaign.ftds > 0
        ? `${fmtInt(topCampaign.ftds)} FTD · ${formatCurrency(topCampaign.revenue)}`
        : "No FTDs in this period yet.",
      icon: Trophy,
      small: true,
    },
    {
      label: "Top CR",
      value: topCr ? `${topCr.r2d.toFixed(1)}%` : "—",
      meta: topCr ? `Reg2Dep · ${shortCampaignLabel(topCr)}` : "Needs ≥50 uniques and ≥20 regs",
      icon: Target,
      small: true,
    },
  ];
  const renderDelta = (delta) => {
    if (delta === null || delta === undefined) return null;
    if (delta === Infinity) return <span className="kpi-delta is-up">▲ {t("new")}</span>;
    const rounded = Math.round(delta * 10) / 10;
    if (!Number.isFinite(rounded) || Math.abs(rounded) < 0.05) return <span className="kpi-delta">— 0%</span>;
    return (
      <span className={`kpi-delta${rounded > 0 ? " is-up" : " is-down"}`}>
        {rounded > 0 ? "▲" : "▼"} {Math.abs(rounded).toFixed(1)}% {t("vs prev")}
      </span>
    );
  };

  // Column format mirrors the team's Keitaro report layout.
  const CAMPAIGN_COLUMNS = [
    { key: "campaign", label: "Campaign" },
    { key: "uniqueClicks", label: "UC" },
    { key: "click2reg", label: "Click2Reg" },
    { key: "registers", label: "Registrations" },
    { key: "click2dep", label: "Click2Dep" },
    { key: "r2d", label: "R2D" },
    { key: "ftds", label: "FTD" },
    { key: "ftd2red", label: "FTD2RED" },
    { key: "redeposits", label: "Redeposit" },
    { key: "revenue", label: "Revenue" },
    { key: "redepositRevenue", label: "Redeposit (revenue)" },
    { key: "ftdRevenue", label: "FTD (revenue)" },
    { key: "totalSpend", label: "Spend" },
    { key: "cpa", label: "CPA" },
    { key: "roi", label: "ROI" },
    { key: "ftdDelta", label: "Trend" },
  ];

  return (
    <>
      {isLeadership ? (
        <section className="panels panels-single offers-tabs-panel">
          <motion.div className="panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-head">
              <div>
                <h2 className="panel-title">{t("Campaigns")}</h2>
                <p className="panel-subtitle">
                  {t("Performance is what Keitaro pays; Market ROI values every FTD at your per-country market CPA.")}
                </p>
              </div>
              <div className="offers-tabs">
                <button
                  type="button"
                  className={`offers-tab${campaignTab === "performance" ? " is-active" : ""}`}
                  onClick={() => setCampaignTab("performance")}
                >
                  <BarChart3 size={14} />
                  <span>{t("Performance")}</span>
                </button>
                <button
                  type="button"
                  className={`offers-tab${campaignTab === "marketroi" ? " is-active" : ""}`}
                  onClick={() => setCampaignTab("marketroi")}
                >
                  <DollarSign size={14} />
                  <span>{t("Market ROI")}</span>
                </button>
                <button
                  type="button"
                  className={`offers-tab${campaignTab === "rates" ? " is-active" : ""}`}
                  onClick={() => setCampaignTab("rates")}
                >
                  <Wallet size={14} />
                  <span>{t("Rates")}</span>
                  {rateCoverage.unpricedCountries ? (
                    <span className="offers-tab-badge">{rateCoverage.unpricedCountries}</span>
                  ) : null}
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      ) : null}

      {campaignTab === "rates" && isLeadership ? (
        <section className="panels panels-single">
          <motion.div className="panel form-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="panel-head">
              <div>
                <h2 className="panel-title">{t("Market CPA rates")}</h2>
                <p className="panel-subtitle">
                  {t("What one FTD is worth on the market, per country, in USD. Market ROI values every deposit at these prices.")}
                </p>
              </div>
              <button className="action-pill" type="button" onClick={saveCpaRates} disabled={cpaState.saving}>
                {cpaState.saving ? t("Saving…") : t("Save rates")}
              </button>
            </div>

            {cpaState.error ? <p className="logs-error">{cpaState.error}</p> : null}

            {/* An unpriced country is not neutral — its deposits are counted as
                worth nothing, so Market ROI reads lower than the truth. Say by
                how much rather than leaving it to be discovered. */}
            {rateCoverage.unpricedCountries ? (
              <div className="rate-coverage is-warn">
                <AlertTriangle size={14} />
                <span>
                  <strong>{rateCoverage.unpricedCountries} {rateCoverage.unpricedCountries === 1 ? t("country earning FTDs has no rate") : t("countries earning FTDs have no rate")}</strong>
                  {" — "}
                  {rateCoverage.unpricedFtds} {t("deposits are being valued at $0, so Market ROI is understated.")}
                </span>
              </div>
            ) : (
              <div className="rate-coverage is-ok">
                <CheckCircle size={14} />
                <span>{t("Every country earning FTDs in this period has a rate.")}</span>
              </div>
            )}

            {rateCoverage.stale.length ? (
              <div className="rate-coverage">
                <Clock size={14} />
                <span>
                  {t("Priced but no FTDs in this period")}: <strong>{rateCoverage.stale.join(", ")}</strong>
                </span>
              </div>
            ) : null}

            {/* Price a region once and every country in it inherits, including
                ones that start producing deposits next week. An explicit
                country rate below always wins. */}
            <div className="rate-regions">
              <div className="rate-regions-head">
                <span className="rate-regions-title">{t("Regional defaults")}</span>
                <span className="rate-regions-note">{t("Used when a country has no rate of its own")}</span>
              </div>
              <div className="rate-regions-grid">
                {REGIONS.map((region) => {
                  const covered = [...ftdsByCountry.entries()].filter(
                    ([country, ftds]) => ftds > 0 && regionForCountry(country) === region && !(explicitRateMap.get(country) > 0)
                  );
                  const wouldCover = covered.reduce((sum, [, ftds]) => sum + ftds, 0);
                  return (
                    <label key={region} className={`rate-region${wouldCover ? " is-useful" : ""}`}>
                      <span className="rate-region-name">
                        {region}
                        {wouldCover ? (
                          <em className="rate-region-hint">
                            {t("would price")} {covered.length} · {wouldCover} FTD
                          </em>
                        ) : null}
                      </span>
                      <span className="cpa-item-input">
                        <span className="cpa-currency">$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={regionDraft[region] ?? ""}
                          placeholder="0"
                          onChange={(e) => setRegionDraft((prev) => ({ ...prev, [region]: e.target.value }))}
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="field rate-search-field">
              <div className="registry-search rate-search">
                <Search size={14} aria-hidden="true" />
                <input
                  type="text"
                  value={rateSearch}
                  onChange={(e) => setRateSearch(e.target.value)}
                  placeholder={t("Search any of 242 countries…")}
                />
                {rateSearch ? (
                  <button type="button" className="registry-search-clear" onClick={() => setRateSearch("")} aria-label={t("Clear search")}>
                    <X size={13} />
                  </button>
                ) : null}
              </div>
              <p className="flow-edit-note">
                {rateSearch
                  ? `${rateRows.length} ${t("matching")}`
                  : t("Showing countries you earn in or have priced. Search to reach any other country.")}
              </p>
            </div>

            {cpaState.loading ? (
              <div className="empty-state">{t("Loading…")}</div>
            ) : (
              <div className="cpa-grid">
                {rateRows.map((row) => {
                  const resolved = resolveCpa(row.country, explicitRateMap, regionRateMap);
                  const inherited = resolved.source === "region";
                  const needsRate = row.ftds > 0 && resolved.cpa <= 0;
                  return (
                    <label key={row.country} className={`cpa-item${needsRate ? " needs-rate" : ""}`}>
                      <span className="cpa-item-country">
                        <CountryFlag value={row.country} size={12} /> {row.country}
                        {row.ftds > 0 ? <em className="cpa-item-ftds">{row.ftds} FTD</em> : null}
                      </span>
                      <span className="cpa-item-input">
                        <span className="cpa-currency">$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={cpaDraft[row.country] ?? ""}
                          placeholder="0"
                          onChange={(e) => setCpaDraft((prev) => ({ ...prev, [row.country]: e.target.value }))}
                        />
                      </span>
                      {inherited ? (
                        <span className="cpa-item-meta is-inherited">
                          ${resolved.cpa} {t("via")} {resolved.region} {t("default")}
                        </span>
                      ) : row.rate?.updatedBy ? (
                        <span className="cpa-item-meta">
                          {row.rate.updatedBy}
                          {row.rate.updatedAt ? ` · ${new Date(row.rate.updatedAt).toLocaleDateString()}` : ""}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
                {!rateRows.length ? <div className="empty-state">{t("No countries match that search.")}</div> : null}
              </div>
            )}
          </motion.div>
        </section>
      ) : null}

      {campaignTab === "marketroi" && isLeadership ? (
        <>
          <section className="cards">
            {[
              { label: "Market Revenue", value: formatCurrency(marketTotals.revenue), meta: "FTDs × market CPA", icon: DollarSign },
              { label: "Spend", value: formatCurrency(marketTotals.spend), meta: "Auto from Meta via Keitaro · manual fallback", icon: CreditCard, untrusted: !spendTrusted },
              {
                // Revenue minus a spend figure that is missing accounts, so the
                // profit is overstated by exactly the cost that never arrived.
                label: "Market Profit",
                value: formatCurrency(marketTotals.revenue - marketTotals.spend),
                meta: "Market revenue − spend",
                icon: TrendingUp,
                accent: spendTrusted && marketTotals.revenue - marketTotals.spend >= 0,
                negative: spendTrusted && marketTotals.revenue - marketTotals.spend < 0,
                untrusted: !spendTrusted,
              },
              {
                // Divided by that same spend, so it is the most distorted
                // figure on the page — 3983% against a real denominator would
                // be a fraction of that.
                label: "Market ROI",
                value: marketTotals.spend > 0 ? `${(((marketTotals.revenue - marketTotals.spend) / marketTotals.spend) * 100).toFixed(0)}%` : "—",
                meta: "At market CPA rates",
                icon: Target,
                untrusted: !spendTrusted,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`card${stat.accent ? " card-accent" : ""}${stat.negative ? " card-negative" : ""}`}>
                  <div className="card-head"><Icon size={18} />{t(stat.label)}</div>
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
                  {stat.meta ? <div className="card-meta">{t(stat.meta)}</div> : null}
                </div>
              );
            })}
          </section>

          {marketTotals.unrated > 0 ? (
            <section className="campaign-signals">
              <div className="campaign-signal tone-warn">
                <span className="campaign-signal-icon"><AlertTriangle size={15} /></span>
                <div className="campaign-signal-body">
                  <span className="campaign-signal-title">{t("Missing rates")}</span>
                  <span className="campaign-signal-campaign">
                    {marketTotals.unrated.toLocaleString()} {t("FTDs in countries without a CPA rate")}
                  </span>
                  <span className="campaign-signal-detail">{t("They count as $0 below — fill the rate card to value them.")}</span>
                </div>
              </div>
            </section>
          ) : null}


          <section className="panels panels-single">
            <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">{t("Market ROI by campaign")}</h2>
                  <p className="panel-subtitle">{t("Sorted by market profit. Rated FTDs are the ones covered by your rate card.")}</p>
                </div>
                <span className="roles-count">{marketRows.length} {t("campaigns")}</span>
              </div>
              {marketRows.length === 0 ? (
                <div className="empty-state">{t("No campaigns match this period or filter.")}</div>
              ) : (
                <div className="table-wrap">
                  <table className="entries-table campaigns-table">
                    <thead>
                      <tr>
                        <th>{t("Campaign")}</th>
                        <th>{t("FTD")}</th>
                        <th>{t("Rated FTD")}</th>
                        <th>{t("Market Revenue")}</th>
                        <th>{t("Spend")}</th>
                        <th>{t("Market Profit")}</th>
                        <th>{t("Market ROI")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketRows.map((row) => (
                        <tr key={row.campaign}>
                          <td>
                            <div className="campaign-cell">
                              <span className="campaign-cell-name" title={row.campaign}>{row.campaign}</span>
                              <span className="campaign-cell-chips">
                                {row.geo ? <span className="campaign-chip"><CountryFlag value={row.geo} size={11} /> {row.geo}</span> : null}
                                {row.brand ? <span className="campaign-chip">{row.brand}</span> : null}
                              </span>
                            </div>
                          </td>
                          <td>{fmtInt(row.ftds)}</td>
                          <td className={row.unratedFtds > 0 ? "campaign-dim" : ""}>
                            {fmtInt(row.ratedFtds)}
                            {row.unratedFtds > 0 ? <span className="campaign-unrated"> (+{fmtInt(row.unratedFtds)} {t("unrated")})</span> : null}
                          </td>
                          <td className="campaign-strong">{formatCurrency(row.marketRevenue)}</td>
                          <td>{row.totalSpend > 0 ? formatCurrency(row.totalSpend) : "—"}</td>
                          <td className={row.marketProfit >= 0 ? "campaign-strong" : "campaign-loss"}>{formatCurrency(row.marketProfit)}</td>
                          <td>
                            {row.marketRoi === null ? (
                              <span className="offer-muted">—</span>
                            ) : (
                              <span className={`campaign-roi${row.marketRoi >= 0 ? " is-up" : " is-down"}`}>
                                {row.marketRoi >= 0 ? "+" : ""}{row.marketRoi.toFixed(0)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="campaign-totals-row">
                        <td>{t("Total")}</td>
                        <td>{fmtInt(marketTotals.ftds)}</td>
                        <td>{fmtInt(marketTotals.ftds - marketTotals.unrated)}</td>
                        <td className="campaign-strong">{formatCurrency(marketTotals.revenue)}</td>
                        <td>{formatCurrency(marketTotals.spend)}</td>
                        <td className={marketTotals.revenue - marketTotals.spend >= 0 ? "campaign-strong" : "campaign-loss"}>
                          {formatCurrency(marketTotals.revenue - marketTotals.spend)}
                        </td>
                        <td>
                          {marketTotals.spend > 0 ? (
                            <span className={`campaign-roi${marketTotals.revenue - marketTotals.spend >= 0 ? " is-up" : " is-down"}`}>
                              {marketTotals.revenue - marketTotals.spend >= 0 ? "+" : ""}
                              {(((marketTotals.revenue - marketTotals.spend) / marketTotals.spend) * 100).toFixed(0)}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </motion.div>
          </section>
        </>
      ) : campaignTab === "performance" ? (
        <>
      {/* Period totals for everything currently visible */}
      <section className="cards campaigns-kpis">
        {kpiCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`card${stat.accent ? " card-accent" : ""}${stat.negative ? " card-negative" : ""}`}>
              <div className="card-head"><Icon size={18} />{t(stat.label)}</div>
              <div
                className={`card-value${stat.small ? " card-value--sm" : ""}${stat.untrusted ? " is-untrusted" : ""}`}
                title={stat.small ? String(stat.value) : undefined}
              >
                {stat.value}
              </div>
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
              <div className="card-meta">
                {t(stat.meta)}
                {stat.neutralDelta ? null : renderDelta(stat.delta)}
              </div>
            </div>
          );
        })}
      </section>

      {actionSignals.length ? (
        <section className="campaign-signals">
          {actionSignals.map((signal) => {
            const Icon = signal.Icon;
            return (
              <div key={signal.title} className={`campaign-signal tone-${signal.tone}`}>
                <span className="campaign-signal-icon"><Icon size={15} /></span>
                <div className="campaign-signal-body">
                  <span className="campaign-signal-title">{t(signal.title)}</span>
                  <span className="campaign-signal-campaign">{signal.campaign}</span>
                  <span className="campaign-signal-detail">{signal.detail}</span>
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      <section className="panels campaign-charts">
        <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Daily Traffic")}</h2>
              <p className="panel-subtitle">{t("Unique clicks per day across the selected campaigns.")}</p>
            </div>
            <div className="panel-actions">
              <PeriodSelect value={period} onChange={setPeriod} customRange={customRange} onCustomChange={onCustomChange} />
            </div>
          </div>
          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaign stats…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : growthSeries.length === 0 ? (
            <div className="empty-state">{t("No Keitaro traffic in this period yet.")}</div>
          ) : (
            <div className="chart chart-surface" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthSeries} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id="campClicksFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES_COLORS.clicks} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={SERIES_COLORS.clicks} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#8b8f98", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis tick={{ fill: "#8b8f98", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Area type="monotone" dataKey="uniqueClicks" name={t("Unique Clicks")} stroke={SERIES_COLORS.clicks} strokeWidth={2} fill="url(#campClicksFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.04 }}>
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Daily Conversions")}</h2>
              <p className="panel-subtitle">{t("Registrations, FTDs and redeposits per day — one shared axis.")}</p>
            </div>
          </div>
          {campaignState.loading || campaignState.error ? (
            <div className="empty-state">{campaignState.error || t("Loading campaign stats…")}</div>
          ) : growthSeries.length === 0 ? (
            <div className="empty-state">{t("No Keitaro traffic in this period yet.")}</div>
          ) : (
            <div className="chart chart-surface" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthSeries} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#8b8f98", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis tick={{ fill: "#8b8f98", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#8b8f98" }} iconType="plainline" />
                  <Line type="monotone" dataKey="registers" name={t("Registrations")} stroke={SERIES_COLORS.registers} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ftds" name={t("FTDs")} stroke={SERIES_COLORS.ftds} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="redeposits" name={t("Redeposits")} stroke={SERIES_COLORS.redeposits} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Top Campaigns by FTD")}</h2>
              <p className="panel-subtitle">{t("Where the deposits actually come from — scale these.")}</p>
            </div>
          </div>
          {topByFtd.length === 0 ? (
            <div className="empty-state">{t("No FTDs in this period yet.")}</div>
          ) : (
            <div className="chart chart-surface" style={{ height: Math.max(200, topByFtd.length * 34 + 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topByFtd} layout="vertical" margin={{ top: 4, right: 44, bottom: 0, left: 8 }} barCategoryGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#8b8f98", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={170} tick={{ fill: "#a9adb7", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="ftds" name={t("FTDs")} fill={SERIES_COLORS.ftds} radius={[0, 4, 4, 0]} maxBarSize={18}>
                    <LabelList dataKey="ftds" position="right" style={{ fill: "#a9adb7", fontSize: 11 }} formatter={(v) => Number(v).toLocaleString()} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Revenue Composition")}</h2>
              <p className="panel-subtitle">{t("FTD vs redeposit revenue — a big yellow share means players stay and redeposit.")}</p>
            </div>
          </div>
          {topByRevenue.length === 0 ? (
            <div className="empty-state">{t("No revenue in this period yet.")}</div>
          ) : (
            <div className="chart chart-surface" style={{ height: Math.max(200, topByRevenue.length * 34 + 60) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topByRevenue} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }} barCategoryGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#8b8f98", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <YAxis type="category" dataKey="name" width={170} tick={{ fill: "#a9adb7", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} formatter={(v) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#8b8f98" }} />
                  <Bar dataKey="ftdRevenue" name={t("FTD revenue")} stackId="rev" fill={SERIES_COLORS.ftds} stroke="#1b1d21" strokeWidth={2} maxBarSize={18} />
                  <Bar dataKey="redepositRevenue" name={t("Redeposit revenue")} stackId="rev" fill={SERIES_COLORS.redeposits} stroke="#1b1d21" strokeWidth={2} radius={[0, 4, 4, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div className="panel span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}>
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Efficiency Map")}</h2>
              <p className="panel-subtitle">
                {t("Each dot is a campaign (≥50 uniques); size = traffic. Right of the line: clicks convert to regs. Above it: regs deposit. Top-right = scale · bottom-right = fix offer · top-left = fix creatives · bottom-left = cut.")}
              </p>
            </div>
          </div>
          {scatterData.length < 2 ? (
            <div className="empty-state">{t("Not enough campaigns with traffic to map yet.")}</div>
          ) : (
            <div className="chart chart-surface" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 24, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={t("Click2Reg")}
                    unit="%"
                    tick={{ fill: "#8b8f98", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: `${t("Click2Reg")} %`, position: "insideBottom", offset: -4, fill: "#6b7079", fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={t("R2D")}
                    unit="%"
                    tick={{ fill: "#8b8f98", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: `${t("R2D")} %`, angle: -90, position: "insideLeft", fill: "#6b7079", fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[70, 420]} name={t("Unique Clicks")} />
                  <ReferenceLine x={scatterMedians.x} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />
                  <ReferenceLine y={scatterMedians.y} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={tooltipItemStyle}
                    labelStyle={tooltipLabelStyle}
                    cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.2)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      if (!d) return null;
                      return (
                        <div className="chart-tooltip" style={tooltipStyle}>
                          <p className="tooltip-label">{d.name}</p>
                          <div className="tooltip-row"><span>{t("Click2Reg")}: {d.x}%</span></div>
                          <div className="tooltip-row"><span>{t("R2D")}: {d.y}%</span></div>
                          <div className="tooltip-row"><span>{t("Unique Clicks")}: {Number(d.z).toLocaleString()}</span></div>
                          <div className="tooltip-row"><span>FTD: {Number(d.ftds).toLocaleString()}</span></div>
                          {d.cohortC2r != null ? (
                            <div className="tooltip-row">
                              <span>{d.tool} {t("cohort median")}: C2R {d.cohortC2r}% · R2D {d.cohortR2d}%</span>
                            </div>
                          ) : null}
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData} fill={SERIES_COLORS.clicks} fillOpacity={0.75} stroke="#1b1d21" strokeWidth={1} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </section>

      <section className="panels panels-single">
        <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Keitaro Campaigns")}</h2>
              <p className="panel-subtitle">{t("One row per campaign in the tracker — expand a row for its GEO breakdown.")}</p>
            </div>
            <div className="campaign-table-actions">
              <span className="roles-count">{visibleCampaigns.length} {t("campaigns")}</span>
              <button type="button" className="icon-btn" title={t("Export CSV")} onClick={exportCsv}>
                <Download size={14} />
              </button>
            </div>
          </div>

          <div className="pixel-table-toolbar">
            <div className="field registry-search-field">
              <label>{t("Search")}</label>
              <div className="registry-search">
                <Search size={14} aria-hidden="true" />
                <input
                  type="text"
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  placeholder={t("Search campaign, tool, game, geo, brand…")}
                />
                {campaignSearch ? (
                  <button type="button" className="registry-search-clear" onClick={() => setCampaignSearch("")} aria-label={t("Clear search")}>
                    <X size={13} />
                  </button>
                ) : null}
              </div>
            </div>
            {isLeadership ? (
              <div className="field">
                <label>{t("Buyer")}</label>
                <CountryDropdownPicker
                  multiple
                  values={buyerFilterLocal}
                  onToggle={(value) =>
                    setBuyerFilterLocal((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
                  }
                  options={buyerOptionsLocal.map((b) => ({ value: b, label: b }))}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find buyers")}
                  emptyResultsLabel={t("No buyers found.")}
                />
              </div>
            ) : null}
            <div className="field">
              <label>{t("Min. uniques")}</label>
              <CountryDropdownPicker
                value={minUniques}
                onChange={(value) => setMinUniques(value || "0")}
                options={[
                  { value: "0", label: t("All traffic") },
                  { value: "50", label: "≥ 50" },
                  { value: "100", label: "≥ 100" },
                  { value: "300", label: "≥ 300" },
                  { value: "1000", label: "≥ 1000" },
                ]}
                placeholder={t("All traffic")}
              />
            </div>
          </div>

          {actionError ? <p className="logs-error">{actionError}</p> : null}

          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaign stats…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : visibleCampaigns.length === 0 ? (
            <div className="empty-state">{t("No campaigns match this period or filter.")}</div>
          ) : (
            <div className="table-wrap campaign-table-scroll">
              <table className="entries-table campaigns-table">
                <thead>
                  <tr>
                    {CAMPAIGN_COLUMNS.map((col) => (
                      <th key={col.key}>
                        <button
                          type="button"
                          className={`sortable-header ${tableSort.key === col.key ? "active" : ""}`}
                          onClick={() => toggleSort(col.key)}
                        >
                          {t(col.label)}
                          <span className="sort-indicator">{getSortIndicator(tableSort, col.key)}</span>
                        </button>
                      </th>
                    ))}
                    <th className="col-actions" />
                  </tr>
                </thead>
                <tbody>
                  {visibleCampaigns.map((row) => {
                    const isOpen = expandedCampaign === row.campaign;
                    const isPaused = row.campaignId != null && campaignStates[String(row.campaignId)] === "disabled";
                    return (
                      <React.Fragment key={row.campaign}>
                        <tr className={`${isOpen ? "campaign-row-open" : ""}${isPaused ? " campaign-row-paused" : ""}`}>
                          <td>
                            <div className="campaign-cell">
                              <span className="campaign-cell-name" title={row.campaign}>{row.campaign}</span>
                              <span className="campaign-cell-chips">
                                {pinnedCampaigns.has(row.campaign) ? (
                                  <span className="campaign-chip campaign-chip-pinned"><Star size={9} /> {t("pinned")}</span>
                                ) : null}
                                {isPaused ? <span className="campaign-chip campaign-chip-paused">{t("paused")}</span> : null}
                                {row.tool ? (
                                  resolveBrandLogo(row.tool) ? <BrandMark value={row.tool} height={12} /> : <span className="campaign-chip">{row.tool}</span>
                                ) : null}
                                {row.geo ? (
                                  <span className="campaign-chip"><CountryFlag value={row.geo} size={11} /> {row.geo}</span>
                                ) : null}
                                {row.brand ? <span className="campaign-chip">{row.brand}</span> : null}
                              </span>
                            </div>
                          </td>
                          <td>{fmtInt(row.uniqueClicks)}</td>
                          <td className="campaign-dim">{fmtPct(row.click2reg)}</td>
                          <td>{fmtInt(row.registers)}</td>
                          <td className="campaign-dim">{fmtPct(row.click2dep)}</td>
                          <td className="campaign-dim">{fmtPct(row.r2d)}</td>
                          <td className="campaign-strong">{fmtInt(row.ftds)}</td>
                          <td className="campaign-dim">{fmtPct(row.ftd2red)}</td>
                          <td>{fmtInt(row.redeposits)}</td>
                          <td className="campaign-strong">{formatCurrency(row.revenue)}</td>
                          <td className="campaign-dim">{formatCurrency(row.redepositRevenue)}</td>
                          <td className="campaign-dim">{formatCurrency(row.ftdRevenue)}</td>
                          <td>
                            <span className="campaign-spend-cell">
                              {row.totalSpend > 0 ? formatCurrency(row.totalSpend) : <span className="offer-muted">—</span>}
                              {row.spendSource === "auto" ? (
                                <span className="campaign-chip campaign-chip-auto" title={t("Cost flows automatically from the Meta account via Keitaro")}>
                                  {t("auto")}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="icon-btn campaign-spend-edit"
                                  title={t("Enter spend manually (no wired Meta account)")}
                                  onClick={() =>
                                    setSpendEditor({
                                      campaign: row.campaign,
                                      date: new Date().toISOString().slice(0, 10),
                                      amount: "",
                                      saving: false,
                                      error: null,
                                    })
                                  }
                                >
                                  <Pencil size={11} />
                                </button>
                              )}
                            </span>
                          </td>
                          <td className="campaign-dim">{row.cpa > 0 ? formatCurrency(row.cpa) : "—"}</td>
                          <td>
                            {row.roi === null ? (
                              <span className="offer-muted">—</span>
                            ) : (
                              <span className={`campaign-roi${row.roi >= 0 ? " is-up" : " is-down"}`}>
                                {row.roi >= 0 ? "+" : ""}{row.roi.toFixed(0)}%
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="campaign-trend">
                              <MiniSparkline values={row.spark} />
                              {row.spark.length >= 2 ? (
                                <span
                                  className={`campaign-trend-delta${row.ftdDelta > 0 ? " is-up" : row.ftdDelta < 0 ? " is-down" : ""}`}
                                >
                                  {row.ftdDelta > 0 ? `▲${row.ftdDelta}` : row.ftdDelta < 0 ? `▼${Math.abs(row.ftdDelta)}` : "–"}
                                </span>
                              ) : null}
                            </span>
                          </td>
                          <td className="col-actions">
                            <div className="campaign-row-actions">
                              <button
                                type="button"
                                className={`icon-btn campaign-pin${pinnedCampaigns.has(row.campaign) ? " is-pinned" : ""}`}
                                title={pinnedCampaigns.has(row.campaign) ? t("Unpin") : t("Pin to top")}
                                onClick={() => togglePin(row.campaign)}
                              >
                                <Star size={13} />
                              </button>
                              {row.campaignId != null && campaignStates[String(row.campaignId)] ? (
                                <button
                                  type="button"
                                  className={`icon-btn campaign-state-btn${campaignStates[String(row.campaignId)] === "disabled" ? " is-resume" : ""}`}
                                  disabled={stateBusyId === row.campaignId}
                                  title={campaignStates[String(row.campaignId)] === "disabled" ? t("Resume campaign") : t("Pause campaign")}
                                  onClick={() => toggleCampaignState(row)}
                                >
                                  {campaignStates[String(row.campaignId)] === "disabled" ? <Play size={13} /> : <Pause size={13} />}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="icon-btn campaign-editoffer-btn"
                                title={t("Open in Tracking Links (edit offer)")}
                                onClick={() => {
                                  try {
                                    sessionStorage.setItem("pending-edit-campaign", row.campaign);
                                  } catch { /* ignore */ }
                                  window.dispatchEvent(new CustomEvent("dash:navigate", { detail: { view: "tracking" } }));
                                }}
                              >
                                <Pencil size={13} />
                              </button>
                              {row.countryRows.length ? (
                                <button
                                  type="button"
                                  className="icon-btn campaign-expand-btn"
                                  title={t("GEO breakdown")}
                                  onClick={() => setExpandedCampaign(isOpen ? null : row.campaign)}
                                >
                                  {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                        {isOpen ? (
                          <tr className="campaign-detail-row">
                            <td colSpan={CAMPAIGN_COLUMNS.length + 1}>
                              <div className="campaign-geo-breakdown">
                                {row.countryRows.slice(0, 12).map((c) => (
                                  <div key={c.country} className="campaign-geo-item">
                                    <span className="campaign-geo-name"><CountryFlag value={c.country} size={12} /> {c.country}</span>
                                    <span className="campaign-geo-stat">{fmtInt(c.clicks)} {t("clicks")}</span>
                                    <span className="campaign-geo-stat">{fmtInt(c.registers)} {t("regs")}</span>
                                    <span className="campaign-geo-stat campaign-strong">{fmtInt(c.ftds)} FTD</span>
                                    <span className="campaign-geo-stat">{fmtInt(c.redeposits)} {t("rdp")}</span>
                                    <span className="campaign-geo-stat campaign-strong">{formatCurrency(c.revenue)}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="campaign-totals-row">
                    <td>{t("Total")} · {visibleCampaigns.length} {t("campaigns")}</td>
                    <td>{fmtInt(totals.uniqueClicks)}</td>
                    <td className="campaign-dim">{fmtPct(totals.uniqueClicks > 0 ? (totals.registers / totals.uniqueClicks) * 100 : 0)}</td>
                    <td>{fmtInt(totals.registers)}</td>
                    <td className="campaign-dim">{fmtPct(totals.uniqueClicks > 0 ? (totals.ftds / totals.uniqueClicks) * 100 : 0)}</td>
                    <td className="campaign-dim">{fmtPct(totals.registers > 0 ? (totals.ftds / totals.registers) * 100 : 0)}</td>
                    <td className="campaign-strong">{fmtInt(totals.ftds)}</td>
                    <td className="campaign-dim">{fmtPct(totals.ftds > 0 ? (totals.redeposits / totals.ftds) * 100 : 0)}</td>
                    <td>{fmtInt(totals.redeposits)}</td>
                    <td className="campaign-strong">{formatCurrency(totals.revenue)}</td>
                    <td colSpan={2} />
                    <td>{totals.spend > 0 ? formatCurrency(totals.spend) : "—"}</td>
                    <td className="campaign-dim">{totals.spend > 0 && totals.ftds > 0 ? formatCurrency(totals.spend / totals.ftds) : "—"}</td>
                    <td>
                      {totals.spend > 0 ? (
                        <span className={`campaign-roi${profitTotal >= 0 ? " is-up" : " is-down"}`}>
                          {profitTotal >= 0 ? "+" : ""}{(((totals.revenue - totals.spend) / totals.spend) * 100).toFixed(0)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </motion.div>
      </section>
        </>
      ) : null}

      <AnimatePresence>
        {spendEditor ? (
          <motion.div
            className="modal-overlay"
            {...overlayMotion}
            onClick={() => setSpendEditor(null)}
          >
            <motion.div
              className="modal pixel-edit-modal campaign-spend-modal"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Enter spend")}</p>
                  <h2 className="campaign-spend-modal-title">{spendEditor.campaign}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={() => setSpendEditor(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field">
                  <label>{t("Date")}</label>
                  <DeusDatePicker
                    value={spendEditor.date}
                    onChange={(v) => setSpendEditor((prev) => ({ ...prev, date: v }))}
                  />
                </div>
                <div className="field">
                  <label>{t("Amount (USD)")}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    autoFocus
                    value={spendEditor.amount}
                    onChange={(e) => setSpendEditor((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                  <p className="field-hint">{t("Overwrites the amount stored for this campaign on this date.")}</p>
                </div>
                {spendEditor.error ? (
                  <div className="field field-span-2"><div className="api-status error">{spendEditor.error}</div></div>
                ) : null}
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={() => setSpendEditor(null)}>{t("Cancel")}</button>
                <button className="action-pill" type="button" onClick={saveSpend} disabled={spendEditor.saving}>
                  {spendEditor.saving ? t("Saving…") : t("Save spend")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
