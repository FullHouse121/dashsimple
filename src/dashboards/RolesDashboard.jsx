import React from "react";
import keitaroLogo from "../assets/brands/keitaro.svg";
import { CountryDropdownPicker, Select } from "../components/Select.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { apiFetch } from "../lib/api.js";
import { approachOptions, countryOptions, defaultCountryOption, permissionOptions, roleOptions } from "../lib/constants.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { RoleChip, UserIdent, roleIdentColor } from "../lib/identity.jsx";
import { dialogMotion, overlayMotion, rowMotion } from "../lib/motion.js";
import { generatePasswordValue, scorePassword } from "../lib/password.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

export default function RolesDashboard({ authUser }) {
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
  // Registry-style filtering for the Users / Media Buyers tables.
  const [userSearch, setUserSearch] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState([]);
  const [teamSearch, setTeamSearch] = React.useState("");
  const [teamStatusFilter, setTeamStatusFilter] = React.useState([]);
  const toggleFilterValue = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
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

  // Score + generator now live at module scope (shared with Profile).
  const generatePassword = () => {
    const pw = generatePasswordValue();
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
              <h2 className="panel-title">{t("Access Control")}</h2>
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
              <h2 className="panel-title">{t("Roles")}</h2>
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
                <div className="field registry-search-field">
                  <div className="registry-search">
                    <Search size={14} aria-hidden="true" />
                    <input
                      type="text"
                      placeholder={t("Search role name…")}
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                    />
                    {roleSearch ? (
                      <button
                        type="button"
                        className="registry-search-clear"
                        onClick={() => setRoleSearch("")}
                        aria-label={t("Clear search")}
                      >
                        <X size={13} />
                      </button>
                    ) : null}
                  </div>
                </div>
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
                      // The role's own colour, carried down the whole row.
                      // The dot already used it while the progress bar, the
                      // permission chips and the open panel were all green, so
                      // five roles rendered as one colour with a different dot.
                      <div
                        key={role.id}
                        className={`role-row${expanded ? " is-open" : ""}${isLocked ? " is-locked" : ""}`}
                        style={{ "--role-color": roleIdentColor(role.name) }}
                      >
                        <button
                          type="button"
                          className="role-row-summary"
                          onClick={() => toggleRoleExpand(role.id)}
                          aria-expanded={expanded}
                        >
                          <span className="role-row-chevron">▸</span>
                          <span className="role-row-identity">
                            <span className="role-chip-dot role-row-dot" />
                            <span className="role-row-name">{t(role.name)}</span>
                            {isLocked ? <Lock size={11} className="role-row-lock" aria-label={t("Built-in")} /> : null}
                          </span>
                          <span className="role-row-stat">{userCount} {userCount === 1 ? t("user") : t("users")}</span>
                          <span className="role-row-stat role-row-stat-perms">
                            <strong>{effectivePermissions.length}</strong>
                            <span className="role-row-of">/{permissionOptions.length}</span>
                            <span className="role-row-perms-label">{t("permissions")}</span>
                          </span>
                          {/* One tick per permission rather than a filled bar.
                              A bar at 58% tells you a proportion; nineteen
                              ticks with eleven lit tell you the count, which
                              is what the number beside it is counting. */}
                          <span
                            className="role-row-ticks"
                            role="img"
                            aria-label={`${effectivePermissions.length} ${t("of")} ${permissionOptions.length} ${t("permissions")}`}
                          >
                            {permissionOptions.map((perm) => (
                              <span
                                key={perm.key}
                                className={`role-tick${
                                  effectivePermissions.includes(perm.key) ? " is-on" : ""
                                }`}
                              />
                            ))}
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
              <h2 className="panel-title">{t("Users")}</h2>
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
          ) : (() => {
            const q = userSearch.trim().toLowerCase();
            const visibleUsers = users.filter((user) => {
              if (userRoleFilter.length && !userRoleFilter.includes(user.role)) return false;
              if (!q) return true;
              const linked = user.buyer_id ? buyers.find((b) => b.id === user.buyer_id) : null;
              const hay = `${user.username} ${user.role} ${linked?.name || ""} ${linked?.tag || ""}`.toLowerCase();
              return hay.includes(q);
            });
            return (
            <>
            <div className="pixel-table-toolbar">
              <div className="field registry-search-field">
                <label>{t("Search")}</label>
                <div className="registry-search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={t("Search username or buyer…")}
                  />
                  {userSearch ? (
                    <button
                      type="button"
                      className="registry-search-clear"
                      onClick={() => setUserSearch("")}
                      aria-label={t("Clear search")}
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label>{t("Role")}</label>
                <CountryDropdownPicker
                  multiple
                  values={userRoleFilter}
                  onToggle={toggleFilterValue(setUserRoleFilter)}
                  options={roleNameOptions.map((r) => ({ value: r, label: t(r), dot: roleIdentColor(r) }))}
                  placeholder={t("All")}
                  searchPlaceholder={t("Type to find roles")}
                  emptyResultsLabel={t("No roles found.")}
                />
              </div>
            </div>
            {visibleUsers.length === 0 ? (
              <div className="empty-state">{t("No users match.")}</div>
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
                  {/* popLayout takes the leaving row out of flow immediately, so the
                      rows below start closing the gap while it fades rather than
                      jumping the moment it unmounts. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                  {visibleUsers.map((user) => {
                    const buyerName = user.buyer_id ? buyerMap[user.buyer_id] || "" : "";
                    const linkedBuyer = user.buyer_id ? buyers.find((b) => b.id === user.buyer_id) : null;
                    const buyerTag = resolveBuyerTag(user.username, linkedBuyer);
                    return (
                      <motion.tr key={user.id} {...rowMotion}>
                        <td><UserIdent name={user.username} role={user.role} /></td>
                        <td><RoleChip role={user.role} label={t(user.role)} /></td>
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
                      </motion.tr>
                    );
                  })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            )}
            </>
            );
          })()}
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
              <h2 className="panel-title">{t("Media Buyers")}</h2>
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
          ) : (() => {
            const q = teamSearch.trim().toLowerCase();
            const visibleBuyers = buyers.filter((member) => {
              if (teamStatusFilter.length && !teamStatusFilter.includes(member.status || "Inactive")) return false;
              if (!q) return true;
              const hay = `${member.name} ${member.keitaro_name || ""} ${member.tag || ""} ${member.email || ""} ${member.contact || ""} ${member.country || ""} ${member.game || ""}`.toLowerCase();
              return hay.includes(q);
            });
            return (
            <>
            <div className="pixel-table-toolbar">
              <div className="field registry-search-field">
                <label>{t("Search")}</label>
                <div className="registry-search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder={t("Search name, tag, email, country…")}
                  />
                  {teamSearch ? (
                    <button
                      type="button"
                      className="registry-search-clear"
                      onClick={() => setTeamSearch("")}
                      aria-label={t("Clear search")}
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label>{t("Status")}</label>
                <CountryDropdownPicker
                  multiple
                  values={teamStatusFilter}
                  onToggle={toggleFilterValue(setTeamStatusFilter)}
                  options={["Active", "Onboarding", "Inactive"].map((s) => ({
                    value: s,
                    label: t(s),
                    dot: s === "Active" ? "#36d07c" : s === "Onboarding" ? "#ffc94d" : "#8a93a3",
                  }))}
                  placeholder={t("All")}
                  searchPlaceholder={t("Filter status")}
                  emptyResultsLabel={t("No statuses found.")}
                />
              </div>
            </div>
            {visibleBuyers.length === 0 ? (
              <div className="empty-state">{t("No buyers match.")}</div>
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
                  {/* popLayout takes the leaving row out of flow immediately, so the
                      rows below start closing the gap while it fades rather than
                      jumping the moment it unmounts. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                  {visibleBuyers.map((member) => (
                    <motion.tr key={member.id} {...rowMotion}>
                      <td><UserIdent name={member.name} role={member.role} /></td>
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
                      <td><RoleChip role={member.role} label={t(member.role)} /></td>
                      <td>
                        {member.country ? (
                          <span className="buyer-country">
                            <CountryFlag value={member.country} size={13} /> {member.country}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
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
                    </motion.tr>
                  ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            )}
            </>
            );
          })()}
        </motion.div>
      </section>
      ) : null}

      {/* The one dialog that never animated at all — a plain div outside
          AnimatePresence, so it appeared and vanished in a single frame while
          the other thirteen faded. */}
      <AnimatePresence>
      {pwModal ? (
        <motion.div className="modal-overlay" {...overlayMotion} onMouseDown={(e) => { if (e.target === e.currentTarget) closePwModal(); }}>
          <motion.div className="modal pw-modal" {...dialogMotion} role="dialog" aria-modal="true">
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
          </motion.div>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </>
  );
}
