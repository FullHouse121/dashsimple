// Resilient API client.
// Features: retry on failure (3× for GET/HEAD), exponential backoff, hard timeout,
// candidate-URL fallback (relative → primary → fallback origin),
// dispatches "auth:invalid" on 401 so the UI can redirect to login.

const FALLBACK_API_ORIGIN =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_FALLBACK_API_ORIGIN) ||
  "https://dashsimple.onrender.com";
const PRIMARY_API_ORIGIN =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_ORIGIN) || "";

const isRelativeApiPath = (url) => typeof url === "string" && url.startsWith("/api/");

const normalizeOrigin = (value) => String(value || "").trim().replace(/\/+$/, "");

const buildApiCandidates = (url) => {
  if (typeof url !== "string") return [url];
  const candidates = [];
  if (!isRelativeApiPath(url)) {
    return [url];
  }
  const primaryOrigin = normalizeOrigin(PRIMARY_API_ORIGIN);
  const fallbackOrigin = normalizeOrigin(FALLBACK_API_ORIGIN);

  const isLocalRuntime =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (isLocalRuntime) {
    // On localhost, only use the Vite proxy. Direct cross-origin hits to
    // `dashsimple.onrender.com` would always be CORS-blocked by the browser
    // and only cause confusing failures + console noise. Let the proxy handle it.
    return [url];
  }

  if (primaryOrigin) {
    candidates.push(`${primaryOrigin}${url}`);
  }
  if (fallbackOrigin && fallbackOrigin !== primaryOrigin) {
    candidates.push(`${fallbackOrigin}${url}`);
  }
  candidates.push(url);
  return Array.from(new Set(candidates));
};

// Fetch with a hard timeout. Aborts via AbortController if it exceeds `timeoutMs`.
const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

// In-flight request deduplication: if the same GET URL is already in flight,
// share the Promise instead of firing a second network request.
// Eliminates burst overload when multiple dashboards mount in parallel.
const inflight = new Map();

const dedupeKey = (url, options) => {
  const method = (options?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return null; // only dedupe safe methods
  return `${method} ${url}`;
};

export const apiFetch = async (url, options = {}, config = {}) => {
  const key = dedupeKey(url, options);
  if (key && inflight.has(key)) {
    // Share the in-flight request. Each caller gets its own Response clone
    // so they can independently call .json()/.text().
    try {
      const sharedResponse = await inflight.get(key);
      return sharedResponse.clone();
    } catch (e) {
      // The in-flight call rejected (e.g. AbortError from StrictMode cleanup).
      // Drop the dead entry and fall through to fire a fresh attempt.
      inflight.delete(key);
    }
  }

  const work = apiFetchInner(url, options, config);
  if (key) {
    inflight.set(key, work);
    // On success, free after 50ms so a quick retry can dedup.
    // On failure, free IMMEDIATELY so the next caller fires a fresh fetch
    // (rather than sharing a rejected Promise).
    work.then(
      () => setTimeout(() => inflight.delete(key), 50),
      () => inflight.delete(key)
    );
  }
  const response = await work;
  return key ? response.clone() : response;
};

const apiFetchInner = async (url, options = {}, config = {}) => {
  const headers = { ...(options.headers || {}) };
  const allow404Fallback = config.allow404Fallback !== false;
  // Retry config: 3 attempts total per candidate, exponential backoff: 500ms, 1s, 2s
  // Don't retry mutations (POST/PUT/PATCH/DELETE) — could double-write.
  const method = (options.method || "GET").toUpperCase();
  const isSafe = method === "GET" || method === "HEAD";
  const maxAttempts = config.retries ?? (isSafe ? 3 : 1);
  // 45s default — large media-stats responses (100k rows) take 5-15s on a slow connection.
  // 10s was too aggressive and was firing AbortError mid-download.
  const timeoutMs = config.timeoutMs ?? 45000;

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem("dash-auth") || "null");
      if (stored?.token && !headers.Authorization) {
        headers.Authorization = `Bearer ${stored.token}`;
      }
    } catch (error) {
      // ignore storage issues
    }
  }
  const requestOptions = { ...options, headers };
  const candidates = buildApiCandidates(url);
  let lastResponse = null;
  let lastError = null;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const candidate of candidates) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetchWithTimeout(candidate, requestOptions, timeoutMs);
        lastResponse = response;
        if (response.status !== 404 || !allow404Fallback) {
          if (response.status === 401 && typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:invalid"));
          }
          // Retry transient 5xx (500, 502, 504) but NEVER retry 503/429 —
          // those mean "back off". Retrying compounds the rate limit and makes
          // the upstream worse. Let the caller surface a clean error.
          const isTransient5xx =
            response.status === 500 || response.status === 502 || response.status === 504;
          if (isTransient5xx && attempt < maxAttempts) {
            await sleep(2 ** (attempt - 1) * 500);
            continue;
          }
          return response;
        }
        // 404 with fallback enabled — break attempt loop, try next candidate
        break;
      } catch (error) {
        lastError = error;
        // AbortError can come from our own timeout (legitimate) or from
        // React StrictMode dev-double-mount artifacts. Either way it's
        // transient — retry with backoff just like network/timeout errors.
        if (attempt < maxAttempts) {
          await sleep(2 ** (attempt - 1) * 500);
          continue;
        }
      }
    }
  }

  if (lastResponse) {
    if (lastResponse.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:invalid"));
    }
    return lastResponse;
  }
  if (lastError) throw lastError;
  throw new Error("API request failed.");
};
