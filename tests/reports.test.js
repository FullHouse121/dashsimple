// The report builder hands buyers a query language over the tracker and over
// our own tables. Two things have to hold no matter what changes:
//   1. A field can only be read if the catalog names it (no injection, no
//      secrets, no silently-dropped Keitaro measure).
//   2. The buyer scope filter keeps its (?i) flag — this tracker's
//      MATCH_REGEXP is case-sensitive and every short form is lowercased, so
//      losing the flag makes every buyer's report silently empty.
import { describe, it, expect } from "vitest";
import {
  REPORT_SOURCES,
  KEITARO_DIMENSIONS,
  KEITARO_MEASURES,
  DERIVED_MEASURES,
  PERFORMANCE_MEASURES,
  DERIVED_SORT_SCAN,
  applyDerived,
  sortRows,
  DASHBOARD_ENTITIES,
  OPERATORS_BY_TYPE,
  fieldMapFor,
  buildScopeFilter,
  normalizeReportRequest,
  toKeitaroPayload,
  describeColumns,
  buildDashboardQuery,
  filtersToSql,
  csvCell,
  csvHeaderLine,
  csvRowLine,
  previewCell,
  exportNotes,
  estimateExportBytes,
  exportValue,
  exportFilename,
  MAX_PREVIEW_ROWS,
  MAX_EXPORT_ROWS,
} from "../server/lib/reports.js";

const RANGE = { from: "2026-07-01", to: "2026-07-31", timezone: "Asia/Dubai" };
const perf = (patch = {}) => ({
  source: "performance",
  range: RANGE,
  dimensions: ["day", "campaign"],
  measures: ["clicks"],
  ...patch,
});

describe("buildScopeFilter — the permission boundary", () => {
  it("keeps the (?i) flag: without it every buyer report comes back empty", () => {
    const filter = buildScopeFilter(["leo", "leomarketing"]);
    expect(filter.expression.startsWith("(?i)")).toBe(true);
    expect(filter.operator).toBe("MATCH_REGEXP");
    expect(filter.name).toBe("campaign");
  });

  it("matches a real campaign name case-insensitively, on word boundaries only", () => {
    const { expression } = buildScopeFilter(["leo"]);
    // Node's RegExp has no inline (?i); strip it and apply the flag directly,
    // which is exactly what the tracker does with this pattern.
    const re = new RegExp(expression.replace("(?i)", ""), "i");
    expect(re.test("Leo | PWA | Chicken Road | BR | BETORSPINBR")).toBe(true);
    expect(re.test("leo | pwa | x | br | y")).toBe(true);
    // …and never mid-word, or one buyer inherits another's rows.
    expect(re.test("Cleopatra | PWA | x | BR | y")).toBe(false);
    expect(re.test("Leonardo2 | PWA | x")).toBe(false);
  });

  it("escapes regex metacharacters in a buyer name", () => {
    const { expression } = buildScopeFilter(["a.b*c"]);
    expect(expression).toContain("a\\.b\\*c");
  });

  it("returns null when there is no identity to scope by (caller must refuse)", () => {
    expect(buildScopeFilter([])).toBeNull();
    expect(buildScopeFilter(["", "  "])).toBeNull();
    expect(buildScopeFilter(null)).toBeNull();
  });

  it("targets the caller's chosen scope field", () => {
    expect(buildScopeFilter(["leo"], "campaign").name).toBe("campaign");
  });
});

describe("catalog integrity (probed against the live tracker 2026-08-01)", () => {
  it("excludes everything this tracker rejects or silently drops", () => {
    const dims = new Set(KEITARO_DIMENSIONS.map((d) => d.key));
    const measures = new Set(KEITARO_MEASURES.map((m) => m.key));
    // Hard-errored as dimensions
    for (const bad of ["language_id", "device_type_id", "parent_campaign", "is_lead", "is_sale", "is_rejected", "extra_param_1"]) {
      expect(dims.has(bad)).toBe(false);
    }
    // Answered 200 but omitted the column — the dangerous case, since it
    // would reach a buyer as a silently blank column.
    expect(measures.has("rebills")).toBe(false);
    // Custom conversions that do not exist on this instance
    for (const n of [1, 2, 3, 4, 5, 6, 11, 12]) {
      expect(measures.has(`custom_conversion_${n}`)).toBe(false);
    }
    // …and the four that do
    for (const n of [7, 8, 9, 10]) {
      expect(measures.has(`custom_conversion_${n}`)).toBe(true);
    }
  });

  it("never offers a Meta access token as a column", () => {
    const everything = JSON.stringify(DASHBOARD_ENTITIES);
    expect(everything).not.toContain("token_eaag");
    expect(/token/i.test(everything)).toBe(false);
    expect(fieldMapFor("dashboard", "pixels").has("token_eaag")).toBe(false);
  });

  it("marks finance and audit data leadership-only", () => {
    expect(DASHBOARD_ENTITIES.expenses.leadershipOnly).toBe(true);
    expect(DASHBOARD_ENTITIES.audit_logs.leadershipOnly).toBe(true);
    expect(DASHBOARD_ENTITIES.tracking_links.leadershipOnly).toBeUndefined();
  });

  it("gives every source a scope field so no source can run unscoped", () => {
    for (const def of Object.values(REPORT_SOURCES)) {
      if (def.kind === "table") continue; // scoped by SQL owner/buyer columns
      expect(def.scopeField).toBeTruthy();
    }
  });
});

describe("normalizeReportRequest — validation", () => {
  it("accepts a well-formed request", () => {
    const result = normalizeReportRequest(perf());
    expect(result.ok).toBe(true);
    expect(result.request.dimensions).toEqual(["day", "campaign"]);
    expect(result.request.limit).toBe(MAX_PREVIEW_ROWS);
  });

  it("rejects unknown fields rather than dropping them", () => {
    expect(normalizeReportRequest(perf({ dimensions: ["extra_param_1"] })).error).toMatch(/Unknown field/);
    expect(normalizeReportRequest(perf({ measures: ["rebills"] })).error).toMatch(/Unknown field/);
    expect(normalizeReportRequest({ ...perf(), source: "nope" }).error).toMatch(/Unknown report source/);
  });

  it("refuses a metric used as a grouping and vice versa", () => {
    expect(normalizeReportRequest(perf({ dimensions: ["clicks"] })).error).toMatch(/is a metric/);
    expect(normalizeReportRequest(perf({ measures: ["country"] })).error).toMatch(/is a grouping field/);
  });

  it("requires both halves of an aggregated report", () => {
    expect(normalizeReportRequest(perf({ dimensions: [] })).error).toMatch(/group by/);
    expect(normalizeReportRequest(perf({ measures: [] })).error).toMatch(/at least one metric/);
  });

  it("validates the range", () => {
    expect(normalizeReportRequest(perf({ range: { from: "2026-07-31", to: "2026-07-01" } })).error).toMatch(/starts after/);
    expect(normalizeReportRequest(perf({ range: { from: "nope", to: "2026-07-01" } })).error).toMatch(/valid date range/);
  });

  it("caps rows differently for preview and export", () => {
    expect(normalizeReportRequest(perf({ limit: 999999 })).request.limit).toBe(MAX_PREVIEW_ROWS);
    expect(normalizeReportRequest(perf({ limit: 999999 }), { forExport: true }).request.limit).toBe(MAX_EXPORT_ROWS);
  });

  it("rejects a sort on a field that is not in the report", () => {
    expect(normalizeReportRequest(perf({ sort: [{ name: "haxx", order: "ASC" }] })).error).toMatch(/Cannot sort/);
    expect(normalizeReportRequest(perf({ sort: [{ name: "clicks", order: "ASC" }] })).ok).toBe(true);
  });

  it("de-duplicates repeated column picks", () => {
    const r = normalizeReportRequest(perf({ dimensions: ["day", "day", "campaign"] }));
    expect(r.request.dimensions).toEqual(["day", "campaign"]);
  });
});

describe("filter validation", () => {
  const withFilter = (filter) => normalizeReportRequest(perf({ filters: [filter] }));

  it("binds an operator to the field's type", () => {
    expect(withFilter({ field: "clicks", operator: "CONTAINS", value: "x" }).error).toMatch(/not valid/);
    expect(withFilter({ field: "campaign", operator: "GREATER_THAN", value: 1 }).error).toMatch(/not valid/);
    expect(withFilter({ field: "is_bot", operator: "IS_FALSE" }).ok).toBe(true);
  });

  it("rejects an unknown filter field — a dropped filter would widen the result", () => {
    expect(withFilter({ field: "secret", operator: "EQUALS", value: 1 }).error).toMatch(/Unknown filter field/);
  });

  it("coerces list, pair and scalar values", () => {
    expect(withFilter({ field: "country_code", operator: "IN_LIST", value: "TR, MX ,BR" }).request.filters[0].expression)
      .toEqual(["TR", "MX", "BR"]);
    expect(withFilter({ field: "clicks", operator: "BETWEEN", value: ["1", "9"] }).request.filters[0].expression)
      .toEqual([1, 9]);
    expect(withFilter({ field: "clicks", operator: "GREATER_THAN", value: "42" }).request.filters[0].expression).toBe(42);
  });

  it("demands a value where one is needed, and none where it is not", () => {
    expect(withFilter({ field: "campaign", operator: "CONTAINS", value: "" }).error).toMatch(/needs a value/);
    expect(withFilter({ field: "country_code", operator: "IN_LIST", value: "" }).error).toMatch(/at least one value/);
    expect(withFilter({ field: "clicks", operator: "BETWEEN", value: ["1"] }).error).toMatch(/min and a max/);
    expect(withFilter({ field: "clicks", operator: "EQUALS", value: "abc" }).error).toMatch(/must be a number/);
    expect(withFilter({ field: "campaign", operator: "IS_SET" }).request.filters[0].expression).toBeUndefined();
  });

  it("offers only type-appropriate operators", () => {
    expect(OPERATORS_BY_TYPE.bool).toEqual(["IS_TRUE", "IS_FALSE"]);
    expect(OPERATORS_BY_TYPE.number).not.toContain("CONTAINS");
    expect(OPERATORS_BY_TYPE.string).toContain("IN_LIST");
  });
});

describe("toKeitaroPayload", () => {
  it("appends the scope filter to the user's own filters", () => {
    const { request } = normalizeReportRequest(perf({
      filters: [{ field: "country_code", operator: "IN_LIST", value: ["TR"] }],
    }));
    const scope = buildScopeFilter(["sara"]);
    const payload = toKeitaroPayload(request, scope);
    expect(payload.filters).toHaveLength(2);
    expect(payload.filters[1]).toBe(scope);
    expect(payload.grouping).toEqual(["day", "campaign"]);
    expect(payload.metrics).toEqual(["clicks"]);
    expect(payload.summary).toBe(true);
  });

  it("uses a flat column list for raw log sources", () => {
    const { request } = normalizeReportRequest({
      source: "conversions", range: RANGE, columns: ["status", "revenue"],
    });
    const payload = toKeitaroPayload(request, null);
    expect(payload.columns).toEqual(["status", "revenue"]);
    expect(payload.grouping).toBeUndefined();
  });
});

describe("describeColumns", () => {
  it("labels columns and tags which are measures", () => {
    const { request } = normalizeReportRequest(perf({ measures: ["clicks", "revenue"] }));
    const cols = describeColumns(request);
    expect(cols.map((c) => c.key)).toEqual(["day", "campaign", "clicks", "revenue"]);
    expect(cols.find((c) => c.key === "revenue")).toMatchObject({ role: "measure", format: "money" });
    expect(cols.find((c) => c.key === "day").role).toBe("dimension");
  });
});

describe("dashboard-data source", () => {
  const dash = (patch = {}) => ({
    source: "dashboard", entity: "tracking_links", range: {},
    columns: ["name", "buyer"], ...patch,
  });

  it("rejects an unknown entity and unknown columns", () => {
    expect(normalizeReportRequest(dash({ entity: "users" })).error).toMatch(/Unknown data set/);
    expect(normalizeReportRequest(dash({ columns: ["name; DROP TABLE x"] })).error).toMatch(/Unknown column/);
    expect(normalizeReportRequest(dash({ entity: "pixels", columns: ["token_eaag"] })).error).toMatch(/Unknown column/);
  });

  it("treats the date range as optional", () => {
    expect(normalizeReportRequest(dash()).ok).toBe(true);
    expect(normalizeReportRequest(dash({ range: { from: "2026-07-31", to: "2026-07-01" } })).error).toMatch(/valid date range/);
  });

  it("parameterises every value and never interpolates identifiers", () => {
    const { request } = normalizeReportRequest(dash({
      filters: [{ field: "buyer", operator: "CONTAINS", value: "'; DROP TABLE tracking_links; --" }],
    }));
    const { sql, params } = buildDashboardQuery(request, { viewerId: null, buyerForms: [] });
    expect(sql).not.toContain("DROP TABLE");
    expect(params).toContain("%'; DROP TABLE tracking_links; --%");
    expect(sql).toMatch(/ILIKE \$\d+/);
  });

  it("scopes a buyer by owner id or buyer name, and returns nothing when it cannot", () => {
    const { request } = normalizeReportRequest(dash());
    const scoped = buildDashboardQuery(request, { viewerId: 7, buyerForms: ["sara"] });
    expect(scoped.sql).toContain('"owner_id" = $');
    expect(scoped.params).toContain(7);
    expect(scoped.params).toContainEqual(["sara"]);

    // brands has neither an owner nor a buyer column: a buyer must get no
    // rows rather than the whole table.
    const brands = normalizeReportRequest({ source: "dashboard", entity: "brands", range: {}, columns: ["name"] });
    const brandsQuery = buildDashboardQuery(brands.request, { viewerId: 7, buyerForms: ["sara"] });
    expect(brandsQuery.sql).toContain("FALSE");
  });

  it("leaves leadership unscoped", () => {
    const { request } = normalizeReportRequest(dash());
    const { sql } = buildDashboardQuery(request, { viewerId: null, buyerForms: [] });
    expect(sql).not.toContain("owner_id");
    expect(sql).not.toContain("FALSE");
  });

  it("counts with the same WHERE as it selects, minus limit/offset", () => {
    const { request } = normalizeReportRequest(dash({
      filters: [{ field: "geo", operator: "IN_LIST", value: ["MX"] }],
    }));
    const { params, countParams } = buildDashboardQuery(request, { viewerId: 7, buyerForms: ["sara"] });
    expect(countParams).toEqual(params.slice(0, params.length - 2));
  });
});

describe("filtersToSql", () => {
  it("maps each operator to safe parameterised SQL", () => {
    const { clauses, params } = filtersToSql([
      { name: "status", operator: "EQUALS", expression: "Active" },
      { name: "geo", operator: "IN_LIST", expression: ["MX", "BR"] },
      { name: "name", operator: "IS_SET" },
      { name: "amount", operator: "BETWEEN", expression: [1, 10] },
    ]);
    expect(clauses[0]).toBe('"status" = $1');
    expect(clauses[1]).toContain("= ANY($2)");
    expect(clauses[2]).toContain("IS NOT NULL");
    expect(clauses[3]).toBe('"amount" BETWEEN $3 AND $4');
    expect(params).toEqual(["Active", ["MX", "BR"], 1, 10]);
  });
});

describe("derived measures", () => {
  const withDerived = (measures) => normalizeReportRequest(perf({ measures }));

  it("pulls in base measures the formula needs but the user did not pick", () => {
    const { request } = withDerived(["u2r", "u2ftd", "cpftd"]);
    expect(request.derivedKeys).toEqual(["u2r", "u2ftd", "cpftd"]);
    // unique clicks / regs / FTD / cost are fetched even though none were chosen
    expect(request.keitaroMeasures.sort()).toEqual(
      ["campaign_unique_clicks", "cost", "custom_conversion_8", "regs"].sort()
    );
    // …and are NOT added to the visible columns
    expect(request.measures).toEqual(["u2r", "u2ftd", "cpftd"]);
  });

  it("never sends a derived key to Keitaro, which would silently drop it", () => {
    const { request } = withDerived(["u2r", "clicks"]);
    const payload = toKeitaroPayload(request, null);
    expect(payload.metrics).not.toContain("u2r");
    expect(payload.metrics).toContain("campaign_unique_clicks");
    expect(payload.metrics).toContain("clicks");
  });

  it("computes the rates the Statistics view uses", () => {
    const row = {
      clicks: 1000, campaign_unique_clicks: 800, regs: 40,
      custom_conversion_8: 10, custom_conversion_7: 4, cost: 250, revenue: 900,
    };
    applyDerived([row], ["c2r", "u2r", "u2ftd", "r2d", "d2rd", "uniq_rate", "cpftd", "arpu", "net_profit", "roi_calc", "margin"]);
    expect(row.c2r).toBeCloseTo(4);        // 40/1000
    expect(row.u2r).toBeCloseTo(5);        // 40/800  — the unique denominator
    expect(row.u2ftd).toBeCloseTo(1.25);   // 10/800
    expect(row.r2d).toBeCloseTo(25);       // 10/40
    expect(row.d2rd).toBeCloseTo(40);      // 4/10
    expect(row.uniq_rate).toBeCloseTo(80); // 800/1000
    expect(row.cpftd).toBeCloseTo(25);     // 250/10
    expect(row.arpu).toBeCloseTo(90);      // 900/10
    expect(row.net_profit).toBeCloseTo(650);
    expect(row.roi_calc).toBeCloseTo(260); // (900-250)/250
    expect(row.margin).toBeCloseTo(72.222);
  });

  it("rounds so float noise never reaches the file", () => {
    // 1/3 → 33.33333333333333 lands in the CSV verbatim without this.
    const row = { campaign_unique_clicks: 3, regs: 1, clicks: 3, cost: 1, custom_conversion_8: 3 };
    applyDerived([row], ["u2r", "cpftd"]);
    expect(row.u2r).toBe(33.3333);
    expect(row.cpftd).toBe(0.3333);
    expect(String(row.u2r)).not.toMatch(/\d{6}/);
  });

  it("returns null on a zero denominator instead of a fake 0%", () => {
    const row = { clicks: 0, campaign_unique_clicks: 0, regs: 0, custom_conversion_8: 0, cost: 0, revenue: 0 };
    applyDerived([row], ["u2r", "u2ftd", "cpftd", "roi_calc", "margin"]);
    for (const key of ["u2r", "u2ftd", "cpftd", "roi_calc", "margin"]) {
      expect(row[key]).toBeNull();
    }
  });

  it("recomputes totals from summed bases — never averages the per-row rates", () => {
    // A 1-click day and a 100k-click day: averaging the rates gives ~50%,
    // the truth is ~0.001%.
    const rows = [
      { campaign_unique_clicks: 1, regs: 1 },
      { campaign_unique_clicks: 100000, regs: 1 },
    ];
    applyDerived(rows, ["u2r"]);
    expect(rows[0].u2r).toBeCloseTo(100);
    expect(rows[1].u2r).toBeCloseTo(0.001);
    const naiveAverage = (rows[0].u2r + rows[1].u2r) / 2;

    const summary = { campaign_unique_clicks: 100001, regs: 2 };
    applyDerived([summary], ["u2r"]);
    expect(summary.u2r).toBeCloseTo(0.002);
    expect(summary.u2r).not.toBeCloseTo(naiveAverage);
  });

  it("flags a derived sort so it is applied after computing, not by Keitaro", () => {
    expect(withDerived(["u2r"]).request.derivedSort).toBe(false);
    const sorted = normalizeReportRequest(perf({ measures: ["u2r"], sort: [{ name: "u2r", order: "DESC" }] }));
    expect(sorted.request.derivedSort).toBe(true);
    const payload = toKeitaroPayload(sorted.request, null);
    expect(payload.sort).toEqual([]);
    expect(payload.limit).toBe(DERIVED_SORT_SCAN);
  });

  it("sorts derived columns with empty rates last", () => {
    const rows = [{ u2r: 5 }, { u2r: null }, { u2r: 40 }, { u2r: 12 }];
    sortRows(rows, [{ name: "u2r", order: "DESC" }]);
    expect(rows.map((r) => r.u2r)).toEqual([40, 12, 5, null]);
    sortRows(rows, [{ name: "u2r", order: "ASC" }]);
    expect(rows.map((r) => r.u2r)).toEqual([5, 12, 40, null]);
  });

  it("carries the formula through to the column metadata", () => {
    const { request } = withDerived(["u2ftd"]);
    const [column] = describeColumns(request).filter((c) => c.key === "u2ftd");
    expect(column.hint).toBe("FTDs ÷ unique clicks");
    expect(column.derived).toBe(true);
    expect(column.format).toBe("percent");
    expect(column.role).toBe("measure");
  });

  it("is findable by the names the team actually uses", () => {
    // The labels read as funnels but buyers type "unique2reg". A search that
    // returns nothing reads as "this metric does not exist" — which is
    // exactly how this was reported.
    const search = (term) =>
      PERFORMANCE_MEASURES.filter((f) => {
        const hay = [f.label, f.key, f.hint || "", ...(f.aliases || [])].join(" ").toLowerCase();
        return hay.includes(term) || hay.replace(/[\s→_-]+/g, "").includes(term.replace(/\s+/g, ""));
      }).map((f) => f.key);

    expect(search("unique2reg")).toContain("u2r");
    expect(search("unique2dep")).toContain("u2ftd");
    expect(search("uniq2dep")).toContain("u2ftd");
    expect(search("reg2dep")).toContain("r2d");
    expect(search("click2dep")).toContain("c2ftd");
    expect(search("cpa")).toContain("cpftd");
    expect(search("spend")).toContain("cost");
    expect(search("deposit")).toContain("custom_conversion_8");
    // the display names still work
    expect(search("unique → register")).toContain("u2r");
  });

  it("keeps every derived formula pointing at a real base measure", () => {
    const base = new Set(KEITARO_MEASURES.map((m) => m.key));
    for (const m of DERIVED_MEASURES) {
      expect(m.requires.length).toBeGreaterThan(0);
      for (const requirement of m.requires) expect(base.has(requirement)).toBe(true);
      expect(m.hint).toBeTruthy();
    }
  });
});

describe("export preview", () => {
  const columns = [
    { key: "country", label: "Country", type: "string", role: "dimension" },
    { key: "clicks", label: "Clicks", type: "number", format: "int", role: "measure" },
    { key: "roi_calc", label: "ROI", type: "number", format: "percent", role: "measure" },
  ];
  const rows = [
    { country: "Brazil", clicks: 5669, roi_calc: -100 },
    { country: "=cmd|calc", clicks: 12, roi_calc: null },
  ];

  it("renders the preview through the same writer the export uses", () => {
    // If these ever diverge the preview becomes a lie about the file.
    expect(csvHeaderLine(columns)).toBe('"Country","Clicks","ROI"');
    expect(csvRowLine(columns, rows[0])).toBe('"Brazil","5669","-100"');
    // formula-shaped value neutralised, empty rate renders as an empty cell
    expect(csvRowLine(columns, rows[1])).toBe(`"'=cmd|calc","12",""`);
  });

  it("types preview cells per format", () => {
    expect(previewCell(5669, columns[1], "xlsx")).toBe(5669);
    expect(previewCell("5669", columns[1], "csv")).toBe("5669");
    expect(previewCell(null, columns[2], "json")).toBeNull();
    expect(previewCell(null, columns[2], "csv")).toBe("");
  });

  it("warns when a format cannot hold the whole report", () => {
    expect(exportNotes("pdf", 50000).join(" ")).toMatch(/capped at 5,000 rows/);
    expect(exportNotes("pdf", 100).join(" ")).not.toMatch(/capped at 5,000 rows/);
    expect(exportNotes("csv", 300000).join(" ")).toMatch(/first 200,000/);
    expect(exportNotes("csv", 10).join(" ")).toMatch(/apostrophe/);
    expect(exportNotes("xlsx", 10).join(" ")).toMatch(/real Excel numbers/);
  });

  it("estimates size from the sample and the true row count", () => {
    const small = estimateExportBytes({ format: "csv", columns, sampleRows: rows, totalRows: 2 });
    const big = estimateExportBytes({ format: "csv", columns, sampleRows: rows, totalRows: 20000 });
    expect(big).toBeGreaterThan(small * 1000);
    // A PDF stops at its cap, so its estimate must stop growing there too.
    const pdfHuge = estimateExportBytes({ format: "pdf", columns, sampleRows: rows, totalRows: 1000000 });
    const pdfAtCap = estimateExportBytes({ format: "pdf", columns, sampleRows: rows, totalRows: 5000 });
    expect(pdfHuge).toBe(pdfAtCap);
    expect(estimateExportBytes({ format: "csv", columns, sampleRows: [], totalRows: 100 })).toBe(0);
  });
});

describe("export helpers", () => {
  it("neutralises formula injection from postback-supplied values", () => {
    expect(csvCell("=cmd|'/c calc'!A1")).toBe(`"'=cmd|'/c calc'!A1"`);
    expect(csvCell("@SUM(1)")).toBe(`"'@SUM(1)"`);
    expect(csvCell("+1+1")).toBe(`"'+1+1"`);
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it("leaves real numbers alone so Excel keeps them numeric", () => {
    // A negative ROI is a number, not a formula. Quoting it turned every
    // negative ROI/profit column into unsummable text.
    expect(csvCell(-100)).toBe('"-100"');
    expect(csvCell("-100")).toBe('"-100"');
    expect(csvCell("-12.5")).toBe('"-12.5"');
    expect(csvCell("-1e5")).toBe('"-1e5"');
    // …but anything formula-shaped still gets the quote.
    expect(csvCell("-1+1")).toBe(`"'-1+1"`);
    expect(csvCell("-cmd")).toBe(`"'-cmd"`);
  });

  it("types values for xlsx", () => {
    expect(exportValue("42.5", { type: "number" })).toBe(42.5);
    expect(exportValue("abc", { type: "number" })).toBeNull();
    expect(exportValue(null, { type: "string" })).toBeNull();
    expect(exportValue(7, { type: "string" })).toBe("7");
  });

  it("builds a safe filename with or without a range", () => {
    expect(exportFilename("performance", { from: "2026-07-01", to: "2026-07-31" }, "csv"))
      .toBe("performance-2026-07-01_to_2026-07-31.csv");
    expect(exportFilename("brands", {}, "xlsx")).toBe("brands.xlsx");
    expect(exportFilename("a/b c", {}, "csv")).toBe("a-b-c.csv");
  });
});
