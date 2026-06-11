// Read-only diagnostic: date coverage + historical fragmentation.
import fs from "node:fs";
import pg from "pg";

const envText = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const env = {};
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const databaseUrl = env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
});
const q = (text, params) => pool.query(text, params).then((r) => r.rows);

const main = async () => {
  const span = await q(
    `SELECT MIN(date) AS min_date, MAX(date) AS max_date,
            COUNT(DISTINCT date) AS distinct_dates, COUNT(*) AS rows
     FROM media_stats`
  );
  console.log("Overall span:", span[0]);

  const last14 = await q(
    `SELECT date, COUNT(*) AS rows,
       COUNT(*) FILTER (WHERE tool IS NOT NULL) AS parsed,
       ROUND(SUM(spend)::numeric,0) AS spend
     FROM media_stats
     GROUP BY date ORDER BY date DESC LIMIT 14`
  );
  console.log("\nMost recent 14 dates present:");
  console.table(last14);

  // Fragmentation: rows whose buyer is NOT a clean person name (still raw).
  const frag = await q(
    `SELECT
       COUNT(*) AS total_rows,
       COUNT(*) FILTER (WHERE tool IS NULL) AS unparsed_rows,
       MIN(date) FILTER (WHERE tool IS NULL) AS unparsed_min_date,
       MAX(date) FILTER (WHERE tool IS NULL) AS unparsed_max_date,
       ROUND(SUM(spend) FILTER (WHERE tool IS NULL)::numeric,0) AS unparsed_spend,
       ROUND(SUM(spend) FILTER (WHERE tool IS NOT NULL)::numeric,0) AS parsed_spend
     FROM media_stats`
  );
  console.log("\nParsed vs unparsed (all time):", frag[0]);

  // Top junk/legacy buyer labels (non-person), with their date range.
  const junk = await q(
    `SELECT buyer, COUNT(*) AS rows, MIN(date) AS from_date, MAX(date) AS to_date,
            ROUND(SUM(spend)::numeric,0) AS spend
     FROM media_stats
     WHERE tool IS NULL AND (buyer LIKE '% - %' OR buyer LIKE '%|%')
     GROUP BY buyer ORDER BY rows DESC LIMIT 15`
  );
  console.log("\nTop legacy/raw buyer labels (need backfill):");
  console.table(junk);

  await pool.end();
};

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
