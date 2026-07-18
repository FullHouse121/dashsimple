// Anchored "Has been copied successfully" toast — one implementation for
// every copy affordance (id pills, destination buttons, detail sub copies).
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

export const useCopyToast = () => {
  const [toast, setToast] = React.useState({
    visible: false,
    type: "success",
    message: "",
    left: 0,
    top: 0,
    above: true,
  });
  const timeoutRef = React.useRef(null);
  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );
  const show = React.useCallback((type, message, anchorRect) => {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
    const rawLeft = anchorRect ? anchorRect.left + anchorRect.width / 2 : viewportWidth / 2;
    const clampedLeft = Math.max(170, Math.min(viewportWidth - 170, rawLeft));
    const showAbove = anchorRect ? anchorRect.top > 72 : true;
    const top = anchorRect ? (showAbove ? anchorRect.top - 10 : anchorRect.bottom + 10) : 72;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ visible: true, type, message, left: clampedLeft, top, above: showAbove });
    timeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 1400);
  }, []);

  const copyText = React.useCallback(
    (value, event) => {
      const anchorRect = event?.currentTarget?.getBoundingClientRect?.() || null;
      try {
        navigator.clipboard?.writeText(String(value || ""));
        show("success", "Has been copied successfully", anchorRect);
      } catch {
        show("error", "Copy failed", anchorRect);
      }
    },
    [show]
  );

  return { toast, copyText, showCopyToast: show };
};

export function CopyToast({ toast }) {
  return (
    <AnimatePresence>
      {toast.visible ? (
        <div
          className={`copy-toast-anchor${toast.above ? "" : " is-below"}`}
          style={{ left: toast.left, top: toast.top }}
        >
          <motion.div
            className={`copy-toast ${toast.type}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {toast.type === "success" ? <CheckCircle size={14} /> : <X size={14} />}
            <span>{toast.message}</span>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
