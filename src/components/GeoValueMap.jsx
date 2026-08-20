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

// One accent, and size carries the value.
//
// Two things this is not. It is not a colour per country: the palette that
// preceded it assigned colours by index over 33 GEOs, so Colombia and Mexico
// both came out purple and the hue meant nothing. And it is not a ramp of
// shades either — a dashboard built from tables and bars reads a filled
// choropleth as a different kind of object, and it never sat right next to
// them. A square per country in the same green the bars use, sized by value,
// says the same thing in the page's own language.
export const MAP_ACCENT = "#36d07c";
const MARKER_MAX = 17;
const MARKER_MIN = 4;
// sqrt so the SQUARE'S AREA tracks the value. Sizing the side by the value
// would make a 4x country look 16x bigger.
export const markerSide = (weight) =>
  MARKER_MIN + (MARKER_MAX - MARKER_MIN) * Math.sqrt(Math.max(0, Math.min(1, weight || 0)));

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

  const markers = producing
    .map((f) => {
      const entry = byName.get(f.properties.name);
      const [cx, cy] = path.centroid(f);
      return {
        key: f.properties.name,
        name: entry?.name || f.properties.name,
        iso: entry?.iso,
        value: entry?.value,
        side: markerSide(entry?.weight),
        cx,
        cy,
        entry,
      };
    })
    .filter((m) => Number.isFinite(m.cx) && Number.isFinite(m.cy))
    // Biggest first, so when two labels collide the larger country keeps its
    // name — and so smaller squares draw over larger ones rather than under.
    .sort((a, b) => b.side - a.side);

  // A label needs room, and it must not land on somebody else's square.
  //
  // Coastal neighbours put centroids within a few pixels of each other —
  // Colombia sits directly above Ecuador — and a two-line label is about 20px
  // tall on top of the square it hangs from. Dropping a label on the first
  // collision cost Colombia, second by revenue, its name while Peru at a
  // seventh of the value kept one. So each label gets a second chance above
  // its square before it is given up.
  const LABEL_W = 62;
  const LABEL_H = 32;
  const placed = [];
  markers.forEach((m) => {
    const candidates = [
      { anchor: m.cy + m.side / 2 + 11, dir: "below" },
      { anchor: m.cy - m.side / 2 - 14, dir: "above" },
    ];
    const spot = candidates.find(({ anchor }) => {
      const clashesLabel = placed.some(
        (other) => Math.abs(other.cx - m.cx) < LABEL_W && Math.abs(other.anchor - anchor) < LABEL_H
      );
      if (clashesLabel) return false;
      // A name across another country's square buries the marker the map
      // exists to show.
      return !markers.some(
        (other) =>
          other.key !== m.key &&
          Math.abs(other.cx - m.cx) < LABEL_W / 2 + other.side / 2 &&
          Math.abs(other.cy - (anchor + 5)) < 14 + other.side / 2
      );
    });
    if (spot) placed.push({ ...m, anchor: spot.anchor, dir: spot.dir });
  });
  const labelled = placed;

  return (
    <svg
      className="geo-map"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={
        producing.length
          ? `${producing.length} countries with activity, marked by value`
          : emptyLabel
      }
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Outlines only. The landmass is context for the markers, not the
          subject — a filled choropleth was the part that read as foreign. */}
      <g className="geo-map-base">
        {(features || []).map((f) => {
          const d = path(f);
          if (!d) return null;
          return (
            <path
              key={f.properties.name}
              d={d}
              className={byName.has(f.properties.name) ? "is-producing" : undefined}
            />
          );
        })}
      </g>

      <g className="geo-map-markers">
        {markers.map((m) => {
          const isActive = activeAtlas === toAtlasName(m.name);
          return (
            <g
              key={m.key}
              className={`geo-map-marker${isActive ? " is-active" : ""}`}
              onMouseEnter={() => onHover?.(m.entry)}
              onClick={() => onSelect?.(m.entry)}
            >
              <rect
                x={m.cx - m.side / 2}
                y={m.cy - m.side / 2}
                width={m.side}
                height={m.side}
                rx={1.5}
                fill={MAP_ACCENT}
              />
              <title>{`${m.name} · ${formatValue(m.value)}`}</title>
            </g>
          );
        })}
      </g>

      <g className="geo-map-labels">
        {labelled.map((m) => (
          <text key={m.key} x={m.cx} y={m.anchor} textAnchor="middle">
            <tspan className="geo-map-label-name">{m.name}</tspan>
            <tspan className="geo-map-label-value" x={m.cx} dy="10">
              {formatValue(m.value)}
            </tspan>
          </text>
        ))}
      </g>
    </svg>
  );
}
