// Device section logic and renders. Values mirror the live table for
// 2026-08-01..11 so the expectations mean something.
import React from "react";
import { renderToString } from "react-dom/server";
import {
  findWaste,
  WASTE_MIN_CLICKS,
  DeviceMix,
  WasteCallout,
  OsComparison,
  OsVersions,
  OS_METRICS,
} from "../src/components/DeviceInsights.jsx";

const platforms = [
  { name: "Mobile", clicks: 15418, registers: 1425, ftds: 138, revenue: 840.05, spend: 106.83 },
  { name: "Desktop", clicks: 1697, registers: 4, ftds: 0, revenue: 0, spend: 6.63 },
  { name: "Tablet", clicks: 63, registers: 7, ftds: 2, revenue: 2.81, spend: 0.56 },
  { name: "TV", clicks: 8, registers: 0, ftds: 0, revenue: 0, spend: 0 },
];
const oses = [
  { name: "Android", clicks: 13082, registers: 1303, ftds: 131, revenue: 777.45, epc: 0.059, cr: 1.0 },
  { name: "iOS", clicks: 2402, registers: 129, ftds: 9, revenue: 65.41, epc: 0.027, cr: 0.37 },
  { name: "Windows", clicks: 479, registers: 1, ftds: 0, revenue: 0, epc: 0, cr: 0 },
  // Same label as a platform: the OS map falls back to the device name when a
  // row carries no OS, which is exactly how a duplicate key arises.
  { name: "Desktop", clicks: 941, registers: 0, ftds: 0, revenue: 0, epc: 0, cr: 0 },
];

let failed = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { failed++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: got ${a}, expected ${b}`); };

console.log("waste detection:");
check("finds volume that returns nothing", () => {
  const waste = findWaste(platforms);
  eq(waste.length, 1, "count");
  eq(waste[0].name, "Desktop", "name");
  eq(waste[0].clicks, 1697, "clicks");
});
check("ignores segments too small to conclude from", () => {
  // TV has no revenue but only 8 clicks — not evidence of anything.
  const names = findWaste(platforms).map((r) => r.name);
  if (names.includes("TV")) throw new Error("TV should be below the floor");
  eq(findWaste([{ name: "Tiny", clicks: WASTE_MIN_CLICKS - 1, revenue: 0 }]).length, 0, "under floor");
  eq(findWaste([{ name: "Big", clicks: WASTE_MIN_CLICKS, revenue: 0 }]).length, 1, "at floor");
});
check("earning segments are never flagged", () => {
  const names = findWaste(platforms).map((r) => r.name);
  if (names.includes("Mobile")) throw new Error("Mobile earns and must not be flagged");
});
check("deduplicates a label appearing in both lists", () => {
  // Desktop is present as a platform (1697) and as an OS fallback (941).
  const waste = findWaste([...platforms, ...oses]);
  const desktops = waste.filter((r) => r.name === "Desktop");
  eq(desktops.length, 1, "one Desktop row");
  eq(desktops[0].clicks, 1697, "keeps the larger");
  // And the total must not double-count it.
  eq(waste.reduce((a, r) => a + r.clicks, 0), 1697 + 479, "total clicks");
});
check("empty input is safe", () => eq(findWaste([]).length, 0, "empty"));

console.log("os metrics:");
check("every switch option maps to a field the rows carry", () => {
  for (const m of OS_METRICS) {
    if (!(m.key in oses[0])) throw new Error(`rows carry no "${m.key}"`);
  }
});

console.log("render:");
for (const [name, el] of [
  ["DeviceMix", <DeviceMix rows={platforms} />],
  ["DeviceMix (empty)", <DeviceMix rows={[]} />],
  ["DeviceMix (no revenue anywhere)", <DeviceMix rows={[{ name: "A", clicks: 10, revenue: 0 }]} />],
  ["WasteCallout", <WasteCallout rows={findWaste([...platforms, ...oses])} totalClicks={17186} />],
  ["WasteCallout (nothing wasted)", <WasteCallout rows={[]} totalClicks={100} />],
  ...OS_METRICS.map((m) => [`OsComparison (${m.key})`, <OsComparison rows={oses} metric={m.key} />]),
  ["OsComparison (empty)", <OsComparison rows={[]} />],
  ["OsVersions", <OsVersions rows={[
    { label: "Android 10", clicks: 12022, ftds: 131, revenue: 700 },
    { label: "iOS 18.7", clicks: 1140, ftds: 2, revenue: 5 },
  ]} />],
  ["OsVersions (empty)", <OsVersions rows={[]} />],
]) check(name, () => renderToString(el));

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
