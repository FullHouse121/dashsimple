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
  { value: "custom", label: "Custom range" },
];
// How far back a deep click lookup has to reach to cover the selected window.
//
// The lookup used to ask Keitaro for a flat 30 days no matter what the window
// said, so a click the user could see they had asked for — "Previous month",
// a click from the 15th — came back "not found" on the 17th of the next
// month, because 30 days only reached the 18th. The window is the user's
// stated intent; the lookup has to at least cover it.
//
// Keitaro's side caps at 90, and the extra days are cheap: the query is an
// indexed id match, not a scan.
export const liveClicksLookupDays = (windowValue, customRange, now = new Date()) => {
  const daysSince = (d) => Math.ceil((now - d) / 86400000) + 1;
  const value = String(windowValue || "");

  if (value === "custom") {
    const from = customRange?.from ? new Date(`${customRange.from}T00:00:00`) : null;
    return from && !Number.isNaN(from.getTime()) ? Math.min(90, Math.max(30, daysSince(from))) : 30;
  }
  if (value === "previous_month") {
    // The first day of last month, which on the 1st of a month is 60+ days.
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return Math.min(90, Math.max(30, daysSince(first)));
  }
  if (value === "this_month") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return Math.min(90, Math.max(30, daysSince(first)));
  }
  // Rolling windows and the short named ones are all inside 30 days, and a
  // lookup is only ever run because the in-window search already came back
  // empty — so reaching further than the window is the point, not a bug.
  return 30;
};

export const LIVE_CLICKS_IS_CUSTOM = (value) => String(value) === "custom";
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

