// Covers the placement classification and ranking guards, plus a render of
// every chart including empty states.
import React from "react";
import { renderToString } from "react-dom/server";
import {
  classifyPlacement,
  summarisePlacements,
  bestBy,
  UNATTRIBUTED_PLACEMENT,
  PlacementMatrix,
  PlacementFunnel,
  PlacementRevenue,
  PlacementQuality,
  MatrixTooltipForTest,
} from "../src/components/PlacementInsights.jsx";

// Shaped like the live-stats rows after aggregation, using real values.
const mk = (placement, clicks, registers, ftds, revenue, spend = 0) => ({
  placement,
  clicks,
  registers,
  ftds,
  redeposits: 0,
  revenue,
  spend,
  epc: clicks > 0 ? revenue / clicks : 0,
  clickToReg: clicks > 0 ? (registers / clicks) * 100 : 0,
  regToFtd: registers > 0 ? (ftds / registers) * 100 : 0,
  ftdToRedeposit: 0,
  roas: spend > 0 ? revenue / spend : null,
});

const rows = [
  mk("Facebook Mobile Feed", 7024, 740, 46, 196.4, 37.95),
  mk(UNATTRIBUTED_PLACEMENT, 4162, 224, 44, 183.45),
  mk("Instagram Stories", 610, 78, 11, 121.06, 14.82),
  mk("Facebook Marketplace", 211, 12, 3, 13.28),
  mk("{{placement}}", 6, 2, 0, 0),
  mk("HPkgQPvz_fYYAcj_KXyM", 1, 0, 0, 0),
];

let failed = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { failed++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: got ${a}, expected ${b}`); };

console.log("classification:");
check("real placements pass", () => {
  eq(classifyPlacement("Facebook Mobile Feed", 7024), "ok", "fb");
  eq(classifyPlacement("Instagram Stories", 610), "ok", "ig");
  eq(classifyPlacement("Others", 980), "ok", "others");
});
check("unreplaced macros are flagged, not ranked", () => {
  eq(classifyPlacement("{{placement}}", 6), "macro", "braces");
  eq(classifyPlacement("{placement}", 6), "macro", "single brace");
  eq(classifyPlacement("sub_id_1", 6), "macro", "sub_id_1");
});
check("click ids leaking into the field are junk", () => {
  eq(classifyPlacement("HPkgQPvz_fYYAcj_KXyM", 1), "junk", "click id");
});
check("empty and sentinel both count as unattributed", () => {
  eq(classifyPlacement("", 0), "unattributed", "empty");
  eq(classifyPlacement(UNATTRIBUTED_PLACEMENT, 4162), "unattributed", "sentinel");
});

console.log("summary:");
check("unattributed traffic is separated but not lost", () => {
  const s = summarisePlacements(rows);
  eq(s.unattributedClicks, 4162, "clicks");
  eq(Number(s.unattributedRevenue.toFixed(2)), 183.45, "revenue");
  eq(s.ok.length, 3, "rankable");
  eq(s.problems.length, 2, "problems");
  eq(Math.round(s.unattributedShare), 35, "share"); // 4162 of 12014
});
check("rankable excludes macro and junk", () => {
  const names = summarisePlacements(rows).ok.map((r) => r.placement);
  if (names.includes("{{placement}}")) throw new Error("macro leaked into rankable");
  if (names.some((n) => n.startsWith("HPkgQPvz"))) throw new Error("junk leaked into rankable");
});

console.log("ranking guards:");
check("a tiny sample cannot win a rate card", () => {
  // Marketplace has the best regToFtd (25%) but only 211 clicks; with a 1000
  // floor the winner must be a high-volume placement instead.
  const winner = bestBy(summarisePlacements(rows).ok, "regToFtd", { minClicks: 1000 });
  eq(winner.placement, "Facebook Mobile Feed", "winner");
});
check("falls back rather than returning nothing", () => {
  const winner = bestBy(summarisePlacements(rows).ok, "epc", { minClicks: 999999 });
  if (!winner) throw new Error("should fall back to the unfiltered pool");
});
check("empty input is safe", () => {
  eq(bestBy([], "revenue"), null, "null");
  const s = summarisePlacements([]);
  eq(s.ok.length, 0, "ok"); eq(s.unattributedShare, 0, "share");
});

console.log("tooltip crash regression:");
check("matrix tooltip survives rows without roas/spend", () => {
  // The exact shape placementData produces: no `roas` key at all. The old
  // guard was `row.roas !== null`, and undefined !== null, so it called
  // .toFixed() on undefined — which threw during render and blanked the page.
  const bare = { placement: "Facebook Mobile Feed", clicks: 7024, registers: 740, ftds: 46, revenue: 196.4, epc: 0.028 };
  const html = renderToString(<PlacementMatrix rows={[bare, { ...bare, placement: "B", clicks: 900 }]} />);
  if (!html) throw new Error("no output");
  // Render the tooltip directly, the way recharts does on hover.
  const Tip = MatrixTooltipForTest;
  renderToString(<Tip active payload={[{ payload: bare }]} t={(x) => x} />);
});
check("matrix tooltip survives a totally empty row", () => {
  renderToString(<MatrixTooltipForTest active payload={[{ payload: {} }]} t={(x) => x} />);
  renderToString(<MatrixTooltipForTest active payload={[]} t={(x) => x} />);
  renderToString(<MatrixTooltipForTest active={false} payload={null} t={(x) => x} />);
});
check("shows ROAS only when spend exists", () => {
  // renderToString puts <!-- --> between adjacent text nodes, so strip comments
  // before matching rather than asserting against the raw markup.
  const text = (el) => renderToString(el).replace(/<!--[^>]*-->/g, "");
  const withSpend = text(<MatrixTooltipForTest active t={(x) => x}
    payload={[{ payload: { placement: "A", clicks: 10, revenue: 100, spend: 20 } }]} />);
  if (!withSpend.includes("5.00x")) throw new Error("expected ROAS 5.00x");
  const without = text(<MatrixTooltipForTest active t={(x) => x}
    payload={[{ payload: { placement: "A", clicks: 10, revenue: 100 } }]} />);
  if (without.includes("ROAS")) throw new Error("ROAS must be absent without spend");
});

console.log("render:");
const ok = summarisePlacements(rows);
for (const [name, el] of [
  ["PlacementMatrix", <PlacementMatrix rows={ok.ok} />],
  ["PlacementMatrix (all below threshold)", <PlacementMatrix rows={[mk("tiny", 2, 0, 0, 0)]} />],
  ["PlacementMatrix (empty)", <PlacementMatrix rows={[]} />],
  ["PlacementFunnel", <PlacementFunnel rows={ok.ok} metric="clickToReg" />],
  ["PlacementFunnel (regToFtd)", <PlacementFunnel rows={ok.ok} metric="regToFtd" />],
  ["PlacementFunnel (empty)", <PlacementFunnel rows={[]} />],
  ["PlacementRevenue", <PlacementRevenue rows={ok.ok} />],
  ["PlacementRevenue (no revenue)", <PlacementRevenue rows={[mk("x", 50, 0, 0, 0)]} />],
  ["PlacementQuality", <PlacementQuality summary={ok} />],
  ["PlacementQuality (clean)", <PlacementQuality summary={summarisePlacements([mk("Clean", 100, 5, 1, 10)])} />],
]) check(name, () => renderToString(el));

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
