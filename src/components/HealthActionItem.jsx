import React from "react";
import { ACTION_META, healthAction } from "../lib/health.js";
import { goToView } from "../lib/navigation.js";
import { AlertTriangle, ArrowRight } from "lucide-react";

// One work item. The left gutter is the verb, the body is plain language,
// the right is the way out of it.
export function HealthActionItem({ item, t, children }) {
  const action = healthAction(item.code);
  const meta = ACTION_META[action.kind] || ACTION_META.check;
  const [open, setOpen] = React.useState(false);
  const entities = item.entities || [];
  const shown = open ? entities : entities.slice(0, 4);
  return (
    <article className={`hx-item kind-${action.kind} rank-${item.rank || "later"}`}>
      <div className="hx-gutter">
        <span className="hx-gutter-icon"><meta.Icon size={14} strokeWidth={2.4} /></span>
        <span className="hx-gutter-label">{t(meta.label)}</span>
      </div>
      <div className="hx-body">
        <header className="hx-head">
          <h4>{t(action.verb)}</h4>
          {(item.count || entities.length) > 1 ? <span className="hx-count">{item.count || entities.length}</span> : null}
          {item.rank === "now" ? <span className="hx-flag">{t("Blocking")}</span> : null}
        </header>
        {/* One target reads as a subject line; many read as a list. Either
            way the buyer sees WHAT to act on without hunting. */}
        {entities.length === 1 ? (
          <p className="hx-target" title={entities[0]}>{entities[0]}</p>
        ) : null}
        {action.cost ? (
          <p className="hx-cost"><AlertTriangle size={11} /> {t(action.cost)}</p>
        ) : null}
        <p className="hx-detail">{item.detail}</p>
        {entities.length > 1 ? (
          <div className="hx-entities">
            {shown.map((entity, index) => (
              <span className="hx-entity" key={`${entity}-${index}`} title={entity}>{entity}</span>
            ))}
            {entities.length > 4 ? (
              <button type="button" className="hx-more" onClick={() => setOpen((v) => !v)}>
                {open ? t("Show less") : `+${entities.length - 4}`}
              </button>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
      <div className="hx-actions">
        {action.view ? (
          <button type="button" className="hx-go" onClick={() => goToView(action.view, item.code)}>
            {t("Fix it")} <ArrowRight size={13} />
          </button>
        ) : null}
        {item.extraActions}
      </div>
    </article>
  );
}
