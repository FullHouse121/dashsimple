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
  const latam = "Leo | ZMAPPS | Joker Jewels | LATAM | JASINO";

  it("matches its own country and no other", () => {
    expect(campaignServesCountry(br, { iso: "br", country: "Brazil" })).toBe(true);
    expect(campaignServesCountry(br, { iso: "mx", country: "Mexico" })).toBe(false);
  });

  it("is case-insensitive about the target", () => {
    expect(campaignServesCountry(br, { iso: "BR", country: "Brazil" })).toBe(true);
  });

  it("matches any one of a multi-geo campaign's codes", () => {
    const multi = "Leo | ZMAPPS | Game | BR/MX | JASINO";
    expect(campaignServesCountry(multi, { iso: "br", country: "Brazil" })).toBe(true);
    expect(campaignServesCountry(multi, { iso: "mx", country: "Mexico" })).toBe(true);
    expect(campaignServesCountry(multi, { iso: "ar", country: "Argentina" })).toBe(false);
  });

  it("runs a GLOBAL broad match everywhere", () => {
    expect(campaignServesCountry(global, { iso: "br", country: "Brazil" })).toBe(true);
    expect(campaignServesCountry(global, { iso: "de", country: "Germany" })).toBe(true);
    expect(campaignServesCountry(global, { iso: "vn", country: "Vietnam" })).toBe(true);
  });

  it("holds a LATAM broad match to Latin America", () => {
    expect(campaignServesCountry(latam, { iso: "br", country: "Brazil" })).toBe(true);
    expect(campaignServesCountry(latam, { iso: "mx", country: "Mexico" })).toBe(true);
    expect(campaignServesCountry(latam, { iso: "co", country: "Colombia" })).toBe(true);
    // The point of resolving the region rather than treating it as a wildcard.
    expect(campaignServesCountry(latam, { iso: "de", country: "Germany" })).toBe(false);
    expect(campaignServesCountry(latam, { iso: "jp", country: "Japan" })).toBe(false);
  });

  it("resolves the other region tokens the same way", () => {
    const mena = "Leo | ZMAPPS | Game | MENA | JASINO";
    expect(campaignServesCountry(mena, { iso: "tr", country: "Turkey" })).toBe(true);
    expect(campaignServesCountry(mena, { iso: "br", country: "Brazil" })).toBe(false);
    const tier1 = "Leo | ZMAPPS | Game | TIER1 | JASINO";
    expect(campaignServesCountry(tier1, { iso: "de", country: "Germany" })).toBe(true);
    expect(campaignServesCountry(tier1, { iso: "br", country: "Brazil" })).toBe(false);
  });

  it("keeps a token it cannot read rather than hiding the flow", () => {
    const odd = "Leo | ZMAPPS | Game | XYZZY | JASINO";
    expect(campaignServesCountry(odd, { iso: "br", country: "Brazil" })).toBe(true);
  });

  it("keeps everything when no country is being filtered on", () => {
    expect(campaignServesCountry(br, {})).toBe(true);
    expect(campaignServesCountry(br)).toBe(true);
  });
});
