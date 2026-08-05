// Report builder — the field catalog and request validation behind the
// Reports view. Pure: no DB, no fetch, no Express. Unit-tested in
// tests/reports.test.js.
//
// EVERY field below was probed one at a time against this tracker
// (2026-08-01). That matters more than it sounds: Keitaro **silently drops**
// an unknown measure — it answers 200 and just omits the column, so a typo
// becomes a blank column in a buyer's export instead of an error. Dimensions
// do hard-error. Anything not on these lists was rejected or dropped by the
// live instance and must not be offered in the UI.
//
// Confirmed absent here: `rebills` (dropped), custom_conversion_1-6/11/12,
// `extra_param_1..10`, `language_id`, `device_type_id`, `parent_campaign`,
// `is_lead`, `is_sale`, `is_rejected`. `GET /report/labels` 400s on this
// instance, so there is no discovery endpoint — this file IS the catalog.

// ── Field types → which operators the UI may offer ───────────────────
export const OPERATORS_BY_TYPE = {
  string: [
    "CONTAINS", "NOT_CONTAIN", "EQUALS", "NOT_EQUAL", "BEGINS_WITH", "ENDS_WITH",
    "IN_LIST", "NOT_IN_LIST", "MATCH_REGEXP", "NOT_MATCH_REGEXP", "IS_SET", "IS_NOT_SET",
  ],
  number: [
    "EQUALS", "NOT_EQUAL", "GREATER_THAN", "LESS_THAN",
    "EQUALS_OR_GREATER_THAN", "EQUALS_OR_LESS_THAN", "BETWEEN",
  ],
  bool: ["IS_TRUE", "IS_FALSE"],
  date: ["BETWEEN", "GREATER_THAN", "LESS_THAN", "EQUALS_OR_GREATER_THAN", "EQUALS_OR_LESS_THAN"],
};

// Operators that carry no expression, and the one that carries two.
export const NO_VALUE_OPERATORS = new Set(["IS_SET", "IS_NOT_SET", "IS_TRUE", "IS_FALSE"]);
export const LIST_OPERATORS = new Set(["IN_LIST", "NOT_IN_LIST"]);
export const PAIR_OPERATORS = new Set(["BETWEEN"]);

const dim = (key, label, group, type = "string") => ({ key, label, group, type });

// ── Keitaro dimensions (report/build `grouping`) ─────────────────────
const SUB_ID_DIMENSIONS = Array.from({ length: 30 }, (_, i) =>
  dim(`sub_id_${i + 1}`, `Sub ID ${i + 1}`, "Sub IDs")
);

export const KEITARO_DIMENSIONS = [
  // Campaign & routing
  dim("campaign", "Campaign", "Campaign"),
  dim("campaign_id", "Campaign ID", "Campaign", "number"),
  dim("campaign_group", "Campaign group", "Campaign"),
  dim("campaign_group_id", "Campaign group ID", "Campaign", "number"),
  dim("parent_campaign_id", "Parent campaign ID", "Campaign", "number"),
  dim("stream", "Stream", "Campaign"),
  dim("stream_id", "Stream ID", "Campaign", "number"),
  dim("offer", "Offer", "Campaign"),
  dim("offer_id", "Offer ID", "Campaign", "number"),
  dim("landing", "Landing", "Campaign"),
  dim("landing_id", "Landing ID", "Campaign", "number"),
  dim("affiliate_network", "Affiliate network", "Campaign"),
  dim("ts", "Traffic source", "Campaign"),
  dim("ts_id", "Traffic source ID", "Campaign", "number"),

  // Time
  dim("day", "Day", "Time", "date"),
  dim("hour", "Hour", "Time"),
  dim("day_hour", "Day + hour", "Time"),
  dim("week", "Week", "Time"),
  dim("month", "Month", "Time"),
  dim("year", "Year", "Time"),
  dim("weekday", "Weekday", "Time"),
  dim("datetime", "Datetime", "Time", "date"),

  // Geo & network
  dim("country", "Country", "Geo"),
  dim("country_code", "Country code", "Geo"),
  dim("region", "Region", "Geo"),
  dim("city", "City", "Geo"),
  dim("language", "Language", "Geo"),
  dim("operator", "Mobile operator", "Geo"),
  dim("isp", "ISP", "Geo"),
  dim("connection_type", "Connection type", "Geo"),

  // Device
  dim("os", "OS", "Device"),
  dim("os_version", "OS version", "Device"),
  dim("browser", "Browser", "Device"),
  dim("browser_version", "Browser version", "Device"),
  dim("device_type", "Device type", "Device"),
  dim("device_model", "Device model", "Device"),
  dim("user_agent", "User agent", "Device"),

  // Traffic & identity
  dim("source", "Source", "Traffic"),
  dim("referrer", "Referrer", "Traffic"),
  dim("search_engine", "Search engine", "Traffic"),
  dim("keyword", "Keyword", "Traffic"),
  dim("destination", "Destination", "Traffic"),
  dim("ip", "IP", "Traffic"),
  dim("click_id", "Click ID", "Traffic"),
  dim("sub_id", "Sub ID (click id)", "Traffic"),
  dim("visitor_code", "Visitor code", "Traffic"),
  dim("external_id", "External ID", "Traffic"),
  dim("ad_campaign_id", "Ad campaign ID", "Traffic"),
  dim("creative_id", "Creative ID", "Traffic"),

  ...SUB_ID_DIMENSIONS,

  // Flags
  dim("is_unique_campaign", "Unique (campaign)", "Flags", "bool"),
  dim("is_unique_stream", "Unique (stream)", "Flags", "bool"),
  dim("is_bot", "Bot", "Flags", "bool"),
  dim("is_using_proxy", "Proxy", "Flags", "bool"),
];

// ── Keitaro measures (report/build `metrics`) ────────────────────────
const measure = (key, label, group, format = "int", aliases = []) =>
  ({ key, label, group, type: "number", format, aliases });

export const KEITARO_MEASURES = [
  // Volume
  measure("clicks", "Clicks", "Volume"),
  measure("campaign_unique_clicks", "Unique clicks (campaign)", "Volume", "int", ["uniques", "unique", "uc"]),
  measure("stream_unique_clicks", "Unique clicks (stream)", "Volume"),
  measure("global_unique_clicks", "Unique clicks (global)", "Volume"),
  measure("uc_campaign_rate", "Unique rate (campaign)", "Volume", "percent"),
  measure("uc_stream_rate", "Unique rate (stream)", "Volume", "percent"),
  measure("uc_global_rate", "Unique rate (global)", "Volume", "percent"),
  measure("lp_clicks", "Landing clicks", "Volume"),
  measure("lp_ctr", "Landing CTR", "Volume", "percent"),

  // Funnel — custom conversions are THIS tracker's mapping.
  measure("regs", "Registrations", "Funnel", "int", ["regs", "registers", "signups", "reg"]),
  measure("custom_conversion_8", "FTD", "Funnel", "int", ["ftd", "deposit", "deposits", "dep", "first deposit"]),
  measure("custom_conversion_7", "Redeposit", "Funnel", "int", ["redeposit", "redep", "rdp"]),
  measure("custom_conversion_9", "Custom conversion 9", "Funnel"),
  measure("custom_conversion_10", "Custom conversion 10", "Funnel"),
  measure("conversions", "Conversions", "Funnel"),
  measure("leads", "Leads", "Funnel"),
  measure("sales", "Sales", "Funnel"),
  measure("rejected", "Rejected", "Funnel"),
  measure("approve", "Approve", "Funnel", "percent"),

  // Money
  measure("revenue", "Revenue", "Money", "money"),
  measure("cost", "Cost", "Money", "money", ["spend", "cost"]),
  measure("profit", "Profit", "Money", "money"),
  measure("profit_confirmed", "Profit (confirmed)", "Money", "money"),
  measure("custom_conversion_8_revenue", "FTD revenue", "Money", "money", ["ftd revenue", "deposit revenue"]),
  measure("custom_conversion_7_revenue", "Redeposit revenue", "Money", "money", ["redeposit revenue", "rdp revenue"]),
  measure("custom_conversion_9_revenue", "Custom conversion 9 revenue", "Money", "money"),
  measure("custom_conversion_10_revenue", "Custom conversion 10 revenue", "Money", "money"),
  measure("lead_revenue", "Lead revenue", "Money", "money"),
  measure("sale_revenue", "Sale revenue", "Money", "money"),
  measure("rejected_revenue", "Rejected revenue", "Money", "money"),

  // Efficiency
  measure("roi", "ROI", "Efficiency", "percent"),
  measure("roi_confirmed", "ROI (confirmed)", "Efficiency", "percent"),
  measure("cr", "CR", "Efficiency", "percent"),
  measure("crs", "CR (sales)", "Efficiency", "percent"),
  measure("crl", "CR (leads)", "Efficiency", "percent"),
  measure("epc", "EPC", "Efficiency", "money"),
  measure("epc_confirmed", "EPC (confirmed)", "Efficiency", "money"),
  measure("cpc", "CPC", "Efficiency", "money"),
  measure("ecpc", "eCPC", "Efficiency", "money"),
  measure("cpa", "CPA", "Efficiency", "money"),
  measure("cps", "CPS", "Efficiency", "money"),
  measure("ecpm", "eCPM", "Efficiency", "money"),
  measure("ecpm_confirmed", "eCPM (confirmed)", "Efficiency", "money"),
  measure("ec", "EC", "Efficiency", "money"),
  measure("ec_confirmed", "EC (confirmed)", "Efficiency", "money"),
  measure("profitability", "Profitability", "Efficiency", "percent"),

  // Traffic quality
  measure("bots", "Bots", "Quality"),
  measure("bot_share", "Bot share", "Quality", "percent"),
  measure("proxies", "Proxies", "Quality"),
  measure("empty_referrers", "Empty referrers", "Quality"),
];

// ── Derived measures (computed here, not by Keitaro) ─────────────────
// The funnel ratios and unit economics the Statistics view already shows.
// Keitaro returns none of these, so each declares the base measures it needs
// and a formula; the base measures are added to the tracker request whether
// or not the user chose to display them.
//
// These are RATIOS, so they must never be summed. The totals row recomputes
// every one of them from the summed bases — averaging per-row percentages
// would put a number in the totals row that is simply wrong (a day with 1
// click and 1 reg would count as much as a day with 100k clicks).
//
// Naming follows the rest of the dashboard: c2r / c2ftd / r2d already mean
// this in Statistics, so a buyer reads the same word for the same thing.
// Round to 4 decimals. Float division hands back 33.33333333333333, which
// lands in the CSV verbatim and reads as noise; 4 places keeps far more
// precision than any of these numbers is worth while staying readable.
const round4 = (value) => (value === null ? null : Math.round(value * 1e4) / 1e4);

const ratio = (numerator, denominator) => (row) => {
  const den = Number(row[denominator]);
  const num = Number(row[numerator]);
  if (!Number.isFinite(den) || den === 0) return null;
  if (!Number.isFinite(num)) return null;
  return round4((num / den) * 100);
};
const perUnit = (total, count) => (row) => {
  const n = Number(row[count]);
  const t = Number(row[total]);
  if (!Number.isFinite(n) || n === 0) return null;
  if (!Number.isFinite(t)) return null;
  return round4(t / n);
};

// `aliases` are the names the team actually says out loud. The labels here
// read as funnels ("Unique → Register"), but buyers search for "unique2reg",
// "reg2dep", "click2dep" — and a search that returns nothing reads as "this
// metric does not exist". Every alias is matched by the field picker.
const derived = (key, label, group, format, requires, compute, hint, aliases = []) => ({
  key, label, group, format, requires, compute, hint, aliases,
  type: "number", derived: true,
});

const FTD = "custom_conversion_8";
const REDEP = "custom_conversion_7";
const UNIQ = "campaign_unique_clicks";

export const DERIVED_MEASURES = [
  // Conversion rates off raw clicks
  derived("c2r", "Click → Register", "Funnel rates", "percent", ["clicks", "regs"],
    ratio("regs", "clicks"), "Registrations ÷ clicks", ["click2reg", "click2register", "c2r", "clicktoreg"]),
  derived("c2ftd", "Click → FTD", "Funnel rates", "percent", ["clicks", FTD],
    ratio(FTD, "clicks"), "FTDs ÷ clicks", ["click2dep", "click2ftd", "c2d", "c2ftd", "clicktodeposit"]),
  derived("c2rd", "Click → Redeposit", "Funnel rates", "percent", ["clicks", REDEP],
    ratio(REDEP, "clicks"), "Redeposits ÷ clicks", ["click2redep", "c2rd"]),

  // …and off UNIQUE clicks, which is the honest denominator when one visitor
  // reloads: raw clicks flatter the rate, uniques do not.
  derived("u2r", "Unique → Register", "Funnel rates", "percent", [UNIQ, "regs"],
    ratio("regs", UNIQ), "Registrations ÷ unique clicks", ["unique2reg", "unique2register", "uniq2reg", "u2r", "uniquetoreg"]),
  derived("u2ftd", "Unique → FTD", "Funnel rates", "percent", [UNIQ, FTD],
    ratio(FTD, UNIQ), "FTDs ÷ unique clicks", ["unique2dep", "unique2ftd", "uniq2dep", "u2d", "u2ftd", "uniquetodeposit"]),
  derived("u2rd", "Unique → Redeposit", "Funnel rates", "percent", [UNIQ, REDEP],
    ratio(REDEP, UNIQ), "Redeposits ÷ unique clicks", ["unique2redep", "u2rd"]),
  derived("uniq_rate", "Unique rate", "Funnel rates", "percent", ["clicks", UNIQ],
    ratio(UNIQ, "clicks"), "Unique clicks ÷ clicks", ["unique rate", "uniqueness", "uniq"]),

  // Step-to-step
  derived("r2d", "Register → FTD", "Funnel rates", "percent", ["regs", FTD],
    ratio(FTD, "regs"), "FTDs ÷ registrations", ["reg2dep", "reg2ftd", "r2d", "regtodeposit", "approval"]),
  derived("d2rd", "FTD → Redeposit", "Funnel rates", "percent", [FTD, REDEP],
    ratio(REDEP, FTD), "Redeposits ÷ FTDs", ["dep2redep", "ftd2redep", "d2rd"]),

  // Unit costs — what a step actually costs to buy
  derived("cpc_calc", "Cost per click", "Unit economics", "money", ["cost", "clicks"],
    perUnit("cost", "clicks"), "Cost ÷ clicks", ["cpc", "cost per click"]),
  derived("cpuc", "Cost per unique", "Unit economics", "money", ["cost", UNIQ],
    perUnit("cost", UNIQ), "Cost ÷ unique clicks", ["cpuc", "cost per unique"]),
  derived("cpr", "Cost per register", "Unit economics", "money", ["cost", "regs"],
    perUnit("cost", "regs"), "Cost ÷ registrations", ["cpr", "cost per reg", "cost per registration"]),
  derived("cpftd", "Cost per FTD", "Unit economics", "money", ["cost", FTD],
    perUnit("cost", FTD), "Cost ÷ FTDs", ["cpa", "cpd", "cpftd", "cost per deposit", "cost per acquisition"]),

  // Unit revenue
  derived("rpc", "Revenue per click", "Unit economics", "money", ["revenue", "clicks"],
    perUnit("revenue", "clicks"), "Revenue ÷ clicks", ["rpc", "revenue per click", "epc"]),
  derived("rpr", "Revenue per register", "Unit economics", "money", ["revenue", "regs"],
    perUnit("revenue", "regs"), "Revenue ÷ registrations", ["rpr", "revenue per reg"]),
  derived("arpu", "Revenue per FTD", "Unit economics", "money", ["revenue", FTD],
    perUnit("revenue", FTD), "Revenue ÷ FTDs", ["arpu", "revenue per depositor", "average revenue"]),

  // Bottom line, computed from OUR cost so it agrees with the columns above
  derived("net_profit", "Net profit", "Unit economics", "money", ["revenue", "cost"],
    (row) => round4(Number(row.revenue || 0) - Number(row.cost || 0)), "Revenue − cost", ["net", "profit", "netprofit"]),
  derived("roi_calc", "ROI", "Unit economics", "percent", ["revenue", "cost"],
    (row) => {
      const cost = Number(row.cost);
      if (!Number.isFinite(cost) || cost === 0) return null;
      return round4(((Number(row.revenue || 0) - cost) / cost) * 100);
    }, "(Revenue − cost) ÷ cost", ["roi", "return on investment"]),
  derived("margin", "Margin", "Unit economics", "percent", ["revenue", "cost"],
    (row) => {
      const revenue = Number(row.revenue);
      if (!Number.isFinite(revenue) || revenue === 0) return null;
      return round4(((revenue - Number(row.cost || 0)) / revenue) * 100);
    }, "(Revenue − cost) ÷ revenue", ["margin", "profit margin"]),
];

export const DERIVED_BY_KEY = new Map(DERIVED_MEASURES.map((m) => [m.key, m]));

// Everything the performance source offers as a metric.
export const PERFORMANCE_MEASURES = [...KEITARO_MEASURES, ...DERIVED_MEASURES];

// Add every computed column to a row set, in place of nothing — the base
// measures stay on the row (they may also be displayed) and the derived keys
// are added alongside.
export const applyDerived = (rows, derivedKeys) => {
  if (!derivedKeys.length) return rows;
  const defs = derivedKeys.map((key) => DERIVED_BY_KEY.get(key)).filter(Boolean);
  for (const row of rows) {
    for (const def of defs) row[def.key] = def.compute(row);
  }
  return rows;
};

// ── Raw log columns ──────────────────────────────────────────────────
// clicks/log returned all 50 of these; conversions/log all 30.
export const CLICKS_COLUMNS = [
  dim("datetime", "Time", "Event", "date"),
  dim("click_id", "Event ID", "Event"),
  dim("sub_id", "Click ID", "Event"),
  dim("external_id", "External ID", "Event"),
  dim("visitor_code", "Visitor code", "Event"),
  dim("campaign", "Campaign", "Campaign"),
  dim("campaign_id", "Campaign ID", "Campaign", "number"),
  dim("offer", "Offer", "Campaign"),
  dim("stream", "Stream", "Campaign"),
  dim("landing", "Landing", "Campaign"),
  dim("ts", "Traffic source", "Campaign"),
  dim("country", "Country", "Geo"),
  dim("country_code", "Country code", "Geo"),
  dim("region", "Region", "Geo"),
  dim("city", "City", "Geo"),
  dim("isp", "ISP", "Geo"),
  dim("operator", "Mobile operator", "Geo"),
  dim("connection_type", "Connection type", "Geo"),
  dim("language", "Language", "Geo"),
  dim("os", "OS", "Device"),
  dim("os_version", "OS version", "Device"),
  dim("browser", "Browser", "Device"),
  dim("browser_version", "Browser version", "Device"),
  dim("device_type", "Device type", "Device"),
  dim("device_model", "Device model", "Device"),
  dim("user_agent", "User agent", "Device"),
  dim("ip", "IP", "Traffic"),
  dim("referrer", "Referrer", "Traffic"),
  dim("source", "Source", "Traffic"),
  dim("search_engine", "Search engine", "Traffic"),
  dim("keyword", "Keyword", "Traffic"),
  dim("destination", "Destination", "Traffic"),
  dim("is_bot", "Bot", "Flags", "bool"),
  dim("is_using_proxy", "Proxy", "Flags", "bool"),
  dim("is_unique_campaign", "Unique (campaign)", "Flags", "bool"),
  dim("is_unique_stream", "Unique (stream)", "Flags", "bool"),
  dim("is_lead", "Lead", "Flags", "bool"),
  dim("is_sale", "Sale", "Flags", "bool"),
  ...SUB_ID_DIMENSIONS,
];

export const CONVERSIONS_COLUMNS = [
  dim("postback_datetime", "Postback time", "Event", "date"),
  dim("click_datetime", "Click time", "Event", "date"),
  dim("sale_datetime", "Sale time", "Event", "date"),
  dim("sale_period", "Sale period", "Event"),
  dim("conversion_id", "Conversion ID", "Event"),
  dim("click_id", "Event ID", "Event"),
  dim("sub_id", "Click ID", "Event"),
  dim("external_id", "External ID", "Event"),
  dim("tid", "TID", "Event"),
  dim("status", "Status", "Event"),
  dim("previous_status", "Previous status", "Event"),
  dim("original_status", "Original status", "Event"),
  dim("params", "Params", "Event"),
  dim("campaign", "Campaign", "Campaign"),
  dim("campaign_id", "Campaign ID", "Campaign", "number"),
  dim("offer", "Offer", "Campaign"),
  dim("stream", "Stream", "Campaign"),
  dim("landing", "Landing", "Campaign"),
  dim("ts", "Traffic source", "Campaign"),
  dim("revenue", "Revenue", "Money", "number"),
  dim("cost", "Cost", "Money", "number"),
  dim("country", "Country", "Geo"),
  dim("country_code", "Country code", "Geo"),
  dim("city", "City", "Geo"),
  dim("os", "OS", "Device"),
  dim("browser", "Browser", "Device"),
  dim("device_type", "Device type", "Device"),
  ...SUB_ID_DIMENSIONS.slice(0, 11),
];

// ── Sources ──────────────────────────────────────────────────────────
// `aggregated` sources cross dimensions with measures; `log` sources pick a
// flat column list. `scopeField` is the column carrying the campaign name —
// buyer scoping needs it, so the server force-adds it when a buyer omits it.
export const REPORT_SOURCES = {
  performance: {
    id: "performance",
    label: "Performance",
    kind: "aggregated",
    path: "/report/build",
    dimensions: KEITARO_DIMENSIONS,
    measures: PERFORMANCE_MEASURES,
    scopeField: "campaign",
    defaults: {
      dimensions: ["day", "campaign"],
      measures: ["clicks", "campaign_unique_clicks", "regs", "custom_conversion_8", "u2r", "u2ftd", "revenue", "cost"],
    },
  },
  clicks: {
    id: "clicks",
    label: "Clicks",
    kind: "log",
    path: "/clicks/log",
    columns: CLICKS_COLUMNS,
    scopeField: "campaign",
    defaults: {
      columns: ["datetime", "campaign", "country", "os", "browser", "sub_id", "sub_id_1", "is_bot"],
    },
  },
  conversions: {
    id: "conversions",
    label: "Conversions",
    kind: "log",
    path: "/conversions/log",
    columns: CONVERSIONS_COLUMNS,
    scopeField: "campaign",
    defaults: {
      columns: ["postback_datetime", "campaign", "status", "revenue", "country", "sub_id", "sub_id_1"],
    },
  },
};

// ── Dashboard's own data (Postgres) ──────────────────────────────────
// The fourth source: the tables this dashboard owns, rather than the
// tracker's. Every entity declares an explicit column whitelist — there is no
// `SELECT *` anywhere in this path, so a column can only be read if it is
// named here.
//
// Secrets are excluded STRUCTURALLY, not by filtering later:
// `pixels.token_eaag` (a Meta access token) and the whole
// `meta_token_integrations` table are simply absent from the catalog, so no
// request can name them and no export can contain them. Do not add them.
const col = (key, label, group, type = "string") => ({ key, label, group, type });

export const DASHBOARD_ENTITIES = {
  expenses: {
    table: "expenses",
    label: "Expenses",
    leadershipOnly: true, // finance data — not a buyer's to read
    columns: [
      col("date", "Date", "Expense", "date"),
      col("country", "Country", "Expense"),
      col("category", "Category", "Expense"),
      col("reference", "Reference", "Expense"),
      col("billing_type", "Billing type", "Expense"),
      col("crypto_network", "Crypto network", "Expense"),
      col("crypto_hash", "Crypto hash", "Expense"),
      col("amount", "Amount", "Expense", "number"),
      col("status", "Status", "Expense"),
      col("created_at", "Created", "Expense", "date"),
    ],
  },
  domains: {
    table: "domains",
    label: "Domains",
    ownerColumn: "owner_id",
    columns: [
      col("domain", "Domain", "Domain"),
      col("status", "Status", "Domain"),
      col("game", "Game", "Domain"),
      col("platform", "Platform", "Domain"),
      col("country", "Country", "Domain"),
      col("owner_role", "Owner role", "Domain"),
      col("created_at", "Created", "Domain", "date"),
    ],
  },
  tracking_links: {
    table: "tracking_links",
    label: "Tracking links",
    ownerColumn: "owner_id",
    buyerColumn: "buyer",
    columns: [
      col("name", "Name", "Link"),
      col("buyer", "Buyer", "Link"),
      col("tool", "Tool", "Link"),
      col("game", "Game", "Link"),
      col("geo", "Geo", "Link"),
      col("brand", "Brand", "Link"),
      col("domain", "Domain", "Link"),
      col("alias", "Alias", "Link"),
      col("url", "URL", "Link"),
      col("keitaro_id", "Keitaro ID", "Link"),
      col("keitaro_status", "Keitaro status", "Link"),
      col("keitaro_error", "Keitaro error", "Link"),
      col("created_at", "Created", "Link", "date"),
    ],
  },
  pixels: {
    table: "pixels",
    label: "Pixels",
    ownerColumn: "owner_id",
    // token_eaag deliberately absent — it is a live Meta access token.
    columns: [
      col("pixel_id", "Pixel ID", "Pixel"),
      col("flows", "Flows", "Pixel"),
      col("geo", "Geo", "Pixel"),
      col("status", "Status", "Pixel"),
      col("comment", "Comment", "Pixel"),
      col("owner_role", "Owner role", "Pixel"),
      col("created_at", "Created", "Pixel", "date"),
    ],
  },
  accounts: {
    table: "accounts_registry",
    label: "Ad accounts",
    ownerColumn: "owner_id",
    // Credential columns (account_uid, backup_email, *_enc) are deliberately
    // absent: the catalog is a whitelist, so no report can name them and no
    // export can carry them. Same treatment as pixels.token_eaag. Do not add.
    columns: [
      col("account_number", "Account number", "Account"),
      col("status", "Status", "Account"),
      col("countries", "Countries", "Account"),
      col("notes", "Notes", "Account"),
      col("owner_role", "Owner role", "Account"),
      col("created_at", "Created", "Account", "date"),
      col("updated_at", "Updated", "Account", "date"),
    ],
  },
  campaigns: {
    table: "campaigns",
    label: "Campaigns",
    buyerColumn: "buyer",
    columns: [
      col("name", "Name", "Campaign"),
      col("buyer", "Buyer", "Campaign"),
      col("country", "Country", "Campaign"),
      col("domain", "Domain", "Campaign"),
      col("keitaro_id", "Keitaro ID", "Campaign"),
      col("created_at", "Created", "Campaign", "date"),
    ],
  },
  brands: {
    table: "brands",
    label: "Brands",
    columns: [
      col("name", "Name", "Brand"),
      col("contact", "Contact", "Brand"),
      col("status", "Status", "Brand"),
      col("notes", "Notes", "Brand"),
      col("created_at", "Created", "Brand", "date"),
    ],
  },
  audit_logs: {
    table: "audit_logs",
    label: "Audit log",
    leadershipOnly: true,
    columns: [
      col("created_at", "Time", "Log", "date"),
      col("actor_name", "Actor", "Log"),
      col("actor_role", "Actor role", "Log"),
      col("method", "Method", "Log"),
      col("path", "Path", "Log"),
      col("action", "Action", "Log"),
      col("entity_type", "Entity type", "Log"),
      col("entity_id", "Entity ID", "Log"),
      col("status", "Status", "Log", "number"),
      col("duration_ms", "Duration (ms)", "Log", "number"),
      col("ip", "IP", "Log"),
    ],
  },
};

REPORT_SOURCES.dashboard = {
  id: "dashboard",
  label: "Dashboard data",
  kind: "table",
  entities: DASHBOARD_ENTITIES,
  defaults: { entity: "tracking_links", columns: ["name", "buyer", "geo", "brand", "domain", "keitaro_status", "created_at"] },
};

// Field lookup for one source, keyed for O(1) validation.
export const fieldMapFor = (source, entity = null) => {
  const def = REPORT_SOURCES[source];
  if (!def) return null;
  if (def.kind === "table") {
    const entityDef = def.entities[entity];
    return entityDef ? new Map(entityDef.columns.map((f) => [f.key, f])) : null;
  }
  const all = def.kind === "aggregated" ? [...def.dimensions, ...def.measures] : def.columns;
  return new Map(all.map((f) => [f.key, f]));
};

// Filter grammar → parameterized SQL. Column names come only from the
// whitelist above (validated before this runs), never from request text, so
// identifiers cannot be injected; values are always bound parameters.
const SQL_COMPARISON = {
  EQUALS: "=", NOT_EQUAL: "<>",
  GREATER_THAN: ">", LESS_THAN: "<",
  EQUALS_OR_GREATER_THAN: ">=", EQUALS_OR_LESS_THAN: "<=",
};

export const filtersToSql = (filters, startIndex = 1) => {
  const clauses = [];
  const params = [];
  let index = startIndex;
  const bind = (value) => {
    params.push(value);
    return `$${index++}`;
  };
  for (const filter of filters) {
    const name = `"${filter.name}"`; // already whitelist-validated
    const op = filter.operator;
    const value = filter.expression;
    if (SQL_COMPARISON[op]) {
      clauses.push(`${name} ${SQL_COMPARISON[op]} ${bind(value)}`);
    } else if (op === "CONTAINS") {
      clauses.push(`${name}::text ILIKE ${bind(`%${value}%`)}`);
    } else if (op === "NOT_CONTAIN") {
      clauses.push(`(${name} IS NULL OR ${name}::text NOT ILIKE ${bind(`%${value}%`)})`);
    } else if (op === "BEGINS_WITH") {
      clauses.push(`${name}::text ILIKE ${bind(`${value}%`)}`);
    } else if (op === "ENDS_WITH") {
      clauses.push(`${name}::text ILIKE ${bind(`%${value}`)}`);
    } else if (op === "IN_LIST") {
      clauses.push(`${name}::text = ANY(${bind(value.map(String))})`);
    } else if (op === "NOT_IN_LIST") {
      clauses.push(`(${name} IS NULL OR NOT (${name}::text = ANY(${bind(value.map(String))})))`);
    } else if (op === "MATCH_REGEXP") {
      clauses.push(`${name}::text ~* ${bind(String(value))}`);
    } else if (op === "NOT_MATCH_REGEXP") {
      clauses.push(`(${name} IS NULL OR ${name}::text !~* ${bind(String(value))})`);
    } else if (op === "BETWEEN") {
      clauses.push(`${name} BETWEEN ${bind(value[0])} AND ${bind(value[1])}`);
    } else if (op === "IS_SET") {
      clauses.push(`(${name} IS NOT NULL AND ${name}::text <> '')`);
    } else if (op === "IS_NOT_SET") {
      clauses.push(`(${name} IS NULL OR ${name}::text = '')`);
    } else if (op === "IS_TRUE") {
      clauses.push(`${name} = TRUE`);
    } else if (op === "IS_FALSE") {
      clauses.push(`${name} = FALSE`);
    }
  }
  return { clauses, params, nextIndex: index };
};

// ── Buyer scoping ────────────────────────────────────────────────────
export const escapeRegExp = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// THE permission boundary for Reports.
//
// Scoping runs INSIDE Keitaro as a filter on the campaign name, which is what
// lets a buyer group by `country` alone and still only see their own traffic —
// verified against the live tracker.
//
// The `(?i)` prefix is load-bearing and must never be dropped: this tracker's
// MATCH_REGEXP is CASE-SENSITIVE, and buyerShortForms() hands back lowercased
// forms ("leo", "leomarketing") while campaigns read "Leo | PWA | …". Probed:
// `Daniel` → 3 rows, `daniel` → 0 rows, `(?i)daniel` → 3 rows. Without the
// flag every buyer sees an empty report — fail-closed, so nothing leaks, but
// the feature is silently dead.
export const buildScopeFilter = (shortForms, field = "campaign") => {
  const forms = (Array.isArray(shortForms) ? shortForms : [])
    .map((f) => String(f || "").trim().toLowerCase())
    .filter(Boolean)
    .map(escapeRegExp);
  if (!forms.length) return null;
  return {
    name: field,
    operator: "MATCH_REGEXP",
    expression: `(?i)(^|[^a-z0-9])(${forms.join("|")})([^a-z0-9]|$)`,
  };
};

// ── Request validation ───────────────────────────────────────────────
const asArray = (value) => (Array.isArray(value) ? value : []);
const uniq = (list) => [...new Set(list)];

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const isIsoDay = (v) => ISO_DAY.test(String(v || ""));

export const MAX_PREVIEW_ROWS = 500;
export const MAX_EXPORT_ROWS = 200000;
// How many rows to pull when the sort is on a derived column. Sorting only
// the first page would rank a window rather than the report, so we scan wide,
// compute, sort, then cut. A 4-dimension pull of this size runs in well under
// a second on this tracker.
export const DERIVED_SORT_SCAN = 50000;

// Sort rows by a derived (or any) column, nulls last — a row with no clicks
// has no conversion rate, and "no rate" is not "worst rate".
export const sortRows = (rows, sort) => {
  if (!sort.length) return rows;
  const { name, order } = sort[0];
  const direction = order === "ASC" ? 1 : -1;
  return rows.sort((a, b) => {
    const av = a[name];
    const bv = b[name];
    const aNull = av === null || av === undefined || av === "";
    const bNull = bv === null || bv === undefined || bv === "";
    if (aNull && bNull) return 0;
    if (aNull) return 1;
    if (bNull) return -1;
    const an = Number(av);
    const bn = Number(bv);
    if (Number.isFinite(an) && Number.isFinite(bn)) return (an - bn) * direction;
    return String(av).localeCompare(String(bv)) * direction;
  });
};

const fail = (error) => ({ ok: false, error });

// Validate one filter against the catalog. Unknown field or an operator the
// field's type doesn't allow is a 400, never a silently ignored clause — a
// dropped filter would hand back MORE data than the buyer asked to see.
const normalizeFilter = (raw, fields) => {
  const name = String(raw?.field ?? raw?.name ?? "").trim();
  if (!name) return fail("A filter is missing its field.");
  const field = fields.get(name);
  if (!field) return fail(`Unknown filter field: ${name}`);
  const operator = String(raw?.operator || "").trim().toUpperCase();
  const allowed = OPERATORS_BY_TYPE[field.type] || OPERATORS_BY_TYPE.string;
  if (!allowed.includes(operator)) {
    return fail(`Operator ${operator || "(none)"} is not valid for ${field.label}.`);
  }

  if (NO_VALUE_OPERATORS.has(operator)) return { ok: true, filter: { name, operator } };

  const value = raw?.value ?? raw?.expression;
  if (LIST_OPERATORS.has(operator)) {
    const list = (Array.isArray(value) ? value : String(value ?? "").split(","))
      .map((v) => String(v).trim())
      .filter(Boolean);
    if (!list.length) return fail(`${field.label} needs at least one value.`);
    return { ok: true, filter: { name, operator, expression: list } };
  }
  if (PAIR_OPERATORS.has(operator)) {
    const pair = Array.isArray(value) ? value : String(value ?? "").split(",");
    if (pair.length !== 2) return fail(`${field.label} needs a min and a max.`);
    const nums = pair.map((v) => Number(v));
    if (field.type === "number" && nums.some((n) => !Number.isFinite(n))) {
      return fail(`${field.label} range must be numeric.`);
    }
    return {
      ok: true,
      filter: { name, operator, expression: field.type === "number" ? nums : pair.map((v) => String(v).trim()) },
    };
  }
  if (value === undefined || value === null || String(value).trim() === "") {
    return fail(`${field.label} needs a value.`);
  }
  if (field.type === "number") {
    const num = Number(value);
    if (!Number.isFinite(num)) return fail(`${field.label} must be a number.`);
    return { ok: true, filter: { name, operator, expression: num } };
  }
  return { ok: true, filter: { name, operator, expression: String(value) } };
};

// Normalize + validate a whole report request. Returns the exact shape the
// Keitaro call needs, plus which columns the response should carry.
export const normalizeReportRequest = (body, { forExport = false } = {}) => {
  const source = String(body?.source || "performance");
  const def = REPORT_SOURCES[source];
  if (!def) return fail(`Unknown report source: ${source}`);

  // Dashboard-data reports pick an entity (one of our own tables) first.
  const entity = def.kind === "table" ? String(body?.entity || def.defaults.entity) : null;
  if (def.kind === "table" && !def.entities[entity]) {
    return fail(`Unknown data set: ${entity}`);
  }
  const fields = fieldMapFor(source, entity);

  // Range. Our own tables are not all time-series (brands, domains…), so a
  // range is optional there and only applied when the entity has a date
  // column the client asked to bound by.
  const range = body?.range || {};
  const timezone = String(range.timezone || "Asia/Dubai");
  const from = String(range.from || "");
  const to = String(range.to || "");
  if (def.kind !== "table") {
    if (!isIsoDay(from) || !isIsoDay(to)) return fail("Pick a valid date range.");
    if (from > to) return fail("The range starts after it ends.");
  } else if ((from || to) && (!isIsoDay(from) || !isIsoDay(to) || from > to)) {
    return fail("Pick a valid date range.");
  }

  // Columns
  let dimensions = [];
  let measures = [];
  let columns = [];
  let derivedKeys = [];
  let keitaroMeasures = [];
  if (def.kind === "aggregated") {
    dimensions = uniq(asArray(body?.dimensions).map(String)).filter((k) => fields.has(k));
    measures = uniq(asArray(body?.measures).map(String)).filter((k) => fields.has(k));
    const badDim = asArray(body?.dimensions).find((k) => !fields.has(String(k)));
    if (badDim) return fail(`Unknown field: ${badDim}`);
    const badMeasure = asArray(body?.measures).find((k) => !fields.has(String(k)));
    if (badMeasure) return fail(`Unknown field: ${badMeasure}`);
    // A measure in the grouping (or a dimension in the metrics) makes Keitaro
    // answer 200 with a nonsense column set — catch it here instead.
    const measureKeys = new Set(def.measures.map((m) => m.key));
    const strayDim = dimensions.find((k) => measureKeys.has(k));
    if (strayDim) return fail(`${strayDim} is a metric — it can't be grouped by.`);
    const dimKeys = new Set(def.dimensions.map((d) => d.key));
    const strayMeasure = measures.find((k) => dimKeys.has(k));
    if (strayMeasure) return fail(`${strayMeasure} is a grouping field — it can't be a metric.`);
    if (!dimensions.length) return fail("Pick at least one field to group by.");
    if (!measures.length) return fail("Pick at least one metric.");
    columns = [...dimensions, ...measures];

    // Split what Keitaro computes from what we compute. A derived metric's
    // base measures are requested even when the user did not pick them —
    // otherwise the formula has nothing to divide.
    derivedKeys = measures.filter((key) => DERIVED_BY_KEY.has(key));
    const baseSelected = measures.filter((key) => !DERIVED_BY_KEY.has(key));
    const needed = new Set(baseSelected);
    for (const key of derivedKeys) {
      for (const requirement of DERIVED_BY_KEY.get(key).requires) needed.add(requirement);
    }
    keitaroMeasures = [...needed];
  } else {
    columns = uniq(asArray(body?.columns).map(String));
    const bad = columns.find((k) => !fields.has(k));
    if (bad) return fail(`Unknown column: ${bad}`);
    if (!columns.length) return fail("Pick at least one column.");
  }

  // Filters
  const filters = [];
  for (const raw of asArray(body?.filters)) {
    const result = normalizeFilter(raw, fields);
    if (!result.ok) return result;
    filters.push(result.filter);
  }

  // Sort
  const sort = [];
  for (const raw of asArray(body?.sort)) {
    const name = String(raw?.name || raw?.field || "").trim();
    if (!fields.has(name)) return fail(`Cannot sort by unknown field: ${name}`);
    const order = String(raw?.order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
    sort.push({ name, order });
  }

  const cap = forExport ? MAX_EXPORT_ROWS : MAX_PREVIEW_ROWS;
  const limitRaw = Number.parseInt(String(body?.limit ?? ""), 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), cap) : cap;
  const offsetRaw = Number.parseInt(String(body?.offset ?? ""), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;

  return {
    ok: true,
    request: {
      source, kind: def.kind, path: def.path, scopeField: def.scopeField,
      entity,
      range: { from, to, timezone },
      dimensions, measures, columns, filters, sort, limit, offset,
      derivedKeys, keitaroMeasures,
      // Keitaro cannot sort by a column it never computed, so a sort on a
      // derived metric has to happen here — which means fetching a wider
      // slice first and cutting it after. Flagged so the caller knows.
      derivedSort: sort.some((s) => DERIVED_BY_KEY.has(s.name)),
    },
  };
};

// Build the SELECT for a dashboard-data report. `scope` is the caller's
// already-resolved permission context; the WHERE it contributes is the same
// owner/buyer boundary the entity's own view uses.
export const buildDashboardQuery = (request, { viewerId = null, buyerForms = [] } = {}) => {
  const def = REPORT_SOURCES.dashboard.entities[request.entity];
  const selected = request.columns.map((key) => `"${key}"`).join(", ");
  const where = [];
  const params = [];
  let index = 1;

  const { clauses, params: filterParams, nextIndex } = filtersToSql(request.filters, index);
  where.push(...clauses);
  params.push(...filterParams);
  index = nextIndex;

  // Optional date bound, only when the entity has a timestamp to bound by.
  const dateColumn = def.columns.find((c) => c.type === "date")?.key || null;
  if (dateColumn && request.range.from && request.range.to) {
    where.push(`"${dateColumn}"::date BETWEEN $${index++} AND $${index++}`);
    params.push(request.range.from, request.range.to);
  }

  // Buyer scoping: own rows by owner_id, or rows whose buyer column is one of
  // the viewer's identity forms. An entity with neither is either global
  // reference data (brands) or leadership-only.
  if (viewerId !== null) {
    const ownership = [];
    if (def.ownerColumn) {
      ownership.push(`"${def.ownerColumn}" = $${index++}`);
      params.push(viewerId);
    }
    if (def.buyerColumn && buyerForms.length) {
      ownership.push(
        `REGEXP_REPLACE(LOWER(COALESCE("${def.buyerColumn}", '')), '[^a-z0-9]+', '', 'g') = ANY($${index++})`
      );
      params.push(buyerForms.map((f) => String(f).toLowerCase().replace(/[^a-z0-9]/g, "")));
    }
    // Nothing to scope by means we cannot prove ownership — return no rows
    // rather than everything.
    where.push(ownership.length ? `(${ownership.join(" OR ")})` : "FALSE");
  }

  const orderBy = request.sort.length
    ? `ORDER BY ${request.sort.map((s) => `"${s.name}" ${s.order}`).join(", ")}`
    : dateColumn
      ? `ORDER BY "${dateColumn}" DESC`
      : "";

  const sql = `SELECT ${selected} FROM ${def.table}
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ${orderBy}
    LIMIT $${index++} OFFSET $${index++}`;
  params.push(request.limit, request.offset);

  const countSql = `SELECT COUNT(*)::int AS total FROM ${def.table}
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`;
  // The count reuses every param except the trailing LIMIT/OFFSET pair.
  return { sql, params, countSql, countParams: params.slice(0, params.length - 2) };
};

// Build the Keitaro body. `grouping`/`metrics` is the naming this project's
// live calls already use; the spec's `dimensions`/`measures` also works here
// (both probed 200) — staying on grouping/metrics keeps one convention.
export const toKeitaroPayload = (request, scopeFilter) => {
  const filters = scopeFilter ? [...request.filters, scopeFilter] : request.filters;
  if (request.kind === "aggregated") {
    return {
      range: request.range,
      grouping: request.dimensions,
      // Only what Keitaro can actually compute — sending a derived key would
      // be silently dropped and the column would come back blank.
      metrics: request.keitaroMeasures,
      filters,
      // A sort Keitaro cannot do is applied after the derived columns exist.
      sort: request.derivedSort ? [] : request.sort,
      limit: request.derivedSort ? DERIVED_SORT_SCAN : request.limit,
      offset: request.derivedSort ? 0 : request.offset,
      summary: true,
    };
  }
  return {
    range: request.range,
    columns: request.columns,
    filters,
    sort: request.sort,
    limit: request.limit,
    offset: request.offset,
  };
};

// ── Export helpers ───────────────────────────────────────────────────
// CSV cell escaping incl. spreadsheet-formula neutralisation — same rule as
// the client's csvCell(). Report rows carry sub_id/external_id values that
// arrive from public postbacks, so they are attacker-controllable: a value
// starting with = + - @ executes as a formula when the file opens in
// Excel/Sheets. Prefix with ' to keep it inert.
// One deliberate difference from the client's csvCell: a value that is a
// plain number is left alone. Excel parses "-100" as the number -100, not a
// formula, so prefixing it turned every negative ROI, profit and delta into
// TEXT — unsummable, unsortable, and wrong in exactly the columns a report is
// built to answer. Only genuinely formula-shaped values ("-1+1", "@SUM",
// "=cmd|…") get the quote.
const PLAIN_NUMBER = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;

export const csvCell = (value) => {
  const s = String(value ?? "").replace(/"/g, '""');
  if (PLAIN_NUMBER.test(s)) return `"${s}"`;
  return /^[=+\-@\t\r]/.test(s) ? `"'${s}"` : `"${s}"`;
};

export const EXPORT_FORMATS = new Set(["csv", "xlsx", "json", "pdf"]);

// Row rendering shared by the real export and the "what will I get" preview.
// They MUST go through the same functions — a preview that renders separately
// is a preview that eventually lies about the file.
export const csvHeaderLine = (columns) => columns.map((c) => csvCell(c.label)).join(",");
export const csvRowLine = (columns, row) =>
  columns.map((c) => csvCell(row[c.key] ?? "")).join(",");

// What a value looks like once it lands in the file, per format. CSV and JSON
// carry raw values; xlsx carries typed cells; PDF carries text.
export const previewCell = (value, column, format) => {
  if (value === null || value === undefined || value === "") return format === "json" ? null : "";
  if (format === "xlsx") return exportValue(value, column);
  return String(value);
};

// Honest, format-specific caveats shown next to the preview.
export const exportNotes = (format, totalRows) => {
  const notes = [];
  if (format === "pdf" && totalRows > MAX_PDF_ROWS) {
    notes.push(`PDF is capped at ${MAX_PDF_ROWS.toLocaleString()} rows — export CSV or Excel for all ${totalRows.toLocaleString()}.`);
  }
  if (totalRows > MAX_EXPORT_ROWS) {
    notes.push(`Only the first ${MAX_EXPORT_ROWS.toLocaleString()} of ${totalRows.toLocaleString()} rows can be exported at once. Narrow the range or add a filter.`);
  }
  if (format === "csv") {
    notes.push("Values starting with = + - @ are prefixed with an apostrophe so spreadsheets do not run them as formulas. Plain numbers are left as numbers.");
  }
  if (format === "xlsx") {
    notes.push("Numbers, money and percentages arrive as real Excel numbers, not text. The header row is frozen.");
  }
  if (format === "pdf") {
    notes.push("Landscape A4. Wide reports are readable but many columns get tight — use Excel for anything you need to sort.");
  }
  return notes;
};

// Rough file size from a measured sample. Deliberately approximate — it
// exists so nobody starts a 40MB download by accident, not for accounting.
export const estimateExportBytes = ({ format, columns, sampleRows, totalRows }) => {
  if (!sampleRows.length) return 0;
  const rowsInFile = format === "pdf" ? Math.min(totalRows, MAX_PDF_ROWS) : Math.min(totalRows, MAX_EXPORT_ROWS);
  const sampleBytes = sampleRows.reduce((sum, row) => sum + csvRowLine(columns, row).length + 1, 0);
  const perRow = sampleBytes / sampleRows.length;
  if (format === "csv") return Math.round(perRow * rowsInFile);
  // xlsx is zipped XML — denser than CSV in practice; json carries keys on
  // every row; pdf carries layout. Multipliers measured on real exports.
  if (format === "xlsx") return Math.round(perRow * rowsInFile * 0.55);
  if (format === "json") return Math.round(perRow * rowsInFile * 1.9);
  return Math.round(perRow * rowsInFile * 0.7);
};

// A PDF is a document, not a data dump — 200k rows would be an unopenable
// file and minutes of render. Cap it and tell the user rather than pretend.
export const MAX_PDF_ROWS = 5000;

// Typed value for xlsx cells so numbers sort and sum as numbers in Excel
// instead of arriving as text.
export const exportValue = (raw, column) => {
  if (raw === null || raw === undefined) return null;
  if (column?.type === "number") {
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  }
  return String(raw);
};

export const exportFilename = (source, range, ext) => {
  const window = range?.from && range?.to ? `-${range.from}_to_${range.to}` : "";
  return `${source}${window}.${ext}`.replace(/[^a-zA-Z0-9._-]/g, "-");
};

// Column metadata for the response, so the client renders labels/formats
// without shipping the whole catalog on every run.
export const describeColumns = (request) => {
  const fields = fieldMapFor(request.source, request.entity);
  const keys = request.kind === "aggregated"
    ? [...request.dimensions, ...request.measures]
    : request.columns;
  return keys.map((key) => {
    const field = fields.get(key) || { key, label: key, group: "Other", type: "string" };
    return {
      key,
      label: field.label,
      group: field.group,
      type: field.type,
      format: field.format || (field.type === "number" ? "int" : "text"),
      role: request.kind === "aggregated" && request.measures.includes(key) ? "measure" : "dimension",
      // Shown as a tooltip so a buyer can see what "Unique → FTD" divides by
      // without having to ask anyone.
      ...(field.hint ? { hint: field.hint } : {}),
      ...(field.derived ? { derived: true } : {}),
    };
  });
};
