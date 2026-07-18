// Buyer-scoping primitives — THE permission boundary of the dashboard.
// Every buyer-visible Keitaro/media-stats row passes through these functions,
// so they live in their own module with unit tests (tests/scoping.test.js).
// Stateful inputs (alias maps, DB alias cache) are injected by the server via
// the factory functions so the core stays pure and testable.

export const CAMPAIGN_SEGMENT_KEYS = ["buyer", "tool", "game", "geo", "brand"];

export const normalizeBuyerName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Anchored-prefix matching (the legit alias shape: "Leo" ↔ "Leomarketing",
// "Karen" ↔ "KarenFarias"), never mid-string, shorter side ≥ 3 chars.
// Bidirectional .includes() let one buyer's rows scope onto another's the
// moment two names overlapped anywhere ("rosara" matched "sara").
export const buyerMatches = (rowBuyer, viewerBuyer) => {
  const rowValue = normalizeBuyerName(rowBuyer);
  const viewerValue = normalizeBuyerName(viewerBuyer);
  if (!viewerValue) return false;
  if (!rowValue) return false;
  if (rowValue === viewerValue) return true;
  const [short, long] =
    rowValue.length <= viewerValue.length ? [rowValue, viewerValue] : [viewerValue, rowValue];
  if (short.length < 3) return false;
  return long.startsWith(short);
};

// Break the "Buyer | Tool | Game | Geo | Brand" campaign name into columns.
// resolveAlias maps short campaign names to registered usernames
// ("leo" → "Leomarketing").
export const makeCampaignParser = (resolveAlias) => (name) => {
  const raw = String(name || "").trim();
  const segments = raw ? raw.split("|").map((p) => p.trim()) : [];
  const segmentCount = segments.length;
  const isFormatted =
    segmentCount === CAMPAIGN_SEGMENT_KEYS.length && segments.every((s) => s.length > 0);
  // "-" is a deliberate placeholder → treat as empty for the typed fields.
  const slot = (i) => {
    const v = segments[i] ? segments[i].trim() : "";
    return v === "-" ? "" : v;
  };
  const rawBuyer = (segments[0] ? segments[0].trim() : raw) || "";
  return {
    raw,
    isFormatted,
    segmentCount,
    rawBuyer,
    buyer: resolveAlias(rawBuyer),
    tool: slot(1),
    game: slot(2),
    geo: slot(3),
    brand: slot(4),
  };
};

// Buyer identity forms + whole-word Keitaro-name matching + row ownership.
// getAliasEntries: () => Iterable<[shortForm, canonicalName]>
// getDbAlias: (normalizedBuyer) => shortForm | undefined
export const makeBuyerScoping = ({ getAliasEntries, getDbAlias }) => {
  const buyerShortForms = (buyer) => {
    const b = String(buyer || "").trim().toLowerCase();
    const forms = new Set();
    if (b) forms.add(b);
    for (const [short, canonical] of getAliasEntries()) {
      if (String(canonical || "").trim().toLowerCase() === b) forms.add(String(short).toLowerCase());
    }
    const dbAlias = getDbAlias(b);
    if (dbAlias) forms.add(dbAlias);
    return [...forms].filter(Boolean);
  };

  // Does a Keitaro name (offer/group/campaign) belong to this buyer? Names are
  // inconsistent ("Karen | …", "Leo (InApp) - …", "ZM.APPS - Leo - …") so we
  // match any of the buyer's identity forms as a WHOLE WORD in the name.
  const keitaroNameMatchesBuyer = (name, buyer) => {
    const text = String(name || "").toLowerCase();
    return buyerShortForms(buyer).some((form) => {
      const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(text);
    });
  };

  // Does a stats row belong to this viewer? Prefer the whole-word, short-form
  // matcher against the raw campaign name, unioned with the anchored-prefix
  // parsed-buyer check so no buyer who matched before ever loses rows.
  const viewerOwnsRow = (row, viewerBuyer) =>
    keitaroNameMatchesBuyer(row.campaign_name || row.campaign || row.buyer, viewerBuyer) ||
    buyerMatches(row.buyer, viewerBuyer);

  return { buyerShortForms, keitaroNameMatchesBuyer, viewerOwnsRow };
};
