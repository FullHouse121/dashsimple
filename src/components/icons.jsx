// ── DeusMachine icon set ──────────────────────────────────────────────
//
// The dashboard ran on stock lucide glyphs, which had two problems. They are
// the same icons every admin panel ships with, and — worse — they collided:
// ShieldCheck appeared three times, CreditCard three times, Users, Link2,
// Megaphone, Plug and MousePointerClick twice each. Sections could not be told
// apart by their icon.
//
// This set is built from one vocabulary, drawn from what the product actually
// models: traffic arriving at a NODE, travelling a PATH, and being measured as
// SIGNAL. Every glyph is those three primitives and nothing else, which is what
// makes them read as a family rather than as clip art.
//
//   node    a circle — a point traffic passes through or is counted at
//   path    a stroke between nodes — where traffic goes
//   signal  short parallel ticks — measurement
//
// Conventions follow the existing FlowsIcon so they sit beside any remaining
// lucide icon during a partial rollout: 24 grid, fill none, currentColor,
// 2px round strokes, content inset to 3–21 so nothing touches the edge.

import React from "react";

const Icon = ({ size = 18, strokeWidth = 2, children, ...props }) => (
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
    {children}
  </svg>
);

// A filled node reads as "counted"; a hollow one as "passed through".
const Node = ({ cx, cy, r = 2, filled = false }) => (
  <circle cx={cx} cy={cy} r={r} fill={filled ? "currentColor" : "none"} />
);

/* Overview — the composed view: one primary panel, two supporting. Deliberately
   asymmetric, so it never reads as Placement's even grid. */
export const DashIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="9" height="17" rx="1.8" />
    <rect x="15.5" y="3.5" width="5" height="7" rx="1.6" />
    <rect x="15.5" y="13.5" width="5" height="7" rx="1.6" fill="currentColor" stroke="none" />
  </Icon>
);

/* GEOS — one place, on one meridian. The mark is the point, not the planet. */
export const GeoIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 3.4c-3.6 3.8-3.6 13.4 0 17.2" opacity="0.55" />
    <path d="M3.9 9.2h16.2" opacity="0.55" />
    <Node cx={15.6} cy={9.2} r={2.4} filled />
  </Icon>
);

/* Goals — a path climbing to meet the target line, landing exactly on it. */
export const GoalIcon = (p) => (
  <Icon {...p}>
    <path d="M3.5 6.5h17" strokeDasharray="2.6 2.6" opacity="0.6" />
    <path d="M4 19.5l5-5 3.4 2.6L19 6.9" />
    <Node cx={19} cy={6.5} r={2.2} filled />
  </Icon>
);

/* Statistics — the funnel: three paths narrowing to one counted node. */
export const StatsIcon = (p) => (
  <Icon {...p}>
    <path d="M3.5 5h17l-6.2 7.4V20l-4.6-2.6v-5z" />
  </Icon>
);

/* Live Clicks — an arriving signal: a strike landing on a node. */
export const ClicksIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3M5.6 18.4l2.1-2.1" />
    <path d="M11 11l9 3.4-4 1.6-1.6 4z" />
  </Icon>
);

/* Conversions — crossing the threshold and being counted on the far side. */
export const ConversionIcon = (p) => (
  <Icon {...p}>
    <path d="M12 4.5v15" strokeDasharray="2.6 2.6" opacity="0.6" />
    <path d="M3 12h5.4" />
    <path d="M15 12h2.6M19.4 12H21" opacity="0.5" />
    <Node cx={17} cy={12} r={2.6} filled />
    <path d="M6.2 9.2L9 12l-2.8 2.8" />
  </Icon>
);

/* Campaigns — one source fanning to three destinations. */
export const CampaignIcon = (p) => (
  <Icon {...p}>
    <Node cx={5} cy={12} r={2.4} filled />
    <path d="M7.4 12h3.6M11 12l5 -5.5M11 12h5M11 12l5 5.5" />
    <Node cx={18.4} cy={6.5} r={2} />
    <Node cx={18.4} cy={12} r={2} />
    <Node cx={18.4} cy={17.5} r={2} />
  </Icon>
);

/* Placement — a grid of slots, one of them live. */
export const PlacementIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" fill="currentColor" stroke="none" />
  </Icon>
);

/* User Behavior — one person's journey, stepping between nodes. */
export const BehaviorIcon = (p) => (
  <Icon {...p}>
    <path d="M4 18.5l4.6-4.6 3.4 2.2 3.6-5.4 4.4 3" />
    <Node cx={4} cy={18.5} r={1.8} />
    <Node cx={20} cy={13.7} r={1.8} filled />
    <path d="M4 4.5h9" />
  </Icon>
);

/* Devices — the same traffic at three scales. */
export const DeviceIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="11" height="9" rx="1.8" />
    <path d="M6 17.5h5" />
    <rect x="16" y="9.5" width="5" height="11" rx="1.6" />
  </Icon>
);

/* Reports — a sheet whose content is measurement. */
export const ReportIcon = (p) => (
  <Icon {...p}>
    <path d="M5.5 3.5h9L19 8v12.5H5.5z" />
    <path d="M14 3.5V8h5" />
    <path d="M9 17v-3M12 17v-5.5M15 17v-2" />
  </Icon>
);

/* Tracking Links — two nodes joined by a segment that can be cut. */
export const LinkIcon = (p) => (
  <Icon {...p}>
    <Node cx={6} cy={12} r={2.6} />
    <Node cx={18} cy={12} r={2.6} />
    <path d="M8.6 12h2.2M13.2 12h2.2" />
  </Icon>
);

/* UTM Builder — a link carrying parameters. */
export const UtmIcon = (p) => (
  <Icon {...p}>
    <path d="M9.5 14.5l5-5" />
    <path d="M13 6.5l1.6-1.6a3.6 3.6 0 015.1 5.1L18 11.6" />
    <path d="M11 12.4l-1.6 1.6a3.6 3.6 0 01-5.1-5.1L6 7.2" />
    <path d="M4 20h3M9.5 20h3M15 20h3" />
  </Icon>
);

/* Domains — the web itself, as a wireframe. A ring plus a centred dot reads as
   an eye at tile size, so the meridians carry it instead, and the absence of a
   marked point is what separates this from GEOS. */
export const DomainIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <ellipse cx="12" cy="12" rx="8.6" ry="3.9" />
    <ellipse cx="12" cy="12" rx="3.9" ry="8.6" />
  </Icon>
);

/* Pixels — a fired pixel: a counted node inside registration marks. */
export const PixelIcon = (p) => (
  <Icon {...p}>
    <path d="M4 8V5.6A1.6 1.6 0 015.6 4H8M16 4h2.4A1.6 1.6 0 0120 5.6V8M20 16v2.4a1.6 1.6 0 01-1.6 1.6H16M8 20H5.6A1.6 1.6 0 014 18.4V16" />
    <Node cx={12} cy={12} r={2.6} filled />
  </Icon>
);

/* Accounts — the key to an ad account. Nothing else in the set is a key. */
export const AccountIcon = (p) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="4.4" />
    <Node cx={8} cy={8} r={1.3} filled />
    <path d="M11.2 11.2l8 8" />
    <path d="M15.4 15.4l-2 2M18 18l-2 2" />
  </Icon>
);

/* Health — the pulse, with the beat that matters marked. */
export const HealthIcon = (p) => (
  <Icon {...p}>
    <path d="M3 13.5h4l2-5 3 9 2.2-5.5H21" />
    <Node cx={9} cy={8.5} r={1.5} filled />
  </Icon>
);

/* Roles — concentric access: what each ring may reach. */
export const RolesIcon = (p) => (
  <Icon {...p}>
    <Node cx={12} cy={12} r={2.2} filled />
    <path d="M12 5.4a6.6 6.6 0 016.6 6.6" />
    <path d="M12 18.6A6.6 6.6 0 015.4 12" />
    <path d="M12 2.6a9.4 9.4 0 019.4 9.4" opacity="0.55" />
    <path d="M12 21.4A9.4 9.4 0 012.6 12" opacity="0.55" />
  </Icon>
);

/* Logs — the record: stacked entries, the newest complete. */
export const LogIcon = (p) => (
  <Icon {...p}>
    <path d="M4 6h13M4 12h16M4 18h9" />
    <Node cx={20} cy={6} r={1.6} />
    <Node cx={13} cy={18} r={1.6} filled />
  </Icon>
);

/* Profile — the viewer, as a node with their own reach. */
export const ProfileIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.8 20a7.2 7.2 0 0114.4 0" />
  </Icon>
);

/* Meta Token $ — cost entering the system through a node. */
export const CostIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.2v9.6" />
    <path d="M14.6 9.6a2.6 2.6 0 00-2.6-1.6c-1.6 0-2.6.9-2.6 2.1 0 2.9 5.2 1.6 5.2 4.2 0 1.3-1.1 2.2-2.6 2.2a2.7 2.7 0 01-2.7-1.7" />
  </Icon>
);

/* API — a payload between brackets. */
export const ApiIcon = (p) => (
  <Icon {...p}>
    <path d="M8 5.5L3.5 12 8 18.5M16 5.5L20.5 12 16 18.5" />
    <Node cx={12} cy={12} r={2} filled />
  </Icon>
);

/* Import — traffic adopted from outside the system. */
export const ImportIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5v9.5M8.4 9.6L12 13.2l3.6-3.6" />
    <path d="M4.5 15.5v3.4a1.6 1.6 0 001.6 1.6h11.8a1.6 1.6 0 001.6-1.6v-3.4" />
  </Icon>
);

// ── Panel glyphs ──────────────────────────────────────────────────────
// Same vocabulary, for the tiles that sit in panel headers rather than the nav.

/* Filters — three candidates meet the criterion; one passes and is kept. */
export const FilterIcon = (p) => (
  <Icon {...p}>
    <path d="M3.5 12h17" strokeDasharray="2.6 2.6" opacity="0.6" />
    <Node cx={5} cy={5.6} r={1.6} />
    <Node cx={12} cy={5.6} r={1.6} />
    <Node cx={19} cy={5.6} r={1.6} />
    <path d="M12 7.6v2.6M12 13.8v2.4" />
    <Node cx={12} cy={18.4} r={2.3} filled />
  </Icon>
);

/* Group by — many rows collapsing into one. The inverse of Campaigns' fan-out,
   and inverted in fill too, so the two never read as the same mark. */
export const GroupIcon = (p) => (
  <Icon {...p}>
    <Node cx={5} cy={5.6} r={1.7} />
    <Node cx={5} cy={12} r={1.7} />
    <Node cx={5} cy={18.4} r={1.7} />
    <path d="M6.9 5.6h2.7a2 2 0 012 2V10M6.9 12h5.8M6.9 18.4h2.7a2 2 0 002-2v-2.4" />
    <path d="M12.7 12h2.9" />
    <Node cx={18} cy={12} r={2.4} filled />
  </Icon>
);

/* Columns — the frame divided, the one you are choosing filled. */
export const ColumnsIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="4" width="4.4" height="16" rx="1.4" />
    <rect x="9.8" y="4" width="4.4" height="16" rx="1.4" fill="currentColor" stroke="none" />
    <rect x="16.1" y="4" width="4.4" height="16" rx="1.4" />
  </Icon>
);

/* Metrics — the signal primitive on its own: measurement, nothing else. */
export const MetricIcon = (p) => (
  <Icon {...p}>
    <path d="M4 15.4V8.6M8 17.4V6.6M12 19.4V4.6M16 17.4V6.6M20 15.4V8.6" />
  </Icon>
);

/* Saved reports — a report, marked to keep. Deliberately the Reports sheet with
   its bars replaced by the mark, so the pair reads as one family. */
export const SavedIcon = (p) => (
  <Icon {...p}>
    <path d="M5.5 3.5h9L19 8v12.5H5.5z" />
    <path d="M14 3.5V8h5" />
    <Node cx={12} cy={14.6} r={2.6} filled />
  </Icon>
);

/* Achievements — the podium, with first place marked above it. */
export const AwardIcon = (p) => (
  <Icon {...p}>
    <Node cx={12} cy={3.4} r={1.8} filled />
    <rect x="9.5" y="6.6" width="5" height="14" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="3" y="11.4" width="5" height="9.2" rx="1.2" />
    <rect x="16" y="13.8" width="5" height="6.8" rx="1.2" />
  </Icon>
);

/* Alert — deliberately the universal warning grammar. An original glyph nobody
   recognises is the one failure mode a warning cannot afford. */
export const AlertIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.4v5.4" />
    <Node cx={12} cy={16.4} r={1.3} filled />
  </Icon>
);

/* Run — dispatch: the source rail, and the signal sent from it. */
export const TriggerIcon = (p) => (
  <Icon {...p}>
    <path d="M3.6 8.4v7.2" opacity="0.55" />
    <path d="M7.6 5.4l10.4 6.6-10.4 6.6z" />
  </Icon>
);
