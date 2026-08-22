import React from "react";
import keitaroLogo from "../assets/brands/keitaro.svg";
import { CountryDropdownPicker } from "../components/Select.jsx";
import { TagInput } from "../components/TagInput.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { TelegramGlyph } from "../components/glyphs.jsx";
import { LinkIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { apiJson } from "../lib/useResource.js";
import { appConfirm } from "../lib/confirm.jsx";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, dialogMotion, overlayMotion, rowMotion } from "../lib/motion.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { compareSortValues, getSortIndicator, toggleSortConfig } from "../lib/sort.js";
import {
  ALLOWED_TRACKING_DOMAINS,
  DEFAULT_TRACKING_PARAMS,
  TRACKING_FILTER_BY_NAME,
  TRACKING_FILTER_CATALOG,
  TRACKING_GEO_NAMES,
  TRACKING_GEO_PRESETS,
  applyExternalIdMacro,
  externalIdMacroForTool,
  normalizeTrackingHost,
  trackingSourceShortcode,
} from "../lib/tracking.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Copy,
  Eye,
  Link2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
  Zap,
} from "lucide-react";

export default function TrackingLinksDashboard({ authUser }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const [links, setLinks] = React.useState([]);
  const [linkState, setLinkState] = React.useState({ loading: true, error: null });
  const [showForm, setShowForm] = React.useState(false);
  const [saveState, setSaveState] = React.useState({ saving: false, message: "", ok: null });
  const [copiedId, setCopiedId] = React.useState(null);
  const [pushingId, setPushingId] = React.useState(null);
  const [form, setForm] = React.useState(() => ({
    buyer: authUser?.username || "",
    tool: "",
    trafficSourceId: "",
    game: "",
    geo: "",
    brand: "",
    domain: localStorage.getItem("tracking-domain") || "",
    domainId: localStorage.getItem("tracking-domain-id") || "",
    alias: "",
    offerId: "",
    filterConfig: { logic: "and", rules: [] },
    params: DEFAULT_TRACKING_PARAMS,
    externalIdMacro: "",
    pushToKeitaro: true,
    sendFtdToBot: true,
  }));

  // Mirrors the server's POSTBACK_BUYER_MAP so the form can preview which bot
  // identifier this buyer's FTDs report as (display only — the server is the
  // source of truth for the actual postback).
  const resolvedBotBuyer = React.useMemo(() => {
    const MAP = {
      leo: "leo", leomarketing: "leo",
      karen: "karen", karenfarias: "karen",
      sara: "sara", carvalho: "carvalho", akku: "akku", enzo: "enzo",
      matheus: "hail", leticia: "nobre",
    };
    const key = String(form.buyer || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!key) return "unknown";
    if (MAP[key]) return MAP[key];
    for (const [k, v] of Object.entries(MAP)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
    return key;
  }, [form.buyer]);
  const [filterModalOpen, setFilterModalOpen] = React.useState(false);
  const [filterDraft, setFilterDraft] = React.useState({ logic: "and", rules: [] });

  const openFilterModal = () => {
    setFilterDraft({
      logic: form.filterConfig.logic || "and",
      rules: (form.filterConfig.rules || []).map((r) => ({ ...r, payload: [...(r.payload || [])] })),
    });
    setFilterModalOpen(true);
  };
  const applyFilters = () => {
    setForm((prev) => ({
      ...prev,
      filterConfig: {
        logic: filterDraft.logic,
        rules: filterDraft.rules.filter((r) => r.name),
      },
    }));
    setFilterModalOpen(false);
  };
  const addFilterRule = () =>
    setFilterDraft((prev) => ({ ...prev, rules: [...prev.rules, { name: "country", mode: "accept", payload: [] }] }));
  const updateFilterRule = (idx, patch) =>
    setFilterDraft((prev) => ({
      ...prev,
      rules: prev.rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  const removeFilterRule = (idx) =>
    setFilterDraft((prev) => ({ ...prev, rules: prev.rules.filter((_, i) => i !== idx) }));
  // Live Keitaro resources (domains, traffic sources, offers, groups)
  const [resources, setResources] = React.useState({ domains: [], trafficSources: [], groups: [], offers: [] });
  const [resourcesError, setResourcesError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiJson("/api/keitaro/resources", "Failed to load Keitaro resources.");
        if (!cancelled) {
          setResources({
            domains: data.domains || [],
            trafficSources: data.trafficSources || [],
            groups: data.groups || [],
            offers: data.offers || [],
          });
          setResourcesError(null);
        }
      } catch (error) {
        if (!cancelled) setResourcesError(error.message || "Failed to load Keitaro resources.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Buyer roster for the Edit modal's Buyer dropdown — the team members
  // (from /api/users) plus any registered media buyers. Leadership only.
  const [buyerRoster, setBuyerRoster] = React.useState([]);
  React.useEffect(() => {
    if (!isLeadership) return;
    let cancelled = false;
    (async () => {
      try {
        const [ur, br] = await Promise.all([
          apiFetch("/api/users?limit=300"),
          apiFetch("/api/media-buyers?limit=500"),
        ]);
        const [ud, bd] = await Promise.all([
          ur.ok ? ur.json() : [],
          br.ok ? br.json() : [],
        ]);
        if (cancelled) return;
        const names = [
          ...(Array.isArray(ud) ? ud.map((u) => u.username) : []),
          ...(Array.isArray(bd) ? bd.map((b) => b.name) : []),
        ]
          .map((n) => String(n || "").trim())
          .filter(Boolean);
        setBuyerRoster(names);
      } catch (error) {
        /* roster is best-effort; the field still allows typing */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLeadership]);

  const [buyerFilter, setBuyerFilter] = React.useState([]);
  const [toolFilter, setToolFilter] = React.useState([]);
  const [geoFilter, setGeoFilter] = React.useState([]);
  const [trackingSearch, setTrackingSearch] = React.useState("");
  const toggleTableFilter = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));

  // Only the 3 allowed tracking domains are selectable — drop any stale saved
  // domain (from a previous session) that isn't one of them.
  React.useEffect(() => {
    if (form.domain && !ALLOWED_TRACKING_DOMAINS.includes(normalizeTrackingHost(form.domain))) {
      setForm((prev) => ({ ...prev, domain: "", domainId: "" }));
    }
  }, [form.domain]);

  const updateForm = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const fetchLinks = React.useCallback(async () => {
    try {
      setLinkState({ loading: true, error: null });
      const response = await apiFetch("/api/tracking-links?limit=500");
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load tracking links.");
      }
      const data = await response.json();
      setLinks(Array.isArray(data) ? data : []);
      setLinkState({ loading: false, error: null });
    } catch (error) {
      setLinkState({ loading: false, error: error.message || "Failed to load tracking links." });
    }
  }, []);

  React.useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const seg = (v) => String(v || "").trim() || "-";
  const previewName = [
    String(form.buyer || "").trim() || authUser?.username || "Buyer",
    seg(form.tool),
    seg(form.game),
    seg(form.geo),
    seg(form.brand),
  ].join(" | ");
  const previewUrl = (() => {
    const host = String(form.domain || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const path = String(form.alias || "").trim().replace(/^\/+/, "") || (form.pushToKeitaro ? "{auto}" : "");
    const qs = String(form.params || "").trim().replace(/^\?+/, "");
    if (!host || !path) return "";
    return `https://${host}/${path}${qs ? `?${qs}` : ""}`;
  })();

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!String(form.tool).trim()) {
      setSaveState({ saving: false, ok: false, message: t("Tool is required.") });
      return;
    }
    if (!String(form.domain).trim()) {
      setSaveState({ saving: false, ok: false, message: t("Tracking domain is required.") });
      return;
    }
    if (!form.pushToKeitaro && !String(form.alias).trim()) {
      setSaveState({ saving: false, ok: false, message: t("Alias is required when not pushing to Keitaro.") });
      return;
    }
    setSaveState({ saving: true, ok: null, message: "" });
    try {
      localStorage.setItem("tracking-domain", String(form.domain || "").trim());
      localStorage.setItem("tracking-domain-id", String(form.domainId || ""));
      const response = await apiFetch("/api/tracking-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, filters: JSON.stringify(form.filterConfig) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Failed to save tracking link.");
      }
      const k = data?.keitaro;
      setSaveState({
        saving: false,
        ok: true,
        message:
          k?.status === "created"
            ? `${t("Campaign created in Keitaro")}${k.id ? ` (ID ${k.id})` : ""}${k.alias ? ` · alias ${k.alias}` : ""}.`
            : k?.status === "partial"
              ? `${t("Campaign created, offer/stream failed")}: ${k.error || ""}`
              : k?.status === "failed"
                ? `${t("Stored locally — Keitaro push failed")}: ${k.error || ""}`
                : t("Link stored."),
      });
      setForm((prev) => ({ ...prev, game: "", brand: "", alias: "", offerId: "", filterConfig: { logic: "and", rules: [] } }));
      await fetchLinks();
    } catch (error) {
      setSaveState({ saving: false, ok: false, message: error.message || "Failed to save tracking link." });
    }
  };

  const handleCopy = (id, url) => async () => {
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1200);
    } catch (error) {
      // clipboard denied — ignore
    }
  };

  const handlePush = (id) => async () => {
    setPushingId(id);
    try {
      await apiJson(`/api/tracking-links/${id}/push`, { method: "POST" }, "Push failed.");
      await fetchLinks();
    } catch (error) {
      setLinkState((prev) => ({ ...prev, error: error.message || "Push failed." }));
    } finally {
      setPushingId(null);
    }
  };

  const handleDelete = (id) => async () => {
    const confirmed = await appConfirm({
      title: "Remove tracking link?",
      message: "This also deletes the campaign in Keitaro. This cannot be undone.",
      confirmLabel: "Remove link",
    });
    if (!confirmed) return;
    try {
      await apiJson(`/api/tracking-links/${id}`, { method: "DELETE" }, "Failed to delete link.");
      await fetchLinks();
    } catch (error) {
      setLinkState((prev) => ({ ...prev, error: error.message || "Failed to delete link." }));
    }
  };

  const [togglingId, setTogglingId] = React.useState(null);
  const handleToggleState = (link) => async () => {
    const next = String(link.state || "active") === "active" ? "disabled" : "active";
    setTogglingId(link.id);
    try {
      await apiJson(`/api/tracking-links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: next }),
      }, "Failed to update status.");
      await fetchLinks();
    } catch (error) {
      setLinkState((prev) => ({ ...prev, error: error.message || "Failed to update status." }));
    } finally {
      setTogglingId(null);
    }
  };

  // Details / verify modal
  const [details, setDetails] = React.useState({ open: false, link: null, verify: null, verifying: false, error: null });
  const [editModal, setEditModal] = React.useState({ open: false, link: null, saving: false, error: null, form: { buyer: "", game: "", geo: "", brand: "" } });

  const openDetails = (link, autoVerify = false) => {
    setDetails({ open: true, link, verify: null, verifying: autoVerify, error: null });
    if (autoVerify) runVerify(link.id);
  };
  const runVerify = async (id) => {
    setDetails((prev) => ({ ...prev, verifying: true, error: null }));
    try {
      const data = await apiJson(`/api/tracking-links/${id}/verify`, "Verify failed.");
      setDetails((prev) => ({ ...prev, verify: data, verifying: false }));
    } catch (error) {
      setDetails((prev) => ({ ...prev, verifying: false, error: error.message || "Verify failed." }));
    }
  };

  const openEdit = (link) => {
    setEditModal({
      open: true,
      link,
      saving: false,
      error: null,
      form: {
        buyer: link.buyer || "",
        game: link.game || "",
        geo: link.geo || "",
        brand: link.brand || "",
        offerId: String(link.offerId ?? link.offer_id ?? ""),
      },
    });
  };
  const saveEdit = async () => {
    if (!editModal.link) return;
    setEditModal((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const data = await apiJson(`/api/tracking-links/${editModal.link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editModal.form),
      }, "Failed to save.");
      setEditModal({ open: false, link: null, saving: false, error: null, form: { buyer: "", game: "", geo: "", brand: "" } });
      await fetchLinks();
    } catch (error) {
      setEditModal((prev) => ({ ...prev, saving: false, error: error.message || "Failed to save." }));
    }
  };

  // Deep link from the Campaigns table: prefill search and open the edit
  // modal for the matching link (when the campaign was created here).
  React.useEffect(() => {
    let pending = null;
    try {
      pending = sessionStorage.getItem("pending-edit-campaign");
    } catch { /* ignore */ }
    if (!pending || !links.length) return;
    try {
      sessionStorage.removeItem("pending-edit-campaign");
    } catch { /* ignore */ }
    setTrackingSearch(pending);
    const match = links.find((l) => String(l.name || "").trim() === pending);
    if (match) openEdit(match);
  }, [links]);

  const parseFilterConfig = (raw) => {
    if (!raw) return { logic: "and", rules: [] };
    try {
      const cfg = typeof raw === "string" ? JSON.parse(raw) : raw;
      return { logic: cfg.logic || "and", rules: Array.isArray(cfg.rules) ? cfg.rules : [] };
    } catch (error) {
      return { logic: "and", rules: [] };
    }
  };

  const optionFrom = (values) =>
    Array.from(new Set(values.filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  const buyerFilterOptions = React.useMemo(
    () => optionFrom(links.map((l) => String(l.buyer || "").trim())),
    [links]
  );
  // Buyer picker options for the Edit modal: the roster (team + media buyers)
  // merged with any buyer already used on a link. Typing a custom value is
  // still allowed, so alias forms (e.g. KarenFarias) remain possible.
  const editBuyerOptions = React.useMemo(
    () => optionFrom([...buyerRoster, ...links.map((l) => String(l.buyer || "").trim())]),
    [buyerRoster, links]
  );
  const toolFilterOptions = React.useMemo(
    () => optionFrom(links.map((l) => String(l.tool || "").trim())),
    [links]
  );
  const geoFilterOptions = React.useMemo(
    () => optionFrom(links.map((l) => String(l.geo || "").trim())),
    [links]
  );

  React.useEffect(() => {
    // Prune any selected multi-filter values that are no longer valid options.
    // Return the same array ref when nothing changed to avoid a render loop.
    const prune = (setter, options) =>
      setter((prev) => {
        const next = prev.filter((v) => options.some((option) => option.value === v));
        return next.length === prev.length ? prev : next;
      });
    prune(setBuyerFilter, buyerFilterOptions);
    prune(setToolFilter, toolFilterOptions);
    prune(setGeoFilter, geoFilterOptions);
  }, [buyerFilterOptions, toolFilterOptions, geoFilterOptions]);

  const trackingFiltersActive = buyerFilter.length > 0 || toolFilter.length > 0 || geoFilter.length > 0;
  const clearTrackingFilters = () => {
    setBuyerFilter([]);
    setToolFilter([]);
    setGeoFilter([]);
  };

  const normalizedTrackingSearch = trackingSearch.trim().toLowerCase();
  const filteredLinks = React.useMemo(
    () =>
      links.filter((l) => {
        if (normalizedTrackingSearch) {
          const hay = `${l.name || ""} ${l.owner_name || ""}`.toLowerCase();
          if (!hay.includes(normalizedTrackingSearch)) return false;
        }
        if (buyerFilter.length && !buyerFilter.includes(String(l.buyer || "").trim())) return false;
        if (toolFilter.length && !toolFilter.includes(String(l.tool || "").trim())) return false;
        if (geoFilter.length && !geoFilter.includes(String(l.geo || "").trim())) return false;
        return true;
      }),
    [links, normalizedTrackingSearch, buyerFilter, toolFilter, geoFilter]
  );

  const [trackingSort, setTrackingSort] = React.useState({ key: null, dir: "asc" });
  const toggleTrackingSort = (key) => setTrackingSort((prev) => toggleSortConfig(prev, key, "asc"));
  const getTrackingSortValue = (link, key) => {
    switch (key) {
      case "campaign": return link.name || "";
      case "status": return String(link.state || "");
      case "geo": return link.geo || "";
      case "link": return `${String(link.domain || "")}/${String(link.alias || "")}`;
      case "keitaro": return String(link.keitaro_status || "");
      case "owner": return link.owner_name || "";
      default: return null;
    }
  };
  const sortedLinks = React.useMemo(() => {
    const rows = [...filteredLinks];
    if (!trackingSort?.key) return rows;
    return rows.sort((a, b) =>
      compareSortValues(
        getTrackingSortValue(a, trackingSort.key),
        getTrackingSortValue(b, trackingSort.key),
        trackingSort.dir,
        "text"
      )
    );
  }, [filteredLinks, trackingSort]);

  const summary = React.useMemo(() => {
    const total = links.length;
    let created = 0;
    let local = 0;
    let failed = 0;
    links.forEach((l) => {
      const s = String(l.keitaro_status || "local");
      if (s === "created") created += 1;
      else if (s === "failed") failed += 1;
      else local += 1;
    });
    return { total, created, local, failed };
  }, [links]);

  const keitaroChip = (link) => {
    const status = String(link.keitaro_status || "local");
    if (status === "created") {
      return (
        <span className="geo-chip keitaro-chip" title={link.keitaro_id ? `Keitaro ID ${link.keitaro_id}` : "Keitaro"}>
          <img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" />
          {link.keitaro_id ? `#${link.keitaro_id}` : ""}
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="geo-chip" title={link.keitaro_error || ""}>
          <span className="cs-dot" style={{ background: "#ff8a7a" }} aria-hidden="true" />
          {t("Push failed")}
        </span>
      );
    }
    return (
      <span className="geo-chip">
        <span className="cs-dot" style={{ background: "#8a93a3" }} aria-hidden="true" />
        {t("Local")}
      </span>
    );
  };

  return (
    <section className="form-section">
      <AnimatePresence>
        {filterModalOpen ? (
          <motion.div
            className="modal-overlay"
            {...overlayMotion}
            onClick={() => setFilterModalOpen(false)}
          >
            <motion.div
              className="modal pixel-edit-modal tracking-filter-modal"
              {...dialogMotion}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Stream Filters")}</p>
                  <h2>{t("Keitaro filters")}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={() => setFilterModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body tracking-filter-body">
                <div className="tracking-filter-logic">
                  <span className="tracking-filter-logic-label">{t("Logical relation")}</span>
                  <div className="tracking-logic-toggle">
                    {["and", "or"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={filterDraft.logic === mode ? "is-active" : ""}
                        onClick={() => setFilterDraft((prev) => ({ ...prev, logic: mode }))}
                      >
                        {mode.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {filterDraft.rules.length === 0 ? (
                  <div className="tracking-filter-empty">{t("No filters yet. Add a rule below.")}</div>
                ) : (
                  <div className="tracking-filter-rules">
                    {filterDraft.rules.map((rule, idx) => {
                      const meta = TRACKING_FILTER_BY_NAME[rule.name] || {};
                      return (
                        <div className="tracking-filter-rule" key={idx}>
                          <div className="tracking-filter-rule-head">
                            <CountryDropdownPicker
                              value={rule.name}
                              onChange={(name) => updateFilterRule(idx, { name, payload: [] })}
                              options={TRACKING_FILTER_CATALOG.map((f) => ({
                                value: f.name,
                                label: `${f.group} · ${f.label}`,
                                search: `${f.group} ${f.label} ${f.name}`,
                              }))}
                              placeholder={t("Select filter")}
                              searchPlaceholder={t("Find filter")}
                              emptyResultsLabel={t("No filters found.")}
                            />
                            <div className="tracking-mode-toggle">
                              <button
                                type="button"
                                className={rule.mode === "accept" ? "is-active is-ok" : ""}
                                onClick={() => updateFilterRule(idx, { mode: "accept" })}
                              >
                                {t("IS")}
                              </button>
                              <button
                                type="button"
                                className={rule.mode === "reject" ? "is-active is-bad" : ""}
                                onClick={() => updateFilterRule(idx, { mode: "reject" })}
                              >
                                {t("IS NOT")}
                              </button>
                            </div>
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              onClick={() => removeFilterRule(idx)}
                              title={t("Remove")}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {meta.bool ? (
                            <p className="tracking-filter-note">
                              {t("This filter has no values — it matches by presence.")}
                            </p>
                          ) : (
                            <TagInput
                              values={rule.payload || []}
                              onChange={(payload) => updateFilterRule(idx, { payload })}
                              placeholder={
                                meta.options
                                  ? meta.options.join(", ")
                                  : t("Type a value, Enter or comma to add")
                              }
                              options={meta.options}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <button type="button" className="tracking-filter-add" onClick={addFilterRule}>
                  <Plus size={13} strokeWidth={2.5} /> {t("Add filter")}
                </button>
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={() => setFilterModalOpen(false)}>
                  {t("Cancel")}
                </button>
                <button className="action-pill" type="button" onClick={applyFilters}>
                  {t("Apply filters")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {details.open ? (
          <motion.div className="modal-overlay" {...overlayMotion} onClick={() => setDetails({ open: false, link: null, verify: null, verifying: false, error: null })}>
            <motion.div
              className="modal pixel-edit-modal tracking-details-modal"
              {...dialogMotion}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Campaign Flow")}</p>
                  <h2>{details.link?.name}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={() => setDetails({ open: false, link: null, verify: null, verifying: false, error: null })}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body tracking-details-body">
                <div className="og-props">
                  {[
                    ["Buyer", details.link?.buyer],
                    ["Tool", details.link?.tool],
                    ["Game / Offer", details.link?.game],
                    ["GEO", details.link?.geo],
                    ["Brand", details.link?.brand],
                    ["Link", details.link?.url],
                  ].map(([k, v]) => (
                    <div className="og-prop" key={k}>
                      <span className="og-prop-key">{t(k)}</span>
                      <span className={`og-prop-val${k === "Link" ? " og-prop-mono" : ""}`}>{v || "—"}</span>
                    </div>
                  ))}
                </div>

                {(() => {
                  const cfg = parseFilterConfig(details.link?.filters);
                  return cfg.rules.length ? (
                    <div className="tracking-details-section">
                      <div className="og-history-head">
                        <SlidersHorizontal size={13} /> {t("Filters")} · {cfg.logic.toUpperCase()}
                      </div>
                      <div className="tracking-details-filters">
                        {cfg.rules.map((r, i) => (
                          <span className="geo-chip" key={i}>
                            <span className="cs-dot" style={{ background: r.mode === "reject" ? "#ff8a7a" : "#36d07c" }} />
                            {(TRACKING_FILTER_BY_NAME[r.name]?.label || r.name)} {r.mode === "reject" ? "≠" : "="} {(r.payload || []).join(", ") || "✓"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="tracking-filter-note">{t("No filters on this campaign.")}</p>
                  );
                })()}

                <div className="tracking-details-section">
                  <div className="tracking-details-verify-head">
                    <span className="og-history-head"><ShieldCheck size={13} /> {t("Live in Keitaro")}</span>
                    <button className="ghost" type="button" onClick={() => runVerify(details.link.id)} disabled={details.verifying}>
                      {details.verifying ? t("Checking…") : t("Verify now")}
                    </button>
                  </div>
                  {details.error ? (
                    <div className="api-status error">{details.error}</div>
                  ) : details.verify ? (
                    details.verify.exists ? (
                      <div className="tracking-verify-result">
                        <span className="geo-chip">
                          <span className="cs-dot" style={{ background: details.verify.state === "active" ? "#36d07c" : "#ffc94d" }} />
                          {t("State")}: {details.verify.state}
                        </span>
                        {details.verify.streams.map((s) => (
                          <div className="tracking-stream-row" key={s.id}>
                            <strong>{s.name}</strong>
                            <span className="offer-muted">
                              {s.offers.length ? `${s.offers.length} offer(s)` : "no offer"} · {s.filters.length ? `${s.filters.length} filter(s)` : "no filters"} · {s.filter_or ? "OR" : "AND"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="api-status error">{t("Campaign not found in Keitaro.")}</div>
                    )
                  ) : (
                    <p className="tracking-filter-note">{t("Click Verify to read the live campaign back from Keitaro.")}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editModal.open ? (
          <motion.div className="modal-overlay" {...overlayMotion} onClick={() => setEditModal((p) => ({ ...p, open: false }))}>
            <motion.div
              className="modal pixel-edit-modal"
              {...dialogMotion}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Edit Tracking Link")}</p>
                  <h2>{editModal.link?.name}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={() => setEditModal((p) => ({ ...p, open: false }))}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field field-span-2">
                  <label>{t("Buyer")}</label>
                  {isLeadership ? (
                    <CountryDropdownPicker
                      value={editModal.form.buyer}
                      onChange={(v) => setEditModal((p) => ({ ...p, form: { ...p.form, buyer: v } }))}
                      options={editBuyerOptions}
                      allowCustom
                      placeholder={t("Select or type a buyer")}
                      searchPlaceholder={t("Find or type a buyer")}
                      emptyResultsLabel={t("Type to add a buyer.")}
                    />
                  ) : (
                    <input value={editModal.form.buyer} readOnly />
                  )}
                  <p className="field-hint">{t("First segment of the campaign name. Saving renames it in Keitaro too.")}</p>
                </div>
                <div className="field">
                  <label>{t("Game / Offer")}</label>
                  <input value={editModal.form.game} onChange={(e) => setEditModal((p) => ({ ...p, form: { ...p.form, game: e.target.value } }))} />
                </div>
                <div className="field">
                  <label>{t("GEO")}</label>
                  <input value={editModal.form.geo} onChange={(e) => setEditModal((p) => ({ ...p, form: { ...p.form, geo: e.target.value } }))} />
                </div>
                <div className="field">
                  <label>{t("Brand")}</label>
                  <input value={editModal.form.brand} onChange={(e) => setEditModal((p) => ({ ...p, form: { ...p.form, brand: e.target.value } }))} />
                </div>
                <div className="field field-span-2">
                  <label>{t("Keitaro Offer")}</label>
                  <CountryDropdownPicker
                    value={editModal.form.offerId}
                    onChange={(v) => setEditModal((p) => ({ ...p, form: { ...p.form, offerId: v || "" } }))}
                    options={resources.offers.map((offer) => ({
                      value: String(offer.id),
                      label: offer.country ? `${offer.name} · ${offer.country}` : offer.name,
                      search: `${offer.name} ${offer.country || ""} ${offer.id}`,
                    }))}
                    placeholder={resources.offers.length ? t("Select an offer") : t("No offers loaded from Keitaro")}
                    searchPlaceholder={t("Type to find offers")}
                    emptyResultsLabel={t("No offers found.")}
                  />
                  <p className="field-hint">
                    {t("Saving rebinds the campaign's stream in Keitaro to this offer. Traffic follows it immediately.")}
                  </p>
                </div>
                {editModal.error ? <div className="field field-span-2"><div className="api-status error">{editModal.error}</div></div> : null}
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={() => setEditModal((p) => ({ ...p, open: false }))}>{t("Cancel")}</button>
                <button className="action-pill" type="button" onClick={saveEdit} disabled={editModal.saving}>
                  {editModal.saving ? t("Saving…") : t("Save & update Keitaro")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="panel registry-dashboard-panel tracking-registry-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.settle, ease: EASE }}
      >
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><LinkIcon size={20} /></span>
            <div>
              <h2 className="panel-title">{t("Tracking Links")}</h2>
              <p className="panel-subtitle">
                {t("Compose Keitaro campaigns with the standard naming and generate ready-to-use tracking links.")}
              </p>
            </div>
          </div>
          <div className="panel-head-actions">
            <span className="roles-count">
              {links.length} {t("links")}
            </span>
            <button
              type="button"
              className={`offers-mode-toggle${showForm ? " is-active" : ""}`}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? t("Close") : (<><Plus size={13} strokeWidth={2.5} /> {t("New Link")}</>)}
            </button>
          </div>
        </div>

        <div className="accounts-summary-strip">
          {[
            { key: "total", tone: "neutral", label: t("Tracking Links"), value: summary.total, Icon: Link2, pct: null },
            { key: "created", tone: "success", label: t("In Keitaro"), value: summary.created, Icon: CheckCircle, pct: summary.total ? Math.round((summary.created / summary.total) * 100) : 0 },
            { key: "local", tone: "warning", label: t("Stored locally"), value: summary.local, Icon: BookOpen, pct: summary.total ? Math.round((summary.local / summary.total) * 100) : 0 },
            { key: "failed", tone: "danger", label: t("Push failed"), value: summary.failed, Icon: AlertTriangle, pct: summary.total ? Math.round((summary.failed / summary.total) * 100) : 0 },
          ].map((kpi) => (
            <div key={kpi.key} className={`accounts-summary-item tone-${kpi.tone}`}>
              <div className="accounts-summary-top">
                <span className="accounts-summary-icon"><kpi.Icon size={18} /></span>
                <span className="accounts-summary-label">{kpi.label}</span>
              </div>
              <strong>{kpi.value}</strong>
              {kpi.pct !== null ? (
                <div className="accounts-summary-bar">
                  <span style={{ width: `${Math.min(100, kpi.pct)}%` }} />
                </div>
              ) : (
                <span className="accounts-summary-sub">{t("in registry")}</span>
              )}
            </div>
          ))}
        </div>

        {showForm ? (
          <form className="form-grid accounts-form tracking-link-form" onSubmit={handleCreate}>
            {resourcesError ? (
              <div className="field field-span-3">
                <div className="api-status error">
                  {t("Keitaro resources unavailable")}: {resourcesError}. {t("You can still store links locally.")}
                </div>
              </div>
            ) : null}
            <div className="field field-span-3 form-section-head">
              <span className="form-section-label">{t("Campaign identity")}</span>
            </div>
            <div className="field">
              <label>{t("Buyer")}</label>
              <input
                value={form.buyer}
                onChange={updateForm("buyer")}
                readOnly={!isLeadership}
                placeholder={authUser?.username || ""}
              />
            </div>
            <div className="field">
              <label>{t("Tool / Traffic Source")}</label>
              <CountryDropdownPicker
                value={form.trafficSourceId || form.tool}
                onChange={(value) => {
                  // Keitaro traffic sources only — free-typed tools are not allowed,
                  // so external_id/params always come from the source's real config.
                  const source = resources.trafficSources.find((s) => String(s.id) === String(value));
                  if (!source) return;
                  const shortcode = trackingSourceShortcode(source.name);
                  // Prefer the full template Keitaro reports for this source;
                  // fall back to swapping the external_id macro if unavailable
                  // (e.g. backend not yet redeployed).
                  const macro = source.externalId || externalIdMacroForTool(shortcode);
                  setForm((prev) => ({
                    ...prev,
                    trafficSourceId: String(source.id),
                    tool: shortcode,
                    externalIdMacro: macro,
                    params: source.params || applyExternalIdMacro(prev.params, shortcode),
                  }));
                }}
                options={resources.trafficSources.map((s) => ({
                  value: String(s.id),
                  label: `${trackingSourceShortcode(s.name)} · ${s.name}`,
                  search: `${s.name} ${trackingSourceShortcode(s.name)}`,
                }))}
                placeholder={t("Select or type")}
                searchPlaceholder={t("Type a tool")}
                emptyResultsLabel={t("No tools found.")}
              />
            </div>
            <div className="field">
              <label>{t("Game / Offer")}</label>
              <input value={form.game} onChange={updateForm("game")} placeholder={t("e.g. Santa Fe Casino")} />
            </div>
            <div className="field">
              <label>{t("GEO")}</label>
              <CountryDropdownPicker
                value={form.geo}
                onChange={(geo) => setForm((prev) => ({ ...prev, geo }))}
                options={TRACKING_GEO_PRESETS.map((value) => ({
                  value,
                  label: value,
                  search: `${value} ${TRACKING_GEO_NAMES[value] || ""}`.trim(),
                }))}
                allowCustom
                placeholder={t("Select or type")}
                searchPlaceholder={t("ISO-2 or GLOBAL")}
                emptyResultsLabel={t("No geos found.")}
              />
            </div>
            <div className="field">
              <label>{t("Brand")}</label>
              <input value={form.brand} onChange={updateForm("brand")} placeholder="ZLOTMX" />
            </div>
            <div className="field field-span-3 form-section-head">
              <span className="form-section-label"><img className="brand-mark keitaro-label-mark" src={keitaroLogo} alt="Keitaro" /> {t("routing")}</span>
            </div>
            <div className="field">
              <label>{t("Tracking Domain")} <span className="field-pace-hint">{t("from Keitaro")}</span></label>
              <CountryDropdownPicker
                value={form.domainId || form.domain}
                onChange={(value) => {
                  const dom = resources.domains.find((d) => String(d.id) === String(value));
                  if (dom) {
                    setForm((prev) => ({ ...prev, domainId: String(dom.id), domain: dom.name }));
                  } else {
                    setForm((prev) => ({ ...prev, domainId: "", domain: value }));
                  }
                }}
                options={ALLOWED_TRACKING_DOMAINS.map((host) => {
                  const dom = resources.domains.find((d) => normalizeTrackingHost(d.name) === host);
                  return { value: dom ? String(dom.id) : host, label: host, search: host };
                })}
                placeholder={t("Select a domain")}
                searchPlaceholder={t("Find domain")}
                emptyResultsLabel={t("No domains found.")}
              />
            </div>
            <div className="field">
              <label>{t("Alias")} <span className="field-pace-hint">{t("blank = auto by Keitaro")}</span></label>
              <input value={form.alias} onChange={updateForm("alias")} placeholder={t("auto-generated")} />
            </div>
            <div className="field field-span-2">
              <label>{t("Offer")} <span className="field-pace-hint">{t("bound via stream")}</span></label>
              <CountryDropdownPicker
                value={form.offerId}
                onChange={(offerId) => setForm((prev) => ({ ...prev, offerId }))}
                options={resources.offers.map((o) => ({
                  value: String(o.id),
                  label: `#${o.id} · ${o.name}${o.country ? ` · ${o.country}` : ""}`,
                  search: `${o.id} ${o.name} ${o.country}`,
                }))}
                allOption={{ value: "", label: t("No offer (campaign only)") }}
                placeholder={resources.offers.length ? t("Select an offer") : t("No offers loaded")}
                searchPlaceholder={t("Find offer by name, id, geo")}
                emptyResultsLabel={t("No offers found.")}
              />
            </div>
            <div className="field">
              <label>{t("Filters")} <span className="field-pace-hint">{t("stream rules in Keitaro")}</span></label>
              <button type="button" className="tracking-filter-open" onClick={openFilterModal}>
                <SlidersHorizontal size={14} />
                {form.filterConfig.rules.length
                  ? `${form.filterConfig.rules.length} ${t("filter(s)")} · ${form.filterConfig.logic.toUpperCase()}`
                  : t("Add filters")}
              </button>
            </div>
            <div className="field field-span-3 form-section-head">
              <span className="form-section-label">{t("Parameters & preview")}</span>
            </div>
            <div className="field field-span-3">
              <label>{t("Link Parameters")}</label>
              <textarea rows={2} value={form.params} onChange={updateForm("params")} spellCheck={false} />
              <p className="field-hint">
                {form.tool
                  ? `${t("Pulled from")} ${form.tool} ${t("in Keitaro")}${form.externalIdMacro ? ` · external_id=${form.externalIdMacro}` : ""}`
                  : t("Pick a tool — its parameters (external_id + subs) are pulled from that source's Keitaro config.")}
              </p>
            </div>
            <div className="field field-span-3 tracking-preview">
              <label>{t("Preview")}</label>
              <div className="tracking-preview-name">
                <span className="cs-dot" style={{ background: "#36d07c" }} aria-hidden="true" />
                {previewName}
              </div>
              <code className="tracking-preview-url">{previewUrl || t("Fill domain + alias to build the link")}</code>
            </div>
            <div className="field field-span-3 form-section-head">
              <span className="form-section-label">{t("Publish")}</span>
            </div>
            <div className="field field-inline">
              <label className="ios-switch">
                <input
                  type="checkbox"
                  checked={form.pushToKeitaro}
                  onChange={(event) => setForm((prev) => ({ ...prev, pushToKeitaro: event.target.checked }))}
                />
                <span className="ios-switch-track" aria-hidden="true"><span className="ios-switch-knob" /></span>
                <span className="ios-switch-label">{t("Create campaign in Keitaro")}</span>
              </label>
              <p className="field-hint">{t("If the push fails, the link is stored locally anyway.")}</p>
            </div>
            {form.pushToKeitaro ? (
              <div className={`field field-span-3 field-inline s2s-toggle-field ${form.sendFtdToBot ? "is-on" : ""}`}>
                <label className="ios-switch ios-switch-accent">
                  <input
                    type="checkbox"
                    checked={form.sendFtdToBot}
                    onChange={(event) => setForm((prev) => ({ ...prev, sendFtdToBot: event.target.checked }))}
                  />
                  <span className="ios-switch-track" aria-hidden="true"><span className="ios-switch-knob" /></span>
                  <span className="s2s-toggle-icon s2s-toggle-telegram"><TelegramGlyph size={13} /></span>
                  <span className="ios-switch-label">{t("Send FTDs to the Telegram bot")}</span>
                </label>
                <p className="field-hint">
                  {form.sendFtdToBot ? (
                    <>
                      {t("On each first deposit, Keitaro posts back to the bot as buyer")}{" "}
                      <code>{resolvedBotBuyer}</code>
                      <span className="s2s-foot-dim"> · custom_conversion_8 (FTD) · GET</span>
                    </>
                  ) : (
                    t("FTD conversions won't be forwarded to the bot.")
                  )}
                </p>
              </div>
            ) : null}
            <div className="form-actions">
              {saveState.message ? (
                <div className={`api-status ${saveState.ok ? "success" : "error"}`}>{saveState.message}</div>
              ) : null}
              <button className="ghost" type="button" onClick={() => setSaveState({ saving: false, ok: null, message: "" })}>
                {t("Reset")}
              </button>
              <button className="action-pill" type="submit" disabled={saveState.saving}>
                {saveState.saving ? t("Saving…") : t("Save Link")}
              </button>
            </div>
          </form>
        ) : null}

        {linkState.loading ? (
          <div className="empty-state">{t("Loading tracking links…")}</div>
        ) : linkState.error ? (
          <div className="empty-state error">{linkState.error}</div>
        ) : links.length === 0 ? (
          <div className="empty-state">{t("No tracking links yet. Create the first one.")}</div>
        ) : (
          <div className="table-wrap pixel-table-wrap">
            <div className="pixel-table-toolbar">
              <div className="field registry-search-field">
                <label>{t("Search")}</label>
                <div className="registry-search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    value={trackingSearch}
                    onChange={(e) => setTrackingSearch(e.target.value)}
                    placeholder={t("Search campaign, owner…")}
                  />
                  {trackingSearch ? (
                    <button
                      type="button"
                      className="registry-search-clear"
                      onClick={() => setTrackingSearch("")}
                      aria-label={t("Clear search")}
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label>{t("Buyer")}</label>
                <CountryDropdownPicker
                  multiple
                  values={buyerFilter}
                  onToggle={toggleTableFilter(setBuyerFilter)}
                  options={buyerFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find buyers")}
                  emptyResultsLabel={t("No buyers found.")}
                />
              </div>
              <div className="field">
                <label>{t("Tool")}</label>
                <CountryDropdownPicker
                  multiple
                  values={toolFilter}
                  onToggle={toggleTableFilter(setToolFilter)}
                  options={toolFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find tools")}
                  emptyResultsLabel={t("No tools found.")}
                />
              </div>
              <div className="field">
                <label>{t("GEO")}</label>
                <CountryDropdownPicker
                  multiple
                  values={geoFilter}
                  onToggle={toggleTableFilter(setGeoFilter)}
                  options={geoFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find geos")}
                  emptyResultsLabel={t("No geos found.")}
                />
              </div>
              {trackingFiltersActive ? (
                <button type="button" className="filter-clear-btn" onClick={clearTrackingFilters}>
                  <X size={13} /> {t("Clear filters")}
                </button>
              ) : null}
            </div>
            <div className="table-wrap">
            <table className="entries-table tracking-table">
              <thead>
                <tr>
                  {[
                    { key: "campaign", label: t("Campaign") },
                    { key: "status", label: t("Status") },
                    { key: "geo", label: t("GEO") },
                    { key: "link", label: t("Link") },
                    { key: "keitaro", label: t("Keitaro") },
                    { key: "owner", label: t("Owner") },
                  ].map((col) => (
                    <th key={col.key}>
                      <button
                        type="button"
                        className={`sortable-header ${trackingSort.key === col.key ? "active" : ""}`}
                        onClick={() => toggleTrackingSort(col.key)}
                      >
                        {col.label}
                        <span className="sort-indicator">{getSortIndicator(trackingSort, col.key)}</span>
                      </button>
                    </th>
                  ))}
                  <th className="col-actions">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {/* popLayout takes the leaving row out of flow immediately, so the
                    rows below start closing the gap while it fades rather than
                    jumping the moment it unmounts. */}
                <AnimatePresence mode="popLayout" initial={false}>
                {sortedLinks.map((link) => (
                  <motion.tr key={link.id} {...rowMotion}>
                    <td>
                      <span className="tracking-name" title={link.name}>
                        {link.name}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`tracking-state-toggle ${String(link.state || "active") === "active" ? "is-on" : "is-off"}`}
                        onClick={handleToggleState(link)}
                        disabled={togglingId === link.id}
                        title={t("Toggle campaign state")}
                      >
                        <span className="cs-dot" />
                        {String(link.state || "active") === "active" ? t("Activated") : t("Deactivated")}
                      </button>
                    </td>
                    <td>
                      {link.geo ? (
                        <span className="geo-chip">
                          <CountryFlag value={link.geo} />
                          {link.geo}
                        </span>
                      ) : (
                        <span className="offer-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="flow-pill" title={link.url}>
                        <span className="cs-dot" style={{ background: "#6ad6ff" }} aria-hidden="true" />
                        {`${String(link.domain || "")}/${String(link.alias || "")}`}
                      </span>
                    </td>
                    <td>{keitaroChip(link)}</td>
                    <td>
                      {link.owner_name ? (
                        <span className="owner-pill">
                          <span className="owner-pill-dot" />
                          {link.owner_name}
                        </span>
                      ) : (
                        <span className="offer-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="accounts-action-group">
                        <button
                          className="icon-btn"
                          type="button"
                          aria-label={copiedId === link.id ? t("Copied!") : t("Copy link")}
                          data-tip={copiedId === link.id ? t("Copied!") : t("Copy link")}
                          onClick={handleCopy(link.id, link.url)}
                        >
                          {copiedId === link.id ? <CheckCircle size={15} /> : <Copy size={15} />}
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          aria-label={t("Edit")}
                          data-tip={t("Edit")}
                          onClick={() => openEdit(link)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          aria-label={t("View flow, filters, offer")}
                          data-tip={t("View flow, filters, offer")}
                          onClick={() => openDetails(link)}
                        >
                          <Eye size={15} />
                        </button>
                        {String(link.keitaro_status || "local") === "created" ? (
                          <button
                            className="icon-btn icon-btn-check"
                            type="button"
                            aria-label={t("Verify in Keitaro")}
                            data-tip={t("Verify in Keitaro")}
                            onClick={() => openDetails(link, true)}
                          >
                            <ShieldCheck size={15} />
                          </button>
                        ) : (
                          <button
                            className="icon-btn"
                            type="button"
                            aria-label={t("Create in Keitaro")}
                            data-tip={t("Create in Keitaro")}
                            disabled={pushingId === link.id}
                            onClick={handlePush(link.id)}
                          >
                            <Zap size={15} />
                          </button>
                        )}
                        <button
                          className="icon-btn icon-btn-danger"
                          type="button"
                          aria-label={t("Remove")}
                          data-tip={t("Remove")}
                          onClick={handleDelete(link.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
              </tbody>
            </table>
            </div>
            {!filteredLinks.length ? (
              <div className="empty-state">{t("No entries found for this filter.")}</div>
            ) : null}
          </div>
        )}
      </motion.div>
    </section>
  );
}
