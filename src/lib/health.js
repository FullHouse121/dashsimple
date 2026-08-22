import { Eye, Plus, Trash2, Wrench } from "lucide-react";

// Each rule/issue code maps to one instruction. `kind` drives the whole
// visual language, so a buyer can scan for "what do I have to ADD" and
// ignore everything else.
export const HEALTH_ACTIONS = {
  // Setup integrity
  flow_no_domain: { kind: "add", verb: "Bind a PWA domain", cost: "This flow can't receive traffic", view: "flows" },
  domain_no_pixel: { kind: "add", verb: "Attach a pixel", cost: "Conversions never reach Meta", view: "domains" },
  domain_dead_but_bound: { kind: "remove", verb: "Unbind this domain", cost: "Traffic is landing on a dead domain", view: "flows" },
  pixel_orphan_host: { kind: "fix", verb: "Re-attach to a live domain", cost: "The pixel is firing nowhere", view: "pixels" },
  pixel_unattached: { kind: "add", verb: "Attach it, or archive it", cost: "Registered but unused", view: "pixels" },
  pixel_duplicate: { kind: "remove", verb: "Delete the duplicates", cost: "Two records claim the same pixel", view: "pixels" },
  geo_mismatch: { kind: "fix", verb: "Align the pixel's GEO", cost: "Pixel and flow target different markets", view: "pixels" },
  domains_unbound: { kind: "add", verb: "Bind them, or retire them", cost: "Paid for and doing nothing", view: "domains" },
  // Alerts
  meta_token_dead: { kind: "fix", verb: "Replace the token in Keitaro", cost: "No spend data for this ad account", view: "meta_token" },
  cost_stalled: { kind: "fix", verb: "Restore the cost integration", cost: "Every ROI number is understated", view: "meta_token" },
  integration_unlinked: { kind: "fix", verb: "Link it to its Keitaro integration", cost: "Meta spend has no route in", view: "meta_token" },
  flow_traffic_drop: { kind: "check", verb: "Check the campaign", cost: "Traffic collapsed on a live flow", view: "flows" },
  paused_with_traffic: { kind: "check", verb: "Stop the ads, or re-enable the flow", cost: "Paying for clicks a paused flow won't route", view: "flows" },
};

export const healthAction = (code) => {
  if (HEALTH_ACTIONS[code]) return HEALTH_ACTIONS[code];
  const stripped = String(code || "").replace(/^integrity_/, "");
  return HEALTH_ACTIONS[stripped] || { kind: "check", verb: "Review this", cost: "", view: null };
};

export const ACTION_META = {
  add: { label: "Add", Icon: Plus },
  remove: { label: "Remove", Icon: Trash2 },
  fix: { kind: "fix", label: "Fix", Icon: Wrench },
  check: { label: "Check", Icon: Eye },
};

// "Fix it" should land on the work, not just the screen. Where the
// destination understands a filter, hand it over on the way.
export const HEALTH_DESTINATION_FILTER = {
  flow_no_domain: "no-domains",
  domain_no_pixel: "no-pixels",
};
