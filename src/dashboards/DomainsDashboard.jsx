import React from "react";
import { BrandMark } from "../components/BrandMark.jsx";
import { EntityHistory } from "../components/EntityHistory.jsx";
import { CountryDropdownPicker, Select } from "../components/Select.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { FlowsIcon } from "../components/glyphs.jsx";
import { DomainIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { countryOptions, normalizeCountryListValue, normalizeDomainInputList, roleOptions } from "../lib/constants.js";
import { downloadCsv } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, dialogMotion, overlayMotion, rowMotion } from "../lib/motion.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { compareSortValues, getSortIndicator, toggleSortConfig } from "../lib/sort.js";
import { STATUS_DOT_COLOR, buildStatusOptions } from "../lib/status.js";
import { maskEaagToken } from "../lib/view-helpers.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Download,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  ScrollText,
  Search,
  Settings,
  Trash2,
  X,
  Zap,
} from "lucide-react";

export default function DomainsDashboard({ authUser }) {
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

  // Link id → name for the Flows column (which tracking links each domain
  // serves). Best-effort: the table renders fine with bare #ids meanwhile.
  const [trackingLinkNamesById, setTrackingLinkNamesById] = React.useState(() => new Map());
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetch("/api/tracking-links?limit=500");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setTrackingLinkNamesById(
            new Map((Array.isArray(data) ? data : []).map((l) => [Number(l.id), l.name]))
          );
        }
      } catch (error) {
        /* names are cosmetic */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  const [pixels, setPixels] = React.useState([]);
  // Pixel wiring inside the domain modal — applies straight away (it writes
  // to the pixel, not the domain), so it keeps its own busy/error state.
  const [pixelWire, setPixelWire] = React.useState({ busy: null, error: null, replacing: null, adding: false });
  const [newPixelForm, setNewPixelForm] = React.useState({ pixelId: "", tokenEaag: "", geos: [] });

  const openDomainEdit = (domain) => {
    if (!domain?.id) return;
    setPixelWire({ busy: null, error: null, replacing: null, adding: false });
    setNewPixelForm({ pixelId: "", tokenEaag: "", geos: [] });
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
    setPixelWire({ busy: null, error: null, replacing: null, adding: false });
    setNewPixelForm({ pixelId: "", tokenEaag: "", geos: [] });
  };

  // ── Pixels on the domain being edited ──────────────────────────────
  // Attachment lives on the pixel's `flows` list, keyed by the domain host
  // as saved (renaming the domain is a separate, explicit Save Changes).
  const editHost = React.useMemo(
    () => normalizeDomainInputList(domainEdit.domain?.domain)[0] || "",
    [domainEdit.domain]
  );
  const pixelHosts = React.useCallback((pixel) => normalizeDomainInputList(pixel?.flows), []);
  const attachedPixels = React.useMemo(() => {
    if (!editHost) return [];
    return pixels
      .filter((p) => pixelHosts(p).includes(editHost))
      .sort((a, b) => String(a.pixel_id || "").localeCompare(String(b.pixel_id || ""), undefined, { numeric: true }));
  }, [pixels, editHost, pixelHosts]);
  const detachedPixels = React.useMemo(() => {
    if (!editHost) return [];
    return pixels
      .filter((p) => !pixelHosts(p).includes(editHost))
      .sort((a, b) => String(a.pixel_id || "").localeCompare(String(b.pixel_id || ""), undefined, { numeric: true }));
  }, [pixels, editHost, pixelHosts]);

  const patchPixelFlows = async (pixel, nextHosts) => {
    const response = await apiFetch(`/api/pixels/${pixel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flows: nextHosts }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      throw new Error(detail?.error || "Failed to update the pixel.");
    }
  };

  const attachPixelToDomain = async (pixelId) => {
    const pixel = pixels.find((p) => String(p.id) === String(pixelId));
    if (!pixel || !editHost) return;
    setPixelWire((prev) => ({ ...prev, busy: `attach-${pixel.id}`, error: null }));
    try {
      await patchPixelFlows(pixel, Array.from(new Set([...pixelHosts(pixel), editHost])));
      await fetchPixels();
      setPixelWire({ busy: null, error: null, replacing: null, adding: false });
    } catch (error) {
      setPixelWire((prev) => ({ ...prev, busy: null, error: error.message || "Failed to attach the pixel." }));
    }
  };

  const detachPixelFromDomain = async (pixel) => {
    if (!pixel || !editHost) return;
    setPixelWire((prev) => ({ ...prev, busy: `detach-${pixel.id}`, error: null }));
    try {
      await patchPixelFlows(pixel, pixelHosts(pixel).filter((host) => host !== editHost));
      await fetchPixels();
      setPixelWire((prev) => ({ ...prev, busy: null, replacing: null }));
    } catch (error) {
      setPixelWire((prev) => ({ ...prev, busy: null, error: error.message || "Failed to remove the pixel." }));
    }
  };

  // Swap one pixel for another in a single step: the old one loses this
  // domain, the new one gains it. Its other domains are left untouched.
  const replacePixelOnDomain = async (oldPixel, nextPixelId) => {
    const next = pixels.find((p) => String(p.id) === String(nextPixelId));
    if (!oldPixel || !next || !editHost) return;
    setPixelWire((prev) => ({ ...prev, busy: `replace-${oldPixel.id}`, error: null }));
    try {
      await patchPixelFlows(oldPixel, pixelHosts(oldPixel).filter((host) => host !== editHost));
      await patchPixelFlows(next, Array.from(new Set([...pixelHosts(next), editHost])));
      await fetchPixels();
      setPixelWire({ busy: null, error: null, replacing: null, adding: false });
    } catch (error) {
      setPixelWire((prev) => ({ ...prev, busy: null, error: error.message || "Failed to replace the pixel." }));
    }
  };

  const toggleNewPixelGeo = React.useCallback((geo) => {
    const normalized = String(geo || "").trim();
    if (!normalized) return;
    setNewPixelForm((prev) => {
      const current = normalizeCountryListValue(prev.geos);
      return {
        ...prev,
        geos: current.includes(normalized) ? current.filter((g) => g !== normalized) : [...current, normalized],
      };
    });
  }, []);

  const createPixelOnDomain = async () => {
    if (!editHost) return;
    const pixelId = String(newPixelForm.pixelId || "").trim();
    const tokenEaag = String(newPixelForm.tokenEaag || "").trim();
    const geos = normalizeCountryListValue(newPixelForm.geos);
    if (!pixelId || !tokenEaag || !geos.length) {
      setPixelWire((prev) => ({ ...prev, error: "Pixel ID, EAAG token and at least one GEO are required." }));
      return;
    }
    setPixelWire((prev) => ({ ...prev, busy: "create", error: null }));
    try {
      const response = await apiFetch("/api/pixels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixelId, tokenEaag, geos, flows: [editHost], status: "Active" }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to create the pixel.");
      }
      setNewPixelForm({ pixelId: "", tokenEaag: "", geos: [] });
      await fetchPixels();
      setPixelWire({ busy: null, error: null, replacing: null, adding: false });
    } catch (error) {
      setPixelWire((prev) => ({ ...prev, busy: null, error: error.message || "Failed to create the pixel." }));
    }
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

  // Pixels are attached to a domain through their own `flows` list, so the
  // domain editor manages them by rewriting that list on the pixel.
  const fetchPixels = React.useCallback(async () => {
    try {
      const response = await apiFetch("/api/pixels?limit=500");
      if (!response.ok) return;
      const data = await response.json();
      setPixels(Array.isArray(data) ? data : []);
    } catch (error) {
      /* the pixel section degrades to empty */
    }
  }, []);

  React.useEffect(() => {
    fetchDomains();
    fetchUsers();
    fetchPixels();
  }, [fetchDomains, fetchUsers, fetchPixels]);

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

  // Rows here are { domain, ownerLabel, countries } — the owner is resolved
  // for display and never lands on the record itself, so the export has to
  // read the same shape the table renders.
  const exportDomains = () => {
    downloadCsv(
      `domains-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Domain", "Status", "GEO", "Game", "Platform", "Owner", "Flows bound", "Created"],
      sortedDomainRows.map(({ domain, ownerLabel, countries }) => [
        domain?.domain || "",
        domain?.status || "",
        (countries || []).join(" | "),
        domain?.game || "",
        domain?.platform || "",
        ownerLabel && ownerLabel !== "—" ? ownerLabel : "",
        Array.isArray(domain?.tracking_link_ids) ? domain.tracking_link_ids.length : 0,
        domain?.created_at ? String(domain.created_at).slice(0, 10) : "",
      ])
    );
  };

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
        transition={{ duration: DURATION.settle, ease: EASE }}
      >
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><DomainIcon size={20} /></span>
            <div>
              <h2 className="panel-title">{t("Domains Registry")}</h2>
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
              className="ghost registry-export-btn"
              onClick={exportDomains}
              disabled={!sortedDomainRows.length}
              title={t("Download what is on screen, filters and all")}
            >
              <Download size={13} /> {t("Export")}
            </button>
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
                  <th>{t("Flows")}</th>
                  <th className="col-actions">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout" initial={false}>
                {pagedDomainRows.map(({ domain, ownerLabel, countries }) => (
                  <motion.tr key={domain.id} {...rowMotion}>
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
                      {(() => {
                        const ids = Array.isArray(domain.tracking_link_ids)
                          ? domain.tracking_link_ids
                          : domain.tracking_link_id
                            ? [domain.tracking_link_id]
                            : [];
                        if (!ids.length) return <span className="offer-muted">—</span>;
                        const names = ids.map((id) => trackingLinkNamesById.get(Number(id)) || `#${id}`);
                        return (
                          <span className="flow-count-pill" title={names.join("\n")}>
                            <FlowsIcon size={12} /> {ids.length}
                          </span>
                        );
                      })()}
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
                  </motion.tr>
                ))}
                </AnimatePresence>
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
            className="modal-overlay modal-overlay-scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDomainEdit}
          >
            <motion.div
              className="modal pixel-edit-modal edit-modal-accent domain-edit-accent"
              {...dialogMotion}
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

                {/* Pixels wired to this domain — add, swap or detach. These
                    write to the pixel, so they apply on click, not on Save. */}
                <div className="field field-span-2 domain-pixels-field">
                  <label>
                    <Zap size={12} /> {t("Pixels on this domain")}
                    <span className="domain-pixels-count">{attachedPixels.length}</span>
                    <span className="field-pace-hint">{t("applied immediately")}</span>
                  </label>
                  {attachedPixels.length ? (
                    <div className="domain-pixel-list">
                      {attachedPixels.map((pixel) => {
                        const active = String(pixel.status || "Active").toLowerCase() === "active";
                        const geos = normalizeCountryListValue(pixel.geo);
                        const others = pixelHosts(pixel).filter((host) => host !== editHost);
                        const busyKey = pixelWire.busy;
                        const isReplacing = String(pixelWire.replacing) === String(pixel.id);
                        return (
                          <div className={`domain-pixel-row${isReplacing ? " is-replacing" : ""}`} key={pixel.id}>
                            <div className="domain-pixel-main">
                              <span className={`flow-pixel-dot${active ? " is-active" : " is-off"}`} />
                              <span className="domain-pixel-id">{pixel.pixel_id}</span>
                              {geos.length ? (
                                <span className="domain-pixel-geos" title={geos.join(", ")}>
                                  {geos.map((g) => <CountryFlag key={g} value={g} />)}
                                </span>
                              ) : null}
                              <code className="domain-pixel-token" title={pixel.token_eaag}>{maskEaagToken(pixel.token_eaag)}</code>
                              {others.length ? (
                                <span className="domain-pixel-shared" title={others.join(", ")}>
                                  {others.length === 1
                                    ? t("also on 1 other domain")
                                    : t("also on {n} other domains").replace("{n}", String(others.length))}
                                </span>
                              ) : null}
                              <div className="domain-pixel-actions">
                                <button
                                  type="button"
                                  className="domain-pixel-btn"
                                  disabled={!!busyKey || !detachedPixels.length}
                                  title={detachedPixels.length ? t("Replace with another pixel") : t("No other pixels available")}
                                  onClick={() => setPixelWire((prev) => ({ ...prev, replacing: isReplacing ? null : pixel.id, error: null }))}
                                >
                                  <RefreshCw size={13} /> {t("Replace")}
                                </button>
                                <button
                                  type="button"
                                  className="domain-pixel-btn is-danger"
                                  disabled={!!busyKey}
                                  title={t("Remove this pixel from the domain")}
                                  onClick={() => detachPixelFromDomain(pixel)}
                                >
                                  {busyKey === `detach-${pixel.id}` ? t("Removing…") : <><X size={13} /> {t("Remove")}</>}
                                </button>
                              </div>
                            </div>
                            {isReplacing ? (
                              <div className="domain-pixel-replace">
                                <Select
                                  value=""
                                  onChange={(value) => replacePixelOnDomain(pixel, value)}
                                  options={detachedPixels.map((p) => ({
                                    value: String(p.id),
                                    label: `${p.pixel_id}${normalizeCountryListValue(p.geo).length ? ` · ${normalizeCountryListValue(p.geo).join(", ")}` : ""}`,
                                  }))}
                                  placeholder={busyKey === `replace-${pixel.id}` ? t("Replacing…") : t("Pick the replacement pixel")}
                                  searchPlaceholder={t("Find pixel")}
                                  emptyResultsLabel={t("No pixels found.")}
                                />
                                <button type="button" className="domain-pixel-btn" onClick={() => setPixelWire((prev) => ({ ...prev, replacing: null }))}>
                                  {t("Cancel")}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="domain-pixel-empty">{t("No pixels attached to this domain yet.")}</div>
                  )}

                  {/* Pixels point at the host by name, so a rename would leave
                      them on the old one — say so before Save Changes. */}
                  {attachedPixels.length &&
                  normalizeDomainInputList(domainEdit.form.domain)[0] &&
                  normalizeDomainInputList(domainEdit.form.domain)[0] !== editHost ? (
                    <p className="field-hint domain-pixel-rename-warning">
                      <AlertTriangle size={12} />{" "}
                      {t("Saving the new domain name leaves these pixels on {host} — re-attach them afterwards.").replace("{host}", editHost)}
                    </p>
                  ) : null}

                  <div className="domain-pixel-attach">
                    <Select
                      className="domain-pixel-attach-select"
                      value=""
                      onChange={(value) => attachPixelToDomain(value)}
                      options={detachedPixels.map((p) => ({
                        value: String(p.id),
                        label: `${p.pixel_id}${normalizeCountryListValue(p.geo).length ? ` · ${normalizeCountryListValue(p.geo).join(", ")}` : ""}`,
                      }))}
                      placeholder={detachedPixels.length ? t("Attach an existing pixel…") : t("Every pixel is already attached")}
                      searchPlaceholder={t("Find pixel")}
                      emptyResultsLabel={t("No pixels found.")}
                    />
                    <button
                      type="button"
                      className={`domain-pixel-btn is-add${pixelWire.adding ? " is-active" : ""}`}
                      onClick={() => setPixelWire((prev) => ({ ...prev, adding: !prev.adding, error: null }))}
                    >
                      {pixelWire.adding ? <><X size={13} /> {t("Close")}</> : <><Plus size={13} strokeWidth={2.5} /> {t("New pixel")}</>}
                    </button>
                  </div>

                  {pixelWire.adding ? (
                    <div className="domain-pixel-new">
                      <div className="field">
                        <label>{t("Pixel ID")}</label>
                        <input
                          value={newPixelForm.pixelId}
                          onChange={(e) => setNewPixelForm((prev) => ({ ...prev, pixelId: e.target.value }))}
                          placeholder="123456789012345"
                          autoComplete="off"
                        />
                      </div>
                      <div className="field">
                        <label>{t("EAAG Token")}</label>
                        <input
                          value={newPixelForm.tokenEaag}
                          onChange={(e) => setNewPixelForm((prev) => ({ ...prev, tokenEaag: e.target.value }))}
                          placeholder="EAAG…"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                      <div className="field field-span-2">
                        <label>{t("Geos")}</label>
                        <CountryDropdownPicker
                          multiple
                          removable
                          values={newPixelForm.geos}
                          onToggle={toggleNewPixelGeo}
                          options={countryOptions}
                          placeholder={t("Pick countries")}
                          searchPlaceholder={t("Type to find countries")}
                          emptyResultsLabel={t("No countries found.")}
                        />
                      </div>
                      <div className="domain-pixel-new-actions">
                        <button type="button" className="action-pill" disabled={pixelWire.busy === "create"} onClick={createPixelOnDomain}>
                          {pixelWire.busy === "create" ? t("Saving…") : t("Create & attach")}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {pixelWire.error ? <div className="pw-error domain-pixel-error">{pixelWire.error}</div> : null}
                </div>

                <div className="field field-span-2 domain-pixels-field">
                  <label><ScrollText size={12} /> {t("History")}</label>
                  <EntityHistory type="domain" id={domainEdit.domain?.id} limit={5} />
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
            {...overlayMotion}
            onClick={closeOgDebug}
          >
            <motion.div
              className="modal og-debug-modal"
              {...dialogMotion}
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
