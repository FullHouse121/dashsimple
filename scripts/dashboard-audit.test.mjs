// The dashboard scorecard, as assertions instead of an opinion.
//
// The main page was reviewed row by row — data integrity, metric validity,
// visualisation, hierarchy, colour, accessibility and the rest — and each row
// was scored. A score is worth nothing on its own: I assigned it, and nothing
// stopped the next change from quietly undoing the fix. So every finding that
// was repaired is written here as a condition that either holds or does not.
//
// These are source invariants, not a rendering test. There is no browser in
// this project's toolchain and adding one would pull ~300MB of binaries into
// the repo for a check that runs in seconds against the files themselves.
// That trade means a few rows cannot be covered here — real contrast against
// composited backgrounds, focus order, touch targets — and those are called
// out at the bottom rather than faked with a passing assertion.
//
// Run: npx vitest run scripts/dashboard-audit.test.jsx
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const app = read("src/App.jsx");
const css = read("src/styles.css");
const colors = read("src/lib/metricColors.js");
const geoMap = read("src/components/GeoValueMap.jsx");

// The home dashboard only — App.jsx holds several dashboards, and a check that
// scanned all of them would pass or fail for the wrong reasons.
const homeSlice = (() => {
  const start = app.indexOf("const homePrimaryStats = [");
  const end = app.indexOf("function GeosDashboard(");
  if (start < 0 || end < 0) throw new Error("could not locate the home dashboard in App.jsx");
  return app.slice(start, end);
})();

const results = [];
const check = (row, name, condition, detail = "") =>
  results.push({ row, name, pass: Boolean(condition), detail });

// ── 1. Data integrity ────────────────────────────────────────────────────
// Two elements were labelled "Total Revenue" and disagreed by $229.98 because
// one summed ftd+redeposit and the other read the tracker's own total.
check(
  1,
  "revenue has a single definition",
  /const revenueSplit = React\.useMemo\(/.test(app) && /const totalRevenue = revenueSplit\.total;/.test(app),
  "totalRevenue must come from the one revenueSplit pass"
);
check(
  1,
  "no second revenue total is summed from parts",
  !/acc \+ readFtdRevenue\(row\) \+ readRedepositRevenue\(row\)/.test(app),
  "summing the parts separately is what let the two figures drift"
);
// Conversion rates divided by raw clicks here while the rest of the app used
// uniques: 7.77% on this page against 20.88% on Campaigns, same metric name.
check(
  1,
  "conversion rates divide by unique clicks",
  /const c2r = toPercent\(totals\.registers, uniqueClickBase\);/.test(app),
  "c2r must use uniqueClickBase"
);
check(
  1,
  "the daily series uses the same denominator as the period figure",
  /c2r: toPercent\(row\.registers, row\.uniqueClicks > 0 \? row\.uniqueClicks : row\.clicks\)/.test(app),
  "otherwise the sparkline and the headline describe different quantities"
);

// ── 2. Metric validity ───────────────────────────────────────────────────
// With 0 of 10 ad accounts delivering spend, CPC printed $0.00 and ROI 846%.
for (const label of ["CPC", "Cost per Register", "Cost per FTD", "ROI"]) {
  const card = homeSlice.slice(homeSlice.indexOf(`label: "${label}"`), homeSlice.indexOf(`label: "${label}"`) + 420);
  check(2, `${label} withholds its value when spend is missing`, /costValue\(/.test(card), "must wrap the value in costValue()");
  check(2, `${label} states spend coverage`, /untrustedLabel: spendCoverageNote/.test(card), "must carry the coverage sentence");
}
check(
  2,
  "the blind guard needs zero delivering accounts, not merely untrusted",
  /const costBlind = Boolean\(costUntrusted\) && spendAccounts > 0 && spendDelivering === 0;/.test(app)
);

// ── 3. Data visualisation ────────────────────────────────────────────────
// Installs are zero in every row here, so any stage or series built on them
// drew a flat line, an empty bar, or a zero averaged into a headline.
check(
  3,
  "the funnel drops stages that carry no data",
  /return stages\.filter\(\(stage, index\) => index === 0 \|\| stage\.value > 0\);/.test(app)
);
check(
  3,
  "the rate chart drops series that carry no data",
  /const activeChartSeries = React\.useMemo\(/.test(app) && /homeChartSeries\.filter\(\(series\) =>/.test(app)
);
check(
  3,
  "untracked handoffs are excluded rather than averaged as zero",
  /\.filter\(\(item\) => item\.rate !== null && item\.rate !== undefined && Number\.isFinite\(item\.rate\) && item\.rate > 0\)/.test(app),
  "two structural zeros dragged a 7.77%/9.46% pair down to a printed 4%"
);
check(
  3,
  "the donut is gone",
  !/<Pie\b/.test(homeSlice),
  "a ring encodes parts of a whole; these are independent ratios over different denominators"
);
check(3, "each handoff shows its trend", /handoffRates\.map\(/.test(homeSlice) && /<Sparkline/.test(homeSlice));
check(
  3,
  "the rate axis carries its unit",
  /tickFormatter=\{\(value\) => `\$\{value\}%`\}/.test(app),
  "styled identically to the counts axis, it needs the % to be distinguishable"
);
check(
  3,
  "the overview axis thins its ticks",
  /interval=\{overviewData\.length > 12 \? Math\.ceil\(overviewData\.length \/ 10\) - 1 : 0\}/.test(app),
  "20 labels nearly touching against 10 on the chart below it"
);
// Ranking GEOs by rate with no floor put a $56 GEO above a $462 one.
check(3, "Top GEO carries revenue", /current\.revenue \+= readTotalRevenue\(row\);/.test(app));
check(3, "rate rankings require a sample", /const geoSampleFloor = React\.useMemo\(/.test(app));
check(
  3,
  "the sample floor is stated in the UI, not applied silently",
  /Ranked by rate, with at least/.test(app)
);
// The map was rebuilt as its own component; these two checks previously
// asserted the centroid-dot implementation it replaced, and now assert the
// property that mattered underneath it — every producing country is drawn,
// and the encoding is the projection's own rather than a tuned constant.
check(
  3,
  "the map is given every producing GEO",
  /const geoMapRows = React\.useMemo\(/.test(app) &&
    /\.filter\(\(geo\) => \(Number\(geo\[geoMetric\]\) \|\| 0\) > 0\)/.test(app)
);
check(
  3,
  "the projection fits itself to the data",
  /\.fitExtent\(/.test(geoMap),
  "a hand-tuned scale and centre clipped coastlines whenever the data moved"
);
check(
  3,
  "no hand-tuned projection constants remain",
  !/MAP_FRAME_W|MAP_WORLD_SCALE|MAP_COUNTRY_EXTENT_PAD/.test(app)
);
check(
  3,
  "countries are matched on a property the atlas actually carries",
  !/properties\.ISO_A3/.test(app) && !/properties\.ISO_A3/.test(geoMap),
  "world-atlas@2 exposes only `name`, so ISO_A3 was always undefined"
);
check(
  3,
  "map and table share one value ramp",
  /export const rampColor/.test(geoMap) && /rampColor\(geoWeightByIso\.get/.test(app),
  "a colour-per-country palette gave Colombia and Mexico the same purple"
);

// ── 4. Visual hierarchy ──────────────────────────────────────────────────
// Scoped to the array itself: the home slice also contains the Overview
// metric list, which has its own `label: "ROI"`.
const arraySlice = (name) => {
  const start = app.indexOf(`const ${name} = [`);
  return app.slice(start, app.indexOf("\n  ];", start));
};
const primaryLabels = (arraySlice("homePrimaryStats").match(/^\s{6}label: "([^"]+)",$/gm) || []).length;
const secondaryLabels = (arraySlice("homeSecondaryStats").match(/^\s{6}label: "([^"]+)",$/gm) || []).length;
check(4, "the rail leads with three outcome cards", primaryLabels === 3, `found ${primaryLabels}`);
check(4, "the supporting row holds the remaining five", secondaryLabels === 5, `found ${secondaryLabels}`);
check(4, "the hero card is wider than its neighbours", /\.cards\.hero \{\s*grid-template-columns: 2fr 1fr 1fr;/.test(css));
check(4, "the hero figure is larger than the rest", /\.cards\.hero > \*:first-child \.card-value \{\s*font-size: 38px;/.test(css));
check(4, "supporting cards are denser", /\.cards\.secondary \{\s*grid-template-columns: repeat\(5, minmax\(0, 1fr\)\);/.test(css));

// ── 5. Density and redundancy ────────────────────────────────────────────
check(
  5,
  "the conversion legend is rendered once on the home page",
  (homeSlice.match(/activeChartSeries\.map\(\(item\) => \{/g) || []).length === 1,
  "Statistics and the old donut printed the same two labels ~400px apart"
);

// ── 6. Layout and spacing ────────────────────────────────────────────────
check(
  6,
  "the short chart row sizes to its content",
  /\.panels\.extra \.panel \{\s*min-height: 0;/.test(css),
  "the global 380px floor left 87px and 107px of dead space"
);

// ── 8. Colour semantics ──────────────────────────────────────────────────
// Green meant FTDs in one panel and Register in the next; orange meant three
// things at once.
check(8, "colour is defined in one place", /export const METRIC_COLORS = \{/.test(colors));
const metricValues = [...colors.matchAll(/^\s{2}(\w+): "(var\(--[a-z]+\))",$/gm)].map((m) => m[2]);
check(
  8,
  "no two concepts share a colour",
  new Set(metricValues).size === metricValues.length,
  `${metricValues.length} concepts, ${new Set(metricValues).size} distinct colours`
);
check(
  8,
  "a rate takes the colour of what it produces",
  /r2d: METRIC_COLORS\.ftd,/.test(colors) && /c2r: METRIC_COLORS\.registration,/.test(colors)
);
for (const [series, token] of [["homeChartSeries", "RATE_COLORS"], ["funnelData stages", "STAGE_COLORS"]]) {
  void series;
  check(8, `${series} import their colours`, app.includes(token));
}
check(
  8,
  "no chart series hardcodes a colour",
  !/\{ key: "c2[ir]", label: "[^"]+", color: "var\(--/.test(app) &&
    !/\{ name: "(Clicks|Register|FTD)", value: [^,]+, color: "var\(--/.test(app)
);

// ── 11. Accessibility ────────────────────────────────────────────────────
check(11, "the page has a document heading", /<h1 className="sr-only">/.test(app), "there were zero h1 elements");
check(11, "the heading names the current view", /navItemMap\[activeView\]\?\.label \|\| "Dashboard"/.test(app));
check(11, ".sr-only is defined", /^\.sr-only \{/m.test(css));
const strayPanelH3 = ["src/App.jsx", "src/dashboards/ReportsDashboard.jsx", "src/dashboards/ConversionsDashboard.jsx", "src/dashboards/LiveClicksDashboard.jsx", "src/components/ExecutiveReportPanel.jsx"]
  .reduce((n, f) => n + (read(f).match(/<h3 className="panel-title"/g) || []).length, 0);
check(
  11,
  "panel titles are h2, so headings do not skip from h1 to h3",
  strayPanelH3 === 0,
  `${strayPanelH3} panel titles are still h3`
);

// ── 12. Motion ───────────────────────────────────────────────────────────
const reducedMotionBlocks = (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length;
check(12, "motion can be turned off", reducedMotionBlocks > 0, `${reducedMotionBlocks} blocks`);

// ── 13. Component consistency ────────────────────────────────────────────
check(
  13,
  "series chips use one treatment",
  /\.legend-item\.is-interactive \{[^}]*border-radius: 999px;/s.test(css),
  "a 999px pill in one panel and a flat 8px chip in the other"
);

// ── Report ───────────────────────────────────────────────────────────────
const rowNames = {
  1: "Data integrity",
  2: "Metric validity",
  3: "Data visualisation",
  4: "Visual hierarchy",
  5: "Density / redundancy",
  6: "Layout & spacing",
  8: "Colour semantics",
  11: "Accessibility",
  12: "Motion",
  13: "Component consistency",
};
const failedChecks = results.filter((r) => !r.pass);
if (!process.env.VITEST || failedChecks.length) {
  for (const row of Object.keys(rowNames).map(Number).sort((a, b) => a - b)) {
    const rows = results.filter((r) => r.row === row);
    const bad = rows.filter((r) => !r.pass).length;
    console.log(`  ${bad ? "FAIL" : " ok "}  ${row}. ${rowNames[row]} — ${rows.length - bad}/${rows.length}`);
    rows.filter((r) => !r.pass).forEach((r) => console.log(`         ${r.name}${r.detail ? ` — ${r.detail}` : ""}`));
  }
  console.log(`\n${results.length - failedChecks.length}/${results.length} checks passed`);
}

// Not covered here, and not pretended otherwise: contrast against composited
// backgrounds, keyboard focus order, touch-target sizing and real viewport
// behaviour all need a rendered page. They were verified by hand against a
// live browser; re-verify them the same way after layout changes.

if (process.env.VITEST) {
  const { test, expect } = await import("vitest");
  test("dashboard audit: every scorecard invariant holds", () => {
    expect(
      failedChecks.map((r) => `${r.row}. ${r.name}`),
      "scorecard regressions — see the output above"
    ).toEqual([]);
  });
} else {
  process.exit(failedChecks.length ? 1 : 0);
}
