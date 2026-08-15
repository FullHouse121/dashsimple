// The page a manager sees when they open a share link.
//
// Mounted before App so it never touches the dashboard: no session lookup, no
// nav, no data fetching beyond the one public endpoint. Someone holding this
// URL has a token and nothing else, and the page is built so that is all it
// ever needs — a stray call to an authenticated endpoint here would 401 and
// make the report look broken to the only person it was made for.
import React from "react";
import ExecutiveReport from "./components/ExecutiveReport.jsx";

// Deliberately not apiFetch: that attaches the viewer's stored bearer token if
// one happens to exist, which would make this behave differently for a
// logged-in colleague than for the manager it was sent to.
const API_BASE = import.meta.env.VITE_API_TARGET || "";

export default function PublicReport({ token }) {
  const [state, setState] = React.useState({ loading: true, error: null, report: null });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/report/${encodeURIComponent(token)}`);
        const body = await res.json().catch(() => ({}));
        if (!alive) return;
        if (!res.ok) throw new Error(body?.error || "This report could not be loaded.");
        setState({ loading: false, error: null, report: body });
      } catch (error) {
        if (alive) setState({ loading: false, error: error.message, report: null });
      }
    })();
    return () => { alive = false; };
  }, [token]);

  return (
    <div className="pubrep">
      <div className="pubrep-sheet">
        {state.loading ? (
          <p className="pubrep-msg">Loading report…</p>
        ) : state.error ? (
          // An expired or revoked link is the expected ending for every link,
          // not an error state — say what happened and who to ask.
          <div className="pubrep-msg">
            <h1 className="pubrep-msg-title">Report unavailable</h1>
            <p>{state.error}</p>
            <p className="pubrep-msg-sub">Ask whoever sent you this link for a new one.</p>
          </div>
        ) : (
          <>
            <ExecutiveReport report={state.report} />
            <div className="pubrep-actions xr-noprint">
              <button type="button" className="action-pill" onClick={() => window.print()}>
                Export PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
