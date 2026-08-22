import React from "react";
import { AccountCredentialsModal, CREDENTIAL_MASK } from "../components/AccountCredentials.jsx";
import { CountryDropdownPicker, Select } from "../components/Select.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { AccountIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { appConfirm } from "../lib/confirm.jsx";
import { accountRegistryCountryOptions, countryOptions, normalizeCountryListValue } from "../lib/constants.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, dialogMotion, overlayMotion, rowMotion } from "../lib/motion.js";
import { canReadAccountCredentials, isLeadershipRole } from "../lib/permissions.js";
import { compareSortValues, getSortIndicator, toggleSortConfig } from "../lib/sort.js";
import { STATUS_DOT_COLOR } from "../lib/status.js";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, KeyRound, Lock, Pencil, Plus, Search, Trash2, UserPlus, X } from "lucide-react";

export default function AccountsDashboard({ authUser }) {
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
  // Blank credential fields on the create form; on the edit form a stored
  // secret comes back as the mask, which the server reads as "unchanged".
  const emptyCredentials = {
    accountUid: "",
    password: "",
    totpSecret: "",
    backupEmail: "",
    backupEmailPassword: "",
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
    ...emptyCredentials,
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
      ...emptyCredentials,
    },
  });
  // Which row's credential vault is open.
  const [credentialsRow, setCredentialsRow] = React.useState(null);

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

  // Tighter than canManageRow: a Team Leader can edit a team member's account
  // but not open its credentials.
  const canReadCredentials = React.useCallback(
    (row) => canReadAccountCredentials(authUser, row),
    [authUser]
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
      accountUid: "",
      password: "",
      totpSecret: "",
      backupEmail: "",
      backupEmailPassword: "",
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
          accountUid: form.accountUid,
          backupEmail: form.backupEmail,
          password: form.password,
          totpSecret: form.totpSecret,
          backupEmailPassword: form.backupEmailPassword,
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
        accountUid: String(row?.account_uid || ""),
        backupEmail: String(row?.backup_email || ""),
        // Stored secrets never come down with the row — show the mask so the
        // field reads as "set", and send it back untouched unless retyped.
        password: row?.has_login_password ? CREDENTIAL_MASK : "",
        totpSecret: row?.has_totp ? CREDENTIAL_MASK : "",
        backupEmailPassword: row?.has_backup_email_password ? CREDENTIAL_MASK : "",
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
        accountUid: "",
        password: "",
        totpSecret: "",
        backupEmail: "",
        backupEmailPassword: "",
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
          accountUid: editModal.form.accountUid,
          backupEmail: editModal.form.backupEmail,
          password: editModal.form.password,
          totpSecret: editModal.form.totpSecret,
          backupEmailPassword: editModal.form.backupEmailPassword,
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
            {...overlayMotion}
            onClick={closeEditModal}
          >
            <motion.div
              className="modal accounts-modal edit-modal-accent accounts-edit-accent"
              {...dialogMotion}
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

                {canReadCredentials(editModal.row) ? (
                  <>
                    <div className="accounts-form-divider field-span-3">
                      <span>
                        <KeyRound size={12} aria-hidden="true" /> {t("Account access")}
                      </span>
                      <em>{t("Leave the dots to keep the stored value. Clear a field to remove it.")}</em>
                    </div>
                    <div className="field">
                      <label>{t("UID")}</label>
                      <input
                        value={editModal.form.accountUid}
                        onChange={updateEditForm("accountUid")}
                        maxLength={120}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <label>{t("Password")}</label>
                      <input
                        type="password"
                        value={editModal.form.password}
                        onChange={updateEditForm("password")}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="field">
                      <label>
                        {t("2FA secret")}{" "}
                        <span className="field-pace-hint">{t("we generate the codes")}</span>
                      </label>
                      <input
                        value={editModal.form.totpSecret}
                        onChange={updateEditForm("totpSecret")}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Backup email")}</label>
                      <input
                        type="email"
                        value={editModal.form.backupEmail}
                        onChange={updateEditForm("backupEmail")}
                        maxLength={190}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <label>{t("Backup email password")}</label>
                      <input
                        type="password"
                        value={editModal.form.backupEmailPassword}
                        onChange={updateEditForm("backupEmailPassword")}
                        autoComplete="new-password"
                      />
                    </div>
                  </>
                ) : null}
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

      <AnimatePresence>
        {credentialsRow ? (
          <AccountCredentialsModal
            row={accounts.find((row) => row.id === credentialsRow.id) || credentialsRow}
            onClose={() => setCredentialsRow(null)}
            t={t}
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        className="panel registry-dashboard-panel accounts-registry-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.settle, ease: EASE }}
      >
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><AccountIcon size={20} /></span>
            <div>
              <h2 className="panel-title">{t("Accounts Registry")}</h2>
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

            <div className="accounts-form-divider field-span-3">
              <span>
                <KeyRound size={12} aria-hidden="true" /> {t("Account access")}
              </span>
              <em>{t("Encrypted at rest. Only the owner and the Boss can read these back.")}</em>
            </div>
            <div className="field">
              <label>{t("UID")}</label>
              <input
                value={form.accountUid}
                onChange={updateForm("accountUid")}
                placeholder="61556… / profile id"
                maxLength={120}
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label>{t("Password")}</label>
              <input
                type="password"
                value={form.password}
                onChange={updateForm("password")}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label>
                {t("2FA secret")} <span className="field-pace-hint">{t("we generate the codes")}</span>
              </label>
              <input
                value={form.totpSecret}
                onChange={updateForm("totpSecret")}
                placeholder={t("the key you would paste into 2fa.live")}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="field">
              <label>{t("Backup email")}</label>
              <input
                type="email"
                value={form.backupEmail}
                onChange={updateForm("backupEmail")}
                placeholder="name@outlook.com"
                maxLength={190}
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label>{t("Backup email password")}</label>
              <input
                type="password"
                value={form.backupEmailPassword}
                onChange={updateForm("backupEmailPassword")}
                placeholder="••••••••"
                autoComplete="new-password"
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
                  <th className="col-access">{t("Access")}</th>
                  <th>{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {/* popLayout takes the leaving row out of flow immediately, so the
                    rows below start closing the gap while it fades rather than
                    jumping the moment it unmounts. */}
                <AnimatePresence mode="popLayout" initial={false}>
                {sortedAccountRows.map(({ row, ownerLabel, countries }) => {
                  const integrationState = resolveIntegrationState(row);
                  const checkResult = integrationCheckResult[row.id];
                  const rowCanManage = canManageRow(row);
                  return (
                    <motion.tr key={row.id} className={`accounts-row acc-row-${String(row.status || "").toLowerCase()}`} {...rowMotion}>
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
                      <td className="col-access">
                        {(() => {
                          // One button per row rather than a live code in every
                          // cell: the vault fetches a code only for the account
                          // actually being opened.
                          if (!canReadCredentials(row)) {
                            return <span className="offer-muted" title={t("Owner only")}>—</span>;
                          }
                          const stored = [
                            row.account_uid ? "UID" : null,
                            row.has_login_password ? t("PW") : null,
                            row.has_totp ? "2FA" : null,
                            row.backup_email ? "@" : null,
                          ].filter(Boolean);
                          if (!stored.length) {
                            return (
                              <button
                                type="button"
                                className="icon-btn accounts-access-empty"
                                onClick={() => openEditModal(row)}
                                aria-label={t("Add credentials")}
                                data-tip={t("Add credentials")}
                                disabled={!rowCanManage}
                              >
                                <KeyRound size={14} />
                              </button>
                            );
                          }
                          return (
                            <button
                              type="button"
                              className="accounts-access-btn"
                              onClick={() => setCredentialsRow(row)}
                              data-tip={t("Open credentials")}
                            >
                              <KeyRound size={13} />
                              <span className="accounts-access-tags">
                                {stored.map((tag) => (
                                  <em key={tag}>{tag}</em>
                                ))}
                              </span>
                            </button>
                          );
                        })()}
                      </td>
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
                    </motion.tr>
                  );
                })}
                </AnimatePresence>
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
