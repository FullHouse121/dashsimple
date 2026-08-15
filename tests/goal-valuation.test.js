// Goal valuation decides the money a buyer is shown for their own work, so
// the failure modes worth pinning are the quiet ones: a country nobody priced
// counting as zero, a blended rate reported as if it were a rate somebody
// chose, and a mixed-country goal averaged before it is valued instead of
// after.
import { describe, it, expect } from "vitest";
import { valueByCountry, targetValue } from "../server/lib/goal-valuation.js";

const RATES = new Map([
  ["Turkey", 40],
  ["Brazil", 35],
  ["Mexico", 25],
  ["Argentina", 25],
  ["Colombia", 25],
]);
const REGIONS = new Map([["LATAM", 25], ["MENA", 40]]);

describe("valueByCountry", () => {
  it("values each country at its own rate, not at an average", () => {
    const result = valueByCountry(
      [{ country: "Mexico", ftds: 142 }, { country: "Brazil", ftds: 36 }],
      RATES,
      REGIONS
    );
    expect(result.value).toBe(142 * 25 + 36 * 35);
    expect(result.pricedFtds).toBe(178);
  });

  it("reports the blended rate as the result of the mix, not an input", () => {
    const result = valueByCountry(
      [{ country: "Mexico", ftds: 142 }, { country: "Brazil", ftds: 36 }],
      RATES,
      REGIONS
    );
    // 4810 / 178 — a rate nobody set, which is exactly why it is derived.
    expect(result.blendedCpa).toBeCloseTo(27.02, 2);
    // Valuing at the blend first would have produced a different total.
    expect(result.value).not.toBe(178 * result.blendedCpa);
  });

  it("falls back to the region when a country has no explicit rate", () => {
    const result = valueByCountry([{ country: "Peru", ftds: 10 }], RATES, REGIONS);
    expect(result.value).toBe(250);
    expect(result.unpricedFtds).toBe(0);
  });

  it("does not count an unpriced country as worth zero", () => {
    const result = valueByCountry(
      [{ country: "Mexico", ftds: 100 }, { country: "Japan", ftds: 40 }],
      RATES,
      REGIONS
    );
    expect(result.value).toBe(2500);
    expect(result.pricedFtds).toBe(100);
    // The 40 are held out and named, so the UI can say so rather than let the
    // buyer read a short total as underperformance.
    expect(result.unpricedFtds).toBe(40);
    expect(result.unpricedCountries).toEqual(["Japan"]);
  });

  it("names a blank country rather than dropping it", () => {
    const result = valueByCountry([{ country: "", ftds: 7 }], RATES, REGIONS);
    expect(result.unpricedFtds).toBe(7);
    expect(result.unpricedCountries).toEqual(["Unknown"]);
  });

  it("has no blended rate when nothing was priced", () => {
    const result = valueByCountry([{ country: "Japan", ftds: 40 }], RATES, REGIONS);
    // null, not 0 — "we cannot say" is not "worth nothing".
    expect(result.blendedCpa).toBeNull();
    expect(result.value).toBe(0);
  });

  it("ignores rows with no FTDs and survives empty input", () => {
    expect(valueByCountry([], RATES, REGIONS).value).toBe(0);
    expect(valueByCountry(null, RATES, REGIONS).value).toBe(0);
    expect(valueByCountry([{ country: "Mexico", ftds: 0 }], RATES, REGIONS).pricedFtds).toBe(0);
  });

  it("treats a region rate as a default an explicit country rate overrides", () => {
    const result = valueByCountry(
      [{ country: "Mexico", ftds: 10 }, { country: "Bolivia", ftds: 10 }],
      new Map([["Mexico", 60]]),
      REGIONS
    );
    // Mexico takes its own 60; Bolivia takes LATAM's 25.
    expect(result.value).toBe(600 + 250);
  });
});

describe("targetValue", () => {
  it("prefers the revenue target leadership actually set", () => {
    expect(targetValue({ revenue_target: 5000, ftds_target: 200 }, 27)).toEqual({
      value: 5000,
      source: "revenue_target",
    });
  });

  it("values the FTD target at the same blended rate when there is no revenue target", () => {
    expect(targetValue({ ftds_target: 200 }, 25)).toEqual({
      value: 5000,
      source: "ftds_target",
    });
  });

  it("has no target when there is nothing to derive one from", () => {
    expect(targetValue({ ftds_target: 200 }, null).source).toBe("none");
    expect(targetValue({}, 25).source).toBe("none");
    // A zero revenue target is not a target — it must not read as "achieved".
    expect(targetValue({ revenue_target: 0, ftds_target: 0 }, 25).value).toBe(0);
  });
});
