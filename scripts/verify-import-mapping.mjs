// Proof step for the Keitaro campaign import: rebuild `params`/`url` for every
// campaign the dashboard ALREADY has and diff against what is stored, then
// classify every difference. A stored row is a snapshot taken when the
// dashboard pushed the campaign; Keitaro is what the link does TODAY. So a
// diff is only a mapping bug when it cannot be explained by the tracker having
// been edited since.
import "dotenv/config";
import pg from "pg";
import { keitaroCampaignToLinkRow, paramsFromKeitaroCampaign } from "../server/lib/campaign-import.js";

const base = process.env.KEITARO_BASE_URL.replace(/\/$/, "");
const kt = async (p) => (await fetch(base + "/admin_api/v1" + p, { headers: { "Api-Key": process.env.KEITARO_API_KEY } })).json();

const [camps, domains] = await Promise.all([kt("/campaigns?limit=1000"), kt("/domains")]);
const domainHost = new Map((Array.isArray(domains) ? domains : []).map((d) => [Number(d.id), d.name || d.domain]));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const users = (await pool.query(`SELECT id, username FROM users`)).rows;
const aliases = new Map([["leo","Leomarketing"],["karen","KarenFarias"]]);
const links = (await pool.query(`SELECT * FROM tracking_links WHERE keitaro_id IS NOT NULL`)).rows;
const byKid = new Map(links.map((l) => [String(l.keitaro_id), l]));

const qs = (url) => {
  const i = String(url || "").indexOf("?");
  return i === -1 ? "" : url.slice(i + 1);
};
const pairs = (s) => new Map(String(s || "").split("&").filter(Boolean).map((kv) => {
  const i = kv.indexOf("=");
  return i === -1 ? [kv, ""] : [kv.slice(0, i), kv.slice(i + 1)];
}));

let checked = 0, exact = 0, hostAliasOk = 0;
const diffs = [];
const ownerBad = [];

for (const c of camps) {
  const stored = byKid.get(String(c.id));
  if (!stored) continue;
  checked++;
  const built = keitaroCampaignToLinkRow(c, { users, domainHost, aliases });

  // The part that must never differ: which link, on which host.
  const bare = (u) => String(u || "").split("?")[0];
  if (bare(built.url) === bare(stored.url)) hostAliasOk++;
  if (built.url === stored.url) exact++;
  else {
    const b = pairs(qs(built.url));
    const s = pairs(qs(stored.url));
    const keys = new Set([...b.keys(), ...s.keys()]);
    const changed = [];
    for (const k of keys) {
      if (b.get(k) !== s.get(k)) changed.push(`${k}: stored=${s.get(k) ?? "(absent)"} → keitaro=${b.get(k) ?? "(absent)"}`);
    }
    diffs.push({ id: c.id, name: c.name, sameLink: bare(built.url) === bare(stored.url), changed });
  }

  if (Number(built.owner_id) !== Number(stored.owner_id)) {
    ownerBad.push({ id: c.id, name: c.name, built: built.owner_id, builtName: built.buyer, stored: stored.owner_id, storedBuyer: stored.buyer });
  }
}

console.log(`checked ${checked} campaigns already in tracking_links\n`);
console.log(`  host+alias identical : ${hostAliasOk}/${checked}   <- the link itself`);
console.log(`  full url identical   : ${exact}/${checked}`);
console.log(`  owner identical      : ${checked - ownerBad.length}/${checked}`);

// Which parameter keys account for the query-string differences?
const keyTally = {};
for (const d of diffs) for (const c of d.changed) {
  const k = c.split(":")[0];
  keyTally[k] = (keyTally[k] || 0) + 1;
}
console.log(`\n=== query-string diffs by parameter (${diffs.length} urls differ) ===`);
for (const [k, n] of Object.entries(keyTally).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(12)} ${n}`);

console.log(`\n  urls differing on something OTHER than host/alias only: ${diffs.filter((d) => !d.sameLink).length}`);
for (const d of diffs.filter((x) => !x.sameLink).slice(0, 10)) console.log(`    #${d.id} ${d.name}`);

console.log(`\n=== 6 example diffs in full ===`);
for (const d of diffs.slice(0, 6)) {
  console.log(`  #${d.id} ${d.name}`);
  for (const c of d.changed) console.log(`      ${c}`);
}

console.log(`\n=== owner mismatches (${ownerBad.length}) ===`);
for (const m of ownerBad) console.log(`  #${m.id} ${m.name}\n      stored owner_id=${m.stored} (buyer "${m.storedBuyer}")  →  name-segment owner_id=${m.built} ("${m.builtName}")`);

await pool.end();
