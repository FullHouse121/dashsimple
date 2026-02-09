import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "finance.db");
const db = new Database(dbPath);

// Initialize table
// NOTE: Keep column names stable for future migrations.
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    country TEXT NOT NULL,
    category TEXT NOT NULL,
    reference TEXT,
    billing_type TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS media_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    buyer TEXT NOT NULL,
    country TEXT,
    spend REAL,
    clicks INTEGER NOT NULL,
    installs INTEGER,
    registers INTEGER NOT NULL,
    ftds INTEGER NOT NULL,
    redeposits INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer TEXT NOT NULL,
    country TEXT,
    period TEXT NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    clicks_target INTEGER,
    registers_target INTEGER,
    ftds_target INTEGER,
    spend_target REAL,
    r2d_target REAL,
    is_global INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS media_buyers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    country TEXT,
    approach TEXT,
    game TEXT,
    email TEXT,
    contact TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keitaro_id TEXT,
    name TEXT NOT NULL,
    buyer TEXT NOT NULL,
    country TEXT,
    domain TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS install_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    campaign_id TEXT,
    buyer TEXT NOT NULL,
    country TEXT,
    domain TEXT,
    device TEXT,
    click_id TEXT,
    source TEXT,
    raw TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS conversion_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    event_type TEXT NOT NULL,
    campaign_id TEXT,
    buyer TEXT NOT NULL,
    country TEXT,
    domain TEXT,
    device TEXT,
    click_id TEXT,
    source TEXT,
    raw TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS device_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    device TEXT NOT NULL,
    buyer TEXT,
    country TEXT,
    spend REAL,
    revenue REAL,
    clicks INTEGER NOT NULL,
    registers INTEGER NOT NULL,
    ftds INTEGER NOT NULL,
    redeposits INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_keitaro_id
  ON campaigns (keitaro_id);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_install_events_date_buyer_country
  ON install_events (date, buyer, country);
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_install_events_click_campaign
  ON install_events (click_id, campaign_id);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_conversion_events_date_buyer_country
  ON conversion_events (date, buyer, country);
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_device_stats_key
  ON device_stats (date, device, buyer, country);
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    buyer_id INTEGER,
    verified INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    permissions TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const allPermissions = [
  "dashboard",
  "goals",
  "finances",
  "utm",
  "statistics",
  "devices",
  "domains",
  "api",
  "media_buyers",
  "roles",
];

const roleSeed = [
  {
    name: "Boss",
    permissions: allPermissions,
  },
  {
    name: "Team Leader",
    permissions: allPermissions,
  },
  {
    name: "Media Buyer Senior",
    permissions: ["dashboard", "utm", "statistics", "goals"],
  },
  {
    name: "Media Buyer",
    permissions: ["dashboard", "utm", "statistics"],
  },
  {
    name: "Media Buyer Junior",
    permissions: ["dashboard", "statistics"],
  },
];

const insertRoleSeed = db.prepare(
  `INSERT OR IGNORE INTO roles (name, permissions)
   VALUES (@name, @permissions)`
);
const roleCount = db.prepare("SELECT COUNT(*) as count FROM roles").get().count;
if (roleCount === 0) {
  roleSeed.forEach((role) => {
    insertRoleSeed.run({ name: role.name, permissions: JSON.stringify(role.permissions) });
  });
}
const ensureRolePermissions = (name, permissions) => {
  const row = db.prepare("SELECT id, permissions FROM roles WHERE name = ?").get(name);
  if (!row) {
    insertRoleSeed.run({ name, permissions: JSON.stringify(permissions) });
    return;
  }
  let current = [];
  try {
    current = JSON.parse(row.permissions || "[]");
  } catch (error) {
    current = [];
  }
  const merged = Array.from(new Set([...current, ...permissions]));
  if (merged.length !== current.length) {
    db.prepare("UPDATE roles SET permissions = ? WHERE id = ?").run(JSON.stringify(merged), row.id);
  }
};
roleSeed.filter((role) => ["Boss", "Team Leader"].includes(role.name)).forEach((role) => {
  ensureRolePermissions(role.name, role.permissions);
});

const goalColumns = db.prepare("PRAGMA table_info(goals)").all();
const hasR2dTarget = goalColumns.some((col) => col.name === "r2d_target");
if (!hasR2dTarget) {
  db.exec("ALTER TABLE goals ADD COLUMN r2d_target REAL;");
}
const hasGoalCountry = goalColumns.some((col) => col.name === "country");
if (!hasGoalCountry) {
  db.exec("ALTER TABLE goals ADD COLUMN country TEXT;");
}

const mediaBuyerColumns = db.prepare("PRAGMA table_info(media_buyers)").all();
const hasBuyerApproach = mediaBuyerColumns.some((col) => col.name === "approach");
if (!hasBuyerApproach) {
  db.exec("ALTER TABLE media_buyers ADD COLUMN approach TEXT;");
}
const hasBuyerGame = mediaBuyerColumns.some((col) => col.name === "game");
if (!hasBuyerGame) {
  db.exec("ALTER TABLE media_buyers ADD COLUMN game TEXT;");
}

const userColumns = db.prepare("PRAGMA table_info(users)").all();
const hasUserVerified = userColumns.some((col) => col.name === "verified");
if (!hasUserVerified) {
  db.exec("ALTER TABLE users ADD COLUMN verified INTEGER NOT NULL DEFAULT 1;");
}

// Lightweight migration for older databases missing the country column.
const mediaColumns = db.prepare("PRAGMA table_info(media_stats)").all();
const hasCountry = mediaColumns.some((col) => col.name === "country");
if (!hasCountry) {
  db.exec("ALTER TABLE media_stats ADD COLUMN country TEXT;");
}
const hasRedeps = mediaColumns.some((col) => col.name === "redeposits");
if (!hasRedeps) {
  db.exec("ALTER TABLE media_stats ADD COLUMN redeposits INTEGER;");
}

const installColumns = db.prepare("PRAGMA table_info(install_events)").all();
const hasInstallDevice = installColumns.some((col) => col.name === "device");
if (!hasInstallDevice) {
  db.exec("ALTER TABLE install_events ADD COLUMN device TEXT;");
}
const hasInstallDomain = installColumns.some((col) => col.name === "domain");
if (!hasInstallDomain) {
  db.exec("ALTER TABLE install_events ADD COLUMN domain TEXT;");
}

const conversionColumns = db.prepare("PRAGMA table_info(conversion_events)").all();
const hasConversionDomain = conversionColumns.some((col) => col.name === "domain");
if (!hasConversionDomain) {
  db.exec("ALTER TABLE conversion_events ADD COLUMN domain TEXT;");
}
const hasConversionDevice = conversionColumns.some((col) => col.name === "device");
if (!hasConversionDevice) {
  db.exec("ALTER TABLE conversion_events ADD COLUMN device TEXT;");
}

const deviceColumns = db.prepare("PRAGMA table_info(device_stats)").all();
const hasDeviceRedeps = deviceColumns.some((col) => col.name === "redeposits");
if (!hasDeviceRedeps) {
  db.exec("ALTER TABLE device_stats ADD COLUMN redeposits INTEGER;");
}

const campaignColumns = db.prepare("PRAGMA table_info(campaigns)").all();
const hasCampaignDomain = campaignColumns.some((col) => col.name === "domain");
if (!hasCampaignDomain) {
  db.exec("ALTER TABLE campaigns ADD COLUMN domain TEXT;");
}

const goalsColumns = db.prepare("PRAGMA table_info(goals)").all();
const hasGoalsGlobal = goalsColumns.some((col) => col.name === "is_global");
if (!hasGoalsGlobal) {
  db.exec("ALTER TABLE goals ADD COLUMN is_global INTEGER NOT NULL DEFAULT 0;");
}

const insertExpense = db.prepare(
  `INSERT INTO expenses (date, country, category, reference, billing_type, amount, status)
   VALUES (@date, @country, @category, @reference, @billing_type, @amount, @status)`
);

const selectExpenses = db.prepare(
  `SELECT id, date, country, category, reference, billing_type, amount, status
   FROM expenses
   ORDER BY date DESC, id DESC
   LIMIT ?`
);

const insertMediaStat = db.prepare(
  `INSERT INTO media_stats (date, buyer, country, spend, clicks, installs, registers, ftds, redeposits)
   VALUES (@date, @buyer, @country, @spend, @clicks, @installs, @registers, @ftds, @redeposits)`
);

const selectMediaStats = db.prepare(
  `SELECT id, date, buyer, country, spend, clicks, installs, registers, ftds, redeposits
   FROM media_stats
   ORDER BY date DESC, id DESC
   LIMIT ?`
);

const insertGoal = db.prepare(
  `INSERT INTO goals (buyer, country, period, date_from, date_to, clicks_target, registers_target, ftds_target, spend_target, r2d_target, is_global, notes)
   VALUES (@buyer, @country, @period, @date_from, @date_to, @clicks_target, @registers_target, @ftds_target, @spend_target, @r2d_target, @is_global, @notes)`
);

const selectGoals = db.prepare(
  `SELECT id, buyer, country, period, date_from, date_to, clicks_target, registers_target, ftds_target, spend_target, r2d_target, is_global, notes
   FROM goals
   ORDER BY date_from DESC, id DESC
   LIMIT ?`
);

const deleteGoal = db.prepare(`DELETE FROM goals WHERE id = ?`);

const insertMediaBuyer = db.prepare(
  `INSERT INTO media_buyers (name, role, country, approach, game, email, contact, status)
   VALUES (@name, @role, @country, @approach, @game, @email, @contact, @status)`
);

const selectMediaBuyers = db.prepare(
  `SELECT id, name, role, country, approach, game, email, contact, status
   FROM media_buyers
   ORDER BY name ASC, id DESC
   LIMIT ?`
);

const deleteMediaBuyer = db.prepare(`DELETE FROM media_buyers WHERE id = ?`);

const insertDomain = db.prepare(
  `INSERT INTO domains (domain, status)
   VALUES (@domain, @status)`
);

const selectDomains = db.prepare(
  `SELECT id, domain, status
   FROM domains
   ORDER BY domain ASC, id DESC
   LIMIT ?`
);

const deleteDomain = db.prepare(`DELETE FROM domains WHERE id = ?`);

const insertCampaign = db.prepare(
  `INSERT INTO campaigns (keitaro_id, name, buyer, country, domain)
   VALUES (@keitaro_id, @name, @buyer, @country, @domain)`
);

const selectCampaigns = db.prepare(
  `SELECT id, keitaro_id, name, buyer, country, domain
   FROM campaigns
   ORDER BY id DESC
   LIMIT ?`
);

const selectCampaignByKey = db.prepare(
  `SELECT id, keitaro_id, name, buyer, country, domain
   FROM campaigns
   WHERE keitaro_id = ? OR name = ?
   LIMIT 1`
);

const deleteCampaign = db.prepare(`DELETE FROM campaigns WHERE id = ?`);

const insertInstallEvent = db.prepare(
  `INSERT INTO install_events (date, campaign_id, buyer, country, domain, device, click_id, source, raw)
   VALUES (@date, @campaign_id, @buyer, @country, @domain, @device, @click_id, @source, @raw)`
);

const insertConversionEvent = db.prepare(
  `INSERT INTO conversion_events (date, event_type, campaign_id, buyer, country, domain, device, click_id, source, raw)
   VALUES (@date, @event_type, @campaign_id, @buyer, @country, @domain, @device, @click_id, @source, @raw)`
);

const selectInstallTotals = db.prepare(
  `SELECT date, buyer, country, COUNT(*) as installs
   FROM install_events
   GROUP BY date, buyer, country`
);

const selectConversionTotals = db.prepare(
  `SELECT date, buyer, country,
    SUM(CASE WHEN event_type = 'ftd' THEN 1 ELSE 0 END) AS ftds,
    SUM(CASE WHEN event_type = 'redeposit' THEN 1 ELSE 0 END) AS redeposits,
    SUM(CASE WHEN event_type = 'registration' THEN 1 ELSE 0 END) AS registers
   FROM conversion_events
   GROUP BY date, buyer, country`
);

const selectInstallTotalsByDevice = db.prepare(
  `SELECT date, device, COUNT(*) as installs
   FROM install_events
   GROUP BY date, device`
);

const insertDeviceStat = db.prepare(
  `INSERT INTO device_stats (date, device, buyer, country, spend, revenue, clicks, registers, ftds, redeposits)
   VALUES (@date, @device, @buyer, @country, @spend, @revenue, @clicks, @registers, @ftds, @redeposits)`
);

const selectDeviceStats = db.prepare(
  `SELECT id, date, device, buyer, country, spend, revenue, clicks, registers, ftds, redeposits
   FROM device_stats
   ORDER BY date DESC, id DESC
   LIMIT ?`
);

const deleteDeviceStat = db.prepare(
  `DELETE FROM device_stats WHERE date = ? AND device = ? AND buyer = ? AND country = ?`
);

const insertUser = db.prepare(
  `INSERT INTO users (username, password_hash, role, buyer_id, verified)
   VALUES (@username, @password_hash, @role, @buyer_id, @verified)`
);

const selectUsers = db.prepare(
  `SELECT id, username, role, buyer_id, verified
   FROM users
   ORDER BY id DESC
   LIMIT ?`
);

const selectUserByUsername = db.prepare(
  `SELECT id, username, password_hash, role, buyer_id
   FROM users
   WHERE username = ?`
);

const deleteUser = db.prepare(`DELETE FROM users WHERE id = ?`);

const insertRole = db.prepare(
  `INSERT INTO roles (name, permissions)
   VALUES (@name, @permissions)`
);

const selectRoles = db.prepare(
  `SELECT id, name, permissions
   FROM roles
   ORDER BY id ASC
   LIMIT ?`
);

const selectRoleById = db.prepare(`SELECT id, name FROM roles WHERE id = ?`);

const updateRole = db.prepare(
  `UPDATE roles
   SET permissions = @permissions
   WHERE id = @id`
);

const deleteRole = db.prepare(`DELETE FROM roles WHERE id = ?`);

const deleteMediaStat = db.prepare(
  `DELETE FROM media_stats WHERE date = ? AND buyer = ? AND country = ?`
);

const postbackSecret = process.env.POSTBACK_SECRET || "";

const normalizeBaseUrl = (value) => String(value || "").replace(/\/+$/, "");
const normalizePath = (value) => {
  if (!value) return "";
  return value.startsWith("/") ? value : `/${value}`;
};

const numberFromValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
};

const normalizeDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(millis);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const text = String(value);
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
};

const normalizeDevice = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Unknown";
  const lower = raw.toLowerCase();

  if (lower.includes("android")) return "Android";
  if (lower.includes("ios") || lower.includes("iphone") || lower.includes("ipad") || lower.includes("ipod"))
    return "iOS";
  if (lower.includes("windows")) return "Windows";
  if (lower.includes("mac") || lower.includes("os x") || lower.includes("macos")) return "macOS";
  if (lower.includes("linux")) return "Linux";
  if (lower.includes("chrome os") || lower.includes("cros")) return "ChromeOS";
  if (lower.includes("tablet")) return "Tablet";
  if (lower.includes("desktop")) return "Desktop";
  if (lower.includes("mobile") || lower.includes("phone")) return "Mobile";

  return raw;
};

const resolvePostbackContext = (payload) => {
  const campaignId =
    payload.campaign_id ||
    payload.campaignId ||
    payload.campaign ||
    payload.cid ||
    payload.campaignid ||
    "";
  const clickId =
    payload.click_id ||
    payload.clickId ||
    payload.subid ||
    payload.sub_id ||
    payload.sub1 ||
    payload.clickid ||
    "";
  const date =
    normalizeDate(payload.date || payload.timestamp || payload.time || payload.ts || payload.created_at) ||
    new Date().toISOString().slice(0, 10);
  let buyer = payload.buyer || payload.media_buyer || payload.campaign_group || payload.user || "";
  let country = payload.country || payload.geo || payload.cc || payload.country_code || "";
  let domain =
    payload.domain ||
    payload.landing ||
    payload.landing_domain ||
    payload.lp_domain ||
    payload.host ||
    "";
  let device =
    payload.device || payload.device_type || payload.dev || payload.ua_device || payload.device_name || "";

  let mapped = null;
  if (campaignId) {
    mapped = selectCampaignByKey.get(String(campaignId).trim(), String(campaignId).trim());
  }
  if (!buyer && mapped?.buyer) buyer = mapped.buyer;
  if (!country && mapped?.country) country = mapped.country;
  if (!domain && mapped?.domain) domain = mapped.domain;

  const finalBuyer = String(buyer || campaignId || "Unknown").trim();
  const finalCountry = String(country || "").trim();
  const finalDomain = String(domain || "").trim();
  const finalDevice = normalizeDevice(device);

  const normalizedCampaign = campaignId || mapped?.keitaro_id || mapped?.name || null;
  const normalizedClick = clickId || null;

  return {
    date,
    campaign_id: normalizedCampaign ? String(normalizedCampaign).trim() : null,
    buyer: finalBuyer,
    country: finalCountry,
    domain: finalDomain,
    device: finalDevice,
    click_id: normalizedClick ? String(normalizedClick).trim() : null,
  };
};

const readRowValue = (row, key) => {
  if (!row || !key) return null;
  return Object.prototype.hasOwnProperty.call(row, key) ? row[key] : null;
};

const buildAuthHeaders = (apiKey) => {
  const key = String(apiKey || "");
  if (key.toLowerCase().startsWith("bearer ")) {
    return { Authorization: key };
  }
  return { "Api-Key": key };
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
};

const userSeed = [
  {
    username: "Yilmachine",
    role: "Boss",
    password_hash:
      "d4c72f621a705e7c1ae13ddcc1b6659d:1e6c2a9bac7ac9c27819cb8e6267f7b1be27e1a1248093e26dcfb1d860cb699236ac17499d7fdac570815aa9184b035b8371f7fb6734bd903879754e8aa8dd2e",
  },
  {
    username: "Leomarketing",
    role: "Team Leader",
    password_hash:
      "8bc8e011af19826c280bf9d044a1bfc8:067de2b46064a1f0c5b94dce80b34ea755665f26928b9c538f15bb150ef0226d4ac01c2c941247c51632ea7a58c280d5c38eab45f3a9a0704b7a6a75c56b0331",
  },
  {
    username: "Sara",
    role: "Media Buyer Junior",
    password_hash:
      "ba5d92ae0ec08f728044bccd4854b465:4474ac939f47fb02b4a2d242048523fd12ac78c6e3e8e4e8c161659908e88660c0718a51e442527fc619e70478aef9d9e19c1cec700d501c7550a182b852f42c",
  },
  {
    username: "Matheus",
    role: "Media Buyer Junior",
    password_hash:
      "f5d67125135702236b916fbfa8e73181:df875fbc1dfbd978014ca2a1d6fc268ed3b8185c61d580bc6ed2ec256cad5e18c584774d99f2bf5902be23821b631440892da2eaee949d397a7c2cbe743a8999",
  },
  {
    username: "Leticia",
    role: "Media Buyer Junior",
    password_hash:
      "caaf76d260f3be2a26ee03ea55bb0a79:399284d22473cda46da4e65eabec257e59327f123d8657f70cf34c00e4e7d7fc375dc8c655107a7721b16e6d0b96687825335499c56576480477741f915b3c93",
  },
  {
    username: "Carvalho",
    role: "Media Buyer Junior",
    password_hash:
      "8c5f285134155495c677224c6f3855b3:11997f1820cb30bf25ef2275f6763a9a105d5891f9005f4695795763f0ad43574c1225ab7aa2f84ba67894c3d5598aff1f142ec2df7b6d69a46ac3540e1d1a52",
  },
  {
    username: "Enzo",
    role: "Media Buyer Junior",
    password_hash:
      "0b182635ad82d54373aa0cb2f8389367:f91a6d1800007e29e1e510c2ce086ab7e4a1b3251aaca2a2f06bca9790a146f9e053e18959049186d51510a950604f72872f98960e4f035fab1a1992eea1fd3e",
  },
  {
    username: "Akku",
    role: "Media Buyer Junior",
    password_hash:
      "fa2937f577cdc2717fe360dd6a9bd032:893c4e551b17916e37bd476b3cd2630ae26a6466c6856bca14660a02581b02a1e897095c6d64e487bb59111339a8b1470096893d05dfe57c300e39f5c90e87b0",
  },
];

const insertUserSeed = db.prepare(
  `INSERT OR IGNORE INTO users (username, password_hash, role, buyer_id, verified)
   VALUES (@username, @password_hash, @role, @buyer_id, @verified)`
);

userSeed.forEach((user) => {
  insertUserSeed.run({ ...user, buyer_id: null, verified: 1 });
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/expenses", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectExpenses.all(limit);
  res.json(rows);
});

app.post("/api/expenses", (req, res) => {
  const {
    date,
    country,
    category,
    reference = "",
    billing,
    amount,
    status,
  } = req.body ?? {};

  if (!date || !country || !category || !billing || amount === undefined || amount === null || !status) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const parsedAmount = Number.parseFloat(amount);
  if (!Number.isFinite(parsedAmount)) {
    return res.status(400).json({ error: "Amount must be a number." });
  }

  const payload = {
    date,
    country,
    category,
    reference,
    billing_type: billing,
    amount: parsedAmount,
    status,
  };

  const info = insertExpense.run(payload);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.get("/api/media-stats", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectMediaStats.all(limit);
  const installTotals = selectInstallTotals.all();
  const conversionTotals = selectConversionTotals.all();
  const installMap = new Map();
  const conversionMap = new Map();
  installTotals.forEach((row) => {
    const key = `${row.date}|${row.buyer || ""}|${row.country || ""}`;
    installMap.set(key, Number(row.installs) || 0);
  });
  conversionTotals.forEach((row) => {
    const key = `${row.date}|${row.buyer || ""}|${row.country || ""}`;
    conversionMap.set(key, {
      ftds: Number(row.ftds) || 0,
      redeposits: Number(row.redeposits) || 0,
      registers: Number(row.registers) || 0,
    });
  });

  const existingKeys = new Set();
  const merged = rows.map((row) => {
    const key = `${row.date}|${row.buyer || ""}|${row.country || ""}`;
    existingKeys.add(key);
    const installs = installMap.has(key) ? installMap.get(key) : row.installs ?? 0;
    return { ...row, installs };
  });

  const mergedKeys = new Set(existingKeys);

  installTotals.forEach((row) => {
    const key = `${row.date}|${row.buyer || ""}|${row.country || ""}`;
    if (mergedKeys.has(key)) return;
    const conversions = conversionMap.get(key);
    mergedKeys.add(key);
    merged.push({
      id: null,
      date: row.date,
      buyer: row.buyer,
      country: row.country,
      spend: null,
      clicks: 0,
      installs: Number(row.installs) || 0,
      registers: conversions?.registers || 0,
      ftds: conversions?.ftds || 0,
      redeposits: conversions?.redeposits || 0,
    });
  });

  conversionTotals.forEach((row) => {
    const key = `${row.date}|${row.buyer || ""}|${row.country || ""}`;
    if (mergedKeys.has(key)) return;
    mergedKeys.add(key);
    merged.push({
      id: null,
      date: row.date,
      buyer: row.buyer,
      country: row.country,
      spend: null,
      clicks: 0,
      installs: installMap.get(key) || 0,
      registers: Number(row.registers) || 0,
      ftds: Number(row.ftds) || 0,
      redeposits: Number(row.redeposits) || 0,
    });
  });

  merged.sort((a, b) => {
    const dateSort = String(b.date || "").localeCompare(String(a.date || ""));
    if (dateSort !== 0) return dateSort;
    return (b.id || 0) - (a.id || 0);
  });

  res.json(merged.slice(0, limit));
});

app.get("/api/device-stats", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectDeviceStats.all(limit);
  const installTotals = selectInstallTotalsByDevice.all();
  const installMap = new Map();

  installTotals.forEach((row) => {
    const device = normalizeDevice(row.device);
    const key = `${row.date}|${device}`;
    installMap.set(key, Number(row.installs) || 0);
  });

  const aggregated = new Map();
  rows.forEach((row) => {
    const device = normalizeDevice(row.device);
    const key = `${row.date}|${device}`;
    if (!aggregated.has(key)) {
      aggregated.set(key, {
        id: row.id,
        date: row.date,
        device,
        buyer: row.buyer || "",
        country: row.country || "",
        spend: 0,
        revenue: 0,
        clicks: 0,
        registers: 0,
        ftds: 0,
        redeposits: 0,
        installs: 0,
      });
    }
    const current = aggregated.get(key);
    current.spend += Number(row.spend || 0);
    current.revenue += Number(row.revenue || 0);
    current.clicks += Number(row.clicks || 0);
    current.registers += Number(row.registers || 0);
    current.ftds += Number(row.ftds || 0);
    current.redeposits += Number(row.redeposits || 0);
  });

  installMap.forEach((installs, key) => {
    if (aggregated.has(key)) {
      aggregated.get(key).installs = installs;
    } else {
      const [date, device] = key.split("|");
      aggregated.set(key, {
        id: null,
        date,
        device,
        buyer: "",
        country: "",
        spend: 0,
        revenue: 0,
        clicks: 0,
        registers: 0,
        ftds: 0,
        redeposits: 0,
        installs,
      });
    }
  });

  const merged = Array.from(aggregated.values()).sort((a, b) => {
    const dateSort = String(b.date || "").localeCompare(String(a.date || ""));
    if (dateSort !== 0) return dateSort;
    return (b.id || 0) - (a.id || 0);
  });

  res.json(merged.slice(0, limit));
});

app.post("/api/media-stats", (req, res) => {
  const { date, buyer, country, spend, clicks, installs, registers, ftds, redeposits } =
    req.body ?? {};

  if (!date || !buyer || clicks === undefined || registers === undefined || ftds === undefined) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const parsedSpend = spend === undefined || spend === null || spend === "" ? null : Number(spend);
  const parsedClicks = Number(clicks);
  const parsedInstalls =
    installs === undefined || installs === null || installs === "" ? null : Number(installs);
  const parsedRegisters = Number(registers);
  const parsedFtds = Number(ftds);
  const parsedRedeps =
    redeposits === undefined || redeposits === null || redeposits === ""
      ? null
      : Number(redeposits);

  if (!Number.isFinite(parsedClicks) || !Number.isFinite(parsedRegisters) || !Number.isFinite(parsedFtds)) {
    return res.status(400).json({ error: "Clicks, registers, and ftds must be numbers." });
  }

  if (parsedSpend !== null && !Number.isFinite(parsedSpend)) {
    return res.status(400).json({ error: "Spend must be a number." });
  }

  if (parsedInstalls !== null && !Number.isFinite(parsedInstalls)) {
    return res.status(400).json({ error: "Installs must be a number." });
  }
  if (parsedRedeps !== null && !Number.isFinite(parsedRedeps)) {
    return res.status(400).json({ error: "Redeposits must be a number." });
  }

  const payload = {
    date,
    buyer,
    country: country || "",
    spend: parsedSpend,
    clicks: parsedClicks,
    installs: parsedInstalls,
    registers: parsedRegisters,
    ftds: parsedFtds,
    redeposits: parsedRedeps,
  };

  const info = insertMediaStat.run(payload);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.get("/api/goals", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectGoals.all(limit);
  res.json(rows);
});

app.post("/api/goals", (req, res) => {
  const {
    buyer,
    country,
    period,
    dateFrom,
    dateTo,
    ftdsTarget,
    r2dTarget,
    clicksTarget,
    registersTarget,
    spendTarget,
    isGlobal,
    notes = "",
  } = req.body ?? {};

  if (!period || !dateFrom || !dateTo) {
    return res.status(400).json({ error: "Period and date range are required." });
  }

  const resolvedBuyer = isGlobal ? "Global" : buyer;
  if (!resolvedBuyer) {
    return res.status(400).json({ error: "Buyer is required unless goal is global." });
  }

  const payload = {
    buyer: resolvedBuyer,
    country: country || "",
    period,
    date_from: dateFrom,
    date_to: dateTo,
    clicks_target: numberFromValue(clicksTarget),
    registers_target: numberFromValue(registersTarget),
    ftds_target: numberFromValue(ftdsTarget),
    spend_target: numberFromValue(spendTarget),
    r2d_target: numberFromValue(r2dTarget),
    is_global: isGlobal ? 1 : 0,
    notes,
  };

  const info = insertGoal.run(payload);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete("/api/goals/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid goal id." });
  }
  deleteGoal.run(id);
  res.json({ ok: true });
});

app.get("/api/media-buyers", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectMediaBuyers.all(limit);
  res.json(rows);
});

app.post("/api/media-buyers", (req, res) => {
  const {
    name,
    role,
    country = "",
    approach = "",
    game = "",
    email = "",
    contact = "",
    status,
  } = req.body ?? {};

  if (!name || !role || !status) {
    return res.status(400).json({ error: "Name, role, and status are required." });
  }

  const payload = {
    name,
    role,
    country,
    approach,
    game,
    email,
    contact,
    status,
  };

  const info = insertMediaBuyer.run(payload);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete("/api/media-buyers/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid media buyer id." });
  }
  deleteMediaBuyer.run(id);
  res.json({ ok: true });
});

app.get("/api/domains", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectDomains.all(limit);
  res.json(rows);
});

app.post("/api/domains", (req, res) => {
  const { domain, status } = req.body ?? {};

  if (!domain || !status) {
    return res.status(400).json({ error: "Domain and status are required." });
  }

  const payload = {
    domain: String(domain).trim(),
    status,
  };

  const info = insertDomain.run(payload);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete("/api/domains/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid domain id." });
  }
  deleteDomain.run(id);
  res.json({ ok: true });
});

app.get("/api/campaigns", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectCampaigns.all(limit);
  res.json(rows);
});

app.post("/api/campaigns", (req, res) => {
  const { keitaroId = "", name, buyer, country = "", domain = "" } = req.body ?? {};
  if (!name || !buyer) {
    return res.status(400).json({ error: "Campaign name and buyer are required." });
  }

  try {
    const info = insertCampaign.run({
      keitaro_id: String(keitaroId || "").trim() || null,
      name: String(name).trim(),
      buyer: String(buyer).trim(),
      country: String(country || "").trim(),
      domain: String(domain || "").trim() || null,
    });
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Campaign already exists." });
    }
    res.status(500).json({ error: "Failed to create campaign." });
  }
});

app.delete("/api/campaigns/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid campaign id." });
  }
  deleteCampaign.run(id);
  res.json({ ok: true });
});

app.all("/api/postbacks/install", (req, res) => {
  const payload = { ...(req.query || {}), ...(req.body || {}) };
  const secret = String(payload.key || payload.token || payload.secret || "");
  if (postbackSecret && secret !== postbackSecret) {
    return res.status(401).json({ error: "Invalid postback key." });
  }

  const context = resolvePostbackContext(payload);

  try {
    insertInstallEvent.run({
      date: context.date,
      campaign_id: context.campaign_id,
      buyer: context.buyer,
      country: context.country,
      domain: context.domain,
      device: context.device,
      click_id: context.click_id,
      source: String(payload.source || payload.network || payload.from || "postback"),
      raw: JSON.stringify(payload),
    });
  } catch (error) {
    if (error?.code !== "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(500).json({ error: "Failed to store install." });
    }
  }

  res.json({ ok: true });
});

const handleConversionPostback = (eventType) => (req, res) => {
  const payload = { ...(req.query || {}), ...(req.body || {}) };
  const secret = String(payload.key || payload.token || payload.secret || "");
  if (postbackSecret && secret !== postbackSecret) {
    return res.status(401).json({ error: "Invalid postback key." });
  }

  if (!eventType || !["ftd", "redeposit", "registration"].includes(eventType)) {
    return res.status(400).json({ error: "Invalid event type." });
  }

  const context = resolvePostbackContext(payload);

  try {
    insertConversionEvent.run({
      date: context.date,
      event_type: eventType,
      campaign_id: context.campaign_id,
      buyer: context.buyer,
      country: context.country,
      domain: context.domain,
      device: context.device,
      click_id: context.click_id,
      source: String(payload.source || payload.network || payload.from || "postback"),
      raw: JSON.stringify(payload),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to store conversion." });
  }

  res.json({ ok: true });
};

app.all("/api/postbacks/ftd", handleConversionPostback("ftd"));
app.all("/api/postbacks/registration", handleConversionPostback("registration"));
app.all("/api/postbacks/redeposit", handleConversionPostback("redeposit"));

app.get("/api/users", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectUsers.all(limit);
  res.json(rows);
});

app.post("/api/users", (req, res) => {
  const { username, password, role, buyerId } = req.body ?? {};

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password, and role are required." });
  }

  const payload = {
    username: String(username).trim(),
    password_hash: hashPassword(password),
    role,
    buyer_id: buyerId ? Number(buyerId) : null,
    verified: 1,
  };

  try {
    const info = insertUser.run(payload);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Username already exists." });
    }
    res.status(500).json({ error: "Failed to create user." });
  }
});

app.delete("/api/users/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid user id." });
  }
  deleteUser.run(id);
  res.json({ ok: true });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = selectUserByUsername.get(String(username).trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  res.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      buyerId: user.buyer_id,
    },
  });
});

app.get("/api/roles", (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = selectRoles
    .all(limit)
    .map((row) => ({ ...row, permissions: JSON.parse(row.permissions || "[]") }));
  res.json(rows);
});

app.post("/api/roles", (req, res) => {
  const { name, permissions = [] } = req.body ?? {};

  if (!name) {
    return res.status(400).json({ error: "Role name is required." });
  }

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "Permissions must be an array." });
  }

  try {
    const info = insertRole.run({
      name: String(name).trim(),
      permissions: JSON.stringify(permissions),
    });
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Role already exists." });
    }
    res.status(500).json({ error: "Failed to create role." });
  }
});

app.put("/api/roles/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid role id." });
  }

  const { permissions = [] } = req.body ?? {};
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "Permissions must be an array." });
  }

  const role = selectRoleById.get(id);
  if (!role) {
    return res.status(404).json({ error: "Role not found." });
  }

  const finalPermissions =
    role.name === "Boss" || role.name === "Team Leader" ? allPermissions : permissions;

  updateRole.run({ id, permissions: JSON.stringify(finalPermissions) });
  res.json({ ok: true });
});

app.delete("/api/roles/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid role id." });
  }
  const role = selectRoleById.get(id);
  if (role?.name === "Boss" || role?.name === "Team Leader") {
    return res.status(403).json({ error: "Protected role cannot be deleted." });
  }
  deleteRole.run(id);
  res.json({ ok: true });
});

app.post("/api/keitaro/test", async (req, res) => {
  const { baseUrl, apiKey } = req.body ?? {};

  if (!baseUrl || !apiKey) {
    return res.status(400).json({ error: "Base URL and API key are required." });
  }

  const endpoint = `${normalizeBaseUrl(baseUrl)}/admin_api/v1/campaigns`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        ...buildAuthHeaders(apiKey),
      },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || data?.message || "Failed to connect to Keitaro.",
      });
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Connection failed." });
  }
});

app.post("/api/keitaro/sync", async (req, res) => {
  const { baseUrl, apiKey, reportPath, payload, mapping, replaceExisting, target } = req.body ?? {};

  if (!baseUrl || !apiKey || !payload) {
    return res.status(400).json({ error: "Base URL, API key, and payload are required." });
  }

  const endpoint = `${normalizeBaseUrl(baseUrl)}${normalizePath(
    reportPath || "/admin_api/v1/report/build"
  )}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(apiKey),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || data?.message || "Failed to build report.",
      });
    }

    const rows = Array.isArray(data)
      ? data
      : data?.rows || data?.data?.rows || data?.result || [];

    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: "Unexpected report response format." });
    }

    const map = mapping || {};
    const syncTarget = target === "device" ? "device" : "overall";
    let inserted = 0;
    let skipped = 0;

    rows.forEach((row) => {
      const date = normalizeDate(readRowValue(row, map.dateField));
      if (!date) {
        skipped += 1;
        return;
      }

      const buyer = String(readRowValue(row, map.buyerField) || "Keitaro");
      const country = String(readRowValue(row, map.countryField) || "");
      const spend = numberFromValue(readRowValue(row, map.spendField));
      const clicks = numberFromValue(readRowValue(row, map.clicksField)) ?? 0;
      const registers = numberFromValue(readRowValue(row, map.registersField)) ?? 0;
      const ftds = numberFromValue(readRowValue(row, map.ftdsField)) ?? 0;
      const redeposits = numberFromValue(readRowValue(row, map.redepositsField)) ?? 0;

      if (syncTarget === "device") {
      const device = normalizeDevice(readRowValue(row, map.deviceField));
        const revenue = numberFromValue(readRowValue(row, map.revenueField));

        if (replaceExisting) {
          deleteDeviceStat.run(date, device, buyer, country);
        }

        insertDeviceStat.run({
          date,
          device,
          buyer,
          country,
          spend,
          revenue,
          clicks: Number(clicks) || 0,
          registers: Number(registers) || 0,
          ftds: Number(ftds) || 0,
          redeposits: Number(redeposits) || 0,
        });
      } else {
        const installs = numberFromValue(readRowValue(row, map.installsField));

        if (replaceExisting) {
          deleteMediaStat.run(date, buyer, country);
        }

        insertMediaStat.run({
          date,
          buyer,
          country,
          spend,
          clicks: Number(clicks) || 0,
          installs: installs === null ? null : Number(installs) || 0,
          registers: Number(registers) || 0,
          ftds: Number(ftds) || 0,
          redeposits: Number(redeposits) || 0,
        });
      }

      inserted += 1;
    });

    res.json({ ok: true, total: rows.length, inserted, skipped });
  } catch (error) {
    res.status(500).json({ error: error.message || "Sync failed." });
  }
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`Finance API running on http://localhost:${PORT}`);
});
