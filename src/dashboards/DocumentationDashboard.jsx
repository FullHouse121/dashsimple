import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import {
  DashIcon, GeoIcon, GoalIcon, StatsIcon, ClicksIcon, ConversionIcon,
  CampaignIcon, PlacementIcon, BehaviorIcon, DeviceIcon, ReportIcon,
  LinkIcon, UtmIcon, DomainIcon, PixelIcon, AccountIcon, HealthIcon,
  RolesIcon, LogIcon, ProfileIcon, CostIcon, ApiIcon, GroupIcon, AwardIcon,
  SavedIcon,
} from "../components/icons.jsx";

// "My Flows" has no entry in the shared set — the nav draws it inline — so it
// is redrawn here in the same grammar rather than borrowed from elsewhere.
const FlowsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="5" cy="12" r="2.4" />
    <circle cx="18.5" cy="6" r="2.2" />
    <circle cx="18.5" cy="18" r="2.2" />
    <path d="M7.4 12h3.2a2 2 0 002-2V8.2a2 2 0 012-2h1.7" />
    <path d="M7.4 12h3.2a2 2 0 012 2v1.8a2 2 0 002 2h1.7" />
  </svg>
);


// One accent per group, from the dashboard's own ramp, in sidebar order.
// Passed down as a CSS variable so the icon tile, the rail, the bullets and
// the contents entry all read from a single source — a colour that means
// "Operations" in the list and something else in the body would be worse than
// no colour at all.
const GROUP_ACCENTS = ["#36d07c", "#64b8ff", "#a15bff", "#f7c625", "#ff9357", "#49e0c4"];

// Docs are structured as groups → articles, mirroring the sidebar order so
// readers can map documentation to navigation 1:1. Each article can carry
// bullets, a small reference table, and a highlighted tip.
export default function DocumentationDashboard({ t }) {
  const groups = [
    {
      title: t("Overview"),
      articles: [
        {
          id: "dashboard",
          icon: DashIcon,
          title: t("Dashboard"),
          description: t(
            "Daily operations overview: clicks, installs, registers, FTDs and conversion rates at a glance."
          ),
          bullets: [
            t("KPI cards track the full funnel; charts show conversion-rate trends and top GEO distribution."),
            t("The period selector supports presets (today, 7/30 days, month) and custom ranges."),
            t("Global buyer and GEO filters in the top bar scope every widget on the page."),
          ],
        },
        {
          id: "geos",
          icon: GeoIcon,
          title: t("GEOS"),
          description: t("Country-level performance: where the traffic comes from and where deposits happen."),
          bullets: [
            t("Interactive world map plus a per-country table with funnel and revenue columns."),
            t("Charts handle sparse data gracefully — days without traffic stay visible in tooltips."),
            t("Respects the global filters and your role's buyer scope."),
          ],
        },
        {
          id: "goals",
          icon: GoalIcon,
          title: t("Goals"),
          description: t("Set FTD and Reg2Dep targets per media buyer, country and period."),
          bullets: [
            t("Choose a preset period or a custom date range per goal."),
            t("The overview banner summarizes progress across all active goals."),
            t("Statuses: achieved, on track, or behind — computed from live synced data."),
          ],
        },
      ],
    },
    {
      title: t("Performance"),
      articles: [
        {
          id: "statistics",
          icon: StatsIcon,
          title: t("Statistics"),
          description: t(
            "Daily performance per media buyer and country; the system derives every funnel and cost metric."
          ),
          bullets: [
            t("Rows come from the Keitaro sync; manual entry is available for corrections."),
          ],
          table: {
            columns: [t("Metric"), t("Meaning")],
            rows: [
              ["Click2Install", t("share of clicks that install the app")],
              ["Click2Register", t("share of clicks that register")],
              ["Install2Reg", t("share of installs that register")],
              ["Reg2Dep", t("share of registrations that deposit (FTD)")],
              ["CPC / CPI / CPR / CPP", t("spend divided by clicks / installs / registers / FTDs")],
            ],
          },
        },
        {
          id: "live-clicks",
          icon: ClicksIcon,
          title: t("Live Clicks"),
          description: t("The raw click stream from Keitaro, as it arrives, with every sub parameter attached."),
          bullets: [
            t("Windows run from the last 15 minutes to a custom range; the feed loads newest first."),
            t("Search accepts a click id or external id. If it is not in the loaded window, the tracker is queried directly over the span the window covers."),
            t("The SUB 1–11 columns carry the team's macro set; unfilled or literal {macro} values are flagged so a broken link is visible before it costs a day."),
            t("Buyers see only their own clicks; the scope is applied in SQL, not after loading."),
          ],
          tip: t("A click that converted days later will not be in the live window — search its id and the deep lookup will find it."),
        },
        {
          id: "conversions",
          icon: ConversionIcon,
          title: t("Conversions"),
          description: t("Registrations, first deposits and redeposits as individual events, with the click each came from."),
          bullets: [
            t("FTD is Keitaro's custom conversion 8 and redeposit is 7 — instance-specific, so do not assume the same numbering on another tracker."),
            t("Status and payout arrive by postback, not by API: the dashboard reads what the tracker was told."),
            t("Registration and deposit frequently land on different clicks, so a player's first deposit may show no registration against it."),
          ],
        },
        {
          id: "reports",
          icon: ReportIcon,
          title: t("Reports"),
          description: t("Three ways to read the same data: build your own, read the team's, or read one buyer's."),
          bullets: [
            t("Query builder — pick a source, dimensions and measures, and export the result."),
            t("Buyer report — one buyer's traffic with team medians beside it. A buyer sees their own; leadership picks whose to open."),
            t("Executive report — the whole operation in one view, with a share link anyone can open without an account."),
            t("Share links carry an expiry, can be revoked, and never expose tokens, credentials or player identifiers."),
          ],
          tip: t("Cost figures are omitted from the buyer report while the ad-platform link is down — a number nobody can check is worse than none."),
        },
        {
          id: "campaigns",
          icon: CampaignIcon,
          title: t("Campaigns"),
          description: t("Per-campaign results, with the campaign name decoded into its segments."),
          bullets: [
            t("Names following “Buyer | Tool | Game | Geo | Brand” are split into filterable columns."),
            t("Columns include installs, registers, FTDs, redeposits, ARPPU, LTV, C2R, C2F, R2D."),
            t("Known tools and brands render with their logos automatically."),
          ],
        },
        {
          id: "placement",
          icon: PlacementIcon,
          title: t("Placement"),
          description: t("Performance grouped by ad placement (feed, stories, reels, …)."),
          bullets: [
            t("Placement is read from Keitaro sub_id_1 — make sure your links pass it."),
            t("Filter down to a single placement to compare creatives fairly."),
            t("Same funnel measures as Statistics, sliced by placement."),
          ],
        },
        {
          id: "user-behavior",
          icon: BehaviorIcon,
          title: t("User Behavior"),
          description: t("Player-level view keyed by external_id — from first click to redeposits."),
          bullets: [
            t("Each row is one player: clicks, registration, FTD and redeposit history with GEO and device context."),
            t("Useful for time-to-deposit questions and verifying that postbacks attribute correctly."),
          ],
          tip: t(
            "This report only works when the tool sends its click/user ID. The Tracking Links builder wires the right external_id macro automatically."
          ),
        },
        {
          id: "devices",
          icon: DeviceIcon,
          title: t("Devices"),
          description: t("Device, OS and model breakdown for clicks, installs, revenue and CR."),
          bullets: [
            t("Synced from the Keitaro device report (separate payload from the main sync)."),
            t("Installs arrive through the postback receiver, not the report."),
            t("Compare conversion rates and revenue per device class before scaling a creative."),
          ],
        },
      ],
    },
    {
      title: t("Operations"),
      articles: [
        {
          id: "my-flows",
          icon: FlowsIcon,
          title: t("My Flows"),
          description: t("Each tracking link as a flow card: segments, domains and pixels in one place."),
          bullets: [
            t("Shows the decoded campaign segments (buyer, tool, game, GEO, brand) per link."),
            t("Lists the landing domains bound to the link and every attached pixel."),
            t("Sort by recency or by pixel count; expand a card for full parameter details."),
          ],
        },
        {
          id: "tracking-links",
          icon: LinkIcon,
          title: t("Tracking Links"),
          description: t(
            "Compose Keitaro campaigns without leaving the dashboard — naming, params and push in one form."
          ),
          bullets: [
            t("Campaign names follow “Buyer | Tool | Game | Geo | Brand”; use “-” for an intentionally empty slot."),
            t("The Tool must be picked from the Keitaro traffic-source list — free-typed tools are disabled on purpose."),
            t("Only the approved tracking domains can back a link; PWA landing domains are never used here."),
            t("Push creates the campaign and stream in Keitaro; editing a link renames the campaign there too."),
            t("Optional stream filters (GEO, device, bot and more) are applied on push."),
          ],
          table: {
            columns: [t("Tool"), "external_id"],
            rows: [
              ["ZMAPPS", "{exid}"],
              ["PWA PARTNERS", "{user_id}"],
              ["PWA.GROUP", "{USER_ID}"],
              ["LINKI.GROUP", "{client_id}"],
              ["SKAK", "{clickId}"],
            ],
            mono: true,
          },
          tip: t(
            "The source of truth for these macros is each traffic source's config in Keitaro — the builder reads it live, so a change there applies here with no code change."
          ),
        },
        {
          id: "utm-builder",
          icon: UtmIcon,
          title: t("UTM Builder"),
          description: t("Generate ad-side URLs with the pixel and sub1–sub15 parameters per tool."),
          bullets: [
            t("sub9 is the GEO slot and auto-fills from the selected country; sub7–sub15 stay collapsed until used."),
            t("Macro chips ({{campaign.name}}, {{adset.id}}, …) insert into whichever field is focused."),
            t("Save presets per buyer; history is kept locally and exports to CSV."),
            t("Only filled parameters are appended to the final URL."),
          ],
          table: {
            columns: [t("Tool"), t("Pixel parameter"), t("Position")],
            rows: [
              ["PWA Group", "fbp={pixel}", t("first")],
              ["Link Group", "fbp={pixel}", t("first")],
              ["SKAK apps", "fbp={pixel}", t("first")],
              ["ZM apps", "pixel_fb={pixel}", t("last")],
            ],
            mono: true,
          },
          tip: t("The builder enforces the pixel position automatically — just pick the tool."),
        },
        {
          id: "domains",
          icon: DomainIcon,
          title: t("Domains"),
          description: t("Registry of landing domains with status, notes and health tooling."),
          bullets: [
            t("Statuses: active, pending, paused, expired, blocked — keep them current."),
            t("Run the Meta Sharing Debugger check on a domain before sending paid traffic to it."),
            t("Domains can be bound to tracking links so flows show where traffic lands."),
          ],
        },
        {
          id: "pixels",
          icon: PixelIcon,
          title: t("Pixels"),
          description: t("Meta pixel registry: IDs, tokens, owners and where each pixel is used."),
          bullets: [
            t("Store the pixel ID together with its access token; both are required."),
            t("Assign an owner and buyer so responsibility stays clear."),
            t("Filter by pixel ID, buyer or status; pixels attach to tracking links / flows."),
          ],
        },
        {
          id: "accounts",
          icon: AccountIcon,
          title: t("Accounts"),
          description: t("Ad-account registry with statuses, search and per-buyer filters."),
          bullets: [
            t("Track account state over its lifecycle (active → paused/blocked)."),
            t("Search and filters mirror the pixels view for consistency."),
          ],
        },
      ],
    },
    {
      title: t("Administration & Account"),
      articles: [
        {
          id: "health",
          icon: HealthIcon,
          title: t("Health"),
          description: t("Whether the pieces this dashboard depends on are actually working."),
          bullets: [
            t("Database, tracker and ad-platform tokens are checked independently, so a red light names the thing that is down."),
            t("Ad-account tokens report the reason they failed — expired, missing a permission, or an app that no longer exists."),
            t("Check here first when a number looks wrong; a stale sync explains more outages than a bug does."),
          ],
        },
        {
          id: "logs",
          icon: LogIcon,
          title: t("Logs"),
          description: t("Who changed what, and when. Leadership only, and not grantable through role permissions."),
          bullets: [
            t("Every write is recorded automatically — creating a campaign, editing a goal, revoking a share link."),
            t("Reads are not logged, so the trail stays about actions rather than curiosity."),
          ],
        },
        {
          id: "roles",
          icon: RolesIcon,
          title: t("Roles & Users"),
          description: t("Role-based access: what each user can see and edit."),
          bullets: [
            t("Permission toggles mirror the sidebar sections, so scoping stays intuitive."),
            t("Assign a role when creating a user; only verified users can sign in."),
            t("Media buyers are automatically scoped to their own campaigns and stats."),
          ],
        },
        {
          id: "profile",
          icon: ProfileIcon,
          title: t("Profile"),
          description: t("Your own account: credentials and preferences."),
          bullets: [
            t("Update your password and personal details."),
            t("The language switcher (EN / TR) lives at the bottom of the sidebar."),
          ],
        },
      ],
    },
    {
      title: t("Integrations"),
      articles: [
        {
          id: "meta-token",
          icon: CostIcon,
          title: t("Meta Token $"),
          description: t("Meta access tokens per ad account, with costs and notes."),
          bullets: [
            t("Store the token against its ad-account number; copy the account with one click."),
            t("Track token cost and leave comments for the next buyer using the account."),
          ],
        },
        {
          id: "api-keitaro",
          icon: ApiIcon,
          title: t("API (Keitaro)"),
          description: t("The Keitaro connection that feeds Statistics, Devices and User Behavior."),
          bullets: [
            t("Endpoint, API key and payload mapping are configured server-side — the key never reaches the browser."),
            t("Registrations, FTDs and redeposits come from Keitaro reports; installs come via the postback receiver."),
            t("Use Sync to fetch on demand; the status panel shows the last successful sync per target."),
          ],
          table: {
            columns: [t("Signal"), t("Comes from")],
            rows: [
              [t("Clicks, registers"), t("Keitaro report sync")],
              [t("FTD"), "custom_conversion_8"],
              [t("Redeposit"), "custom_conversion_7"],
              [t("Installs"), t("postback receiver")],
            ],
          },
        },
      ],
    },
    {
      title: t("Playbook"),
      articles: [
        {
          id: "conventions",
          icon: GroupIcon,
          title: t("Naming Conventions"),
          description: t(
            "Reports attribute by parsing campaign names, so spelling is data — not cosmetics."
          ),
          bullets: [
            t("Campaign names must follow “Buyer | Tool | Game | Geo | Brand” — use “-” for an empty slot."),
            t("Off-format names still attribute the buyer, but lose the tool/game/geo/brand columns."),
            t("Tool names are counted verbatim: “PWA” and “PWA PARTNERS” are two different tools in every report."),
            t("Buyer short names resolve through aliases (e.g. “Leo” → “Leomarketing”), so both spellings roll up to one buyer."),
          ],
        },
        {
          id: "best-practices",
          icon: AwardIcon,
          title: t("Best Practices"),
          description: t("Small habits that keep attribution and reporting trustworthy."),
          bullets: [
            t("Always pick the Tool from the dropdown in Tracking Links — never retype it by hand."),
            t("Use UTM presets per buyer to avoid parameter mistakes across launches."),
            t("Review goals weekly and adjust caps to the current FTD pace."),
            t("Keep domain statuses current and run the Meta debugger check before scaling traffic to a domain."),
            t("After a big campaign push, open API and confirm the last sync succeeded for every target."),
          ],
        },
      ],
    },
  ];

  const [query, setQuery] = React.useState("");
  const [activeId, setActiveId] = React.useState(null);

  // Full-text match across everything an article shows.
  const matches = React.useCallback(
    (article) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = [
        article.title,
        article.description,
        ...(article.bullets || []),
        article.tip || "",
        ...(article.table ? [...article.table.columns, ...article.table.rows.flat()] : []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    },
    [query]
  );

  const visibleGroups = groups
    .map((group) => ({ ...group, articles: group.articles.filter(matches) }))
    .filter((group) => group.articles.length > 0);
  const totalArticles = groups.reduce((n, g) => n + g.articles.length, 0);
  const visibleCount = visibleGroups.reduce((n, g) => n + g.articles.length, 0);

  // Highlight the TOC entry of the article currently in view.
  React.useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("[data-doc-article]"));
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: "-15% 0px -75% 0px" }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visibleCount]);

  const scrollTo = (id) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="docs-hero">
        <div>
          <span className="docs-kicker">{t("System Documentation")}</span>
          <h2 className="docs-title">{t("Documentation")}</h2>
          <p className="docs-sub">
            {t("Everything you need to operate the dashboard, manage data, and onboard media buyers.")}
          </p>
        </div>
        <div className="docs-hero-meta">
          <div className="docs-meta-card">
            <span>{t("Sections")}</span>
            <strong>{totalArticles}</strong>
          </div>
          <div className="docs-meta-card">
            <span>{t("Data")}</span>
            <strong>{t("Postgres · Supabase")}</strong>
          </div>
          <div className="docs-meta-card">
            <span>{t("Tracker")}</span>
            <strong>Keitaro</strong>
          </div>
          <div className="docs-meta-card">
            <span>{t("Access")}</span>
            <strong>{t("Role-based")}</strong>
          </div>
        </div>
      </section>

      <div className="docs-shell">
        <aside className="docs-toc">
          <div className="docs-search">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search the docs")}
              aria-label={t("Search the docs")}
            />
          </div>
          <nav>
            {visibleGroups.map((group) => (
              <div
                className="docs-toc-group"
                key={group.title}
                style={{ "--doc-accent": GROUP_ACCENTS[groups.findIndex((g) => g.title === group.title) % GROUP_ACCENTS.length] }}
              >
                <p className="docs-kicker">{group.title}</p>
                {group.articles.map((article) => {
                  const Icon = article.icon;
                  return (
                    <button
                      key={article.id}
                      type="button"
                      className={`docs-toc-link${activeId === article.id ? " is-active" : ""}`}
                      onClick={() => scrollTo(article.id)}
                    >
                      <Icon size={13} />
                      <span>{article.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            {!visibleGroups.length && <p className="docs-empty">{t("Nothing matches your search.")}</p>}
          </nav>
        </aside>

        <div className="docs-body">
          {visibleGroups.map((group) => (
            <div
              className="docs-group"
              key={group.title}
              style={{ "--doc-accent": GROUP_ACCENTS[groups.findIndex((g) => g.title === group.title) % GROUP_ACCENTS.length] }}
            >
              <p className="docs-body-kicker">
                <span className="docs-body-bar" />
                {group.title}
                <em>{group.articles.length}</em>
              </p>
              {group.articles.map((article) => {
                const Icon = article.icon;
                return (
                  <motion.article
                    key={article.id}
                    id={article.id}
                    data-doc-article
                    className="docs-article"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="doc-card-head">
                      <span className="doc-icon">
                        <Icon size={18} />
                      </span>
                      <div>
                        <h3>{article.title}</h3>
                        <p>{article.description}</p>
                      </div>
                    </div>
                    {article.bullets?.length > 0 && (
                      <ul className="doc-list">
                        {article.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {article.table && (
                      <div className="docs-table-wrap">
                        <table className={`docs-table${article.table.mono ? " is-mono" : ""}`}>
                          <thead>
                            <tr>
                              {article.table.columns.map((col) => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {article.table.rows.map((row) => (
                              <tr key={row.join("|")}>
                                {row.map((cell, i) => (
                                  <td key={`${cell}-${i}`}>{i > 0 && article.table.mono ? <code>{cell}</code> : cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {article.tip && (
                      <p className="docs-tip">
                        <AwardIcon size={13} /> {article.tip}
                      </p>
                    )}
                  </motion.article>
                );
              })}
            </div>
          ))}
          {!visibleGroups.length && (
            <div className="docs-article docs-empty-state">
              <p className="docs-sub">{t("Nothing matches your search.")}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
