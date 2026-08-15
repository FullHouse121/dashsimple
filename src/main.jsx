import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PublicReport from "./PublicReport.jsx";
import "flag-icons/css/flag-icons.min.css";
import "./styles.css";

// A share link mounts the report and nothing else — no dashboard, no session
// lookup, no login redirect. Decided here rather than inside App so a manager
// holding a token never loads code that expects an account to exist.
//
// Hash routing, because the rest of the app uses it and Netlify serves
// index.html for every path anyway: deusmachine.app/#/r/<token>
const shareToken = (() => {
  const m = String(window.location.hash || "").match(/^#\/r\/([A-Za-z0-9_-]{20,200})$/);
  return m ? m[1] : null;
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {shareToken ? <PublicReport token={shareToken} /> : <App />}
  </React.StrictMode>
);
