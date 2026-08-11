// Exercises the User Behavior global filters against rows shaped exactly like
// /api/user-behavior returns them. Written after the Domain/Source filter was
// found reading row.domain — a field that endpoint never sends — so any
// non-empty value matched nothing and emptied the section.
import {
  matchesUserBehaviorRow,
  matchesUserAggregate,
  USER_BEHAVIOR_ROW_FIELDS,
} from "../src/lib/filters.js";

// Verbatim shape of selectUserBehaviorAggregated's SELECT list.
const rows = [
  {
    external_id: "1bJCoJghbfsaRJlU", buyer: "Leticia", country: "Brazil",
    campaign: "Leticia | PWA.GROUP | Ice Fishing | BR | JASINO", date: "2026-08-09",
    clicks: 30, registers: 0, ftds: 1, redeposits: 0, revenue: 15.75, ftd_revenue: 15.75, redeposit_revenue: 0,
  },
  {
    external_id: "019f9669-f8d3-709e-92a0-bacb9666ba7a", buyer: "Leomarketing", country: "Mexico",
    campaign: "Leo | ZMAPPS | Santa Fe Casino | MX | ZLOTMX", date: "2026-08-07",
    clicks: 1, registers: 0, ftds: 1, redeposits: 0, revenue: 25, ftd_revenue: 25, redeposit_revenue: 0,
  },
  {
    external_id: "g5G8Rk6BxIPIaCwk", buyer: "Sara", country: "Brazil",
    campaign: "Sara | PWA | Chicken Road | BR | BETORSPINBR", date: "2026-07-30",
    clicks: 1, registers: 0, ftds: 1, redeposits: 0, revenue: 35, ftd_revenue: 35, redeposit_revenue: 0,
  },
];

const users = [
  { externalId: "1bJCoJghbfsaRJlU", campaign: "Leticia | PWA.GROUP | Ice Fishing | BR | JASINO", clicks: 30, registers: 0, ftds: 1, redeposits: 0, revenue: 15.75 },
  { externalId: "019fd0f3-781e-7ebb-a4aa-48c0292c71dc", campaign: "Matheus | ZMAPPS | Mercado Pago | AR | JASINO", clicks: 2, registers: 0, ftds: 1, redeposits: 6, revenue: 24.52 },
  { externalId: "zzz-no-revenue", campaign: "Leo | ZMAPPS | Santa Fe Casino | MX | ZLOTMX", clicks: 9, registers: 1, ftds: 0, redeposits: 0, revenue: 0 },
];

let failed = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { failed++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: got ${a}, expected ${b}`); };
const keep = (ctx) => rows.filter((r) => matchesUserBehaviorRow(r, ctx)).length;
const keepUsers = (ctx) => users.filter((u) => matchesUserAggregate(u, ctx)).length;

console.log("row-level filters:");
check("no filters keeps everything", () => eq(keep({}), 3, "rows"));
check("date range", () => {
  eq(keep({ dateRange: { from: "2026-08-01", to: "2026-08-11" } }), 2, "August only");
  eq(keep({ dateRange: { from: "2026-07-01", to: "2026-07-31" } }), 1, "July only");
});
check("country matches the full names the API returns", () => {
  eq(keep({ country: "Brazil" }), 2, "Brazil");
  eq(keep({ country: "Mexico" }), 1, "Mexico");
  eq(keep({ country: "All" }), 3, "All");
});
check("country is not ISO-code based (would silently match nothing)", () => {
  eq(keep({ country: "BR" }), 0, "ISO code");
});
check("buyer", () => {
  eq(keep({ buyer: "Leticia", isLeadership: true }), 1, "one buyer");
  eq(keep({ buyer: "All", isLeadership: true }), 3, "All");
});
check("flow multi-select matches whole campaign names", () => {
  eq(keep({ flows: ["Leticia | PWA.GROUP | Ice Fishing | BR | JASINO"] }), 1, "one flow");
  eq(keep({ flows: [] }), 3, "empty selection matches all");
});
check("campaign is a substring match", () => {
  eq(keep({ campaign: "ZMAPPS" }), 1, "tool");
  eq(keep({ campaign: "jasino" }), 1, "case-insensitive");
  eq(keep({ campaign: "nothing-like-this" }), 0, "no match");
});
check("a filter naming a field the API never sends would empty the view", () => {
  // The regression guard: if someone re-adds a predicate over row.domain,
  // this documents why the section went blank.
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!USER_BEHAVIOR_ROW_FIELDS.includes(key)) throw new Error(`unexpected field ${key}`);
    }
    if ("domain" in row) throw new Error("rows do not carry domain");
  }
});

console.log("player-level filters:");
check("min revenue", () => {
  eq(keepUsers({ minRevenue: 20 }), 1, ">= 20");
  eq(keepUsers({ minRevenue: 0 }), 3, "zero disables");
});
check("min FTDs", () => eq(keepUsers({ minFtds: 1 }), 2, ">= 1"));
check("min redeposits", () => eq(keepUsers({ minRedeposits: 5 }), 1, ">= 5"));
check("revenue only", () => eq(keepUsers({ revenueOnly: true }), 2, "revenue > 0"));
check("external id substring", () => {
  eq(keepUsers({ externalId: "1bJCoJ" }), 1, "prefix");
  eq(keepUsers({ externalId: "019FD0F3" }), 1, "case-insensitive");
});
check("search covers id and campaign", () => {
  eq(keepUsers({ search: "mercado" }), 1, "campaign");
  eq(keepUsers({ search: "zzz" }), 1, "id");
});
check("filters combine", () => {
  eq(keepUsers({ minFtds: 1, minRedeposits: 5 }), 1, "both");
  eq(keepUsers({ minRevenue: 100, revenueOnly: true }), 0, "no survivors");
});

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
