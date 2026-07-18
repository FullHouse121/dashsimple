// Shared vocabulary of the live feeds (Live Clicks / Conversions views and
// the dashboard Last Clicks preview).

export const LIVE_CLICKS_WINDOWS = [
  { value: "15", label: "Last 15 min" },
  { value: "30", label: "Last 30 min" },
  { value: "60", label: "Last hour" },
  { value: "180", label: "Last 3 hours" },
  { value: "720", label: "Last 12 hours" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "previous_month", label: "Previous month" },
];
export const LIVE_CLICKS_IS_ROLLING = (value) => /^\d+$/.test(String(value));
export const LIVE_CLICKS_RENDER_CAP = 120;
// Team-standard meaning of each sub slot (mirrors the UTM builder's macro
// set: sub1={{placement}}, sub3-5 campaign/adset/ad names, sub6 adset id...).
export const SUB_MEANINGS = {
  1: "Placement",
  2: "Buyer Tag",
  3: "Campaign Name",
  4: "Adset Name",
  5: "Ad Name",
  6: "Adset ID",
  7: "Approach",
  8: "Approach Name",
  9: "GEO",
  10: "Ad Account",
  11: "Source",
};
export const liveClickSubIssues = (row) => {
  const issues = [];
  for (let i = 1; i <= 11; i += 1) {
    const value = String(row.subs?.[i] ?? "").trim();
    if (!value || /^\{.+\}$/.test(value)) issues.push(i);
  }
  return issues;
};

