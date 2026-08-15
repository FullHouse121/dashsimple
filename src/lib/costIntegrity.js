// Can cost-derived figures be believed right now?
//
// CPC, cost-per-register, cost-per-FTD, profit and ROI all divide by spend.
// When the Meta→Keitaro pipeline is down, spend does not arrive as zero — it
// arrives as a small, plausible-looking number, which is worse. $128 against
// 22,845 clicks reads as a $0.01 CPC and an ROI of 704%, and nothing on screen
// says otherwise.
//
// So the test cannot be `spend === 0`. It has to be whether any ad account is
// actually delivering spend, which only the tracker knows. The server answers
// that in counts only, so every role can ask.
//
// One in-flight request is shared by all callers and the answer is cached: a
// dashboard renders several of these cards at once and none of them should
// each trigger a round-trip.
import React from "react";
import { apiFetch } from "./api.js";

const TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, value: null };
let inflight = null;

export const fetchCostIntegrity = async () => {
  if (cache.value && Date.now() - cache.at < TTL_MS) return cache.value;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const response = await apiFetch("/api/cost-integrity");
      if (!response.ok) throw new Error("unavailable");
      const data = await response.json();
      cache = { at: Date.now(), value: data };
      return data;
    } catch {
      // Never claim a problem we could not verify — an unreachable check must
      // not put a warning on a figure that may be perfectly sound.
      return { trustworthy: true, unknown: true };
    } finally {
      inflight = null;
    }
  })();
  return inflight;
};

export function useCostIntegrity() {
  const [state, setState] = React.useState(cache.value || { trustworthy: true, unknown: true });
  React.useEffect(() => {
    let alive = true;
    fetchCostIntegrity().then((value) => {
      if (alive) setState(value);
    });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
