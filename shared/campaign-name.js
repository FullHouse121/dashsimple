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

// Does this campaign run in this country, as far as its name can say?
//
// An exact code match is a yes. The interesting case is the campaign whose geo
// segment names no country at all — 8 of the 312 live campaigns, "GLOBAL" on
// seven of them and "LATAM" on one. A GLOBAL campaign plainly does run in
// Brazil, so hiding it from a Brazil filter would be asserting something the
// name does not say. Absence of a country is a wildcard, not an exclusion, and
// the honest answer is to keep it in the list.
//
// The cost is that "LATAM" also survives a filter for Germany. That is the
// safe direction to be wrong in: a flow that should not have been offered can
// be ignored, while one that was wrongly hidden cannot be found at all.
export const campaignServesCountry = (name, iso) => {
  const target = String(iso || "").trim().toLowerCase();
  if (!target) return true;
  const codes = campaignGeoCodes(name);
  if (!codes.length) return true;
  return codes.includes(target);
};
