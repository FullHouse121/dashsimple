// The house campaign-naming convention, in one place.
//
// "Buyer | Tool | Game | Geo | Brand" — e.g.
// "Karen | ZMAPPS | Ice Fishing | BR | JASINO".
//
// This lived in server/lib/campaign-import.js, which the browser cannot import.
// The Flow picker in the filters modal needs the same reading of a name to
// scope flows to the selected country, and a second copy of these rules on the
// client is exactly how the chart colours drifted before someone had to go and
// reconcile them (see src/lib/metricColors.js). One parser, imported by both.

import { REGIONS, regionForCountry } from "./regions.js";

export const CAMPAIGN_SEGMENT_COUNT = 5;

// A campaign that does not follow the house convention has no buyer segment to
// attribute it by, so it is not importable — better to leave it out than to
// guess an owner.
export const parseCampaignName = (name) => {
  const raw = String(name || "").trim();
  const segments = raw ? raw.split("|").map((s) => s.trim()) : [];
  const slot = (i) => {
    const v = segments[i] || "";
    return v === "-" ? "" : v;
  };
  return {
    raw,
    segments,
    isFormatted:
      segments.length === CAMPAIGN_SEGMENT_COUNT && segments.every((s) => s.length > 0),
    buyer: slot(0),
    tool: slot(1),
    game: slot(2),
    geo: slot(3),
    brand: slot(4),
  };
};

// The geo segment as a list of ISO-2 codes, lowercased.
//
// Almost every campaign carries a single code ("BR"), but the segment is free
// text a human typed, so it also turns up as "BR/MX", "BR-MX" or "BR, MX". Any
// token that is not two letters — "LATAM", "GLOBAL" — is not an ISO code and
// is dropped here rather than guessed at; campaignServesCountry below decides
// what their absence should mean.
export const campaignGeoCodes = (name) => {
  const { geo } = parseCampaignName(name);
  if (!geo) return [];
  return geo
    .split(/[^A-Za-z]+/)
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length === 2);
};

// A geo segment naming a region rather than a country, e.g. "LATAM".
//
// "EU" is deliberately not an alias: it is two letters, so campaignGeoCodes
// claims it as an ISO code before this is ever consulted. No live campaign
// uses it, and inventing a rule for a case that does not exist is how the
// exceptions start.
const REGION_BY_GEO_TOKEN = new Map(
  REGIONS.map((region) => [region.replace(/\s+/g, "").toLowerCase(), region])
);

// The whole-world tokens. These broaden without bound, by design.
const GLOBAL_GEO_TOKENS = new Set(["global", "ww", "worldwide", "all"]);

// Does this campaign run in this country, as far as its name can say?
//
// Most campaigns name one country and the answer is an exact code match. The
// rest are the broad-match campaigns — one campaign opened to run across
// several countries at once — and there are two kinds of those:
//
//   GLOBAL  runs everywhere, so it belongs in every country's list.
//   LATAM   runs across Latin America, so it belongs under Brazil and Mexico
//           but not under Germany.
//
// Region membership comes from shared/regions.js, the same table that decides
// which countries inherit a LATAM rate — so a country is in LATAM here exactly
// when it is priced as LATAM, and the two cannot drift apart.
//
// A token that is neither a country, a region, nor a global word is kept
// rather than dropped: it cannot be shown NOT to serve this country, and that
// is the safe direction to be wrong in. A flow offered that should not have
// been can be ignored; one wrongly hidden cannot be found at all.
export const campaignServesCountry = (name, { iso, country } = {}) => {
  const target = String(iso || "").trim().toLowerCase();
  if (!target && !country) return true;

  const codes = campaignGeoCodes(name);
  if (codes.length) return target ? codes.includes(target) : true;

  const { geo } = parseCampaignName(name);
  // Digits are kept: stripping non-letters turned "TIER1" into "tier" and it
  // stopped matching the region it names.
  const token = String(geo || "").replace(/[^A-Za-z0-9]+/g, "").toLowerCase();
  if (!token) return true;
  if (GLOBAL_GEO_TOKENS.has(token)) return true;

  const region = REGION_BY_GEO_TOKEN.get(token);
  if (region && country) return regionForCountry(country) === region;
  return true;
};
