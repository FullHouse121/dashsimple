import React from "react";
import { HealthActionItem } from "../components/HealthActionItem.jsx";
import { HealthIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { apiJson } from "../lib/useResource.js";
import { formatCurrency } from "../lib/format.js";
import { ACTION_META, healthAction } from "../lib/health.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE } from "../lib/motion.js";
import { goToView } from "../lib/navigation.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle, DollarSign, RefreshCw, ScrollText, Wrench, X } from "lucide-react";

export default function HealthDashboard({ authUser }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const [tab, setTab] = React.useState("todo");
  const [alertState, setAlertState] = React.useState({ loading: true, error: null, data: null });
  const [alertStatus, setAlertStatus] = React.useState("open");
  const [running, setRunning] = React.useState(false);
  const [costState, setCostState] = React.useState({ loading: false, error: null, data: null });
  const [setupState, setSetupState] = React.useState({ loading: true, error: null, data: null });
  const [busyAlert, setBusyAlert] = React.useState(null);
  const [kindFilter, setKindFilter] = React.useState(null);
  const refetchTimerRef = React.useRef(null);

  const fetchAlerts = React.useCallback(async (status) => {
    try {
      setAlertState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await apiJson(`/api/alerts?status=${status}`, "Failed to load alerts.");
      setAlertState({ loading: false, error: null, data });
      // The server started a re-evaluation because this list was stale. Come
      // back for the result rather than leaving fixed work on screen.
      if (data?.evaluating) {
        if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
        refetchTimerRef.current = setTimeout(() => fetchAlertsRef.current?.(status), 6000);
      }
    } catch (error) {
      setAlertState({ loading: false, error: error.message || "Failed to load alerts.", data: null });
    }
  }, []);
  // Held in refs so the callback above stays stable and the timer survives
  // a re-render without re-firing.
  const fetchAlertsRef = React.useRef(null);
  fetchAlertsRef.current = fetchAlerts;
  React.useEffect(
    () => () => {
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    },
    []
  );
  const fetchCost = React.useCallback(async () => {
    try {
      setCostState({ loading: true, error: null, data: null });
      const data = await apiJson("/api/cost-health", "Failed to read the cost pipeline.");
      setCostState({ loading: false, error: null, data });
    } catch (error) {
      setCostState({ loading: false, error: error.message || "Failed to read the cost pipeline.", data: null });
    }
  }, []);
  const fetchSetup = React.useCallback(async () => {
    try {
      setSetupState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await apiJson("/api/integrity", "Integrity scan failed.");
      setSetupState({ loading: false, error: null, data });
    } catch (error) {
      setSetupState({ loading: false, error: error.message || "Integrity scan failed.", data: null });
    }
  }, []);

  // The to-do list needs both sources, so both load up front.
  React.useEffect(() => {
    fetchAlerts(alertStatus);
  }, [fetchAlerts, alertStatus]);
  React.useEffect(() => {
    fetchSetup();
  }, [fetchSetup]);
  React.useEffect(() => {
    if (tab === "cost" && isLeadership && !costState.data && !costState.loading) fetchCost();
  }, [tab, isLeadership, costState.data, costState.loading, fetchCost]);

  const runChecks = async () => {
    setRunning(true);
    try {
      await apiFetch("/api/alerts/run", { method: "POST" }).then((r) => r.json().catch(() => ({})));
      await Promise.all([fetchAlerts(alertStatus), fetchSetup()]);
      if (tab === "cost") await fetchCost();
    } catch (error) {
      /* the lists keep whatever they had */
    } finally {
      setRunning(false);
    }
  };

  const actOnAlert = async (alert, action) => {
    setBusyAlert(alert.id);
    try {
      await apiFetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await fetchAlerts(alertStatus);
    } catch (error) {
      /* the refresh shows the truth */
    } finally {
      setBusyAlert(null);
    }
  };

  const relative = (value) => {
    if (!value) return "—";
    const diff = Date.now() - new Date(value).getTime();
    if (Number.isNaN(diff)) return "—";
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("just now");
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // ── The single work list ─────────────────────────────────────────────
  // Live incidents and structural problems are the same thing to whoever
  // has to fix them, so they merge into one ranked queue. Rank is about
  // consequence, not source: "now" stops money, "soon" leaks it.
  const workItems = React.useMemo(() => {
    const items = [];
    (alertState.data?.alerts || [])
      .filter((alert) => alert.status !== "resolved")
      .forEach((alert) => {
        const code = String(alert.rule || "").replace(/^integrity_/, "");
        items.push({
          id: `alert-${alert.id}`,
          code,
          rank: alert.severity === "critical" ? "now" : "soon",
          detail: alert.message,
          // The sample is capped server-side; the real total drives the badge.
          count: alert.details?.count || null,
          entities: alert.details?.sample || (alert.entity_label ? [alert.entity_label] : []),
          source: "alert",
          alert,
        });
      });
    (setupState.data?.issues || []).forEach((issue) => {
      // A rolled-up alert already covers this class — don't say it twice.
      const covered = items.some((item) => item.source === "alert" && item.code === issue.code);
      const existing = items.find((item) => item.source === "setup" && item.code === issue.code);
      if (existing) {
        existing.entities.push(issue.label);
        return;
      }
      if (covered && issue.severity === "critical") return;
      items.push({
        id: `setup-${issue.code}`,
        code: issue.code,
        rank: issue.severity === "critical" ? "now" : issue.severity === "warning" ? "soon" : "later",
        detail: issue.detail,
        entities: issue.label ? [issue.label] : [],
        source: "setup",
      });
    });
    const rankOrder = { now: 0, soon: 1, later: 2 };
    items.sort((a, b) => rankOrder[a.rank] - rankOrder[b.rank] || String(a.code).localeCompare(String(b.code)));
    return items;
  }, [alertState.data, setupState.data]);

  const kindCounts = React.useMemo(() => {
    const counts = { add: 0, remove: 0, fix: 0, check: 0 };
    workItems.forEach((item) => {
      const kind = healthAction(item.code).kind;
      counts[kind] = (counts[kind] || 0) + (item.entities.length || 1);
    });
    return counts;
  }, [workItems]);
  const rankCounts = React.useMemo(() => {
    const counts = { now: 0, soon: 0, later: 0 };
    workItems.forEach((item) => {
      counts[item.rank] = (counts[item.rank] || 0) + 1;
    });
    return counts;
  }, [workItems]);
  const visibleItems = kindFilter ? workItems.filter((item) => healthAction(item.code).kind === kindFilter) : workItems;

  const loadingWork = alertState.loading || setupState.loading;
  const TABS = [
    { key: "todo", label: t("To do"), Icon: CheckCircle, badge: rankCounts.now || null },
    ...(isLeadership ? [{ key: "cost", label: t("Cost pipeline"), Icon: DollarSign }] : []),
    { key: "log", label: t("Alert log"), Icon: ScrollText },
  ];

  return (
    <section className="form-section">
      <motion.div className="panel registry-dashboard-panel health-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION.settle, ease: EASE }}>
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><HealthIcon size={20} /></span>
            <div>
              <h2 className="panel-title">{t("Health")}</h2>
              <p className="panel-subtitle">{t("Everything that needs doing, in the order it costs you money.")}</p>
            </div>
          </div>
          <div className="panel-head-actions">
            {alertState.data?.lastRunAt ? (
              <span className="health-lastrun">{t("Checked")} {relative(alertState.data.lastRunAt)} {t("ago")}</span>
            ) : null}
            {isLeadership ? (
              <button type="button" className="offers-mode-toggle" onClick={runChecks} disabled={running}>
                <RefreshCw size={13} className={running ? "is-spinning" : undefined} /> {running ? t("Checking…") : t("Check now")}
              </button>
            ) : null}
          </div>
        </div>

        <div className="health-tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              className={`health-tab${tab === item.key ? " is-active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              <item.Icon size={13} /> {item.label}
              {item.badge ? <span className="health-tab-badge is-critical">{item.badge}</span> : null}
            </button>
          ))}
        </div>

        {tab === "todo" ? (
          loadingWork ? (
            <div className="empty-state">{t("Checking your setup…")}</div>
          ) : alertState.error || setupState.error ? (
            <div className="empty-state error">{alertState.error || setupState.error}</div>
          ) : !workItems.length ? (
            <div className="hx-clear">
              <CheckCircle size={22} />
              <strong>{t("Nothing to fix.")}</strong>
              <span>{t("Every flow can run, every domain reports, and cost is arriving.")}</span>
            </div>
          ) : (
            <>
              {/* The one-line verdict, before any list */}
              <div className="hx-verdict">
                <span className={`hx-verdict-dot${rankCounts.now ? " is-bad" : rankCounts.soon ? " is-warn" : ""}`} />
                <strong>
                  {rankCounts.now
                    ? t("{n} things are stopping traffic or money right now.").replace("{n}", String(rankCounts.now))
                    : t("Nothing is blocking. {n} things are leaking.").replace("{n}", String(rankCounts.soon))}
                </strong>
                <span className="hx-verdict-rest">
                  {t("{soon} to do soon · {later} housekeeping")
                    .replace("{soon}", String(rankCounts.soon))
                    .replace("{later}", String(rankCounts.later))}
                </span>
              </div>

              {/* Filter by the kind of work, not by severity — a buyer with
                  ten minutes wants "what do I have to add". */}
              <div className="hx-kinds" role="group" aria-label={t("Filter by action")}>
                {["add", "remove", "fix", "check"].map((kind) => {
                  const meta = ACTION_META[kind];
                  const count = kindCounts[kind] || 0;
                  if (!count) return null;
                  const active = kindFilter === kind;
                  return (
                    <button
                      key={kind}
                      type="button"
                      className={`hx-kind kind-${kind}${active ? " is-active" : ""}`}
                      onClick={() => setKindFilter(active ? null : kind)}
                      aria-pressed={active}
                    >
                      <meta.Icon size={13} strokeWidth={2.4} />
                      <span className="hx-kind-label">{t(meta.label)}</span>
                      <span className="hx-kind-count">{count}</span>
                    </button>
                  );
                })}
                {kindFilter ? (
                  <button type="button" className="hx-kind is-clear" onClick={() => setKindFilter(null)}>
                    <X size={12} /> {t("All")}
                  </button>
                ) : null}
              </div>

              <div className="hx-list">
                {visibleItems.map((item) => (
                  <HealthActionItem
                    key={item.id}
                    item={{
                      ...item,
                      extraActions: item.alert ? (
                        <button
                          type="button"
                          className="hx-dismiss"
                          disabled={busyAlert === item.alert.id}
                          title={t("I've handled this")}
                          onClick={() => actOnAlert(item.alert, "resolve")}
                        >
                          <CheckCircle size={13} /> {t("Done")}
                        </button>
                      ) : null,
                    }}
                    t={t}
                  />
                ))}
              </div>
            </>
          )
        ) : null}

        {tab === "cost" && isLeadership ? (
          costState.loading ? (
            <div className="empty-state">{t("Reading the cost pipeline…")}</div>
          ) : costState.error ? (
            <div className="empty-state error">{costState.error}</div>
          ) : costState.data ? (
            (() => {
              const data = costState.data;
              // Three states, because Keitaro's own status answers a narrower
              // question than "is money arriving". An integration it calls
              // successful can still be delivering nothing — usually because it
              // was wired today and Keitaro only pulls from start_date onward.
              const dead = data.integrations.filter((integration) => integration.health === "error");
              const awaiting = data.integrations.filter((integration) => integration.health === "awaiting");
              const receiving = data.integrations.filter((integration) => integration.health === "receiving");
              const stalled = data.keitaro.trafficWithoutCost || (data.keitaro.costPrev7 > 0 && data.keitaro.costLast7 === 0);
              // Four links in a chain, each either passing or the point of
              // failure — the whole tab exists to say which one broke.
              const chain = [
                {
                  key: "token",
                  label: t("Meta tokens"),
                  ok: dead.length === 0,
                  value: dead.length
                    ? `${dead.length}/${data.integrations.length} ${t("dead")}`
                    : awaiting.length
                      ? `${receiving.length}/${data.integrations.length} ${t("delivering")}`
                      : `${data.integrations.length} ${t("alive")}`,
                },
                {
                  key: "link",
                  label: t("Account links"),
                  ok: data.summary.unlinked === 0,
                  value: data.summary.unlinked ? `${data.summary.unlinked} ${t("unlinked")}` : t("all linked"),
                },
                {
                  key: "cost",
                  label: t("Cost in Keitaro"),
                  ok: data.keitaro.costLast7 > 0,
                  value: formatCurrency(data.keitaro.costLast7),
                },
                {
                  key: "roi",
                  label: t("ROI numbers"),
                  // Same rule the KPI cards use, or the two disagree in the
                  // user's face: this said "trustworthy" on $16.22 of cost
                  // across 19,031 clicks with 9 of 9 tokens dead, while every
                  // ROI figure on the dashboard carried "cost data incomplete".
                  // Some cost arriving is not the same as the cost being right.
                  ok: data.keitaro.costLast7 > 0 && dead.length === 0,
                  value: data.keitaro.costLast7 > 0 && dead.length === 0 ? t("trustworthy") : t("understated"),
                },
              ];
              return (
                <>
                  <div className={`hx-verdict${stalled || dead.length ? " is-bad" : ""}`}>
                    <span className={`hx-verdict-dot${stalled || dead.length ? " is-bad" : ""}`} />
                    <strong>
                      {stalled
                        ? t("Spend is not reaching the tracker.")
                        : dead.length
                          ? t("Cost is arriving, but some tokens are dead.")
                          : awaiting.length
                            ? `${awaiting.length} ${t("connected to Keitaro, awaiting cost from Meta.")}`
                            : t("Cost is arriving normally.")}
                    </strong>
                    <span className="hx-verdict-rest">
                      {data.keitaro.clicksLast7.toLocaleString()} {t("clicks")} · {formatCurrency(data.keitaro.costLast7)} {t("cost")} · {t("previous week")} {formatCurrency(data.keitaro.costPrev7)}
                    </span>
                  </div>

                  {/* Keitaro reports every token fault as one opaque string, so
                      until now this page could say a token was dead but never
                      why — and "re-issue the token" is the wrong instruction
                      when the app that minted it no longer exists. Meta's own
                      verdict, grouped by cause, because eleven accounts down
                      for one reason is one job and not eleven. */}
                  {data.tokens?.headline ? (
                    <div className="hx-diagnosis">
                      <div className="hx-diagnosis-head">
                        <AlertTriangle size={14} />
                        <strong>{t(data.tokens.headline.summary)}</strong>
                        <span className="hx-diagnosis-count">
                          {data.tokens.broken}/{data.tokens.total} {t("tokens affected")}
                        </span>
                      </div>
                      <p className="hx-diagnosis-action">{t(data.tokens.headline.action)}</p>
                      {data.tokens.groups.length > 1 ? (
                        <ul className="hx-diagnosis-groups">
                          {data.tokens.groups.map((group) => (
                            <li key={group.verdict}>
                              <strong>{group.count}</strong> {t(group.summary)}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}

                  {/* The pipeline itself, as a pipeline */}
                  <div className="hx-chain">
                    {chain.map((step, index) => (
                      <React.Fragment key={step.key}>
                        <div className={`hx-chain-step${step.ok ? " is-ok" : " is-bad"}`}>
                          <span className="hx-chain-icon">{step.ok ? <CheckCircle size={14} /> : <X size={14} strokeWidth={3} />}</span>
                          <span className="hx-chain-label">{step.label}</span>
                          <strong className="hx-chain-value">{step.value}</strong>
                        </div>
                        {index < chain.length - 1 ? (
                          <span className={`hx-chain-arrow${chain[index].ok ? "" : " is-broken"}`}><ArrowRight size={14} /></span>
                        ) : null}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Keitaro calls these successful, so the dashboard says so
                      too — and then states the one thing Keitaro's tick does not
                      cover: no spend has actually arrived. Rendered green, as a
                      connected account with a note, not as a problem. */}
                  {awaiting.length ? (
                    <>
                      <div className="hx-section-title">{t("Connected in Keitaro — no cost tracked yet")}</div>
                      <div className="hx-list">
                        {awaiting.map((integration) => (
                          <article className="hx-item kind-add" key={integration.keitaro_integration_id}>
                            <div className="hx-gutter">
                              <span className="hx-gutter-icon"><CheckCircle size={14} strokeWidth={2.4} /></span>
                              <span className="hx-gutter-label">{t("Connected")}</span>
                            </div>
                            <div className="hx-body">
                              <header className="hx-head">
                                <h4>{integration.name}</h4>
                                <span className="hx-flag is-ok">{t("Success")}</span>
                              </header>
                              <p className="hx-cost">
                                {t("Connected, but no cost tracked in the last")} {data.summary.windowDays} {t("days")}
                                {integration.campaign_count
                                  ? ` · ${integration.campaign_count} ${integration.campaign_count === 1 ? t("campaign linked") : t("campaigns linked")}`
                                  : ""}
                              </p>
                              {integration.last_error_hint ? (
                                <p className="hx-detail">{t("Last reported")}: {integration.last_error_hint}</p>
                              ) : null}
                              <div className="hx-entities">
                                {integration.ad_account_id ? <span className="hx-entity">act_{integration.ad_account_id}</span> : null}
                                {integration.start_date ? (
                                  <span className="hx-entity is-quiet">{t("pulls from")} {integration.start_date}</span>
                                ) : null}
                                {integration.sync_interval_minutes ? (
                                  <span className="hx-entity is-quiet">{t("every")} {integration.sync_interval_minutes} {t("min")}</span>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  ) : null}

                  {dead.length ? (
                    <>
                      <div className="hx-section-title">{t("Replace these tokens in Keitaro → Integrations → Facebook")}</div>
                      <div className="hx-list">
                        {dead.map((integration) => (
                          <article className="hx-item kind-fix rank-now" key={integration.keitaro_integration_id}>
                            <div className="hx-gutter">
                              <span className="hx-gutter-icon"><Wrench size={14} strokeWidth={2.4} /></span>
                              <span className="hx-gutter-label">{t("Fix")}</span>
                            </div>
                            <div className="hx-body">
                              <header className="hx-head">
                                <h4>{integration.name}</h4>
                                <span className="hx-flag">{t("Blocking")}</span>
                              </header>
                              <p className="hx-cost"><AlertTriangle size={11} /> {t("No spend data for this ad account")}</p>
                              <p className="hx-detail">{integration.token_error}</p>
                              <div className="hx-entities">
                                {integration.ad_account_id ? <span className="hx-entity">act_{integration.ad_account_id}</span> : null}
                                {integration.last_update ? (
                                  <span className="hx-entity is-quiet">{t("last sync")} {new Date(integration.last_update).toLocaleString()}</span>
                                ) : null}
                              </div>
                            </div>
                            <div className="hx-actions">
                              <button type="button" className="hx-go" onClick={() => goToView("meta_token")}>
                                {t("Ad accounts")} <ArrowRight size={13} />
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  ) : null}

                  <div className="hx-section-title">{t("Wired ad accounts")}</div>
                  <div className="hx-accounts">
                    {data.wired.filter((account) => account.is_wired).map((account) => (
                      <div className={`hx-account${account.linked ? "" : " is-bad"}`} key={account.id}>
                        <span className="hx-account-dot" />
                        <div>
                          <span className="hx-account-name">{account.account_number}</span>
                          <span className="hx-account-buyer">{account.buyer_name || "—"}</span>
                        </div>
                        <span className="hx-account-state">
                          {account.linked ? `#${account.keitaro_integration_id}` : t("Not linked")}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()
          ) : null
        ) : null}

        {tab === "log" ? (
          <>
            <div className="hx-kinds">
              {[
                { value: "open", label: t("Open") },
                { value: "acknowledged", label: t("Acknowledged") },
                { value: "resolved", label: t("Resolved") },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`hx-kind${alertStatus === option.value ? " is-active" : ""}`}
                  onClick={() => setAlertStatus(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {alertState.loading ? (
              <div className="empty-state">{t("Loading alerts…")}</div>
            ) : !(alertState.data?.alerts || []).length ? (
              <div className="empty-state">{t("Nothing here.")}</div>
            ) : (
              <div className="hx-log">
                {alertState.data.alerts.map((alert) => (
                  <div className={`hx-logrow sev-${alert.severity}`} key={alert.id}>
                    <span className="hx-logrow-dot" />
                    <div className="hx-logrow-body">
                      <span className="hx-logrow-title">{alert.title}</span>
                      <span className="hx-logrow-meta">
                        {alert.rule} · {t("first seen")} {relative(alert.first_seen_at)} {t("ago")}
                        {alert.occurrences > 1 ? ` · ×${alert.occurrences}` : ""}
                        {alert.acknowledged_by ? ` · ${t("Acknowledged")} ${alert.acknowledged_by}` : ""}
                      </span>
                    </div>
                    <div className="hx-logrow-actions">
                      {alert.status !== "resolved" ? (
                        <>
                          {alert.status !== "acknowledged" ? (
                            <button type="button" className="hx-dismiss" disabled={busyAlert === alert.id} onClick={() => actOnAlert(alert, "acknowledge")}>
                              {t("Acknowledge")}
                            </button>
                          ) : null}
                          <button type="button" className="hx-dismiss" disabled={busyAlert === alert.id} onClick={() => actOnAlert(alert, "resolve")}>
                            <CheckCircle size={13} /> {t("Resolve")}
                          </button>
                        </>
                      ) : (
                        <button type="button" className="hx-dismiss" disabled={busyAlert === alert.id} onClick={() => actOnAlert(alert, "reopen")}>
                          {t("Reopen")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </motion.div>
    </section>
  );
}
