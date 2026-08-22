// A 120x28 trace of one series. Hand-drawn rather than a fifth Recharts
// container: at this size the axis machinery costs more than the line.
export function Sparkline({ values, color, width = 120, height = 28 }) {
  if (!Array.isArray(values) || values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  // 2px of padding top and bottom so the endpoint dot is never clipped.
  const y = (v) => height - 2 - ((v - min) / span) * (height - 4);
  const points = values.map((v, i) => `${(i * stepX).toFixed(2)},${y(v).toFixed(2)}`);
  const lastX = (values.length - 1) * stepX;
  const lastY = y(values[values.length - 1]);
  const gradientId = `spark-${String(color).replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points.join(" ")} ${lastX},${height}`} fill={`url(#${gradientId})`} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2.4" fill={color} />
    </svg>
  );
}

// 7-day unique-clicks curve for a flow card — deliberately axis-free: it
// only has to answer "is this flow climbing, flat, or dying?".
export function FlowSparkline({ values, width = 92, height = 30 }) {
  const series = Array.isArray(values) && values.length ? values.map((v) => Number(v) || 0) : null;
  if (!series || series.length < 2) return null;
  // All zeros: a solid line would read as data. Show a dashed baseline.
  if (!series.some((v) => v > 0)) {
    return (
      <svg className="flow-spark is-empty" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <line x1="0" y1={height - 4} x2={width} y2={height - 4} stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 4" strokeLinecap="round" />
      </svg>
    );
  }
  const max = Math.max(...series, 1);
  const stepX = width / (series.length - 1);
  const y = (v) => height - 3 - (v / max) * (height - 7);
  const points = series.map((v, i) => [i * stepX, y(v)]);
  const line = points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const [lastX, lastY] = points[points.length - 1];
  const gradientId = `flow-spark-${series.join("-")}-${width}`;
  return (
    <svg className="flow-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--green, #36d07c)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--green, #36d07c)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke="var(--green, #36d07c)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.4" fill="var(--green, #36d07c)" />
    </svg>
  );
}

// Tiny inline trend line for table rows — plain SVG, no axes, one hue.
export const MiniSparkline = ({ values, width = 84, height = 22, stroke = "#199e70" }) => {
  if (!values || values.length < 2) return <span className="offer-muted">—</span>;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} className="mini-sparkline" aria-hidden="true">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};
