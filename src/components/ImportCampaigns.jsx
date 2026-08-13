// Adopt campaigns that live in Keitaro but have no flow in the dashboard.
//
// My Flows only ever listed what the dashboard itself created, so campaigns
// older than the dashboard — or built straight in Keitaro — were invisible to
// the buyer running them. This dialog previews what would be adopted, grouped
// by the buyer it would go to, and writes only on confirm.
//
// The preview is the safety mechanism: ownership is derived from the campaign
// name, and getting it wrong puts one buyer's flow in another's list. So the
// dialog always shows who each campaign lands on, never just a count.
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, DownloadCloud, Loader2, RefreshCw, X } from "lucide-react";
import { apiFetch } from "../lib/api.js";
import { useLanguage } from "../lib/i18n/language.jsx";

// Why a campaign was left out, in the operator's terms. Only the actionable
// ones are listed per-campaign; the rest are a count.
const SKIP_LABELS = {
  already_imported: "Already in the dashboard",
  other_brand: "Another brand",
  external_group: "Outsourced group",
  unparseable_name: "Name doesn't follow Buyer | Tool | Game | Geo | Brand",
  no_matching_user: "No dashboard account for that buyer",
  no_link_url: "No alias or domain, so there is no link to hand over",
};

export function ImportCampaignsModal({ open, onClose, onImported, defaultBrands = [] }) {
  const { t } = useLanguage();
  const [preview, setPreview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [brands, setBrands] = React.useState(defaultBrands);
  const [excluded, setExcluded] = React.useState(() => new Set());
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const loadPreview = React.useCallback(async (brandList) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = brandList.length ? `?brands=${encodeURIComponent(brandList.join(","))}` : "";
      const response = await apiFetch(`/api/keitaro/importable-campaigns${qs}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not read Keitaro.");
      setPreview(data);
      // Everything is selected by default; the operator opts rows OUT.
      setExcluded(new Set());
    } catch (err) {
      setError(err.message || "Could not read Keitaro.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Keyed on `open` alone and deliberately so: re-previewing is a network
  // round-trip, and it should happen when the dialog opens or when the
  // operator changes the brand filter — not on every parent re-render.
  React.useEffect(() => {
    if (!open) return;
    setBrands(defaultBrands);
    loadPreview(defaultBrands);
  }, [open, defaultBrands, loadPreview]);

  const toggleBrand = (brand) => {
    const next = brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand];
    setBrands(next);
    loadPreview(next);
  };

  const toggleCampaign = (keitaroId) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(keitaroId)) next.delete(keitaroId);
      else next.add(keitaroId);
      return next;
    });
  };

  const toggleBuyer = (buyer) => {
    const ids = buyer.campaigns.map((c) => c.keitaroId);
    const allOut = ids.every((id) => excluded.has(id));
    setExcluded((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allOut ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const selectedIds = React.useMemo(() => {
    if (!preview) return [];
    return preview.buyers
      .flatMap((b) => b.campaigns.map((c) => c.keitaroId))
      .filter((id) => !excluded.has(id));
  }, [preview, excluded]);

  const runImport = async () => {
    if (!selectedIds.length) return;
    setImporting(true);
    setError(null);
    try {
      const response = await apiFetch("/api/keitaro/import-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brands, keitaroIds: selectedIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Import failed.");
      setResult(data);
      onImported?.(data);
    } catch (err) {
      setError(err.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  const buyers = preview?.buyers || [];
  const attention = preview?.needsAttention || [];
  const exclusionOff = preview && preview.externalGroups && !preview.externalGroups.active;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay modal-overlay-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal import-modal"
          onClick={(event) => event.stopPropagation()}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-head">
            <div className="import-head-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#36d07c" }}>
                <DownloadCloud size={16} />
              </span>
              <div>
                <p className="modal-kicker">{t("Keitaro")}</p>
                <h2>{t("Import campaigns")}</h2>
                <p className="panel-subtitle">
                  {t("Campaigns that exist in Keitaro but have no flow here. Each one is filed under the buyer named in the campaign.")}
                </p>
              </div>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label={t("Close")}>
              <X size={18} />
            </button>
          </div>

          {preview ? (
            <div className="import-brands">
              <span className="import-brands-label">{t("Brands")}</span>
              <div className="import-brand-chips">
                {Object.entries(preview.brands)
                  .sort((a, b) => b[1] - a[1])
                  .map(([brand, count]) => (
                    <button
                      key={brand}
                      type="button"
                      className={`import-brand-chip${brands.includes(brand) ? " is-on" : ""}`}
                      onClick={() => toggleBrand(brand)}
                      disabled={loading || importing}
                    >
                      {brand} <span className="import-brand-count">{count}</span>
                    </button>
                  ))}
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="import-loading">
              <Loader2 size={16} className="spin" /> {t("Reading Keitaro…")}
            </div>
          ) : null}

          {error ? <div className="form-error">{error}</div> : null}

          {result ? (
            <div className="import-result">
              <div className="import-result-head">
                <Check size={16} />
                <strong>
                  {result.imported} {t("campaigns imported")}
                </strong>
              </div>
              <ul className="import-result-list">
                {Object.entries(result.perBuyer || {}).map(([buyer, n]) => (
                  <li key={buyer}>
                    <span>{buyer}</span>
                    <strong>{n}</strong>
                  </li>
                ))}
              </ul>
              {result.failed?.length ? (
                <p className="import-warn">
                  {result.failed.length} {t("could not be written — see the server log.")}
                </p>
              ) : null}
              <p className="panel-subtitle">
                {t("They now appear in each buyer's My Flows. Bind a domain to make a flow routable.")}
              </p>
            </div>
          ) : null}

          {!loading && !result && preview ? (
            <>
              {exclusionOff ? (
                <div className="import-notice">
                  <AlertTriangle size={14} />
                  <div>
                    <strong>{t("Outsourced campaigns are NOT being excluded.")}</strong>{" "}
                    {t("EXTERNAL_CAMPAIGN_GROUPS does not resolve to a group on this tracker, so retired campaigns are eligible for import. Check the list below before importing.")}
                  </div>
                </div>
              ) : null}

              {!preview.total ? (
                <div className="empty-state">
                  {t("Nothing to import — every Keitaro campaign for these brands already has a flow.")}
                </div>
              ) : (
                <div className="import-body">
                  {buyers.map((buyer) => {
                    const outCount = buyer.campaigns.filter((c) => excluded.has(c.keitaroId)).length;
                    const allOut = outCount === buyer.campaigns.length;
                    return (
                      <section key={buyer.buyer} className="import-buyer">
                        <header className="import-buyer-head">
                          <label className="import-check">
                            <input
                              type="checkbox"
                              checked={!allOut}
                              onChange={() => toggleBuyer(buyer)}
                            />
                            <span className="import-buyer-name">{buyer.buyer}</span>
                          </label>
                          <span className="roles-count">
                            {buyer.campaigns.length - outCount} / {buyer.campaigns.length}
                          </span>
                        </header>
                        <ul className="import-campaign-list">
                          {buyer.campaigns.map((c) => (
                            <li key={c.keitaroId} className={excluded.has(c.keitaroId) ? "is-out" : ""}>
                              <label className="import-check">
                                <input
                                  type="checkbox"
                                  checked={!excluded.has(c.keitaroId)}
                                  onChange={() => toggleCampaign(c.keitaroId)}
                                />
                                <span className="import-campaign-name">{c.name}</span>
                              </label>
                              <span className="import-campaign-meta">
                                {c.domain}
                                {c.state !== "active" ? <em className="import-paused"> · {t("paused")}</em> : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              )}

              {attention.length ? (
                <details className="import-attention">
                  <summary>
                    {attention.length} {t("campaigns cannot be imported")}
                  </summary>
                  <ul>
                    {attention.map((a) => (
                      <li key={a.id}>
                        <span className="import-campaign-name">{a.name}</span>
                        <em>{t(SKIP_LABELS[a.reason] || a.reason)}</em>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </>
          ) : null}

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={() => loadPreview(brands)} disabled={loading || importing}>
              <RefreshCw size={13} /> {t("Refresh")}
            </button>
            <div className="import-actions-right">
              <button type="button" className="ghost" onClick={onClose}>
                {result ? t("Done") : t("Cancel")}
              </button>
              {!result ? (
                <button
                  type="button"
                  className="action-pill"
                  onClick={runImport}
                  disabled={importing || loading || !selectedIds.length}
                >
                  {importing ? <Loader2 size={13} className="spin" /> : <DownloadCloud size={13} />}{" "}
                  {importing
                    ? t("Importing…")
                    : `${t("Import")} ${selectedIds.length}`}
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ImportCampaignsModal;
