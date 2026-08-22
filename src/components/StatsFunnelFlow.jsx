import React from "react";

// Per-step conversion funnel (Mixpanel-style): each stage is a full-height
// track card whose fill is the conversion FROM THE PREVIOUS stage, so every
// step reads clearly no matter how many orders of magnitude the funnel spans.
// Absolute counts sit on top, step drop-offs live in the gaps, overall rates
// in the panel footer.
export function StatsFunnelFlow({ stages }) {
  const compact = (value) => {
    const abs = Math.abs(value);
    if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return `${value}`;
  };
  const fmtRate1 = (value) =>
    value === null || value === undefined || Number.isNaN(value) ? "—" : `${value.toFixed(1)}%`;
  return (
    <div className="sfv2">
      {stages.map((stage, i) => {
        const stepRate = i === 0 ? 100 : stage.rate;
        const fillPct = Math.max(0, Math.min(100, Number(stepRate) || 0));
        const dropped = i > 0 ? stages[i - 1].value - stage.value : 0;
        return (
          <React.Fragment key={stage.key}>
            {i > 0 ? (
              <div className="sfv2-gap">
                <span className="sfv2-gap-drop">
                  {dropped === 0 ? "±0" : dropped > 0 ? `−${compact(dropped)}` : `+${compact(-dropped)}`}
                </span>
              </div>
            ) : null}
            <div
              className="sfv2-stage"
              title={`${stage.label}: ${stage.value.toLocaleString()} · ${fmtRate1(stage.share)} of ${stages[0].label.toLowerCase()}`}
            >
              <div
                className="sfv2-card"
                style={{
                  "--stage-color": stage.color,
                  background: `linear-gradient(180deg, ${stage.color}0e, rgba(255, 255, 255, 0.012) 46%)`,
                }}
              >
                <span
                  className="sfv2-card-accent"
                  style={{ background: `linear-gradient(90deg, ${stage.color}, ${stage.color}00)` }}
                />
                <div className="sfv2-card-head">
                  <span className="sfv2-label">
                    <i style={{ background: stage.color, boxShadow: `0 0 6px ${stage.color}88` }} />
                    {stage.label}
                  </span>
                  <div className="sfv2-count">{stage.value.toLocaleString()}</div>
                  <div className="sfv2-sub">
                    {i === 0 ? "entered" : `${fmtRate1(stage.share)} of ${stages[0].label.toLowerCase()}`}
                  </div>
                </div>
                <div className="sfv2-track">
                  <span className="sfv2-pct">
                    {fmtRate1(stepRate)}
                    {i > 0 ? <em>of prev</em> : <em>baseline</em>}
                  </span>
                  <div
                    className="sfv2-fill"
                    style={{
                      height: `${fillPct}%`,
                      background: `linear-gradient(180deg, ${stage.color}d9 0%, ${stage.color}59 55%, ${stage.color}1f 100%)`,
                      boxShadow: `inset 0 1.5px 0 ${stage.color}, 0 0 18px ${stage.color}33`,
                    }}
                  />
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
