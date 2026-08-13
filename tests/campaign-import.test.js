// Importing a Keitaro campaign writes a row that decides who sees a flow and
// what link they copy out of it. Both are easy to get quietly wrong — the
// owner rule in particular reproduces a real incident (see resolveOwner), so
// it is pinned here rather than left to the endpoint.
import { describe, it, expect } from "vitest";
import {
  parseCampaignName,
  resolveOwner,
  paramsFromKeitaroCampaign,
  buildTrackingUrl,
  keitaroCampaignToLinkRow,
  planCampaignImport,
} from "../server/lib/campaign-import.js";

const USERS = [
  { id: 1, username: "Yilmachine" },
  { id: 2, username: "Leo" },
  { id: 3, username: "Sara" },
  { id: 6, username: "Carvalho" },
  { id: 945, username: "Karen" },
  { id: 1603, username: "Leomarketing" },
];
const ALIASES = new Map([
  ["leo", "Leomarketing"],
  ["karen", "KarenFarias"],
]);
const DOMAINS = new Map([
  [26, "go.deuskt.click"],
  [27, "deuskt.click"],
  [31, "familiafortune.com"],
]);

const campaign = (over = {}) => ({
  id: 440,
  name: "Sara | ZMAPPS | Santa Fe | MX | ZLOTMX",
  alias: "rm4S54C9",
  state: "active",
  group_id: 14,
  domain_id: 26,
  traffic_source_id: 20,
  parameters: {
    keyword: { name: "keyword", placeholder: "", alias: "" },
    cost: { name: "cost", placeholder: "", alias: "" },
    external_id: { placeholder: "{exid}" },
    sub_id_1: { name: "sub1", placeholder: "{sub1}" },
    sub_id_2: { name: "sub2", placeholder: "{sub2}" },
    sub_id_6: { name: "adset_id", placeholder: "{{adset.id}}" },
    sub_id_12: { name: "fbclid", placeholder: "{{fbclid}}" },
  },
  ...over,
});

describe("parseCampaignName", () => {
  it("splits the house convention into its five segments", () => {
    const p = parseCampaignName("Karen | PWA.GROUP | Ice Fishing | CO | JASINO");
    expect(p).toMatchObject({
      buyer: "Karen", tool: "PWA.GROUP", game: "Ice Fishing", geo: "CO", brand: "JASINO",
      isFormatted: true,
    });
  });
  it("treats '-' as an empty placeholder, not a value", () => {
    expect(parseCampaignName("Sara | ZMAPPS | - | MX | JASINO").game).toBe("");
  });
  it("flags anything that is not five filled segments as unformatted", () => {
    expect(parseCampaignName("Leo | FB | SAFEST").isFormatted).toBe(false);
    expect(parseCampaignName("Traffic Junkey - ZlotMX - MX").isFormatted).toBe(false);
    expect(parseCampaignName("Sara | ZMAPPS |  | MX | JASINO").isFormatted).toBe(false);
    expect(parseCampaignName("").isFormatted).toBe(false);
  });
});

describe("resolveOwner", () => {
  it("resolves a plain username", () => {
    expect(resolveOwner("Sara", USERS, ALIASES).id).toBe(3);
  });

  // THE regression: "Leo" is both the tracker's name for Leomarketing (#1603)
  // and the username of a different account (#2). Exact-match-first sent 18
  // of Leomarketing's campaigns to the wrong person's My Flows.
  it("prefers the alias target over a same-named other account", () => {
    expect(resolveOwner("Leo", USERS, ALIASES).id).toBe(1603);
  });

  it("falls back to the exact username when the alias points at nobody", () => {
    // karen → "KarenFarias", who has no account; the real user is "Karen".
    expect(resolveOwner("Karen", USERS, ALIASES).id).toBe(945);
  });

  it("is case- and punctuation-insensitive", () => {
    expect(resolveOwner("  cARVALHO ", USERS, ALIASES).id).toBe(6);
  });

  it("returns null for an unknown buyer rather than guessing", () => {
    expect(resolveOwner("Propeller", USERS, ALIASES)).toBe(null);
    expect(resolveOwner("", USERS, ALIASES)).toBe(null);
  });

  it("accepts a plain object as the alias map", () => {
    expect(resolveOwner("Leo", USERS, { leo: "Leomarketing" }).id).toBe(1603);
  });
});

describe("paramsFromKeitaroCampaign", () => {
  it("emits external_id first, then sub_ids in numeric order", () => {
    expect(paramsFromKeitaroCampaign(campaign())).toBe(
      "external_id={exid}&sub1={sub1}&sub2={sub2}&adset_id={{adset.id}}&fbclid={{fbclid}}"
    );
  });

  it("sorts numerically, not lexically (sub_id_10 after sub_id_9)", () => {
    const params = {
      sub_id_2: { name: "sub2", placeholder: "{sub2}" },
      sub_id_10: { name: "sub10", placeholder: "{sub10}" },
      sub_id_9: { name: "sub9", placeholder: "{sub9}" },
    };
    expect(paramsFromKeitaroCampaign({ parameters: params })).toBe(
      "sub2={sub2}&sub9={sub9}&sub10={sub10}"
    );
  });

  it("drops parameters that carry no placeholder", () => {
    // keyword/cost/currency are configured but never populated.
    expect(paramsFromKeitaroCampaign(campaign())).not.toContain("keyword");
    expect(paramsFromKeitaroCampaign(campaign())).not.toContain("cost");
  });

  it("reports the tracker's macro as-is, off-standard or not", () => {
    // An adopted flow must show the link that actually runs, not the macro the
    // dashboard would have chosen for this tool.
    const odd = campaign({ parameters: { sub_id_6: { name: "sub6", placeholder: "{sub6}" } } });
    expect(paramsFromKeitaroCampaign(odd)).toBe("sub6={sub6}");
  });

  it("survives a campaign with no parameters at all", () => {
    expect(paramsFromKeitaroCampaign({})).toBe("");
    expect(paramsFromKeitaroCampaign(null)).toBe("");
  });
});

describe("buildTrackingUrl", () => {
  it("composes host + alias + query", () => {
    expect(buildTrackingUrl("go.deuskt.click", "abc123", "sub1={sub1}")).toBe(
      "https://go.deuskt.click/abc123?sub1={sub1}"
    );
  });
  it("tolerates scheme, trailing slash and leading ?/", () => {
    expect(buildTrackingUrl("https://go.deuskt.click/", "/abc", "?a=1")).toBe(
      "https://go.deuskt.click/abc?a=1"
    );
  });
  it("returns empty when there is no host or no alias", () => {
    expect(buildTrackingUrl("", "abc", "")).toBe("");
    expect(buildTrackingUrl("go.deuskt.click", "", "")).toBe("");
  });
});

describe("keitaroCampaignToLinkRow", () => {
  const row = keitaroCampaignToLinkRow(campaign(), { users: USERS, domainHost: DOMAINS, aliases: ALIASES });

  it("fills the tracking_links shape from the campaign", () => {
    expect(row).toMatchObject({
      name: "Sara | ZMAPPS | Santa Fe | MX | ZLOTMX",
      buyer: "Sara",
      tool: "ZMAPPS",
      game: "Santa Fe",
      geo: "MX",
      brand: "ZLOTMX",
      domain: "go.deuskt.click",
      alias: "rm4S54C9",
      keitaro_id: "440",
      keitaro_status: "created",
      owner_id: 3,
      kdomain_id: "26",
      keitaro_group_id: "14",
      traffic_source_id: "20",
      state: "active",
    });
  });

  it("marks the row created, because the campaign demonstrably exists", () => {
    expect(row.keitaro_status).toBe("created");
    expect(row.keitaro_error).toBe(null);
  });

  it("mirrors a disabled campaign's state", () => {
    const off = keitaroCampaignToLinkRow(campaign({ state: "disabled" }), { users: USERS, domainHost: DOMAINS, aliases: ALIASES });
    expect(off.state).toBe("disabled");
  });

  it("uses the buyer's dashboard username, not the tracker's short form", () => {
    const leo = keitaroCampaignToLinkRow(
      campaign({ name: "Leo | ZMAPPS | Santa Fe | MX | ZLOTMX" }),
      { users: USERS, domainHost: DOMAINS, aliases: ALIASES }
    );
    expect(leo.owner_id).toBe(1603);
    expect(leo.buyer).toBe("Leomarketing");
  });

  it("leaves owner_id null when nobody matches", () => {
    const orphan = keitaroCampaignToLinkRow(
      campaign({ name: "Propeller | PROPELLER | WebApp | MX | ZLOTMX" }),
      { users: USERS, domainHost: DOMAINS, aliases: ALIASES }
    );
    expect(orphan.owner_id).toBe(null);
  });

  it("keeps a domain that is not an allowed *new-link* domain", () => {
    // ALLOWED_TRACKING_DOMAINS gates creation; an adopted campaign must report
    // the host it actually runs on or the buyer copies a dead link.
    const legacy = keitaroCampaignToLinkRow(campaign({ domain_id: 31 }), {
      users: USERS, domainHost: DOMAINS, aliases: ALIASES,
    });
    expect(legacy.domain).toBe("familiafortune.com");
    expect(legacy.url).toContain("https://familiafortune.com/");
  });
});

describe("planCampaignImport", () => {
  const base = [
    campaign({ id: 1, name: "Sara | ZMAPPS | A | MX | JASINO" }),
    campaign({ id: 2, name: "Karen | PWA.GROUP | B | CO | ZLOTMX" }),
    campaign({ id: 3, name: "Sara | ZMAPPS | C | MX | BETORSPINBR" }),
    campaign({ id: 4, name: "Leo | FB | SAFEST" }),
    campaign({ id: 5, name: "Propeller | PROPELLER | D | MX | ZLOTMX" }),
    campaign({ id: 6, name: "Sara | ZMAPPS | E | MX | JASINO", group_id: 12 }),
    campaign({ id: 7, name: "Sara | ZMAPPS | F | MX | JASINO", alias: "" }),
  ];
  const opts = {
    campaigns: base,
    existingKeitaroIds: new Set(["2"]),
    users: USERS,
    domainHost: DOMAINS,
    aliases: ALIASES,
    brands: ["JASINO", "ZLOTMX"],
    excludeGroupIds: [12],
  };

  it("imports only what it can attribute, and says why for the rest", () => {
    const { importable, skipped } = planCampaignImport(opts);
    expect(importable.map((r) => r.keitaro_id)).toEqual(["1"]);
    const reasons = Object.fromEntries(skipped.map((s) => [s.id, s.reason]));
    expect(reasons).toEqual({
      2: "already_imported",
      3: "other_brand",
      4: "unparseable_name",
      5: "no_matching_user",
      6: "external_group",
      7: "no_link_url",
    });
  });

  it("is idempotent: a second pass over its own output imports nothing", () => {
    const first = planCampaignImport(opts);
    const second = planCampaignImport({
      ...opts,
      existingKeitaroIds: new Set([...opts.existingKeitaroIds, ...first.importable.map((r) => r.keitaro_id)]),
    });
    expect(second.importable).toHaveLength(0);
  });

  it("matches brands case-insensitively", () => {
    const { importable } = planCampaignImport({ ...opts, brands: ["jasino"] });
    expect(importable.map((r) => r.keitaro_id)).toEqual(["1"]);
  });

  it("takes every brand when no brand filter is given", () => {
    const { importable } = planCampaignImport({ ...opts, brands: [] });
    expect(importable.map((r) => r.keitaro_id).sort()).toEqual(["1", "3"]);
  });

  it("excludes an external group before anything else looks at it", () => {
    const { importable } = planCampaignImport({ ...opts, excludeGroupIds: [12, 14] });
    expect(importable).toHaveLength(0);
  });
});
