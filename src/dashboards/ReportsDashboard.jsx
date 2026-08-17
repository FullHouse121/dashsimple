import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play, Download, Search, X, Plus, Save, Trash2, Share2, Lock, Filter, ChevronLeft,
  ChevronRight, FileSpreadsheet, FileJson, FileText, FileDown, AlertTriangle, BarChart3,
  MousePointerClick, CreditCard, Database, RefreshCw,
} from "lucide-react";
import {
  ReportIcon, ColumnsIcon, GroupIcon, MetricIcon, FilterIcon, SavedIcon, AlertIcon, AwardIcon,
} from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import ExecutiveReportPanel from "../components/ExecutiveReportPanel.jsx";
import { isLeadershipRole } from "../lib/permissions.js";
import BuyerReport from "../components/BuyerReport.jsx";
import { useLanguage } from "../lib/i18n/language.jsx";
import { Select } from "../components/Select.jsx";
import { formatCurrency } from "../lib/format.js";

// Report builder. Pick a source, pick the columns, pick the filters, run it,
// export it, save it as a preset.
//
// The field catalog is served by /api/reports/catalog rather than duplicated
// here — the server validates against the same list, so a field can never be
// offered in the UI that the API would reject. Buyer scoping happens
// server-side inside Keitaro; nothing here can widen it.

// One screen of rows. The server will serve up to 500, but a hundred is what
// a person actually reads before reaching for the export.
const PAGE_SIZE = 100;

const ISO = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => ISO(new Date(Date.now() - n * 86400000));

const RANGE_PRESETS = [
  { value: "today", label: "Today", range: () => ({ from: daysAgo(0), to: daysAgo(0) }) },
  { value: "yesterday", label: "Yesterday", range: () => ({ from: daysAgo(1), to: daysAgo(1) }) },
  { value: "7d", label: "Last 7 days", range: () => ({ from: daysAgo(6), to: daysAgo(0) }) },
  { value: "30d", label: "Last 30 days", range: () => ({ from: daysAgo(29), to: daysAgo(0) }) },
  {
    value: "this_month",
    label: "This month",
    range: () => {
      const now = new Date();
      return { from: ISO(new Date(now.getFullYear(), now.getMonth(), 1)), to: daysAgo(0) };
    },
  },
  {
    value: "last_month",
    label: "Last month",
    range: () => {
      const now = new Date();
      return {
        from: ISO(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: ISO(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    },
  },
  { value: "custom", label: "Custom range", range: null },
];

// The tracker reports in Asia/Dubai by default — matching the rest of the
// dashboard, so a report and the Statistics view bucket days the same way.
const TIMEZONES = [
  "Asia/Dubai", "UTC", "Europe/Istanbul", "Europe/Madrid", "Europe/London",
  "America/Mexico_City", "America/Sao_Paulo", "Asia/Kolkata",
];

const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", icon: FileDown, desc: "Opens anywhere" },
  { value: "xlsx", label: "Excel", icon: FileSpreadsheet, desc: "Typed numbers, frozen header" },
  { value: "json", label: "JSON", icon: FileJson, desc: "For scripts and tools" },
  { value: "pdf", label: "PDF", icon: FileText, desc: "To read or send on" },
];

// Each source reuses the icon its own section already carries in the nav, so
// the tabs read as shortcuts to familiar places rather than new concepts.
const SOURCE_ICONS = {
  performance: BarChart3,
  clicks: MousePointerClick,
  conversions: CreditCard,
  dashboard: Database,
};
const SOURCE_LABELS = {
  performance: "Performance",
  clicks: "Clicks",
  conversions: "Conversions",
  dashboard: "Dashboard data",
};

const OPERATOR_LABELS = {
  EQUALS: "equals", NOT_EQUAL: "does not equal",
  CONTAINS: "contains", NOT_CONTAIN: "does not contain",
  BEGINS_WITH: "begins with", ENDS_WITH: "ends with",
  IN_LIST: "is any of", NOT_IN_LIST: "is none of",
  MATCH_REGEXP: "matches regex", NOT_MATCH_REGEXP: "does not match regex",
  GREATER_THAN: "greater than", LESS_THAN: "less than",
  EQUALS_OR_GREATER_THAN: "at least", EQUALS_OR_LESS_THAN: "at most",
  BETWEEN: "between", IS_SET: "is set", IS_NOT_SET: "is not set",
  IS_TRUE: "is true", IS_FALSE: "is false",
};

const NO_VALUE = new Set(["IS_SET", "IS_NOT_SET", "IS_TRUE", "IS_FALSE"]);
const LIST_VALUE = new Set(["IN_LIST", "NOT_IN_LIST"]);
const PAIR_VALUE = new Set(["BETWEEN"]);

// Group an ordered field list into [{ group, fields }] preserving first-seen
// group order, so the picker reads in the catalog's deliberate order rather
// than alphabetically.
const groupFields = (fields) => {
  const groups = new Map();
  for (const field of fields) {
    if (!groups.has(field.group)) groups.set(field.group, []);
    groups.get(field.group).push(field);
  }
  return [...groups.entries()].map(([group, list]) => ({ group, fields: list }));
};

// One-click starting points. Buyers should not have to know that "Unique →
// FTD" needs unique clicks selected too — a bundle sets a whole readable
// report at once, and they can adjust from there.
const METRIC_BUNDLES = [
  {
    key: "funnel",
    label: "Funnel",
    hint: "Volume at each step plus the rates between them",
    measures: ["clicks", "campaign_unique_clicks", "regs", "custom_conversion_8", "u2r", "u2ftd", "r2d"],
  },
  {
    key: "economics",
    label: "Unit economics",
    hint: "What each step costs and returns",
    measures: ["cost", "revenue", "cpr", "cpftd", "arpu", "net_profit", "roi_calc"],
  },
  {
    key: "money",
    label: "Money",
    hint: "Revenue split by conversion type",
    measures: ["revenue", "custom_conversion_8_revenue", "custom_conversion_7_revenue", "cost", "net_profit", "margin"],
  },
  {
    key: "quality",
    label: "Traffic quality",
    hint: "How much of the traffic is real",
    measures: ["clicks", "campaign_unique_clicks", "uniq_rate", "bots", "bot_share", "proxies"],
  },
];

// ── Field picker ─────────────────────────────────────────────────────
function FieldPicker({ title, hint, accent, icon: Icon, fields, selected, onToggle, onSetAll, t }) {
  const [query, setQuery] = React.useState("");
  const normalized = query.trim().toLowerCase();
  // Search the label, the Keitaro key, the formula AND the team's own names
  // for the metric. The labels read as funnels ("Unique → Register") but
  // people type "unique2reg" — without the aliases that search comes back
  // empty and the metric may as well not exist.
  const matches = React.useMemo(() => {
    if (!normalized) return fields;
    const needle = normalized.replace(/\s+/g, "");
    return fields.filter((f) => {
      const haystack = [
        f.label,
        f.key,
        f.hint || "",
        ...(f.aliases || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized) || haystack.replace(/[\s→_-]+/g, "").includes(needle);
    });
  }, [fields, normalized]);
  const grouped = React.useMemo(() => groupFields(matches), [matches]);
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  return (
    <div className="report-picker">
      <div className="report-picker-head">
        <div className="stats-panel-title">
          <span className="stats-icon-tile" style={{ "--tile-accent": accent }}>
            <Icon size={14} />
          </span>
          <div>
            <span className="report-picker-title">{t(title)}</span>
            <span className="report-picker-hint">{t(hint)}</span>
          </div>
        </div>
        <div className="report-picker-head-right">
          {selected.length ? (
            <button type="button" className="report-picker-clear" onClick={() => onSetAll([])}>
              {t("Clear")}
            </button>
          ) : null}
          <span className="roles-count">{selected.length}</span>
        </div>
      </div>
      <div className="registry-search report-picker-search">
        <Search size={14} aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Find a field…")}
        />
        {query ? (
          <button
            type="button"
            className="registry-search-clear"
            onClick={() => setQuery("")}
            aria-label={t("Clear search")}
          >
            <X size={13} />
          </button>
        ) : null}
      </div>
      <div className="report-picker-list">
        {grouped.length ? (
          grouped.map(({ group, fields: list }) => (
            <div key={group} className="report-picker-group">
              <div className="report-picker-group-label">{t(group)}</div>
              {list.map((field) => {
                const isOn = selectedSet.has(field.key);
                return (
                  <button
                    key={field.key}
                    type="button"
                    className={`report-field-option${isOn ? " is-selected" : ""}`}
                    onClick={() => onToggle(field.key)}
                    title={field.hint ? `${field.key} — ${field.hint}` : field.key}
                  >
                    <span className="report-field-text">
                      <span className="report-field-label">{field.label}</span>
                      {/* A computed column is only trustworthy if you can see
                          what it divides by. */}
                      {field.hint ? (
                        <span className="report-field-formula">{field.hint}</span>
                      ) : null}
                    </span>
                    <span className="report-field-check">{isOn ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          ))
        ) : (
          <div className="report-picker-empty">{t("Nothing matches that.")}</div>
        )}
      </div>
    </div>
  );
}

// Selected fields, in the order they will appear as columns.
function SelectedFields({ label, keys, fieldMap, onRemove, onMove, t }) {
  if (!keys.length) return null;
  return (
    <div className="report-selected">
      <span className="report-selected-label">{t(label)}</span>
      <div className="report-selected-chips">
        {keys.map((key, index) => (
          <span key={key} className="report-selected-chip">
            {/* Chips sit in a row and map to column order left-to-right, so
                the arrows point the way the column actually moves. */}
            <button
              type="button"
              className="report-chip-move"
              disabled={index === 0}
              onClick={() => onMove(index, index - 1)}
              aria-label={t("Move left")}
            >
              <ChevronLeft size={11} />
            </button>
            <button
              type="button"
              className="report-chip-move"
              disabled={index === keys.length - 1}
              onClick={() => onMove(index, index + 1)}
              aria-label={t("Move right")}
            >
              <ChevronRight size={11} />
            </button>
            <span className="report-chip-label">{fieldMap.get(key)?.label || key}</span>
            <button
              type="button"
              className="report-chip-remove"
              onClick={() => onRemove(key)}
              aria-label={t("Remove")}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Filter builder ───────────────────────────────────────────────────
function FilterRow({ filter, index, allFields, operators, onChange, onRemove, t }) {
  const field = allFields.find((f) => f.key === filter.field) || null;
  const allowed = field ? operators[field.type] || operators.string : [];
  const operator = filter.operator;

  const setField = (key) => {
    const next = allFields.find((f) => f.key === key);
    const nextOps = next ? operators[next.type] || operators.string : [];
    onChange(index, { field: key, operator: nextOps[0] || "EQUALS", value: "" });
  };

  return (
    <div className="report-filter-row">
      <div className="field report-filter-field">
        <Select
          value={filter.field}
          onChange={setField}
          options={allFields.map((f) => ({ value: f.key, label: `${f.group} · ${f.label}` }))}
          placeholder={t("Field")}
          searchPlaceholder={t("Find a field")}
        />
      </div>
      <div className="field report-filter-op">
        <Select
          value={operator}
          onChange={(value) => onChange(index, { ...filter, operator: value, value: "" })}
          options={allowed.map((op) => ({ value: op, label: t(OPERATOR_LABELS[op] || op) }))}
          placeholder={t("Condition")}
        />
      </div>
      <div className="field report-filter-value">
        {NO_VALUE.has(operator) ? (
          <span className="report-filter-novalue">{t("No value needed")}</span>
        ) : PAIR_VALUE.has(operator) ? (
          <div className="report-filter-pair">
            <input
              type={field?.type === "number" ? "number" : "text"}
              value={Array.isArray(filter.value) ? filter.value[0] ?? "" : ""}
              onChange={(event) =>
                onChange(index, {
                  ...filter,
                  value: [event.target.value, Array.isArray(filter.value) ? filter.value[1] ?? "" : ""],
                })
              }
              placeholder={t("Min")}
            />
            <input
              type={field?.type === "number" ? "number" : "text"}
              value={Array.isArray(filter.value) ? filter.value[1] ?? "" : ""}
              onChange={(event) =>
                onChange(index, {
                  ...filter,
                  value: [Array.isArray(filter.value) ? filter.value[0] ?? "" : "", event.target.value],
                })
              }
              placeholder={t("Max")}
            />
          </div>
        ) : (
          <input
            type={field?.type === "number" && !LIST_VALUE.has(operator) ? "number" : "text"}
            value={typeof filter.value === "string" ? filter.value : ""}
            onChange={(event) => onChange(index, { ...filter, value: event.target.value })}
            placeholder={LIST_VALUE.has(operator) ? t("Comma-separated, e.g. TR, MX, BR") : t("Value")}
          />
        )}
      </div>
      <button
        type="button"
        className="icon-btn icon-btn-danger"
        onClick={() => onRemove(index)}
        aria-label={t("Remove filter")}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Export preview ───────────────────────────────────────────────────
// The on-screen table answers "what is in my report". This answers the two
// questions it cannot: what the values look like once they leave the browser,
// and how many rows the file actually holds (the table stops at 500; the file
// does not).
function ExportDialog({ open, onClose, format, setFormat, preview, loading, error, onDownload, downloading, t }) {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  // React renders once with the NEW format and the OLD preview before the
  // fetch effect runs. A csv preview has `lines`, a pdf one has null, so
  // rendering that in-between state crashed. Only trust a preview that was
  // built for the format currently selected.
  const ready = preview && preview.format === format ? preview : null;
  const columns = ready?.columns || [];

  return (
    <div className="report-modal-backdrop" onMouseDown={onClose}>
      <motion.div
        className="report-modal"
        onMouseDown={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="report-modal-head">
          <div>
            <h3 className="panel-title">{t("Export")}</h3>
            <p className="panel-subtitle">{t("Check the file before you download it.")}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t("Close")}>
            <X size={16} />
          </button>
        </div>

        <div className="report-format-tiles">
          {EXPORT_FORMATS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                className={`report-format-tile${item.value === format ? " is-active" : ""}`}
                onClick={() => setFormat(item.value)}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="report-format-name">{item.label}</span>
                <span className="report-format-desc">{t(item.desc)}</span>
              </button>
            );
          })}
        </div>

        {loading || (!ready && !error) ? (
          <div className="empty-state">
            <span className="login-spinner" aria-hidden="true" />
            <span>{t("Building the preview…")}</span>
          </div>
        ) : error ? (
          <div className="empty-state report-error">
            <AlertTriangle size={16} aria-hidden="true" /> {error}
          </div>
        ) : ready ? (
          <>
            <div className="report-export-facts">
              <div className="report-fact">
                <span className="report-fact-label">{t("File")}</span>
                <span className="report-fact-value">{ready.filename}</span>
              </div>
              <div className="report-fact">
                <span className="report-fact-label">{t("Rows in file")}</span>
                <span className="report-fact-value">
                  {ready.rowsInFile.toLocaleString()}
                  {ready.rowsInFile < ready.totalRows ? (
                    <em> {t("of {total}", { total: ready.totalRows.toLocaleString() })}</em>
                  ) : null}
                </span>
              </div>
              <div className="report-fact">
                <span className="report-fact-label">{t("Columns")}</span>
                <span className="report-fact-value">{columns.length}</span>
              </div>
              <div className="report-fact">
                <span className="report-fact-label">{t("Approx. size")}</span>
                <span className="report-fact-value">{formatBytes(ready.estimatedBytes)}</span>
              </div>
            </div>

            {ready.notes?.length ? (
              <ul className="report-export-notes">
                {ready.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}

            <div className="report-preview-label">
              {t("First {n} rows, exactly as they will appear in the file", { n: ready.sample.length })}
            </div>

            {/* CSV and JSON are text files, so show the real text. A table
                would be a prettier lie about what opens in a text editor. */}
            {format === "csv" ? (
              <pre className="report-preview-raw">
                <code>
                  <span className="report-preview-headerline">{ready.header}</span>
                  {"\n"}
                  {ready.lines.join("\n")}
                </code>
              </pre>
            ) : format === "json" ? (
              <pre className="report-preview-raw">
                <code>{JSON.stringify(ready.sample, null, 2)}</code>
              </pre>
            ) : (
              <div className="table-wrap report-preview-table-wrap">
                <table className="entries-table stats-table report-table">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column.key} className={column.role === "measure" ? "is-measure" : undefined}>
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ready.sample.map((row, index) => (
                      <tr key={`preview-${index}`}>
                        {columns.map((column) => (
                          <td key={column.key} className={column.role === "measure" ? "is-measure" : undefined}>
                            {row[column.key] === "" || row[column.key] === null ? (
                              <span className="report-preview-empty">{t("empty")}</span>
                            ) : (
                              String(row[column.key])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {format === "xlsx" ? (
              <p className="report-preview-foot">
                {t("Right-aligned columns arrive as numbers Excel can sum and sort.")}
              </p>
            ) : null}
          </>
        ) : null}

        <div className="report-modal-actions">
          <button type="button" className="ghost" onClick={onClose}>{t("Cancel")}</button>
          <button
            type="button"
            className="action-pill"
            onClick={onDownload}
            disabled={downloading || loading || !ready}
          >
            <Download size={14} aria-hidden="true" />
            {downloading ? t("Downloading…") : t("Download {format}", { format: format.toUpperCase() })}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Cell rendering ───────────────────────────────────────────────────
const renderCell = (value, column) => {
  if (value === null || value === undefined || value === "") return "—";
  if (column.type === "date") {
    const raw = String(value);
    // Keitaro's day/date dimensions are already plain YYYY-MM-DD; our own
    // tables hand back full ISO timestamps, which read as noise in a table.
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return parsed.toISOString().slice(0, 16).replace("T", " ");
  }
  if (column.type !== "number") return String(value);
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  if (column.format === "money") return formatCurrency(num);
  if (column.format === "percent") return `${num.toFixed(2)}%`;
  return num.toLocaleString();
};

export default function ReportsDashboard({ authUser }) {
  const { t } = useLanguage();

  // Two tools, not two tabs of one. The builder pulls a table to answer a
  // question you already have; the executive report is the standing picture
  // someone reads before they have one.
  const [mode, setMode] = React.useState("builder");
  // The executive report reports on the whole team, so it is leadership's.
  // A buyer opening Reports still sees the tab — locked — because a section
  // that simply is not there reads as something missing.
  const canSeeExecutive = isLeadershipRole(authUser?.role);
  // The buyer report is the drill-down from the executive one, so it sits
  // after it and behind the same gate. A buyer reaching their OWN report does
  // it from "My Report" in Overview; this tab exists so a team leader can open
  // anyone's before a one-to-one, which is a different job.
  const [pickedBuyer, setPickedBuyer] = React.useState("");

  const [catalog, setCatalog] = React.useState(null);
  const [catalogError, setCatalogError] = React.useState(null);
  const [source, setSource] = React.useState("performance");

  const [rangePreset, setRangePreset] = React.useState("30d");
  const [range, setRange] = React.useState(() => ({ from: daysAgo(29), to: daysAgo(0) }));
  const [timezone, setTimezone] = React.useState("Asia/Dubai");

  // Per-source selections, so switching tabs doesn't destroy the other
  // source's half-built report.
  const [selection, setSelection] = React.useState({});
  const [filters, setFilters] = React.useState([]);
  const [sort, setSort] = React.useState([]);

  const [result, setResult] = React.useState(null);
  const [running, setRunning] = React.useState(false);
  const [runError, setRunError] = React.useState(null);
  const [exporting, setExporting] = React.useState("");
  const [exportError, setExportError] = React.useState(null);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState("csv");
  const [preview, setPreview] = React.useState(null);
  const [previewState, setPreviewState] = React.useState({ loading: false, error: null });
  const [page, setPage] = React.useState(0);

  const [presets, setPresets] = React.useState([]);
  const [presetName, setPresetName] = React.useState("");
  const [savingPreset, setSavingPreset] = React.useState(false);
  const [activePresetId, setActivePresetId] = React.useState(null);

  // ── Catalog ────────────────────────────────────────────────────────
  // Nothing on this page can render without the field catalog, so a failure
  // here is a dead end. Say which kind of failure it is and offer the way
  // out — a bare status code leaves the reader with nothing to do.
  const [catalogLoading, setCatalogLoading] = React.useState(true);
  const [catalogAttempt, setCatalogAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError(null);
    (async () => {
      try {
        const response = await apiFetch("/api/reports/catalog");
        if (!response.ok) {
          const status = response.status;
          // 502/503/504 come from the proxy when the API itself is not
          // answering — the API being down, not the report being wrong.
          if (status === 502 || status === 503 || status === 504) {
            throw new Error("Can't reach the API right now. It may be restarting or still deploying.");
          }
          if (status === 404) {
            throw new Error("Reports is not available on this server yet — the API needs to finish deploying.");
          }
          if (status === 401) {
            throw new Error("Your session expired. Sign in again to load Reports.");
          }
          if (status === 403) {
            throw new Error("Your role does not have access to Reports.");
          }
          throw new Error(`Could not load the field catalog (${status}).`);
        }
        const data = await response.json();
        if (cancelled) return;
        setCatalog(data);
        // Seed each source with its default columns so the page is runnable
        // the moment it loads.
        const seeded = {};
        for (const def of data.sources || []) {
          if (def.kind === "aggregated") {
            seeded[def.id] = {
              dimensions: def.defaults?.dimensions || [],
              measures: def.defaults?.measures || [],
            };
          } else if (def.kind === "table") {
            for (const item of def.entities || []) {
              seeded[`${def.id}:${item.id}`] = {
                columns:
                  item.id === def.defaults?.entity && def.defaults?.columns?.length
                    ? def.defaults.columns
                    : item.columns.slice(0, 7).map((c) => c.key),
              };
            }
          } else {
            seeded[def.id] = { columns: def.defaults?.columns || [] };
          }
        }
        setSelection(seeded);
      } catch (error) {
        // apiFetch throws (rather than returning a response) when the request
        // never reached anything at all.
        if (!cancelled) {
          setCatalogError(
            error?.message?.includes("fetch") || error?.name === "TypeError"
              ? "Can't reach the API right now. It may be restarting or still deploying."
              : error.message || "Could not load the field catalog."
          );
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Bumping catalogAttempt re-runs this effect — that is the Retry button.
  }, [catalogAttempt]);

  const loadPresets = React.useCallback(async () => {
    try {
      const response = await apiFetch("/api/report-presets");
      if (!response.ok) return;
      setPresets(await response.json());
    } catch {
      /* a preset list failure must not block the builder */
    }
  }, []);
  React.useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const sourceDef = React.useMemo(
    () => (catalog?.sources || []).find((s) => s.id === source) || null,
    [catalog, source]
  );
  const isAggregated = sourceDef?.kind === "aggregated";
  const isTable = sourceDef?.kind === "table";

  // Dashboard-data reports pick one of our own tables first; each has its own
  // column list, so the entity choice drives everything below it.
  const [entity, setEntity] = React.useState("");
  React.useEffect(() => {
    if (!isTable) return;
    const available = sourceDef.entities || [];
    if (!available.some((e) => e.id === entity)) {
      setEntity(sourceDef.defaults?.entity || available[0]?.id || "");
    }
  }, [isTable, sourceDef, entity]);
  const entityDef = React.useMemo(
    () => (isTable ? (sourceDef.entities || []).find((e) => e.id === entity) || null : null),
    [isTable, sourceDef, entity]
  );

  const allFields = React.useMemo(() => {
    if (!sourceDef) return [];
    if (isAggregated) return [...sourceDef.dimensions, ...sourceDef.measures];
    if (isTable) return entityDef?.columns || [];
    return sourceDef.columns;
  }, [sourceDef, isAggregated, isTable, entityDef]);
  const fieldMap = React.useMemo(() => new Map(allFields.map((f) => [f.key, f])), [allFields]);

  // Each dashboard entity has its own column list, so selections are keyed by
  // source AND entity — switching table then back must not carry columns that
  // do not exist on the other one.
  const selectionKey = isTable ? `${source}:${entity}` : source;
  const current =
    selection[selectionKey] ||
    (isAggregated
      ? { dimensions: [], measures: [] }
      : { columns: isTable ? (entityDef?.columns || []).slice(0, 7).map((c) => c.key) : [] });

  const updateSelection = React.useCallback(
    (patch) =>
      setSelection((prev) => ({
        ...prev,
        [selectionKey]: { ...(prev[selectionKey] || current), ...patch },
      })),
    [selectionKey, current]
  );

  const toggleKey = React.useCallback(
    (bucket, key) => {
      const list = current[bucket] || [];
      updateSelection({ [bucket]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key] });
    },
    [current, updateSelection]
  );

  const setAll = React.useCallback(
    (bucket, keys) => updateSelection({ [bucket]: keys }),
    [updateSelection]
  );

  // Applying a bundle adds its metrics without throwing away what is already
  // picked — it is a starting point, not a reset.
  const applyBundle = React.useCallback(
    (bundle) => {
      const existing = current.measures || [];
      const merged = [...existing];
      for (const key of bundle.measures) if (!merged.includes(key)) merged.push(key);
      updateSelection({ measures: merged });
    },
    [current, updateSelection]
  );

  const moveKey = React.useCallback(
    (bucket, from, to) => {
      const list = [...(current[bucket] || [])];
      if (to < 0 || to >= list.length) return;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      updateSelection({ [bucket]: list });
    },
    [current, updateSelection]
  );

  // ── Build the request the server expects ───────────────────────────
  const buildBody = React.useCallback(() => {
    const base = { source, range: { ...range, timezone }, filters, sort };
    if (isAggregated) {
      return { ...base, dimensions: current.dimensions || [], measures: current.measures || [] };
    }
    return { ...base, ...(isTable ? { entity } : {}), columns: current.columns || [] };
  }, [source, range, timezone, filters, sort, isAggregated, isTable, entity, current]);

  const canRun = isAggregated
    ? (current.dimensions || []).length > 0 && (current.measures || []).length > 0
    : (current.columns || []).length > 0;

  // The preview pages through the report; the export never does — it always
  // covers the whole thing, so paging state must not leak into its body.
  const runReport = React.useCallback(async (rawPage = 0) => {
    // Guard the callers that hand this straight to an event handler.
    const pageIndex = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
    setRunning(true);
    setRunError(null);
    setExportError(null);
    try {
      const response = await apiFetch(
        "/api/reports/run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...buildBody(), limit: PAGE_SIZE, offset: pageIndex * PAGE_SIZE }),
        },
        { timeoutMs: 120000 }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || `Report failed (${response.status})`);
      setResult(data);
      setPage(pageIndex);
    } catch (error) {
      setResult(null);
      setRunError(error.message || "The report could not be run.");
    } finally {
      setRunning(false);
    }
  }, [buildBody]);

  // Sorting re-runs server-side: the preview is a capped slice, so sorting
  // only the fetched rows would reorder a window rather than the report.
  const toggleSort = React.useCallback(
    (key) => {
      const existing = sort.find((s) => s.name === key);
      const next = !existing
        ? [{ name: key, order: "DESC" }]
        : existing.order === "DESC"
          ? [{ name: key, order: "ASC" }]
          : [];
      setSort(next);
    },
    [sort]
  );
  const sortRef = React.useRef(sort);
  React.useEffect(() => {
    // Re-run only when sort changes on an already-rendered report.
    if (sortRef.current !== sort && result) runReport();
    sortRef.current = sort;
  }, [sort, result, runReport]);

  // Cmd/Ctrl+Enter runs from anywhere on the page — the Run button is off
  // screen by the time you have finished picking columns.
  React.useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && canRun && !running) {
        event.preventDefault();
        runReport();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canRun, running, runReport]);

  // Re-fetch the preview whenever the dialog opens or the format changes —
  // the facts (size, row count, formatting notes) differ per format.
  React.useEffect(() => {
    if (!exportOpen) return undefined;
    let cancelled = false;
    setPreviewState({ loading: true, error: null });
    setPreview(null);
    (async () => {
      try {
        const response = await apiFetch(
          "/api/reports/export/preview",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...buildBody(), format: exportFormat }),
          },
          { timeoutMs: 90000 }
        );
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error(data?.error || `Preview failed (${response.status})`);
        setPreview(data);
        setPreviewState({ loading: false, error: null });
      } catch (error) {
        if (!cancelled) setPreviewState({ loading: false, error: error.message || "Could not build the preview." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [exportOpen, exportFormat, buildBody]);

  const exportReport = React.useCallback(
    async (format) => {
      setExporting(format);
      setExportError(null);
      try {
        const response = await apiFetch(
          "/api/reports/export",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...buildBody(), format }),
          },
          { timeoutMs: 300000, retries: 1 }
        );
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || `Export failed (${response.status})`);
        }
        const disposition = response.headers.get("content-disposition") || "";
        const match = /filename="?([^"]+)"?/.exec(disposition);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = match?.[1] || `report.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        setExportError(error.message || "The export failed.");
      } finally {
        setExporting("");
      }
    },
    [buildBody]
  );

  // ── Presets ────────────────────────────────────────────────────────
  const savePreset = React.useCallback(async () => {
    const name = presetName.trim();
    if (!name) return;
    setSavingPreset(true);
    try {
      const config = {
        range: { ...range, timezone },
        rangePreset,
        filters,
        sort,
        ...(isAggregated
          ? { dimensions: current.dimensions || [], measures: current.measures || [] }
          : { columns: current.columns || [] }),
      };
      const response = await apiFetch("/api/report-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, source, config, isShared: false }),
      });
      if (response.ok) {
        setPresetName("");
        await loadPresets();
      }
    } finally {
      setSavingPreset(false);
    }
  }, [presetName, range, timezone, rangePreset, filters, sort, isAggregated, current, source, loadPresets]);

  const applyPreset = React.useCallback(
    (preset) => {
      const config = preset.config || {};
      setSource(preset.source);
      setActivePresetId(preset.id);
      if (config.range?.from && config.range?.to) {
        setRange({ from: config.range.from, to: config.range.to });
        setTimezone(config.range.timezone || "Asia/Dubai");
      }
      // A saved absolute range would silently go stale; a saved *relative*
      // range re-resolves to today so "Last 7 days" still means last 7 days.
      const savedPreset = RANGE_PRESETS.find((p) => p.value === config.rangePreset);
      if (savedPreset?.range) {
        setRangePreset(savedPreset.value);
        setRange(savedPreset.range());
      } else if (config.rangePreset) {
        setRangePreset(config.rangePreset);
      }
      setFilters(Array.isArray(config.filters) ? config.filters : []);
      setSort(Array.isArray(config.sort) ? config.sort : []);
      setSelection((prev) => ({
        ...prev,
        [preset.source]:
          config.dimensions || config.measures
            ? { dimensions: config.dimensions || [], measures: config.measures || [] }
            : { columns: config.columns || [] },
      }));
      setResult(null);
    },
    []
  );

  const togglePresetShare = React.useCallback(
    async (preset) => {
      await apiFetch(`/api/report-presets/${preset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: preset.name,
          description: preset.description,
          source: preset.source,
          config: preset.config,
          isShared: !preset.isShared,
        }),
      });
      await loadPresets();
    },
    [loadPresets]
  );

  const deletePreset = React.useCallback(
    async (preset) => {
      await apiFetch(`/api/report-presets/${preset.id}`, { method: "DELETE" });
      if (activePresetId === preset.id) setActivePresetId(null);
      await loadPresets();
    },
    [activePresetId, loadPresets]
  );

  // ── Render ─────────────────────────────────────────────────────────
  if (catalogError) {
    return (
      <section className="panels panels-single">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#ff7d88" }}>
                <AlertIcon size={15} />
              </span>
              <div>
                <h3 className="panel-title">{t("Reports")}</h3>
                <p className="panel-subtitle">{t(catalogError)}</p>
              </div>
            </div>
            <div className="campaign-table-actions">
              <button
                type="button"
                className="ghost"
                onClick={() => setCatalogAttempt((n) => n + 1)}
                disabled={catalogLoading}
              >
                <RefreshCw size={14} aria-hidden="true" />
                {catalogLoading ? t("Retrying…") : t("Try again")}
              </button>
            </div>
          </div>
          <div className="empty-state error">
            {t("Reports needs the field catalog from the API before it can show anything.")}
          </div>
        </motion.div>
      </section>
    );
  }
  if (!catalog || !sourceDef) {
    return (
      <section className="panels panels-single">
        <div className="panel form-panel">
          <div className="empty-state">{t("Loading the field catalog…")}</div>
        </div>
      </section>
    );
  }

  const myPresets = presets.filter((p) => Number(p.ownerId) === Number(authUser?.id));
  const sharedPresets = presets.filter((p) => Number(p.ownerId) !== Number(authUser?.id));
  const selectedCount = isAggregated
    ? (current.dimensions || []).length + (current.measures || []).length
    : (current.columns || []).length;
  // Headline cards: the measures a person reads first, capped to one row.
  const headlineColumns = (result?.columns || [])
    .filter((column) => column.role === "measure" && result.totals?.[column.key] !== undefined)
    .slice(0, 4);

  // The switch sits above both tools, because choosing between them is the
  // first decision — not a setting buried inside one of them.
  const modeSwitch = (
    <div className="offers-tabs xr-mode xr-noprint">
      <button
        type="button"
        className={`offers-tab${mode === "builder" ? " is-active" : ""}`}
        onClick={() => setMode("builder")}
      >
        <ColumnsIcon size={14} />
        <span>{t("Query builder")}</span>
      </button>
      {/* Buyers see it locked rather than not at all: hiding a section makes
          people ask whether it exists, and a padlock answers that in one
          glance. The server refuses them regardless — this is the honest
          front of a gate that is already there. */}
      <button
        type="button"
        className={`offers-tab${mode === "executive" ? " is-active" : ""}${canSeeExecutive ? "" : " is-locked"}`}
        onClick={() => canSeeExecutive && setMode("executive")}
        disabled={!canSeeExecutive}
        aria-disabled={!canSeeExecutive}
        title={canSeeExecutive ? undefined : t("Leadership only — the executive report is for managers taking decisions on the whole team's numbers.")}
      >
        {canSeeExecutive ? <ReportIcon size={14} /> : <Lock size={13} />}
        <span>{t("Executive report")}</span>
      </button>
      {/* After the executive report, not before: the order follows the
          drill-down — the whole team, then one person in it. */}
      <button
        type="button"
        className={`offers-tab${mode === "buyer" ? " is-active" : ""}${canSeeExecutive ? "" : " is-locked"}`}
        onClick={() => canSeeExecutive && setMode("buyer")}
        disabled={!canSeeExecutive}
        aria-disabled={!canSeeExecutive}
        title={canSeeExecutive ? undefined : t("Leadership only — a buyer's own report is under My Report.")}
      >
        {canSeeExecutive ? <AwardIcon size={14} /> : <Lock size={13} />}
        <span>{t("Buyer report")}</span>
      </button>
    </div>
  );

  if (mode === "buyer") {
    return (
      <section className="panels panels-single">
        <div className="panel">
          {modeSwitch}
          <BuyerReport
            range={range}
            buyer={pickedBuyer || null}
            onPickBuyer={setPickedBuyer}
          />
        </div>
      </section>
    );
  }

  if (mode === "executive") {
    return (
      <section className="panels panels-single">
        {modeSwitch}
        <ExecutiveReportPanel t={t} />
      </section>
    );
  }

  return (
    <>
      {modeSwitch}
      {result && headlineColumns.length ? (
        <section className="cards report">
          {headlineColumns.map((column, index) => (
            <motion.div
              key={column.key}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
            >
              <div className="card-head">{column.label}</div>
              <div className={`card-value${Number(result.totals[column.key]) < 0 ? " is-negative" : ""}`}>
                {renderCell(result.totals[column.key], column)}
              </div>
              {/* The formula for a computed metric, otherwise its family —
                  repeating "across N rows" four times says nothing. */}
              <div className="card-meta">{column.hint || t(column.group)}</div>
            </motion.div>
          ))}
        </section>
      ) : null}

      {/* ── Source + range ───────────────────────────────────────── */}
      <section className="panels panels-single">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#36d07c" }}>
                <ReportIcon size={15} />
              </span>
              <div>
                <h3 className="panel-title">{t("Reports")}</h3>
                <p className="panel-subtitle">
                  {t("Pick a source, choose your columns and filters, then export the result.")}
                </p>
              </div>
            </div>
            <div className="offers-tabs">
              {(catalog.sources || []).map((def) => {
                const Icon = SOURCE_ICONS[def.id] || FileText;
                return (
                  <button
                    key={def.id}
                    type="button"
                    className={`offers-tab${def.id === source ? " is-active" : ""}`}
                    onClick={() => {
                      setSource(def.id);
                      setResult(null);
                      setFilters([]);
                      setSort([]);
                      setActivePresetId(null);
                    }}
                  >
                    <Icon size={14} />
                    <span>{t(def.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pixel-table-toolbar report-toolbar">
            {isTable ? (
              <div className="field">
                <label>{t("Data set")}</label>
                <Select
                  value={entity}
                  onChange={(value) => {
                    setEntity(value);
                    setResult(null);
                    setFilters([]);
                    setSort([]);
                  }}
                  options={(sourceDef.entities || []).map((item) => ({ value: item.id, label: t(item.label) }))}
                  placeholder={t("Data set")}
                  searchPlaceholder={t("Find a data set")}
                />
              </div>
            ) : null}
            <div className="field">
              <label>{t("Period")}</label>
              <Select
                value={rangePreset}
                onChange={(value) => {
                  setRangePreset(value);
                  const rangePreset = RANGE_PRESETS.find((p) => p.value === value);
                  if (rangePreset?.range) setRange(rangePreset.range());
                }}
                options={RANGE_PRESETS.map((p) => ({ value: p.value, label: t(p.label) }))}
                placeholder={t("Period")}
              />
            </div>
            <div className="field report-range">
              <label>{t("From — To")}</label>
              <div className="live-custom-range-inputs">
                <input
                  type="date"
                  value={range.from}
                  max={range.to || undefined}
                  onChange={(event) => {
                    setRange((prev) => ({ ...prev, from: event.target.value }));
                    setRangePreset("custom");
                  }}
                />
                <input
                  type="date"
                  value={range.to}
                  min={range.from || undefined}
                  onChange={(event) => {
                    setRange((prev) => ({ ...prev, to: event.target.value }));
                    setRangePreset("custom");
                  }}
                />
              </div>
            </div>
            <div className="field">
              <label>{t("Timezone")}</label>
              <Select
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
                placeholder={t("Timezone")}
                searchPlaceholder={t("Find a timezone")}
              />
            </div>
            <div className="field report-run-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="action-pill report-run-btn"
                onClick={() => runReport(0)}
                disabled={!canRun || running}
              >
                <Play size={14} aria-hidden="true" />
                {running ? t("Running…") : t("Run report")}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Columns ──────────────────────────────────────────────── */}
      <section className="panels panels-single">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#64b8ff" }}>
                <ColumnsIcon size={15} />
              </span>
              <div>
                <h3 className="panel-title">{t("Columns")}</h3>
                <p className="panel-subtitle">
                  {isAggregated
                    ? t("Group by decides the rows. Metrics decide what is measured for each row.")
                    : isTable
                      ? // These are the dashboard's own records — they hold no
                        // clicks or deposits, so no funnel metric can exist
                        // here. Say where those live instead of leaving the
                        // reader hunting for a picker that will never appear.
                        t("Records from the dashboard's own tables. Funnel metrics like unique2reg live on the Performance source.")
                      : t("Each column you pick becomes a column in the export.")}
                </p>
              </div>
            </div>
            <div className="summary-inline">
              <span>{t("{n} selected", { n: selectedCount })}</span>
            </div>
          </div>

          {isAggregated ? (
            <div className="report-bundles">
              <span className="report-bundles-label">{t("Quick add")}</span>
              {METRIC_BUNDLES.map((bundle) => (
                <button
                  key={bundle.key}
                  type="button"
                  className="report-bundle"
                  onClick={() => applyBundle(bundle)}
                  title={t(bundle.hint)}
                >
                  <Plus size={11} aria-hidden="true" />
                  {t(bundle.label)}
                </button>
              ))}
            </div>
          ) : null}

          <div className={`report-pickers${isAggregated ? "" : " is-single"}`}>
            {isAggregated ? (
              <>
                <FieldPicker
                  title="Group by"
                  hint="One row per unique combination"
                  accent="#a15bff"
                  icon={GroupIcon}
                  fields={sourceDef.dimensions}
                  selected={current.dimensions || []}
                  onToggle={(key) => toggleKey("dimensions", key)}
                  onSetAll={(keys) => setAll("dimensions", keys)}
                  t={t}
                />
                <FieldPicker
                  title="Metrics"
                  hint="The numbers measured per row"
                  accent="#36d07c"
                  icon={MetricIcon}
                  fields={sourceDef.measures}
                  selected={current.measures || []}
                  onToggle={(key) => toggleKey("measures", key)}
                  onSetAll={(keys) => setAll("measures", keys)}
                  t={t}
                />
              </>
            ) : (
              <FieldPicker
                title="Columns"
                hint={isTable ? "Every field on this record" : "Every field on the raw event"}
                accent="#49e0c4"
                icon={ColumnsIcon}
                fields={allFields}
                selected={current.columns || []}
                onToggle={(key) => toggleKey("columns", key)}
                onSetAll={(keys) => setAll("columns", keys)}
                t={t}
              />
            )}
          </div>

          {isAggregated ? (
            <>
              <SelectedFields
                label="Grouped by"
                keys={current.dimensions || []}
                fieldMap={fieldMap}
                onRemove={(key) => toggleKey("dimensions", key)}
                onMove={(from, to) => moveKey("dimensions", from, to)}
                t={t}
              />
              <SelectedFields
                label="Measuring"
                keys={current.measures || []}
                fieldMap={fieldMap}
                onRemove={(key) => toggleKey("measures", key)}
                onMove={(from, to) => moveKey("measures", from, to)}
                t={t}
              />
            </>
          ) : (
            <SelectedFields
              label="Selected columns"
              keys={current.columns || []}
              fieldMap={fieldMap}
              onRemove={(key) => toggleKey("columns", key)}
              onMove={(from, to) => moveKey("columns", from, to)}
              t={t}
            />
          )}
        </motion.div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <section className="panels panels-single">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#f7c625" }}>
                <FilterIcon size={15} />
              </span>
              <div>
                <h3 className="panel-title">{t("Filters")}</h3>
                <p className="panel-subtitle">
                  {t("Every condition must be true. Filters run inside the tracker, so they apply to the whole report — not just the rows on screen.")}
                </p>
              </div>
            </div>
            <div className="campaign-table-actions">
              {filters.length ? (
                <span className="roles-count">{t("{n} active", { n: filters.length })}</span>
              ) : null}
              <button
                type="button"
                className="icon-btn"
                title={t("Add filter")}
                aria-label={t("Add filter")}
                onClick={() =>
                  setFilters((prev) => [
                    ...prev,
                    { field: allFields[0]?.key || "", operator: "CONTAINS", value: "" },
                  ])
                }
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {filters.length ? (
            <div className="report-filters">
              {filters.map((filter, index) => (
                <React.Fragment key={`filter-${index}`}>
                  {index > 0 ? <div className="report-filter-and">{t("and")}</div> : null}
                  <FilterRow
                    filter={filter}
                    index={index}
                    allFields={allFields}
                    operators={catalog.operators}
                    onChange={(i, next) =>
                      setFilters((prev) => prev.map((item, idx) => (idx === i ? next : item)))
                    }
                    onRemove={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
                    t={t}
                  />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="empty-state">{t("No filters — the report covers everything you can see.")}</div>
          )}
        </motion.div>
      </section>

      {/* ── Result ───────────────────────────────────────────────── */}
      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Result")}</h3>
              <p className="panel-subtitle">
                {result
                  ? t("Rows {from}–{to} of {total}", {
                      from: (page * PAGE_SIZE + 1).toLocaleString(),
                      to: (page * PAGE_SIZE + (result.rows || []).length).toLocaleString(),
                      total: (result.total || 0).toLocaleString(),
                    })
                  : t("Run the report to see the result here.")}
              </p>
            </div>
            {result ? (
              <div className="campaign-table-actions">
                <span className="roles-count">
                  {t("{n} rows", { n: (result.total || 0).toLocaleString() })}
                </span>
                {/* Was an unlabelled icon. Export is the point of running a
                    report, and a feature you have to hover to discover reads
                    as a feature that is not there. */}
                <button
                  type="button"
                  className="ghost registry-export-btn"
                  title={t("Export…")}
                  onClick={() => setExportOpen(true)}
                >
                  <Download size={14} /> {t("Export")}
                </button>
              </div>
            ) : null}
          </div>

          {runError ? <div className="empty-state error">{runError}</div> : null}
          {exportError ? <div className="empty-state error">{exportError}</div> : null}

          {running && !result ? (
            <div className="empty-state">{t("Running…")}</div>
          ) : result ? (
            (result.rows || []).length ? (
              <>
                <div className={`table-wrap report-table-wrap${running ? " is-busy" : ""}`}>
                  <table className="entries-table stats-table report-table">
                    <thead>
                      <tr>
                        <th className="report-rownum">#</th>
                        {result.columns.map((column) => {
                          const active = sort.find((s) => s.name === column.key);
                          return (
                            <th
                              key={column.key}
                              className={column.role === "measure" ? "is-measure" : undefined}
                              title={column.hint || undefined}
                            >
                              <button
                                type="button"
                                className={`sortable-header${active ? " active" : ""}`}
                                onClick={() => toggleSort(column.key)}
                              >
                                {column.label}
                                <span className="sort-indicator">
                                  {active ? (active.order === "DESC" ? "▼" : "▲") : "↕"}
                                </span>
                              </button>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, index) => (
                        <tr key={`row-${index}`}>
                          <td className="report-rownum">{page * PAGE_SIZE + index + 1}</td>
                          {result.columns.map((column) => {
                            const value = row[column.key];
                            const negative = column.type === "number" && Number(value) < 0;
                            return (
                              <td
                                key={column.key}
                                className={`${column.role === "measure" ? "is-measure" : ""}${negative ? " is-negative" : ""}`.trim() || undefined}
                              >
                                {renderCell(value, column)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                    {result.totals ? (
                      <tfoot>
                        <tr>
                          <td className="report-rownum" />
                          {result.columns.map((column, index) => (
                            <td key={column.key} className={column.role === "measure" ? "is-measure" : undefined}>
                              {column.role === "measure"
                                ? renderCell(result.totals[column.key], column)
                                : index === 0
                                  ? t("Total")
                                  : ""}
                            </td>
                          ))}
                        </tr>
                      </tfoot>
                    ) : null}
                  </table>
                </div>

                {result.total > PAGE_SIZE ? (
                  <div className="report-pager">
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => runReport(page - 1)}
                      disabled={page === 0 || running}
                    >
                      <ChevronLeft size={14} aria-hidden="true" /> {t("Previous")}
                    </button>
                    <span className="roles-count">
                      {t("Page {page} of {pages}", {
                        page: (page + 1).toLocaleString(),
                        pages: Math.ceil(result.total / PAGE_SIZE).toLocaleString(),
                      })}
                    </span>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => runReport(page + 1)}
                      disabled={(page + 1) * PAGE_SIZE >= result.total || running}
                    >
                      {t("Next")} <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="empty-state">{t("No rows matched. Try a wider range or fewer filters.")}</div>
            )
          ) : (
            // The subtitle already says "run the report" — repeating it here
            // wastes the one line that could tell them what they'd get.
            <div className="empty-state">
              {t("{columns} columns over {from} — {to}. Nothing has been run yet.", {
                columns: selectedCount,
                from: range.from || "—",
                to: range.to || "—",
              })}
            </div>
          )}
        </motion.div>
      </section>

      {/* ── Saved reports ────────────────────────────────────────── */}
      <section className="panels panels-single">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
        >
          <div className="panel-head">
            <div className="stats-panel-title">
              <span className="stats-icon-tile" style={{ "--tile-accent": "#ff9357" }}>
                <SavedIcon size={15} />
              </span>
              <div>
                <h3 className="panel-title">{t("Saved reports")}</h3>
                <p className="panel-subtitle">
                  {t("Save this setup and run it again later. Share one and your team can run it too.")}
                </p>
              </div>
            </div>
            {presets.length ? (
              <span className="roles-count">{t("{n} saved", { n: presets.length })}</span>
            ) : null}
          </div>

          <div className="pixel-table-toolbar report-preset-save">
            <div className="field registry-search-field">
              <label>{t("Name")}</label>
              <div className="registry-search">
                <input
                  type="text"
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder={t("e.g. Daily FTDs by country")}
                />
              </div>
            </div>
            <div className="field report-run-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="action-pill report-run-btn"
                onClick={savePreset}
                disabled={!presetName.trim() || savingPreset}
              >
                <Save size={14} aria-hidden="true" />
                {savingPreset ? t("Saving…") : t("Save this report")}
              </button>
            </div>
          </div>

          {[
            { key: "mine", label: "Your reports", list: myPresets },
            { key: "shared", label: "Shared with you", list: sharedPresets },
          ].map(({ key, label, list }) =>
            list.length ? (
              <div key={key} className="report-preset-group">
                <div className="report-preset-group-label">{t(label)}</div>
                <div className="report-preset-list">
                  <AnimatePresence initial={false}>
                    {list.map((preset) => (
                      <motion.div
                        key={preset.id}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.16 }}
                        className={`report-preset${activePresetId === preset.id ? " is-active" : ""}`}
                      >
                        <button type="button" className="report-preset-main" onClick={() => applyPreset(preset)}>
                          <span className="report-preset-name">{preset.name}</span>
                          <span className="report-preset-meta">
                            {t(SOURCE_LABELS[preset.source] || preset.source)}
                            {preset.ownerName ? ` · ${preset.ownerName}` : ""}
                          </span>
                        </button>
                        {key === "mine" ? (
                          <>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => togglePresetShare(preset)}
                              title={preset.isShared ? t("Shared with the team") : t("Only you can see this")}
                              aria-label={preset.isShared ? t("Stop sharing") : t("Share with the team")}
                            >
                              {preset.isShared ? <Share2 size={14} /> : <Lock size={14} />}
                            </button>
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              onClick={() => deletePreset(preset)}
                              aria-label={t("Delete report")}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : null}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : null
          )}

          {!presets.length ? (
            <div className="empty-state">{t("You have not saved a report yet.")}</div>
          ) : null}
        </motion.div>
      </section>

      <AnimatePresence>
        {exportOpen ? (
          <ExportDialog
            open={exportOpen}
            onClose={() => setExportOpen(false)}
            format={exportFormat}
            setFormat={setExportFormat}
            preview={preview}
            loading={previewState.loading}
            error={previewState.error}
            downloading={Boolean(exporting)}
            onDownload={async () => {
              await exportReport(exportFormat);
              setExportOpen(false);
            }}
            t={t}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
