// What a goal's FTDs are worth at market price.
//
// This runs on the server, not the client, and that is the whole point. A
// buyer is meant to see what their work is worth — "$4,450 of $5,000" — but
// not the rate card that produced it, because that sheet is every geo's price
// and their own margin. Valuing here means the rates never leave the server;
// only the money does.
//
// FTDs are valued per country, never at one blended rate chosen up front. A
// goal spanning Mexico and Brazil is 142 × $25 plus 36 × $35, not 178 × some
// average — the average is a *result* of the mix, and it moves when the mix
// moves. Reporting it the other way round would let a buyer's number drift
// without a single rate changing.
import { resolveCpa } from "../../shared/regions.js";

// FTDs in a country nobody has priced are worth an unknown amount, not zero.
// Counting them as zero would quietly shrink a buyer's number and read as
// underperformance, so they are returned separately for the UI to declare.
export const valueByCountry = (rows, rateByCountry, rateByRegion) => {
  let value = 0;
  let pricedFtds = 0;
  let unpricedFtds = 0;
  const unpriced = new Set();

  for (const row of rows || []) {
    const ftds = Number(row?.ftds) || 0;
    if (ftds <= 0) continue;
    const country = row?.country || "";
    const { cpa } = resolveCpa(country, rateByCountry, rateByRegion);
    if (cpa > 0) {
      value += ftds * cpa;
      pricedFtds += ftds;
    } else {
      unpricedFtds += ftds;
      unpriced.add(country || "Unknown");
    }
  }

  return {
    value: Math.round(value * 100) / 100,
    pricedFtds,
    unpricedFtds,
    unpricedCountries: [...unpriced].sort(),
    // The rate a buyer actually earned, across the mix they actually ran.
    // Zero priced FTDs means there is no such rate — not a rate of zero.
    blendedCpa: pricedFtds > 0 ? Math.round((value / pricedFtds) * 100) / 100 : null,
  };
};

// The target in money. A goal can carry its own revenue target; when it does
// not, the FTD target valued at the same blended rate is the honest stand-in,
// because it is the same promise expressed in the other unit.
export const targetValue = (goal, blendedCpa) => {
  const explicit = Number(goal?.revenue_target) || 0;
  if (explicit > 0) return { value: explicit, source: "revenue_target" };
  const ftdsTarget = Number(goal?.ftds_target) || 0;
  if (ftdsTarget > 0 && blendedCpa > 0) {
    return { value: Math.round(ftdsTarget * blendedCpa * 100) / 100, source: "ftds_target" };
  }
  return { value: 0, source: "none" };
};
