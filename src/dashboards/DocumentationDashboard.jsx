import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Home,
  Target,
  Wallet,
  BarChart3,
  Smartphone,
  Link2,
  Globe,
  ShieldCheck,
  Plug,
} from "lucide-react";

export default function DocumentationDashboard({ t }) {
  const sections = [
    {
      icon: CheckCircle,
      title: t("Getting Started"),
      description: t(
        "Use your assigned username and password to sign in. Your role controls what you can view and edit."
      ),
      bullets: [
        t("Use the sidebar to navigate modules."),
        t("Use the language switcher at the bottom to toggle EN / TR."),
        t("Your profile in the top right shows the active user and role."),
      ],
    },
    {
      icon: Home,
      title: t("Home Dashboard"),
      description: t("Quick overview of clicks, installs, registers, FTDs, and conversion rates."),
      bullets: [
        t("Use the period selector for time ranges."),
        t("Charts show conversion rates and top GEO distribution."),
        t("Filters apply to Home and Finances."),
      ],
    },
    {
      icon: Target,
      title: t("Goals"),
      description: t("Set targets for FTDs and Reg2Dep conversion by media buyer, country, and period."),
      bullets: [
        t("Define period or custom date range."),
        t("Goal overview banner summarizes progress."),
        t("Track status: achieved, on track, or behind."),
      ],
    },
    {
      icon: Wallet,
      title: t("Finances"),
      description: t("Manual expense entry with billing type and status. Charts update automatically."),
      bullets: [
        t("Fields: date, country, category, reference, billing type, amount, status."),
        t("Totals and averages refresh on save."),
        t("Monthly and category charts visualize spend."),
      ],
    },
    {
      icon: BarChart3,
      title: t("Statistics"),
      description: t(
        "Enter daily performance per media buyer and country; the system calculates funnel and cost metrics."
      ),
      bullets: [
        t("Inputs: date, spend, clicks, installs, registers, FTDs, country."),
        t("Derived metrics: Click2Install, Click2Register, Install2Reg, Reg2Dep."),
        t("Cost metrics: CPC, CPI, CPR, CPP."),
      ],
    },
    {
      icon: Smartphone,
      title: t("Devices"),
      description: t("Analyze device performance for clicks, installs, revenue, and CR."),
      bullets: [
        t("Sync device reports from Keitaro."),
        t("Installs come from your postback receiver."),
        t("Compare revenue and conversion rates per device."),
      ],
    },
    {
      icon: Link2,
      title: t("UTM Builder"),
      description: t("Generate tracking links with fbp and sub1-sub15 parameters."),
      bullets: [
        t("Enter the base domain."),
        t("Fill fbp and any sub fields you need."),
        t("Only filled parameters are added to the final URL."),
      ],
    },
    {
      icon: Globe,
      title: t("Domains"),
      description: t("Keep a registry of your landing domains and status."),
      bullets: [
        t("Add domains with status and notes."),
        t("Use statuses to track availability."),
        t("Domains list shows the latest entries."),
      ],
    },
    {
      icon: ShieldCheck,
      title: t("Roles & Users"),
      description: t("Manage roles, permissions, and verified user access."),
      bullets: [
        t("Create roles and toggle permissions."),
        t("Assign roles when creating users."),
        t("Verified users can access the platform."),
      ],
    },
    {
      icon: Plug,
      title: t("API"),
      description: t("Connect Keitaro to pull performance data automatically."),
      bullets: [
        t("Configure endpoint, API key, and payload mapping."),
        t("Keitaro syncs registrations, FTDs, and redeposits. Installs come via postback."),
        t("Use Sync to fetch data."),
        t("Status panel shows last sync."),
      ],
    },
  ];

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
            <strong>{sections.length}</strong>
          </div>
          <div className="docs-meta-card">
            <span>{t("Data")}</span>
            <strong>{t("Local SQLite")}</strong>
          </div>
          <div className="docs-meta-card">
            <span>{t("Access")}</span>
            <strong>{t("Role-based")}</strong>
          </div>
        </div>
      </section>

      <section className="docs-grid">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              className="doc-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
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
      </section>

      <section className="docs-callout">
        <div>
          <h3>{t("Best Practices")}</h3>
          <p className="docs-sub">{t("Keep entries consistent by date and country.")}</p>
        </div>
        <ul className="doc-list">
          <li>{t("Review goals weekly and adjust caps.")}</li>
          <li>{t("Use UTM templates per buyer to avoid mistakes.")}</li>
        </ul>
      </section>
    </>
  );
}
