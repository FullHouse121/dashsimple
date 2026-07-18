// The scoping functions ARE the permission system: a regression here shows
// one buyer another buyer's revenue. These tests pin the boundary.
import { describe, it, expect } from "vitest";
import {
  normalizeBuyerName,
  buyerMatches,
  makeCampaignParser,
  makeBuyerScoping,
} from "../server/lib/scoping.js";

describe("normalizeBuyerName", () => {
  it("lowercases and strips non-alphanumerics", () => {
    expect(normalizeBuyerName(" Karen-Farias! ")).toBe("karenfarias");
    expect(normalizeBuyerName("")).toBe("");
    expect(normalizeBuyerName(null)).toBe("");
  });
});

describe("buyerMatches (anchored prefix)", () => {
  it("matches exact names", () => {
    expect(buyerMatches("Sara", "Sara")).toBe(true);
  });
  it("matches the team alias shape: short campaign label ↔ long username", () => {
    expect(buyerMatches("Leo", "Leomarketing")).toBe(true);
    expect(buyerMatches("Leomarketing", "Leo")).toBe(true);
    expect(buyerMatches("Karen", "KarenFarias")).toBe(true);
  });
  it("never matches mid-string (the old cross-buyer leak)", () => {
    expect(buyerMatches("Rosara", "Sara")).toBe(false);
    expect(buyerMatches("Cleopatra", "Leo")).toBe(false);
    expect(buyerMatches("Sara", "Rosara")).toBe(false);
  });
  it("rejects short wildcards under 3 chars", () => {
    expect(buyerMatches("Al", "Alberto")).toBe(false);
    expect(buyerMatches("Alberto", "Al")).toBe(false);
  });
  it("rejects empty sides", () => {
    expect(buyerMatches("", "Sara")).toBe(false);
    expect(buyerMatches("Sara", "")).toBe(false);
  });
});

const identityAlias = (v) => v;
const parse = makeCampaignParser(identityAlias);

describe("parseCampaignName", () => {
  it("splits the team format Buyer | Tool | Game | Geo | Brand", () => {
    const parsed = parse("Leo | ZMAPPS | Santa Fe Casino | MX | ZLOTMX");
    expect(parsed.buyer).toBe("Leo");
    expect(parsed.tool).toBe("ZMAPPS");
    expect(parsed.game).toBe("Santa Fe Casino");
    expect(parsed.geo).toBe("MX");
    expect(parsed.brand).toBe("ZLOTMX");
    expect(parsed.isFormatted).toBe(true);
    expect(parsed.segmentCount).toBe(5);
  });
  it("treats '-' segments as intentional blanks", () => {
    const parsed = parse("Sara | PWA | - | BR | JASINO");
    expect(parsed.game).toBe("");
    expect(parsed.isFormatted).toBe(true);
  });
  it("keeps unformatted names as raw buyer", () => {
    const parsed = parse("Leo FB SAFEST");
    expect(parsed.buyer).toBe("Leo FB SAFEST");
    expect(parsed.isFormatted).toBe(false);
  });
  it("applies the alias resolver to the buyer segment", () => {
    const aliased = makeCampaignParser((v) => (v === "Leo" ? "Leomarketing" : v));
    expect(aliased("Leo | FB | SAFEST").buyer).toBe("Leomarketing");
  });
  it("handles empty input", () => {
    const parsed = parse("");
    expect(parsed.buyer).toBe("");
    expect(parsed.segmentCount).toBe(0);
  });
});

describe("makeBuyerScoping", () => {
  const scoping = makeBuyerScoping({
    getAliasEntries: () => new Map([["leo", "Leomarketing"], ["karen", "KarenFarias"]]).entries(),
    getDbAlias: () => undefined,
  });

  it("buyerShortForms includes the canonical name and its aliases", () => {
    expect(scoping.buyerShortForms("Leomarketing").sort()).toEqual(["leo", "leomarketing"]);
    expect(scoping.buyerShortForms("Sara")).toEqual(["sara"]);
  });

  it("keitaroNameMatchesBuyer matches whole words only", () => {
    expect(scoping.keitaroNameMatchesBuyer("ZM.APPS - Leo - MX", "Leomarketing")).toBe(true);
    expect(scoping.keitaroNameMatchesBuyer("Karen | PWA | Lloyds", "KarenFarias")).toBe(true);
    // "Leo" inside another word must NOT match
    expect(scoping.keitaroNameMatchesBuyer("Cleopatra Slots", "Leomarketing")).toBe(false);
  });

  it("viewerOwnsRow scopes by campaign name or parsed buyer", () => {
    expect(
      scoping.viewerOwnsRow({ campaign: "Leo | ZMAPPS | X | MX | Z", buyer: "Leo" }, "Leomarketing")
    ).toBe(true);
    expect(
      scoping.viewerOwnsRow({ campaign: "Sara | PWA | X | BR | J", buyer: "Sara" }, "Leomarketing")
    ).toBe(false);
    expect(scoping.viewerOwnsRow({ campaign: "", buyer: "Sara" }, "Sara")).toBe(true);
  });

  it("one buyer never owns another registered buyer's rows", () => {
    const buyers = ["Leomarketing", "Sara", "KarenFarias", "Akku", "Matheus", "Enzo", "Carvalho", "Leticia"];
    const rows = [
      { campaign: "Sara | PWA.GROUP | Chicken Road | BR | JASINO", buyer: "Sara" },
      { campaign: "Akku | ZMAPPS | Cossio Casino | CO | JASINO", buyer: "Akku" },
      { campaign: "Karen | PWA | Lloyds Casino | GB | JASINO", buyer: "Karen" },
      { campaign: "Leo | ZMAPPS | Santa Fe Casino | MX | ZLOTMX", buyer: "Leo" },
    ];
    const owners = rows.map((row) => buyers.filter((b) => scoping.viewerOwnsRow(row, b)));
    expect(owners).toEqual([["Sara"], ["Akku"], ["KarenFarias"], ["Leomarketing"]]);
  });
});
