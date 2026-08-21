// Adopting campaigns that were built directly in Keitaro.
//
// The dashboard has always been the author of a flow: you fill the My Flows
// form, it pushes a campaign to Keitaro, and the tracking_links row is the
// receipt. Campaigns that predate the dashboard — or that someone builds in
// Keitaro's own UI — have no receipt, so `GET /api/tracking-links` (which
// scopes a buyer to `owner_id = me`) shows them nothing, even though the
// campaign is theirs and its numbers already appear in Campaigns/Statistics
// (those read Keitaro live and scope by campaign NAME, not by owner_id).
//
// This module turns a Keitaro campaign into the tracking_links row the
// dashboard would have written if it had created it. Everything here is pure:
// the DB and the tracker are the caller's problem, so the mapping can be
// tested (tests/campaign-import.test.js) and proved against the rows the
// dashboard already wrote (scripts/verify-import-mapping.mjs).

import { normalizeBuyerName } from "./scoping.js";

// "Buyer | Tool | Game | Geo | Brand" now lives in shared/, because the Flow
// picker in the browser needs to read a geo out of a name too and cannot
// import from server/. Re-exported here so this module's public surface — and
// its tests — are unchanged by the move.
export { CAMPAIGN_SEGMENT_COUNT, parseCampaignName } from "../../shared/campaign-name.js";
import { parseCampaignName } from "../../shared/campaign-name.js";

// The buyer segment is the authority on ownership, not the Keitaro group.
// The two agree almost everywhere, and where they disagree the name is what
// every other scoping path in the dashboard already trusts (see
// keitaroNameMatchesBuyer) — attributing by group would put a campaign in
// My Flows for one person while Statistics showed it to another.
//
// The alias map is consulted BEFORE the exact username, and that order is the
// whole point: the tracker calls a buyer "Leo", the dashboard account is
// "Leomarketing", AND a different, unrelated user #2 is also called "Leo".
// Exact-first silently handed eleven of Leomarketing's campaigns to that other
// account. Alias-first matches how every existing row was actually written.
// When an alias points at nobody (karen → "KarenFarias", who has no account)
// the exact username still resolves it.
export const resolveOwner = (buyerSegment, users, aliases = new Map()) => {
  const wanted = normalizeBuyerName(buyerSegment);
  if (!wanted) return null;
  const byName = (value) => {
    const norm = normalizeBuyerName(value);
    return norm ? (users || []).find((u) => normalizeBuyerName(u.username) === norm) || null : null;
  };
  const aliasTarget = aliases instanceof Map ? aliases.get(wanted) : aliases?.[wanted];
  return byName(aliasTarget) || byName(buyerSegment);
};

// Rebuild the click URL's query string from the campaign's OWN parameter map
// rather than from the dashboard's per-tool defaults. The defaults describe
// what a new campaign should look like; an adopted campaign must show the
// buyer the link that actually works, macros and all — including where the
// tracker was configured off-standard.
//
// Order is external_id first, then sub_id_1..N numerically, which is the order
// Keitaro itself uses and the order every existing dashboard row was written
// in. Parameters with no placeholder (keyword, cost, currency, …) never carried
// a value and are dropped.
export const paramsFromKeitaroCampaign = (campaign) => {
  const parameters = campaign?.parameters || {};
  const parts = [];

  const external = parameters.external_id;
  const externalPlaceholder = String(external?.placeholder || "").trim();
  if (externalPlaceholder) parts.push(`external_id=${externalPlaceholder}`);

  const subKeys = Object.keys(parameters)
    .filter((k) => /^sub_id_\d+$/.test(k))
    .sort((a, b) => Number(a.slice(7)) - Number(b.slice(7)));

  for (const key of subKeys) {
    const p = parameters[key] || {};
    const placeholder = String(p.placeholder || "").trim();
    const name = String(p.name || "").trim();
    if (!placeholder || !name) continue;
    parts.push(`${name}=${placeholder}`);
  }

  return parts.join("&");
};

export const buildTrackingUrl = (domain, alias, params) => {
  const host = String(domain || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  const path = String(alias || "").trim().replace(/^\/+/, "");
  const qs = String(params || "").trim().replace(/^\?+/, "");
  if (!host || !path) return "";
  return `https://${host}/${path}${qs ? `?${qs}` : ""}`;
};

// One Keitaro campaign → the tracking_links row for it.
// `domainHost` maps Keitaro domain_id → hostname; `users` is the dashboard
// user list. Returns owner_id null when the buyer segment matches nobody —
// the caller decides whether that is a skip or an error.
export const keitaroCampaignToLinkRow = (
  campaign,
  { users = [], domainHost = new Map(), aliases = new Map() } = {}
) => {
  const parsed = parseCampaignName(campaign?.name);
  const owner = resolveOwner(parsed.buyer, users, aliases);
  const domain = domainHost.get(Number(campaign?.domain_id)) || "";
  const params = paramsFromKeitaroCampaign(campaign);
  const alias = String(campaign?.alias || "").trim();

  return {
    name: String(campaign?.name || "").trim(),
    buyer: owner ? owner.username : parsed.buyer,
    tool: parsed.tool || null,
    game: parsed.game || null,
    geo: parsed.geo || null,
    brand: parsed.brand || null,
    domain: domain || null,
    alias: alias || null,
    params: params || null,
    url: buildTrackingUrl(domain, alias, params) || null,
    filters: null,
    keitaro_id: String(campaign?.id ?? "").trim() || null,
    // The campaign demonstrably exists in Keitaro — that is exactly what
    // "created" means for a link the dashboard pushed itself.
    keitaro_status: "created",
    keitaro_error: null,
    owner_id: owner ? owner.id : null,
    offer_id: null,
    traffic_source_id:
      campaign?.traffic_source_id != null ? String(campaign.traffic_source_id) : null,
    kdomain_id: campaign?.domain_id != null ? String(campaign.domain_id) : null,
    keitaro_group_id: campaign?.group_id != null ? String(campaign.group_id) : null,
    state: String(campaign?.state || "active") === "active" ? "active" : "disabled",
  };
};

// Which campaigns are candidates for import, and why the rest are not.
// `existingKeitaroIds` is the set of keitaro_id values already in
// tracking_links (as strings). `brands` filters on the brand segment,
// case-insensitively; empty means every brand.
export const planCampaignImport = ({
  campaigns = [],
  existingKeitaroIds = new Set(),
  users = [],
  domainHost = new Map(),
  aliases = new Map(),
  brands = [],
  excludeGroupIds = [],
} = {}) => {
  const wantedBrands = new Set(
    (brands || []).map((b) => String(b || "").trim().toUpperCase()).filter(Boolean)
  );
  const excluded = new Set((excludeGroupIds || []).map(Number));

  const importable = [];
  const skipped = [];

  for (const campaign of campaigns) {
    const keitaroId = String(campaign?.id ?? "").trim();
    const parsed = parseCampaignName(campaign?.name);
    const brand = parsed.brand.toUpperCase();
    const note = (reason) =>
      skipped.push({ id: keitaroId, name: campaign?.name || "", reason, buyer: parsed.buyer, brand: parsed.brand });

    // Order matters for honesty, not just short-circuiting. An unparseable
    // name has no brand segment to read, so testing the brand filter first
    // would report "Leo | FB | SAFEST" as another brand's campaign — a claim
    // about data we just failed to parse. Judge parseability first and the
    // skip reason is always something we actually know.
    if (excluded.has(Number(campaign?.group_id))) {
      note("external_group");
      continue;
    }
    if (existingKeitaroIds.has(keitaroId)) {
      note("already_imported");
      continue;
    }
    if (!parsed.isFormatted) {
      note("unparseable_name");
      continue;
    }
    if (wantedBrands.size && !wantedBrands.has(brand)) {
      note("other_brand");
      continue;
    }

    const row = keitaroCampaignToLinkRow(campaign, { users, domainHost, aliases });
    if (!row.owner_id) {
      note("no_matching_user");
      continue;
    }
    if (!row.url) {
      // No alias or no resolvable domain means there is no link to hand over.
      note("no_link_url");
      continue;
    }
    importable.push(row);
  }

  return { importable, skipped };
};
