/* Holt Schifffahrtszeichen (OpenStreetMap, seamark:type) für das Gebiet aus regions.json und schreibt out/seamarks.json.
   Die Seite lädt diese Datei statt die Zeichen live von Overpass zu holen (schneller, kein Abschneiden, keine Ausfälle).
   Läuft im GitHub-Workflow, baut aber höchstens alle 7 Tage neu auf; sonst wird der letzte Stand übernommen.

   Umgebung:  PAGES_URL (Adresse der Seite, von dort kommt der letzte Stand), FORCE=1 erzwingt Neuaufbau */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'out', 'seamarks.json');
const SERVERS = process.env.OVERPASS_URL ? [process.env.OVERPASS_URL] : ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const MAX_AGE = 7 * 864e5;
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function previous() {
  const base = (process.env.PAGES_URL || '').replace(/\/$/, '');
  if (!base) return null;
  try { const r = await fetch(base + '/data/seamarks.json'); return r.ok ? await r.json() : null; } catch { return null; }
}
async function query(q) {
  let last;
  for (const u of SERVERS) {
    try {
      const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q), signal: AbortSignal.timeout(120000) });
      if (r.ok) return await r.json();
      last = new Error(u + ' ' + r.status);
    } catch (e) { last = e; }
    await sleep(Number(process.env.PAUSE_MS ?? 5000));
  }
  throw last;
}

const prev = await previous();
await mkdir(join(root, 'out'), { recursive: true });
if (prev && prev.ts && !prev.partial && Date.now() - prev.ts < MAX_AGE && !process.env.FORCE) {
  log('Seezeichen aktuell (' + prev.d.length + '), übernehme letzten Stand');
  await writeFile(OUT, JSON.stringify(prev));
  process.exit(0);
}

const regions = JSON.parse(await readFile(join(root, 'regions.json'), 'utf8')).regions;
const types = [], tix = new Map(), seen = new Set(), d = [], done = new Set();
let failed = 0;
const T0 = Date.now(), BUDGET = Number(process.env.BUDGET_MS ?? 20 * 60 * 1000);
// Unvollständiger Vorlauf: bereits geholte Kacheln übernehmen und nur den Rest nachholen
if (prev && prev.partial && prev.tiles && !process.env.FORCE) {
  for (const t of prev.types) { tix.set(t, types.length); types.push(t); }
  for (const r of prev.d) { d.push(r); }
  for (const k of prev.tiles) done.add(k);
  for (const r of d) seen.add(r.join('|'));
  log('Setze fort:', d.length, 'Zeichen,', done.size, 'Kacheln');
}
for (const reg of regions) {
  const [[a, b], [c, e]] = reg.box, s = Math.min(a, c), n = Math.max(a, c), w = Math.min(b, e), o = Math.max(b, e);
  for (let la = Math.floor(s); la < n; la++) for (let lo = Math.floor(w); lo < o; lo++) {
    const key = la + ',' + lo;
    if (done.has(key)) continue;
    if (Date.now() - T0 > BUDGET) { failed++; continue; }
    const bb = [Math.max(la, s), Math.max(lo, w), Math.min(la + 1, n), Math.min(lo + 1, o)].join(',');
    try {
      const j = await query(`[out:json][timeout:100];(node["seamark:type"](${bb});way["seamark:type"](${bb}););out center tags;`);
      for (const el of j.elements || []) {
        const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon, t = el.tags?.['seamark:type'];
        if (lat == null || lon == null || !t) continue;
        const id = el.type[0] + el.id; if (seen.has(id)) continue; seen.add(id);
        let i = tix.get(t); if (i == null) { i = types.length; types.push(t); tix.set(t, i); }
        const nm = el.tags['seamark:name'] || el.tags.name || '';
        const row = [Math.round(lat * 1e5) / 1e5, Math.round(lon * 1e5) / 1e5, i]; if (nm) row.push(nm);
        d.push(row);
      }
      done.add(key);
      log('Kachel', bb, '->', d.length);
    } catch (err) { failed++; log('Kachel fehlgeschlagen', bb, String(err)); }
    await sleep(Number(process.env.PAUSE_MS ?? 4000));
  }
}
if (failed && prev && !prev.partial && prev.d && prev.d.length > d.length) { log(failed + ' Kacheln fehlgeschlagen, behalte letzten Stand'); await writeFile(OUT, JSON.stringify(prev)); process.exit(0); }
// teilweise Ergebnisse veröffentlichen, aber beim nächsten Lauf erneut versuchen
await writeFile(OUT, JSON.stringify({ ts: Date.now(), partial: failed > 0, tiles: failed ? [...done] : undefined, types, d }));
log('Seezeichen:', d.length, failed ? '(unvollständig, ' + failed + ' Kacheln fehlen)' : '');
