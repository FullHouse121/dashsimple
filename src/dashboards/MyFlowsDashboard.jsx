import React from "react";
import keitaroLogo from "../assets/brands/keitaro.svg";
import { BrandMark, resolveBrandLogo } from "../components/BrandMark.jsx";
import { EntityHistory } from "../components/EntityHistory.jsx";
import { ImportCampaignsModal } from "../components/ImportCampaigns.jsx";
import { CountryDropdownPicker, Select } from "../components/Select.jsx";
import { FlowSparkline } from "../components/Sparkline.jsx";
import { CountryFlag } from "../components/flags.jsx";
import { FlowsIcon } from "../components/glyphs.jsx";
import { ImportIcon } from "../components/icons.jsx";
import { apiFetch } from "../lib/api.js";
import { apiJson } from "../lib/useResource.js";
import {
  buyerOptions,
  countryNameFromIso,
  normalizeCountryListValue,
  normalizeDomainInputList,
  resolveCountryIso,
} from "../lib/constants.js";
import { downloadCsv, formatCurrency } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, dialogMotion, overlayMotion } from "../lib/motion.js";
import { isLeadershipRole } from "../lib/permissions.js";
import { TRACKING_FILTER_BY_NAME } from "../lib/tracking.js";
import { IMPORT_DEFAULT_BRANDS } from "../lib/view-helpers.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownUp,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Link2,
  Megaphone,
  Pause,
  Pencil,
  Play,
  Plus,
  ScrollText,
  Search,
  SlidersHorizontal,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Unlink,
  X,
  Zap,
} from "lucide-react";

// ── My Flows ──────────────────────────────────────────────────────────
// Buyer-centric tree: Tracking Link → bound PWA domains → pixels on each
// domain. Buyers bind domains to a link and pixels already carry domains.
export default function MyFlowsDashboard({ authUser }) {
  const { t } = useLanguage();
  const [links, setLinks] = React.useState([]);
  const [domains, setDomains] = React.useState([]);
  const [pixels, setPixels] = React.useState([]);
  const [state, setState] = React.useState({ loading: true, error: null });
  const [expanded, setExpanded] = React.useState({});
  const [bindModal, setBindModal] = React.useState({ open: false, link: null, saving: false, error: null, selected: [] });
  const [detail, setDetail] = React.useState({ open: false, link: null, domain: null, pixels: [] });
  const [flowViz, setFlowViz] = React.useState({ open: false, link: null });
  const [copied, setCopied] = React.useState(null);
  const [sortBy, setSortBy] = React.useState("recent");
  const [importOpen, setImportOpen] = React.useState(false);
  // Leadership sees every buyer's flows, so they get a buyer filter; a buyer's
  // own list is already scoped server-side and needs none.
  const canFilterByBuyer = isLeadershipRole(authUser?.role);
  // One filter object: text search + four dimension pickers + health flags.
  // The flags answer the ops questions this page exists for ("which flows
  // can't run?"), which no dimension filter can express.
  const EMPTY_FLOW_FILTERS = { search: "", buyers: [], countries: [], domains: [], brands: [], flags: [] };
  const [filters, setFilters] = React.useState(EMPTY_FLOW_FILTERS);
  const setFilterList = (key) => (value) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((x) => x !== value) : [...prev[key], value],
    }));
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.buyers.length +
    filters.countries.length +
    filters.domains.length +
    filters.brands.length +
    filters.flags.length;
  // Unbinding is destructive-ish, so the ✕ arms first and only fires on the
  // second click ("link:domain" key, auto-disarms).
  const [unbindArmed, setUnbindArmed] = React.useState(null);
  const [unbinding, setUnbinding] = React.useState(null);
  const unbindTimerRef = React.useRef(null);

  const maskToken = (v) => {
    const s = String(v || "");
    return s.length <= 14 ? s || "—" : `${s.slice(0, 8)}••••${s.slice(-4)}`;
  };
  const copyValue = (key, value) => async () => {
    if (!value) return;
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((p) => (p === key ? null : p)), 1200);
    } catch (error) {
      /* clipboard denied */
    }
  };
  // The PWA link a buyer uploads to their traffic source: the domain + the
  // tracking link's params (external_id dropped — sub params only).
  const trafficLink = (domainHost, params) => {
    const host = String(domainHost || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const qs = String(params || "").trim().replace(/^\?+/, "").replace(/(^|&)external_id=[^&]*/i, "").replace(/^&/, "");
    if (!host) return "";
    return `https://${host}${qs ? `?${qs}` : ""}`;
  };

  // Break a link into its Buyer | Tool | Game | Geo | Brand parts, preferring
  // the stored columns and falling back to the composed campaign name.
  const linkSegments = (link) => {
    const parts = String(link.name || "").split("|").map((s) => s.trim());
    return {
      buyer: link.buyer || parts[0] || "",
      tool: link.tool || parts[1] || "",
      game: link.game || parts[2] || "",
      geo: link.geo || parts[3] || "",
      brand: link.brand || parts[4] || "",
    };
  };
  const splitGeos = (geo) =>
    String(geo || "")
      .split(/[,/]+/)
      .map((g) => g.trim())
      .filter(Boolean);
  const countLinkFilters = (link) => {
    try {
      const cfg = typeof link.filters === "string" ? JSON.parse(link.filters) : link.filters;
      return cfg && Array.isArray(cfg.rules) ? cfg.rules.length : 0;
    } catch (e) {
      return 0;
    }
  };

  // Live performance per flow (last 7 days), keyed by Keitaro campaign name.
  // Best-effort: the tree renders without it; the strip appears when it lands.
  const [flowLive, setFlowLive] = React.useState(null); // { rows, today }
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 14 days: the last 7 drive the strip, the 7 before them the trend.
        const from = new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10);
        const response = await apiFetch(`/api/keitaro/live-stats?from=${from}`);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setFlowLive({
            rows: Array.isArray(data?.rows) ? data.rows : [],
            // The tracker's "today" (server range end), not the browser's.
            today: data?.range?.to || new Date().toISOString().slice(0, 10),
          });
        }
      } catch (error) {
        /* stats strip is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // campaign name (normalized) → { today, week, prev, series }. `series` is
  // the 7-day unique-clicks curve behind the sparkline (oldest first) and
  // `prev` the week before it, which gives the 7-day block its trend.
  const flowStatsByName = React.useMemo(() => {
    if (!flowLive) return null;
    const norm = (v) => String(v || "").trim().toLowerCase();
    const blank = () => ({ uniques: 0, registers: 0, ftds: 0, revenue: 0 });
    // Fixed axis ending on the tracker's today, so every sparkline spans the
    // same window even when a flow has gaps.
    const end = new Date(`${flowLive.today}T00:00:00Z`);
    const axis = [];
    for (let i = 6; i >= 0; i -= 1) {
      axis.push(new Date(end.getTime() - i * 86400000).toISOString().slice(0, 10));
    }
    const axisIndex = new Map(axis.map((day, i) => [day, i]));
    const prevFrom = new Date(end.getTime() - 13 * 86400000).toISOString().slice(0, 10);
    const map = new Map();
    flowLive.rows.forEach((row) => {
      const key = norm(row.campaign || row.campaign_name);
      if (!key) return;
      if (!map.has(key)) map.set(key, { today: blank(), week: blank(), prev: blank(), series: axis.map(() => 0) });
      const entry = map.get(key);
      const add = (acc) => {
        acc.uniques += Number(row.unique_clicks) || 0;
        acc.registers += Number(row.registers) || 0;
        acc.ftds += Number(row.ftds) || 0;
        acc.revenue += Number(row.revenue) || 0;
      };
      const day = String(row.date || "").slice(0, 10);
      const slot = axisIndex.get(day);
      if (slot !== undefined) {
        add(entry.week);
        entry.series[slot] += Number(row.unique_clicks) || 0;
        if (day === flowLive.today) add(entry.today);
      } else if (day >= prevFrom) {
        add(entry.prev);
      }
    });
    return map;
  }, [flowLive]);

  const fetchAll = React.useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      const [lr, dr, pr] = await Promise.all([
        apiFetch("/api/tracking-links?limit=500"),
        apiFetch("/api/domains?limit=5000"),
        apiFetch("/api/pixels?limit=1000"),
      ]);
      const [ld, dd, pd] = await Promise.all([lr.json(), dr.json(), pr.json()]);
      if (!lr.ok) throw new Error(ld?.error || "Failed to load links.");
      setLinks(Array.isArray(ld) ? ld : []);
      setDomains(Array.isArray(dd) ? dd : []);
      setPixels(Array.isArray(pd) ? pd : []);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error.message || "Failed to load flows." });
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Arriving from Health's "Fix it": open already filtered to the broken
  // flows, so the work list and the work are the same list.
  React.useEffect(() => {
    let pending = null;
    try {
      pending = sessionStorage.getItem("pending-health-filter");
      if (pending) sessionStorage.removeItem("pending-health-filter");
    } catch {
      /* ignore */
    }
    if (pending) setFilters({ ...EMPTY_FLOW_FILTERS, flags: [pending] });
     
  }, []);

  // domain host (lowercased) → pixels attached via their flows list
  const pixelsByDomain = React.useMemo(() => {
    const map = new Map();
    pixels.forEach((pixel) => {
      normalizeDomainInputList(pixel.flows).forEach((host) => {
        if (!map.has(host)) map.set(host, []);
        map.get(host).push(pixel);
      });
    });
    return map;
  }, [pixels]);

  // A domain can be bound to several links (tracking_link_ids from the join
  // table); the single tracking_link_id is the legacy fallback for old rows.
  const domainLinkIds = (d) => {
    const list = Array.isArray(d.tracking_link_ids)
      ? d.tracking_link_ids
      : d.tracking_link_id
        ? [d.tracking_link_id]
        : [];
    return list.map(Number).filter(Boolean);
  };

  const domainsByLink = React.useMemo(() => {
    const map = new Map();
    domains.forEach((d) => {
      domainLinkIds(d).forEach((linkId) => {
        if (!map.has(linkId)) map.set(linkId, []);
        map.get(linkId).push(d);
      });
    });
    return map;
  }, [domains]);

  const unboundDomains = React.useMemo(
    () => domains.filter((d) => domainLinkIds(d).length === 0),
    [domains]
  );

  const pixelCountForLink = React.useCallback(
    (link) =>
      (domainsByLink.get(link.id) || []).reduce(
        (acc, d) => acc + (pixelsByDomain.get(String(d.domain || "").toLowerCase()) || []).length,
        0
      ),
    [domainsByLink, pixelsByDomain]
  );

  // Everything a filter or the search box can match, computed once per link.
  const flowFacts = React.useMemo(() => {
    const map = new Map();
    links.forEach((link) => {
      const seg = linkSegments(link);
      const linkDomains = domainsByLink.get(link.id) || [];
      const hosts = linkDomains.map((d) => String(d.domain || "").toLowerCase()).filter(Boolean);
      const flowPixels = hosts.flatMap((host) => pixelsByDomain.get(host) || []);
      // A flow's geo is its own segment plus every country its domains target.
      const countries = new Set();
      [...splitGeos(seg.geo), ...linkDomains.flatMap((d) => normalizeCountryListValue(d.country))].forEach((g) => {
        const iso = resolveCountryIso(g);
        if (iso) countries.add(iso);
      });
      const stats = flowStatsByName?.get(String(link.name || "").trim().toLowerCase()) || null;
      map.set(link.id, {
        buyer: String(seg.buyer || "").trim(),
        brand: String(seg.brand || "").trim(),
        countries: [...countries],
        hosts,
        pixelIds: flowPixels.map((p) => String(p.pixel_id || "")),
        paused: String(link.state || "active") !== "active",
        inKeitaro: String(link.keitaro_status || "") === "created" || !!link.keitaro_id,
        domainCount: linkDomains.length,
        pixelCount: flowPixels.length,
        weekUniques: stats ? stats.week.uniques : 0,
        haystack: [link.name, link.alias, link.url, seg.tool, seg.game, seg.brand, ...hosts, ...flowPixels.map((p) => p.pixel_id)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      });
    });
    return map;
  }, [links, domainsByLink, pixelsByDomain, flowStatsByName]);

  // The whole flow, flattened: a link is only useful alongside the domains
  // bound to it and the pixels attached to those, which is precisely what is
  // tedious to assemble by hand from three registries.
  const exportFlows = () => {
    downloadCsv(
      `flows-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Flow", "Buyer", "Brand", "GEO", "Domains", "Pixels", "State", "In Keitaro", "Uniques 7d", "URL"],
      filteredLinks.map((link) => {
        const facts = flowFacts.get(link.id) || {};
        return [
          link?.name || "",
          facts.buyer || "",
          facts.brand || "",
          (facts.countries || []).join(" | "),
          (facts.hosts || []).join(" | "),
          (facts.pixelIds || []).join(" | "),
          facts.paused ? "Paused" : "Active",
          facts.inKeitaro ? "Yes" : "No",
          facts.weekUniques ?? 0,
          link?.url || "",
        ];
      })
    );
  };

  // Option lists are built from the flows on screen, each with its own count,
  // so a picker never offers a value that matches nothing.
  const optionsFrom = React.useCallback((pick, decorate) => {
    const counts = new Map();
    links.forEach((link) => {
      const facts = flowFacts.get(link.id);
      if (!facts) return;
      const values = pick(facts);
      (Array.isArray(values) ? values : [values]).filter(Boolean).forEach((value) => {
        counts.set(value, (counts.get(value) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
      .map(([value, count]) => ({ value, count, ...(decorate ? decorate(value, count) : {}) }));
  }, [links, flowFacts]);

  const buyerOptions = React.useMemo(
    () => optionsFrom((f) => f.buyer, (v, c) => ({ label: `${v}  ·  ${c}`, search: v, dot: "#36d07c" })),
    [optionsFrom]
  );
  const countryOptionsForFlows = React.useMemo(
    () => optionsFrom((f) => f.countries, (v, c) => ({ label: `${countryNameFromIso(v) || v}  ·  ${c}`, search: `${v} ${countryNameFromIso(v) || ""}` })),
    [optionsFrom]
  );
  const domainOptionsForFlows = React.useMemo(
    () => optionsFrom((f) => f.hosts, (v, c) => ({ label: c > 1 ? `${v}  ·  ${c}` : v, search: v, dot: "#6ad6ff" })),
    [optionsFrom]
  );
  const brandOptions = React.useMemo(
    () => optionsFrom((f) => f.brand, (v, c) => ({ label: `${v}  ·  ${c}`, search: v })),
    [optionsFrom]
  );

  // Health flags — the "what's broken / what's alive" cut of the list.
  const FLOW_FLAGS = React.useMemo(
    () => [
      { value: "no-domains", label: t("No domains"), match: (f) => f.domainCount === 0, tone: "warn" },
      { value: "no-pixels", label: t("No pixels"), match: (f) => f.pixelCount === 0, tone: "warn" },
      { value: "live", label: t("Traffic in 7d"), match: (f) => f.weekUniques > 0, tone: "good" },
      { value: "idle", label: t("No traffic in 7d"), match: (f) => f.weekUniques === 0, tone: "muted" },
      { value: "paused", label: t("Paused"), match: (f) => f.paused, tone: "muted" },
      { value: "local", label: t("Not in Keitaro"), match: (f) => !f.inKeitaro, tone: "warn" },
    ],
    [t]
  );
  const flagCounts = React.useMemo(() => {
    const counts = new Map(FLOW_FLAGS.map((flag) => [flag.value, 0]));
    links.forEach((link) => {
      const facts = flowFacts.get(link.id);
      if (!facts) return;
      FLOW_FLAGS.forEach((flag) => {
        if (flag.match(facts)) counts.set(flag.value, counts.get(flag.value) + 1);
      });
    });
    return counts;
  }, [links, flowFacts, FLOW_FLAGS]);

  const filteredLinks = React.useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const buyers = canFilterByBuyer ? filters.buyers.map((b) => b.toLowerCase()) : [];
    if (!query && !buyers.length && !filters.countries.length && !filters.domains.length && !filters.brands.length && !filters.flags.length) {
      return links;
    }
    const activeFlags = FLOW_FLAGS.filter((flag) => filters.flags.includes(flag.value));
    return links.filter((link) => {
      const facts = flowFacts.get(link.id);
      if (!facts) return false;
      if (query && !facts.haystack.includes(query)) return false;
      if (buyers.length && !buyers.includes(facts.buyer.toLowerCase())) return false;
      // Dimension pickers are OR within a dimension, AND across dimensions.
      if (filters.countries.length && !filters.countries.some((iso) => facts.countries.includes(iso))) return false;
      if (filters.domains.length && !filters.domains.some((host) => facts.hosts.includes(host))) return false;
      if (filters.brands.length && !filters.brands.includes(facts.brand)) return false;
      // Flags stack the other way — every one picked must hold.
      if (activeFlags.length && !activeFlags.every((flag) => flag.match(facts))) return false;
      return true;
    });
  }, [links, filters, canFilterByBuyer, flowFacts, FLOW_FLAGS]);

  const sortedLinks = React.useMemo(() => {
    const arr = [...filteredLinks];
    const domainCount = (l) => (domainsByLink.get(l.id) || []).length;
    const byRecent = (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0);
    arr.sort((a, b) => {
      if (sortBy === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sortBy === "buyer")
        return (
          String(linkSegments(a).buyer).localeCompare(String(linkSegments(b).buyer)) ||
          byRecent(a, b)
        );
      if (sortBy === "domains") return domainCount(b) - domainCount(a) || byRecent(a, b);
      if (sortBy === "pixels") return pixelCountForLink(b) - pixelCountForLink(a) || byRecent(a, b);
      // recent (default): active links first, then newest created
      const av = String(a.state || "active") === "active" ? 0 : 1;
      const bv = String(b.state || "active") === "active" ? 0 : 1;
      return av - bv || byRecent(a, b);
    });
    return arr;
  }, [filteredLinks, sortBy, domainsByLink, pixelCountForLink]);

  const SORT_OPTIONS = [
    { value: "recent", label: t("Newest first") },
    { value: "buyer", label: t("Buyer A–Z") },
    { value: "name", label: t("Campaign A–Z") },
    { value: "domains", label: t("Most domains") },
    { value: "pixels", label: t("Most pixels") },
  ];

  const openBind = (link) => {
    const current = (domainsByLink.get(link.id) || []).map((d) => String(d.id));
    setBindModal({ open: true, link, saving: false, error: null, selected: current });
  };
  const toggleBindDomain = (domainId) => {
    setBindModal((prev) => {
      const id = String(domainId);
      const has = prev.selected.includes(id);
      return { ...prev, selected: has ? prev.selected.filter((x) => x !== id) : [...prev.selected, id] };
    });
  };
  const saveBind = async () => {
    if (!bindModal.link) return;
    setBindModal((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const linkId = bindModal.link.id;
      const response = await apiFetch(`/api/tracking-links/${linkId}/domains`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainIds: bindModal.selected }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to bind domains.");
      }
      setBindModal({ open: false, link: null, saving: false, error: null, selected: [] });
      await fetchAll();
    } catch (error) {
      setBindModal((prev) => ({ ...prev, saving: false, error: error.message || "Failed to bind domains." }));
    }
  };

  // ── Edit Flow ──────────────────────────────────────────────────────
  // Everything a flow is, in one dialog: the campaign segments and offer,
  // its Keitaro state, the domains bound to it and the pixels on each.
  // Segments/offer/state/domains save together; pixel wiring applies on
  // click, because it writes to the pixel record rather than the link.
  const EMPTY_FLOW_EDIT_FORM = { buyer: "", game: "", geo: "", brand: "", offerId: "", state: "active", domainIds: [] };
  const [flowEdit, setFlowEdit] = React.useState({ open: false, link: null, saving: false, error: null, form: EMPTY_FLOW_EDIT_FORM });
  const [ktOffers, setKtOffers] = React.useState({ loaded: false, list: [] });
  const [pixelWire, setPixelWire] = React.useState({ busy: null, error: null });

  const openFlowEdit = (link) => {
    setFlowEdit({
      open: true,
      link,
      saving: false,
      error: null,
      form: {
        buyer: link.buyer || linkSegments(link).buyer || "",
        game: link.game || linkSegments(link).game || "",
        geo: link.geo || linkSegments(link).geo || "",
        brand: link.brand || linkSegments(link).brand || "",
        offerId: String(link.offerId ?? link.offer_id ?? ""),
        state: String(link.state || "active") === "active" ? "active" : "disabled",
        domainIds: (domainsByLink.get(link.id) || []).map((d) => String(d.id)),
      },
    });
    setPixelWire({ busy: null, error: null });
    // Offers only matter once someone opens the editor — fetch them then.
    if (!ktOffers.loaded) {
      (async () => {
        try {
          const response = await apiFetch("/api/keitaro/resources");
          const data = await response.json().catch(() => ({}));
          setKtOffers({ loaded: true, list: Array.isArray(data?.offers) ? data.offers : [] });
        } catch (error) {
          setKtOffers({ loaded: true, list: [] });
        }
      })();
    }
  };
  const closeFlowEdit = () => setFlowEdit({ open: false, link: null, saving: false, error: null, form: EMPTY_FLOW_EDIT_FORM });
  const updateFlowEdit = (key) => (value) => setFlowEdit((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));

  // The name Keitaro will carry after saving — "-" marks a deliberate gap.
  const flowEditName = React.useMemo(() => {
    if (!flowEdit.link) return "";
    const seg = (v) => String(v || "").trim() || "-";
    const f = flowEdit.form;
    return [seg(f.buyer), seg(flowEdit.link.tool || linkSegments(flowEdit.link).tool), seg(f.game), seg(f.geo), seg(f.brand)].join(" | ");
  }, [flowEdit.link, flowEdit.form]);

  const saveFlowEdit = async () => {
    const link = flowEdit.link;
    if (!link) return;
    const f = flowEdit.form;
    setFlowEdit((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const before = {
        buyer: link.buyer || linkSegments(link).buyer || "",
        game: link.game || linkSegments(link).game || "",
        geo: link.geo || linkSegments(link).geo || "",
        brand: link.brand || linkSegments(link).brand || "",
        offerId: String(link.offerId ?? link.offer_id ?? ""),
      };
      const identityChanged = ["buyer", "game", "geo", "brand", "offerId"].some((k) => String(f[k] || "") !== String(before[k] || ""));
      // The endpoint routes on which keys are present, so identity and state
      // have to go as two calls.
      if (identityChanged) {
        await apiJson(`/api/tracking-links/${link.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyer: f.buyer, game: f.game, geo: f.geo, brand: f.brand, offerId: f.offerId }),
        }, "Failed to save the campaign.");
      }
      const stateBefore = String(link.state || "active") === "active" ? "active" : "disabled";
      if (f.state !== stateBefore) {
        await apiJson(`/api/tracking-links/${link.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: f.state }),
        }, "Failed to change the state.");
      }
      const domainsBefore = (domainsByLink.get(link.id) || []).map((d) => String(d.id));
      const sameDomains =
        domainsBefore.length === f.domainIds.length && domainsBefore.every((id) => f.domainIds.includes(id));
      if (!sameDomains) {
        const data = await apiJson(`/api/tracking-links/${link.id}/domains`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domainIds: f.domainIds }),
        }, "Failed to save the domains.");
      }
      await fetchAll();
      closeFlowEdit();
    } catch (error) {
      setFlowEdit((prev) => ({ ...prev, saving: false, error: error.message || "Failed to save the flow." }));
    }
  };

  // Pixel ↔ domain wiring from inside the flow editor. Same contract as the
  // Domains registry: attachment lives on the pixel's `flows` list.
  const setPixelDomains = async (pixel, hosts, key) => {
    setPixelWire({ busy: key, error: null });
    try {
      const response = await apiFetch(`/api/pixels/${pixel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flows: hosts }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to update the pixel.");
      }
      await fetchAll();
      setPixelWire({ busy: null, error: null });
    } catch (error) {
      setPixelWire({ busy: null, error: error.message || "Failed to update the pixel." });
    }
  };
  const attachPixelToHost = (pixelId, host) => {
    const pixel = pixels.find((p) => String(p.id) === String(pixelId));
    if (!pixel || !host) return;
    setPixelDomains(pixel, Array.from(new Set([...normalizeDomainInputList(pixel.flows), host])), `attach-${pixel.id}-${host}`);
  };
  const detachPixelFromHost = (pixel, host) =>
    setPixelDomains(pixel, normalizeDomainInputList(pixel.flows).filter((h) => h !== host), `detach-${pixel.id}-${host}`);

  // Kept as a secondary escape hatch: the Tracking Links form owns the
  // pieces this dialog deliberately doesn't (params, stream filters).
  const openInTrackingLinks = (link) => {
    try {
      sessionStorage.setItem("pending-edit-campaign", String(link.name || "").trim());
    } catch {
      /* private mode — the Tracking Links search still opens */
    }
    window.dispatchEvent(new CustomEvent("dash:navigate", { detail: { view: "tracking" } }));
  };

  // Detach a single domain from a link — same replace-set endpoint as the
  // bind modal, just with this domain dropped from the list.
  const armUnbind = (key) => {
    if (unbindTimerRef.current) clearTimeout(unbindTimerRef.current);
    setUnbindArmed(key);
    unbindTimerRef.current = setTimeout(() => setUnbindArmed((prev) => (prev === key ? null : prev)), 4000);
  };
  React.useEffect(() => () => {
    if (unbindTimerRef.current) clearTimeout(unbindTimerRef.current);
  }, []);
  const unbindDomain = async (link, domain) => {
    const key = `${link.id}:${domain.id}`;
    setUnbinding(key);
    setUnbindArmed(null);
    try {
      const remaining = (domainsByLink.get(link.id) || [])
        .filter((d) => String(d.id) !== String(domain.id))
        .map((d) => String(d.id));
      const response = await apiFetch(`/api/tracking-links/${link.id}/domains`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainIds: remaining }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to unbind domain.");
      }
      await fetchAll();
    } catch (error) {
      setState((prev) => ({ ...prev, error: error.message || "Failed to unbind domain." }));
    } finally {
      setUnbinding(null);
    }
  };

  // Same option list as the bind modal, for the flow editor's domain field.
  const flowEditDomainOptions = React.useMemo(() => {
    if (!flowEdit.link) return [];
    const statusDot = (status) => {
      const s = String(status || "Active").toLowerCase();
      if (s === "active") return "#36d07c";
      if (["banned", "blocked", "expired", "dead"].includes(s)) return "#ff6b6b";
      return "#f5b83d";
    };
    const boundNow = new Set((domainsByLink.get(flowEdit.link.id) || []).map((d) => String(d.id)));
    return domains
      .map((d) => {
        const otherLinks = domainLinkIds(d).filter((id) => id !== flowEdit.link.id).length;
        const status = String(d.status || "Active");
        const parts = [d.domain];
        if (status.toLowerCase() !== "active") parts.push(t(status));
        if (otherLinks) {
          parts.push(
            otherLinks === 1 ? t("also on 1 other link") : t("also on {n} other links").replace("{n}", String(otherLinks))
          );
        }
        return {
          value: String(d.id),
          label: parts.join("  ·  "),
          search: `${d.domain} ${status}`,
          dot: statusDot(status),
          _bound: boundNow.has(String(d.id)) ? 0 : 1,
          _name: String(d.domain || ""),
        };
      })
      .sort((a, b) => a._bound - b._bound || a._name.localeCompare(b._name));
  }, [domains, domainsByLink, flowEdit.link, t]);

  const bindOptions = React.useMemo(() => {
    if (!bindModal.link) return [];
    // Every registered domain is selectable — a domain can serve several
    // links at once. Flag the ones already used elsewhere, and colour by
    // status so nobody binds a banned domain without noticing.
    const statusDot = (status) => {
      const s = String(status || "Active").toLowerCase();
      if (s === "active") return "#36d07c";
      if (["banned", "blocked", "expired", "dead"].includes(s)) return "#ff6b6b";
      return "#f5b83d";
    };
    // Already-bound domains float to the top so removing one doesn't mean
    // hunting through hundreds of rows. Ordering keys off the saved binding,
    // not the pending selection, so rows don't jump while you click.
    const boundNow = new Set((domainsByLink.get(bindModal.link.id) || []).map((d) => String(d.id)));
    return domains
      .map((d) => {
        const otherLinks = domainLinkIds(d).filter((id) => id !== bindModal.link.id).length;
        const status = String(d.status || "Active");
        const parts = [d.domain];
        if (status.toLowerCase() !== "active") parts.push(t(status));
        if (otherLinks) {
          parts.push(
            otherLinks === 1 ? t("also on 1 other link") : t("also on {n} other links").replace("{n}", String(otherLinks))
          );
        }
        return {
          value: String(d.id),
          label: parts.join("  ·  "),
          search: `${d.domain} ${status}`,
          dot: statusDot(status),
          _bound: boundNow.has(String(d.id)) ? 0 : 1,
          _name: String(d.domain || ""),
        };
      })
      .sort((a, b) => a._bound - b._bound || a._name.localeCompare(b._name));
  }, [domains, domainsByLink, bindModal.link, t]);

  return (
    <section className="form-section">
      <AnimatePresence>
        {bindModal.open ? (
          <motion.div className="modal-overlay" {...overlayMotion} onClick={() => setBindModal((p) => ({ ...p, open: false }))}>
            <motion.div
              className="modal pixel-edit-modal"
              {...dialogMotion}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Bind Domains")}</p>
                  <h2>{bindModal.link?.name}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={() => setBindModal((p) => ({ ...p, open: false }))}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field field-span-2">
                  <label>{t("PWA Domains for this tracking link")}</label>
                  <CountryDropdownPicker
                    multiple
                    removable
                    maxVisibleChips={4}
                    values={bindModal.selected}
                    onToggle={toggleBindDomain}
                    options={bindOptions}
                    placeholder={t("No domains selected")}
                    searchPlaceholder={t("Find domain")}
                    emptyResultsLabel={t("No domains available.")}
                  />
                  <p className="field-hint">{t("Bound domains sit at the top of the list. Click a row (or the ✕ on a chip) to remove it — a domain can serve several tracking links at once.")}</p>
                  {(() => {
                    const inactive = bindModal.selected
                      .map((id) => domains.find((d) => String(d.id) === id))
                      .filter((d) => d && String(d.status || "Active").toLowerCase() !== "active");
                    if (!inactive.length) return null;
                    return (
                      <p className="field-hint flow-bind-warning">
                        <AlertTriangle size={12} /> {t("Careful — these domains are not Active:")}{" "}
                        {inactive.map((d) => `${d.domain} (${t(d.status)})`).join(", ")}
                      </p>
                    );
                  })()}
                </div>
                {bindModal.error ? <div className="field field-span-2"><div className="api-status error">{bindModal.error}</div></div> : null}
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={() => setBindModal((p) => ({ ...p, open: false }))}>{t("Cancel")}</button>
                <button className="action-pill" type="button" onClick={saveBind} disabled={bindModal.saving}>
                  {bindModal.saving ? t("Saving…") : t("Save binding")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {flowEdit.open ? (
          <motion.div className="modal-overlay modal-overlay-scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeFlowEdit}>
            <motion.div
              className="modal pixel-edit-modal flow-edit-modal edit-modal-accent flow-edit-accent"
              {...dialogMotion}
              onClick={(event) => event.stopPropagation()}
            >
              {(() => {
                const link = flowEdit.link || {};
                const seg = linkSegments(link);
                const editDomains = flowEdit.form.domainIds
                  .map((id) => domains.find((d) => String(d.id) === String(id)))
                  .filter(Boolean)
                  .sort((a, b) => String(a.domain || "").localeCompare(String(b.domain || "")));
                const inKeitaro = String(link.keitaro_status || "") === "created" || !!link.keitaro_id;
                const linkUrl = link.url || `https://${String(link.domain || "")}/${String(link.alias || "")}`;
                const filterCount = countLinkFilters(link);
                return (
                  <>
                    <div className="modal-head">
                      <div>
                        <p className="modal-kicker">{t("Edit Flow")}</p>
                        <h2>{link.name}</h2>
                      </div>
                      <button className="icon-btn" type="button" onClick={closeFlowEdit}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="modal-body flow-edit-body">
                      {/* 1 — the campaign name's segments */}
                      <div className="flow-edit-section field-span-2">
                        <div className="flow-edit-section-head"><Megaphone size={13} /> {t("Campaign")}</div>
                        <p className="flow-edit-note">{t("These five segments are the campaign name. Saving renames it in Keitaro too.")}</p>
                      </div>
                      <div className="field">
                        <label>{t("Buyer")}</label>
                        {canFilterByBuyer ? (
                          <CountryDropdownPicker
                            value={flowEdit.form.buyer}
                            onChange={updateFlowEdit("buyer")}
                            options={buyerOptions.map((b) => ({ value: b.value, label: b.value, search: b.value }))}
                            allowCustom
                            placeholder={t("Select or type a buyer")}
                            searchPlaceholder={t("Find or type a buyer")}
                            emptyResultsLabel={t("Type to add a buyer.")}
                          />
                        ) : (
                          <input value={flowEdit.form.buyer} readOnly />
                        )}
                      </div>
                      <div className="field">
                        <label>{t("Tool")} <span className="field-pace-hint">{t("read-only")}</span></label>
                        <input value={seg.tool || "-"} readOnly title={t("The tool is bound to a Keitaro traffic source — change it in Tracking Links.")} />
                      </div>
                      <div className="field">
                        <label>{t("Game / Offer")}</label>
                        <input value={flowEdit.form.game} onChange={(e) => updateFlowEdit("game")(e.target.value)} placeholder="Chicken Road" />
                      </div>
                      <div className="field">
                        <label>{t("GEO")}</label>
                        <input value={flowEdit.form.geo} onChange={(e) => updateFlowEdit("geo")(e.target.value)} placeholder="BR" />
                      </div>
                      <div className="field">
                        <label>{t("Brand")}</label>
                        <input value={flowEdit.form.brand} onChange={(e) => updateFlowEdit("brand")(e.target.value)} placeholder="JASINO" />
                      </div>
                      <div className="field">
                        <label>{t("Status")}</label>
                        <div className="flow-edit-state" role="group">
                          {[
                            { value: "active", label: t("Active") },
                            { value: "disabled", label: t("Paused") },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={`flow-edit-state-btn${flowEdit.form.state === opt.value ? " is-active" : ""}`}
                              onClick={() => updateFlowEdit("state")(opt.value)}
                            >
                              {opt.value === "active" ? <Play size={12} /> : <Pause size={12} />} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="field field-span-2 flow-edit-namepreview">
                        <label>{t("New campaign name")}</label>
                        <code className={flowEditName !== link.name ? "is-changed" : ""}>{flowEditName}</code>
                      </div>

                      {/* 2 — where Keitaro sends the click */}
                      <div className="field field-span-2">
                        <label>{t("Keitaro Offer")}</label>
                        <CountryDropdownPicker
                          value={flowEdit.form.offerId}
                          onChange={(v) => updateFlowEdit("offerId")(v || "")}
                          options={ktOffers.list.map((offer) => ({
                            value: String(offer.id),
                            label: offer.country ? `${offer.name} · ${offer.country}` : offer.name,
                            search: `${offer.name} ${offer.country || ""} ${offer.id}`,
                          }))}
                          placeholder={
                            !ktOffers.loaded ? t("Loading...") : ktOffers.list.length ? t("Select an offer") : t("No offers loaded from Keitaro")
                          }
                          searchPlaceholder={t("Type to find offers")}
                          emptyResultsLabel={t("No offers found.")}
                        />
                        <p className="field-hint">{t("Saving rebinds the campaign's stream in Keitaro to this offer. Traffic follows it immediately.")}</p>
                      </div>

                      {/* 3 — the domains this flow runs on */}
                      <div className="flow-edit-section field-span-2">
                        <div className="flow-edit-section-head"><Globe size={13} /> {t("PWA domains")}<span className="flow-edit-count">{editDomains.length}</span></div>
                      </div>
                      <div className="field field-span-2">
                        <CountryDropdownPicker
                          multiple
                          removable
                          maxVisibleChips={4}
                          values={flowEdit.form.domainIds}
                          onToggle={(value) =>
                            setFlowEdit((prev) => ({
                              ...prev,
                              form: {
                                ...prev.form,
                                domainIds: prev.form.domainIds.includes(value)
                                  ? prev.form.domainIds.filter((x) => x !== value)
                                  : [...prev.form.domainIds, value],
                              },
                            }))
                          }
                          options={flowEditDomainOptions}
                          placeholder={t("No domains selected")}
                          searchPlaceholder={t("Find domain")}
                          emptyResultsLabel={t("No domains available.")}
                        />
                        <p className="field-hint">{t("Bound domains sit at the top of the list. Click a row (or the ✕ on a chip) to remove it — a domain can serve several tracking links at once.")}</p>
                      </div>

                      {/* 4 — pixels, per bound domain */}
                      <div className="flow-edit-section field-span-2">
                        <div className="flow-edit-section-head">
                          <Zap size={13} /> {t("Pixels")}
                          <span className="field-pace-hint">{t("applied immediately")}</span>
                        </div>
                      </div>
                      <div className="field field-span-2 flow-edit-pixels">
                        {editDomains.length === 0 ? (
                          <p className="flow-edit-empty">{t("Bind a domain first — pixels attach to domains, not to the link.")}</p>
                        ) : (
                          editDomains.map((domain) => {
                            const host = String(domain.domain || "").toLowerCase();
                            const attached = [...(pixelsByDomain.get(host) || [])].sort((a, b) =>
                              String(a.pixel_id || "").localeCompare(String(b.pixel_id || ""), undefined, { numeric: true })
                            );
                            const attachedIds = new Set(attached.map((p) => String(p.id)));
                            const free = pixels.filter((p) => !attachedIds.has(String(p.id)));
                            const saved = (domainsByLink.get(link.id) || []).some((d) => String(d.id) === String(domain.id));
                            return (
                              <div className="flow-edit-domain" key={domain.id}>
                                <div className="flow-edit-domain-head">
                                  <Globe size={12} />
                                  <span className="flow-edit-domain-name">{domain.domain}</span>
                                  <span className={`accounts-status-pill acc-st-${String(domain.status || "Active").toLowerCase()}`}>{t(domain.status || "Active")}</span>
                                  {!saved ? <span className="flow-edit-pending">{t("binds on save")}</span> : null}
                                </div>
                                <div className="flow-edit-pixelrow">
                                  {attached.length ? (
                                    attached.map((pixel) => {
                                      const busy = pixelWire.busy === `detach-${pixel.id}-${host}`;
                                      return (
                                        <span className="flow-edit-pixel" key={pixel.id} title={pixel.comment || ""}>
                                          <span className={`flow-pixel-dot${String(pixel.status || "Active").toLowerCase() === "active" ? " is-active" : " is-off"}`} />
                                          <span className="flow-edit-pixel-id">{pixel.pixel_id}</span>
                                          <CountryFlag value={normalizeCountryListValue(pixel.geo)[0]} className="flow-pixel-flag" />
                                          <button
                                            type="button"
                                            className="flow-edit-pixel-remove"
                                            disabled={!!pixelWire.busy || !saved}
                                            title={saved ? t("Remove this pixel from the domain") : t("Save the binding first")}
                                            aria-label={t("Remove this pixel from the domain")}
                                            onClick={() => detachPixelFromHost(pixel, host)}
                                          >
                                            {busy ? "…" : <X size={11} />}
                                          </button>
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="flow-edit-nopixel">{t("No pixels yet")}</span>
                                  )}
                                  <Select
                                    className="flow-edit-attach"
                                    value=""
                                    onChange={(value) => attachPixelToHost(value, host)}
                                    options={free.map((p) => ({
                                      value: String(p.id),
                                      label: `${p.pixel_id}${normalizeCountryListValue(p.geo).length ? ` · ${normalizeCountryListValue(p.geo).join(", ")}` : ""}`,
                                    }))}
                                    placeholder={free.length ? t("Attach a pixel…") : t("Every pixel is already attached")}
                                    searchPlaceholder={t("Find pixel")}
                                    emptyResultsLabel={t("No pixels found.")}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                        {pixelWire.error ? <div className="pw-error">{pixelWire.error}</div> : null}
                      </div>

                      {/* 5 — what changed here, and who changed it */}
                      <div className="flow-edit-section field-span-2">
                        <div className="flow-edit-section-head"><ScrollText size={13} /> {t("History")}</div>
                      </div>
                      <div className="field field-span-2">
                        <EntityHistory type="tracking_link" id={link.id} limit={6} />
                      </div>

                      {/* 6 — the parts that are facts, not settings */}
                      <div className="field field-span-2 flow-edit-facts">
                        <div className="flow-edit-fact">
                          <span>{t("Tracking link")}</span>
                          <button type="button" className="flow-edit-copy" onClick={copyValue(`edit-${link.id}`, linkUrl)}>
                            <code>{`${String(link.domain || "")}/${String(link.alias || "")}`}</code>
                            {copied === `edit-${link.id}` ? <CheckCircle size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div className="flow-edit-fact">
                          <span>{t("Keitaro")}</span>
                          <strong>{inKeitaro ? `#${link.keitaro_id}` : t("Local only")}</strong>
                        </div>
                        <div className="flow-edit-fact">
                          <span>{t("Filters")}</span>
                          <strong>{filterCount ? `${filterCount} ${filterCount === 1 ? t("rule") : t("rules")}` : t("None")}</strong>
                        </div>
                        <div className="flow-edit-fact">
                          <span>{t("Created")}</span>
                          <strong>{link.created_at ? new Date(link.created_at).toLocaleDateString() : "—"}</strong>
                        </div>
                      </div>

                      {flowEdit.error ? <div className="field field-span-2"><div className="api-status error">{flowEdit.error}</div></div> : null}
                    </div>
                    <div className="modal-actions modal-actions-split">
                      <button type="button" className="flow-edit-external" onClick={() => openInTrackingLinks(link)}>
                        <ExternalLink size={13} /> {t("Params & filters in Tracking Links")}
                      </button>
                      <div className="flow-edit-actions-right">
                        <button className="ghost" type="button" onClick={closeFlowEdit}>{t("Cancel")}</button>
                        <button className="action-pill" type="button" onClick={saveFlowEdit} disabled={flowEdit.saving}>
                          {flowEdit.saving ? t("Saving…") : t("Save changes")}
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {detail.open ? (
          <motion.div className="modal-overlay" {...overlayMotion} onClick={() => setDetail({ open: false, link: null, domain: null, pixels: [] })}>
            <motion.div
              className="modal flow-detail-modal"
              {...dialogMotion}
              onClick={(event) => event.stopPropagation()}
            >
              {(() => {
                const link = detail.link || {};
                const dom = detail.domain || {};
                const pxs = detail.pixels || [];
                const geo = (dom.countries && dom.countries.length ? dom.countries : [dom.country]).filter(Boolean).join(", ") || link.geo || "—";
                const tracker = link.url || "";
                const finalLink = trafficLink(dom.domain, link.params);
                const seg = linkSegments(link);
                const geoList = normalizeCountryListValue(dom.country).length
                  ? normalizeCountryListValue(dom.country)
                  : splitGeos(seg.geo);
                const geoReadable = geoList.join(", ") || geo || "—";
                const inKeitaro = String(link.keitaro_status || "") === "created" || !!link.keitaro_id;
                const isActive = String(dom.status || "Active").toLowerCase() === "active";
                const filterCount = countLinkFilters(link);
                const createdAt = link.created_at ? new Date(link.created_at).toLocaleString() : "—";
                return (
                  <>
                    <div className="modal-head">
                      <div>
                        <p className="modal-kicker">{t("Detailed information")}</p>
                        <h2>{dom.domain || link.name}</h2>
                      </div>
                      <button className="icon-btn" type="button" onClick={() => setDetail({ open: false, link: null, domain: null, pixels: [] })}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="modal-body flow-detail-body">
                      {/* Identity summary — same chip language as the list entry */}
                      <div className="flow-detail-summary">
                        <span className="flow-detail-buyer">
                          <span className={`flow-state-dot${isActive ? " is-active" : " is-off"}`} />
                          {seg.buyer || t("Unassigned")}
                        </span>
                        {seg.tool ? <span className="flow-seg flow-seg-tool">{resolveBrandLogo(seg.tool) ? <BrandMark value={seg.tool} height={13} /> : <><Megaphone size={11} /> {seg.tool}</>}</span> : null}
                        {(dom.game || seg.game) ? <span className="flow-seg flow-seg-game"><Target size={11} /> {dom.game || seg.game}</span> : null}
                        {geoList.length ? (
                          <span className="flow-seg flow-seg-geo">
                            {geoList.map((g) => <CountryFlag key={g} value={g} />)}
                            {geoReadable}
                          </span>
                        ) : null}
                        {seg.brand ? <span className="flow-seg flow-seg-brand"><Tag size={11} /> {seg.brand}</span> : null}
                        <span className={`flow-kt${inKeitaro ? " is-live" : " is-local"}`}>
                          <span className="flow-kt-dot" />
                          {inKeitaro ? (
                            <><img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" />{link.keitaro_id ? ` #${link.keitaro_id}` : ""}</>
                          ) : t("Local")}
                        </span>
                      </div>

                      {/* Grouped, scannable detail */}
                      <div className="flow-detail-groups">
                        <section className="flow-detail-card">
                          <div className="flow-detail-card-head"><Link2 size={13} /> {t("Campaign")}</div>
                          <div className="flow-detail-list">
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Alias")}</span><span className="flow-detail-val is-mono">{link.alias || "—"}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Keitaro")}</span><span className="flow-detail-val">{link.keitaro_id ? <><img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" /> <span className="flow-detail-code">#{link.keitaro_id}</span> · {t(link.state || "active")}</> : t("Local only")}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Owner")}</span><span className="flow-detail-val">{link.owner_name || dom.owner_name || "—"}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Created")}</span><span className="flow-detail-val">{createdAt}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Filters")}</span><span className="flow-detail-val">{filterCount ? `${filterCount} ${filterCount === 1 ? t("rule") : t("rules")}` : t("None")}</span></div>
                          </div>
                        </section>
                        <section className="flow-detail-card">
                          <div className="flow-detail-card-head"><Globe size={13} /> {t("Domain & targeting")}</div>
                          <div className="flow-detail-list">
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("PWA domain")}</span><span className="flow-detail-val is-mono">{dom.domain || "—"}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Platform")}</span><span className="flow-detail-val"><BrandMark value={dom.platform} height={14} /></span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Application / Game")}</span><span className="flow-detail-val">{dom.game || seg.game || "—"}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("GEO")}</span><span className="flow-detail-val flow-detail-geoval">{geoList.map((g) => <CountryFlag key={g} value={g} />)}{geoReadable}</span></div>
                            <div className="flow-detail-row"><span className="flow-detail-key">{t("Status")}</span><span className="flow-detail-val"><span className={`accounts-status-pill acc-st-${String(dom.status || "Active").toLowerCase()}`}>{t(dom.status || "Active")}</span></span></div>
                          </div>
                        </section>
                      </div>

                      {/* Keitaro tracking URL */}
                      <div className="flow-detail-urlblock">
                        <div className="flow-detail-urlhead">
                          <span className="flow-detail-urllabel"><Link2 size={12} /> {t("Tracking link (Keitaro)")}</span>
                          {tracker ? (
                            <button className="flow-copy-btn" type="button" onClick={copyValue("tracker", tracker)}>
                              {copied === "tracker" ? <><CheckCircle size={12} /> {t("Copied")}</> : <><Copy size={12} /> {t("Copy")}</>}
                            </button>
                          ) : null}
                        </div>
                        <code className="flow-detail-url">{tracker || "—"}</code>
                      </div>

                      {/* Pixels */}
                      <section className="flow-detail-card">
                        <div className="flow-detail-card-head">
                          <Zap size={13} /> {t("Pixels on this domain")}
                          <span className="flow-detail-count">{pxs.length}</span>
                        </div>
                        {pxs.length ? (
                          <div className="flow-detail-pixels">
                            {pxs.map((p) => {
                              const pxActive = String(p.status || "Active").toLowerCase() === "active";
                              return (
                                <div className="flow-detail-pixel" key={p.id}>
                                  <span className={`flow-pixel-dot${pxActive ? " is-active" : " is-off"}`} />
                                  <span className="flow-detail-pixid">{p.pixel_id}</span>
                                  <CountryFlag value={p.geo} className="flow-pixel-flag" />
                                  <code className="flow-detail-token" title={p.token_eaag}>{maskToken(p.token_eaag)}</code>
                                  <button className="icon-btn flow-detail-copy" type="button" onClick={copyValue(`tok-${p.id}`, p.token_eaag)} title={t("Copy token")}>
                                    {copied === `tok-${p.id}` ? <CheckCircle size={13} /> : <Copy size={13} />}
                                  </button>
                                  {p.comment ? <span className="flow-detail-pixel-note">{p.comment}</span> : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="flow-detail-empty">{t("No pixels attached to this domain yet.")}</p>
                        )}
                      </section>

                      {/* The link the buyer uploads to their traffic source */}
                      <div className="flow-final-link">
                        <div className="flow-final-head">
                          <span>{t("Final link for traffic upload")}</span>
                          <button className="ghost" type="button" onClick={copyValue("final", finalLink)} disabled={!finalLink}>
                            {copied === "final" ? <><CheckCircle size={13} /> {t("Copied")}</> : <><Copy size={13} /> {t("Copy")}</>}
                          </button>
                        </div>
                        <code className="flow-final-url">{finalLink || t("Bind a PWA domain to see the upload link.")}</code>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {flowViz.open ? (
          <motion.div className="modal-overlay" {...overlayMotion} onClick={() => setFlowViz({ open: false, link: null })}>
            <motion.div
              className="modal traffic-flow-modal"
              {...dialogMotion}
              onClick={(event) => event.stopPropagation()}
            >
              {(() => {
                const link = flowViz.link || {};
                const linkDomains = link._domains || [];
                const pbd = link._pixelsByDomain || new Map();
                const allPixels = linkDomains.flatMap((d) => pbd.get(String(d.domain || "").toLowerCase()) || []);
                const filterCfg = (() => {
                  try {
                    const cfg = typeof link.filters === "string" ? JSON.parse(link.filters) : link.filters;
                    return cfg && Array.isArray(cfg.rules) ? cfg : { logic: "and", rules: [] };
                  } catch (e) {
                    return { logic: "and", rules: [] };
                  }
                })();
                const steps = [
                  {
                    key: "source", accent: "#36d07c", Icon: Megaphone,
                    title: t("Traffic Source"),
                    value: link.tool ? (resolveBrandLogo(link.tool) ? <BrandMark value={link.tool} height={18} /> : link.tool) : t("Your ad tool"),
                    desc: t("You buy traffic here and upload the PWA domain link to your ads."),
                  },
                  {
                    key: "pwa", accent: "#64b8ff", Icon: Globe,
                    title: t("PWA Domain"),
                    value: linkDomains.length ? linkDomains.map((d) => d.domain).join(", ") : t("No domain bound yet"),
                    desc: t("Visitors land on the PWA domain. Your Meta pixel fires here and reports the visit."),
                    chips: allPixels.map((p) => `#${p.pixel_id}`),
                  },
                  {
                    key: "tracker", accent: "#a15bff", Icon: Link2,
                    title: t("Tracking Link (Keitaro)"),
                    value: `${String(link.domain || "")}/${String(link.alias || "")}`,
                    desc: filterCfg.rules.length
                      ? t("Keitaro receives the click and applies your filters before routing.")
                      : t("Keitaro receives the click and routes it to the offer."),
                    chips: filterCfg.rules.map((r) => `${(TRACKING_FILTER_BY_NAME[r.name]?.label || r.name)} ${r.mode === "reject" ? "≠" : "="} ${(r.payload || []).join(",") || "✓"}`),
                  },
                  {
                    key: "offer", accent: "#36d07c", Icon: Target,
                    title: t("Offer"),
                    value: link.game || t("Your offer"),
                    desc: t("The visitor is redirected to the offer page — conversions flow back to your pixel."),
                  },
                ];
                return (
                  <>
                    <div className="modal-head traffic-flow-head">
                      <div className="traffic-flow-titlewrap">
                        <p className="modal-kicker">{t("Traffic Flow")}</p>
                        {(() => {
                          const parts = String(link.name || "").split("|").map((s) => s.trim()).filter(Boolean);
                          return (
                            <>
                              <h2>{parts[0] || link.name || t("Flow")}</h2>
                              {parts.length > 1 ? (
                                <div className="traffic-flow-tags">
                                  {parts.slice(1).map((p, i) => (
                                    <span className="traffic-flow-tag" key={i}>{p}</span>
                                  ))}
                                </div>
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                      <button className="icon-btn" type="button" onClick={() => setFlowViz({ open: false, link: null })}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="modal-body traffic-flow-body">
                      <p className="traffic-flow-intro">{t("How your traffic moves, step by step:")}</p>
                      <div className="traffic-steps">
                        {steps.map((step, i) => (
                          <div className="traffic-step" key={step.key} style={{ "--tf-accent": step.accent }}>
                            <div className="traffic-step-rail">
                              <span className="traffic-step-num"><step.Icon size={15} /></span>
                              {i < steps.length - 1 ? <span className="traffic-step-line" /> : null}
                            </div>
                            <div className="traffic-step-card">
                              <div className="traffic-step-title">{step.title}</div>
                              <div className="traffic-step-value">{step.value}</div>
                              <div className="traffic-step-desc">{step.desc}</div>
                              {step.chips && step.chips.length ? (
                                <div className="traffic-step-chips">
                                  {step.chips.map((c, ci) => (
                                    <span className="traffic-step-chip" key={ci}>{c}</span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div className="panel registry-dashboard-panel flows-registry-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION.settle, ease: EASE }}>
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-icon-badge"><FlowsIcon size={20} /></span>
            <div>
              <h2 className="panel-title">{t("My Flows")}</h2>
              <p className="panel-subtitle">
                {t("Tracking link → PWA domains → pixels. Bind your domains to a link, then attach pixels to each domain.")}
              </p>
            </div>
          </div>
          <div className="panel-head-actions">
            <span className="roles-count">
              {filteredLinks.length === links.length
                ? `${links.length} ${t("links")}`
                : `${filteredLinks.length} / ${links.length} ${t("links")}`}
            </span>
            {/* Adopting a campaign assigns its owner, so this is leadership-only
                (the endpoint enforces it too). */}
            {canFilterByBuyer ? (
              <button
                type="button"
                className="ghost registry-export-btn"
                onClick={() => setImportOpen(true)}
                title={t("Add flows for campaigns that already exist in Keitaro")}
              >
                <ImportIcon size={13} /> {t("Import from Keitaro")}
              </button>
            ) : null}
            <button
              type="button"
              className="ghost registry-export-btn"
              onClick={exportFlows}
              disabled={!filteredLinks.length}
              title={t("Download what is on screen, filters and all")}
            >
              <Download size={13} /> {t("Export")}
            </button>
          </div>
        </div>

        {links.length ? (
          <>
            <div className="pixel-table-toolbar flow-toolbar">
              <div className="field registry-search-field">
                <label>{t("Search")}</label>
                <div className="registry-search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder={t("Campaign, alias, domain or pixel…")}
                  />
                  {filters.search ? (
                    <button type="button" className="registry-search-clear" onClick={() => setFilters((prev) => ({ ...prev, search: "" }))} aria-label={t("Clear search")}>
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
              {canFilterByBuyer && buyerOptions.length ? (
                <div className="field">
                  <label>{t("Buyer")}</label>
                  <CountryDropdownPicker
                    multiple
                    removable
                    values={filters.buyers}
                    onToggle={setFilterList("buyers")}
                    options={buyerOptions}
                    placeholder={t("All buyers")}
                    searchPlaceholder={t("Type to find buyers")}
                    emptyResultsLabel={t("No buyers found.")}
                  />
                </div>
              ) : null}
              <div className="field">
                <label>{t("Country")}</label>
                <CountryDropdownPicker
                  multiple
                  removable
                  values={filters.countries}
                  onToggle={setFilterList("countries")}
                  options={countryOptionsForFlows}
                  placeholder={t("All countries")}
                  searchPlaceholder={t("Type to find countries")}
                  emptyResultsLabel={t("No countries found.")}
                />
              </div>
              <div className="field">
                <label>{t("Domain")}</label>
                <CountryDropdownPicker
                  multiple
                  removable
                  values={filters.domains}
                  onToggle={setFilterList("domains")}
                  options={domainOptionsForFlows}
                  placeholder={domainOptionsForFlows.length ? t("All domains") : t("No domains bound")}
                  searchPlaceholder={t("Find domain")}
                  emptyResultsLabel={t("No domains available.")}
                />
              </div>
              {brandOptions.length > 1 ? (
                <div className="field">
                  <label>{t("Brand")}</label>
                  <CountryDropdownPicker
                    multiple
                    removable
                    values={filters.brands}
                    onToggle={setFilterList("brands")}
                    options={brandOptions}
                    placeholder={t("All brands")}
                    searchPlaceholder={t("Find brand")}
                    emptyResultsLabel={t("No brands found.")}
                  />
                </div>
              ) : null}
            </div>

            <div className="flow-toolbar-row">
              <div className="flow-flags" role="group" aria-label={t("Filter by health")}>
                {FLOW_FLAGS.map((flag) => {
                  const count = flagCounts.get(flag.value) || 0;
                  const on = filters.flags.includes(flag.value);
                  if (!count && !on) return null;
                  return (
                    <button
                      key={flag.value}
                      type="button"
                      className={`flow-flag tone-${flag.tone}${on ? " is-active" : ""}`}
                      onClick={() => setFilterList("flags")(flag.value)}
                      aria-pressed={on}
                    >
                      {flag.label}
                      <span className="flow-flag-count">{count}</span>
                    </button>
                  );
                })}
                {activeFilterCount ? (
                  <button type="button" className="flow-flag is-clear" onClick={() => setFilters(EMPTY_FLOW_FILTERS)}>
                    <X size={12} /> {t("Clear filters")}
                  </button>
                ) : null}
              </div>
              <div className="flow-sort" role="group" aria-label={t("Sort flows")}>
                <ArrowDownUp size={13} />
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`flow-sort-btn${sortBy === opt.value ? " is-active" : ""}`}
                    onClick={() => setSortBy(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {unboundDomains.length ? (
          <div className="flow-unbound-banner">
            <span className="flow-unbound-icon"><Globe size={16} /></span>
            <span className="flow-unbound-text">
              <strong>{unboundDomains.length}</strong>{" "}
              {unboundDomains.length === 1 ? t("PWA domain isn't bound to any tracking link yet.") : t("PWA domains aren't bound to any tracking link yet.")}
            </span>
            {sortedLinks.length ? (
              <button type="button" className="flow-unbound-cta" onClick={() => openBind(sortedLinks[0])}>
                <Plus size={13} strokeWidth={2.5} /> {t("Bind domains")}
              </button>
            ) : null}
          </div>
        ) : null}

        {state.loading ? (
          <div className="empty-state">{t("Loading flows…")}</div>
        ) : state.error ? (
          <div className="empty-state error">{state.error}</div>
        ) : links.length === 0 ? (
          <div className="empty-state">{t("No tracking links yet. Create one in Tracking Links first.")}</div>
        ) : sortedLinks.length === 0 ? (
          <div className="empty-state">
            {t("No flows match these filters.")}{" "}
            <button type="button" className="flow-empty-cta" onClick={() => setFilters(EMPTY_FLOW_FILTERS)}>{t("Clear filters")}</button>
          </div>
        ) : (
          <div className="flow-tree">
            {sortedLinks.map((link) => {
              const linkDomains = [...(domainsByLink.get(link.id) || [])].sort((a, b) =>
                String(a.domain || "").localeCompare(String(b.domain || ""))
              );
              const isOpen = expanded[link.id] !== false;
              const totalPixels = linkDomains.reduce(
                (acc, d) => acc + (pixelsByDomain.get(String(d.domain || "").toLowerCase()) || []).length,
                0
              );
              const seg = linkSegments(link);
              // Every country this flow touches: the link's own geo segment
              // plus all countries of its bound domains, deduped by ISO code
              // (the link geo is "FR"-style, domain countries are full names).
              const geos = [];
              const seenGeoKeys = new Set();
              [
                ...splitGeos(seg.geo),
                ...linkDomains.flatMap((d) => normalizeCountryListValue(d.country)),
              ].forEach((g) => {
                const key = resolveCountryIso(g) || String(g).trim().toLowerCase();
                if (!key || seenGeoKeys.has(key)) return;
                seenGeoKeys.add(key);
                geos.push(g);
              });
              const filterCount = countLinkFilters(link);
              const isActive = String(link.state || "active") === "active";
              const inKeitaro = String(link.keitaro_status || "") === "created" || !!link.keitaro_id;
              const linkUrl = `${String(link.domain || "")}/${String(link.alias || "")}`;
              const createdAt = link.created_at
                ? new Date(link.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
                : "";
              return (
                <div className={`flow-card${isOpen ? " is-open" : ""}`} key={link.id}>
                  <div className="flow-card-head">
                    <button
                      type="button"
                      className="flow-card-toggle"
                      onClick={() => setExpanded((prev) => ({ ...prev, [link.id]: !isOpen }))}
                      aria-expanded={isOpen}
                      title={link.name}
                    >
                      <span className={`flow-chevron${isOpen ? " is-open" : ""}`}><ChevronRight size={16} /></span>
                      <span className={`flow-avatar${isActive ? " is-active" : ""}`} aria-hidden="true">{(seg.buyer || "?").trim().charAt(0).toUpperCase() || "?"}</span>
                      <span className="flow-buyer">{seg.buyer || t("Unassigned")}</span>
                      {(seg.tool || seg.game) ? (
                        <span className="flow-card-campaign">
                          {seg.tool ? (resolveBrandLogo(seg.tool) ? <BrandMark value={seg.tool} height={12} /> : seg.tool) : null}
                          {seg.tool && seg.game ? <span className="flow-card-sep"> · </span> : null}
                          {seg.game || null}
                        </span>
                      ) : null}
                    </button>
                    <div className="flow-card-head-right">
                      <span className={`flow-status-pill flow-status-${isActive ? "on" : "off"}`}>{isActive ? t("Active") : t("Paused")}</span>
                      <span className={`flow-kt${inKeitaro ? " is-live" : " is-local"}`} title={inKeitaro ? t("Live in Keitaro") : t("Stored locally")}>
                        <span className="flow-kt-dot" />{inKeitaro ? <img className="brand-mark keitaro-mark" src={keitaroLogo} alt="Keitaro" /> : t("Local")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`flow-card-link${copied === `link-${link.id}` ? " is-copied" : ""}`}
                    title={t("Copy tracking link")}
                    onClick={copyValue(`link-${link.id}`, link.url || `https://${linkUrl}`)}
                  >
                    <Link2 size={13} className="flow-card-link-icon" />
                    <span className="flow-card-link-url">{linkUrl}</span>
                    {copied === `link-${link.id}` ? <CheckCircle size={13} /> : <Copy size={13} />}
                  </button>

                  <div className="flow-card-meta">
                    {geos.length ? (
                      <span className="flow-meta-item">{geos.map((g) => <CountryFlag key={g} value={g} />)}{geos.join(", ")}</span>
                    ) : null}
                    {seg.brand ? <span className="flow-meta-item"><Tag size={11} /> {seg.brand}</span> : null}
                    <span className="flow-meta-item"><Globe size={11} /> {linkDomains.length} {linkDomains.length === 1 ? t("domain") : t("domains")}</span>
                    <span className="flow-meta-item"><Zap size={11} /> {totalPixels} {totalPixels === 1 ? t("pixel") : t("pixels")}</span>
                    {filterCount ? <span className="flow-meta-item"><SlidersHorizontal size={11} /> {filterCount} {filterCount === 1 ? t("filter") : t("filters")}</span> : null}
                    {createdAt ? <span className="flow-meta-item flow-meta-muted"><CalendarIcon size={11} /> {createdAt}</span> : null}
                  </div>

                  {(() => {
                    if (!flowStatsByName) return null;
                    const stats = flowStatsByName.get(String(link.name || "").trim().toLowerCase());
                    if (!stats) {
                      // Local-only links have no Keitaro campaign — no traffic is expected.
                      return inKeitaro ? (
                        <div className="flow-stats-strip is-empty">{t("No traffic in the last 7 days.")}</div>
                      ) : null;
                    }
                    // Rate of the step below it — the two numbers a buyer
                    // actually judges a flow on.
                    const rate = (num, den) => {
                      if (!(den > 0)) return "—";
                      if (!num) return "0%";
                      const pct = (num / den) * 100;
                      return `${pct.toFixed(pct >= 10 ? 0 : 1)}%`;
                    };
                    // Week-over-week on uniques: the one number that says
                    // whether a flow is being scaled or is bleeding out.
                    const trend = (() => {
                      const now = stats.week.uniques;
                      const before = stats.prev.uniques;
                      if (!before) return now > 0 ? { dir: "new", label: t("new") } : null;
                      const change = ((now - before) / before) * 100;
                      if (Math.abs(change) < 1) return { dir: "flat", label: "0%" };
                      return {
                        dir: change > 0 ? "up" : "down",
                        label: `${change > 0 ? "+" : "−"}${Math.abs(change) >= 10 ? Math.round(Math.abs(change)) : Math.abs(change).toFixed(1)}%`,
                      };
                    })();
                    const group = (tag, s, tone, options = {}) => {
                      const quiet = s.uniques === 0 && s.registers === 0;
                      return (
                        <div className={`flow-stats-block is-${tone}${s.ftds > 0 ? " has-ftd" : ""}${quiet ? " is-quiet" : ""}`}>
                          <div className="flow-stats-blockhead">
                            <span className="flow-stats-tag">{tag}</span>
                            {options.trend ? (
                              <span className={`flow-trend is-${options.trend.dir}`} title={t("Unique clicks vs the previous 7 days")}>
                                {options.trend.dir === "up" ? <TrendingUp size={11} /> : null}
                                {options.trend.dir === "down" ? <TrendingDown size={11} /> : null}
                                {options.trend.label}
                              </span>
                            ) : null}
                            <span className="flow-stats-rates">
                              <span className="flow-rate" title={t("Registrations per unique click")}>
                                <em>CR</em> {rate(s.registers, s.uniques)}
                              </span>
                              <span className={`flow-rate${s.ftds > 0 ? " is-good" : ""}`} title={t("FTDs per registration")}>
                                <em>FTD</em> {rate(s.ftds, s.registers)}
                              </span>
                            </span>
                          </div>
                          <div className="flow-stats-row">
                            <span className="flow-stat">
                              <strong>{s.uniques.toLocaleString()}</strong>
                              <em>{t("uniques")}</em>
                            </span>
                            <span className="flow-stat">
                              <strong>{s.registers.toLocaleString()}</strong>
                              <em>{t("regs")}</em>
                            </span>
                            <span className={`flow-stat${s.ftds > 0 ? " is-good" : ""}`}>
                              <strong>{s.ftds.toLocaleString()}</strong>
                              <em>FTD</em>
                            </span>
                            <span className={`flow-stat is-rev${s.revenue > 0 ? "" : " is-zero"}`}>
                              <strong>{formatCurrency(s.revenue)}</strong>
                              <em>{t("revenue")}</em>
                            </span>
                            {options.extra}
                          </div>
                        </div>
                      );
                    };
                    return (
                      <div className="flow-stats-strip">
                        {group(t("Today"), stats.today, "today")}
                        {group(t("Last 7 days"), stats.week, "week", {
                          trend,
                          extra: (
                            <span className="flow-spark-wrap" title={t("Unique clicks, last 7 days")}>
                              <FlowSparkline values={stats.series} />
                            </span>
                          ),
                        })}
                      </div>
                    );
                  })()}

                  {isOpen ? (
                    <div className="flow-card-tree">
                      {linkDomains.length === 0 ? (
                        <div className="flow-empty">
                          <Globe size={14} />
                          <span>{t("No domains bound yet.")}</span>
                          <button type="button" className="flow-empty-cta" onClick={() => openBind(link)}>{t("Bind domains")}</button>
                        </div>
                      ) : (
                        linkDomains.map((domain) => {
                          const dPixels = [...(pixelsByDomain.get(String(domain.domain || "").toLowerCase()) || [])].sort((a, b) =>
                            String(a.pixel_id || "").localeCompare(String(b.pixel_id || ""), undefined, { numeric: true })
                          );
                          const dStatus = String(domain.status || "Active");
                          const dGeos = normalizeCountryListValue(domain.country);
                          return (
                            <div className="flow-node-domain" key={domain.id}>
                              <div className="flow-node-body">
                                <span className="flow-node-icon"><Globe size={14} /></span>
                                <span className="flow-node-name">{domain.domain}</span>
                                {domain.platform ? (resolveBrandLogo(domain.platform) ? <BrandMark value={domain.platform} height={13} /> : <span className="flow-node-tag">{domain.platform}</span>) : null}
                                {dGeos.length ? (
                                  <span className="flow-node-geos" title={dGeos.join(", ")}>
                                    {dGeos.map((g) => <CountryFlag key={g} value={g} />)}
                                  </span>
                                ) : null}
                                <span className={`accounts-status-pill acc-st-${dStatus.toLowerCase()}`}>{t(dStatus)}</span>
                                <button type="button" className="icon-btn flow-node-detail" aria-label={t("Detailed information")} data-tip={t("Details")} onClick={() => setDetail({ open: true, link, domain, pixels: dPixels })}>
                                  <Eye size={14} />
                                </button>
                                {(() => {
                                  const unbindKey = `${link.id}:${domain.id}`;
                                  const armed = unbindArmed === unbindKey;
                                  const busy = unbinding === unbindKey;
                                  return (
                                    <button
                                      type="button"
                                      className={`flow-node-unbind${armed ? " is-armed" : ""}`}
                                      disabled={busy}
                                      aria-label={t("Unbind domain from this link")}
                                      title={t("Unbind domain from this link")}
                                      onClick={() => (armed ? unbindDomain(link, domain) : armUnbind(unbindKey))}
                                    >
                                      <Unlink size={13} />
                                      {armed ? <span>{t("Confirm")}</span> : null}
                                      {busy ? <span>{t("Removing…")}</span> : null}
                                    </button>
                                  );
                                })()}
                              </div>
                              {dPixels.length ? (
                                <div className="flow-node-pixels">
                                  {dPixels.map((pixel) => {
                                    const pxActive = String(pixel.status || "Active").toLowerCase() === "active";
                                    return (
                                      <span className="flow-node-pixel" key={pixel.id} title={pixel.comment || ""}>
                                        <span className={`flow-pixel-dot${pxActive ? " is-active" : " is-off"}`} />
                                        <Zap size={11} className="flow-pixel-icon" />
                                        <span className="flow-pixel-id">{pixel.pixel_id}</span>
                                        <CountryFlag value={pixel.geo} className="flow-pixel-flag" />
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="flow-node-pixels-empty">{t("No pixels on this domain — add one in Pixels.")}</div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : null}

                  <div className="flow-card-actions">
                    <button type="button" className="flow-action-primary" onClick={() => openBind(link)}>
                      <Plus size={14} strokeWidth={2.5} /> {t("Bind domains")}
                    </button>
                    <button type="button" className="flow-action-ghost" onClick={() => setFlowViz({ open: true, link: { ...link, _domains: linkDomains, _pixelsByDomain: pixelsByDomain } })}>
                      <Zap size={13} /> {t("Traffic flow")}
                    </button>
                    <button type="button" className="flow-action-ghost" onClick={() => openFlowEdit(link)} title={t("Edit everything about this flow")}>
                      <Pencil size={13} /> {t("Edit flow")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <ImportCampaignsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={fetchAll}
        defaultBrands={IMPORT_DEFAULT_BRANDS}
      />
    </section>
  );
}
