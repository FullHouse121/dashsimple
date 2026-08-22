// Status → dot colour, for the flat status dropdowns (pixels/domains/accounts).
export const STATUS_DOT_COLOR = {
  active: "#36d07c",
  pending: "#ffc94d",
  paused: "#ffb37a",
  expired: "#8a93a3",
  blocked: "#ff8a7a",
};

export const STATUS_VALUES = ["Active", "Pending", "Paused", "Expired", "Blocked"];

export const buildStatusOptions = (t) =>
  STATUS_VALUES.map((s) => ({ value: s, label: t(s), dot: STATUS_DOT_COLOR[s.toLowerCase()] || "#8a93a3" }));

