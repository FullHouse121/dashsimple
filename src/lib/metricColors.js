// One colour, one concept — for every chart on the page.
//
// These were declared separately in each chart's own series list, and they
// drifted. Green was FTDs in the Overview chart and Register in the funnel
// directly below it; orange was ROI, FTD and Reg2Dep at the same time. A
// reader who learns "green = FTD" from the top chart then reads the funnel
// wrong, which is worse than having no colour coding at all.
//
// Overview already held the mapping everything else should have followed, so
// that is the one lifted here.
export const METRIC_COLORS = {
  clicks: "var(--blue)",
  registration: "var(--purple)",
  install: "var(--pink)",
  ftd: "var(--green)",
  redeposit: "var(--teal)",
  roi: "var(--orange)",
  revenue: "var(--yellow)",
};

// A conversion rate is coloured by what it produces.
//
// "Register → Deposit" is the rate at which deposits appear, so it carries the
// deposit colour rather than an arbitrary one of its own. That way a series
// keeps its meaning whether it is drawn as a count (the funnel), a rate over
// time (Statistics), or a single figure (the handoff panel).
export const RATE_COLORS = {
  c2i: METRIC_COLORS.install,
  c2r: METRIC_COLORS.registration,
  i2r: METRIC_COLORS.registration,
  r2d: METRIC_COLORS.ftd,
};

// Funnel stages, keyed by the stage name used in the chart data.
export const STAGE_COLORS = {
  Clicks: METRIC_COLORS.clicks,
  Install: METRIC_COLORS.install,
  Register: METRIC_COLORS.registration,
  FTD: METRIC_COLORS.ftd,
};
