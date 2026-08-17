// Render smoke test: catches ReferenceErrors and bad prop access that a
// successful build cannot see (the build type-checks nothing at runtime).
import React from "react";
import { renderToString } from "react-dom/server";
import {
  buildTiers, buildConcentration, buildUserDetail, shortId,
  campaignBrand, buildBrandOptions, buildEconomics, shapeEconomics,
  ValueTiers, TopPlayers, Concentration, UserDetail, CopyId, PlayerEconomics,
} from "../src/components/UserBehaviorInsights.jsx";

const users = [
  { externalId: "1bJCoJghbfsaRJlU", clicks: 15, registers: 0, ftds: 1, redeposits: 0, revenue: 15.75, ftdRevenue: 15.75 },
  { externalId: "HIJC4Ighz1saOKlU", clicks: 900, registers: 4, ftds: 2, redeposits: 3, revenue: 820.5, ftdRevenue: 300 },
  { externalId: "019f8aba-8a3d-7e10-8516-b60418995a53", clicks: 40, registers: 1, ftds: 0, redeposits: 0, revenue: 0, ftdRevenue: 0 },
  { externalId: "plainclicker", clicks: 7, registers: 0, ftds: 0, redeposits: 0, revenue: 0, ftdRevenue: 0 },
];
const rows = [
  { date: "2026-08-06", external_id: "1bJCoJghbfsaRJlU", buyer: "Leticia", campaign: "Leticia | PWA.GROUP | Ice Fishing | BR | JASINO", country: "BR", city: "Torno Largo", device: "Unknown", os: "", clicks: 15, registers: 0, ftds: 1, redeposits: 0, revenue: 15.75, ftd_revenue: 15.75, redeposit_revenue: 0 },
  { date: "2026-08-07", external_id: "1bJCoJghbfsaRJlU", buyer: "Leticia", campaign: "Leticia | PWA.GROUP | Ice Fishing | BR | JASINO", country: "BR", city: "Humaita", device: "mobile", os: "Android", clicks: 9, registers: 0, ftds: 0, redeposits: 0, revenue: 0, ftd_revenue: 0, redeposit_revenue: 0 },
];
// What /api/user-behavior/:externalId returns: no external_id column, since
// every row already belongs to the requested player.
const detailRows = rows.map(({ external_id, ...rest }) => rest);

let failed = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { failed++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: got ${a}, expected ${b}`); };

console.log("logic:");
check("tiers classify by deposit depth", () => {
  const t = Object.fromEntries(buildTiers(users).map((x) => [x.key, x.count]));
  eq(t.repeat, 1, "repeat");     // 2 ftds + 3 redeposits
  eq(t.ftd, 1, "ftd");           // exactly 1
  eq(t.registered, 1, "registered");
  eq(t.clicked, 1, "clicked");
});
check("concentration is empty-safe (the top1 bug)", () => {
  const c = buildConcentration([{ externalId: "x", revenue: 0, ftds: 0, redeposits: 0 }]);
  eq(c.points.length, 0, "points"); eq(c.p10, 0, "p10"); eq(c.top1, 0, "top1");
});
check("concentration reaches 100%", () => {
  const c = buildConcentration(users);
  eq(Math.round(c.points[c.points.length - 1].cumulative), 100, "final cumulative");
  eq(c.earners, 2, "earners");
});
check("user detail sums only that player", () => {
  const d = buildUserDetail(rows, "1bJCoJghbfsaRJlU");
  eq(d.totals.clicks, 24, "clicks"); eq(d.totals.ftds, 1, "ftds");
  eq(Number(d.totals.revenue.toFixed(2)), 15.75, "revenue");
  eq(d.campaigns.length, 1, "campaigns"); eq(d.days.length, 2, "days");
});
check("detail rows without an external_id column are accepted", () => {
  const d = buildUserDetail(detailRows, "1bJCoJghbfsaRJlU");
  eq(d.totals.clicks, 24, "clicks");
  eq(d.days.length, 2, "days");
});
check("derived per-player measures", () => {
  const d = buildUserDetail(detailRows, "1bJCoJghbfsaRJlU");
  eq(d.deposits, 1, "deposits");
  eq(Number(d.avgDeposit.toFixed(2)), 15.75, "avgDeposit");
  eq(d.firstSeen, "2026-08-06", "firstSeen");
  eq(d.lastSeen, "2026-08-07", "lastSeen");
  eq(d.activeDays, 2, "activeDays");
  eq(d.tier, "ftd", "tier");
  eq(d.cities.length, 2, "cities");
});
check("Keitaro's \"Unknown\" device is not counted as a device", () => {
  const d = buildUserDetail(detailRows, "1bJCoJghbfsaRJlU");
  eq(d.devices.length, 1, "devices");
  eq(d.devices[0].key, "mobile \u00b7 Android", "device label");
});
check("shortId keeps head and tail distinguishable", () => {
  eq(shortId("019f8aba-8a3d-7e10-8516-b60418995a53"), "019f8ab…5a53", "shortId");
  eq(shortId("short"), "short", "passthrough");
});

check("brand comes from the last segment, case-folded", () => {
  eq(campaignBrand("Leticia | PWA.GROUP | Ice Fishing | BR | JASINO"), "JASINO", "upper");
  eq(campaignBrand("Leticia | PWA.GROUP | Ice Fishing | BR | Jasino"), "JASINO", "mixed case folds");
  eq(campaignBrand("Leo | Traffic Junky"), "", "too few segments");
  eq(campaignBrand(""), "", "empty");
});
check("brand options dedupe across casing", () => {
  const opts = buildBrandOptions([
    { campaign: "A | B | C | BR | JASINO" },
    { campaign: "A | B | C | BR | Jasino" },
    { campaign: "A | B | C | MX | ZLOTMX" },
    { campaign: "Leo | Traffic Junky" },
  ]);
  eq(opts.length, 2, "distinct brands");
  eq(opts[0].value, "JASINO", "most common first");
});
check("ARPU spreads over everyone, LTV over depositors", () => {
  const e = buildEconomics(users);
  eq(e.players, 4, "players");
  eq(e.depositors, 2, "depositors");
  eq(Number(e.arpu.toFixed(2)), Number(((15.75 + 820.5) / 4).toFixed(2)), "arpu");
  eq(Number(e.ltv.toFixed(2)), Number(((15.75 + 820.5) / 2).toFixed(2)), "ltv");
  eq(e.repeat, 1, "repeat");
  eq(e.repeatRate, 50, "repeatRate");
});
check("economics are divide-by-zero safe", () => {
  const e = buildEconomics([]);
  eq(e.arpu, 0, "arpu"); eq(e.ltv, 0, "ltv");
  eq(e.clickToDeposit, 0, "clickToDeposit"); eq(e.repeatRate, 0, "repeatRate");
});
check("both economics paths return the same keys", () => {
  const a = Object.keys(buildEconomics(users)).sort();
  const b = Object.keys(shapeEconomics({ revenue: 1, spend: 1, players: 1, depositors: 1, clicks: 1 })).sort();
  for (const key of b) if (!a.includes(key)) throw new Error(`client path is missing "${key}"`);
});

check("ROAS is null when no spend was recorded", () => {
  const e = shapeEconomics({ revenue: 113.88, spend: 0, players: 14695, depositors: 25, clicks: 30000, repeatDepositors: 4 });
  eq(e.roas, null, "roas");
  eq(e.profit, null, "profit");
  eq(Number(e.ltv.toFixed(2)), 4.56, "ltv still computed");
});
check("ROAS and profit where spend exists", () => {
  const e = shapeEconomics({ revenue: 673.25, spend: 114.03, players: 3822, depositors: 122, clicks: 100, repeatDepositors: 40 });
  eq(e.roas.toFixed(2), "5.90", "roas");
  eq(Number(e.profit.toFixed(2)), 559.22, "profit");
  eq(e.repeatRate.toFixed(1), "32.8", "repeatRate");
});
check("shapeEconomics is divide-by-zero safe", () => {
  const e = shapeEconomics({});
  eq(e.arpu, 0, "arpu"); eq(e.ltv, 0, "ltv"); eq(e.roas, null, "roas");
});

console.log("render:");
for (const [name, el] of [
  ["ValueTiers", <ValueTiers users={users} />],
  ["ValueTiers (empty)", <ValueTiers users={[]} />],
  ["TopPlayers", <TopPlayers users={users} />],
  ["TopPlayers (empty)", <TopPlayers users={[]} />],
  ["Concentration", <Concentration users={users} />],
  ["Concentration (no revenue)", <Concentration users={[users[3]]} />],
  ["PlayerEconomics", <PlayerEconomics users={users} periodLabel="This Month" />],
  ["PlayerEconomics (API + deltas)", <PlayerEconomics users={users} priorLabel="2026-07-21 → 2026-07-31" economics={{
    prior: { from: "2026-07-21", to: "2026-07-31" },
    current:  { players: 18667, depositors: 149, repeatDepositors: 50, clicks: 40000, revenue: 827.05, spend: 114.03 },
    previous: { players: 10243, depositors: 181, repeatDepositors: 60, clicks: 30000, revenue: 2014.18, spend: 0 },
  }} />],
  ["PlayerEconomics (no spend either side)", <PlayerEconomics users={users} priorLabel="prev" economics={{
    prior: { from: "2026-07-21", to: "2026-07-31" },
    current:  { players: 10, depositors: 2, repeatDepositors: 1, clicks: 100, revenue: 50, spend: 0 },
    previous: { players: 0, depositors: 0, repeatDepositors: 0, clicks: 0, revenue: 0, spend: 0 },
  }} />],
  ["PlayerEconomics (empty)", <PlayerEconomics users={[]} />],
  ["CopyId", <CopyId value="1bJCoJghbfsaRJlU" />],
  ["CopyId (empty)", <CopyId value="" />],
  ["UserDetail (fallback rows)", <UserDetail externalId="1bJCoJghbfsaRJlU" rows={rows} onClose={() => {}} />],
  ["UserDetail (no revenue)", <UserDetail externalId="plainclicker" rows={[{ date: "2026-08-06", external_id: "plainclicker", clicks: 7, registers: 0, ftds: 0, redeposits: 0, revenue: 0 }]} onClose={() => {}} />],
  ["UserDetail (closed)", <UserDetail externalId={null} rows={rows} onClose={() => {}} />],
]) check(name, () => renderToString(el));

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
// Runs two ways. Directly (`node --experimental-strip-types …`) it prints a
// summary and exits with a status, which is what it was written for. Under
// vitest — which collects it because of the .test. in the name — calling
// process.exit aborts the worker, and vitest reports the whole FILE as failed
// even though every assertion inside it passed. That is how CI came to show
// "4 failed / 250 passed": four files killed, nothing actually broken.
//
// So the exit is skipped under vitest, and a failure is raised as an error
// instead. Without that second half the file would pass silently even when
// its own counter said otherwise — worse than the red build it replaces.
if (process.env.VITEST) {
  // The assertions above already ran at import; this registers the one suite
  // vitest needs so the file counts as a test rather than as an empty module,
  // and fails loudly if the counter says anything went wrong.
  const { test, expect } = await import("vitest");
  test("user behaviour smoke: every assertion passes", () => {
    expect(failed, `${failed} assertion(s) failed — see the output above`).toBe(0);
  });
} else {
  process.exit(failed ? 1 : 0);
}
