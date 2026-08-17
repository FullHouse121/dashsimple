// Where a manager's report is generated, printed and shared.
//
// Kept apart from the query builder because they answer different questions
// for different people: the builder is a buyer pulling one table, this is a
// manager taking a decision. Sharing them a screen would make each worse.
import React from "react";
import { motion } from "framer-motion";
import { Copy, Trash2, Link2, FileText, RefreshCw } from "lucide-react";
import { apiFetch } from "../lib/api.js";
import ExecutiveReport from "./ExecutiveReport.jsx";
import { DeusDatePicker, Select } from "./Select.jsx";

const isoDay = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => isoDay(new Date(Date.now() - n * 86400000));

export default function ExecutiveReportPanel({ t }) {
  const [range, setRange] = React.useState({ from: daysAgo(29), to: isoDay(new Date()) });
  const [state, setState] = React.useState({ loading: true, error: null, report: null });
  const [shares, setShares] = React.useState([]);
  const [shareBusy, setShareBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(null);
  const [expiryDays, setExpiryDays] = React.useState(30);

  const load = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiFetch(`/api/reports/executive?from=${range.from}&to=${range.to}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to build the report.");
      setState({ loading: false, error: null, report: body });
    } catch (error) {
      setState({ loading: false, error: error.message, report: null });
    }
  }, [range.from, range.to]);

  const loadShares = React.useCallback(async () => {
    try {
      const res = await apiFetch("/api/report-shares");
      if (res.ok) setShares(await res.json());
    } catch (error) {
      /* the list is a convenience; failing to load it must not block the report */
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { loadShares(); }, [loadShares]);

  const createShare = async () => {
    setShareBusy(true);
    try {
      const res = await apiFetch("/api/report-shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...range, title: state.report?.title, expiresInDays: expiryDays }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        await loadShares();
        // Straight to the clipboard: the next thing anyone does with a share
        // link is paste it somewhere.
        const url = `${window.location.origin}/#/r/${body.token}`;
        await navigator.clipboard?.writeText(url).catch(() => {});
        setCopied(body.token);
        window.setTimeout(() => setCopied(null), 2500);
      }
    } finally {
      setShareBusy(false);
    }
  };

  const revoke = async (id) => {
    await apiFetch(`/api/report-shares/${id}`, { method: "DELETE" });
    await loadShares();
  };

  const live = shares.filter((s) => !s.revoked_at && new Date(s.expires_at) > new Date());

  return (
    <>
      <motion.div className="panel xr-noprint" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="panel-head">
          <div>
            <h3 className="panel-title">{t("Executive report")}</h3>
            <p className="panel-subtitle">
              {t("The whole operation in one view, for whoever is deciding where money goes.")}
            </p>
          </div>
          <div className="campaign-table-actions">
            <button type="button" className="ghost" onClick={load} disabled={state.loading}>
              <RefreshCw size={14} /> {t("Rebuild")}
            </button>
            <button type="button" className="action-pill" onClick={() => window.print()} disabled={!state.report}>
              <FileText size={14} /> {t("Export PDF")}
            </button>
          </div>
        </div>

        <div className="form-grid xr-controls">
          <div className="field">
            <label>{t("From")}</label>
            <DeusDatePicker
              value={range.from}
              max={range.to || ""}
              onChange={(v) => setRange((r) => ({ ...r, from: v }))}
            />
          </div>
          <div className="field">
            <label>{t("To")}</label>
            <DeusDatePicker
              value={range.to}
              min={range.from || ""}
              onChange={(v) => setRange((r) => ({ ...r, to: v }))}
            />
          </div>
          <div className="field">
            <label>{t("Share link expires in")}</label>
            <Select
              value={String(expiryDays)}
              onChange={(v) => setExpiryDays(Number(v))}
              options={[7, 30, 90].map((d) => ({ value: String(d), label: `${d} ${t("days")}` }))}
            />
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <button type="button" className="action-pill" onClick={createShare} disabled={shareBusy || !state.report}>
              <Link2 size={14} /> {shareBusy ? t("Creating…") : t("Create share link")}
            </button>
          </div>
        </div>

        {/* Anyone with the URL can read it, so the page says so where the link
            is made rather than in documentation nobody opens. */}
        <p className="xr-share-note">
          {t("Anyone holding a share link can open this report without signing in. Links expire on the date shown and can be revoked at any time.")}
        </p>

        {live.length ? (
          <div className="table-wrap">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>{t("Link")}</th><th>{t("Period")}</th><th>{t("Created by")}</th>
                  <th>{t("Expires")}</th><th>{t("Opens")}</th><th />
                </tr>
              </thead>
              <tbody>
                {live.map((s) => {
                  const url = `${window.location.origin}/#/r/${s.token}`;
                  return (
                    <tr key={s.id}>
                      <td className="xr-share-url">{`…${String(s.token).slice(-8)}`}</td>
                      <td>{s.config ? `${s.config.from} → ${s.config.to}` : "—"}</td>
                      <td>{s.created_by_name || "—"}</td>
                      <td>{new Date(s.expires_at).toLocaleDateString()}</td>
                      <td>
                        {s.view_count || 0}
                        {s.last_viewed_at ? (
                          <small className="offer-muted"> · {new Date(s.last_viewed_at).toLocaleDateString()}</small>
                        ) : null}
                      </td>
                      <td>
                        <div className="campaign-table-actions">
                          <button
                            className="icon-btn"
                            type="button"
                            title={t("Copy link")}
                            onClick={() => {
                              navigator.clipboard?.writeText(url);
                              setCopied(s.token);
                              window.setTimeout(() => setCopied(null), 2500);
                            }}
                          >
                            <Copy size={15} />
                          </button>
                          <button className="icon-btn" type="button" title={t("Revoke link")} onClick={() => revoke(s.id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        {copied ? <p className="xr-copied">{t("Link copied to clipboard")}</p> : null}
      </motion.div>

      <motion.div className="panel xr-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {state.loading ? (
          <div className="empty-state">{t("Building the report…")}</div>
        ) : state.error ? (
          <div className="empty-state error">{state.error}</div>
        ) : (
          <ExecutiveReport report={state.report} />
        )}
      </motion.div>
    </>
  );
}
