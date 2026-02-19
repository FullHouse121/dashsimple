import express from "express";
import cors from "cors";
import crypto from "crypto";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const query = (text, params) => pool.query(text, params);
const getRow = async (text, params) => {
  const { rows } = await query(text, params);
  return rows[0] || null;
};
const getRows = async (text, params) => {
  const { rows } = await query(text, params);
  return rows;
};

const initDb = async () => {
  const statements = [
    `CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      country TEXT NOT NULL,
      category TEXT NOT NULL,
      reference TEXT,
      billing_type TEXT NOT NULL,
      crypto_network TEXT,
      crypto_hash TEXT,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS media_stats (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      buyer TEXT NOT NULL,
      country TEXT,
      city TEXT,
      region TEXT,
      placement TEXT,
      spend REAL,
      revenue REAL,
      ftd_revenue REAL,
      redeposit_revenue REAL,
      clicks INTEGER NOT NULL,
      installs INTEGER,
      registers INTEGER NOT NULL,
      ftds INTEGER NOT NULL,
      redeposits INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS user_behavior (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      external_id TEXT NOT NULL,
      buyer TEXT,
      campaign TEXT,
      country TEXT,
      region TEXT,
      city TEXT,
      placement TEXT,
      clicks INTEGER,
      registers INTEGER,
      ftds INTEGER,
      redeposits INTEGER,
      revenue REAL,
      ftd_revenue REAL,
      redeposit_revenue REAL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `ALTER TABLE media_stats ADD COLUMN IF NOT EXISTS revenue REAL;`,
    `ALTER TABLE media_stats ADD COLUMN IF NOT EXISTS ftd_revenue REAL;`,
    `ALTER TABLE media_stats ADD COLUMN IF NOT EXISTS redeposit_revenue REAL;`,
    `ALTER TABLE media_stats ADD COLUMN IF NOT EXISTS city TEXT;`,
    `ALTER TABLE media_stats ADD COLUMN IF NOT EXISTS region TEXT;`,
    `ALTER TABLE media_stats ADD COLUMN IF NOT EXISTS placement TEXT;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS buyer TEXT;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS campaign TEXT;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS country TEXT;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS region TEXT;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS city TEXT;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS placement TEXT;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS clicks INTEGER;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS registers INTEGER;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS ftds INTEGER;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS redeposits INTEGER;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS revenue REAL;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS ftd_revenue REAL;`,
    `ALTER TABLE user_behavior ADD COLUMN IF NOT EXISTS redeposit_revenue REAL;`,
    `CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS media_buyers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      country TEXT,
      approach TEXT,
      game TEXT,
      email TEXT,
      contact TEXT,
      status TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS pixels (
      id SERIAL PRIMARY KEY,
      pixel_id TEXT NOT NULL,
      token_eaag TEXT NOT NULL,
      flows TEXT,
      geo TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      comment TEXT,
      owner_role TEXT,
      owner_id INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS domains (
      id SERIAL PRIMARY KEY,
      domain TEXT NOT NULL,
      status TEXT NOT NULL,
      game TEXT,
      platform TEXT,
      country TEXT,
      owner_role TEXT,
      owner_id INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      keitaro_id TEXT,
      name TEXT NOT NULL,
      buyer TEXT NOT NULL,
      country TEXT,
      domain TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS install_events (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      campaign_id TEXT,
      buyer TEXT NOT NULL,
      country TEXT,
      domain TEXT,
      device TEXT,
      external_id TEXT,
      click_id TEXT,
      source TEXT,
      raw TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS conversion_events (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS device_stats (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      device TEXT NOT NULL,
      os TEXT,
      os_version TEXT,
      os_icon TEXT,
      device_model TEXT,
      buyer TEXT,
      country TEXT,
      spend REAL,
      revenue REAL,
      clicks INTEGER NOT NULL,
      registers INTEGER NOT NULL,
      ftds INTEGER NOT NULL,
      redeposits INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      buyer_id INTEGER,
      verified INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      permissions TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_keitaro_id
      ON campaigns (keitaro_id);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_behavior_key
      ON user_behavior (date, external_id, buyer, campaign, country, placement);`,
    `CREATE INDEX IF NOT EXISTS idx_install_events_date_buyer_country
      ON install_events (date, buyer, country);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_install_events_click_campaign
      ON install_events (click_id, campaign_id);`,
    `ALTER TABLE install_events ADD COLUMN IF NOT EXISTS external_id TEXT;`,
    `CREATE INDEX IF NOT EXISTS idx_conversion_events_date_buyer_country
      ON conversion_events (date, buyer, country);`,
    `ALTER TABLE device_stats ADD COLUMN IF NOT EXISTS os TEXT;`,
    `ALTER TABLE device_stats ADD COLUMN IF NOT EXISTS os_version TEXT;`,
    `ALTER TABLE device_stats ADD COLUMN IF NOT EXISTS os_icon TEXT;`,
    `ALTER TABLE device_stats ADD COLUMN IF NOT EXISTS device_model TEXT;`,
    `DROP INDEX IF EXISTS idx_device_stats_key;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_device_stats_key
      ON device_stats (date, device, os, os_version, device_model, buyer, country);`,
    `ALTER TABLE domains ADD COLUMN IF NOT EXISTS game TEXT;`,
    `ALTER TABLE domains ADD COLUMN IF NOT EXISTS platform TEXT;`,
    `ALTER TABLE domains ADD COLUMN IF NOT EXISTS owner_role TEXT;`,
    `ALTER TABLE domains ADD COLUMN IF NOT EXISTS country TEXT;`,
    `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS crypto_network TEXT;`,
    `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS crypto_hash TEXT;`,
    `ALTER TABLE pixels ADD COLUMN IF NOT EXISTS flows TEXT;`,
    `ALTER TABLE pixels ADD COLUMN IF NOT EXISTS geo TEXT;`,
    `ALTER TABLE pixels ADD COLUMN IF NOT EXISTS status TEXT;`,
    `ALTER TABLE pixels ADD COLUMN IF NOT EXISTS comment TEXT;`,
    `ALTER TABLE pixels ADD COLUMN IF NOT EXISTS owner_role TEXT;`,
    `ALTER TABLE pixels ADD COLUMN IF NOT EXISTS owner_id INTEGER;`,
    `UPDATE pixels SET status = 'Active' WHERE status IS NULL;`,
  ];

  for (const statement of statements) {
    await query(statement);
  }
};

const allPermissions = [
  "dashboard",
  "goals",
  "finances",
  "utm",
  "statistics",
  "placements",
  "user_behavior",
  "geos",
  "devices",
  "domains",
  "pixels",
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
    permissions: [
      "dashboard",
      "utm",
      "statistics",
      "placements",
      "user_behavior",
      "geos",
      "goals",
      "domains",
      "pixels",
    ],
  },
  {
    name: "Media Buyer",
    permissions: ["dashboard", "utm", "statistics", "placements", "user_behavior", "geos", "domains", "pixels"],
  },
  {
    name: "Media Buyer Junior",
    permissions: ["dashboard", "statistics", "placements", "user_behavior", "geos", "domains", "pixels"],
  },
];

const insertRoleSeed = async (role) => {
  await query(
    `INSERT INTO roles (name, permissions)
     VALUES ($1, $2)
     ON CONFLICT (name) DO NOTHING`,
    [role.name, JSON.stringify(role.permissions)]
  );
};

const ensureRolePermissions = async (name, permissions) => {
  const row = await getRow("SELECT id, permissions FROM roles WHERE name = $1", [name]);
  if (!row) {
    await insertRoleSeed({ name, permissions });
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
    await query("UPDATE roles SET permissions = $1 WHERE id = $2", [
      JSON.stringify(merged),
      row.id,
    ]);
  }
};

const seedRoles = async () => {
  for (const role of roleSeed) {
    await insertRoleSeed(role);
  }
  for (const role of roleSeed) {
    await ensureRolePermissions(role.name, role.permissions);
  }
};

const insertExpense = async (payload) => {
  const { rows } = await query(
    `INSERT INTO expenses (date, country, category, reference, billing_type, crypto_network, crypto_hash, amount, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      payload.date,
      payload.country,
      payload.category,
      payload.reference,
      payload.billing_type,
      payload.crypto_network,
      payload.crypto_hash,
      payload.amount,
      payload.status,
    ]
  );
  return rows[0];
};

const selectExpenses = async (limit) =>
  getRows(
    `SELECT id, date, country, category, reference, billing_type, crypto_network, crypto_hash, amount, status
     FROM expenses
     ORDER BY date DESC, id DESC
     LIMIT $1`,
    [limit]
  );

const insertMediaStat = async (payload) => {
  const { rows } = await query(
    `INSERT INTO media_stats (
      date,
      buyer,
      country,
      city,
      region,
      placement,
      spend,
      revenue,
      ftd_revenue,
      redeposit_revenue,
      clicks,
      installs,
      registers,
      ftds,
      redeposits
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING id`,
    [
      payload.date,
      payload.buyer,
      payload.country,
      payload.city,
      payload.region,
      payload.placement,
      payload.spend,
      payload.revenue,
      payload.ftd_revenue,
      payload.redeposit_revenue,
      payload.clicks,
      payload.installs,
      payload.registers,
      payload.ftds,
      payload.redeposits,
    ]
  );
  return rows[0];
};

const selectMediaStats = async (limit) =>
  getRows(
    `SELECT id, date, buyer, country, city, region, spend, revenue, ftd_revenue, redeposit_revenue,
            placement, clicks, installs, registers, ftds, redeposits
     FROM media_stats
     ORDER BY date DESC, id DESC
     LIMIT $1`,
    [limit]
  );

const insertUserBehavior = async (payload) => {
  await query(
    `INSERT INTO user_behavior (
      date,
      external_id,
      buyer,
      campaign,
      country,
      region,
      city,
      placement,
      clicks,
      registers,
      ftds,
      redeposits,
      revenue,
      ftd_revenue,
      redeposit_revenue
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     ON CONFLICT (date, external_id, buyer, campaign, country, placement)
     DO UPDATE SET
       region = EXCLUDED.region,
       city = EXCLUDED.city,
       clicks = EXCLUDED.clicks,
       registers = EXCLUDED.registers,
       ftds = EXCLUDED.ftds,
       redeposits = EXCLUDED.redeposits,
       revenue = EXCLUDED.revenue,
       ftd_revenue = EXCLUDED.ftd_revenue,
       redeposit_revenue = EXCLUDED.redeposit_revenue`,
    [
      payload.date,
      payload.external_id,
      payload.buyer,
      payload.campaign,
      payload.country,
      payload.region,
      payload.city,
      payload.placement,
      payload.clicks,
      payload.registers,
      payload.ftds,
      payload.redeposits,
      payload.revenue,
      payload.ftd_revenue,
      payload.redeposit_revenue,
    ]
  );
};

const selectUserBehavior = async (limit) =>
  getRows(
    `SELECT id, date, external_id, buyer, campaign, country, region, city, placement,
            clicks, registers, ftds, redeposits, revenue, ftd_revenue, redeposit_revenue,
            created_at
     FROM user_behavior
     ORDER BY date DESC, id DESC
     LIMIT $1`,
    [limit]
  );

const insertGoal = async (payload) => {
  const { rows } = await query(
    `INSERT INTO goals (buyer, country, period, date_from, date_to, clicks_target, registers_target, ftds_target, spend_target, r2d_target, is_global, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [
      payload.buyer,
      payload.country,
      payload.period,
      payload.date_from,
      payload.date_to,
      payload.clicks_target,
      payload.registers_target,
      payload.ftds_target,
      payload.spend_target,
      payload.r2d_target,
      payload.is_global,
      payload.notes,
    ]
  );
  return rows[0];
};

const selectGoals = async (limit) =>
  getRows(
    `SELECT id, buyer, country, period, date_from, date_to, clicks_target, registers_target, ftds_target, spend_target, r2d_target, is_global, notes
     FROM goals
     ORDER BY date_from DESC, id DESC
     LIMIT $1`,
    [limit]
  );

const deleteGoal = async (id) =>
  query(`DELETE FROM goals WHERE id = $1`, [id]);

const insertMediaBuyer = async (payload) => {
  const { rows } = await query(
    `INSERT INTO media_buyers (name, role, country, approach, game, email, contact, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      payload.name,
      payload.role,
      payload.country,
      payload.approach,
      payload.game,
      payload.email,
      payload.contact,
      payload.status,
    ]
  );
  return rows[0];
};

const selectMediaBuyers = async (limit) =>
  getRows(
    `SELECT id, name, role, country, approach, game, email, contact, status
     FROM media_buyers
     ORDER BY name ASC, id DESC
     LIMIT $1`,
    [limit]
  );

const selectMediaBuyerById = async (id) =>
  getRow(
    `SELECT id, name, role, country, approach, game, email, contact, status
     FROM media_buyers
     WHERE id = $1`,
    [id]
  );

const deleteMediaBuyer = async (id) => query(`DELETE FROM media_buyers WHERE id = $1`, [id]);

const insertPixel = async (payload) => {
  const { rows } = await query(
    `INSERT INTO pixels (pixel_id, token_eaag, flows, geo, status, comment, owner_role, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      payload.pixel_id,
      payload.token_eaag,
      payload.flows,
      payload.geo,
      payload.status,
      payload.comment,
      payload.owner_role,
      payload.owner_id,
    ]
  );
  return rows[0];
};

const selectPixels = async (limit) =>
  getRows(
    `SELECT id, pixel_id, token_eaag, flows, geo, status, comment, owner_role, owner_id, created_at
     FROM pixels
     ORDER BY created_at DESC, id DESC
     LIMIT $1`,
    [limit]
  );

const selectPixelsByOwner = async (ownerId, limit) =>
  getRows(
    `SELECT id, pixel_id, token_eaag, flows, geo, status, comment, owner_role, owner_id, created_at
     FROM pixels
     WHERE owner_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT $2`,
    [ownerId, limit]
  );

const selectPixelById = async (id) =>
  getRow(`SELECT id, owner_id FROM pixels WHERE id = $1`, [id]);

const deletePixel = async (id) => query(`DELETE FROM pixels WHERE id = $1`, [id]);

const insertDomain = async (payload) => {
  const { rows } = await query(
    `INSERT INTO domains (domain, status, game, platform, owner_role, owner_id, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      payload.domain,
      payload.status,
      payload.game,
      payload.platform,
      payload.owner_role,
      payload.owner_id,
      payload.country,
    ]
  );
  return rows[0];
};

const selectDomains = async (limit) =>
  getRows(
    `SELECT d.id, d.domain, d.status, d.game, d.platform, d.owner_role, d.owner_id, d.country,
            u.username AS owner_name
     FROM domains d
     LEFT JOIN users u ON u.id = d.owner_id
     ORDER BY d.domain ASC, d.id DESC
     LIMIT $1`,
    [limit]
  );

const selectDomainsByOwner = async (ownerId, limit) =>
  getRows(
    `SELECT d.id, d.domain, d.status, d.game, d.platform, d.owner_role, d.owner_id, d.country,
            u.username AS owner_name
     FROM domains d
     LEFT JOIN users u ON u.id = d.owner_id
     WHERE d.owner_id = $1
     ORDER BY d.domain ASC, d.id DESC
     LIMIT $2`,
    [ownerId, limit]
  );

const selectDomainById = async (id) =>
  getRow(`SELECT id, owner_id FROM domains WHERE id = $1`, [id]);

const deleteDomain = async (id) => query(`DELETE FROM domains WHERE id = $1`, [id]);

const insertCampaign = async (payload) => {
  const { rows } = await query(
    `INSERT INTO campaigns (keitaro_id, name, buyer, country, domain)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      payload.keitaro_id,
      payload.name,
      payload.buyer,
      payload.country,
      payload.domain,
    ]
  );
  return rows[0];
};

const selectCampaigns = async (limit) =>
  getRows(
    `SELECT id, keitaro_id, name, buyer, country, domain
     FROM campaigns
     ORDER BY id DESC
     LIMIT $1`,
    [limit]
  );

const selectCampaignByKey = async (keitaroId, name) =>
  getRow(
    `SELECT id, keitaro_id, name, buyer, country, domain
     FROM campaigns
     WHERE keitaro_id = $1 OR name = $2
     LIMIT 1`,
    [keitaroId, name]
  );

const deleteCampaign = async (id) => query(`DELETE FROM campaigns WHERE id = $1`, [id]);

const insertInstallEvent = async (payload) => {
  await query(
    `INSERT INTO install_events (date, campaign_id, buyer, country, domain, device, external_id, click_id, source, raw)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      payload.date,
      payload.campaign_id,
      payload.buyer,
      payload.country,
      payload.domain,
      payload.device,
      payload.external_id,
      payload.click_id,
      payload.source,
      payload.raw,
    ]
  );
};

const insertConversionEvent = async (payload) => {
  await query(
    `INSERT INTO conversion_events (date, event_type, campaign_id, buyer, country, domain, device, click_id, source, raw)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      payload.date,
      payload.event_type,
      payload.campaign_id,
      payload.buyer,
      payload.country,
      payload.domain,
      payload.device,
      payload.click_id,
      payload.source,
      payload.raw,
    ]
  );
};

const selectPostbackLogs = async (limit) =>
  getRows(
    `SELECT
      ('install-' || id) AS id,
      date,
      created_at,
      'install' AS event_type,
      campaign_id,
      buyer,
      country,
      domain,
      device,
      click_id,
      external_id,
      source,
      raw
     FROM install_events
     UNION ALL
     SELECT
      ('conversion-' || id) AS id,
      date,
      created_at,
      event_type,
      campaign_id,
      buyer,
      country,
      domain,
      device,
      click_id,
      NULL AS external_id,
      source,
      raw
     FROM conversion_events
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

const selectInstallTotals = async () =>
  getRows(
    `SELECT date, buyer, country, COUNT(*) as installs
     FROM install_events
     GROUP BY date, buyer, country`
  );

const selectConversionTotals = async () =>
  getRows(
    `SELECT date, buyer, country,
      SUM(CASE WHEN event_type = 'ftd' THEN 1 ELSE 0 END) AS ftds,
      SUM(CASE WHEN event_type = 'redeposit' THEN 1 ELSE 0 END) AS redeposits,
      SUM(CASE WHEN event_type = 'registration' THEN 1 ELSE 0 END) AS registers
     FROM conversion_events
     GROUP BY date, buyer, country`
  );

const selectInstallTotalsByDevice = async () =>
  getRows(
    `SELECT date, device, COUNT(*) as installs
     FROM install_events
     GROUP BY date, device`
  );

const insertDeviceStat = async (payload) => {
  await query(
    `INSERT INTO device_stats (
      date,
      device,
      os,
      os_version,
      os_icon,
      device_model,
      buyer,
      country,
      spend,
      revenue,
      clicks,
      registers,
      ftds,
      redeposits
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (date, device, os, os_version, device_model, buyer, country)
     DO UPDATE SET
       os_icon = COALESCE(EXCLUDED.os_icon, device_stats.os_icon),
       spend = EXCLUDED.spend,
       revenue = EXCLUDED.revenue,
       clicks = EXCLUDED.clicks,
       registers = EXCLUDED.registers,
       ftds = EXCLUDED.ftds,
       redeposits = EXCLUDED.redeposits`,
    [
      payload.date,
      payload.device,
      payload.os,
      payload.os_version,
      payload.os_icon,
      payload.device_model,
      payload.buyer,
      payload.country,
      payload.spend,
      payload.revenue,
      payload.clicks,
      payload.registers,
      payload.ftds,
      payload.redeposits,
    ]
  );
};

const selectDeviceStats = async (limit) =>
  getRows(
    `SELECT id, date, device, os, os_version, os_icon, device_model, buyer, country, spend, revenue, clicks, registers, ftds, redeposits
     FROM device_stats
     ORDER BY date DESC, id DESC
     LIMIT $1`,
    [limit]
  );

const deleteDeviceStat = async (
  date,
  device,
  buyer,
  country,
  os = null,
  osVersion = null,
  deviceModel = null
) =>
  query(
    `DELETE FROM device_stats
     WHERE date = $1
       AND device = $2
       AND buyer = $3
       AND country = $4
       AND ($5::text IS NULL OR os = $5)
       AND ($6::text IS NULL OR os_version = $6)
       AND ($7::text IS NULL OR device_model = $7)`,
    [date, device, buyer, country, os, osVersion, deviceModel]
  );

const insertUser = async (payload) => {
  const { rows } = await query(
    `INSERT INTO users (username, password_hash, role, buyer_id, verified)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      payload.username,
      payload.password_hash,
      payload.role,
      payload.buyer_id,
      payload.verified,
    ]
  );
  return rows[0];
};

const selectUsers = async (limit) =>
  getRows(
    `SELECT id, username, role, buyer_id, verified
     FROM users
     ORDER BY id DESC
     LIMIT $1`,
    [limit]
  );

const selectUserById = async (id) =>
  getRow(
    `SELECT id, username, role, buyer_id, verified
     FROM users
     WHERE id = $1`,
    [id]
  );

const selectUserByUsername = async (username) =>
  getRow(
    `SELECT id, username, password_hash, role, buyer_id
     FROM users
     WHERE username = $1`,
    [username]
  );

const updateUserPassword = async (id, passwordHash) =>
  query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, id]);

const deleteUser = async (id) => query(`DELETE FROM users WHERE id = $1`, [id]);

const insertRole = async (payload) => {
  const { rows } = await query(
    `INSERT INTO roles (name, permissions)
     VALUES ($1, $2)
     RETURNING id`,
    [payload.name, payload.permissions]
  );
  return rows[0];
};

const selectRoles = async (limit) =>
  getRows(
    `SELECT id, name, permissions
     FROM roles
     ORDER BY id ASC
     LIMIT $1`,
    [limit]
  );

const selectRoleById = async (id) =>
  getRow(`SELECT id, name FROM roles WHERE id = $1`, [id]);

const updateRole = async (payload) =>
  query(
    `UPDATE roles
     SET permissions = $1
     WHERE id = $2`,
    [payload.permissions, payload.id]
  );

const deleteRole = async (id) => query(`DELETE FROM roles WHERE id = $1`, [id]);

const postbackSecret = process.env.POSTBACK_SECRET || "";
const keitaroCronSecret = process.env.KEITARO_CRON_SECRET || "";
const fxBase = String(process.env.FX_BASE || "USD").toUpperCase();
const fxTarget = String(process.env.FX_TARGET || "USD").toUpperCase();
const fxProvider = String(process.env.FX_PROVIDER || "google").toLowerCase();
const fxTtlSeconds = Number.parseInt(process.env.FX_TTL_SECONDS || "3600", 10);
const fxCache = {
  rate: 1,
  base: fxBase,
  target: fxTarget,
  provider: fxProvider,
  fetchedAt: 0,
};

const normalizeBaseUrl = (value) => {
  const trimmed = String(value || "").replace(/\/+$/, "");
  return trimmed.endsWith("/admin") ? trimmed.slice(0, -6) : trimmed;
};
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

const formatIsoDate = (value) => {
  if (!(value instanceof Date)) return "";
  if (Number.isNaN(value.getTime())) return "";
  return value.toISOString().slice(0, 10);
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

const extractRowPrimitive = (value) => {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    if (!value.length) return null;
    return extractRowPrimitive(value[0]);
  }
  if (typeof value === "object") {
    const priorityKeys = ["value", "name", "title", "label", "city"];
    for (const key of priorityKeys) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const nested = extractRowPrimitive(value[key]);
        if (nested !== null && nested !== undefined && nested !== "") return nested;
      }
    }
    return null;
  }
  return value;
};

const normalizeCityValue = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const normalized = text.toLowerCase();
  if (
    [
      "unknown",
      "(not set)",
      "not set",
      "n/a",
      "na",
      "null",
      "undefined",
      "-",
    ].includes(normalized)
  ) {
    return "";
  }
  return text;
};

const resolveCityValue = (row, preferredField) => {
  const candidates = [
    preferredField,
    "city",
    "city_name",
    "cityName",
    "geo_city",
    "location_city",
    "sub_city",
  ].filter(Boolean);

  for (const key of candidates) {
    const value = readRowValue(row, key);
    const city = normalizeCityValue(value);
    if (city) return city;
  }
  return "";
};

const resolveRegionValue = (row, preferredField) => {
  const candidates = [
    preferredField,
    "region",
    "state",
    "state_region",
    "state_region_name",
    "region_name",
    "geo_region",
    "geo_state",
    "location_region",
    "location_state",
    "sub_region",
    "sub_state",
  ].filter(Boolean);

  for (const key of candidates) {
    const value = readRowValue(row, key);
    const region = normalizeCityValue(value);
    if (region) return region;
  }
  return "";
};

const resolvePostbackContext = async (payload) => {
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
  const externalId =
    payload.external_id ||
    payload.externalId ||
    payload.pwauid ||
    payload.pwa_uid ||
    payload.pwaid ||
    payload.user_id ||
    payload.userid ||
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
    mapped = await selectCampaignByKey(String(campaignId).trim(), String(campaignId).trim());
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
    external_id: externalId ? String(externalId).trim() : null,
    click_id: normalizedClick ? String(normalizedClick).trim() : null,
  };
};

const readRowValue = (row, key) => {
  if (!row || !key) return null;
  const field = String(key || "").trim();
  if (!field) return null;

  const findObjectValue = (obj, candidate) => {
    if (!obj || typeof obj !== "object") return null;
    if (Object.prototype.hasOwnProperty.call(obj, candidate)) {
      return extractRowPrimitive(obj[candidate]);
    }
    const keys = Object.keys(obj);
    const lower = candidate.toLowerCase();
    const normalized = lower.replace(/[^a-z0-9]/g, "");
    const caseMatch = keys.find((k) => String(k).toLowerCase() === lower);
    if (caseMatch) {
      return extractRowPrimitive(obj[caseMatch]);
    }
    const normalizedMatch = keys.find(
      (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
    );
    if (normalizedMatch) {
      return extractRowPrimitive(obj[normalizedMatch]);
    }
    const containsMatch = keys.find((k) => {
      const normalizedKey = String(k).toLowerCase().replace(/[^a-z0-9]/g, "");
      return normalizedKey.includes(normalized) || normalized.includes(normalizedKey);
    });
    if (containsMatch) {
      return extractRowPrimitive(obj[containsMatch]);
    }
    return null;
  };

  if (Object.prototype.hasOwnProperty.call(row, field)) {
    return extractRowPrimitive(row[field]);
  }

  const altField = field.replace(/\./g, "_");
  if (altField !== field && Object.prototype.hasOwnProperty.call(row, altField)) {
    return extractRowPrimitive(row[altField]);
  }

  const topLevelFound = findObjectValue(row, field);
  if (topLevelFound !== null && topLevelFound !== undefined) {
    return topLevelFound;
  }

  const nestedContainers = [
    "dimensions",
    "dimension",
    "measures",
    "metrics",
    "grouping",
    "groupings",
    "data",
    "values",
  ];
  for (const container of nestedContainers) {
    const containerObj = row[container];
    const nestedValue = findObjectValue(containerObj, field);
    if (nestedValue !== null && nestedValue !== undefined) {
      return nestedValue;
    }
  }

  // Supports nested mapping keys like "dimensions.city" and array indexes like "items[0].name".
  if (field.includes(".") || field.includes("[")) {
    const path = field.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
    let current = row;
    for (const part of path) {
      if (current === null || current === undefined) {
        current = null;
        break;
      }
      if (typeof current !== "object") {
        current = null;
        break;
      }
      current = current[part];
    }
    return extractRowPrimitive(current);
  }

  return null;
};

const placementKeyPattern = /(sub[\s_-]*id[\s_-]*1|sub[\s_-]*1|placement)/i;
const readPlacementValue = (row, mappedField) => {
  const candidates = [
    mappedField,
    "sub_id_1",
    "sub id 1",
    "subid1",
    "sub1",
    "sub_1",
    "placement",
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const value = readRowValue(row, candidate);
    const text = String(value ?? "").trim();
    if (text) return text;
  }

  const visit = (node, depth = 0) => {
    if (node === null || node === undefined || depth > 4) return "";
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = visit(item, depth + 1);
        if (found) return found;
      }
      return "";
    }
    if (typeof node !== "object") return "";

    const hintedKey = [node.name, node.field, node.key, node.id, node.title, node.label].find(
      (item) => typeof item === "string" && placementKeyPattern.test(item)
    );
    if (hintedKey) {
      const hintedValue = extractRowPrimitive(
        node.value ?? node.val ?? node.data ?? node.result ?? node.metric ?? node.measure
      );
      const hintedText = String(hintedValue ?? "").trim();
      if (hintedText) return hintedText;
    }

    for (const [key, value] of Object.entries(node)) {
      if (!placementKeyPattern.test(String(key))) continue;
      const primitive = extractRowPrimitive(value);
      const text = String(primitive ?? "").trim();
      if (text) return text;
    }

    for (const value of Object.values(node)) {
      if (!value || typeof value !== "object") continue;
      const found = visit(value, depth + 1);
      if (found) return found;
    }
    return "";
  };

  return visit(row);
};

const ensurePayloadField = (payload, field) => {
  if (!payload || typeof payload !== "object" || !field) return payload;
  const rawField = String(field).trim();
  if (!rawField) return payload;

  const hasDimensions = Array.isArray(payload.dimensions);
  const hasGrouping = Array.isArray(payload.grouping);
  const normalizedField = rawField.toLowerCase();

  const appendField = (items) => {
    const next = [...items];
    const normalized = next.map((item) => String(item || "").trim().toLowerCase());
    if (!normalized.includes(normalizedField)) {
      next.push(rawField);
    }
    return next;
  };

  if (hasDimensions || hasGrouping) {
    const nextPayload = { ...payload };
    if (hasDimensions) {
      nextPayload.dimensions = appendField(payload.dimensions);
    }
    if (hasGrouping) {
      nextPayload.grouping = appendField(payload.grouping);
    }
    return nextPayload;
  }

  return { ...payload, dimensions: [rawField] };
};

const normalizeKeitaroPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const next = { ...payload };
  const dimensions = Array.isArray(payload.dimensions) ? payload.dimensions : null;
  const grouping = Array.isArray(payload.grouping) ? payload.grouping : null;
  const measures = Array.isArray(payload.measures) ? payload.measures : null;
  const metrics = Array.isArray(payload.metrics) ? payload.metrics : null;

  if (dimensions && !grouping) {
    next.grouping = [...dimensions];
  }
  if (grouping && !dimensions) {
    next.dimensions = [...grouping];
  }
  if (measures && !metrics) {
    next.metrics = [...measures];
  }
  if (metrics && !measures) {
    next.measures = [...metrics];
  }

  return next;
};

const buildAuthHeaders = (apiKey) => {
  const key = String(apiKey || "");
  if (key.toLowerCase().startsWith("bearer ")) {
    return { Authorization: key };
  }
  return { "Api-Key": key };
};

const defaultKeitaroMapping = {
  dateField: "day",
  buyerField: "campaign",
  campaignField: "campaign",
  countryField: "country",
  cityField: "city",
  regionField: "region",
  placementField: "sub_id_1",
  externalIdField: "external_id",
  spendField: "cost",
  revenueField: "revenue",
  ftdRevenueField: "custom_conversion_8_revenue",
  redepositRevenueField: "custom_conversion_7_revenue",
  clicksField: "clicks",
  installsField: "installs",
  registersField: "regs",
  ftdsField: "custom_conversion_8",
  redepositsField: "custom_conversion_7",
  deviceField: "device_type",
  osField: "os",
  osVersionField: "os_version",
  osIconField: "os_icon",
  deviceModelField: "device_model",
};

const parseJsonEnv = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const parseBooleanEnv = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const text = String(value).toLowerCase();
  if (["1", "true", "yes", "y"].includes(text)) return true;
  if (["0", "false", "no", "n"].includes(text)) return false;
  return fallback;
};

const applyKeitaroRange = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const rangeDaysRaw = process.env.KEITARO_RANGE_DAYS;
  const rangeDays = Number.parseInt(rangeDaysRaw || "", 10);
  const rangeFrom = process.env.KEITARO_RANGE_FROM || "";
  const rangeTo = process.env.KEITARO_RANGE_TO || "";

  let from = rangeFrom;
  let to = rangeTo;

  if ((!from || !to) && Number.isFinite(rangeDays) && rangeDays > 0) {
    const today = new Date();
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (rangeDays - 1));
    from = formatIsoDate(start);
    to = formatIsoDate(end);
  }

  if (!from || !to) return payload;

  const existingRange = payload.range && typeof payload.range === "object" ? payload.range : {};
  return {
    ...payload,
    range: {
      ...existingRange,
      interval: "custom",
      from,
      to,
    },
  };
};

const isValidCurrencyCode = (code) => /^[A-Z]{3}$/.test(code);

const fetchGoogleRate = async (base, target) => {
  if (!isValidCurrencyCode(base) || !isValidCurrencyCode(target)) {
    throw new Error("Invalid currency code.");
  }
  const url = `https://www.google.com/finance/quote/${base}-${target}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) {
    throw new Error(`Google rate request failed (${response.status}).`);
  }
  const html = await response.text();
  const match =
    html.match(/data-last-price=\"([0-9.]+)\"/) ||
    html.match(/class=\"YMlKec fxKbKc\"[^>]*>([^<]+)</);
  if (!match) {
    throw new Error("Google rate not found.");
  }
  const rate = Number(String(match[1]).replace(/,/g, ""));
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid Google rate.");
  }
  return rate;
};

const fetchHostRate = async (base, target) => {
  const url = `https://api.exchangerate.host/latest?base=${base}&symbols=${target}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FX rate request failed (${response.status}).`);
  }
  const data = await response.json().catch(() => null);
  const rate = data?.rates?.[target];
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid FX rate.");
  }
  return Number(rate);
};

const getFxRate = async () => {
  const base = fxBase;
  const target = fxTarget;
  const now = Date.now();

  if (base === target) {
    return { rate: 1, base, target, provider: "fixed", fetchedAt: now };
  }

  if (
    fxCache.base === base &&
    fxCache.target === target &&
    fxCache.rate &&
    now - fxCache.fetchedAt < fxTtlSeconds * 1000
  ) {
    return { rate: fxCache.rate, base, target, provider: fxCache.provider, fetchedAt: fxCache.fetchedAt };
  }

  let rate;
  let provider = fxProvider;

  if (fxProvider === "google") {
    try {
      rate = await fetchGoogleRate(base, target);
    } catch (error) {
      provider = "exchangerate.host";
      rate = await fetchHostRate(base, target);
    }
  } else {
    rate = await fetchHostRate(base, target);
  }

  fxCache.rate = rate;
  fxCache.base = base;
  fxCache.target = target;
  fxCache.provider = provider;
  fxCache.fetchedAt = now;

  return { rate, base, target, provider, fetchedAt: now };
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

const authSecret =
  process.env.AUTH_SECRET || process.env.POSTBACK_SECRET || "dev-auth-secret";
const authTtlSeconds = Number.parseInt(process.env.AUTH_TTL_SECONDS || "604800", 10);

const encodeToken = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", authSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
};

const decodeToken = (token) => {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", authSecret).update(body).digest("base64url");
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch (error) {
    return null;
  }
  const exp = Number(payload?.exp || 0);
  if (exp && exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
};

const isLeadership = (user) => user?.role === "Boss" || user?.role === "Team Leader";

const normalizeBuyerName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const buyerMatches = (rowBuyer, viewerBuyer) => {
  const rowValue = normalizeBuyerName(rowBuyer);
  const viewerValue = normalizeBuyerName(viewerBuyer);
  if (!viewerValue) return false;
  if (!rowValue) return false;
  if (rowValue === viewerValue) return true;
  return rowValue.includes(viewerValue) || viewerValue.includes(rowValue);
};

const resolveViewerBuyer = async (user) => {
  if (!user || isLeadership(user)) return null;
  if (user.buyerId) {
    const record = await selectMediaBuyerById(user.buyerId);
    if (record?.name) return record.name;
  }
  return user.username || "";
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

const seedUsers = async () => {
  for (const user of userSeed) {
    await query(
      `INSERT INTO users (username, password_hash, role, buyer_id, verified)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      [user.username, user.password_hash, user.role, null, 1]
    );
  }
};

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) return next();
  if (req.path === "/api/auth/login") return next();
  if (req.path.startsWith("/api/postbacks/")) return next();
  if (req.path === "/api/keitaro/cron") return next();

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  const user = decodeToken(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  req.user = user;
  return next();
});

app.get("/api/expenses", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = await selectExpenses(limit);
  res.json(rows);
});

app.post("/api/expenses", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const {
    date,
    country,
    category,
    reference = "",
    billing,
    cryptoNetwork = "",
    cryptoHash = "",
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
    crypto_network: cryptoNetwork || null,
    crypto_hash: cryptoHash || null,
    amount: parsedAmount,
    status,
  };

  const info = await insertExpense(payload);
  res.status(201).json({ id: info.id });
});

app.patch("/api/expenses/:id", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid expense id." });
  }
  const { status } = req.body ?? {};
  if (!status) {
    return res.status(400).json({ error: "Missing status." });
  }
  await query("UPDATE expenses SET status = $1 WHERE id = $2", [status, id]);
  res.json({ ok: true });
});

app.delete("/api/expenses/:id", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid expense id." });
  }
  await query("DELETE FROM expenses WHERE id = $1", [id]);
  res.json({ ok: true });
});

app.get("/api/media-stats", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const maxLimitRaw = Number.parseInt(process.env.MEDIA_STATS_LIMIT_MAX ?? "25000", 10);
  const maxLimit = Number.isFinite(maxLimitRaw) ? Math.max(maxLimitRaw, 1) : 25000;
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), maxLimit) : 200;
  const viewerBuyer = await resolveViewerBuyer(req.user);
  let rows = await selectMediaStats(limit);
  let installTotals = await selectInstallTotals();
  let conversionTotals = await selectConversionTotals();

  if (viewerBuyer) {
    rows = rows.filter((row) => buyerMatches(row.buyer, viewerBuyer));
    installTotals = installTotals.filter((row) => buyerMatches(row.buyer, viewerBuyer));
    conversionTotals = conversionTotals.filter((row) => buyerMatches(row.buyer, viewerBuyer));
  }
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
    const key = `${row.date}|${row.buyer || ""}|${row.country || ""}|${row.city || ""}|${
      row.placement || ""
    }`;
    existingKeys.add(key);
    const mapKey = `${row.date}|${row.buyer || ""}|${row.country || ""}`;
    const shouldMergeExternal = !row.city && !row.placement;
    const installs =
      shouldMergeExternal && installMap.has(mapKey) ? installMap.get(mapKey) : row.installs ?? 0;
    const ftdRevenue =
      row.ftd_revenue === undefined || row.ftd_revenue === null
        ? null
        : Number(row.ftd_revenue);
    const redepositRevenue =
      row.redeposit_revenue === undefined || row.redeposit_revenue === null
        ? null
        : Number(row.redeposit_revenue);
    let revenue =
      row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
    if (!Number.isFinite(revenue)) {
      revenue = null;
    }
    if (revenue === null && (Number.isFinite(ftdRevenue) || Number.isFinite(redepositRevenue))) {
      revenue = (Number.isFinite(ftdRevenue) ? ftdRevenue : 0) +
        (Number.isFinite(redepositRevenue) ? redepositRevenue : 0);
    }
    return {
      ...row,
      installs,
      ftdRevenue,
      redepositRevenue,
      revenue,
    };
  });

  const mergedKeys = new Set(existingKeys);

  installTotals.forEach((row) => {
    const baseKey = `${row.date}|${row.buyer || ""}|${row.country || ""}`;
    const key = `${baseKey}||`;
    if (mergedKeys.has(key)) return;
    const conversions = conversionMap.get(baseKey);
    mergedKeys.add(key);
    merged.push({
      id: null,
      date: row.date,
      buyer: row.buyer,
      country: row.country,
      city: null,
      placement: null,
      spend: null,
      revenue: null,
      ftdRevenue: null,
      redepositRevenue: null,
      clicks: 0,
      installs: Number(row.installs) || 0,
      registers: conversions?.registers || 0,
      ftds: conversions?.ftds || 0,
      redeposits: conversions?.redeposits || 0,
    });
  });

  conversionTotals.forEach((row) => {
    const baseKey = `${row.date}|${row.buyer || ""}|${row.country || ""}`;
    const key = `${baseKey}||`;
    if (mergedKeys.has(key)) return;
    mergedKeys.add(key);
    merged.push({
      id: null,
      date: row.date,
      buyer: row.buyer,
      country: row.country,
      city: null,
      placement: null,
      spend: null,
      revenue: null,
      ftdRevenue: null,
      redepositRevenue: null,
      clicks: 0,
      installs: installMap.get(baseKey) || 0,
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

app.get("/api/user-behavior", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const maxLimitRaw = Number.parseInt(process.env.USER_BEHAVIOR_LIMIT_MAX ?? "5000", 10);
  const maxLimit = Number.isFinite(maxLimitRaw) ? Math.max(maxLimitRaw, 1) : 5000;
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), maxLimit) : 200;
  const viewerBuyer = await resolveViewerBuyer(req.user);
  let rows = await selectUserBehavior(limit);
  if (viewerBuyer) {
    rows = rows.filter((row) => buyerMatches(row.buyer, viewerBuyer));
  }
  res.json(rows);
});

app.get("/api/device-stats", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const viewerBuyer = await resolveViewerBuyer(req.user);
  let rows = await selectDeviceStats(limit);
  if (viewerBuyer) {
    rows = rows.filter((row) => buyerMatches(row.buyer, viewerBuyer));
  }

  const aggregated = new Map();
  rows.forEach((row) => {
    const device = normalizeDevice(row.device);
    const os = String(row.os || "");
    const osVersion = String(row.os_version || "");
    const osIcon = String(row.os_icon || "");
    const deviceModel = String(row.device_model || "");
    const key = `${row.date}|${device}|${os}|${osVersion}|${deviceModel}`;
    if (!aggregated.has(key)) {
      aggregated.set(key, {
        id: row.id,
        date: row.date,
        device,
        os,
        os_version: osVersion,
        os_icon: osIcon,
        device_model: deviceModel,
        buyer: row.buyer || "",
        country: row.country || "",
        spend: 0,
        revenue: 0,
        clicks: 0,
        registers: 0,
        ftds: 0,
        redeposits: 0,
        installs: row.installs ? Number(row.installs) : 0,
      });
    }
    const current = aggregated.get(key);
    current.spend += Number(row.spend || 0);
    current.revenue += Number(row.revenue || 0);
    current.clicks += Number(row.clicks || 0);
    current.registers += Number(row.registers || 0);
    current.ftds += Number(row.ftds || 0);
    current.redeposits += Number(row.redeposits || 0);
    if (row.installs) {
      current.installs += Number(row.installs || 0);
    }
  });

  const merged = Array.from(aggregated.values()).sort((a, b) => {
    const dateSort = String(b.date || "").localeCompare(String(a.date || ""));
    if (dateSort !== 0) return dateSort;
    return (b.id || 0) - (a.id || 0);
  });

  res.json(merged.slice(0, limit));
});

app.post("/api/media-stats", async (req, res) => {
  let {
    date,
    buyer,
    country,
    city,
    placement,
    spend,
    revenue,
    ftdRevenue,
    redepositRevenue,
    ftd_revenue,
    redeposit_revenue,
    clicks,
    installs,
    registers,
    ftds,
    redeposits,
  } = req.body ?? {};

  if (!isLeadership(req.user)) {
    const viewerBuyer = await resolveViewerBuyer(req.user);
    if (!viewerBuyer) {
      return res.status(403).json({ error: "No buyer assigned." });
    }
    buyer = viewerBuyer;
  }

  if (!date || !buyer || clicks === undefined || registers === undefined || ftds === undefined) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const parsedSpend = spend === undefined || spend === null || spend === "" ? null : Number(spend);
  const parsedFtdRevenue =
    ftdRevenue === undefined || ftdRevenue === null || ftdRevenue === ""
      ? ftd_revenue === undefined || ftd_revenue === null || ftd_revenue === ""
        ? null
        : Number(ftd_revenue)
      : Number(ftdRevenue);
  const parsedRedepositRevenue =
    redepositRevenue === undefined || redepositRevenue === null || redepositRevenue === ""
      ? redeposit_revenue === undefined || redeposit_revenue === null || redeposit_revenue === ""
        ? null
        : Number(redeposit_revenue)
      : Number(redepositRevenue);
  let parsedRevenue =
    revenue === undefined || revenue === null || revenue === "" ? null : Number(revenue);
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
  if (parsedRevenue !== null && !Number.isFinite(parsedRevenue)) {
    return res.status(400).json({ error: "Revenue must be a number." });
  }
  if (parsedFtdRevenue !== null && !Number.isFinite(parsedFtdRevenue)) {
    return res.status(400).json({ error: "FTD revenue must be a number." });
  }
  if (parsedRedepositRevenue !== null && !Number.isFinite(parsedRedepositRevenue)) {
    return res.status(400).json({ error: "Redeposit revenue must be a number." });
  }
  if (
    parsedRevenue === null &&
    (parsedFtdRevenue !== null || parsedRedepositRevenue !== null)
  ) {
    parsedRevenue =
      (parsedFtdRevenue !== null ? parsedFtdRevenue : 0) +
      (parsedRedepositRevenue !== null ? parsedRedepositRevenue : 0);
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
    city: city || null,
    placement: placement || null,
    spend: parsedSpend,
    revenue: parsedRevenue,
    ftd_revenue: parsedFtdRevenue,
    redeposit_revenue: parsedRedepositRevenue,
    clicks: parsedClicks,
    installs: parsedInstalls,
    registers: parsedRegisters,
    ftds: parsedFtds,
    redeposits: parsedRedeps,
  };

  const info = await insertMediaStat(payload);
  res.status(201).json({ id: info.id });
});

app.get("/api/goals", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = await selectGoals(limit);
  if (isLeadership(req.user)) {
    return res.json(rows);
  }
  const viewerBuyer = await resolveViewerBuyer(req.user);
  const filtered = rows.filter(
    (row) => row.is_global || (viewerBuyer && buyerMatches(row.buyer, viewerBuyer))
  );
  return res.json(filtered);
});

app.post("/api/goals", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
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

  const info = await insertGoal(payload);
  res.status(201).json({ id: info.id });
});

app.delete("/api/goals/:id", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid goal id." });
  }
  await deleteGoal(id);
  res.json({ ok: true });
});

app.get("/api/media-buyers", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  if (isLeadership(req.user)) {
    const rows = await selectMediaBuyers(limit);
    return res.json(rows);
  }
  if (!req.user?.buyerId) {
    return res.json([]);
  }
  const record = await selectMediaBuyerById(req.user.buyerId);
  return res.json(record ? [record] : []);
});

app.post("/api/media-buyers", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
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

  const info = await insertMediaBuyer(payload);
  res.status(201).json({ id: info.id });
});

app.delete("/api/media-buyers/:id", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid media buyer id." });
  }
  await deleteMediaBuyer(id);
  res.json({ ok: true });
});

app.get("/api/domains", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  if (isLeadership(req.user)) {
    const rows = await selectDomains(limit);
    return res.json(rows);
  }
  const rows = await selectDomainsByOwner(req.user.id, limit);
  return res.json(rows);
});

app.post("/api/domains", async (req, res) => {
  const { domain, status, ownerId, game, platform, country } = req.body ?? {};

  if (!domain || !status) {
    return res.status(400).json({ error: "Domain and status are required." });
  }

  if (!game || !platform) {
    return res.status(400).json({ error: "Game and platform are required." });
  }

  if (!country) {
    return res.status(400).json({ error: "Country is required." });
  }

  let resolvedOwnerId = req.user.id;
  if (isLeadership(req.user) && ownerId !== undefined && ownerId !== null && ownerId !== "") {
    const parsedOwner = Number(ownerId);
    if (!Number.isFinite(parsedOwner)) {
      return res.status(400).json({ error: "Invalid owner id." });
    }
    resolvedOwnerId = parsedOwner;
  }

  const payload = {
    domain: String(domain).trim(),
    status,
    game: String(game).trim(),
    platform: String(platform).trim(),
    country: String(country).trim(),
    owner_role: req.user?.role || "",
    owner_id: resolvedOwnerId,
  };

  const info = await insertDomain(payload);
  res.status(201).json({ id: info.id });
});

app.patch("/api/domains/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid domain id." });
  }
  const domain = await selectDomainById(id);
  if (!domain) {
    return res.status(404).json({ error: "Domain not found." });
  }
  if (!isLeadership(req.user) && domain.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const { status } = req.body ?? {};
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }
  await query(`UPDATE domains SET status = $1 WHERE id = $2`, [status, id]);
  res.json({ ok: true });
});

app.delete("/api/domains/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid domain id." });
  }
  const domain = await selectDomainById(id);
  if (!domain) {
    return res.status(404).json({ error: "Domain not found." });
  }
  if (!isLeadership(req.user) && domain.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }
  await deleteDomain(id);
  res.json({ ok: true });
});

app.get("/api/pixels", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  if (isLeadership(req.user)) {
    const rows = await selectPixels(limit);
    return res.json(rows);
  }
  const rows = await selectPixelsByOwner(req.user.id, limit);
  return res.json(rows);
});

app.post("/api/pixels", async (req, res) => {
  const {
    pixelId,
    tokenEaag,
    flow,
    flows = "",
    geo,
    comment = "",
    status = "Active",
    ownerId,
  } = req.body ?? {};
  if (!pixelId || !tokenEaag || !geo || !(flow || flows)) {
    return res.status(400).json({ error: "Pixel ID, token, GEO, and Flow are required." });
  }
  let resolvedOwnerId = req.user.id;
  let resolvedOwnerRole = req.user?.role || "";
  if (isLeadership(req.user) && ownerId) {
    const parsedOwner = Number(ownerId);
    if (!Number.isFinite(parsedOwner)) {
      return res.status(400).json({ error: "Invalid owner id." });
    }
    const ownerRecord = await selectUserById(parsedOwner);
    if (!ownerRecord) {
      return res.status(400).json({ error: "Owner not found." });
    }
    resolvedOwnerId = ownerRecord.id;
    resolvedOwnerRole = ownerRecord.role || "";
  }
  const payload = {
    pixel_id: String(pixelId).trim(),
    token_eaag: String(tokenEaag).trim(),
    flows: flow ? String(flow).trim() : flows ? String(flows).trim() : null,
    geo: String(geo).trim(),
    status: String(status || "Active").trim(),
    comment: comment ? String(comment).trim() : null,
    owner_role: resolvedOwnerRole,
    owner_id: resolvedOwnerId,
  };
  const info = await insertPixel(payload);
  res.status(201).json({ id: info.id });
});

app.patch("/api/pixels/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid pixel id." });
  }
  const pixel = await selectPixelById(id);
  if (!pixel) {
    return res.status(404).json({ error: "Pixel not found." });
  }
  if (!isLeadership(req.user) && pixel.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const body = req.body ?? {};
  const status = body.status ?? req.query?.status;
  const comment = body.comment ?? req.query?.comment;
  const updates = [];
  const params = [];

  if (status !== undefined && status !== null && status !== "") {
    updates.push(`status = $${updates.length + 1}`);
    params.push(status);
  }

  if (comment !== undefined) {
    const normalizedComment = String(comment || "").trim();
    updates.push(`comment = $${updates.length + 1}`);
    params.push(normalizedComment || null);
  }

  if (!updates.length) {
    return res.status(400).json({ error: "Status or comment is required." });
  }

  params.push(id);
  await query(`UPDATE pixels SET ${updates.join(", ")} WHERE id = $${params.length}`, params);
  const updated = await getRow(
    `SELECT id, pixel_id, token_eaag, flows, geo, status, comment, owner_role, owner_id, created_at
     FROM pixels
     WHERE id = $1`,
    [id]
  );
  res.json(updated || { ok: true });
});

app.delete("/api/pixels/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid pixel id." });
  }
  const pixel = await selectPixelById(id);
  if (!pixel) {
    return res.status(404).json({ error: "Pixel not found." });
  }
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  await deletePixel(id);
  res.json({ ok: true });
});

app.get("/api/campaigns", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  const rows = await selectCampaigns(limit);
  res.json(rows);
});

app.post("/api/campaigns", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const { keitaroId = "", name, buyer, country = "", domain = "" } = req.body ?? {};
  if (!name || !buyer) {
    return res.status(400).json({ error: "Campaign name and buyer are required." });
  }

  try {
    const info = await insertCampaign({
      keitaro_id: String(keitaroId || "").trim() || null,
      name: String(name).trim(),
      buyer: String(buyer).trim(),
      country: String(country || "").trim(),
      domain: String(domain || "").trim() || null,
    });
    res.status(201).json({ id: info.id });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_UNIQUE" || error?.code === "23505") {
      return res.status(409).json({ error: "Campaign already exists." });
    }
    res.status(500).json({ error: "Failed to create campaign." });
  }
});

app.delete("/api/campaigns/:id", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid campaign id." });
  }
  await deleteCampaign(id);
  res.json({ ok: true });
});

app.all("/api/postbacks/install", async (req, res) => {
  const payload = { ...(req.query || {}), ...(req.body || {}) };
  const secret = String(payload.key || payload.token || payload.secret || "");
  if (postbackSecret && secret !== postbackSecret) {
    return res.status(401).json({ error: "Invalid postback key." });
  }

  const context = await resolvePostbackContext(payload);

  try {
    await insertInstallEvent({
      date: context.date,
      campaign_id: context.campaign_id,
      buyer: context.buyer,
      country: context.country,
      domain: context.domain,
      device: context.device,
      external_id: context.external_id,
      click_id: context.click_id,
      source: String(payload.source || payload.network || payload.from || "postback"),
      raw: JSON.stringify(payload),
    });
  } catch (error) {
    if (error?.code !== "SQLITE_CONSTRAINT_UNIQUE" && error?.code !== "23505") {
      return res.status(500).json({ error: "Failed to store install." });
    }
  }

  res.json({ ok: true });
});

app.get("/api/postbacks/logs", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const maxLimitRaw = Number.parseInt(process.env.POSTBACK_LOG_LIMIT_MAX ?? "1000", 10);
  const maxLimit = Number.isFinite(maxLimitRaw) ? Math.max(maxLimitRaw, 1) : 1000;
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), maxLimit) : 200;
  const viewerBuyer = await resolveViewerBuyer(req.user);

  const rows = await selectPostbackLogs(limit);
  const safeParse = (value) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  };
  const resolveExternalId = (row) => {
    if (row.external_id) return row.external_id;
    const payload = safeParse(row.raw);
    if (!payload) return null;
    return (
      payload.external_id ||
      payload.externalId ||
      payload.pwauid ||
      payload.pwa_uid ||
      payload.pwaid ||
      payload.user_id ||
      payload.userid ||
      null
    );
  };

  const filtered = viewerBuyer
    ? rows.filter((row) => buyerMatches(row.buyer, viewerBuyer))
    : rows;

  const normalized = filtered.map((row) => ({
    ...row,
    external_id: resolveExternalId(row),
  }));

  res.json(normalized);
});

const handleConversionPostback = (eventType) => async (req, res) => {
  const payload = { ...(req.query || {}), ...(req.body || {}) };
  const secret = String(payload.key || payload.token || payload.secret || "");
  if (postbackSecret && secret !== postbackSecret) {
    return res.status(401).json({ error: "Invalid postback key." });
  }

  if (!eventType || !["ftd", "redeposit", "registration"].includes(eventType)) {
    return res.status(400).json({ error: "Invalid event type." });
  }

  const context = await resolvePostbackContext(payload);

  try {
    await insertConversionEvent({
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

app.get("/api/users", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  if (isLeadership(req.user)) {
    const rows = await selectUsers(limit);
    return res.json(rows);
  }
  const record = await selectUserById(req.user.id);
  return res.json(record ? [record] : []);
});

app.post("/api/users", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
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
    const info = await insertUser(payload);
    res.status(201).json({ id: info.id });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_UNIQUE" || error?.code === "23505") {
      return res.status(409).json({ error: "Username already exists." });
    }
    res.status(500).json({ error: "Failed to create user." });
  }
});

app.patch("/api/users/:id/password", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid user id." });
  }
  const { password } = req.body ?? {};
  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }
  await updateUserPassword(id, hashPassword(password));
  res.json({ ok: true });
});

app.delete("/api/users/:id", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid user id." });
  }
  await deleteUser(id);
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = await selectUserByUsername(String(username).trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = encodeToken({
    id: user.id,
    username: user.username,
    role: user.role,
    buyerId: user.buyer_id,
    exp: Math.floor(Date.now() / 1000) + (Number.isFinite(authTtlSeconds) ? authTtlSeconds : 604800),
  });

  res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      buyerId: user.buyer_id,
    },
  });
});

app.patch("/api/auth/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }
  const user = await selectUserByUsername(String(req.user.username || "").trim());
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }
  await updateUserPassword(user.id, hashPassword(newPassword));
  res.json({ ok: true });
});

app.get("/api/fx", async (req, res) => {
  try {
    const data = await getFxRate();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to load FX rate." });
  }
});

app.get("/api/roles", async (req, res) => {
  const limitRaw = Number.parseInt(req.query.limit ?? "200", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;
  let rows = await selectRoles(limit);
  if (!isLeadership(req.user)) {
    rows = rows.filter((row) => row.name === req.user?.role);
  }
  const normalized = rows.map((row) => ({
    ...row,
    permissions: (() => {
      let permissions = [];
      try {
        permissions = JSON.parse(row.permissions || "[]");
      } catch (error) {
        permissions = [];
      }
      if (row.name === "Boss" || row.name === "Team Leader") {
        return allPermissions;
      }
      const compatPermissions = Array.isArray(permissions) ? [...permissions] : [];
      if (
        compatPermissions.includes("statistics") &&
        !compatPermissions.includes("placements")
      ) {
        compatPermissions.push("placements");
      }
      return Array.from(new Set(compatPermissions));
    })(),
  }));
  res.json(normalized);
});

app.post("/api/roles", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const { name, permissions = [] } = req.body ?? {};

  if (!name) {
    return res.status(400).json({ error: "Role name is required." });
  }

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "Permissions must be an array." });
  }

  try {
    const info = await insertRole({
      name: String(name).trim(),
      permissions: JSON.stringify(permissions),
    });
    res.status(201).json({ id: info.id });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_UNIQUE" || error?.code === "23505") {
      return res.status(409).json({ error: "Role already exists." });
    }
    res.status(500).json({ error: "Failed to create role." });
  }
});

app.put("/api/roles/:id", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid role id." });
  }

  const { permissions = [] } = req.body ?? {};
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "Permissions must be an array." });
  }

  const role = await selectRoleById(id);
  if (!role) {
    return res.status(404).json({ error: "Role not found." });
  }

  const finalPermissions =
    role.name === "Boss" || role.name === "Team Leader" ? allPermissions : permissions;

  await updateRole({ id, permissions: JSON.stringify(finalPermissions) });
  res.json({ ok: true });
});

app.delete("/api/roles/:id", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid role id." });
  }
  const role = await selectRoleById(id);
  if (role?.name === "Boss" || role?.name === "Team Leader") {
    return res.status(403).json({ error: "Protected role cannot be deleted." });
  }
  await deleteRole(id);
  res.json({ ok: true });
});

const runKeitaroSync = async ({
  baseUrl,
  apiKey,
  reportPath,
  payload,
  mapping,
  replaceExisting,
  target,
}) => {
  if (!baseUrl || !apiKey || !payload) {
    const error = new Error("Base URL, API key, and payload are required.");
    error.status = 400;
    throw error;
  }

  const map = mapping || {};
  const syncTarget = target === "device" ? "device" : target === "user_behavior" ? "user_behavior" : "overall";
  let preparedPayload = normalizeKeitaroPayload(payload);
  const requiredFields =
    syncTarget === "overall"
      ? [
          map.dateField || defaultKeitaroMapping.dateField,
          map.buyerField || defaultKeitaroMapping.buyerField,
          map.countryField || defaultKeitaroMapping.countryField,
          map.cityField || defaultKeitaroMapping.cityField,
          map.regionField || defaultKeitaroMapping.regionField,
          map.placementField || defaultKeitaroMapping.placementField,
        ]
      : syncTarget === "user_behavior"
        ? [
            map.dateField || defaultKeitaroMapping.dateField,
            map.buyerField || defaultKeitaroMapping.buyerField,
            map.campaignField || defaultKeitaroMapping.campaignField,
            map.countryField || defaultKeitaroMapping.countryField,
            map.regionField || defaultKeitaroMapping.regionField,
            map.cityField || defaultKeitaroMapping.cityField,
            map.placementField || defaultKeitaroMapping.placementField,
            map.externalIdField || defaultKeitaroMapping.externalIdField,
          ]
        : [
          map.dateField || defaultKeitaroMapping.dateField,
          map.buyerField || defaultKeitaroMapping.buyerField,
          map.countryField || defaultKeitaroMapping.countryField,
          map.deviceField || defaultKeitaroMapping.deviceField,
          map.osField || defaultKeitaroMapping.osField,
          map.osVersionField || defaultKeitaroMapping.osVersionField,
          map.deviceModelField || defaultKeitaroMapping.deviceModelField,
        ];
  requiredFields.forEach((field) => {
    preparedPayload = ensurePayloadField(preparedPayload, field);
  });
  preparedPayload = normalizeKeitaroPayload(preparedPayload);

  const endpoint = `${normalizeBaseUrl(baseUrl)}${normalizePath(
    reportPath || "/admin_api/v1/report/build"
  )}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(apiKey),
    },
    body: JSON.stringify(preparedPayload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      data?.error || data?.message || "Failed to build report."
    );
    error.status = response.status;
    throw error;
  }

  const rows = Array.isArray(data)
    ? data
    : data?.rows || data?.data?.rows || data?.result || [];

  if (!Array.isArray(rows)) {
    const error = new Error("Unexpected report response format.");
    error.status = 400;
    throw error;
  }

  const extractColumnNames = (responseData, requestPayload) => {
    const candidates = [
      responseData?.meta,
      responseData?.data?.meta,
      responseData?.columns,
      responseData?.data?.columns,
    ];

    const isUsefulColumnName = (name) =>
      /[a-z_]/i.test(String(name || "")) && !/^\d+$/.test(String(name || "").trim());

    for (const candidate of candidates) {
      if (!Array.isArray(candidate) || candidate.length === 0) continue;
      const names = candidate
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            return item.name || item.field || item.key || item.alias || item.title || item.label || "";
          }
          return "";
        })
        .map((name) => String(name || "").trim())
        .filter(Boolean);
      const usefulCount = names.filter((name) => isUsefulColumnName(name)).length;
      if (names.length > 0 && usefulCount >= Math.max(1, Math.ceil(names.length * 0.4))) {
        return names;
      }
    }

    const payloadDimensions = Array.isArray(requestPayload?.dimensions)
      ? requestPayload.dimensions
      : Array.isArray(requestPayload?.grouping)
        ? requestPayload.grouping
        : [];
    const payloadMeasures = Array.isArray(requestPayload?.measures)
      ? requestPayload.measures
      : Array.isArray(requestPayload?.metrics)
        ? requestPayload.metrics
        : [];
    const fallback = [...payloadDimensions, ...payloadMeasures]
      .map((item) => String(item || "").trim())
      .filter(Boolean);
    return fallback;
  };

  const columnNames = extractColumnNames(data, preparedPayload);
  const payloadDimensions = Array.isArray(preparedPayload?.dimensions)
    ? preparedPayload.dimensions
    : Array.isArray(preparedPayload?.grouping)
      ? preparedPayload.grouping
      : [];
  const payloadMeasures = Array.isArray(preparedPayload?.measures)
    ? preparedPayload.measures
    : Array.isArray(preparedPayload?.metrics)
      ? preparedPayload.metrics
      : [];

  const normalizeReportRow = (rawRow) => {
    if (Array.isArray(rawRow)) {
      if (!Array.isArray(columnNames) || columnNames.length === 0) return rawRow;
      const mapped = {};
      for (let index = 0; index < rawRow.length; index += 1) {
        const key = columnNames[index] || `col_${index}`;
        mapped[key] = rawRow[index];
      }
      return mapped;
    }

    if (rawRow && typeof rawRow === "object") {
      const mapped = { ...rawRow };
      const applyTuple = (tuple, names, prefix) => {
        if (!Array.isArray(tuple)) return;
        for (let index = 0; index < tuple.length; index += 1) {
          const key = String(names[index] || `${prefix}_${index}`).trim();
          if (key && !Object.prototype.hasOwnProperty.call(mapped, key)) {
            mapped[key] = tuple[index];
          }
        }
      };

      applyTuple(rawRow.dimensions, payloadDimensions, "dimension");
      applyTuple(rawRow.grouping, payloadDimensions, "grouping");
      applyTuple(rawRow.measures, payloadMeasures, "measure");
      applyTuple(rawRow.metrics, payloadMeasures, "metric");
      return mapped;
    }

    return rawRow;
  };

  let inserted = 0;
  let skipped = 0;
  let placementsExtracted = 0;
  const placementSamples = new Set();
  const clearedOverallKeys = new Set();

  for (const rawRow of rows) {
    const row = normalizeReportRow(rawRow);
    const date = normalizeDate(readRowValue(row, map.dateField));
    if (!date) {
      skipped += 1;
      continue;
    }

    const buyer = String(readRowValue(row, map.buyerField) || "Keitaro");
    const country = String(readRowValue(row, map.countryField) || "");
    const baseRowKey = `${date}|${buyer}|${country}`;

    if (syncTarget === "overall" && replaceExisting && !clearedOverallKeys.has(baseRowKey)) {
      await query(`DELETE FROM media_stats WHERE date = $1 AND buyer = $2 AND country = $3`, [
        date,
        buyer,
        country,
      ]);
      clearedOverallKeys.add(baseRowKey);
    }

    const city = resolveCityValue(row, map.cityField);
    const region = resolveRegionValue(row, map.regionField || defaultKeitaroMapping.regionField);
    const placement = String(
      readPlacementValue(row, map.placementField || defaultKeitaroMapping.placementField) || ""
    ).trim();
    if (placement) {
      placementsExtracted += 1;
      if (placementSamples.size < 5) {
        placementSamples.add(placement);
      }
    }
    const spend = numberFromValue(readRowValue(row, map.spendField));
    const ftdRevenue = numberFromValue(readRowValue(row, map.ftdRevenueField));
    const redepositRevenue = numberFromValue(readRowValue(row, map.redepositRevenueField));
    let revenue = numberFromValue(readRowValue(row, map.revenueField));
    const clicks = numberFromValue(readRowValue(row, map.clicksField)) ?? 0;
    const registers = numberFromValue(readRowValue(row, map.registersField)) ?? 0;
    const ftds = numberFromValue(readRowValue(row, map.ftdsField)) ?? 0;
    const redeposits = numberFromValue(readRowValue(row, map.redepositsField)) ?? 0;

    const derivedRevenue =
      (ftdRevenue !== null ? ftdRevenue : 0) +
      (redepositRevenue !== null ? redepositRevenue : 0);
    if ((revenue === null || revenue === 0) && derivedRevenue > 0) {
      revenue = derivedRevenue;
    }

    if (syncTarget === "device") {
      const device = normalizeDevice(readRowValue(row, map.deviceField));
      const os = String(readRowValue(row, map.osField) || "").trim();
      const osVersion = String(readRowValue(row, map.osVersionField) || "").trim();
      const osIcon = String(readRowValue(row, map.osIconField) || "").trim();
      const deviceModel = String(readRowValue(row, map.deviceModelField) || "").trim();

      if (replaceExisting) {
        await deleteDeviceStat(
          date,
          device,
          buyer,
          country,
          os || null,
          osVersion || null,
          deviceModel || null
        );
      }

      await insertDeviceStat({
        date,
        device,
        os: os || null,
        os_version: osVersion || null,
        os_icon: osIcon || null,
        device_model: deviceModel || null,
        buyer,
        country,
        spend,
        revenue,
        clicks: Number(clicks) || 0,
        registers: Number(registers) || 0,
        ftds: Number(ftds) || 0,
        redeposits: Number(redeposits) || 0,
      });
    } else if (syncTarget === "user_behavior") {
      const externalId = String(
        readRowValue(row, map.externalIdField || defaultKeitaroMapping.externalIdField) || ""
      ).trim();
      if (!externalId) {
        skipped += 1;
        continue;
      }
      const campaign = String(
        readRowValue(row, map.campaignField || map.buyerField || defaultKeitaroMapping.campaignField) || ""
      ).trim();

      await insertUserBehavior({
        date,
        external_id: externalId,
        buyer,
        campaign: campaign || null,
        country,
        region: region || null,
        city: city || null,
        placement: placement || null,
        clicks: Number(clicks) || 0,
        registers: Number(registers) || 0,
        ftds: Number(ftds) || 0,
        redeposits: Number(redeposits) || 0,
        revenue,
        ftd_revenue: ftdRevenue,
        redeposit_revenue: redepositRevenue,
      });
    } else {
      const installs = numberFromValue(readRowValue(row, map.installsField));

      await insertMediaStat({
        date,
        buyer,
        country,
        city: city || null,
        region: region || null,
        placement: placement || null,
        spend,
        revenue,
        ftd_revenue: ftdRevenue,
        redeposit_revenue: redepositRevenue,
        clicks: Number(clicks) || 0,
        installs: installs === null ? null : Number(installs) || 0,
        registers: Number(registers) || 0,
        ftds: Number(ftds) || 0,
        redeposits: Number(redeposits) || 0,
      });
    }

    inserted += 1;
  }

  return {
    total: rows.length,
    inserted,
    skipped,
    placementsExtracted,
    placementSamples: Array.from(placementSamples),
  };
};

app.post("/api/keitaro/test", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
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

app.all("/api/keitaro/cron", async (req, res) => {
  const secret = String(req.headers["x-cron-secret"] || req.query.secret || "");
  if (keitaroCronSecret && secret !== keitaroCronSecret) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const targetParam = String(req.query.target || "").toLowerCase();
  const targetEnv = String(process.env.KEITARO_TARGET || "").toLowerCase();
  const target = targetParam || targetEnv || "overall";
  const isDeviceTarget = target === "device";
  const isUserTarget = target === "user_behavior";
  const asyncMode =
    String(req.query.async || req.query.background || "").toLowerCase() === "1" ||
    String(req.query.async || req.query.background || "").toLowerCase() === "true";

  const baseUrl = process.env.KEITARO_BASE_URL;
  const apiKey = process.env.KEITARO_API_KEY;
  const reportPath =
    (isDeviceTarget
      ? process.env.KEITARO_DEVICE_REPORT_PATH
      : isUserTarget
        ? process.env.KEITARO_USER_REPORT_PATH
        : process.env.KEITARO_REPORT_PATH) || "/admin_api/v1/report/build";
  const payloadRaw =
    (isDeviceTarget
      ? process.env.KEITARO_DEVICE_REPORT_PAYLOAD
      : isUserTarget
        ? process.env.KEITARO_USER_REPORT_PAYLOAD
        : process.env.KEITARO_REPORT_PAYLOAD) || process.env.KEITARO_REPORT_PAYLOAD;
  const mapping = parseJsonEnv(
    isDeviceTarget
      ? process.env.KEITARO_DEVICE_MAPPING
      : isUserTarget
        ? process.env.KEITARO_USER_MAPPING
        : process.env.KEITARO_MAPPING,
    defaultKeitaroMapping
  );
  const replaceExisting = parseBooleanEnv(
    isDeviceTarget
      ? process.env.KEITARO_DEVICE_REPLACE
      : isUserTarget
        ? process.env.KEITARO_USER_REPLACE
        : process.env.KEITARO_REPLACE,
    true
  );

  if (!baseUrl || !apiKey || !payloadRaw) {
    const payloadName = isDeviceTarget
      ? "KEITARO_DEVICE_REPORT_PAYLOAD"
      : isUserTarget
        ? "KEITARO_USER_REPORT_PAYLOAD"
        : "KEITARO_REPORT_PAYLOAD";
    return res.status(400).json({
      error: `KEITARO_BASE_URL, KEITARO_API_KEY, and ${payloadName} are required.`,
    });
  }

  const payload = applyKeitaroRange(parseJsonEnv(payloadRaw));
  if (!payload) {
    return res.status(400).json({ error: "KEITARO_REPORT_PAYLOAD must be valid JSON." });
  }

  const runSync = async () => {
    return runKeitaroSync({
      baseUrl,
      apiKey,
      reportPath,
      payload,
      mapping,
      replaceExisting,
      target,
    });
  };

  if (asyncMode) {
    res.status(202).json({ ok: true, queued: true, target });
    runSync().catch((error) => {
      console.error("Keitaro async sync failed:", error);
    });
    return;
  }

  try {
    const result = await runSync();
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Sync failed." });
  }
});

app.post("/api/keitaro/sync", async (req, res) => {
  if (!isLeadership(req.user)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  const { baseUrl, apiKey, reportPath, payload, mapping, replaceExisting, target } = req.body ?? {};

  try {
    const result = await runKeitaroSync({
      baseUrl,
      apiKey,
      reportPath,
      payload,
      mapping,
      replaceExisting,
      target,
    });

    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Sync failed." });
  }
});

const PORT = process.env.PORT || 5174;
const startServer = async () => {
  await initDb();
  await seedRoles();
  await seedUsers();
  app.listen(PORT, () => {
    console.log(`Finance API running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
