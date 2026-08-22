import React from "react";
import { formatShortDate } from "../components/PeriodSelect.jsx";
import { apiFetch } from "../lib/api.js";
import { readSwrCache, writeSwrCache } from "../lib/cache.js";
import { isDateInRange, normalizeDateRange } from "../lib/date.js";
import { isAllSelection, matchesCampaignListFilter, normalizeBuyerKey, normalizeFilterValue } from "../lib/filters.js";
import {
  axisTickStyle,
  formatCurrency,
  formatCurrencyCompact,
  tooltipItemStyle,
  tooltipLabelStyle,
  tooltipStyle,
} from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, stagger } from "../lib/motion.js";
import { goToView } from "../lib/navigation.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { EMPTY_FLOW_FILTER } from "../lib/view-helpers.js";
import { motion } from "framer-motion";
import { AlertTriangle, CreditCard, Map as MapIcon, Trophy, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function GeosDashboard({ filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const [geoRows, setGeoRows] = React.useState([]);
  const [geoState, setGeoState] = React.useState({ loading: true, error: null });

  const loadGeos = React.useCallback(async () => {
    const isoRe = /^\d{4}-\d{2}-\d{2}$/;
    const from = isoRe.test(filters?.dateFrom || "") ? filters.dateFrom : "";
    const to = isoRe.test(filters?.dateTo || "") ? filters.dateTo : "";
    const qs = new URLSearchParams({ group: "geo" });
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    const liveUrl = `/api/keitaro/live-stats?${qs.toString()}`;
    const cacheKey = `live-geos:${qs.toString()}`;
    const cached = readSwrCache(cacheKey);

    if (cached && Array.isArray(cached)) {
      setGeoRows(cached);
      setGeoState({ loading: false, error: null });
    } else {
      setGeoState({ loading: true, error: null });
    }

    try {
      let rows = null;
      // Primary path: live, geo-grained data straight from Keitaro.
      const response = await apiFetch(liveUrl);
      if (response.ok) {
        const data = await response.json();
        rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        // Fallback to the synced table when the live endpoint is unavailable.
        const fb = await apiFetch("/api/media-stats?limit=100000");
        if (!fb.ok) throw new Error("Failed to load media buyer stats.");
        const fbData = await fb.json();
        rows = Array.isArray(fbData) ? fbData : [];
      }
      writeSwrCache(cacheKey, rows);
      setGeoRows(rows);
      setGeoState({ loading: false, error: null });
    } catch (error) {
      if (!cached) {
        setGeoState({ loading: false, error: error.message || "Failed to load stats." });
      }
    }
  }, [filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    loadGeos();
  }, [loadGeos]);

  React.useEffect(() => {
    const handleSync = () => {
      loadGeos();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [loadGeos]);

  const buyerFilter = filters?.buyer || "All";
  const countryFilter = filters?.country || "All";
  const flowFilter = Array.isArray(filters?.statsCampaign) ? filters.statsCampaign : EMPTY_FLOW_FILTER;
  const regionFilter = filters?.city || "All";
  const cityFilter = filters?.geoCity || "All";
  const domainFilter = filters?.geoDomain || "All";
  const placementFilter = filters?.geoPlacement || "All";
  const deviceFilter = filters?.geoDevice || "All";
  const minClicksFilter = Number(filters?.geoMinClicks || 0);
  const minFtdsFilter = Number(filters?.geoMinFtds || 0);
  const dateFrom = filters?.dateFrom;
  const dateTo = filters?.dateTo;
  const normalizeBuyerKey = (value) =>
    String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();
  const isAllSelection = (value) => !value || normalizeFilterValue(value) === "all";

  const sum = (value) => Number(value || 0);
  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCost = (value) =>
    value === null || Number.isNaN(value) ? "—" : formatCurrency(value);
  const renderMetricTooltip = (labelKey, valueKey, valueLabel) => ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0]?.payload || {};
    const label = item[labelKey] || payload[0]?.name || "";
    const value = item[valueKey] ?? payload[0]?.value;
    return (
      <div style={tooltipStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div>
          {valueLabel}: {formatCurrency(value || 0)}
        </div>
      </div>
    );
  };
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

  const filteredRows = React.useMemo(() => {
    const normalizedCountry = normalizeFilterValue(countryFilter);
    const normalizedRegion = normalizeFilterValue(regionFilter);
    const normalizedCity = normalizeFilterValue(cityFilter);
    const normalizedDomain = normalizeFilterValue(domainFilter);
    const normalizedPlacement = normalizeFilterValue(placementFilter);
    const normalizedDevice = normalizeFilterValue(deviceFilter);
    const dateRange = normalizeDateRange(dateFrom, dateTo);
    return geoRows.filter((row) => {
      if (!matchesBuyer(row.buyer)) return false;
      if (!matchesCampaignListFilter(row.campaign || row.campaign_name, flowFilter)) return false;
      const rowCountry = normalizeFilterValue(row.country);
      if (!isAllSelection(countryFilter) && rowCountry !== normalizedCountry) return false;
      const rowRegion = normalizeFilterValue(row.region || row.city);
      if (!isAllSelection(regionFilter) && !rowRegion.includes(normalizedRegion)) return false;
      const rowCity = normalizeFilterValue(row.city);
      if (!isAllSelection(cityFilter) && !rowCity.includes(normalizedCity)) return false;
      const rowDomain = normalizeFilterValue(
        row.domain || row.source || row.site || row.flow || row.flows
      );
      if (!isAllSelection(domainFilter) && !rowDomain.includes(normalizedDomain)) return false;
      const rowPlacement = normalizeFilterValue(row.placement || row.sub_id_1 || row.sub1);
      if (!isAllSelection(placementFilter) && !rowPlacement.includes(normalizedPlacement)) return false;
      const rowDevice = normalizeFilterValue(
        row.device || row.device_type || row.os || row.os_icon || row.os_version
      );
      if (!isAllSelection(deviceFilter) && !rowDevice.includes(normalizedDevice)) return false;
      if (Number.isFinite(minClicksFilter) && minClicksFilter > 0 && sum(row.clicks) < minClicksFilter) {
        return false;
      }
      if (Number.isFinite(minFtdsFilter) && minFtdsFilter > 0 && sum(row.ftds) < minFtdsFilter) {
        return false;
      }
      if (!isDateInRange(row.date, dateRange)) return false;
      return true;
    });
  }, [
    geoRows,
    buyerFilter,
    countryFilter,
    flowFilter,
    regionFilter,
    cityFilter,
    domainFilter,
    placementFilter,
    deviceFilter,
    minClicksFilter,
    minFtdsFilter,
    dateFrom,
    dateTo,
    isLeadership,
    viewerBuyer,
  ]);

  const geoTotals = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "Unknown");
      if (!map.has(country)) {
        map.set(country, {
          country,
          spend: 0,
          revenue: 0,
          hasRevenue: false,
          ftdRevenue: 0,
          redepositRevenue: 0,
          clicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
        });
      }
      const current = map.get(country);
      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      current.spend += sum(row.spend);
      current.clicks += sum(row.clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.ftdRevenue = (current.ftdRevenue || 0) + ftdRevenueValue;
      current.redepositRevenue = (current.redepositRevenue || 0) + redepositRevenueValue;
      if (Number.isFinite(revenueValue)) {
        current.revenue += revenueValue;
        current.hasRevenue = true;
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const revenueSort = (b.revenue || 0) - (a.revenue || 0);
      if (revenueSort !== 0) return revenueSort;
      return (b.clicks || 0) - (a.clicks || 0);
    });
  }, [filteredRows]);

  const [geoTableSort, setGeoTableSort] = React.useState({ key: "revenue", dir: "desc" });
  const toggleGeoSort = (key) => {
    setGeoTableSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  };
  const getGeoSortValue = (row, key) => {
    const revenueValue = row.hasRevenue ? row.revenue : null;
    switch (key) {
      case "country":
        return String(row.country || "");
      case "spend":
        return row.spend ? row.spend : null;
      case "revenue":
        return revenueValue;
      case "clicks":
        return row.clicks;
      case "installs":
        return row.installs ? row.installs : null;
      case "registers":
        return row.registers;
      case "ftds":
        return row.ftds;
      case "redeposits":
        return row.redeposits ? row.redeposits : null;
      case "arppu":
        return revenueValue !== null && row.ftds > 0 ? revenueValue / row.ftds : null;
      case "ltv":
        return revenueValue !== null && row.redeposits > 0 ? revenueValue / row.redeposits : null;
      case "c2r":
        return toPercent(row.registers, row.clicks);
      case "c2ftd":
        return toPercent(row.ftds, row.clicks);
      case "r2d":
        return toPercent(row.ftds, row.registers);
      default:
        return null;
    }
  };
  const sortedGeoTotals = React.useMemo(() => {
    const rows = [...geoTotals];
    const { key, dir } = geoTableSort;
    const direction = dir === "asc" ? 1 : -1;
    return rows.sort((a, b) => {
      const aVal = getGeoSortValue(a, key);
      const bVal = getGeoSortValue(b, key);
      const aNull = aVal === null || aVal === undefined || Number.isNaN(aVal);
      const bNull = bVal === null || bVal === undefined || Number.isNaN(bVal);
      if (key === "country") {
        return direction * String(aVal || "").localeCompare(String(bVal || ""));
      }
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      if (aVal === bVal) return 0;
      return direction * (aVal > bVal ? 1 : -1);
    });
  }, [geoTotals, geoTableSort]);

  const cityTotalsAll = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const rawCity = String(row.region || row.city || "").trim();
      const countryLabel = String(row.country || "Unknown").trim() || "Unknown";
      const city = rawCity || `Unknown (${countryLabel})`;
      if (!map.has(city)) {
        map.set(city, {
          city,
          revenue: 0,
          spend: 0,
          ftds: 0,
          redeposits: 0,
          clicks: 0,
          registers: 0,
        });
      }
      const current = map.get(city);
      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (Number.isFinite(revenueValue)) {
        current.revenue += revenueValue;
      }
      current.spend += sum(row.spend);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
    });
    return Array.from(map.values()).sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  }, [filteredRows]);

  const cityTotals = React.useMemo(() => {
    return cityTotalsAll;
  }, [cityTotalsAll]);

  const geoSummary = React.useMemo(
    () =>
      geoTotals.reduce(
        (acc, row) => ({
          revenue: acc.revenue + (row.hasRevenue ? row.revenue : 0),
          clicks: acc.clicks + row.clicks,
          registers: acc.registers + row.registers,
          ftds: acc.ftds + row.ftds,
          redeposits: acc.redeposits + row.redeposits,
        }),
        { revenue: 0, clicks: 0, registers: 0, ftds: 0, redeposits: 0 }
      ),
    [geoTotals]
  );

  const geoTopLimit = 5;
  const geoChartRows = geoTotals.filter((row) => row.country && row.country !== "Unknown");
  const geoRevenueCandidates = geoChartRows.filter((row) => row.revenue > 0);
  const geoRevenueData = (geoRevenueCandidates.length ? geoRevenueCandidates : geoChartRows).slice(
    0,
    geoTopLimit
  );
  const geoArppuData = geoChartRows
    .map((row) => ({
      country: row.country,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
    }))
    .filter((row) => row.arppu > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const geoLtvData = geoChartRows
    .map((row) => ({
      country: row.country,
      ltv: row.redeposits > 0 ? row.revenue / row.redeposits : 0,
    }))
    .filter((row) => row.ltv > 0)
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, geoTopLimit);

  const cityRevenueCandidates = cityTotals.filter((row) => row.revenue > 0);
  const cityRevenueData = (cityRevenueCandidates.length ? cityRevenueCandidates : cityTotals).slice(
    0,
    geoTopLimit
  );
  const cityArppuData = cityTotals
    .map((row) => ({
      city: row.city,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
      revenue: row.revenue,
      ftds: row.ftds,
    }))
    .filter((row) => row.revenue > 0 || row.ftds > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const cityArppuTable = cityTotals
    .map((row) => ({
      city: row.city,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
      ftds: row.ftds,
      ftdsDisplay: Math.round(row.ftds || 0),
      revenue: row.revenue,
    }))
    .filter((row) => row.revenue > 0 || row.ftds > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const maxCityArppu = Math.max(1, ...cityArppuTable.map((row) => row.arppu || 0));
  const maxCityUsers = Math.max(1, ...cityArppuTable.map((row) => row.ftdsDisplay || 0));
  const cityLtvSource =
    cityTotals.some((row) => row.redeposits > 0 && row.revenue > 0) ? cityTotals : cityTotalsAll;
  const cityLtvData = cityLtvSource
    .map((row) => ({
      city: row.city,
      ltv: row.redeposits > 0 ? row.revenue / row.redeposits : 0,
    }))
    .filter((row) => row.ltv > 0)
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, geoTopLimit);

  const topGeoArppu = geoArppuData[0] || null;
  const topGeoLtv = geoLtvData[0] || null;
  const topGeoRevenue = geoRevenueData[0] || null;
  const topCityArppu = cityArppuData[0] || null;
  const topCityLtv = cityLtvData[0] || null;

  // DEUS series palette — distinct, on-brand colors so each series is unmistakable
  const DEUS_SERIES_COLORS = ["#36d07c", "#64b8ff", "#ff9357", "#a15bff", "#f7c625"];
  const ltvGrowthTargets = geoLtvData.map((row) => row.country);
  const ltvGrowthSeries = ltvGrowthTargets.map((country, index) => ({
    key: country,
    label: country,
    color: DEUS_SERIES_COLORS[index % DEUS_SERIES_COLORS.length],
  }));
  const arppuGrowthTargets = geoArppuData.map((row) => row.country);
  const arppuGrowthSeries = arppuGrowthTargets.map((country, index) => ({
    key: country,
    label: country,
    color: DEUS_SERIES_COLORS[index % DEUS_SERIES_COLORS.length],
  }));

  const ltvGrowthData = React.useMemo(() => {
    if (!ltvGrowthTargets.length) return [];
    const targetsSet = new Set(ltvGrowthTargets);
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!targetsSet.has(country)) return;
      const date = row.date;
      if (!date) return;

      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (!map.has(date)) {
        map.set(date, { date, values: {} });
      }
      const entry = map.get(date);
      if (!entry.values[country]) {
        entry.values[country] = { revenue: 0, redeposits: 0 };
      }
      entry.values[country].revenue += revenueValue || 0;
      entry.values[country].redeposits += sum(row.redeposits);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((entry) => {
        const row = { date: entry.date, dateLabel: formatShortDate(entry.date) };
        ltvGrowthTargets.forEach((country) => {
          const stats = entry.values[country];
          row[country] = stats && stats.redeposits > 0 ? stats.revenue / stats.redeposits : 0;
      });
        return row;
      });
  }, [filteredRows, ltvGrowthTargets]);

  const arppuGrowthData = React.useMemo(() => {
    if (!arppuGrowthTargets.length) return [];
    const targetsSet = new Set(arppuGrowthTargets);
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!targetsSet.has(country)) return;
      const date = row.date;
      if (!date) return;

      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (!map.has(date)) {
        map.set(date, { date, values: {} });
      }
      const entry = map.get(date);
      if (!entry.values[country]) {
        entry.values[country] = { revenue: 0, ftds: 0 };
      }
      entry.values[country].revenue += revenueValue || 0;
      entry.values[country].ftds += sum(row.ftds);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((entry) => {
        const row = { date: entry.date, dateLabel: formatShortDate(entry.date) };
        arppuGrowthTargets.forEach((country) => {
          const stats = entry.values[country];
          row[country] = stats && stats.ftds > 0 ? stats.revenue / stats.ftds : 0;
        });
        return row;
      });
  }, [filteredRows, arppuGrowthTargets]);

  return (
    <>
      {!geoState.loading && !geoState.error && geoTotals.length ? (
        <>
          <section className="cards">
            {[
              {
                label: "Total Revenue",
                value: formatCurrency(geoSummary.revenue),
                icon: Wallet,
                meta: t("Filtered range"),
              },
              {
                label: "Total FTDs",
                value: geoSummary.ftds.toLocaleString(),
                icon: CreditCard,
                meta: t("Filtered range"),
              },
              {
                label: "Total Redeposits",
                value: geoSummary.redeposits.toLocaleString(),
                icon: CreditCard,
                meta: t("Filtered range"),
              },
              {
                label: "Top GEO Revenue",
                value: topGeoRevenue ? formatCurrency(topGeoRevenue.revenue) : "—",
                icon: Trophy,
                meta: topGeoRevenue ? topGeoRevenue.country : t("No data"),
              },
              {
                label: "Top GEO ARPPU",
                value: topGeoArppu ? formatCurrency(topGeoArppu.arppu) : "—",
                icon: Trophy,
                meta: topGeoArppu ? topGeoArppu.country : t("No data"),
              },
              {
                label: "Top GEO LTV",
                value: topGeoLtv ? formatCurrency(topGeoLtv.ltv) : "—",
                icon: Trophy,
                meta: topGeoLtv ? topGeoLtv.country : t("No data"),
              },
              {
                label: "Top Region ARPPU",
                value: topCityArppu ? formatCurrency(topCityArppu.arppu) : "—",
                icon: MapIcon,
                meta: topCityArppu ? topCityArppu.city : t("No data"),
              },
              {
                label: "Top Region LTV",
                value: topCityLtv ? formatCurrency(topCityLtv.ltv) : "—",
                icon: MapIcon,
                meta: topCityLtv ? topCityLtv.city : t("No data"),
              },
            ].map((stat, idx) => {
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
                  </div>
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
                </motion.div>
              );
            })}
          </section>

          <div className="section-header">
            <div>
              <h3>{t("GEO Insights")}</h3>
              <p>{t("Top performing countries across revenue, ARPPU, and LTV.")}</p>
            </div>
          </div>
          <section className="panels geo-charts">
            <motion.div
              className="panel span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.settle, ease: EASE }}
            >
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">{t("Top GEOs by Revenue")}</h2>
                  <p className="panel-subtitle">{t("Best performing GEOs by total revenue.")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={geoRevenueData}
                    layout="vertical"
                    margin={{ top: 4, right: 64, left: 0, bottom: 4 }}
                    barCategoryGap={10}
                  >
                    {/* The value labels ride each bar, so the numeric axis +
                        grid would only duplicate ink — hide them. */}
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={{ ...axisTickStyle, fontSize: 12, fontWeight: 600, fill: "#c9cdd6" }}
                      width={104}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={tooltipStyle}
                      itemStyle={tooltipItemStyle}
                      labelStyle={tooltipLabelStyle}
                      formatter={(value) => [formatCurrency(value), t("Revenue")]}
                    />
                    <Bar dataKey="revenue" radius={[0, 8, 8, 0]} maxBarSize={26}>
                      {/* Rank-shaded: the leader reads strongest, the tail fades */}
                      {geoRevenueData.map((entry, i) => (
                        <Cell
                          key={`geo-rev-${entry.country}`}
                          fill="var(--green)"
                          fillOpacity={Math.max(0.25, 0.95 - i * 0.14)}
                        />
                      ))}
                      <LabelList
                        dataKey="revenue"
                        position="right"
                        formatter={(value) => formatCurrencyCompact(value)}
                        style={{ fill: "#e8ebf0", fontSize: 12, fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {geoRevenueData.length >= 2 ? (() => {
                const leader = geoRevenueData[0];
                const runner = geoRevenueData[1];
                const lift = runner.revenue > 0 ? Math.round(((leader.revenue - runner.revenue) / runner.revenue) * 100) : null;
                return (
                  <div className="chart-insight">
                    <span className="chart-insight-mark">↑</span>
                    <span><strong>{leader.country}</strong> leads with {formatCurrency(leader.revenue)}{lift !== null ? ` — ${lift}% more than ${runner.country}` : ""}</span>
                  </div>
                );
              })() : null}
            </motion.div>

            <motion.div
              className="panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.settle, delay: 0.05, ease: EASE }}
            >
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">{t("ARPPU by GEO")}</h2>
                  <p className="panel-subtitle">{t("Average revenue per paying user (Revenue / FTDs).")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={geoArppuData}
                    margin={{ top: 24, right: 24, left: 8, bottom: 24 }}
                    barCategoryGap={26}
                    barSize={42}
                  >
                    <defs>
                      <linearGradient id="geoArppu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff9357" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#ff9357" stopOpacity={0.35} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={{ ...axisTickStyle, fontSize: 12, fontWeight: 600, fill: "#c9cdd6" }}
                      interval={0}
                      height={32}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={52}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrencyCompact(value)}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={tooltipStyle}
                      itemStyle={tooltipItemStyle}
                      labelStyle={tooltipLabelStyle}
                      formatter={(value) => [formatCurrency(value), t("ARPPU")]}
                    />
                    <Bar dataKey="arppu" fill="url(#geoArppu)" radius={[10, 10, 0, 0]}>
                      <LabelList
                        dataKey="arppu"
                        position="top"
                        formatter={(value) => formatCurrencyCompact(value)}
                        fill="#e8ebf0"
                        fontSize={12}
                        fontWeight={700}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {topGeoArppu ? (
                <div className="chart-insight">
                  <span className="chart-insight-mark">★</span>
                  <span>Highest per-user value: <strong>{topGeoArppu.country}</strong> at {formatCurrency(topGeoArppu.arppu)}</span>
                </div>
              ) : null}
            </motion.div>

            <motion.div
              className="panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.settle, delay: 0.10, ease: EASE }}
            >
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">{t("LTV (2+ Deposits) by GEO")}</h2>
                  <p className="panel-subtitle">{t("Approximate: Revenue / Redeposits.")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={geoLtvData}
                    layout="vertical"
                    margin={{ top: 4, right: 64, left: 0, bottom: 4 }}
                    barCategoryGap={10}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={{ ...axisTickStyle, fontSize: 12, fontWeight: 600, fill: "#c9cdd6" }}
                      width={104}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={tooltipStyle}
                      itemStyle={tooltipItemStyle}
                      labelStyle={tooltipLabelStyle}
                      formatter={(value) => [formatCurrency(value), t("LTV")]}
                    />
                    <Bar dataKey="ltv" radius={[0, 8, 8, 0]} maxBarSize={26}>
                      {geoLtvData.map((entry, i) => (
                        <Cell
                          key={`geo-ltv-${entry.country}`}
                          fill="var(--orange)"
                          fillOpacity={Math.max(0.25, 0.95 - i * 0.14)}
                        />
                      ))}
                      <LabelList
                        dataKey="ltv"
                        position="right"
                        formatter={(value) => formatCurrencyCompact(value)}
                        style={{ fill: "#e8ebf0", fontSize: 12, fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {topGeoLtv ? (
                <div className="chart-insight">
                  <span className="chart-insight-mark">↑</span>
                  <span>Strongest repeat behavior: <strong>{topGeoLtv.country}</strong> at {formatCurrency(topGeoLtv.ltv)} LTV</span>
                </div>
              ) : null}
            </motion.div>

            <motion.div
              className="panel span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.settle, delay: 0.12, ease: EASE }}
            >
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">{t("LTV Growth Timeline")}</h2>
                  <p className="panel-subtitle">
                    {t("Daily LTV trend for the top GEOs (2+ deposits).")}
                  </p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={ltvGrowthData} margin={{ top: 8, right: 24, left: 4, bottom: 4 }}>
                    <defs>
                      {ltvGrowthSeries.map((series) => (
                        <linearGradient
                          key={`ltv-grad-${series.key}`}
                          id={`ltv-grad-${series.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          {/* Fills stay a whisper so crossing series never go muddy —
                              the strokes carry the reading. */}
                          <stop offset="5%" stopColor={series.color} stopOpacity={0.16} />
                          <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="dateLabel"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      minTickGap={18}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={52}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrencyCompact(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      labelFormatter={(label) => label}
                      formatter={(value, name) => [formatCurrency(value), name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={9}
                      wrapperStyle={{ paddingTop: 10, color: "#9aa0aa", fontSize: 12 }}
                    />
                    {ltvGrowthSeries.map((series) => (
                      <Area
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.label}
                        stroke={series.color}
                        strokeWidth={2.5}
                        fill={`url(#ltv-grad-${series.key})`}
                        connectNulls
                        /* Sparse ranges (few days) render dots so single-day
                           series stay visible; dense ranges keep clean lines. */
                        dot={ltvGrowthData.length <= 12 ? { r: 3.5, strokeWidth: 0, fill: series.color } : false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className="panel span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.settle, delay: 0.12, ease: EASE }}
            >
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">{t("ARPPU Growth Timeline")}</h2>
                  <p className="panel-subtitle">
                    {t("Daily ARPPU trend for the top GEOs (Revenue / FTDs).")}
                  </p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={arppuGrowthData}
                    margin={{ top: 8, right: 24, left: 4, bottom: 4 }}
                  >
                    <defs>
                      {arppuGrowthSeries.map((series) => (
                        <linearGradient
                          key={`arppu-grad-${series.key}`}
                          id={`arppu-grad-${series.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={series.color} stopOpacity={0.16} />
                          <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="dateLabel"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      minTickGap={18}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={52}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrencyCompact(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      labelFormatter={(label) => label}
                      formatter={(value, name) => [formatCurrency(value), name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={9}
                      wrapperStyle={{ paddingTop: 10, color: "#9aa0aa", fontSize: 12 }}
                    />
                    {arppuGrowthSeries.map((series) => (
                      <Area
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.label}
                        stroke={series.color}
                        strokeWidth={2.5}
                        fill={`url(#arppu-grad-${series.key})`}
                        connectNulls
                        dot={arppuGrowthData.length <= 12 ? { r: 3.5, strokeWidth: 0, fill: series.color } : false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </section>

          <div className="section-header">
            <div>
              <h3>{t("Region Insights")}</h3>
              <p>{t("Best cities ranked by revenue, ARPPU, and LTV.")}</p>
            </div>
          </div>
          <section className="panels city-charts">
          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.settle, ease: EASE }}
          >
            <div className="panel-head">
              <div>
                <h2 className="panel-title">{t("Top Regions by Revenue")}</h2>
                <p className="panel-subtitle">{t("Best performing regions by total revenue.")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={cityRevenueData}
                  margin={{ top: 24, right: 20, left: 10, bottom: 24 }}
                  barCategoryGap={22}
                  barSize={36}
                >
                  <defs>
                    <linearGradient id="geoCityRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="city"
                    tickLine={false}
                    axisLine={false}
                    tick={{ ...axisTickStyle, fontSize: 11, fontWeight: 600, fill: "#c9cdd6" }}
                    interval={0}
                    height={36}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrencyCompact(value)}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={tooltipStyle}
                    itemStyle={tooltipItemStyle}
                    labelStyle={tooltipLabelStyle}
                    formatter={(value) => [formatCurrency(value), t("Revenue")]}
                  />
                  <Bar dataKey="revenue" fill="url(#geoCityRevenue)" radius={[10, 10, 0, 0]}>
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(value) => formatCurrencyCompact(value)}
                      fill="#e8ebf0"
                      fontSize={12}
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
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
                <h2 className="panel-title">{t("LTV (2+ Deposits) by Region")}</h2>
                <p className="panel-subtitle">{t("Approximate: Revenue / Redeposits.")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={cityLtvData}
                  layout="vertical"
                  margin={{ top: 4, right: 64, left: 0, bottom: 4 }}
                  barCategoryGap={10}
                >
                  <XAxis type="number" hide domain={[0, 'dataMax']} />
                  <YAxis
                    type="category"
                    dataKey="city"
                    tickLine={false}
                    axisLine={false}
                    tick={{ ...axisTickStyle, fontSize: 12, fontWeight: 600, fill: "#c9cdd6" }}
                    width={110}
                  />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={renderMetricTooltip("city", "ltv", t("LTV"))} />
                  <Bar dataKey="ltv" name={t("LTV")} radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {cityLtvData.map((entry, i) => (
                      <Cell
                        key={`city-ltv-${entry.city}`}
                        fill="#ff9357"
                        fillOpacity={Math.max(0.3, 0.95 - i * 0.12)}
                      />
                    ))}
                    <LabelList
                      dataKey="ltv"
                      position="right"
                      formatter={(value) => formatCurrencyCompact(value)}
                      style={{ fill: "#e8ebf0", fontSize: 12, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="panel span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.settle, delay: 0.12, ease: EASE }}
          >
            <div className="panel-head">
              <div>
                <h2 className="panel-title">{t("ARPPU by Region")}</h2>
                <p className="panel-subtitle">{t("Average revenue per paying user (Revenue / FTDs).")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <div className="region-arppu-list">
                {cityArppuTable.map((row, idx) => {
                  const widthPct = Math.max(2, Math.round((row.arppu / maxCityArppu) * 100));
                  const rank = idx + 1;
                  const isPodium = rank <= 3;
                  return (
                    <div className={`region-arppu-row${isPodium ? " is-podium" : ""}`} key={row.city}>
                      <div className="region-arppu-head">
                        <span className={`region-rank rank-${rank}`}>{rank}</span>
                        <span className="region-name">{row.city}</span>
                        <span className="region-arppu-val">{formatCurrency(row.arppu)}</span>
                      </div>
                      <div className="region-arppu-bar-wrap">
                        <div className="region-arppu-bar" style={{ width: `${widthPct}%` }} />
                      </div>
                      <div className="region-arppu-meta">
                        <span className="region-meta-chip">
                          <span className="region-meta-label">FTDs</span>
                          <span className="region-meta-value">{row.ftdsDisplay.toLocaleString()}</span>
                        </span>
                        <span className="region-meta-chip">
                          <span className="region-meta-label">Revenue</span>
                          <span className="region-meta-value">{formatCurrency(row.revenue)}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {cityArppuTable.length > 0 ? (
              <div className="chart-insight">
                <span className="chart-insight-mark">★</span>
                <span>
                  <strong>{cityArppuTable[0].city}</strong> commands the highest ARPPU at {formatCurrency(cityArppuTable[0].arppu)}
                </span>
              </div>
            ) : null}
          </motion.div>
          </section>
        </>
      ) : null}

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("GEO Report")}</h2>
              <p className="panel-subtitle">
                {t("Performance by country for the selected filters.")}
              </p>
            </div>
          </div>
          {geoState.loading ? (
            <div className="empty-state">{t("Loading geo report…")}</div>
          ) : geoState.error ? (
            <div className="empty-state error">{geoState.error}</div>
          ) : geoTotals.length === 0 ? (
            <div className="empty-state">{t("No geo data yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table stats-table">
                <thead>
                  <tr>
                    {[
                      { key: "country", label: "Country" },
                      { key: "spend", label: "Spend" },
                      { key: "revenue", label: "Revenue" },
                      { key: "clicks", label: "Clicks" },
                      { key: "installs", label: "Installs" },
                      { key: "registers", label: "Registers" },
                      { key: "ftds", label: "FTDs" },
                      { key: "redeposits", label: "Redeposits" },
                      { key: "arppu", label: "ARPPU" },
                      { key: "ltv", label: "LTV" },
                      { key: "c2r", label: "C2R" },
                      { key: "c2ftd", label: "C2FTD" },
                      { key: "r2d", label: "R2D" },
                    ].map((col) => {
                      const isActive = geoTableSort.key === col.key;
                      const indicator = isActive
                        ? geoTableSort.dir === "asc"
                          ? "▲"
                          : "▼"
                        : "↕";
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`sortable-header ${isActive ? "active" : ""}`}
                            onClick={() => toggleGeoSort(col.key)}
                          >
                            {t(col.label)}
                            <span className="sort-indicator">{indicator}</span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedGeoTotals.map((row) => {
                    const revenueValue = row.hasRevenue ? row.revenue : null;
                    const arppu =
                      revenueValue !== null && row.ftds > 0
                        ? revenueValue / row.ftds
                        : null;
                    const ltv =
                      revenueValue !== null && row.redeposits > 0
                        ? revenueValue / row.redeposits
                        : null;
                    const c2r = toPercent(row.registers, row.clicks);
                    const c2f = toPercent(row.ftds, row.clicks);
                    const r2d = toPercent(row.ftds, row.registers);

                    return (
                      <tr key={row.country}>
                        <td>{row.country}</td>
                        <td>{row.spend ? formatCurrency(row.spend) : "—"}</td>
                        <td>{row.hasRevenue ? formatCurrency(row.revenue) : "—"}</td>
                        <td>{row.clicks.toLocaleString()}</td>
                        <td>{row.installs ? row.installs.toLocaleString() : "—"}</td>
                        <td>{row.registers.toLocaleString()}</td>
                        <td>{row.ftds.toLocaleString()}</td>
                        <td>{row.redeposits ? row.redeposits.toLocaleString() : "—"}</td>
                        <td>{fmtCost(arppu)}</td>
                        <td>{fmtCost(ltv)}</td>
                        <td>{fmtPercent(c2r)}</td>
                        <td>{fmtPercent(c2f)}</td>
                        <td>{fmtPercent(r2d)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}
