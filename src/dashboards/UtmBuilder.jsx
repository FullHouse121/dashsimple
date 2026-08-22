import React from "react";
import { BrandMark, resolveBrandLogo } from "../components/BrandMark.jsx";
import { CountryDropdownPicker, Select } from "../components/Select.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { MetaGlyph } from "../components/glyphs.jsx";
import { UtmIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { countryOptions, resolveCountryIso } from "../lib/constants.js";
import { csvCell } from "../lib/format.js";
import { DURATION, EASE } from "../lib/motion.js";
import { motion } from "framer-motion";
import { AlertTriangle, Copy, Download, Link2, Pencil, Plus, RotateCcw, X, Zap } from "lucide-react";

export default function UtmBuilder() {
  const subFieldAliases = React.useMemo(
    () => ({
      6: "adset_id",
    }),
    []
  );
  const [utm, setUtm] = React.useState({
    tool: "PWA Group",
    country: "",
    domain: "",
    fbp: "",
    subs: Array.from({ length: 15 }, () => ""),
  });
  const [copyState, setCopyState] = React.useState("idle");
  // History records persist to localStorage and carry their metadata
  // (tool, country, the param keys used) so a saved link is self-describing.
  const UTM_HISTORY_KEY = "dash-utm-history";
  const [utmHistory, setUtmHistory] = React.useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(UTM_HISTORY_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(UTM_HISTORY_KEY, JSON.stringify(utmHistory)); } catch { /* quota */ }
  }, [utmHistory]);
  const [showAllSubs, setShowAllSubs] = React.useState(false);
  // Keep the commonly-used params visible; collapse sub7→sub15 behind a toggle
  // to cut the wall of empty inputs. Auto-expand if any hidden sub is filled.
  const PRIMARY_SUB_COUNT = 6;
  // Inline (styled) replacement for window.prompt when saving a preset.
  const [presetDraft, setPresetDraft] = React.useState(null); // null = closed
  // sub9 is the GEO slot — auto-filled from the selected country (e.g. MX).
  const GEO_SUB_INDEX = 8;

  // Each tool injects the Meta pixel param differently:
  //  - PWA Group / Link Group / SKAK apps → fbp={pixel} as the FIRST param
  //  - ZM apps                            → pixel_fb={pixel} as the LAST param
  const UTM_TOOLS = ["PWA Group", "Link Group", "SKAK apps", "ZM apps"];
  const isZmTool = utm.tool === "ZM apps";
  const pixelParamKey = isZmTool ? "pixel_fb" : "fbp";

  // Common Meta / Keitaro macros — quick-insert into the focused field.
  const UTM_MACROS = [
    "{{campaign.name}}", "{{campaign.id}}", "{{adset.name}}", "{{adset.id}}",
    "{{ad.name}}", "{{ad.id}}", "{{placement}}", "{{site_source_name}}", "{meta_pixel}",
  ];
  // Which field is focused, so macro chips know where to insert.
  const [focusedField, setFocusedField] = React.useState(null);

  // Registered domains for the picker (paste OR choose).
  const [domainOptions, setDomainOptions] = React.useState([]);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/domains?limit=5000");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const names = (Array.isArray(data) ? data : [])
          .map((d) => String(d.domain || d.name || "").trim())
          .filter(Boolean);
        setDomainOptions(Array.from(new Set(names)));
      } catch { /* soft-fail */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Presets — save/load the full param structure, persisted to localStorage.
  const UTM_PRESETS_KEY = "dash-utm-presets";
  const [presets, setPresets] = React.useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(UTM_PRESETS_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(UTM_PRESETS_KEY, JSON.stringify(presets)); } catch { /* quota */ }
  }, [presets]);

  const [historySearch, setHistorySearch] = React.useState("");

  const updateUtm = (key) => (event) => {
    setUtm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  // Selecting a country auto-fills the GEO sub (sub9) with the ISO code.
  // Team convention: United Kingdom is tagged "UK" (not ISO-3166 "GB").
  const handleCountryChange = (country) => {
    const iso = (resolveCountryIso(country) || "").toUpperCase();
    const geoTag = iso === "GB" ? "UK" : iso;
    setUtm((prev) => {
      const nextSubs = [...prev.subs];
      if (geoTag) nextSubs[GEO_SUB_INDEX] = geoTag;
      return { ...prev, country, subs: nextSubs };
    });
  };

  const updateSub = (index) => (event) => {
    const value = event.target.value;
    setUtm((prev) => {
      const nextSubs = [...prev.subs];
      nextSubs[index] = value;
      return { ...prev, subs: nextSubs };
    });
  };

  // Insert a macro into whichever field is focused (appends to its value).
  const insertMacro = (macro) => {
    if (!focusedField) return;
    if (focusedField === "fbp" || focusedField === "domain") {
      setUtm((prev) => ({ ...prev, [focusedField]: `${prev[focusedField] || ""}${macro}` }));
      return;
    }
    if (focusedField.startsWith("sub-")) {
      const idx = Number(focusedField.slice(4));
      if (!Number.isFinite(idx)) return;
      setUtm((prev) => {
        const nextSubs = [...prev.subs];
        nextSubs[idx] = `${nextSubs[idx] || ""}${macro}`;
        return { ...prev, subs: nextSubs };
      });
    }
  };

  const savePreset = () => {
    const name = String(presetDraft || "").trim();
    if (!name) return;
    const snapshot = {
      name,
      tool: utm.tool,
      fbp: utm.fbp,
      subs: [...utm.subs],
    };
    setPresets((prev) => [snapshot, ...prev.filter((p) => p.name !== snapshot.name)].slice(0, 12));
    setPresetDraft(null);
  };

  const loadPreset = (preset) => {
    setUtm((prev) => ({
      ...prev,
      tool: preset.tool || prev.tool,
      fbp: preset.fbp || "",
      subs: Array.from({ length: 15 }, (_, i) => preset.subs?.[i] ?? ""),
    }));
  };

  const deletePreset = (name) => {
    setPresets((prev) => prev.filter((p) => p.name !== name));
  };

  const resetUtm = () => {
    setUtm((prev) => ({
      tool: prev.tool,
      country: "",
      domain: "",
      fbp: "",
      subs: Array.from({ length: 15 }, () => ""),
    }));
    setCopyState("idle");
  };

  const encodeParamValue = (value) => {
    const encoded = encodeURIComponent(String(value));
    return encoded.replace(/%7B/gi, "{").replace(/%7D/gi, "}");
  };

  const buildQueryString = (url) => {
    // Params already present on the pasted domain URL
    const urlParams = [];
    url.searchParams.forEach((value, key) => {
      urlParams.push(`${encodeURIComponent(key)}=${encodeParamValue(value)}`);
    });

    // Sub params
    const subParams = [];
    utm.subs.forEach((value, index) => {
      if (value) {
        const paramKey = subFieldAliases[index + 1] || `sub${index + 1}`;
        subParams.push(`${encodeURIComponent(paramKey)}=${encodeParamValue(value)}`);
      }
    });

    // The Meta pixel param — key + position depend on the selected tool.
    const pixelEntry = utm.fbp
      ? `${pixelParamKey}=${encodeParamValue(utm.fbp)}`
      : null;

    let ordered;
    if (isZmTool) {
      // ZM apps: pixel_fb must be the LAST parameter
      ordered = [...urlParams, ...subParams];
      if (pixelEntry) ordered.push(pixelEntry);
    } else {
      // PWA / Link / SKAK: fbp must be the FIRST parameter
      ordered = [];
      if (pixelEntry) ordered.push(pixelEntry);
      ordered = [...ordered, ...urlParams, ...subParams];
    }
    return ordered.join("&");
  };

  const buildUrl = () => {
    if (!utm.domain) return "";
    try {
      const url = new URL(utm.domain);
      const query = buildQueryString(url);
      const base = `${url.origin}${url.pathname}`;
      const hash = url.hash || "";
      return query ? `${base}?${query}${hash}` : `${base}${hash}`;
    } catch (error) {
      try {
        const sanitized = utm.domain.startsWith("http")
          ? utm.domain
          : `https://${utm.domain}`;
        const url = new URL(sanitized);
        const query = buildQueryString(url);
        const base = `${url.origin}${url.pathname}`;
        const hash = url.hash || "";
        return query ? `${base}?${query}${hash}` : `${base}${hash}`;
      } catch {
        return utm.domain;
      }
    }
  };

  const utmUrl = buildUrl();
  const isValid = utm.domain ? utmUrl.startsWith("http") : true;

  // How many params the link actually carries (pixel + filled subs)
  const filledSubCount = utm.subs.filter((v) => String(v || "").trim()).length;
  const paramCount = filledSubCount + (utm.fbp ? 1 : 0);
  // Any hidden sub (index >= PRIMARY_SUB_COUNT) carries a value?
  const hasHiddenFilled = utm.subs
    .slice(PRIMARY_SUB_COUNT)
    .some((v) => String(v || "").trim());
  const subsExpanded = showAllSubs || hasHiddenFilled;
  const visibleSubCount = subsExpanded ? utm.subs.length : PRIMARY_SUB_COUNT;

  // One-click team-standard macro set (fills only EMPTY fields, never silent).
  // The team format is:
  //   sub1={{placement}}  sub2=<buyer tag>  sub3={{campaign.name}}
  //   sub4={{adset.name}} sub5={{ad.name}}  adset_id={{adset.id}}
  //   sub7=<approach slot/crash>  sub8=<approach name>  sub9=<GEO ISO>
  //   sub10=<ad account number>   sub11={{site_source_name}}
  // Only the macro slots are auto-filled — buyer tag / approach / account
  // stay manual because they vary per buyer and campaign.
  const fillMetaMacros = () => {
    const defaults = {
      0: "{{placement}}",        // sub1
      2: "{{campaign.name}}",    // sub3
      3: "{{adset.name}}",       // sub4
      4: "{{ad.name}}",          // sub5
      5: "{{adset.id}}",         // adset_id
      10: "{{site_source_name}}", // sub11
    };
    setUtm((prev) => {
      const nextSubs = [...prev.subs];
      Object.entries(defaults).forEach(([i, macro]) => {
        if (!String(nextSubs[i] || "").trim()) nextSubs[i] = macro;
      });
      return { ...prev, subs: nextSubs };
    });
    // sub11 lives in the collapsed range — expand so the fill is visible.
    setShowAllSubs(true);
  };

  // Load a saved link back into the builder: parse its params into the
  // pixel/sub fields and restore tool + country from the record metadata.
  const editHistoryLink = (record) => {
    const raw = typeof record === "string" ? { url: record } : record;
    if (!raw.url) return;
    try {
      const url = new URL(raw.url);
      const subs = Array.from({ length: 15 }, () => "");
      let fbp = "";
      const foreign = [];
      url.searchParams.forEach((value, key) => {
        if (key === "fbp" || key === "pixel_fb") { fbp = value; return; }
        if (key === "adset_id") { subs[5] = value; return; }
        const m = key.match(/^sub(\d+)$/);
        if (m) {
          const idx = Number(m[1]) - 1;
          if (idx >= 0 && idx < subs.length) { subs[idx] = value; return; }
        }
        foreign.push(`${key}=${value}`);
      });
      // Params we don't manage stay glued to the domain so they survive rebuild.
      const domain = `${url.origin}${url.pathname}${foreign.length ? `?${foreign.join("&")}` : ""}`;
      setUtm((prev) => ({
        tool: raw.tool || prev.tool,
        country: raw.country || "",
        domain,
        fbp,
        subs,
      }));
      setCopyState("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { /* malformed stored URL — ignore */ }
  };

  // Field meaning per the team's link format — shown as label hints +
  // placeholders so buyers know exactly what goes where.
  const SUB_HINTS = {
    2: "buyer tag",
    7: "approach — slot / crash",
    8: "approach name",
    9: "geo",
    10: "ad account",
  };
  const SUB_PLACEHOLDERS = {
    2: "e.g. DMTMX",
    7: "slot / crash",
    8: "e.g. SC",
    10: "ad account number",
  };

  // Soft validation hints — never block, just flag likely mistakes.
  const utmWarnings = React.useMemo(() => {
    const warnings = [];
    if (utm.domain && !/^https?:\/\//i.test(utm.domain.trim())) {
      warnings.push("Domain has no http(s):// — it'll be assumed https.");
    }
    if (!utm.fbp) {
      warnings.push(`No Meta pixel set — ${pixelParamKey} won't be added.`);
    }
    if (utm.country && !utm.subs[GEO_SUB_INDEX]) {
      warnings.push("Country selected but sub9 (geo) is empty.");
    }
    return warnings;
  }, [utm.domain, utm.fbp, utm.country, utm.subs, pixelParamKey]);

  // Split the generated URL so the pixel param can be highlighted — lets the
  // operator verify placement (first for fbp, last for pixel_fb) at a glance.
  const renderHighlightedUrl = () => {
    if (!utmUrl) return null;
    const re = new RegExp(`(${pixelParamKey}=[^&#]*)`);
    const parts = utmUrl.split(re);
    if (parts.length === 1) return utmUrl;
    return parts.map((part, i) =>
      re.test(part) && part.startsWith(`${pixelParamKey}=`)
        ? <mark key={i} className="utm-url-pixel">{part}</mark>
        : <React.Fragment key={i}>{part}</React.Fragment>
    );
  };

  const storeHistory = () => {
    if (!utmUrl || !isValid) return;
    // Snapshot the param keys actually used (pixel + filled subs) so the
    // saved record is self-describing without re-parsing the URL.
    const usedParams = [];
    if (utm.fbp) usedParams.push(pixelParamKey);
    utm.subs.forEach((value, index) => {
      if (String(value || "").trim()) usedParams.push(subFieldAliases[index + 1] || `sub${index + 1}`);
    });
    const record = {
      url: utmUrl,
      tool: utm.tool,
      country: utm.country || "",
      params: usedParams,
      createdAt: new Date().toISOString(),
    };
    setUtmHistory((prev) => {
      const next = [record, ...prev.filter((item) => (item.url || item) !== utmUrl)];
      return next.slice(0, 12);
    });
  };

  const handleClear = () => {
    resetUtm();
  };

  const handleCopy = async () => {
    if (!utmUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(utmUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = utmUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyState("copied");
      storeHistory();
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1500);
    }
  };

  return (
    <>
      <section className="form-section">
        <motion.div
          className="panel form-panel utm-registry-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div className="panel-head-title">
              <span className="panel-icon-badge"><UtmIcon size={20} /></span>
              <div>
                <h2 className="panel-title">UTM Builder</h2>
                <p className="panel-subtitle">
                  Generate clean tracking links for campaigns and media buyers.
                </p>
              </div>
            </div>
          </div>

          <div className="utm-tool-bar">
            <div className="field utm-tool-field">
              <label>Tool</label>
              <Select
                value={utm.tool}
                onChange={(v) => setUtm((prev) => ({ ...prev, tool: v }))}
                options={UTM_TOOLS.map((tool) => ({ value: tool, label: tool }))}
                placeholder="Select tool"
              />
            </div>
            <div className="field utm-tool-field">
              <label>Country <span className="field-pace-hint">→ sub9</span></label>
              <CountryDropdownPicker
                value={utm.country}
                onChange={handleCountryChange}
                options={countryOptions}
                placeholder="Select country"
                searchPlaceholder="Type to find countries"
                emptyResultsLabel="No countries found."
              />
            </div>
            <p className="utm-tool-hint">
              {resolveBrandLogo(utm.tool) ? <BrandMark value={utm.tool} height={14} /> : null}
              {isZmTool
                ? <>ZM apps — the pixel is appended as <code>pixel_fb={"{meta_pixel}"}</code> at the <strong>end</strong> of the URL.</>
                : <>{utm.tool} — the pixel is placed as <code>fbp={"{meta_pixel}"}</code> at the <strong>start</strong> of the parameters.</>}
            </p>
          </div>

          {/* Macro quick-insert — inserts into the last focused field */}
          <div className="utm-macros">
            <span className="utm-macros-label">Insert macro</span>
            <div className="utm-macros-chips">
              {UTM_MACROS.map((macro) => (
                <button
                  key={macro}
                  type="button"
                  className="utm-macro-chip"
                  disabled={!focusedField}
                  title={focusedField ? `Insert into ${focusedField === "fbp" ? "Meta Pixel" : focusedField === "domain" ? "Domain" : (() => { const idx = Number(focusedField.slice(4)); return subFieldAliases[idx + 1] || `sub${idx + 1}`; })()}` : "Focus a field first"}
                  onMouseDown={(e) => { e.preventDefault(); insertMacro(macro); }}
                >
                  {macro}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="utm-fill-macros"
              onClick={fillMetaMacros}
              title="Fill the macro slots (sub1, sub3–5, adset_id, sub11) with the team-standard Meta macros — buyer tag, approach and account stay yours to fill"
            >
              <Zap size={12} /> Fill Meta macros
            </button>
          </div>

          <div className="utm-grid">
            <div className="field">
              <label>Domain <span className="field-pace-hint">pick a registered domain or type a URL</span></label>
              <CountryDropdownPicker
                value={utm.domain}
                onChange={(v) => setUtm((prev) => ({ ...prev, domain: v }))}
                options={domainOptions.map((d) => {
                  const url = d.startsWith("http") ? d : `https://${d}`;
                  return { value: url, label: d };
                })}
                placeholder="https://example.com"
                searchPlaceholder="Search or paste a URL…"
                emptyResultsLabel="No registered domains."
                allowCustom
              />
            </div>
            <div className="field utm-pixel-field">
              <label><span className="utm-label-meta"><MetaGlyph size={13} /></span>Meta Pixel <span className="field-pace-hint">→ {pixelParamKey}</span></label>
              <input
                type="text"
                placeholder="{meta_pixel} or pixel id"
                value={utm.fbp}
                onChange={updateUtm("fbp")}
                onFocus={() => setFocusedField("fbp")}
              />
            </div>
            {utm.subs.slice(0, visibleSubCount).map((value, index) => {
              const labelText = subFieldAliases[index + 1] || `sub${index + 1}`;
              const aliased = Boolean(subFieldAliases[index + 1]);
              const hint = SUB_HINTS[index + 1];
              return (
                <div className={`field${aliased ? " utm-field-aliased" : ""}`} key={`sub-${index}`}>
                  <label>
                    {labelText}
                    {hint ? <span className="field-pace-hint">{hint}</span> : null}
                  </label>
                  <input
                    type="text"
                    placeholder={SUB_PLACEHOLDERS[index + 1] || labelText}
                    value={value}
                    onChange={updateSub(index)}
                    onFocus={() => setFocusedField(`sub-${index}`)}
                  />
                </div>
              );
            })}
          </div>

          {utm.subs.length > PRIMARY_SUB_COUNT ? (
            <button
              type="button"
              className="utm-subs-toggle"
              onClick={() => setShowAllSubs((v) => !v)}
              disabled={hasHiddenFilled}
              title={hasHiddenFilled ? "Some of these parameters have values" : undefined}
            >
              {hasHiddenFilled
                ? `Extra parameters in use (sub7–sub${utm.subs.length})`
                : subsExpanded
                  ? "Hide extra parameters"
                  : `Show all parameters (+${utm.subs.length - PRIMARY_SUB_COUNT})`}
            </button>
          ) : null}

          {/* Presets — save the current param structure, reload it later */}
          <div className="utm-presets">
            {presetDraft === null ? (
              <button type="button" className="utm-preset-save" onClick={() => setPresetDraft("")}>
                <Plus size={13} /> Save preset
              </button>
            ) : (
              <span className="utm-preset-draft">
                <input
                  type="text"
                  value={presetDraft}
                  onChange={(e) => setPresetDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") savePreset();
                    if (e.key === "Escape") setPresetDraft(null);
                  }}
                  placeholder="Preset name…"
                  autoFocus
                />
                <button type="button" className="utm-preset-confirm" onClick={savePreset} disabled={!String(presetDraft).trim()}>
                  Save
                </button>
                <button type="button" className="utm-preset-cancel" onClick={() => setPresetDraft(null)} aria-label="Cancel">
                  <X size={12} />
                </button>
              </span>
            )}
            {presets.length ? (
              <div className="utm-preset-chips">
                {presets.map((p) => (
                  <span key={p.name} className="utm-preset-chip">
                    <button type="button" className="utm-preset-load" onClick={() => loadPreset(p)} title="Load preset">
                      {p.name}
                    </button>
                    <button type="button" className="utm-preset-del" onClick={() => deletePreset(p.name)} title="Delete preset">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="utm-presets-empty">No saved presets yet.</span>
            )}
          </div>

          <div className="utm-preview">
            <div className="utm-preview-body">
              <div className="utm-preview-head">
                <p className="summary-label">Generated URL</p>
                {paramCount > 0 ? (
                  <span className="utm-param-count">
                    {paramCount} {paramCount === 1 ? "param" : "params"}
                  </span>
                ) : null}
              </div>
              <p className={`utm-url ${utmUrl ? "" : "is-empty"} ${isValid ? "" : "is-invalid"}`}>
                {utmUrl ? renderHighlightedUrl() : "Add a domain to generate a link."}
              </p>
              {utmWarnings.length ? (
                <ul className="utm-warnings">
                  {utmWarnings.map((w) => (
                    <li key={w}><AlertTriangle size={11} /> {w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="utm-actions">
              <button className="ghost" type="button" onClick={resetUtm}>
                <RotateCcw size={16} />
                Reset
              </button>
              <button className="ghost" type="button" onClick={handleClear}>
                <X size={16} />
                Clear Fields
              </button>
              <button className="ghost" type="button" onClick={handleCopy} disabled={!utmUrl}>
                <Copy size={16} />
                {copyState === "copied" ? "Copied" : "Copy URL"}
              </button>
              <a
                className={`action-pill ${utmUrl ? "" : "is-disabled"}`}
                href={utmUrl || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => {
                  if (!utmUrl) event.preventDefault();
                }}
                onClickCapture={storeHistory}
              >
                <Link2 size={16} />
                Open
              </a>
            </div>
          </div>

          <div className="utm-history">
            <div className="custom-head utm-history-head">
              <p className="utm-history-title">
                Recent UTM links
                {utmHistory.length ? <span className="utm-history-count">{utmHistory.length}</span> : null}
              </p>
              <div className="utm-history-head-actions">
                {utmHistory.length ? (
                  <input
                    type="text"
                    className="utm-history-search"
                    placeholder="Search links…"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                ) : null}
                <button
                  className="ghost"
                  type="button"
                  onClick={() => {
                    const rows = utmHistory.map((it) => (typeof it === "string" ? { url: it } : it));
                    const csv = ["tool,country,params,created_at,url"]
                      .concat(rows.map((r) =>
                        [csvCell(r.tool || ""), csvCell(r.country || ""), csvCell((r.params || []).join(" ")), csvCell(r.createdAt || ""), csvCell(r.url || "")].join(",")
                      ))
                      .join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "utm-links.csv";
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                  disabled={!utmHistory.length}
                >
                  <Download size={14} /> Export
                </button>
                <button className="ghost" type="button" onClick={() => setUtmHistory([])}>
                  Clear list
                </button>
              </div>
            </div>
            {utmHistory.length === 0 ? (
              <p className="empty-state">No generated links yet.</p>
            ) : (() => {
              const q = historySearch.trim().toLowerCase();
              const filtered = q
                ? utmHistory.filter((it) => {
                    const r = typeof it === "string" ? { url: it } : it;
                    return (
                      (r.url || "").toLowerCase().includes(q) ||
                      (r.tool || "").toLowerCase().includes(q) ||
                      (r.country || "").toLowerCase().includes(q)
                    );
                  })
                : utmHistory;
              if (filtered.length === 0) {
                return <p className="empty-state">No links match.</p>;
              }
              return (
              <ul className="utm-history-list">
                {filtered.map((item, idx) => {
                  // Back-compat: older entries were plain URL strings.
                  const record = typeof item === "string" ? { url: item } : item;
                  const when = record.createdAt ? new Date(record.createdAt) : null;
                  const whenStr = when && !Number.isNaN(when.getTime())
                    ? when.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : null;
                  const metaBits = [];
                  if (Array.isArray(record.params) && record.params.length) {
                    metaBits.push(`${record.params.length} params`);
                  }
                  if (whenStr) metaBits.push(whenStr);
                  return (
                    <li key={`${record.url}-${idx}`} className="utm-history-item">
                      <div className="utm-history-main">
                        <div className="utm-history-meta">
                          {record.tool ? (
                            <span className="utm-history-tool">
                              <span className="utm-history-dot" />
                              {record.tool}
                            </span>
                          ) : null}
                          {record.country ? (
                            <span className="utm-history-country">
                              <CountryFlag value={record.country} />
                              {record.country}
                            </span>
                          ) : null}
                          {metaBits.length ? (
                            <span className="utm-history-sub">{metaBits.join(" · ")}</span>
                          ) : null}
                        </div>
                        <span className="utm-history-url" title={record.url}>{record.url}</span>
                      </div>
                      <button
                        className="utm-history-copy"
                        type="button"
                        onClick={() => editHistoryLink(record)}
                        title="Edit in builder — loads this link's params back into the form"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="utm-history-copy"
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(record.url)}
                        title="Copy link"
                      >
                        <Copy size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              );
            })()}
          </div>
        </motion.div>
      </section>
    </>
  );
}
