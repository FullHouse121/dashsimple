// The GEO panel's map, drawn for this panel rather than adapted to it.
//
// What it replaced went wrong in ways a generic world-map component makes easy
// to go wrong in. It matched countries on a property the atlas does not carry,
// so nothing was ever filled. It framed a portrait column with a landscape
// viewBox, so a third of the height went to letterboxing. And it was zoomed by
// an approximation of the projection's geometry rather than by the projection
// itself, which meant coastlines fell off the edge and the fit had to be
// nudged by hand every time the data moved.
//
// So the projection does the fitting. d3's fitExtent takes the actual geometry
// of the countries that matter and returns the scale and translate that put
// them inside a box — exactly, at any aspect ratio, for any set of countries.
// There is no constant to tune and nothing to clip.
import React from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// One fetch for the process, shared by every mount and every re-render.
let atlasPromise = null;
const loadAtlas = () => {
  if (!atlasPromise) {
    atlasPromise = fetch(ATLAS_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`atlas ${res.status}`);
        return res.json();
      })
      .then((topo) => feature(topo, topo.objects.countries).features)
      .catch((error) => {
        // Let the next mount try again rather than caching the failure.
        atlasPromise = null;
        throw error;
      });
  }
  return atlasPromise;
};

// world-atlas exposes `properties.name` and nothing else, so countries are
// matched by name. These are the ones where the tracker's spelling and the
// atlas's differ.
const NAME_ALIASES = {
  "United States": "United States of America",
  "Czech Republic": "Czechia",
  "Dominican Republic": "Dominican Rep.",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Ivory Coast": "Côte d'Ivoire",
  "Democratic Republic of the Congo": "Dem. Rep. Congo",
  "Central African Republic": "Central African Rep.",
  "South Sudan": "S. Sudan",
  "Equatorial Guinea": "Eq. Guinea",
  "Solomon Islands": "Solomon Is.",
  "North Macedonia": "Macedonia",
  "Eswatini": "eSwatini",
};
export const toAtlasName = (name) => NAME_ALIASES[name] || name;

// A single ramp instead of a colour per country.
//
// The palette this replaced assigned colours by index over 33 GEOs, so
// Colombia and Mexico both came out purple and Brazil and Ecuador both green —
// the colour carried no meaning and collided anyway. One ramp keyed to the
// value means darker is smaller, everywhere, and the eye can rank the map
// without consulting the table.
const RAMP_LOW = [31, 46, 42];
const RAMP_HIGH = [54, 208, 124];
export const rampColor = (weight) => {
  // sqrt so the long tail of small countries stays distinguishable from empty.
  const t = Math.max(0, Math.min(1, Math.sqrt(weight || 0)));
  const mix = RAMP_LOW.map((low, i) => Math.round(low + (RAMP_HIGH[i] - low) * t));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
};

export default function GeoValueMap({
  rows = [],
  activeName = null,
  onHover,
  onSelect,
  formatValue = (v) => String(v),
  width = 340,
  height = 380,
  emptyLabel = "No countries in range",
  loadingLabel = "Loading map…",
}) {
  const [features, setFeatures] = React.useState(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    loadAtlas().then(
      (list) => alive && setFeatures(list),
      () => alive && setFailed(true)
    );
    return () => {
      alive = false;
    };
  }, []);

  const byName = React.useMemo(() => {
    const map = new Map();
    const max = rows.reduce((acc, row) => Math.max(acc, Number(row.value) || 0), 0);
    rows.forEach((row) => {
      map.set(toAtlasName(row.name), {
        ...row,
        weight: max > 0 ? (Number(row.value) || 0) / max : 0,
      });
    });
    return map;
  }, [rows]);

  const view = React.useMemo(() => {
    if (!features) return null;
    const producing = features.filter((f) => byName.has(f.properties.name));
    // Frame on where the value is, not on everywhere it appears.
    //
    // Fitting to all of them lets a country worth $6.46 on the far side of an
    // ocean set the frame, and the countries carrying the other 99% get
    // squeezed into a corner. The ones making up the first 90% of the value
    // aim the camera; the rest are still drawn, they just do not vote.
    const ranked = [...producing].sort(
      (a, b) => (byName.get(b.properties.name)?.value || 0) - (byName.get(a.properties.name)?.value || 0)
    );
    const total = ranked.reduce((acc, f) => acc + (byName.get(f.properties.name)?.value || 0), 0);
    const framing = [];
    let running = 0;
    for (const f of ranked) {
      framing.push(f);
      running += byName.get(f.properties.name)?.value || 0;
      if (total > 0 && running / total >= 0.9) break;
    }
    // Nothing to frame yet — show the world rather than an empty box.
    const target = framing.length
      ? { type: "FeatureCollection", features: framing }
      : { type: "Sphere" };
    // The padding is the map's own margin, not a fudge factor for the fit:
    // fitExtent guarantees the geometry lands inside whatever box it is given.
    const pad = 16;
    const projection = geoMercator().fitExtent(
      [
        [pad, pad],
        [width - pad, height - pad],
      ],
      target
    );
    const path = geoPath(projection);
    return { projection, path, producing };
  }, [features, byName, width, height]);

  if (failed) {
    return (
      <div className="geo-map geo-map-empty" style={{ height }}>
        <span>{emptyLabel}</span>
      </div>
    );
  }
  if (!view) {
    return (
      <div className="geo-map geo-map-empty" style={{ height }}>
        <span>{loadingLabel}</span>
      </div>
    );
  }

  const { path, producing } = view;
  const activeAtlas = activeName ? toAtlasName(activeName) : null;

  // A label only helps if it fits inside the country it names. Anything
  // narrower keeps its shape and its hover, and the table carries its name.
  const labels = producing
    .map((f) => {
      const entry = byName.get(f.properties.name);
      const [[x0, y0], [x1, y1]] = path.bounds(f);
      const [cx, cy] = path.centroid(f);
      return {
        key: f.properties.name,
        name: entry?.label || entry?.name || f.properties.name,
        value: entry?.value,
        cx,
        cy,
        w: x1 - x0,
        h: y1 - y0,
      };
    })
    .filter((l) => Number.isFinite(l.cx) && l.w >= 46 && l.h >= 22)
    // Biggest country first, so when two labels collide the one with room to
    // hold it keeps it.
    .sort((a, b) => b.w * b.h - a.w * a.h)
    .reduce((kept, l) => {
      // Narrow countries stacked along a coast — Peru against Colombia, Chile
      // against Argentina — put their centroids within a few pixels of each
      // other, and two names on the same spot are worse than one.
      const clash = kept.some(
        (other) => Math.abs(other.cx - l.cx) < 44 && Math.abs(other.cy - l.cy) < 24
      );
      if (!clash) kept.push(l);
      return kept;
    }, []);

  return (
    <svg
      className="geo-map"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={
        producing.length
          ? `${producing.length} countries with activity, shaded by value`
          : emptyLabel
      }
      onMouseLeave={() => onHover?.(null)}
    >
      <defs>
        {/* Lifts the landmass off the panel without a hard edge. */}
        <radialGradient id="geo-map-sea" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="rgba(90, 120, 140, 0.09)" />
          <stop offset="100%" stopColor="rgba(90, 120, 140, 0)" />
        </radialGradient>
        <filter id="geo-map-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width={width} height={height} fill="url(#geo-map-sea)" />

      {/* Context first: every other country, present but recessive. */}
      <g className="geo-map-base">
        {view.features?.length === 0 ? null : null}
        {(features || []).map((f) => {
          if (byName.has(f.properties.name)) return null;
          const d = path(f);
          if (!d) return null;
          return <path key={f.properties.name} d={d} />;
        })}
      </g>

      {/* Then the countries that produced something, shaded by how much. */}
      <g className="geo-map-active">
        {producing.map((f) => {
          const entry = byName.get(f.properties.name);
          const d = path(f);
          if (!d) return null;
          const isActive = activeAtlas === f.properties.name;
          return (
            <path
              key={f.properties.name}
              d={d}
              fill={rampColor(entry.weight)}
              className={`geo-map-country${isActive ? " is-active" : ""}`}
              filter={isActive ? "url(#geo-map-glow)" : undefined}
              onMouseEnter={() => onHover?.(entry)}
              onClick={() => onSelect?.(entry)}
            >
              <title>{`${entry.name} · ${formatValue(entry.value)}`}</title>
            </path>
          );
        })}
      </g>

      {/* Names last, so nothing draws over them. */}
      <g className="geo-map-labels">
        {labels.map((l) => (
          <text key={l.key} x={l.cx} y={l.cy} textAnchor="middle">
            <tspan className="geo-map-label-name">{l.name}</tspan>
            {l.h >= 34 ? (
              <tspan className="geo-map-label-value" x={l.cx} dy="11">
                {formatValue(l.value)}
              </tspan>
            ) : null}
          </text>
        ))}
      </g>
    </svg>
  );
}
