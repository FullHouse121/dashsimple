// Role + permission helpers — pure, no React.

export const normalizeRoleKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

export const isLeadershipRole = (role) => {
  const normalized = normalizeRoleKey(role);
  return normalized === "boss" || normalized === "teamleader";
};

export const isBossRole = (role) => normalizeRoleKey(role) === "boss";

// Account passwords / 2FA / mailbox credentials: the buyer who owns the
// account, plus leadership (Boss and Team Leaders), who already see every
// account row. Mirrors canAccessAccountCredentials() on the server — the
// server is the enforcement point, this only decides what to render.
export const canReadAccountCredentials = (user, row) => {
  if (isLeadershipRole(user?.role)) return true;
  const ownerId = Number.parseInt(row?.owner_id, 10);
  const userId = Number.parseInt(user?.id, 10);
  return Number.isFinite(ownerId) && ownerId > 0 && ownerId === userId;
};
