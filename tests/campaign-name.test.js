import { describe, it, expect } from "vitest";
import {
  parseCampaignName,
  campaignGeoCodes,
  campaignServesCountry,
} from "../shared/campaign-name.js";

describe("parseCampaignName", () => {
  it("reads the house convention", () => {
    const p = parseCampaignName("Karen | ZMAPPS | Ice Fishing | BR | JASINO");
    expect(p.isFormatted).toBe(true);
    expect(p.buyer).toBe("Karen");
    expect(p.tool).toBe("ZMAPPS");
    expect(p.game).toBe("Ice Fishing");
    expect(p.geo).toBe("BR");
    expect(p.brand).toBe("JASINO");
  });

  it("treats a lone dash as an empty slot", () => {
    expect(parseCampaignName("Leo | - | Chicken Road | MX | ZLOT").tool).toBe("");
  });

  it("rejects names with the wrong segment count", () => {
    expect(parseCampaignName("Leo | ZMAPPS | Chicken Road").isFormatted).toBe(false);
    expect(parseCampaignName("").isFormatted).toBe(false);
  });
});

describe("campaignGeoCodes", () => {
  it("returns the single code a campaign normally carries", () => {
    expect(campaignGeoCodes("Karen | ZMAPPS | Ice Fishing | BR | JASINO")).toEqual(["br"]);
  });

  it("splits the separators a human actually types", () => {
    const expected = ["br", "mx"];
    expect(campaignGeoCodes("Leo | ZMAPPS | Game | BR/MX | JASINO")).toEqual(expected);
    expect(campaignGeoCodes("Leo | ZMAPPS | Game | BR-MX | JASINO")).toEqual(expected);
    expect(campaignGeoCodes("Leo | ZMAPPS | Game | BR, MX | JASINO")).toEqual(expected);
  });

  it("drops tokens that are not ISO-2 rather than guessing at them", () => {
    expect(campaignGeoCodes("Akku | PWA.GROUP | Chicken Road | GLOBAL | JASINO")).toEqual([]);
    expect(campaignGeoCodes("Leo | ZMAPPS | Joker Jewels | LATAM | JASINO")).toEqual([]);
  });
});

describe("campaignServesCountry", () => {
  const br = "Karen | ZMAPPS | Ice Fishing | BR | JASINO";
  const global = "Akku | PWA.GROUP | Chicken Road | GLOBAL | JASINO";

  it("matches its own country and no other", () => {
    expect(campaignServesCountry(br, "br")).toBe(true);
    expect(campaignServesCountry(br, "mx")).toBe(false);
  });

  it("is case-insensitive about the target", () => {
    expect(campaignServesCountry(br, "BR")).toBe(true);
  });

  it("matches any one of a multi-geo campaign's codes", () => {
    const multi = "Leo | ZMAPPS | Game | BR/MX | JASINO";
    expect(campaignServesCountry(multi, "br")).toBe(true);
    expect(campaignServesCountry(multi, "mx")).toBe(true);
    expect(campaignServesCountry(multi, "ar")).toBe(false);
  });

  it("keeps a campaign whose geo names no country — absence is a wildcard", () => {
    // A GLOBAL campaign does run in Brazil; hiding it would assert otherwise.
    expect(campaignServesCountry(global, "br")).toBe(true);
    expect(campaignServesCountry(global, "de")).toBe(true);
  });

  it("keeps everything when no country is being filtered on", () => {
    expect(campaignServesCountry(br, "")).toBe(true);
    expect(campaignServesCountry(br, null)).toBe(true);
  });
});
