// Static option arrays and country/domain normalization helpers.
// Pure data + pure helpers — no React, no side effects.

// Every country (ISO 3166-1 name + alpha-2 code), alphabetical. Each code
// has a matching flag-icons SVG; names follow Intl.DisplayNames("en").
export const ALL_COUNTRIES = [
  ["Afghanistan", "af"],
  ["Åland Islands", "ax"],
  ["Albania", "al"],
  ["Algeria", "dz"],
  ["American Samoa", "as"],
  ["Andorra", "ad"],
  ["Angola", "ao"],
  ["Anguilla", "ai"],
  ["Antigua & Barbuda", "ag"],
  ["Argentina", "ar"],
  ["Armenia", "am"],
  ["Aruba", "aw"],
  ["Australia", "au"],
  ["Austria", "at"],
  ["Azerbaijan", "az"],
  ["Bahamas", "bs"],
  ["Bahrain", "bh"],
  ["Bangladesh", "bd"],
  ["Barbados", "bb"],
  ["Belarus", "by"],
  ["Belgium", "be"],
  ["Belize", "bz"],
  ["Benin", "bj"],
  ["Bermuda", "bm"],
  ["Bhutan", "bt"],
  ["Bolivia", "bo"],
  ["Bosnia & Herzegovina", "ba"],
  ["Botswana", "bw"],
  ["Brazil", "br"],
  ["British Virgin Islands", "vg"],
  ["Brunei", "bn"],
  ["Bulgaria", "bg"],
  ["Burkina Faso", "bf"],
  ["Burundi", "bi"],
  ["Cambodia", "kh"],
  ["Cameroon", "cm"],
  ["Canada", "ca"],
  ["Cape Verde", "cv"],
  ["Caribbean Netherlands", "bq"],
  ["Cayman Islands", "ky"],
  ["Central African Republic", "cf"],
  ["Chad", "td"],
  ["Chile", "cl"],
  ["China", "cn"],
  ["Christmas Island", "cx"],
  ["Cocos (Keeling) Islands", "cc"],
  ["Colombia", "co"],
  ["Comoros", "km"],
  ["Cook Islands", "ck"],
  ["Costa Rica", "cr"],
  ["Croatia", "hr"],
  ["Cuba", "cu"],
  ["Curaçao", "cw"],
  ["Cyprus", "cy"],
  ["Czech Republic", "cz"],
  ["Denmark", "dk"],
  ["Djibouti", "dj"],
  ["Dominica", "dm"],
  ["Dominican Republic", "do"],
  ["DR Congo", "cd"],
  ["Ecuador", "ec"],
  ["Egypt", "eg"],
  ["El Salvador", "sv"],
  ["Equatorial Guinea", "gq"],
  ["Eritrea", "er"],
  ["Estonia", "ee"],
  ["Eswatini", "sz"],
  ["Ethiopia", "et"],
  ["Falkland Islands", "fk"],
  ["Faroe Islands", "fo"],
  ["Fiji", "fj"],
  ["Finland", "fi"],
  ["France", "fr"],
  ["French Guiana", "gf"],
  ["French Polynesia", "pf"],
  ["Gabon", "ga"],
  ["Gambia", "gm"],
  ["Georgia", "ge"],
  ["Germany", "de"],
  ["Ghana", "gh"],
  ["Gibraltar", "gi"],
  ["Greece", "gr"],
  ["Greenland", "gl"],
  ["Grenada", "gd"],
  ["Guadeloupe", "gp"],
  ["Guam", "gu"],
  ["Guatemala", "gt"],
  ["Guernsey", "gg"],
  ["Guinea", "gn"],
  ["Guinea-Bissau", "gw"],
  ["Guyana", "gy"],
  ["Haiti", "ht"],
  ["Honduras", "hn"],
  ["Hong Kong", "hk"],
  ["Hungary", "hu"],
  ["Iceland", "is"],
  ["India", "in"],
  ["Indonesia", "id"],
  ["Iran", "ir"],
  ["Iraq", "iq"],
  ["Ireland", "ie"],
  ["Isle of Man", "im"],
  ["Israel", "il"],
  ["Italy", "it"],
  ["Ivory Coast", "ci"],
  ["Jamaica", "jm"],
  ["Japan", "jp"],
  ["Jersey", "je"],
  ["Jordan", "jo"],
  ["Kazakhstan", "kz"],
  ["Kenya", "ke"],
  ["Kiribati", "ki"],
  ["Kosovo", "xk"],
  ["Kuwait", "kw"],
  ["Kyrgyzstan", "kg"],
  ["Laos", "la"],
  ["Latvia", "lv"],
  ["Lebanon", "lb"],
  ["Lesotho", "ls"],
  ["Liberia", "lr"],
  ["Libya", "ly"],
  ["Liechtenstein", "li"],
  ["Lithuania", "lt"],
  ["Luxembourg", "lu"],
  ["Macao", "mo"],
  ["Madagascar", "mg"],
  ["Malawi", "mw"],
  ["Malaysia", "my"],
  ["Maldives", "mv"],
  ["Mali", "ml"],
  ["Malta", "mt"],
  ["Marshall Islands", "mh"],
  ["Martinique", "mq"],
  ["Mauritania", "mr"],
  ["Mauritius", "mu"],
  ["Mayotte", "yt"],
  ["Mexico", "mx"],
  ["Micronesia", "fm"],
  ["Moldova", "md"],
  ["Monaco", "mc"],
  ["Mongolia", "mn"],
  ["Montenegro", "me"],
  ["Montserrat", "ms"],
  ["Morocco", "ma"],
  ["Mozambique", "mz"],
  ["Myanmar", "mm"],
  ["Namibia", "na"],
  ["Nauru", "nr"],
  ["Nepal", "np"],
  ["Netherlands", "nl"],
  ["New Caledonia", "nc"],
  ["New Zealand", "nz"],
  ["Nicaragua", "ni"],
  ["Niger", "ne"],
  ["Nigeria", "ng"],
  ["Niue", "nu"],
  ["Norfolk Island", "nf"],
  ["North Korea", "kp"],
  ["North Macedonia", "mk"],
  ["Northern Mariana Islands", "mp"],
  ["Norway", "no"],
  ["Oman", "om"],
  ["Pakistan", "pk"],
  ["Palau", "pw"],
  ["Palestine", "ps"],
  ["Panama", "pa"],
  ["Papua New Guinea", "pg"],
  ["Paraguay", "py"],
  ["Peru", "pe"],
  ["Philippines", "ph"],
  ["Pitcairn Islands", "pn"],
  ["Poland", "pl"],
  ["Portugal", "pt"],
  ["Puerto Rico", "pr"],
  ["Qatar", "qa"],
  ["Republic of the Congo", "cg"],
  ["Réunion", "re"],
  ["Romania", "ro"],
  ["Russia", "ru"],
  ["Rwanda", "rw"],
  ["Saint Helena", "sh"],
  ["Samoa", "ws"],
  ["San Marino", "sm"],
  ["São Tomé & Príncipe", "st"],
  ["Saudi Arabia", "sa"],
  ["Senegal", "sn"],
  ["Serbia", "rs"],
  ["Seychelles", "sc"],
  ["Sierra Leone", "sl"],
  ["Singapore", "sg"],
  ["Sint Maarten", "sx"],
  ["Slovakia", "sk"],
  ["Slovenia", "si"],
  ["Solomon Islands", "sb"],
  ["Somalia", "so"],
  ["South Africa", "za"],
  ["South Korea", "kr"],
  ["South Sudan", "ss"],
  ["Spain", "es"],
  ["Sri Lanka", "lk"],
  ["St. Barthélemy", "bl"],
  ["St. Kitts & Nevis", "kn"],
  ["St. Lucia", "lc"],
  ["St. Martin", "mf"],
  ["St. Pierre & Miquelon", "pm"],
  ["St. Vincent & Grenadines", "vc"],
  ["Sudan", "sd"],
  ["Suriname", "sr"],
  ["Sweden", "se"],
  ["Switzerland", "ch"],
  ["Syria", "sy"],
  ["Taiwan", "tw"],
  ["Tajikistan", "tj"],
  ["Tanzania", "tz"],
  ["Thailand", "th"],
  ["Timor-Leste", "tl"],
  ["Togo", "tg"],
  ["Tokelau", "tk"],
  ["Tonga", "to"],
  ["Trinidad & Tobago", "tt"],
  ["Tunisia", "tn"],
  ["Turkey", "tr"],
  ["Turkmenistan", "tm"],
  ["Turks & Caicos Islands", "tc"],
  ["Tuvalu", "tv"],
  ["U.S. Virgin Islands", "vi"],
  ["Uganda", "ug"],
  ["Ukraine", "ua"],
  ["United Arab Emirates", "ae"],
  ["United Kingdom", "gb"],
  ["United States", "us"],
  ["Uruguay", "uy"],
  ["Uzbekistan", "uz"],
  ["Vanuatu", "vu"],
  ["Vatican City", "va"],
  ["Venezuela", "ve"],
  ["Vietnam", "vn"],
  ["Wallis & Futuna", "wf"],
  ["Western Sahara", "eh"],
  ["Yemen", "ye"],
  ["Zambia", "zm"],
  ["Zimbabwe", "zw"],
];

export const supportedCountryOptions = ALL_COUNTRIES.map(([name]) => name);

export const countryOptions = [...supportedCountryOptions];
export const accountRegistryCountryOptions = [...supportedCountryOptions];
export const defaultCountryOption = supportedCountryOptions[0] || "";

// Country name → ISO 3166-1 alpha-2 code, used to render flag-icons SVGs.
// Lowercased keys; includes common aliases/spellings. Geo codes already in
// ISO-2 (e.g. "BR", "MX") are detected directly by resolveCountryIso below.
const COUNTRY_NAME_TO_ISO = {
  // Aliases and alternate spellings — canonical names are merged in below
  // from ALL_COUNTRIES, so this only lists the extra ways a geo may arrive.
  "viet nam": "vn", brasil: "br", "méxico": "mx", "russian federation": "ru",
  "korea, republic of": "kr", korea: "kr", usa: "us", uk: "gb",
  "türkiye": "tr", turkiye: "tr", czechia: "cz", uae: "ae",
  "côte d'ivoire": "ci", "cote d'ivoire": "ci", "cabo verde": "cv",
  burma: "mm", macedonia: "mk", swaziland: "sz", "east timor": "tl",
  "palestinian territories": "ps", "hong kong sar china": "hk",
  "macao sar china": "mo", macau: "mo", congo: "cg",
  "democratic republic of the congo": "cd", "congo (drc)": "cd",
};
for (const [name, iso] of ALL_COUNTRIES) {
  COUNTRY_NAME_TO_ISO[name.toLowerCase()] = iso;
  COUNTRY_NAME_TO_ISO[name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()] = iso;
}

// Resolve any country label or geo code to an ISO-2 code (lowercase) for
// flag rendering. Returns null when nothing matches (so non-country options
// like roles/models render without a flag).
export const resolveCountryIso = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  // Already a 2-letter ISO code? (offer geos like "BR", "MX")
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toLowerCase();
  const key = String(raw)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return COUNTRY_NAME_TO_ISO[key] || COUNTRY_NAME_TO_ISO[String(raw).toLowerCase()] || null;
};

export const normalizeCountryValueKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const supportedCountryValueMap = new Map(
  supportedCountryOptions.map((country) => [normalizeCountryValueKey(country), country])
);
supportedCountryValueMap.set("brasil", "Brazil");

export const normalizeCountryListValue = (value) => {
  if (value === null || value === undefined || value === "") return [];
  let source = value;
  if (typeof source === "string") {
    const trimmed = source.trim();
    if (!trimmed) return [];
    try {
      source = JSON.parse(trimmed);
    } catch (error) {
      source = trimmed.includes(",") ? trimmed.split(",") : [trimmed];
    }
  }
  const list = Array.isArray(source) ? source : [source];
  const normalized = [];
  list.forEach((item) => {
    const raw = String(item || "").trim();
    if (!raw) return;
    const canonical = supportedCountryValueMap.get(normalizeCountryValueKey(raw)) || raw;
    if (!normalized.includes(canonical)) {
      normalized.push(canonical);
    }
  });
  return normalized;
};

export const normalizeDomainInputValue = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  const withoutProtocol = text.replace(/^https?:\/\//i, "");
  const hostCandidate = withoutProtocol.split("/")[0].trim();
  if (!hostCandidate) return text;
  return hostCandidate.toLowerCase();
};

export const normalizeDomainInputList = (value) => {
  if (value === null || value === undefined || value === "") return [];
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((item) => normalizeDomainInputValue(item)).filter(Boolean))
    );
  }
  const raw = String(value || "").trim();
  if (!raw) return [];
  const tokens = raw
    .split(/[\s,;]+/g)
    .map((item) => normalizeDomainInputValue(item))
    .filter(Boolean);
  return Array.from(new Set(tokens));
};

// ── Static option arrays used by selects across the app ──────────────
export const categoryOptions = ["Traffic Source", "Tools", "Designs"];
export const billingOptions = ["Crypto", "Bank Transfer", "Card"];
export const statusOptions = ["Requested", "Done", "Expired", "Cancelled"];
export const approachOptions = ["All", "Organic", "Paid Social", "Influencers", "Search"];
export const priorityBuyers = [
  "Leo", "Leticia", "Carvalho", "Akku", "Enzo", "Matheus", "Sara", "ZM apps",
];
export const buyerOptions = ["All", ...priorityBuyers];
export const roleOptions = [
  "Boss",
  "Team Leader",
  "Media Buyer Junior",
  "Media Buyer",
  "Media Buyer Senior",
];

export const permissionOptions = [
  { key: "dashboard", label: "Home Dashboard" },
  { key: "geos", label: "GEOS" },
  { key: "goals", label: "Goals" },
  { key: "finances", label: "Finances" },
  { key: "offers", label: "Offers" },
  { key: "utm", label: "UTM Builder" },
  { key: "tracking_links", label: "Tracking Links" },
  { key: "statistics", label: "Statistics" },
  { key: "campaigns", label: "Campaigns" },
  { key: "placements", label: "Placement" },
  { key: "user_behavior", label: "User Behavior" },
  { key: "devices", label: "Devices" },
  { key: "domains", label: "Domains" },
  { key: "pixels", label: "Pixels" },
  { key: "accounts", label: "Accounts" },
  { key: "meta_token", label: "Meta Token $" },
  { key: "api", label: "API" },
  { key: "media_buyers", label: "Media Buyers" },
  { key: "roles", label: "Roles & Permissions" },
];

export const periodOptions = [
  "Today", "Yesterday", "This Week", "Last Week",
  "This Month", "Last Month", "All",
];
