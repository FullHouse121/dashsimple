import React from "react";
import { apiFetch } from "../lib/api.js";
import { useLanguage } from "../lib/i18n/language.jsx";

// ── Per-entity change history ─────────────────────────────────────────
// The audit trail already records who changed what; this reads one
// entity's slice of it so "why did this drop on the 12th" is answerable
// next to the thing that dropped, not in a global log.
export function EntityHistory({ type, id, limit = 12 }) {
  const { t } = useLanguage();
  const [state, setState] = React.useState({ loading: true, error: null, rows: [] });
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!type || !id) return undefined;
    let cancelled = false;
    (async () => {
      try {
        setState({ loading: true, error: null, rows: [] });
        const response = await apiFetch(`/api/logs/entity?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}&limit=40`);
        if (response.status === 403) {
          if (!cancelled) setState({ loading: false, error: null, rows: [] });
          return;
        }
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data?.error || "Failed to load history.");
        if (!cancelled) setState({ loading: false, error: null, rows: Array.isArray(data) ? data : [] });
      } catch (error) {
        if (!cancelled) setState({ loading: false, error: error.message || "Failed to load history.", rows: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  // The audit row stores the request body; show the fields that changed
  // rather than raw JSON, since that's the part anyone reads.
  const describe = (row) => {
    const details = row.details;
    if (!details || typeof details !== "object") return null;
    const keys = Object.keys(details).filter((k) => details[k] !== null && details[k] !== "");
    if (!keys.length) return null;
    return keys
      .slice(0, 4)
      .map((key) => {
        const value = details[key];
        const printed = Array.isArray(value) ? `${value.length}` : String(value);
        return `${key}: ${printed.length > 28 ? `${printed.slice(0, 28)}…` : printed}`;
      })
      .join(" · ");
  };

  if (state.loading) return <p className="entity-history-empty">{t("Loading history…")}</p>;
  if (state.error) return <p className="entity-history-empty">{state.error}</p>;
  if (!state.rows.length) return <p className="entity-history-empty">{t("No changes recorded yet.")}</p>;

  const visible = expanded ? state.rows : state.rows.slice(0, limit);
  return (
    <div className="entity-history">
      {visible.map((row) => {
        const failed = Number(row.status || 0) >= 400;
        const summary = describe(row);
        return (
          <div className={`entity-history-row${failed ? " is-failed" : ""}`} key={row.id}>
            <span className={`entity-history-dot is-${String(row.action || "updated")}`} />
            <div className="entity-history-main">
              <span className="entity-history-line">
                <strong>{row.actor_name || t("Unknown")}</strong> {t(String(row.action || "updated"))}
                {failed ? <span className="entity-history-failed">{t("failed")}</span> : null}
              </span>
              {summary ? <span className="entity-history-detail">{summary}</span> : null}
            </div>
            <time className="entity-history-time" title={new Date(row.created_at).toLocaleString()}>
              {new Date(row.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
            </time>
          </div>
        );
      })}
      {state.rows.length > limit ? (
        <button type="button" className="entity-history-more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? t("Show less") : `${t("Show all")} (${state.rows.length})`}
        </button>
      ) : null}
    </div>
  );
}
