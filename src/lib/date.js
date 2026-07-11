// Date utilities — pure functions, no React.
// All date math is done in ISO strings (YYYY-MM-DD) for timezone safety.

export const shortMonths = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const DASHBOARD_TIMEZONE = "Asia/Dubai";

export const formatIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTimezoneDateParts = (date = new Date(), timezone = DASHBOARD_TIMEZONE) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(date);
    const year = Number.parseInt(parts.find((p) => p.type === "year")?.value || "", 10);
    const month = Number.parseInt(parts.find((p) => p.type === "month")?.value || "", 10);
    const day = Number.parseInt(parts.find((p) => p.type === "day")?.value || "", 10);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      throw new Error("Failed to parse timezone date parts.");
    }
    return { year, month, day };
  } catch (error) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
};

export const toIsoFromParts = ({ year, month, day }) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const parseIsoToUtcDate = (isoDate) => {
  const match = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

export const shiftIsoDate = (isoDate, deltaDays) => {
  const utcDate = parseIsoToUtcDate(isoDate);
  if (!utcDate || !Number.isFinite(deltaDays)) return isoDate;
  utcDate.setUTCDate(utcDate.getUTCDate() + deltaDays);
  return `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, "0")}-${String(
    utcDate.getUTCDate()
  ).padStart(2, "0")}`;
};

export const getTodayIsoInTimezone = (timezone = DASHBOARD_TIMEZONE) =>
  toIsoFromParts(getTimezoneDateParts(new Date(), timezone));

// Given a current {from,to} ISO range, return the immediately-preceding range
// of the same length — powers "compare to previous period".
export const previousRangeOf = (from, to) => {
  const start = parseIsoToUtcDate(from);
  const end = parseIsoToUtcDate(to);
  if (!start || !end) return { from: null, to: null };
  const days = Math.round((end - start) / 86400000) + 1;
  const prevTo = shiftIsoDate(from, -1);
  const prevFrom = shiftIsoDate(prevTo, -(days - 1));
  return { from: prevFrom, to: prevTo };
};

export const getDefaultDateRange = () => {
  const todayIso = getTodayIsoInTimezone();
  return { from: shiftIsoDate(todayIso, -6), to: todayIso };
};

export const normalizeDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return formatIsoDate(value);
  }
  const text = String(value || "").trim();
  if (!text) return null;
  const direct = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (direct) {
    return `${direct[1]}-${direct[2]}-${direct[3]}`;
  }
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) return null;
  return formatIsoDate(parsed);
};

export const normalizeDateRange = (from, to) => {
  let normalizedFrom = normalizeDateValue(from);
  let normalizedTo = normalizeDateValue(to);
  if (normalizedFrom && normalizedTo && normalizedFrom > normalizedTo) {
    [normalizedFrom, normalizedTo] = [normalizedTo, normalizedFrom];
  }
  return { from: normalizedFrom, to: normalizedTo };
};

export const getPeriodDateRange = (value, customRange) => {
  const todayIso = getTodayIsoInTimezone();
  const todayParts = getTimezoneDateParts(new Date(), DASHBOARD_TIMEZONE);
  const startOfMonthIso = `${todayParts.year}-${String(todayParts.month).padStart(2, "0")}-01`;
  const startOfLastMonthIso =
    todayParts.month === 1
      ? `${todayParts.year - 1}-12-01`
      : `${todayParts.year}-${String(todayParts.month - 1).padStart(2, "0")}-01`;
  const endOfLastMonthIso = shiftIsoDate(startOfMonthIso, -1);
  const day = parseIsoToUtcDate(todayIso)?.getUTCDay?.() ?? 0;
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const startOfWeekIso = shiftIsoDate(todayIso, mondayOffset);
  const startOfLastWeekIso = shiftIsoDate(startOfWeekIso, -7);
  const endOfLastWeekIso = shiftIsoDate(startOfWeekIso, -1);

  switch (value) {
    case "Today":
      return normalizeDateRange(todayIso, todayIso);
    case "Yesterday": {
      const yesterdayIso = shiftIsoDate(todayIso, -1);
      return normalizeDateRange(yesterdayIso, yesterdayIso);
    }
    case "This Week":
      return normalizeDateRange(startOfWeekIso, todayIso);
    case "Last Week":
      return normalizeDateRange(startOfLastWeekIso, endOfLastWeekIso);
    case "This Month":
      return normalizeDateRange(startOfMonthIso, todayIso);
    case "Last Month":
      return normalizeDateRange(startOfLastMonthIso, endOfLastMonthIso);
    case "Custom range":
      return normalizeDateRange(customRange?.from, customRange?.to);
    default:
      return { from: null, to: null };
  }
};

export const isDateInRange = (value, range) => {
  const day = normalizeDateValue(value);
  if (!range?.from && !range?.to) return true;
  if (!day) return false;
  if (range?.from && day < range.from) return false;
  if (range?.to && day > range.to) return false;
  return true;
};
