// One-off repair for the user_behavior duplication caused by idx_user_behavior_key
// being both NULL-permeable (placement) and narrower than the sync's insert grain
// (it omitted region and city). See the migration in server/index.js for the fix
// that stops this recurring; this script cleans up what already accumulated.
//
//   node scripts/dedupe-user-behavior.mjs --check          measure only, no writes
//   node scripts/dedupe-user-behavior.mjs --day=2026-08-06 one day
//   node scripts/dedupe-user-behavior.mjs --all            every day, oldest first
import "dotenv/config";
import pg from "pg";

const args = new Set(process.argv.slice(2));
const dayArg = process.argv.slice(2).find((a) => a.startsWith("--day="))?.slice(6);
const checkOnly = args.has("--check");
const doAll = args.has("--all");

if (!checkOnly && !dayArg && !doAll) {
  console.error("refusing to run without --check, --day=YYYY-MM-DD or --all");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
pool.on("connect", (c) => c.query("SET statement_timeout = 300000").catch(() => {}));

// The full grain the sync actually inserts at: every dimension it asks Keitaro
// for. COALESCE because NULL is what defeated the original key.
const GRAIN = `external_id,
               COALESCE(buyer,''), COALESCE(campaign,''), COALESCE(country,''),
               COALESCE(region,''), COALESCE(city,''), COALESCE(placement,'')`;

const countDay = async (day) => {
  const { rows: [r] } = await pool.query(
    `SELECT COUNT(*) AS stored, COUNT(DISTINCT (${GRAIN})) AS truth
       FROM user_behavior WHERE date = $1`,
    [day]
  );
  return { stored: Number(r.stored), truth: Number(r.truth) };
};

// ctid + ROW_NUMBER keeps this to one scan and one sort of a single day, which
// matters: a set-wide sort is what exhausted the server's temp space earlier.
const dedupeDay = async (day) => {
  const { rowCount } = await pool.query(
    `DELETE FROM user_behavior
      WHERE date = $1
        AND ctid IN (
          SELECT ctid FROM (
            SELECT ctid, ROW_NUMBER() OVER (
                     PARTITION BY ${GRAIN}
                     ORDER BY id DESC
                   ) AS rn
              FROM user_behavior WHERE date = $1
          ) ranked WHERE rn > 1
        )`,
    [day]
  );
  return rowCount;
};

const { rows: days } = await pool.query(
  dayArg
    ? `SELECT $1::text AS date`
    : `SELECT date FROM user_behavior GROUP BY date ORDER BY date ASC`,
  dayArg ? [dayArg] : []
);

console.log(`${days.length} day(s) to process${checkOnly ? " (check only, nothing will be written)" : ""}\n`);

let storedTotal = 0;
let keptTotal = 0;
let deletedTotal = 0;

for (const [i, d] of days.entries()) {
  const before = await countDay(d.date);
  storedTotal += before.stored;
  keptTotal += before.truth;

  if (checkOnly) {
    console.log(
      `${d.date}  ${String(before.stored).padStart(8)} → ${String(before.truth).padStart(7)}` +
      `  (${(before.stored / Math.max(before.truth, 1)).toFixed(1)}x)`
    );
    continue;
  }

  const deleted = await dedupeDay(d.date);
  deletedTotal += deleted;
  const after = await countDay(d.date);
  const clean = after.stored === after.truth;

  console.log(
    `${d.date}  ${String(before.stored).padStart(8)} → ${String(after.stored).padStart(7)}` +
    `  deleted ${String(deleted).padStart(8)}  ${clean ? "clean" : `STILL ${after.stored - after.truth} DUPES`}` +
    `   [${i + 1}/${days.length}]`
  );
}

console.log(
  checkOnly
    ? `\nwould keep ${keptTotal.toLocaleString()} of ${storedTotal.toLocaleString()} rows` +
      `  (${(storedTotal / Math.max(keptTotal, 1)).toFixed(1)}x duplication)`
    : `\ndeleted ${deletedTotal.toLocaleString()} rows, kept ${keptTotal.toLocaleString()}`
);

await pool.end();
