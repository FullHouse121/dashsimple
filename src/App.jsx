import React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Globe,
  Link2,
  Lock,
  LogOut,
  Map as MapIcon,
  Megaphone,
  Menu,
  RotateCcw,
  SlidersHorizontal,
  User,
  Users,
  X,
} from "lucide-react";
import logo from "./assets/logo.png";






// A deploy gives every code-split chunk a new content hash and removes the old
// files. A tab that was open across the deploy still holds the previous entry
// bundle, so the first lazy view it opens asks for a filename that no longer
// exists and throws "Failed to fetch dynamically imported module" — which is
// how a routine release turned into a broken Conversions and Live Clicks for
// anyone who had not reloaded.
//
// The fix is a reload, which is the one thing the error boundary cannot do for
// itself. Doing it here is deliberate: a stale chunk is not a render error, and
// by the time the boundary sees it the user has already been shown a failure
// for something that just needed newer HTML.
//
// The sessionStorage guard is what keeps this from becoming a reload loop: a
// chunk that is genuinely missing — a bad deploy, an offline device — fails the
// second time too, and then the error surfaces properly. Success clears the
// guard so the next release can reload again.
const lazyWithReload = (key, factory) =>
  React.lazy(() =>
    factory()
      .then((mod) => {
        try {
          window.sessionStorage?.removeItem(`chunk-reload:${key}`);
        } catch (error) {
          /* private mode — the guard is best-effort */
        }
        return mod;
      })
      .catch((error) => {
        let alreadyTried = true;
        try {
          const flag = `chunk-reload:${key}`;
          alreadyTried = Boolean(window.sessionStorage?.getItem(flag));
          if (!alreadyTried) window.sessionStorage?.setItem(flag, "1");
        } catch (storageError) {
          /* no storage: fall through and show the error rather than loop */
        }
        if (alreadyTried) throw error;
        window.location.reload();
        // Never settles — the reload replaces this document.
        return new Promise(() => {});
      })
  );

// Lazy-loaded dashboard views — each splits into its own chunk so the initial
// bundle stays small. Add more dashboards here as they're extracted to /src/dashboards/
const DocumentationDashboard = lazyWithReload("docs", () => import("./dashboards/DocumentationDashboard.jsx"));

// Command palette (Cmd+K) — lazy so it doesn't add weight to the initial bundle
const CommandPalette = lazyWithReload("palette", () => import("./components/CommandPalette.jsx"));
const LiveClicksDashboard = lazyWithReload("live-clicks", () => import("./dashboards/LiveClicksDashboard.jsx"));
const ConversionsDashboard = lazyWithReload("conversions", () => import("./dashboards/ConversionsDashboard.jsx"));
const ReportsDashboard = lazyWithReload("reports", () => import("./dashboards/ReportsDashboard.jsx"));
const GoalsDashboard = lazyWithReload("goals", () => import("./dashboards/GoalsDashboard.jsx"));
const UtmBuilder = lazyWithReload("utm", () => import("./dashboards/UtmBuilder.jsx"));
const KeitaroApiView = lazyWithReload("keitaro-api", () => import("./dashboards/KeitaroApiView.jsx"));
const PlacementsDashboard = lazyWithReload("placements", () => import("./dashboards/PlacementsDashboard.jsx"));
const UserBehaviorDashboard = lazyWithReload("user-behavior", () => import("./dashboards/UserBehaviorDashboard.jsx"));
const DevicesDashboard = lazyWithReload("devices", () => import("./dashboards/DevicesDashboard.jsx"));
const HealthDashboard = lazyWithReload("health", () => import("./dashboards/HealthDashboard.jsx"));
const ProfileDashboard = lazyWithReload("profile", () => import("./dashboards/ProfileDashboard.jsx"));
const LogsDashboard = lazyWithReload("logs", () => import("./dashboards/LogsDashboard.jsx"));
const PixelsDashboard = lazyWithReload("pixels", () => import("./dashboards/PixelsDashboard.jsx"));
const RolesDashboard = lazyWithReload("roles", () => import("./dashboards/RolesDashboard.jsx"));
const GeosDashboard = lazyWithReload("geos", () => import("./dashboards/GeosDashboard.jsx"));
const TrackingLinksDashboard = lazyWithReload("tracking-links", () => import("./dashboards/TrackingLinksDashboard.jsx"));
const MetaTokenDashboard = lazyWithReload("meta-token", () => import("./dashboards/MetaTokenDashboard.jsx"));
const StatisticsDashboard = lazyWithReload("statistics", () => import("./dashboards/StatisticsDashboard.jsx"));
const DomainsDashboard = lazyWithReload("domains", () => import("./dashboards/DomainsDashboard.jsx"));
const MyFlowsDashboard = lazyWithReload("my-flows", () => import("./dashboards/MyFlowsDashboard.jsx"));
const CampaignsDashboard = lazyWithReload("campaigns", () => import("./dashboards/CampaignsDashboard.jsx"));
const AccountsDashboard = lazyWithReload("accounts", () => import("./dashboards/AccountsDashboard.jsx"));
const HomeDashboard = lazyWithReload("home", () => import("./dashboards/HomeDashboard.jsx"));
import { CountryDropdownPicker, DeusDatePicker, Select } from "./components/Select.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { dialogMotion, overlayMotion } from "./lib/motion.js";
import {
  AccountIcon,
  ApiIcon,
  BehaviorIcon,
  CampaignIcon,
  ClicksIcon,
  ConversionIcon,
  CostIcon,
  DashIcon,
  DeviceIcon,
  DomainIcon,
  GeoIcon,
  GoalIcon,
  HealthIcon,
  LinkIcon,
  LogIcon,
  PixelIcon,
  PlacementIcon,
  ProfileIcon,
  ReportIcon,
  RolesIcon,
  StatsIcon,
  UtmIcon,
} from "./components/icons.jsx";
import { campaignServesCountry } from "../shared/campaign-name.js";


// Skeleton loaders for graceful loading states across dashboards

// Pure formatting utilities (Phase 1 extraction from inline definitions)
import { setActiveFxRate } from "./lib/format.js";

// Resilient API client with retry, timeout, fallback (Phase 1 extraction)
import { apiFetch } from "./lib/api.js";

// Permissions, filters, and sort helpers (Phase 1)
import { isLeadershipRole } from "./lib/permissions.js";

// i18n: context, hook, translator factory (Phase 1 extraction)
import { LanguageContext, makeT, useLanguage } from "./lib/i18n/language.jsx";

// Static option arrays + country/domain normalizers (Phase 1)
import {
  billingOptions,
  categoryOptions,
  countryOptions,
  permissionOptions,
  priorityBuyers,
  resolveCountryIso,
  statusOptions,
} from "./lib/constants.js";

// SWR cache helpers (Phase 1 extraction)

// Date utilities (Phase 1 extraction)
import { getDefaultDateRange, getPeriodDateRange, normalizeDateRange } from "./lib/date.js";
import { FlowsIcon } from "./components/glyphs.jsx";
import { ConfirmHost } from "./lib/confirm.jsx";
import { initialsOf, roleIdentColor } from "./lib/identity.jsx";
import { formatPeriodChip } from "./components/PeriodSelect.jsx";

// API client moved to ./lib/api.js (Phase 1 extraction — retry, timeout, fallback all live there)
// SWR cache helpers moved to ./lib/cache.js (Phase 1 extraction)


// Every entry now has its own glyph. The stock set had ShieldCheck on both
// Roles and Health, CreditCard on Conversions, Meta Token and Profile, and
// MousePointerClick on both Tracking Links and Placement — so the icon told
// you nothing about where you were.
const navItems = [
  { key: "home", label: "Dashboard", icon: DashIcon },
  { key: "geos", label: "GEOS", icon: GeoIcon },
  { key: "streams", label: "Goals", icon: GoalIcon },
  { key: "utm", label: "UTM Builder", icon: UtmIcon },
  { key: "tracking", label: "Tracking Links", icon: LinkIcon },
  { key: "flows", label: "My Flows", icon: FlowsIcon },
  { key: "statistics", label: "Statistics", icon: StatsIcon },
  { key: "live_clicks", label: "Live Clicks", icon: ClicksIcon },
  { key: "conversions", label: "Conversions", icon: ConversionIcon },
  { key: "campaigns", label: "Campaigns", icon: CampaignIcon },
  { key: "placements", label: "Placement", icon: PlacementIcon },
  { key: "user_behavior", label: "User Behavior", icon: BehaviorIcon },
  { key: "devices", label: "Devices", icon: DeviceIcon },
  { key: "reports", label: "Reports", icon: ReportIcon },
  { key: "domains", label: "Domains", icon: DomainIcon },
  { key: "pixels", label: "Pixels", icon: PixelIcon },
  { key: "accounts", label: "Accounts", icon: AccountIcon },
  { key: "roles", label: "Roles", icon: RolesIcon },
  { key: "health", label: "Health", icon: HealthIcon },
  { key: "logs", label: "Logs", icon: LogIcon },
  { key: "profile", label: "Profile", icon: ProfileIcon },
  { key: "meta_token", label: "Meta Token $", icon: CostIcon },
  { key: "api", label: "API", icon: ApiIcon },
];

const navSections = [
  { title: "Overview", items: ["home", "geos", "streams"] },
  { title: "Performance", items: ["statistics", "live_clicks", "conversions", "campaigns", "placements", "user_behavior", "devices", "reports"] },
  { title: "Operations", items: ["flows", "tracking", "utm", "domains", "pixels", "accounts", "health"] },
  { title: "Administration", items: ["roles", "logs"] },
  { title: "Account", items: ["profile"] },
  { title: "Integrations", items: ["meta_token", "api"] },
];

// Static option arrays + country/domain normalizers moved to ./lib/constants.js (Phase 1)

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












const languageOptions = [
  { code: "EN", label: "English", Flag: FlagEN },
  { code: "TR", label: "Türkçe", Flag: FlagTR },
];

// The language switcher, which is the sidebar's only select.
//
// Two things were wrong with it. `.lang-option` styled colour and padding but
// never background or border, so every option that was not hovered fell back
// to the browser's default button chrome — the light grey box against a dark
// sidebar. And the menu appeared and vanished on a state flip with nothing in
// between, which is what "not smooth" was.
//
// It now opens and closes on the same easing as the rest of the app, and takes
// arrow keys, Enter, Home/End and Escape like a listbox should.
function LanguageSwitcher({ language, setLanguage }) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const ref = React.useRef(null);
  const currentIndex = Math.max(
    0,
    languageOptions.findIndex((item) => item.code === language)
  );

  // Opening always starts from the selected language, so the first arrow press
  // moves relative to where you are rather than to wherever it was left.
  React.useEffect(() => {
    if (open) setActiveIndex(currentIndex);
  }, [open, currentIndex]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const choose = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(languageOptions[activeIndex].code);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((i) => (i + step + languageOptions.length) % languageOptions.length);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(languageOptions.length - 1);
    }
  };

  const current = languageOptions[currentIndex];
  const CurFlag = current.Flag;
  return (
    <div className={`lang-switch${open ? " is-open" : ""}`} ref={ref} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="lang-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lang-flag">{CurFlag ? <CurFlag /> : current.code}</span>
        <span className="lang-cur">
          <strong>{current.code}</strong>
          <span className="lang-cur-label">{current.label}</span>
        </span>
        <ChevronDown size={15} className="lang-caret" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="lang-menu"
            role="listbox"
            aria-activedescendant={`lang-opt-${languageOptions[activeIndex].code}`}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {languageOptions.map((lang, index) => {
              const LFlag = lang.Flag;
              const selected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  id={`lang-opt-${lang.code}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`lang-option${selected ? " is-active" : ""}${
                    index === activeIndex ? " is-cursor" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(lang.code)}
                >
                  <span className="lang-flag">{LFlag ? <LFlag /> : lang.code}</span>
                  <span className="lang-option-text">
                    <strong>{lang.code}</strong>
                    <span className="lang-option-label">{lang.label}</span>
                  </span>
                  {selected ? <Check size={14} className="lang-check" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}




























// ── Health ────────────────────────────────────────────────────────────
// Not a report — a work queue. Every finding is expressed as the action
// it demands (add / remove / fix / check), what it costs while it sits
// there, and a button that lands on the screen where it gets fixed.
// Buyers should be able to work top-to-bottom without interpreting.




































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
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem("dash-sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const toggleSidebarCollapsed = React.useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dash-sidebar-collapsed", next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const initialFiltersRef = React.useRef(null);
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
      statsBrand: "",
      statsGame: "",
      statsTool: "",
      statsPlacement: "",
      statsCampaign: [],
      statsMinClicks: "",
      statsMinFtds: "",
      statsProfitableOnly: false,
      category: "All",
      billing: "All",
      status: "All",
      compareToPrev: false,
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
  const isLiveClicks = activeView === "live_clicks";
  const isConversions = activeView === "conversions";
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
  const isLogs = activeView === "logs";
  const isHealth = activeView === "health";
  const isDocs = activeView === "docs";
  const isDevices = activeView === "devices";
  const isReports = activeView === "reports";
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
    // The username is the identity that campaign names resolve to
    // ("Karen | …" → KarenFarias, matched by prefix). A media_buyers record
    // is a CRM profile whose name can be anything — Karen's is "KRBR", and
    // blindly adopting it made every stats view filter her rows against a
    // string they never contain, emptying her dashboard. Only adopt the
    // record name when it's actually compatible with the username.
    const fallback = authUser?.username || "";
    setViewerBuyer(fallback);
    const fetchBuyer = async () => {
      try {
        const response = await apiFetch("/api/media-buyers?limit=1");
        if (!response.ok) return;
        const data = await response.json();
        const record = Array.isArray(data) ? data[0] : null;
        const recordName = record?.name ? String(record.name) : "";
        if (!recordName) return;
        const norm = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const a = norm(recordName);
        const b = norm(fallback);
        const compatible = Boolean(a && b) && (a.startsWith(b) || b.startsWith(a));
        if (compatible) setViewerBuyer(recordName);
      } catch (error) {
        // ignore — the username fallback already scopes correctly
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

  // Buyer picker options come live from Keitaro's campaign groups — one group
  // per buyer. Non-buyer buckets ("Inactive" for buyers who left, "Outsource")
  // are filtered out here, so the list self-maintains with no hardcoded roster:
  // move a buyer's campaigns into "Inactive" in Keitaro and they drop off.
  // Leadership only (other roles can't pick a buyer); the resources endpoint is
  // already leadership-scoped and 5-min cached server side. Falls back to the
  // static roster if the fetch fails or returns nothing.
  const [keitaroBuyerNames, setKeitaroBuyerNames] = React.useState([]);
  React.useEffect(() => {
    if (!authUser || !isLeadership) {
      setKeitaroBuyerNames([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetch("/api/keitaro/resources");
        if (!response.ok) return;
        const data = await response.json();
        const nonBuyerGroups = ["inactive", "outsource"];
        const names = (data.groups || [])
          .map((g) => String(g?.name || "").trim())
          .filter(Boolean)
          .filter((name) => {
            const lower = name.toLowerCase();
            return !nonBuyerGroups.some((skip) => lower.includes(skip));
          });
        if (!cancelled && names.length) setKeitaroBuyerNames(names);
      } catch (error) {
        // keep the static fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUser, isLeadership]);

  const buyerFilterOptions = React.useMemo(() => {
    const source = keitaroBuyerNames.length ? keitaroBuyerNames : priorityBuyers;
    const map = new Map();
    source.forEach((name) => {
      const clean = String(name || "").trim();
      if (clean) map.set(clean.toLowerCase(), clean);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [keitaroBuyerNames]);

  // Campaigns for the Refine modal's "Campaign" multi-select — the selected
  // buyer's Keitaro campaigns (or all campaigns when Buyer is "All"). Fetched
  // only while the modal is open, and re-fetched when the buyer changes.
  const [modalCampaigns, setModalCampaigns] = React.useState([]);
  const [modalCampaignsLoading, setModalCampaignsLoading] = React.useState(false);
  React.useEffect(() => {
    if (!filtersOpen) return undefined;
    let cancelled = false;
    (async () => {
      try {
        setModalCampaignsLoading(true);
        // Server forces non-leadership to their own campaigns and ignores this
        // param; for leadership it scopes to the picked buyer ("" = all buyers).
        const picked = filters.buyer && filters.buyer !== "All" ? String(filters.buyer).trim() : "";
        const qs = picked ? `?buyer=${encodeURIComponent(picked)}` : "";
        const res = await apiFetch(`/api/keitaro/buyer-campaigns${qs}`);
        const data = res.ok ? await res.json() : { campaigns: [] };
        if (!cancelled) setModalCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : []);
      } catch (error) {
        if (!cancelled) setModalCampaigns([]);
      } finally {
        if (!cancelled) setModalCampaignsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filtersOpen, isLeadership, filters.buyer]);

  // A flow runs in one country, and the name says which ("… | BR | JASINO").
  // Offering every flow after a country is picked means scrolling past the
  // CO, MX and AR builds of the same game to reach the Brazilian one, and
  // choosing one of them produces a filter that can only ever return nothing —
  // a Brazil + Colombian-flow query matches no rows.
  //
  // Broad-match flows — one campaign opened to run across several countries —
  // are kept where they genuinely run: GLOBAL under every country, LATAM under
  // Brazil and Mexico but not Germany. See campaignServesCountry.
  //
  // Buyer scoping stays the server's job (it forces non-leadership to their own
  // campaigns); this narrows what the server returned, never widens it.
  const modalCountryIso = React.useMemo(
    () =>
      filters.country && filters.country !== "All" ? resolveCountryIso(filters.country) : null,
    [filters.country]
  );
  const modalCampaignsForCountry = React.useMemo(() => {
    if (!modalCountryIso) return modalCampaigns;
    return modalCampaigns.filter((c) =>
      campaignServesCountry(c?.name, { iso: modalCountryIso, country: filters.country })
    );
  }, [modalCampaigns, modalCountryIso, filters.country]);

  // Selected campaigns belong to the picked buyer — clear them when the buyer
  // changes so stale selections don't silently empty the view.
  const prevBuyerRef = React.useRef(filters.buyer);
  React.useEffect(() => {
    if (prevBuyerRef.current !== filters.buyer) {
      prevBuyerRef.current = filters.buyer;
      setFilters((prev) =>
        (prev.statsCampaign || []).length ? { ...prev, statsCampaign: [] } : prev
      );
    }
  }, [filters.buyer]);

  // Same reasoning for country: a flow picked under Brazil is not a flow that
  // survives switching to Mexico. Only selections that no longer belong to the
  // new country are dropped, so changing country does not silently throw away
  // a choice that is still valid.
  const prevCountryRef = React.useRef(filters.country);
  React.useEffect(() => {
    if (prevCountryRef.current === filters.country) return;
    prevCountryRef.current = filters.country;
    const iso = filters.country && filters.country !== "All" ? resolveCountryIso(filters.country) : null;
    if (!iso) return;
    setFilters((prev) => {
      const cur = Array.isArray(prev.statsCampaign) ? prev.statsCampaign : [];
      if (!cur.length) return prev;
      const kept = cur.filter((name) =>
        campaignServesCountry(name, { iso, country: filters.country })
      );
      return kept.length === cur.length ? prev : { ...prev, statsCampaign: kept };
    });
  }, [filters.country]);

  const toggleStatsCampaign = React.useCallback((name) => {
    setFilters((prev) => {
      const cur = Array.isArray(prev.statsCampaign) ? prev.statsCampaign : [];
      const set = new Set(cur);
      if (set.has(name)) set.delete(name);
      else set.add(name);
      return { ...prev, statsCampaign: Array.from(set) };
    });
  }, []);

  const viewPermissionMap = React.useMemo(
    () => ({
      home: "dashboard",
      geos: "geos",
      streams: "goals",
      utm: "utm",
      tracking: "tracking_links",
      flows: "tracking_links",
      statistics: "statistics",
      live_clicks: "statistics",
      conversions: "statistics",
      campaigns: "campaigns",
      placements: "placements",
      user_behavior: "user_behavior",
      devices: "devices",
      reports: "statistics",
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
    // Logs are hard-gated to leadership (Big Boss + Team Leader) — never
    // grantable through role permissions.
    if (item.key === "logs") return isLeadershipRole(authUser?.role);
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

  // Each nav item's position in the rail, counted across sections rather than
  // within one, so expanding cascades down the whole sidebar instead of
  // restarting the count at every group heading. Feeds --nav-i, which the
  // stylesheet turns into a per-item delay.
  const navItemOrder = React.useMemo(() => {
    const order = new Map();
    let index = 0;
    navSectionsToRender.forEach((section) => {
      section.items.forEach((key) => order.set(key, index++));
    });
    return order;
  }, [navSectionsToRender]);

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
    if (typeof window === "undefined") return undefined;
    // Cross-section jumps (e.g. Campaigns row → Tracking Links edit modal).
    const handleNavigate = (event) => {
      const view = event?.detail?.view;
      if (view) setActiveView(view);
    };
    window.addEventListener("dash:navigate", handleNavigate);
    return () => window.removeEventListener("dash:navigate", handleNavigate);
  }, []);

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

  // The token carries its own expiry and nothing ever showed it, so a session
  // ending was something you discovered by being logged out mid-task.
  // Declared above the logged-out early return: a hook after it would make the
  // hook count differ between the login screen and the app, and React throws
  // "Rendered more hooks than during the previous render" the moment you log in.
  const sessionExpiryLabel = React.useMemo(() => {
    const exp = Number(authUser?.exp);
    if (!Number.isFinite(exp) || exp <= 0) return null;
    const seconds = exp - Math.floor(Date.now() / 1000);
    if (seconds <= 0) return t("expired");
    const days = Math.floor(seconds / 86400);
    if (days >= 1) return `${days}${t("d left")}`;
    const hours = Math.floor(seconds / 3600);
    if (hours >= 1) return `${hours}${t("h left")}`;
    return `${Math.max(1, Math.floor(seconds / 60))}${t("m left")}`;
  }, [authUser?.exp, t]);

  if (!authUser) {
    return (
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        <LoginScreen onLogin={handleLogin} loading={authState.loading} error={authState.error} />
      </LanguageContext.Provider>
    );
  }

  const profileName = authUser?.username || "DeusInsta";
  const profileRole = authUser?.role || "Media Buyer";
  // initialsOf handles two-word names ("Karen Farias" -> KF); slicing the first
  // two characters gave "KA". The team tables have always used the former.
  const profileInitials = initialsOf(profileName);
  // The role's own colour, from the same map the Users and Team tables use.
  // Both badges were hardcoded green, so a Boss and a Junior Media Buyer wore
  // the Team Leader's colour and the role tint meant nothing outside Roles.
  const profileRoleColor = roleIdentColor(profileRole);
  // The row is a toggle, so it advertises where it takes you, not where you are.
  const nextLanguage =
    languageOptions.find((item) => item.code !== language) || languageOptions[0];

  // reducedMotion="user" makes every framer animation in the app honour the OS
  // setting, rather than each component having to remember to check.
  return (
    <MotionConfig reducedMotion="user">
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <ConfirmHost />
      <div className={`app${mobileNavOpen ? " mobile-nav-open" : ""}${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <div
        className="mobile-nav-backdrop"
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />
      <aside className={`sidebar${mobileNavOpen ? " is-open" : ""}${sidebarCollapsed ? " is-collapsed" : ""}`}>
        <button
          className="sidebar-collapse-toggle"
          type="button"
          onClick={toggleSidebarCollapsed}
          aria-label={sidebarCollapsed ? t("Expand sidebar") : t("Collapse sidebar")}
          title={sidebarCollapsed ? t("Expand sidebar") : t("Collapse sidebar")}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <button
          className="mobile-nav-close"
          type="button"
          onClick={() => setMobileNavOpen(false)}
          aria-label={t("Close menu")}
        >
          <X size={20} />
        </button>
        <div className="brand">
          <img src={logo} alt="Deus Affiliates" />
        </div>

        {/* The identity used to be stated twice at once — here and in the
            topbar — on every screen at every width. The topbar is the
            conventional home for it, it survives the sidebar collapsing, and
            it is the only one on mobile, so that is the copy that stayed. The
            sidebar now opens straight into navigation. */}

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
                    style={{ "--nav-i": navItemOrder.get(key) ?? 0 }}
                    title={sidebarCollapsed ? t(item.label) : undefined}
                    href={item.href || "#"}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    onClick={(event) => {
                      if (isExternal) return;
                      event.preventDefault();
                      setActiveView(item.key);
                      setMobileNavOpen(false);
                    }}
                  >
                    <Icon size={18} />
                    {/* Wrapped so collapsing can animate it. As a bare text
                        node the only handle was font-size: 0, which cannot be
                        eased — the words vanished between one frame and the
                        next while the rail was still moving. */}
                    <span className="nav-item-label">{t(item.label)}</span>
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
            /* Last in the rail, so last in the cascade — without this it
               inherits --nav-i: 0 and arrives with the topmost nav item,
               which reads as the sidebar filling in from both ends. */
            style={{ "--nav-i": navItemOrder.size }}
            onClick={() => { setActiveView("docs"); setMobileNavOpen(false); }}
            title={sidebarCollapsed ? t("Documentation") : undefined}
          >
            <BookOpen size={16} />
            <span className="nav-item-label">{t("Documentation")}</span>
          </button>
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
        </div>
      </aside>

      <main className="main">
        {/* The page had no h1 at all, so assistive tech opened it with no
            document heading and nothing to navigate by. It names the current
            view and changes with it. Hidden visually because the view is
            already obvious on screen — the sidebar item is highlighted — and
            a second copy of "Dashboard" would be noise. */}
        <h1 className="sr-only">
          {t(navItemMap[activeView]?.label || "Dashboard")} — DeusMachine
        </h1>
        <header className="topbar">
          <button
            className="mobile-nav-toggle"
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label={t("Open menu")}
          >
            <Menu size={20} />
          </button>
          {showFilters ? (
            (() => {
              let activeCount = 0;
              if (filters.country && filters.country !== "All") activeCount++;
              if (filters.buyer && filters.buyer !== "All" && isLeadership) activeCount++;
              if ((filters.statsCampaign || []).length) activeCount++;
              if (filters.city) activeCount++;
              if (filters.category && filters.category !== "All") activeCount++;
              if (filters.billing && filters.billing !== "All") activeCount++;
              if (filters.status && filters.status !== "All") activeCount++;
              if (filters.approach && filters.approach !== "All") activeCount++;
              // Visible chips for the headline filters — a forgotten Country/
              // Buyer/Flow selection silently reshapes every number on screen,
              // so it must be visible (and clearable) without opening the modal.
              const chips = [];
              if (filters.country && filters.country !== "All") {
                chips.push({
                  key: "country",
                  label: filters.country,
                  clear: () => setFilters((prev) => ({ ...prev, country: "All" })),
                });
              }
              if (filters.buyer && filters.buyer !== "All" && isLeadership) {
                chips.push({
                  key: "buyer",
                  label: filters.buyer,
                  clear: () => setFilters((prev) => ({ ...prev, buyer: "All" })),
                });
              }
              const flowCount = (filters.statsCampaign || []).length;
              if (flowCount) {
                chips.push({
                  key: "flows",
                  label:
                    flowCount === 1
                      ? String(filters.statsCampaign[0])
                      : `${flowCount} ${t("flows")}`,
                  clear: () => setFilters((prev) => ({ ...prev, statsCampaign: [] })),
                });
              }
              return (
                <div className="filters-trigger-row">
                  <button
                    className={`action-pill filters-trigger${activeCount > 0 ? " has-active" : ""}`}
                    type="button"
                    aria-label={t("Filters")}
                    onClick={() => setFiltersOpen(true)}
                  >
                    <SlidersHorizontal size={18} />
                    {/* The label is dropped on a phone, where the icon and the
                        period chip beside it cannot both fit a single row and
                        the chip is the one carrying information. aria-label
                        above keeps the button named either way. */}
                    <span className="filters-trigger-label">{t("Filters")}</span>
                    {activeCount > 0 ? (
                      <span className="filters-trigger-count">{activeCount}</span>
                    ) : null}
                  </button>
                  {/* The period every panel inherits, stated where it applies.
                      It was only ever visible inside the Filters dialog and
                      spelled out in the KPI card captions, so a page where
                      Statistics and Top GEO carry their own "This Month"
                      pickers gave no way to tell which panels those pickers
                      were overriding and which were following the global
                      range. Not clearable: a report always has a period. */}
                  {filters.dateFrom && filters.dateTo ? (
                    <span
                      className="topbar-period-chip"
                      title={`${t("All panels use this period unless they carry their own")}: ${filters.dateFrom} → ${filters.dateTo}`}
                    >
                      <CalendarIcon size={12} />
                      {formatPeriodChip(filters.dateFrom, filters.dateTo)}
                    </span>
                  ) : null}
                  {chips.map((chip) => (
                    <span className="topbar-filter-chip" key={chip.key} title={chip.label}>
                      <span className="topbar-filter-chip-label">{chip.label}</span>
                      <button
                        type="button"
                        className="topbar-filter-chip-clear"
                        aria-label={`${t("Clear")} ${chip.label}`}
                        onClick={chip.clear}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
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
                <span className="avatar" style={{ "--ident-color": profileRoleColor }}>
                  {profileInitials}
                </span>
                <div className="profile-text">
                  <div className="profile-name">{profileName}</div>
                  <div className="profile-role">
                    <span
                      className="ident-role-dot"
                      style={{ "--ident-color": profileRoleColor }}
                      aria-hidden="true"
                    />
                    {t(profileRole)}
                  </div>
                </div>
              </button>
              {profileMenuOpen ? (
                <div className="profile-menu">
                  {/* Who you are, confirmed. The trigger truncates on a narrow
                      topbar; this is where the full name lives. */}
                  <div className="pm-head" style={{ "--ident-color": profileRoleColor }}>
                    <span className="ident-avatar" aria-hidden="true">{profileInitials}</span>
                    <span className="ident-text">
                      <span className="ident-name">{profileName}</span>
                      <span className="ident-role">
                        <span className="ident-role-dot" aria-hidden="true" />
                        {t(profileRole)}
                      </span>
                    </span>
                  </div>

                  {/* Every figure in this app is filtered by buyer, and until
                      now nothing said which filter you were under. A buyer
                      seeing "$462" and a leader seeing "$462" are not looking
                      at the same thing. */}
                  <div className="pm-facts">
                    <div className="pm-fact">
                      <span className="pm-fact-label">
                        <Eye size={12} /> {t("Seeing")}
                      </span>
                      <span className="pm-fact-value">
                        {isLeadership ? t("All buyers") : effectiveViewerBuyer || t("Your traffic")}
                      </span>
                    </div>
                    {sessionExpiryLabel ? (
                      <div className="pm-fact">
                        <span className="pm-fact-label">
                          <Clock size={12} /> {t("Session")}
                        </span>
                        <span className="pm-fact-value">{sessionExpiryLabel}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="pm-group">
                    <button
                      className="profile-menu-item"
                      type="button"
                      onClick={() => {
                        setActiveView("profile");
                        setProfileMenuOpen(false);
                      }}
                    >
                      <User size={14} />
                      {t("Profile")}
                      <ChevronRight size={13} className="pm-chev" />
                    </button>
                    {/* Both of these live at the very bottom of a 3,700px
                        sidebar — 2,750px below the fold on a 900px screen. */}
                    {/* The trailing chip shows the language this row switches
                        TO, so the flag has to be that language's flag — a bare
                        two-letter code made you translate the code yourself. */}
                    <button
                      className="profile-menu-item"
                      type="button"
                      onClick={() => setLanguage(nextLanguage.code)}
                    >
                      <Globe size={14} />
                      {t("Language")}
                      <span className="pm-trailing pm-trailing-lang">
                        <span className="lang-flag" aria-hidden="true">
                          {nextLanguage.Flag ? <nextLanguage.Flag /> : nextLanguage.code}
                        </span>
                        {nextLanguage.code}
                      </span>
                    </button>
                    <button
                      className="profile-menu-item"
                      type="button"
                      onClick={() => {
                        setActiveView("documentation");
                        setProfileMenuOpen(false);
                      }}
                    >
                      <BookOpen size={14} />
                      {t("Documentation")}
                      <ChevronRight size={13} className="pm-chev" />
                    </button>
                  </div>

                  <div className="pm-group pm-group-last">
                    <button
                      className="profile-menu-item is-danger"
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={14} />
                      {t("Logout")}
                    </button>
                  </div>
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
        {/* One throwing component used to unmount the whole app and leave a
            black page. Scoped per view, and reset on navigation. */}
        <ErrorBoundary label={activeView} resetKey={activeView}>
        {/* Every view is a lazy chunk now, so one boundary covers the lot.
            The spinner is the login one — a view swap should look like the
            app thinking, not like a page that failed to arrive. */}
        <React.Suspense fallback={<div className="empty-state"><span className="login-spinner" aria-hidden="true" /><span>Loading…</span></div>}>
        {isUtm ? (
          <UtmBuilder />
        ) : isTracking ? (
          <TrackingLinksDashboard authUser={authUser} />
        ) : isFlows ? (
          <MyFlowsDashboard authUser={authUser} />
        ) : isHealth ? (
          <HealthDashboard authUser={authUser} />
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
        ) : isLogs ? (
          isLeadership ? <LogsDashboard authUser={authUser} /> : null
        ) : isGeos ? (
          <GeosDashboard
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isMetaToken ? (
          <MetaTokenDashboard authUser={authUser} buyerFilterOptions={buyerFilterOptions} />
        ) : isApi ? (
          <KeitaroApiView />
        ) : isStats ? (
          <StatisticsDashboard
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
            filters={filters}
            buyerFilterOptions={buyerFilterOptions}
          />
        ) : isLiveClicks ? (
          <LiveClicksDashboard authUser={authUser} viewerBuyer={effectiveViewerBuyer} />
        ) : isConversions ? (
          <ConversionsDashboard authUser={authUser} viewerBuyer={effectiveViewerBuyer} />
        ) : isReports ? (
          <ReportsDashboard authUser={authUser} />
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
          <DocumentationDashboard t={t} />
        ) : (
          <HomeDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            onSeeGeos={() => setActiveView("geos")}
            onSeeLiveClicks={() => setActiveView("live_clicks")}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        )}
        </React.Suspense>
        </ErrorBoundary>
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
            {...overlayMotion}
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              className="modal dashboard-filters-modal"
              {...dialogMotion}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="filters-title"
            >
              <div className="modal-head">
                <h2 id="filters-title">
                  {isGeos ? t("Refine geos") : t("Refine performance")}
                </h2>
                <button className="icon-btn" type="button" onClick={() => setFiltersOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-section-label">
                  <Clock size={11} />
                  <span>{t("Time")}</span>
                </div>
                <div className="field field-wide">
                  <label>{t("Date")}</label>
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
                            {t(p.label)}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="field-row">
                    <DeusDatePicker
                      value={filters.dateFrom}
                      onChange={(v) => setFilters((prev) => ({ ...prev, dateFrom: v }))}
                      placeholder={t("Start date")}
                    />
                    <span className="field-sep">to</span>
                    <DeusDatePicker
                      value={filters.dateTo}
                      onChange={(v) => setFilters((prev) => ({ ...prev, dateTo: v }))}
                      placeholder={t("End date")}
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
                        <strong>{days} {days === 1 ? t("day") : t("days")}</strong>
                        <span>·</span>
                        <span>{fmt(from)} → {fmt(to)}</span>
                      </div>
                    );
                  })()}
                  <button
                    type="button"
                    className={`compare-row${filters.compareToPrev ? " is-on" : ""}`}
                    onClick={() => setFilters((prev) => ({ ...prev, compareToPrev: !prev.compareToPrev }))}
                    aria-pressed={filters.compareToPrev}
                  >
                    <span className="compare-toggle-track">
                      <span className="compare-toggle-thumb" />
                    </span>
                    <span className="compare-toggle-text">
                      {t("Compare to previous period")}
                    </span>
                    {filters.compareToPrev && filters.dateFrom && filters.dateTo ? (() => {
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
                          <span className="compare-preview-days">{days} {days === 1 ? t("day") : t("days")}</span>
                        </span>
                      );
                    })() : null}
                  </button>
                </div>

                <div className="modal-section-label">
                  <Users size={11} />
                  <span>{t("Audience")}</span>
                </div>

                <div className={`field${filters.country && filters.country !== "All" ? " is-active" : ""}`}>
                  <div className="field-label-row">
                    <label>{t("Country")}</label>
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
                    placeholder={t("All")}
                    allOption={{ value: "All", label: t("All") }}
                    searchPlaceholder={t("Type to find countries")}
                    emptyResultsLabel={t("No countries found.")}
                  />
                </div>

                {usesPerformanceFilters ? (
                  <>
                    {(isHome || isGeos || isStats || isPlacements || isUserBehavior) && isLeadership ? (
                      <div className={`field${filters.buyer && filters.buyer !== "All" ? " is-active" : ""}`}>
                        <div className="field-label-row">
                          <label>{t("Buyer")}</label>
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
                          options={buyerFilterOptions}
                          placeholder={t("All")}
                          allOption={{ value: "All", label: t("All") }}
                          searchPlaceholder={t("Find buyer")}
                          emptyResultsLabel={t("No buyers found.")}
                        />
                      </div>
                    ) : null}
                    {!isDevices ? (
                      <div className={`field field-span-2${(filters.statsCampaign || []).length ? " is-active" : ""}`}>
                        <div className="field-label-row">
                          <label>{t("Flow")}</label>
                          {(filters.statsCampaign || []).length ? (
                            <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, statsCampaign: [] }))} aria-label="Clear flows">{t("Clear")}</button>
                          ) : null}
                        </div>
                        <CountryDropdownPicker
                          multiple
                          removable
                          values={Array.isArray(filters.statsCampaign) ? filters.statsCampaign : []}
                          onToggle={toggleStatsCampaign}
                          options={modalCampaignsForCountry.map((c) => ({ value: c.name, label: c.name, search: c.name }))}
                          placeholder={
                            modalCampaignsLoading
                              ? t("Loading flows…")
                              : modalCampaignsForCountry.length
                                ? (filters.buyer && filters.buyer !== "All"
                                    ? t("All {buyer} flows", { buyer: filters.buyer })
                                    : t("All flows"))
                                : modalCountryIso
                                  // Naming the country matters: an empty list here
                                  // is a fact about the account ("nobody is running
                                  // Brazil"), not a failure to load.
                                  ? t("No flows in {country}", { country: filters.country })
                                  : t("No flows found")
                          }
                          searchPlaceholder={t("Find flow")}
                          emptyResultsLabel={t("No flows found.")}
                        />
                      </div>
                    ) : null}
                    {isStats ? (
                      <>
                        <div className="modal-section-label">
                          <Megaphone size={11} />
                          <span>{t("Traffic")}</span>
                        </div>
                          <div className={`field${filters.statsBrand ? " is-active" : ""}`}>
                            <div className="field-label-row">
                              <label>{t("Brand")}</label>
                              {filters.statsBrand ? (
                                <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, statsBrand: "" }))} aria-label="Clear brand">{t("Clear")}</button>
                              ) : null}
                            </div>
                            <input type="text" placeholder={t("All brands")} value={filters.statsBrand} onChange={updateFilter("statsBrand")} />
                          </div>
                          <div className={`field${filters.statsGame ? " is-active" : ""}`}>
                            <div className="field-label-row">
                              <label>{t("Game / Offer")}</label>
                              {filters.statsGame ? (
                                <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, statsGame: "" }))} aria-label="Clear game">{t("Clear")}</button>
                              ) : null}
                            </div>
                            <input type="text" placeholder={t("All games")} value={filters.statsGame} onChange={updateFilter("statsGame")} />
                          </div>
                          <div className={`field${filters.statsTool ? " is-active" : ""}`}>
                            <div className="field-label-row">
                              <label>{t("Tool / Source")}</label>
                              {filters.statsTool ? (
                                <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, statsTool: "" }))} aria-label="Clear tool">{t("Clear")}</button>
                              ) : null}
                            </div>
                            <input type="text" placeholder={t("All tools")} value={filters.statsTool} onChange={updateFilter("statsTool")} />
                          </div>
                          <div className={`field${filters.statsPlacement ? " is-active" : ""}`}>
                            <div className="field-label-row">
                              <label>{t("Placement")}</label>
                              {filters.statsPlacement ? (
                                <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, statsPlacement: "" }))} aria-label="Clear placement">{t("Clear")}</button>
                              ) : null}
                            </div>
                            <input type="text" placeholder={t("All placements")} value={filters.statsPlacement} onChange={updateFilter("statsPlacement")} />
                          </div>
                        <div className="modal-section-label">
                          <Filter size={11} />
                          <span>{t("Thresholds")}</span>
                        </div>
                          <div className={`field${filters.statsMinClicks ? " is-active" : ""}`}>
                            <div className="field-label-row">
                              <label>{t("Min clicks")}</label>
                              {filters.statsMinClicks ? (
                                <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, statsMinClicks: "" }))} aria-label="Clear min clicks">{t("Clear")}</button>
                              ) : null}
                            </div>
                            <input type="number" min="0" placeholder="0" value={filters.statsMinClicks} onChange={updateFilter("statsMinClicks")} />
                          </div>
                          <div className={`field${filters.statsMinFtds ? " is-active" : ""}`}>
                            <div className="field-label-row">
                              <label>{t("Min FTDs")}</label>
                              {filters.statsMinFtds ? (
                                <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, statsMinFtds: "" }))} aria-label="Clear min FTDs">{t("Clear")}</button>
                              ) : null}
                            </div>
                            <input type="number" min="0" placeholder="0" value={filters.statsMinFtds} onChange={updateFilter("statsMinFtds")} />
                          </div>
                        <button
                          type="button"
                          className={`filter-toggle field-wide${filters.statsProfitableOnly ? " is-on" : ""}`}
                          onClick={() => setFilters((prev) => ({ ...prev, statsProfitableOnly: !prev.statsProfitableOnly }))}
                          aria-pressed={filters.statsProfitableOnly}
                        >
                          <span className="filter-toggle-dot" aria-hidden="true" />
                          {t("Profitable rows only (revenue > spend)")}
                        </button>
                      </>
                    ) : null}
                    {isGeos ? (
                      <>
                        <div className="modal-section-label">
                          <MapIcon size={11} />
                          <span>{t("Geography")}</span>
                        </div>
                        <div className={`field${filters.city ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>{t("Region / State")}</label>
                            {filters.city ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, city: "" }))} aria-label="Clear region">{t("Clear")}</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder={t("All")}
                            value={filters.city}
                            onChange={updateFilter("city")}
                          />
                        </div>
                        <div className={`field${filters.geoCity ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>{t("City")}</label>
                            {filters.geoCity ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoCity: "" }))} aria-label="Clear city">{t("Clear")}</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder={t("All")}
                            value={filters.geoCity}
                            onChange={updateFilter("geoCity")}
                          />
                        </div>

                        <div className="modal-section-label">
                          <Link2 size={11} />
                          <span>{t("Source")}</span>
                        </div>
                        <div className={`field${filters.geoDomain ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>{t("Domain / Source")}</label>
                            {filters.geoDomain ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoDomain: "" }))} aria-label="Clear domain">{t("Clear")}</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder={t("All")}
                            value={filters.geoDomain}
                            onChange={updateFilter("geoDomain")}
                          />
                        </div>
                        <div className={`field${filters.geoPlacement ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>{t("Placement")}</label>
                            {filters.geoPlacement ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoPlacement: "" }))} aria-label="Clear placement">{t("Clear")}</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder={t("All")}
                            value={filters.geoPlacement}
                            onChange={updateFilter("geoPlacement")}
                          />
                        </div>
                        <div className={`field${filters.geoDevice ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>{t("Device")}</label>
                            {filters.geoDevice ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoDevice: "" }))} aria-label="Clear device">{t("Clear")}</button>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder={t("All")}
                            value={filters.geoDevice}
                            onChange={updateFilter("geoDevice")}
                          />
                        </div>

                        <div className="modal-section-label">
                          <BarChart3 size={11} />
                          <span>{t("Performance")}</span>
                        </div>
                        <div className={`field${Number(filters.geoMinClicks) > 0 ? " is-active" : ""}`}>
                          <div className="field-label-row">
                            <label>{t("Min Clicks")}</label>
                            {Number(filters.geoMinClicks) > 0 ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoMinClicks: "" }))} aria-label="Clear min clicks">{t("Clear")}</button>
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
                            <label>{t("Min FTDs")}</label>
                            {Number(filters.geoMinFtds) > 0 ? (
                              <button type="button" className="field-clear" onClick={() => setFilters((prev) => ({ ...prev, geoMinFtds: "" }))} aria-label="Clear min FTDs">{t("Clear")}</button>
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
                          <label>{t("Placement")}</label>
                          <input
                            type="text"
                            placeholder={t("All")}
                            value={filters.placementName}
                            onChange={updateFilter("placementName")}
                          />
                        </div>
                        {/* No "Domain / Source": live-stats groups placements by
                            day/campaign/country/sub_id_1 and returns no domain
                            field, so the filter matched nothing and blanked the
                            section. */}
                        <div className="field">
                          <label>{t("Min Clicks")}</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.placementMinClicks}
                            onChange={updateFilter("placementMinClicks")}
                          />
                        </div>
                        <div className="field">
                          <label>{t("Min Registers")}</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.placementMinRegisters}
                            onChange={updateFilter("placementMinRegisters")}
                          />
                        </div>
                        <div className="field">
                          <label>{t("Min FTDs")}</label>
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
                            {t("Only revenue > 0")}
                          </label>
                        </div>
                      </>
                    ) : null}
                    {isUserBehavior ? (
                      <>
                        {/* No "Domain / Source" here: /api/user-behavior returns
                            external_id, buyer, country, campaign, date and the
                            measures — there is no domain to match, so the filter
                            matched nothing and emptied the whole section the
                            moment it was typed into. Restoring it means adding
                            domain to the user_behavior sync first. */}
                        <div className="field">
                          <label>{t("Campaign")}</label>
                          <input
                            type="text"
                            placeholder={t("All")}
                            value={filters.userCampaign}
                            onChange={updateFilter("userCampaign")}
                          />
                        </div>
                        <div className="field">
                          <label>{t("External ID")}</label>
                          <input
                            type="text"
                            placeholder={t("All")}
                            value={filters.userExternalId}
                            onChange={updateFilter("userExternalId")}
                          />
                        </div>
                        <div className="field">
                          <label>{t("Min Revenue")}</label>
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
                          <label>{t("Min FTDs")}</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.userMinFtds}
                            onChange={updateFilter("userMinFtds")}
                          />
                        </div>
                        <div className="field">
                          <label>{t("Min Redeposits")}</label>
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
                            {t("Only users with revenue > 0")}
                          </label>
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="field">
                      <label>{t("Category")}</label>
                      <Select
                        value={filters.category || "All"}
                        onChange={(v) => setFilters((prev) => ({ ...prev, category: v }))}
                        options={categoryOptions}
                        allOption={{ value: "All", label: t("All") }}
                        placeholder={t("All")}
                      />
                    </div>

                    <div className="field">
                      <label>{t("Billing type")}</label>
                      <Select
                        value={filters.billing || "All"}
                        onChange={(v) => setFilters((prev) => ({ ...prev, billing: v }))}
                        options={billingOptions}
                        allOption={{ value: "All", label: t("All") }}
                        placeholder={t("All")}
                      />
                    </div>

                    <div className="field">
                      <label>{t("Status")}</label>
                      <Select
                        value={filters.status || "All"}
                        onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                        options={statusOptions}
                        allOption={{ value: "All", label: t("All") }}
                        placeholder={t("All")}
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
                      compareToPrev: false,
                    });
                    setCustomRange(defaultRange);
                    setPeriod("Custom range");
                  }}
                >
                  {t("Reset all")}
                </button>
                <button
                  className={`action-pill${filtersDirty ? " is-dirty" : ""}`}
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                >
                  {t("Apply Filters")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </LanguageContext.Provider>
    </MotionConfig>
  );
}
