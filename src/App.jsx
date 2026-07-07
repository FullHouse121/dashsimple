import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  Cell,
  LabelList,
  XAxis,
  YAxis,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import {
  Home,
  Wallet,
  BarChart3,
  Megaphone,
  Trophy,
  Award,
  Medal,
  Crown,
  Gem,
  Flame,
  Rocket,
  Sparkles,
  Search,
  SlidersHorizontal,
  X,
  Clock,
  CheckCircle,
  Link2,
  Copy,
  RotateCcw,
  MousePointerClick,
  Plus,
  Download,
  UserPlus,
  CreditCard,
  Plug,
  Target,
  BookOpen,
  Smartphone,
  Trash2,
  Globe,
  Map as MapIcon,
  Zap,
  ShieldCheck,
  Bell,
  User,
  Users,
  Lock,
  Pencil,
  MessageSquare,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  ArrowRight,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Tag,
  Image as ImageIcon,
  Briefcase,
  AlertTriangle,
  Settings,
  ExternalLink,
  Minus,
  Maximize2,
} from "lucide-react";
import logo from "./assets/logo.png";
import keitaroLogo from "./assets/brands/keitaro.svg";
import zlotLogo from "./assets/brands/zlot-mx.svg";
import jasinoLogo from "./assets/brands/jasino.svg";
import pwaGroupLogo from "./assets/brands/pwa-group.svg";
import zmAppsLogo from "./assets/brands/zm-apps.svg";
import linkiLogo from "./assets/brands/linki-group.svg";
import skakLogo from "./assets/brands/skak-apps.svg";
import pwaPartnersLogo from "./assets/brands/pwa-partners-white.svg";

// Canonical single-path Telegram glyph (tint-able via currentColor) — used in
// place of the heavy multi-shade source logo for small inline UI.
const TelegramGlyph = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.13.56l.41-5.75 10.42-9.42c.45-.4-.1-.63-.7-.23L6.36 12.79l-5.4-1.68c-1.16-.36-1.19-1.17.24-1.73L22.5 2.24c.98-.36 1.83.22 1.41 1.55z" />
  </svg>
);

// Meta infinity mark (lobehub mono, single path) — tint-able via currentColor.
const MetaGlyph = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true">
    <path d="M6.897 4c1.915 0 3.516.932 5.43 3.376l.282-.373c.19-.246.383-.484.58-.71l.313-.35C14.588 4.788 15.792 4 17.225 4c1.273 0 2.469.557 3.491 1.516l.218.213c1.73 1.765 2.917 4.71 3.053 8.026l.011.392.002.25c0 1.501-.28 2.759-.818 3.7l-.14.23-.108.153c-.301.42-.664.758-1.086 1.009l-.265.142-.087.04a3.493 3.493 0 01-.302.118 4.117 4.117 0 01-1.33.208c-.524 0-.996-.067-1.438-.215-.614-.204-1.163-.56-1.726-1.116l-.227-.235c-.753-.812-1.534-1.976-2.493-3.586l-1.43-2.41-.544-.895-1.766 3.13-.343.592C7.597 19.156 6.227 20 4.356 20c-1.21 0-2.205-.42-2.936-1.182l-.168-.184c-.484-.573-.837-1.311-1.043-2.189l-.067-.32a8.69 8.69 0 01-.136-1.288L0 14.468c.002-.745.06-1.49.174-2.23l.1-.573c.298-1.53.828-2.958 1.536-4.157l.209-.34c1.177-1.83 2.789-3.053 4.615-3.16L6.897 4zm-.033 2.615l-.201.01c-.83.083-1.606.673-2.252 1.577l-.138.199-.01.018c-.67 1.017-1.185 2.378-1.456 3.845l-.004.022a12.591 12.591 0 00-.207 2.254l.002.188c.004.18.017.36.04.54l.043.291c.092.503.257.908.486 1.208l.117.137c.303.323.698.492 1.17.492 1.1 0 1.796-.676 3.696-3.641l2.175-3.4.454-.701-.139-.198C9.11 7.3 8.084 6.616 6.864 6.616zm10.196-.552l-.176.007c-.635.048-1.223.359-1.82.933l-.196.198c-.439.462-.887 1.064-1.367 1.807l.266.398c.18.274.362.56.55.858l.293.475 1.396 2.335.695 1.114c.583.926 1.03 1.6 1.408 2.082l.213.262c.282.326.529.54.777.673l.102.05c.227.1.457.138.718.138.176.002.35-.023.518-.073.338-.104.61-.32.813-.637l.095-.163.077-.162c.194-.459.29-1.06.29-1.785l-.006-.449c-.08-2.871-.938-5.372-2.2-6.798l-.176-.189c-.67-.683-1.444-1.074-2.27-1.074z" />
  </svg>
);

// Brand/traffic-source logo registry. Keys are normalized (lowercased, only
// a-z0-9), so "PWA Group" / "PWA.GROUP" / "pwagroup" all resolve to one entry.
const BRAND_LOGOS = {
  pwagroup: { src: pwaGroupLogo, label: "PWA Group" },
  zmapps: { src: zmAppsLogo, label: "ZM Apps" },
  zmap: { src: zmAppsLogo, label: "ZM Apps" },
  linkigroup: { src: linkiLogo, label: "Linki Group" },
  linkgroup: { src: linkiLogo, label: "Linki Group" },
  linki: { src: linkiLogo, label: "Linki Group" },
  link: { src: linkiLogo, label: "Linki Group" },
  zlotmx: { src: zlotLogo, label: "ZlotMX" },
  zlot: { src: zlotLogo, label: "ZlotMX" },
  jasino: { src: jasinoLogo, label: "Jasino" },
  skakapps: { src: skakLogo, label: "SkakApp" },
  skakapp: { src: skakLogo, label: "SkakApp" },
  skak: { src: skakLogo, label: "SkakApp" },
  // PWA Partners ships as a pure-black emblem — invert to white for the dark UI
  pwapartners: { src: pwaPartnersLogo, label: "PWA Partners", invert: true },
  pwapartner: { src: pwaPartnersLogo, label: "PWA Partners", invert: true },
};
const normalizeBrandKey = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const resolveBrandLogo = (value) => {
  const key = normalizeBrandKey(value);
  if (!key) return null;
  if (BRAND_LOGOS[key]) return BRAND_LOGOS[key];
  // guarded prefix match so "pwagroupmx" still resolves, without false hits
  for (const [k, v] of Object.entries(BRAND_LOGOS)) {
    if (k.length >= 4 && (key.startsWith(k) || k.startsWith(key))) return v;
  }
  return null;
};
// Renders a matched brand logo, else a lettermark chip (never a broken image).
const BrandMark = ({ value, height = 15 }) => {
  const raw = String(value || "").trim();
  if (!raw) return <span className="offer-muted">—</span>;
  const hit = resolveBrandLogo(raw);
  if (hit) {
    return (
      <img
        className={`brand-mark platform-mark${hit.invert ? " platform-mark--invert" : ""}`}
        src={hit.src}
        alt={hit.label}
        title={hit.label}
        style={{ height }}
      />
    );
  }
  return (
    <span className="brand-lettermark" title={raw}>
      <span className="brand-lettermark-badge" aria-hidden="true">{raw.slice(0, 1).toUpperCase()}</span>
      {raw}
    </span>
  );
};

// Lazy-loaded dashboard views — each splits into its own chunk so the initial
// bundle stays small. Add more dashboards here as they're extracted to /src/dashboards/
const DocumentationDashboard = React.lazy(() => import("./dashboards/DocumentationDashboard.jsx"));

// Command palette (Cmd+K) — lazy so it doesn't add weight to the initial bundle
const CommandPalette = React.lazy(() => import("./components/CommandPalette.jsx"));

// Skeleton loaders for graceful loading states across dashboards
import { SkeletonCards, SkeletonChart } from "./components/Skeleton.jsx";

// Pure formatting utilities (Phase 1 extraction from inline definitions)
import {
  setActiveFxRate,
  currencyFormatter,
  formatCurrency,
  formatAxis,
  formatVolumeAxis,
  formatValue,
  toGradientId,
  axisTickStyle,
  tooltipStyle,
} from "./lib/format.js";

// Resilient API client with retry, timeout, fallback (Phase 1 extraction)
import { apiFetch } from "./lib/api.js";

// Permissions, filters, and sort helpers (Phase 1)
import { normalizeRoleKey, isLeadershipRole } from "./lib/permissions.js";
import {
  normalizeFilterValue,
  isAllSelection,
  normalizeBuyerKey,
  escapeRegExp,
  matchesBuyerName,
  matchesBuyerFilter,
  matchesCountryFilter,
} from "./lib/filters.js";
import { toggleSortConfig, compareSortValues, getSortIndicator } from "./lib/sort.js";

// i18n: context, hook, translator factory (Phase 1 extraction)
import { LanguageContext, useLanguage, makeT } from "./lib/i18n/language.jsx";

// Static option arrays + country/domain normalizers (Phase 1)
import {
  supportedCountryOptions,
  countryOptions,
  accountRegistryCountryOptions,
  defaultCountryOption,
  resolveCountryIso,
  normalizeCountryValueKey,
  supportedCountryValueMap,
  normalizeCountryListValue,
  normalizeDomainInputValue,
  normalizeDomainInputList,
  categoryOptions,
  billingOptions,
  statusOptions,
  approachOptions,
  priorityBuyers,
  buyerOptions,
  roleOptions,
  permissionOptions,
  periodOptions,
} from "./lib/constants.js";

// SWR cache helpers (Phase 1 extraction)
import { readSwrCache, writeSwrCache, clearSwrCache } from "./lib/cache.js";

// Date utilities (Phase 1 extraction)
import {
  shortMonths,
  DASHBOARD_TIMEZONE,
  formatIsoDate,
  getTimezoneDateParts,
  toIsoFromParts,
  parseIsoToUtcDate,
  shiftIsoDate,
  getTodayIsoInTimezone,
  getDefaultDateRange,
  normalizeDateValue,
  normalizeDateRange,
  getPeriodDateRange,
  isDateInRange,
} from "./lib/date.js";

// API client moved to ./lib/api.js (Phase 1 extraction — retry, timeout, fallback all live there)
// SWR cache helpers moved to ./lib/cache.js (Phase 1 extraction)

// Custom "My Flows" glyph — a source node branching into two, mirroring the
// tracking link → domains fan-out. Lucide-style (24 grid, currentColor).
const FlowsIcon = ({ size = 18, strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="5" cy="12" r="2.4" />
    <circle cx="19" cy="5.5" r="2.4" />
    <circle cx="19" cy="18.5" r="2.4" />
    <path d="M7.3 11.1c3-1.4 5-2.6 9.2-4.2" />
    <path d="M7.3 12.9c3 1.4 5 2.6 9.2 4.2" />
  </svg>
);

const navItems = [
  { key: "home", label: "Dashboard", icon: Home },
  { key: "geos", label: "GEOS", icon: MapIcon },
  { key: "streams", label: "Goals", icon: Target },
  { key: "utm", label: "UTM Builder", icon: Link2 },
  { key: "tracking", label: "Tracking Links", icon: MousePointerClick },
  { key: "flows", label: "My Flows", icon: FlowsIcon },
  { key: "statistics", label: "Statistics", icon: BarChart3 },
  { key: "campaigns", label: "Campaigns", icon: Megaphone },
  { key: "placements", label: "Placement", icon: MousePointerClick },
  { key: "user_behavior", label: "User Behavior", icon: Users },
  { key: "devices", label: "Devices", icon: Smartphone },
  { key: "domains", label: "Domains", icon: Globe },
  { key: "pixels", label: "Pixels", icon: Zap },
  { key: "accounts", label: "Accounts", icon: UserPlus },
  { key: "roles", label: "Roles", icon: ShieldCheck },
  { key: "profile", label: "Profile", icon: User },
  { key: "meta_token", label: "Meta Token $", icon: CreditCard },
  { key: "api", label: "API", icon: Plug },
];

const navSections = [
  { title: "Overview", items: ["home", "geos", "streams"] },
  { title: "Performance", items: ["statistics", "campaigns", "placements", "user_behavior", "devices"] },
  { title: "Operations", items: ["flows", "tracking", "utm", "domains", "pixels", "accounts"] },
  { title: "Administration", items: ["roles"] },
  { title: "Account", items: ["profile"] },
  { title: "Integrations", items: ["meta_token", "api"] },
];

// Static option arrays + country/domain normalizers moved to ./lib/constants.js (Phase 1)

// Status → dot colour, for the flat status dropdowns (pixels/domains/accounts).
const STATUS_DOT_COLOR = {
  active: "#36d07c",
  pending: "#ffc94d",
  paused: "#ffb37a",
  expired: "#8a93a3",
  blocked: "#ff8a7a",
};
const STATUS_VALUES = ["Active", "Pending", "Paused", "Expired", "Blocked"];
const buildStatusOptions = (t) =>
  STATUS_VALUES.map((s) => ({ value: s, label: t(s), dot: STATUS_DOT_COLOR[s.toLowerCase()] || "#8a93a3" }));

// Renders a flag-icons SVG flag for a country label or ISO geo code.
// Returns null when the value doesn't resolve to a country (so it's safe to
// drop into generic Selects that also hold roles/models/etc.).
function CountryFlag({ value, size, className = "" }) {
  const iso = resolveCountryIso(value);
  if (!iso) return null;
  return (
    <span
      className={`fi fi-${iso} deus-flag${className ? ` ${className}` : ""}`}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    />
  );
}

function CountryDropdownPicker({
  value,
  onChange,
  options,
  placeholder,
  allOption = null,
  searchPlaceholder = "Type to find countries",
  emptyResultsLabel = "No countries found.",
  multiple = false,
  values = [],
  onToggle = null,
  maxVisibleChips = 2,
  // Combobox mode: when true, a non-matching search query can be committed
  // as a custom value (used by the UTM domain field for pasted URLs).
  allowCustom = false,
}) {
  const [query, setQuery] = React.useState("");
  const normalizedValue = String(value ?? "");
  const normalizedValues = React.useMemo(() => {
    if (!multiple) return [];
    const source = Array.isArray(values)
      ? values
      : values === null || values === undefined || values === ""
        ? []
        : [values];
    return Array.from(
      new Set(
        source
          .map((item) => String(item ?? "").trim())
          .filter(Boolean)
      )
    );
  }, [multiple, values]);
  const normalizedOptions = React.useMemo(
    () => {
      if (!Array.isArray(options)) return [];
      return options
        .map((item) => {
          if (item && typeof item === "object") {
            const optionValue = String(item.value ?? item.label ?? "");
            if (!optionValue) return null;
            const optionLabel = String(item.label ?? optionValue);
            const optionSearch = String(item.search ?? `${optionLabel} ${optionValue}`);
            return { value: optionValue, label: optionLabel, search: optionSearch, dot: item.dot || null };
          }
          const raw = String(item ?? "");
          if (!raw) return null;
          return { value: raw, label: raw, search: raw };
        })
        .filter(Boolean);
    },
    [options]
  );
  const optionList = React.useMemo(() => {
    const list = [...normalizedOptions];
    if (allOption && !multiple) {
      list.unshift({
        value: String(allOption.value ?? ""),
        label: String(allOption.label ?? allOption.value ?? ""),
        search: String(allOption.search ?? allOption.label ?? allOption.value ?? ""),
      });
    }
    return list;
  }, [normalizedOptions, allOption]);
  const selectedOption = optionList.find((item) => item.value === normalizedValue) || null;
  const selectedOptions = multiple
    ? optionList.filter((item) => normalizedValues.includes(item.value))
    : [];
  const displayLabel = selectedOption?.label || normalizedValue || placeholder;
  const hasSelection = multiple ? selectedOptions.length > 0 : Boolean(selectedOption || normalizedValue);
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const filteredOptions = optionList.filter((item) =>
    String(item.search ?? item.label).toLowerCase().includes(normalizedQuery)
  );

  const [dropUp, setDropUp] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const instanceId = React.useId();

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  const openMenu = React.useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 300 && rect.top > spaceBelow);
    }
    if (typeof window !== "undefined") {
      // Only one dropdown open at a time — notify the others to close.
      window.dispatchEvent(new CustomEvent("cs-open", { detail: instanceId }));
    }
    setOpen(true);
  }, [instanceId]);

  React.useEffect(() => {
    const onOtherOpen = (event) => {
      if (event.detail !== instanceId) setOpen(false);
    };
    window.addEventListener("cs-open", onOtherOpen);
    return () => window.removeEventListener("cs-open", onOtherOpen);
  }, [instanceId]);
  React.useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) closeMenu();
    };
    const onKey = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);
  React.useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`country-select-picker${dropUp ? " drop-up" : ""}${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className={`country-select-trigger${multiple ? " is-multi" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeMenu() : openMenu())}
      >
        {multiple ? (
          <span className="country-select-multi-values">
            {selectedOptions.length ? (
              <>
                {selectedOptions.slice(0, maxVisibleChips).map((item) => (
                  <span key={`country-chip-${item.value}`} className="country-select-chip">
                    <CountryFlag value={item.value} />
                    {item.label}
                  </span>
                ))}
                {selectedOptions.length > maxVisibleChips ? (
                  <span className="country-select-chip country-select-chip-muted">
                    +{selectedOptions.length - maxVisibleChips}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="country-select-value is-placeholder">{placeholder}</span>
            )}
          </span>
        ) : (
          <span className={`country-select-value${hasSelection ? "" : " is-placeholder"}`}>
            {hasSelection && selectedOption?.dot ? (
              <span className="cs-dot" style={{ background: selectedOption.dot }} />
            ) : hasSelection ? <CountryFlag value={normalizedValue} /> : null}
            {displayLabel || placeholder}
          </span>
        )}
        {multiple && selectedOptions.length ? (
          <span className="country-select-count">{selectedOptions.length}</span>
        ) : null}
        <span className="country-select-arrow" aria-hidden="true">
          ▾
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="country-select-menu"
            role="listbox"
            initial={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
        <div className="country-select-search-wrap">
          <input
            ref={searchRef}
            className="country-select-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
          />
          {query ? (
            <button
              type="button"
              className="country-select-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear country search"
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="country-select-options">
          {filteredOptions.length ? (
            filteredOptions.map((item) => {
              const selected = multiple
                ? normalizedValues.includes(item.value)
                : item.value === normalizedValue;
              return (
                <button
                  key={`country-select-${item.value || "all"}`}
                  type="button"
                  className={`country-select-option${selected ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={selected}
                  onClick={(event) => {
                    if (multiple) {
                      if (typeof onToggle === "function") {
                        onToggle(item.value);
                      } else if (typeof onChange === "function") {
                        onChange(item.value);
                      }
                    } else {
                      onChange(item.value);
                      closeMenu();
                    }
                  }}
                >
                  <span className="country-select-name">
                    {item.dot ? (
                      <span className="cs-dot" style={{ background: item.dot }} />
                    ) : (
                      <CountryFlag value={item.value} />
                    )}
                    {item.label}
                  </span>
                  <span className="country-select-check">{selected ? "✓" : ""}</span>
                </button>
              );
            })
          ) : allowCustom && query.trim() ? null : (
            <div className="country-select-empty-results">{emptyResultsLabel}</div>
          )}
          {allowCustom && query.trim() &&
          !optionList.some((o) => o.value.toLowerCase() === query.trim().toLowerCase()) ? (
            <button
              type="button"
              className="country-select-option country-select-custom"
              onClick={() => {
                onChange(query.trim());
                closeMenu();
              }}
            >
              <span className="country-select-name">Use “{query.trim()}”</span>
              <span className="country-select-check">↵</span>
            </button>
          ) : null}
        </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DeusDatePicker({ value, onChange, placeholder = "Pick a date" }) {
  const fmt = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  const parse = (s) => {
    if (!s) return null;
    const d = new Date(`${s}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const selected = parse(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = React.useState(() => {
    const base = selected || today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  React.useEffect(() => {
    if (selected) {
      setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const detailsRef = React.useRef(null);
  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  const displayValue = selected
    ? selected.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  // Build 6-week grid starting from Monday
  const firstDayOffset = (viewMonth.getDay() + 6) % 7;
  const gridStart = new Date(viewMonth);
  gridStart.setDate(gridStart.getDate() - firstDayOffset);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const selectDate = (d) => {
    onChange(fmt(d));
    close();
  };

  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <details ref={detailsRef} className="deus-date-picker">
      <summary className="deus-date-trigger">
        <CalendarIcon size={14} className="deus-date-trigger-icon" />
        <span className={`deus-date-trigger-value${selected ? "" : " is-placeholder"}`}>
          {displayValue || placeholder}
        </span>
        <span className="deus-date-trigger-arrow" aria-hidden="true">▾</span>
      </summary>
      <div className="deus-date-menu">
        <div className="deus-date-head">
          <span className="deus-date-month-label">
            {viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          <div className="deus-date-nav">
            <button type="button" className="deus-date-nav-btn" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={14} />
            </button>
            <button type="button" className="deus-date-nav-btn" onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="deus-date-weekdays">
          {weekdays.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="deus-date-grid">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === viewMonth.getMonth();
            const dStr = fmt(d);
            const isToday = dStr === fmt(today);
            const isSelected = selected && dStr === fmt(selected);
            const classes = ["deus-date-day"];
            if (!inMonth) classes.push("is-out");
            if (isToday) classes.push("is-today");
            if (isSelected) classes.push("is-selected");
            return (
              <button
                key={i}
                type="button"
                className={classes.join(" ")}
                onClick={() => selectDate(d)}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
        <div className="deus-date-foot">
          <button
            type="button"
            className="deus-date-link"
            onClick={() => {
              onChange("");
              close();
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="deus-date-link"
            onClick={() => selectDate(new Date())}
          >
            Today
          </button>
        </div>
      </div>
    </details>
  );
}

function Select({ value, onChange, options, placeholder = "Select…", searchPlaceholder = "Search…", emptyResultsLabel = "No results.", allOption = null, className }) {
  const normalized = Array.isArray(options) ? options : [];
  return (
    <div className={className || undefined}>
      <CountryDropdownPicker
        value={value ?? ""}
        onChange={onChange}
        options={normalized}
        placeholder={placeholder}
        allOption={allOption}
        searchPlaceholder={searchPlaceholder}
        emptyResultsLabel={emptyResultsLabel}
      />
    </div>
  );
}

const FlagEN = () => (
  <svg viewBox="0 0 36 36" aria-hidden="true">
    <rect width="36" height="36" fill="#012169" rx="6" />
    <path
      d="M0 0 36 36 M36 0 0 36"
      stroke="#FFF"
      strokeWidth="6"
      strokeLinecap="square"
    />
    <path
      d="M0 0 36 36 M36 0 0 36"
      stroke="#C8102E"
      strokeWidth="3"
      strokeLinecap="square"
    />
    <path d="M18 0v36M0 18h36" stroke="#FFF" strokeWidth="10" />
    <path d="M18 0v36M0 18h36" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const FlagTR = () => (
  <svg viewBox="0 0 36 36" aria-hidden="true">
    <rect width="36" height="36" fill="#E30A17" rx="6" />
    <circle cx="15" cy="18" r="8" fill="#FFF" />
    <circle cx="17.5" cy="18" r="6.5" fill="#E30A17" />
    <path
      d="M24.5 18l3.8 1.2-2.3 3.2 0.1-4-3.4-2.1 3.9-0.3-0.8-3.9 2.2 3.3 3.6-1.8-2.6 3 2.9 2.7z"
      fill="#FFF"
    />
  </svg>
);

const AndroidIcon = ({ size = 18, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    aria-hidden="true"
    className={className}
    style={style}
  >
    <rect x="12" y="24" width="40" height="26" rx="8" fill="currentColor" />
    <rect x="16" y="10" width="32" height="16" rx="8" fill="currentColor" />
    <rect x="4" y="24" width="8" height="24" rx="4" fill="currentColor" />
    <rect x="52" y="24" width="8" height="24" rx="4" fill="currentColor" />
    <rect x="20" y="50" width="8" height="10" rx="4" fill="currentColor" />
    <rect x="36" y="50" width="8" height="10" rx="4" fill="currentColor" />
    <circle cx="24" cy="20" r="2" fill="#0b0f0c" />
    <circle cx="40" cy="20" r="2" fill="#0b0f0c" />
    <path d="M20 6 L12 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M44 6 L52 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const AppleIcon = ({ size = 18, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    aria-hidden="true"
    className={className}
    style={style}
  >
    <path
      fill="currentColor"
      d="M44.2 34.4c0 8.1-5.6 15.6-11.4 15.6-2.6 0-3.8-1.4-6.8-1.4-3.1 0-4.5 1.4-6.9 1.4-5.3 0-11.4-6.5-11.4-14.8 0-5.8 3.6-10.9 9-10.9 2.8 0 5.1 1.5 6.8 1.5 1.7 0 4.4-1.7 7.2-1.7 1.3 0 5.4.2 8.3 4.1-.2.1-4.9 2.6-4.9 8.4 0 6.5 5.7 8.4 7.1 8.8z"
    />
    <path
      fill="currentColor"
      d="M38.8 11.8c-1.4 1.8-3.9 3.3-6.2 3.1-.3-2.3.8-4.6 2.2-6.3 1.5-1.7 4-3 6.3-3.1.2 2.3-.7 4.7-2.3 6.3z"
    />
  </svg>
);

const WindowsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" fill="currentColor" />
    <rect x="13" y="3" width="8" height="8" fill="currentColor" />
    <rect x="3" y="13" width="8" height="8" fill="currentColor" />
    <rect x="13" y="13" width="8" height="8" fill="currentColor" />
  </svg>
);

const LinuxIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <rect x="7" y="12" width="10" height="8" rx="4" fill="currentColor" />
    <circle cx="10" cy="7.5" r="0.8" fill="#0b0f0c" />
    <circle cx="14" cy="7.5" r="0.8" fill="#0b0f0c" />
  </svg>
);

const ChromeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

const DesktopIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" />
    <rect x="9" y="18" width="6" height="2" fill="currentColor" />
  </svg>
);

const MobileIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="7" y="3" width="10" height="18" rx="2" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="#0b0f0c" />
  </svg>
);

const TabletIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="3" width="14" height="18" rx="2" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="#0b0f0c" />
  </svg>
);

const UnknownIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="currentColor" />
    <path
      d="M12 7c-1.6 0-2.6.9-2.6 2.2h1.8c.1-.5.4-.8.9-.8.6 0 1 .4 1 1 0 .7-.6 1-1.3 1.4-.8.4-1.3.9-1.3 2v.4h1.8v-.3c0-.6.4-.8 1-.9.8-.2 1.8-.7 1.8-2.4 0-1.7-1.3-2.6-3.1-2.6zm-.9 8.5c0 .6.5 1.1 1.1 1.1s1.1-.5 1.1-1.1-.5-1.1-1.1-1.1-1.1.5-1.1 1.1z"
      fill="#0b0f0c"
    />
  </svg>
);

const getOsIconComponent = (value) => {
  const label = String(value || "").toLowerCase();
  if (label.includes("android")) return AndroidIcon;
  if (label.includes("ios") || label.includes("iphone") || label.includes("ipad") || label.includes("mac")) return AppleIcon;
  if (label.includes("windows")) return WindowsIcon;
  if (label.includes("linux")) return LinuxIcon;
  if (label.includes("chrome")) return ChromeIcon;
  if (label.includes("tablet")) return TabletIcon;
  if (label.includes("mobile") || label.includes("phone")) return MobileIcon;
  if (label.includes("desktop")) return DesktopIcon;
  return UnknownIcon;
};

const getOsAccent = (value) => {
  const label = String(value || "").toLowerCase();
  if (label.includes("android")) return "#A4C639";
  if (label.includes("ios") || label.includes("iphone") || label.includes("ipad") || label.includes("mac"))
    return "#E3E3E3";
  if (label.includes("windows")) return "#00A4EF";
  if (label.includes("linux")) return "#F5C451";
  if (label.includes("chrome")) return "#E84D2D";
  if (label.includes("tablet")) return "#8AA4FF";
  if (label.includes("mobile") || label.includes("phone")) return "#7ED957";
  if (label.includes("desktop")) return "#9AA0A6";
  return "#B0B3B8";
};

const languageOptions = [
  { code: "EN", label: "English", Flag: FlagEN },
  { code: "TR", label: "Türkçe", Flag: FlagTR },
];

// Styled language switcher (replaces the native <select>, whose dropdown was
// unstyleable OS chrome). Opens upward — it sits in the sidebar footer.
function LanguageSwitcher({ language, setLanguage }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const current = languageOptions.find((i) => i.code === language) || languageOptions[0];
  const CurFlag = current.Flag;
  return (
    <div className={`lang-switch${open ? " is-open" : ""}`} ref={ref}>
      <button type="button" className="lang-trigger" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}>
        <span className="lang-flag">{CurFlag ? <CurFlag /> : current.code}</span>
        <span className="lang-cur"><strong>{current.code}</strong><span className="lang-cur-label">{current.label}</span></span>
        <ChevronDown size={15} className="lang-caret" />
      </button>
      {open ? (
        <div className="lang-menu" role="listbox">
          {languageOptions.map((lang) => {
            const LFlag = lang.Flag;
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={active}
                className={`lang-option${active ? " is-active" : ""}`}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
              >
                <span className="lang-flag">{LFlag ? <LFlag /> : lang.code}</span>
                <span className="lang-option-text"><strong>{lang.code}</strong> · {lang.label}</span>
                {active ? <Check size={15} className="lang-check" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// App-wide styled confirm dialog — replaces native window.confirm() so system
// prompts carry the app's design. appConfirm({...}) returns a Promise<boolean>.
let _confirmSet = null;
let _confirmResolve = null;
function appConfirm(opts = {}) {
  return new Promise((resolve) => {
    if (typeof _confirmSet !== "function") {
      resolve(window.confirm(opts.message || opts.title || "")); // fallback if host unmounted
      return;
    }
    _confirmResolve = resolve;
    _confirmSet({
      open: true,
      tone: "danger",
      title: "Are you sure?",
      message: "",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      ...opts,
    });
  });
}
function ConfirmHost() {
  const [state, setState] = React.useState({ open: false });
  React.useEffect(() => {
    _confirmSet = setState;
    return () => { _confirmSet = null; };
  }, []);
  const finish = (result) => {
    setState((s) => ({ ...s, open: false }));
    const r = _confirmResolve;
    _confirmResolve = null;
    if (r) r(result);
  };
  React.useEffect(() => {
    if (!state.open) return;
    const onKey = (e) => {
      if (e.key === "Escape") finish(false);
      else if (e.key === "Enter") finish(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open]);
  return (
    <AnimatePresence>
      {state.open ? (
        <motion.div
          className="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={() => finish(false)}
        >
          <motion.div
            className={`confirm-dialog tone-${state.tone || "danger"}`}
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon"><AlertTriangle size={20} /></div>
            <div className="confirm-body">
              <h3 className="confirm-title">{state.title}</h3>
              {state.message ? <p className="confirm-message">{state.message}</p> : null}
            </div>
            <div className="confirm-actions">
              <button type="button" className="ghost" onClick={() => finish(false)}>{state.cancelLabel}</button>
              <button type="button" className="confirm-confirm" onClick={() => finish(true)} autoFocus>{state.confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


const defaultKeitaroOverallPayloadObject = {
  dimensions: ["day", "campaign", "country", "city", "sub_id_1", "source", "sub_id_3", "sub_id_4", "sub_id_5"],
  measures: [
    "clicks",
    "regs",
    "custom_conversion_8",
    "custom_conversion_7",
    "custom_conversion_8_revenue",
    "custom_conversion_7_revenue",
    "cost",
  ],
  range: { interval: "first_day_of_this_month", timezone: "Asia/Dubai" },
  filters: [
    {
      name: "campaign",
      operator: "MATCH_REGEXP",
      expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
    },
  ],
  limit: 1000,
  offset: 0,
  sort: [],
  summary: true,
  extended: true,
};

const defaultKeitaroDevicePayloadObject = {
  dimensions: ["day", "campaign", "country", "device_type", "os", "os_version"],
  measures: [
    "clicks",
    "regs",
    "custom_conversion_8",
    "custom_conversion_7",
    "custom_conversion_8_revenue",
    "custom_conversion_7_revenue",
    "cost",
  ],
  range: { interval: "last_7_days", timezone: "Asia/Dubai" },
  filters: [
    {
      name: "campaign",
      operator: "MATCH_REGEXP",
      expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
    },
  ],
  limit: 1000,
  offset: 0,
  sort: [],
  summary: true,
  extended: true,
};

const stringifyKeitaroPayload = (value) => JSON.stringify(value, null, 2);

const defaultKeitaroPayloadByTarget = {
  overall: stringifyKeitaroPayload(defaultKeitaroOverallPayloadObject),
  device: stringifyKeitaroPayload(defaultKeitaroDevicePayloadObject),
  user_behavior: stringifyKeitaroPayload({
    dimensions: ["day", "campaign", "country", "region", "city", "sub_id_1", "external_id"],
    measures: [
      "clicks",
      "regs",
      "custom_conversion_8",
      "custom_conversion_7",
      "custom_conversion_8_revenue",
      "custom_conversion_7_revenue",
      "cost",
    ],
    range: { interval: "last_7_days", timezone: "Asia/Dubai" },
    filters: [
      {
        name: "campaign",
        operator: "MATCH_REGEXP",
        expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
      },
    ],
    limit: 1000,
    offset: 0,
    sort: [],
    summary: true,
    extended: true,
  }),
};

const defaultKeitaroPayload = defaultKeitaroPayloadByTarget.overall;

  const defaultKeitaroMapping = {
    dateField: "day",
    buyerField: "campaign",
    campaignField: "campaign",
    countryField: "country",
    cityField: "city",
    regionField: "region",
    placementField: "sub_id_1",
    domainField: "source",
    campaignNameField: "sub_id_3",
    adsetNameField: "sub_id_4",
    adNameField: "sub_id_5",
    externalIdField: "external_id",
    spendField: "cost",
    revenueField: "revenue",
    ftdRevenueField: "custom_conversion_8_revenue",
    redepositRevenueField: "custom_conversion_7_revenue",
  clicksField: "clicks",
  installsField: "installs",
  registersField: "regs",
  ftdsField: "custom_conversion_8",
  redepositsField: "custom_conversion_7",
  deviceField: "device_type",
  osField: "os",
  osVersionField: "os_version",
  osIconField: "os_icon",
  deviceModelField: "device_model",
};

// Format utilities moved to ./lib/format.js (Phase 1 extraction — see import at top of file)
// Date utilities moved to ./lib/date.js (Phase 1 extraction)
// Permissions, filters, and sort helpers moved to ./lib/{permissions,filters,sort}.js (Phase 1)
const formatShortDate = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length < 3) return value;
  const monthIndex = Number(parts[1]) - 1;
  const month = shortMonths[monthIndex] ?? parts[1];
  return `${parts[2]} ${month}`;
};

const homeChartSeries = [
  { key: "c2i", label: "Click2Install", color: "var(--blue)", width: 2.2 },
  { key: "c2r", label: "Click2Register", color: "var(--purple)", width: 2 },
  { key: "i2r", label: "Install2Reg", color: "var(--green)", width: 2 },
  { key: "r2d", label: "Reg2Dep", color: "var(--orange)", width: 2 },
];

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const geoReference = {
  Argentina: { iso: "ARG", coordinates: [-63.6167, -38.4161] },
  Australia: { iso: "AUS", coordinates: [133.7751, -25.2744] },
  Azerbaijan: { iso: "AZE", coordinates: [47.5769, 40.1431] },
  Albania: { iso: "ALB", coordinates: [20.1683, 41.1533] },
  Algeria: { iso: "DZA", coordinates: [1.6596, 28.0339] },
  Bolivia: { iso: "BOL", coordinates: [-63.5887, -16.2902] },
  Brazil: { iso: "BRA", coordinates: [-51.9253, -14.235] },
  Canada: { iso: "CAN", coordinates: [-106.3468, 56.1304] },
  Chile: { iso: "CHL", coordinates: [-71.543, -35.6751] },
  Colombia: { iso: "COL", coordinates: [-74.2973, 4.5709] },
  "Costa Rica": { iso: "CRI", coordinates: [-83.7534, 9.7489] },
  Ecuador: { iso: "ECU", coordinates: [-78.1834, -1.8312] },
  Egypt: { iso: "EGY", coordinates: [30.8025, 26.8206] },
  Estonia: { iso: "EST", coordinates: [25.0136, 58.5953] },
  France: { iso: "FRA", coordinates: [2.2137, 46.2276] },
  Germany: { iso: "DEU", coordinates: [10.4515, 51.1657] },
  India: { iso: "IND", coordinates: [78.9629, 20.5937] },
  Iran: { iso: "IRN", coordinates: [53.688, 32.4279] },
  Iraq: { iso: "IRQ", coordinates: [43.6793, 33.2232] },
  Japan: { iso: "JPN", coordinates: [138.2529, 36.2048] },
  Morocco: { iso: "MAR", coordinates: [-7.0926, 31.7917] },
  "New Zealand": { iso: "NZL", coordinates: [174.8859, -40.9006] },
  Nigeria: { iso: "NGA", coordinates: [8.6753, 9.082] },
  Norway: { iso: "NOR", coordinates: [8.4689, 60.472] },
  Paraguay: { iso: "PRY", coordinates: [-58.4438, -23.4425] },
  Peru: { iso: "PER", coordinates: [-75.0152, -9.19] },
  Poland: { iso: "POL", coordinates: [19.1451, 51.9194] },
  Romania: { iso: "ROU", coordinates: [24.9668, 45.9432] },
  Russia: { iso: "RUS", coordinates: [105.3188, 61.524] },
  "South Korea": { iso: "KOR", coordinates: [127.7669, 35.9078] },
  Sweden: { iso: "SWE", coordinates: [18.6435, 60.1282] },
  Switzerland: { iso: "CHE", coordinates: [8.2275, 46.8182] },
  Tunisia: { iso: "TUN", coordinates: [9.5375, 33.8869] },
  Ukraine: { iso: "UKR", coordinates: [31.1656, 48.3794] },
  "United States": { iso: "USA", coordinates: [-98.5795, 39.8283] },
  Venezuela: { iso: "VEN", coordinates: [-66.5897, 6.4238] },
  Vietnam: { iso: "VNM", coordinates: [108.2772, 14.0583] },
  China: { iso: "CHN", coordinates: [104.1954, 35.8617] },
  Turkey: { iso: "TUR", coordinates: [35.2433, 38.9637] },
  Guyana: { iso: "GUY", coordinates: [-58.9302, 4.8604] },
  Netherlands: { iso: "NLD", coordinates: [5.2913, 52.1326] },
  "United Arab Emirates": { iso: "ARE", coordinates: [53.8478, 23.4241] },
};
const geoPalette = [
  "var(--green)",
  "var(--blue)",
  "var(--purple)",
  "var(--yellow)",
  "var(--pink)",
  "var(--orange)",
];

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{label}</p>
      {payload.map((item) => (
        <div className="tooltip-row" key={item.dataKey}>
          <span
            className="tooltip-dot"
            style={{ background: item.color || item.fill || item.stroke }}
          />
          <span>{item.name}</span>
          <span className="tooltip-value">{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function RateTooltip({ active, payload }) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="chart-tooltip rate-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{item.name}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: item.color }} />
        <span>{t("Rate")}</span>
        <span className="tooltip-value">{item.value}%</span>
      </div>
    </div>
  );
}

function ShareTooltip({ active, payload }) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="chart-tooltip rate-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{item.name}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: item.color }} />
        <span>{t("Share")}</span>
        <span className="tooltip-value">{item.value}%</span>
      </div>
    </div>
  );
}

function PeriodSelect({ value, onChange, customRange, onCustomChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [showCustom, setShowCustom] = React.useState(false);
  const containerRef = React.useRef(null);
  const normalizedCustomRange = React.useMemo(
    () => normalizeDateRange(customRange?.from, customRange?.to),
    [customRange?.from, customRange?.to]
  );
  const canApplyCustomRange = Boolean(normalizedCustomRange.from && normalizedCustomRange.to);

  React.useEffect(() => {
    if (!open) return;
    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleSelect = (option) => {
    onChange(option);
    setShowCustom(false);
    setOpen(false);
  };

  const handleCustomToggle = () => {
    setOpen(true);
    setShowCustom(true);
  };

  const handleApplyCustom = () => {
    if (!canApplyCustomRange) return;
    if (customRange?.from !== normalizedCustomRange.from) {
      onCustomChange("from", normalizedCustomRange.from);
    }
    if (customRange?.to !== normalizedCustomRange.to) {
      onCustomChange("to", normalizedCustomRange.to);
    }
    onChange("Custom range");
    setOpen(false);
  };

  return (
    <div className="period-select" ref={containerRef}>
      <button
        className="select"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {t(value)}
        <span className="chev">▾</span>
      </button>
      {open && (
        <div className="period-menu">
          {periodOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`period-option${value === option ? " is-active" : ""}`}
              onClick={() => handleSelect(option)}
            >
              {t(option)}
            </button>
          ))}
          <button
            type="button"
            className={`period-option${value === "Custom range" ? " is-active" : ""}`}
            onClick={handleCustomToggle}
          >
            {t("Custom range")}
          </button>
          {showCustom && (
            <div className="period-custom">
              <div className="field-row">
                <DeusDatePicker
                  value={customRange.from}
                  onChange={(v) => onCustomChange("from", v)}
                />
                <span className="field-sep">{t("to")}</span>
                <DeusDatePicker
                  value={customRange.to}
                  onChange={(v) => onCustomChange("to", v)}
                />
              </div>
              <div className="period-actions">
                <button className="ghost" type="button" onClick={() => setShowCustom(false)}>
                  {t("Cancel")}
                </button>
                <button
                  className="action-pill"
                  type="button"
                  onClick={handleApplyCustom}
                  disabled={!canApplyCustomRange}
                >
                  {t("Apply")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label, visibleKeys }) {
  if (!active || !payload?.length) return null;
  const filtered = visibleKeys
    ? payload.filter((item) => visibleKeys.includes(item.dataKey))
    : payload;
  const formatValue = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return numeric.toFixed(2);
  };
  const formatCount = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return Math.round(numeric).toLocaleString();
  };
  const getRateContext = (item) => {
    const row = item?.payload || {};
    switch (item?.dataKey) {
      case "c2i":
        return { num: row.installs, den: row.clicks };
      case "c2r":
        return { num: row.registers, den: row.clicks };
      case "i2r":
        return { num: row.registers, den: row.installs };
      case "r2d":
        return { num: row.ftds, den: row.registers };
      default:
        return null;
    }
  };

  return (
    <div className="chart-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{label}</p>
      {filtered.map((item) => {
        const context = getRateContext(item);
        return (
          <div className="tooltip-row" key={item.dataKey}>
            <span className="tooltip-dot" style={{ background: item.stroke }} />
            <span>{item.name}</span>
            <span className="tooltip-value">
              {formatValue(item.value)}
              %
              {context ? ` (${formatCount(context.num)} / ${formatCount(context.den)})` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HomeDashboard({
  period,
  setPeriod,
  customRange,
  onCustomChange,
  filters,
  onSeeGeos,
  authUser,
  viewerBuyer,
}) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const [hoverSeries, setHoverSeries] = React.useState(null);
  const [selectedSeries, setSelectedSeries] = React.useState([]);
  const [hoverGeo, setHoverGeo] = React.useState(null);
  const [selectedGeo, setSelectedGeo] = React.useState(null);
  const [activeRateIndex, setActiveRateIndex] = React.useState(null);
  const [geoMetric, setGeoMetric] = React.useState("combined");
  const [homeRows, setHomeRows] = React.useState([]);
  const [homeState, setHomeState] = React.useState({ loading: true, error: null });
  const [overviewFilters, setOverviewFilters] = React.useState(["ftds"]);

  // Compute the active fetch range inline (periodRange itself is declared
  // further down, so we can't reference it here without a TDZ error). The
  // Filters modal also supplies dateFrom/dateTo; we honour the *union* of
  // both ranges so client-side filters never reference rows that weren't
  // downloaded — that's what was breaking "filter May shows nothing".
  const loadHomeStats = React.useCallback(async () => {
    const periodRangeInline = getPeriodDateRange(period, customRange);
    const fFrom = filters?.dateFrom || null;
    const fTo = filters?.dateTo || null;
    const fetchFrom =
      [periodRangeInline.from, fFrom].filter(Boolean).sort()[0] || null;
    const fetchTo =
      [periodRangeInline.to, fTo].filter(Boolean).sort().slice(-1)[0] || null;
    const isoRe = /^\d{4}-\d{2}-\d{2}$/;
    const qs = new URLSearchParams();
    if (isoRe.test(fetchFrom || "")) qs.set("from", fetchFrom);
    if (isoRe.test(fetchTo || "")) qs.set("to", fetchTo);
    const liveUrl = `/api/keitaro/live-stats${qs.toString() ? `?${qs}` : ""}`;
    const cacheKey = `live-home:${fetchFrom || "_"}:${fetchTo || "_"}`;
    const cached = readSwrCache(cacheKey);
    if (cached && Array.isArray(cached)) {
      setHomeRows(cached);
      setHomeState({ loading: false, error: null });
    } else {
      setHomeState({ loading: true, error: null });
    }
    try {
      let rows = null;
      // Primary path: live, aggregated data straight from Keitaro.
      const response = await apiFetch(liveUrl);
      if (response.ok) {
        const data = await response.json();
        rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        // Fallback to the synced table when the live endpoint is unavailable.
        const sq = new URLSearchParams({ limit: "100000", strict: "1" });
        if (fetchFrom) sq.set("from", fetchFrom);
        if (fetchTo) sq.set("to", fetchTo);
        const fb = await apiFetch(`/api/media-stats?${sq.toString()}`);
        if (!fb.ok) throw new Error("Failed to load media buyer stats.");
        const fbData = await fb.json();
        rows = Array.isArray(fbData) ? fbData : [];
      }
      writeSwrCache(cacheKey, rows);
      setHomeRows(rows);
      setHomeState({ loading: false, error: null });
    } catch (error) {
      if (!cached) {
        setHomeState({ loading: false, error: error.message || "Failed to load stats." });
      }
    }
  }, [period, customRange.from, customRange.to, filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    loadHomeStats();
  }, [loadHomeStats]);

  React.useEffect(() => {
    const handleSync = () => {
      loadHomeStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [loadHomeStats]);

  const buyerFilter = filters?.buyer || "All";
  const countryFilter = filters?.country || "All";

  const sum = (value) => Number(value || 0);
  const readNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };
  const readFtdRevenue = (row) =>
    readNumeric(row?.ftdRevenue ?? row?.ftd_revenue ?? 0);
  const readRedepositRevenue = (row) =>
    readNumeric(row?.redepositRevenue ?? row?.redeposit_revenue ?? 0);
  const readTotalRevenue = (row) => {
    const direct = row?.revenue;
    const ftdValue = readFtdRevenue(row);
    const redepositValue = readRedepositRevenue(row);
    if (direct !== undefined && direct !== null && direct !== "") {
      const numeric = Number(direct);
      if (Number.isFinite(numeric)) {
        if (numeric === 0 && (ftdValue > 0 || redepositValue > 0)) {
          return ftdValue + redepositValue;
        }
        return numeric;
      }
    }
    return ftdValue + redepositValue;
  };
  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCount = (value) => {
    if (value === null || value === undefined) return "—";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return Number.isInteger(numeric) ? numeric.toLocaleString() : numeric.toFixed(2);
  };
  const normalizeBuyerKey = (value) =>
    String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();
  const isAllSelection = (value) => !value || normalizeFilterValue(value) === "all";
  const matchesBuyer = (buyer) => {
    const normalizedBuyer = normalizeBuyerKey(buyer);
    if (!normalizedBuyer) return false;
    if (isAllSelection(buyerFilter)) {
      if (isLeadership) return true;
      if (viewerBuyer) {
        const normalizedViewer = normalizeBuyerKey(viewerBuyer);
        return normalizedBuyer.includes(normalizedViewer);
      }
      return true;
    }
    const normalizedFilter = normalizeBuyerKey(buyerFilter);
    if (!normalizedFilter) return false;
    return normalizedBuyer.includes(normalizedFilter) || normalizedFilter.includes(normalizedBuyer);
  };
  const matchesCountry = (country) => {
    if (isAllSelection(countryFilter)) return true;
    return normalizeFilterValue(country) === normalizeFilterValue(countryFilter);
  };

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const filterRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveRange = filterRange.from || filterRange.to ? filterRange : periodRange;

  const filteredRows = React.useMemo(() => {
    return homeRows.filter((row) => {
      if (!matchesBuyer(row.buyer)) return false;
      if (!matchesCountry(row.country)) return false;
      if (!isDateInRange(row.date, effectiveRange)) return false;
      return true;
    });
  }, [
    homeRows,
    buyerFilter,
    countryFilter,
    effectiveRange.from,
    effectiveRange.to,
    isLeadership,
    viewerBuyer,
  ]);

  const totals = React.useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => ({
          spend: acc.spend + sum(row.spend),
          clicks: acc.clicks + sum(row.clicks),
          uniqueClicks: acc.uniqueClicks + sum(row.unique_clicks),
          installs: acc.installs + sum(row.installs),
          registers: acc.registers + sum(row.registers),
          ftds: acc.ftds + sum(row.ftds),
          redeposits: acc.redeposits + sum(row.redeposits),
        }),
        { spend: 0, clicks: 0, uniqueClicks: 0, installs: 0, registers: 0, ftds: 0, redeposits: 0 }
      ),
    [filteredRows]
  );

  const c2i = toPercent(totals.installs, totals.clicks);
  const c2r = toPercent(totals.registers, totals.clicks);
  const i2r = toPercent(totals.registers, totals.installs);
  const r2d = toPercent(totals.ftds, totals.registers);
  const cpc = safeDivide(totals.spend, totals.clicks);
  const costPerRegister = safeDivide(totals.spend, totals.registers);
  const costPerFtd = safeDivide(totals.spend, totals.ftds);
  const totalRevenue = React.useMemo(
    () => filteredRows.reduce((acc, row) => acc + readFtdRevenue(row) + readRedepositRevenue(row), 0),
    [filteredRows]
  );
  const roi = totals.spend > 0 ? ((totalRevenue - totals.spend) / totals.spend) * 100 : null;
  const periodLabel =
    effectiveRange.from && effectiveRange.to
      ? `${effectiveRange.from} → ${effectiveRange.to}`
      : period === "Custom range" && periodRange.from && periodRange.to
        ? `${periodRange.from} → ${periodRange.to}`
        : t(period);

  const homePrimaryStats = [
    {
      label: "Clicks",
      value: fmtCount(totals.clicks),
      icon: MousePointerClick,
      meta: periodLabel,
      sub: totals.uniqueClicks > 0 ? { value: fmtCount(totals.uniqueClicks), label: "Unique clicks" } : null,
    },
    { label: "CPC", value: cpc === null ? "—" : formatCurrency(cpc), icon: Wallet, meta: "Cost per click" },
    { label: "Register", value: fmtCount(totals.registers), icon: UserPlus, meta: periodLabel },
    {
      label: "Cost per Register",
      value: costPerRegister === null ? "—" : formatCurrency(costPerRegister),
      icon: Wallet,
      meta: "Cost per register",
    },
  ];

  const homeSecondaryStats = [
    { label: "FTD", value: fmtCount(totals.ftds), icon: CreditCard, meta: periodLabel },
    {
      label: "Cost per FTD",
      value: costPerFtd === null ? "—" : formatCurrency(costPerFtd),
      icon: Wallet,
      meta: "Cost per FTD",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: Wallet,
      meta: "FTD + Redeposit",
    },
    {
      label: "ROI",
      value: fmtPercent(roi),
      icon: BarChart3,
      meta: "Revenue vs Spend",
    },
  ];

  const isSingleDayRange = Boolean(
    effectiveRange.from && effectiveRange.to && String(effectiveRange.from) === String(effectiveRange.to)
  );

  const getDateBucket = React.useCallback(
    (row) => {
      const dateValue = String(row?.date || "");
      const createdAtValue = String(row?.created_at || row?.createdAt || "");
      if (!isSingleDayRange) {
        const base = dateValue.split(" ")[0];
        return { key: base, label: formatShortDate(base), sortKey: base };
      }
      const parseTimestamp = (value) => {
        if (!value) return null;
        const normalized = value.includes("T") ? value : value.replace(" ", "T");
        const parsed = new Date(normalized);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      };
      const stamp = parseTimestamp(dateValue) || parseTimestamp(createdAtValue);
      if (!stamp) return { key: "00:00", label: "00:00", sortKey: "00:00" };
      const hour = String(stamp.getHours()).padStart(2, "0");
      return { key: `${hour}:00`, label: `${hour}:00`, sortKey: `${hour}:00` };
    },
    [isSingleDayRange]
  );

  const overviewData = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const bucket = getDateBucket(row);
      if (!bucket?.key) return;
      if (!map.has(bucket.key)) {
        map.set(bucket.key, {
          bucket: bucket.key,
          label: bucket.label,
          sortKey: bucket.sortKey,
          clicks: 0,
          installs: 0,
          registrations: 0,
          ftds: 0,
          redeposits: 0,
          spend: 0,
          revenue: 0,
          roi: null,
        });
      }
      const current = map.get(bucket.key);
      current.clicks += sum(row.clicks);
      current.registrations += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.spend += sum(row.spend);
      current.revenue += readTotalRevenue(row);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey)))
      .map((item) => ({
        ...item,
        roi: item.spend > 0 ? ((item.revenue - item.spend) / item.spend) * 100 : null,
      }));
  }, [filteredRows, getDateBucket]);

  const overviewMetricOptions = React.useMemo(
    () => [
      { key: "clicks", label: "Clicks", color: "var(--blue)", type: "count" },
      { key: "registrations", label: "Registration", color: "var(--purple)", type: "count" },
      { key: "ftds", label: "FTDs", color: "var(--green)", type: "count" },
      { key: "redeposits", label: "Redeposits", color: "var(--teal)", type: "count" },
      { key: "roi", label: "ROI", color: "var(--orange)", type: "percent" },
      { key: "revenue", label: "Revenue", color: "#f7d06b", type: "currency" },
    ],
    []
  );

  const activeOverviewMetrics = overviewMetricOptions.filter((metric) =>
    overviewFilters.includes(metric.key)
  );
  const formatOverviewMetricValue = (value, type) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    if (type === "currency") return formatCurrency(value);
    if (type === "percent") return fmtPercent(value);
    return fmtCount(value);
  };
  const toggleOverviewMetric = (key) => {
    setOverviewFilters((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const overviewPeak = React.useMemo(
    () => overviewData.reduce((max, item) => Math.max(max, item.ftds || 0), 0),
    [overviewData]
  );
  const overviewAvg =
    overviewData.length > 0
      ? overviewData.reduce((acc, item) => acc + (item.ftds || 0), 0) / overviewData.length
      : 0;

  const chartData = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = row.date;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          date: key,
          clicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
        });
      }
      const current = map.get(key);
      current.clicks += sum(row.clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
    });
    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({
        day: formatShortDate(row.date),
        clicks: row.clicks,
        installs: row.installs,
        registers: row.registers,
        ftds: row.ftds,
        c2i: toPercent(row.installs, row.clicks),
        c2r: toPercent(row.registers, row.clicks),
        i2r: toPercent(row.registers, row.installs),
        r2d: toPercent(row.ftds, row.registers),
      }));
  }, [filteredRows]);

  const revenueSeries = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = row.date;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          date: key,
          revenue: 0,
          ftdRevenue: 0,
          redepositRevenue: 0,
          ftds: 0,
          redeposits: 0,
        });
      }
      const current = map.get(key);
      current.revenue += readTotalRevenue(row);
      current.ftdRevenue += readFtdRevenue(row);
      current.redepositRevenue += readRedepositRevenue(row);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  const revenueTotals = React.useMemo(
    () => revenueSeries.reduce(
      (acc, item) => ({
        revenue: acc.revenue + item.revenue,
        ftdRevenue: acc.ftdRevenue + item.ftdRevenue,
        redepositRevenue: acc.redepositRevenue + item.redepositRevenue,
        ftds: acc.ftds + item.ftds,
        redeposits: acc.redeposits + item.redeposits,
      }),
      { revenue: 0, ftdRevenue: 0, redepositRevenue: 0, ftds: 0, redeposits: 0 }
    ),
    [revenueSeries]
  );

  const avg = (values) =>
    values.length ? values.reduce((sumValue, value) => sumValue + value, 0) / values.length : null;
  const dailyFtdRevenue = revenueSeries
    .filter((item) => item.ftdRevenue > 0)
    .map((item) => item.ftdRevenue);
  const dailyRedepositRevenue = revenueSeries
    .filter((item) => item.redepositRevenue > 0)
    .map((item) => item.redepositRevenue);
  const dailyCrFtdToRedeposit = revenueSeries
    .filter((item) => item.ftds > 0)
    .map((item) => (item.redeposits / item.ftds) * 100);

  const benchmark = {
    ftdRevenue: avg(dailyFtdRevenue),
    redepositRevenue: avg(dailyRedepositRevenue),
    ftdToRedepositCr: avg(dailyCrFtdToRedeposit),
  };

  const classifyMetric = (value, baseline) => {
    if (value === null || baseline === null || !Number.isFinite(baseline)) {
      return { tone: "neutral", label: t("No benchmark") };
    }
    const ratio = value / baseline;
    if (ratio >= 1.1) return { tone: "good", label: t("Above avg") };
    if (ratio <= 0.9) return { tone: "bad", label: t("Below avg") };
    return { tone: "neutral", label: t("On target") };
  };

  const ftdRevenueTotal = revenueTotals.ftdRevenue;
  const redepositRevenueTotal = revenueTotals.redepositRevenue;
  const ftdToRedepositCr =
    revenueTotals.ftds > 0 ? (revenueTotals.redeposits / revenueTotals.ftds) * 100 : null;

  const ftdRevenueStatus = classifyMetric(ftdRevenueTotal, benchmark.ftdRevenue);
  const redepositRevenueStatus = classifyMetric(
    redepositRevenueTotal,
    benchmark.redepositRevenue
  );
  const ftdToRedepositStatus = classifyMetric(ftdToRedepositCr, benchmark.ftdToRedepositCr);

  const funnelData = React.useMemo(
    () => [
      { name: "Clicks", value: totals.clicks, color: "var(--blue)" },
      { name: "Install", value: totals.installs, color: "var(--purple)" },
      { name: "Register", value: totals.registers, color: "var(--green)" },
      { name: "FTD", value: totals.ftds, color: "var(--orange)" },
    ],
    [totals]
  );
  const funnelMax = Math.max(0, ...funnelData.map((entry) => entry.value || 0));
  const funnelDomainMax = funnelMax > 0 ? Math.ceil(funnelMax / 50) * 50 : 10;

  const conversionData = React.useMemo(
    () => [
      { name: "Click2Install", value: c2i ? Math.round(c2i) : 0, color: "var(--blue)" },
      { name: "Click2Register", value: c2r ? Math.round(c2r) : 0, color: "var(--purple)" },
      { name: "Install2Reg", value: i2r ? Math.round(i2r) : 0, color: "var(--green)" },
      { name: "Reg2Dep", value: r2d ? Math.round(r2d) : 0, color: "var(--orange)" },
    ],
    [c2i, c2r, i2r, r2d]
  );

  const avgRate = conversionData.length
    ? Math.round(conversionData.reduce((sumValue, item) => sumValue + item.value, 0) / conversionData.length)
    : 0;
  const donutValue =
    activeRateIndex !== null ? `${conversionData[activeRateIndex].value}%` : `${avgRate}%`;
  const donutLabel =
    activeRateIndex !== null ? t(conversionData[activeRateIndex].name) : t("Avg rate");

  const geoMetrics = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!country) return;
      if (!map.has(country)) {
        map.set(country, { clicks: 0, registers: 0, ftds: 0 });
      }
      const current = map.get(country);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
    });
    return Array.from(map.entries()).map(([country, stats], index) => {
      const ftdRate = toPercent(stats.ftds, stats.clicks) ?? 0;
      const reg2depRate = toPercent(stats.ftds, stats.registers) ?? 0;
      const ref = geoReference[country] || {};
      return {
        name: country,
        iso: ref.iso || country,
        coordinates: ref.coordinates || null,
        color: geoPalette[index % geoPalette.length],
        ftdRate: Math.round(ftdRate),
        reg2depRate: Math.round(reg2depRate),
      };
    });
  }, [filteredRows]);

  const geoMetricKey = geoMetric === "combined" ? "combined" : geoMetric;
  const geoMetricsWithCombined = React.useMemo(
    () =>
      geoMetrics.map((marker) => ({
        ...marker,
        combined: Math.round((marker.ftdRate + marker.reg2depRate) / 2),
      })),
    [geoMetrics]
  );
  const geoSorted = React.useMemo(
    () => [...geoMetricsWithCombined].sort((a, b) => b[geoMetricKey] - a[geoMetricKey]),
    [geoMetricsWithCombined, geoMetricKey]
  );
  const topGeoList = geoSorted.slice(0, 3);
  const metricValues = geoSorted.map((item) => item[geoMetricKey]);
  const metricMax = metricValues.length ? Math.max(...metricValues) : 0;
  const activeGeo = selectedGeo ?? hoverGeo;
  const activeGeoData = geoMetricsWithCombined.find((marker) => marker.iso === activeGeo) || null;
  const topGeo = geoSorted[0] || null;
  const focusGeo = activeGeoData || topGeo;
  const mapGeo = focusGeo || topGeo;
  const mapIso = mapGeo?.iso && mapGeo.iso.length === 3 ? mapGeo.iso : null;
  const mapColor = mapGeo?.color || "var(--green)";

  const geoMetricOptions = [
    { value: "combined", label: t("Combined") },
    { value: "ftdRate", label: t("FTD rate") },
    { value: "reg2depRate", label: t("Reg2Dep rate") },
  ];

  const activeGeoName = focusGeo?.name;

  const handleSeriesToggle = (key) => {
    setSelectedSeries((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const effectiveHover = selectedSeries.length ? null : hoverSeries;
  const tooltipVisibleKeys = selectedSeries.length
    ? selectedSeries
    : effectiveHover
    ? [effectiveHover]
    : null;

  const isSeriesActive = (key) => {
    if (selectedSeries.length) return selectedSeries.includes(key);
    if (effectiveHover) return effectiveHover === key;
    return true;
  };

  const isSeriesMuted = (key) => {
    if (selectedSeries.length) return !selectedSeries.includes(key);
    if (effectiveHover) return effectiveHover !== key;
    return false;
  };

  const handleGeoEnter = (iso) => {
    if (!selectedGeo) setHoverGeo(iso);
  };

  const handleGeoLeave = () => {
    if (!selectedGeo) setHoverGeo(null);
  };

  const handleGeoToggle = (iso) => {
    setSelectedGeo((prev) => (prev === iso ? null : iso));
    setHoverGeo(null);
  };


  // First load — show only skeletons (early-return) so the zero-state real
  // cards don't pile up below the placeholders. Error case falls through so
  // the retry banner + cached/zero data render normally.
  if (homeState.loading && homeRows.length === 0 && !homeState.error) {
    return (
      <>
        <SkeletonCards count={4} />
        <SkeletonCards count={4} />
        <SkeletonChart height={240} />
      </>
    );
  }

  return (
    <>
      {homeState.error ? (
        <div className="empty-state error stats-error">
          <span className="stats-error-icon" aria-hidden="true">!</span>
          <div className="stats-error-text">
            <strong>{t("Couldn't load media buyer stats")}</strong>
            <span>{homeState.error}</span>
          </div>
          <button
            type="button"
            className="stats-error-retry"
            onClick={loadHomeStats}
            disabled={homeState.loading}
          >
            <RotateCcw size={12} className={homeState.loading ? "is-spinning" : ""} />
            {homeState.loading ? t("Retrying…") : t("Retry")}
          </button>
        </div>
      ) : null}
      <section className="cards">
        {homePrimaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <div className="card-head">
                <Icon size={20} />
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              {stat.sub ? (
                <div className="card-sub">
                  <span className="card-sub-dot" />
                  <span className="card-sub-value">{stat.sub.value}</span>
                  <span className="card-sub-label">{t(stat.sub.label)}</span>
                </div>
              ) : null}
              <div className="card-meta">{t(stat.meta)}</div>
            </motion.div>
          );
        })}
      </section>

      <section className="cards secondary">
        {homeSecondaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.08, duration: 0.5 }}
            >
              <div className="card-head">
                <Icon size={20} />
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </motion.div>
          );
        })}
      </section>

      <section className="panels panels-single">
        <motion.div
          className="panel ftd-volume-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Overview")}</h3>
              <p className="panel-subtitle">
                {isSingleDayRange ? t("Performance by hour") : t("Performance by date")}
              </p>
            </div>
            <div className="summary-inline">
              <span>{`${t("Peak")}: ${fmtCount(overviewPeak)}`}</span>
              <span>{`${isSingleDayRange ? t("Avg/hour") : t("Avg/day")}: ${fmtCount(overviewAvg)}`}</span>
            </div>
          </div>
          <div className="chart">
            <div className="chart-surface">
              {overviewData.length ? (
                activeOverviewMetrics.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={overviewData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      {activeOverviewMetrics.map((metric) => (
                        <linearGradient
                          key={metric.key}
                          id={`overview-gradient-${metric.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={metric.color} stopOpacity={0.34} />
                          <stop offset="100%" stopColor={metric.color} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#7f848f"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#8b909a", fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#7f848f"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#8b909a", fontSize: 11 }}
                      width={40}
                      tickFormatter={formatVolumeAxis}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#7f848f"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#8b909a", fontSize: 11 }}
                      width={44}
                      tickFormatter={(value) => `${Math.round(value)}%`}
                    />
                    <Tooltip
                      cursor={{ stroke: "rgba(69, 226, 205, 0.28)", strokeWidth: 1 }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="chart-tooltip ftd-volume-tooltip" style={tooltipStyle}>
                            <p className="tooltip-label">{label}</p>
                            {payload.map((item) => {
                              const metric = overviewMetricOptions.find((entry) => entry.key === item.dataKey);
                              if (!metric) return null;
                              return (
                                <div className="tooltip-row" key={item.dataKey}>
                                  <span className="tooltip-dot" style={{ background: metric.color }} />
                                  <span>{t(metric.label)}</span>
                                  <span className="tooltip-value">
                                    {formatOverviewMetricValue(item.value, metric.type)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }}
                    />
                    {activeOverviewMetrics.map((metric) => (
                      <Area
                        key={metric.key}
                        type="natural"
                        dataKey={metric.key}
                        name={t(metric.label)}
                        yAxisId={metric.type === "percent" ? "right" : "left"}
                        stroke={metric.color}
                        strokeWidth={2.1}
                        fill={`url(#overview-gradient-${metric.key})`}
                        dot={{ r: 2.4, fill: metric.color, stroke: "#0f1216", strokeWidth: 1.2 }}
                        activeDot={{ r: 4, fill: "#0f1216", stroke: metric.color, strokeWidth: 1.8 }}
                        isAnimationActive
                        animationDuration={700}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
                ) : (
                  <div className="empty-state">{t("Select at least one metric filter.")}</div>
                )
              ) : (
                <div className="empty-state">{t("No overview data available.")}</div>
              )}
            </div>
            <div className="overview-filters">
              {overviewMetricOptions.map((metric) => {
                const active = overviewFilters.includes(metric.key);
                return (
                  <button
                    type="button"
                    key={metric.key}
                    className={`overview-filter${active ? " is-active" : ""}`}
                    onClick={() => toggleOverviewMetric(metric.key)}
                    style={
                      active
                        ? {
                            borderColor: metric.color,
                            color: metric.color,
                            boxShadow: `inset 0 0 0 1px ${metric.color}33`,
                          }
                        : undefined
                    }
                  >
                    <span className="overview-filter-dot" style={{ background: metric.color }} />
                    {t(metric.label)}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="panels">
        <motion.div
          className="panel stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Statistics")}</h3>
              <p className="panel-subtitle">{t("Daily conversion rates")}</p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {homeChartSeries.map((series) => (
                    <linearGradient
                      key={series.key}
                      id={`smooth-${toGradientId(series.key)}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={series.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b909a", fontSize: 11 }}
                />
                <YAxis
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  tick={{ fill: "#8b909a", fontSize: 11 }}
                />
                <Tooltip
                  content={(props) => (
                    <ChartTooltip {...props} visibleKeys={tooltipVisibleKeys} />
                  )}
                />
                {homeChartSeries.map((series) => {
                  const active = isSeriesActive(series.key);
                  const muted = isSeriesMuted(series.key);
                  return (
                    <Area
                      key={series.key}
                      type="natural"
                      dataKey={series.key}
                      name={t(series.label)}
                      stroke={series.color}
                      strokeWidth={active ? series.width + 0.8 : series.width + 0.4}
                      strokeOpacity={muted ? 0.2 : 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={`url(#smooth-${toGradientId(series.key)})`}
                      fillOpacity={muted ? 0.05 : active ? 0.28 : 0.18}
                      dot={false}
                      activeDot={
                        active
                          ? { r: 4, fill: "#0f1216", stroke: series.color, strokeWidth: 2 }
                          : false
                      }
                      isAnimationActive
                      animationDuration={900}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
            <div className="legend">
              {homeChartSeries.map((item) => {
                const active = selectedSeries.length
                  ? selectedSeries.includes(item.key)
                  : hoverSeries === item.key;
                const muted = isSeriesMuted(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={`legend-item is-interactive${active ? " is-active" : ""}${
                      muted ? " is-muted" : ""
                    }`}
                    onMouseEnter={() => setHoverSeries(item.key)}
                    onMouseLeave={() => setHoverSeries(null)}
                    onClick={() => handleSeriesToggle(item.key)}
                    aria-pressed={selectedSeries.includes(item.key)}
                  >
                    <span className="dot" style={{ background: item.color }} />
                    {t(item.label)}
                  </button>
                );
              })}
            </div>
            <p className="chart-hint">{t("Tip: hover or click legends to isolate a series.")}</p>
            <div className="revenue-blocks">
              <div className="revenue-head">
                <div>
                  <h4>{t("Revenue by date")}</h4>
                  <p>{t("Daily revenue trend for the selected period.")}</p>
                </div>
                <div className="revenue-total">
                  <span>{t("Total Revenue")}</span>
                  <strong>{formatCurrency(revenueTotals.revenue)}</strong>
                </div>
              </div>
              <div className="revenue-grid">
                <div className={`revenue-card ${ftdRevenueStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("FTD Revenue")}</span>
                    <span className={`revenue-chip ${ftdRevenueStatus.tone}`}>
                      {ftdRevenueStatus.label}
                    </span>
                  </div>
                  <strong>
                    {Number.isFinite(ftdRevenueTotal) ? formatCurrency(ftdRevenueTotal) : "—"}
                  </strong>
                </div>
                <div className={`revenue-card ${redepositRevenueStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("Redeposit Revenue")}</span>
                    <span className={`revenue-chip ${redepositRevenueStatus.tone}`}>
                      {redepositRevenueStatus.label}
                    </span>
                  </div>
                  <strong>
                    {Number.isFinite(redepositRevenueTotal)
                      ? formatCurrency(redepositRevenueTotal)
                      : "—"}
                  </strong>
                </div>
                <div className={`revenue-card ${ftdToRedepositStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("FTD to Redeposit CR")}</span>
                    <span className={`revenue-chip ${ftdToRedepositStatus.tone}`}>
                      {ftdToRedepositStatus.label}
                    </span>
                  </div>
                  <strong>
                    {ftdToRedepositCr === null ? "—" : `${ftdToRedepositCr.toFixed(2)}%`}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="panel map"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Top GEO")}</h3>
              <p className="panel-subtitle">
                {t("Highest FTD conversion rate and Reg2Dep conversion rate")}
              </p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="map-wrap">
            <div className="map-controls">
              {geoMetricOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`map-toggle${geoMetric === option.value ? " is-active" : ""}`}
                  onClick={() => setGeoMetric(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="map-grid">
              <div className="map-visual">
                <ComposableMap projectionConfig={{ scale: 120 }}>
                  <defs>
                    <radialGradient id="geo-heat" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor={mapColor} stopOpacity="0.95" />
                      <stop offset="55%" stopColor={mapColor} stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#1b1d21" stopOpacity="0.15" />
                    </radialGradient>
                  </defs>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const iso = geo.properties.ISO_A3;
                        const isHighlighted = mapIso && iso === mapIso;
                        const fill = isHighlighted ? "url(#geo-heat)" : "#353840";
                        const opacity = isHighlighted ? 0.95 : 0.28;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fill}
                            stroke={isHighlighted ? "#f5f5f7" : "#1e2126"}
                            strokeWidth={isHighlighted ? 1.2 : 0.5}
                            style={{
                              default: {
                                outline: "none",
                                opacity,
                                cursor: isHighlighted ? "pointer" : "default",
                                filter: isHighlighted
                                  ? "drop-shadow(0 0 12px rgba(54, 208, 124, 0.35))"
                                  : "none",
                              },
                              hover: {
                                outline: "none",
                                opacity: isHighlighted ? 1 : opacity,
                              },
                              pressed: {
                                outline: "none",
                                opacity: 1,
                              },
                            }}
                            onMouseEnter={() => isHighlighted && handleGeoEnter(iso)}
                            onMouseLeave={() => isHighlighted && handleGeoLeave()}
                            onClick={() => isHighlighted && handleGeoToggle(iso)}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {mapGeo?.coordinates ? (
                    <Marker
                      key={mapGeo.name}
                      coordinates={mapGeo.coordinates}
                      onMouseEnter={() => handleGeoEnter(mapGeo.iso)}
                      onMouseLeave={() => handleGeoLeave()}
                      onClick={() => handleGeoToggle(mapGeo.iso)}
                    >
                      <circle r={10} fill={mapGeo.color} opacity={0.2} />
                      <circle r={6.5} fill={mapGeo.color} stroke="#0b0c0e" strokeWidth={1} />
                    </Marker>
                  ) : null}
                </ComposableMap>
                <div className="legend geo">
                  {mapGeo ? (
                    <span className="legend-item">
                      <span className="dot" style={{ background: mapGeo.color }} />
                      {mapGeo.name}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="map-info">
                <div className="map-info-card">
                  <div className="map-info-head">
                    <span>{t("Active GEO")}</span>
                    <span className="map-info-metric">
                      {geoMetricOptions.find((option) => option.value === geoMetric)?.label}
                    </span>
                  </div>
                  <div className="map-info-main">
                    <div className="map-info-name">{activeGeoName || t("None")}</div>
                    <span className="map-info-score">
                      {focusGeo ? `${focusGeo[geoMetricKey]}%` : "--"}
                    </span>
                  </div>
                  <div className="map-info-metrics">
                    <div className="map-metric">
                      <span>{t("FTD rate")}</span>
                      <strong>{focusGeo ? `${focusGeo.ftdRate}%` : "--"}</strong>
                    </div>
                    <div className="map-metric">
                      <span>{t("Reg2Dep rate")}</span>
                      <strong>{focusGeo ? `${focusGeo.reg2depRate}%` : "--"}</strong>
                    </div>
                    <div className="map-metric">
                      <span>{t("Combined")}</span>
                      <strong>{focusGeo ? `${focusGeo.combined}%` : "--"}</strong>
                    </div>
                  </div>
                </div>
                <div className="map-ranking">
                  <div className="map-ranking-head">
                    <span>{t("Top performers")}</span>
                    <span className="map-ranking-metric">
                      {geoMetricOptions.find((option) => option.value === geoMetric)?.label}
                    </span>
                  </div>
                  <div className="map-ranking-list">
                    {topGeoList.map((marker) => {
                      const value = marker[geoMetricKey] || 0;
                      const width = metricMax ? Math.round((value / metricMax) * 100) : 0;
                      return (
                        <button
                          key={marker.iso}
                          type="button"
                          className={`map-rank${activeGeo === marker.iso ? " is-active" : ""}`}
                          onMouseEnter={() => handleGeoEnter(marker.iso)}
                          onMouseLeave={() => handleGeoLeave()}
                          onClick={() => handleGeoToggle(marker.iso)}
                        >
                          <div className="map-rank-row">
                            <span className="dot" style={{ background: marker.color }} />
                            <span className="map-rank-name">{marker.name}</span>
                            <span className="map-rank-value">{value}%</span>
                          </div>
                          <div className="map-rank-bar">
                            <span style={{ width: `${width}%`, background: marker.color }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="map-ranking-footer">
                    <button
                      type="button"
                      className="ghost map-see-more"
                      onClick={() => onSeeGeos?.()}
                    >
                      {t("See more")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="panels extra">
        <motion.div
          className="panel stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Conversion Funnel")}</h3>
              <p className="panel-subtitle">{t("Stage counts for the selected period")}</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={funnelData}
                barSize={28}
                barCategoryGap="28%"
                margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
              >
                <defs>
                  {funnelData.map((entry) => (
                    <linearGradient
                      key={entry.name}
                      id={`funnel-${toGradientId(entry.name)}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(255,255,255,0.9)" stopOpacity="0.18" />
                      <stop offset="12%" stopColor={entry.color} stopOpacity="1" />
                      <stop offset="100%" stopColor={entry.color} stopOpacity="0.75" />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#7f848f" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tick={{ fontSize: 11 }}
                  tickMargin={6}
                  allowDecimals={false}
                  domain={[0, funnelDomainMax]}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "#f4f6fb" }}
                  itemStyle={{ color: "#d7dde7" }}
                  formatter={(value) => [Number(value || 0).toLocaleString(), t("Value")]}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="value" radius={[10, 10, 6, 6]} minPointSize={4}>
                  {funnelData.map((entry) => (
                    <Cell key={entry.name} fill={`url(#funnel-${toGradientId(entry.name)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="legend">
              {funnelData.map((item) => (
                <span className="legend-item" key={item.name}>
                  <span className="dot" style={{ background: item.color }} />
                  {t(item.name)}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="panel stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Conversion Rates")}</h3>
              <p className="panel-subtitle">{t("Average rate across each handoff")}</p>
            </div>
          </div>
          <div className="chart chart-center chart-surface">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={conversionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={4}
                    cornerRadius={8}
                    startAngle={90}
                    endAngle={-270}
                    stroke="rgba(12, 14, 17, 0.9)"
                    strokeWidth={2}
                    onMouseEnter={(_, index) => setActiveRateIndex(index)}
                    onMouseLeave={() => setActiveRateIndex(null)}
                    activeIndex={activeRateIndex ?? undefined}
                  >
                    {conversionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<RateTooltip />} wrapperStyle={{ zIndex: 40 }} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <div className="donut-value">{donutValue}</div>
                <div className="donut-label">{donutLabel}</div>
              </div>
            </div>
            <div className="legend">
              {conversionData.map((item, index) => (
                <button
                  type="button"
                  className={`legend-item is-interactive${
                    activeRateIndex === index ? " is-active" : ""
                  }`}
                  key={item.name}
                  onMouseEnter={() => setActiveRateIndex(index)}
                  onMouseLeave={() => setActiveRateIndex(null)}
                >
                  <span className="dot" style={{ background: item.color }} />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

    </>
  );
}

function GeosDashboard({ filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const [geoRows, setGeoRows] = React.useState([]);
  const [geoState, setGeoState] = React.useState({ loading: true, error: null });

  const loadGeos = React.useCallback(async () => {
    const isoRe = /^\d{4}-\d{2}-\d{2}$/;
    const from = isoRe.test(filters?.dateFrom || "") ? filters.dateFrom : "";
    const to = isoRe.test(filters?.dateTo || "") ? filters.dateTo : "";
    const qs = new URLSearchParams({ group: "geo" });
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    const liveUrl = `/api/keitaro/live-stats?${qs.toString()}`;
    const cacheKey = `live-geos:${qs.toString()}`;
    const cached = readSwrCache(cacheKey);

    if (cached && Array.isArray(cached)) {
      setGeoRows(cached);
      setGeoState({ loading: false, error: null });
    } else {
      setGeoState({ loading: true, error: null });
    }

    try {
      let rows = null;
      // Primary path: live, geo-grained data straight from Keitaro.
      const response = await apiFetch(liveUrl);
      if (response.ok) {
        const data = await response.json();
        rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        // Fallback to the synced table when the live endpoint is unavailable.
        const fb = await apiFetch("/api/media-stats?limit=100000");
        if (!fb.ok) throw new Error("Failed to load media buyer stats.");
        const fbData = await fb.json();
        rows = Array.isArray(fbData) ? fbData : [];
      }
      writeSwrCache(cacheKey, rows);
      setGeoRows(rows);
      setGeoState({ loading: false, error: null });
    } catch (error) {
      if (!cached) {
        setGeoState({ loading: false, error: error.message || "Failed to load stats." });
      }
    }
  }, [filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    loadGeos();
  }, [loadGeos]);

  React.useEffect(() => {
    const handleSync = () => {
      loadGeos();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [loadGeos]);

  const buyerFilter = filters?.buyer || "All";
  const countryFilter = filters?.country || "All";
  const regionFilter = filters?.city || "All";
  const cityFilter = filters?.geoCity || "All";
  const domainFilter = filters?.geoDomain || "All";
  const placementFilter = filters?.geoPlacement || "All";
  const deviceFilter = filters?.geoDevice || "All";
  const minClicksFilter = Number(filters?.geoMinClicks || 0);
  const minFtdsFilter = Number(filters?.geoMinFtds || 0);
  const dateFrom = filters?.dateFrom;
  const dateTo = filters?.dateTo;
  const normalizeBuyerKey = (value) =>
    String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();
  const isAllSelection = (value) => !value || normalizeFilterValue(value) === "all";

  const sum = (value) => Number(value || 0);
  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCost = (value) =>
    value === null || Number.isNaN(value) ? "—" : formatCurrency(value);
  const renderMetricTooltip = (labelKey, valueKey, valueLabel) => ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0]?.payload || {};
    const label = item[labelKey] || payload[0]?.name || "";
    const value = item[valueKey] ?? payload[0]?.value;
    return (
      <div style={tooltipStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div>
          {valueLabel}: {formatCurrency(value || 0)}
        </div>
      </div>
    );
  };
  const matchesBuyer = (buyer) => {
    const normalizedBuyer = normalizeBuyerKey(buyer);
    if (!normalizedBuyer) return false;
    if (isAllSelection(buyerFilter)) {
      if (isLeadership) return true;
      if (viewerBuyer) {
        const normalizedViewer = normalizeBuyerKey(viewerBuyer);
        return normalizedBuyer.includes(normalizedViewer);
      }
      return true;
    }
    const normalizedFilter = normalizeBuyerKey(buyerFilter);
    if (!normalizedFilter) return false;
    return normalizedBuyer.includes(normalizedFilter) || normalizedFilter.includes(normalizedBuyer);
  };

  const filteredRows = React.useMemo(() => {
    const normalizedCountry = normalizeFilterValue(countryFilter);
    const normalizedRegion = normalizeFilterValue(regionFilter);
    const normalizedCity = normalizeFilterValue(cityFilter);
    const normalizedDomain = normalizeFilterValue(domainFilter);
    const normalizedPlacement = normalizeFilterValue(placementFilter);
    const normalizedDevice = normalizeFilterValue(deviceFilter);
    const dateRange = normalizeDateRange(dateFrom, dateTo);
    return geoRows.filter((row) => {
      if (!matchesBuyer(row.buyer)) return false;
      const rowCountry = normalizeFilterValue(row.country);
      if (!isAllSelection(countryFilter) && rowCountry !== normalizedCountry) return false;
      const rowRegion = normalizeFilterValue(row.region || row.city);
      if (!isAllSelection(regionFilter) && !rowRegion.includes(normalizedRegion)) return false;
      const rowCity = normalizeFilterValue(row.city);
      if (!isAllSelection(cityFilter) && !rowCity.includes(normalizedCity)) return false;
      const rowDomain = normalizeFilterValue(
        row.domain || row.source || row.site || row.flow || row.flows
      );
      if (!isAllSelection(domainFilter) && !rowDomain.includes(normalizedDomain)) return false;
      const rowPlacement = normalizeFilterValue(row.placement || row.sub_id_1 || row.sub1);
      if (!isAllSelection(placementFilter) && !rowPlacement.includes(normalizedPlacement)) return false;
      const rowDevice = normalizeFilterValue(
        row.device || row.device_type || row.os || row.os_icon || row.os_version
      );
      if (!isAllSelection(deviceFilter) && !rowDevice.includes(normalizedDevice)) return false;
      if (Number.isFinite(minClicksFilter) && minClicksFilter > 0 && sum(row.clicks) < minClicksFilter) {
        return false;
      }
      if (Number.isFinite(minFtdsFilter) && minFtdsFilter > 0 && sum(row.ftds) < minFtdsFilter) {
        return false;
      }
      if (!isDateInRange(row.date, dateRange)) return false;
      return true;
    });
  }, [
    geoRows,
    buyerFilter,
    countryFilter,
    regionFilter,
    cityFilter,
    domainFilter,
    placementFilter,
    deviceFilter,
    minClicksFilter,
    minFtdsFilter,
    dateFrom,
    dateTo,
    isLeadership,
    viewerBuyer,
  ]);

  const geoTotals = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "Unknown");
      if (!map.has(country)) {
        map.set(country, {
          country,
          spend: 0,
          revenue: 0,
          hasRevenue: false,
          ftdRevenue: 0,
          redepositRevenue: 0,
          clicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
        });
      }
      const current = map.get(country);
      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      current.spend += sum(row.spend);
      current.clicks += sum(row.clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.ftdRevenue = (current.ftdRevenue || 0) + ftdRevenueValue;
      current.redepositRevenue = (current.redepositRevenue || 0) + redepositRevenueValue;
      if (Number.isFinite(revenueValue)) {
        current.revenue += revenueValue;
        current.hasRevenue = true;
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const revenueSort = (b.revenue || 0) - (a.revenue || 0);
      if (revenueSort !== 0) return revenueSort;
      return (b.clicks || 0) - (a.clicks || 0);
    });
  }, [filteredRows]);

  const [geoTableSort, setGeoTableSort] = React.useState({ key: "revenue", dir: "desc" });
  const toggleGeoSort = (key) => {
    setGeoTableSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  };
  const getGeoSortValue = (row, key) => {
    const revenueValue = row.hasRevenue ? row.revenue : null;
    switch (key) {
      case "country":
        return String(row.country || "");
      case "spend":
        return row.spend ? row.spend : null;
      case "revenue":
        return revenueValue;
      case "clicks":
        return row.clicks;
      case "installs":
        return row.installs ? row.installs : null;
      case "registers":
        return row.registers;
      case "ftds":
        return row.ftds;
      case "redeposits":
        return row.redeposits ? row.redeposits : null;
      case "arppu":
        return revenueValue !== null && row.ftds > 0 ? revenueValue / row.ftds : null;
      case "ltv":
        return revenueValue !== null && row.redeposits > 0 ? revenueValue / row.redeposits : null;
      case "c2r":
        return toPercent(row.registers, row.clicks);
      case "c2ftd":
        return toPercent(row.ftds, row.clicks);
      case "r2d":
        return toPercent(row.ftds, row.registers);
      default:
        return null;
    }
  };
  const sortedGeoTotals = React.useMemo(() => {
    const rows = [...geoTotals];
    const { key, dir } = geoTableSort;
    const direction = dir === "asc" ? 1 : -1;
    return rows.sort((a, b) => {
      const aVal = getGeoSortValue(a, key);
      const bVal = getGeoSortValue(b, key);
      const aNull = aVal === null || aVal === undefined || Number.isNaN(aVal);
      const bNull = bVal === null || bVal === undefined || Number.isNaN(bVal);
      if (key === "country") {
        return direction * String(aVal || "").localeCompare(String(bVal || ""));
      }
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      if (aVal === bVal) return 0;
      return direction * (aVal > bVal ? 1 : -1);
    });
  }, [geoTotals, geoTableSort]);

  const cityTotalsAll = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const rawCity = String(row.region || row.city || "").trim();
      const countryLabel = String(row.country || "Unknown").trim() || "Unknown";
      const city = rawCity || `Unknown (${countryLabel})`;
      if (!map.has(city)) {
        map.set(city, {
          city,
          revenue: 0,
          spend: 0,
          ftds: 0,
          redeposits: 0,
          clicks: 0,
          registers: 0,
        });
      }
      const current = map.get(city);
      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (Number.isFinite(revenueValue)) {
        current.revenue += revenueValue;
      }
      current.spend += sum(row.spend);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
    });
    return Array.from(map.values()).sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  }, [filteredRows]);

  const cityTotals = React.useMemo(() => {
    return cityTotalsAll;
  }, [cityTotalsAll]);

  const geoSummary = React.useMemo(
    () =>
      geoTotals.reduce(
        (acc, row) => ({
          revenue: acc.revenue + (row.hasRevenue ? row.revenue : 0),
          clicks: acc.clicks + row.clicks,
          registers: acc.registers + row.registers,
          ftds: acc.ftds + row.ftds,
          redeposits: acc.redeposits + row.redeposits,
        }),
        { revenue: 0, clicks: 0, registers: 0, ftds: 0, redeposits: 0 }
      ),
    [geoTotals]
  );

  const geoTopLimit = 5;
  const geoChartRows = geoTotals.filter((row) => row.country && row.country !== "Unknown");
  const geoRevenueCandidates = geoChartRows.filter((row) => row.revenue > 0);
  const geoRevenueData = (geoRevenueCandidates.length ? geoRevenueCandidates : geoChartRows).slice(
    0,
    geoTopLimit
  );
  const geoArppuData = geoChartRows
    .map((row) => ({
      country: row.country,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
    }))
    .filter((row) => row.arppu > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const geoLtvData = geoChartRows
    .map((row) => ({
      country: row.country,
      ltv: row.redeposits > 0 ? row.revenue / row.redeposits : 0,
    }))
    .filter((row) => row.ltv > 0)
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, geoTopLimit);

  const cityRevenueCandidates = cityTotals.filter((row) => row.revenue > 0);
  const cityRevenueData = (cityRevenueCandidates.length ? cityRevenueCandidates : cityTotals).slice(
    0,
    geoTopLimit
  );
  const cityArppuData = cityTotals
    .map((row) => ({
      city: row.city,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
      revenue: row.revenue,
      ftds: row.ftds,
    }))
    .filter((row) => row.revenue > 0 || row.ftds > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const cityArppuTable = cityTotals
    .map((row) => ({
      city: row.city,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
      ftds: row.ftds,
      ftdsDisplay: Math.round(row.ftds || 0),
      revenue: row.revenue,
    }))
    .filter((row) => row.revenue > 0 || row.ftds > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const maxCityArppu = Math.max(1, ...cityArppuTable.map((row) => row.arppu || 0));
  const maxCityUsers = Math.max(1, ...cityArppuTable.map((row) => row.ftdsDisplay || 0));
  const cityLtvSource =
    cityTotals.some((row) => row.redeposits > 0 && row.revenue > 0) ? cityTotals : cityTotalsAll;
  const cityLtvData = cityLtvSource
    .map((row) => ({
      city: row.city,
      ltv: row.redeposits > 0 ? row.revenue / row.redeposits : 0,
    }))
    .filter((row) => row.ltv > 0)
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, geoTopLimit);

  const topGeoArppu = geoArppuData[0] || null;
  const topGeoLtv = geoLtvData[0] || null;
  const topGeoRevenue = geoRevenueData[0] || null;
  const topCityArppu = cityArppuData[0] || null;
  const topCityLtv = cityLtvData[0] || null;

  // DEUS series palette — distinct, on-brand colors so each series is unmistakable
  const DEUS_SERIES_COLORS = ["#36d07c", "#64b8ff", "#ff9357", "#a15bff", "#f7c625"];
  const ltvGrowthTargets = geoLtvData.map((row) => row.country);
  const ltvGrowthSeries = ltvGrowthTargets.map((country, index) => ({
    key: country,
    label: country,
    color: DEUS_SERIES_COLORS[index % DEUS_SERIES_COLORS.length],
  }));
  const arppuGrowthTargets = geoArppuData.map((row) => row.country);
  const arppuGrowthSeries = arppuGrowthTargets.map((country, index) => ({
    key: country,
    label: country,
    color: DEUS_SERIES_COLORS[index % DEUS_SERIES_COLORS.length],
  }));

  const ltvGrowthData = React.useMemo(() => {
    if (!ltvGrowthTargets.length) return [];
    const targetsSet = new Set(ltvGrowthTargets);
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!targetsSet.has(country)) return;
      const date = row.date;
      if (!date) return;

      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (!map.has(date)) {
        map.set(date, { date, values: {} });
      }
      const entry = map.get(date);
      if (!entry.values[country]) {
        entry.values[country] = { revenue: 0, redeposits: 0 };
      }
      entry.values[country].revenue += revenueValue || 0;
      entry.values[country].redeposits += sum(row.redeposits);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((entry) => {
        const row = { date: entry.date, dateLabel: formatShortDate(entry.date) };
        ltvGrowthTargets.forEach((country) => {
          const stats = entry.values[country];
          row[country] = stats && stats.redeposits > 0 ? stats.revenue / stats.redeposits : 0;
      });
        return row;
      });
  }, [filteredRows, ltvGrowthTargets]);

  const arppuGrowthData = React.useMemo(() => {
    if (!arppuGrowthTargets.length) return [];
    const targetsSet = new Set(arppuGrowthTargets);
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!targetsSet.has(country)) return;
      const date = row.date;
      if (!date) return;

      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (!map.has(date)) {
        map.set(date, { date, values: {} });
      }
      const entry = map.get(date);
      if (!entry.values[country]) {
        entry.values[country] = { revenue: 0, ftds: 0 };
      }
      entry.values[country].revenue += revenueValue || 0;
      entry.values[country].ftds += sum(row.ftds);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((entry) => {
        const row = { date: entry.date, dateLabel: formatShortDate(entry.date) };
        arppuGrowthTargets.forEach((country) => {
          const stats = entry.values[country];
          row[country] = stats && stats.ftds > 0 ? stats.revenue / stats.ftds : 0;
        });
        return row;
      });
  }, [filteredRows, arppuGrowthTargets]);

  return (
    <>
      {!geoState.loading && !geoState.error && geoTotals.length ? (
        <>
          <section className="cards">
            {[
              {
                label: "Total Revenue",
                value: formatCurrency(geoSummary.revenue),
                icon: Wallet,
                meta: t("Filtered range"),
              },
              {
                label: "Total FTDs",
                value: geoSummary.ftds.toLocaleString(),
                icon: CreditCard,
                meta: t("Filtered range"),
              },
              {
                label: "Total Redeposits",
                value: geoSummary.redeposits.toLocaleString(),
                icon: CreditCard,
                meta: t("Filtered range"),
              },
              {
                label: "Top GEO Revenue",
                value: topGeoRevenue ? formatCurrency(topGeoRevenue.revenue) : "—",
                icon: Trophy,
                meta: topGeoRevenue ? topGeoRevenue.country : t("No data"),
              },
              {
                label: "Top GEO ARPPU",
                value: topGeoArppu ? formatCurrency(topGeoArppu.arppu) : "—",
                icon: Trophy,
                meta: topGeoArppu ? topGeoArppu.country : t("No data"),
              },
              {
                label: "Top GEO LTV",
                value: topGeoLtv ? formatCurrency(topGeoLtv.ltv) : "—",
                icon: Trophy,
                meta: topGeoLtv ? topGeoLtv.country : t("No data"),
              },
              {
                label: "Top Region ARPPU",
                value: topCityArppu ? formatCurrency(topCityArppu.arppu) : "—",
                icon: MapIcon,
                meta: topCityArppu ? topCityArppu.city : t("No data"),
              },
              {
                label: "Top Region LTV",
                value: topCityLtv ? formatCurrency(topCityLtv.ltv) : "—",
                icon: MapIcon,
                meta: topCityLtv ? topCityLtv.city : t("No data"),
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                >
                  <div className="card-head">
                    <Icon size={20} />
                    {t(stat.label)}
                  </div>
                  <div className="card-value">{stat.value}</div>
                  <div className="card-meta">{t(stat.meta)}</div>
                </motion.div>
              );
            })}
          </section>

          <div className="section-header">
            <div>
              <h3>{t("GEO Insights")}</h3>
              <p>{t("Top performing countries across revenue, ARPPU, and LTV.")}</p>
            </div>
          </div>
          <section className="panels geo-charts">
            <motion.div
              className="panel span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("Top GEOs by Revenue")}</h3>
                  <p className="panel-subtitle">{t("Best performing GEOs by total revenue.")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={geoRevenueData}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 90, bottom: 8 }}
                    barCategoryGap={12}
                  >
                    <defs>
                      <linearGradient id="geoRevenue" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis
                      type="category"
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatCurrency(value), t("Revenue")]}
                    />
                    <Bar dataKey="revenue" fill="url(#geoRevenue)" radius={[0, 8, 8, 0]}>
                      <LabelList
                        dataKey="revenue"
                        position="right"
                        formatter={(value) => formatCurrency(value)}
                        style={{ fill: "#a9adb7", fontSize: 11, fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {geoRevenueData.length >= 2 ? (() => {
                const leader = geoRevenueData[0];
                const runner = geoRevenueData[1];
                const lift = runner.revenue > 0 ? Math.round(((leader.revenue - runner.revenue) / runner.revenue) * 100) : null;
                return (
                  <div className="chart-insight">
                    <span className="chart-insight-mark">↑</span>
                    <span><strong>{leader.country}</strong> leads with {formatCurrency(leader.revenue)}{lift !== null ? ` — ${lift}% more than ${runner.country}` : ""}</span>
                  </div>
                );
              })() : null}
            </motion.div>

            <motion.div
              className="panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("ARPPU by GEO")}</h3>
                  <p className="panel-subtitle">{t("Average revenue per paying user (Revenue / FTDs).")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={geoArppuData}
                    margin={{ top: 24, right: 24, left: 8, bottom: 24 }}
                    barCategoryGap={26}
                    barSize={42}
                  >
                    <defs>
                      <linearGradient id="geoArppu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff9357" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#ff9357" stopOpacity={0.35} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      interval={0}
                      height={32}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatCurrency(value), t("ARPPU")]}
                    />
                    <Bar dataKey="arppu" fill="url(#geoArppu)" radius={[10, 10, 0, 0]}>
                      <LabelList
                        dataKey="arppu"
                        position="top"
                        formatter={(value) => formatCurrency(value)}
                        fill="rgba(255,255,255,0.9)"
                        fontSize={11}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {topGeoArppu ? (
                <div className="chart-insight">
                  <span className="chart-insight-mark">★</span>
                  <span>Highest per-user value: <strong>{topGeoArppu.country}</strong> at {formatCurrency(topGeoArppu.arppu)}</span>
                </div>
              ) : null}
            </motion.div>

            <motion.div
              className="panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("LTV (2+ Deposits) by GEO")}</h3>
                  <p className="panel-subtitle">{t("Approximate: Revenue / Redeposits.")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={geoLtvData}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 90, bottom: 8 }}
                    barCategoryGap={12}
                  >
                    <defs>
                      <linearGradient id="geoLtv" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="var(--orange)" stopOpacity={0.25} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis
                      type="category"
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatCurrency(value), t("LTV")]}
                    />
                    <Bar dataKey="ltv" fill="url(#geoLtv)" radius={[0, 8, 8, 0]}>
                      <LabelList
                        dataKey="ltv"
                        position="right"
                        formatter={(value) => formatCurrency(value)}
                        style={{ fill: "#a9adb7", fontSize: 11, fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {topGeoLtv ? (
                <div className="chart-insight">
                  <span className="chart-insight-mark">↑</span>
                  <span>Strongest repeat behavior: <strong>{topGeoLtv.country}</strong> at {formatCurrency(topGeoLtv.ltv)} LTV</span>
                </div>
              ) : null}
            </motion.div>

            <motion.div
              className="panel span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("LTV Growth Timeline")}</h3>
                  <p className="panel-subtitle">
                    {t("Daily LTV trend for the top GEOs (2+ deposits).")}
                  </p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={ltvGrowthData} margin={{ top: 8, right: 24, left: 4, bottom: 4 }}>
                    <defs>
                      {ltvGrowthSeries.map((series) => (
                        <linearGradient
                          key={`ltv-grad-${series.key}`}
                          id={`ltv-grad-${series.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={series.color} stopOpacity={0.45} />
                          <stop offset="95%" stopColor={series.color} stopOpacity={0.05} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="dateLabel"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      minTickGap={18}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={70}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(label) => label}
                      formatter={(value, name) => [formatCurrency(value), name]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                    />
                    {ltvGrowthSeries.map((series, index) => (
                      <Area
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.label}
                        stroke={series.color}
                        strokeWidth={2}
                        fill={`url(#ltv-grad-${series.key})`}
                        fillOpacity={0.9}
                        connectNulls
                        dot={index === 0 ? { r: 2.5 } : false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className="panel span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("ARPPU Growth Timeline")}</h3>
                  <p className="panel-subtitle">
                    {t("Daily ARPPU trend for the top GEOs (Revenue / FTDs).")}
                  </p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={arppuGrowthData}
                    margin={{ top: 8, right: 24, left: 4, bottom: 4 }}
                  >
                    <defs>
                      {arppuGrowthSeries.map((series) => (
                        <linearGradient
                          key={`arppu-grad-${series.key}`}
                          id={`arppu-grad-${series.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={series.color} stopOpacity={0.45} />
                          <stop offset="95%" stopColor={series.color} stopOpacity={0.05} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="dateLabel"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      minTickGap={18}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={70}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(label) => label}
                      formatter={(value, name) => [formatCurrency(value), name]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                    />
                    {arppuGrowthSeries.map((series, index) => (
                      <Area
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.label}
                        stroke={series.color}
                        strokeWidth={2}
                        fill={`url(#arppu-grad-${series.key})`}
                        fillOpacity={0.9}
                        connectNulls
                        dot={index === 0 ? { r: 2.5 } : false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </section>

          <div className="section-header">
            <div>
              <h3>{t("Region Insights")}</h3>
              <p>{t("Best cities ranked by revenue, ARPPU, and LTV.")}</p>
            </div>
          </div>
          <section className="panels city-charts">
          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("Top Regions by Revenue")}</h3>
                <p className="panel-subtitle">{t("Best performing regions by total revenue.")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={cityRevenueData}
                  margin={{ top: 24, right: 20, left: 10, bottom: 24 }}
                  barCategoryGap={22}
                  barSize={36}
                >
                  <defs>
                    <linearGradient id="geoCityRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="city"
                    tickLine={false}
                    axisLine={false}
                    tick={{ ...axisTickStyle, fontSize: 10 }}
                    interval={0}
                    height={36}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatCurrency(value), t("Revenue")]}
                  />
                  <Bar dataKey="revenue" fill="url(#geoCityRevenue)" radius={[10, 10, 0, 0]}>
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(value) => formatCurrency(value)}
                      fill="rgba(255,255,255,0.9)"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("LTV (2+ Deposits) by Region")}</h3>
                <p className="panel-subtitle">{t("Approximate: Revenue / Redeposits.")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={cityLtvData}
                  layout="vertical"
                  margin={{ top: 8, right: 60, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="region-ltv-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ff9357" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#ff9357" stopOpacity={0.45} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrency(value)}
                    domain={[0, 'dataMax']}
                  />
                  <YAxis
                    type="category"
                    dataKey="city"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    width={110}
                  />
                  <Tooltip content={renderMetricTooltip("city", "ltv", t("LTV"))} />
                  <Bar dataKey="ltv" name={t("LTV")} fill="url(#region-ltv-grad)" radius={[0, 6, 6, 0]} barSize={18}>
                    <LabelList
                      dataKey="ltv"
                      position="right"
                      formatter={(value) => formatCurrency(value)}
                      style={{ fill: "#a9adb7", fontSize: 11, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="panel span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("ARPPU by Region")}</h3>
                <p className="panel-subtitle">{t("Average revenue per paying user (Revenue / FTDs).")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <div className="region-arppu-list">
                {cityArppuTable.map((row, idx) => {
                  const widthPct = Math.max(2, Math.round((row.arppu / maxCityArppu) * 100));
                  const rank = idx + 1;
                  const isPodium = rank <= 3;
                  return (
                    <div className={`region-arppu-row${isPodium ? " is-podium" : ""}`} key={row.city}>
                      <div className="region-arppu-head">
                        <span className={`region-rank rank-${rank}`}>{rank}</span>
                        <span className="region-name">{row.city}</span>
                        <span className="region-arppu-val">{formatCurrency(row.arppu)}</span>
                      </div>
                      <div className="region-arppu-bar-wrap">
                        <div className="region-arppu-bar" style={{ width: `${widthPct}%` }} />
                      </div>
                      <div className="region-arppu-meta">
                        <span className="region-meta-chip">
                          <span className="region-meta-label">FTDs</span>
                          <span className="region-meta-value">{row.ftdsDisplay.toLocaleString()}</span>
                        </span>
                        <span className="region-meta-chip">
                          <span className="region-meta-label">Revenue</span>
                          <span className="region-meta-value">{formatCurrency(row.revenue)}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {cityArppuTable.length > 0 ? (
              <div className="chart-insight">
                <span className="chart-insight-mark">★</span>
                <span>
                  <strong>{cityArppuTable[0].city}</strong> commands the highest ARPPU at {formatCurrency(cityArppuTable[0].arppu)}
                </span>
              </div>
            ) : null}
          </motion.div>
          </section>
        </>
      ) : null}

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("GEO Report")}</h3>
              <p className="panel-subtitle">
                {t("Performance by country for the selected filters.")}
              </p>
            </div>
          </div>
          {geoState.loading ? (
            <div className="empty-state">{t("Loading geo report…")}</div>
          ) : geoState.error ? (
            <div className="empty-state error">{geoState.error}</div>
          ) : geoTotals.length === 0 ? (
            <div className="empty-state">{t("No geo data yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table stats-table">
                <thead>
                  <tr>
                    {[
                      { key: "country", label: "Country" },
                      { key: "spend", label: "Spend" },
                      { key: "revenue", label: "Revenue" },
                      { key: "clicks", label: "Clicks" },
                      { key: "installs", label: "Installs" },
                      { key: "registers", label: "Registers" },
                      { key: "ftds", label: "FTDs" },
                      { key: "redeposits", label: "Redeposits" },
                      { key: "arppu", label: "ARPPU" },
                      { key: "ltv", label: "LTV" },
                      { key: "c2r", label: "C2R" },
                      { key: "c2ftd", label: "C2FTD" },
                      { key: "r2d", label: "R2D" },
                    ].map((col) => {
                      const isActive = geoTableSort.key === col.key;
                      const indicator = isActive
                        ? geoTableSort.dir === "asc"
                          ? "▲"
                          : "▼"
                        : "↕";
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`sortable-header ${isActive ? "active" : ""}`}
                            onClick={() => toggleGeoSort(col.key)}
                          >
                            {t(col.label)}
                            <span className="sort-indicator">{indicator}</span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedGeoTotals.map((row) => {
                    const revenueValue = row.hasRevenue ? row.revenue : null;
                    const arppu =
                      revenueValue !== null && row.ftds > 0
                        ? revenueValue / row.ftds
                        : null;
                    const ltv =
                      revenueValue !== null && row.redeposits > 0
                        ? revenueValue / row.redeposits
                        : null;
                    const c2r = toPercent(row.registers, row.clicks);
                    const c2f = toPercent(row.ftds, row.clicks);
                    const r2d = toPercent(row.ftds, row.registers);

                    return (
                      <tr key={row.country}>
                        <td>{row.country}</td>
                        <td>{row.spend ? formatCurrency(row.spend) : "—"}</td>
                        <td>{row.hasRevenue ? formatCurrency(row.revenue) : "—"}</td>
                        <td>{row.clicks.toLocaleString()}</td>
                        <td>{row.installs ? row.installs.toLocaleString() : "—"}</td>
                        <td>{row.registers.toLocaleString()}</td>
                        <td>{row.ftds.toLocaleString()}</td>
                        <td>{row.redeposits ? row.redeposits.toLocaleString() : "—"}</td>
                        <td>{fmtCost(arppu)}</td>
                        <td>{fmtCost(ltv)}</td>
                        <td>{fmtPercent(c2r)}</td>
                        <td>{fmtPercent(c2f)}</td>
                        <td>{fmtPercent(r2d)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

// ── Tracking Links ────────────────────────────────────────────────────
// Compose Keitaro campaigns from the dashboard: Buyer | Tool | Game |
// Geo | Brand naming, domain/alias?params link, optional push to the
// Keitaro Admin API — stored locally either way.
// Keitaro traffic-source name → short code used in the campaign-name Tool segment.
const TRACKING_SOURCE_SHORTCODES = {
  "pwa.group": "PWA.GROUP",
  "linki.group": "LINKI.GROUP",
  "zm.app": "ZMAPPS",
  "skakapp.com": "SKAK",
  "facebook.com": "FB",
  "pwa partners": "PWA PARTNERS",
  "trafficjunky.com": "TRAFFIC JUNKY",
  "youtarget.com": "YOUTARGET",
  "google ads": "GOOGLE",
  "tiktok.com": "TIKTOK",
};
const trackingSourceShortcode = (name) => {
  const key = String(name || "").trim().toLowerCase();
  return TRACKING_SOURCE_SHORTCODES[key] || String(name || "").trim().toUpperCase();
};
const TRACKING_GEO_PRESETS = [
  "GLOBAL", "MX", "BR", "TR", "AR", "CL", "CO", "PE", "EC", "PY",
  "DE", "FR", "CA", "AU", "NZ", "NO", "SE", "CH", "JP", "PL", "RO",
];
// Only these Keitaro tracking/redirect domains may back a tracking link
// (everyone sees exactly this list). PWA landing domains are never used here.
const ALLOWED_TRACKING_DOMAINS = [
  "tracker.deusmachine-trk.com",
  "go.deuskt.click",
  "deuskt.click",
];
const normalizeTrackingHost = (name) =>
  String(name || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
const DEFAULT_TRACKING_PARAMS =
  "external_id={exid}&sub1={sub1}&sub2={sub2}&sub3={sub3}&sub4={sub4}&sub5={sub5}&adset_id={{adset.id}}&sub7={sub7}&sub8={sub8}&sub9={sub9}&sub10={sub10}&sub11={sub11}&fbclid={{fbclid}}";

// Each traffic tool passes its click identifier under a different macro, so the
// external_id value must follow the selected tool (keyed by shortcode).
// Add new tools here as they're confirmed; anything unlisted keeps {exid}.
const DEFAULT_EXTERNAL_ID_MACRO = "{exid}";
const TRACKING_TOOL_EXTERNAL_ID = {
  "PWA.GROUP": "{USER_ID}",
  "ZMAPPS": "{exid}",
};
const externalIdMacroForTool = (tool) =>
  TRACKING_TOOL_EXTERNAL_ID[String(tool || "").trim().toUpperCase()] || DEFAULT_EXTERNAL_ID_MACRO;
// Swap only the external_id value in a params string, preserving any custom subs.
const applyExternalIdMacro = (params, tool) => {
  const macro = externalIdMacroForTool(tool);
  const s = String(params || "");
  if (/(?:^|&)external_id=/i.test(s)) {
    return s.replace(/((?:^|&)external_id=)[^&]*/i, `$1${macro}`);
  }
  return `external_id=${macro}${s ? `&${s}` : ""}`;
};

// Keitaro stream filter catalog. name = API filter name; bool = no values.
const TRACKING_FILTER_CATALOG = [
  { group: "Traffic", name: "keyword", label: "Keyword" },
  { group: "Traffic", name: "search_engine", label: "Search engine", bool: true },
  { group: "Traffic", name: "ad_campaign_id", label: "Ad campaign ID" },
  { group: "Traffic", name: "creative_id", label: "Creative ID" },
  { group: "Traffic", name: "empty_referrer", label: "Empty referer", bool: true },
  { group: "Traffic", name: "referrer", label: "Referrer" },
  { group: "Geo", name: "country", label: "Country / GEO" },
  { group: "Geo", name: "region", label: "Region" },
  { group: "Geo", name: "city", label: "City" },
  { group: "Geo", name: "language", label: "Language" },
  { group: "Geo", name: "connection_type", label: "Connection type" },
  { group: "Geo", name: "isp", label: "ISP / Carrier" },
  { group: "Security", name: "bot", label: "Bot", bool: true },
  { group: "Security", name: "proxy", label: "Proxy detected", bool: true },
  { group: "Security", name: "ipv_6", label: "IPv6", bool: true },
  { group: "Security", name: "unique_click", label: "Unique click", bool: true },
  { group: "Device", name: "device_type", label: "Device type", options: ["mobile", "desktop", "tablet", "tv"] },
  { group: "Device", name: "os", label: "OS" },
  { group: "Device", name: "os_version", label: "OS version" },
  { group: "Device", name: "browser", label: "Browser" },
  { group: "Device", name: "browser_version", label: "Browser version" },
  ...Array.from({ length: 11 }, (_, i) => ({
    group: "Sub IDs",
    name: `sub_id_${i + 1}`,
    label: `Sub ID ${i + 1}`,
  })),
];
const TRACKING_FILTER_BY_NAME = Object.fromEntries(TRACKING_FILTER_CATALOG.map((f) => [f.name, f]));

// Chip/tag input — Enter or comma commits a value, Backspace on empty pops.
function TagInput({ values, onChange, placeholder, options }) {
  const [draft, setDraft] = React.useState("");
  const commit = (raw) => {
    const parts = String(raw).split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...values];
    parts.forEach((p) => {
      if (!next.includes(p)) next.push(p);
    });
    onChange(next);
    setDraft("");
  };
  return (
    <div className="tag-input">
      {values.map((v) => (
        <span className="tag-chip" key={v}>
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label="Remove">
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input-field"
        value={draft}
        list={options ? "tag-opts" : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={values.length ? "" : placeholder}
      />
      {options ? (
        <datalist id="tag-opts">
          {options.map((o) => (
            <option value={o} key={o} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}

function TrackingLinksDashboard({ authUser }) {
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
        const response = await apiFetch("/api/keitaro/resources");
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || "Failed to load Keitaro resources.");
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
      const response = await apiFetch(`/api/tracking-links/${id}/push`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Push failed.");
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
      const response = await apiFetch(`/api/tracking-links/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Failed to delete link.");
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
      const response = await apiFetch(`/api/tracking-links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Failed to update status.");
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
      const response = await apiFetch(`/api/tracking-links/${id}/verify`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Verify failed.");
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
      form: { buyer: link.buyer || "", game: link.game || "", geo: link.geo || "", brand: link.brand || "" },
    });
  };
  const saveEdit = async () => {
    if (!editModal.link) return;
    setEditModal((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const response = await apiFetch(`/api/tracking-links/${editModal.link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editModal.form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Failed to save.");
      setEditModal({ open: false, link: null, saving: false, error: null, form: { buyer: "", game: "", geo: "", brand: "" } });
      await fetchLinks();
    } catch (error) {
      setEditModal((prev) => ({ ...prev, saving: false, error: error.message || "Failed to save." }));
    }
  };

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFilterModalOpen(false)}
          >
            <motion.div
              className="modal pixel-edit-modal tracking-filter-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
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
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetails({ open: false, link: null, verify: null, verifying: false, error: null })}>
            <motion.div
              className="modal pixel-edit-modal tracking-details-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
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
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal((p) => ({ ...p, open: false }))}>
            <motion.div
              className="modal pixel-edit-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
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
        transition={{ duration: 0.5 }}
      >
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><Link2 size={20} /></span>
            <div>
              <h3 className="panel-title">{t("Tracking Links")}</h3>
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
                  const source = resources.trafficSources.find((s) => String(s.id) === String(value));
                  if (source) {
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
                  } else {
                    setForm((prev) => ({
                      ...prev,
                      trafficSourceId: "",
                      tool: value,
                      externalIdMacro: externalIdMacroForTool(value),
                      params: applyExternalIdMacro(prev.params, value),
                    }));
                  }
                }}
                options={resources.trafficSources.map((s) => ({
                  value: String(s.id),
                  label: `${trackingSourceShortcode(s.name)} · ${s.name}`,
                  search: `${s.name} ${trackingSourceShortcode(s.name)}`,
                }))}
                allowCustom
                placeholder={resources.trafficSources.length ? t("Select or type") : t("Type a tool")}
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
                options={TRACKING_GEO_PRESETS.map((value) => ({ value, label: value, search: value }))}
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
                {sortedLinks.map((link) => (
                  <tr key={link.id}>
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
                  </tr>
                ))}
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

// ── My Flows ──────────────────────────────────────────────────────────
// Buyer-centric tree: Tracking Link → bound PWA domains → pixels on each
// domain. Buyers bind domains to a link and pixels already carry domains.
function MyFlowsDashboard({ authUser }) {
  const { t } = useLanguage();
  const [links, setLinks] = React.useState([]);
  const [domains, setDomains] = React.useState([]);
  const [pixels, setPixels] = React.useState([]);
  const [state, setState] = React.useState({ loading: true, error: null });
  const [expanded, setExpanded] = React.useState({});
  const [bindModal, setBindModal] = React.useState({ open: false, link: null, saving: false, error: null, selected: [] });
  const [detail, setDetail] = React.useState({ open: false, link: null, domain: null, pixels: [] });
  const [flowViz, setFlowViz] = React.useState({ open: false, link: null });
  const [copied, setCopied] = React.useState(null);
  const [sortBy, setSortBy] = React.useState("recent");

  const maskToken = (v) => {
    const s = String(v || "");
    return s.length <= 14 ? s || "—" : `${s.slice(0, 8)}••••${s.slice(-4)}`;
  };
  const copyValue = (key, value) => async () => {
    if (!value) return;
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((p) => (p === key ? null : p)), 1200);
    } catch (error) {
      /* clipboard denied */
    }
  };
  // The PWA link a buyer uploads to their traffic source: the domain + the
  // tracking link's params (external_id dropped — sub params only).
  const trafficLink = (domainHost, params) => {
    const host = String(domainHost || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const qs = String(params || "").trim().replace(/^\?+/, "").replace(/(^|&)external_id=[^&]*/i, "").replace(/^&/, "");
    if (!host) return "";
    return `https://${host}${qs ? `?${qs}` : ""}`;
  };

  // Break a link into its Buyer | Tool | Game | Geo | Brand parts, preferring
  // the stored columns and falling back to the composed campaign name.
  const linkSegments = (link) => {
    const parts = String(link.name || "").split("|").map((s) => s.trim());
    return {
      buyer: link.buyer || parts[0] || "",
      tool: link.tool || parts[1] || "",
      game: link.game || parts[2] || "",
      geo: link.geo || parts[3] || "",
      brand: link.brand || parts[4] || "",
    };
  };
  const splitGeos = (geo) =>
    String(geo || "")
      .split(/[,/]+/)
      .map((g) => g.trim())
      .filter(Boolean);
  const countLinkFilters = (link) => {
    try {
      const cfg = typeof link.filters === "string" ? JSON.parse(link.filters) : link.filters;
      return cfg && Array.isArray(cfg.rules) ? cfg.rules.length : 0;
    } catch (e) {
      return 0;
    }
  };

  const fetchAll = React.useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      const [lr, dr, pr] = await Promise.all([
        apiFetch("/api/tracking-links?limit=500"),
        apiFetch("/api/domains?limit=5000"),
        apiFetch("/api/pixels?limit=1000"),
      ]);
      const [ld, dd, pd] = await Promise.all([lr.json(), dr.json(), pr.json()]);
      if (!lr.ok) throw new Error(ld?.error || "Failed to load links.");
      setLinks(Array.isArray(ld) ? ld : []);
      setDomains(Array.isArray(dd) ? dd : []);
      setPixels(Array.isArray(pd) ? pd : []);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error.message || "Failed to load flows." });
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // domain host (lowercased) → pixels attached via their flows list
  const pixelsByDomain = React.useMemo(() => {
    const map = new Map();
    pixels.forEach((pixel) => {
      normalizeDomainInputList(pixel.flows).forEach((host) => {
        if (!map.has(host)) map.set(host, []);
        map.get(host).push(pixel);
      });
    });
    return map;
  }, [pixels]);

  const domainsByLink = React.useMemo(() => {
    const map = new Map();
    domains.forEach((d) => {
      const linkId = d.tracking_link_id;
      if (!linkId) return;
      if (!map.has(linkId)) map.set(linkId, []);
      map.get(linkId).push(d);
    });
    return map;
  }, [domains]);

  const unboundDomains = React.useMemo(
    () => domains.filter((d) => !d.tracking_link_id),
    [domains]
  );

  const pixelCountForLink = React.useCallback(
    (link) =>
      (domainsByLink.get(link.id) || []).reduce(
        (acc, d) => acc + (pixelsByDomain.get(String(d.domain || "").toLowerCase()) || []).length,
        0
      ),
    [domainsByLink, pixelsByDomain]
  );

  const sortedLinks = React.useMemo(() => {
    const arr = [...links];
    const domainCount = (l) => (domainsByLink.get(l.id) || []).length;
    const byRecent = (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0);
    arr.sort((a, b) => {
      if (sortBy === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sortBy === "buyer")
        return (
          String(linkSegments(a).buyer).localeCompare(String(linkSegments(b).buyer)) ||
          byRecent(a, b)
        );
      if (sortBy === "domains") return domainCount(b) - domainCount(a) || byRecent(a, b);
      if (sortBy === "pixels") return pixelCountForLink(b) - pixelCountForLink(a) || byRecent(a, b);
      // recent (default): active links first, then newest created
      const av = String(a.state || "active") === "active" ? 0 : 1;
      const bv = String(b.state || "active") === "active" ? 0 : 1;
      return av - bv || byRecent(a, b);
    });
    return arr;
  }, [links, sortBy, domainsByLink, pixelCountForLink]);

  const SORT_OPTIONS = [
    { value: "recent", label: t("Newest first") },
    { value: "buyer", label: t("Buyer A–Z") },
    { value: "name", label: t("Campaign A–Z") },
    { value: "domains", label: t("Most domains") },
    { value: "pixels", label: t("Most pixels") },
  ];

  const openBind = (link) => {
    const current = (domainsByLink.get(link.id) || []).map((d) => String(d.id));
    setBindModal({ open: true, link, saving: false, error: null, selected: current });
  };
  const toggleBindDomain = (domainId) => {
    setBindModal((prev) => {
      const id = String(domainId);
      const has = prev.selected.includes(id);
      return { ...prev, selected: has ? prev.selected.filter((x) => x !== id) : [...prev.selected, id] };
    });
  };
  const saveBind = async () => {
    if (!bindModal.link) return;
    setBindModal((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const linkId = bindModal.link.id;
      const before = new Set((domainsByLink.get(linkId) || []).map((d) => String(d.id)));
      const after = new Set(bindModal.selected);
      const toBind = [...after].filter((id) => !before.has(id));
      const toUnbind = [...before].filter((id) => !after.has(id));
      await Promise.all([
        ...toBind.map((id) =>
          apiFetch(`/api/domains/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackingLinkId: linkId }),
          })
        ),
        ...toUnbind.map((id) =>
          apiFetch(`/api/domains/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackingLinkId: null }),
          })
        ),
      ]);
      setBindModal({ open: false, link: null, saving: false, error: null, selected: [] });
      await fetchAll();
    } catch (error) {
      setBindModal((prev) => ({ ...prev, saving: false, error: error.message || "Failed to bind domains." }));
    }
  };

  const bindOptions = React.useMemo(() => {
    if (!bindModal.link) return [];
    // domains that are unbound OR already bound to THIS link
    return domains
      .filter((d) => !d.tracking_link_id || d.tracking_link_id === bindModal.link.id)
      .map((d) => ({ value: String(d.id), label: d.domain, search: d.domain }));
  }, [domains, bindModal.link]);

  return (
    <section className="form-section">
      <AnimatePresence>
        {bindModal.open ? (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBindModal((p) => ({ ...p, open: false }))}>
            <motion.div
              className="modal pixel-edit-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Bind Domains")}</p>
                  <h2>{bindModal.link?.name}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={() => setBindModal((p) => ({ ...p, open: false }))}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field field-span-2">
                  <label>{t("PWA Domains for this tracking link")}</label>
                  <CountryDropdownPicker
                    multiple
                    values={bindModal.selected}
                    onToggle={toggleBindDomain}
                    options={bindOptions}
                    placeholder={t("No domains selected")}
                    searchPlaceholder={t("Find domain")}
                    emptyResultsLabel={t("No domains available.")}
                  />
                  <p className="field-hint">{t("Only unbound domains and this link's domains are listed. Register PWA domains in the Domains section first.")}</p>
                </div>
                {bindModal.error ? <div className="field field-span-2"><div className="api-status error">{bindModal.error}</div></div> : null}
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={() => setBindModal((p) => ({ ...p, open: false }))}>{t("Cancel")}</button>
                <button className="action-pill" type="button" onClick={saveBind} disabled={bindModal.saving}>
                  {bindModal.saving ? t("Saving…") : t("Save binding")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {detail.open ? (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetail({ open: false, link: null, domain: null, pixels: [] })}>
            <motion.div
              className="modal flow-detail-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              {(() => {
                const link = detail.link || {};
                const dom = detail.domain || {};
                const pxs = detail.pixels || [];
                const geo = (dom.countries && dom.countries.length ? dom.countries : [dom.country]).filter(Boolean).join(", ") || link.geo || "—";
                const tracker = link.url || "";
                const finalLink = trafficLink(dom.domain, link.params);
                const seg = linkSegments(link);
                const geoList = normalizeCountryListValue(dom.country).length
                  ? normalizeCountryListValue(dom.country)
                  : splitGeos(seg.geo);
                const geoReadable = geoList.join(", ") || geo || "—";
                const inKeitaro = String(link.keitaro_status || "") === "created" || !!link.keitaro_id;
                const isActive = String(dom.status || "Active").toLowerCase() === "active";
                const filterCount = countLinkFilters(link);
                const createdAt = link.created_at ? new Date(link.created_at).toLocaleString() : "—";
                return (
                  <>
                    <div className="modal-head">
                      <div>
                        <p className="modal-kicker">{t("Detailed information")}</p>
                        <h2>{dom.domain || link.name}</h2>
                      </div>
                      <button className="icon-btn" type="button" onClick={() => setDetail({ open: false, link: null, domain: null, pixels: [] })}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="modal-body flow-detail-body">
                      {/* Identity summary — same chip language as the list entry */}
                      <div className="flow-detail-summary">
                        <span className="flow-detail-buyer">
                          <span className={`flow-state-dot${isActive ? " is-active" : " is-off"}`} />
                          {seg.buyer || t("Unassigned")}
                        </span>
                        {seg.tool ? <span className="flow-seg flow-seg-tool">{resolveBrandLogo(seg.tool) ? <BrandMark value={seg.tool} height={13} /> : <><Megaphone size={11} /> {seg.tool}</>}</span> : null}
                        {(dom.game || seg.game) ? <span className="flow-seg flow-seg-game"><Target size={11} /> {dom.game || seg.game}</span> : null}
                        {geoList.length ? (
                          <span className="flow-seg flow-seg-geo">
                            {geoList.map((g) => <CountryFlag key={g} value={g} />)}
                            {geoReadable}
                          </span>
                        ) : null}
                        {seg.brand ? <span className="flow-seg flow-seg-brand"><Tag size={11} /> {seg.brand}</span> : null}
                        <span className={`flow-kt${inKeitaro ? " is-live" : " is-local"}`}>
                          <span className="flow-kt-dot" />
                          {inKeitaro ? (
                            <><img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" />{link.keitaro_id ? ` #${link.keitaro_id}` : ""}</>
                          ) : t("Local")}
                        </span>
                      </div>

                      {/* Grouped, scannable detail */}
                      <div className="flow-detail-groups">
                        <section className="flow-detail-card">
                          <div className="flow-detail-card-head"><Link2 size={13} /> {t("Campaign")}</div>
                          <div className="flow-detail-list">
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Alias")}</span><span className="flow-detail-val is-mono">{link.alias || "—"}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Keitaro")}</span><span className="flow-detail-val">{link.keitaro_id ? <><img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" /> <span className="flow-detail-code">#{link.keitaro_id}</span> · {t(link.state || "active")}</> : t("Local only")}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Owner")}</span><span className="flow-detail-val">{link.owner_name || dom.owner_name || "—"}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Created")}</span><span className="flow-detail-val">{createdAt}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Filters")}</span><span className="flow-detail-val">{filterCount ? `${filterCount} ${filterCount === 1 ? t("rule") : t("rules")}` : t("None")}</span></div>
                          </div>
                        </section>
                        <section className="flow-detail-card">
                          <div className="flow-detail-card-head"><Globe size={13} /> {t("Domain & targeting")}</div>
                          <div className="flow-detail-list">
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("PWA domain")}</span><span className="flow-detail-val is-mono">{dom.domain || "—"}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Platform")}</span><span className="flow-detail-val"><BrandMark value={dom.platform} height={14} /></span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Application / Game")}</span><span className="flow-detail-val">{dom.game || seg.game || "—"}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("GEO")}</span><span className="flow-detail-val flow-detail-geoval">{geoList.map((g) => <CountryFlag key={g} value={g} />)}{geoReadable}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Status")}</span><span className="flow-detail-val"><span className={`accounts-status-pill acc-st-${String(dom.status || "Active").toLowerCase()}`}>{t(dom.status || "Active")}</span></span></div>
                          </div>
                        </section>
                      </div>

                      {/* Keitaro tracking URL */}
                      <div className="flow-detail-urlblock">
                        <div className="flow-detail-urlhead">
                          <span className="flow-detail-urllabel"><Link2 size={12} /> {t("Tracking link (Keitaro)")}</span>
                          {tracker ? (
                            <button className="flow-copy-btn" type="button" onClick={copyValue("tracker", tracker)}>
                              {copied === "tracker" ? <><CheckCircle size={12} /> {t("Copied")}</> : <><Copy size={12} /> {t("Copy")}</>}
                            </button>
                          ) : null}
                        </div>
                        <code className="flow-detail-url">{tracker || "—"}</code>
                      </div>

                      {/* Pixels */}
                      <section className="flow-detail-card">
                        <div className="flow-detail-card-head">
                          <Zap size={13} /> {t("Pixels on this domain")}
                          <span className="flow-detail-count">{pxs.length}</span>
                        </div>
                        {pxs.length ? (
                          <div className="flow-detail-pixels">
                            {pxs.map((p) => {
                              const pxActive = String(p.status || "Active").toLowerCase() === "active";
                              return (
                                <div className="flow-detail-pixel" key={p.id}>
                                  <span className={`flow-pixel-dot${pxActive ? " is-active" : " is-off"}`} />
                                  <span className="flow-detail-pixid">{p.pixel_id}</span>
                                  <CountryFlag value={p.geo} className="flow-pixel-flag" />
                                  <code className="flow-detail-token" title={p.token_eaag}>{maskToken(p.token_eaag)}</code>
                                  <button className="icon-btn flow-detail-copy" type="button" onClick={copyValue(`tok-${p.id}`, p.token_eaag)} title={t("Copy token")}>
                                    {copied === `tok-${p.id}` ? <CheckCircle size={13} /> : <Copy size={13} />}
                                  </button>
                                  {p.comment ? <span className="flow-detail-pixel-note">{p.comment}</span> : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="flow-detail-empty">{t("No pixels attached to this domain yet.")}</p>
                        )}
                      </section>

                      {/* The link the buyer uploads to their traffic source */}
                      <div className="flow-final-link">
                        <div className="flow-final-head">
                          <span>{t("Final link for traffic upload")}</span>
                          <button className="ghost" type="button" onClick={copyValue("final", finalLink)} disabled={!finalLink}>
                            {copied === "final" ? <><CheckCircle size={13} /> {t("Copied")}</> : <><Copy size={13} /> {t("Copy")}</>}
                          </button>
                        </div>
                        <code className="flow-final-url">{finalLink || t("Bind a PWA domain to see the upload link.")}</code>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {flowViz.open ? (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFlowViz({ open: false, link: null })}>
            <motion.div
              className="modal traffic-flow-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              {(() => {
                const link = flowViz.link || {};
                const linkDomains = link._domains || [];
                const pbd = link._pixelsByDomain || new Map();
                const allPixels = linkDomains.flatMap((d) => pbd.get(String(d.domain || "").toLowerCase()) || []);
                const filterCfg = (() => {
                  try {
                    const cfg = typeof link.filters === "string" ? JSON.parse(link.filters) : link.filters;
                    return cfg && Array.isArray(cfg.rules) ? cfg : { logic: "and", rules: [] };
                  } catch (e) {
                    return { logic: "and", rules: [] };
                  }
                })();
                const steps = [
                  {
                    key: "source", accent: "#36d07c", Icon: Megaphone,
                    title: t("Traffic Source"),
                    value: link.tool ? (resolveBrandLogo(link.tool) ? <BrandMark value={link.tool} height={18} /> : link.tool) : t("Your ad tool"),
                    desc: t("You buy traffic here and upload the PWA domain link to your ads."),
                  },
                  {
                    key: "pwa", accent: "#64b8ff", Icon: Globe,
                    title: t("PWA Domain"),
                    value: linkDomains.length ? linkDomains.map((d) => d.domain).join(", ") : t("No domain bound yet"),
                    desc: t("Visitors land on the PWA domain. Your Meta pixel fires here and reports the visit."),
                    chips: allPixels.map((p) => `#${p.pixel_id}`),
                  },
                  {
                    key: "tracker", accent: "#a15bff", Icon: Link2,
                    title: t("Tracking Link (Keitaro)"),
                    value: `${String(link.domain || "")}/${String(link.alias || "")}`,
                    desc: filterCfg.rules.length
                      ? t("Keitaro receives the click and applies your filters before routing.")
                      : t("Keitaro receives the click and routes it to the offer."),
                    chips: filterCfg.rules.map((r) => `${(TRACKING_FILTER_BY_NAME[r.name]?.label || r.name)} ${r.mode === "reject" ? "≠" : "="} ${(r.payload || []).join(",") || "✓"}`),
                  },
                  {
                    key: "offer", accent: "#36d07c", Icon: Target,
                    title: t("Offer"),
                    value: link.game || t("Your offer"),
                    desc: t("The visitor is redirected to the offer page — conversions flow back to your pixel."),
                  },
                ];
                return (
                  <>
                    <div className="modal-head traffic-flow-head">
                      <div className="traffic-flow-titlewrap">
                        <p className="modal-kicker">{t("Traffic Flow")}</p>
                        {(() => {
                          const parts = String(link.name || "").split("|").map((s) => s.trim()).filter(Boolean);
                          return (
                            <>
                              <h2>{parts[0] || link.name || t("Flow")}</h2>
                              {parts.length > 1 ? (
                                <div className="traffic-flow-tags">
                                  {parts.slice(1).map((p, i) => (
                                    <span className="traffic-flow-tag" key={i}>{p}</span>
                                  ))}
                                </div>
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                      <button className="icon-btn" type="button" onClick={() => setFlowViz({ open: false, link: null })}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="modal-body traffic-flow-body">
                      <p className="traffic-flow-intro">{t("How your traffic moves, step by step:")}</p>
                      <div className="traffic-steps">
                        {steps.map((step, i) => (
                          <div className="traffic-step" key={step.key} style={{ "--tf-accent": step.accent }}>
                            <div className="traffic-step-rail">
                              <span className="traffic-step-num"><step.Icon size={15} /></span>
                              {i < steps.length - 1 ? <span className="traffic-step-line" /> : null}
                            </div>
                            <div className="traffic-step-card">
                              <div className="traffic-step-title">{step.title}</div>
                              <div className="traffic-step-value">{step.value}</div>
                              <div className="traffic-step-desc">{step.desc}</div>
                              {step.chips && step.chips.length ? (
                                <div className="traffic-step-chips">
                                  {step.chips.map((c, ci) => (
                                    <span className="traffic-step-chip" key={ci}>{c}</span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div className="panel registry-dashboard-panel flows-registry-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><FlowsIcon size={20} /></span>
            <div>
              <h3 className="panel-title">{t("My Flows")}</h3>
              <p className="panel-subtitle">
                {t("Tracking link → PWA domains → pixels. Bind your domains to a link, then attach pixels to each domain.")}
              </p>
            </div>
          </div>
          <div className="panel-head-actions">
            {links.length ? (
              <div className="flow-sort" role="group" aria-label={t("Sort flows")}>
                <ArrowDownUp size={13} />
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`flow-sort-btn${sortBy === opt.value ? " is-active" : ""}`}
                    onClick={() => setSortBy(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}
            <span className="roles-count">{links.length} {t("links")}</span>
          </div>
        </div>

        {unboundDomains.length ? (
          <div className="flow-unbound-banner">
            <span className="flow-unbound-icon"><Globe size={16} /></span>
            <span className="flow-unbound-text">
              <strong>{unboundDomains.length}</strong>{" "}
              {unboundDomains.length === 1 ? t("PWA domain isn't bound to any tracking link yet.") : t("PWA domains aren't bound to any tracking link yet.")}
            </span>
            {sortedLinks.length ? (
              <button type="button" className="flow-unbound-cta" onClick={() => openBind(sortedLinks[0])}>
                <Plus size={13} strokeWidth={2.5} /> {t("Bind domains")}
              </button>
            ) : null}
          </div>
        ) : null}

        {state.loading ? (
          <div className="empty-state">{t("Loading flows…")}</div>
        ) : state.error ? (
          <div className="empty-state error">{state.error}</div>
        ) : links.length === 0 ? (
          <div className="empty-state">{t("No tracking links yet. Create one in Tracking Links first.")}</div>
        ) : (
          <div className="flow-tree">
            {sortedLinks.map((link) => {
              const linkDomains = [...(domainsByLink.get(link.id) || [])].sort((a, b) =>
                String(a.domain || "").localeCompare(String(b.domain || ""))
              );
              const isOpen = expanded[link.id] !== false;
              const totalPixels = linkDomains.reduce(
                (acc, d) => acc + (pixelsByDomain.get(String(d.domain || "").toLowerCase()) || []).length,
                0
              );
              const seg = linkSegments(link);
              const geos = splitGeos(seg.geo);
              const filterCount = countLinkFilters(link);
              const isActive = String(link.state || "active") === "active";
              const inKeitaro = String(link.keitaro_status || "") === "created" || !!link.keitaro_id;
              const linkUrl = `${String(link.domain || "")}/${String(link.alias || "")}`;
              const createdAt = link.created_at
                ? new Date(link.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
                : "";
              return (
                <div className={`flow-card${isOpen ? " is-open" : ""}`} key={link.id}>
                  <div className="flow-card-head">
                    <button
                      type="button"
                      className="flow-card-toggle"
                      onClick={() => setExpanded((prev) => ({ ...prev, [link.id]: !isOpen }))}
                      aria-expanded={isOpen}
                      title={link.name}
                    >
                      <span className={`flow-chevron${isOpen ? " is-open" : ""}`}><ChevronRight size={16} /></span>
                      <span className={`flow-avatar${isActive ? " is-active" : ""}`} aria-hidden="true">{(seg.buyer || "?").trim().charAt(0).toUpperCase() || "?"}</span>
                      <span className="flow-buyer">{seg.buyer || t("Unassigned")}</span>
                      {(seg.tool || seg.game) ? (
                        <span className="flow-card-campaign">
                          {seg.tool ? (resolveBrandLogo(seg.tool) ? <BrandMark value={seg.tool} height={12} /> : seg.tool) : null}
                          {seg.tool && seg.game ? <span className="flow-card-sep"> · </span> : null}
                          {seg.game || null}
                        </span>
                      ) : null}
                    </button>
                    <div className="flow-card-head-right">
                      <span className={`flow-status-pill flow-status-${isActive ? "on" : "off"}`}>{isActive ? t("Active") : t("Paused")}</span>
                      <span className={`flow-kt${inKeitaro ? " is-live" : " is-local"}`} title={inKeitaro ? t("Live in Keitaro") : t("Stored locally")}>
                        <span className="flow-kt-dot" />{inKeitaro ? <img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" /> : t("Local")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`flow-card-link${copied === `link-${link.id}` ? " is-copied" : ""}`}
                    title={t("Copy tracking link")}
                    onClick={copyValue(`link-${link.id}`, link.url || `https://${linkUrl}`)}
                  >
                    <Link2 size={13} className="flow-card-link-icon" />
                    <span className="flow-card-link-url">{linkUrl}</span>
                    {copied === `link-${link.id}` ? <CheckCircle size={13} /> : <Copy size={13} />}
                  </button>

                  <div className="flow-card-meta">
                    {geos.length ? (
                      <span className="flow-meta-item">{geos.map((g) => <CountryFlag key={g} value={g} />)}{geos.join(", ")}</span>
                    ) : null}
                    {seg.brand ? <span className="flow-meta-item"><Tag size={11} /> {seg.brand}</span> : null}
                    <span className="flow-meta-item"><Globe size={11} /> {linkDomains.length} {linkDomains.length === 1 ? t("domain") : t("domains")}</span>
                    <span className="flow-meta-item"><Zap size={11} /> {totalPixels} {totalPixels === 1 ? t("pixel") : t("pixels")}</span>
                    {filterCount ? <span className="flow-meta-item"><SlidersHorizontal size={11} /> {filterCount} {filterCount === 1 ? t("filter") : t("filters")}</span> : null}
                    {createdAt ? <span className="flow-meta-item flow-meta-muted"><CalendarIcon size={11} /> {createdAt}</span> : null}
                  </div>

                  {isOpen ? (
                    <div className="flow-card-tree">
                      {linkDomains.length === 0 ? (
                        <div className="flow-empty">
                          <Globe size={14} />
                          <span>{t("No domains bound yet.")}</span>
                          <button type="button" className="flow-empty-cta" onClick={() => openBind(link)}>{t("Bind domains")}</button>
                        </div>
                      ) : (
                        linkDomains.map((domain) => {
                          const dPixels = [...(pixelsByDomain.get(String(domain.domain || "").toLowerCase()) || [])].sort((a, b) =>
                            String(a.pixel_id || "").localeCompare(String(b.pixel_id || ""), undefined, { numeric: true })
                          );
                          const dStatus = String(domain.status || "Active");
                          const dGeos = normalizeCountryListValue(domain.country);
                          return (
                            <div className="flow-node-domain" key={domain.id}>
                              <div className="flow-node-body">
                                <span className="flow-node-icon"><Globe size={14} /></span>
                                <span className="flow-node-name">{domain.domain}</span>
                                {domain.platform ? (resolveBrandLogo(domain.platform) ? <BrandMark value={domain.platform} height={13} /> : <span className="flow-node-tag">{domain.platform}</span>) : null}
                                {dGeos.length ? (
                                  <span className="flow-node-geos" title={dGeos.join(", ")}>
                                    {dGeos.slice(0, 3).map((g) => <CountryFlag key={g} value={g} />)}
                                    {dGeos.length > 3 ? <span className="flow-domain-geo-more">+{dGeos.length - 3}</span> : null}
                                  </span>
                                ) : null}
                                <span className={`accounts-status-pill acc-st-${dStatus.toLowerCase()}`}>{t(dStatus)}</span>
                                <button type="button" className="icon-btn flow-node-detail" aria-label={t("Detailed information")} data-tip={t("Details")} onClick={() => setDetail({ open: true, link, domain, pixels: dPixels })}>
                                  <Eye size={14} />
                                </button>
                              </div>
                              {dPixels.length ? (
                                <div className="flow-node-pixels">
                                  {dPixels.map((pixel) => {
                                    const pxActive = String(pixel.status || "Active").toLowerCase() === "active";
                                    return (
                                      <span className="flow-node-pixel" key={pixel.id} title={pixel.comment || ""}>
                                        <span className={`flow-pixel-dot${pxActive ? " is-active" : " is-off"}`} />
                                        <Zap size={11} className="flow-pixel-icon" />
                                        <span className="flow-pixel-id">{pixel.pixel_id}</span>
                                        <CountryFlag value={pixel.geo} className="flow-pixel-flag" />
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="flow-node-pixels-empty">{t("No pixels on this domain — add one in Pixels.")}</div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : null}

                  <div className="flow-card-actions">
                    <button type="button" className="flow-action-primary" onClick={() => openBind(link)}>
                      <Plus size={14} strokeWidth={2.5} /> {t("Bind domains")}
                    </button>
                    <button type="button" className="flow-action-ghost" onClick={() => setFlowViz({ open: true, link: { ...link, _domains: linkDomains, _pixelsByDomain: pixelsByDomain } })}>
                      <Zap size={13} /> {t("Traffic flow")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function UtmBuilder() {
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
  const handleCountryChange = (country) => {
    const iso = (resolveCountryIso(country) || "").toUpperCase();
    setUtm((prev) => {
      const nextSubs = [...prev.subs];
      if (iso) nextSubs[GEO_SUB_INDEX] = iso;
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
    const name = window.prompt("Preset name", "");
    if (!name || !name.trim()) return;
    const snapshot = {
      name: name.trim(),
      tool: utm.tool,
      fbp: utm.fbp,
      subs: [...utm.subs],
    };
    setPresets((prev) => [snapshot, ...prev.filter((p) => p.name !== snapshot.name)].slice(0, 12));
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
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div className="panel-head-title">
              <span className="panel-icon-badge"><Link2 size={20} /></span>
              <div>
                <h3 className="panel-title">UTM Builder</h3>
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
                  title={focusedField ? `Insert into ${focusedField === "fbp" ? "Meta Pixel" : focusedField === "domain" ? "Domain" : focusedField.replace("sub-", "sub")}` : "Focus a field first"}
                  onMouseDown={(e) => { e.preventDefault(); insertMacro(macro); }}
                >
                  {macro}
                </button>
              ))}
            </div>
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
              const isGeo = index === GEO_SUB_INDEX;
              return (
                <div className={`field${aliased ? " utm-field-aliased" : ""}`} key={`sub-${index}`}>
                  <label>
                    {labelText}
                    {isGeo ? <span className="field-pace-hint">geo</span> : null}
                  </label>
                  <input
                    type="text"
                    placeholder={labelText}
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
            <button type="button" className="utm-preset-save" onClick={savePreset}>
              <Plus size={13} /> Save preset
            </button>
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
                        [r.tool || "", r.country || "", (r.params || []).join(" "), r.createdAt || "", `"${(r.url || "").replace(/"/g, '""')}"`].join(",")
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

function StatisticsDashboard({ authUser, viewerBuyer, filters }) {
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "DeusInsta";
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";
  const globalUserDomainFilter = filters?.userDomain || "All";
  const globalUserCampaignFilter = filters?.userCampaign || "All";
  const globalUserExternalIdFilter = filters?.userExternalId || "";
  const globalUserMinRevenue = Number(filters?.userMinRevenue || 0);
  const globalUserMinFtds = Number(filters?.userMinFtds || 0);
  const globalUserMinRedeposits = Number(filters?.userMinRedeposits || 0);
  const globalUserRevenueOnly = Boolean(filters?.userRevenueOnly);
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const [statsForm, setStatsForm] = React.useState({
    date: "2026-02-07",
    buyer: effectiveBuyer,
    country: defaultCountryOption,
    spend: "",
    clicks: "",
    installs: "",
    registers: "",
    ftds: "",
  });
  const [statsEntries, setStatsEntries] = React.useState([]);
  const [statsState, setStatsState] = React.useState({ loading: true, error: null });
  const [buyerFilter, setBuyerFilter] = React.useState(isLeadership ? "All" : effectiveBuyer);
  const [showAllStatsRows, setShowAllStatsRows] = React.useState(false);
  const [statsOverviewFilters, setStatsOverviewFilters] = React.useState(["ftds"]);

  const updateStatsForm = (key) => (event) => {
    setStatsForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetStatsForm = () => {
    setStatsForm({
      date: "2026-02-07",
      buyer: effectiveBuyer,
      country: defaultCountryOption,
      spend: "",
      clicks: "",
      installs: "",
      registers: "",
      ftds: "",
    });
  };

  React.useEffect(() => {
    if (!isLeadership && effectiveBuyer) {
      setStatsForm((prev) => ({ ...prev, buyer: effectiveBuyer }));
      setBuyerFilter(effectiveBuyer);
    }
  }, [effectiveBuyer, isLeadership]);

  const fetchStats = React.useCallback(async () => {
    const isoRe = /^\d{4}-\d{2}-\d{2}$/;
    const from = isoRe.test(filters?.dateFrom || "") ? filters.dateFrom : "";
    const to = isoRe.test(filters?.dateTo || "") ? filters.dateTo : "";
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    const liveUrl = `/api/keitaro/live-stats${qs.toString() ? `?${qs}` : ""}`;
    const cacheKey = `live-stats:${qs.toString()}`;
    const cached = readSwrCache(cacheKey);

    if (cached && Array.isArray(cached)) {
      setStatsEntries(cached);
      setStatsState({ loading: false, error: null });
    } else {
      setStatsState({ loading: true, error: null });
    }

    try {
      let rows = null;
      // Primary path: live, aggregated data straight from Keitaro.
      const response = await apiFetch(liveUrl);
      if (response.ok) {
        const data = await response.json();
        rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        // Fallback to the synced table when the live endpoint is unavailable
        // (e.g. backend not yet redeployed).
        const fb = await apiFetch("/api/media-stats?limit=100000");
        if (!fb.ok) throw new Error("Failed to load media buyer stats.");
        const fbData = await fb.json();
        rows = Array.isArray(fbData) ? fbData : [];
      }
      writeSwrCache(cacheKey, rows);
      setStatsEntries(rows);
      setStatsState({ loading: false, error: null });
    } catch (error) {
      if (!cached) {
        setStatsState({ loading: false, error: error.message || "Failed to load stats." });
      }
    }
  }, [filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchStats]);

  const handleStatsSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/media-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statsForm),
      });
      if (!response.ok) {
        throw new Error("Failed to save stats entry.");
      }
      await fetchStats();
      resetStatsForm();
    } catch (error) {
      setStatsState({ loading: false, error: error.message || "Failed to save stats entry." });
    }
  };

  const sum = (value) => Number(value || 0);
  const readNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };
  const readRevenue = (row) => {
    const direct = readNumeric(row?.revenue);
    const ftd = readNumeric(row?.ftdRevenue ?? row?.ftd_revenue);
    const redeposit = readNumeric(row?.redepositRevenue ?? row?.redeposit_revenue);
    if (direct === 0 && (ftd > 0 || redeposit > 0)) return ftd + redeposit;
    return direct || ftd + redeposit;
  };

  const normalizedEntries = React.useMemo(() => {
    const map = new Map();
    statsEntries.forEach((row) => {
      const date = String(row.date || "");
      const buyer = String(row.buyer || "");
      const country = String(row.country || "");
      const key = `${date}|${buyer}|${country}`;
      if (!map.has(key)) {
        map.set(key, {
          id: row.id,
          date,
          buyer,
          country,
          spend: 0,
          clicks: 0,
          uniqueClicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
        });
      }
      const current = map.get(key);
      current.spend += sum(row.spend);
      current.clicks += sum(row.clicks);
      current.uniqueClicks += sum(row.unique_clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += readRevenue(row);
      if (!current.id && row.id) current.id = row.id;
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateSort = String(b.date || "").localeCompare(String(a.date || ""));
      if (dateSort !== 0) return dateSort;
      return (b.id || 0) - (a.id || 0);
    });
  }, [statsEntries]);

  const buyers = isLeadership
    ? Array.from(
        new Set(["All", ...buyerOptions, ...normalizedEntries.map((row) => row.buyer).filter(Boolean)])
      )
    : [effectiveBuyer].filter(Boolean);
  const filteredEntries = normalizedEntries.filter((row) => {
    if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
      return false;
    }
    if (
      isLeadership &&
      !isAllSelection(buyerFilter) &&
      !String(row.buyer || "").toLowerCase().includes(String(buyerFilter).toLowerCase())
    ) {
      return false;
    }
    if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
    if (!isDateInRange(row.date, globalDateRange)) return false;
    return true;
  });

  React.useEffect(() => {
    setShowAllStatsRows(false);
  }, [buyerFilter, globalBuyerFilter, globalCountryFilter, globalDateRange.from, globalDateRange.to]);

  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const toCost = (spend, denom) => {
    if (!spend || spend <= 0) return null;
    const value = safeDivide(spend, denom);
    return value === null ? null : value;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCost = (value) =>
    value === null || Number.isNaN(value) ? "—" : formatCurrency(value);

  const totals = filteredEntries.reduce(
    (acc, row) => ({
      spend: acc.spend + sum(row.spend),
      clicks: acc.clicks + sum(row.clicks),
      uniqueClicks: acc.uniqueClicks + sum(row.uniqueClicks),
      installs: acc.installs + sum(row.installs),
      registers: acc.registers + sum(row.registers),
      ftds: acc.ftds + sum(row.ftds),
      redeposits: acc.redeposits + sum(row.redeposits),
      revenue: acc.revenue + sum(row.revenue),
    }),
    { spend: 0, clicks: 0, uniqueClicks: 0, installs: 0, registers: 0, ftds: 0, redeposits: 0, revenue: 0 }
  );

  const isStatsSingleDayRange = Boolean(
    globalDateRange.from &&
      globalDateRange.to &&
      String(globalDateRange.from) === String(globalDateRange.to)
  );
  const getStatsBucket = React.useCallback(
    (row) => {
      const dateValue = String(row?.date || "");
      const createdAtValue = String(row?.created_at || row?.createdAt || "");
      if (!isStatsSingleDayRange) {
        const base = dateValue.split(" ")[0];
        return { key: base, label: formatShortDate(base), sortKey: base };
      }
      const parseTimestamp = (value) => {
        if (!value) return null;
        const normalized = value.includes("T") ? value : value.replace(" ", "T");
        const parsed = new Date(normalized);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      };
      const stamp = parseTimestamp(createdAtValue) || parseTimestamp(dateValue);
      if (!stamp) return { key: "00:00", label: "00:00", sortKey: "00:00" };
      const hour = String(stamp.getHours()).padStart(2, "0");
      return { key: `${hour}:00`, label: `${hour}:00`, sortKey: `${hour}:00` };
    },
    [isStatsSingleDayRange]
  );

  const filteredRawEntries = React.useMemo(
    () =>
      statsEntries.filter((row) => {
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (
          isLeadership &&
          !isAllSelection(buyerFilter) &&
          !String(row.buyer || "").toLowerCase().includes(String(buyerFilter).toLowerCase())
        ) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        if (!isDateInRange(row.date, globalDateRange)) return false;
        return true;
      }),
    [
      statsEntries,
      globalBuyerFilter,
      effectiveBuyer,
      isLeadership,
      buyerFilter,
      globalCountryFilter,
      globalDateRange.from,
      globalDateRange.to,
    ]
  );

  const statsOverviewData = React.useMemo(() => {
    const map = new Map();
    filteredRawEntries.forEach((row) => {
      const bucket = getStatsBucket(row);
      if (!bucket?.key) return;
      if (!map.has(bucket.key)) {
        map.set(bucket.key, {
          bucket: bucket.key,
          label: bucket.label,
          sortKey: bucket.sortKey,
          clicks: 0,
          registrations: 0,
          ftds: 0,
          redeposits: 0,
          spend: 0,
          revenue: 0,
          roi: null,
        });
      }
      const current = map.get(bucket.key);
      current.clicks += sum(row.clicks);
      current.installs += sum(row.installs);
      current.registrations += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.spend += sum(row.spend);
      current.revenue += readRevenue(row);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey)))
      .map((item) => ({
        ...item,
        c2i: toPercent(item.installs, item.clicks),
        c2reg: toPercent(item.registrations, item.clicks),
        c2dep: toPercent(item.ftds, item.clicks),
        epc: safeDivide(item.revenue, item.clicks),
        i2reg: toPercent(item.registrations, item.installs),
        i2dep: toPercent(item.ftds, item.installs),
        reg2dep: toPercent(item.ftds, item.registrations),
        dep2red: toPercent(item.redeposits, item.ftds),
        roi: item.spend > 0 ? ((item.revenue - item.spend) / item.spend) * 100 : null,
      }));
  }, [filteredRawEntries, getStatsBucket]);

  const statsOverviewOptions = React.useMemo(
    () => [
      { key: "ftds", label: "FTDs", color: "var(--green)", type: "count" },
      { key: "c2i", label: "Click2Install", color: "#58b1ff", type: "percent" },
      { key: "c2reg", label: "Click2Reg", color: "#8e5bff", type: "percent" },
      { key: "c2dep", label: "Click2Dep", color: "#3ddc97", type: "percent" },
      { key: "epc", label: "EPC", color: "#ffd86b", type: "currency" },
      { key: "i2reg", label: "Install2Reg", color: "#24c5d4", type: "percent" },
      { key: "i2dep", label: "Install2Dep", color: "#00d18c", type: "percent" },
      { key: "reg2dep", label: "Reg2Dep", color: "#ff9d57", type: "percent" },
      { key: "dep2red", label: "Dep2Red", color: "#ff6f91", type: "percent" },
    ],
    []
  );
  const activeStatsOverviewMetrics = statsOverviewOptions.filter((metric) =>
    statsOverviewFilters.includes(metric.key)
  );
  const toggleStatsOverviewMetric = (key) => {
    setStatsOverviewFilters((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };
  const formatStatsOverviewValue = (value, type) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    if (type === "currency") return formatCurrency(value);
    if (type === "percent") return fmtPercent(value);
    return Number(value).toLocaleString();
  };
  const statsOverviewPeak = React.useMemo(
    () => statsOverviewData.reduce((max, item) => Math.max(max, item.ftds || 0), 0),
    [statsOverviewData]
  );
  const statsOverviewAvg =
    statsOverviewData.length > 0
      ? statsOverviewData.reduce((acc, item) => acc + (item.ftds || 0), 0) / statsOverviewData.length
      : 0;

  const uc = totals.uniqueClicks;
  const ucSub = (num, formatter) =>
    uc > 0 ? { value: formatter(num, uc), label: "on unique" } : null;
  const statsKpis = [
    { label: "Click2Install", value: fmtPercent(toPercent(totals.installs, totals.clicks)), meta: "Rate", sub: ucSub(totals.installs, (n, d) => fmtPercent(toPercent(n, d))) },
    { label: "Click2Reg", value: fmtPercent(toPercent(totals.registers, totals.clicks)), meta: "Rate", sub: ucSub(totals.registers, (n, d) => fmtPercent(toPercent(n, d))) },
    { label: "Click2Dep", value: fmtPercent(toPercent(totals.ftds, totals.clicks)), meta: "Rate", sub: ucSub(totals.ftds, (n, d) => fmtPercent(toPercent(n, d))) },
    { label: "EPC", value: fmtCost(safeDivide(totals.revenue, totals.clicks)), meta: "Revenue per click", sub: uc > 0 ? { value: fmtCost(safeDivide(totals.revenue, uc)), label: "per unique" } : null },
    { label: "Install2Reg", value: fmtPercent(toPercent(totals.registers, totals.installs)), meta: "Rate" },
    { label: "Install2Dep", value: fmtPercent(toPercent(totals.ftds, totals.installs)), meta: "Rate" },
    { label: "Reg2Dep", value: fmtPercent(toPercent(totals.ftds, totals.registers)), meta: "Rate" },
    { label: "Dep2Red", value: fmtPercent(toPercent(totals.redeposits, totals.ftds)), meta: "Rate" },
  ];

  const chartMap = new Map();
  filteredEntries.forEach((row) => {
    const key = row.date;
    if (!chartMap.has(key)) {
      chartMap.set(key, {
        date: key,
        spend: 0,
        clicks: 0,
        installs: 0,
        registers: 0,
        ftds: 0,
      });
    }
    const current = chartMap.get(key);
    current.spend += sum(row.spend);
    current.clicks += sum(row.clicks);
    current.installs += sum(row.installs);
    current.registers += sum(row.registers);
    current.ftds += sum(row.ftds);
  });

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      ...row,
      c2i: toPercent(row.installs, row.clicks),
      c2r: toPercent(row.registers, row.clicks),
      c2f: toPercent(row.ftds, row.clicks),
      r2d: toPercent(row.ftds, row.registers),
      cpc: toCost(row.spend, row.clicks),
      cpr: toCost(row.spend, row.registers),
      cpp: toCost(row.spend, row.ftds),
    }));

  const volumeMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.clicks || 0, row.registers || 0, row.ftds || 0))
  );
  const rateMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.c2r || 0, row.r2d || 0, row.c2f || 0))
  );
  const costMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.cpc || 0, row.cpr || 0, row.cpp || 0))
  );

  const volumeDomainMax = volumeMax > 0 ? Math.ceil(volumeMax * 1.15) : 10;
  const rateDomainMax = Math.min(100, Math.max(10, Math.ceil((rateMax || 0) / 5) * 5));
  const costDomainMax = costMax > 0 ? Math.ceil(costMax * 1.2) : 10;
  const [statsTableSort, setStatsTableSort] = React.useState({ key: "ftds", dir: "desc" });
  const toggleStatsSort = (key) => {
    setStatsTableSort((prev) => toggleSortConfig(prev, key, "desc"));
  };
  const getStatsSortValue = (row, key) => {
    switch (key) {
      case "date":
        return String(row.date || "");
      case "buyer":
        return String(row.buyer || "");
      case "country":
        return String(row.country || "");
      case "spend":
        return sum(row.spend);
      case "clicks":
        return sum(row.clicks);
      case "installs":
        return sum(row.installs);
      case "registers":
        return sum(row.registers);
      case "ftds":
        return sum(row.ftds);
      case "c2i":
        return toPercent(sum(row.installs), sum(row.clicks));
      case "c2r":
        return toPercent(sum(row.registers), sum(row.clicks));
      case "c2ftd":
        return toPercent(sum(row.ftds), sum(row.clicks));
      case "r2d":
        return toPercent(sum(row.ftds), sum(row.registers));
      case "cpc":
        return toCost(sum(row.spend), sum(row.clicks));
      case "cpi":
        return toCost(sum(row.spend), sum(row.installs));
      case "cpr":
        return toCost(sum(row.spend), sum(row.registers));
      case "cpp":
        return toCost(sum(row.spend), sum(row.ftds));
      default:
        return null;
    }
  };
  const statsSortType = (key) =>
    key === "date" ? "date" : key === "buyer" || key === "country" ? "text" : "number";
  const sortedEntries = React.useMemo(() => {
    const rows = [...filteredEntries];
    return rows.sort((a, b) =>
      compareSortValues(
        getStatsSortValue(a, statsTableSort.key),
        getStatsSortValue(b, statsTableSort.key),
        statsTableSort.dir,
        statsSortType(statsTableSort.key)
      )
    );
  }, [filteredEntries, statsTableSort]);
  const visibleEntries = showAllStatsRows ? sortedEntries : sortedEntries.slice(0, 10);

  return (
    <>
      <section className="cards">
        {[ 
          { label: "Total Spend", value: fmtCost(totals.spend), meta: "Filtered view" },
          { label: "Total Clicks", value: totals.clicks.toLocaleString(), meta: "Filtered view" },
          { label: "Total Registers", value: totals.registers.toLocaleString(), meta: "Filtered view" },
          { label: "Total FTDs", value: totals.ftds.toLocaleString(), meta: "Filtered view" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="card-head">{stat.label}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{stat.meta}</div>
          </motion.div>
        ))}
      </section>

      <section className="cards stats-secondary">
        {statsKpis.map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card stats-kpi-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + idx * 0.05, duration: 0.45 }}
          >
            <div className="card-head">{stat.label}</div>
            <div className="card-value">{stat.value}</div>
            {stat.sub ? (
              <div className="card-sub">
                <span className="card-sub-dot" />
                <span className="card-sub-value">{stat.sub.value}</span>
                <span className="card-sub-label">{stat.sub.label}</span>
              </div>
            ) : null}
            <div className="card-meta">{stat.meta}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels panels-single">
        <motion.div
          className="panel ftd-volume-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Overview</h3>
              <p className="panel-subtitle">
                {isStatsSingleDayRange ? "Performance by hour" : "Performance by date"}
              </p>
            </div>
            <div className="summary-inline">
              <span>{`Peak: ${Math.round(statsOverviewPeak).toLocaleString()}`}</span>
              <span>{`${isStatsSingleDayRange ? "Avg/hour" : "Avg/day"}: ${statsOverviewAvg.toFixed(2)}`}</span>
            </div>
          </div>
          <div className="chart">
            <div className="chart-surface">
              {statsOverviewData.length ? (
                activeStatsOverviewMetrics.length ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={statsOverviewData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        {activeStatsOverviewMetrics.map((metric) => (
                          <linearGradient
                            key={metric.key}
                            id={`stats-overview-gradient-${metric.key}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor={metric.color} stopOpacity={0.34} />
                            <stop offset="100%" stopColor={metric.color} stopOpacity={0.02} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#7f848f"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8b909a", fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#7f848f"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8b909a", fontSize: 11 }}
                        width={40}
                        tickFormatter={formatVolumeAxis}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#7f848f"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8b909a", fontSize: 11 }}
                        width={44}
                        tickFormatter={(value) => `${Math.round(value)}%`}
                      />
                      <Tooltip
                        cursor={{ stroke: "rgba(69, 226, 205, 0.28)", strokeWidth: 1 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="chart-tooltip ftd-volume-tooltip" style={tooltipStyle}>
                              <p className="tooltip-label">{label}</p>
                              {payload.map((item) => {
                                const metric = statsOverviewOptions.find(
                                  (entry) => entry.key === item.dataKey
                                );
                                if (!metric) return null;
                                return (
                                  <div className="tooltip-row" key={item.dataKey}>
                                    <span className="tooltip-dot" style={{ background: metric.color }} />
                                    <span>{metric.label}</span>
                                    <span className="tooltip-value">
                                      {formatStatsOverviewValue(item.value, metric.type)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                      {activeStatsOverviewMetrics.map((metric) => (
                        <Area
                          key={metric.key}
                          type="natural"
                          dataKey={metric.key}
                          name={metric.label}
                          yAxisId={metric.type === "percent" ? "right" : "left"}
                          stroke={metric.color}
                          strokeWidth={2.1}
                          fill={`url(#stats-overview-gradient-${metric.key})`}
                          dot={{ r: 2.4, fill: metric.color, stroke: "#0f1216", strokeWidth: 1.2 }}
                          activeDot={{ r: 4, fill: "#0f1216", stroke: metric.color, strokeWidth: 1.8 }}
                          isAnimationActive
                          animationDuration={700}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">Select at least one metric filter.</div>
                )
              ) : (
                <div className="empty-state">No overview data available.</div>
              )}
            </div>
            <div className="overview-filters">
              {statsOverviewOptions.map((metric) => {
                const active = statsOverviewFilters.includes(metric.key);
                return (
                  <button
                    type="button"
                    key={metric.key}
                    className={`overview-filter${active ? " is-active" : ""}`}
                    onClick={() => toggleStatsOverviewMetric(metric.key)}
                    style={
                      active
                        ? {
                            borderColor: metric.color,
                            color: metric.color,
                            boxShadow: `inset 0 0 0 1px ${metric.color}33`,
                          }
                        : undefined
                    }
                  >
                    <span className="overview-filter-dot" style={{ background: metric.color }} />
                    {metric.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Media Buyer Funnel Log</h3>
              <p className="panel-subtitle">Calculated funnel metrics per entry.</p>
            </div>
            {isLeadership ? (
              <Select
                value={buyerFilter}
                onChange={(v) => setBuyerFilter(v)}
                options={buyers.map((buyer) => ({ value: buyer, label: buyer }))}
                placeholder="Select buyer"
                searchPlaceholder="Find buyer"
              />
            ) : (
              <div className="select select-static">{effectiveBuyer}</div>
            )}
          </div>

          {statsState.loading ? (
            <div className="empty-state">Loading entries…</div>
          ) : statsState.error ? (
            <div className="empty-state error">{statsState.error}</div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-state">No entries yet. Add your first stats row above.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="entries-table stats-table">
                  <thead>
                    <tr>
                      {[
                        { key: "date", label: "Date" },
                        { key: "buyer", label: "Buyer" },
                        { key: "country", label: "Country" },
                        { key: "spend", label: "Spend" },
                        { key: "clicks", label: "Clicks" },
                        { key: "installs", label: "Installs" },
                        { key: "registers", label: "Registers" },
                        { key: "ftds", label: "FTDs" },
                        { key: "c2i", label: "C2I" },
                        { key: "c2r", label: "C2R" },
                        { key: "c2ftd", label: "C2FTD" },
                        { key: "r2d", label: "R2D" },
                        { key: "cpc", label: "CPC" },
                        { key: "cpi", label: "CPI" },
                        { key: "cpr", label: "CPR" },
                        { key: "cpp", label: "CPP" },
                      ].map((col) => {
                        const isActive = statsTableSort.key === col.key;
                        return (
                          <th key={col.key}>
                            <button
                              type="button"
                              className={`sortable-header ${isActive ? "active" : ""}`}
                              onClick={() => toggleStatsSort(col.key)}
                            >
                              {col.label}
                              <span className="sort-indicator">
                                {getSortIndicator(statsTableSort, col.key)}
                              </span>
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEntries.map((row) => {
                      const spend = sum(row.spend);
                      const clicks = sum(row.clicks);
                      const installs = sum(row.installs);
                      const registers = sum(row.registers);
                      const ftds = sum(row.ftds);
                      const c2i = toPercent(installs, clicks);
                      const c2r = toPercent(registers, clicks);
                      const c2f = toPercent(ftds, clicks);
                      const r2d = toPercent(ftds, registers);
                      const cpc = toCost(spend, clicks);
                      const cpi = toCost(spend, installs);
                      const cpr = toCost(spend, registers);
                      const cpp = toCost(spend, ftds);

                      return (
                        <tr key={`${row.id || "stat"}-${row.date}-${row.buyer}-${row.country || ""}`}>
                          <td>{row.date}</td>
                          <td>{row.buyer}</td>
                          <td>{row.country || "—"}</td>
                          <td>{spend ? formatCurrency(spend) : "—"}</td>
                          <td>{clicks.toLocaleString()}</td>
                          <td>{installs ? installs.toLocaleString() : "—"}</td>
                          <td>{registers.toLocaleString()}</td>
                          <td>{ftds.toLocaleString()}</td>
                          <td>{fmtPercent(c2i)}</td>
                          <td>{fmtPercent(c2r)}</td>
                          <td>{fmtPercent(c2f)}</td>
                          <td>{fmtPercent(r2d)}</td>
                          <td>{fmtCost(cpc)}</td>
                          <td>{fmtCost(cpi)}</td>
                          <td>{fmtCost(cpr)}</td>
                          <td>{fmtCost(cpp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {sortedEntries.length > 10 ? (
                <div className="api-actions" style={{ marginTop: 10 }}>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => setShowAllStatsRows((prev) => !prev)}
                  >
                    {showAllStatsRows ? "Show Less" : "See More"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </motion.div>
      </section>

      <section className="panels stats-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Volume Trend</h3>
              <p className="panel-subtitle">Clicks, registers, and FTDs over time.</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="statsVolumeClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickMargin={10}
                  minTickGap={16}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={axisTickStyle}
                  domain={[0, volumeDomainMax]}
                  tickFormatter={formatVolumeAxis}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatShortDate}
                  formatter={(value, name) => [value?.toLocaleString?.() ?? value, name]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="var(--blue)"
                  strokeWidth={2}
                  fill="url(#statsVolumeClicks)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="registers"
                  name="Registers"
                  stroke="var(--purple)"
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="ftds"
                  name="FTDs"
                  stroke="var(--green)"
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Funnel Rates</h3>
              <p className="panel-subtitle">Conversion rates per day.</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="statsRateC2R" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="statsRateR2D" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="statsRateC2F" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--orange)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickMargin={10}
                  minTickGap={16}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={axisTickStyle}
                  domain={[0, rateDomainMax]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatShortDate}
                  formatter={(value, name) => [fmtPercent(value), name]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="c2r"
                  name="Click2Register"
                  stroke="var(--purple)"
                  strokeWidth={2}
                  fill="url(#statsRateC2R)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="r2d"
                  name="Reg2Dep"
                  stroke="var(--green)"
                  strokeWidth={2}
                  fill="url(#statsRateR2D)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="c2f"
                  name="Click2FTD"
                  stroke="var(--orange)"
                  strokeWidth={2}
                  fill="url(#statsRateC2F)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Cost Metrics</h3>
              <p className="panel-subtitle">Cost per click, register, and FTD.</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 24, left: 4, bottom: 4 }}
                barCategoryGap={18}
                barGap={6}
              >
                <defs>
                  <linearGradient id="statsCostCpc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.25} />
                  </linearGradient>
                  <linearGradient id="statsCostCpr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.25} />
                  </linearGradient>
                  <linearGradient id="statsCostCpp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickMargin={10}
                  minTickGap={16}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tick={axisTickStyle}
                  domain={[0, costDomainMax]}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatShortDate}
                  formatter={(value, name) => [fmtCost(value), name]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                />
                <Bar dataKey="cpc" name="CPC" fill="url(#statsCostCpc)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                <Bar dataKey="cpr" name="CPR" fill="url(#statsCostCpr)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                <Bar dataKey="cpp" name="CPP" fill="url(#statsCostCpp)" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>
    </>
  );
}

function PlacementsDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [placementEntries, setPlacementEntries] = React.useState([]);
  const [placementState, setPlacementState] = React.useState({ loading: true, error: null });
  const [placementFilter, setPlacementFilter] = React.useState("All placements");

  const fetchPlacements = React.useCallback(async () => {
    const isoRe = /^\d{4}-\d{2}-\d{2}$/;
    const gr = normalizeDateRange(filters?.dateFrom, filters?.dateTo);
    const pr = getPeriodDateRange(period, customRange);
    const eff = gr.from || gr.to ? gr : pr;
    const qs = new URLSearchParams({ group: "placement" });
    if (isoRe.test(eff.from || "")) qs.set("from", eff.from);
    if (isoRe.test(eff.to || "")) qs.set("to", eff.to);
    const liveUrl = `/api/keitaro/live-stats?${qs.toString()}`;
    const cacheKey = `live-placements:${qs.toString()}`;
    const cached = readSwrCache(cacheKey);

    if (cached && Array.isArray(cached)) {
      setPlacementEntries(cached);
      setPlacementState({ loading: false, error: null });
    } else {
      setPlacementState({ loading: true, error: null });
    }

    try {
      let rows = null;
      // Primary path: live, placement-grained data straight from Keitaro.
      const response = await apiFetch(liveUrl);
      if (response.ok) {
        const data = await response.json();
        rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        // Fallback to the synced table when the live endpoint is unavailable.
        const fb = await apiFetch("/api/media-stats?limit=100000");
        if (!fb.ok) throw new Error("Failed to load placement stats.");
        const fbData = await fb.json();
        rows = Array.isArray(fbData) ? fbData : [];
      }
      writeSwrCache(cacheKey, rows);
      setPlacementEntries(rows);
      setPlacementState({ loading: false, error: null });
    } catch (error) {
      if (!cached) {
        setPlacementState({ loading: false, error: error.message || "Failed to load placement stats." });
      }
    }
  }, [period, customRange.from, customRange.to, filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchPlacements();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchPlacements]);

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";
  const globalPlacementFilter = filters?.placementName || "All";
  const globalPlacementDomainFilter = filters?.placementDomain || "All";
  const placementMinClicksFilter = Number(filters?.placementMinClicks || 0);
  const placementMinRegistersFilter = Number(filters?.placementMinRegisters || 0);
  const placementMinFtdsFilter = Number(filters?.placementMinFtds || 0);
  const placementRevenueOnlyFilter = Boolean(filters?.placementRevenueOnly);
  const sum = (value) => Number(value || 0);
  const normalizePlacementLabel = React.useCallback((value) => {
    const rawPlacement = String(value || "").trim();
    const normalizedPlacement = rawPlacement
      .replace(/^[({\[]?sub[_\s-]*id[_\s-]*1[)\]}]?$/i, "")
      .replace(/^[({\[]?sub[_\s-]*1[)\]}]?$/i, "")
      .trim();
    if (!normalizedPlacement) return "";
    return normalizedPlacement.replace(/_/g, " ");
  }, []);
  const placementRows = React.useMemo(() => {
    return placementEntries.filter((row) => {
      if (!isDateInRange(row.date, effectiveDateRange)) return false;
      if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
        return false;
      }
      if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
      const placementLabel = normalizePlacementLabel(row.placement);
      if (
        !isAllSelection(globalPlacementFilter) &&
        !normalizeFilterValue(placementLabel).includes(normalizeFilterValue(globalPlacementFilter))
      ) {
        return false;
      }
      const domainLabel = String(row.domain || row.source || row.site || row.flow || row.flows || "");
      if (
        !isAllSelection(globalPlacementDomainFilter) &&
        !normalizeFilterValue(domainLabel).includes(normalizeFilterValue(globalPlacementDomainFilter))
      ) {
        return false;
      }
      if (
        Number.isFinite(placementMinClicksFilter) &&
        placementMinClicksFilter > 0 &&
        sum(row.clicks) < placementMinClicksFilter
      ) {
        return false;
      }
      if (
        Number.isFinite(placementMinRegistersFilter) &&
        placementMinRegistersFilter > 0 &&
        sum(row.registers) < placementMinRegistersFilter
      ) {
        return false;
      }
      if (
        Number.isFinite(placementMinFtdsFilter) &&
        placementMinFtdsFilter > 0 &&
        sum(row.ftds) < placementMinFtdsFilter
      ) {
        return false;
      }
      if (placementRevenueOnlyFilter && sum(row.revenue) <= 0) {
        return false;
      }
      return true;
    });
  }, [
    placementEntries,
    effectiveDateRange.from,
    effectiveDateRange.to,
    globalBuyerFilter,
    globalCountryFilter,
    globalPlacementFilter,
    globalPlacementDomainFilter,
    placementMinClicksFilter,
    placementMinRegistersFilter,
    placementMinFtdsFilter,
    placementRevenueOnlyFilter,
    effectiveBuyer,
    isLeadership,
    normalizePlacementLabel,
  ]);

  const placementOptions = React.useMemo(() => {
    const options = new Set();
    placementRows.forEach((row) => {
      const label = normalizePlacementLabel(row.placement);
      if (label) options.add(label);
    });
    return ["All placements", ...Array.from(options).sort((a, b) => a.localeCompare(b))];
  }, [placementRows, normalizePlacementLabel]);

  React.useEffect(() => {
    if (!placementOptions.includes(placementFilter)) {
      setPlacementFilter("All placements");
    }
  }, [placementOptions, placementFilter]);

  const placementData = React.useMemo(() => {
    const map = new Map();
    placementRows.forEach((row) => {
      const placement = normalizePlacementLabel(row.placement);
      if (!placement) return;
      if (!map.has(placement)) {
        map.set(placement, {
          placement,
          clicks: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
          spend: 0,
        });
      }
      const current = map.get(placement);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += sum(row.revenue);
      current.spend += sum(row.spend);
    });

    return Array.from(map.values())
      .map((row) => {
        const clickToReg = row.clicks > 0 ? (row.registers / row.clicks) * 100 : 0;
        const regToFtd = row.registers > 0 ? (row.ftds / row.registers) * 100 : 0;
        const ftdToRedeposit = row.ftds > 0 ? (row.redeposits / row.ftds) * 100 : 0;
        const epc = row.clicks > 0 ? row.revenue / row.clicks : 0;
        return {
          ...row,
          clickToReg,
          regToFtd,
          ftdToRedeposit,
          epc,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }, [placementRows, normalizePlacementLabel]);

  const activePlacementData = React.useMemo(() => {
    if (placementFilter === "All placements") return placementData;
    return placementData.filter((row) => row.placement === placementFilter);
  }, [placementData, placementFilter]);
  const [placementTableSort, setPlacementTableSort] = React.useState({
    key: "clicks",
    dir: "desc",
  });
  const togglePlacementTableSort = (key) => {
    setPlacementTableSort((prev) => toggleSortConfig(prev, key, "desc"));
  };
  const getPlacementSortValue = (row, key) => {
    switch (key) {
      case "placement":
        return row.placement;
      case "clicks":
        return row.clicks;
      case "registers":
        return row.registers;
      case "ftds":
        return row.ftds;
      case "redeposits":
        return row.redeposits;
      case "revenue":
        return row.revenue;
      case "clickToReg":
        return row.clickToReg;
      case "regToFtd":
        return row.regToFtd;
      case "ftdToRedeposit":
        return row.ftdToRedeposit;
      case "epc":
        return row.epc;
      default:
        return null;
    }
  };
  const placementSortType = (key) => (key === "placement" ? "text" : "number");
  const sortedPlacementRows = React.useMemo(() => {
    const rows = [...activePlacementData];
    return rows.sort((a, b) =>
      compareSortValues(
        getPlacementSortValue(a, placementTableSort.key),
        getPlacementSortValue(b, placementTableSort.key),
        placementTableSort.dir,
        placementSortType(placementTableSort.key)
      )
    );
  }, [activePlacementData, placementTableSort]);

  const totals = activePlacementData.reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.clicks,
      registers: acc.registers + row.registers,
      ftds: acc.ftds + row.ftds,
      revenue: acc.revenue + row.revenue,
    }),
    { clicks: 0, registers: 0, ftds: 0, revenue: 0 }
  );

  const topByClicks = activePlacementData[0] || null;
  const topByRevenue = [...activePlacementData].sort((a, b) => b.revenue - a.revenue)[0] || null;
  const topByCr = [...activePlacementData].sort((a, b) => b.regToFtd - a.regToFtd)[0] || null;
  const topChartRows = activePlacementData.slice(0, 10);
  const topRevenueRows = [...activePlacementData].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const clicksMax = Math.max(
    10,
    ...topChartRows.map((row) => Math.max(row.clicks || 0, row.registers || 0))
  );
  const revenueMax = Math.max(10, ...topRevenueRows.map((row) => row.revenue || 0));

  const fmtPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Tracked Placements",
            value: placementData.length.toLocaleString(),
            meta: period === "All" ? "All time" : period,
          },
          {
            label: "Top Placement by Clicks",
            value: topByClicks?.placement || "—",
            meta: topByClicks ? `${topByClicks.clicks.toLocaleString()} clicks` : "No data",
          },
          {
            label: "Top Placement by Revenue",
            value: topByRevenue?.placement || "—",
            meta: topByRevenue ? formatCurrency(topByRevenue.revenue) : "No data",
          },
          {
            label: "Best Reg2FTD Placement",
            value: topByCr?.placement || "—",
            meta: topByCr ? fmtPercent(topByCr.regToFtd) : "No data",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="card-head">{t(stat.label)}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{t(stat.meta)}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels device-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Placement Volume")}</h3>
              <p className="panel-subtitle">{t("Clicks and registers grouped by sub_id_1 placement.")}</p>
            </div>
            <div className="panel-actions">
              <Select
                value={placementFilter}
                onChange={(v) => setPlacementFilter(v)}
                options={placementOptions.map((option) => ({
                  value: option,
                  label: option === "All placements" ? t(option) : option,
                }))}
                placeholder={t("All placements")}
                searchPlaceholder={t("Find placement")}
              />
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {placementState.loading ? (
            <div className="empty-state">{t("Loading placement stats…")}</div>
          ) : placementState.error ? (
            <div className="empty-state error">{placementState.error}</div>
          ) : topChartRows.length === 0 ? (
            <div className="empty-state">
              {t("No placement data yet. Sync Keitaro with sub_id_1 in dimensions and placementField mapping.")}
            </div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topChartRows} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="placementClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.25} />
                    </linearGradient>
                    <linearGradient id="placementRegs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="placement" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    domain={[0, Math.ceil(clicksMax * 1.15)]}
                    tickFormatter={(value) => Number(value || 0).toLocaleString()}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [Number(value || 0).toLocaleString(), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Bar dataKey="clicks" name={t("Clicks")} fill="url(#placementClicks)" radius={[8, 8, 0, 0]} />
                  <Bar
                    dataKey="registers"
                    name={t("Registers")}
                    fill="url(#placementRegs)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Revenue by Placement")}</h3>
              <p className="panel-subtitle">{t("Revenue contribution by top placements.")}</p>
            </div>
          </div>
          {topRevenueRows.length === 0 ? (
            <div className="empty-state">{t("No revenue data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topRevenueRows}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 110, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="placementRevenue" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    domain={[0, Math.ceil(revenueMax * 1.15)]}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis
                    type="category"
                    dataKey="placement"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatCurrency(value), t("Revenue")]}
                  />
                  <Bar dataKey="revenue" fill="url(#placementRevenue)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel span-2 placement-conversion"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Placement Conversion Rates")}</h3>
              <p className="panel-subtitle">{t("Click2Reg, Reg2FTD, and FTD2Redeposit rates.")}</p>
            </div>
          </div>
          {topChartRows.length === 0 ? (
            <div className="empty-state">{t("No conversion rate data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={topChartRows} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="placement" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [fmtPercent(value), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Line type="monotone" dataKey="clickToReg" name="Click2Reg" stroke="var(--blue)" strokeWidth={2} />
                  <Line type="monotone" dataKey="regToFtd" name="Reg2FTD" stroke="var(--green)" strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="ftdToRedeposit"
                    name="FTD2Redeposit"
                    stroke="var(--orange)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Placement Breakdown")}</h3>
              <p className="panel-subtitle">{t("Detailed performance by placement (sub_id_1).")}</p>
            </div>
            <div className="summary-inline">
              <span>{t("Clicks")}: {totals.clicks.toLocaleString()}</span>
              <span>{t("Registers")}: {totals.registers.toLocaleString()}</span>
              <span>{t("FTDs")}: {totals.ftds.toLocaleString()}</span>
              <span>{t("Revenue")}: {formatCurrency(totals.revenue)}</span>
            </div>
          </div>

          {placementState.loading ? (
            <div className="empty-state">{t("Loading placement stats…")}</div>
          ) : placementState.error ? (
            <div className="empty-state error">{placementState.error}</div>
          ) : activePlacementData.length === 0 ? (
            <div className="empty-state">
              {t("No placement rows found. Check Keitaro payload dimensions and mapping for sub_id_1.")}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    {[
                      { key: "placement", label: t("Placement") },
                      { key: "clicks", label: t("Clicks") },
                      { key: "registers", label: t("Registers") },
                      { key: "ftds", label: t("FTDs") },
                      { key: "redeposits", label: t("Redeposits") },
                      { key: "revenue", label: t("Revenue") },
                      { key: "clickToReg", label: t("Click2Reg") },
                      { key: "regToFtd", label: t("Reg2FTD") },
                      { key: "ftdToRedeposit", label: t("FTD2Redeposit") },
                      { key: "epc", label: t("EPC") },
                    ].map((col) => {
                      const isActive = placementTableSort.key === col.key;
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`sortable-header ${isActive ? "active" : ""}`}
                            onClick={() => togglePlacementTableSort(col.key)}
                          >
                            {col.label}
                            <span className="sort-indicator">
                              {getSortIndicator(placementTableSort, col.key)}
                            </span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedPlacementRows.map((row) => (
                    <tr key={row.placement}>
                      <td>{row.placement}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{row.registers.toLocaleString()}</td>
                      <td>{row.ftds.toLocaleString()}</td>
                      <td>{row.redeposits.toLocaleString()}</td>
                      <td>{formatCurrency(row.revenue)}</td>
                      <td>{fmtPercent(row.clickToReg)}</td>
                      <td>{fmtPercent(row.regToFtd)}</td>
                      <td>{fmtPercent(row.ftdToRedeposit)}</td>
                      <td>{formatCurrency(row.epc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function CampaignsDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [campaignEntries, setCampaignEntries] = React.useState([]);
  const [registeredDomains, setRegisteredDomains] = React.useState([]);
  const [campaignMappings, setCampaignMappings] = React.useState([]);
  const [campaignState, setCampaignState] = React.useState({ loading: true, error: null });
  const [buyerFilter, setBuyerFilter] = React.useState("All buyers");
  const [domainFilter, setDomainFilter] = React.useState("All domains");
  const sum = (value) => Number(value || 0);
  const normalizeText = (value) => String(value || "").trim();
  const normalizeDomain = (value) => {
    const text = normalizeText(value);
    if (!text) return "";
    const withoutProtocol = text.replace(/^https?:\/\//i, "");
    return withoutProtocol.split("/")[0].trim().toLowerCase();
  };
  const toDomainKey = (value) => normalizeDomain(value).replace(/^www\./i, "");

  const registeredDomainMap = React.useMemo(() => {
    const map = new Map();
    registeredDomains.forEach((domain) => {
      const key = toDomainKey(domain);
      if (key && !map.has(key)) {
        map.set(key, domain);
      }
    });
    return map;
  }, [registeredDomains]);

  const resolveRegisteredDomain = React.useCallback(
    (value) => {
      const key = toDomainKey(value);
      if (!key) return "";
      if (registeredDomainMap.has(key)) {
        return registeredDomainMap.get(key) || "";
      }
      for (const [registeredKey, registeredValue] of registeredDomainMap.entries()) {
        if (key.endsWith(`.${registeredKey}`) || registeredKey.endsWith(`.${key}`)) {
          return registeredValue;
        }
      }
      return "";
    },
    [registeredDomainMap]
  );

  const normalizeCampaignKey = React.useCallback(
    (value) => normalizeText(value).toLowerCase().replace(/\s+/g, " ").trim(),
    []
  );

  const campaignDomainLookup = React.useMemo(() => {
    const byCampaign = new Map();
    const byBuyer = new Map();

    campaignMappings.forEach((row) => {
      const campaignKey = normalizeCampaignKey(row?.name);
      const buyerKey = normalizeCampaignKey(row?.buyer);
      const domainValue = normalizeDomain(row?.domain);
      if (!domainValue) return;

      if (campaignKey && !byCampaign.has(campaignKey)) {
        byCampaign.set(campaignKey, domainValue);
      }
      if (buyerKey) {
        if (!byBuyer.has(buyerKey)) {
          byBuyer.set(buyerKey, new Set());
        }
        byBuyer.get(buyerKey).add(domainValue);
      }
    });

    return { byCampaign, byBuyer };
  }, [campaignMappings, normalizeCampaignKey]);

  const resolveMappedDomain = React.useCallback(
    (campaignValue, buyerValue) => {
      const campaignKey = normalizeCampaignKey(campaignValue);
      if (campaignKey && campaignDomainLookup.byCampaign.has(campaignKey)) {
        return campaignDomainLookup.byCampaign.get(campaignKey) || "";
      }

      const buyerKey = normalizeCampaignKey(buyerValue);
      if (!buyerKey) return "";
      const domains = campaignDomainLookup.byBuyer.get(buyerKey);
      if (!domains || domains.size !== 1) return "";
      return Array.from(domains)[0] || "";
    },
    [campaignDomainLookup, normalizeCampaignKey]
  );

  const fetchCampaigns = React.useCallback(async () => {
    try {
      setCampaignState({ loading: true, error: null });
      const isoRe = /^\d{4}-\d{2}-\d{2}$/;
      const gr = normalizeDateRange(filters?.dateFrom, filters?.dateTo);
      const pr = getPeriodDateRange(period, customRange);
      const eff = gr.from || gr.to ? gr : pr;
      const qs = new URLSearchParams();
      if (isoRe.test(eff.from || "")) qs.set("from", eff.from);
      if (isoRe.test(eff.to || "")) qs.set("to", eff.to);
      const liveUrl = `/api/keitaro/live-stats${qs.toString() ? `?${qs}` : ""}`;
      const [statsResponse, domainsResponse, mappingsResponse] = await Promise.all([
        apiFetch(liveUrl),
        apiFetch("/api/domains?limit=5000"),
        apiFetch("/api/campaigns?limit=500"),
      ]);

      // Primary path: live Keitaro data; fall back to the synced table.
      let statsRows = [];
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        statsRows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
      } else {
        const fb = await apiFetch("/api/media-stats?limit=100000");
        if (!fb.ok) throw new Error("Failed to load campaign stats.");
        const fbData = await fb.json();
        statsRows = Array.isArray(fbData) ? fbData : [];
      }
      setCampaignEntries(statsRows);

      if (domainsResponse.ok) {
        const domainsData = await domainsResponse.json();
        const normalized = Array.isArray(domainsData)
          ? Array.from(
              new Set(
                domainsData
                  .map((row) => normalizeDomain(row?.domain))
                  .filter(Boolean)
              )
            ).sort((a, b) => a.localeCompare(b))
          : [];
        setRegisteredDomains(normalized);
      } else {
        setRegisteredDomains([]);
      }

      if (mappingsResponse.ok) {
        const mappingsData = await mappingsResponse.json();
        setCampaignMappings(Array.isArray(mappingsData) ? mappingsData : []);
      } else {
        setCampaignMappings([]);
      }
      setCampaignState({ loading: false, error: null });
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to load campaign stats." });
    }
  }, [period, customRange.from, customRange.to, filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  React.useEffect(() => {
    const handleSync = () => fetchCampaigns();
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchCampaigns]);

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";

  const campaignRows = React.useMemo(
    () =>
      campaignEntries
        .map((row) => {
          const domainRaw = normalizeDomain(row.domain || row.source || row.site || row.flows);
          const buyerLabel = normalizeText(row.buyer) || "Unknown buyer";
          const campaignLabel = normalizeText(row.campaign_name || row.campaign || row.buyer) || "Unknown campaign";
          const mappedDomain = resolveMappedDomain(campaignLabel, buyerLabel);
          const assignedDomain =
            resolveRegisteredDomain(domainRaw) ||
            resolveRegisteredDomain(mappedDomain) ||
            normalizeDomain(mappedDomain);
          const adsetLabel = normalizeText(row.adset_name) || "Unknown adset";
          const adLabel = normalizeText(row.ad_name) || "Unknown ad";
          const hasVolume =
            sum(row.clicks) > 0 ||
            sum(row.registers) > 0 ||
            sum(row.ftds) > 0 ||
            sum(row.redeposits) > 0;
          const hasValue = sum(row.spend) > 0 || sum(row.revenue) > 0;
          return {
            ...row,
            buyerLabel,
            domainRaw,
            mappedDomain,
            assignedDomain,
            campaignLabel,
            adsetLabel,
            adLabel,
            hasVolume,
            hasValue,
          };
        })
        .filter((row) => {
          if (!isDateInRange(row.date, effectiveDateRange)) return false;
          if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
            return false;
          }
          if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
          return Boolean(
            row.campaignLabel ||
              row.adsetLabel ||
              row.adLabel ||
              row.assignedDomain ||
              row.domainRaw ||
              row.hasVolume ||
              row.hasValue
          );
        }),
    [
      campaignEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      effectiveBuyer,
      isLeadership,
      resolveMappedDomain,
      resolveRegisteredDomain,
    ]
  );

  const buyerOptionsLocal = React.useMemo(() => {
    const values = new Set();
    campaignRows.forEach((row) => {
      const buyer = normalizeText(row.buyer);
      if (buyer) values.add(buyer);
    });
    return ["All buyers", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [campaignRows]);

  const domainOptionsLocal = React.useMemo(
    () => ["All domains", ...registeredDomains],
    [registeredDomains]
  );

  React.useEffect(() => {
    if (!buyerOptionsLocal.includes(buyerFilter)) {
      setBuyerFilter("All buyers");
    }
  }, [buyerOptionsLocal, buyerFilter]);

  React.useEffect(() => {
    if (!domainOptionsLocal.includes(domainFilter)) {
      setDomainFilter("All domains");
    }
  }, [domainOptionsLocal, domainFilter]);

  const filteredRows = React.useMemo(
    () =>
      campaignRows.filter((row) => {
        const buyer = normalizeText(row.buyer);
        const domain = toDomainKey(row.assignedDomain || row.domainRaw);
        if (buyerFilter !== "All buyers" && buyer !== buyerFilter) return false;
        if (domainFilter !== "All domains" && domain !== toDomainKey(domainFilter)) return false;
        return true;
      }),
    [campaignRows, buyerFilter, domainFilter]
  );

  const campaignAgg = React.useMemo(() => {
    const isUnknownLabel = (value) => /^unknown\b/i.test(String(value || "").trim());
    const map = new Map();
    filteredRows.forEach((row) => {
      const buyer = row.buyerLabel;
      const domain = row.assignedDomain || row.domainRaw || "unassigned.domain";
      const campaignName = row.campaignLabel;
      const adsetName = row.adsetLabel;
      const adName = row.adLabel;
      const conversions = sum(row.registers) + sum(row.ftds) + sum(row.redeposits);
      const key = `${buyer}|${domain}|${campaignName}`;

      if (!map.has(key)) {
        map.set(key, {
          buyer,
          domain,
          campaignName,
          adsetName,
          adName,
          clicks: 0,
          conversions: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          spend: 0,
          revenue: 0,
        });
      }
      const current = map.get(key);
      if (isUnknownLabel(current.adsetName) && !isUnknownLabel(adsetName)) {
        current.adsetName = adsetName;
      }
      if (isUnknownLabel(current.adName) && !isUnknownLabel(adName)) {
        current.adName = adName;
      }
      current.clicks += sum(row.clicks);
      current.conversions += conversions;
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.spend += sum(row.spend);
      current.revenue += sum(row.revenue);
    });

    return Array.from(map.values())
      .map((row) => ({
        ...row,
        cpc: row.clicks > 0 ? row.spend / row.clicks : 0,
        cpa: row.conversions > 0 ? row.spend / row.conversions : 0,
        cr: row.clicks > 0 ? (row.conversions / row.clicks) * 100 : 0,
      }))
      .sort((a, b) => b.conversions - a.conversions);
  }, [filteredRows]);

  const creativeAgg = React.useMemo(() => {
    const isUnknownLabel = (value) => /^unknown\b/i.test(String(value || "").trim());
    const map = new Map();
    filteredRows.forEach((row) => {
      const buyer = row.buyerLabel;
      const domain = row.assignedDomain || row.domainRaw || "unassigned.domain";
      const campaignName = row.campaignLabel;
      const adsetName = row.adsetLabel;
      const adName = row.adLabel;
      const conversions = sum(row.registers) + sum(row.ftds) + sum(row.redeposits);
      const key = `${buyer}|${domain}|${campaignName}|${adsetName}|${adName}`;
      if (!map.has(key)) {
        map.set(key, {
          buyer,
          domain,
          campaignName,
          adsetName,
          adName,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
        });
      }
      const current = map.get(key);
      current.clicks += sum(row.clicks);
      current.conversions += conversions;
      current.spend += sum(row.spend);
      current.revenue += sum(row.revenue);
    });

    const baseRows = Array.from(map.values())
      .map((row) => ({
        ...row,
        cpc: row.clicks > 0 ? row.spend / row.clicks : 0,
        cpa: row.conversions > 0 ? row.spend / row.conversions : 0,
        cr: row.clicks > 0 ? (row.conversions / row.clicks) * 100 : 0,
      }))
      .sort((a, b) => b.conversions - a.conversions);

    const hasNamedCreative = baseRows.some((row) => !isUnknownLabel(row.adName));
    return hasNamedCreative ? baseRows.filter((row) => !isUnknownLabel(row.adName)) : baseRows;
  }, [filteredRows]);

  const growthSeries = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const date = String(row.date || "").trim();
      if (!date) return;
      if (!map.has(date)) {
        map.set(date, { date, clicks: 0, conversions: 0, spend: 0, revenue: 0 });
      }
      const current = map.get(date);
      current.clicks += sum(row.clicks);
      current.conversions += sum(row.registers) + sum(row.ftds) + sum(row.redeposits);
      current.spend += sum(row.spend);
      current.revenue += sum(row.revenue);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  const totals = React.useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => {
          acc.clicks += sum(row.clicks);
          acc.installs += sum(row.installs);
          acc.registers += sum(row.registers);
          acc.ftds += sum(row.ftds);
          acc.conversions += sum(row.registers) + sum(row.ftds) + sum(row.redeposits);
          acc.spend += sum(row.spend);
          acc.revenue += sum(row.revenue);
          return acc;
        },
        { clicks: 0, installs: 0, registers: 0, ftds: 0, conversions: 0, spend: 0, revenue: 0 }
      ),
    [filteredRows]
  );

  const costPerClick = totals.clicks > 0 ? totals.spend / totals.clicks : null;
  const costPerInstall = totals.installs > 0 ? totals.spend / totals.installs : null;
  const costPerRegister = totals.registers > 0 ? totals.spend / totals.registers : null;
  const costPerConversion = totals.ftds > 0 ? totals.spend / totals.ftds : null;
  const costPerLead = totals.installs > 0 ? totals.spend / totals.installs : null;
  const costPerPurchase = totals.ftds > 0 ? totals.spend / totals.ftds : null;

  const topCampaign = campaignAgg[0] || null;
  const topCreative = creativeAgg[0] || null;
  const compareCampaign = campaignAgg[1] || null;
  const comparisonDelta =
    topCampaign && compareCampaign && compareCampaign.conversions > 0
      ? ((topCampaign.conversions - compareCampaign.conversions) / compareCampaign.conversions) * 100
      : null;

  const growthPercent = React.useMemo(() => {
    if (!effectiveDateRange.from || !effectiveDateRange.to) return null;
    const fromDate = new Date(`${effectiveDateRange.from}T00:00:00`);
    const toDate = new Date(`${effectiveDateRange.to}T00:00:00`);
    if (!Number.isFinite(fromDate.getTime()) || !Number.isFinite(toDate.getTime())) return null;
    const days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1);
    const prevTo = new Date(fromDate);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - (days - 1));
    const prevRange = { from: formatIsoDate(prevFrom), to: formatIsoDate(prevTo) };

    const previousClicks = campaignEntries
      .filter((row) => {
        if (!isDateInRange(row.date, prevRange)) return false;
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        const buyer = normalizeText(row.buyer);
        const domain = toDomainKey(
          resolveRegisteredDomain(row.domain || row.source || row.site || row.flows) ||
            normalizeDomain(row.domain || row.source || row.site || row.flows)
        );
        if (buyerFilter !== "All buyers" && buyer !== buyerFilter) return false;
        if (domainFilter !== "All domains" && domain !== toDomainKey(domainFilter)) return false;
        return true;
      })
      .reduce((sumValue, row) => sumValue + sum(row.clicks), 0);

    if (previousClicks <= 0) return null;
    return ((totals.clicks - previousClicks) / previousClicks) * 100;
  }, [
    effectiveDateRange.from,
    effectiveDateRange.to,
    campaignEntries,
    buyerFilter,
    domainFilter,
    globalBuyerFilter,
    globalCountryFilter,
    effectiveBuyer,
    isLeadership,
    resolveRegisteredDomain,
    totals.clicks,
  ]);

  const campaignChartRows = campaignAgg.slice(0, 10).map((row) => ({
    ...row,
    shortName: row.campaignName.length > 20 ? `${row.campaignName.slice(0, 20)}...` : row.campaignName,
  }));
  const creativeChartRows = creativeAgg.slice(0, 10).map((row) => ({
    ...row,
    shortName: row.adName.length > 18 ? `${row.adName.slice(0, 18)}...` : row.adName,
  }));
  const [campaignTableSort, setCampaignTableSort] = React.useState({
    key: "conversions",
    dir: "desc",
  });
  const toggleCampaignTableSort = (key) => {
    setCampaignTableSort((prev) => toggleSortConfig(prev, key, "desc"));
  };
  const getCampaignTableSortValue = (row, key) => {
    switch (key) {
      case "buyer":
        return row.buyer;
      case "domain":
        return row.domain;
      case "campaign":
        return row.campaignName;
      case "adset":
        return row.adsetName;
      case "ad":
        return row.adName;
      case "clicks":
        return row.clicks;
      case "conversions":
        return row.conversions;
      case "cpc":
        return row.cpc;
      case "cpa":
        return row.cpa;
      case "revenue":
        return row.revenue;
      default:
        return null;
    }
  };
  const campaignSortType = (key) =>
    ["buyer", "domain", "campaign", "adset", "ad"].includes(key) ? "text" : "number";
  const campaignTableRows = React.useMemo(() => {
    const rows = [...campaignAgg];
    return rows
      .sort((a, b) =>
        compareSortValues(
          getCampaignTableSortValue(a, campaignTableSort.key),
          getCampaignTableSortValue(b, campaignTableSort.key),
          campaignTableSort.dir,
          campaignSortType(campaignTableSort.key)
        )
      )
      .slice(0, 30);
  }, [campaignAgg, campaignTableSort]);

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Clicks",
            value: totals.clicks.toLocaleString(),
            meta: `CPC ${costPerClick === null ? "—" : formatCurrency(costPerClick)}`,
          },
          {
            label: "Installs",
            value: totals.installs.toLocaleString(),
            meta: `Cost per Install ${costPerInstall === null ? "—" : formatCurrency(costPerInstall)}`,
          },
          {
            label: "Register",
            value: totals.registers.toLocaleString(),
            meta: `Cost per Register ${costPerRegister === null ? "—" : formatCurrency(costPerRegister)}`,
          },
          {
            label: "Conversion",
            value: totals.ftds.toLocaleString(),
            meta: `Cost per FTD ${costPerConversion === null ? "—" : formatCurrency(costPerConversion)}`,
          },
        ].map((stat, idx) => (
          <motion.div
            key={`${stat.label}-${idx}`}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="card-head">{t(stat.label)}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{t(stat.meta)}</div>
          </motion.div>
        ))}
      </section>

      <section className="cards">
        {[
          {
            label: "CPC",
            value: costPerClick === null ? "—" : formatCurrency(costPerClick),
            meta: `${totals.clicks.toLocaleString()} ${t("Clicks")}`,
          },
          {
            label: "Cost per Lead",
            value: costPerLead === null ? "—" : formatCurrency(costPerLead),
            meta: `${totals.installs.toLocaleString()} ${t("Installs")}`,
          },
          {
            label: "Cost per Register",
            value: costPerRegister === null ? "—" : formatCurrency(costPerRegister),
            meta: `${totals.registers.toLocaleString()} ${t("Register")}`,
          },
          {
            label: "Cost per Purchase",
            value: costPerPurchase === null ? "—" : formatCurrency(costPerPurchase),
            meta: `${totals.ftds.toLocaleString()} ${t("FTD")}`,
          },
        ].map((stat, idx) => (
          <motion.div
            key={`cost-${stat.label}-${idx}`}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4 }}
          >
            <div className="card-head">{t(stat.label)}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{stat.meta}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels device-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Campaign Growth")}</h3>
              <p className="panel-subtitle">{t("Clicks and conversions over time.")}</p>
            </div>
            <div className="panel-actions">
              <Select
                value={buyerFilter}
                onChange={(v) => setBuyerFilter(v)}
                options={buyerOptionsLocal.map((option) => ({ value: option, label: option === "All buyers" ? t(option) : option }))}
                placeholder={t("All buyers")}
                searchPlaceholder={t("Find buyer")}
              />
              <Select
                value={domainFilter}
                onChange={(v) => setDomainFilter(v)}
                options={domainOptionsLocal.map((option) => ({ value: option, label: option === "All domains" ? t(option) : option }))}
                placeholder={t("All domains")}
                searchPlaceholder={t("Find domain")}
              />
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaign stats…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : growthSeries.length === 0 ? (
            <div className="empty-state">{t("No campaign data yet. Sync Keitaro with sub_id_3, sub_id_4, sub_id_5 and source.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={growthSeries} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="campaignGrowthClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={axisTickStyle} tickFormatter={formatShortDate} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={formatShortDate}
                    formatter={(value, name) => [Number(value || 0).toLocaleString(), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Area type="monotone" dataKey="clicks" name={t("Clicks")} fill="url(#campaignGrowthClicks)" stroke="var(--blue)" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" name={t("Conversions")} stroke="var(--green)" strokeWidth={2.2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Campaign Comparisons")}</h3>
              <p className="panel-subtitle">{t("Top campaigns by clicks and conversions.")}</p>
            </div>
          </div>
          {campaignChartRows.length === 0 ? (
            <div className="empty-state">{t("No campaign comparison data.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={campaignChartRows} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="shortName" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [Number(value || 0).toLocaleString(), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Bar dataKey="clicks" name={t("Clicks")} fill="var(--blue)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="conversions" name={t("Conversions")} fill="var(--purple)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel span-2 placement-conversion"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Creatives Success")}</h3>
              <p className="panel-subtitle">{t("Creative-level CPC, CPA, and conversion performance.")}</p>
            </div>
          </div>
          {creativeChartRows.length === 0 ? (
            <div className="empty-state">{t("No creative data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={330}>
                <ComposedChart data={creativeChartRows} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="shortName" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis yAxisId="volume" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis yAxisId="cost" orientation="right" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      if (name === "CPC" || name === "CPA") return [formatCurrency(value), name];
                      return [Number(value || 0).toLocaleString(), name];
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Bar yAxisId="volume" dataKey="conversions" name={t("Conversions")} fill="var(--green)" radius={[8, 8, 0, 0]} />
                  <Line yAxisId="cost" type="monotone" dataKey="cpc" name="CPC" stroke="var(--blue)" strokeWidth={2} dot={false} />
                  <Line yAxisId="cost" type="monotone" dataKey="cpa" name="CPA" stroke="var(--orange)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Campaign and Creative Breakdown")}</h3>
              <p className="panel-subtitle">
                {t("Assigned to buyer and domain using clicks and conversion logs with CPC/CPA comparison.")}
              </p>
            </div>
          </div>
          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaign stats…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : campaignTableRows.length === 0 ? (
            <div className="empty-state">{t("No campaign rows found.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    {[
                      { key: "buyer", label: t("Media Buyer") },
                      { key: "domain", label: t("Domain") },
                      { key: "campaign", label: t("Campaign") },
                      { key: "adset", label: t("Adset") },
                      { key: "ad", label: t("Ad") },
                      { key: "clicks", label: t("Clicks") },
                      { key: "conversions", label: t("Conversions") },
                      { key: "cpc", label: "CPC" },
                      { key: "cpa", label: "CPA" },
                      { key: "revenue", label: t("Revenue") },
                    ].map((col) => {
                      const isActive = campaignTableSort.key === col.key;
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`sortable-header ${isActive ? "active" : ""}`}
                            onClick={() => toggleCampaignTableSort(col.key)}
                          >
                            {col.label}
                            <span className="sort-indicator">
                              {getSortIndicator(campaignTableSort, col.key)}
                            </span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {campaignTableRows.map((row, idx) => (
                    <tr key={`${row.buyer}-${row.domain}-${row.campaignName}-${idx}`}>
                      <td>{row.buyer}</td>
                      <td>{row.domain}</td>
                      <td>{row.campaignName}</td>
                      <td>{row.adsetName}</td>
                      <td>{row.adName}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{row.conversions.toLocaleString()}</td>
                      <td>{formatCurrency(row.cpc)}</td>
                      <td>{formatCurrency(row.cpa)}</td>
                      <td>{formatCurrency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function UserBehaviorDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [behaviorEntries, setBehaviorEntries] = React.useState([]);
  const [behaviorState, setBehaviorState] = React.useState({ loading: true, error: null });
  const [search, setSearch] = React.useState("");
  const [behaviorFilter, setBehaviorFilter] = React.useState("Top User By Total Revenue");
  const [ubPage, setUbPage] = React.useState(1);

  const fetchBehavior = React.useCallback(async () => {
    try {
      setBehaviorState({ loading: true, error: null });
      const response = await apiFetch("/api/user-behavior?limit=5000");
      if (!response.ok) {
        throw new Error("Failed to load user behavior.");
      }
      const data = await response.json();
      setBehaviorEntries(Array.isArray(data) ? data : []);
      setBehaviorState({ loading: false, error: null });
    } catch (error) {
      setBehaviorState({ loading: false, error: error.message || "Failed to load user behavior." });
    }
  }, []);

  React.useEffect(() => {
    fetchBehavior();
  }, [fetchBehavior]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchBehavior();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchBehavior]);

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";
  const globalUserDomainFilter = filters?.userDomain || "All";
  const globalUserCampaignFilter = filters?.userCampaign || "All";
  const globalUserExternalIdFilter = filters?.userExternalId || "";
  const globalUserMinRevenue = Number(filters?.userMinRevenue || 0);
  const globalUserMinFtds = Number(filters?.userMinFtds || 0);
  const globalUserMinRedeposits = Number(filters?.userMinRedeposits || 0);
  const globalUserRevenueOnly = Boolean(filters?.userRevenueOnly);

  const normalizedSearch = search.trim().toLowerCase();
  const sum = (value) => Number(value || 0);

  const behaviorRows = React.useMemo(
    () =>
      behaviorEntries.filter((row) => {
        if (!isDateInRange(row.date || row.day || row.created_at, effectiveDateRange)) {
          return false;
        }
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        const rowDomain = normalizeFilterValue(row.domain || row.source || row.site || row.flow || row.flows);
        if (
          !isAllSelection(globalUserDomainFilter) &&
          !rowDomain.includes(normalizeFilterValue(globalUserDomainFilter))
        ) {
          return false;
        }
        const rowCampaign = normalizeFilterValue(row.campaign || row.buyer);
        if (
          !isAllSelection(globalUserCampaignFilter) &&
          !rowCampaign.includes(normalizeFilterValue(globalUserCampaignFilter))
        ) {
          return false;
        }
        return true;
      }),
    [
      behaviorEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      globalUserDomainFilter,
      globalUserCampaignFilter,
      effectiveBuyer,
      isLeadership,
    ]
  );

  const userData = React.useMemo(() => {
    const map = new Map();
    behaviorRows.forEach((row) => {
      const externalId = String(row.external_id || row.externalId || "").trim();
      if (!externalId) return;
      if (!map.has(externalId)) {
        map.set(externalId, {
          externalId,
          buyer: row.buyer || "",
          campaign: "",
          clicks: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
          ftdRevenue: 0,
          redepositRevenue: 0,
          campaigns: new Map(),
        });
      }
      const current = map.get(externalId);
      const ftdRevenueValue = Number.isFinite(Number(row.ftd_revenue ?? row.ftdRevenue))
        ? Number(row.ftd_revenue ?? row.ftdRevenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redeposit_revenue ?? row.redepositRevenue)
      )
        ? Number(row.redeposit_revenue ?? row.redepositRevenue)
        : 0;
      const rowRevenueValue = Number.isFinite(Number(row.revenue)) ? Number(row.revenue) : 0;
      const revenueValue = rowRevenueValue > 0 ? rowRevenueValue : ftdRevenueValue + redepositRevenueValue;

      const campaign = String(row.campaign || "").trim();
      if (campaign) {
        const existing = current.campaigns.get(campaign) || 0;
        current.campaigns.set(campaign, existing + (revenueValue || 0));
      }

      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += revenueValue || 0;
      current.ftdRevenue += ftdRevenueValue || 0;
      current.redepositRevenue += redepositRevenueValue || 0;
    });

    return Array.from(map.values())
      .map((row) => {
        let topCampaign = "";
        let topValue = -1;
        row.campaigns.forEach((value, key) => {
          if (value > topValue) {
            topValue = value;
            topCampaign = key;
          }
        });
        return {
          ...row,
          campaign: topCampaign || row.campaign,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [behaviorRows]);

  const filteredUsers = React.useMemo(() => {
    const normalizedExternalFilter = normalizeFilterValue(globalUserExternalIdFilter);
    return userData.filter((row) => {
      if (normalizedSearch) {
        const idMatch = row.externalId.toLowerCase().includes(normalizedSearch);
        const campaignMatch = String(row.campaign || "").toLowerCase().includes(normalizedSearch);
        if (!idMatch && !campaignMatch) return false;
      }
      if (normalizedExternalFilter && !row.externalId.toLowerCase().includes(normalizedExternalFilter)) {
        return false;
      }
      if (Number.isFinite(globalUserMinRevenue) && globalUserMinRevenue > 0 && row.revenue < globalUserMinRevenue) {
        return false;
      }
      if (Number.isFinite(globalUserMinFtds) && globalUserMinFtds > 0 && row.ftds < globalUserMinFtds) {
        return false;
      }
      if (
        Number.isFinite(globalUserMinRedeposits) &&
        globalUserMinRedeposits > 0 &&
        row.redeposits < globalUserMinRedeposits
      ) {
        return false;
      }
      if (globalUserRevenueOnly && row.revenue <= 0) {
        return false;
      }
      return true;
    });
  }, [
    userData,
    normalizedSearch,
    globalUserExternalIdFilter,
    globalUserMinRevenue,
    globalUserMinFtds,
    globalUserMinRedeposits,
    globalUserRevenueOnly,
  ]);
  const [userTableSort, setUserTableSort] = React.useState({ key: "revenue", dir: "desc" });
  const toggleUserTableSort = (key) => {
    setUserTableSort((prev) => toggleSortConfig(prev, key, "desc"));
  };
  const getUserSortValue = (row, key) => {
    switch (key) {
      case "externalId":
        return row.externalId;
      case "campaign":
        return row.campaign;
      case "clicks":
        return row.clicks;
      case "registers":
        return row.registers;
      case "ftds":
        return row.ftds;
      case "redeposits":
        return row.redeposits;
      case "revenue":
        return row.revenue;
      default:
        return null;
    }
  };
  const userSortType = (key) =>
    key === "externalId" || key === "campaign" ? "text" : "number";
  const sortedUserTableRows = React.useMemo(() => {
    const rows = [...filteredUsers];
    return rows.sort((a, b) =>
      compareSortValues(
        getUserSortValue(a, userTableSort.key),
        getUserSortValue(b, userTableSort.key),
        userTableSort.dir,
        userSortType(userTableSort.key)
      )
    );
  }, [filteredUsers, userTableSort]);
  const UB_PAGE_SIZE = 50;
  const ubPageCount = Math.max(1, Math.ceil(sortedUserTableRows.length / UB_PAGE_SIZE));
  const ubClampedPage = Math.min(ubPage, ubPageCount);
  const pagedUserTableRows = React.useMemo(
    () => sortedUserTableRows.slice((ubClampedPage - 1) * UB_PAGE_SIZE, ubClampedPage * UB_PAGE_SIZE),
    [sortedUserTableRows, ubClampedPage]
  );
  const ubPageList = React.useMemo(() => {
    const total = ubPageCount;
    const cur = ubClampedPage;
    const out = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) out.push(i);
    } else {
      out.push(1);
      const start = Math.max(2, cur - 1);
      const end = Math.min(total - 1, cur + 1);
      if (start > 2) out.push("ellipsis");
      for (let i = start; i <= end; i += 1) out.push(i);
      if (end < total - 1) out.push("ellipsis");
      out.push(total);
    }
    return out;
  }, [ubPageCount, ubClampedPage]);
  React.useEffect(() => {
    setUbPage(1);
  }, [sortedUserTableRows]);

  const behaviorFilterOptions = [
    "Tracked Users",
    "Top User By Total Revenue",
    "Top User by Revenue FTD",
    "Top User By Redeposit (number)",
  ];

  const sortedUsers = React.useMemo(() => {
    const rows = [...filteredUsers];
    const sortBy = behaviorFilter;
    const valueFor = (row) => {
      switch (sortBy) {
        case "Top User by Revenue FTD":
          return row.ftdRevenue || 0;
        case "Top User By Redeposit (number)":
          return row.redeposits || 0;
        case "Tracked Users":
        case "Top User By Total Revenue":
        default:
          return row.revenue || 0;
      }
    };
    return rows.sort((a, b) => valueFor(b) - valueFor(a));
  }, [filteredUsers, behaviorFilter]);

  const totalUsers = filteredUsers.length;
  const topByRevenue = [...filteredUsers].sort((a, b) => b.revenue - a.revenue)[0] || null;
  const topByFtdRevenue = [...filteredUsers].sort((a, b) => b.ftdRevenue - a.ftdRevenue)[0] || null;
  const topByRedeposit = [...filteredUsers].sort((a, b) => b.redeposits - a.redeposits)[0] || null;

  const topUsers = sortedUsers.slice(0, 10).map((row) => ({
    ...row,
    label: row.externalId.length > 12 ? `${row.externalId.slice(0, 12)}…` : row.externalId,
  }));

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Tracked Users",
            value: totalUsers.toLocaleString(),
            meta: period === "All" ? "All time" : period,
          },
          {
            label: "Top User By Total Revenue",
            value: topByRevenue?.externalId || "—",
            meta: topByRevenue ? `${formatCurrency(topByRevenue.revenue)} · FTD + Redeposit` : "No data",
          },
          {
            label: "Top User by Revenue FTD",
            value: topByFtdRevenue?.externalId || "—",
            meta: topByFtdRevenue ? formatCurrency(topByFtdRevenue.ftdRevenue) : "No data",
          },
          {
            label: "Top User By Redeposit (number)",
            value: topByRedeposit?.externalId || "—",
            meta: topByRedeposit ? `${topByRedeposit.redeposits.toLocaleString()} Redeposits` : "No data",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="card-head">{t(stat.label)}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{t(stat.meta)}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels device-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("User Revenue")}</h3>
              <p className="panel-subtitle">{t("Top players ranked by revenue.")}</p>
            </div>
            <div className="panel-actions">
              <input
                className="inline-input"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search external ID or campaign")}
              />
              <Select
                value={behaviorFilter}
                onChange={(v) => setBehaviorFilter(v)}
                options={behaviorFilterOptions.map((option) => ({ value: option, label: t(option) }))}
                placeholder={t("Filter")}
                searchPlaceholder={t("Find")}
              />
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {behaviorState.loading ? (
            <div className="empty-state">{t("Loading user behavior…")}</div>
          ) : behaviorState.error ? (
            <div className="empty-state error">{behaviorState.error}</div>
          ) : topUsers.length === 0 ? (
            <div className="empty-state">{t("No user behavior data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topUsers} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="userRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatCurrency(value), t("Revenue")]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.externalId || label
                    }
                  />
                  <Bar dataKey="revenue" fill="url(#userRevenue)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Conversions by User")}</h3>
              <p className="panel-subtitle">{t("FTDs and redeposits by external ID.")}</p>
            </div>
          </div>
          {topUsers.length === 0 ? (
            <div className="empty-state">{t("No conversion data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topUsers} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [Number(value || 0).toLocaleString(), name]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.externalId || label
                    }
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Bar dataKey="ftds" name={t("FTDs")} fill="var(--green)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="redeposits" name={t("Redeposits")} fill="var(--orange)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("User Behavior")}</h3>
              <p className="panel-subtitle">{t("External ID performance and campaign attribution.")}</p>
            </div>
          </div>

          {behaviorState.loading ? (
            <div className="empty-state">{t("Loading user behavior…")}</div>
          ) : behaviorState.error ? (
            <div className="empty-state error">{behaviorState.error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">{t("No user behavior data available.")}</div>
          ) : (
            <>
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    {[
                      { key: "externalId", label: t("External ID") },
                      { key: "campaign", label: t("Campaign") },
                      { key: "clicks", label: t("Clicks") },
                      { key: "registers", label: t("Registers") },
                      { key: "ftds", label: t("FTDs") },
                      { key: "redeposits", label: t("Redeposits") },
                      { key: "revenue", label: t("Revenue") },
                    ].map((col) => {
                      const isActive = userTableSort.key === col.key;
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`sortable-header ${isActive ? "active" : ""}`}
                            onClick={() => toggleUserTableSort(col.key)}
                          >
                            {col.label}
                            <span className="sort-indicator">
                              {getSortIndicator(userTableSort, col.key)}
                            </span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pagedUserTableRows.map((row) => (
                    <tr key={row.externalId}>
                      <td>{row.externalId}</td>
                      <td>{row.campaign || "—"}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{row.registers.toLocaleString()}</td>
                      <td>{row.ftds.toLocaleString()}</td>
                      <td>{row.redeposits.toLocaleString()}</td>
                      <td>{formatCurrency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sortedUserTableRows.length > UB_PAGE_SIZE ? (
              <div className="offer-pagebar">
                <span className="offer-results-count">
                  {t("Showing")} {(ubClampedPage - 1) * UB_PAGE_SIZE + 1}–
                  {Math.min(ubClampedPage * UB_PAGE_SIZE, sortedUserTableRows.length)} {t("of")}{" "}
                  {sortedUserTableRows.length}
                </span>
                <div className="offer-pagination">
                  <button
                    type="button"
                    className="offer-pagination-arrow"
                    disabled={ubClampedPage <= 1}
                    onClick={() => setUbPage((p) => Math.max(1, p - 1))}
                    aria-label={t("Previous page")}
                  >
                    ‹
                  </button>
                  {ubPageList.map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`ub-ellipsis-${i}`} className="offer-pagination-ellipsis">
                        …
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={p}
                        className={`offer-pagination-page ${p === ubClampedPage ? "is-active" : ""}`}
                        onClick={() => setUbPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className="offer-pagination-arrow"
                    disabled={ubClampedPage >= ubPageCount}
                    onClick={() => setUbPage((p) => Math.min(ubPageCount, p + 1))}
                    aria-label={t("Next page")}
                  >
                    ›
                  </button>
                </div>
              </div>
            ) : null}
            </>
          )}
        </motion.div>
      </section>
    </>
  );
}

function DevicesDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [deviceEntries, setDeviceEntries] = React.useState([]);
  const [deviceState, setDeviceState] = React.useState({ loading: true, error: null });
  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";

  const fetchDeviceStats = React.useCallback(async () => {
    try {
      setDeviceState({ loading: true, error: null });
      const response = await apiFetch("/api/device-stats?limit=500");
      if (!response.ok) {
        throw new Error("Failed to load device stats.");
      }
      const data = await response.json();
      setDeviceEntries(data);
      setDeviceState({ loading: false, error: null });
    } catch (error) {
      setDeviceState({ loading: false, error: error.message || "Failed to load device stats." });
    }
  }, []);

  React.useEffect(() => {
    fetchDeviceStats();
  }, [fetchDeviceStats]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchDeviceStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchDeviceStats]);

  const filteredDeviceEntries = React.useMemo(
    () =>
      deviceEntries.filter((row) => {
        if (!isDateInRange(row.date, effectiveDateRange)) return false;
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        return true;
      }),
    [
      deviceEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      effectiveBuyer,
      isLeadership,
    ]
  );

  const sum = (value) => Number(value || 0);
  const deviceMap = new Map();

  const getDeviceKey = (row) => {
    const device = row.device || "Unknown";
    const os = row.os || row.os_version || row.osVersion || "";
    const osVersion = row.os_version || row.osVersion || "";
    const deviceModel = row.device_model || row.deviceModel || "";
    return `${device}||${os}||${osVersion}||${deviceModel}`;
  };

  filteredDeviceEntries.forEach((row) => {
    const device = row.device || "Unknown";
    const os = row.os || row.os_version || row.osVersion || "";
    const osVersion = row.os_version || row.osVersion || "";
    const osIcon = row.os_icon || row.osIcon || "";
    const deviceModel = row.device_model || row.deviceModel || "";
    const key = getDeviceKey(row);
    if (!deviceMap.has(key)) {
      deviceMap.set(key, {
        key,
        device,
        os,
        osVersion,
        osIcon,
        deviceModel,
        label: [device, os, osVersion, deviceModel].filter(Boolean).join(" · "),
        clicks: 0,
        installs: 0,
        registers: 0,
        ftds: 0,
        spend: 0,
        revenue: 0,
      });
    }
    const current = deviceMap.get(key);
    current.clicks += sum(row.clicks);
    current.installs += sum(row.installs);
    current.registers += sum(row.registers);
    current.ftds += sum(row.ftds);
    current.spend += sum(row.spend);
    current.revenue += sum(row.revenue);
  });

  const deviceData = Array.from(deviceMap.values()).sort((a, b) => b.revenue - a.revenue);

  const osMap = new Map();
  deviceData.forEach((row) => {
    const osName = row.os || row.device || "Unknown";
    const key = osName.toLowerCase();
    if (!osMap.has(key)) {
      osMap.set(key, { key, name: osName, revenue: 0, clicks: 0, installs: 0, ftds: 0 });
    }
    const current = osMap.get(key);
    current.revenue += row.revenue || 0;
    current.clicks += row.clicks || 0;
    current.installs += row.installs || 0;
    current.ftds += row.ftds || 0;
  });
  const osData = Array.from(osMap.values()).sort((a, b) => b.revenue - a.revenue);
  const topOs = osData[0] || null;

  const osVersionMap = new Map();
  deviceData.forEach((row) => {
    const osName = row.os || row.device || "Unknown";
    const version = row.osVersion || "Unknown";
    const key = `${osName}||${version}`;
    const label = version && version !== "Unknown" ? `${osName} ${version}`.trim() : osName;
    if (!osVersionMap.has(key)) {
      osVersionMap.set(key, { key, label, os: osName, version, revenue: 0, clicks: 0, installs: 0, ftds: 0 });
    }
    const current = osVersionMap.get(key);
    current.revenue += row.revenue || 0;
    current.clicks += row.clicks || 0;
    current.installs += row.installs || 0;
    current.ftds += row.ftds || 0;
  });
  const osVersionData = Array.from(osVersionMap.values()).sort((a, b) => b.revenue - a.revenue);
  const topOsVersion = osVersionData[0] || null;
  const topOsVersionCr =
    topOsVersion && topOsVersion.clicks
      ? (topOsVersion.ftds / topOsVersion.clicks) * 100
      : 0;

  const deviceChartData = deviceData.map((row) => ({
    key: row.key,
    device: row.label || row.device,
    deviceRaw: row.device,
    deviceModel: row.deviceModel,
    osIcon: row.osIcon,
    os: row.os,
    osVersion: row.osVersion,
    revenue: row.revenue,
    clicks: row.clicks,
    installs: row.installs,
    cr: row.clicks ? (row.ftds / row.clicks) * 100 : 0,
  }));

  const osChartData = osData.map((row) => ({
    key: row.key,
    os: row.name,
    revenue: row.revenue,
    clicks: row.clicks,
    installs: row.installs,
    cr: row.clicks ? (row.ftds / row.clicks) * 100 : 0,
  }));

  const valueDomain = (data, key) => [
    0,
    (dataMax) => {
      const maxValue = Math.max(dataMax || 0, ...data.map((item) => item[key] || 0));
      return maxValue > 0 ? Math.ceil(maxValue * 1.15) : 10;
    },
  ];

  const TopOsIcon = getOsIconComponent(topOs?.name);
  const topOsAccent = getOsAccent(topOs?.name);

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Top OS",
            value: topOs?.name || "—",
            iconNode: <TopOsIcon size={18} style={{ color: topOsAccent }} />,
            meta: topOs ? `${t("Revenue")}: ${formatCurrency(topOs.revenue)}` : t("No data"),
          },
          {
            label: "Top OS Version",
            value: topOsVersion?.label || "—",
            icon: Wallet,
            meta: topOsVersion ? `${t("Revenue")}: ${formatCurrency(topOsVersion.revenue)}` : t("No data"),
          },
          {
            label: "Top OS Installs",
            value: topOsVersion ? Number(topOsVersion.installs || 0).toLocaleString() : "0",
            icon: Download,
            meta: topOsVersion ? topOsVersion.label : t("No data"),
          },
          {
            label: "Top OS CR",
            value: `${topOsVersionCr.toFixed(2)}%`,
            icon: Target,
            meta: topOsVersion ? `${t("FTD / Clicks")} · ${topOsVersion.label}` : t("No data"),
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <div className="card-head">
                {stat.iconNode || (Icon ? <Icon size={18} /> : null)}
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </motion.div>
          );
        })}
      </section>

      <section className="panels device-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Revenue by OS")}</h3>
              <p className="panel-subtitle">{t("Track revenue contribution by OS.")}</p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={osChartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="deviceRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="os" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tick={axisTickStyle}
                  domain={valueDomain(osChartData, "revenue")}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatCurrency(value), t("Revenue")]}
                />
                <Bar dataKey="revenue" fill="url(#deviceRevenue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Click by OS")}</h3>
              <p className="panel-subtitle">{t("Clicks volume grouped by OS.")}</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={osChartData}
                margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
                layout="vertical"
                barCategoryGap={12}
              >
                <defs>
                  <linearGradient id="deviceClicks" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickFormatter={(value) => Number(value || 0).toLocaleString()}
                  domain={valueDomain(osChartData, "clicks")}
                />
                <YAxis
                  type="category"
                  dataKey="os"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  width={90}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [value?.toLocaleString?.() ?? value, t("Clicks")]}
                />
                <Bar dataKey="clicks" fill="url(#deviceClicks)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Install By OS")}</h3>
              <p className="panel-subtitle">{t("Install postbacks grouped by OS.")}</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={osChartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="deviceInstalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="os" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [value?.toLocaleString?.() ?? value, t("Install")]}
                />
                <Bar dataKey="installs" fill="url(#deviceInstalls)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("CR by OS")}</h3>
              <p className="panel-subtitle">{t("FTD conversion rate by OS.")}</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={osChartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="deviceCr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--orange)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="os" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} domain={[0, 100]} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${Number(value || 0).toFixed(2)}%`, t("Conversion Rate")]}
                />
                <Bar dataKey="cr" fill="url(#deviceCr)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Device Breakdown")}</h3>
              <p className="panel-subtitle">{t("Clicks, installs, revenue, and CR by device.")}</p>
            </div>
          </div>

          {deviceState.loading ? (
            <div className="empty-state">{t("Loading device stats…")}</div>
          ) : deviceState.error ? (
            <div className="empty-state error">{deviceState.error}</div>
          ) : deviceChartData.length === 0 ? (
            <div className="empty-state">{t("No device data available yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>{t("Device")}</th>
                    <th>{t("OS")}</th>
                    <th>{t("OS Version")}</th>
                    <th>{t("Device Model")}</th>
                    <th>{t("Clicks")}</th>
                    <th>{t("Installs")}</th>
                    <th>{t("Registers")}</th>
                    <th>{t("FTDs")}</th>
                    <th>{t("Revenue")}</th>
                    <th>{t("Conversion Rate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceChartData.map((row) => {
                    const stats = deviceMap.get(row.key);
                    return (
                      <tr key={row.key}>
                        <td>{row.device}</td>
                        <td>{row.os || "—"}</td>
                        <td>{row.osVersion || "—"}</td>
                        <td>{row.deviceModel || "—"}</td>
                        <td>{row.clicks.toLocaleString()}</td>
                        <td>{row.installs.toLocaleString()}</td>
                        <td>{stats?.registers.toLocaleString() || "0"}</td>
                        <td>{stats?.ftds.toLocaleString() || "0"}</td>
                        <td>{formatCurrency(row.revenue)}</td>
                        <td>{`${row.cr.toFixed(2)}%`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function GoalsDashboard({ authUser }) {
  const { t } = useLanguage();
  const [goalForm, setGoalForm] = React.useState({
    buyer: "DeusInsta",
    country: defaultCountryOption,
    period: "Monthly",
    dateFrom: "2026-02-01",
    dateTo: "2026-02-28",
    ftdsTarget: "",
    r2dTarget: "",
    revenueTarget: "",
    isGlobal: false,
    notes: "",
  });
  const [goals, setGoals] = React.useState([]);
  const [goalState, setGoalState] = React.useState({ loading: true, error: null });
  const [statsEntries, setStatsEntries] = React.useState([]);
  const [teamForm, setTeamForm] = React.useState({
    name: "",
    role: "Media Buyer",
    country: defaultCountryOption,
    approach: "Paid Social",
    game: "",
    email: "",
    contact: "",
    status: "Active",
    tag: "",
    keitaro_name: "",
  });
  const [teamMembers, setTeamMembers] = React.useState([]);
  const [teamState, setTeamState] = React.useState({ loading: true, error: null });
  const [statusFilter, setStatusFilter] = React.useState("all");

  const updateGoalForm = (key) => (event) => {
    setGoalForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const updateTeamForm = (key) => (event) => {
    setTeamForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetGoalForm = () => {
    setGoalForm({
      buyer: "DeusInsta",
      country: defaultCountryOption,
      period: "Monthly",
      dateFrom: "2026-02-01",
      dateTo: "2026-02-28",
      ftdsTarget: "",
      r2dTarget: "",
      revenueTarget: "",
      isGlobal: false,
      notes: "",
    });
  };

  // Period → Date range auto-fill helper
  // When user picks "Daily/Weekly/Monthly", auto-fill the date range to the current period.
  // "Custom" leaves dates as-is so user can pick freely.
  const applyPeriodRange = (period) => {
    const today = new Date();
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let from = null, to = null;
    if (period === "Daily") {
      from = today; to = today;
    } else if (period === "Weekly") {
      // Monday-Sunday of the current week
      const dayIdx = today.getDay(); // 0=Sun..6=Sat
      const mondayOffset = dayIdx === 0 ? -6 : 1 - dayIdx;
      const monday = new Date(today); monday.setDate(monday.getDate() + mondayOffset);
      const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
      from = monday; to = sunday;
    } else if (period === "Monthly") {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0); // last day of month
    } else {
      return null; // Custom — don't change
    }
    return { from: fmt(from), to: fmt(to) };
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: "",
      role: "Media Buyer",
      country: defaultCountryOption,
      approach: "Paid Social",
      game: "",
      email: "",
      contact: "",
      status: "Active",
      tag: "",
      keitaro_name: "",
    });
  };

  const fetchGoals = React.useCallback(async () => {
    try {
      setGoalState({ loading: true, error: null });
      const response = await apiFetch("/api/goals?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load goals.");
      }
      const data = await response.json();
      setGoals(data);
      setGoalState({ loading: false, error: null });
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to load goals." });
    }
  }, []);

  const fetchGoalStats = React.useCallback(async () => {
    try {
      const response = await apiFetch("/api/media-stats?limit=500");
      if (!response.ok) return;
      const data = await response.json();
      setStatsEntries(data);
    } catch (error) {
      setStatsEntries([]);
    }
  }, []);

  const fetchTeamMembers = React.useCallback(async () => {
    try {
      setTeamState({ loading: true, error: null });
      const response = await apiFetch("/api/media-buyers?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load media buyers.");
      }
      const data = await response.json();
      setTeamMembers(data);
      setTeamState({ loading: false, error: null });
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to load media buyers." });
    }
  }, []);

  React.useEffect(() => {
    fetchGoals();
    fetchGoalStats();
    fetchTeamMembers();
  }, [fetchGoals, fetchGoalStats, fetchTeamMembers]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchGoalStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchGoalStats]);

  const handleGoalSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save goal.");
      }
      await fetchGoals();
      resetGoalForm();
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to save goal." });
    }
  };

  const handleTeamSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/media-buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save media buyer.");
      }
      await fetchTeamMembers();
      resetTeamForm();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to save media buyer." });
    }
  };

  const handleGoalDuplicate = (goal) => {
    // Shift dates forward by one period length so leadership can roll forward easily.
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let nextFrom = goal.date_from;
    let nextTo = goal.date_to;
    const from = goal.date_from ? new Date(`${goal.date_from}T00:00:00`) : null;
    const to = goal.date_to ? new Date(`${goal.date_to}T00:00:00`) : null;
    if (from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      const days = Math.round((to - from) / 86400000) + 1;
      const newFrom = new Date(to);
      newFrom.setDate(newFrom.getDate() + 1);
      const newTo = new Date(newFrom);
      newTo.setDate(newTo.getDate() + days - 1);
      nextFrom = fmt(newFrom);
      nextTo = fmt(newTo);
    }
    setGoalForm({
      isGlobal: !!goal.is_global,
      buyer: goal.buyer || "",
      country: goal.country || "",
      period: goal.period || "Monthly",
      dateFrom: nextFrom || "",
      dateTo: nextTo || "",
      ftdsTarget: goal.ftds_target ? String(goal.ftds_target) : "",
      revenueTarget: goal.revenue_target ? String(goal.revenue_target) : "",
      r2dTarget: goal.r2d_target ? String(goal.r2d_target) : "",
      notes: goal.notes || "",
    });
    // Smooth-scroll to the form so leadership sees the prefilled values.
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const formEl = document.querySelector(".goals-form");
        if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const handleGoalDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete goal.");
      }
      await fetchGoals();
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to delete goal." });
    }
  };

  const handleTeamDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/media-buyers/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete media buyer.");
      }
      await fetchTeamMembers();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to delete media buyer." });
    }
  };

  const sum = (value) => Number(value || 0);
  const inRange = (date, from, to) => {
    if (!date || !from || !to) return false;
    return date >= from && date <= to;
  };

  const totalsForGoal = (goal, viewerBuyer) =>
    statsEntries
      .filter((row) => {
        if (!inRange(row.date, goal.date_from, goal.date_to)) return false;
        if (goal.country && row.country !== goal.country) return false;
        if (goal.is_global) {
          if (viewerBuyer) return row.buyer === viewerBuyer;
          return true;
        }
        return row.buyer === goal.buyer;
      })
      .reduce(
        (acc, row) => ({
          clicks: acc.clicks + sum(row.clicks),
          registers: acc.registers + sum(row.registers),
          ftds: acc.ftds + sum(row.ftds),
          spend: acc.spend + sum(row.spend),
        }),
        { clicks: 0, registers: 0, ftds: 0, spend: 0 }
      );

  const formatProgress = (actual, target) => {
    if (actual === null || actual === undefined || !target || Number(target) <= 0)
      return { label: "—", pct: null };
    const pct = Math.min(100, (actual / Number(target)) * 100);
    return { label: `${pct.toFixed(1)}%`, pct };
  };

  const buyerDirectoryOptions = Array.from(
    new Set([...buyerOptions, ...teamMembers.map((member) => member.name).filter(Boolean)])
  );
  const mediaBuyerApproaches = approachOptions.filter((item) => item !== "All");
  const currentRole = authUser?.role || "Media Buyer";
  const isLeadership = isLeadershipRole(currentRole);
  const buyerId = authUser?.buyerId;
  const buyerNameFromId = teamMembers.find((member) => member.id === buyerId)?.name;
  const viewerBuyer = buyerNameFromId || authUser?.username || "";
  const displayGoals = goals
    .filter((goal) => {
      if (isLeadership) return true;
      if (goal.is_global) return true;
      if (!viewerBuyer) return false;
      return goal.buyer === viewerBuyer;
    })
    .sort((a, b) => (b.is_global ? 1 : 0) - (a.is_global ? 1 : 0));

  const getGoalProgress = (goal) => {
    const totals = totalsForGoal(goal, goal.is_global && !isLeadership ? viewerBuyer : null);
    const ftdProgress = formatProgress(totals.ftds, goal.ftds_target);
    const r2dActual = totals.registers > 0 ? (totals.ftds / totals.registers) * 100 : null;
    const r2dProgress = formatProgress(r2dActual, goal.r2d_target);
    const progressValues = [ftdProgress.pct, r2dProgress.pct].filter((value) => value !== null);
    const overall =
      progressValues.length > 0
        ? progressValues.reduce((sumVal, value) => sumVal + value, 0) / progressValues.length
        : null;
    const status =
      overall === null
        ? "none"
        : overall >= 100
          ? "achieved"
          : overall >= 80
            ? "on-track"
            : overall >= 60
              ? "at-risk"
              : "behind";
    const statusLabel =
      status === "none"
        ? t("No targets")
        : status === "achieved"
          ? t("Achieved")
          : status === "on-track"
            ? t("On track")
            : status === "at-risk"
              ? t("At risk")
              : t("Behind");

    // Pace calculation: compare actual daily rate vs. required daily rate.
    // Only meaningful when the goal period is in progress (not finished, not future).
    let pace = null;
    const from = goal.date_from ? new Date(`${goal.date_from}T00:00:00`) : null;
    const to = goal.date_to ? new Date(`${goal.date_to}T23:59:59`) : null;
    const today = new Date();
    const ftdsTargetNum = Number(goal.ftds_target || 0);
    if (
      from && to &&
      !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) &&
      today >= from && ftdsTargetNum > 0 && status !== "achieved"
    ) {
      const totalMs = Math.max(1, to.getTime() - from.getTime());
      const elapsedMs = Math.max(1, Math.min(today.getTime(), to.getTime()) - from.getTime());
      const totalDays = Math.max(1, Math.round(totalMs / 86400000) + 1);
      const elapsedDays = Math.max(1, Math.round(elapsedMs / 86400000) + 1);
      const requiredPace = ftdsTargetNum / totalDays;
      const actualPace = totals.ftds / elapsedDays;
      const ratio = requiredPace > 0 ? actualPace / requiredPace : null;
      let paceStatus = "on-pace";
      let paceLabel = t("On pace");
      if (ratio !== null) {
        if (ratio >= 1.1) {
          paceStatus = "ahead";
          paceLabel = t("Ahead");
        } else if (ratio < 0.9) {
          paceStatus = "behind-pace";
          paceLabel = t("Behind pace");
        }
      }
      pace = { requiredPace, actualPace, ratio, status: paceStatus, label: paceLabel, elapsedDays, totalDays };
    }

    return { totals, ftdProgress, r2dActual, r2dProgress, overall, statusLabel, status, pace };
  };

  const goalSummary = React.useMemo(() => {
    return displayGoals.reduce(
      (acc, goal) => {
        const { overall } = getGoalProgress(goal);
        if (overall !== null && overall >= 100) {
          acc.achieved += 1;
        } else {
          acc.unachieved += 1;
        }
        return acc;
      },
      { achieved: 0, unachieved: 0 }
    );
  }, [displayGoals, statsEntries, isLeadership, viewerBuyer]);

  return (
    <>
      <section className="panels goals-panels">
        {isLeadership ? (
          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("Goal Setup")}</h3>
                <p className="panel-subtitle">
                  {t("Define the target outcomes your media buyers must reach.")}
                </p>
              </div>
            </div>

            <form className="form-grid goals-form" onSubmit={handleGoalSubmit}>
              <div className="field">
                <label>{t("Goal Scope")}</label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={goalForm.isGlobal}
                    onChange={(event) =>
                      setGoalForm((prev) => ({ ...prev, isGlobal: event.target.checked }))
                    }
                  />
                  {t("Global Goal")}
                </label>
              </div>
              <div className="field">
                <label>{t("Media Buyer")}</label>
                <input
                  list="buyer-options"
                  value={goalForm.isGlobal ? t("All Buyers") : goalForm.buyer}
                  onChange={updateGoalForm("buyer")}
                  disabled={goalForm.isGlobal}
                />
                <datalist id="buyer-options">
                  {buyerDirectoryOptions.map((buyer) => (
                    <option key={buyer} value={buyer} />
                  ))}
                </datalist>
              </div>
              <div className="field">
                <label>{t("Country")}</label>
                <CountryDropdownPicker
                  value={goalForm.country}
                  onChange={(country) => setGoalForm((prev) => ({ ...prev, country }))}
                  options={countryOptions}
                  placeholder={t("Select")}
                  searchPlaceholder={t("Type to find countries")}
                  emptyResultsLabel={t("No countries found.")}
                />
              </div>
              <div className="field">
                <label>{t("Period")}</label>
                <Select
                  value={goalForm.period}
                  onChange={(v) => {
                    const range = applyPeriodRange(v);
                    setGoalForm((prev) => ({
                      ...prev,
                      period: v,
                      ...(range ? { dateFrom: range.from, dateTo: range.to } : {}),
                    }));
                  }}
                  options={["Daily", "Weekly", "Monthly", "Custom"].map((item) => ({ value: item, label: t(item) }))}
                  placeholder={t("Select")}
                />
              </div>
              <div className="field goal-range">
                <label>{t("Date Range")}</label>
                <div className="goal-date-presets">
                  {[
                    { label: t("Today"), range: { from: new Date(), to: new Date() } },
                    { label: t("This Week"), range: applyPeriodRange("Weekly") },
                    { label: t("This Month"), range: applyPeriodRange("Monthly") },
                    { label: t("Next 7d"), range: (() => { const f = new Date(); const tt = new Date(); tt.setDate(tt.getDate() + 6); return { from: f, to: tt }; })() },
                    { label: t("Next 30d"), range: (() => { const f = new Date(); const tt = new Date(); tt.setDate(tt.getDate() + 29); return { from: f, to: tt }; })() },
                  ].map((preset) => {
                    const fmt = (d) => d instanceof Date
                      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                      : d;
                    const from = preset.range?.from ? fmt(preset.range.from) : null;
                    const to = preset.range?.to ? fmt(preset.range.to) : null;
                    const isActive = from && to && goalForm.dateFrom === from && goalForm.dateTo === to;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        className={`date-preset${isActive ? " is-active" : ""}`}
                        onClick={() => from && to && setGoalForm((prev) => ({ ...prev, dateFrom: from, dateTo: to }))}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <div className="field-row">
                  <DeusDatePicker value={goalForm.dateFrom} onChange={(v) => setGoalForm((prev) => ({ ...prev, dateFrom: v }))} />
                  <span className="field-sep">{t("to")}</span>
                  <DeusDatePicker value={goalForm.dateTo} onChange={(v) => setGoalForm((prev) => ({ ...prev, dateTo: v }))} />
                </div>
              </div>
              {(() => {
                // Compute period duration + required pace for live hints
                const from = goalForm.dateFrom ? new Date(`${goalForm.dateFrom}T00:00:00`) : null;
                const to = goalForm.dateTo ? new Date(`${goalForm.dateTo}T00:00:00`) : null;
                const validRange = from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime());
                const days = validRange ? Math.max(1, Math.round((to - from) / 86400000) + 1) : null;
                const ftdsNum = Number(goalForm.ftdsTarget || 0);
                const revenueNum = Number(goalForm.revenueTarget || 0);
                const ftdsPace = days && ftdsNum > 0 ? (ftdsNum / days) : null;
                const revenuePace = days && revenueNum > 0 ? (revenueNum / days) : null;
                const fmt = (v) => v >= 10 ? Math.round(v).toString() : v.toFixed(1);
                return (
                  <>
                    <div className="field">
                      <label>
                        {t("FTDs Target")}
                        {ftdsPace !== null ? <span className="field-pace-hint">~{fmt(ftdsPace)}/{t("day")} · {days} {days === 1 ? t("day") : t("days")}</span> : null}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="50"
                        value={goalForm.ftdsTarget}
                        onChange={updateGoalForm("ftdsTarget")}
                      />
                    </div>
                    <div className="field">
                      <label>
                        {t("Revenue Target")}
                        {revenuePace !== null ? <span className="field-pace-hint">~{formatCurrency(revenuePace)}/{t("day")}</span> : null}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="$10,000"
                        value={goalForm.revenueTarget}
                        onChange={updateGoalForm("revenueTarget")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Reg2Dep Target (%)")}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="25.0"
                        value={goalForm.r2dTarget}
                        onChange={updateGoalForm("r2dTarget")}
                      />
                    </div>
                  </>
                );
              })()}
              <div className="field">
                <label>{t("Notes")}</label>
                <input value={goalForm.notes} onChange={updateGoalForm("notes")} placeholder={t("Optional context, reward, or constraint")} />
              </div>
              {(() => {
                // Live goal preview — mirrors the saved goal card
                const from = goalForm.dateFrom ? new Date(`${goalForm.dateFrom}T00:00:00`) : null;
                const to = goalForm.dateTo ? new Date(`${goalForm.dateTo}T00:00:00`) : null;
                const validRange = from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime());
                const days = validRange ? Math.max(1, Math.round((to - from) / 86400000) + 1) : null;
                const ftdsNum = Number(goalForm.ftdsTarget || 0);
                const revenueNum = Number(goalForm.revenueTarget || 0);
                const r2dNum = Number(goalForm.r2dTarget || 0);
                const hasAny = ftdsNum > 0 || revenueNum > 0 || r2dNum > 0;
                const scope = goalForm.isGlobal
                  ? t("All Buyers")
                  : (goalForm.buyer || t("Any Buyer"));
                const country = goalForm.country || t("Any Country");
                const period = goalForm.period || t("Custom");
                const fmtNum = (v) => v >= 10 ? Math.round(v).toString() : v.toFixed(1);
                return (
                  <div className="goal-preview-card">
                    <div className="goal-preview-head">
                      <span className="goal-preview-tag">{t("Preview")}</span>
                      <span className="goal-preview-period">{t(period)}</span>
                    </div>
                    <div className="goal-preview-scope">
                      <strong>{scope}</strong>
                      <span className="goal-preview-dot">·</span>
                      <span>{country}</span>
                      {days ? (
                        <>
                          <span className="goal-preview-dot">·</span>
                          <span>{days} {days === 1 ? t("day") : t("days")}</span>
                        </>
                      ) : null}
                    </div>
                    {hasAny ? (
                      <div className="goal-preview-metrics">
                        {ftdsNum > 0 ? (
                          <div className="goal-preview-metric">
                            <span className="goal-preview-label">{t("FTDs")}</span>
                            <span className="goal-preview-value">{ftdsNum}</span>
                            {days ? <span className="goal-preview-pace">~{fmtNum(ftdsNum / days)}/{t("day")}</span> : null}
                          </div>
                        ) : null}
                        {revenueNum > 0 ? (
                          <div className="goal-preview-metric">
                            <span className="goal-preview-label">{t("Revenue")}</span>
                            <span className="goal-preview-value">{formatCurrency(revenueNum)}</span>
                            {days ? <span className="goal-preview-pace">~{formatCurrency(revenueNum / days)}/{t("day")}</span> : null}
                          </div>
                        ) : null}
                        {r2dNum > 0 ? (
                          <div className="goal-preview-metric">
                            <span className="goal-preview-label">{t("R2D")}</span>
                            <span className="goal-preview-value">{r2dNum}%</span>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="goal-preview-empty">
                        {t("Add a target to see your goal preview.")}
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="form-actions">
                <button className="ghost" type="button" onClick={resetGoalForm}>
                  {t("Reset")}
                </button>
                <button className="action-pill" type="submit">
                  {t("Add Goal")}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("Goals Assigned")}</h3>
                <p className="panel-subtitle">
                  {t("Your goals are managed by leadership. Track progress below.")}
                </p>
              </div>
            </div>
            <div className="empty-state">{t("No goal setup access for your role.")}</div>
          </motion.div>
        )}

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Goals Overview")}</h3>
              <p className="panel-subtitle">
                {t("Track progress vs. targets using live statistics data.")}
              </p>
            </div>
          </div>

          {goalState.loading ? (
            <div className="empty-state">{t("Loading goals…")}</div>
          ) : goalState.error ? (
            <div className="empty-state error">{goalState.error}</div>
          ) : displayGoals.length === 0 ? (
            <div className="empty-state">{t("No goals set yet.")}</div>
          ) : (
            (() => {
              // Pre-compute progress + status for all goals (used for both summary + filtering)
              const withInfo = displayGoals.map((g) => ({ goal: g, info: getGoalProgress(g) }));
              const counts = { all: withInfo.length, behind: 0, "at-risk": 0, "on-track": 0, achieved: 0, none: 0 };
              withInfo.forEach(({ info }) => {
                counts[info.status] = (counts[info.status] || 0) + 1;
              });
              const filtered = statusFilter === "all"
                ? withInfo
                : withInfo.filter(({ info }) => info.status === statusFilter);

              const tabs = [
                { key: "all", label: t("All"), count: counts.all, tone: "neutral" },
                { key: "behind", label: t("Behind"), count: counts.behind, tone: "red" },
                { key: "at-risk", label: t("At risk"), count: counts["at-risk"], tone: "yellow" },
                { key: "on-track", label: t("On track"), count: counts["on-track"], tone: "green" },
                { key: "achieved", label: t("Achieved"), count: counts.achieved, tone: "green-solid" },
              ];

              return (
            <>
              <div className="goal-summary-strip">
                {tabs.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`goal-summary-tab tone-${item.tone}${statusFilter === item.key ? " is-active" : ""}`}
                    onClick={() => setStatusFilter(item.key)}
                    disabled={item.key !== "all" && item.count === 0}
                  >
                    <span className="goal-summary-tab-count">{item.count}</span>
                    <span className="goal-summary-tab-label">{item.label}</span>
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="empty-state">{t("No goals match this filter.")}</div>
              ) : (
              <div className="goal-list">
                {filtered
                  .sort((a, b) => {
                    // Sort urgent goals first: behind > at-risk > on-track > achieved
                    const order = { behind: 0, "at-risk": 1, "on-track": 2, achieved: 3, none: 4 };
                    const aRank = order[a.info.status] ?? 5;
                    const bRank = order[b.info.status] ?? 5;
                    if (aRank !== bRank) return aRank - bRank;
                    // Secondary: closer deadlines first
                    return (a.goal.date_to || "").localeCompare(b.goal.date_to || "");
                  })
                  .map(({ goal, info }) => {
                  const { totals, ftdProgress, r2dActual, r2dProgress, overall, statusLabel, status, pace } = info;
                  const statusClass = `status-${status}`;
                return (
                  <div key={goal.id} className={`goal-card ${statusClass}${goal.is_global ? " is-global" : ""}`}>
                    <div className="goal-banner">
                      <div className="goal-banner-main">
                        <div>
                          <div className="goal-title">
                            {goal.is_global ? t("Global Goal") : goal.buyer}
                          </div>
                          <div className="goal-sub">
                            {t(goal.period)} · {goal.country || t("All Countries")} · {goal.date_from} → {goal.date_to}
                            {goal.is_global && !isLeadership ? ` · ${t("Based on your metrics")}` : ""}
                          </div>
                        </div>
                        <div className="goal-actions">
                          {pace ? (
                            <span
                              className={`goal-pace-badge ${pace.status}`}
                              title={`${t("Required")}: ~${pace.requiredPace >= 10 ? Math.round(pace.requiredPace) : pace.requiredPace.toFixed(1)}/${t("day")} · ${t("Actual")}: ~${pace.actualPace >= 10 ? Math.round(pace.actualPace) : pace.actualPace.toFixed(1)}/${t("day")}`}
                            >
                              {pace.label}
                            </span>
                          ) : null}
                          <span className={`goal-status ${status}`}>
                            {statusLabel}
                          </span>
                          {isLeadership ? (
                            <>
                              <button
                                className="icon-btn"
                                type="button"
                                title={t("Duplicate goal")}
                                onClick={() => handleGoalDuplicate(goal)}
                              >
                                <Copy size={16} />
                              </button>
                              <button className="icon-btn" type="button" onClick={() => handleGoalDelete(goal.id)}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="goal-banner-metrics">
                        <div className="goal-banner-item">
                          <span>{t("FTDs Target")}</span>
                          <strong>
                            {goal.ftds_target && Number(goal.ftds_target) > 0
                              ? Number(goal.ftds_target).toLocaleString()
                              : "—"}
                          </strong>
                        </div>
                        <div className="goal-banner-item">
                          <span>{t("Reg2Dep Target (%)")}</span>
                          <strong>
                            {goal.r2d_target && Number(goal.r2d_target) > 0
                              ? `${Number(goal.r2d_target).toFixed(2)}%`
                              : "—"}
                          </strong>
                        </div>
                        <div className="goal-banner-item">
                          <span>{goal.is_global && !isLeadership ? t("Your Progress") : t("Progress")}</span>
                          <strong>{overall === null ? "—" : `${overall.toFixed(1)}%`}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="goal-metrics">
                      {[
                        {
                          label: "FTDs",
                          actual: totals.ftds,
                          target: goal.ftds_target,
                          progress: ftdProgress,
                          color: "var(--green)",
                        },
                        {
                          label: "Reg2Dep",
                          actual: r2dActual,
                          target: goal.r2d_target,
                          progress: r2dProgress,
                          color: "var(--blue)",
                          isPercent: true,
                        },
                      ].map((metric) => {
                        const actualLabel = metric.isPercent
                          ? metric.actual === null
                            ? "—"
                            : `${metric.actual.toFixed(2)}%`
                          : metric.actual.toLocaleString();
                        const targetLabel =
                          metric.target && Number(metric.target) > 0
                            ? metric.isPercent
                              ? `${Number(metric.target).toFixed(2)}%`
                              : Number(metric.target).toLocaleString()
                            : "—";
                        return (
                          <div key={metric.label} className="goal-metric" style={{ "--goal-color": metric.color }}>
                            <div className="goal-metric-head">
                              <span>{t(metric.label)}</span>
                              <span className="goal-metric-pct">{metric.progress.label}</span>
                            </div>
                            <div className="goal-metric-value">
                              {actualLabel}
                              <span> / {targetLabel}</span>
                            </div>
                            <div className="goal-bar">
                              <span
                                className="goal-bar-fill"
                                style={{ width: metric.progress.pct ? `${metric.progress.pct}%` : "0%" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {(() => {
                      // Pace + forecast widget — turns "set target" into "here's how to hit it"
                      const target = Number(goal.ftds_target || 0);
                      if (target <= 0) return null;

                      const dayMs = 86400000;
                      const from = new Date(`${goal.date_from}T00:00:00`);
                      const to = new Date(`${goal.date_to}T00:00:00`);
                      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;

                      const todayRaw = new Date();
                      const today = new Date(todayRaw.getFullYear(), todayRaw.getMonth(), todayRaw.getDate());
                      const totalDays = Math.max(1, Math.round((to - from) / dayMs) + 1);
                      const actual = Number(totals.ftds || 0);

                      // Period not started yet
                      if (today < from) {
                        const startsIn = Math.ceil((from - today) / dayMs);
                        return (
                          <div className="goal-pace pending">
                            <div className="goal-pace-hint">
                              <span className="goal-pace-mark">◷</span>
                              Period starts in <strong>{startsIn} {startsIn === 1 ? "day" : "days"}</strong> · {totalDays}-day target
                            </div>
                          </div>
                        );
                      }

                      // Period ended
                      const periodEnded = today > to;
                      const clampedToday = periodEnded ? to : today;
                      const daysElapsed = Math.max(1, Math.round((clampedToday - from) / dayMs) + 1);
                      const daysRemaining = Math.max(0, totalDays - daysElapsed);

                      const currentPace = actual / daysElapsed;
                      const requiredPace = daysRemaining > 0 ? Math.max(0, (target - actual) / daysRemaining) : 0;
                      const projected = periodEnded ? actual : currentPace * totalDays;
                      const projectedPct = target > 0 ? (projected / target) * 100 : 0;

                      const goalAchieved = actual >= target;
                      const status = goalAchieved
                        ? "achieved"
                        : projectedPct >= 100
                          ? "on-track"
                          : projectedPct >= 70
                            ? "at-risk"
                            : "behind";

                      const fmtPace = (v) => (v >= 10 ? Math.round(v).toString() : v.toFixed(1));

                      const hint = goalAchieved
                        ? `Goal hit — ${actual} of ${target} FTDs`
                        : periodEnded
                          ? `Period ended at ${Math.round(projectedPct)}% of target`
                          : projectedPct >= 100
                            ? `On track to reach ${target} FTDs`
                            : `Need ${fmtPace(requiredPace)}/day for ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} to hit ${target}`;

                      return (
                        <div className={`goal-pace ${status}`}>
                          <div className="goal-pace-row">
                            <div className="goal-pace-cell">
                              <span className="goal-pace-label">Days left</span>
                              <span className="goal-pace-value">
                                {daysRemaining}
                                <small>/ {totalDays}</small>
                              </span>
                            </div>
                            <div className="goal-pace-cell">
                              <span className="goal-pace-label">Current pace</span>
                              <span className="goal-pace-value">
                                {fmtPace(currentPace)}
                                <small>/day</small>
                              </span>
                            </div>
                            <div className="goal-pace-cell">
                              <span className="goal-pace-label">Required</span>
                              <span className="goal-pace-value">
                                {requiredPace > 0 ? fmtPace(requiredPace) : "✓"}
                                {requiredPace > 0 ? <small>/day</small> : null}
                              </span>
                            </div>
                            <div className="goal-pace-cell">
                              <span className="goal-pace-label">Forecast</span>
                              <span className="goal-pace-value">
                                {Math.round(projected)}
                                <small>({Math.round(projectedPct)}%)</small>
                              </span>
                            </div>
                          </div>
                          <div className="goal-pace-hint">
                            <span className="goal-pace-mark">{status === "achieved" ? "✓" : status === "on-track" ? "→" : status === "at-risk" ? "!" : "↓"}</span>
                            {hint}
                          </div>
                        </div>
                      );
                    })()}
                    {goal.notes ? <div className="goal-notes">{goal.notes}</div> : null}
                  </div>
                );
              })}
              </div>
              )}
            </>
              );
            })()
          )}
        </motion.div>
      </section>


    </>
  );
}

function DomainsDashboard({ authUser }) {
  const { t } = useLanguage();
  const ownerRole = authUser?.role || roleOptions[0];
  const canManageDomains = isLeadershipRole(authUser?.role);
  const [domainForm, setDomainForm] = React.useState(() => ({
    domain: "",
    status: "Active",
    game: "",
    platform: "PWA Group",
    countries: [],
    ownerRole,
  }));
  const [domains, setDomains] = React.useState([]);
  const [domainState, setDomainState] = React.useState({ loading: true, error: null });
  const [users, setUsers] = React.useState([]);
  const [userState, setUserState] = React.useState({ loading: true, error: null });
  const [tableDomainFilter, setTableDomainFilter] = React.useState([]);
  const [tableGameFilter, setTableGameFilter] = React.useState([]);
  const [tablePlatformFilter, setTablePlatformFilter] = React.useState([]);
  const [tableGeoFilter, setTableGeoFilter] = React.useState([]);
  const [tableOwnerFilter, setTableOwnerFilter] = React.useState([]);
  const [tableStatusFilter, setTableStatusFilter] = React.useState([]);
  const toggleTableFilter = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));

  const updateDomainForm = (key) => (event) => {
    setDomainForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetDomainForm = () => {
    setDomainForm({
      domain: "",
      status: "Active",
      game: "",
      platform: "PWA Group",
      countries: [],
      ownerRole,
    });
  };

  const toggleDomainCountry = React.useCallback((country) => {
    const normalized = String(country || "").trim();
    if (!normalized) return;
    setDomainForm((prev) => {
      const current = normalizeCountryListValue(prev.countries);
      const hasCountry = current.includes(normalized);
      if (!hasCountry && current.length >= 50) {
        setDomainState({ loading: false, error: "You can select up to 50 countries." });
        return prev;
      }
      return {
        ...prev,
        countries: hasCountry
          ? current.filter((item) => item !== normalized)
          : [...current, normalized],
      };
    });
  }, []);

  React.useEffect(() => {
    setDomainForm((prev) => ({ ...prev, ownerRole }));
  }, [ownerRole]);

  // Standard SaaS registry: creation form collapsed behind "+ Add" by default.
  const [showForm, setShowForm] = React.useState(false);

  // Full domain edit modal (domain, game, platform, geos, owner)
  const [domainEdit, setDomainEdit] = React.useState({
    open: false,
    domain: null,
    saving: false,
    error: null,
    form: { domain: "", game: "", platform: "PWA Group", countries: [], ownerId: "" },
  });

  const openDomainEdit = (domain) => {
    if (!domain?.id) return;
    setDomainEdit({
      open: true,
      domain,
      saving: false,
      error: null,
      form: {
        domain: String(domain.domain || ""),
        game: String(domain.game || ""),
        platform: String(domain.platform || "PWA Group"),
        countries: normalizeCountryListValue(
          Array.isArray(domain?.countries) && domain.countries.length ? domain.countries : domain?.country
        ),
        ownerId: domain.owner_id ? String(domain.owner_id) : "",
      },
    });
  };

  const closeDomainEdit = () => {
    setDomainEdit({ open: false, domain: null, saving: false, error: null, form: { domain: "", game: "", platform: "PWA Group", countries: [], ownerId: "" } });
  };

  // Open Graph / Sharing Debugger modal (Meta domain verification preview)
  const [ogDebug, setOgDebug] = React.useState({
    open: false,
    domain: null,
    loading: false,
    error: null,
    data: null,
  });
  const [ogHistoryOpen, setOgHistoryOpen] = React.useState(false);
  const [scrapeAll, setScrapeAll] = React.useState({ loading: false, message: "", error: false });

  const handleScrapeAll = async () => {
    setScrapeAll({ loading: true, message: "", error: false });
    try {
      const response = await apiFetch("/api/domains/og-debug/scrape-all", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Scrape failed.");
      setScrapeAll({
        loading: false,
        error: false,
        message: `Scanned ${data.scanned}, ${data.changed} updated, ${data.failed} failed${
          data.noToken ? ` · ${data.noToken} missing token` : ""
        }.`,
      });
    } catch (error) {
      setScrapeAll({ loading: false, error: true, message: error.message || "Scrape failed." });
    }
  };

  // Always-available deep link to Facebook's own Sharing Debugger, built from
  // the domain client-side so it works even when our backend/token can't help.
  const fbDebuggerLink = (domain) => {
    const host = String(domain?.domain || "")
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");
    // Facebook's debugger expects the bare host in ?q= (e.g. ?q=santafeklanmx.click).
    return host
      ? `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(host)}`
      : null;
  };

  const openOgDebug = (domain, rescrape = false) => {
    if (!domain?.id) return;
    if (!rescrape) setOgHistoryOpen(false);
    setOgDebug((prev) => ({
      open: true,
      domain,
      loading: true,
      error: null,
      data: rescrape ? prev.data : null,
    }));
    (async () => {
      const fallbackLink = fbDebuggerLink(domain);
      try {
        const response = await apiFetch(
          `/api/domains/${domain.id}/og-debug${rescrape ? "?scrape=1" : ""}`
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const err = new Error(
            data?.error ||
              `Couldn't load debug info (HTTP ${response.status}) — the backend may need a redeploy or the Meta token is invalid.`
          );
          err.debuggerUrl = data?.debuggerUrl || fallbackLink;
          throw err;
        }
        setOgDebug({
          open: true,
          domain,
          loading: false,
          error: null,
          data: { ...data, debuggerUrl: data.debuggerUrl || fallbackLink },
        });
      } catch (error) {
        setOgDebug((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to load debug info.",
          data: { debuggerUrl: error.debuggerUrl || fallbackLink },
        }));
      }
    })();
  };

  const closeOgDebug = () => {
    setOgHistoryOpen(false);
    setOgDebug({ open: false, domain: null, loading: false, error: null, data: null });
  };

  const toggleDomainEditCountry = (country) => {
    const normalized = String(country || "").trim();
    if (!normalized) return;
    setDomainEdit((prev) => {
      const current = prev.form.countries || [];
      const has = current.includes(normalized);
      return {
        ...prev,
        form: {
          ...prev.form,
          countries: has ? current.filter((i) => i !== normalized) : [...current, normalized],
        },
      };
    });
  };

  const handleDomainEditSave = async () => {
    if (!domainEdit.domain?.id) return;
    const f = domainEdit.form;
    if (!String(f.domain).trim()) {
      setDomainEdit((prev) => ({ ...prev, error: "Domain is required." }));
      return;
    }
    if (!String(f.game).trim() || !String(f.platform).trim()) {
      setDomainEdit((prev) => ({ ...prev, error: "Game and platform are required." }));
      return;
    }
    if (!f.countries.length) {
      setDomainEdit((prev) => ({ ...prev, error: "Select at least one country." }));
      return;
    }
    setDomainEdit((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const response = await apiFetch(`/api/domains/${domainEdit.domain.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: f.domain,
          game: f.game,
          platform: f.platform,
          countries: f.countries,
          ...(canManageDomains && f.ownerId ? { ownerId: f.ownerId } : {}),
        }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail?.error || "Failed to update domain.");
      }
      await fetchDomains();
      closeDomainEdit();
    } catch (error) {
      setDomainEdit((prev) => ({ ...prev, saving: false, error: error.message || "Failed to update domain." }));
    }
  };

  const fetchDomains = React.useCallback(async () => {
    try {
      setDomainState({ loading: true, error: null });
      const response = await apiFetch("/api/domains?limit=5000");
      if (!response.ok) {
        throw new Error("Failed to load domains.");
      }
      const data = await response.json();
      setDomains(data);
      setDomainState({ loading: false, error: null });
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to load domains." });
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    try {
      setUserState({ loading: true, error: null });
      const response = await apiFetch("/api/users?limit=500");
      if (!response.ok) {
        throw new Error("Failed to load users.");
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setUserState({ loading: false, error: null });
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to load users." });
    }
  }, []);

  React.useEffect(() => {
    fetchDomains();
    fetchUsers();
  }, [fetchDomains, fetchUsers]);

  const userMap = React.useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      if (user?.id) {
        map.set(user.id, user.username);
      }
    });
    return map;
  }, [users]);

  const roleMap = React.useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      if (!user?.role || !user?.username) return;
      const list = map.get(user.role) || [];
      list.push(user.username);
      map.set(user.role, list);
    });
    return map;
  }, [users]);

  const resolveOwnerName = React.useCallback(
    (domain) => {
      if (!domain) return "—";
      if (domain.owner_name) return domain.owner_name;
      if (domain.owner_id && userMap.has(domain.owner_id)) {
        return userMap.get(domain.owner_id);
      }
      if (domain.owner_role) {
        const candidates = roleMap.get(domain.owner_role) || [];
        if (candidates.length === 1) {
          return candidates[0];
        }
        return t(domain.owner_role);
      }
      return "—";
    },
    [roleMap, t, userMap]
  );

  const handleDomainSubmit = async (event) => {
    event.preventDefault();
    const normalizedDomains = normalizeDomainInputList(domainForm.domain);
    const normalizedCountries = normalizeCountryListValue(domainForm.countries);
    if (!normalizedDomains.length) {
      setDomainState({ loading: false, error: "Domain and status are required." });
      return;
    }
    if (normalizedDomains.length > 50) {
      setDomainState({ loading: false, error: "You can register up to 50 domains per request." });
      return;
    }
    if (!normalizedCountries.length) {
      setDomainState({ loading: false, error: "At least one country is required." });
      return;
    }
    if (normalizedCountries.length > 50) {
      setDomainState({ loading: false, error: "You can select up to 50 countries." });
      return;
    }
    try {
      const response = await apiFetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...domainForm,
          domain: normalizedDomains.join(","),
          domains: normalizedDomains,
          country: normalizedCountries[0] || "",
          countries: normalizedCountries,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save domain.");
      }
      await fetchDomains();
      resetDomainForm();
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to save domain." });
    }
  };

  const handleDomainDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/domains/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete domain.");
      }
      await fetchDomains();
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to delete domain." });
    }
  };

  const handleDomainStatusChange = async (id, status) => {
    try {
      const response = await apiFetch(`/api/domains/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update domain status.");
      }
      await fetchDomains();
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to update domain status." });
    }
  };

  const visibleDomains = React.useMemo(() => {
    if (canManageDomains) return domains;
    return domains.filter((domain) => domain.owner_id === authUser?.id);
  }, [canManageDomains, domains, authUser?.id]);

  const domainTableRows = React.useMemo(
    () =>
      visibleDomains.map((domain) => ({
        domain,
        ownerLabel: resolveOwnerName(domain),
        countries: normalizeCountryListValue(
          Array.isArray(domain?.countries) && domain.countries.length ? domain.countries : domain?.country
        ),
      })),
    [visibleDomains, resolveOwnerName]
  );

  const domainFilterOptions = React.useMemo(() => {
    const unique = new Map();
    domainTableRows.forEach((row) => {
      const value = String(row.domain?.domain || "").trim();
      if (!value) return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [domainTableRows]);

  const gameFilterOptions = React.useMemo(() => {
    const unique = new Map();
    domainTableRows.forEach((row) => {
      const value = String(row.domain?.game || "").trim();
      if (!value) return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [domainTableRows]);

  const platformFilterOptions = React.useMemo(() => {
    const unique = new Map();
    domainTableRows.forEach((row) => {
      const value = String(row.domain?.platform || "").trim();
      if (!value) return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [domainTableRows]);

  const geoFilterOptions = React.useMemo(() => {
    const unique = new Map();
    domainTableRows.forEach((row) => {
      row.countries.forEach((country) => {
        const value = String(country || "").trim();
        if (!value) return;
        unique.set(value.toLowerCase(), value);
      });
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [domainTableRows]);

  const ownerFilterOptions = React.useMemo(() => {
    const unique = new Map();
    domainTableRows.forEach((row) => {
      const value = String(row.ownerLabel || "").trim();
      if (!value || value === "—") return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [domainTableRows]);

  const statusFilterOptions = React.useMemo(() => {
    const unique = new Map();
    domainTableRows.forEach((row) => {
      const value = String(row.domain?.status || "").trim();
      if (!value) return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: t(value),
        search: value,
        dot: STATUS_DOT_COLOR[value.toLowerCase()] || "#8a93a3",
      }));
  }, [domainTableRows, t]);

  React.useEffect(() => {
    // Prune any selected multi-filter values that are no longer valid options.
    // Return the same array ref when nothing changed to avoid a render loop.
    const prune = (setter, options) =>
      setter((prev) => {
        const next = prev.filter((v) => options.some((option) => option.value === v));
        return next.length === prev.length ? prev : next;
      });
    prune(setTableDomainFilter, domainFilterOptions);
    prune(setTableGameFilter, gameFilterOptions);
    prune(setTablePlatformFilter, platformFilterOptions);
    prune(setTableGeoFilter, geoFilterOptions);
    prune(setTableOwnerFilter, ownerFilterOptions);
    prune(setTableStatusFilter, statusFilterOptions);
  }, [
    domainFilterOptions,
    gameFilterOptions,
    platformFilterOptions,
    geoFilterOptions,
    ownerFilterOptions,
    statusFilterOptions,
  ]);

  const domainFiltersActive =
    tableDomainFilter.length > 0 ||
    tableGameFilter.length > 0 ||
    tablePlatformFilter.length > 0 ||
    tableGeoFilter.length > 0 ||
    tableOwnerFilter.length > 0 ||
    tableStatusFilter.length > 0;

  const clearDomainFilters = () => {
    setTableDomainFilter([]);
    setTableGameFilter([]);
    setTablePlatformFilter([]);
    setTableGeoFilter([]);
    setTableOwnerFilter([]);
    setTableStatusFilter([]);
  };

  // KPI strip: registry health at a glance (same DNA as Pixels/Accounts)
  const domainSummary = React.useMemo(() => {
    const total = domainTableRows.length;
    let active = 0;
    let attention = 0;
    let blocked = 0;
    domainTableRows.forEach((row) => {
      const s = String(row.domain?.status || "").toLowerCase();
      if (s === "active" || s === "") active += 1;
      else if (s === "pending" || s === "paused") attention += 1;
      else if (s === "blocked" || s === "expired") blocked += 1;
    });
    return { total, active, attention, blocked };
  }, [domainTableRows]);

  const [domPage, setDomPage] = React.useState(1);
  const [domainSearch, setDomainSearch] = React.useState("");
  const [domainSort, setDomainSort] = React.useState({ key: null, dir: "asc" });
  const toggleDomainSort = (key) => setDomainSort((prev) => toggleSortConfig(prev, key, "asc"));
  const getDomainSortValue = (row, key) => {
    switch (key) {
      case "domain": return row.domain?.domain || "";
      case "game": return row.domain?.game || "";
      case "platform": return row.domain?.platform || "";
      case "country": return row.countries?.[0] || "";
      case "owner": return row.ownerLabel || "";
      case "status": return row.domain?.status || "";
      default: return null;
    }
  };
  const normalizedDomainSearch = domainSearch.trim().toLowerCase();
  const filteredDomainRows = React.useMemo(
    () =>
      domainTableRows.filter((row) => {
        if (normalizedDomainSearch) {
          const hay = `${row.domain?.domain || ""} ${row.domain?.game || ""} ${row.ownerLabel || ""}`.toLowerCase();
          if (!hay.includes(normalizedDomainSearch)) return false;
        }
        if (tableDomainFilter.length && !tableDomainFilter.includes(String(row.domain?.domain || ""))) return false;
        if (tableGameFilter.length && !tableGameFilter.includes(String(row.domain?.game || ""))) return false;
        if (tablePlatformFilter.length && !tablePlatformFilter.includes(String(row.domain?.platform || ""))) return false;
        if (tableGeoFilter.length && !tableGeoFilter.some((g) => row.countries.includes(g))) return false;
        if (canManageDomains && tableOwnerFilter.length && !tableOwnerFilter.includes(row.ownerLabel)) return false;
        if (tableStatusFilter.length && !tableStatusFilter.includes(String(row.domain?.status || ""))) return false;
        return true;
      }),
    [
      domainTableRows,
      normalizedDomainSearch,
      tableDomainFilter,
      tableGameFilter,
      tablePlatformFilter,
      tableGeoFilter,
      tableOwnerFilter,
      tableStatusFilter,
      canManageDomains,
    ]
  );

  const sortedDomainRows = React.useMemo(() => {
    const rows = [...filteredDomainRows];
    if (!domainSort?.key) return rows;
    return rows.sort((a, b) =>
      compareSortValues(
        getDomainSortValue(a, domainSort.key),
        getDomainSortValue(b, domainSort.key),
        domainSort.dir,
        "text"
      )
    );
  }, [filteredDomainRows, domainSort]);

  const DOM_PAGE_SIZE = 50;
  const domPageCount = Math.max(1, Math.ceil(sortedDomainRows.length / DOM_PAGE_SIZE));
  const domClampedPage = Math.min(domPage, domPageCount);
  const pagedDomainRows = React.useMemo(
    () => sortedDomainRows.slice((domClampedPage - 1) * DOM_PAGE_SIZE, domClampedPage * DOM_PAGE_SIZE),
    [sortedDomainRows, domClampedPage]
  );
  const domPageList = React.useMemo(() => {
    const total = domPageCount;
    const cur = domClampedPage;
    const out = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) out.push(i);
    } else {
      out.push(1);
      const start = Math.max(2, cur - 1);
      const end = Math.min(total - 1, cur + 1);
      if (start > 2) out.push("ellipsis");
      for (let i = start; i <= end; i += 1) out.push(i);
      if (end < total - 1) out.push("ellipsis");
      out.push(total);
    }
    return out;
  }, [domPageCount, domClampedPage]);
  React.useEffect(() => {
    setDomPage(1);
  }, [sortedDomainRows]);

  return (
    <section className="form-section">
      <motion.div
        className="panel registry-dashboard-panel domain-registry-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><Globe size={20} /></span>
            <div>
              <h3 className="panel-title">{t("Domains Registry")}</h3>
              <p className="panel-subtitle">{t("Track every domain in use and keep its status updated.")}</p>
            </div>
          </div>
          <div className="panel-head-actions">
            <span className="roles-count">
              {visibleDomains.length} {t("domains")}
              {filteredDomainRows.length !== visibleDomains.length ? ` · ${filteredDomainRows.length} ${t("shown")}` : ""}
            </span>
            <button
              type="button"
              className={`offers-mode-toggle${showForm ? " is-active" : ""}`}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? t("Close") : (<><Plus size={13} strokeWidth={2.5} /> {t("Add Domain")}</>)}
            </button>
          </div>
        </div>

        <div className="accounts-summary-strip">
          {[
            { key: "total", tone: "neutral", label: t("Registered Domains"), value: domainSummary.total, Icon: Globe, pct: null },
            { key: "active", tone: "success", label: t("Active"), value: domainSummary.active, Icon: CheckCircle, pct: domainSummary.total ? Math.round((domainSummary.active / domainSummary.total) * 100) : 0 },
            { key: "attention", tone: "warning", label: t("Need Attention"), value: domainSummary.attention, Icon: AlertTriangle, pct: domainSummary.total ? Math.round((domainSummary.attention / domainSummary.total) * 100) : 0 },
            { key: "blocked", tone: "danger", label: t("Blocked / Expired"), value: domainSummary.blocked, Icon: Lock, pct: domainSummary.total ? Math.round((domainSummary.blocked / domainSummary.total) * 100) : 0 },
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
        <form className="form-grid domain-form" onSubmit={handleDomainSubmit}>
          <div className="field">
            <label>{t("Domain")}</label>
            <input
              value={domainForm.domain}
              onChange={updateDomainForm("domain")}
              placeholder="landing.yourdomain.com or multiple separated by comma/space (max 50)"
              required
            />
          </div>
          <div className="field">
            <label>{t("Status")}</label>
            <Select
              value={domainForm.status}
              onChange={(v) => setDomainForm((prev) => ({ ...prev, status: v }))}
              options={buildStatusOptions(t)}
              placeholder={t("Select")}
            />
          </div>
          <div className="field">
            <label>{t("Game")}</label>
            <input
              value={domainForm.game}
              onChange={updateDomainForm("game")}
              placeholder={t("e.g. Crash, Roulette")}
              required
            />
          </div>
          <div className="field">
            <label>{t("Platform")}</label>
            <Select
              value={domainForm.platform}
              onChange={(v) => setDomainForm((prev) => ({ ...prev, platform: v }))}
              options={["PWA Group", "Link Group", "ZM apps", "SKAK apps"].map((p) => ({ value: p, label: t(p) }))}
              placeholder={t("Select")}
            />
          </div>
          <div className="field">
            <label>{t("Target Countries")}</label>
            <CountryDropdownPicker
              multiple
              values={domainForm.countries}
              onToggle={toggleDomainCountry}
              options={countryOptions}
              placeholder={t("No countries selected")}
              searchPlaceholder={t("Type to find countries")}
              emptyResultsLabel={t("No countries found.")}
            />
          </div>
          <div className="field">
            <label>{t("Owner")}</label>
            <input
              value={
                authUser?.username
                  ? `${authUser.username} · ${t(domainForm.ownerRole || ownerRole)}`
                  : t(domainForm.ownerRole || ownerRole)
              }
              disabled
            />
          </div>
          <div className="form-actions">
            <button className="ghost" type="button" onClick={resetDomainForm}>
              {t("Reset")}
            </button>
            <button className="action-pill" type="submit">
              {t("Add Domain")}
            </button>
          </div>
        </form>
        ) : null}

        {canManageDomains ? (
          <div className="domains-batch-bar">
            <button
              className="ghost"
              type="button"
              onClick={handleScrapeAll}
              disabled={scrapeAll.loading}
            >
              <RotateCcw size={14} />{" "}
              {scrapeAll.loading ? t("Scraping all…") : t("Scrape all (refresh history)")}
            </button>
            {scrapeAll.message ? (
              <span className={`domains-batch-msg${scrapeAll.error ? " error" : ""}`}>
                {scrapeAll.message}
              </span>
            ) : null}
          </div>
        ) : null}

        {domainState.loading ? (
          <div className="empty-state">{t("Loading domains…")}</div>
        ) : domainState.error ? (
          <div className="empty-state error">{domainState.error}</div>
        ) : domainTableRows.length === 0 ? (
          <div className="empty-state">{t("No domains added yet.")}</div>
        ) : (
          <div className="table-wrap pixel-table-wrap">
            <div className="pixel-table-toolbar">
              <div className="field registry-search-field">
                <label>{t("Search")}</label>
                <div className="registry-search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    placeholder={t("Search domain, game, owner…")}
                  />
                  {domainSearch ? (
                    <button
                      type="button"
                      className="registry-search-clear"
                      onClick={() => setDomainSearch("")}
                      aria-label={t("Clear search")}
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label>{t("Domain")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableDomainFilter}
                  onToggle={toggleTableFilter(setTableDomainFilter)}
                  options={domainFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find domains")}
                  emptyResultsLabel={t("No entries found.")}
                />
              </div>
              <div className="field">
                <label>{t("Game")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableGameFilter}
                  onToggle={toggleTableFilter(setTableGameFilter)}
                  options={gameFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find games")}
                  emptyResultsLabel={t("No entries found.")}
                />
              </div>
              <div className="field">
                <label>{t("Platform")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tablePlatformFilter}
                  onToggle={toggleTableFilter(setTablePlatformFilter)}
                  options={platformFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find platforms")}
                  emptyResultsLabel={t("No entries found.")}
                />
              </div>
              <div className="field">
                <label>{t("GEO")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableGeoFilter}
                  onToggle={toggleTableFilter(setTableGeoFilter)}
                  options={geoFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find countries")}
                  emptyResultsLabel={t("No countries found.")}
                />
              </div>
              <div className="field">
                <label>{t("Status")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableStatusFilter}
                  onToggle={toggleTableFilter(setTableStatusFilter)}
                  options={statusFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find status")}
                  emptyResultsLabel={t("No status found.")}
                />
              </div>
              {canManageDomains ? (
                <div className="field">
                  <label>{t("Owner")}</label>
                  <CountryDropdownPicker
                    multiple
                    values={tableOwnerFilter}
                    onToggle={toggleTableFilter(setTableOwnerFilter)}
                    options={ownerFilterOptions}
                    placeholder={t("All")}
                    searchPlaceholder={t("Type to find owners")}
                    emptyResultsLabel={t("No owners found.")}
                  />
                </div>
              ) : null}
              {domainFiltersActive ? (
                <button type="button" className="filter-clear-btn" onClick={clearDomainFilters}>
                  <X size={13} /> {t("Clear filters")}
                </button>
              ) : null}
            </div>
            <div className="table-wrap">
            <table className="entries-table domain-table">
              <thead>
                <tr>
                  {[
                    { key: "domain", label: t("Domain") },
                    { key: "game", label: t("Game") },
                    { key: "platform", label: t("Platform") },
                    { key: "country", label: t("Country") },
                    { key: "owner", label: t("Owner") },
                    { key: "status", label: t("Status") },
                  ].map((col) => (
                    <th key={col.key}>
                      <button
                        type="button"
                        className={`sortable-header ${domainSort.key === col.key ? "active" : ""}`}
                        onClick={() => toggleDomainSort(col.key)}
                      >
                        {col.label}
                        <span className="sort-indicator">{getSortIndicator(domainSort, col.key)}</span>
                      </button>
                    </th>
                  ))}
                  <th className="col-actions">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {pagedDomainRows.map(({ domain, ownerLabel, countries }) => (
                  <tr key={domain.id}>
                    <td>
                      <span className="flow-pill" title={domain.domain}>
                        <span className="cs-dot" style={{ background: "#6ad6ff" }} aria-hidden="true" />
                        {domain.domain}
                      </span>
                    </td>
                    <td>{domain.game || "—"}</td>
                    <td><BrandMark value={domain.platform} /></td>
                    <td>
                      {countries.length ? (
                        <div className="geo-chip-row">
                          {countries.slice(0, 3).map((c) => (
                            <span className="geo-chip" key={c}>
                              <CountryFlag value={c} />
                              {c}
                            </span>
                          ))}
                          {countries.length > 3 ? (
                            <span
                              className="geo-chip geo-chip-more"
                              title={countries.slice(3).join(", ")}
                            >
                              +{countries.length - 3}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="offer-muted">—</span>
                      )}
                    </td>
                    <td>{ownerLabel && ownerLabel !== "—" ? (<span className="owner-pill"><span className="owner-pill-dot" />{ownerLabel}</span>) : (<span className="offer-muted">—</span>)}</td>
                    <td>
                      {canManageDomains || domain.owner_id === authUser?.id ? (
                        <Select
                          className={`accounts-status-select acc-st-${(domain.status || "active").toLowerCase()}`}
                          value={domain.status || "Active"}
                          onChange={(v) => handleDomainStatusChange(domain.id, v)}
                          options={buildStatusOptions(t)}
                          placeholder={t("Status")}
                        />
                      ) : (
                        <span className={`accounts-status-pill acc-st-${domain.status?.toLowerCase() || "active"}`}>
                          {t(domain.status)}
                        </span>
                      )}
                    </td>
                    <td>
                      {(canManageDomains || domain.owner_id === authUser?.id) ? (
                        <div className="accounts-action-group">
                          <button
                            className="icon-btn"
                            type="button"
                            aria-label={t("Sharing debugger")}
                            data-tip={t("Sharing debugger")}
                            onClick={() => openOgDebug(domain)}
                          >
                            <Settings size={15} />
                          </button>
                          <button
                            className="icon-btn"
                            type="button"
                            aria-label={t("Edit domain")}
                            data-tip={t("Edit domain")}
                            onClick={() => openDomainEdit(domain)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="icon-btn icon-btn-danger"
                            type="button"
                            aria-label={t("Remove")}
                            data-tip={t("Remove")}
                            onClick={() => handleDomainDelete(domain.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {!filteredDomainRows.length ? (
              <div className="empty-state">{t("No entries found for this filter.")}</div>
            ) : null}
            {filteredDomainRows.length > DOM_PAGE_SIZE ? (
              <div className="offer-pagebar">
                <span className="offer-results-count">
                  {t("Showing")} {(domClampedPage - 1) * DOM_PAGE_SIZE + 1}–
                  {Math.min(domClampedPage * DOM_PAGE_SIZE, filteredDomainRows.length)} {t("of")}{" "}
                  {filteredDomainRows.length}
                </span>
                <div className="offer-pagination">
                  <button
                    type="button"
                    className="offer-pagination-arrow"
                    disabled={domClampedPage <= 1}
                    onClick={() => setDomPage((p) => Math.max(1, p - 1))}
                    aria-label={t("Previous page")}
                  >
                    ‹
                  </button>
                  {domPageList.map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`dom-ellipsis-${i}`} className="offer-pagination-ellipsis">
                        …
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={p}
                        className={`offer-pagination-page ${p === domClampedPage ? "is-active" : ""}`}
                        onClick={() => setDomPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className="offer-pagination-arrow"
                    disabled={domClampedPage >= domPageCount}
                    onClick={() => setDomPage((p) => Math.min(domPageCount, p + 1))}
                    aria-label={t("Next page")}
                  >
                    ›
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {domainEdit.open ? (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDomainEdit}
          >
            <motion.div
              className="modal pixel-edit-modal edit-modal-accent domain-edit-accent"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Edit Domain")}</p>
                  <h2>{domainEdit.form.domain || t("Domain")}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={closeDomainEdit}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body pixel-edit-body">
                <div className="field field-span-2">
                  <label>{t("Domain")}</label>
                  <input
                    value={domainEdit.form.domain}
                    onChange={(e) => setDomainEdit((prev) => ({ ...prev, form: { ...prev.form, domain: e.target.value } }))}
                    placeholder="landing.yourdomain.com"
                  />
                </div>
                <div className="field">
                  <label>{t("Game")}</label>
                  <input
                    value={domainEdit.form.game}
                    onChange={(e) => setDomainEdit((prev) => ({ ...prev, form: { ...prev.form, game: e.target.value } }))}
                    placeholder={t("e.g. Crash, Roulette")}
                  />
                </div>
                <div className="field">
                  <label>{t("Platform")}</label>
                  <Select
                    value={domainEdit.form.platform}
                    onChange={(v) => setDomainEdit((prev) => ({ ...prev, form: { ...prev.form, platform: v } }))}
                    options={["PWA Group", "Link Group", "ZM apps", "SKAK apps"].map((p) => ({ value: p, label: t(p) }))}
                    placeholder={t("Select")}
                  />
                </div>
                {canManageDomains ? (
                  <div className="field field-span-2">
                    <label>{t("Owner")}</label>
                    <Select
                      value={domainEdit.form.ownerId || ""}
                      onChange={(v) => setDomainEdit((prev) => ({ ...prev, form: { ...prev.form, ownerId: v } }))}
                      options={users.map((u) => ({ value: String(u.id), label: `${u.username} · ${t(u.role)}` }))}
                      placeholder={userState.loading ? t("Loading...") : t("Select")}
                      searchPlaceholder={t("Find owner")}
                    />
                  </div>
                ) : null}
                <div className="field field-span-2">
                  <label>{t("Target Countries")}</label>
                  <CountryDropdownPicker
                    multiple
                    values={domainEdit.form.countries}
                    onToggle={toggleDomainEditCountry}
                    options={countryOptions}
                    placeholder={t("No countries selected")}
                    searchPlaceholder={t("Type to find countries")}
                    emptyResultsLabel={t("No countries found.")}
                  />
                </div>
                {domainEdit.error ? <div className="field field-span-2"><div className="pw-error">{domainEdit.error}</div></div> : null}
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={closeDomainEdit}>
                  {t("Cancel")}
                </button>
                <button className="action-pill" type="button" onClick={handleDomainEditSave} disabled={domainEdit.saving}>
                  {domainEdit.saving ? t("Saving…") : t("Save Changes")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {ogDebug.open ? (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOgDebug}
          >
            <motion.div
              className="modal og-debug-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Sharing Debugger")}</p>
                  <h2>{ogDebug.domain?.domain || t("Domain")}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={closeOgDebug}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body og-debug-body">
                {ogDebug.loading ? (
                  <div className="og-debug-loading">{t("Scraping the URL…")}</div>
                ) : ogDebug.error ? (
                  <div className="og-debug-errorwrap">
                    <div className="api-status error">{ogDebug.error}</div>
                    {ogDebug.data?.debuggerUrl ? (
                      <a
                        className="ghost og-debug-ext"
                        href={ogDebug.data.debuggerUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={14} /> {t("Open in Facebook Debugger")}
                      </a>
                    ) : null}
                  </div>
                ) : ogDebug.data ? (
                  <>
                    <div className="og-debug-statusbar">
                      <span
                        className={`og-chip${(ogDebug.data.responseCode || 200) < 400 ? " ok" : " bad"}`}
                      >
                        HTTP {ogDebug.data.responseCode || 200}
                      </span>
                      <span className="og-debug-scraped">
                        {t("Last scraped")}:{" "}
                        {ogDebug.data.scrapeTime
                          ? new Date(ogDebug.data.scrapeTime).toLocaleString()
                          : t("Unknown")}
                      </span>
                      <button
                        className="ghost og-rescrape"
                        type="button"
                        onClick={() => openOgDebug(ogDebug.domain, true)}
                      >
                        <RotateCcw size={13} /> {t("Scrape Again")}
                      </button>
                    </div>

                    {ogDebug.data.warnings?.length ? (
                      <div className="og-debug-warn">
                        {ogDebug.data.warnings.map((w, i) => (
                          <div key={i} className="og-warn-row">
                            <AlertTriangle size={13} /> {w}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="og-props">
                      <div className="og-prop">
                        <span className="og-prop-key">{t("Fetched URL")}</span>
                        <span className="og-prop-val og-prop-mono">{ogDebug.data.fetchedUrl}</span>
                      </div>
                      <div className="og-prop">
                        <span className="og-prop-key">{t("Canonical URL")}</span>
                        <span className="og-prop-val og-prop-mono">
                          <span className="og-canonical-line">
                            {ogDebug.data.canonicalUrl}
                            {ogDebug.data.history?.length ? (
                              <button
                                type="button"
                                className="og-see-history"
                                onClick={() => setOgHistoryOpen((v) => !v)}
                              >
                                {ogHistoryOpen ? t("(Hide History)") : t("(See History)")}
                              </button>
                            ) : null}
                          </span>
                          {ogHistoryOpen && ogDebug.data.history?.length ? (
                            <span className="og-canonical-history">
                              {ogDebug.data.history.map((h, i) => (
                                <span
                                  className="og-canonical-history-row"
                                  key={`${h.scrapedAt}-${i}`}
                                >
                                  {h.canonicalUrl}{" "}
                                  <span className="og-canonical-history-date">
                                    ({new Date(h.scrapedAt).toLocaleString()})
                                  </span>
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    {ogDebug.data.redirectPath?.length > 1 ? (
                      <div className="og-redirects">
                        <div className="og-history-head">
                          <ArrowRight size={13} /> {t("Redirect path")}
                        </div>
                        <div className="og-redirect-list">
                          {ogDebug.data.redirectPath.map((hop, i) => (
                            <div className="og-redirect-hop" key={`${hop.url}-${i}`}>
                              {hop.status ? (
                                <span
                                  className={`og-history-code${hop.status < 400 ? " ok" : ""}`}
                                >
                                  {hop.status}
                                </span>
                              ) : (
                                <span className="og-history-code">×</span>
                              )}
                              <span className="og-redirect-url">{hop.url}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="og-preview">
                      <div className="og-preview-media">
                        {ogDebug.data.og.image ? (
                          <img src={ogDebug.data.og.image} alt={ogDebug.data.og.title || ""} />
                        ) : (
                          <div className="og-preview-noimg">
                            <ImageIcon size={22} /> {t("No image")}
                          </div>
                        )}
                      </div>
                      <div className="og-preview-meta">
                        <span className="og-preview-host">
                          {(() => {
                            try {
                              return new URL(ogDebug.data.fetchedUrl).host.toUpperCase();
                            } catch (e) {
                              return ogDebug.data.fetchedUrl;
                            }
                          })()}
                        </span>
                        <span className="og-preview-title">
                          {ogDebug.data.og.title || t("No title")}
                        </span>
                        <span className="og-preview-desc">{ogDebug.data.og.description || ""}</span>
                      </div>
                    </div>

                    <div className="og-props">
                      {[
                        ["og:url", ogDebug.data.og.url],
                        ["og:title", ogDebug.data.og.title],
                        ["og:description", ogDebug.data.og.description],
                        ["og:type", ogDebug.data.og.type],
                        ["og:image", ogDebug.data.og.image],
                      ].map(([key, value]) => (
                        <div className="og-prop" key={key}>
                          <span className="og-prop-key">{key}</span>
                          <span className={`og-prop-val${key === "og:image" ? " og-prop-mono" : ""}`}>
                            {value || "—"}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="og-engagement">
                      <span>
                        {t("Shares")}: <strong>{ogDebug.data.engagement.share_count ?? 0}</strong>
                      </span>
                      <span>
                        {t("Comments")}:{" "}
                        <strong>{ogDebug.data.engagement.comment_count ?? 0}</strong>
                      </span>
                      <span>
                        {t("Reactions")}:{" "}
                        <strong>{ogDebug.data.engagement.reaction_count ?? 0}</strong>
                      </span>
                    </div>

                    {ogDebug.data.debuggerUrl ? (
                      <a
                        className="ghost og-debug-ext"
                        href={ogDebug.data.debuggerUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={14} /> {t("Open in Facebook Debugger")}
                      </a>
                    ) : null}
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function PixelsDashboard({ authUser }) {
  const { t } = useLanguage();
  const canManagePixels = isLeadershipRole(authUser?.role);
  const [pixels, setPixels] = React.useState([]);
  const [pixelState, setPixelState] = React.useState({ loading: true, error: null });
  const [domains, setDomains] = React.useState([]);
  const [domainState, setDomainState] = React.useState({ loading: true, error: null });
  const [users, setUsers] = React.useState([]);
  const [userState, setUserState] = React.useState({ loading: true, error: null });
  const [showForm, setShowForm] = React.useState(false);
  const [tableBuyerFilter, setTableBuyerFilter] = React.useState([]);
  const [tableGeoFilter, setTableGeoFilter] = React.useState([]);
  const [tableStatusFilter, setTableStatusFilter] = React.useState([]);
  const [tableOwnerFilter, setTableOwnerFilter] = React.useState([]);
  const [tablePixelIdFilter, setTablePixelIdFilter] = React.useState([]);
  const [tableFlowFilter, setTableFlowFilter] = React.useState([]);
  const toggleTableFilter = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  const [pixelSearch, setPixelSearch] = React.useState("");
  const [pixelPage, setPixelPage] = React.useState(1);
  const [pixelForm, setPixelForm] = React.useState({
    pixelId: "",
    tokenEaag: "",
    flows: [],
    geos: [],
    status: "Active",
    comment: "",
  });
  const [copyToast, setCopyToast] = React.useState({
    visible: false,
    type: "success",
    message: "",
    left: 0,
    top: 0,
    above: true,
  });
  const [commentModal, setCommentModal] = React.useState({
    open: false,
    pixel: null,
    value: "",
  });
  // Full pixel edit modal (pixel ID, EAAG token, domains, geos)
  const [pixelEdit, setPixelEdit] = React.useState({
    open: false,
    pixel: null,
    saving: false,
    error: null,
    showToken: false,
    form: { pixelId: "", tokenEaag: "", flows: [], geos: [] },
  });
  const [pixelEditGeoQuery, setPixelEditGeoQuery] = React.useState("");
  const copyToastTimeoutRef = React.useRef(null);
  const normalizeRole = React.useCallback((value) => String(value || "").trim().toLowerCase(), []);
  const pixelStatusValues = React.useMemo(() => ["Active", "Pending", "Paused", "Expired", "Blocked"], []);

  const updatePixelForm = (key) => (event) => {
    setPixelForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetPixelForm = () => {
    setPixelForm({
      pixelId: "",
      tokenEaag: "",
      flows: [],
      geos: [],
      status: "Active",
      comment: "",
    });
  };

  const togglePixelFlow = React.useCallback((domain) => {
    const normalized = String(domain || "").trim().toLowerCase();
    if (!normalized) return;
    setPixelForm((prev) => {
      const current = Array.isArray(prev.flows) ? prev.flows : [];
      const has = current.includes(normalized);
      return {
        ...prev,
        flows: has ? current.filter((item) => item !== normalized) : [...current, normalized],
      };
    });
  }, []);

  const togglePixelGeo = React.useCallback((geo) => {
    const normalized = String(geo || "").trim();
    if (!normalized) return;
    setPixelForm((prev) => {
      const current = normalizeCountryListValue(prev.geos);
      const hasGeo = current.includes(normalized);
      return {
        ...prev,
        geos: hasGeo ? current.filter((item) => item !== normalized) : [...current, normalized],
      };
    });
  }, []);

  const fetchPixels = React.useCallback(async () => {
    try {
      setPixelState({ loading: true, error: null });
      const response = await apiFetch("/api/pixels?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load pixels.");
      }
      const data = await response.json();
      setPixels(data);
      setPixelState({ loading: false, error: null });
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to load pixels." });
    }
  }, []);

  const fetchDomains = React.useCallback(async () => {
    try {
      setDomainState({ loading: true, error: null });
      const response = await apiFetch("/api/domains?limit=5000");
      if (!response.ok) {
        throw new Error("Failed to load domains.");
      }
      const data = await response.json();
      setDomains(data);
      setDomainState({ loading: false, error: null });
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to load domains." });
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    if (!canManagePixels) return;
    try {
      setUserState({ loading: true, error: null });
      const response = await apiFetch("/api/users?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load users.");
      }
      const data = await response.json();
      setUsers(data);
      setUserState({ loading: false, error: null });
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to load users." });
    }
  }, [canManagePixels]);

  React.useEffect(() => {
    fetchPixels();
    fetchDomains();
    fetchUsers();
  }, [fetchPixels, fetchDomains, fetchUsers]);

  React.useEffect(() => {
    return () => {
      if (copyToastTimeoutRef.current) {
        clearTimeout(copyToastTimeoutRef.current);
      }
    };
  }, []);

  const showCopyToast = React.useCallback((type, message, anchorRect) => {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
    const fallbackLeft = viewportWidth / 2;
    const rawLeft = anchorRect ? anchorRect.left + anchorRect.width / 2 : fallbackLeft;
    const clampedLeft = Math.max(170, Math.min(viewportWidth - 170, rawLeft));
    const showAbove = anchorRect ? anchorRect.top > 72 : true;
    const top = anchorRect
      ? showAbove
        ? anchorRect.top - 10
        : anchorRect.bottom + 10
      : 72;

    if (copyToastTimeoutRef.current) {
      clearTimeout(copyToastTimeoutRef.current);
    }
    setCopyToast({
      visible: true,
      type,
      message,
      left: clampedLeft,
      top,
      above: showAbove,
    });
    copyToastTimeoutRef.current = setTimeout(() => {
      setCopyToast((prev) => ({ ...prev, visible: false }));
    }, 1400);
  }, []);

  const handlePixelSubmit = async (event) => {
    event.preventDefault();
    const normalizedFlows = normalizeDomainInputList(pixelForm.flows);
    const normalizedGeos = normalizeCountryListValue(pixelForm.geos);
    if (!normalizedFlows.length) {
      setPixelState({ loading: false, error: "At least one domain is required." });
      return;
    }
    if (!normalizedGeos.length) {
      setPixelState({ loading: false, error: "At least one GEO is required." });
      return;
    }
    try {
      const response = await apiFetch("/api/pixels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelId: pixelForm.pixelId,
          tokenEaag: pixelForm.tokenEaag,
          flows: normalizedFlows,
          geos: normalizedGeos,
          status: pixelForm.status,
          comment: pixelForm.comment,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save pixel.");
      }
      await fetchPixels();
      resetPixelForm();
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to save pixel." });
    }
  };

  const handlePixelDelete = async (id) => {
    const confirmed = await appConfirm({
      title: "Remove pixel?",
      message: "This cannot be undone.",
      confirmLabel: "Remove pixel",
    });
    if (!confirmed) return;
    try {
      const response = await apiFetch(`/api/pixels/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete pixel.");
      }
      await fetchPixels();
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to delete pixel." });
    }
  };

  const handlePixelStatusChange = async (id, status) => {
    try {
      const response = await apiFetch(`/api/pixels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update pixel status.");
      }
      await fetchPixels();
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to update pixel status." });
    }
  };

  const handleCommentEdit = async (pixel) => {
    if (!pixel?.id) return;
    setCommentModal({
      open: true,
      pixel,
      value: pixel.comment || "",
    });
  };

  const closeCommentModal = () => {
    setCommentModal({ open: false, pixel: null, value: "" });
  };

  const openPixelEdit = (pixel) => {
    if (!pixel?.id) return;
    setPixelEditGeoQuery("");
    setPixelEdit({
      open: true,
      pixel,
      saving: false,
      error: null,
      showToken: false,
      form: {
        pixelId: String(pixel.pixel_id || ""),
        tokenEaag: String(pixel.token_eaag || ""),
        flows: normalizeDomainInputList(pixel.flows),
        geos: normalizeCountryListValue(
          Array.isArray(pixel?.geos) && pixel.geos.length ? pixel.geos : pixel?.geo
        ),
      },
    });
  };

  const closePixelEdit = () => {
    setPixelEdit({ open: false, pixel: null, saving: false, error: null, showToken: false, form: { pixelId: "", tokenEaag: "", flows: [], geos: [] } });
  };

  const togglePixelEditFlow = (domain) => {
    const normalized = String(domain || "").trim().toLowerCase();
    if (!normalized) return;
    setPixelEdit((prev) => {
      const current = prev.form.flows || [];
      const has = current.includes(normalized);
      return {
        ...prev,
        form: {
          ...prev.form,
          flows: has ? current.filter((item) => item !== normalized) : [...current, normalized],
        },
      };
    });
  };

  const togglePixelEditGeo = (geo) => {
    const normalized = String(geo || "").trim();
    if (!normalized) return;
    setPixelEdit((prev) => {
      const current = prev.form.geos || [];
      const has = current.includes(normalized);
      return {
        ...prev,
        form: {
          ...prev.form,
          geos: has ? current.filter((item) => item !== normalized) : [...current, normalized],
        },
      };
    });
  };

  const handlePixelEditSave = async () => {
    if (!pixelEdit.pixel?.id) return;
    const f = pixelEdit.form;
    if (!String(f.pixelId).trim() || !String(f.tokenEaag).trim()) {
      setPixelEdit((prev) => ({ ...prev, error: "Pixel ID and token are required." }));
      return;
    }
    if (!f.geos.length) {
      setPixelEdit((prev) => ({ ...prev, error: "Select at least one geo." }));
      return;
    }
    setPixelEdit((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const response = await apiFetch(`/api/pixels/${pixelEdit.pixel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelId: f.pixelId,
          tokenEaag: f.tokenEaag,
          flows: f.flows,
          geos: f.geos,
        }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail?.error || "Failed to update pixel.");
      }
      await fetchPixels();
      closePixelEdit();
    } catch (error) {
      setPixelEdit((prev) => ({ ...prev, saving: false, error: error.message || "Failed to update pixel." }));
    }
  };

  const handleCommentSave = async () => {
    if (!commentModal.pixel?.id) return;
    try {
      const fallbackStatus = commentModal.pixel.status || "Active";
      const normalizedComment = String(commentModal.value || "").trim();
      const query = new URLSearchParams();
      if (normalizedComment) query.set("comment", normalizedComment);
      if (fallbackStatus) query.set("status", fallbackStatus);
      let response = await apiFetch(
        `/api/pixels/${commentModal.pixel.id}/comment${query.toString() ? `?${query}` : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment: normalizedComment,
            status: fallbackStatus,
          }),
        }
      );
      if (response.status === 404) {
        response = await apiFetch(
          `/api/pixels/${commentModal.pixel.id}${query.toString() ? `?${query}` : ""}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comment: normalizedComment,
              status: fallbackStatus,
            }),
          }
        );
      }
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to update comment.");
      }
      const updated = await response.json().catch(() => null);
      if (updated?.id) {
        setPixels((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        setPixels((prev) =>
          prev.map((item) =>
            item.id === commentModal.pixel.id
              ? { ...item, comment: normalizedComment || null }
              : item
          )
        );
      }
      await fetchPixels();
      closeCommentModal();
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to update comment." });
    }
  };

  const maskToken = (token) => {
    const value = String(token || "");
    if (value.length <= 12) return value;
    return `${value.slice(0, 6)}••••${value.slice(-4)}`;
  };

  const [revealedTokens, setRevealedTokens] = React.useState(() => new Set());
  const toggleReveal = (id) =>
    setRevealedTokens((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleCopy = (value) => async (event) => {
    if (!value) return;
    const anchorRect = event?.currentTarget?.getBoundingClientRect?.() || null;
    try {
      await navigator.clipboard?.writeText(String(value));
      showCopyToast("success", t("Has been copied successfully"), anchorRect);
    } catch (error) {
      showCopyToast("error", t("Copy failed"), anchorRect);
    }
  };

  const ownerLookup = React.useMemo(() => {
    if (!users.length) return {};
    return users.reduce((acc, user) => {
      acc[user.id] = user.username;
      return acc;
    }, {});
  }, [users]);

  const resolveOwnerLabel = (pixel) => {
    if (pixel?.owner_id && ownerLookup[pixel.owner_id]) return ownerLookup[pixel.owner_id];
    if (pixel?.owner_id && pixel.owner_id === authUser?.id) return authUser?.username || "You";
    return pixel?.owner_role ? t(pixel.owner_role) : "—";
  };

  const resolveDomainOwnerLabel = (domain) => {
    if (domain?.owner_name) return domain.owner_name;
    if (domain?.owner_id && ownerLookup[domain.owner_id]) return ownerLookup[domain.owner_id];
    if (domain?.owner_id && domain.owner_id === authUser?.id) return authUser?.username || "You";
    if (domain?.owner_role) return t(domain.owner_role);
    return "—";
  };

  const filteredDomains = React.useMemo(() => {
    if (canManagePixels) return domains;
    const loggedIdRaw = authUser?.id;
    const loggedId =
      loggedIdRaw === null || loggedIdRaw === undefined || loggedIdRaw === ""
        ? null
        : Number(loggedIdRaw);
    const hasLoggedId = Number.isFinite(loggedId) && loggedId > 0;
    const loggedRole = normalizeRole(authUser?.role);

    return domains.filter((domain) => {
      const domainOwnerIdRaw = domain.owner_id;
      const domainOwnerId =
        domainOwnerIdRaw === null || domainOwnerIdRaw === undefined || domainOwnerIdRaw === ""
          ? null
          : Number(domainOwnerIdRaw);
      const hasDomainOwnerId = Number.isFinite(domainOwnerId) && domainOwnerId > 0;

      if (hasLoggedId && hasDomainOwnerId && domainOwnerId === loggedId) {
        return true;
      }
      if (!hasDomainOwnerId && loggedRole) {
        return normalizeRole(domain.owner_role) === loggedRole;
      }
      return false;
    });
  }, [domains, authUser?.id, authUser?.role, normalizeRole, canManagePixels]);

  const visiblePixels = React.useMemo(() => {
    if (canManagePixels) return pixels;
    return pixels.filter((pixel) => pixel.owner_id === authUser?.id);
  }, [canManagePixels, pixels, authUser?.id]);

  const flowDropdownOptions = React.useMemo(
    () =>
      filteredDomains.map((domain) => {
        const ownerName = resolveDomainOwnerLabel(domain);
        const domainName = String(domain?.domain || "").trim();
        return {
          value: domainName,
          label: ownerName && ownerName !== "—" ? `${domainName} · ${ownerName}` : domainName,
          search: `${domainName} ${ownerName}`.trim(),
        };
      }),
    [filteredDomains, authUser?.id, authUser?.username, ownerLookup, t]
  );

  const statusDropdownOptions = React.useMemo(
    () => pixelStatusValues.map((status) => ({ value: status, label: t(status) })),
    [pixelStatusValues, t]
  );

  const domainOwnerByFlow = React.useMemo(() => {
    const map = new Map();
    domains.forEach((domain) => {
      const flow = String(domain?.domain || "").trim().toLowerCase();
      if (!flow) return;
      let ownerName = "—";
      if (domain?.owner_name) {
        ownerName = domain.owner_name;
      } else if (domain?.owner_id && ownerLookup[domain.owner_id]) {
        ownerName = ownerLookup[domain.owner_id];
      } else if (domain?.owner_id && domain.owner_id === authUser?.id) {
        ownerName = authUser?.username || "You";
      } else if (domain?.owner_role) {
        ownerName = t(domain.owner_role);
      }
      map.set(flow, ownerName);
    });
    return map;
  }, [domains, ownerLookup, authUser?.id, authUser?.username, t]);

  const normalizeStatusValue = React.useCallback(
    (value) => {
      const raw = String(value || "").trim();
      if (!raw) return pixelStatusValues[0];
      const matched = pixelStatusValues.find((status) => status.toLowerCase() === raw.toLowerCase());
      return matched || raw;
    },
    [pixelStatusValues]
  );

  const pixelTableRows = React.useMemo(
    () =>
      visiblePixels.map((pixel) => {
        const flows = normalizeDomainInputList(pixel?.flows);
        return {
          pixel,
          flows,
          buyerLabel: flows.length ? domainOwnerByFlow.get(flows[0]) || "—" : "—",
          geos: normalizeCountryListValue(
            Array.isArray(pixel?.geos) && pixel.geos.length ? pixel.geos : pixel?.geo
          ),
          statusLabel: normalizeStatusValue(pixel?.status),
          ownerLabel: resolveOwnerLabel(pixel),
        };
      }),
    [visiblePixels, domainOwnerByFlow, normalizeStatusValue, authUser?.id, authUser?.username, ownerLookup, t]
  );

  const pixelBuyerOptions = React.useMemo(() => {
    const unique = new Map();
    pixelTableRows.forEach((row) => {
      const buyer = String(row.buyerLabel || "").trim();
      if (!buyer || buyer === "—") return;
      unique.set(buyer.toLowerCase(), buyer);
    });
    return Array.from(unique.values())
      .sort((first, second) => first.localeCompare(second))
      .map((buyer) => ({ value: buyer, label: buyer, search: buyer }));
  }, [pixelTableRows]);

  const pixelGeoOptions = React.useMemo(() => {
    const unique = new Map();
    pixelTableRows.forEach((row) => {
      row.geos.forEach((geo) => {
        const value = String(geo || "").trim();
        if (!value) return;
        unique.set(value.toLowerCase(), value);
      });
    });
    return Array.from(unique.values())
      .sort((first, second) => first.localeCompare(second))
      .map((geo) => ({ value: geo, label: geo, search: geo }));
  }, [pixelTableRows]);

  const pixelStatusFilterOptions = React.useMemo(
    () => pixelStatusValues.map((status) => ({ value: status, label: t(status), search: status })),
    [pixelStatusValues, t]
  );

  const pixelOwnerOptions = React.useMemo(() => {
    const unique = new Map();
    pixelTableRows.forEach((row) => {
      const owner = String(row.ownerLabel || "").trim();
      if (!owner || owner === "—") return;
      unique.set(owner.toLowerCase(), owner);
    });
    return Array.from(unique.values())
      .sort((first, second) => first.localeCompare(second))
      .map((owner) => ({ value: owner, label: owner, search: owner }));
  }, [pixelTableRows]);

  const pixelIdFilterOptions = React.useMemo(() => {
    const unique = new Map();
    pixelTableRows.forEach((row) => {
      const value = String(row.pixel?.pixel_id || "").trim();
      if (!value) return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((first, second) => first.localeCompare(second))
      .map((value) => ({ value, label: value, search: value }));
  }, [pixelTableRows]);

  const pixelFlowFilterOptions = React.useMemo(() => {
    const unique = new Set();
    pixelTableRows.forEach((row) => {
      row.flows.forEach((flow) => unique.add(flow));
    });
    return Array.from(unique)
      .sort((first, second) => first.localeCompare(second))
      .map((value) => ({ value, label: value, search: value }));
  }, [pixelTableRows]);

  React.useEffect(() => {
    // Prune any selected multi-filter values that are no longer valid options.
    // Return the same array ref when nothing changed to avoid a render loop.
    const prune = (setter, options) =>
      setter((prev) => {
        const next = prev.filter((v) => options.some((option) => option.value === v));
        return next.length === prev.length ? prev : next;
      });
    prune(setTableBuyerFilter, pixelBuyerOptions);
    prune(setTableGeoFilter, pixelGeoOptions);
    prune(setTableStatusFilter, pixelStatusFilterOptions);
    prune(setTableOwnerFilter, pixelOwnerOptions);
    prune(setTablePixelIdFilter, pixelIdFilterOptions);
    prune(setTableFlowFilter, pixelFlowFilterOptions);
  }, [
    pixelBuyerOptions,
    pixelGeoOptions,
    pixelStatusFilterOptions,
    pixelOwnerOptions,
    pixelIdFilterOptions,
    pixelFlowFilterOptions,
  ]);

  const pixelFiltersActive =
    tableBuyerFilter.length > 0 ||
    tableGeoFilter.length > 0 ||
    tableStatusFilter.length > 0 ||
    tableOwnerFilter.length > 0 ||
    tablePixelIdFilter.length > 0 ||
    tableFlowFilter.length > 0;

  const clearPixelFilters = () => {
    setTableBuyerFilter([]);
    setTableGeoFilter([]);
    setTableStatusFilter([]);
    setTableOwnerFilter([]);
    setTablePixelIdFilter([]);
    setTableFlowFilter([]);
  };

  const [pixelSort, setPixelSort] = React.useState({ key: null, dir: "asc" });
  const togglePixelSort = (key) => setPixelSort((prev) => toggleSortConfig(prev, key, "asc"));
  const getPixelSortValue = (row, key) => {
    switch (key) {
      case "id": return row.pixel?.id;
      case "pixelId": return row.pixel?.pixel_id || "";
      case "token": return row.pixel?.token_eaag || "";
      case "geo": return row.geos?.[0] || "";
      case "domain": return row.flows?.[0] || "";
      case "status": return row.statusLabel || "";
      case "comment": return row.pixel?.comment || "";
      case "owner": return row.ownerLabel || "";
      default: return null;
    }
  };
  const normalizedPixelSearch = pixelSearch.trim().toLowerCase();
  const filteredPixelTableRows = React.useMemo(() => {
    return pixelTableRows.filter((row) => {
      if (normalizedPixelSearch) {
        const hay = `${row.pixel?.pixel_id || ""} ${row.buyerLabel || ""} ${row.ownerLabel || ""}`.toLowerCase();
        if (!hay.includes(normalizedPixelSearch)) return false;
      }
      if (tablePixelIdFilter.length && !tablePixelIdFilter.includes(String(row.pixel?.pixel_id || ""))) return false;
      if (tableFlowFilter.length && !tableFlowFilter.some((f) => row.flows.includes(f))) return false;
      if (tableBuyerFilter.length && !tableBuyerFilter.includes(row.buyerLabel)) return false;
      if (tableGeoFilter.length && !tableGeoFilter.some((g) => row.geos.includes(g))) return false;
      if (tableStatusFilter.length && !tableStatusFilter.includes(row.statusLabel)) return false;
      if (canManagePixels && tableOwnerFilter.length && !tableOwnerFilter.includes(row.ownerLabel)) return false;
      return true;
    });
  }, [
    pixelTableRows,
    normalizedPixelSearch,
    tableBuyerFilter,
    tableGeoFilter,
    tableStatusFilter,
    tableOwnerFilter,
    tablePixelIdFilter,
    tableFlowFilter,
    canManagePixels,
  ]);

  const sortedPixelTableRows = React.useMemo(() => {
    const rows = [...filteredPixelTableRows];
    if (!pixelSort?.key) return rows;
    return rows.sort((a, b) =>
      compareSortValues(
        getPixelSortValue(a, pixelSort.key),
        getPixelSortValue(b, pixelSort.key),
        pixelSort.dir,
        pixelSort.key === "id" ? "number" : "text"
      )
    );
  }, [filteredPixelTableRows, pixelSort]);

  const PIXEL_PAGE_SIZE = 50;
  const pixelPageCount = Math.max(1, Math.ceil(sortedPixelTableRows.length / PIXEL_PAGE_SIZE));
  const pixelClampedPage = Math.min(pixelPage, pixelPageCount);
  const pagedPixelTableRows = React.useMemo(
    () => sortedPixelTableRows.slice((pixelClampedPage - 1) * PIXEL_PAGE_SIZE, pixelClampedPage * PIXEL_PAGE_SIZE),
    [sortedPixelTableRows, pixelClampedPage]
  );
  const pixelPageList = React.useMemo(() => {
    const total = pixelPageCount;
    const cur = pixelClampedPage;
    const out = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) out.push(i);
    } else {
      out.push(1);
      const start = Math.max(2, cur - 1);
      const end = Math.min(total - 1, cur + 1);
      if (start > 2) out.push("ellipsis");
      for (let i = start; i <= end; i += 1) out.push(i);
      if (end < total - 1) out.push("ellipsis");
      out.push(total);
    }
    return out;
  }, [pixelPageCount, pixelClampedPage]);
  React.useEffect(() => {
    setPixelPage(1);
  }, [sortedPixelTableRows]);

  // KPI strip: registry health at a glance (same DNA as Accounts Registry)
  const pixelSummary = React.useMemo(() => {
    const total = pixelTableRows.length;
    let active = 0;
    let attention = 0;
    let blocked = 0;
    pixelTableRows.forEach((row) => {
      const s = String(row.statusLabel || "").toLowerCase();
      if (s === "active") active += 1;
      else if (s === "pending" || s === "paused") attention += 1;
      else if (s === "blocked" || s === "expired") blocked += 1;
    });
    return { total, active, attention, blocked };
  }, [pixelTableRows]);

  return (
    <section className="form-section">
      <AnimatePresence>
        {commentModal.open ? (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommentModal}
          >
            <motion.div
              className="modal comment-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Pixel Comment")}</p>
                  <h2>{t("Add comment")}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={closeCommentModal}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field">
                  <label>{t("Comment")}</label>
                  <textarea
                    rows={4}
                    value={commentModal.value}
                    onChange={(event) =>
                      setCommentModal((prev) => ({ ...prev, value: event.target.value }))
                    }
                    placeholder={t("Add a comment")}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={closeCommentModal}>
                  {t("Cancel")}
                </button>
                <button className="action-pill" type="button" onClick={handleCommentSave}>
                  {t("Save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {pixelEdit.open ? (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePixelEdit}
          >
            <motion.div
              className="modal pixel-edit-modal edit-modal-accent pixel-edit-accent"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Edit Pixel")}</p>
                  <h2>{pixelEdit.form.pixelId || t("Pixel")}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={closePixelEdit}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body pixel-edit-body">
                <div className="field">
                  <label>{t("Pixel ID")}</label>
                  <input
                    value={pixelEdit.form.pixelId}
                    onChange={(e) => setPixelEdit((prev) => ({ ...prev, form: { ...prev.form, pixelId: e.target.value } }))}
                    placeholder="123456789012345"
                  />
                </div>
                <div className="field">
                  <label>{t("Domains")} <span className="field-pace-hint">{t("registered domains")}</span></label>
                  <CountryDropdownPicker
                    multiple
                    values={pixelEdit.form.flows}
                    onToggle={togglePixelEditFlow}
                    options={domains
                      .map((d) => String(d?.domain || "").trim())
                      .filter(Boolean)
                      .map((name) => ({ value: name, label: name }))}
                    placeholder={domains.length ? t("No domains selected") : t("No domains")}
                    searchPlaceholder={t("Find domain")}
                    emptyResultsLabel={t("No domains found.")}
                  />
                </div>
                <div className="field field-span-2">
                  <label>{t("EAAG Token")} <span className="field-pace-hint">{t("rotate when it expires")}</span></label>
                  <div className="token-input-wrap">
                    <input
                      className={`token-input${pixelEdit.showToken ? "" : " is-masked"}`}
                      type="text"
                      value={pixelEdit.form.tokenEaag}
                      onChange={(e) => setPixelEdit((prev) => ({ ...prev, form: { ...prev.form, tokenEaag: e.target.value } }))}
                      placeholder="EAAG…"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <div className="token-input-actions">
                      <button
                        type="button"
                        className="token-action-btn"
                        onClick={() => setPixelEdit((prev) => ({ ...prev, showToken: !prev.showToken }))}
                        title={pixelEdit.showToken ? t("Hide") : t("Show")}
                      >
                        {pixelEdit.showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        type="button"
                        className="token-action-btn"
                        onClick={() => navigator.clipboard?.writeText(pixelEdit.form.tokenEaag || "")}
                        title={t("Copy token")}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="field field-span-2">
                  <label>{t("Geos")}</label>
                  <CountryDropdownPicker
                    multiple
                    values={pixelEdit.form.geos}
                    onToggle={togglePixelEditGeo}
                    options={countryOptions}
                    placeholder={t("Pick countries")}
                    searchPlaceholder={t("Type to find countries")}
                    emptyResultsLabel={t("No countries found.")}
                  />
                </div>
                {pixelEdit.error ? <div className="field field-span-2"><div className="pw-error">{pixelEdit.error}</div></div> : null}
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={closePixelEdit}>
                  {t("Cancel")}
                </button>
                <button className="action-pill" type="button" onClick={handlePixelEditSave} disabled={pixelEdit.saving}>
                  {pixelEdit.saving ? t("Saving…") : t("Save Changes")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="panel registry-dashboard-panel pixel-registry-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><MetaGlyph size={20} /></span>
            <div>
              <h3 className="panel-title">{t("Pixels Registry")}</h3>
              <p className="panel-subtitle">{t("Manage FB pixels and tokens tied to your flows.")}</p>
            </div>
          </div>
          <div className="panel-head-actions">
            <span className="roles-count">
              {visiblePixels.length} {t("pixels")}
            </span>
            <button
              type="button"
              className={`offers-mode-toggle${showForm ? " is-active" : ""}`}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? t("Close") : (<><Plus size={13} strokeWidth={2.5} /> {t("Add Pixel")}</>)}
            </button>
          </div>
        </div>

        <div className="accounts-summary-strip">
          {[
            { key: "total", tone: "neutral", label: t("Registered Pixels"), value: pixelSummary.total, Icon: Zap, pct: null },
            { key: "active", tone: "success", label: t("Active"), value: pixelSummary.active, Icon: CheckCircle, pct: pixelSummary.total ? Math.round((pixelSummary.active / pixelSummary.total) * 100) : 0 },
            { key: "attention", tone: "warning", label: t("Need Attention"), value: pixelSummary.attention, Icon: AlertTriangle, pct: pixelSummary.total ? Math.round((pixelSummary.attention / pixelSummary.total) * 100) : 0 },
            { key: "blocked", tone: "danger", label: t("Blocked / Expired"), value: pixelSummary.blocked, Icon: Lock, pct: pixelSummary.total ? Math.round((pixelSummary.blocked / pixelSummary.total) * 100) : 0 },
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

        <AnimatePresence>
          {copyToast.visible ? (
            <div
              className={`copy-toast-anchor${copyToast.above ? "" : " is-below"}`}
              style={{ left: copyToast.left, top: copyToast.top }}
            >
              <motion.div
                className={`copy-toast ${copyToast.type}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                {copyToast.type === "success" ? <CheckCircle size={14} /> : <X size={14} />}
                <span>{copyToast.message}</span>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        {showForm ? (
          <form className="form-grid pixel-form" onSubmit={handlePixelSubmit}>
            <div className="field">
              <label>{t("Pixel ID")}</label>
              <input
                value={pixelForm.pixelId}
                onChange={updatePixelForm("pixelId")}
                placeholder="7147390541946812"
                required
              />
            </div>
            <div className="field">
              <label>{t("Token EAAG")}</label>
              <input
                value={pixelForm.tokenEaag}
                onChange={updatePixelForm("tokenEaag")}
                placeholder="EAAG..."
                required
              />
            </div>
            <div className="field">
              <label>{t("Domains")} <span className="field-pace-hint">{t("one pixel, many domains")}</span></label>
              <CountryDropdownPicker
                multiple
                values={pixelForm.flows}
                onToggle={togglePixelFlow}
                options={flowDropdownOptions}
                placeholder={
                  domainState.loading
                    ? t("Loading...")
                    : flowDropdownOptions.length
                      ? t("No domains selected")
                      : t("No domains")
                }
                searchPlaceholder={t("Type to find domains")}
                emptyResultsLabel={t("No domains")}
              />
            </div>
            <div className="field">
              <label>{t("GEO")}</label>
              <CountryDropdownPicker
                multiple
                values={pixelForm.geos}
                onToggle={togglePixelGeo}
                options={countryOptions}
                placeholder={t("No countries selected")}
                searchPlaceholder={t("Type to find countries")}
                emptyResultsLabel={t("No countries found.")}
              />
            </div>
            <div className="field">
              <label>{t("Status")}</label>
              <CountryDropdownPicker
                value={pixelForm.status}
                onChange={(status) => setPixelForm((prev) => ({ ...prev, status }))}
                options={statusDropdownOptions}
                placeholder={t("Select")}
                searchPlaceholder={t("Type to find status")}
                emptyResultsLabel={t("No status found.")}
              />
            </div>
            <div className="field field-full">
              <label>{t("Comment")}</label>
              <textarea
                rows={3}
                value={pixelForm.comment}
                onChange={updatePixelForm("comment")}
                placeholder={t("Add a comment")}
              />
            </div>
            <div className="form-actions">
              <button className="ghost" type="button" onClick={resetPixelForm}>
                {t("Reset")}
              </button>
              <button className="action-pill" type="submit">
                {t("Save")}
              </button>
            </div>
          </form>
        ) : null}

        {pixelState.loading ? (
          <div className="empty-state">{t("Loading entries…")}</div>
        ) : pixelState.error ? (
          <div className="empty-state error">{pixelState.error}</div>
        ) : pixelTableRows.length === 0 ? (
          <div className="empty-state">{t("No pixels added yet.")}</div>
        ) : (
          <div className="table-wrap pixel-table-wrap">
            <div className="pixel-table-toolbar">
              <div className="field registry-search-field">
                <label>{t("Search")}</label>
                <div className="registry-search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    value={pixelSearch}
                    onChange={(e) => setPixelSearch(e.target.value)}
                    placeholder={t("Search pixel, buyer, owner…")}
                  />
                  {pixelSearch ? (
                    <button
                      type="button"
                      className="registry-search-clear"
                      onClick={() => setPixelSearch("")}
                      aria-label={t("Clear search")}
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label>{t("Pixel ID")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tablePixelIdFilter}
                  onToggle={toggleTableFilter(setTablePixelIdFilter)}
                  options={pixelIdFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find pixels")}
                  emptyResultsLabel={t("No pixels found.")}
                />
              </div>
              <div className="field">
                <label>{t("Buyer")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableBuyerFilter}
                  onToggle={toggleTableFilter(setTableBuyerFilter)}
                  options={pixelBuyerOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find buyers")}
                  emptyResultsLabel={t("No buyers found.")}
                />
              </div>
              <div className="field">
                <label>{t("Domain")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableFlowFilter}
                  onToggle={toggleTableFilter(setTableFlowFilter)}
                  options={pixelFlowFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find domains")}
                  emptyResultsLabel={t("No domains found.")}
                />
              </div>
              <div className="field">
                <label>{t("GEO")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableGeoFilter}
                  onToggle={toggleTableFilter(setTableGeoFilter)}
                  options={pixelGeoOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find countries")}
                  emptyResultsLabel={t("No countries found.")}
                />
              </div>
              <div className="field">
                <label>{t("Status")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableStatusFilter}
                  onToggle={toggleTableFilter(setTableStatusFilter)}
                  options={pixelStatusFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find status")}
                  emptyResultsLabel={t("No status found.")}
                />
              </div>
              {canManagePixels ? (
                <div className="field">
                  <label>{t("Owner")}</label>
                  <CountryDropdownPicker
                    multiple
                    values={tableOwnerFilter}
                    onToggle={toggleTableFilter(setTableOwnerFilter)}
                    options={pixelOwnerOptions}
                    placeholder={t("All")}
                    searchPlaceholder={t("Type to find owners")}
                    emptyResultsLabel={t("No owners found.")}
                  />
                </div>
              ) : null}
              {pixelFiltersActive ? (
                <button type="button" className="filter-clear-btn" onClick={clearPixelFilters}>
                  <X size={13} /> {t("Clear filters")}
                </button>
              ) : null}
            </div>
            <div className="table-wrap">
            <table className="entries-table pixel-table">
              <thead>
                <tr>
                  {[
                    { key: "id", label: t("ID") },
                    { key: "pixelId", label: t("Pixel ID") },
                    { key: "token", label: t("Token EAAG") },
                    { key: "geo", label: t("GEO") },
                    { key: "domain", label: t("Domain") },
                    { key: "status", label: t("Status") },
                    { key: "comment", label: t("Comment") },
                    { key: "owner", label: t("Owner") },
                  ].map((col) => (
                    <th key={col.key}>
                      <button
                        type="button"
                        className={`sortable-header ${pixelSort.key === col.key ? "active" : ""}`}
                        onClick={() => togglePixelSort(col.key)}
                      >
                        {col.label}
                        <span className="sort-indicator">{getSortIndicator(pixelSort, col.key)}</span>
                      </button>
                    </th>
                  ))}
                  <th className="col-actions">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {pagedPixelTableRows.map(({ pixel, ownerLabel, geos, flows }) => (
                  <tr key={pixel.id}>
                    <td className="mono row-index-cell">{pixel.id}</td>
                    <td className="copy-cell">
                      <div className="copy-inline">
                        <span className="copy-text mono">{pixel.pixel_id}</span>
                        <button
                          className="icon-btn copy-btn"
                          type="button"
                          onClick={handleCopy(pixel.pixel_id)}
                          title={t("Copy")}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="copy-cell token-cell">
                      <div className="copy-inline">
                        <span className="copy-text mono">
                          {revealedTokens.has(pixel.id) ? pixel.token_eaag || "—" : maskToken(pixel.token_eaag)}
                        </span>
                        {pixel.token_eaag ? (
                          <button
                            className="icon-btn copy-btn"
                            type="button"
                            onClick={() => toggleReveal(pixel.id)}
                            aria-label={revealedTokens.has(pixel.id) ? t("Hide token") : t("Reveal token")}
                            aria-pressed={revealedTokens.has(pixel.id)}
                            title={revealedTokens.has(pixel.id) ? t("Hide token") : t("Reveal token")}
                          >
                            {revealedTokens.has(pixel.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        ) : null}
                        <button
                          className="icon-btn copy-btn"
                          type="button"
                          onClick={handleCopy(pixel.token_eaag)}
                          title={t("Copy")}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      {geos.length ? (
                        <div className="geo-chip-row">
                          {geos.slice(0, 3).map((g) => (
                            <span className="geo-chip" key={g}>
                              <CountryFlag value={g} />
                              {g}
                            </span>
                          ))}
                          {geos.length > 3 ? (
                            <span
                              className="geo-chip geo-chip-more"
                              title={geos.slice(3).join(", ")}
                            >
                              +{geos.length - 3}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="offer-muted">—</span>
                      )}
                    </td>
                    <td>
                      {flows.length ? (
                        <div className="geo-chip-row">
                          {flows.slice(0, 2).map((flow) => (
                            <span className="flow-pill" key={flow} title={flow}>
                              <span className="cs-dot" style={{ background: "#6ad6ff" }} aria-hidden="true" />
                              {flow}
                            </span>
                          ))}
                          {flows.length > 2 ? (
                            <span className="geo-chip geo-chip-more" title={flows.slice(2).join(", ")}>
                              +{flows.length - 2}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="offer-muted">—</span>
                      )}
                    </td>
                    <td>
                      {canManagePixels || pixel.owner_id === authUser?.id ? (
                        <Select
                          className={`accounts-status-select acc-st-${(pixel.status || "active").toLowerCase()}`}
                          value={pixel.status || "Active"}
                          onChange={(v) => handlePixelStatusChange(pixel.id, v)}
                          options={buildStatusOptions(t)}
                          placeholder={t("Status")}
                        />
                      ) : (
                        <span className={`accounts-status-pill acc-st-${pixel.status?.toLowerCase() || "active"}`}>
                          {t(pixel.status || "Active")}
                        </span>
                      )}
                    </td>
                    <td>
                      {pixel.comment ? (
                        <button
                          className="comment-text-btn"
                          type="button"
                          onClick={() => handleCommentEdit(pixel)}
                          title={t("Edit comment")}
                        >
                          {pixel.comment}
                        </button>
                      ) : (
                        <button
                          className="icon-btn"
                          type="button"
                          onClick={() => handleCommentEdit(pixel)}
                          aria-label={t("Add comment")}
                          title={t("Add comment")}
                        >
                          <MessageSquare size={15} />
                        </button>
                      )}
                    </td>
                    <td>
                      {ownerLabel && ownerLabel !== "—" ? (
                        <span className="owner-pill">
                          <span className="owner-pill-dot" />
                          {ownerLabel}
                        </span>
                      ) : (
                        <span className="offer-muted">—</span>
                      )}
                    </td>
                    <td>
                      {(canManagePixels || pixel.owner_id === authUser?.id) ? (
                        <div className="accounts-action-group">
                          <button
                            className="icon-btn"
                            type="button"
                            aria-label={t("Edit pixel")}
                            data-tip={t("Edit pixel")}
                            onClick={() => openPixelEdit(pixel)}
                          >
                            <Pencil size={15} />
                          </button>
                          {canManagePixels ? (
                            <button
                              className="icon-btn icon-btn-danger"
                              type="button"
                              aria-label={t("Remove")}
                              data-tip={t("Remove")}
                              onClick={() => handlePixelDelete(pixel.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {!filteredPixelTableRows.length ? (
              <div className="empty-state">{t("No entries found for this filter.")}</div>
            ) : null}
            {filteredPixelTableRows.length > PIXEL_PAGE_SIZE ? (
              <div className="offer-pagebar">
                <span className="offer-results-count">
                  {t("Showing")} {(pixelClampedPage - 1) * PIXEL_PAGE_SIZE + 1}–
                  {Math.min(pixelClampedPage * PIXEL_PAGE_SIZE, filteredPixelTableRows.length)} {t("of")}{" "}
                  {filteredPixelTableRows.length}
                </span>
                <div className="offer-pagination">
                  <button
                    type="button"
                    className="offer-pagination-arrow"
                    disabled={pixelClampedPage <= 1}
                    onClick={() => setPixelPage((p) => Math.max(1, p - 1))}
                    aria-label={t("Previous page")}
                  >
                    ‹
                  </button>
                  {pixelPageList.map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`pixel-ellipsis-${i}`} className="offer-pagination-ellipsis">
                        …
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={p}
                        className={`offer-pagination-page ${p === pixelClampedPage ? "is-active" : ""}`}
                        onClick={() => setPixelPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className="offer-pagination-arrow"
                    disabled={pixelClampedPage >= pixelPageCount}
                    onClick={() => setPixelPage((p) => Math.min(pixelPageCount, p + 1))}
                    aria-label={t("Next page")}
                  >
                    ›
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function AccountsDashboard({ authUser }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const [accounts, setAccounts] = React.useState([]);
  const [accountState, setAccountState] = React.useState({ loading: true, error: null });
  const [pixels, setPixels] = React.useState([]);
  const [pixelState, setPixelState] = React.useState({ loading: true, error: null });
  const [domains, setDomains] = React.useState([]);
  const [domainState, setDomainState] = React.useState({ loading: true, error: null });
  const [users, setUsers] = React.useState([]);
  const [userState, setUserState] = React.useState({ loading: true, error: null });
  const [showForm, setShowForm] = React.useState(false);
  const [formCountryQuery, setFormCountryQuery] = React.useState("");
  const [editCountryQuery, setEditCountryQuery] = React.useState("");
  const [formPixelQuery, setFormPixelQuery] = React.useState("");
  const [editPixelQuery, setEditPixelQuery] = React.useState("");
  const [checkingIntegrationId, setCheckingIntegrationId] = React.useState(null);
  const [integrationCheckResult, setIntegrationCheckResult] = React.useState({});
  const [tableAccountFilter, setTableAccountFilter] = React.useState([]);
  const [tableGeoFilter, setTableGeoFilter] = React.useState([]);
  const [tableStatusFilter, setTableStatusFilter] = React.useState([]);
  const [tableOwnerFilter, setTableOwnerFilter] = React.useState([]);

  const [tableBmFilter, setTableBmFilter] = React.useState([]);
  const toggleTableFilter = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  const [accountSearch, setAccountSearch] = React.useState("");

  const accountFiltersActive =
    tableAccountFilter.length > 0 ||
    tableBmFilter.length > 0 ||
    tableGeoFilter.length > 0 ||
    tableStatusFilter.length > 0 ||
    tableOwnerFilter.length > 0;

  const clearAccountFilters = () => {
    setTableAccountFilter([]);
    setTableBmFilter([]);
    setTableGeoFilter([]);
    setTableStatusFilter([]);
    setTableOwnerFilter([]);
  };
  const [form, setForm] = React.useState({
    accountNumber: "",
    nickname: "",
    status: "Active",
    pixelIds: [],
    countries: [],
    domainIds: [],
    notes: "",
    ownerId: authUser?.id ? String(authUser.id) : "",
  });
  const [editModal, setEditModal] = React.useState({
    open: false,
    row: null,
    saving: false,
    form: {
      accountNumber: "",
      nickname: "",
      status: "Active",
      pixelIds: [],
      countries: [],
      domainIds: [],
      notes: "",
      ownerId: authUser?.id ? String(authUser.id) : "",
    },
  });

  const accountStatusOptions = ["Active", "Pending", "Paused", "Expired", "Blocked"];

  const readAccountError = React.useCallback(async (response, fallbackMessage) => {
    const detail = await response.json().catch(() => null);
    if (response.status === 404) {
      return (
        detail?.error ||
        "Accounts API endpoint not found (404). Redeploy the Render backend with the latest commit."
      );
    }
    return detail?.error || fallbackMessage;
  }, []);

  const toId = React.useCallback((value) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, []);

  const normalizeDomainIds = React.useCallback((value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => Number.parseInt(String(item), 10))
        .filter((item) => Number.isFinite(item) && item > 0);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        return normalizeDomainIds(JSON.parse(trimmed));
      } catch (error) {
        return trimmed
          .split(",")
          .map((item) => Number.parseInt(item, 10))
          .filter((item) => Number.isFinite(item) && item > 0);
      }
    }
    return [];
  }, []);

  const normalizeCountryList = React.useCallback((value) => {
    if (Array.isArray(value)) {
      const normalized = value
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      return Array.from(new Set(normalized));
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        return normalizeCountryList(JSON.parse(trimmed));
      } catch (error) {
        return normalizeCountryList(trimmed.split(","));
      }
    }
    return [];
  }, []);

  const areSameIds = React.useCallback(
    (first, second) => first.length === second.length && first.every((value, index) => value === second[index]),
    []
  );

  const canManageRow = React.useCallback(
    (row) => {
      if (isLeadership) return true;
      return toId(row?.owner_id) === toId(authUser?.id);
    },
    [isLeadership, authUser?.id, toId]
  );

  const updateForm = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const toggleFormPixel = (pixelId) => {
    const parsed = toId(pixelId);
    if (!parsed) return;
    setForm((prev) => {
      const hasPixel = prev.pixelIds.includes(parsed);
      return {
        ...prev,
        pixelIds: hasPixel
          ? prev.pixelIds.filter((id) => id !== parsed)
          : [...prev.pixelIds, parsed],
      };
    });
  };

  const toggleFormDomain = (domainId) => {
    const parsed = toId(domainId);
    if (!parsed) return;
    setForm((prev) => {
      const hasDomain = prev.domainIds.includes(parsed);
      return {
        ...prev,
        domainIds: hasDomain
          ? prev.domainIds.filter((id) => id !== parsed)
          : [...prev.domainIds, parsed],
      };
    });
  };

  const toggleFormCountry = (country) => {
    const normalized = String(country || "").trim();
    if (!normalized) return;
    setForm((prev) => {
      const hasCountry = prev.countries.includes(normalized);
      return {
        ...prev,
        countries: hasCountry
          ? prev.countries.filter((item) => item !== normalized)
          : [...prev.countries, normalized],
      };
    });
  };

  const resetForm = React.useCallback(() => {
    setForm({
      accountNumber: "",
      nickname: "",
      status: "Active",
      pixelIds: [],
      countries: [],
      domainIds: [],
      notes: "",
      ownerId: authUser?.id ? String(authUser.id) : "",
    });
    setFormCountryQuery("");
    setFormPixelQuery("");
  }, [authUser?.id]);

  React.useEffect(() => {
    setForm((prev) => ({ ...prev, ownerId: authUser?.id ? String(authUser.id) : prev.ownerId }));
  }, [authUser?.id]);

  const fetchAccounts = React.useCallback(async () => {
    try {
      setAccountState({ loading: true, error: null });
      const response = await apiFetch("/api/accounts?limit=500");
      if (!response.ok) {
        throw new Error(await readAccountError(response, "Failed to load accounts."));
      }
      const data = await response.json();
      const normalized = Array.isArray(data)
        ? data.map((row) => ({
            ...row,
            pixel_ids: normalizeDomainIds(row?.pixel_ids || (row?.pixel_id ? [row.pixel_id] : [])),
            domain_ids: normalizeDomainIds(row?.domain_ids),
            countries: normalizeCountryList(row?.countries),
          }))
        : [];
      setAccounts(normalized);
      setAccountState({ loading: false, error: null });
    } catch (error) {
      setAccountState({ loading: false, error: error.message || "Failed to load accounts." });
    }
  }, [normalizeDomainIds, normalizeCountryList, readAccountError]);

  const fetchPixels = React.useCallback(async () => {
    try {
      setPixelState({ loading: true, error: null });
      const response = await apiFetch("/api/pixels?limit=500");
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load pixels.");
      }
      const data = await response.json();
      setPixels(Array.isArray(data) ? data : []);
      setPixelState({ loading: false, error: null });
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to load pixels." });
    }
  }, []);

  const fetchDomains = React.useCallback(async () => {
    try {
      setDomainState({ loading: true, error: null });
      const response = await apiFetch("/api/domains?limit=5000");
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load domains.");
      }
      const data = await response.json();
      setDomains(Array.isArray(data) ? data : []);
      setDomainState({ loading: false, error: null });
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to load domains." });
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    if (!isLeadership) {
      setUsers([]);
      setUserState({ loading: false, error: null });
      return;
    }
    try {
      setUserState({ loading: true, error: null });
      const response = await apiFetch("/api/users?limit=500");
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load users.");
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setUserState({ loading: false, error: null });
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to load users." });
    }
  }, [isLeadership]);

  React.useEffect(() => {
    fetchAccounts();
    fetchPixels();
    fetchDomains();
    fetchUsers();
  }, [fetchAccounts, fetchPixels, fetchDomains, fetchUsers]);

  const ownerLookup = React.useMemo(
    () =>
      users.reduce((acc, user) => {
        acc[user.id] = user.username;
        return acc;
      }, {}),
    [users]
  );

  const userLookupById = React.useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      const parsed = toId(user?.id);
      if (!parsed) return;
      map.set(parsed, user);
    });
    return map;
  }, [users, toId]);

  const roleUserCount = React.useMemo(
    () =>
      users.reduce((acc, user) => {
        const role = String(user?.role || "").trim();
        if (!role) return acc;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {}),
    [users]
  );

  const matchesLegacyOwner = React.useCallback(
    (record, ownerId) => {
      const parsedOwnerId = toId(ownerId);
      if (!parsedOwnerId) return false;
      const selectedOwner = userLookupById.get(parsedOwnerId);
      if (!selectedOwner) return false;

      const selectedName = String(selectedOwner.username || "").trim().toLowerCase();
      const recordOwnerName = String(record?.owner_name || "").trim().toLowerCase();
      if (selectedName && recordOwnerName && selectedName === recordOwnerName) {
        return true;
      }

      const selectedRole = String(selectedOwner.role || "").trim();
      const recordOwnerRole = String(record?.owner_role || "").trim();
      if (selectedRole && recordOwnerRole && selectedRole === recordOwnerRole) {
        return (roleUserCount[selectedRole] || 0) === 1;
      }
      return false;
    },
    [roleUserCount, toId, userLookupById]
  );

  const pixelLookup = React.useMemo(
    () =>
      pixels.reduce((acc, pixel) => {
        acc[pixel.id] = pixel;
        return acc;
      }, {}),
    [pixels]
  );

  const getScopedPixels = React.useCallback(
    (ownerId) => {
      if (!isLeadership) return pixels;
      const parsed = toId(ownerId);
      if (!parsed) return [];
      return pixels.filter((pixel) => {
        const pixelOwnerId = toId(pixel.owner_id);
        if (pixelOwnerId) {
          return pixelOwnerId === parsed;
        }
        return matchesLegacyOwner(pixel, parsed);
      });
    },
    [isLeadership, matchesLegacyOwner, pixels, toId]
  );

  const getScopedDomains = React.useCallback(
    (ownerId) => {
      if (!isLeadership) return domains;
      const parsed = toId(ownerId);
      if (!parsed) return [];
      return domains.filter((domain) => {
        const domainOwnerId = toId(domain.owner_id);
        if (domainOwnerId) {
          return domainOwnerId === parsed;
        }
        return matchesLegacyOwner(domain, parsed);
      });
    },
    [domains, isLeadership, matchesLegacyOwner, toId]
  );

  const formOwnerId = React.useMemo(
    () => (isLeadership ? toId(form.ownerId) : toId(authUser?.id)),
    [isLeadership, form.ownerId, authUser?.id, toId]
  );

  const availableFormPixels = React.useMemo(
    () => getScopedPixels(formOwnerId),
    [getScopedPixels, formOwnerId]
  );
  const availableFormDomains = React.useMemo(
    () => getScopedDomains(formOwnerId),
    [getScopedDomains, formOwnerId]
  );

  const resolveOwnerNameById = React.useCallback(
    (ownerId) => {
      const parsed = toId(ownerId);
      if (!parsed) return "";
      const matchedUser = users.find((user) => toId(user.id) === parsed);
      if (matchedUser?.username) return matchedUser.username;
      if (toId(authUser?.id) === parsed) return authUser?.username || "You";
      return ownerLookup[parsed] || "";
    },
    [users, ownerLookup, authUser?.id, authUser?.username, toId]
  );

  const formOwnerName = React.useMemo(
    () => resolveOwnerNameById(formOwnerId),
    [resolveOwnerNameById, formOwnerId]
  );

  React.useEffect(() => {
    const allowedPixelIds = new Set(availableFormPixels.map((pixel) => pixel.id));
    const allowedDomainIds = new Set(availableFormDomains.map((domain) => domain.id));
    setForm((prev) => {
      const nextPixelIds = prev.pixelIds.filter((id) => allowedPixelIds.has(id));
      const nextDomainIds = prev.domainIds.filter((id) => allowedDomainIds.has(id));
      if (areSameIds(nextPixelIds, prev.pixelIds) && areSameIds(nextDomainIds, prev.domainIds)) {
        return prev;
      }
      return {
        ...prev,
        pixelIds: nextPixelIds,
        domainIds: nextDomainIds,
      };
    });
  }, [availableFormPixels, availableFormDomains, areSameIds]);

  const visibleAccounts = React.useMemo(() => {
    if (isLeadership) return accounts;
    const ownerId = toId(authUser?.id);
    return accounts.filter((account) => toId(account.owner_id) === ownerId);
  }, [isLeadership, accounts, authUser?.id, toId]);

  const accountSummary = React.useMemo(() => {
    const totals = { total: 0, active: 0, attention: 0, blocked: 0 };
    for (const row of visibleAccounts) {
      const normalizedStatus = String(row?.status || "").trim().toLowerCase();
      totals.total += 1;
      if (normalizedStatus === "active") totals.active += 1;
      if (normalizedStatus === "blocked") totals.blocked += 1;
      if (normalizedStatus === "pending" || normalizedStatus === "paused" || normalizedStatus === "expired") {
        totals.attention += 1;
      }
    }
    return totals;
  }, [visibleAccounts]);

  const resolveOwnerLabel = (row) => {
    if (row?.owner_name) return row.owner_name;
    if (row?.owner_id && ownerLookup[row.owner_id]) return ownerLookup[row.owner_id];
    if (row?.owner_id === authUser?.id) return authUser?.username || "You";
    return row?.owner_role ? t(row.owner_role) : "—";
  };

  const resolvePixelIds = React.useCallback(
    (row) => {
      const ids = normalizeDomainIds(row?.pixel_ids || (row?.pixel_id ? [row.pixel_id] : []));
      return ids;
    },
    [normalizeDomainIds]
  );

  const resolvePixelLabel = (row) => {
    const pixelIds = resolvePixelIds(row);
    if (!pixelIds.length) return "—";
    return pixelIds.map((id) => pixelLookup[id]?.pixel_id || `#${id}`).join(", ");
  };

  const resolveCountriesLabel = (row) => {
    const countries = normalizeCountryList(row?.countries);
    if (!countries.length) return "—";
    return countries.join(", ");
  };

  const accountTableRows = React.useMemo(
    () =>
      visibleAccounts.map((row) => ({
        row,
        ownerLabel: resolveOwnerLabel(row),
        countries: normalizeCountryList(row?.countries),
      })),
    [visibleAccounts, normalizeCountryList, authUser?.id, authUser?.username, ownerLookup, t]
  );

  const accountFilterOptions = React.useMemo(() => {
    const unique = new Map();
    accountTableRows.forEach(({ row }) => {
      const value = String(row?.account_number || "").trim();
      if (!value) return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [accountTableRows]);

  const accountGeoFilterOptions = React.useMemo(() => {
    const unique = new Map();
    accountTableRows.forEach(({ countries }) => {
      countries.forEach((country) => {
        const value = String(country || "").trim();
        if (!value) return;
        unique.set(value.toLowerCase(), value);
      });
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [accountTableRows]);

  const accountBmFilterOptions = React.useMemo(() => {
    const unique = new Map();
    accountTableRows.forEach(({ row }) => {
      const value = String(row?.nickname || "").trim();
      if (!value) return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [accountTableRows]);

  const accountStatusFilterOptions = React.useMemo(
    () => accountStatusOptions.map((status) => ({ value: status, label: t(status), search: status })),
    [accountStatusOptions, t]
  );

  const accountOwnerFilterOptions = React.useMemo(() => {
    const unique = new Map();
    accountTableRows.forEach(({ ownerLabel }) => {
      const value = String(ownerLabel || "").trim();
      if (!value || value === "—") return;
      unique.set(value.toLowerCase(), value);
    });
    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value, search: value }));
  }, [accountTableRows]);

  React.useEffect(() => {
    // Prune any selected multi-filter values that are no longer valid options.
    // Return the same array ref when nothing changed to avoid a render loop.
    const prune = (setter, options) =>
      setter((prev) => {
        const next = prev.filter((v) => options.some((option) => option.value === v));
        return next.length === prev.length ? prev : next;
      });
    prune(setTableAccountFilter, accountFilterOptions);
    prune(setTableBmFilter, accountBmFilterOptions);
    prune(setTableGeoFilter, accountGeoFilterOptions);
    prune(setTableStatusFilter, accountStatusFilterOptions);
    prune(setTableOwnerFilter, accountOwnerFilterOptions);
  }, [
    accountFilterOptions,
    accountBmFilterOptions,
    accountGeoFilterOptions,
    accountStatusFilterOptions,
    accountOwnerFilterOptions,
  ]);

  const normalizedAccountSearch = accountSearch.trim().toLowerCase();
  const filteredAccountRows = React.useMemo(
    () =>
      accountTableRows.filter(({ row, ownerLabel, countries }) => {
        if (normalizedAccountSearch) {
          const hay = `${row?.account_number || ""} ${row?.nickname || ""} ${ownerLabel || ""}`.toLowerCase();
          if (!hay.includes(normalizedAccountSearch)) return false;
        }
        if (tableAccountFilter.length && !tableAccountFilter.includes(String(row?.account_number || ""))) return false;
        if (tableBmFilter.length && !tableBmFilter.includes(String(row?.nickname || "").trim())) return false;
        if (tableGeoFilter.length && !tableGeoFilter.some((g) => countries.includes(g))) return false;
        if (tableStatusFilter.length && !tableStatusFilter.includes(String(row?.status || ""))) return false;
        if (isLeadership && tableOwnerFilter.length && !tableOwnerFilter.includes(ownerLabel)) return false;
        return true;
      }),
    [
      accountTableRows,
      normalizedAccountSearch,
      tableAccountFilter,
      tableBmFilter,
      tableGeoFilter,
      tableStatusFilter,
      tableOwnerFilter,
      isLeadership,
    ]
  );

  const resolveIntegrationState = (row) => {
    const integrationId = toId(row?.meta_integration_id);
    const wired = Number(row?.integration_is_wired || 0) === 1;
    const hasIntegration =
      Boolean(integrationId) ||
      (Boolean(row?.integration_account_number) ||
        Boolean(row?.integration_meta_token) ||
        Boolean(row?.integration_buyer_name) ||
        Boolean(row?.integration_status) ||
        Boolean(row?.integration_last_checked_at));
    const status = String(row?.integration_status || "").trim().toLowerCase();
    const spend = Number(row?.integration_received_spend || 0);
    const workingByStatus = [
      "active",
      "done",
      "wired",
      "working",
      "synced",
      "ok",
      "success",
      "healthy",
      "online",
    ].includes(status);
    const downByStatus = ["not working", "blocked", "error", "failed", "offline", "broken", "issue"].includes(
      status
    );
    if (!hasIntegration) {
      return { hasIntegration: false, tone: "is-pending", label: t("Pending") };
    }
    if (wired || spend > 0 || workingByStatus) {
      return { hasIntegration: true, tone: "is-working", label: t("Success") };
    }
    if (downByStatus) {
      return {
        hasIntegration: true,
        tone: "is-down",
        label: t("Not Working"),
      };
    }
    return {
      hasIntegration: true,
      tone: "is-pending",
      label: t("Pending"),
    };
  };

  const [accountSort, setAccountSort] = React.useState({ key: null, dir: "asc" });
  const toggleAccountSort = (key) => setAccountSort((prev) => toggleSortConfig(prev, key, "asc"));
  const getAccountSortValue = ({ row, ownerLabel, countries }, key) => {
    switch (key) {
      case "account": return String(row?.account_number || "");
      case "bm": return String(row?.nickname || "");
      case "status": return String(row?.status || "");
      case "geo": return countries?.[0] || "";
      case "integration": return resolveIntegrationState(row).label || "";
      case "owner": return ownerLabel || "";
      default: return null;
    }
  };

  const sortedAccountRows = React.useMemo(() => {
    const rows = [...filteredAccountRows];
    if (!accountSort?.key) return rows;
    return rows.sort((a, b) =>
      compareSortValues(
        getAccountSortValue(a, accountSort.key),
        getAccountSortValue(b, accountSort.key),
        accountSort.dir,
        "text"
      )
    );
  }, [filteredAccountRows, accountSort]);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: form.accountNumber,
          nickname: form.nickname,
          status: form.status,
          pixelIds: form.pixelIds,
          pixelId: form.pixelIds[0] || null,
          countries: form.countries,
          domainIds: form.domainIds,
          notes: form.notes,
          ownerId: isLeadership && formOwnerId ? formOwnerId : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(await readAccountError(response, "Failed to save account."));
      }
      await fetchAccounts();
      resetForm();
    } catch (error) {
      setAccountState({ loading: false, error: error.message || "Failed to save account." });
    }
  };

  const handleStatusChange = async (row, status) => {
    if (!canManageRow(row)) return;
    try {
      const response = await apiFetch(`/api/accounts/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(await readAccountError(response, "Failed to update status."));
      }
      await fetchAccounts();
    } catch (error) {
      setAccountState({ loading: false, error: error.message || "Failed to update status." });
    }
  };

  const openEditModal = (row) => {
    setEditCountryQuery("");
    setEditPixelQuery("");
    setEditModal({
      open: true,
      row,
      saving: false,
      form: {
        accountNumber: String(row?.account_number || ""),
        nickname: String(row?.nickname || ""),
        status: String(row?.status || "Active"),
        pixelIds: resolvePixelIds(row),
        countries: normalizeCountryList(row?.countries),
        domainIds: normalizeDomainIds(row?.domain_ids),
        notes: String(row?.notes || ""),
        ownerId: row?.owner_id ? String(row.owner_id) : authUser?.id ? String(authUser.id) : "",
      },
    });
  };

  const closeEditModal = React.useCallback(() => {
    setEditCountryQuery("");
    setEditPixelQuery("");
    setEditModal({
      open: false,
      row: null,
      saving: false,
      form: {
        accountNumber: "",
        status: "Active",
        pixelIds: [],
        countries: [],
        domainIds: [],
        notes: "",
        ownerId: authUser?.id ? String(authUser.id) : "",
      },
    });
  }, [authUser?.id]);

  const updateEditForm = (key) => (event) => {
    setEditModal((prev) => {
      if (!prev.open) return prev;
      return { ...prev, form: { ...prev.form, [key]: event.target.value } };
    });
  };

  const toggleEditPixel = (pixelId) => {
    const parsed = toId(pixelId);
    if (!parsed) return;
    setEditModal((prev) => {
      if (!prev.open) return prev;
      const hasPixel = prev.form.pixelIds.includes(parsed);
      return {
        ...prev,
        form: {
          ...prev.form,
          pixelIds: hasPixel
            ? prev.form.pixelIds.filter((id) => id !== parsed)
            : [...prev.form.pixelIds, parsed],
        },
      };
    });
  };

  const toggleEditDomain = (domainId) => {
    const parsed = toId(domainId);
    if (!parsed) return;
    setEditModal((prev) => {
      if (!prev.open) return prev;
      const hasDomain = prev.form.domainIds.includes(parsed);
      return {
        ...prev,
        form: {
          ...prev.form,
          domainIds: hasDomain
            ? prev.form.domainIds.filter((id) => id !== parsed)
            : [...prev.form.domainIds, parsed],
        },
      };
    });
  };

  const toggleEditCountry = (country) => {
    const normalized = String(country || "").trim();
    if (!normalized) return;
    setEditModal((prev) => {
      if (!prev.open) return prev;
      const hasCountry = prev.form.countries.includes(normalized);
      return {
        ...prev,
        form: {
          ...prev.form,
          countries: hasCountry
            ? prev.form.countries.filter((item) => item !== normalized)
            : [...prev.form.countries, normalized],
        },
      };
    });
  };

  const editOwnerId = React.useMemo(() => {
    if (!editModal.open) return null;
    if (isLeadership) return toId(editModal.form.ownerId);
    return toId(editModal.row?.owner_id) || toId(authUser?.id);
  }, [editModal, isLeadership, authUser?.id, toId]);

  const availableEditPixels = React.useMemo(
    () => getScopedPixels(editOwnerId),
    [getScopedPixels, editOwnerId]
  );
  const availableEditDomains = React.useMemo(
    () => getScopedDomains(editOwnerId),
    [getScopedDomains, editOwnerId]
  );

  const editOwnerName = React.useMemo(
    () => resolveOwnerNameById(editOwnerId),
    [resolveOwnerNameById, editOwnerId]
  );

  React.useEffect(() => {
    if (!editModal.open) return;
    const allowedPixelIds = new Set(availableEditPixels.map((pixel) => pixel.id));
    const allowedDomainIds = new Set(availableEditDomains.map((domain) => domain.id));
    setEditModal((prev) => {
      if (!prev.open) return prev;
      const nextPixelIds = prev.form.pixelIds.filter((id) => allowedPixelIds.has(id));
      const nextDomainIds = prev.form.domainIds.filter((id) => allowedDomainIds.has(id));
      if (areSameIds(nextPixelIds, prev.form.pixelIds) && areSameIds(nextDomainIds, prev.form.domainIds)) {
        return prev;
      }
      return {
        ...prev,
        form: {
          ...prev.form,
          pixelIds: nextPixelIds,
          domainIds: nextDomainIds,
        },
      };
    });
  }, [editModal.open, availableEditPixels, availableEditDomains, areSameIds]);

  const handleEditSave = async () => {
    if (!editModal.open || !editModal.row?.id || !canManageRow(editModal.row)) return;
    setEditModal((prev) => ({ ...prev, saving: true }));
    try {
      const response = await apiFetch(`/api/accounts/${editModal.row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: editModal.form.accountNumber,
          nickname: editModal.form.nickname,
          status: editModal.form.status,
          pixelIds: editModal.form.pixelIds,
          pixelId: editModal.form.pixelIds[0] || null,
          countries: editModal.form.countries,
          domainIds: editModal.form.domainIds,
          notes: editModal.form.notes,
          ownerId: isLeadership && editOwnerId ? editOwnerId : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(await readAccountError(response, "Failed to update account."));
      }
      await fetchAccounts();
      closeEditModal();
    } catch (error) {
      setAccountState({ loading: false, error: error.message || "Failed to update account." });
      setEditModal((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleDelete = async (row) => {
    if (!canManageRow(row)) return;
    const confirmed = await appConfirm({
      title: "Remove account?",
      message: "This cannot be undone.",
      confirmLabel: "Remove account",
    });
    if (!confirmed) return;
    try {
      const response = await apiFetch(`/api/accounts/${row.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await readAccountError(response, "Failed to delete account."));
      }
      await fetchAccounts();
    } catch (error) {
      setAccountState({ loading: false, error: error.message || "Failed to delete account." });
    }
  };

  const handleCheckIntegration = async (row) => {
    const integrationId = toId(row?.meta_integration_id);
    if (!integrationId) {
      setIntegrationCheckResult((prev) => ({
        ...prev,
        [row.id]: { tone: "error", text: t("No integration linked.") },
      }));
      return;
    }
    try {
      setCheckingIntegrationId(row.id);
      const response = await apiFetch(`/api/meta-tokens/${integrationId}/test`, { method: "POST" });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Integration check failed.");
      }
      await fetchAccounts();
      setIntegrationCheckResult((prev) => ({
        ...prev,
        [row.id]: { tone: "success", text: t("Integration checked.") },
      }));
    } catch (error) {
      setIntegrationCheckResult((prev) => ({
        ...prev,
        [row.id]: { tone: "error", text: error.message || "Integration check failed." },
      }));
    } finally {
      setCheckingIntegrationId(null);
    }
  };

  const renderPixelPicker = ({
    pixelPool,
    selectedPixelIds,
    onToggle,
    emptyLabel,
    pixelQuery,
    onPixelQueryChange,
  }) => {
    const sortedPixelPool = [...pixelPool].sort((first, second) =>
      String(first?.pixel_id || "").localeCompare(String(second?.pixel_id || ""), undefined, { sensitivity: "base" })
    );
    const normalizedQuery = String(pixelQuery || "").trim().toLowerCase();
    const filteredPool = sortedPixelPool.filter((pixel) =>
      String(pixel?.pixel_id || "").toLowerCase().includes(normalizedQuery)
    );
    const selected = sortedPixelPool.filter((pixel) => selectedPixelIds.includes(pixel.id));

    return (
      <details
        className="accounts-pixel-picker"
        onToggle={(event) => {
          if (!event.currentTarget.open && pixelQuery) {
            onPixelQueryChange("");
          }
        }}
      >
        <summary className="accounts-pixel-trigger">
          <div className="accounts-pixel-selected">
            {selected.length ? (
              selected.slice(0, 2).map((pixel) => (
                <span key={`pixel-chip-${pixel.id}`} className="accounts-pixel-chip">
                  {pixel.pixel_id}
                </span>
              ))
            ) : (
              <span className="accounts-pixel-placeholder">{emptyLabel}</span>
            )}
            {selected.length > 2 ? (
              <span className="accounts-pixel-chip accounts-pixel-chip-muted">+{selected.length - 2}</span>
            ) : null}
          </div>
          <div className="accounts-pixel-meta">
            {selected.length ? <span className="accounts-pixel-count">{selected.length}</span> : null}
            <span className="accounts-pixel-arrow" aria-hidden="true">
              ▾
            </span>
          </div>
        </summary>
        <div className="accounts-pixel-menu">
          <div className="accounts-pixel-search-wrap">
            <input
              className="accounts-pixel-search"
              type="text"
              value={pixelQuery}
              onChange={(event) => onPixelQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
              placeholder={t("Type to find pixels")}
            />
            {pixelQuery ? (
              <button
                type="button"
                className="accounts-pixel-search-clear"
                onClick={() => onPixelQueryChange("")}
                aria-label={t("Clear")}
              >
                ×
              </button>
            ) : null}
          </div>
          <div className="accounts-pixel-options">
            {filteredPool.length ? (
              filteredPool.map((pixel) => {
                const checked = selectedPixelIds.includes(pixel.id);
                return (
                  <label
                    key={`pixel-option-${pixel.id}`}
                    className={`accounts-pixel-option${checked ? " is-checked" : ""}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => onToggle(pixel.id)} />
                    <span className="accounts-pixel-check">{checked ? "✓" : ""}</span>
                    <span className="accounts-pixel-name">{pixel.pixel_id}</span>
                    <span className="accounts-pixel-owner">{resolveOwnerLabel(pixel)}</span>
                  </label>
                );
              })
            ) : (
              <div className="accounts-pixel-empty-results">{t("No pixels found.")}</div>
            )}
          </div>
        </div>
      </details>
    );
  };

  const renderDomainPicker = ({ domainPool, selectedDomainIds, onToggle, emptyLabel, ownerLabel }) => {
    const sortedDomainPool = [...domainPool].sort((first, second) =>
      String(first?.domain || "").localeCompare(String(second?.domain || ""), undefined, { sensitivity: "base" })
    );
    const selected = sortedDomainPool.filter((domain) => selectedDomainIds.includes(domain.id));
    const hasDomainPool = sortedDomainPool.length > 0;

    if (!hasDomainPool) {
      const ownerMessage = ownerLabel
        ? `No domains available for ${ownerLabel}.`
        : t("No domains available for this owner.");
      return (
        <div className="accounts-domain-picker is-empty">
          <div className="accounts-domain-inline-empty">
            <span className="accounts-domain-empty-title">{emptyLabel}</span>
            <span className="accounts-domain-empty-copy">{ownerMessage}</span>
          </div>
        </div>
      );
    }

    const previewLimit = 2;
    const selectedPreview = selected.slice(0, previewLimit);
    const remainingSelected = Math.max(0, selected.length - selectedPreview.length);

    return (
      <details className="accounts-domain-picker">
        <summary className="accounts-domain-trigger">
          <div className="accounts-domain-selected">
            {selectedPreview.length ? (
              selectedPreview.map((domain) => (
                <span key={`chip-${domain.id}`} className="accounts-domain-chip">
                  {domain.domain}
                </span>
              ))
            ) : (
              <span className="accounts-domain-empty">{emptyLabel}</span>
            )}
            {remainingSelected ? <span className="accounts-domain-more">+{remainingSelected}</span> : null}
          </div>
          <div className="accounts-domain-meta">
            <span className="accounts-domain-count">
              {selected.length}/{sortedDomainPool.length}
            </span>
            <span className="accounts-domain-arrow" aria-hidden="true">
              ▾
            </span>
          </div>
        </summary>
        <div className="accounts-domain-menu">
          <div className="accounts-domain-list">
            {sortedDomainPool.map((domain) => {
              const checked = selectedDomainIds.includes(domain.id);
              return (
                <label
                  key={`domain-${domain.id}`}
                  className={`accounts-domain-option${checked ? " is-checked" : ""}`}
                >
                  <input type="checkbox" checked={checked} onChange={() => onToggle(domain.id)} />
                  <span className="accounts-domain-option-name">{domain.domain}</span>
                  <span className="accounts-domain-option-meta">
                    {normalizeCountryListValue(
                      Array.isArray(domain?.countries) && domain.countries.length
                        ? domain.countries
                        : domain?.country
                    ).join(", ") || "No country"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </details>
    );
  };

  const formDomainScopeHint = React.useMemo(() => {
    if (!formOwnerName) return t("Select all domains responsible for this account.");
    if (availableFormDomains.length === 0) return `No domains found for ${formOwnerName}.`;
    return `${availableFormDomains.length} domain${availableFormDomains.length === 1 ? "" : "s"} available for ${formOwnerName}.`;
  }, [formOwnerName, availableFormDomains.length, t]);

  const renderCountryPicker = ({
    selectedCountries,
    onToggle,
    emptyLabel,
    countryQuery,
    onCountryQueryChange,
  }) => {
    const selected = accountRegistryCountryOptions.filter((country) => selectedCountries.includes(country));
    const normalizedQuery = String(countryQuery || "").trim().toLowerCase();
    const filteredCountries = accountRegistryCountryOptions.filter((country) =>
      country.toLowerCase().includes(normalizedQuery)
    );
    return (
      <details
        className="accounts-country-picker"
        onToggle={(event) => {
          if (!event.currentTarget.open && countryQuery) {
            onCountryQueryChange("");
          }
        }}
      >
        <summary className="accounts-country-trigger">
          <div className="accounts-country-selected">
            {selected.length ? (
              selected.map((country) => (
                <span key={`country-chip-${country}`} className="accounts-country-chip">
                  {country}
                </span>
              ))
            ) : (
              <span className="accounts-country-placeholder">{emptyLabel}</span>
            )}
          </div>
          <div className="accounts-country-meta">
            {selected.length ? <span className="accounts-country-count">{selected.length}</span> : null}
            <span className="accounts-country-arrow" aria-hidden="true">
              ▾
            </span>
          </div>
        </summary>
        <div className="accounts-country-menu">
          <div className="accounts-country-search-wrap">
            <input
              className="accounts-country-search"
              type="text"
              value={countryQuery}
              onChange={(event) => onCountryQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
              placeholder={t("Type to find countries")}
            />
            {countryQuery ? (
              <button
                type="button"
                className="accounts-country-search-clear"
                onClick={() => onCountryQueryChange("")}
                aria-label={t("Clear")}
              >
                ×
              </button>
            ) : null}
          </div>
          <div className="accounts-country-options">
            {filteredCountries.length ? (
              filteredCountries.map((country) => {
                const checked = selectedCountries.includes(country);
                return (
                  <label
                    key={`country-option-${country}`}
                    className={`accounts-country-option${checked ? " is-checked" : ""}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => onToggle(country)} />
                    <span className="accounts-country-check">{checked ? "✓" : ""}</span>
                    <span className="accounts-country-name">{country}</span>
                  </label>
                );
              })
            ) : (
              <div className="accounts-country-empty-results">{t("No countries found.")}</div>
            )}
          </div>
        </div>
      </details>
    );
  };

  return (
    <section className="form-section">
      <AnimatePresence>
        {editModal.open ? (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditModal}
          >
            <motion.div
              className="modal accounts-modal edit-modal-accent accounts-edit-accent"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Accounts Registry")}</p>
                  <h2>{t("Edit account")}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={closeEditModal}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body accounts-modal-body">
                <div className="accounts-edit-summary field-span-3">
                  <div className="accounts-edit-summary-item">
                    <span>{t("Account")}</span>
                    <strong>{editModal.form.accountNumber || "—"}</strong>
                  </div>
                  <div className="accounts-edit-summary-item">
                    <span>{t("Pixels")}</span>
                    <strong>{editModal.form.pixelIds.length || 0}</strong>
                  </div>
                  <div className="accounts-edit-summary-item">
                    <span>{t("GEO")}</span>
                    <strong>{editModal.form.countries.length || 0}</strong>
                  </div>
                  <div className="accounts-edit-summary-item">
                    <span>{t("Integration")}</span>
                    <strong>{editModal.row?.integration_account_number || "—"}</strong>
                  </div>
                </div>
                <div className="field">
                  <label>{t("Account Number")}</label>
                  <input value={editModal.form.accountNumber} onChange={updateEditForm("accountNumber")} required />
                </div>
                <div className="field">
                  <label>{t("BM")}</label>
                  <input value={editModal.form.nickname} onChange={updateEditForm("nickname")} placeholder={t("e.g. BM 3 Mina")} maxLength={60} />
                </div>
                <div className="field">
                  <label>{t("Status")}</label>
                  <Select
                    value={editModal.form.status}
                    onChange={(v) => setEditModal((prev) => prev.open ? { ...prev, form: { ...prev.form, status: v } } : prev)}
                    options={accountStatusOptions.map((s) => ({ value: s, label: t(s) }))}
                    placeholder={t("Select")}
                  />
                </div>
                {isLeadership ? (
                  <div className="field">
                    <label>{t("Owner")}</label>
                    <Select
                      value={editModal.form.ownerId || ""}
                      onChange={(v) => setEditModal((prev) => prev.open ? { ...prev, form: { ...prev.form, ownerId: v } } : prev)}
                      options={users.map((user) => ({ value: String(user.id), label: `${user.username} · ${t(user.role)}` }))}
                      placeholder={userState.loading ? t("Loading...") : users.length ? t("Select") : t("No users")}
                      searchPlaceholder={t("Find owner")}
                    />
                  </div>
                ) : null}
                <div className="field field-span-3">
                  <label>{t("GEO")} <span className="field-pace-hint">{t("multi-select")}</span></label>
                  <CountryDropdownPicker
                    multiple
                    values={editModal.form.countries}
                    onToggle={toggleEditCountry}
                    options={countryOptions}
                    placeholder={t("No countries selected")}
                    searchPlaceholder={t("Type to find countries")}
                    emptyResultsLabel={t("No countries found.")}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={closeEditModal}>
                  {t("Cancel")}
                </button>
                <button className="action-pill" type="button" onClick={handleEditSave} disabled={editModal.saving}>
                  {editModal.saving ? t("Saving...") : t("Save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="panel registry-dashboard-panel accounts-registry-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><Users size={20} /></span>
            <div>
              <h3 className="panel-title">{t("Accounts Registry")}</h3>
              <p className="panel-subtitle">
                {t("Register account numbers with a nickname, owner, and status in one clean view.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`offers-mode-toggle${showForm ? " is-active" : ""}`}
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? t("Close") : (<><Plus size={13} strokeWidth={2.5} /> {t("Add Account")}</>)}
          </button>
        </div>

        <div className="accounts-summary-strip">
          {[
            { key: "total", tone: "neutral", label: t("Registered Accounts"), value: accountSummary.total, Icon: UserPlus, pct: null },
            { key: "active", tone: "success", label: t("Active"), value: accountSummary.active, Icon: CheckCircle, pct: accountSummary.total ? Math.round((accountSummary.active / accountSummary.total) * 100) : 0 },
            { key: "attention", tone: "warning", label: t("Need Attention"), value: accountSummary.attention, Icon: AlertTriangle, pct: accountSummary.total ? Math.round((accountSummary.attention / accountSummary.total) * 100) : 0 },
            { key: "blocked", tone: "danger", label: t("Blocked"), value: accountSummary.blocked, Icon: Lock, pct: accountSummary.total ? Math.round((accountSummary.blocked / accountSummary.total) * 100) : 0 },
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
                <span className="accounts-summary-sub">{t("on record")}</span>
              )}
            </div>
          ))}
        </div>

        {showForm ? (
          <form className="form-grid accounts-form" onSubmit={handleCreate}>
            <div className="field">
              <label>{t("Account Number")}</label>
              <input value={form.accountNumber} onChange={updateForm("accountNumber")} placeholder="804123612647228" required />
            </div>
            <div className="field">
              <label>{t("BM")} <span className="field-pace-hint">{t("business manager")}</span></label>
              <input value={form.nickname} onChange={updateForm("nickname")} placeholder={t("e.g. BM 3 Mina")} maxLength={60} />
            </div>
            <div className="field">
              <label>{t("Status")}</label>
              <Select
                value={form.status}
                onChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
                options={accountStatusOptions.map((s) => ({ value: s, label: t(s) }))}
                placeholder={t("Select")}
              />
            </div>
            {isLeadership ? (
              <div className="field accounts-owner-field">
                <label>{t("Owner")}</label>
                <Select
                  value={form.ownerId || ""}
                  onChange={(v) => setForm((prev) => ({ ...prev, ownerId: v }))}
                  options={users.map((user) => ({ value: String(user.id), label: `${user.username} · ${t(user.role)}` }))}
                  placeholder={userState.loading ? t("Loading...") : users.length ? t("Select") : t("No users")}
                  searchPlaceholder={t("Find owner")}
                />
              </div>
            ) : null}
            <div className="field field-span-3 accounts-comment-field">
              <label>{t("GEO")} <span className="field-pace-hint">{t("multi-select")}</span></label>
              <CountryDropdownPicker
                multiple
                values={form.countries}
                onToggle={toggleFormCountry}
                options={countryOptions}
                placeholder={t("No countries selected")}
                searchPlaceholder={t("Type to find countries")}
                emptyResultsLabel={t("No countries found.")}
              />
            </div>
            <div className="form-actions">
              <button className="ghost" type="button" onClick={resetForm}>
                {t("Reset")}
              </button>
              <button className="action-pill" type="submit">
                {t("Save")}
              </button>
            </div>
          </form>
        ) : null}

        {accountState.error ? <div className="empty-state error">{accountState.error}</div> : null}
        {pixelState.error ? <div className="empty-state error">{pixelState.error}</div> : null}
        {domainState.error ? <div className="empty-state error">{domainState.error}</div> : null}
        {userState.error ? <div className="empty-state error">{userState.error}</div> : null}

        {accountState.loading ? (
          <div className="empty-state">{t("Loading accounts…")}</div>
        ) : accountTableRows.length === 0 ? (
          <div className="empty-state">{t("No accounts added yet.")}</div>
        ) : (
          <div className="table-wrap pixel-table-wrap">
            <div className="pixel-table-toolbar">
              <div className="field registry-search-field">
                <label>{t("Search")}</label>
                <div className="registry-search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder={t("Search account, BM, owner…")}
                  />
                  {accountSearch ? (
                    <button
                      type="button"
                      className="registry-search-clear"
                      onClick={() => setAccountSearch("")}
                      aria-label={t("Clear search")}
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label>{t("Account")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableAccountFilter}
                  onToggle={toggleTableFilter(setTableAccountFilter)}
                  options={accountFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find accounts")}
                  emptyResultsLabel={t("No entries found.")}
                />
              </div>
              <div className="field">
                <label>{t("BM")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableBmFilter}
                  onToggle={toggleTableFilter(setTableBmFilter)}
                  options={accountBmFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find BMs")}
                  emptyResultsLabel={t("No BMs found.")}
                />
              </div>
              <div className="field">
                <label>{t("GEO")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableGeoFilter}
                  onToggle={toggleTableFilter(setTableGeoFilter)}
                  options={accountGeoFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find countries")}
                  emptyResultsLabel={t("No countries found.")}
                />
              </div>
              <div className="field">
                <label>{t("Status")}</label>
                <CountryDropdownPicker
                  multiple
                  values={tableStatusFilter}
                  onToggle={toggleTableFilter(setTableStatusFilter)}
                  options={accountStatusFilterOptions}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find status")}
                  emptyResultsLabel={t("No status found.")}
                />
              </div>
              {isLeadership ? (
                <div className="field">
                  <label>{t("Owner")}</label>
                  <CountryDropdownPicker
                    multiple
                    values={tableOwnerFilter}
                    onToggle={toggleTableFilter(setTableOwnerFilter)}
                    options={accountOwnerFilterOptions}
                    placeholder={t("All")}
                    searchPlaceholder={t("Type to find owners")}
                    emptyResultsLabel={t("No owners found.")}
                  />
                </div>
              ) : null}
              {accountFiltersActive ? (
                <button type="button" className="filter-clear-btn" onClick={clearAccountFilters}>
                  <X size={13} /> {t("Clear filters")}
                </button>
              ) : null}
            </div>
            <div className="table-wrap">
            <table className="entries-table accounts-table">
              <thead>
                <tr>
                  {[
                    { key: "account", label: t("Account") },
                    { key: "bm", label: t("BM") },
                    { key: "status", label: t("Status") },
                    { key: "geo", label: t("GEO") },
                    { key: "integration", label: t("Integration") },
                    { key: "owner", label: t("Owner") },
                  ].map((col) => (
                    <th key={col.key}>
                      <button
                        type="button"
                        className={`sortable-header ${accountSort.key === col.key ? "active" : ""}`}
                        onClick={() => toggleAccountSort(col.key)}
                      >
                        {col.label}
                        <span className="sort-indicator">{getSortIndicator(accountSort, col.key)}</span>
                      </button>
                    </th>
                  ))}
                  <th>{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedAccountRows.map(({ row, ownerLabel, countries }) => {
                  const integrationState = resolveIntegrationState(row);
                  const checkResult = integrationCheckResult[row.id];
                  const rowCanManage = canManageRow(row);
                  return (
                    <tr key={row.id} className={`accounts-row acc-row-${String(row.status || "").toLowerCase()}`}>
                      <td className="accounts-account-number">
                        <span className="flow-pill" title={row.account_number}>
                          <span className="cs-dot" style={{ background: "#6ad6ff" }} aria-hidden="true" />
                          {row.account_number}
                        </span>
                      </td>
                      <td className="accounts-nickname-cell">
                        {row.nickname ? row.nickname : <span className="offer-muted">—</span>}
                      </td>
                      <td>
                        {rowCanManage ? (
                          <Select
                            className={`accounts-status-select acc-st-${(row.status || "inactive").toLowerCase()}`}
                            value={row.status || "Active"}
                            onChange={(v) => handleStatusChange(row, v)}
                            options={accountStatusOptions.map((status) => ({ value: status, label: t(status), dot: STATUS_DOT_COLOR[status.toLowerCase()] || "#8a93a3" }))}
                            placeholder={t("Status")}
                          />
                        ) : (
                          <span className={`accounts-status-pill acc-st-${(row.status || "inactive").toLowerCase()}`}>
                            {t(row.status || "Active")}
                          </span>
                        )}
                      </td>
                      <td>
                        {countries.length ? (
                          <div className="geo-chip-row">
                            {countries.slice(0, 3).map((c) => (
                              <span className="geo-chip" key={c}>
                                <CountryFlag value={c} />
                                {c}
                              </span>
                            ))}
                            {countries.length > 3 ? (
                              <span className="geo-chip geo-chip-more" title={countries.slice(3).join(", ")}>
                                +{countries.length - 3}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="offer-muted">—</span>
                        )}
                      </td>
                      <td className="accounts-integration-cell">
                        <div className="accounts-integration-badges">
                          <span className="geo-chip">
                            <span
                              className="cs-dot"
                              style={{
                                background:
                                  integrationState.tone === "is-working"
                                    ? "#36d07c"
                                    : integrationState.tone === "is-down"
                                      ? "#ff8a7a"
                                      : "#ffc94d",
                              }}
                              aria-hidden="true"
                            />
                            {integrationState.label}
                          </span>
                        </div>
                        {row.integration_account_number ? (
                          <span className="accounts-integration-caption mono">{row.integration_account_number}</span>
                        ) : null}
                      </td>
                      <td>{ownerLabel && ownerLabel !== "—" ? (<span className="owner-pill"><span className="owner-pill-dot" />{ownerLabel}</span>) : (<span className="offer-muted">—</span>)}</td>
                      <td>
                        <div className="accounts-actions-cell">
                          <div className="accounts-action-group">
                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() => openEditModal(row)}
                              aria-label={t("Edit")}
                              data-tip={t("Edit")}
                              disabled={!rowCanManage}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="icon-btn icon-btn-check"
                              type="button"
                              onClick={() => handleCheckIntegration(row)}
                              aria-label={t("Check integration")}
                              data-tip={t("Check integration")}
                              disabled={!rowCanManage || checkingIntegrationId === row.id || !row.meta_integration_id}
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              className="icon-btn icon-btn-danger"
                              type="button"
                              onClick={() => handleDelete(row)}
                              aria-label={t("Remove")}
                              data-tip={t("Remove")}
                              disabled={!rowCanManage}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          {checkResult ? (
                            <span className={`accounts-action-feedback ${checkResult.tone}`}>{checkResult.text}</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            {!filteredAccountRows.length ? (
              <div className="empty-state">{t("No entries found for this filter.")}</div>
            ) : null}
          </div>
        )}
      </motion.div>
    </section>
  );
}

// Keitaro returns raw i18n error keys for Facebook-costs failures; map the
// common ones to human-readable text (raw stays in the cell's tooltip).
const KEITARO_ERROR_MAP = {
  "third_party_integration.errors.token": "Invalid or expired Meta token",
  "third_party_integration.errors.account": "Ad account not accessible by this token",
  "third_party_integration.errors.permissions": "Token missing ad-account permissions",
  "third_party_integration.errors.rate_limit": "Facebook rate limit — try again later",
};
const friendlyKeitaroError = (raw) => {
  const key = String(raw || "").trim();
  if (!key) return "";
  if (KEITARO_ERROR_MAP[key]) return KEITARO_ERROR_MAP[key];
  // Turn "third_party_integration.errors.something_here" into "Something here"
  const tail = key.split(".").pop().replace(/_/g, " ");
  return /errors?\b/i.test(key) ? tail.charAt(0).toUpperCase() + tail.slice(1) : key;
};

function MetaTokenDashboard({ authUser }) {
  const { t } = useLanguage();
  const canManage = isLeadershipRole(authUser?.role);
  const [integrations, setIntegrations] = React.useState([]);
  const [integrationState, setIntegrationState] = React.useState({ loading: true, error: null });
  const [keitaroCosts, setKeitaroCosts] = React.useState([]);
  const [editCost, setEditCost] = React.useState({ open: false, id: null, name: "", account: "", token: "", saving: false, error: null });
  const [costsState, setCostsState] = React.useState({ loading: true, error: null });
  const [accountOptionsState, setAccountOptionsState] = React.useState({ loading: true, error: null });
  const [accountOptions, setAccountOptions] = React.useState([]);
  const [pixels, setPixels] = React.useState([]);
  const [pixelState, setPixelState] = React.useState({ loading: true, error: null });
  const [users, setUsers] = React.useState([]);
  const [buyers, setBuyers] = React.useState([]);
  const [buyerState, setBuyerState] = React.useState({ loading: true, error: null });
  const [selectedBindingId, setSelectedBindingId] = React.useState(null);
  const [copyFeedback, setCopyFeedback] = React.useState("");
  const [commentModal, setCommentModal] = React.useState({
    open: false,
    integration: null,
    value: "",
    saving: false,
  });
  const previousCostRef = React.useRef(null);
  const [costBurst, setCostBurst] = React.useState(false);
  const [bfZoom, setBfZoom] = React.useState(1);
  const [form, setForm] = React.useState({
    accountNumber: "",
    token: "",
    buyerName: "",
    pixelId: "",
    comment: "",
  });

  const updateForm = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetForm = () => {
    setForm({
      accountNumber: "",
      token: "",
      buyerName: "",
      pixelId: "",
      comment: "",
    });
  };

  // Live Facebook cost integrations straight from Keitaro, scoped to the viewer.
  const fetchKeitaroCosts = React.useCallback(async () => {
    try {
      setCostsState({ loading: true, error: null });
      const res = await apiFetch("/api/keitaro/facebook-costs");
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Could not load Facebook costs from Keitaro.");
      }
      const data = await res.json();
      setKeitaroCosts(Array.isArray(data?.integrations) ? data.integrations : []);
      setCostsState({ loading: false, error: null });
    } catch (error) {
      setKeitaroCosts([]);
      setCostsState({ loading: false, error: error.message || "Could not load Facebook costs." });
    }
  }, []);

  const handleDeleteKeitaroCost = async (keitaroId, name) => {
    const confirmed = await appConfirm({
      title: "Delete this Facebook cost integration?",
      message: `This removes "${name || keitaroId}" from Keitaro's Facebook costs.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      const res = await apiFetch(`/api/keitaro/facebook-costs/${keitaroId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Failed to delete.");
      }
      await fetchKeitaroCosts();
    } catch (error) {
      setCostsState((s) => ({ ...s, error: error.message || "Failed to delete." }));
    }
  };

  const openEditCost = (row) =>
    setEditCost({
      open: true,
      id: row.id,
      name: row.name || "",
      account: row.account_id || "",
      buyer: row.buyer || "",
      status: row.status || "",
      current: row.last_error || row.last_raw_error || "",
      token: "",
      saving: false,
      error: null,
    });
  const closeEditCost = () => setEditCost((s) => ({ ...s, open: false }));
  const handleSaveEditCost = async () => {
    const token = String(editCost.token || "").trim();
    if (!token) {
      setEditCost((s) => ({ ...s, error: "Paste the new Meta token." }));
      return;
    }
    try {
      setEditCost((s) => ({ ...s, saving: true, error: null }));
      const res = await apiFetch(`/api/keitaro/facebook-costs/${editCost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Failed to update the integration.");
      }
      setEditCost({ open: false, id: null, name: "", account: "", token: "", saving: false, error: null });
      await fetchKeitaroCosts();
    } catch (error) {
      setEditCost((s) => ({ ...s, saving: false, error: error.message || "Failed to update." }));
    }
  };

  const fetchIntegrations = React.useCallback(async () => {
    try {
      setIntegrationState({ loading: true, error: null });
      const response = await apiFetch("/api/meta-tokens?limit=300");
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load Meta integrations.");
      }
      const data = await response.json();
      setIntegrations(Array.isArray(data) ? data : []);
      setIntegrationState({ loading: false, error: null });
    } catch (error) {
      setIntegrationState({ loading: false, error: error.message || "Failed to load Meta integrations." });
    }
  }, []);

  const fetchPixels = React.useCallback(async () => {
    try {
      setPixelState({ loading: true, error: null });
      const response = await apiFetch("/api/pixels?limit=500");
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load pixels.");
      }
      const data = await response.json();
      setPixels(Array.isArray(data) ? data : []);
      setPixelState({ loading: false, error: null });
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to load pixels." });
    }
  }, []);

  const fetchAccountOptions = React.useCallback(async () => {
    try {
      setAccountOptionsState({ loading: true, error: null });
      const response = await apiFetch("/api/accounts?limit=500");
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load accounts.");
      }
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];
      const uniqueByNumber = new Map();
      rows.forEach((row) => {
        const accountNumber = String(row?.account_number || "").trim();
        if (!accountNumber) return;
        if (!uniqueByNumber.has(accountNumber)) {
          uniqueByNumber.set(accountNumber, row);
        }
      });
      const normalized = Array.from(uniqueByNumber.values()).sort((first, second) =>
        String(first?.account_number || "").localeCompare(String(second?.account_number || ""), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
      setAccountOptions(normalized);
      setAccountOptionsState({ loading: false, error: null });
    } catch (error) {
      setAccountOptions([]);
      setAccountOptionsState({ loading: false, error: error.message || "Failed to load accounts." });
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    if (!canManage) return;
    try {
      const response = await apiFetch("/api/users?limit=300");
      if (!response.ok) return;
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setUsers([]);
    }
  }, [canManage]);

  const fetchBuyers = React.useCallback(async () => {
    try {
      setBuyerState({ loading: true, error: null });
      const response = await apiFetch("/api/media-buyers?limit=500");
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to load buyers.");
      }
      const data = await response.json();
      setBuyers(Array.isArray(data) ? data : []);
      setBuyerState({ loading: false, error: null });
    } catch (error) {
      setBuyers([]);
      setBuyerState({ loading: false, error: error.message || "Failed to load buyers." });
    }
  }, []);

  React.useEffect(() => {
    fetchIntegrations();
    fetchKeitaroCosts();
    fetchAccountOptions();
    fetchPixels();
    fetchUsers();
    fetchBuyers();
  }, [fetchIntegrations, fetchKeitaroCosts, fetchAccountOptions, fetchPixels, fetchUsers, fetchBuyers]);

  React.useEffect(() => {
    if (!integrations.length) {
      setSelectedBindingId(null);
      return;
    }
    if (!selectedBindingId || !integrations.some((item) => item.id === selectedBindingId)) {
      setSelectedBindingId(integrations[0].id);
    }
  }, [integrations, selectedBindingId]);

  React.useEffect(() => {
    if (!copyFeedback) return;
    const timer = setTimeout(() => setCopyFeedback(""), 1400);
    return () => clearTimeout(timer);
  }, [copyFeedback]);

  const userLookup = React.useMemo(
    () =>
      users.reduce((acc, user) => {
        acc[user.id] = user.username;
        return acc;
      }, {}),
    [users]
  );

  const pixelLookup = React.useMemo(
    () =>
      pixels.reduce((acc, pixel) => {
        acc[pixel.id] = pixel;
        return acc;
      }, {}),
    [pixels]
  );

  const buyerOptions = React.useMemo(() => {
    const map = new Map();
    buyers.forEach((buyer) => {
      const name = String(buyer?.name || "").trim();
      if (name) map.set(name.toLowerCase(), name);
    });
    users.forEach((user) => {
      const username = String(user?.username || "").trim();
      if (username) map.set(username.toLowerCase(), username);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [buyers, users]);

  const buyerDropdownOptions = React.useMemo(
    () => buyerOptions.map((name) => ({ value: name, label: name, search: name })),
    [buyerOptions]
  );

  // Non-leadership users can't pick a buyer — the integration is attributed
  // to their own linked media buyer profile (or their username as fallback).
  const autoBuyerName = React.useMemo(() => {
    if (canManage) return "";
    const linked = buyers.find((b) => String(b?.id) === String(authUser?.buyerId || ""));
    return String(linked?.name || authUser?.username || "").trim();
  }, [canManage, buyers, authUser?.buyerId, authUser?.username]);

  const accountDropdownOptions = React.useMemo(
    () =>
      accountOptions
        .map((row) => {
          const accountNumber = String(row?.account_number || "").trim();
          if (!accountNumber) return null;
          const responsibleName = String(
            row?.owner_name ||
              userLookup[row?.owner_id] ||
              row?.integration_buyer_name ||
              row?.owner_role ||
              ""
          ).trim();
          return {
            value: accountNumber,
            label: responsibleName ? `${accountNumber} · ${responsibleName}` : accountNumber,
            search: `${accountNumber} ${responsibleName}`.trim(),
          };
        })
        .filter(Boolean),
    [accountOptions, userLookup]
  );

  const resolveOwnerName = (row) =>
    row?.owner_name || userLookup[row?.owner_id] || row?.owner_role || authUser?.username || "—";

  const resolvePixelLabel = (row) => {
    if (row?.pixel_value) return row.pixel_value;
    const pixel = pixelLookup[row?.pixel_id];
    return pixel?.pixel_id || "—";
  };

  const maskToken = (value) => {
    const token = String(value || "");
    if (token.length <= 14) return token || "—";
    return `${token.slice(0, 6)}••••${token.slice(-4)}`;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const accountNumber = String(form.accountNumber || "").trim();
    const token = String(form.token || "").trim();
    // Leadership picks the buyer; everyone else is auto-attributed to themselves.
    const buyerName = canManage ? String(form.buyerName || "").trim() : autoBuyerName;
    if (!accountNumber || !token || !buyerName) {
      setIntegrationState({
        loading: false,
        error: canManage
          ? "Account, token, and buyer are required."
          : "Account and token are required.",
      });
      return;
    }
    try {
      // One-step "fully ready": if this Meta ad-account isn't registered yet,
      // register it in Accounts first (owned by the chosen buyer), then create
      // the integration — which the server already wires (resolves cost + sets
      // status/wired). No pre-trip to the Accounts section required.
      const isKnownAccount = accountDropdownOptions.some(
        (o) => String(o.value).trim() === accountNumber || String(o.label).trim() === accountNumber
      );
      if (!isKnownAccount) {
        let ownerId;
        if (canManage) {
          const buyerUser = users.find(
            (u) => String(u.username || "").trim().toLowerCase() === buyerName.toLowerCase()
          );
          ownerId = buyerUser?.id;
        }
        const acctRes = await apiFetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountNumber, ...(ownerId ? { ownerId } : {}) }),
        });
        if (!acctRes.ok) {
          const d = await acctRes.json().catch(() => null);
          throw new Error(d?.error || "Could not register the new account.");
        }
      }

      const response = await apiFetch("/api/meta-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber,
          token,
          buyerName,
          pixelId: form.pixelId || null,
          comment: form.comment,
        }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to save integration.");
      }
      await Promise.all([fetchIntegrations(), fetchKeitaroCosts(), fetchAccountOptions?.()]);
      resetForm();
    } catch (error) {
      setIntegrationState({ loading: false, error: error.message || "Failed to save integration." });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await appConfirm({
      title: "Delete Meta integration?",
      message: "This removes the token binding for this account.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      const response = await apiFetch(`/api/meta-tokens/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete integration.");
      await fetchIntegrations();
    } catch (error) {
      setIntegrationState({ loading: false, error: error.message || "Failed to delete integration." });
    }
  };

  const handleRunCheck = async (id) => {
    try {
      const response = await apiFetch(`/api/meta-tokens/${id}/test`, { method: "POST" });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Binding check failed.");
      }
      await fetchIntegrations();
    } catch (error) {
      setIntegrationState({ loading: false, error: error.message || "Binding check failed." });
    }
  };

  const handleCopyToken = async (token) => {
    if (!token) return;
    try {
      await navigator.clipboard?.writeText(String(token));
      setCopyFeedback("Token copied");
    } catch (error) {
      setCopyFeedback("Copy failed");
    }
  };

  const openCommentModal = (integration) => {
    if (!canManage || !integration?.id) return;
    setCommentModal({
      open: true,
      integration,
      value: String(integration.comment || ""),
      saving: false,
    });
  };

  const closeCommentModal = () => {
    setCommentModal({ open: false, integration: null, value: "", saving: false });
  };

  const handleCommentSave = async () => {
    const integrationId = Number.parseInt(String(commentModal.integration?.id || ""), 10);
    if (!Number.isFinite(integrationId)) return;
    try {
      setCommentModal((prev) => ({ ...prev, saving: true }));
      const response = await apiFetch(`/api/meta-tokens/${integrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: String(commentModal.value || "").trim() || null }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to update comment.");
      }
      await fetchIntegrations();
      closeCommentModal();
    } catch (error) {
      setCommentModal((prev) => ({ ...prev, saving: false }));
      setIntegrationState({ loading: false, error: error.message || "Failed to update comment." });
    }
  };

  const visibleIntegrations = React.useMemo(() => {
    if (canManage) return integrations;
    return integrations.filter((row) => row.owner_id === authUser?.id);
  }, [canManage, integrations, authUser?.id]);

  const selectedBinding =
    visibleIntegrations.find((item) => item.id === selectedBindingId) || visibleIntegrations[0] || null;

  const bindingChecks = React.useMemo(() => {
    if (!selectedBinding) return null;
    const receivedSpend = Number(selectedBinding.received_spend || 0);
    const metaTokenReady = Boolean(String(selectedBinding.meta_token || "").trim());
    const accountReady = Boolean(String(selectedBinding.account_number || "").trim());
    const buyerReady = Boolean(String(selectedBinding.buyer_name || "").trim());
    const costReady = receivedSpend > 0;
    const metaWorking = metaTokenReady && costReady;
    const checks = [
      {
        key: "meta",
        label: "Meta Token",
        value: metaWorking ? "Working" : "Not working",
        ok: metaWorking,
      },
      {
        key: "account",
        label: "ACC Number",
        value: selectedBinding.account_number || "—",
        ok: accountReady,
      },
      {
        key: "buyer",
        label: "Buyer",
        value: selectedBinding.buyer_name || "—",
        ok: buyerReady,
      },
      {
        key: "cost",
        label: "Receive Cost",
        value: receivedSpend > 0 ? formatCurrency(receivedSpend) : "$0.00",
        ok: costReady,
      },
    ];
    const wired = checks.every((item) => item.ok) || Number(selectedBinding.is_wired) === 1;
    return { checks, wired };
  }, [selectedBinding]);

  const bindingIssues = React.useMemo(() => {
    if (!bindingChecks) return [];
    return bindingChecks.checks.filter((item) => !item.ok).map((item) => `${item.label} missing`);
  }, [bindingChecks]);

  const flowMode = React.useMemo(() => {
    if (!selectedBinding || !bindingChecks) return "offline";
    const hasCore = Boolean(
      String(selectedBinding.account_number || "").trim() &&
        String(selectedBinding.meta_token || "").trim() &&
        String(selectedBinding.buyer_name || "").trim()
    );
    const lastChecked = selectedBinding.last_checked_at
      ? new Date(selectedBinding.last_checked_at).getTime()
      : null;
    const now = Date.now();
    const stale = lastChecked ? now - lastChecked > 45 * 60 * 1000 : true;

    if (bindingChecks.wired && !stale) return "online";
    if (hasCore) return "delayed";
    return "offline";
  }, [selectedBinding, bindingChecks]);

  const lastCheckedLabel = React.useMemo(() => {
    if (!selectedBinding?.last_checked_at) return "Not checked yet";
    const parsed = new Date(selectedBinding.last_checked_at);
    if (Number.isNaN(parsed.getTime())) return "Not checked yet";
    return parsed.toLocaleString();
  }, [selectedBinding?.last_checked_at]);

  const systemDelayLabel = React.useMemo(() => {
    if (!selectedBinding?.last_checked_at) return "N/A";
    const lastCheckedMs = new Date(selectedBinding.last_checked_at).getTime();
    if (!Number.isFinite(lastCheckedMs)) return "N/A";
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastCheckedMs) / 1000));
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }, [selectedBinding?.last_checked_at]);

  const lastCheckedAgoLabel = React.useMemo(() => {
    if (!selectedBinding?.last_checked_at) return "just now";
    const lastCheckedMs = new Date(selectedBinding.last_checked_at).getTime();
    if (!Number.isFinite(lastCheckedMs)) return "just now";
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastCheckedMs) / 1000));
    if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
    if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
    if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
    return `${Math.floor(elapsedSeconds / 86400)}d ago`;
  }, [selectedBinding?.last_checked_at]);

  const getBindingTone = (item) => {
    if (!item) return "danger";
    if (item.key === "account") return item.ok ? "info" : "danger";
    if (item.key === "buyer") return item.ok ? "success" : "danger";
    if (item.key === "cost") return item.ok ? "success" : "warning";
    if (item.key === "meta") return item.ok ? "success" : "danger";
    return item.ok ? "success" : "danger";
  };

  React.useEffect(() => {
    if (!selectedBinding) {
      previousCostRef.current = null;
      return;
    }
    const current = Number(selectedBinding.received_spend || 0);
    if (previousCostRef.current !== null && current !== previousCostRef.current) {
      setCostBurst(true);
      const timer = setTimeout(() => setCostBurst(false), 900);
      previousCostRef.current = current;
      return () => clearTimeout(timer);
    }
    previousCostRef.current = current;
    return undefined;
  }, [selectedBinding]);

  return (
    <section className="form-section meta-token-sections">
      <AnimatePresence>
        {canManage && commentModal.open ? (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommentModal}
          >
            <motion.div
              className="modal comment-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">Integration Comment</p>
                  <h2>Update comment</h2>
                </div>
                <button className="icon-btn" type="button" onClick={closeCommentModal}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field">
                  <label>Comment</label>
                  <textarea
                    rows={4}
                    value={commentModal.value}
                    onChange={(event) =>
                      setCommentModal((prev) => ({ ...prev, value: event.target.value }))
                    }
                    placeholder="Add a comment"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={closeCommentModal} disabled={commentModal.saving}>
                  Cancel
                </button>
                <button className="action-pill" type="button" onClick={handleCommentSave} disabled={commentModal.saving}>
                  {commentModal.saving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="panel meta-bindings-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Bindings</h3>
            <p className="panel-subtitle">Integration turns green when Keitaro cost is being received for the assigned buyer.</p>
          </div>
        </div>
        {!selectedBinding ? (
          <div className="empty-state">No integration created yet.</div>
        ) : (
          <div
            className={`binding-board ${
              flowMode === "online"
                ? "is-wired mode-online"
                : flowMode === "delayed"
                  ? "mode-delayed"
                  : "is-broken mode-offline"
            } ${costBurst ? "pulse-burst" : ""}`}
          >
            <div className="binding-grid-bg" />
            <div className="binding-cloud-head">
              <div className="binding-cloud-head-copy">
                <h4 className="binding-cloud-title">Integration graph</h4>
                <p className="binding-cloud-sub">Meta Token namespace routing for media buyer tracking</p>
              </div>
              <div className={`binding-cloud-delay ${flowMode}`}>
                <span>System Delay</span>
                <strong>{systemDelayLabel}</strong>
                <i aria-hidden="true" />
              </div>
            </div>
            {/* Budget Flow–style node canvas: source → checks fan-out → trigger */}
            <div className="bf-canvas">
              <div className="bf-viewport">
                <div className="bf-scroll" style={{ width: 1060 * bfZoom, height: 584 * bfZoom }}>
                  <div className="bf-stage" style={{ transform: `scale(${bfZoom})` }}>
                    {(() => {
                      const keitaroVal = (() => {
                        const binding = selectedBinding?.meta_binding || selectedBinding?.keitaro_token || "admin";
                        return binding === "raspy-star-473e" ? "admin" : binding;
                      })();
                      // DEUS Finance category palette: green / pink / purple / blue
                      const accents = { meta: "#36d07c", account: "#ff7da3", buyer: "#a15bff", cost: "#64b8ff" };
                      const subs = {
                        meta: maskToken(selectedBinding?.meta_token),
                        account: "Meta ad account",
                        buyer: "assigned media buyer",
                        cost: "received from Keitaro",
                      };
                      const foots = {
                        meta: "token attached",
                        account: "registered in Accounts",
                        buyer: "media buyer routing",
                        cost: `checked ${lastCheckedAgoLabel}`,
                      };
                      const checks = (bindingChecks?.checks || []).map((item, i) => ({
                        ...item,
                        accent: accents[item.key] || "#8b8f98",
                        sub: subs[item.key] || "",
                        foot: foots[item.key] || "",
                        x: 430,
                        y: [12, 152, 292, 432][i] ?? 12 + i * 140,
                      }));
                      const srcOut = { x: 284, y: 282 };
                      const actIn = { x: 812, y: 300 };
                      // Rounded elbow path, like React Flow's smoothstep edges
                      const elbow = (x1, y1, x2, y2, midX) => {
                        const r = 8;
                        if (Math.abs(y2 - y1) < 2) return `M${x1},${y1} L${x2},${y2}`;
                        const d = y2 > y1 ? 1 : -1;
                        return `M${x1},${y1} L${midX - r},${y1} Q${midX},${y1} ${midX},${y1 + r * d} L${midX},${y2 - r * d} Q${midX},${y2} ${midX + r},${y2} L${x2},${y2}`;
                      };
                      const okCount = checks.filter((c) => c.ok).length;
                      const receivedSpend = Number(selectedBinding?.received_spend || 0);
                      const pct = checks.length ? Math.round((okCount / checks.length) * 100) : 0;
                      const modeColor = flowMode === "online" ? "#36d07c" : flowMode === "delayed" ? "#f7c625" : "#ff7d88";
                      const modeLabel = flowMode === "online" ? "Online" : flowMode === "delayed" ? "Delayed" : "Offline";
                      return (
                        <>
                          <svg
                            className={`bf-edges${flowMode === "online" ? " is-live" : ""}`}
                            width="1060"
                            height="584"
                            viewBox="0 0 1060 584"
                            aria-hidden="true"
                          >
                            {checks.map((c) => (
                              <g key={`edge-${c.key}`}>
                                <path
                                  className="bf-edge"
                                  style={{ stroke: c.accent }}
                                  d={elbow(srcOut.x, srcOut.y, c.x, c.y + 62, 357)}
                                />
                                <path
                                  className="bf-edge bf-edge-soft"
                                  style={{ stroke: c.accent }}
                                  d={elbow(c.x + 230, c.y + 62, actIn.x, actIn.y, 736)}
                                />
                              </g>
                            ))}
                            <text className="bf-edge-label" x="365" y="392" style={{ fill: accents.cost }}>
                              {formatCurrency(receivedSpend)}
                            </text>
                          </svg>

                          {/* Source node — integration summary */}
                          <div className="bf-node bf-source" style={{ left: 24, top: 192, width: 260, "--bf-accent": "#36d07c" }}>
                            <span className="bf-port bf-port-out" style={{ top: 90 }} aria-hidden="true" />
                            <div className="bf-node-head">
                              <span className="bf-icon-tile"><DollarSign size={18} strokeWidth={2} /></span>
                              <span className="bf-head-text">
                                <span className="bf-kicker">Integration</span>
                                <span className="bf-subkicker" style={{ color: modeColor }}>{modeLabel}</span>
                              </span>
                            </div>
                            <div className="bf-amount">
                              {formatCurrency(receivedSpend)}
                              <span className="bf-amount-unit">USD</span>
                            </div>
                            <div className="bf-meta-row">
                              <span>Buyer: <strong>{selectedBinding?.buyer_name || "—"}</strong></span>
                              <span style={{ color: modeColor, fontWeight: 600 }}>{keitaroVal}</span>
                            </div>
                            <div className="bf-bar">
                              <i style={{ width: `${pct}%`, background: modeColor, boxShadow: `0 0 8px ${modeColor}80` }} />
                            </div>
                            <div className="bf-foot">{okCount}/{checks.length} checks passing</div>
                          </div>

                          {/* Check nodes — category style */}
                          {checks.map((c) => (
                            <div
                              key={c.key}
                              className="bf-node bf-check"
                              style={{ left: c.x, top: c.y, width: 230, "--bf-accent": c.accent }}
                            >
                              <span className="bf-port bf-port-in" style={{ top: 62 }} aria-hidden="true" />
                              <span className="bf-port bf-port-out" style={{ top: 62 }} aria-hidden="true" />
                              <div className="bf-check-head">
                                <span className="bf-dot" aria-hidden="true" />
                                <span className="bf-check-name">{c.label}</span>
                                {c.ok ? (
                                  <CheckCircle size={13} strokeWidth={2} className="bf-state-icon ok" />
                                ) : (
                                  <AlertTriangle size={13} strokeWidth={2} className="bf-state-icon warn" />
                                )}
                              </div>
                              <div className="bf-check-value">{c.value}</div>
                              <div className="bf-check-sub">{c.sub}</div>
                              <div className="bf-bar">
                                <i
                                  style={{
                                    width: c.ok ? "100%" : "6%",
                                    background: c.ok ? c.accent : "#ff7d88",
                                    boxShadow: `0 0 6px ${c.ok ? c.accent : "#ff7d88"}80`,
                                  }}
                                />
                              </div>
                              <div className="bf-check-foot">{c.foot}</div>
                            </div>
                          ))}

                          {/* Trigger node */}
                          <button
                            type="button"
                            className="bf-node bf-action"
                            style={{ left: 812, top: 240, width: 224, "--bf-accent": "#36d07c" }}
                            onClick={() => handleRunCheck(selectedBinding.id)}
                          >
                            <span className="bf-port bf-port-in" style={{ top: 60 }} aria-hidden="true" />
                            <div className="bf-node-head">
                              <span className="bf-icon-tile"><Zap size={18} strokeWidth={2} /></span>
                              <span className="bf-head-text">
                                <span className="bf-kicker">Run</span>
                                <span className="bf-subkicker" style={{ color: "#36d07c" }}>Trigger</span>
                              </span>
                            </div>
                            <div className="bf-action-value">Check Integration</div>
                            <div className="bf-foot">Last check: {lastCheckedAgoLabel}</div>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Canvas chrome — zoom controls + minimap, like React Flow */}
              <div className="bf-controls">
                <button type="button" aria-label="Zoom in" onClick={() => setBfZoom((z) => Math.min(1.3, +(z + 0.1).toFixed(2)))}>
                  <Plus size={14} />
                </button>
                <button type="button" aria-label="Zoom out" onClick={() => setBfZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}>
                  <Minus size={14} />
                </button>
                <button type="button" aria-label="Fit view" onClick={() => setBfZoom(1)}>
                  <Maximize2 size={13} />
                </button>
                <button type="button" aria-label="Locked" className="is-static">
                  <Lock size={13} />
                </button>
              </div>
              <div className="bf-minimap" aria-hidden="true">
                <span className="bf-mm-src" />
                <span className="bf-mm-node" style={{ top: 10, background: "#36d07c" }} />
                <span className="bf-mm-node" style={{ top: 28, background: "#ff7da3" }} />
                <span className="bf-mm-node" style={{ top: 46, background: "#a15bff" }} />
                <span className="bf-mm-node" style={{ top: 64, background: "#64b8ff" }} />
                <span className="bf-mm-act" />
              </div>
            </div>
            <div className="binding-footer">
              <button
                type="button"
                className={`binding-pill ${flowMode === "online" ? "ok" : flowMode === "delayed" ? "delayed" : "error"}`}
                onClick={() => handleRunCheck(selectedBinding.id)}
              >
                {flowMode === "online" ? "Integration Online" : flowMode === "delayed" ? "Integration Delayed" : "Action Needed"}
              </button>
              <span className="binding-meta">Last check: {lastCheckedLabel} ({lastCheckedAgoLabel})</span>
            </div>
            {bindingIssues.length ? (
              <div className="binding-alert">
                <div className="binding-alert-head">
                  <strong>Integration Delayed</strong>
                  <span>Last update: {lastCheckedLabel}</span>
                </div>
                <ul className="binding-issues">
                  {bindingIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </motion.div>

      <motion.div
        className="panel meta-token-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
      >
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Meta Token $</h3>
            <p className="panel-subtitle">Save Meta token per account and assign each integration to one buyer.</p>
          </div>
          {copyFeedback ? <span className="api-status success">{copyFeedback}</span> : null}
        </div>

        <form className="form-grid api-grid" onSubmit={handleCreate}>
          <div className="field">
            <label>ACC Number <span className="field-pace-hint">pick a registered account or type a new one</span></label>
            <CountryDropdownPicker
              value={form.accountNumber}
              onChange={(accountNumber) => setForm((prev) => ({ ...prev, accountNumber }))}
              options={accountDropdownOptions}
              placeholder={
                accountOptionsState.loading
                  ? "Loading accounts..."
                  : accountDropdownOptions.length
                    ? "Select or type an account"
                    : "Type a Meta ad-account number"
              }
              searchPlaceholder="Search or paste a new account number…"
              emptyResultsLabel="No accounts found."
              allowCustom
            />
          </div>
          <div className={`field${canManage ? "" : " field-span-2"}`}>
            <label>Token</label>
            <input value={form.token} onChange={updateForm("token")} placeholder="Meta for developers token" required />
          </div>
          {canManage ? (
            <div className="field">
              <label>Buyer</label>
              <CountryDropdownPicker
                value={form.buyerName}
                onChange={(buyerName) => setForm((prev) => ({ ...prev, buyerName }))}
                options={buyerDropdownOptions}
                placeholder={
                  buyerState.loading
                    ? "Loading buyers..."
                    : buyerDropdownOptions.length
                      ? "Select buyer"
                      : "No buyers available"
                }
                searchPlaceholder="Type to find buyers"
                emptyResultsLabel="No buyers found."
              />
            </div>
          ) : null}
          <div className="field">
            <label>Pixel (optional)</label>
            <Select
              value={form.pixelId || ""}
              onChange={(v) => setForm((prev) => ({ ...prev, pixelId: v }))}
              options={pixels.map((pixel) => ({
                value: String(pixel.id),
                label: `${pixel.pixel_id} · ${pixel.owner_id && userLookup[pixel.owner_id] ? userLookup[pixel.owner_id] : pixel.owner_role || "Owner"}`,
              }))}
              placeholder="Select pixel"
              searchPlaceholder="Find pixel"
            />
          </div>
          <div className="field field-span-2">
            <label>Comment</label>
            <input value={form.comment} onChange={updateForm("comment")} placeholder="Optional note for this integration" />
          </div>
          <div className="form-actions">
            <button className="ghost" type="button" onClick={resetForm}>
              Reset
            </button>
            <button className="action-pill" type="submit">
              Save
            </button>
          </div>
        </form>

        {integrationState.error ? <div className="empty-state error">{integrationState.error}</div> : null}
        {accountOptionsState.error ? <div className="empty-state error">{accountOptionsState.error}</div> : null}
        {pixelState.error ? <div className="empty-state error">{pixelState.error}</div> : null}
        {buyerState.error ? <div className="empty-state error">{buyerState.error}</div> : null}
          <div className="meta-costs-head">
            <div>
              <h4 className="meta-costs-title"><img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" /></h4>
              <p className="meta-costs-sub">{t("Facebook costs — live from Keitaro")}</p>
            </div>
            <button className="ghost" type="button" onClick={fetchKeitaroCosts} disabled={costsState.loading} title={t("Refresh from Keitaro")}>
              <RotateCcw size={14} /> {costsState.loading ? t("Syncing…") : t("Sync")}
            </button>
          </div>
          <div className="table-wrap meta-token-table">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>{t("Name")}</th>
                  <th>{t("Buyer")}</th>
                  <th>{t("Ad account")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Error")}</th>
                  <th>{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {costsState.loading ? (
                  <tr><td colSpan={6} className="empty-state">{t("Loading Facebook costs from Keitaro…")}</td></tr>
                ) : keitaroCosts.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">{costsState.error || t("No Facebook cost integrations in Keitaro yet. Add one above.")}</td></tr>
                ) : (
                  keitaroCosts.map((row) => (
                    <tr key={row.id}>
                      <td className="meta-cost-name">{row.name || "—"}</td>
                      <td>{row.buyer ? <span className="owner-pill"><span className="owner-pill-dot" />{row.buyer}</span> : <span className="offer-muted">—</span>}</td>
                      <td className="mono">{row.account_id || "—"}</td>
                      <td>
                        <span className={`status-pill ${row.status === "Error" ? "status-error" : "status-success"}`}>{t(row.status)}</span>
                      </td>
                      <td className="meta-cost-error" title={row.last_raw_error || row.last_error || ""}>
                        {row.last_error || row.last_raw_error ? (
                          <span className="meta-cost-error-text"><AlertTriangle size={12} /> {friendlyKeitaroError(row.last_error || row.last_raw_error)}</span>
                        ) : (
                          <span className="offer-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="inline-actions">
                          <button className="icon-btn" type="button" onClick={() => openEditCost(row)} title={t("Replace token / edit")}>
                            <Pencil size={14} />
                          </button>
                          <button className="icon-btn danger" type="button" onClick={() => handleDeleteKeitaroCost(row.id, row.name)} title={t("Delete from Keitaro")}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        <AnimatePresence>
          {editCost.open ? (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeEditCost}>
              <motion.div
                className="modal pixel-edit-modal edit-modal-accent"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-head">
                  <div className="mc-edit-headtitle">
                    <img className="brand-mark keitaro-mark mc-edit-logo" src={keitaroLogo} alt="Keitaro" />
                    <div>
                      <p className="modal-kicker">{t("Update cost integration")}</p>
                      <h2>{editCost.name || t("Integration")}</h2>
                    </div>
                  </div>
                  <button className="icon-btn" type="button" onClick={closeEditCost}><X size={18} /></button>
                </div>
                <div className="modal-body">
                  <div className="field field-span-2">
                    <div className={`mc-edit-status ${editCost.status === "Error" ? "is-error" : "is-ok"}`}>
                      {editCost.status === "Error" ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                      <span>
                        {editCost.status === "Error"
                          ? <>{t("Currently failing")} — <strong>{friendlyKeitaroError(editCost.current) || t("Invalid or expired Meta token")}</strong></>
                          : t("Integration is healthy — update the token only if you need to.")}
                      </span>
                    </div>
                  </div>
                  <div className="field">
                    <label>{t("Buyer")}</label>
                    <input value={editCost.buyer || "—"} readOnly />
                  </div>
                  <div className="field">
                    <label>{t("Ad account")}</label>
                    <input value={editCost.account} readOnly className="mono" />
                  </div>
                  <div className="field field-span-2">
                    <label>{t("New Meta token")}</label>
                    <input
                      type="text"
                      value={editCost.token}
                      onChange={(e) => setEditCost((s) => ({ ...s, token: e.target.value }))}
                      placeholder="EAAG…"
                      autoFocus
                    />
                    <p className="field-hint">{t("Paste a fresh long-lived token from Meta. It replaces the token on this integration in Keitaro — the account and buyer stay the same.")}</p>
                  </div>
                  {editCost.error ? <div className="field field-span-2"><div className="api-status error">{editCost.error}</div></div> : null}
                </div>
                <div className="modal-actions">
                  <button className="ghost" type="button" onClick={closeEditCost}>{t("Cancel")}</button>
                  <button className="action-pill" type="button" onClick={handleSaveEditCost} disabled={editCost.saving || !editCost.token.trim()}>
                    {editCost.saving ? t("Updating…") : t("Update token in Keitaro")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function RolesDashboard({ authUser }) {
  const { t } = useLanguage();
  // Sub-tab navigation inside the section — keeps the page from being one
  // very long scroll and lets each surface (roles, users, team) breathe.
  const [rolesTab, setRolesTab] = React.useState("roles"); // roles | users | team
  // Forms are hidden behind "+ Add" toggles so the tables stay front-and-center.
  const [showUserForm, setShowUserForm] = React.useState(false);
  const [showTeamForm, setShowTeamForm] = React.useState(false);
  // Edit mode for media buyers — when set, the form switches into PATCH mode
  // and the button label changes to "Save Changes" instead of "Add Member".
  const [editingBuyerId, setEditingBuyerId] = React.useState(null);
  // Same idea for users — edit username / role / linked buyer in-place.
  const [editingUserId, setEditingUserId] = React.useState(null);
  // Password reset modal — replaces the old window.prompt with a real,
  // validated UI (strength meter, generator, show/hide, copy, confirm).
  const [pwModal, setPwModal] = React.useState(null); // { user } | null
  const [pwForm, setPwForm] = React.useState({ next: "", confirm: "", show: false });
  const [pwState, setPwState] = React.useState({ saving: false, error: null, done: false });
  // Per-role expand state — role rows are compact by default, the permission
  // grid only appears when the row is expanded.
  const [expandedRoles, setExpandedRoles] = React.useState(() => new Set());
  const toggleRoleExpand = (id) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const [roles, setRoles] = React.useState([]);
  const [roleState, setRoleState] = React.useState({ loading: true, error: null });
  const [savingId, setSavingId] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [userState, setUserState] = React.useState({ loading: true, error: null });
  const [buyers, setBuyers] = React.useState([]);
  const [teamState, setTeamState] = React.useState({ loading: true, error: null });
  const [teamForm, setTeamForm] = React.useState({
    name: "",
    role: "Media Buyer",
    country: defaultCountryOption,
    approach: "Paid Social",
    game: "",
    email: "",
    contact: "",
    status: "Active",
    tag: "",
    keitaro_name: "",
  });
  const [userForm, setUserForm] = React.useState({
    username: "",
    password: "",
    role: roleOptions[0],
    buyerId: "",
  });

  const updateTeamForm = (key) => (event) => {
    setTeamForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: "",
      role: "Media Buyer",
      country: defaultCountryOption,
      approach: "Paid Social",
      game: "",
      email: "",
      contact: "",
      status: "Active",
      tag: "",
      keitaro_name: "",
    });
  };

  const fetchRoles = React.useCallback(async () => {
    try {
      setRoleState({ loading: true, error: null });
      const response = await apiFetch("/api/roles?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load roles.");
      }
      const data = await response.json();
      setRoles(data);
      setRoleState({ loading: false, error: null });
    } catch (error) {
      setRoleState({ loading: false, error: error.message || "Failed to load roles." });
    }
  }, []);

  React.useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const fetchUsers = React.useCallback(async () => {
    try {
      setUserState({ loading: true, error: null });
      const response = await apiFetch("/api/users?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load users.");
      }
      const data = await response.json();
      setUsers(data);
      setUserState({ loading: false, error: null });
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to load users." });
    }
  }, []);

  const fetchBuyers = React.useCallback(async () => {
    try {
      setTeamState({ loading: true, error: null });
      const response = await apiFetch("/api/media-buyers?limit=300");
      if (!response.ok) {
        throw new Error("Failed to load media buyers.");
      }
      const data = await response.json();
      setBuyers(data);
      setTeamState({ loading: false, error: null });
    } catch (error) {
      setBuyers([]);
      setTeamState({ loading: false, error: error.message || "Failed to load media buyers." });
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
    fetchBuyers();
  }, [fetchUsers, fetchBuyers]);

  const isLeadership = isLeadershipRole(authUser?.role);

  const togglePermission = (roleId, permission) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        if (role.name === "Boss" || role.name === "Team Leader") return role;
        const hasPermission = role.permissions.includes(permission);
        const permissions = hasPermission
          ? role.permissions.filter((item) => item !== permission)
          : [...role.permissions, permission];
        return { ...role, permissions };
      })
    );
  };

  // ── Roles UI helpers — permission groups, bulk toggles, role search ───
  // Permission groups mirror the sidebar sections so toggling stays intuitive.
  const permissionGroups = React.useMemo(
    () => [
      { title: t("Overview"), keys: ["dashboard", "geos", "goals"] },
      { title: t("Performance"), keys: ["statistics", "campaigns", "placements", "user_behavior", "devices"] },
      { title: t("Operations"), keys: ["utm", "domains", "pixels", "accounts"] },
      { title: t("Integrations"), keys: ["meta_token", "api"] },
      { title: t("Administration"), keys: ["roles", "media_buyers"] },
    ],
    [t]
  );

  // Map every role name → count of users that have it (rendered as a badge).
  const usersByRole = React.useMemo(() => {
    const map = new Map();
    for (const u of users || []) {
      const key = u.role || "";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [users]);

  const [roleSearch, setRoleSearch] = React.useState("");

  const setGroupPermissions = (roleId, groupKeys, enable) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        if (role.name === "Boss" || role.name === "Team Leader") return role;
        const set = new Set(role.permissions);
        for (const key of groupKeys) {
          if (enable) set.add(key); else set.delete(key);
        }
        return { ...role, permissions: Array.from(set) };
      })
    );
  };

  const handleRoleSave = async (role) => {
    if (!isLeadership) return;
    if (role.name === "Boss" || role.name === "Team Leader") return;
    setSavingId(role.id);
    try {
      const response = await apiFetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: role.permissions }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update role.");
      }
      await fetchRoles();
    } catch (error) {
      setRoleState({ loading: false, error: error.message || "Failed to update role." });
    } finally {
      setSavingId(null);
    }
  };

  const handleRoleDelete = async (roleId) => {
    try {
      const response = await apiFetch(`/api/roles/${roleId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete role.");
      }
      await fetchRoles();
    } catch (error) {
      setRoleState({ loading: false, error: error.message || "Failed to delete role." });
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    try {
      const isEdit = editingUserId !== null;
      // In edit mode we PATCH only the identity fields; password has its own
      // dedicated endpoint and isn't touched here (avoids accidental resets).
      const url = isEdit ? `/api/users/${editingUserId}` : "/api/users";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { username: userForm.username, role: userForm.role, buyerId: userForm.buyerId }
        : userForm;
      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        let detail = "";
        try { detail = (await response.json())?.error || ""; } catch { /* ignore */ }
        const base = isEdit ? "Failed to update user" : "Failed to create user";
        throw new Error(`${base} (HTTP ${response.status}${detail ? ` — ${detail}` : ""}).`);
      }
      setUserForm({ username: "", password: "", role: roleOptions[0], buyerId: "" });
      setEditingUserId(null);
      setShowUserForm(false);
      await fetchUsers();
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to save user." });
    }
  };

  const handleUserEdit = (user) => {
    if (!isLeadership) return;
    setUserForm({
      username: user.username || "",
      password: "",
      role: user.role || roleOptions[0],
      buyerId: user.buyer_id ? String(user.buyer_id) : "",
    });
    setEditingUserId(user.id);
    setShowUserForm(true);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document.querySelector(".user-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const handleUserCancelEdit = () => {
    setEditingUserId(null);
    setUserForm({ username: "", password: "", role: roleOptions[0], buyerId: "" });
    setShowUserForm(false);
  };

  const handleUserDelete = async (userId) => {
    try {
      const response = await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete user.");
      }
      await fetchUsers();
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to delete user." });
    }
  };

  // Open / close the password modal
  const openPwModal = (user) => {
    if (!isLeadership) return;
    setPwForm({ next: "", confirm: "", show: false });
    setPwState({ saving: false, error: null, done: false });
    setPwModal({ user });
  };
  const closePwModal = () => {
    setPwModal(null);
    setPwForm({ next: "", confirm: "", show: false });
    setPwState({ saving: false, error: null, done: false });
  };

  // Strength scoring → { score 0-4, label, tone }
  const scorePassword = (pw) => {
    const v = String(pw || "");
    if (!v) return { score: 0, label: "", tone: "" };
    let score = 0;
    if (v.length >= 8) score += 1;
    if (v.length >= 12) score += 1;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
    if (/\d/.test(v)) score += 1;
    if (/[^A-Za-z0-9]/.test(v)) score += 1;
    score = Math.min(4, score);
    const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
    const tones = ["danger", "danger", "warning", "success", "success"];
    return { score, label: labels[score], tone: tones[score] };
  };

  // Cryptographically-random 16-char password with mixed classes
  const generatePassword = () => {
    const sets = [
      "abcdefghijkmnpqrstuvwxyz",
      "ABCDEFGHJKLMNPQRSTUVWXYZ",
      "23456789",
      "!@#$%^&*-_=+",
    ];
    const all = sets.join("");
    const rand = (n) => {
      if (window.crypto?.getRandomValues) {
        const a = new Uint32Array(1);
        window.crypto.getRandomValues(a);
        return a[0] % n;
      }
      return Math.floor(Math.random() * n);
    };
    // Guarantee at least one of each class, then fill to 16
    let chars = sets.map((s) => s[rand(s.length)]);
    while (chars.length < 16) chars.push(all[rand(all.length)]);
    // Shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const pw = chars.join("");
    setPwForm({ next: pw, confirm: pw, show: true });
  };

  const handlePwSubmit = async (event) => {
    event.preventDefault();
    if (!pwModal?.user) return;
    const next = String(pwForm.next || "");
    if (next.length < 8) {
      setPwState({ saving: false, error: "Password must be at least 8 characters.", done: false });
      return;
    }
    if (next !== pwForm.confirm) {
      setPwState({ saving: false, error: "Passwords do not match.", done: false });
      return;
    }
    setPwState({ saving: true, error: null, done: false });
    try {
      const response = await apiFetch(`/api/users/${pwModal.user.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: next }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update password.");
      }
      setPwState({ saving: false, error: null, done: true });
    } catch (error) {
      setPwState({ saving: false, error: error.message || "Failed to update password.", done: false });
    }
  };

  const handleTeamSubmit = async (event) => {
    event.preventDefault();
    if (!isLeadership) return;
    try {
      const isEdit = editingBuyerId !== null;
      const url = isEdit ? `/api/media-buyers/${editingBuyerId}` : "/api/media-buyers";
      const method = isEdit ? "PATCH" : "POST";
      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save media buyer.");
      }
      await fetchBuyers();
      resetTeamForm();
      setEditingBuyerId(null);
      setShowTeamForm(false);
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to save media buyer." });
    }
  };

  // Pre-fill the form with a buyer's current values and open it for editing.
  const handleTeamEdit = (buyer) => {
    if (!isLeadership) return;
    setTeamForm({
      name: buyer.name || "",
      role: buyer.role || "Media Buyer",
      country: buyer.country || defaultCountryOption,
      approach: buyer.approach || "Paid Social",
      game: buyer.game || "",
      email: buyer.email || "",
      contact: buyer.contact || "",
      status: buyer.status || "Active",
      tag: buyer.tag || "",
      keitaro_name: buyer.keitaro_name || "",
    });
    setEditingBuyerId(buyer.id);
    setShowTeamForm(true);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document.querySelector(".team-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const handleTeamCancelEdit = () => {
    setEditingBuyerId(null);
    resetTeamForm();
    setShowTeamForm(false);
  };

  const handleTeamDelete = async (id) => {
    if (!isLeadership) return;
    try {
      const response = await apiFetch(`/api/media-buyers/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete media buyer.");
      }
      await fetchBuyers();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to delete media buyer." });
    }
  };

  const roleNameOptions = roles.length ? roles.map((role) => role.name) : roleOptions;
  const buyerMap = buyers.reduce((acc, buyer) => {
    acc[buyer.id] = buyer.name;
    return acc;
  }, {});
  const buyerTagMap = {
    AKKU: "AKDMC",
    ENZO: "ENDMC",
    "LEO CARVALHO": "LCDMC",
    CARVALHO: "LCDMC",
    LET: "LNDMC",
    LETICIA: "LNDMC",
    MATHEUS: "MTDMC",
    SARA: "SRDMC",
  };
  // Tag now lives on the media_buyers row itself; fall back to the legacy
  // hardcoded map for usernames that never had a buyer link.
  const resolveBuyerTag = (username, linkedBuyer = null) => {
    if (linkedBuyer?.tag) return linkedBuyer.tag;
    if (!username) return null;
    return buyerTagMap[String(username).trim().toUpperCase()] || null;
  };
  const mediaBuyerApproaches = approachOptions.filter((item) => item !== "All");

  const subTabs = [
    { key: "roles", label: t("Roles & Permissions"), icon: ShieldCheck },
    { key: "users", label: t("Users"), icon: User },
    { key: "team", label: t("Media Buyers"), icon: Users },
  ];

  return (
    <>
      {/* Sub-tab header — single thin strip; matches the Offers section pattern */}
      <section className="panels panels-single offers-tabs-panel">
        <motion.div className="panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Access Control")}</h3>
              <p className="panel-subtitle">
                {t("Roles define what each member can see. Users link a login to a role. Team holds buyer profiles.")}
              </p>
            </div>
            <div className="offers-tabs">
              {subTabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`offers-tab${rolesTab === item.key ? " is-active" : ""}`}
                  onClick={() => setRolesTab(item.key)}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {rolesTab === "roles" ? (
      <section className="panels panels-single">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Roles")}</h3>
              <p className="panel-subtitle">{t("Click a role to expand and edit its permissions.")}</p>
            </div>
            <span className="roles-count">{roles.length} {t("roles")} · {users.length} {t("users")}</span>
          </div>

          {roleState.loading ? (
            <div className="empty-state">{t("Loading roles…")}</div>
          ) : roleState.error ? (
            <div className="empty-state error">{roleState.error}</div>
          ) : roles.length === 0 ? (
            <div className="empty-state">{t("No roles found.")}</div>
          ) : (
            <>
              <div className="roles-toolbar">
                <input
                  type="text"
                  className="log-search"
                  placeholder={t("Search role name…")}
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                />
              </div>
              <div className="role-rows">
                {(() => {
                  const q = roleSearch.trim().toLowerCase();
                  const filtered = q
                    ? roles.filter((role) => String(role.name || "").toLowerCase().includes(q))
                    : roles;
                  if (filtered.length === 0) {
                    return <div className="empty-state">{t("No roles match.")}</div>;
                  }
                  return filtered.map((role) => {
                    const isLocked = role.name === "Boss" || role.name === "Team Leader";
                    const canEdit = isLeadership && !isLocked;
                    // Boss / Team Leader always have full access — show every
                    // permission as enabled regardless of what's stored.
                    const effectivePermissions = isLocked
                      ? permissionOptions.map((p) => p.key)
                      : role.permissions;
                    const userCount = usersByRole.get(role.name) || 0;
                    const expanded = expandedRoles.has(role.id);
                    return (
                      <div key={role.id} className={`role-row${expanded ? " is-open" : ""}${isLocked ? " is-locked" : ""}`}>
                        <button
                          type="button"
                          className="role-row-summary"
                          onClick={() => toggleRoleExpand(role.id)}
                          aria-expanded={expanded}
                        >
                          <span className="role-row-chevron">▸</span>
                          <span className="role-row-identity">
                            <span className="role-row-name">{t(role.name)}</span>
                            {isLocked ? <Lock size={11} className="role-row-lock" aria-label={t("Built-in")} /> : null}
                          </span>
                          <span className="role-row-stat">{userCount} {userCount === 1 ? t("user") : t("users")}</span>
                          <span className="role-row-stat role-row-stat-perms">
                            {effectivePermissions.length} / {permissionOptions.length} {t("permissions")}
                          </span>
                          <span className="role-row-progress">
                            <span
                              className="role-row-progress-fill"
                              style={{ width: `${Math.round((effectivePermissions.length / permissionOptions.length) * 100)}%` }}
                            />
                          </span>
                        </button>
                        {expanded ? (
                          <div className="role-row-body">
                            <div className="role-permission-groups">
                              {permissionGroups.map((group) => {
                                const groupOpts = group.keys
                                  .map((k) => permissionOptions.find((p) => p.key === k))
                                  .filter(Boolean);
                                if (groupOpts.length === 0) return null;
                                const enabledInGroup = groupOpts.filter((p) => effectivePermissions.includes(p.key)).length;
                                const allOn = enabledInGroup === groupOpts.length;
                                return (
                                  <div key={group.title} className="role-perm-group">
                                    <div className="role-perm-group-head">
                                      <span>{group.title}</span>
                                      <span className="role-perm-group-count">{enabledInGroup}/{groupOpts.length}</span>
                                      <button
                                        type="button"
                                        className="role-perm-group-bulk"
                                        disabled={!canEdit}
                                        onClick={() => setGroupPermissions(role.id, group.keys, !allOn)}
                                      >
                                        {allOn ? t("Clear") : t("Select all")}
                                      </button>
                                    </div>
                                    <div className="role-permissions">
                                      {groupOpts.map((perm) => {
                                        const checked = effectivePermissions.includes(perm.key);
                                        return (
                                          <label key={perm.key} className={`perm-item${checked ? " is-active" : ""}`}>
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() => togglePermission(role.id, perm.key)}
                                              disabled={!canEdit}
                                            />
                                            <span>{t(perm.label)}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="role-row-actions">
                              <button
                                className="ghost"
                                type="button"
                                onClick={() => handleRoleSave(role)}
                                disabled={savingId === role.id || !canEdit}
                              >
                                {savingId === role.id ? t("Saving...") : t("Save Changes")}
                              </button>
                              {!isLocked ? (
                                <button className="icon-btn" type="button" onClick={() => handleRoleDelete(role.id)}>
                                  <Trash2 size={14} />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </motion.div>
      </section>
      ) : null}

      {rolesTab === "users" ? (
      <section className="panels panels-single">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Users")}</h3>
              <p className="panel-subtitle">{t("Logins that map to a role and optionally to a media buyer.")}</p>
            </div>
            {isLeadership ? (
              <button
                type="button"
                className={`offers-mode-toggle${showUserForm ? " is-active" : ""}`}
                onClick={() => {
                  if (editingUserId) handleUserCancelEdit();
                  else setShowUserForm((v) => !v);
                }}
              >
                {editingUserId
                  ? t("Cancel edit")
                  : showUserForm
                    ? t("Close")
                    : (<><Plus size={13} strokeWidth={2.5} /> {t("Add User")}</>)}
              </button>
            ) : null}
          </div>

          {showUserForm && isLeadership ? (
          <form className="form-grid user-form" onSubmit={handleUserSubmit}>
            <div className="field">
              <label>{t("Username")}</label>
              <input
                value={userForm.username}
                onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
                required
              />
            </div>
            {editingUserId === null ? (
              <div className="field">
                <label>{t("Password")}</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
              </div>
            ) : null}
            <div className="field">
              <label>{t("Role")}</label>
              <Select
                value={userForm.role}
                onChange={(v) => setUserForm((prev) => ({ ...prev, role: v }))}
                options={roleNameOptions.map((r) => ({ value: r, label: t(r) }))}
                placeholder={t("Select role")}
              />
            </div>
            <div className="field">
              <label>{t("Assign Media Buyer")}</label>
              <Select
                value={buyers.some((b) => String(b.id) === String(userForm.buyerId)) ? userForm.buyerId : ""}
                onChange={(v) => setUserForm((prev) => ({ ...prev, buyerId: v }))}
                options={[
                  { value: "", label: t("No buyer linked") },
                  ...buyers.map((b) => ({ value: String(b.id), label: b.tag ? `${b.name} · ${b.tag}` : b.name })),
                ]}
                placeholder={buyers.length ? t("Select buyer") : t("No media buyers yet — add one in Media Buyers")}
              />
            </div>
            <div className="form-actions">
              {editingUserId !== null ? (
                <button className="ghost" type="button" onClick={handleUserCancelEdit}>
                  {t("Cancel")}
                </button>
              ) : null}
              <button className="action-pill" type="submit">
                {editingUserId !== null ? t("Save Changes") : t("Create Login")}
              </button>
            </div>
          </form>
          ) : null}

          {userState.loading ? (
            <div className="empty-state">{t("Loading users…")}</div>
          ) : userState.error ? (
            <div className="empty-state error">{userState.error}</div>
          ) : users.length === 0 ? (
            <div className="empty-state">{t("No users found.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table user-table">
                <thead>
                  <tr>
                    <th>{t("Username")}</th>
                    <th>{t("Role")}</th>
                    <th>{t("Media Buyer")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const buyerName = user.buyer_id ? buyerMap[user.buyer_id] || "" : "";
                    const linkedBuyer = user.buyer_id ? buyers.find((b) => b.id === user.buyer_id) : null;
                    const buyerTag = resolveBuyerTag(user.username, linkedBuyer);
                    return (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{t(user.role)}</td>
                        <td>
                          <div className="buyer-cell">
                            {buyerName ? <span>{buyerName}</span> : buyerTag ? null : "—"}
                            {buyerTag ? <span className="tag-pill">{buyerTag}</span> : null}
                          </div>
                        </td>
                        <td>
                          {isLeadership ? (
                            <div className="row-actions">
                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() => openPwModal(user)}
                                title={t("Reset Password")}
                              >
                                <Lock size={16} />
                              </button>
                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() => handleUserEdit(user)}
                                title={t("Edit user")}
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() => handleUserDelete(user.id)}
                                title={t("Delete user")}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
      ) : null}

      {rolesTab === "team" ? (
      <section className="panels panels-single">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Media Buyers")}</h3>
              <p className="panel-subtitle">
                {t("Buyer profiles with country, channel, contact, and status.")}
              </p>
            </div>
            {isLeadership ? (
              <button
                type="button"
                className={`offers-mode-toggle${showTeamForm ? " is-active" : ""}`}
                onClick={() => {
                  if (editingBuyerId) handleTeamCancelEdit();
                  else setShowTeamForm((v) => !v);
                }}
              >
                {editingBuyerId
                  ? t("Cancel edit")
                  : showTeamForm
                    ? t("Close")
                    : (<><Plus size={13} strokeWidth={2.5} /> {t("Add Buyer")}</>)}
              </button>
            ) : null}
          </div>

          {showTeamForm && isLeadership ? (
            <form className="form-grid team-form" onSubmit={handleTeamSubmit}>
              <div className="field">
                <label>{t("Name")}</label>
                <input
                  value={teamForm.name}
                  onChange={updateTeamForm("name")}
                  placeholder={t("Full name")}
                  required
                />
              </div>
              <div className="field">
                <label>{t("Role")}</label>
                <Select
                  value={teamForm.role}
                  onChange={(v) => setTeamForm((prev) => ({ ...prev, role: v }))}
                  options={roleOptions.map((r) => ({ value: r, label: t(r) }))}
                  placeholder={t("Select")}
                />
              </div>
              <div className="field">
                <label>{t("Country")}</label>
                <CountryDropdownPicker
                  value={teamForm.country}
                  onChange={(country) => setTeamForm((prev) => ({ ...prev, country }))}
                  options={countryOptions}
                  placeholder={t("Select")}
                  searchPlaceholder={t("Type to find countries")}
                  emptyResultsLabel={t("No countries found.")}
                />
              </div>
              <div className="field">
                <label>{t("Approach")}</label>
                <Select
                  value={teamForm.approach}
                  onChange={(v) => setTeamForm((prev) => ({ ...prev, approach: v }))}
                  options={mediaBuyerApproaches.map((a) => ({ value: a, label: t(a) }))}
                  placeholder={t("Select")}
                />
              </div>
              <div className="field">
                <label>{t("Game")}</label>
                <input
                  value={teamForm.game}
                  onChange={updateTeamForm("game")}
                  placeholder={t("e.g. Crash, Roulette")}
                />
              </div>
              <div className="field">
                <label>{t("Email")}</label>
                <input
                  type="email"
                  value={teamForm.email}
                  onChange={updateTeamForm("email")}
                  placeholder="buyer@domain.com"
                />
              </div>
              <div className="field">
                <label>{t("Contact")}</label>
                <input
                  value={teamForm.contact}
                  onChange={updateTeamForm("contact")}
                  placeholder="Telegram / WhatsApp"
                />
              </div>
              <div className="field">
                <label>{t("Tag")} <span className="field-pace-hint">{t("Short code shown in Users table — e.g. AKDMC")}</span></label>
                <input
                  value={teamForm.tag}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                  placeholder="AKDMC"
                  maxLength={12}
                />
              </div>
              <div className="field">
                <label>{t("Keitaro name")} <span className="field-pace-hint">{t("only if it differs from the login — e.g. Leomarketing → Leo")}</span></label>
                <input
                  value={teamForm.keitaro_name}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, keitaro_name: e.target.value }))}
                  placeholder={t("e.g. Leo")}
                  maxLength={40}
                />
              </div>
              <div className="field">
                <label>{t("Status")}</label>
                <Select
                  value={teamForm.status}
                  onChange={(v) => setTeamForm((prev) => ({ ...prev, status: v }))}
                  options={["Active", "Onboarding", "Inactive"].map((s) => ({ value: s, label: t(s) }))}
                  placeholder={t("Select")}
                />
              </div>
              <div className="form-actions">
                <button className="ghost" type="button" onClick={editingBuyerId ? handleTeamCancelEdit : resetTeamForm}>
                  {editingBuyerId ? t("Cancel") : t("Reset")}
                </button>
                <button className="action-pill" type="submit">
                  {editingBuyerId ? t("Save Changes") : t("Add Buyer")}
                </button>
              </div>
            </form>
          ) : null}

          {teamState.loading ? (
            <div className="empty-state">{t("Loading team…")}</div>
          ) : teamState.error ? (
            <div className="empty-state error">{teamState.error}</div>
          ) : buyers.length === 0 ? (
            <div className="empty-state">{t("No media buyers added yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table team-table">
                <thead>
                  <tr>
                    <th>{t("Name")} <span className="th-sub">{t("login")}</span></th>
                    <th>{t("Keitaro name")}</th>
                    <th>{t("Tag")}</th>
                    <th>{t("Role")}</th>
                    <th>{t("Country")}</th>
                    <th>{t("Approach")}</th>
                    <th>{t("Game")}</th>
                    <th>{t("Email")}</th>
                    <th>{t("Contact")}</th>
                    <th>{t("Status")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>
                        {member.keitaro_name ? (
                          <span
                            className="keitaro-name-pill"
                            title={`Campaigns for ${member.name} are named "${member.keitaro_name} | …" in Keitaro`}
                          >
                            <img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" />
                            {member.keitaro_name}
                          </span>
                        ) : (
                          <span className="offer-muted" title="Keitaro campaigns use the same name as the login">
                            = {member.name}
                          </span>
                        )}
                      </td>
                      <td>
                        {member.tag ? (
                          <span className="tag-pill">{member.tag}</span>
                        ) : (
                          <span className="offer-muted">—</span>
                        )}
                      </td>
                      <td>{t(member.role)}</td>
                      <td>{member.country || "—"}</td>
                      <td>{member.approach ? t(member.approach) : "—"}</td>
                      <td>{member.game || "—"}</td>
                      <td>{member.email || "—"}</td>
                      <td>{member.contact || "—"}</td>
                      <td>
                        <span className={`status-pill status-${member.status?.toLowerCase() || "inactive"}`}>
                          {member.status ? t(member.status) : t("Inactive")}
                        </span>
                      </td>
                      <td>
                        {isLeadership ? (
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              type="button"
                              title={t("Edit buyer")}
                              onClick={() => handleTeamEdit(member)}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="icon-btn"
                              type="button"
                              title={t("Delete buyer")}
                              onClick={() => handleTeamDelete(member.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
      ) : null}

      {pwModal ? (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closePwModal(); }}>
          <div className="modal pw-modal" role="dialog" aria-modal="true">
            <div className="modal-head pw-modal-head">
              <div className="pw-modal-title">
                <span className="pw-modal-icon"><Lock size={18} /></span>
                <div>
                  <h2>{t("Reset password")}</h2>
                  <p className="pw-modal-sub">{pwModal.user?.username}</p>
                </div>
              </div>
              <button className="icon-btn" type="button" onClick={closePwModal}>
                <X size={18} />
              </button>
            </div>

            {pwState.done ? (
              <div className="pw-done">
                <div className="pw-done-icon"><CheckCircle size={40} /></div>
                <h3>{t("Password updated")}</h3>
                <p>{t("The new password is active immediately.")} {pwModal.user?.username} {t("must use it on next login.")}</p>
                <div className="pw-done-value">
                  <code>{pwForm.next}</code>
                  <button type="button" className="ghost" onClick={() => navigator.clipboard?.writeText(pwForm.next)}>
                    <Copy size={14} /> {t("Copy")}
                  </button>
                </div>
                <button type="button" className="action-pill" onClick={closePwModal}>{t("Done")}</button>
              </div>
            ) : (
              <form className="pw-form" onSubmit={handlePwSubmit}>
                <div className="field">
                  <label>{t("New password")}</label>
                  <div className="pw-input-wrap">
                    <input
                      type={pwForm.show ? "text" : "password"}
                      value={pwForm.next}
                      onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                      placeholder={t("Enter a strong password")}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="pw-eye"
                      onClick={() => setPwForm((p) => ({ ...p, show: !p.show }))}
                      title={pwForm.show ? t("Hide") : t("Show")}
                    >
                      {pwForm.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {pwForm.next ? (() => {
                    const s = scorePassword(pwForm.next);
                    return (
                      <div className="pw-strength">
                        <div className="pw-strength-bars">
                          {[0, 1, 2, 3].map((i) => (
                            <span key={i} className={`pw-strength-bar${i < s.score ? ` is-${s.tone}` : ""}`} />
                          ))}
                        </div>
                        <span className={`pw-strength-label tone-${s.tone}`}>{s.label}</span>
                      </div>
                    );
                  })() : null}
                </div>

                <div className="field">
                  <label>{t("Confirm password")}</label>
                  <div className="pw-input-wrap">
                    <input
                      type={pwForm.show ? "text" : "password"}
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                      placeholder={t("Re-enter the password")}
                    />
                  </div>
                  {pwForm.confirm && pwForm.confirm !== pwForm.next ? (
                    <span className="pw-mismatch">{t("Passwords do not match.")}</span>
                  ) : null}
                </div>

                <button type="button" className="pw-generate" onClick={generatePassword}>
                  <RotateCcw size={13} /> {t("Generate strong password")}
                </button>

                {pwState.error ? <div className="pw-error">{pwState.error}</div> : null}

                <div className="pw-actions">
                  <button type="button" className="ghost" onClick={closePwModal}>{t("Cancel")}</button>
                  <button type="submit" className="action-pill" disabled={pwState.saving}>
                    {pwState.saving ? t("Saving…") : t("Update password")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

// Achievement badges — unlocked on lifetime totals across all of a buyer's
// links. Two tracks (FTDs + revenue), rising tiers. Kept data-driven so tiers
// are easy to tune.
const PROFILE_BADGES = [
  { id: "ftd-100", track: "ftds", label: "Century", req: 100, Icon: Medal, hint: "100 FTDs", tier: "bronze" },
  { id: "ftd-500", track: "ftds", label: "High Roller", req: 500, Icon: Flame, hint: "500 FTDs", tier: "silver" },
  { id: "ftd-1k", track: "ftds", label: "Rainmaker", req: 1000, Icon: Trophy, hint: "1,000 FTDs", tier: "gold" },
  { id: "ftd-5k", track: "ftds", label: "Whale Hunter", req: 5000, Icon: Crown, hint: "5,000 FTDs", tier: "emerald" },
  { id: "ftd-10k", track: "ftds", label: "Legend", req: 10000, Icon: Gem, hint: "10,000 FTDs", tier: "diamond" },
  { id: "rev-1k", track: "revenue", label: "$1K Club", req: 1000, Icon: DollarSign, hint: "$1,000 revenue", tier: "bronze" },
  { id: "rev-10k", track: "revenue", label: "$10K Club", req: 10000, Icon: Award, hint: "$10,000 revenue", tier: "silver" },
  { id: "rev-50k", track: "revenue", label: "$50K Club", req: 50000, Icon: Rocket, hint: "$50,000 revenue", tier: "gold" },
  { id: "rev-100k", track: "revenue", label: "$100K Club", req: 100000, Icon: Sparkles, hint: "$100,000 revenue", tier: "diamond" },
];

// Metallic tier palettes [highlight, mid, shadow] for the SVG medal coins.
const BADGE_TIERS = {
  bronze: ["#f4d0a4", "#cd7f32", "#7a4318"],
  silver: ["#f7f9fc", "#c3c8d2", "#7c8290"],
  gold: ["#ffe9a3", "#f7c625", "#a9781a"],
  emerald: ["#bff7db", "#36d07c", "#15683f"],
  diamond: ["#e9fbff", "#8fe0ff", "#3f9fd6"],
};

// Quality SVG medal coin: notched rim, metallic radial bevel, gloss highlight.
// The tier glyph is overlaid separately (in .badge-glyph). Greys out when locked.
const BadgeMedal = ({ badgeId, tier, locked }) => {
  const [c1, c2, c3] = locked ? ["#3b3e45", "#2b2e34", "#1f2125"] : (BADGE_TIERS[tier] || BADGE_TIERS.gold);
  const gid = `bm-${badgeId}${locked ? "-l" : ""}`;
  const notches = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    notches.push([32 + Math.cos(a) * 29, 32 + Math.sin(a) * 29]);
  }
  return (
    <svg viewBox="0 0 64 64" className="badge-svg" aria-hidden="true">
      <defs>
        <radialGradient id={`${gid}-c`} cx="50%" cy="32%" r="72%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="52%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </radialGradient>
        <linearGradient id={`${gid}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={locked ? 0.1 : 0.55} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {notches.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill={c2} opacity={locked ? 0.5 : 0.92} />
      ))}
      <circle cx="32" cy="32" r="26" fill={`url(#${gid}-c)`} stroke="rgba(255,255,255,0.32)" strokeWidth="1" />
      <circle cx="32" cy="32" r="20.5" fill="none" stroke="rgba(0,0,0,0.24)" strokeWidth="1.4" />
      <ellipse cx="32" cy="22" rx="15" ry="8" fill={`url(#${gid}-s)`} />
    </svg>
  );
};

function ProfileDashboard({ authUser }) {
  const { t } = useLanguage();
  const [profileState, setProfileState] = React.useState({ loading: true, error: null });
  const [userRecord, setUserRecord] = React.useState(null);
  const [roleRecord, setRoleRecord] = React.useState(null);
  const [buyerRecord, setBuyerRecord] = React.useState(null);
  const [statRows, setStatRows] = React.useState([]);
  const [passwordForm, setPasswordForm] = React.useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordState, setPasswordState] = React.useState({
    loading: false,
    error: null,
    success: null,
  });

  const loadProfile = React.useCallback(async () => {
    try {
      setProfileState({ loading: true, error: null });
      // All-time window so the "lifetime" KPIs + achievement badges are honest
      // (the endpoint defaults to year-to-date). Server still scopes rows to the
      // logged-in buyer, so every profile shows only that buyer's own numbers.
      const allTimeFrom = `${new Date().getUTCFullYear() - 4}-01-01`;
      const [usersRes, rolesRes, buyersRes, statsRes] = await Promise.all([
        apiFetch("/api/users?limit=300"),
        apiFetch("/api/roles?limit=200"),
        apiFetch("/api/media-buyers?limit=300"),
        apiFetch(`/api/keitaro/live-stats?from=${allTimeFrom}`),
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const roles = rolesRes.ok ? await rolesRes.json() : [];
      const buyers = buyersRes.ok ? await buyersRes.json() : [];
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setStatRows(Array.isArray(statsData?.rows) ? statsData.rows : []);

      const currentUser =
        users.find((user) => user.id === authUser?.id) ||
        users.find((user) => user.username === authUser?.username) ||
        null;
      const resolvedBuyerId = currentUser?.buyer_id ?? authUser?.buyerId ?? null;
      const buyer = buyers.find((item) => item.id === resolvedBuyerId) || null;
      const role = roles.find((item) => item.name === (currentUser?.role || authUser?.role)) || null;

      setUserRecord(currentUser);
      setBuyerRecord(buyer);
      setRoleRecord(role);
      setProfileState({ loading: false, error: null });
    } catch (error) {
      setProfileState({ loading: false, error: error.message || "Failed to load profile." });
    }
  }, [authUser?.id, authUser?.username, authUser?.buyerId, authUser?.role]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const username = userRecord?.username || authUser?.username || "—";
  const roleName = userRecord?.role || authUser?.role || "—";
  const buyerName = buyerRecord?.name || t("No buyer linked");
  const verified = userRecord?.verified ? t("Verified") : t("Unverified");
  const permissions = roleRecord?.permissions || [];

  const fmtCount = (n) => Math.round(Number(n) || 0).toLocaleString();

  // Lifetime performance across all of this buyer's links (server already
  // scopes live-stats to the viewer). Drives the KPI tiles, highlights + badges.
  const perf = React.useMemo(() => {
    let revenue = 0, ftds = 0, clicks = 0, redeposits = 0, registers = 0, spend = 0;
    const geoMap = new Map();
    const toolMap = new Map();
    const brandMap = new Map();
    for (const r of statRows) {
      const rev = (Number(r.ftd_revenue) || 0) + (Number(r.redeposit_revenue) || 0);
      revenue += rev;
      ftds += Number(r.ftds) || 0;
      clicks += Number(r.clicks) || 0;
      redeposits += Number(r.redeposits) || 0;
      registers += Number(r.registers) || 0;
      spend += Number(r.spend) || 0;
      const country = r.country || r.geo;
      if (country) {
        const g = geoMap.get(country) || { ftds: 0, revenue: 0 };
        g.ftds += Number(r.ftds) || 0;
        g.revenue += rev;
        geoMap.set(country, g);
      }
      const tool = r.tool;
      if (tool) {
        const tm = toolMap.get(tool) || { clicks: 0, revenue: 0, ftds: 0 };
        tm.clicks += Number(r.clicks) || 0;
        tm.revenue += rev;
        tm.ftds += Number(r.ftds) || 0;
        toolMap.set(tool, tm);
      }
      const brand = r.brand;
      if (brand) {
        const bm = brandMap.get(brand) || { revenue: 0, ftds: 0 };
        bm.revenue += rev;
        bm.ftds += Number(r.ftds) || 0;
        brandMap.set(brand, bm);
      }
    }
    const bestGeo = [...geoMap.entries()]
      .sort((a, b) => b[1].ftds - a[1].ftds || b[1].revenue - a[1].revenue)[0] || null;
    const preferredTool = [...toolMap.entries()]
      .sort((a, b) => b[1].clicks - a[1].clicks || b[1].ftds - a[1].ftds)[0] || null;
    const topBrand = [...brandMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue || b[1].ftds - a[1].ftds)[0] || null;
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : null;
    return { revenue, ftds, clicks, redeposits, registers, spend, roi, bestGeo, preferredTool, topBrand, geoCount: geoMap.size };
  }, [statRows]);

  const badges = React.useMemo(
    () =>
      PROFILE_BADGES.map((b) => {
        const value = b.track === "ftds" ? perf.ftds : perf.revenue;
        return { ...b, value, earned: value >= b.req, progress: Math.min(1, b.req ? value / b.req : 0) };
      }),
    [perf.ftds, perf.revenue]
  );
  const earnedBadges = badges.filter((b) => b.earned);
  const nextBadge = badges.find((b) => !b.earned) || null;

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordState({ loading: false, error: t("Passwords do not match."), success: null });
      return;
    }
    try {
      setPasswordState({ loading: true, error: null, success: null });
      const response = await apiFetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update password.");
      }
      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordState({ loading: false, error: null, success: t("Password updated.") });
    } catch (error) {
      setPasswordState({
        loading: false,
        error: error.message || "Failed to update password.",
        success: null,
      });
    }
  };

  return (
    <>
      {/* Performance — lifetime totals across all of this buyer's links */}
      <section className="cards">
        {[
          { label: "Registrations", value: fmtCount(perf.registers), meta: "All-time sign-ups", icon: UserPlus },
          { label: "FTD", value: fmtCount(perf.ftds), meta: "First-time deposits", icon: CreditCard },
          { label: "Redeposit", value: fmtCount(perf.redeposits), meta: "Repeat deposits", icon: TrendingUp },
          { label: "Revenue", value: formatCurrency(perf.revenue), meta: "FTD + Redeposit", icon: DollarSign, accent: true },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`card${stat.accent ? " card-accent" : ""}`}>
              <div className="card-head"><Icon size={18} />{t(stat.label)}</div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </div>
          );
        })}
      </section>

      {/* Highlights: best GEO · preferred tool · achievement rank */}
      <section className="profile-highlights">
        <div className="profile-highlight">
          <span className="ph-icon ph-geo"><Globe size={18} /></span>
          <div className="ph-body">
            <span className="ph-label">{t("Best GEO")}</span>
            {perf.bestGeo ? (
              <span className="ph-value"><CountryFlag value={perf.bestGeo[0]} /> {perf.bestGeo[0]}</span>
            ) : (
              <span className="ph-value ph-empty">{t("No data yet")}</span>
            )}
            <span className="ph-sub">
              {perf.bestGeo ? `${fmtCount(perf.bestGeo[1].ftds)} ${t("FTDs")} · ${formatCurrency(perf.bestGeo[1].revenue)}` : t("Generate FTDs to rank your GEOs")}
            </span>
          </div>
        </div>
        <div className="profile-highlight">
          <span className="ph-icon ph-tool"><Target size={18} /></span>
          <div className="ph-body">
            <span className="ph-label">{t("Preferred tool")}</span>
            {perf.preferredTool ? (
              <span className="ph-value">
                {resolveBrandLogo(perf.preferredTool[0]) ? <BrandMark value={perf.preferredTool[0]} height={24} /> : perf.preferredTool[0]}
              </span>
            ) : (
              <span className="ph-value ph-empty">{t("No data yet")}</span>
            )}
            <span className="ph-sub">
              {perf.preferredTool ? `${fmtCount(perf.preferredTool[1].clicks)} ${t("clicks")} · ${fmtCount(perf.preferredTool[1].ftds)} ${t("FTDs")}` : t("Your most-used traffic source")}
            </span>
          </div>
        </div>
        <div className="profile-highlight">
          <span className="ph-icon ph-brand"><Tag size={18} /></span>
          <div className="ph-body">
            <span className="ph-label">{t("Top brand")}</span>
            {perf.topBrand ? (
              <span className="ph-value">
                {resolveBrandLogo(perf.topBrand[0]) ? <BrandMark value={perf.topBrand[0]} height={22} /> : perf.topBrand[0]}
              </span>
            ) : (
              <span className="ph-value ph-empty">{t("No data yet")}</span>
            )}
            <span className="ph-sub">
              {perf.topBrand ? `${formatCurrency(perf.topBrand[1].revenue)} · ${fmtCount(perf.topBrand[1].ftds)} ${t("FTDs")}` : t("Your best-performing brand")}
            </span>
          </div>
        </div>
      </section>

      {/* Achievements — badges earned on lifetime totals */}
      <section className="panel profile-achievements">
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><Trophy size={20} /></span>
            <div>
              <h3 className="panel-title">{t("Achievements")}</h3>
              <p className="panel-subtitle">{t("Badges unlock on your all-time results across every link.")}</p>
            </div>
          </div>
          <span className="badge-count-chip">{earnedBadges.length}/{badges.length} {t("unlocked")}</span>
        </div>
        <div className="badge-grid">
          {badges.map((b) => {
            const Icon = b.Icon;
            return (
              <div key={b.id} className={`badge-tile tier-${b.tier}${b.earned ? " is-earned" : " is-locked"}`} title={b.hint}>
                <div className="badge-medal">
                  <BadgeMedal badgeId={b.id} tier={b.tier} locked={!b.earned} />
                  <span className="badge-glyph"><Icon size={22} /></span>
                </div>
                <div className="badge-name">{t(b.label)}</div>
                <div className="badge-hint">{b.hint}</div>
                {b.earned ? (
                  <div className="badge-status"><CheckCircle size={12} /> {t("Unlocked")}</div>
                ) : (
                  <div className="badge-progress">
                    <div className="badge-progress-bar"><span style={{ width: `${Math.round(b.progress * 100)}%` }} /></div>
                    <span className="badge-progress-text">{Math.round(b.progress * 100)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Account overview */}
      <section className="cards">
        {[
          { label: "Username", value: username, meta: "Account Overview", icon: User },
          { label: "Role", value: t(roleName), meta: "Access Level", icon: ShieldCheck },
          { label: "Media Buyer", value: buyerName, meta: "Assigned Media Buyer", icon: Target },
          { label: "Status", value: verified, meta: "Account Status", icon: CheckCircle },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="card-head">
                <Icon size={18} />
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </div>
          );
        })}
      </section>

      <section className="panels profile-panels">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Profile Details")}</h3>
              <p className="panel-subtitle">{t("Your profile in the top right shows the active user and role.")}</p>
            </div>
          </div>
          {profileState.loading ? (
            <div className="empty-state">{t("Loading profile…")}</div>
          ) : profileState.error ? (
            <div className="empty-state error">{profileState.error}</div>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-info">
                <span>{t("User ID")}</span>
                <strong>{userRecord?.id ?? authUser?.id ?? "—"}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Username")}</span>
                <strong>{username}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Role")}</span>
                <strong>{t(roleName)}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Buyer ID")}</span>
                <strong>{buyerRecord?.id ?? authUser?.buyerId ?? "—"}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Media Buyer")}</span>
                <strong>{buyerName}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Account Status")}</span>
                <strong>{verified}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Change Password")}</h3>
              <p className="panel-subtitle">{t("Secure login")}</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handlePasswordChange}>
            <div className="field">
              <label>{t("Current Password")}</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, current: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label>{t("New Password")}</label>
              <input
                type="password"
                value={passwordForm.next}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, next: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label>{t("Confirm Password")}</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))
                }
                required
              />
            </div>
            <div className="form-actions">
              <button className="action-pill" type="submit" disabled={passwordState.loading}>
                {passwordState.loading ? t("Saving...") : t("Update Password")}
              </button>
            </div>
            {passwordState.error ? (
              <div className="form-error">{passwordState.error}</div>
            ) : null}
            {passwordState.success ? (
              <div className="form-success">{passwordState.success}</div>
            ) : null}
          </form>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Role Permissions")}</h3>
              <p className="panel-subtitle">{t("Permissions granted by your role.")}</p>
            </div>
          </div>
          {profileState.loading ? (
            <div className="empty-state">{t("Loading profile…")}</div>
          ) : permissions.length === 0 ? (
            <div className="empty-state">{t("No permissions assigned.")}</div>
          ) : (
            <div className="role-permissions">
              {permissions.map((perm) => (
                <div key={perm} className="perm-item is-active">
                  <span>{t(permissionOptions.find((opt) => opt.key === perm)?.label || perm)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}


function KeitaroApiView() {
  const { t } = useLanguage();
  const storageKey = "keitaro-config-v1";
  const stored = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (error) {
      return {};
    }
  }, []);
  const initialSyncTarget = stored.syncTarget || "overall";

  const [baseUrl, setBaseUrl] = React.useState(stored.baseUrl || "");
  const [apiKey, setApiKey] = React.useState(stored.rememberKey ? stored.apiKey || "" : "");
  const [reportPath, setReportPath] = React.useState(stored.reportPath || "/admin_api/v1/report/build");
  const [payloadText, setPayloadText] = React.useState(
    stored.payloadText || defaultKeitaroPayloadByTarget[initialSyncTarget] || defaultKeitaroPayload
  );
  const [mapping, setMapping] = React.useState({ ...defaultKeitaroMapping, ...(stored.mapping || {}) });
  const [syncTarget, setSyncTarget] = React.useState(initialSyncTarget);
  const [replaceExisting, setReplaceExisting] = React.useState(
    stored.replaceExisting === undefined ? true : stored.replaceExisting
  );
  const [rememberKey, setRememberKey] = React.useState(Boolean(stored.rememberKey));
  const [testState, setTestState] = React.useState({ loading: false, ok: null, message: "" });
  const [syncState, setSyncState] = React.useState({ loading: false, ok: null, message: "" });
  const [syncResult, setSyncResult] = React.useState(null);
  const [formatCheck, setFormatCheck] = React.useState({ loading: false, error: "", data: null });
  // Mapping is a 26-input wall — keep it collapsed until explicitly opened.
  const [showMapping, setShowMapping] = React.useState(false);
  const [apiTab, setApiTab] = React.useState("connection"); // connection | postbacks | sync | campaigns
  const previousSyncTargetRef = React.useRef(initialSyncTarget);
  const [campaigns, setCampaigns] = React.useState([]);
  const [campaignState, setCampaignState] = React.useState({ loading: true, error: null });
  const [campaignForm, setCampaignForm] = React.useState({
    keitaroId: "",
    name: "",
    buyer: "",
    country: "",
    domain: "",
  });

  const postbackUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/install`;
  }, []);

  const postbackFtdUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/ftd`;
  }, []);

  const postbackRegistrationUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/registration`;
  }, []);

  const postbackRedepositUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/redeposit`;
  }, []);

  const postbackExample = postbackUrl
    ? `${postbackUrl}?external_id={pwauid}&country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackFtdExample = postbackFtdUrl
    ? `${postbackFtdUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackRegistrationExample = postbackRegistrationUrl
    ? `${postbackRegistrationUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackRedepositExample = postbackRedepositUrl
    ? `${postbackRedepositUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackItems = [
    {
      key: "install",
      title: "Install Postback Receiver",
      subtitle: "Receive install events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackUrl,
      example: postbackExample,
    },
    {
      key: "registration",
      title: "Registration Postback Receiver",
      subtitle:
        "Receive registration events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackRegistrationUrl,
      example: postbackRegistrationExample,
    },
    {
      key: "ftd",
      title: "FTD Postback Receiver",
      subtitle: "Receive FTD events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackFtdUrl,
      example: postbackFtdExample,
    },
    {
      key: "redeposit",
      title: "Redeposit Postback Receiver",
      subtitle:
        "Receive redeposit events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackRedepositUrl,
      example: postbackRedepositExample,
    },
  ];

  React.useEffect(() => {
    const previousTarget = previousSyncTargetRef.current;
    if (previousTarget === syncTarget) return;
    const previousDefault = defaultKeitaroPayloadByTarget[previousTarget] || defaultKeitaroPayload;
    const nextDefault = defaultKeitaroPayloadByTarget[syncTarget] || defaultKeitaroPayload;
    const currentText = String(payloadText || "").trim();
    if (!currentText || currentText === String(previousDefault).trim()) {
      setPayloadText(nextDefault);
    }
    previousSyncTargetRef.current = syncTarget;
  }, [syncTarget, payloadText]);

  React.useEffect(() => {
    const payload = {
      baseUrl,
      reportPath,
      payloadText,
      mapping,
      syncTarget,
      replaceExisting,
      rememberKey,
    };
    if (rememberKey) {
      payload.apiKey = apiKey;
    }
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [baseUrl, reportPath, payloadText, mapping, syncTarget, replaceExisting, rememberKey, apiKey]);

  const handleMappingChange = (key) => (event) => {
    setMapping((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const ensurePayloadField = React.useCallback((payload, field) => {
    if (!payload || typeof payload !== "object" || !field) return payload;
    const normalizedField = String(field).trim();
    if (!normalizedField) return payload;

    const hasDimensions = Array.isArray(payload.dimensions);
    const hasGrouping = Array.isArray(payload.grouping);
    const normalized = normalizedField.toLowerCase();

    const appendField = (items) => {
      const nextItems = [...items];
      const exists = nextItems.some(
        (item) => String(item || "").trim().toLowerCase() === normalized
      );
      if (!exists) {
        nextItems.push(normalizedField);
      }
      return nextItems;
    };

    if (hasDimensions || hasGrouping) {
      const nextPayload = { ...payload };
      if (hasDimensions) {
        nextPayload.dimensions = appendField(payload.dimensions);
      }
      if (hasGrouping) {
        nextPayload.grouping = appendField(payload.grouping);
      }
      return nextPayload;
    }

    return { ...payload, dimensions: [normalizedField] };
  }, []);

  const ensurePayloadMeasure = React.useCallback((payload, measure) => {
    if (!payload || typeof payload !== "object" || !measure) return payload;
    const normalizedMeasure = String(measure).trim();
    if (!normalizedMeasure) return payload;
    const lower = normalizedMeasure.toLowerCase();
    const appendMeasure = (items) => {
      const nextItems = Array.isArray(items) ? [...items] : [];
      const exists = nextItems.some(
        (item) => String(item || "").trim().toLowerCase() === lower
      );
      if (!exists) {
        nextItems.push(normalizedMeasure);
      }
      return nextItems;
    };

    const nextPayload = { ...payload, measures: appendMeasure(payload.measures) };
    if (Array.isArray(payload.metrics)) {
      nextPayload.metrics = appendMeasure(payload.metrics);
    }
    return nextPayload;
  }, []);

  const fetchCampaigns = React.useCallback(async () => {
    try {
      setCampaignState({ loading: true, error: null });
      const response = await apiFetch("/api/campaigns?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load campaigns.");
      }
      const data = await response.json();
      setCampaigns(data);
      setCampaignState({ loading: false, error: null });
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to load campaigns." });
    }
  }, []);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const updateCampaignForm = (key) => (event) => {
    setCampaignForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetCampaignForm = () => {
    setCampaignForm({ keitaroId: "", name: "", buyer: "", country: "", domain: "" });
  };

  const handleCampaignSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save campaign.");
      }
      await fetchCampaigns();
      resetCampaignForm();
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to save campaign." });
    }
  };

  const handleCampaignDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete campaign.");
      }
      await fetchCampaigns();
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to delete campaign." });
    }
  };

  const handleCopyPostback = (value) => async () => {
    if (!value) return;
    try {
      await navigator.clipboard?.writeText(value);
    } catch (error) {
      // ignore clipboard failure
    }
  };

  const handleTest = async () => {
    setTestState({ loading: true, ok: null, message: "" });
    try {
      const response = await apiFetch("/api/keitaro/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Connection failed.");
      }
      setTestState({ loading: false, ok: true, message: "Connection verified." });
    } catch (error) {
      setTestState({ loading: false, ok: false, message: error.message || "Connection failed." });
    }
  };

  const handleFormatCheck = async () => {
    setFormatCheck({ loading: true, error: "", data: null });
    try {
      const response = await apiFetch("/api/keitaro/campaign-format-check");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Campaign check failed.");
      }
      setFormatCheck({ loading: false, error: "", data });
    } catch (error) {
      setFormatCheck({ loading: false, error: error.message || "Campaign check failed.", data: null });
    }
  };

  const handleSync = async () => {
    setSyncState({ loading: true, ok: null, message: "" });
    setSyncResult(null);
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (error) {
      setSyncState({ loading: false, ok: false, message: "Report payload must be valid JSON." });
      return;
    }

    const normalizeMeasures = (items) =>
      items.map((item) => {
        const key = String(item || "").trim().toLowerCase();
        if (key === "registrations" || key === "registration") return "regs";
        if (key === "ftd" || key === "ftds") return "custom_conversion_8";
        if (key === "redeposit" || key === "redeposits") return "custom_conversion_7";
        return item;
      });
    if (parsedPayload && typeof parsedPayload === "object") {
      if (Array.isArray(parsedPayload.measures)) {
        parsedPayload = { ...parsedPayload, measures: normalizeMeasures(parsedPayload.measures) };
      }
      if (Array.isArray(parsedPayload.metrics)) {
        parsedPayload = { ...parsedPayload, metrics: normalizeMeasures(parsedPayload.metrics) };
      }
    }

    if (syncTarget === "overall") {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.cityField || defaultKeitaroMapping.cityField,
        mapping.regionField || defaultKeitaroMapping.regionField,
        mapping.placementField || defaultKeitaroMapping.placementField,
        mapping.domainField || defaultKeitaroMapping.domainField,
        mapping.campaignNameField || defaultKeitaroMapping.campaignNameField,
        mapping.adsetNameField || defaultKeitaroMapping.adsetNameField,
        mapping.adNameField || defaultKeitaroMapping.adNameField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.spendField || defaultKeitaroMapping.spendField,
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
        mapping.ftdRevenueField || defaultKeitaroMapping.ftdRevenueField,
        mapping.redepositRevenueField || defaultKeitaroMapping.redepositRevenueField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    } else if (syncTarget === "user_behavior") {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.campaignField || defaultKeitaroMapping.campaignField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.regionField || defaultKeitaroMapping.regionField,
        mapping.cityField || defaultKeitaroMapping.cityField,
        mapping.placementField || defaultKeitaroMapping.placementField,
        mapping.externalIdField || defaultKeitaroMapping.externalIdField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
        mapping.ftdRevenueField || defaultKeitaroMapping.ftdRevenueField,
        mapping.redepositRevenueField || defaultKeitaroMapping.redepositRevenueField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    } else {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.deviceField || defaultKeitaroMapping.deviceField,
        mapping.osField || defaultKeitaroMapping.osField,
        mapping.osVersionField || defaultKeitaroMapping.osVersionField,
        mapping.deviceModelField || defaultKeitaroMapping.deviceModelField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.spendField || defaultKeitaroMapping.spendField,
        mapping.revenueField || defaultKeitaroMapping.revenueField,
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    }

    try {
      let response = await apiFetch("/api/keitaro/sync?async=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl,
          apiKey,
          reportPath,
          payload: parsedPayload,
          mapping,
          replaceExisting,
          target: syncTarget,
          async: true,
        }),
      });
      if (response.status === 404 || response.status === 405) {
        response = await apiFetch("/api/keitaro/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baseUrl,
            apiKey,
            reportPath,
            payload: parsedPayload,
            mapping,
            replaceExisting,
            target: syncTarget,
          }),
        });
      }
      if (response.status === 504 || response.status === 502) {
        throw new Error(
          "Gateway timeout. Backend is still running sync in foreground. Redeploy Render with the latest backend code."
        );
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Sync failed.");
      }
      if (data?.async) {
        setSyncState({
          loading: false,
          ok: true,
          message: "Sync started. Refresh in a few minutes to see results.",
        });
        setSyncResult(null);
      } else {
        setSyncState({ loading: false, ok: true, message: "Sync complete." });
        setSyncResult(data);
        window.dispatchEvent(new Event("keitaro:sync"));
      }
    } catch (error) {
      setSyncState({ loading: false, ok: false, message: error.message || "Sync failed." });
    }
  };

  const [postbackLogs, setPostbackLogs] = React.useState([]);
  const [postbackLogState, setPostbackLogState] = React.useState({
    loading: false,
    error: null,
  });

  const fetchPostbackLogs = React.useCallback(async () => {
    try {
      setPostbackLogState({ loading: true, error: null });
      const response = await apiFetch("/api/postbacks/logs?limit=10");
      if (!response.ok) {
        throw new Error("Failed to load postback logs.");
      }
      const data = await response.json();
      setPostbackLogs(Array.isArray(data) ? data : []);
      setPostbackLogState({ loading: false, error: null });
    } catch (error) {
      setPostbackLogState({
        loading: false,
        error: error.message || "Failed to load postback logs.",
      });
    }
  }, []);

  React.useEffect(() => {
    fetchPostbackLogs();
  }, [fetchPostbackLogs]);

  const formatLogTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return String(value);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEventLabel = (value) => {
    const label = String(value || "").toLowerCase();
    if (label === "ftd") return "FTD";
    if (label === "redeposit") return "Redeposit";
    if (label === "registration") return "Registration";
    if (label === "install") return "Install";
    return label || "—";
  };

  const visiblePostbackLogs = React.useMemo(
    () => postbackLogs.slice(0, 10),
    [postbackLogs]
  );

  const apiTabs = [
    { key: "connection", label: t("Connection"), icon: Plug },
    { key: "postbacks", label: t("Postbacks"), icon: Link2 },
    { key: "sync", label: t("Report Sync"), icon: Download },
    { key: "campaigns", label: t("Campaign Linker"), icon: Megaphone },
  ];

  return (
    <>
      <section className="panels panels-single offers-tabs-panel">
        <motion.div className="panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Keitaro API")}</h3>
              <p className="panel-subtitle">
                {t("Connect the tracker, receive postbacks, sync reports, and link campaigns.")}
              </p>
            </div>
            <div className="offers-tabs">
              {apiTabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`offers-tab${apiTab === item.key ? " is-active" : ""}`}
                  onClick={() => setApiTab(item.key)}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {apiTab === "connection" ? (
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head api-head">
            <div>
              <h3 className="panel-title">{t("Keitaro Connection")}</h3>
              <p className="panel-subtitle">{t("Connect your tracker and validate the Admin API key.")}</p>
            </div>
          </div>

          <div className="api-banner">
            <div>
              <strong>{t("Connection checklist")}</strong>
              <p>{t("Base URL, API key, and report endpoint are required before syncing.")}</p>
            </div>
          </div>

          <div className="form-grid api-grid">
            <div className="field">
              <label>{t("Base URL")}</label>
              <input
                type="text"
                placeholder="https://tracker.yourdomain.com"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("API Key")}</label>
              <input
                type="password"
                placeholder="Keitaro API key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("Report Endpoint")}</label>
              <input
                type="text"
                value={reportPath}
                onChange={(event) => setReportPath(event.target.value)}
              />
              <p className="field-hint">{t("Default Keitaro report endpoint.")}</p>
            </div>
            <div className="field field-inline">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={(event) => setRememberKey(event.target.checked)}
                />
                {t("Remember API key locally")}
              </label>
              <p className="field-hint">{t("Stored only in your browser.")}</p>
            </div>
          </div>

          <div className="api-actions">
            {testState.message && (
              <div className={`api-status ${testState.ok ? "success" : "error"}`}>
                {testState.message}
              </div>
            )}
            <button
              className="ghost"
              type="button"
              onClick={handleFormatCheck}
              disabled={formatCheck.loading}
            >
              {formatCheck.loading ? t("Checking...") : t("Check Campaign Naming")}
            </button>
            <button className="ghost" type="button" onClick={handleTest} disabled={testState.loading}>
              {testState.loading ? t("Testing...") : t("Test Connection")}
            </button>
          </div>

          {(formatCheck.error || formatCheck.data) && (
            <div className="format-check">
              {formatCheck.error ? (
                <div className="api-status error">{formatCheck.error}</div>
              ) : (
                <>
                  <div className="format-check-summary">
                    <span className="format-check-stat">
                      <strong>{formatCheck.data.total}</strong> {t("campaigns")}
                    </span>
                    <span className="format-check-stat ok">
                      <strong>{formatCheck.data.formatted}</strong> {t("formatted")}
                    </span>
                    <span
                      className={`format-check-stat ${formatCheck.data.unformattedCount ? "warn" : "ok"}`}
                    >
                      <strong>{formatCheck.data.unformattedCount}</strong> {t("off-format")}
                    </span>
                  </div>
                  {formatCheck.data.unformattedCount === 0 ? (
                    <div className="api-status success">
                      {t("All campaigns follow Buyer | Tool | Game | Geo | Brand.")}
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="entries-table">
                        <thead>
                          <tr>
                            <th>{t("Campaign")}</th>
                            <th>{t("Segments")}</th>
                            <th>{t("Issues")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formatCheck.data.unformatted.map((c) => (
                            <tr key={c.id ?? c.name}>
                              <td>{c.name}</td>
                              <td>{c.segmentCount}/5</td>
                              <td>{c.issues.join("; ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {formatCheck.data.buyers?.length ? (
                    <p className="panel-subtitle">
                      {t("Buyers detected")}: {formatCheck.data.buyers.join(", ")}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          )}
        </motion.div>
      </section>
      ) : null}

      {apiTab === "postbacks" ? (
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head api-head">
            <div>
              <h3 className="panel-title">{t("Postback Receivers")}</h3>
              <p className="panel-subtitle">
                {t("Use these endpoints to attach events to Keitaro campaigns.")}
              </p>
            </div>
          </div>

          <div className="postback-info">
            <div>
              <span className="panel-mini">{t("Required parameters")}</span>
              <p>{t("Provide buyer and domain (or campaign_id) for attribution.")}</p>
            </div>
            <div>
              <span className="panel-mini">{t("Optional parameters")}</span>
              <p>{t("external_id, country, buyer, domain, device, status, payout.")}</p>
            </div>
          </div>

          <div className="postback-grid">
            {postbackItems.map((item) => (
              <div className="postback-card" key={item.key}>
                <div className="postback-card-head">
                  <div className="panel-title">{t(item.title)}</div>
                  <div className="panel-subtitle">{t(item.subtitle)}</div>
                </div>
                <div className="postback-url">
                  <input className="code-input" value={item.url} readOnly />
                  <button className="ghost" type="button" onClick={handleCopyPostback(item.url)}>
                    <Copy size={14} />
                    {t("Copy URL")}
                  </button>
                </div>
                {item.example ? (
                  <details className="postback-example-toggle">
                    <summary>{t("Example request")}</summary>
                    <code className="postback-example">{item.example}</code>
                  </details>
                ) : null}
              </div>
            ))}
          </div>

          <div className="api-section postback-logs">
            <div className="api-section-head">
              <div>
                <h4 className="panel-title">{t("Postback Logs")}</h4>
                <p className="panel-subtitle">{t("Latest events received from postbacks.")}</p>
              </div>
              <button
                className="ghost"
                type="button"
                onClick={fetchPostbackLogs}
                disabled={postbackLogState.loading}
              >
                {postbackLogState.loading ? t("Refreshing...") : t("Refresh")}
              </button>
            </div>

            {postbackLogState.error ? (
              <div className="api-status error">{postbackLogState.error}</div>
            ) : postbackLogs.length === 0 ? (
              <div className="empty-state">{t("No postback logs yet.")}</div>
            ) : (
              <div>
                <div className="table-wrap">
                  <table className="entries-table postback-table">
                    <thead>
                      <tr>
                        <th>{t("Time")}</th>
                        <th>{t("Event")}</th>
                        <th>{t("Media Buyer")}</th>
                        <th>{t("Domain")}</th>
                        <th>{t("Country")}</th>
                        <th>{t("External ID")}</th>
                        <th>{t("Source")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePostbackLogs.map((row) => (
                        <tr key={row.id}>
                          <td>{formatLogTime(row.created_at || row.date)}</td>
                          <td>
                            <span className={`postback-event ${String(row.event_type || "").toLowerCase()}`}>
                              {formatEventLabel(row.event_type)}
                            </span>
                          </td>
                          <td>{row.buyer || "—"}</td>
                          <td>{row.domain || "—"}</td>
                          <td>{row.country || "—"}</td>
                          <td className="mono">{row.external_id || "—"}</td>
                          <td>{row.source || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>
      ) : null}

      {apiTab === "sync" ? (
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head api-head">
            <div>
              <h3 className="panel-title">{t("Report Sync")}</h3>
              <p className="panel-subtitle">
                {t("Paste a Keitaro report payload and map fields into your statistics table.")}
              </p>
            </div>
          </div>

          <div className="api-subgrid">
            <div className="field">
              <label>{t("Sync Target")}</label>
              <Select
                value={syncTarget}
                onChange={(v) => setSyncTarget(v)}
                options={[
                  { value: "overall", label: t("Overall Stats") },
                  { value: "device", label: t("Device Stats") },
                  { value: "user_behavior", label: t("User Behavior") },
                ]}
                placeholder={t("Select")}
              />
              <p className="field-hint">{t("Choose where the report data should be stored.")}</p>
            </div>
            <div className="field field-inline">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(event) => setReplaceExisting(event.target.checked)}
                />
                {t("Replace existing entries for the same date + buyer + country")}
              </label>
            </div>
          </div>

          <div className="field">
            <label>{t("Report Payload (JSON)")}</label>
            <textarea
              className="code-input"
              value={payloadText}
              onChange={(event) => setPayloadText(event.target.value)}
            />
            <p className="field-hint">
              {t(
                "Tip: open a Keitaro report, copy the request payload from your browser network tab, and paste it here."
              )}
            </p>
          </div>

          <div className="api-section">
            <div className="api-section-head">
              <div>
                <h4 className="panel-mini">{t("Field Mapping")}</h4>
                <p className="panel-subtitle">
                  {t("Map Keitaro fields to dashboard columns.")}
                </p>
              </div>
              <button className="ghost" type="button" onClick={() => setShowMapping((prev) => !prev)}>
                {showMapping ? t("Hide Mapping") : t("Show Mapping")}
              </button>
            </div>
            {showMapping ? (
              <div className="mapping-grid">
                <div className="mapping-group">
                  <h5>{t("Identity Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Date Field")}</label>
                      <input value={mapping.dateField} onChange={handleMappingChange("dateField")} />
                    </div>
                    <div className="field">
                      <label>{t("Buyer Field")}</label>
                      <input value={mapping.buyerField} onChange={handleMappingChange("buyerField")} />
                    </div>
                    <div className="field">
                      <label>{t("Campaign Field")}</label>
                      <input
                        value={mapping.campaignField || ""}
                        onChange={handleMappingChange("campaignField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("External ID Field")}</label>
                      <input
                        value={mapping.externalIdField || ""}
                        onChange={handleMappingChange("externalIdField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Geo Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Country Field")}</label>
                      <input value={mapping.countryField} onChange={handleMappingChange("countryField")} />
                    </div>
                    <div className="field">
                      <label>{t("Region Field")}</label>
                      <input value={mapping.regionField || ""} onChange={handleMappingChange("regionField")} />
                    </div>
                    <div className="field">
                      <label>{t("City Field")}</label>
                      <input value={mapping.cityField || ""} onChange={handleMappingChange("cityField")} />
                    </div>
                    <div className="field">
                      <label>{t("Placement Field")}</label>
                      <input
                        value={mapping.placementField || ""}
                        onChange={handleMappingChange("placementField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Domain Field")}</label>
                      <input
                        value={mapping.domainField || ""}
                        onChange={handleMappingChange("domainField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Campaign Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Campaign Name Field")}</label>
                      <input
                        value={mapping.campaignNameField || ""}
                        onChange={handleMappingChange("campaignNameField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Adset Name Field")}</label>
                      <input
                        value={mapping.adsetNameField || ""}
                        onChange={handleMappingChange("adsetNameField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Ad Name Field")}</label>
                      <input
                        value={mapping.adNameField || ""}
                        onChange={handleMappingChange("adNameField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Performance Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Spend Field")}</label>
                      <input value={mapping.spendField} onChange={handleMappingChange("spendField")} />
                    </div>
                    <div className="field">
                      <label>{t("Revenue Field")}</label>
                      <input value={mapping.revenueField} onChange={handleMappingChange("revenueField")} />
                    </div>
                    <div className="field">
                      <label>{t("FTD Revenue Field")}</label>
                      <input
                        value={mapping.ftdRevenueField || ""}
                        onChange={handleMappingChange("ftdRevenueField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Redeposit Revenue Field")}</label>
                      <input
                        value={mapping.redepositRevenueField || ""}
                        onChange={handleMappingChange("redepositRevenueField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Event Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Clicks Field")}</label>
                      <input value={mapping.clicksField} onChange={handleMappingChange("clicksField")} />
                    </div>
                    <div className="field">
                      <label>{t("Installs Field")}</label>
                      <input value={mapping.installsField} onChange={handleMappingChange("installsField")} />
                    </div>
                    <div className="field">
                      <label>{t("Registers Field")}</label>
                      <input value={mapping.registersField} onChange={handleMappingChange("registersField")} />
                    </div>
                    <div className="field">
                      <label>{t("FTDs Field")}</label>
                      <input value={mapping.ftdsField} onChange={handleMappingChange("ftdsField")} />
                    </div>
                    <div className="field">
                      <label>{t("Redeposits Field")}</label>
                      <input value={mapping.redepositsField} onChange={handleMappingChange("redepositsField")} />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Device Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Device Field")}</label>
                      <input value={mapping.deviceField} onChange={handleMappingChange("deviceField")} />
                    </div>
                    <div className="field">
                      <label>{t("OS Field")}</label>
                      <input value={mapping.osField || ""} onChange={handleMappingChange("osField")} />
                    </div>
                    <div className="field">
                      <label>{t("OS Version Field")}</label>
                      <input
                        value={mapping.osVersionField || ""}
                        onChange={handleMappingChange("osVersionField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("OS Icon Field")}</label>
                      <input value={mapping.osIconField || ""} onChange={handleMappingChange("osIconField")} />
                    </div>
                    <div className="field">
                      <label>{t("Device Model Field")}</label>
                      <input
                        value={mapping.deviceModelField || ""}
                        onChange={handleMappingChange("deviceModelField")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="field-hint">{t("Mapping hidden. Click show to edit fields.")}</p>
            )}
          </div>

          <div className="api-actions">
            {syncState.message && (
              <div className={`api-status ${syncState.ok ? "success" : "error"}`}>
                {syncState.message}
                {syncResult?.inserted !== undefined && (
                  <span className="api-status-meta">
                    {t("Imported {inserted} rows, skipped {skipped} of {total}", {
                      inserted: syncResult.inserted,
                      skipped: syncResult.skipped,
                      total: syncResult.total,
                    })}
                    {syncResult.placementsExtracted !== undefined
                      ? ` · ${t("Placements extracted")}: ${syncResult.placementsExtracted}`
                      : ""}
                    {Array.isArray(syncResult.placementSamples) && syncResult.placementSamples.length
                      ? ` · ${t("Samples")}: ${syncResult.placementSamples.join(", ")}`
                      : ""}
                  </span>
                )}
              </div>
            )}
            <div className="api-actions-group">
              <button
                className="ghost"
                type="button"
                onClick={() => setPayloadText(defaultKeitaroPayloadByTarget[syncTarget] || defaultKeitaroPayload)}
              >
                {t("Load Example Payload")}
              </button>
            </div>
            <button className="action-pill" type="button" onClick={handleSync} disabled={syncState.loading}>
              {syncState.loading ? t("Syncing...") : t("Sync Now")}
            </button>
          </div>
        </motion.div>
      </section>
      ) : null}

      {apiTab === "campaigns" ? (
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Campaign Mapping")}</h3>
              <p className="panel-subtitle">
                {t("Map Keitaro campaign IDs to media buyers for install attribution.")}
              </p>
            </div>
          </div>

          <form className="form-grid api-grid" onSubmit={handleCampaignSubmit}>
            <div className="field">
              <label>{t("Keitaro Campaign ID")}</label>
              <input value={campaignForm.keitaroId} onChange={updateCampaignForm("keitaroId")} />
            </div>
            <div className="field">
              <label>{t("Campaign Name")}</label>
              <input value={campaignForm.name} onChange={updateCampaignForm("name")} required />
            </div>
            <div className="field">
              <label>{t("Media Buyer")}</label>
              <input value={campaignForm.buyer} onChange={updateCampaignForm("buyer")} required />
            </div>
            <div className="field">
              <label>{t("Country")}</label>
              <CountryDropdownPicker
                value={campaignForm.country}
                onChange={(country) => setCampaignForm((prev) => ({ ...prev, country }))}
                options={countryOptions}
                placeholder={t("All Countries")}
                allOption={{ value: "", label: t("All Countries") }}
                searchPlaceholder={t("Type to find countries")}
                emptyResultsLabel={t("No countries found.")}
              />
            </div>
            <div className="field">
              <label>{t("Domain")}</label>
              <input
                value={campaignForm.domain}
                onChange={updateCampaignForm("domain")}
                placeholder="landing.example.com"
              />
            </div>
            <div className="form-actions">
              <button className="action-pill" type="submit">
                {t("Add Campaign")}
              </button>
            </div>
          </form>

          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaigns…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">{t("No campaigns added yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table campaign-table">
                <thead>
                  <tr>
                    <th>{t("Campaign Name")}</th>
                    <th>{t("Keitaro Campaign ID")}</th>
                    <th>{t("Media Buyer")}</th>
                    <th>{t("Country")}</th>
                    <th>{t("Domain")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>{campaign.keitaro_id || "—"}</td>
                      <td>{campaign.buyer}</td>
                      <td>{campaign.country || "—"}</td>
                      <td>{campaign.domain || "—"}</td>
                      <td>
                        <button
                          className="icon-btn"
                          type="button"
                          onClick={() => handleCampaignDelete(campaign.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
      ) : null}
    </>
  );
}

function LoginScreen({ onLogin, loading, error }) {
  const { t } = useLanguage();
  const savedLogin = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("dash-remember") || "null");
    } catch (err) {
      return null;
    }
  }, []);
  const [form, setForm] = React.useState({
    username: savedLogin?.username || "",
    password: "",
  });
  const [rememberMe, setRememberMe] = React.useState(Boolean(savedLogin?.username));
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorDismissed, setErrorDismissed] = React.useState(false);
  const [errorNonce, setErrorNonce] = React.useState(0);
  const usernameRef = React.useRef(null);
  const passwordRef = React.useRef(null);

  React.useEffect(() => {
    if (savedLogin?.username) {
      passwordRef.current?.focus();
    } else {
      usernameRef.current?.focus();
    }
  }, [savedLogin]);

  React.useEffect(() => {
    setErrorDismissed(false);
    if (error) setErrorNonce((n) => n + 1);
  }, [error]);

  const visibleError = error && !errorDismissed ? error : null;

  const handleChange = (key) => (event) => {
    if (visibleError) setErrorDismissed(true);
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      if (rememberMe) {
        localStorage.setItem(
          "dash-remember",
          JSON.stringify({ username: form.username })
        );
      } else {
        localStorage.removeItem("dash-remember");
      }
    } catch (err) {
      // ignore storage errors
    }
    onLogin(form.username, form.password);
  };

  return (
    <div className="login-screen">
      <motion.div
        className="login-stack"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="login-logo"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <img src={logo} alt="Deus Affiliates" />
        </motion.div>
        <motion.div
          className="login-card login-card--single"
          key={errorNonce}
          animate={errorNonce ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.42 }}
        >
          <div className="login-right">
            <div className="login-right-header">
              <h3>{t("Sign In")}</h3>
              <span className="login-badge">{t("Secure access")}</span>
            </div>
            <p className="login-sub">{t("Sign in to continue")}</p>
            <form onSubmit={handleSubmit} className={loading ? "is-loading" : ""}>
              <div className="field login-field">
                <label>{t("Username")}</label>
                <div className="input-wrap">
                  <User size={16} />
                  <input
                    ref={usernameRef}
                    value={form.username}
                    onChange={handleChange("username")}
                    autoComplete="username"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className="field login-field">
                <label>{t("Password")}</label>
                <div className="input-wrap">
                  <Lock size={16} />
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    className="icon-btn ghost"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? t("Hide password") : t("Show password")}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={loading}
                />
                {t("Remember me")}
              </label>
              <AnimatePresence initial={false}>
                {visibleError ? (
                  <motion.div
                    key="login-error"
                    className="form-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                  >
                    {visibleError}
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <button className="action-pill" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner" aria-hidden="true" />
                    {t("Logging in...")}
                  </>
                ) : (
                  t("Sign In")
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = React.useState("home");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const initialFiltersRef = React.useRef(null);
  const [compareToPrev, setCompareToPrev] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [rolePermissions, setRolePermissions] = React.useState(null);
  const [authUser, setAuthUser] = React.useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("dash-auth") || "null");
      if (!stored?.token) return null;
      return stored;
    } catch (error) {
      return null;
    }
  });
  const [authState, setAuthState] = React.useState({ loading: false, error: null });
  const [language, setLanguage] = React.useState(() => {
    try {
      return localStorage.getItem("dash-language") || "EN";
    } catch (error) {
      return "EN";
    }
  });
  const [filters, setFilters] = React.useState(() => {
    const range = getDefaultDateRange();
    return {
      dateFrom: range.from,
      dateTo: range.to,
      country: "All",
      city: "",
      geoCity: "",
      geoDomain: "",
      geoPlacement: "",
      geoDevice: "",
      geoMinClicks: "",
      geoMinFtds: "",
      placementName: "",
      placementDomain: "",
      placementMinClicks: "",
      placementMinRegisters: "",
      placementMinFtds: "",
      placementRevenueOnly: false,
      userDomain: "All",
      userCampaign: "All",
      userExternalId: "",
      userMinRevenue: "",
      userMinFtds: "",
      userMinRedeposits: "",
      userRevenueOnly: false,
      approach: "All",
      buyer: "All",
      category: "All",
      billing: "All",
      status: "All",
    };
  });
  const [period, setPeriod] = React.useState("This Month");
  const [customRange, setCustomRange] = React.useState(() => {
    const range = getDefaultDateRange();
    return { from: range.from, to: range.to };
  });

  const isHome = activeView === "home";
  const isGeos = activeView === "geos";
  const isUtm = activeView === "utm";
  const isTracking = activeView === "tracking";
  const isFlows = activeView === "flows";
  const isStats = activeView === "statistics";
  const isCampaigns = activeView === "campaigns";
  const isPlacements = activeView === "placements";
  const isUserBehavior = activeView === "user_behavior";
  const isApi = activeView === "api";
  const isMetaToken = activeView === "meta_token";
  const isGoals = activeView === "streams";
  const isDomains = activeView === "domains";
  const isPixels = activeView === "pixels";
  const isAccounts = activeView === "accounts";
  const isRoles = activeView === "roles";
  const isDocs = activeView === "docs";
  const isDevices = activeView === "devices";
  const isProfile = activeView === "profile";
  const isLeadership = isLeadershipRole(authUser?.role);
  const canManageExpenses = isLeadershipRole(authUser?.role);
  const usesPerformanceFilters =
    isHome || isGeos || isStats || isCampaigns || isPlacements || isUserBehavior || isDevices;
  const showFilters = usesPerformanceFilters;
  const [viewerBuyer, setViewerBuyer] = React.useState("");
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = React.useState(0);
  const [notificationState, setNotificationState] = React.useState({ loading: false, error: null });
  const [notificationFilters, setNotificationFilters] = React.useState({
    severity: "all",
    unreadOnly: false,
    search: "",
  });
  const [notificationMeta, setNotificationMeta] = React.useState({
    hasMore: false,
    filteredTotal: 0,
  });

  React.useEffect(() => {
    const range = getPeriodDateRange(period, customRange);
    const normalized = normalizeDateRange(range.from, range.to);
    const nextFrom = normalized.from || "";
    const nextTo = normalized.to || "";
    setFilters((prev) => {
      if (prev.dateFrom === nextFrom && prev.dateTo === nextTo) return prev;
      return {
        ...prev,
        dateFrom: nextFrom,
        dateTo: nextTo,
      };
    });
  }, [period, customRange.from, customRange.to]);

  React.useEffect(() => {
    if (!authUser) return;
    if (isLeadership) {
      setViewerBuyer("");
      return;
    }
    const fallback = authUser?.username || "";
    setViewerBuyer(fallback);
    const fetchBuyer = async () => {
      try {
        const response = await apiFetch("/api/media-buyers?limit=1");
        if (!response.ok) return;
        const data = await response.json();
        const record = Array.isArray(data) ? data[0] : null;
        if (record?.name) {
          setViewerBuyer(record.name);
        }
      } catch (error) {
        // ignore
      }
    };
    fetchBuyer();
  }, [authUser, isLeadership]);

  const effectiveViewerBuyer = viewerBuyer || authUser?.username || "";

  React.useEffect(() => {
    if (!authUser) return;
    if (isLeadership) {
      setFilters((prev) => (prev.buyer === "All" ? prev : { ...prev, buyer: "All" }));
      return;
    }
    if (!effectiveViewerBuyer) return;
    setFilters((prev) =>
      prev.buyer === effectiveViewerBuyer ? prev : { ...prev, buyer: effectiveViewerBuyer }
    );
  }, [authUser, effectiveViewerBuyer, isLeadership]);

  const viewPermissionMap = React.useMemo(
    () => ({
      home: "dashboard",
      geos: "geos",
      streams: "goals",
      utm: "utm",
      tracking: "tracking_links",
      flows: "tracking_links",
      statistics: "statistics",
      campaigns: "campaigns",
      placements: "placements",
      user_behavior: "user_behavior",
      devices: "devices",
      domains: "domains",
      pixels: "pixels",
      accounts: "accounts",
      meta_token: "meta_token",
      roles: "roles",
      api: "api",
    }),
    []
  );

  React.useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    const loadPermissions = async () => {
      try {
        const response = await apiFetch("/api/roles?limit=200");
        if (!response.ok) return;
        const data = await response.json();
        const role = data.find((item) => item.name === authUser.role);
        if (!cancelled) {
          setRolePermissions(role?.permissions || []);
        }
      } catch (error) {
        if (!cancelled) {
          setRolePermissions([]);
        }
      }
    };
    loadPermissions();
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  React.useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    const loadFxRate = async () => {
      try {
        const response = await apiFetch("/api/fx");
        if (!response.ok) return;
        const data = await response.json();
        const rate = Number(data?.rate);
        if (!cancelled && Number.isFinite(rate) && rate > 0) {
          setActiveFxRate(rate);
        }
      } catch (error) {
        if (!cancelled) {
          setActiveFxRate(1);
        }
      }
    };
    loadFxRate();
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  const allowedPermissions = React.useMemo(() => {
    // Leadership (Boss, Team Leader) always have full access to every section,
    // regardless of the permission list stored on their role.
    if (isLeadershipRole(authUser?.role)) {
      return permissionOptions.map((perm) => perm.key);
    }
    const basePermissions = rolePermissions?.length
      ? rolePermissions
      : permissionOptions.map((perm) => perm.key);
    const list = Array.isArray(basePermissions) ? [...basePermissions] : [];
    const normalizedRole = String(authUser?.role || "").toLowerCase();
    const isBuyerRole = normalizedRole.includes("buyer");
    if (list.includes("utm") && !list.includes("tracking_links")) {
      list.push("tracking_links");
    }
    if (list.includes("statistics") && !list.includes("placements")) {
      list.push("placements");
    }
    if (list.includes("statistics") && !list.includes("campaigns")) {
      list.push("campaigns");
    }
    if (list.includes("statistics") && !list.includes("user_behavior")) {
      list.push("user_behavior");
    }
    if (list.includes("api") && !list.includes("meta_token")) {
      list.push("meta_token");
    }
    if (
      (isLeadershipRole(authUser?.role)) &&
      !list.includes("accounts")
    ) {
      list.push("accounts");
    }
    if (
      (list.includes("domains") || list.includes("pixels") || list.includes("meta_token")) &&
      !list.includes("accounts")
    ) {
      list.push("accounts");
    }
    if (isBuyerRole && !list.includes("accounts")) {
      list.push("accounts");
    }
    return Array.from(new Set(list));
  }, [rolePermissions, authUser?.role]);

  const allowedNavItems = navItems.filter((item) => {
    const perm = viewPermissionMap[item.key];
    if (!perm) return true;
    return allowedPermissions.includes(perm);
  });
  const navItemMap = React.useMemo(
    () => Object.fromEntries(navItems.map((item) => [item.key, item])),
    []
  );
  const navSectionsToRender = React.useMemo(() => {
    const allowedKeys = new Set(allowedNavItems.map((item) => item.key));
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((key) => allowedKeys.has(key)),
      }))
      .filter((section) => section.items.length > 0);
  }, [allowedNavItems]);

  React.useEffect(() => {
    if (!authUser) return;
    const allowedViews = allowedNavItems.map((item) => item.key).concat(["profile", "docs"]);
    if (allowedViews.length && !allowedViews.includes(activeView)) {
      setActiveView(allowedViews[0]);
    }
  }, [allowedNavItems, activeView, authUser]);

  const t = React.useMemo(() => makeT(language), [language]);

  const formatNotificationTime = React.useCallback((value) => {
    if (!value) return "just now";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "just now";
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000));
    if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
    if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
    if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
    return `${Math.floor(elapsedSeconds / 86400)}d ago`;
  }, []);

  const fetchNotifications = React.useCallback(
    async ({ silent = false, append = false, offset = 0, filtersOverride = null } = {}) => {
      if (!authUser || !isLeadership) {
        setNotifications([]);
        setNotificationUnreadCount(0);
        setNotificationMeta({ hasMore: false, filteredTotal: 0 });
        setNotificationState({ loading: false, error: null });
        return;
      }
      try {
        if (!silent && !append) {
          setNotificationState({ loading: true, error: null });
        }
        const activeFilters = filtersOverride || notificationFilters;
        const query = new URLSearchParams();
        query.set("limit", "80");
        const safeOffset = Number.isFinite(Number(offset)) ? Math.max(Number(offset), 0) : 0;
        if (safeOffset > 0) query.set("offset", String(safeOffset));
        if (activeFilters.unreadOnly) query.set("unread", "1");
        if (activeFilters.severity && activeFilters.severity !== "all") {
          query.set("severity", activeFilters.severity);
        }
        const search = String(activeFilters.search || "").trim();
        if (search) query.set("q", search);
        const response = await apiFetch(`/api/notifications?${query.toString()}`);
        if (response.status === 404) {
          setNotifications([]);
          setNotificationUnreadCount(0);
          setNotificationMeta({ hasMore: false, filteredTotal: 0 });
          setNotificationState({ loading: false, error: "Notifications endpoint is not available yet." });
          return;
        }
        if (!response.ok) {
          const detail = await response.json().catch(() => null);
          throw new Error(detail?.error || "Failed to load notifications.");
        }
        const data = await response.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        const unreadCountRaw = Number(data?.unreadCount);
        const unreadCount = Number.isFinite(unreadCountRaw)
          ? unreadCountRaw
          : items.filter((item) => Boolean(item?.unread)).length;
        const hasMore = Boolean(data?.hasMore);
        const filteredTotalRaw = Number(data?.filteredTotal);
        const filteredTotal = Number.isFinite(filteredTotalRaw) ? filteredTotalRaw : items.length;
        if (append) {
          setNotifications((prev) => {
            const merged = new Map(prev.map((item) => [item.id, item]));
            items.forEach((item) => merged.set(item.id, item));
            return Array.from(merged.values());
          });
        } else {
          setNotifications(items);
        }
        setNotificationUnreadCount(unreadCount);
        setNotificationMeta({ hasMore, filteredTotal });
        setNotificationState({ loading: false, error: null });
      } catch (error) {
        if (silent) {
          setNotificationState((prev) => ({
            ...prev,
            error: prev.error || error.message || "Failed to load notifications.",
          }));
        } else {
          setNotificationState({ loading: false, error: error.message || "Failed to load notifications." });
        }
      }
    },
    [authUser, isLeadership, notificationFilters]
  );

  const handleNotificationFilterChange = React.useCallback((key, value) => {
    setNotificationFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNotificationRead = React.useCallback(async (id) => {
    if (!id || !isLeadership) return;
    try {
      const response = await apiFetch(
        `/api/notifications/${id}/read`,
        { method: "PATCH" }
      );
      if (response.status === 404) {
        setNotificationState({ loading: false, error: "Notifications endpoint is not available yet." });
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to update notification.");
      }
      await fetchNotifications({ silent: true });
    } catch (error) {
      fetchNotifications({ silent: true });
    }
  }, [fetchNotifications, isLeadership]);

  const handleNotificationUnread = React.useCallback(async (id) => {
    if (!id || !isLeadership) return;
    try {
      const response = await apiFetch(
        `/api/notifications/${id}/unread`,
        { method: "PATCH" }
      );
      if (response.status === 404) {
        setNotificationState({ loading: false, error: "Notifications endpoint is not available yet." });
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to update notification.");
      }
      await fetchNotifications({ silent: true });
    } catch (error) {
      fetchNotifications({ silent: true });
    }
  }, [fetchNotifications, isLeadership]);

  const [pendingDelete, setPendingDelete] = React.useState(null);
  const pendingDeleteRef = React.useRef(null);
  React.useEffect(() => {
    pendingDeleteRef.current = pendingDelete;
  }, [pendingDelete]);

  const finalizeDelete = React.useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await apiFetch(
        `/api/notifications/${id}`,
        { method: "DELETE" }
      );
      if (response.status === 404) {
        setNotificationState({ loading: false, error: "Notifications endpoint is not available yet." });
        return;
      }
      if (!response.ok) throw new Error("Failed to delete notification.");
    } catch (error) {
      fetchNotifications({ silent: true });
    }
  }, [fetchNotifications]);

  const handleNotificationDelete = React.useCallback((id) => {
    if (!id || !isLeadership) return;
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    // Flush any previous pending delete immediately
    const prev = pendingDeleteRef.current;
    if (prev) {
      clearTimeout(prev.timeoutId);
      finalizeDelete(prev.id);
    }
    // Optimistically remove from list
    setNotifications((curr) => curr.filter((n) => n.id !== id));
    if (item.unread) {
      setNotificationUnreadCount((c) => Math.max(0, c - 1));
    }
    const timeoutId = setTimeout(() => {
      finalizeDelete(id);
      setPendingDelete(null);
    }, 5000);
    setPendingDelete({ id, item, timeoutId });
  }, [isLeadership, notifications, finalizeDelete]);

  const handleUndoDelete = React.useCallback(() => {
    const current = pendingDeleteRef.current;
    if (!current) return;
    clearTimeout(current.timeoutId);
    setNotifications((curr) => [current.item, ...curr]);
    if (current.item.unread) {
      setNotificationUnreadCount((c) => c + 1);
    }
    setPendingDelete(null);
  }, []);

  const handleNotificationsReadAll = React.useCallback(async () => {
    if (!isLeadership || notificationUnreadCount <= 0) return;
    try {
      const query = new URLSearchParams();
      query.set("limit", "300");
      if (notificationFilters.unreadOnly) query.set("unread", "1");
      if (notificationFilters.severity && notificationFilters.severity !== "all") {
        query.set("severity", notificationFilters.severity);
      }
      const search = String(notificationFilters.search || "").trim();
      if (search) query.set("q", search);
      const response = await apiFetch(
        `/api/notifications/read-all?${query.toString()}`,
        { method: "PATCH" }
      );
      if (response.status === 404) {
        setNotificationState({ loading: false, error: "Notifications endpoint is not available yet." });
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to mark notifications as read.");
      }
      await fetchNotifications({ silent: true });
    } catch (error) {
      fetchNotifications({ silent: true });
    }
  }, [fetchNotifications, isLeadership, notificationUnreadCount, notificationFilters]);

  const handleNotificationLoadMore = React.useCallback(() => {
    if (!notificationMeta.hasMore || notificationState.loading) return;
    fetchNotifications({ silent: true, append: true, offset: notifications.length });
  }, [fetchNotifications, notificationMeta.hasMore, notificationState.loading, notifications.length]);

  React.useEffect(() => {
    try {
      localStorage.setItem("dash-language", language);
    } catch (error) {
      // ignore storage issues
    }
  }, [language]);

  React.useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem("dash-auth", JSON.stringify(authUser));
      } else {
        localStorage.removeItem("dash-auth");
      }
    } catch (error) {
      // ignore storage issues
    }
  }, [authUser]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleInvalid = () => {
      setAuthUser(null);
      setAuthState({ loading: false, error: t("Session expired. Please sign in again.") });
    };
    window.addEventListener("auth:invalid", handleInvalid);
    return () => window.removeEventListener("auth:invalid", handleInvalid);
  }, [t]);

  React.useEffect(() => {
    if (authUser && !authUser.token) {
      setAuthUser(null);
    }
  }, [authUser]);

  React.useEffect(() => {
    if (!authUser || !isLeadership) {
      setNotifications([]);
      setNotificationUnreadCount(0);
      setNotificationMeta({ hasMore: false, filteredTotal: 0 });
      setNotificationsOpen(false);
      return;
    }
    fetchNotifications();
    const timer = setInterval(() => {
      fetchNotifications({ silent: true });
    }, 20000);
    return () => clearInterval(timer);
  }, [authUser, isLeadership, fetchNotifications]);

  const handleLogin = async (username, password) => {
    setAuthState({ loading: true, error: null });
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Invalid credentials.");
      }
      const nextAuth = { ...data.user, token: data.token };
      try {
        localStorage.setItem("dash-auth", JSON.stringify(nextAuth));
      } catch (error) {
        // ignore storage issues
      }
      setAuthUser(nextAuth);
      setAuthState({ loading: false, error: null });
    } catch (error) {
      const message = error.message || "Invalid credentials.";
      setAuthState({ loading: false, error: t(message) });
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("dash-auth");
    } catch (error) {
      // ignore storage issues
    }
    setAuthUser(null);
  };

  React.useEffect(() => {
    if (!filtersOpen) return;
    const handleKey = (event) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  React.useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClick = (event) => {
      if (!event.target.closest(".profile-menu-wrap")) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [profileMenuOpen]);

  React.useEffect(() => {
    if (!notificationsOpen) return;
    const handleClick = (event) => {
      if (!event.target.closest(".notifications-wrap")) {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [notificationsOpen]);

  React.useEffect(() => {
    if (filtersOpen) {
      initialFiltersRef.current = JSON.stringify(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersOpen]);

  React.useEffect(() => {
    if (!filtersOpen) return;
    const handler = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setFiltersOpen(false);
      } else if (event.key === "Enter") {
        const tag = event.target?.tagName;
        if (tag === "TEXTAREA" || tag === "SELECT") return;
        event.preventDefault();
        setFiltersOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtersOpen]);

  const filtersDirty = filtersOpen && initialFiltersRef.current !== null && initialFiltersRef.current !== JSON.stringify(filters);

  // Global Cmd+K / Ctrl+K to open the command palette
  React.useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (event.key === "Escape" && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [paletteOpen]);

  const updateFilter = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFilters((prev) => {
      if (key === "dateFrom" || key === "dateTo") {
        const next = { ...prev, [key]: value };
        const normalized = normalizeDateRange(next.dateFrom, next.dateTo);
        return {
          ...next,
          dateFrom: normalized.from || "",
          dateTo: normalized.to || "",
        };
      }
      return { ...prev, [key]: value };
    });
    if (key === "dateFrom" || key === "dateTo") {
      setCustomRange((prev) => {
        const nextRange = {
          ...prev,
          [key === "dateFrom" ? "from" : "to"]: value,
        };
        return normalizeDateRange(nextRange.from, nextRange.to);
      });
      setPeriod("Custom range");
    }
  };

  const handleCustomRange = (key, value) => {
    setCustomRange((prev) => {
      const nextRange = { ...prev, [key]: value };
      return normalizeDateRange(nextRange.from, nextRange.to);
    });
  };

  if (!authUser) {
    return (
      <LanguageContext.Provider value={{ language, t }}>
        <LoginScreen onLogin={handleLogin} loading={authState.loading} error={authState.error} />
      </LanguageContext.Provider>
    );
  }

  const profileName = authUser?.username || "DeusInsta";
  const profileRole = authUser?.role || "Media Buyer";
  const profileInitials = profileName.slice(0, 2).toUpperCase();

  return (
    <LanguageContext.Provider value={{ language, t }}>
      <ConfirmHost />
      <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src={logo} alt="Deus Affiliates" />
        </div>

        <div className="sidebar-section">
          <p className="section-title">{t("Logged as {role}", { role: t(profileRole) })}</p>
          <button className="team-pill" type="button">
            <span className="team-pill-icon" aria-hidden="true">
              <Trophy size={14} />
            </span>
            <span className="team-pill-content">
              <span className="team-pill-name">{profileName}</span>
            </span>
          </button>
        </div>

        <nav className="nav">
          {navSectionsToRender.map((section) => (
            <div className="nav-group" key={section.title}>
              <div className="nav-section-title">{t(section.title)}</div>
              {section.items.map((key) => {
                const item = navItemMap[key];
                if (!item) return null;
                const Icon = item.icon;
                const isActive =
                  !item.href && (activeView === item.key || (activeView === "home" && item.key === "home"));
                const isExternal = Boolean(item.href);
                return (
                  <a
                    key={item.label}
                    className={`nav-item${isActive ? " active" : ""}`}
                    href={item.href || "#"}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    onClick={(event) => {
                      if (isExternal) return;
                      event.preventDefault();
                      setActiveView(item.key);
                    }}
                  >
                    <Icon size={18} />
                    {t(item.label)}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className={`action-pill sidebar-docs${isDocs ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveView("docs")}
          >
            <BookOpen size={16} />
            {t("Documentation")}
          </button>
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          {showFilters ? (
            (() => {
              let activeCount = 0;
              if (filters.country && filters.country !== "All") activeCount++;
              if (filters.buyer && filters.buyer !== "All" && isLeadership) activeCount++;
              if (filters.city) activeCount++;
              if (filters.category && filters.category !== "All") activeCount++;
              if (filters.billing && filters.billing !== "All") activeCount++;
              if (filters.status && filters.status !== "All") activeCount++;
              if (filters.approach && filters.approach !== "All") activeCount++;
              return (
                <button
                  className={`action-pill filters-trigger${activeCount > 0 ? " has-active" : ""}`}
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersHorizontal size={18} />
                  {t("Filters")}
                  {activeCount > 0 ? (
                    <span className="filters-trigger-count">{activeCount}</span>
                  ) : null}
                </button>
              );
            })()
          ) : (
            <div />
          )}

          <div className="topbar-actions">
            {isLeadership ? (
              <div className="notifications-wrap">
                <button
                  className={`notification-btn${notificationsOpen ? " is-open" : ""}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setNotificationsOpen((prev) => {
                      const next = !prev;
                      if (next) {
                        fetchNotifications();
                      }
                      return next;
                    });
                    setProfileMenuOpen(false);
                  }}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {notificationUnreadCount > 0 ? (
                    <span className="notification-count">{notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}</span>
                  ) : null}
                </button>
                <AnimatePresence>
                {notificationsOpen ? (
                  <motion.div
                    className="notifications-menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="notifications-head">
                      <strong>Notifications</strong>
                      <button
                        className="notifications-mark-all"
                        type="button"
                        onClick={handleNotificationsReadAll}
                        disabled={notificationUnreadCount <= 0}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="notifications-subhead">
                      <button
                        type="button"
                        className="notifications-refresh-link"
                        onClick={() => fetchNotifications()}
                        disabled={notificationState.loading}
                      >
                        <RotateCcw size={11} className={notificationState.loading ? "is-spinning" : ""} />
                        <span>{notificationState.loading ? "Refreshing…" : "Refresh"}</span>
                      </button>
                    </div>
                    <div className="notifications-controls">
                      <input
                        className="notifications-search"
                        type="text"
                        value={notificationFilters.search}
                        onChange={(event) =>
                          handleNotificationFilterChange("search", event.target.value)
                        }
                        placeholder="Search notifications"
                      />
                      <div className="notifications-control-row">
                        <div className="notifications-sev-tabs" role="tablist" aria-label="Severity filter">
                          {[
                            { v: "all", label: "All" },
                            { v: "info", label: "Info" },
                            { v: "warning", label: "Warning" },
                            { v: "critical", label: "Critical" },
                          ].map((opt) => (
                            <button
                              key={opt.v}
                              type="button"
                              role="tab"
                              aria-selected={notificationFilters.severity === opt.v}
                              className={`notifications-sev-tab sev-${opt.v}${notificationFilters.severity === opt.v ? " is-active" : ""}`}
                              onClick={() => handleNotificationFilterChange("severity", opt.v)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          className={`notifications-unread-toggle${notificationFilters.unreadOnly ? " is-on" : ""}`}
                          onClick={() =>
                            handleNotificationFilterChange("unreadOnly", !notificationFilters.unreadOnly)
                          }
                          aria-pressed={notificationFilters.unreadOnly}
                        >
                          <span className="notifications-unread-toggle-track">
                            <span className="notifications-unread-toggle-thumb" />
                          </span>
                          <span>Unread only</span>
                        </button>
                      </div>
                    </div>
                    {pendingDelete ? (
                      <div className="notifications-undo">
                        <span>Notification deleted</span>
                        <button type="button" className="notifications-undo-btn" onClick={handleUndoDelete}>
                          Undo
                        </button>
                      </div>
                    ) : null}
                    {notificationState.error ? (
                      <div className="notifications-empty notifications-error">
                        <span className="notifications-empty-icon" aria-hidden="true">!</span>
                        <div className="notifications-empty-text">
                          <strong>Couldn't load notifications</strong>
                          <span>{notificationState.error}</span>
                        </div>
                      </div>
                    ) : notificationState.loading && notifications.length === 0 ? (
                      <div className="notifications-empty">
                        <span className="login-spinner" aria-hidden="true" />
                        <span>Loading notifications…</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      (() => {
                        const hasFilters =
                          (notificationFilters.search || "").trim().length > 0 ||
                          notificationFilters.severity !== "all" ||
                          notificationFilters.unreadOnly;
                        return hasFilters ? (
                          <div className="notifications-empty">
                            <Bell size={20} className="notifications-empty-bell" />
                            <div className="notifications-empty-text">
                              <strong>No matches</strong>
                              <span>Try clearing filters or another search term.</span>
                            </div>
                            <button
                              type="button"
                              className="notifications-clear-filters"
                              onClick={() => {
                                handleNotificationFilterChange("search", "");
                                handleNotificationFilterChange("severity", "all");
                                handleNotificationFilterChange("unreadOnly", false);
                              }}
                            >
                              Clear
                            </button>
                          </div>
                        ) : (
                          <div className="notifications-empty">
                            <Bell size={20} className="notifications-empty-bell" />
                            <span>You're all caught up.</span>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="notifications-list">
                        {(() => {
                          const dayMs = 86400000;
                          const now = Date.now();
                          const bucketOrder = ["Today", "Yesterday", "This week", "Earlier", "Older"];
                          const grouped = {};
                          notifications.forEach((n) => {
                            const t = new Date(n.created_at).getTime();
                            const diff = now - t;
                            let key = "Older";
                            if (diff < dayMs) key = "Today";
                            else if (diff < 2 * dayMs) key = "Yesterday";
                            else if (diff < 7 * dayMs) key = "This week";
                            else if (diff < 30 * dayMs) key = "Earlier";
                            (grouped[key] ||= []).push(n);
                          });
                          const renderCard = (item) => {
                            const severity = item.severity || "info";
                            return (
                            <div
                              key={`notification-${item.id}`}
                              className={`notif-card severity-${severity}${item.unread ? " is-unread" : ""}`}
                              onClick={() => {
                                if (item.unread) handleNotificationRead(item.id);
                              }}
                            >
                              <span className="notif-card-title">
                                {item.title || "Notification"}
                              </span>
                              <span className="notif-card-time">
                                {formatNotificationTime(item.created_at)}
                              </span>
                              {item.message ? (
                                <p className="notif-card-msg">{item.message}</p>
                              ) : null}
                              <div className="notif-card-foot">
                                <span className="notif-card-meta">
                                  {item.actor_name ? item.actor_name : "System"}
                                </span>
                                <div className="notif-card-actions">
                                  {item.unread ? (
                                    <button
                                      className="notif-card-btn"
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleNotificationRead(item.id); }}
                                    >
                                      Mark read
                                    </button>
                                  ) : (
                                    <button
                                      className="notif-card-btn"
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleNotificationUnread(item.id); }}
                                    >
                                      Mark unread
                                    </button>
                                  )}
                                  <button
                                    className="notif-card-btn is-danger"
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleNotificationDelete(item.id); }}
                                    aria-label="Delete"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            );
                          };
                          const blocks = [];
                          bucketOrder.forEach((label) => {
                            const items = grouped[label];
                            if (!items?.length) return;
                            blocks.push(
                              <div className="notif-group-header" key={`grp-${label}`}>
                                <span>{label}</span>
                                <span className="notif-group-count">{items.length}</span>
                              </div>
                            );
                            items.forEach((item) => blocks.push(renderCard(item)));
                          });
                          return blocks;
                        })()}
                        {notificationMeta.hasMore && !notificationState.error ? (
                          <button
                            className="notifications-load-more"
                            type="button"
                            onClick={handleNotificationLoadMore}
                            disabled={notificationState.loading}
                          >
                            {notificationState.loading ? "Loading…" : "Load more"}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </motion.div>
                ) : null}
                </AnimatePresence>
              </div>
            ) : null}
            <div className="profile-menu-wrap">
              <button
                className={`profile profile-clickable${isProfile ? " is-active" : ""}`}
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              >
                <span className="avatar">{profileInitials}</span>
                <div>
                  <div className="profile-role">{t(profileRole)}</div>
                  <div className="profile-name">{profileName}</div>
                </div>
              </button>
              {profileMenuOpen ? (
                <div className="profile-menu">
                  <button
                    className="profile-menu-item"
                    type="button"
                    onClick={() => {
                      setActiveView("profile");
                      setProfileMenuOpen(false);
                    }}
                  >
                    {t("Profile")}
                  </button>
                  <button
                    className="profile-menu-item"
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    {t("Logout")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeView}
            className="view-anim"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
        {isUtm ? (
          <UtmBuilder />
        ) : isTracking ? (
          <TrackingLinksDashboard authUser={authUser} />
        ) : isFlows ? (
          <MyFlowsDashboard authUser={authUser} />
        ) : isGoals ? (
          <GoalsDashboard authUser={authUser} />
        ) : isDomains ? (
          <DomainsDashboard authUser={authUser} />
        ) : isPixels ? (
          <PixelsDashboard authUser={authUser} />
        ) : isAccounts ? (
          <AccountsDashboard authUser={authUser} />
        ) : isProfile ? (
          <ProfileDashboard authUser={authUser} />
        ) : isRoles ? (
          <RolesDashboard authUser={authUser} />
        ) : isGeos ? (
          <GeosDashboard
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isMetaToken ? (
          <MetaTokenDashboard authUser={authUser} />
        ) : isApi ? (
          <KeitaroApiView />
        ) : isStats ? (
          <StatisticsDashboard
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
            filters={filters}
          />
        ) : isCampaigns ? (
          <CampaignsDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isPlacements ? (
          <PlacementsDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isUserBehavior ? (
          <UserBehaviorDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isDevices ? (
          <DevicesDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isDocs ? (
          <React.Suspense fallback={<div className="empty-state"><span className="login-spinner" aria-hidden="true" /><span>Loading…</span></div>}>
            <DocumentationDashboard t={t} />
          </React.Suspense>
        ) : (
          <HomeDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            onSeeGeos={() => setActiveView("geos")}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      <React.Suspense fallback={null}>
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          commands={(() => {
            const commands = [];
            // Navigation commands — every sidebar item is a jump target
            allowedNavItems.forEach((item) => {
              if (item.href) return; // external links skipped
              commands.push({
                id: `nav-${item.key}`,
                label: `Go to ${t(item.label)}`,
                section: "Navigation",
                icon: item.icon,
                keywords: [item.key, item.label.toLowerCase()],
                run: () => setActiveView(item.key),
              });
            });
            // Quick actions
            if (showFilters) {
              commands.push({
                id: "open-filters",
                label: t("Open filters"),
                section: "Actions",
                icon: SlidersHorizontal,
                hint: "F",
                keywords: ["filter", "refine"],
                run: () => setFiltersOpen(true),
              });
            }
            commands.push({
              id: "refresh-data",
              label: t("Refresh data"),
              section: "Actions",
              icon: RotateCcw,
              keywords: ["reload", "sync"],
              run: () => {
                window.dispatchEvent(new CustomEvent("keitaro:sync"));
              },
            });
            commands.push({
              id: "logout",
              label: t("Logout"),
              section: "Account",
              icon: Lock,
              keywords: ["sign out", "exit"],
              run: handleLogout,
            });
            return commands;
          })()}
        />
      </React.Suspense>

      <AnimatePresence>
        {filtersOpen && showFilters && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              className="modal dashboard-filters-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="filters-title"
            >
              <div className="modal-head">
                <h2 id="filters-title">
                  {isGeos ? "Refine geos" : "Refine performance"}
                </h2>
                <button className="icon-btn" type="button" onClick={() => setFiltersOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-section-label">
                  <Clock size={11} />
                  <span>Time</span>
                </div>
                <div className="field field-wide">
                  <label>Date</label>
                  {(() => {
                    const fmt = (d) => {
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, "0");
                      const day = String(d.getDate()).padStart(2, "0");
                      return `${y}-${m}-${day}`;
                    };
                    const applyRange = (from, to) => {
                      setFilters((prev) => ({ ...prev, dateFrom: fmt(from), dateTo: fmt(to) }));
                    };
                    const today = new Date();
                    const presets = [
                      { label: "Today", action: () => applyRange(today, today) },
                      { label: "Yesterday", action: () => {
                        const y = new Date(today); y.setDate(y.getDate() - 1);
                        applyRange(y, y);
                      }},
                      { label: "7d", action: () => {
                        const start = new Date(today); start.setDate(start.getDate() - 6);
                        applyRange(start, today);
                      }},
                      { label: "30d", action: () => {
                        const start = new Date(today); start.setDate(start.getDate() - 29);
                        applyRange(start, today);
                      }},
                      { label: "This month", action: () => {
                        const start = new Date(today.getFullYear(), today.getMonth(), 1);
                        applyRange(start, today);
                      }},
                    ];
                    const isActivePreset = (label) => {
                      const f = filters.dateFrom; const t = filters.dateTo;
                      if (!f || !t) return false;
                      const eq = (a, b) => fmt(a) === b;
                      if (label === "Today") return eq(today, f) && eq(today, t);
                      if (label === "Yesterday") {
                        const y = new Date(today); y.setDate(y.getDate() - 1);
                        return eq(y, f) && eq(y, t);
                      }
                      if (label === "7d") {
                        const s = new Date(today); s.setDate(s.getDate() - 6);
                        return eq(s, f) && eq(today, t);
                      }
                      if (label === "30d") {
                        const s = new Date(today); s.setDate(s.getDate() - 29);
                        return eq(s, f) && eq(today, t);
                      }
                      if (label === "This month") {
                        const s = new Date(today.getFullYear(), today.getMonth(), 1);
                        return eq(s, f) && eq(today, t);
                      }
                      return false;
                    };
                    return (
                      <div className="date-presets">
                        {presets.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            className={`date-preset${isActivePreset(p.label) ? " is-active" : ""}`}
                            onClick={p.action}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="field-row">
                    <DeusDatePicker
                      value={filters.dateFrom}
                      onChange={(v) => setFilters((prev) => ({ ...prev, dateFrom: v }))}
                      placeholder="Start date"
                    />
                    <span className="field-sep">to</span>
                    <DeusDatePicker
                      value={filters.dateTo}
                      onChange={(v) => setFilters((prev) => ({ ...prev, dateTo: v }))}
                      placeholder="End date"
                    />
                  </div>
                  {(() => {
                    if (!filters.dateFrom || !filters.dateTo) return null;
                    const from = new Date(filters.dateFrom);
                    const to = new Date(filters.dateTo);
                    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
                    const days = Math.round((to - from) / 86400000) + 1;
                    const fmt = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: from.getFullYear() !== to.getFullYear() ? "numeric" : undefined });
                    return (
                      <div className="date-summary">
                        <strong>{days} {days === 1 ? "day" : "days"}</strong>
                        <span>·</span>
                        <span>{fmt(from)} → {fmt(to)}</span>
                      </div>
                    );
                  })()}
                  <button
                    type="button"
                    className={`compare-row${compareToPrev ? " is-on" : ""}`}
                    onClick={() => setCompareToPrev((v) => !v)}
                    aria-pressed={compareToPrev}
                  >
                    <span className="compare-toggle-track">
                      <span className="compare-toggle-thumb" />
                    </span>
                    <span className="compare-toggle-text">
                      Compare to previous period
                    </span>
                    {compareToPrev && filters.dateFrom && filters.dateTo ? (() => {
                      const from = new Date(filters.dateFrom);
                      const to = new Date(filters.dateTo);
                      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
                      const days = Math.round((to - from) / 86400000) + 1;
                      const prevTo = new Date(from); prevTo.setDate(prevTo.getDate() - 1);
                      const prevFrom = new Date(prevTo); prevFrom.setDate(prevFrom.getDate() - (days - 1));
                      const fmt = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                      const sameDay = fmt(prevFrom) === fmt(prevTo);
                      return (
                        <span className="compare-preview-pill">
                          <ArrowRight size={11} />
                          <span className="compare-preview-range">
                            {sameDay ? fmt(prevFrom) : `${fmt(prevFrom)} — ${fmt(prevTo)}`}
                          </span>
                          <span className="compare-preview-dot">·</span>
                          <span className="compare-preview-days">{days} {days === 1 ? "day" : "days"}</span>
                        </span>
                      );
                    })() : null}
                  </button>
                </div>

                <div className="modal-section-label">
                  <Users size={11} />
                  <span>Audience</span>
                </div>

                <div className={`field${filters.country && filters.country !== "All" ? " is-active" : ""}`}>
                  <div className="field-label-row">
                    <label>Country</label>
                    {filters.country && filters.country !== "All" ? (
                      <button
                        type="button"
                        className="field-clear"
                        onClick={() => setFilters((prev) => ({ ...prev, country: "All" }))}
                        aria-label="Clear country"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                  <CountryDropdownPicker
                    value={filters.country}
                    onChange={(country) => setFilters((prev) => ({ ...prev, country }))}
                    options={countryOptions}
                    placeholder="All"
                    allOption={{ value: "All", label: "All" }}
                    searchPlaceholder="Type to find countries"
                    emptyResultsLabel="No countries found."
                  />
                </div>

                {usesPerformanceFilters ? (
                  <>
                    {(isHome || isGeos || isPlacements || isUserBehavior) && isLeadership ? (
                      <div className={`field${filters.buyer && filters.buyer !== "All" ? " is-active" : ""}`}>
                        <div className="field-label-row">
                          <label>Buyer</label>
                          {filters.buyer && filters.buyer !== "All" ? (
                            <button
                              type="button"
                              className="field-clear"
                              onClick={() => setFilters((prev) => ({ ...prev, buyer: "All" }))}
                              aria-label="Clear buyer"
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                        <CountryDropdownPicker
                          value={filters.buyer || "All"}
                          onChange={(buyer) => setFilters((prev) => ({ ...prev, buyer }))}
                          options={buyerOptions.filter((b) => !isAllSelection(b))}
                          placeholder="All"
                          allOption={{ value: "All", label: "All" }}
                          searchPlaceholder="Find buyer"
                          emptyResultsLabel="No buyers found."
                        />
                      </div>
                    ) : null}
                    {isGeos ? (
                      <>
                        <div className="modal-section-label">
                          <MapIcon size={11} />
                          <span>Geography</span>
                        </div>
                        <div className={`field${filters.city ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>Region / State</label>
                            {filters.city ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, city: "" }))} aria-label="Clear region">Clear</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.city}
                            onChange={updateFilter("city")}
                          />
                        </div>
                        <div className={`field${filters.geoCity ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>City</label>
                            {filters.geoCity ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoCity: "" }))} aria-label="Clear city">Clear</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.geoCity}
                            onChange={updateFilter("geoCity")}
                          />
                        </div>

                        <div className="modal-section-label">
                          <Link2 size={11} />
                          <span>Source</span>
                        </div>
                        <div className={`field${filters.geoDomain ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>Domain / Source</label>
                            {filters.geoDomain ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoDomain: "" }))} aria-label="Clear domain">Clear</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.geoDomain}
                            onChange={updateFilter("geoDomain")}
                          />
                        </div>
                        <div className={`field${filters.geoPlacement ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>Placement</label>
                            {filters.geoPlacement ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoPlacement: "" }))} aria-label="Clear placement">Clear</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.geoPlacement}
                            onChange={updateFilter("geoPlacement")}
                          />
                        </div>
                        <div className={`field${filters.geoDevice ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>Device</label>
                            {filters.geoDevice ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoDevice: "" }))} aria-label="Clear device">Clear</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.geoDevice}
                            onChange={updateFilter("geoDevice")}
                          />
                        </div>

                        <div className="modal-section-label">
                          <BarChart3 size={11} />
                          <span>Performance</span>
                        </div>
                        <div className={`field${Number(filters.geoMinClicks) > 0 ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>Min Clicks</label>
                            {Number(filters.geoMinClicks) > 0 ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoMinClicks: "" }))} aria-label="Clear min clicks">Clear</button>
                            ) : null}
                          </div>
                          <div className="threshold-input">
                            <span className="threshold-prefix">≥</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={filters.geoMinClicks}
                              onChange={updateFilter("geoMinClicks")}
                            />
                          </div>
                        </div>
                        <div className={`field${Number(filters.geoMinFtds) > 0 ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>Min FTDs</label>
                            {Number(filters.geoMinFtds) > 0 ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoMinFtds: "" }))} aria-label="Clear min FTDs">Clear</button>
                            ) : null}
                          </div>
                          <div className="threshold-input">
                            <span className="threshold-prefix">≥</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={filters.geoMinFtds}
                              onChange={updateFilter("geoMinFtds")}
                            />
                          </div>
                        </div>
                      </>
                    ) : null}
                    {isPlacements ? (
                      <>
                        <div className="field">
                          <label>Placement</label>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.placementName}
                            onChange={updateFilter("placementName")}
                          />
                        </div>
                        <div className="field">
                          <label>Domain / Source</label>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.placementDomain}
                            onChange={updateFilter("placementDomain")}
                          />
                        </div>
                        <div className="field">
                          <label>Min Clicks</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.placementMinClicks}
                            onChange={updateFilter("placementMinClicks")}
                          />
                        </div>
                        <div className="field">
                          <label>Min Registers</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.placementMinRegisters}
                            onChange={updateFilter("placementMinRegisters")}
                          />
                        </div>
                        <div className="field">
                          <label>Min FTDs</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.placementMinFtds}
                            onChange={updateFilter("placementMinFtds")}
                          />
                        </div>
                        <div className="field">
                          <label className="login-remember">
                            <input
                              type="checkbox"
                              checked={Boolean(filters.placementRevenueOnly)}
                              onChange={updateFilter("placementRevenueOnly")}
                            />
                            Only revenue {'>'} 0
                          </label>
                        </div>
                      </>
                    ) : null}
                    {isUserBehavior ? (
                      <>
                        <div className="field">
                          <label>Domain / Source</label>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.userDomain}
                            onChange={updateFilter("userDomain")}
                          />
                        </div>
                        <div className="field">
                          <label>Campaign</label>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.userCampaign}
                            onChange={updateFilter("userCampaign")}
                          />
                        </div>
                        <div className="field">
                          <label>External ID</label>
                          <input
                            type="text"
                            placeholder="All"
                            value={filters.userExternalId}
                            onChange={updateFilter("userExternalId")}
                          />
                        </div>
                        <div className="field">
                          <label>Min Revenue</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={filters.userMinRevenue}
                            onChange={updateFilter("userMinRevenue")}
                          />
                        </div>
                        <div className="field">
                          <label>Min FTDs</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.userMinFtds}
                            onChange={updateFilter("userMinFtds")}
                          />
                        </div>
                        <div className="field">
                          <label>Min Redeposits</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.userMinRedeposits}
                            onChange={updateFilter("userMinRedeposits")}
                          />
                        </div>
                        <div className="field">
                          <label className="login-remember">
                            <input
                              type="checkbox"
                              checked={Boolean(filters.userRevenueOnly)}
                              onChange={updateFilter("userRevenueOnly")}
                            />
                            Only users with revenue {'>'} 0
                          </label>
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="field">
                      <label>Category</label>
                      <Select
                        value={filters.category || "All"}
                        onChange={(v) => setFilters((prev) => ({ ...prev, category: v }))}
                        options={categoryOptions}
                        allOption={{ value: "All", label: "All" }}
                        placeholder="All"
                      />
                    </div>

                    <div className="field">
                      <label>Billing type</label>
                      <Select
                        value={filters.billing || "All"}
                        onChange={(v) => setFilters((prev) => ({ ...prev, billing: v }))}
                        options={billingOptions}
                        allOption={{ value: "All", label: "All" }}
                        placeholder="All"
                      />
                    </div>

                    <div className="field">
                      <label>Status</label>
                      <Select
                        value={filters.status || "All"}
                        onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                        options={statusOptions}
                        allOption={{ value: "All", label: "All" }}
                        placeholder="All"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-actions modal-actions-split">
                <button
                  className="modal-reset-link"
                  type="button"
                  onClick={() => {
                    const defaultRange = getDefaultDateRange();
                    setFilters({
                      dateFrom: defaultRange.from,
                      dateTo: defaultRange.to,
                      country: "All",
                      city: "",
                      geoCity: "",
                      geoDomain: "",
                      geoPlacement: "",
                      geoDevice: "",
                      geoMinClicks: "",
                      geoMinFtds: "",
                      placementName: "",
                      placementDomain: "",
                      placementMinClicks: "",
                      placementMinRegisters: "",
                      placementMinFtds: "",
                      placementRevenueOnly: false,
                      userDomain: "All",
                      userCampaign: "All",
                      userExternalId: "",
                      userMinRevenue: "",
                      userMinFtds: "",
                      userMinRedeposits: "",
                      userRevenueOnly: false,
                      approach: "All",
                      buyer: isLeadership ? "All" : effectiveViewerBuyer,
                      category: "All",
                      billing: "All",
                      status: "All",
                    });
                    setCustomRange(defaultRange);
                    setPeriod("Custom range");
                  }}
                >
                  Reset all
                </button>
                <button
                  className={`action-pill${filtersDirty ? " is-dirty" : ""}`}
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </LanguageContext.Provider>
  );
}
