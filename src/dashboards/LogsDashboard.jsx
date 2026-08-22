import React from "react";
import { CountryDropdownPicker } from "../components/Select.jsx";
import { apiFetch } from "../lib/api.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { Minus, Plus, RefreshCw, ScrollText, Search, X } from "lucide-react";

// ── Audit Logs (Big Boss + Team Leader only) ──────────────────────────
// Reads the audit_logs trail the API middleware writes: every mutating
// request (create/update/delete/push/sync/login) with actor and outcome.
export default function LogsDashboard({ authUser }) {
  const { t } = useLanguage();
  const [logs, setLogs] = React.useState([]);
  const [meta, setMeta] = React.useState({ total: 0, hasMore: false, entityTypes: [] });
  const [logState, setLogState] = React.useState({ loading: true, error: null });
  const [filters, setFilters] = React.useState({ q: "", method: "all", entityType: "all", outcome: "all" });
  const [searchDraft, setSearchDraft] = React.useState("");
  const [expandedId, setExpandedId] = React.useState(null);
  const [purgeArmed, setPurgeArmed] = React.useState(false);

  // Debounce free-text search so we don't refetch per keystroke.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.q === searchDraft ? prev : { ...prev, q: searchDraft }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  const fetchLogs = React.useCallback(
    async ({ silent = false, append = false, offset = 0 } = {}) => {
      try {
        if (!silent && !append) setLogState({ loading: true, error: null });
        const params = new URLSearchParams();
        params.set("limit", "50");
        if (offset > 0) params.set("offset", String(offset));
        if (filters.q.trim()) params.set("q", filters.q.trim());
        if (filters.method !== "all") params.set("method", filters.method);
        if (filters.entityType !== "all") params.set("entityType", filters.entityType);
        if (filters.outcome !== "all") params.set("outcome", filters.outcome);
        const response = await apiFetch(`/api/logs?${params.toString()}`);
        if (!response.ok) {
          const detail = await response.json().catch(() => null);
          throw new Error(detail?.error || t("Failed to load logs."));
        }
        const data = await response.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        setLogs((prev) => {
          // Silent background refreshes merge new entries in, so an expanded
          // list ("See more") isn't collapsed back to the first page.
          if (!append && !silent) return items;
          const merged = new Map(prev.map((item) => [item.id, item]));
          items.forEach((item) => merged.set(item.id, item));
          return Array.from(merged.values()).sort((a, b) => b.id - a.id);
        });
        setMeta({
          total: Number(data?.total) || items.length,
          hasMore: Boolean(data?.hasMore),
          entityTypes: Array.isArray(data?.entityTypes) ? data.entityTypes : [],
        });
        setLogState({ loading: false, error: null });
      } catch (error) {
        setLogState({ loading: false, error: error.message || t("Failed to load logs.") });
      }
    },
    [filters, t]
  );

  React.useEffect(() => {
    fetchLogs();
    const timer = setInterval(() => fetchLogs({ silent: true }), 30000);
    return () => clearInterval(timer);
  }, [fetchLogs]);

  const handlePurge = async () => {
    if (!purgeArmed) {
      setPurgeArmed(true);
      setTimeout(() => setPurgeArmed(false), 4000);
      return;
    }
    setPurgeArmed(false);
    try {
      const response = await apiFetch("/api/logs?olderThanDays=90", { method: "DELETE" });
      if (!response.ok) throw new Error(t("Failed to purge logs."));
      fetchLogs();
    } catch (error) {
      setLogState((prev) => ({ ...prev, error: error.message }));
    }
  };

  const formatLogTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const prettyDetails = (raw) => {
    if (!raw) return null;
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return String(raw);
    }
  };

  const methodClass = (method) => `log-badge m-${String(method || "").toLowerCase()}`;

  return (
    <section className="panel logs-panel">
      <div className="logs-head">
        <div>
          <h2 className="panel-title">
            <ScrollText size={16} /> {t("Audit Logs")}
          </h2>
          <p className="logs-sub">
            {t("Every action in the dashboard — who did it, what changed, and how it ended.")}
          </p>
        </div>
        <div className="logs-head-meta">
          <span className="logs-count">
            {meta.total.toLocaleString()} {t("entries")}
          </span>
          <button type="button" className="icon-btn" title={t("Refresh")} onClick={() => fetchLogs()}>
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            className={`logs-purge${purgeArmed ? " is-armed" : ""}`}
            onClick={handlePurge}
            title={t("Delete entries older than 90 days")}
          >
            {purgeArmed ? t("Click again to confirm") : t("Purge > 90 days")}
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
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder={t("Search actor, action, entity or payload")}
            />
            {searchDraft ? (
              <button
                type="button"
                className="registry-search-clear"
                onClick={() => setSearchDraft("")}
                aria-label={t("Clear search")}
              >
                <X size={13} />
              </button>
            ) : null}
          </div>
        </div>
        <div className="field">
          <label>{t("Method")}</label>
          <CountryDropdownPicker
            value={filters.method}
            onChange={(value) => setFilters((prev) => ({ ...prev, method: value || "all" }))}
            options={[
              { value: "all", label: t("All methods") },
              { value: "POST", label: "POST" },
              { value: "PUT", label: "PUT" },
              { value: "PATCH", label: "PATCH" },
              { value: "DELETE", label: "DELETE" },
            ]}
            placeholder={t("All methods")}
          />
        </div>
        <div className="field">
          <label>{t("Entity")}</label>
          <CountryDropdownPicker
            value={filters.entityType}
            onChange={(value) => setFilters((prev) => ({ ...prev, entityType: value || "all" }))}
            options={[
              { value: "all", label: t("All entities") },
              ...meta.entityTypes.map((entity) => ({ value: entity, label: entity })),
            ]}
            placeholder={t("All entities")}
          />
        </div>
        <div className="field">
          <label>{t("Result")}</label>
          <CountryDropdownPicker
            value={filters.outcome}
            onChange={(value) => setFilters((prev) => ({ ...prev, outcome: value || "all" }))}
            options={[
              { value: "all", label: t("All results") },
              { value: "success", label: t("Success") },
              { value: "error", label: t("Errors") },
            ]}
            placeholder={t("All results")}
          />
        </div>
      </div>

      {logState.error ? <p className="logs-error">{logState.error}</p> : null}

      <div className="table-wrap">
        <table className="entries-table logs-table">
          <thead>
            <tr>
              <th>{t("Time")}</th>
              <th>{t("Actor")}</th>
              <th>{t("Action")}</th>
              <th>{t("Entity")}</th>
              <th>{t("Path")}</th>
              <th>{t("Status")}</th>
              <th className="col-actions">{t("Details")}</th>
            </tr>
          </thead>
          <tbody>
            {logState.loading && !logs.length ? (
              <tr>
                <td colSpan={7} className="logs-empty">{t("Loading…")}</td>
              </tr>
            ) : null}
            {!logState.loading && !logs.length ? (
              <tr>
                <td colSpan={7} className="logs-empty">
                  {t("No log entries yet. Actions will appear here as the team works.")}
                </td>
              </tr>
            ) : null}
            {logs.map((row) => {
              const failed = Number(row.status) >= 400;
              const isOpen = expandedId === row.id;
              const details = prettyDetails(row.details);
              return (
                <React.Fragment key={row.id}>
                  <tr className={failed ? "logs-row-failed" : ""}>
                    <td className="logs-time">{formatLogTime(row.created_at)}</td>
                    <td>
                      <span className="logs-actor">{row.actor_name || t("System")}</span>
                      {row.actor_role ? <span className="logs-role">{row.actor_role}</span> : null}
                    </td>
                    <td>
                      <span className={methodClass(row.method)}>{row.method}</span>{" "}
                      <span className="logs-action">{row.action || "—"}</span>
                    </td>
                    <td>
                      <span className="logs-entity">
                        {row.entity_type || "—"}
                        {row.entity_id ? <span className="logs-entity-id"> #{row.entity_id}</span> : null}
                      </span>
                    </td>
                    <td className="logs-path" title={row.path}>{row.path}</td>
                    <td>
                      <span className={`logs-status${failed ? " is-error" : " is-ok"}`}>{row.status ?? "—"}</span>
                    </td>
                    <td className="col-actions">
                      {details || row.ip ? (
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setExpandedId(isOpen ? null : row.id)}
                          title={t("Details")}
                        >
                          {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="logs-details-row">
                      <td colSpan={7}>
                        <div className="logs-details">
                          <div className="logs-details-meta">
                            {row.ip ? <span>IP: {row.ip}</span> : null}
                            {Number.isFinite(Number(row.duration_ms)) ? (
                              <span>{Number(row.duration_ms)} ms</span>
                            ) : null}
                            <span>#{row.id}</span>
                          </div>
                          {details ? <pre>{details}</pre> : <p className="logs-empty">{t("No payload recorded.")}</p>}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {meta.hasMore ? (
        <button
          type="button"
          className="logs-load-more"
          onClick={() => fetchLogs({ append: true, offset: logs.length, silent: true })}
        >
          {t("Load more")}
        </button>
      ) : null}
    </section>
  );
}
