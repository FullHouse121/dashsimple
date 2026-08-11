// Post-repair acceptance check for the user_behavior duplication fix.
// Run after scripts/dedupe-user-behavior.mjs --all completes and before deploying,
// because CREATE UNIQUE INDEX in the boot migration needs the whole table clean.
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
pool.on("connect", (c) => c.query("SET statement_timeout = 300000").catch(() => {}));

const GRAIN = `external_id,
               COALESCE(buyer,''), COALESCE(campaign,''), COALESCE(country,''),
               COALESCE(region,''), COALESCE(city,''), COALESCE(placement,'')`;

// Per day rather than table-wide: a single sort over the whole table is what
// exhausted the server's temp space during the investigation.
const { rows: days } = await pool.query(
  `SELECT date FROM user_behavior GROUP BY date ORDER BY date`
);

let dirty = [];
for (const d of days) {
  const { rows: [r] } = await pool.query(
    `SELECT COUNT(*) - COUNT(DISTINCT (${GRAIN})) AS extra
       FROM user_behavior WHERE date = $1`,
    [d.date]
  );
  if (Number(r.extra) > 0) dirty.push({ date: d.date, extra: Number(r.extra) });
}

console.log(`checked ${days.length} days`);
if (dirty.length) {
  console.log(`NOT CLEAN — ${dirty.length} day(s) still hold duplicates:`);
  for (const d of dirty.slice(0, 20)) console.log(`   ${d.date}  +${d.extra}`);
  console.log(`\nre-run: node scripts/dedupe-user-behavior.mjs --all`);
} else {
  console.log(`CLEAN — every day is unique at the sync's insert grain.`);
  console.log(`CREATE UNIQUE INDEX idx_user_behavior_key_v2 will succeed at boot.`);
}

const { rows: [size] } = await pool.query(
  `SELECT n_live_tup AS rows, pg_size_pretty(pg_total_relation_size(relid)) AS tbl,
          pg_size_pretty(pg_database_size(current_database())) AS db
     FROM pg_stat_user_tables WHERE relname = 'user_behavior'`
);
console.log(`\nuser_behavior ~${Number(size.rows).toLocaleString()} rows, ${size.tbl}; database ${size.db}`);

// The row the whole investigation started from: Keitaro has exactly one
// conversion for this user, an FTD of $15.75.
const { rows: [u] } = await pool.query(
  `SELECT SUM(clicks)::int AS clicks, SUM(registers)::int AS registers,
          SUM(ftds)::int AS ftds, ROUND(SUM(revenue)::numeric, 2) AS revenue
     FROM user_behavior WHERE external_id = '1bJCoJghbfsaRJlU'`
);
console.log(`\n1bJCoJghbfsaRJlU  clicks ${u.clicks}  registers ${u.registers}  ftds ${u.ftds}  revenue ${u.revenue}`);
console.log(`Keitaro says      clicks 30     registers 0      ftds 1     revenue 15.75`);

await pool.end();
