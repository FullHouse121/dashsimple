import { HEALTH_DESTINATION_FILTER } from "./health.js";

export const goToView = (view, code) => {
  if (!view) return;
  const flag = HEALTH_DESTINATION_FILTER[String(code || "").replace(/^integrity_/, "")];
  if (flag) {
    try {
      sessionStorage.setItem("pending-health-filter", flag);
    } catch {
      /* private mode — the view just opens unfiltered */
    }
  }
  window.dispatchEvent(new CustomEvent("dash:navigate", { detail: { view } }));
};
