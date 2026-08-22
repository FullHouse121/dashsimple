import React from "react";
import { PAGE_SIZE, Pager, usePagination } from "../components/Pager.jsx";
import { PeriodSelect } from "../components/PeriodSelect.jsx";
import { Select } from "../components/Select.jsx";
import {
  Concentration,
  CopyId,
  PlayerEconomics,
  TopPlayers,
  UserDetail,
  ValueTiers,
  buildBrandOptions,
  campaignBrand,
} from "../components/UserBehaviorInsights.jsx";
import { apiFetch } from "../lib/api.js";
import { getPeriodDateRange, normalizeDateRange } from "../lib/date.js";
import { matchesUserAggregate, matchesUserBehaviorRow } from "../lib/filters.js";
import { downloadCsv, formatCurrency } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, stagger } from "../lib/motion.js";
import { goToView } from "../lib/navigation.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { compareSortValues, getSortIndicator, toggleSortConfig } from "../lib/sort.js";
import { EMPTY_FLOW_FILTER } from "../lib/view-helpers.js";
import { motion } from "framer-motion";
import { AlertTriangle, Download } from "lucide-react";

export default function UserBehaviorDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [behaviorEntries, setBehaviorEntries] = React.useState([]);
  const [behaviorState, setBehaviorState] = React.useState({ loading: true, error: null });
  const [search, setSearch] = React.useState("");
  const [behaviorFilter, setBehaviorFilter] = React.useState("Top User By Total Revenue");

  const fetchBehavior = React.useCallback(async () => {
    try {
      setBehaviorState({ loading: true, error: null });
      // Aggregate server-side over the active window: a global date filter wins,
      // otherwise the selected period. Without a range the server defaults to the
      // last 30 days. This is what stops the view from only ever seeing the most
      // recent day now that the table holds millions of rows.
      const periodRange = getPeriodDateRange(period, customRange);
      const globalRange = normalizeDateRange(filters?.dateFrom, filters?.dateTo);
      const range = globalRange.from || globalRange.to ? globalRange : periodRange;
      const params = new URLSearchParams({ limit: "50000" });
      if (range.from) params.set("from", range.from);
      if (range.to) params.set("to", range.to);
      const response = await apiFetch(`/api/user-behavior?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load user behavior.");
      }
      const data = await response.json();
      setBehaviorEntries(Array.isArray(data) ? data : []);
      setBehaviorState({ loading: false, error: null });
    } catch (error) {
      setBehaviorState({ loading: false, error: error.message || "Failed to load user behavior." });
    }
  }, [period, customRange.from, customRange.to, filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    fetchBehavior();
  }, [fetchBehavior]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchBehavior();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchBehavior]);

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
  const globalUserCampaignFilter = filters?.userCampaign || "All";
  const globalUserExternalIdFilter = filters?.userExternalId || "";
  const globalUserMinRevenue = Number(filters?.userMinRevenue || 0);
  const globalUserMinFtds = Number(filters?.userMinFtds || 0);
  const globalUserMinRedeposits = Number(filters?.userMinRedeposits || 0);
  const globalUserRevenueOnly = Boolean(filters?.userRevenueOnly);
  // statsBrand/statsGame/statsTool and the stats thresholds are Statistics-only
  // controls (rendered behind isStats); this view has its own brand filter.

  const normalizedSearch = search.trim().toLowerCase();
  const sum = (value) => Number(value || 0);

  const behaviorRows = React.useMemo(
    () =>
      behaviorEntries.filter((row) =>
        matchesUserBehaviorRow(row, {
          dateRange: effectiveDateRange,
          buyer: globalBuyerFilter,
          country: globalCountryFilter,
          flows: globalFlowFilter,
          campaign: globalUserCampaignFilter,
          viewerBuyer: effectiveBuyer,
          isLeadership,
        })
      ),
    [
      behaviorEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      globalFlowFilter,
      globalUserCampaignFilter,
      effectiveBuyer,
      isLeadership,
    ]
  );

  // Brand lives in the last segment of "Buyer | Tool | Game | Geo | Brand", so
  // it is filtered on the raw rows before per-player aggregation — otherwise a
  // player active on two brands would carry both brands' revenue into either.
  const [brandFilter, setBrandFilter] = React.useState("All");
  const brandOptions = React.useMemo(
    () => [{ value: "All", label: t("All brands") }, ...buildBrandOptions(behaviorRows)],
    [behaviorRows, t]
  );
  const brandedRows = React.useMemo(
    () =>
      brandFilter === "All"
        ? behaviorRows
        : behaviorRows.filter((row) => campaignBrand(row.campaign) === brandFilter),
    [behaviorRows, brandFilter]
  );

  // Spend lives in media_stats, not user_behavior, and the comparison window
  // needs a second aggregation — both are cheaper to do in SQL than to ship two
  // periods of rows to the browser.
  const [economics, setEconomics] = React.useState(null);
  const [economicsLoading, setEconomicsLoading] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (effectiveDateRange.from) params.set("from", effectiveDateRange.from);
    if (effectiveDateRange.to) params.set("to", effectiveDateRange.to);
    if (brandFilter && brandFilter !== "All") params.set("brand", brandFilter);
    setEconomicsLoading(true);
    apiFetch(`/api/user-behavior/economics?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("economics"))))
      .then((data) => {
        if (!cancelled) setEconomics(data);
      })
      .catch(() => {
        // Leave the row on its client-side maths rather than blanking it.
        if (!cancelled) setEconomics(null);
      })
      .finally(() => {
        if (!cancelled) setEconomicsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveDateRange.from, effectiveDateRange.to, brandFilter]);

  const userData = React.useMemo(() => {
    const map = new Map();
    brandedRows.forEach((row) => {
      const externalId = String(row.external_id || row.externalId || "").trim();
      if (!externalId) return;
      if (!map.has(externalId)) {
        map.set(externalId, {
          externalId,
          buyer: row.buyer || "",
          campaign: "",
          clicks: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
          ftdRevenue: 0,
          redepositRevenue: 0,
          campaigns: new Map(),
        });
      }
      const current = map.get(externalId);
      const ftdRevenueValue = Number.isFinite(Number(row.ftd_revenue ?? row.ftdRevenue))
        ? Number(row.ftd_revenue ?? row.ftdRevenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redeposit_revenue ?? row.redepositRevenue)
      )
        ? Number(row.redeposit_revenue ?? row.redepositRevenue)
        : 0;
      const rowRevenueValue = Number.isFinite(Number(row.revenue)) ? Number(row.revenue) : 0;
      const revenueValue = rowRevenueValue > 0 ? rowRevenueValue : ftdRevenueValue + redepositRevenueValue;

      const campaign = String(row.campaign || "").trim();
      if (campaign) {
        const existing = current.campaigns.get(campaign) || 0;
        current.campaigns.set(campaign, existing + (revenueValue || 0));
      }

      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += revenueValue || 0;
      current.ftdRevenue += ftdRevenueValue || 0;
      current.redepositRevenue += redepositRevenueValue || 0;
    });

    return Array.from(map.values())
      .map((row) => {
        let topCampaign = "";
        let topValue = -1;
        row.campaigns.forEach((value, key) => {
          if (value > topValue) {
            topValue = value;
            topCampaign = key;
          }
        });
        return {
          ...row,
          campaign: topCampaign || row.campaign,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [brandedRows]);

  const filteredUsers = React.useMemo(() => {
    return userData.filter((row) =>
      matchesUserAggregate(row, {
        search: normalizedSearch,
        externalId: globalUserExternalIdFilter,
        minRevenue: globalUserMinRevenue,
        minFtds: globalUserMinFtds,
        minRedeposits: globalUserMinRedeposits,
        revenueOnly: globalUserRevenueOnly,
      })
    );
  }, [
    userData,
    normalizedSearch,
    globalUserExternalIdFilter,
    globalUserMinRevenue,
    globalUserMinFtds,
    globalUserMinRedeposits,
    globalUserRevenueOnly,
  ]);
  const [userTableSort, setUserTableSort] = React.useState({ key: "revenue", dir: "desc" });
  const toggleUserTableSort = (key) => {
    setUserTableSort((prev) => toggleSortConfig(prev, key, "desc"));
  };
  const getUserSortValue = (row, key) => {
    switch (key) {
      case "externalId":
        return row.externalId;
      case "campaign":
        return row.campaign;
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
      default:
        return null;
    }
  };
  const userSortType = (key) =>
    key === "externalId" || key === "campaign" ? "text" : "number";
  // Tier filter narrows every panel below it, so the charts and the table always
  // describe the same set of players as the strip you just clicked. Declared
  // above the table memos on purpose — they consume it.
  const [activeTier, setActiveTier] = React.useState(null);
  const [openUserId, setOpenUserId] = React.useState(null);
  const tieredUsers = React.useMemo(() => {
    if (!activeTier) return filteredUsers;
    return filteredUsers.filter((row) => {
      const deposits = (row.ftds || 0) + (row.redeposits || 0);
      if (activeTier === "repeat") return deposits >= 2;
      if (activeTier === "ftd") return deposits === 1;
      if (activeTier === "registered") return deposits === 0 && (row.registers || 0) > 0;
      return deposits === 0 && (row.registers || 0) === 0;
    });
  }, [filteredUsers, activeTier]);
  const maxUserRevenue = React.useMemo(
    () => tieredUsers.reduce((acc, row) => Math.max(acc, row.revenue || 0), 0),
    [tieredUsers]
  );

  const sortedUserTableRows = React.useMemo(() => {
    const rows = [...tieredUsers];
    return rows.sort((a, b) =>
      compareSortValues(
        getUserSortValue(a, userTableSort.key),
        getUserSortValue(b, userTableSort.key),
        userTableSort.dir,
        userSortType(userTableSort.key)
      )
    );
  }, [tieredUsers, userTableSort]);
  // Pagination comes from components/Pager.jsx — this view had its own copy of
  // the same clamp/window/page-list logic, which is exactly what that module
  // was extracted to stop.
  const UB_PAGE_SIZE = PAGE_SIZE;
  const ubPagination = usePagination(sortedUserTableRows.length, UB_PAGE_SIZE);
  const ubClampedPage = ubPagination.page;
  const ubPageCount = ubPagination.pageCount;
  const pagedUserTableRows = React.useMemo(
    () => sortedUserTableRows.slice(ubPagination.from, ubPagination.to),
    [sortedUserTableRows, ubPagination.from, ubPagination.to]
  );

  // Exports what is on screen — every filter applied, sorted as displayed, and
  // all pages rather than the current one. Brand is resolved out of the
  // campaign string so the file pivots without further parsing.
  const exportUsers = () => {
    downloadCsv(
      `user-behavior-${brandFilter === "All" ? "all-brands" : brandFilter.toLowerCase()}-${
        effectiveDateRange.from || "start"
      }_${effectiveDateRange.to || "today"}.csv`,
      [
        "External ID",
        "Buyer",
        "Brand",
        "Top campaign",
        "Tier",
        "Clicks",
        "Registers",
        "FTDs",
        "Redeposits",
        "Revenue",
        "FTD revenue",
        "Redeposit revenue",
        "Revenue per click",
      ],
      sortedUserTableRows.map((row) => {
        const deposits = (row.ftds || 0) + (row.redeposits || 0);
        return [
          row.externalId,
          row.buyer || "",
          campaignBrand(row.campaign) || "",
          row.campaign || "",
          deposits >= 2
            ? "Repeat depositor"
            : deposits === 1
              ? "First deposit"
              : (row.registers || 0) > 0
                ? "Registered"
                : "Clicked only",
          row.clicks || 0,
          row.registers || 0,
          row.ftds || 0,
          row.redeposits || 0,
          Number(row.revenue || 0).toFixed(2),
          Number(row.ftdRevenue || 0).toFixed(2),
          Number(row.redepositRevenue || 0).toFixed(2),
          row.clicks > 0 ? (Number(row.revenue || 0) / row.clicks).toFixed(4) : "",
        ];
      })
    );
  };

  const behaviorFilterOptions = [
    "Tracked Users",
    "Top User By Total Revenue",
    "Top User by Revenue FTD",
    "Top User By Redeposit (number)",
  ];

  const sortedUsers = React.useMemo(() => {
    const rows = [...filteredUsers];
    const sortBy = behaviorFilter;
    const valueFor = (row) => {
      switch (sortBy) {
        case "Top User by Revenue FTD":
          return row.ftdRevenue || 0;
        case "Top User By Redeposit (number)":
          return row.redeposits || 0;
        case "Tracked Users":
        case "Top User By Total Revenue":
        default:
          return row.revenue || 0;
      }
    };
    return rows.sort((a, b) => valueFor(b) - valueFor(a));
  }, [filteredUsers, behaviorFilter]);

  const totalUsers = filteredUsers.length;
  const topByRevenue = [...filteredUsers].sort((a, b) => b.revenue - a.revenue)[0] || null;
  const topByFtdRevenue = [...filteredUsers].sort((a, b) => b.ftdRevenue - a.ftdRevenue)[0] || null;
  const topByRedeposit = [...filteredUsers].sort((a, b) => b.redeposits - a.redeposits)[0] || null;

  const topUsers = sortedUsers.slice(0, 10).map((row) => ({
    ...row,
    label: row.externalId.length > 12 ? `${row.externalId.slice(0, 12)}…` : row.externalId,
  }));

  // The dropdown beside the search box ranks the chart. It has to map to the
  // measure TopPlayers sorts and labels by, or it renders a control that looks
  // live and does nothing.
  const TOP_PLAYERS_METRIC = {
    "Top User By Total Revenue": "revenue",
    "Top User by Revenue FTD": "ftdRevenue",
    "Top User By Redeposit (number)": "redeposits",
    "Tracked Users": "clicks",
  };
  const topPlayersMetric = TOP_PLAYERS_METRIC[behaviorFilter] || "revenue";

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Tracked Users",
            value: totalUsers.toLocaleString(),
            meta: period === "All" ? "All time" : period,
          },
          // The three "top user" cards used to headline the external ID — a
          // 16-character hash rendered at display size, which is unreadable and
          // says nothing at a glance. Lead with the amount; the ID moves to a
          // copyable chip, which is what anyone actually wants to do with it.
          {
            label: "Top User By Total Revenue",
            value: topByRevenue ? formatCurrency(topByRevenue.revenue) : "—",
            meta: topByRevenue ? "FTD + Redeposit" : "No data",
            user: topByRevenue,
          },
          {
            label: "Top User by Revenue FTD",
            value: topByFtdRevenue ? formatCurrency(topByFtdRevenue.ftdRevenue) : "—",
            meta: topByFtdRevenue ? "First deposits only" : "No data",
            user: topByFtdRevenue,
          },
          {
            label: "Top User By Redeposit (number)",
            value: topByRedeposit ? topByRedeposit.redeposits.toLocaleString() : "—",
            meta: topByRedeposit ? "Redeposits" : "No data",
            user: topByRedeposit,
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
            {stat.user ? (
              <div className="card-meta ub-card-meta">
                {/* full: cards have the width, and a truncated hash is the one
                    thing here nobody can act on. */}
                <CopyId value={stat.user.externalId} full />
                <span>{t(stat.meta)}</span>
              </div>
            ) : stat.meta ? (
              <div className="card-meta">{t(stat.meta)}</div>
            ) : null}
          </motion.div>
        ))}
      </section>

      {!behaviorState.loading && !behaviorState.error && filteredUsers.length > 0 ? (
        <motion.section
          className="panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Player Mix & Economics")}</h2>
              <p className="panel-subtitle">
                {t("What a player is worth and how far they got. Brand narrows the whole section; a tier narrows everything below.")}
              </p>
            </div>
            <div className="panel-actions">
              <Select
                value={brandFilter}
                onChange={setBrandFilter}
                options={brandOptions}
                placeholder={t("All brands")}
                searchPlaceholder={t("Find brand")}
                // .country-select-menu is left:0;right:0, so the menu inherits
                // the trigger's width — and this trigger is compact enough to
                // clip "BETORSPINBR" to "BETOR".
                className="ub-brand-select"
              />
            </div>
          </div>
          <ValueTiers
            users={filteredUsers}
            t={t}
            activeTier={activeTier}
            onSelectTier={setActiveTier}
          />
          <PlayerEconomics
            users={tieredUsers}
            economics={economics}
            loading={economicsLoading}
            t={t}
            periodLabel={period === "All" ? "" : period}
            priorLabel={
              economics?.prior?.from
                ? `${economics.prior.from} → ${economics.prior.to}`
                : ""
            }
          />
        </motion.section>
      ) : null}

      <section className="panels device-charts ub-panels">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Top Players")}</h2>
              <p className="panel-subtitle">{t("Highest revenue first. Select one to open its detail.")}</p>
            </div>
            <div className="panel-actions">
              <input
                className="inline-input"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search ID or campaign")}
              />
              <Select
                value={behaviorFilter}
                onChange={(v) => setBehaviorFilter(v)}
                options={behaviorFilterOptions.map((option) => ({ value: option, label: t(option) }))}
                placeholder={t("Filter")}
                searchPlaceholder={t("Find")}
              />
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {behaviorState.loading ? (
            <div className="empty-state">{t("Loading user behavior…")}</div>
          ) : behaviorState.error ? (
            <div className="empty-state error">{behaviorState.error}</div>
          ) : topUsers.length === 0 ? (
            <div className="empty-state">{t("No user behavior data available.")}</div>
          ) : (
            <TopPlayers
              users={tieredUsers}
              t={t}
              metric={topPlayersMetric}
              onSelect={(row) => setOpenUserId(row?.externalId || null)}
            />
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
              <h2 className="panel-title">{t("Revenue Concentration")}</h2>
              <p className="panel-subtitle">{t("How much of the revenue rests on how few players.")}</p>
            </div>
          </div>
          {topUsers.length === 0 ? (
            <div className="empty-state">{t("No conversion data available.")}</div>
          ) : (
            <Concentration users={tieredUsers} t={t} />
          )}
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
              <h2 className="panel-title">{t("User Behavior")}</h2>
              <p className="panel-subtitle">
                {t("External ID performance and campaign attribution.")}{" "}
                {/* Says once, where it is read, why a depositor's Registers
                    cell is usually a dash — and that the column is real data
                    reachable by sorting, not a column that is always empty. */}
                <span className="offer-muted">
                  {t("A click ID ties a player's first deposit to their redeposits. Registrations usually arrive on an earlier click, so depositors rarely show one here — sort by Registers to see the players who do.")}
                </span>
              </p>
            </div>
            <div className="panel-actions">
              {/* Same treatment as the Accounts Registry export, rather than
                  the class name I made up, which matched no rule and rendered
                  as an unstyled browser button. */}
              <button
                type="button"
                className="ghost registry-export-btn"
                onClick={exportUsers}
                disabled={!sortedUserTableRows.length}
              >
                <Download size={14} />
                {t("Export CSV")}
              </button>
            </div>
          </div>

          {behaviorState.loading ? (
            <div className="empty-state">{t("Loading user behavior…")}</div>
          ) : behaviorState.error ? (
            <div className="empty-state error">{behaviorState.error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">{t("No user behavior data available.")}</div>
          ) : (
            <>
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th className="ub-rank-col" aria-label={t("Rank")} />
                    {[
                      { key: "externalId", label: t("External ID") },
                      { key: "campaign", label: t("Campaign") },
                      { key: "clicks", label: t("Clicks") },
                      { key: "registers", label: t("Registers") },
                      { key: "ftds", label: t("FTDs") },
                      { key: "redeposits", label: t("Redeposits") },
                      { key: "revenue", label: t("Revenue") },
                    ].map((col) => {
                      const isActive = userTableSort.key === col.key;
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`sortable-header ${isActive ? "active" : ""}`}
                            onClick={() => toggleUserTableSort(col.key)}
                          >
                            {col.label}
                            <span className="sort-indicator">
                              {getSortIndicator(userTableSort, col.key)}
                            </span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pagedUserTableRows.map((row, idx) => {
                    const rank = (ubClampedPage - 1) * UB_PAGE_SIZE + idx + 1;
                    const share = maxUserRevenue > 0 ? (row.revenue || 0) / maxUserRevenue : 0;
                    return (
                      <tr
                        key={row.externalId}
                        className="ub-row-click"
                        onClick={() => setOpenUserId(row.externalId)}
                        // A clickable <tr> is unreachable by keyboard on its
                        // own; without these the drawer is mouse-only.
                        tabIndex={0}
                        role="button"
                        aria-label={`${t("Open player detail")} ${row.externalId}`}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setOpenUserId(row.externalId);
                          }
                        }}
                        title={t("Open player detail")}
                      >
                        <td>
                          <span className={`ub-rank${rank <= 3 ? " is-top" : ""}`}>{rank}</span>
                        </td>
                        <td>
                          <CopyId value={row.externalId} />
                        </td>
                        <td>{row.campaign || "—"}</td>
                        <td>{row.clicks.toLocaleString()}</td>
                        {/* A deposit proves a registration happened, but the
                            registration postback lands on an earlier click with
                            a different sub_id, so the tracker holds no
                            registration against THIS player. Checked across a
                            full year: of 40 sub_ids that received an FTD, zero
                            carried a registration. Printing "0" beside a real
                            deposit asserts something false; "—" says the honest
                            thing, which is that it cannot be seen from here.
                            Registration totals per buyer and per campaign are
                            sound — Statistics, Campaigns and Goals. */}
                        <td>
                          {row.registers > 0 ? (
                            row.registers.toLocaleString()
                          ) : row.ftds > 0 || row.redeposits > 0 ? (
                            <span
                              className="offer-muted"
                              title={t("This player deposited, so they registered — but the registration postback arrived on a different click, so the tracker holds no registration against this ID. Per-buyer and per-campaign registration totals are unaffected.")}
                            >
                              —
                            </span>
                          ) : (
                            "0"
                          )}
                        </td>
                        <td>{row.ftds.toLocaleString()}</td>
                        <td>{row.redeposits.toLocaleString()}</td>
                        <td>
                          {/* The bar is relative to the top earner in view, so
                              scale reads at a glance without another column. */}
                          <span className="ub-revcell">
                            <span>{formatCurrency(row.revenue)}</span>
                            {share > 0 ? (
                              <span className="ub-revbar">
                                <span style={{ width: `${Math.max(share * 100, 2)}%` }} />
                              </span>
                            ) : null}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager
              page={ubPagination.page}
              pageCount={ubPagination.pageCount}
              pageList={ubPagination.pageList}
              setPage={ubPagination.setPage}
              from={ubPagination.from}
              shown={pagedUserTableRows.length}
              total={sortedUserTableRows.length}
              noun={t("players")}
            />
            </>
          )}
        </motion.div>
      </section>

      {/* Fetches the raw per-day rows for one player; behaviorRows is only the
          fallback, since the list endpoint returns MAX(date) rather than a
          series and carries no city/device. */}
      <UserDetail
        externalId={openUserId}
        rows={behaviorRows}
        range={effectiveDateRange}
        fetcher={apiFetch}
        onClose={() => setOpenUserId(null)}
        t={t}
      />
    </>
  );
}
