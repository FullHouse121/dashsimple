import { normalizeRoleKey } from "./permissions.js";
import { Award, Crown, DollarSign, Flame, Gem, Medal, Rocket, Sparkles, Trophy, X } from "lucide-react";

// Role identity colors — one hue per role tier, shared by avatars, chips and
// the role rows so a role is recognizable at a glance across the section.
export const ROLE_IDENT_COLORS = {
  boss: "#f7c625",
  teamleader: "#36d07c",
  mediabuyersenior: "#64b8ff",
  mediabuyer: "#49e0c4",
  mediabuyerjunior: "#a15bff",
};

export const roleIdentColor = (role) => ROLE_IDENT_COLORS[normalizeRoleKey(role)] || "#8b8f98";

export const initialsOf = (name) => {
  const raw = String(name || "").trim();
  if (!raw) return "?";
  const parts = raw.split(/\s+/);
  return ((parts[0][0] || "") + (parts[1]?.[0] || parts[0][1] || "")).toUpperCase();
};

// Avatar + name, tinted by role — the visual identity used in Users/Team tables.
export const UserIdent = ({ name, role, sub }) => (
  <span className="user-ident">
    <span className="user-avatar" style={{ borderColor: roleIdentColor(role), color: roleIdentColor(role) }}>
      {initialsOf(name)}
    </span>
    <span className="user-ident-text">
      <span className="user-ident-name">{name}</span>
      {sub ? <span className="user-ident-sub">{sub}</span> : null}
    </span>
  </span>
);

export const RoleChip = ({ role, label }) => (
  <span className="role-chip">
    <span className="role-chip-dot" style={{ background: roleIdentColor(role) }} />
    {label}
  </span>
);

// "Chrome · macOS" from a raw user-agent string — order matters (Edge/Opera
// embed "Chrome", Chrome embeds "Safari").
export const describeUserAgent = (ua) => {
  const s = String(ua || "");
  if (!s) return "";
  const os = /iPhone|iPad/i.test(s)
    ? "iOS"
    : /Android/i.test(s)
      ? "Android"
      : /Mac OS X|Macintosh/i.test(s)
        ? "macOS"
        : /Windows/i.test(s)
          ? "Windows"
          : /Linux/i.test(s)
            ? "Linux"
            : "";
  const browser = /Edg\//.test(s)
    ? "Edge"
    : /OPR\//.test(s)
      ? "Opera"
      : /Chrome\//.test(s)
        ? "Chrome"
        : /Safari\//.test(s) && /Version\//.test(s)
          ? "Safari"
          : /Firefox\//.test(s)
            ? "Firefox"
            : "";
  return [browser, os].filter(Boolean).join(" · ");
};

// Achievement badges — unlocked on lifetime totals across all of a buyer's
// links. Two tracks (FTDs + revenue), rising tiers. Kept data-driven so tiers
// are easy to tune.
export const PROFILE_BADGES = [
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
export const BADGE_TIERS = {
  bronze: ["#f4d0a4", "#cd7f32", "#7a4318"],
  silver: ["#f7f9fc", "#c3c8d2", "#7c8290"],
  gold: ["#ffe9a3", "#f7c625", "#a9781a"],
  emerald: ["#bff7db", "#36d07c", "#15683f"],
  diamond: ["#e9fbff", "#8fe0ff", "#3f9fd6"],
};

// Quality SVG medal coin: notched rim, metallic radial bevel, gloss highlight.
// The tier glyph is overlaid separately (in .badge-glyph). Greys out when locked.
export const BadgeMedal = ({ badgeId, tier, locked }) => {
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
