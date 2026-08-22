import React from "react";
import { PeriodSelect } from "../components/PeriodSelect.jsx";
import {
  PlacementFunnel,
  PlacementMatrix,
  PlacementQuality,
  PlacementRevenue,
  UNATTRIBUTED_PLACEMENT,
  bestBy,
  classifyPlacement,
  summarisePlacements,
} from "../components/PlacementInsights.jsx";
import { Select } from "../components/Select.jsx";
import { apiFetch } from "../lib/api.js";
import { readSwrCache, writeSwrCache } from "../lib/cache.js";
import { getPeriodDateRange, isDateInRange, normalizeDateRange } from "../lib/date.js";
import {
  isAllSelection,
  matchesBuyerFilter,
  matchesCampaignListFilter,
  matchesCountryFilter,
  normalizeFilterValue,
} from "../lib/filters.js";
import { formatCurrency } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, stagger } from "../lib/motion.js";
import { goToView } from "../lib/navigation.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { compareSortValues, getSortIndicator, toggleSortConfig } from "../lib/sort.js";
import { EMPTY_FLOW_FILTER } from "../lib/view-helpers.js";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function PlacementsDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [placementEntries, setPlacementEntries] = React.useState([]);
  const [placementState, setPlacementState] = React.useState({ loading: true, error: null });
  const [placementFilter, setPlacementFilter] = React.useState("All placements");

  const fetchPlacements = React.useCallback(async () => {
    const isoRe = /^\d{4}-\d{2}-\d{2}$/;
    const gr = normalizeDateRange(filters?.dateFrom, filters?.dateTo);
    const pr = getPeriodDateRange(period, customRange);
    const eff = gr.from || gr.to ? gr : pr;
    const qs = new URLSearchParams({ group: "placement" });
    if (isoRe.test(eff.from || "")) qs.set("from", eff.from);
    if (isoRe.test(eff.to || "")) qs.set("to", eff.to);
    const liveUrl = `/api/keitaro/live-stats?${qs.toString()}`;
    const cacheKey = `live-placements:${qs.toString()}`;
    const cached = readSwrCache(cacheKey);

    if (cached && Array.isArray(cached)) {
      setPlacementEntries(cached);
      setPlacementState({ loading: false, error: null });
    } else {
      setPlacementState({ loading: true, error: null });
    }

    try {
      let rows = null;
      // Primary path: live, placement-grained data straight from Keitaro.
      const response = await apiFetch(liveUrl);
      if (response.ok) {
        const data = await response.json();
        rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        // Fallback to the synced table when the live endpoint is unavailable.
        const fb = await apiFetch("/api/media-stats?limit=100000");
        if (!fb.ok) throw new Error("Failed to load placement stats.");
        const fbData = await fb.json();
        rows = Array.isArray(fbData) ? fbData : [];
      }
      writeSwrCache(cacheKey, rows);
      setPlacementEntries(rows);
      setPlacementState({ loading: false, error: null });
    } catch (error) {
      if (!cached) {
        setPlacementState({ loading: false, error: error.message || "Failed to load placement stats." });
      }
    }
  }, [period, customRange.from, customRange.to, filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchPlacements();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchPlacements]);

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
  const globalPlacementFilter = filters?.placementName || "All";
  const globalPlacementDomainFilter = filters?.placementDomain || "All";
  const placementMinClicksFilter = Number(filters?.placementMinClicks || 0);
  const placementMinRegistersFilter = Number(filters?.placementMinRegisters || 0);
  const placementMinFtdsFilter = Number(filters?.placementMinFtds || 0);
  const placementRevenueOnlyFilter = Boolean(filters?.placementRevenueOnly);
  const sum = (value) => Number(value || 0);
  const normalizePlacementLabel = React.useCallback((value) => {
    const rawPlacement = String(value || "").trim();
    const normalizedPlacement = rawPlacement
      .replace(/^[({\[]?sub[_\s-]*id[_\s-]*1[)\]}]?$/i, "")
      .replace(/^[({\[]?sub[_\s-]*1[)\]}]?$/i, "")
      .trim();
    if (!normalizedPlacement) return "";
    return normalizedPlacement.replace(/_/g, " ");
  }, []);
  const placementRows = React.useMemo(() => {
    return placementEntries.filter((row) => {
      if (!isDateInRange(row.date, effectiveDateRange)) return false;
      if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
        return false;
      }
      if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
      if (!matchesCampaignListFilter(row.campaign || row.campaign_name, globalFlowFilter)) return false;
      const placementLabel = normalizePlacementLabel(row.placement);
      if (
        !isAllSelection(globalPlacementFilter) &&
        !normalizeFilterValue(placementLabel).includes(normalizeFilterValue(globalPlacementFilter))
      ) {
        return false;
      }
      // No domain filter here: live-stats groups by day/campaign/country/sub_id_1
      // and carries no domain, source or site field, so any value entered would
      // match nothing and blank the section. The control is not rendered.
      //
      // The min-clicks/registers/FTDs thresholds are deliberately NOT applied
      // here. These rows are day x campaign x country x placement, so a
      // placement with 500 clicks spread over twenty 25-click rows would be
      // removed entirely by "Min Clicks 100". They are applied after
      // aggregation instead, where they mean what the label says.
      return true;
    });
  }, [
    placementEntries,
    effectiveDateRange.from,
    effectiveDateRange.to,
    globalBuyerFilter,
    globalCountryFilter,
    globalFlowFilter,
    globalPlacementFilter,
    placementRevenueOnlyFilter,
    effectiveBuyer,
    isLeadership,
    normalizePlacementLabel,
  ]);

  const placementOptions = React.useMemo(() => {
    const options = new Set();
    placementRows.forEach((row) => {
      const label = normalizePlacementLabel(row.placement);
      if (label) options.add(label);
    });
    return ["All placements", ...Array.from(options).sort((a, b) => a.localeCompare(b))];
  }, [placementRows, normalizePlacementLabel]);

  React.useEffect(() => {
    if (!placementOptions.includes(placementFilter)) {
      setPlacementFilter("All placements");
    }
  }, [placementOptions, placementFilter]);

  const placementData = React.useMemo(() => {
    const map = new Map();
    placementRows.forEach((row) => {
      // Rows with no placement were dropped here, which hid 22% of clicks and
      // real revenue from every number on the page. They are kept and labelled,
      // then separated out by summarisePlacements so they never rank as a
      // placement but are always visible as a tracking gap.
      const placement = normalizePlacementLabel(row.placement) || UNATTRIBUTED_PLACEMENT;
      if (!map.has(placement)) {
        map.set(placement, {
          placement,
          clicks: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
          spend: 0,
        });
      }
      const current = map.get(placement);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += sum(row.revenue);
      current.spend += sum(row.spend);
    });

    return Array.from(map.values())
      .map((row) => {
        const clickToReg = row.clicks > 0 ? (row.registers / row.clicks) * 100 : 0;
        const regToFtd = row.registers > 0 ? (row.ftds / row.registers) * 100 : 0;
        const ftdToRedeposit = row.ftds > 0 ? (row.redeposits / row.ftds) * 100 : 0;
        const epc = row.clicks > 0 ? row.revenue / row.clicks : 0;
        return {
          ...row,
          clickToReg,
          regToFtd,
          ftdToRedeposit,
          epc,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }, [placementRows, normalizePlacementLabel]);

  const activePlacementData = React.useMemo(() => {
    const scoped =
      placementFilter === "All placements"
        ? placementData
        : placementData.filter((row) => row.placement === placementFilter);
    // Thresholds belong here, on the aggregated placement, so "Min Clicks 100"
    // means a placement with 100 clicks rather than a single day-row with 100.
    return scoped.filter((row) => {
      if (placementMinClicksFilter > 0 && row.clicks < placementMinClicksFilter) return false;
      if (placementMinRegistersFilter > 0 && row.registers < placementMinRegistersFilter) return false;
      if (placementMinFtdsFilter > 0 && row.ftds < placementMinFtdsFilter) return false;
      if (placementRevenueOnlyFilter && row.revenue <= 0) return false;
      return true;
    });
  }, [
    placementData,
    placementFilter,
    placementMinClicksFilter,
    placementMinRegistersFilter,
    placementMinFtdsFilter,
    placementRevenueOnlyFilter,
  ]);
  const [placementTableSort, setPlacementTableSort] = React.useState({
    key: "clicks",
    dir: "desc",
  });
  const togglePlacementTableSort = (key) => {
    setPlacementTableSort((prev) => toggleSortConfig(prev, key, "desc"));
  };
  const getPlacementSortValue = (row, key) => {
    switch (key) {
      case "placement":
        return row.placement;
      case "clicks":
        return row.clicks;
      case "registers":
        return row.registers;
      case "ftds":
        return row.ftds;
      case "redeposits":
        return row.redeposits;
      case "revenue":
        return row.revenue;
      case "clickToReg":
        return row.clickToReg;
      case "regToFtd":
        return row.regToFtd;
      case "ftdToRedeposit":
        return row.ftdToRedeposit;
      case "epc":
        return row.epc;
      default:
        return null;
    }
  };
  const placementSortType = (key) => (key === "placement" ? "text" : "number");
  const sortedPlacementRows = React.useMemo(() => {
    const rows = [...activePlacementData];
    return rows.sort((a, b) =>
      compareSortValues(
        getPlacementSortValue(a, placementTableSort.key),
        getPlacementSortValue(b, placementTableSort.key),
        placementTableSort.dir,
        placementSortType(placementTableSort.key)
      )
    );
  }, [activePlacementData, placementTableSort]);

  const totals = activePlacementData.reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.clicks,
      registers: acc.registers + row.registers,
      ftds: acc.ftds + row.ftds,
      revenue: acc.revenue + row.revenue,
    }),
    { clicks: 0, registers: 0, ftds: 0, revenue: 0 }
  );

  // Splits real placements from unattributed traffic and broken values, so the
  // charts rank only things that are actually placements.
  const placementSummary = React.useMemo(
    () => summarisePlacements(activePlacementData),
    [activePlacementData]
  );
  const rankable = placementSummary.ok;

  const totalSpend = rankable.reduce((acc, row) => acc + (row.spend || 0), 0);
  const sectionRoas = totalSpend > 0 ? totals.revenue / totalSpend : null;
  // bestBy applies a minimum-volume floor: a 100%-converting placement built on
  // 2 clicks is noise, and it used to win this card outright.
  const topByRevenue = bestBy(rankable, "revenue", { minClicks: 0 });
  const bestEpc = bestBy(rankable, "epc");
  const [funnelMetric, setFunnelMetric] = React.useState("clickToReg");
  const maxRowClicks = Math.max(0, ...activePlacementData.map((row) => row.clicks || 0));
  const maxRowRevenue = Math.max(0, ...activePlacementData.map((row) => row.revenue || 0));

  const fmtPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

  return (
    <>
      <section className="cards">
        {[
          // Lead with the measure, not the placement name: a name as the
          // headline value says nothing at a glance and forces the eye down to
          // the meta line to learn how big it actually is.
          {
            label: "Tracked Placements",
            value: rankable.length.toLocaleString(),
            meta: placementSummary.unattributedClicks
              ? `${placementSummary.unattributedShare.toFixed(0)}% of clicks unattributed`
              : period === "All"
                ? "All time"
                : period,
          },
          {
            label: "Clicks",
            value: totals.clicks.toLocaleString(),
            meta: `${totals.registers.toLocaleString()} registers · ${totals.ftds.toLocaleString()} FTDs`,
          },
          {
            label: "Revenue",
            value: formatCurrency(totals.revenue),
            meta:
              sectionRoas !== null
                ? `${formatCurrency(totalSpend)} spend · ${sectionRoas.toFixed(2)}x ROAS`
                : "No spend recorded",
          },
          {
            label: "Best Revenue Per Click",
            value: bestEpc ? formatCurrency(bestEpc.epc) : "—",
            // Named in the meta with its sample size, because a rate is only
            // as trustworthy as the traffic behind it.
            meta: bestEpc
              ? `${bestEpc.placement} · ${bestEpc.clicks.toLocaleString()} clicks`
              : "No data",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stagger(idx), duration: DURATION.settle, ease: EASE }}
          >
            <div className="card-head">{t(stat.label)}</div>
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
            <div className="card-meta">{t(stat.meta)}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels device-charts placement-panels">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Volume vs Efficiency")}</h2>
              <p className="panel-subtitle">
                {t("Where size and earnings disagree. Right of centre is big, above the line earns more per click than average.")}
              </p>
            </div>
            <div className="panel-actions">
              <Select
                value={placementFilter}
                onChange={(v) => setPlacementFilter(v)}
                options={placementOptions.map((option) => ({
                  value: option,
                  label: option === "All placements" ? t(option) : option,
                }))}
                placeholder={t("All placements")}
                searchPlaceholder={t("Find placement")}
              />
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {placementState.loading ? (
            <div className="empty-state">{t("Loading placement stats…")}</div>
          ) : placementState.error ? (
            <div className="empty-state error">{placementState.error}</div>
          ) : (
            <>
              <PlacementQuality summary={placementSummary} t={t} />
              <PlacementMatrix rows={rankable} t={t} onSelect={(name) => name && setPlacementFilter(name)} />
            </>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, delay: 0.08, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Revenue by Placement")}</h2>
              <p className="panel-subtitle">{t("Revenue contribution by top placements.")}</p>
            </div>
          </div>
          {rankable.every((r) => !(r.revenue > 0)) ? (
            <div className="empty-state">{t("No revenue in this period.")}</div>
          ) : (
            <PlacementRevenue rows={rankable} t={t} />
          )}
        </motion.div>

        <motion.div
          className="panel span-2 placement-conversion"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, delay: 0.12, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Conversion by Placement")}</h2>
              <p className="panel-subtitle">
                {t("Ranked, one stage at a time. Placements under 10 clicks are excluded — their rates are noise.")}
              </p>
            </div>
            <div className="panel-actions">
              <div className="pl-switch" role="group" aria-label={t("Funnel stage")}>
                {[
                  { key: "clickToReg", label: t("Click → Reg") },
                  { key: "regToFtd", label: t("Reg → FTD") },
                  { key: "ftdToRedeposit", label: t("FTD → Redep") },
                ].map((stage) => (
                  <button
                    type="button"
                    key={stage.key}
                    className={funnelMetric === stage.key ? "is-active" : ""}
                    onClick={() => setFunnelMetric(stage.key)}
                    aria-pressed={funnelMetric === stage.key}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <PlacementFunnel rows={rankable} t={t} metric={funnelMetric} />
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Placement Breakdown")}</h2>
              <p className="panel-subtitle">{t("Detailed performance by placement (sub_id_1).")}</p>
            </div>
            <div className="summary-inline">
              <span>{t("Clicks")}: {totals.clicks.toLocaleString()}</span>
              <span>{t("Registers")}: {totals.registers.toLocaleString()}</span>
              <span>{t("FTDs")}: {totals.ftds.toLocaleString()}</span>
              <span>{t("Revenue")}: {formatCurrency(totals.revenue)}</span>
            </div>
          </div>

          {placementState.loading ? (
            <div className="empty-state">{t("Loading placement stats…")}</div>
          ) : placementState.error ? (
            <div className="empty-state error">{placementState.error}</div>
          ) : activePlacementData.length === 0 ? (
            <div className="empty-state">
              {t("No placement rows found. Check Keitaro payload dimensions and mapping for sub_id_1.")}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table pl-table">
                <thead>
                  <tr>
                    {[
                      { key: "placement", label: t("Placement") },
                      { key: "clicks", label: t("Clicks") },
                      { key: "registers", label: t("Registers") },
                      { key: "ftds", label: t("FTDs") },
                      { key: "redeposits", label: t("Redeposits") },
                      { key: "revenue", label: t("Revenue") },
                      { key: "clickToReg", label: t("Click2Reg") },
                      { key: "regToFtd", label: t("Reg2FTD") },
                      { key: "ftdToRedeposit", label: t("FTD2Redeposit") },
                      { key: "epc", label: t("EPC") },
                    ].map((col) => {
                      const isActive = placementTableSort.key === col.key;
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`sortable-header ${isActive ? "active" : ""}`}
                            onClick={() => togglePlacementTableSort(col.key)}
                          >
                            {col.label}
                            <span className="sort-indicator">
                              {getSortIndicator(placementTableSort, col.key)}
                            </span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedPlacementRows.map((row, idx) => {
                    const kind = classifyPlacement(row.placement, row.clicks);
                    // A rate needs a denominator worth trusting before it earns
                    // colour; otherwise 100% from two events outshouts a real
                    // 12% built on thousands.
                    const rate = (value, base) => {
                      const thin = base < 30;
                      return (
                        <span className={`pl-rate ${thin ? "is-thin" : value >= 10 ? "is-strong" : "is-weak"}`}>
                          {fmtPercent(value)}
                          {thin && base > 0 ? <em className="pl-flag is-muted"> n={base}</em> : null}
                        </span>
                      );
                    };
                    return (
                      <tr key={row.placement}>
                        <td>
                          <span className="pl-name">
                            <span className={`pl-rank${idx < 3 ? " is-top" : ""}`}>{idx + 1}</span>
                            <span className="pl-name-text" title={row.placement}>{row.placement}</span>
                            {kind === "unattributed" ? (
                              <span className="pl-flag">{t("tracking gap")}</span>
                            ) : kind !== "ok" ? (
                              <span className="pl-flag">{kind === "macro" ? t("unreplaced macro") : t("not a placement")}</span>
                            ) : null}
                          </span>
                        </td>
                        <td className="num">
                          <span className="pl-cell">
                            <span>{row.clicks.toLocaleString()}</span>
                            {maxRowClicks > 0 ? (
                              <span className="pl-bar is-clicks">
                                <span style={{ width: `${Math.max((row.clicks / maxRowClicks) * 100, 1)}%` }} />
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="num">{row.registers.toLocaleString()}</td>
                        <td className="num">{row.ftds.toLocaleString()}</td>
                        <td className="num">{row.redeposits.toLocaleString()}</td>
                        <td className="num">
                          <span className="pl-cell">
                            <span>{formatCurrency(row.revenue)}</span>
                            {maxRowRevenue > 0 && row.revenue > 0 ? (
                              <span className="pl-bar">
                                <span style={{ width: `${Math.max((row.revenue / maxRowRevenue) * 100, 1)}%` }} />
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="num">{rate(row.clickToReg, row.clicks)}</td>
                        <td className="num">{rate(row.regToFtd, row.registers)}</td>
                        <td className="num">{rate(row.ftdToRedeposit, row.ftds)}</td>
                        <td className="num">{formatCurrency(row.epc)}</td>
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
