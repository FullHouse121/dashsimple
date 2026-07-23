// The client-side row filters decide what every performance view shows.
// matchesCampaignListFilter backs the global Flow filter — a regression here
// silently empties dashboards or leaks unfiltered rows into filtered views.
import { describe, it, expect } from "vitest";
import {
  matchesCampaignListFilter,
  matchesCountryFilter,
} from "../src/lib/filters.js";

describe("matchesCampaignListFilter", () => {
  it("matches everything when no flows are selected", () => {
    expect(matchesCampaignListFilter("Karen | ZMAPPS | Amazon Play | FR | JASINO", [])).toBe(true);
    expect(matchesCampaignListFilter("anything", null)).toBe(true);
    expect(matchesCampaignListFilter("anything", undefined)).toBe(true);
  });

  it("matches a selected campaign name exactly (case/whitespace-insensitive)", () => {
    const name = "Karen | ZMAPPS | Amazon Play | FR | JASINO";
    expect(matchesCampaignListFilter(name, [name])).toBe(true);
    expect(matchesCampaignListFilter(` ${name.toUpperCase()} `, [name])).toBe(true);
  });

  it("rejects rows for other campaigns", () => {
    expect(
      matchesCampaignListFilter("Sara | FB | Other Game | MX | ZLOT", [
        "Karen | ZMAPPS | Amazon Play | FR | JASINO",
      ])
    ).toBe(false);
  });

  it("never partial-matches (one flow must not swallow another's rows)", () => {
    expect(matchesCampaignListFilter("Karen | ZMAPPS | Amazon Play | FR | JASINO v2", [
      "Karen | ZMAPPS | Amazon Play | FR | JASINO",
    ])).toBe(false);
  });

  it("matches any of several selected flows", () => {
    const selected = ["Flow A", "Flow B"];
    expect(matchesCampaignListFilter("Flow B", selected)).toBe(true);
    expect(matchesCampaignListFilter("Flow C", selected)).toBe(false);
  });

  it("rejects empty/unknown campaigns when a selection is active", () => {
    expect(matchesCampaignListFilter("", ["Flow A"])).toBe(false);
    expect(matchesCampaignListFilter(null, ["Flow A"])).toBe(false);
  });
});

describe("matchesCountryFilter (regression pin)", () => {
  it("All matches everything", () => {
    expect(matchesCountryFilter("France", "All")).toBe(true);
    expect(matchesCountryFilter("", "All")).toBe(true);
  });
  it("otherwise requires normalized equality", () => {
    expect(matchesCountryFilter(" france ", "France")).toBe(true);
    expect(matchesCountryFilter("Brazil", "France")).toBe(false);
  });
});
