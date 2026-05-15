// Role + permission helpers — pure, no React.

export const normalizeRoleKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

export const isLeadershipRole = (role) => {
  const normalized = normalizeRoleKey(role);
  return normalized === "boss" || normalized === "teamleader";
};
