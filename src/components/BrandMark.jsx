// Brand and traffic-source marks.
//
// Lifted out of App.jsx because the public report page never mounts App: a
// manager opening a share link must still see the same JASINO and ZlotMX
// emblems the team sees, and duplicating the registry would have let the two
// drift apart.
import React from "react";
import pwaGroupLogo from "../assets/brands/pwa-group.svg";
import zmAppsLogo from "../assets/brands/zm-apps.svg";
import linkiLogo from "../assets/brands/linki-group.svg";
import zlotLogo from "../assets/brands/zlot-mx.svg";
import jasinoLogo from "../assets/brands/jasino.svg";
import skakLogo from "../assets/brands/skak-apps.svg";
import pwaPartnersLogo from "../assets/brands/pwa-partners-white.svg";

// Brand/traffic-source logo registry. Keys are normalized (lowercased, only
// a-z0-9), so "PWA Group" / "PWA.GROUP" / "pwagroup" all resolve to one entry.
export const BRAND_LOGOS = {
  pwagroup: { src: pwaGroupLogo, label: "PWA Group" },
  zmapps: { src: zmAppsLogo, label: "ZM Apps" },
  zmap: { src: zmAppsLogo, label: "ZM Apps" },
  linkigroup: { src: linkiLogo, label: "Linki Group" },
  linkgroup: { src: linkiLogo, label: "Linki Group" },
  linki: { src: linkiLogo, label: "Linki Group" },
  link: { src: linkiLogo, label: "Linki Group" },
  zlotmx: { src: zlotLogo, label: "ZlotMX" },
  zlot: { src: zlotLogo, label: "ZlotMX" },
  jasino: { src: jasinoLogo, label: "Jasino" },
  skakapps: { src: skakLogo, label: "SkakApp" },
  skakapp: { src: skakLogo, label: "SkakApp" },
  skak: { src: skakLogo, label: "SkakApp" },
  // PWA Partners ships as a pure-black emblem — invert to white for the dark UI
  pwapartners: { src: pwaPartnersLogo, label: "PWA Partners", invert: true },
  pwapartner: { src: pwaPartnersLogo, label: "PWA Partners", invert: true },
};
export const normalizeBrandKey = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]/g, "");
export const resolveBrandLogo = (value) => {
  const key = normalizeBrandKey(value);
  if (!key) return null;
  if (BRAND_LOGOS[key]) return BRAND_LOGOS[key];
  // guarded prefix match so "pwagroupmx" still resolves, without false hits
  for (const [k, v] of Object.entries(BRAND_LOGOS)) {
    if (k.length >= 4 && (key.startsWith(k) || k.startsWith(key))) return v;
  }
  return null;
};
// Renders a matched brand logo, else a lettermark chip (never a broken image).
export const BrandMark = ({ value, height = 15 }) => {
  const raw = String(value || "").trim();
  if (!raw) return <span className="offer-muted">—</span>;
  const hit = resolveBrandLogo(raw);
  if (hit) {
    return (
      <img
        className={`brand-mark platform-mark${hit.invert ? " platform-mark--invert" : ""}`}
        src={hit.src}
        alt={hit.label}
        title={hit.label}
        style={{ height }}
      />
    );
  }
  return (
    <span className="brand-lettermark" title={raw}>
      <span className="brand-lettermark-badge" aria-hidden="true">{raw.slice(0, 1).toUpperCase()}</span>
      {raw}
    </span>
  );
};
