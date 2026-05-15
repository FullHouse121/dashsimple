// Sort helpers — pure, no React. Used by data tables across the dashboard.

export const toggleSortConfig = (prev, key, defaultDir = "desc") =>
  prev.key === key
    ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
    : { key, dir: defaultDir };

export const compareSortValues = (aVal, bVal, dir = "desc", type = "number") => {
  const direction = dir === "asc" ? 1 : -1;
  const isNullish = (value) =>
    value === null ||
    value === undefined ||
    (type !== "text" && type !== "date" && Number.isNaN(value));

  const aNull = isNullish(aVal);
  const bNull = isNullish(bVal);
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;

  if (type === "text" || type === "date") {
    return direction * String(aVal || "").localeCompare(String(bVal || ""));
  }

  if (aVal === bVal) return 0;
  return direction * (aVal > bVal ? 1 : -1);
};

export const getSortIndicator = (sortConfig, key) => {
  if (sortConfig.key !== key) return "↕";
  return sortConfig.dir === "asc" ? "▲" : "▼";
};
