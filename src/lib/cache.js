// Stale-while-revalidate localStorage cache for GET endpoints.
// Pattern: read cached → render instantly → fetch fresh → swap in seamlessly.
// User perceives <100ms loads on every return visit instead of waiting on the API.

const SWR_CACHE_PREFIX = "deus-cache:";
const SWR_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h sanity ceiling

export const readSwrCache = (key) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SWR_CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > SWR_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch (e) {
    return null;
  }
};

export const writeSwrCache = (key, data) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SWR_CACHE_PREFIX + key,
      JSON.stringify({ ts: Date.now(), data })
    );
  } catch (e) {
    // localStorage quota or serialize failure — silently drop
  }
};

export const clearSwrCache = (key) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SWR_CACHE_PREFIX + key);
  } catch (e) {
    // ignore
  }
};
