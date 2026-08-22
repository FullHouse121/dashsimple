import React from "react";
import { CountryDropdownPicker, Select } from "../components/Select.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { MetaGlyph } from "../components/glyphs.jsx";
import { apiFetch } from "../lib/api.js";
import { appConfirm } from "../lib/confirm.jsx";
import { countryOptions, normalizeCountryListValue, normalizeDomainInputList } from "../lib/constants.js";
import { downloadCsv } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, dialogMotion, overlayMotion, rowMotion } from "../lib/motion.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { compareSortValues, getSortIndicator, toggleSortConfig } from "../lib/sort.js";
import { buildStatusOptions } from "../lib/status.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react";

export default function PixelsDashboard({ authUser }) {
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
  // Exports what is on screen — every filter and sort the user applied —
  // rather than the whole table, because the filtered view is the question
  // they were asking.
  // Exports what is on screen — every filter and sort the user applied —
  // rather than the whole table, because the filtered view is the question
  // they were asking. Owner comes from resolveOwnerLabel: pixels carry an
  // owner_id, never a name.
  const exportPixels = () => {
    downloadCsv(
      `pixels-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Pixel ID", "Status", "Domains", "GEO", "Owner", "Comment", "Created"],
      sortedPixelTableRows.map(({ pixel, flows, geos }) => {
        const owner = resolveOwnerLabel(pixel);
        return [
          pixel?.pixel_id || "",
          pixel?.status || "",
          (flows || []).join(" | "),
          (geos || []).join(" | "),
          owner && owner !== "—" ? owner : "",
          pixel?.comment || "",
          pixel?.created_at ? String(pixel.created_at).slice(0, 10) : "",
        ];
      })
    );
  };

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
            {...overlayMotion}
            onClick={closeCommentModal}
          >
            <motion.div
              className="modal comment-modal"
              {...dialogMotion}
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
            {...overlayMotion}
            onClick={closePixelEdit}
          >
            <motion.div
              className="modal pixel-edit-modal edit-modal-accent pixel-edit-accent"
              {...dialogMotion}
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
                    removable
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
        transition={{ duration: DURATION.settle, ease: EASE }}
      >
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><MetaGlyph size={20} /></span>
            <div>
              <h2 className="panel-title">{t("Pixels Registry")}</h2>
              <p className="panel-subtitle">{t("Manage FB pixels and tokens tied to your flows.")}</p>
            </div>
          </div>
          <div className="panel-head-actions">
            <span className="roles-count">
              {visiblePixels.length} {t("pixels")}
            </span>
            <button
              type="button"
              className="ghost registry-export-btn"
              onClick={exportPixels}
              disabled={!sortedPixelTableRows.length}
              title={t("Download what is on screen, filters and all")}
            >
              <Download size={13} /> {t("Export")}
            </button>
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
                removable
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
                {/* popLayout takes the leaving row out of flow immediately, so the
                    rows below start closing the gap while it fades rather than
                    jumping the moment it unmounts. */}
                <AnimatePresence mode="popLayout" initial={false}>
                {pagedPixelTableRows.map(({ pixel, ownerLabel, geos, flows }) => (
                  <motion.tr key={pixel.id} {...rowMotion}>
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
                  </motion.tr>
                ))}
                </AnimatePresence>
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
