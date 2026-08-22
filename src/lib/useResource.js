// The request layer the views kept rewriting.
//
// apiFetch handles transport — retries, timeouts, in-flight dedup, the 401
// event. What sat on top of it was copied 160-odd times: check response.ok,
// parse the body, dig the server's message out of it, then a loading flag and
// an error string held in component state. The copies drifted: some surfaced
// the server's message, some showed a generic one, some left `loading` true
// on failure, and none of them ignored a stale response — a slow answer to a
// filter you had already changed would overwrite the newer one on arrival.
import React from "react";
import { apiFetch } from "./api.js";

// One request, one parsed body, one Error a person can read.
// The server answers errors as { error: "..." }; a proxy or a crash answers
// with HTML, so a body that will not parse is not itself a failure — only a
// non-ok status is, and then the fallback message carries the meaning.
export async function apiJson(url, options = {}, fallbackMessage = "Request failed.") {
  const response = await apiFetch(url, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error || payload?.message || fallbackMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

// Same thing with a JSON body, since every mutation wrote these two lines.
export function apiSend(url, method, body, fallbackMessage) {
  return apiJson(
    url,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    fallbackMessage
  );
}

/**
 * Load a URL on mount and whenever `deps` change.
 *
 * Returns { data, loading, error, reload, setData, setError }. `setData` is there for
 * the views that mutate a row and want the table to reflect it without a
 * round trip — the same optimistic update they were already doing by hand.
 *
 * `enabled: false` holds the request without unmounting the hook, for the
 * views gated on a role or on a filter that has not been chosen yet.
 */
export function useResource(url, options = {}) {
  const {
    enabled = true,
    initial = null,
    transform,
    errorMessage = "Failed to load.",
    deps = [],
  } = options;

  const [data, setData] = React.useState(initial);
  const [loading, setLoading] = React.useState(Boolean(enabled && url));
  const [error, setError] = React.useState(null);
  const [nonce, setNonce] = React.useState(0);

  // Bumped on every run; a response whose generation is stale is dropped
  // rather than written, so out-of-order arrivals cannot win.
  const generation = React.useRef(0);
  const transformRef = React.useRef(transform);
  transformRef.current = transform;

  React.useEffect(() => {
    if (!enabled || !url) {
      setLoading(false);
      return undefined;
    }
    const run = (generation.current += 1);
    let alive = true;
    setLoading(true);
    setError(null);

    apiJson(url, {}, errorMessage)
      .then((payload) => {
        if (!alive || run !== generation.current) return;
        setData(transformRef.current ? transformRef.current(payload) : payload);
        setLoading(false);
      })
      .catch((err) => {
        if (!alive || run !== generation.current) return;
        setError(err.message || errorMessage);
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [url, enabled, errorMessage, nonce, ...deps]);

  const reload = React.useCallback(() => setNonce((n) => n + 1), []);

  // setError so a view can surface a failed mutation in the same place the
  // load error appears, which is what the hand-written versions did with a
  // single {loading, error} object.
  return { data, loading, error, reload, setData, setError };
}
