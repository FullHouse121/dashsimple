import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

// App-wide styled confirm dialog — replaces native window.confirm() so system
// prompts carry the app's design. appConfirm({...}) returns a Promise<boolean>.
export let _confirmSet = null;

export let _confirmResolve = null;

export function appConfirm(opts = {}) {
  return new Promise((resolve) => {
    if (typeof _confirmSet !== "function") {
      resolve(window.confirm(opts.message || opts.title || "")); // fallback if host unmounted
      return;
    }
    _confirmResolve = resolve;
    _confirmSet({
      open: true,
      tone: "danger",
      title: "Are you sure?",
      message: "",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      ...opts,
    });
  });
}

export function ConfirmHost() {
  const [state, setState] = React.useState({ open: false });
  React.useEffect(() => {
    _confirmSet = setState;
    return () => { _confirmSet = null; };
  }, []);
  const finish = (result) => {
    setState((s) => ({ ...s, open: false }));
    const r = _confirmResolve;
    _confirmResolve = null;
    if (r) r(result);
  };
  React.useEffect(() => {
    if (!state.open) return;
    const onKey = (e) => {
      if (e.key === "Escape") finish(false);
      else if (e.key === "Enter") finish(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open]);
  return (
    <AnimatePresence>
      {state.open ? (
        <motion.div
          className="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={() => finish(false)}
        >
          <motion.div
            className={`confirm-dialog tone-${state.tone || "danger"}`}
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon"><AlertTriangle size={20} /></div>
            <div className="confirm-body">
              <h3 className="confirm-title">{state.title}</h3>
              {state.message ? <p className="confirm-message">{state.message}</p> : null}
            </div>
            <div className="confirm-actions">
              <button type="button" className="ghost" onClick={() => finish(false)}>{state.cancelLabel}</button>
              <button type="button" className="confirm-confirm" onClick={() => finish(true)} autoFocus>{state.confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
