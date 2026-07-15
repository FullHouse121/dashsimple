import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  Map,
  Target,
  BarChart3,
  Megaphone,
  MousePointerClick,
  Users,
  Smartphone,
  Workflow,
  Link2,
  Globe,
  Zap,
  UserPlus,
  ShieldCheck,
  User,
  CreditCard,
  Plug,
} from "lucide-react";

// Section order mirrors the sidebar (Overview → Performance → Operations →
// Administration → Integrations) so readers can map docs to navigation 1:1.
export default function DocumentationDashboard({ t }) {
  const groups = [
    {
      title: t("Overview"),
      sections: [
        {
          icon: Home,
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
          icon: Map,
          title: t("GEOS"),
          description: t("Country-level performance: where the traffic comes from and where deposits happen."),
          bullets: [
            t("Interactive world map plus a per-country table with funnel and revenue columns."),
            t("Charts handle sparse data gracefully — days without traffic stay visible in tooltips."),
            t("Respects the global filters and your role's buyer scope."),
          ],
        },
        {
          icon: Target,
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
      sections: [
        {
          icon: BarChart3,
          title: t("Statistics"),
          description: t(
            "Daily performance per media buyer and country; the system derives funnel and cost metrics."
          ),
          bullets: [
            t("Rows come from the Keitaro sync; manual entry is available for corrections."),
            t("Funnel metrics: Click2Install, Click2Register, Install2Reg, Reg2Dep."),
            t("Cost metrics: CPC, CPI, CPR, CPP — computed from spend against each funnel stage."),
          ],
        },
        {
          icon: Megaphone,
          title: t("Campaigns"),
          description: t("Per-campaign results, with the campaign name decoded into its segments."),
          bullets: [
            t("Names following “Buyer | Tool | Game | Geo | Brand” are split into filterable columns."),
            t("Columns include installs, registers, FTDs, redeposits, ARPPU, LTV, C2R, C2F, R2D."),
            t("Known tools and brands render with their logos automatically."),
          ],
        },
        {
          icon: MousePointerClick,
          title: t("Placement"),
          description: t("Performance grouped by ad placement (feed, stories, reels, …)."),
          bullets: [
            t("Placement is read from Keitaro sub_id_1 — make sure your links pass it."),
            t("Filter down to a single placement to compare creatives fairly."),
            t("Same funnel measures as Statistics, sliced by placement."),
          ],
        },
        {
          icon: Users,
          title: t("User Behavior"),
          description: t("Player-level view keyed by external_id — from first click to redeposits."),
          bullets: [
            t("Each row is one player: clicks, registration, FTD and redeposit history with GEO and device context."),
            t("Requires the tool to send its click/user ID — see the external_id mapping under Tracking Links."),
            t("Useful for time-to-deposit questions and verifying that postbacks attribute correctly."),
          ],
        },
        {
          icon: Smartphone,
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
      sections: [
        {
          icon: Workflow,
          title: t("My Flows"),
          description: t("Each tracking link as a flow card: segments, domains and pixels in one place."),
          bullets: [
            t("Shows the decoded campaign segments (buyer, tool, game, GEO, brand) per link."),
            t("Lists the landing domains bound to the link and every attached pixel."),
            t("Sort by recency or by pixel count; expand a card for full parameter details."),
          ],
        },
        {
          icon: MousePointerClick,
          title: t("Tracking Links"),
          description: t(
            "Compose Keitaro campaigns without leaving the dashboard — naming, params and push in one form."
          ),
          bullets: [
            t("Campaign names follow “Buyer | Tool | Game | Geo | Brand”; use “-” for an intentionally empty slot."),
            t("The Tool must be picked from the Keitaro traffic-source list — free-typed tools are disabled on purpose."),
            t("external_id and the sub parameters auto-fill from the selected source's Keitaro config."),
            t("Only the approved tracking domains can back a link; PWA landing domains are never used here."),
            t("Push creates the campaign and stream in Keitaro; editing a link renames the campaign there too."),
            t("Optional stream filters (GEO, device, bot and more) are applied on push."),
          ],
        },
        {
          icon: Link2,
          title: t("UTM Builder"),
          description: t("Generate ad-side URLs with the pixel and sub1–sub15 parameters per tool."),
          bullets: [
            t("PWA Group, Link Group and SKAK apps take fbp={pixel} as the FIRST parameter."),
            t("ZM apps takes pixel_fb={pixel} as the LAST parameter — the builder enforces this automatically."),
            t("sub9 is the GEO slot and auto-fills from the selected country; sub7–sub15 stay collapsed until used."),
            t("Macro chips ({{campaign.name}}, {{adset.id}}, …) insert into whichever field is focused."),
            t("Save presets per buyer; history is kept locally and exports to CSV."),
            t("Only filled parameters are appended to the final URL."),
          ],
        },
        {
          icon: Globe,
          title: t("Domains"),
          description: t("Registry of landing domains with status, notes and health tooling."),
          bullets: [
            t("Statuses: active, pending, paused, expired, blocked — keep them current."),
            t("Run the Meta Sharing Debugger check on a domain before sending paid traffic to it."),
            t("Domains can be bound to tracking links so flows show where traffic lands."),
          ],
        },
        {
          icon: Zap,
          title: t("Pixels"),
          description: t("Meta pixel registry: IDs, tokens, owners and where each pixel is used."),
          bullets: [
            t("Store the pixel ID together with its access token; both are required."),
            t("Assign an owner and buyer so responsibility stays clear."),
            t("Filter by pixel ID, buyer or status; pixels attach to tracking links / flows."),
          ],
        },
        {
          icon: UserPlus,
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
      sections: [
        {
          icon: ShieldCheck,
          title: t("Roles & Users"),
          description: t("Role-based access: what each user can see and edit."),
          bullets: [
            t("Permission toggles mirror the sidebar sections, so scoping stays intuitive."),
            t("Assign a role when creating a user; only verified users can sign in."),
            t("Media buyers are automatically scoped to their own campaigns and stats."),
          ],
        },
        {
          icon: User,
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
      sections: [
        {
          icon: CreditCard,
          title: t("Meta Token $"),
          description: t("Meta access tokens per ad account, with costs and notes."),
          bullets: [
            t("Store the token against its ad-account number; copy the account with one click."),
            t("Track token cost and leave comments for the next buyer using the account."),
          ],
        },
        {
          icon: Plug,
          title: t("API (Keitaro)"),
          description: t("The Keitaro connection that feeds Statistics, Devices and User Behavior."),
          bullets: [
            t("Endpoint, API key and payload mapping are configured server-side — the key never reaches the browser."),
            t("Registrations, FTDs and redeposits come from Keitaro reports; installs come via the postback receiver."),
            t("On this tracker FTD = custom_conversion_8 and redeposit = custom_conversion_7."),
            t("Use Sync to fetch on demand; the status panel shows the last successful sync per target."),
          ],
        },
      ],
    },
  ];

  const externalIdMap = [
    ["ZMAPPS", "{exid}"],
    ["PWA PARTNERS", "{user_id}"],
    ["PWA.GROUP", "{USER_ID}"],
    ["LINKI.GROUP", "{client_id}"],
    ["SKAK", "{clickId}"],
  ];

  let cardIndex = 0;

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
            <strong>{groups.reduce((n, g) => n + g.sections.length, 0)}</strong>
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

      {groups.map((group) => (
        <section key={group.title}>
          <p className="docs-kicker" style={{ marginBottom: 10 }}>{group.title}</p>
          <div className="docs-grid">
            {group.sections.map((section) => {
              const Icon = section.icon;
              const delay = Math.min(cardIndex * 0.04, 0.5);
              cardIndex += 1;
              return (
                <motion.div
                  key={section.title}
                  className="doc-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay, duration: 0.4 }}
                >
                  <div className="doc-card-head">
                    <span className="doc-icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3>{section.title}</h3>
                      <p>{section.description}</p>
                    </div>
                  </div>
                  <ul className="doc-list">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="docs-callout">
        <div>
          <h3>{t("Conventions that keep the data clean")}</h3>
          <p className="docs-sub">
            {t("Reports attribute by parsing campaign names, so spelling is data — not cosmetics.")}
          </p>
        </div>
        <ul className="doc-list">
          <li>
            {t("Campaign names must follow")} <code>Buyer | Tool | Game | Geo | Brand</code>{" "}
            {t("— use “-” for an empty slot. Off-format names still attribute the buyer, but lose the other columns.")}
          </li>
          <li>
            {t("Tool names are counted verbatim: “PWA” and “PWA PARTNERS” are two different tools in every report.")}
          </li>
          <li>
            {t("Buyer short names resolve through aliases (e.g. “Leo” → “Leomarketing”), so both spellings roll up to one buyer.")}
          </li>
          <li>
            {t("Each tool passes its click ID under its own macro — the link builder applies these automatically:")}{" "}
            {externalIdMap.map(([tool, macro], i) => (
              <React.Fragment key={tool}>
                {i > 0 && " · "}
                {tool} → <code>external_id={macro}</code>
              </React.Fragment>
            ))}
            {". "}
            {t("The source of truth is each traffic source's config in Keitaro; the dashboard reads it live.")}
          </li>
        </ul>
      </section>

      <section className="docs-callout">
        <div>
          <h3>{t("Best Practices")}</h3>
          <p className="docs-sub">{t("Small habits that keep attribution and reporting trustworthy.")}</p>
        </div>
        <ul className="doc-list">
          <li>{t("Always pick the Tool from the dropdown in Tracking Links — never retype it by hand.")}</li>
          <li>{t("Use UTM presets per buyer to avoid parameter mistakes across launches.")}</li>
          <li>{t("Review goals weekly and adjust caps to the current FTD pace.")}</li>
          <li>{t("Keep domain statuses current and run the Meta debugger check before scaling traffic to a domain.")}</li>
          <li>{t("After a big campaign push, open API and confirm the last sync succeeded for every target.")}</li>
        </ul>
      </section>
    </>
  );
}
