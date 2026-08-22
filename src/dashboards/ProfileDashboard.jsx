import React from "react";
import { BrandMark, resolveBrandLogo } from "../components/BrandMark.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { AwardIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { permissionOptions } from "../lib/constants.js";
import { formatCurrency } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { BadgeMedal, PROFILE_BADGES, RoleChip, describeUserAgent, initialsOf, roleIdentColor } from "../lib/identity.jsx";
import { goToView } from "../lib/navigation.js";
import { generatePasswordValue, scorePassword } from "../lib/password.js";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  Globe,
  RefreshCw,
  Tag,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export default function ProfileDashboard({ authUser }) {
  const { t, language, setLanguage } = useLanguage();
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
  const [showNewPw, setShowNewPw] = React.useState(false);
  // Own audit trail (any role sees only their own actions) + usage facts.
  const [activity, setActivity] = React.useState({
    items: [],
    lastLogin: null,
    lastLoginIp: null,
    lastLoginAgent: null,
    actions: { total: 0, week: 0 },
    loading: true,
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetch("/api/profile/activity");
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!cancelled) {
          setActivity({
            items: Array.isArray(data?.items) ? data.items : [],
            lastLogin: data?.lastLogin || null,
            lastLoginIp: data?.lastLoginIp || null,
            lastLoginAgent: data?.lastLoginAgent || null,
            actions: { total: Number(data?.actions?.total) || 0, week: Number(data?.actions?.week) || 0 },
            loading: false,
          });
        }
      } catch {
        if (!cancelled) setActivity((prev) => ({ ...prev, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
      {/* Identity hero — who you are, at the top, once. */}
      <section className="panel profile-hero">
        <div className="profile-hero-ident">
          <span
            className="user-avatar user-avatar--xl"
            style={{ borderColor: roleIdentColor(roleName), color: roleIdentColor(roleName) }}
          >
            {initialsOf(username)}
          </span>
          <div className="profile-hero-text">
            <h2 className="profile-hero-name">{username}</h2>
            <div className="profile-hero-chips">
              <RoleChip role={roleName} label={t(roleName)} />
              {buyerRecord?.tag ? <span className="tag-pill">{buyerRecord.tag}</span> : null}
              <span className={`role-chip profile-verified${verified === t("Verified") || verified === "Verified" ? " is-ok" : ""}`}>
                <CheckCircle size={12} /> {verified}
              </span>
            </div>
            <p className="profile-hero-meta">
              {t("User ID")} #{userRecord?.id ?? authUser?.id ?? "—"}
              {userRecord?.created_at ? (
                <> · {t("Member since")} {new Date(userRecord.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</>
              ) : null}
              {activity.lastLogin ? (
                <> · {t("Last login")} {new Date(activity.lastLogin).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</>
              ) : null}
              {buyerName && buyerName !== "—" ? <> · {buyerName}</> : null}
            </p>
          </div>
        </div>
        <div className="profile-hero-side">
          <span className="profile-pref-label">{t("Language")}</span>
          <div className="lang-segment">
            {["EN", "TR"].map((code) => (
              <button
                key={code}
                type="button"
                className={`lang-segment-btn${language === code ? " is-active" : ""}`}
                onClick={() => setLanguage(code)}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </section>

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
              <div className={`card-value${stat.untrusted ? " is-untrusted" : ""}`}>{stat.value}</div>
              {stat.untrusted ? (
                <button
                  type="button"
                  className="card-untrusted"
                  onClick={() => goToView("health")}
                  title={t("Spend is missing for some ad accounts, so this figure is computed from incomplete cost. Open Health to see why.")}
                >
                  <AlertTriangle size={11} /> {stat.untrustedLabel || t("cost data incomplete")}
                </button>
              ) : null}
              {stat.meta ? <div className="card-meta">{t(stat.meta)}</div> : null}
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
            <span className="panel-icon-badge"><AwardIcon size={20} /></span>
            <div>
              <h2 className="panel-title">{t("Achievements")}</h2>
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

      <section className="panels profile-panels">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("My Recent Activity")}</h2>
              <p className="panel-subtitle">{t("Your last actions in the dashboard — links, edits, logins.")}</p>
            </div>
          </div>
          {activity.loading ? (
            <div className="empty-state">{t("Loading…")}</div>
          ) : activity.items.length === 0 ? (
            <div className="empty-state">{t("No activity recorded yet — your actions will show up here.")}</div>
          ) : (
            <ul className="profile-activity">
              {activity.items.map((item) => {
                const failed = Number(item.status) >= 400;
                return (
                  <li key={item.id} className="profile-activity-row">
                    <span className={`log-badge m-${String(item.method || "").toLowerCase()}`}>{item.method}</span>
                    <span className="profile-activity-text">
                      <span className="profile-activity-action">
                        {String(item.action || "").replace(/_/g, " ")} · {String(item.entity_type || "").replace(/_/g, " ")}
                        {item.entity_id ? ` #${item.entity_id}` : ""}
                      </span>
                      <span className="profile-activity-time">
                        {new Date(item.created_at).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </span>
                    <span className={`logs-status${failed ? " is-error" : " is-ok"}`}>{item.status ?? "—"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Change Password")}</h2>
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
              <div className="pw-input-wrap">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={passwordForm.next}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, next: event.target.value }))
                  }
                  required
                />
                <button
                  type="button"
                  className="pw-eye"
                  onClick={() => setShowNewPw((v) => !v)}
                  title={showNewPw ? t("Hide") : t("Show")}
                >
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.next ? (() => {
                const s = scorePassword(passwordForm.next);
                return (
                  <div className="pw-strength">
                    <div className="pw-strength-bars">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={`pw-strength-bar${i < s.score ? ` is-${s.tone}` : ""}`} />
                      ))}
                    </div>
                    <span className={`pw-strength-label tone-${s.tone}`}>{t(s.label)}</span>
                  </div>
                );
              })() : null}
            </div>
            <div className="field">
              <label>{t("Confirm Password")}</label>
              <input
                type={showNewPw ? "text" : "password"}
                value={passwordForm.confirm}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))
                }
                required
              />
              {passwordForm.confirm && passwordForm.confirm !== passwordForm.next ? (
                <p className="field-hint pw-mismatch">{t("Passwords do not match yet.")}</p>
              ) : null}
            </div>
            <div className="form-actions profile-pw-actions">
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  const pw = generatePasswordValue();
                  setPasswordForm((prev) => ({ ...prev, next: pw, confirm: pw }));
                  setShowNewPw(true);
                }}
              >
                <RefreshCw size={13} /> {t("Generate strong password")}
              </button>
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
              <h2 className="panel-title">{t("Role Permissions")}</h2>
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

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Usage")}</h2>
              <p className="panel-subtitle">{t("Where and how this account is used.")}</p>
            </div>
          </div>
          <div className="profile-info-grid">
            <div className="profile-info">
              <span>{t("Last login")}</span>
              <strong>
                {activity.lastLogin
                  ? new Date(activity.lastLogin).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </strong>
            </div>
            <div className="profile-info">
              <span>{t("Device")}</span>
              <strong>
                {describeUserAgent(activity.lastLoginAgent) ||
                  `${describeUserAgent(navigator.userAgent)} (${t("current")})`}
              </strong>
            </div>
            <div className="profile-info">
              <span>{t("Login IP")}</span>
              <strong>{activity.lastLoginIp || "—"}</strong>
            </div>
            <div className="profile-info">
              <span>{t("Timezone")}</span>
              <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone || "—"}</strong>
            </div>
            <div className="profile-info">
              <span>{t("Actions this week")}</span>
              <strong>{activity.actions.week.toLocaleString()}</strong>
            </div>
            <div className="profile-info">
              <span>{t("Actions recorded")}</span>
              <strong>{activity.actions.total.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
