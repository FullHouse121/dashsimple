import React from "react";
import { CountryDropdownPicker, DeusDatePicker, Select } from "../components/Select.jsx";
import { GoalIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { approachOptions, buyerOptions, countryOptions, defaultCountryOption } from "../lib/constants.js";
import { formatCurrency, formatCurrencyWhole, formatPercent } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, rowMotion } from "../lib/motion.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { formatGoalRange } from "../lib/view-helpers.js";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Plus, Target, Trash2 } from "lucide-react";

export default function GoalsDashboard({ authUser }) {
  const { t } = useLanguage();
  const [goalForm, setGoalForm] = React.useState({
    buyer: "DeusInsta",
    country: defaultCountryOption,
    period: "Monthly",
    dateFrom: "2026-02-01",
    dateTo: "2026-02-28",
    ftdsTarget: "",
    r2dTarget: "",
    revenueTarget: "",
    isGlobal: false,
    notes: "",
  });
  const [goals, setGoals] = React.useState([]);
  const [goalState, setGoalState] = React.useState({ loading: true, error: null });
  const [statsEntries, setStatsEntries] = React.useState([]);
  const [teamForm, setTeamForm] = React.useState({
    name: "",
    role: "Media Buyer",
    country: defaultCountryOption,
    approach: "Paid Social",
    game: "",
    email: "",
    contact: "",
    status: "Active",
    tag: "",
    keitaro_name: "",
  });
  const [teamMembers, setTeamMembers] = React.useState([]);
  const [teamState, setTeamState] = React.useState({ loading: true, error: null });
  const [statusFilter, setStatusFilter] = React.useState("all");
  // Setting a target is an occasional act; reading them is a daily one. A
  // tab keeps the form one click away without it occupying the page.
  const [goalTab, setGoalTab] = React.useState("targets");

  const updateGoalForm = (key) => (event) => {
    setGoalForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const updateTeamForm = (key) => (event) => {
    setTeamForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetGoalForm = () => {
    setGoalForm({
      buyer: "DeusInsta",
      country: defaultCountryOption,
      period: "Monthly",
      dateFrom: "2026-02-01",
      dateTo: "2026-02-28",
      ftdsTarget: "",
      r2dTarget: "",
      revenueTarget: "",
      isGlobal: false,
      notes: "",
    });
  };

  // Period → Date range auto-fill helper
  // When user picks "Daily/Weekly/Monthly", auto-fill the date range to the current period.
  // "Custom" leaves dates as-is so user can pick freely.
  const applyPeriodRange = (period) => {
    const today = new Date();
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let from = null, to = null;
    if (period === "Daily") {
      from = today; to = today;
    } else if (period === "Weekly") {
      // Monday-Sunday of the current week
      const dayIdx = today.getDay(); // 0=Sun..6=Sat
      const mondayOffset = dayIdx === 0 ? -6 : 1 - dayIdx;
      const monday = new Date(today); monday.setDate(monday.getDate() + mondayOffset);
      const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
      from = monday; to = sunday;
    } else if (period === "Monthly") {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0); // last day of month
    } else {
      return null; // Custom — don't change
    }
    return { from: fmt(from), to: fmt(to) };
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: "",
      role: "Media Buyer",
      country: defaultCountryOption,
      approach: "Paid Social",
      game: "",
      email: "",
      contact: "",
      status: "Active",
      tag: "",
      keitaro_name: "",
    });
  };

  const fetchGoals = React.useCallback(async () => {
    try {
      setGoalState({ loading: true, error: null });
      const response = await apiFetch("/api/goals?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load goals.");
      }
      const data = await response.json();
      setGoals(data);
      setGoalState({ loading: false, error: null });
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to load goals." });
    }
  }, []);

  const fetchGoalStats = React.useCallback(async () => {
    try {
      const response = await apiFetch("/api/media-stats?limit=500");
      if (!response.ok) return;
      const data = await response.json();
      setStatsEntries(data);
    } catch (error) {
      setStatsEntries([]);
    }
  }, []);

  const fetchTeamMembers = React.useCallback(async () => {
    try {
      setTeamState({ loading: true, error: null });
      const response = await apiFetch("/api/media-buyers?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load media buyers.");
      }
      const data = await response.json();
      setTeamMembers(data);
      setTeamState({ loading: false, error: null });
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to load media buyers." });
    }
  }, []);

  React.useEffect(() => {
    fetchGoals();
    fetchGoalStats();
    fetchTeamMembers();
  }, [fetchGoals, fetchGoalStats, fetchTeamMembers]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchGoalStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchGoalStats]);

  const handleGoalSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save goal.");
      }
      await fetchGoals();
      resetGoalForm();
      // Back to the list: the question after saving is "did it land, and where
      // does it sit" — which the Targets tab answers and this form cannot.
      setGoalTab("targets");
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to save goal." });
    }
  };

  const handleTeamSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/media-buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save media buyer.");
      }
      await fetchTeamMembers();
      resetTeamForm();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to save media buyer." });
    }
  };

  const handleGoalDuplicate = (goal) => {
    // Shift dates forward by one period length so leadership can roll forward easily.
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let nextFrom = goal.date_from;
    let nextTo = goal.date_to;
    const from = goal.date_from ? new Date(`${goal.date_from}T00:00:00`) : null;
    const to = goal.date_to ? new Date(`${goal.date_to}T00:00:00`) : null;
    if (from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      const days = Math.round((to - from) / 86400000) + 1;
      const newFrom = new Date(to);
      newFrom.setDate(newFrom.getDate() + 1);
      const newTo = new Date(newFrom);
      newTo.setDate(newTo.getDate() + days - 1);
      nextFrom = fmt(newFrom);
      nextTo = fmt(newTo);
    }
    setGoalForm({
      isGlobal: !!goal.is_global,
      buyer: goal.buyer || "",
      country: goal.country || "",
      period: goal.period || "Monthly",
      dateFrom: nextFrom || "",
      dateTo: nextTo || "",
      ftdsTarget: goal.ftds_target ? String(goal.ftds_target) : "",
      revenueTarget: goal.revenue_target ? String(goal.revenue_target) : "",
      r2dTarget: goal.r2d_target ? String(goal.r2d_target) : "",
      notes: goal.notes || "",
    });
    // Smooth-scroll to the form so leadership sees the prefilled values.
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const formEl = document.querySelector(".goals-form");
        if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const handleGoalDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete goal.");
      }
      await fetchGoals();
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to delete goal." });
    }
  };

  const handleTeamDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/media-buyers/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete media buyer.");
      }
      await fetchTeamMembers();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to delete media buyer." });
    }
  };

  const sum = (value) => Number(value || 0);
  const inRange = (date, from, to) => {
    if (!date || !from || !to) return false;
    return date >= from && date <= to;
  };

  // The server now aggregates a goal's actuals over every stats row it has.
  // The browser only ever held the 500 most recent, so a goal wider than a few
  // days of one buyer was reporting a floor, not a total. Prefer the server's
  // figure; keep the local sum so a stale deploy still renders progress.
  const totalsForGoal = (goal, viewerBuyer) =>
    goal.actuals || legacyTotalsForGoal(goal, viewerBuyer);

  const legacyTotalsForGoal = (goal, viewerBuyer) =>
    statsEntries
      .filter((row) => {
        if (!inRange(row.date, goal.date_from, goal.date_to)) return false;
        if (goal.country && row.country !== goal.country) return false;
        if (goal.is_global) {
          if (viewerBuyer) return row.buyer === viewerBuyer;
          return true;
        }
        return row.buyer === goal.buyer;
      })
      .reduce(
        (acc, row) => ({
          clicks: acc.clicks + sum(row.clicks),
          registers: acc.registers + sum(row.registers),
          ftds: acc.ftds + sum(row.ftds),
          spend: acc.spend + sum(row.spend),
        }),
        { clicks: 0, registers: 0, ftds: 0, spend: 0 }
      );

  const formatProgress = (actual, target) => {
    if (actual === null || actual === undefined || !target || Number(target) <= 0)
      return { label: "—", pct: null };
    const pct = Math.min(100, (actual / Number(target)) * 100);
    return { label: `${pct.toFixed(1)}%`, pct };
  };

  const buyerDirectoryOptions = Array.from(
    new Set([...buyerOptions, ...teamMembers.map((member) => member.name).filter(Boolean)])
  );
  const mediaBuyerApproaches = approachOptions.filter((item) => item !== "All");
  const currentRole = authUser?.role || "Media Buyer";
  const isLeadership = isLeadershipRole(currentRole);
  const buyerId = authUser?.buyerId;
  const buyerNameFromId = teamMembers.find((member) => member.id === buyerId)?.name;
  const viewerBuyer = buyerNameFromId || authUser?.username || "";
  const displayGoals = goals
    .filter((goal) => {
      if (isLeadership) return true;
      if (goal.is_global) return true;
      if (!viewerBuyer) return false;
      return goal.buyer === viewerBuyer;
    })
    .sort((a, b) => (b.is_global ? 1 : 0) - (a.is_global ? 1 : 0));

  const getGoalProgress = (goal) => {
    const totals = totalsForGoal(goal, goal.is_global && !isLeadership ? viewerBuyer : null);
    const ftdProgress = formatProgress(totals.ftds, goal.ftds_target);
    const r2dActual = totals.registers > 0 ? (totals.ftds / totals.registers) * 100 : null;
    const r2dProgress = formatProgress(r2dActual, goal.r2d_target);

    // What those FTDs are worth at market price, valued per country on the
    // server. Deliberately kept out of the ring below: value is FTDs × rate,
    // so counting it there would weight FTDs twice and make the headline
    // percentage move when a rate changed rather than when the work did.
    const market = goal.market || null;
    const marketProgress = formatProgress(market?.value ?? null, market?.targetValue);
    // The headline is progress toward the FTD target — the thing the goal is
    // named after. It used to average FTD% with Reg2Dep%, which meant a buyer
    // who had hit 100% of the deposits they were asked for could read "47% ·
    // at risk" because their conversion rate was mid. A goal set only on
    // Reg2Dep still measures on Reg2Dep; nothing else is blended in.
    const overall = ftdProgress.pct !== null ? ftdProgress.pct : r2dProgress.pct;

    // Where the period stands, for the one line a buyer reads first. Exact
    // dates say when; "16 days left" says how much rope is left, which is the
    // question they are actually asking.
    const timing = (() => {
      const day = 86400000;
      const start = goal.date_from ? new Date(`${goal.date_from}T00:00:00`) : null;
      const end = goal.date_to ? new Date(`${goal.date_to}T00:00:00`) : null;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
      const raw = new Date();
      const now = new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
      const totalDays = Math.max(1, Math.round((end - start) / day) + 1);
      if (now < start) {
        const startsIn = Math.ceil((start - now) / day);
        return {
          state: "pending", totalDays, elapsedDays: 0, daysLeft: totalDays, startsIn,
          label: `${t("starts in")} ${startsIn} ${startsIn === 1 ? t("day") : t("days")}`,
        };
      }
      const capped = now > end ? end : now;
      const elapsedDays = Math.max(1, Math.round((capped - start) / day) + 1);
      const daysLeft = Math.max(0, totalDays - elapsedDays);
      if (now > end) return { state: "ended", totalDays, elapsedDays, daysLeft: 0, label: t("period ended") };
      return {
        state: "running", totalDays, elapsedDays, daysLeft,
        label: `${daysLeft} ${daysLeft === 1 ? t("day") : t("days")} ${t("left")}`,
      };
    })();

    // Whether the goal will be MET — which depends on how much of the period
    // is left, not on how much of the target is done. Judging status on raw
    // completion made every mid-month card read "behind" at 53% with 16 days
    // still to run, while the card's own forecast line underneath said "on
    // track to reach 40". One computation now answers both.
    const forecast = (() => {
      const target = Number(goal.ftds_target || 0);
      if (!timing || timing.state === "pending" || target <= 0) return null;
      const actual = Number(totals.ftds || 0);
      const currentPace = actual / timing.elapsedDays;
      const requiredPace = timing.daysLeft > 0 ? Math.max(0, (target - actual) / timing.daysLeft) : 0;
      const ended = timing.state === "ended";
      const projected = ended ? actual : currentPace * timing.totalDays;
      const projectedPct = (projected / target) * 100;
      const achieved = actual >= target;
      return {
        target, actual, currentPace, requiredPace, projected, projectedPct, achieved, ended,
        daysLeft: timing.daysLeft, totalDays: timing.totalDays,
        state: achieved
          ? "achieved"
          : projectedPct >= 100
            ? "on-track"
            : projectedPct >= 70
              ? "at-risk"
              : "behind",
      };
    })();

    const status = forecast
      ? forecast.state
      : overall === null
        ? "none"
        : overall >= 100
          ? "achieved"
          : overall >= 80
            ? "on-track"
            : overall >= 60
              ? "at-risk"
              : "behind";
    const statusLabel =
      status === "none"
        ? t("No targets")
        : status === "achieved"
          ? t("Achieved")
          : status === "on-track"
            ? t("On track")
            : status === "at-risk"
              ? t("At risk")
              : t("Behind");

    return { totals, ftdProgress, r2dActual, r2dProgress, overall, statusLabel, status, market, marketProgress, timing, forecast };
  };

  const goalSummary = React.useMemo(() => {
    return displayGoals.reduce(
      (acc, goal) => {
        const { overall } = getGoalProgress(goal);
        if (overall !== null && overall >= 100) {
          acc.achieved += 1;
        } else {
          acc.unachieved += 1;
        }
        return acc;
      },
      { achieved: 0, unachieved: 0 }
    );
  }, [displayGoals, statsEntries, isLeadership, viewerBuyer]);


  // The team's shared target renders as a card: it is one thing, and it is
  // the context every individual target sits inside. Individual targets are
  // a list you compare down a column, which is a table's job — so the card
  // is reused rather than duplicated for the one goal that still wants it.
  const renderGoalCard = ({ goal, info }) => {
    const { totals, ftdProgress, r2dActual, r2dProgress, overall, statusLabel, status, market, marketProgress, timing, forecast } = info;
    const statusClass = `status-${status}`;
    return (
    <div key={goal.id} className={`goal-card ${statusClass}${goal.is_global ? " is-global" : ""}`}>
      <div className="goal-head">
        <div className="goal-head-text">
          <div className="goal-title">
            {goal.is_global ? t("Global Goal") : goal.buyer}
          </div>
          <div className="goal-sub">
            {[
              t(goal.period),
              goal.country || t("All Countries"),
              formatGoalRange(goal.date_from, goal.date_to),
              timing?.label,
              goal.is_global && !isLeadership ? t("Based on your metrics") : null,
            ].filter(Boolean).join(" · ")}
          </div>
        </div>
        {/* One status signal. The left rail carries the same state
            in colour, so a second "behind pace" pill next to a
            "BEHIND" pill only competed with it. */}
        <div className="goal-actions">
          <span className={`goal-status ${status}`}>{statusLabel}</span>
          {isLeadership ? (
            <>
              <button
                className="icon-btn"
                type="button"
                title={t("Duplicate goal")}
                onClick={() => handleGoalDuplicate(goal)}
              >
                <Copy size={16} />
              </button>
              <button
                className="icon-btn"
                type="button"
                title={t("Delete goal")}
                onClick={() => handleGoalDelete(goal.id)}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* The headline: one ring, one number, the target it is
          measured against. Everything else on the card supports
          this rather than competing with it. */}
      <div className="goal-primary">
        <div
          className={`goal-ring${overall === null ? " is-empty" : ""}`}
          style={{ "--goal-pct": overall === null ? 0 : Math.max(0, Math.min(100, overall)) }}
          role="img"
          aria-label={
            overall === null
              ? t("No targets set")
              : `${Math.round(overall)}% ${t("of the FTD target")}`
          }
        >
          <div className="goal-ring-inner">
            <span className="goal-ring-pct">
              {overall === null ? "—" : `${Math.round(overall)}%`}
            </span>
          </div>
        </div>
        <div className="goal-primary-metric">
          <span className="goal-primary-label">
            {goal.is_global && !isLeadership ? t("Your FTDs") : t("FTDs")}
          </span>
          <div className="goal-primary-value">
            {Number(totals.ftds || 0).toLocaleString()}
            <span>
              {" / "}
              {goal.ftds_target && Number(goal.ftds_target) > 0
                ? Number(goal.ftds_target).toLocaleString()
                : "—"}
            </span>
          </div>
          <div className="goal-bar">
            <span
              className="goal-bar-fill"
              style={{ width: ftdProgress.pct ? `${ftdProgress.pct}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Supporting measures. Rows, not tiles — three bordered
          boxes side by side read as three equal headlines, which
          is exactly what they are not. */}
      <div className="goal-rows">
        {[
          // A row with neither a value nor a target is furniture.
          ...(r2dActual !== null || Number(goal.r2d_target) > 0
            ? [{
              label: "Reg2Dep",
              value: formatPercent(r2dActual),
              target: Number(goal.r2d_target) > 0 ? formatPercent(goal.r2d_target) : "—",
              progress: r2dProgress,
            }]
            : []),
          // Only once the rate card can actually price this goal.
          // An empty money row teaches a buyer to ignore the money.
          ...(market && (market.value > 0 || market.targetValue > 0)
            ? [{
              label: "Market value",
              value: formatCurrencyWhole(market.value || 0),
              target: market.targetValue > 0 ? formatCurrencyWhole(market.targetValue) : "—",
              progress: marketProgress,
              notes: [
                market.blendedCpa
                  ? `${market.pricedFtds.toLocaleString()} ${t("FTDs")} · ~${formatCurrency(market.blendedCpa)} ${t("each")}`
                  : null,
                // A target nobody typed must not look like one
                // somebody did — say when it was derived.
                market.targetSource === "ftds_target"
                  ? `${t("Target: ")}${Number(goal.ftds_target).toLocaleString()} ${t("FTDs at market rate")}`
                  : null,
              ].filter(Boolean),
              // FTDs from a country nobody has priced are worth an
              // unknown amount, not zero. Say which, so a short
              // total is not read as a short month.
              warn: market.unpricedFtds > 0
                ? `${market.unpricedFtds.toLocaleString()} ${t("FTDs not valued")} — ${market.unpricedCountries.join(", ")} ${t("has no rate")}`
                : null,
            }]
            : []),
        ].map((row) => (
          <div key={row.label} className="goal-row">
            <div className="goal-row-main">
              <span className="goal-row-label">{t(row.label)}</span>
              <span className="goal-row-value">
                {row.value}
                <small>{" / "}{row.target}</small>
              </span>
              <span className="goal-row-track">
                <span
                  className="goal-row-fill"
                  style={{ width: row.progress.pct ? `${row.progress.pct}%` : "0%" }}
                />
              </span>
            </div>
            {(row.notes || []).map((line) => (
              <div key={line} className="goal-metric-note">{line}</div>
            ))}
            {row.warn ? <div className="goal-metric-note is-warn">{row.warn}</div> : null}
          </div>
        ))}
      </div>
      {(() => {
        // Pace + forecast widget — turns "set target" into "here's how to hit it"
        // Reads the same forecast the status badge and the rail
        // were computed from, so the card cannot contradict
        // itself the way it did when each end worked it out
        // independently.
        if (timing?.state === "pending") {
          return (
            <div className="goal-pace pending">
              <span className="goal-pace-mark">◷</span>
              <span className="goal-pace-text">
                {t("Period starts in")} <strong>{timing.startsIn} {timing.startsIn === 1 ? t("day") : t("days")}</strong>
                <span className="goal-pace-aside">{timing.totalDays}-{t("day target")}</span>
              </span>
            </div>
          );
        }
        if (!forecast) return null;

        const fmtPace = (v) => (v >= 10 ? Math.round(v).toString() : v.toFixed(1));
        // "1.8/day" is an instruction; "1.8/day, and $712 still to
        // earn" is a reason. The rate is the goal's own blend, so
        // the money moves with the mix the buyer is running.
        const rate = Number(market?.blendedCpa) || 0;
        const worth = (count) => (rate > 0 ? ` (${formatCurrencyWhole(count * rate)})` : "");
        const remaining = Math.max(0, forecast.target - forecast.actual);

        const hint = forecast.achieved
          ? `${t("Goal hit")} — ${forecast.actual} ${t("of")} ${forecast.target} ${t("FTDs")}${worth(forecast.actual)}`
          : forecast.ended
            ? `${t("Period ended at")} ${Math.round(forecast.projectedPct)}% ${t("of target")}`
            : forecast.projectedPct >= 100
              ? `${t("On track to reach")} ${forecast.target} ${t("FTDs")}${worth(forecast.target)}`
              : `${t("Need")} ${fmtPace(forecast.requiredPace)}/${t("day")} ${t("for")} ${forecast.daysLeft} ${forecast.daysLeft === 1 ? t("day") : t("days")} ${t("to hit")} ${forecast.target}${rate > 0 ? ` — ${formatCurrencyWhole(remaining * rate)} ${t("still to earn")}` : ""}`;

        return (
          <div className="goal-pace">
            <span className="goal-pace-mark">
              {status === "achieved" ? "✓" : status === "on-track" ? "→" : status === "at-risk" ? "!" : "↓"}
            </span>
            <span className="goal-pace-text">
              {hint}
              {/* A finished period has no current pace and no
                  forecast — only what happened. */}
              {forecast.ended ? null : (
                <span className="goal-pace-aside">
                  {t("Currently")} {fmtPace(forecast.currentPace)}/{t("day")}
                </span>
              )}
            </span>
          </div>
        );
      })()}
      {goal.notes ? <div className="goal-notes">{goal.notes}</div> : null}
    </div>
    );
  };

  return (
    <>
      <section className={`panels goals-panels${isLeadership ? "" : " is-single"}`}>
        {/* Overview first, setup below. A nine-column table cannot live in
            half a page, and leadership reads this list far more often than
            they create a goal — so the list gets the width and the top. */}
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, delay: 0.10, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Goals")}</h2>
              <p className="panel-subtitle">
                {goalTab === "setup"
                  ? t("Define the target outcomes your media buyers must reach.")
                  : t("Track progress vs. targets using live statistics data.")}
              </p>
            </div>
            {isLeadership ? (
              <div className="offers-tabs">
                <button
                  type="button"
                  className={`offers-tab${goalTab === "targets" ? " is-active" : ""}`}
                  onClick={() => setGoalTab("targets")}
                >
                  <GoalIcon size={14} />
                  <span>{t("Targets")}</span>
                </button>
                <button
                  type="button"
                  className={`offers-tab${goalTab === "setup" ? " is-active" : ""}`}
                  onClick={() => setGoalTab("setup")}
                >
                  <Plus size={14} />
                  <span>{t("Set a target")}</span>
                </button>
              </div>
            ) : null}
          </div>
          {goalTab === "setup" && isLeadership ? (
            <form className="form-grid goals-form" onSubmit={handleGoalSubmit}>
              <div className="field goal-field-scope">
                <label>{t("Goal Scope")}</label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={goalForm.isGlobal}
                    onChange={(event) =>
                      setGoalForm((prev) => ({ ...prev, isGlobal: event.target.checked }))
                    }
                  />
                  {t("Global Goal")}
                </label>
              </div>
              <div className="field">
                <label>{t("Media Buyer")}</label>
                <input
                  list="buyer-options"
                  value={goalForm.isGlobal ? t("All Buyers") : goalForm.buyer}
                  onChange={updateGoalForm("buyer")}
                  disabled={goalForm.isGlobal}
                />
                <datalist id="buyer-options">
                  {buyerDirectoryOptions.map((buyer) => (
                    <option key={buyer} value={buyer} />
                  ))}
                </datalist>
              </div>
              <div className="field">
                <label>{t("Country")}</label>
                <CountryDropdownPicker
                  value={goalForm.country}
                  onChange={(country) => setGoalForm((prev) => ({ ...prev, country }))}
                  options={countryOptions}
                  placeholder={t("Select")}
                  searchPlaceholder={t("Type to find countries")}
                  emptyResultsLabel={t("No countries found.")}
                />
              </div>
              <div className="field goal-field-period">
                <label>{t("Period")}</label>
                <Select
                  value={goalForm.period}
                  onChange={(v) => {
                    const range = applyPeriodRange(v);
                    setGoalForm((prev) => ({
                      ...prev,
                      period: v,
                      ...(range ? { dateFrom: range.from, dateTo: range.to } : {}),
                    }));
                  }}
                  options={["Daily", "Weekly", "Monthly", "Custom"].map((item) => ({ value: item, label: t(item) }))}
                  placeholder={t("Select")}
                />
              </div>
              <div className="field goal-range">
                <label>{t("Date Range")}</label>
                <div className="goal-date-presets">
                  {[
                    { label: t("Today"), range: { from: new Date(), to: new Date() } },
                    { label: t("This Week"), range: applyPeriodRange("Weekly") },
                    { label: t("This Month"), range: applyPeriodRange("Monthly") },
                    { label: t("Next 7d"), range: (() => { const f = new Date(); const tt = new Date(); tt.setDate(tt.getDate() + 6); return { from: f, to: tt }; })() },
                    { label: t("Next 30d"), range: (() => { const f = new Date(); const tt = new Date(); tt.setDate(tt.getDate() + 29); return { from: f, to: tt }; })() },
                  ].map((preset) => {
                    const fmt = (d) => d instanceof Date
                      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                      : d;
                    const from = preset.range?.from ? fmt(preset.range.from) : null;
                    const to = preset.range?.to ? fmt(preset.range.to) : null;
                    const isActive = from && to && goalForm.dateFrom === from && goalForm.dateTo === to;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        className={`date-preset${isActive ? " is-active" : ""}`}
                        onClick={() => from && to && setGoalForm((prev) => ({ ...prev, dateFrom: from, dateTo: to }))}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <div className="field-row">
                  <DeusDatePicker value={goalForm.dateFrom} onChange={(v) => setGoalForm((prev) => ({ ...prev, dateFrom: v }))} />
                  <span className="field-sep">{t("to")}</span>
                  <DeusDatePicker value={goalForm.dateTo} onChange={(v) => setGoalForm((prev) => ({ ...prev, dateTo: v }))} />
                </div>
              </div>
              {(() => {
                // Compute period duration + required pace for live hints
                const from = goalForm.dateFrom ? new Date(`${goalForm.dateFrom}T00:00:00`) : null;
                const to = goalForm.dateTo ? new Date(`${goalForm.dateTo}T00:00:00`) : null;
                const validRange = from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime());
                const days = validRange ? Math.max(1, Math.round((to - from) / 86400000) + 1) : null;
                const ftdsNum = Number(goalForm.ftdsTarget || 0);
                const revenueNum = Number(goalForm.revenueTarget || 0);
                const ftdsPace = days && ftdsNum > 0 ? (ftdsNum / days) : null;
                const revenuePace = days && revenueNum > 0 ? (revenueNum / days) : null;
                const fmt = (v) => v >= 10 ? Math.round(v).toString() : v.toFixed(1);
                return (
                  <>
                    <div className="field">
                      <label>
                        {t("FTDs Target")}
                        {ftdsPace !== null ? <span className="field-pace-hint">~{fmt(ftdsPace)}/{t("day")} · {days} {days === 1 ? t("day") : t("days")}</span> : null}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="50"
                        value={goalForm.ftdsTarget}
                        onChange={updateGoalForm("ftdsTarget")}
                      />
                    </div>
                    <div className="field">
                      <label>
                        {t("Revenue Target")}
                        {revenuePace !== null ? <span className="field-pace-hint">~{formatCurrency(revenuePace)}/{t("day")}</span> : null}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="$10,000"
                        value={goalForm.revenueTarget}
                        onChange={updateGoalForm("revenueTarget")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Reg2Dep Target (%)")}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="25.0"
                        value={goalForm.r2dTarget}
                        onChange={updateGoalForm("r2dTarget")}
                      />
                    </div>
                  </>
                );
              })()}
              <div className="field goal-field-notes">
                <label>{t("Notes")}</label>
                <input value={goalForm.notes} onChange={updateGoalForm("notes")} placeholder={t("Optional context, reward, or constraint")} />
              </div>
              {(() => {
                // Live goal preview — mirrors the saved goal card
                const from = goalForm.dateFrom ? new Date(`${goalForm.dateFrom}T00:00:00`) : null;
                const to = goalForm.dateTo ? new Date(`${goalForm.dateTo}T00:00:00`) : null;
                const validRange = from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime());
                const days = validRange ? Math.max(1, Math.round((to - from) / 86400000) + 1) : null;
                const ftdsNum = Number(goalForm.ftdsTarget || 0);
                const revenueNum = Number(goalForm.revenueTarget || 0);
                const r2dNum = Number(goalForm.r2dTarget || 0);
                const hasAny = ftdsNum > 0 || revenueNum > 0 || r2dNum > 0;
                const scope = goalForm.isGlobal
                  ? t("All Buyers")
                  : (goalForm.buyer || t("Any Buyer"));
                const country = goalForm.country || t("Any Country");
                const period = goalForm.period || t("Custom");
                const fmtNum = (v) => v >= 10 ? Math.round(v).toString() : v.toFixed(1);
                return (
                  <div className="goal-preview-card">
                    <div className="goal-preview-head">
                      <span className="goal-preview-tag">{t("Preview")}</span>
                      <span className="goal-preview-period">{t(period)}</span>
                    </div>
                    <div className="goal-preview-scope">
                      <strong>{scope}</strong>
                      <span className="goal-preview-dot">·</span>
                      <span>{country}</span>
                      {days ? (
                        <>
                          <span className="goal-preview-dot">·</span>
                          <span>{days} {days === 1 ? t("day") : t("days")}</span>
                        </>
                      ) : null}
                    </div>
                    {hasAny ? (
                      <div className="goal-preview-metrics">
                        {ftdsNum > 0 ? (
                          <div className="goal-preview-metric">
                            <span className="goal-preview-label">{t("FTDs")}</span>
                            <span className="goal-preview-value">{ftdsNum}</span>
                            {days ? <span className="goal-preview-pace">~{fmtNum(ftdsNum / days)}/{t("day")}</span> : null}
                          </div>
                        ) : null}
                        {revenueNum > 0 ? (
                          <div className="goal-preview-metric">
                            <span className="goal-preview-label">{t("Revenue")}</span>
                            <span className="goal-preview-value">{formatCurrency(revenueNum)}</span>
                            {days ? <span className="goal-preview-pace">~{formatCurrency(revenueNum / days)}/{t("day")}</span> : null}
                          </div>
                        ) : null}
                        {r2dNum > 0 ? (
                          <div className="goal-preview-metric">
                            <span className="goal-preview-label">{t("R2D")}</span>
                            <span className="goal-preview-value">{r2dNum}%</span>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="goal-preview-empty">
                        {t("Add a target to see your goal preview.")}
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="form-actions">
                <button className="ghost" type="button" onClick={resetGoalForm}>
                  {t("Reset")}
                </button>
                <button className="action-pill" type="submit">
                  {t("Add Goal")}
                </button>
              </div>
            </form>
          ) : goalState.loading ? (
            <div className="empty-state">{t("Loading goals…")}</div>
          ) : goalState.error ? (
            <div className="empty-state error">{goalState.error}</div>
          ) : displayGoals.length === 0 ? (
            <div className="empty-state">{t("No goals set yet.")}</div>
          ) : (
            (() => {
              const withInfo = displayGoals.map((g) => ({ goal: g, info: getGoalProgress(g) }));
              // Two shapes, because they answer two questions. The team target
              // is context — one goal, read once, so it keeps the card. The
              // individual targets are a list you compare down a column, and a
              // grid of cards is the wrong instrument for "who is behind".
              const teamGoals = withInfo.filter(({ goal }) => goal.is_global);
              const ownGoals = withInfo.filter(({ goal }) => !goal.is_global);
              const counts = { all: ownGoals.length, behind: 0, "at-risk": 0, "on-track": 0, achieved: 0, none: 0 };
              ownGoals.forEach(({ info }) => {
                counts[info.status] = (counts[info.status] || 0) + 1;
              });
              const filtered = statusFilter === "all"
                ? ownGoals
                : ownGoals.filter(({ info }) => info.status === statusFilter);
              const tabs = [
                { key: "all", label: t("All"), count: counts.all, tone: "neutral" },
                { key: "behind", label: t("Behind"), count: counts.behind, tone: "red" },
                { key: "at-risk", label: t("At risk"), count: counts["at-risk"], tone: "yellow" },
                { key: "on-track", label: t("On track"), count: counts["on-track"], tone: "green" },
                { key: "achieved", label: t("Achieved"), count: counts.achieved, tone: "green-solid" },
              ];
              // Urgent first, then the closest deadline — the order someone
              // scanning for "what needs me today" would sort it by hand.
              const rank = { behind: 0, "at-risk": 1, "on-track": 2, achieved: 3, none: 4 };
              const byUrgency = (a, b) => {
                const diff = (rank[a.info.status] ?? 5) - (rank[b.info.status] ?? 5);
                return diff !== 0 ? diff : (a.goal.date_to || "").localeCompare(b.goal.date_to || "");
              };
              const fmtPace = (v) => (v >= 10 ? Math.round(v).toString() : v.toFixed(1));
              return (
            <>
              {teamGoals.length > 0 ? (
                <div className="goal-section">
                  <div className="goal-section-head">
                    <h4 className="goal-section-title">{t("Team target")}</h4>
                    <span className="goal-section-note">
                      {isLeadership
                        ? t("Shared across every buyer")
                        : t("Shared target, measured on your own numbers")}
                    </span>
                  </div>
                  <div className="goal-list">
                    {teamGoals.sort(byUrgency).map(renderGoalCard)}
                  </div>
                </div>
              ) : null}
              <div className="goal-section">
                <div className="goal-section-head">
                  <h4 className="goal-section-title">
                    {isLeadership ? t("Individual targets") : t("Your targets")}
                  </h4>
                  <span className="goal-section-note">
                    {ownGoals.length} {ownGoals.length === 1 ? t("goal") : t("goals")}
                  </span>
                </div>
                {ownGoals.length === 0 ? (
                  <div className="empty-state">{t("No individual goals set yet.")}</div>
                ) : (
                  <>
                    <div className="goal-summary-strip">
                      {tabs.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          className={`goal-summary-tab tone-${item.tone}${statusFilter === item.key ? " is-active" : ""}`}
                          onClick={() => setStatusFilter(item.key)}
                          disabled={item.key !== "all" && item.count === 0}
                        >
                          <span className="goal-summary-tab-count">{item.count}</span>
                          <span className="goal-summary-tab-label">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    {filtered.length === 0 ? (
                      <div className="empty-state">{t("No goals match this filter.")}</div>
                    ) : (
                      <div className="table-wrap">
                        <table className="entries-table goal-table">
                          <thead>
                            <tr>
                              {isLeadership ? <th>{t("Buyer")}</th> : null}
                              <th>{t("Scope")}</th>
                              <th>{t("Period")}</th>
                              <th>{t("FTDs")}</th>
                              <th>{t("Reg2Dep")}</th>
                              <th>{t("Market value")}</th>
                              <th>{t("Pace")}</th>
                              <th>{t("Status")}</th>
                              {isLeadership ? <th /> : null}
                            </tr>
                          </thead>
                          <tbody>
                            {/* popLayout takes the leaving row out of flow immediately, so the
                                rows below start closing the gap while it fades rather than
                                jumping the moment it unmounts. */}
                            <AnimatePresence mode="popLayout" initial={false}>
                            {filtered.sort(byUrgency).map(({ goal, info }) => {
                              const { totals, ftdProgress, r2dActual, r2dProgress, statusLabel, status, market, marketProgress, timing, forecast } = info;
                              return (
                                <motion.tr key={goal.id} className={`goal-row-tr status-${status}`} {...rowMotion}>
                                  {isLeadership ? (
                                    <td className="goal-td-buyer">{goal.buyer}</td>
                                  ) : null}
                                  <td>{goal.country || t("All Countries")}</td>
                                  <td className="goal-td-period">
                                    <span>{formatGoalRange(goal.date_from, goal.date_to)}</span>
                                    {timing ? <small>{timing.label}</small> : null}
                                  </td>
                                  {/* The measure the goal is named after carries
                                      the bar; the rest are numbers you read. */}
                                  <td className="goal-td-primary">
                                    <span className="goal-td-value">
                                      {Number(totals.ftds || 0).toLocaleString()}
                                      <small>
                                        {" / "}
                                        {Number(goal.ftds_target) > 0
                                          ? Number(goal.ftds_target).toLocaleString()
                                          : "—"}
                                      </small>
                                    </span>
                                    <span className="goal-td-track">
                                      <span
                                        className="goal-td-fill"
                                        style={{ width: ftdProgress.pct ? `${ftdProgress.pct}%` : "0%" }}
                                      />
                                    </span>
                                  </td>
                                  <td className="goal-td-num">
                                    {r2dActual === null ? (
                                      <span className="offer-muted">—</span>
                                    ) : (
                                      <span className="goal-td-value">
                                        {formatPercent(r2dActual)}
                                        <small>
                                          {" / "}
                                          {Number(goal.r2d_target) > 0 ? formatPercent(goal.r2d_target) : "—"}
                                        </small>
                                      </span>
                                    )}
                                  </td>
                                  <td className="goal-td-num">
                                    {market && (market.value > 0 || market.targetValue > 0) ? (
                                      <>
                                        <span className="goal-td-value">
                                          {formatCurrencyWhole(market.value || 0)}
                                          <small>
                                            {" / "}
                                            {market.targetValue > 0 ? formatCurrencyWhole(market.targetValue) : "—"}
                                          </small>
                                        </span>
                                        {market.blendedCpa ? (
                                          <small className="goal-td-pct">
                                            ~{formatCurrency(market.blendedCpa)} {t("each")}
                                          </small>
                                        ) : null}
                                        {market.unpricedFtds > 0 ? (
                                          <small
                                            className="goal-td-warn"
                                            title={`${market.unpricedCountries.join(", ")} ${t("has no rate")}`}
                                          >
                                            {market.unpricedFtds} {t("not valued")}
                                          </small>
                                        ) : null}
                                      </>
                                    ) : (
                                      <span className="offer-muted">—</span>
                                    )}
                                  </td>
                                  {/* What to do about it, in the unit the buyer
                                      acts in — not a second copy of progress. */}
                                  <td className="goal-td-pace">
                                    {!forecast ? (
                                      <span className="offer-muted">
                                        {timing?.state === "pending" ? t("not started") : "—"}
                                      </span>
                                    ) : forecast.achieved ? (
                                      <span className="goal-td-value">{t("Goal hit")}</span>
                                    ) : forecast.ended ? (
                                      <span className="offer-muted">
                                        {formatPercent(forecast.projectedPct, 0)} {t("at close")}
                                      </span>
                                    ) : (
                                      <>
                                        <span className="goal-td-value">
                                          {fmtPace(forecast.requiredPace)}
                                          <small>/{t("day")} {t("needed")}</small>
                                        </span>
                                        <small className="goal-td-pct">
                                          {t("currently")} {fmtPace(forecast.currentPace)}/{t("day")}
                                        </small>
                                      </>
                                    )}
                                  </td>
                                  <td>
                                    <span className={`goal-status ${status}`}>{statusLabel}</span>
                                  </td>
                                  {isLeadership ? (
                                    <td>
                                      <div className="campaign-table-actions">
                                        <button
                                          className="icon-btn"
                                          type="button"
                                          title={t("Duplicate goal")}
                                          onClick={() => handleGoalDuplicate(goal)}
                                        >
                                          <Copy size={16} />
                                        </button>
                                        <button
                                          className="icon-btn"
                                          type="button"
                                          title={t("Delete goal")}
                                          onClick={() => handleGoalDelete(goal.id)}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  ) : null}
                                </motion.tr>
                              );
                            })}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
              );
            })()
          )}
        </motion.div>

      </section>


    </>
  );
}
