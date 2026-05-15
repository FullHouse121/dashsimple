import React from "react";

/**
 * Skeleton primitives — DEUS-styled placeholders that mimic real content shapes.
 * Use while data is being fetched so the layout doesn't shift when it arrives.
 */
export function Skeleton({ width, height, radius = 6, className = "", style = {} }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/** A row of N skeleton stat cards mirroring the home dashboard layout. */
export function SkeletonCards({ count = 4 }) {
  return (
    <section className="cards">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card skeleton-card" key={i}>
          <div className="skeleton-row">
            <Skeleton width={18} height={18} radius={5} />
            <Skeleton width="40%" height={12} />
          </div>
          <Skeleton width="60%" height={28} radius={6} />
          <Skeleton width="50%" height={11} />
        </div>
      ))}
    </section>
  );
}

/** A skeleton for a chart panel — title, subtitle, and a tall bar area. */
export function SkeletonChart({ height = 240 }) {
  return (
    <div className="panel skeleton-panel">
      <div className="skeleton-stack">
        <Skeleton width="40%" height={14} />
        <Skeleton width="65%" height={10} />
      </div>
      <Skeleton width="100%" height={height} radius={12} />
    </div>
  );
}
