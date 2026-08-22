import React from "react";
import keitaroLogo from "../assets/brands/keitaro.svg";
import { BrandMark, resolveBrandLogo } from "../components/BrandMark.jsx";
import { CountryDropdownPicker, Select } from "../components/Select.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { CostIcon, TriggerIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { appConfirm } from "../lib/confirm.jsx";
import { buyerOptions } from "../lib/constants.js";
import { formatCurrency } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { friendlyKeitaroError } from "../lib/keitaro-errors.js";
import { dialogMotion, overlayMotion } from "../lib/motion.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Lock,
  Maximize2,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

export default function MetaTokenDashboard({ authUser, buyerFilterOptions = [] }) {
  const { t } = useLanguage();
  const canManage = isLeadershipRole(authUser?.role);
  const [integrations, setIntegrations] = React.useState([]);
  const [integrationState, setIntegrationState] = React.useState({ loading: true, error: null });
  const [keitaroCosts, setKeitaroCosts] = React.useState([]);
  const [editCost, setEditCost] = React.useState({ open: false, id: null, name: "", account: "", token: "", saving: false, error: null });
  const [costsState, setCostsState] = React.useState({ loading: true, error: null });
  const [costSearch, setCostSearch] = React.useState("");
  const [copiedAccount, setCopiedAccount] = React.useState(null);
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
    comment: "",
    campaignIds: [],
    apiVersion: "25",
    updateInterval: "20",
    useProxy: false,
  });

  const updateForm = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetForm = () => {
    setForm({
      accountNumber: "",
      token: "",
      buyerName: "",
      comment: "",
      campaignIds: [],
      apiVersion: "25",
      updateInterval: "20",
      useProxy: false,
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

  // Deterministic avatar hue per buyer, so rows are easier to track.
  const buyerHue = React.useCallback((name) => {
    const s = String(name || "");
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }, []);

  const copyAccount = React.useCallback(async (value, id) => {
    if (!value) return;
    try {
      await navigator.clipboard?.writeText(String(value));
      setCopiedAccount(id);
      setTimeout(() => setCopiedAccount(null), 1400);
    } catch { /* clipboard blocked — no-op */ }
  }, []);

  // Filter (buyer / account / name) + errors-first sort for the costs table.
  const visibleCosts = React.useMemo(() => {
    const q = costSearch.trim().toLowerCase();
    const filtered = q
      ? keitaroCosts.filter((r) =>
          [r.name, r.buyer, r.account_id].some((v) => String(v || "").toLowerCase().includes(q)))
      : keitaroCosts;
    return [...filtered].sort((a, b) => {
      const ae = a.status === "Error" ? 0 : 1;
      const be = b.status === "Error" ? 0 : 1;
      if (ae !== be) return ae - be;
      return String(a.buyer || a.name || "").localeCompare(String(b.buyer || b.name || ""));
    });
  }, [keitaroCosts, costSearch]);

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

  // Registered buyers only — sourced live from Keitaro's campaign groups (passed
  // down from App), so the picker isn't polluted with media-buyer profile names
  // (e.g. KRBR) or raw logins (e.g. Leomarketing). Attribution stays correct:
  // the Keitaro FB cost integrations already use these same short buyer names
  // ("Leo | …", "Matheus | …").
  const buyerOptions = buyerFilterOptions;

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

  // Campaigns for the selected buyer, for the Keitaro-style "Choose campaigns"
  // multi-select. Leadership picks the buyer; other roles get their own.
  const [buyerCampaigns, setBuyerCampaigns] = React.useState([]);
  const [campaignsState, setCampaignsState] = React.useState({ loading: false, error: null });
  const campaignBuyer = canManage ? String(form.buyerName || "").trim() : autoBuyerName;
  React.useEffect(() => {
    if (!campaignBuyer) {
      setBuyerCampaigns([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        setCampaignsState({ loading: true, error: null });
        const qs = canManage ? `?buyer=${encodeURIComponent(campaignBuyer)}` : "";
        const res = await apiFetch(`/api/keitaro/buyer-campaigns${qs}`);
        if (!res.ok) throw new Error("Could not load campaigns.");
        const data = await res.json();
        if (!cancelled) {
          setBuyerCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : []);
          setCampaignsState({ loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setBuyerCampaigns([]);
          setCampaignsState({ loading: false, error: error.message || "Could not load campaigns." });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignBuyer, canManage]);

  // Selected campaigns belong to a buyer — clear them when the buyer changes.
  React.useEffect(() => {
    setForm((prev) => (prev.campaignIds?.length ? { ...prev, campaignIds: [] } : prev));
  }, [campaignBuyer]);

  const toggleFormCampaign = (id) => {
    setForm((prev) => {
      const set = new Set((prev.campaignIds || []).map(String));
      if (set.has(String(id))) set.delete(String(id));
      else set.add(String(id));
      return { ...prev, campaignIds: Array.from(set) };
    });
  };

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
          comment: form.comment,
          campaignIds: (form.campaignIds || []).map((id) => Number.parseInt(id, 10)).filter(Number.isFinite),
          apiVersion: form.apiVersion || "25",
          updateInterval: form.updateInterval || "20",
          useProxy: Boolean(form.useProxy),
        }),
      });
      const detail = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(detail?.error || "Failed to save integration.");
      }
      await Promise.all([fetchIntegrations(), fetchKeitaroCosts(), fetchAccountOptions?.()]);
      const requested = Number(detail?.campaignsRequested || 0);
      const attached = Number(detail?.campaignsAttached || 0);
      const saved = requested ? `Saved · ${attached}/${requested} campaigns attached` : "Integration saved";
      // "Saved" only ever meant "written down". The server now tries the token
      // against Meta on the way through, so say which of the two happened —
      // a buyer who pastes a dead token should find out here, not from a red
      // row in Health a week later.
      const check = detail?.tokenCheck;
      if (check && !check.ok) {
        setCopyFeedback(null);
        setIntegrationState({
          loading: false,
          error: `${saved}, but Meta rejected the token — ${check.summary}. ${check.action || ""}`.trim(),
        });
      } else {
        setCopyFeedback(check?.ok ? `${saved} · token verified with Meta` : saved);
      }
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
    // Liveness = cost inside the recent window; the lifetime total stays green
    // forever after the first dollar. Fall back to lifetime while the API
    // predates recent_received_spend.
    const recentSpend = Number(
      selectedBinding.recent_received_spend ?? selectedBinding.received_spend ?? 0
    );
    const keitaroError = String(selectedBinding.keitaro_last_error || "").trim();
    const metaTokenReady = Boolean(String(selectedBinding.meta_token || "").trim());
    const accountReady = Boolean(String(selectedBinding.account_number || "").trim());
    const buyerReady = Boolean(String(selectedBinding.buyer_name || "").trim());
    const costReady = recentSpend > 0;
    const metaWorking = metaTokenReady && costReady && !keitaroError;
    const checks = [
      {
        key: "meta",
        label: "Meta Token",
        value: keitaroError ? "Token error (Keitaro)" : metaWorking ? "Working" : "Not working",
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
        value: recentSpend > 0 ? formatCurrency(recentSpend) : "$0.00",
        ok: costReady,
      },
    ];
    const wired = checks.every((item) => item.ok);
    return { checks, wired };
  }, [selectedBinding]);

  const bindingIssues = React.useMemo(() => {
    if (!bindingChecks) return [];
    const keitaroError = String(selectedBinding?.keitaro_last_error || "").trim();
    return bindingChecks.checks
      .filter((item) => !item.ok)
      .map((item) => {
        if (item.key === "meta" && keitaroError) return `Keitaro: ${keitaroError}`;
        if (item.key === "cost") return "No cost received in the last 3 days";
        return `${item.label} missing`;
      });
  }, [bindingChecks, selectedBinding?.keitaro_last_error]);

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
            <h2 className="panel-title">Bindings</h2>
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
                        cost: "received from Keitaro · last 3 days",
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
                      const spendScope = selectedBinding?.spend_scope || "buyer";
                      const spendCampaigns = Number(selectedBinding?.spend_campaigns || 0);
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
                              <span className="bf-icon-tile"><CostIcon size={18} strokeWidth={2} /></span>
                              <span className="bf-head-text">
                                <span className="bf-kicker">Integration</span>
                                <span className="bf-subkicker" style={{ color: modeColor }}>{modeLabel}</span>
                              </span>
                            </div>
                            <div className="bf-amount">
                              {formatCurrency(receivedSpend)}
                              <span className="bf-amount-unit">USD</span>
                            </div>
                            {/* Say which question the number answers. Attributed
                                through this integration's own campaigns where it
                                is linked to Keitaro; otherwise it is the buyer's
                                total across every account they run, which is a
                                different figure and must not be read as this
                                account's spend. */}
                            <div className="bf-amount-scope">
                              {spendScope === "account"
                                ? `${t("this account")}${spendCampaigns ? ` · ${spendCampaigns} ${spendCampaigns === 1 ? t("campaign") : t("campaigns")}` : ""}`
                                : t("buyer total — account not linked to Keitaro")}
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
                              <span className="bf-icon-tile"><TriggerIcon size={18} strokeWidth={2} /></span>
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
            <h2 className="panel-title">Meta Token $</h2>
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
          <div className="field field-span-2">
            <label>Comment</label>
            <input value={form.comment} onChange={updateForm("comment")} placeholder="Optional note for this integration" />
          </div>
          <div className="field field-span-3">
            <label>Campaigns <span className="field-pace-hint">attribute this cost to specific Keitaro campaigns (optional)</span></label>
            <CountryDropdownPicker
              multiple
              removable
              values={form.campaignIds}
              onToggle={toggleFormCampaign}
              options={buyerCampaigns.map((c) => ({ value: String(c.id), label: c.name, search: c.name }))}
              placeholder={
                campaignsState.loading
                  ? "Loading campaigns…"
                  : !campaignBuyer
                    ? "Pick a buyer first"
                    : buyerCampaigns.length
                      ? "Select campaigns"
                      : "No campaigns for this buyer"
              }
              searchPlaceholder="Find campaign"
              emptyResultsLabel="No campaigns found."
            />
          </div>
          <div className="field">
            <label>Facebook API version</label>
            <Select
              value={form.apiVersion}
              onChange={(v) => setForm((prev) => ({ ...prev, apiVersion: v }))}
              options={["25", "24", "23", "22", "21", "20", "19"].map((v) => ({ value: v, label: `v${v}` }))}
              placeholder="v25"
              searchPlaceholder="Version"
            />
          </div>
          <div className="field">
            <label>Update costs every</label>
            <Select
              value={form.updateInterval}
              onChange={(v) => setForm((prev) => ({ ...prev, updateInterval: v }))}
              options={[
                ["10", "10 minutes"],
                ["15", "15 minutes"],
                ["20", "20 minutes"],
                ["30", "30 minutes"],
                ["60", "1 hour"],
                ["120", "2 hours"],
              ].map(([value, label]) => ({ value, label }))}
              placeholder="20 minutes"
              searchPlaceholder="Interval"
            />
          </div>
          <div className={`field field-inline ${form.useProxy ? "is-on" : ""}`}>
            <label className="ios-switch ios-switch-accent">
              <input
                type="checkbox"
                checked={form.useProxy}
                onChange={(event) => setForm((prev) => ({ ...prev, useProxy: event.target.checked }))}
              />
              <span className="ios-switch-track" aria-hidden="true"><span className="ios-switch-knob" /></span>
              <span className="ios-switch-label">Use proxy</span>
            </label>
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
            <div className="meta-costs-head-left">
              <h4 className="meta-costs-title"><img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" /></h4>
              <p className="meta-costs-sub">{t("Facebook costs — live from Keitaro")}</p>
            </div>
            <div className="meta-costs-head-right">
              {keitaroCosts.length ? (
                <>
                  <div className="mc-search">
                    <Search size={14} className="mc-search-icon" />
                    <input
                      type="text"
                      value={costSearch}
                      onChange={(e) => setCostSearch(e.target.value)}
                      placeholder={t("Filter buyer or account…")}
                    />
                    {costSearch ? (
                      <button type="button" className="mc-search-clear" onClick={() => setCostSearch("")} aria-label={t("Clear filter")}>×</button>
                    ) : null}
                  </div>
                  <div className="meta-costs-summary">
                    <span className="mcs-stat"><b>{keitaroCosts.length}</b> {t("integrations")}</span>
                    {keitaroCosts.filter((r) => r.status === "Error").length ? (
                      <span className="mcs-stat is-error">
                        <span className="mcs-dot" /><b>{keitaroCosts.filter((r) => r.status === "Error").length}</b> {t("failing")}
                      </span>
                    ) : (
                      <span className="mcs-stat is-ok"><span className="mcs-dot" />{t("all healthy")}</span>
                    )}
                  </div>
                </>
              ) : null}
              <button className="ghost mc-sync-btn" type="button" onClick={fetchKeitaroCosts} disabled={costsState.loading} title={t("Refresh from Keitaro")}>
                <RotateCcw size={14} className={costsState.loading ? "mc-spin" : ""} /> {costsState.loading ? t("Syncing…") : t("Sync")}
              </button>
            </div>
          </div>
          <div className="mc-table-wrap">
            <div className="mc-table" role="table">
              <div className="mc-thead" role="row">
                <span role="columnheader">{t("Integration")}</span>
                <span role="columnheader">{t("Buyer")}</span>
                <span role="columnheader">{t("Ad account")}</span>
                <span role="columnheader">{t("Status")}</span>
                <span role="columnheader">{t("Details")}</span>
                <span role="columnheader" className="mc-col-actions">{t("Actions")}</span>
              </div>
              {costsState.loading ? (
                <div className="mc-empty">{t("Loading Facebook costs from Keitaro…")}</div>
              ) : keitaroCosts.length === 0 ? (
                <div className="mc-empty">{costsState.error || t("No Facebook cost integrations in Keitaro yet. Add one above.")}</div>
              ) : visibleCosts.length === 0 ? (
                <div className="mc-empty">{t("No integrations match")} “{costSearch}”.</div>
              ) : (
                visibleCosts.map((row) => {
                  const isError = row.status === "Error";
                  const parts = String(row.name || "").split("|").map((s) => s.trim()).filter(Boolean);
                  const brand = parts.length >= 2 ? parts[1] : parts[0] || row.name || "—";
                  const geo = parts.length >= 3 ? parts.slice(2).join(" ") : "";
                  const brandHit = resolveBrandLogo(brand);
                  const buyerLabel = row.buyer || (parts.length ? parts[0] : "");
                  const initials = String(buyerLabel || "?").trim().slice(0, 2).toUpperCase();
                  const hue = buyerHue(buyerLabel);
                  return (
                    <div className={`mc-row${isError ? " is-error" : ""}`} role="row" key={row.id}>
                      <div className="mc-cell mc-name" role="cell">
                        <span className={`mc-brand-tile${brandHit ? "" : " is-generic"}`}>
                          {brandHit ? <BrandMark value={brand} height={18} /> : <span className="mc-brand-initial">{String(brand).slice(0, 1).toUpperCase()}</span>}
                        </span>
                        <span className="mc-name-text">
                          <span className="mc-name-primary">{brand}</span>
                          {geo ? (
                            <span className="mc-name-sub"><CountryFlag value={geo} /> {geo}</span>
                          ) : (
                            <span className="mc-name-sub is-muted">{t("Facebook cost source")}</span>
                          )}
                        </span>
                      </div>
                      <div className="mc-cell" role="cell">
                        {buyerLabel ? (
                          <span className="mc-buyer">
                            <span
                              className="mc-avatar"
                              style={{
                                background: `linear-gradient(135deg, hsl(${hue} 70% 58%), hsl(${(hue + 28) % 360} 68% 46%))`,
                                boxShadow: `0 2px 8px hsl(${hue} 70% 50% / 0.28)`,
                                color: "#0b1512",
                              }}
                            >
                              {initials}
                            </span>
                            {buyerLabel}
                          </span>
                        ) : <span className="offer-muted">{t("Unassigned")}</span>}
                      </div>
                      <div className="mc-cell" role="cell">
                        <button
                          type="button"
                          className={`mc-account mono${copiedAccount === row.id ? " is-copied" : ""}`}
                          onClick={() => copyAccount(row.account_id, row.id)}
                          disabled={!row.account_id}
                          title={row.account_id ? t("Copy ad account") : ""}
                        >
                          {row.account_id || "—"}
                          {row.account_id ? (copiedAccount === row.id ? <CheckCircle size={12} /> : <Copy size={12} />) : null}
                        </button>
                      </div>
                      <div className="mc-cell" role="cell">
                        <span className={`mc-status ${isError ? "is-error" : "is-ok"}`}>
                          <span className="mc-status-dot" />{isError ? t("Error") : t("Active")}
                        </span>
                      </div>
                      {/* Three outcomes, not two. A working connection that has
                          not delivered spend yet is not an error — Keitaro only
                          pulls from start_date forward and never backfills. */}
                      <div className="mc-cell mc-details" role="cell" title={row.last_raw_error || row.last_error || ""}>
                        {isError ? (
                          <span className="mc-error-text"><AlertTriangle size={12} /> {friendlyKeitaroError(row.last_error || row.last_raw_error)}</span>
                        ) : row.health === "awaiting" ? (
                          <span className="mc-ok-text">
                            <Clock size={12} /> {t("Connected — no cost tracked yet")}
                          </span>
                        ) : (
                          <span className="mc-ok-text"><CheckCircle size={12} /> {t("Receiving cost")}</span>
                        )}
                      </div>
                      <div className="mc-cell mc-col-actions" role="cell">
                        <div className="inline-actions">
                          {isError ? (
                            <button className="mc-fix-btn" type="button" onClick={() => openEditCost(row)} title={t("Replace the expired token")}>
                              <Wrench size={12} /> {t("Fix token")}
                            </button>
                          ) : (
                            <button className="icon-btn" type="button" onClick={() => openEditCost(row)} title={t("Replace token / edit")}>
                              <Pencil size={14} />
                            </button>
                          )}
                          <button className="icon-btn danger" type="button" onClick={() => handleDeleteKeitaroCost(row.id, row.name)} title={t("Delete from Keitaro")}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
      </motion.div>

      <AnimatePresence>
          {editCost.open ? (
            <motion.div className="modal-overlay mc-edit-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeEditCost}>
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
                    <label>{t("New cost token")}</label>
                    <input
                      type="text"
                      value={editCost.token}
                      onChange={(e) => setEditCost((s) => ({ ...s, token: e.target.value }))}
                      placeholder={t("Paste the new cost integration token…")}
                      autoFocus
                    />
                    <p className="field-hint">{t("This is the Facebook cost-integration token Keitaro uses to pull spend — not the pixel's EAAG token. Paste a fresh one to replace it; the account and buyer stay the same.")}</p>
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
    </section>
  );
}
