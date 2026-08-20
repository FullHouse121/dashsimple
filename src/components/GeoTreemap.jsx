// Where the money came from, as area.
//
// This replaces a map, after three attempts at making one work. The problem
// was never the drawing — it was the format against this data. Traffic here is
// ~90% Latin America with a long tail scattered across the world, so a world
// projection either frames the region and drops Nigeria off the edge entirely,
// or frames the globe and squeezes the countries that matter into a smudge.
// A country listed in the table beside it could not be found on it.
//
// A treemap has no outside. Every country that produced anything gets a tile,
// its area is its share, and the smallest one is still on screen — Nigeria at
// 0.4% of revenue is a small tile rather than a missing one. It also reads in
// the same rectilinear language as the tables and bars around it, which the
// landmass never did.
import React from "react";

export const ACCENT = "#36d07c";

// Squarified treemap (Bruls, Huizing & van Wijk).
//
// Laying tiles out in plain rows gives slivers — a 0.4% country becomes a
// 2px-wide strip nobody can hover or read. Squarify picks each row's length to
// keep tiles as close to square as it can, which is what makes the small ones
// usable.
const worstRatio = (areas, rowArea, side) => {
  if (rowArea <= 0 || side <= 0) return Infinity;
  const thickness = rowArea / side;
  let worst = 0;
  for (const area of areas) {
    const length = area / thickness;
    if (length <= 0) return Infinity;
    const ratio = Math.max(thickness / length, length / thickness);
    if (ratio > worst) worst = ratio;
  }
  return worst;
};

export const squarify = (items, x, y, w, h) => {
  const out = [];
  const queue = [...items].filter((i) => Number(i.value) > 0).sort((a, b) => b.value - a.value);
  let remaining = queue.reduce((acc, i) => acc + i.value, 0);
  if (!(remaining > 0) || w <= 0 || h <= 0) return out;

  const rect = { x, y, w, h };
  while (queue.length) {
    // Area per unit of value, recomputed for what is left of the rectangle.
    const scale = (rect.w * rect.h) / remaining;
    const side = Math.min(rect.w, rect.h);
    const row = [];
    let rowValue = 0;
    let bestRatio = Infinity;

    while (queue.length) {
      const candidateValue = rowValue + queue[0].value;
      const areas = [...row, queue[0]].map((i) => i.value * scale);
      const ratio = worstRatio(areas, candidateValue * scale, side);
      // Keep adding while the row's worst tile is getting squarer, not worse.
      if (row.length === 0 || ratio <= bestRatio) {
        row.push(queue.shift());
        rowValue = candidateValue;
        bestRatio = ratio;
      } else {
        break;
      }
    }

    const rowArea = rowValue * scale;
    const thickness = side > 0 ? rowArea / side : 0;
    // Lay the row along the shorter side, so the strip itself stays chunky.
    const horizontal = rect.w < rect.h;
    let offset = 0;
    row.forEach((item) => {
      const length = thickness > 0 ? (item.value * scale) / thickness : 0;
      out.push(
        horizontal
          ? { ...item, x: rect.x + offset, y: rect.y, w: length, h: thickness }
          : { ...item, x: rect.x, y: rect.y + offset, w: thickness, h: length }
      );
      offset += length;
    });

    if (horizontal) {
      rect.y += thickness;
      rect.h -= thickness;
    } else {
      rect.x += thickness;
      rect.w -= thickness;
    }
    remaining -= rowValue;
    if (rect.w <= 0.5 || rect.h <= 0.5) break;
  }
  return out;
};

export default function GeoTreemap({
  rows = [],
  activeKey = null,
  onHover,
  onSelect,
  formatValue = (v) => String(v),
  width = 308,
  height = 400,
  emptyLabel = "Nothing in range",
}) {
  const tiles = React.useMemo(() => {
    const max = rows.reduce((acc, r) => Math.max(acc, Number(r.value) || 0), 0);
    const gap = 2;
    return squarify(rows, 0, 0, width, height).map((tile) => ({
      ...tile,
      // Inset every tile by the same gap rather than drawing gridlines: the
      // background shows through as the separator.
      ix: tile.x + gap / 2,
      iy: tile.y + gap / 2,
      iw: Math.max(0, tile.w - gap),
      ih: Math.max(0, tile.h - gap),
      // One hue. Depth separates neighbours and ranks them; it does not add a
      // second encoding, because area already carries the value.
      opacity: 0.34 + 0.56 * Math.sqrt(max > 0 ? (Number(tile.value) || 0) / max : 0),
    }));
  }, [rows, width, height]);

  if (!tiles.length) {
    return (
      <div className="geo-tree geo-tree-empty" style={{ height }}>
        <span>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <svg
      className="geo-tree"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={`${tiles.length} countries, sized by share`}
      onMouseLeave={() => onHover?.(null)}
    >
      {tiles.map((tile) => {
        const isActive = activeKey != null && tile.key === activeKey;
        // A label needs its own tile to hold it. Anything smaller keeps the
        // tile, the hover and the tooltip; the table carries its name.
        const showName = tile.iw >= 52 && tile.ih >= 20;
        const showValue = tile.iw >= 58 && tile.ih >= 34;
        return (
          <g
            key={tile.key}
            className={`geo-tile${isActive ? " is-active" : ""}`}
            onMouseEnter={() => onHover?.(tile)}
            onClick={() => onSelect?.(tile)}
          >
            <rect
              x={tile.ix}
              y={tile.iy}
              width={tile.iw}
              height={tile.ih}
              rx={3}
              fill={ACCENT}
              fillOpacity={tile.opacity}
            />
            {showName ? (
              <text x={tile.ix + 8} y={tile.iy + 15}>
                <tspan className="geo-tile-name">{tile.label}</tspan>
                {showValue ? (
                  <tspan className="geo-tile-value" x={tile.ix + 8} dy="13">
                    {formatValue(tile.value)}
                  </tspan>
                ) : null}
              </text>
            ) : null}
            <title>{`${tile.label} · ${formatValue(tile.value)}`}</title>
          </g>
        );
      })}
    </svg>
  );
}
