/* Sammelt einige Minuten lang AIS-Meldungen von aisstream.io und schreibt out/ships.json.
   Läuft im GitHub-Workflow. Der API-Schlüssel kommt aus dem Repository-Secret AISSTREAM_API_KEY
   und landet nie in der veröffentlichten Seite.

   Umgebung:
     AISSTREAM_API_KEY  API-Schlüssel von https://aisstream.io (Pflicht für Daten)
     COLLECT_SECONDS    Sammeldauer in Sekunden (Standard 240)
     PAGES_URL          Adresse der veröffentlichten Seite; von dort kommt der letzte Stand
     PREVIOUS_FILE      alternativ: lokale Datei mit dem letzten Stand (zum Testen)
*/
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMessage, prune, fromPublic, toPublic } from './ais.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const KEY = (process.env.AISSTREAM_API_KEY || '').trim();
const SECONDS = Math.max(20, Number(process.env.COLLECT_SECONDS) || 240);
const URL_WS = process.env.AISSTREAM_URL || 'wss://stream.aisstream.io/v0/stream';
const TYPES = ['PositionReport', 'StandardClassBPositionReport', 'ExtendedClassBPositionReport', 'ShipStaticData', 'StaticDataReport'];
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const regions = JSON.parse(await readFile(join(root, 'regions.json'), 'utf8')).regions;

async function previous() {
  try {
    if (process.env.PREVIOUS_FILE) return JSON.parse(await readFile(process.env.PREVIOUS_FILE, 'utf8'));
    const base = (process.env.PAGES_URL || '').replace(/\/$/, '');
    if (!base) return null;
    const r = await fetch(base + '/data/ships.json?t=' + Date.now(), { headers: { 'cache-control': 'no-cache' } });
    if (!r.ok) { log('Kein letzter Stand abrufbar:', r.status); return null; }
    return await r.json();
  } catch (e) { log('Letzter Stand nicht lesbar:', e.message); return null; }
}

async function socketClass() {
  try { return (await import('ws')).default; } catch { return globalThis.WebSocket; }
}

function text(data) {
  if (typeof data === 'string') return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf8');
  if (Array.isArray(data)) return Buffer.concat(data).toString('utf8');
  return Buffer.from(data).toString('utf8');
}

async function collect(state) {
  const WS = await socketClass();
  if (!WS) throw new Error('Kein WebSocket verfügbar (Node 22 oder Paket ws nötig)');
  const deadline = Date.now() + SECONDS * 1000;
  const stats = { messages: 0, errors: [] };
  let wait = 2000;
  while (Date.now() < deadline - 5000) {
    const started = Date.now();
    await new Promise(resolve => {
      const isWsLib = WS !== globalThis.WebSocket;
      const ws = isWsLib ? new WS(URL_WS, { perMessageDeflate: true, handshakeTimeout: 15000 }) : new WS(URL_WS);
      if (!isWsLib) ws.binaryType = 'arraybuffer';
      const stop = setTimeout(() => { try { ws.close(); } catch {} }, Math.max(1000, deadline - Date.now()));
      const done = () => { clearTimeout(stop); resolve(); };
      const onOpen = () => {
        ws.send(JSON.stringify({ APIKey: KEY, BoundingBoxes: regions.map(r => r.box), FilterMessageTypes: TYPES }));
        log('Verbunden, sammle bis', new Date(deadline).toISOString().slice(11, 19));
      };
      const onMessage = data => {
        let msg;
        try { msg = JSON.parse(text(data)); } catch { return; }
        if (msg && msg.error) { stats.errors.push(String(msg.error)); log('Fehler vom Dienst:', msg.error); return; }
        stats.messages++;
        applyMessage(state, msg, Math.floor(Date.now() / 1000));
      };
      if (isWsLib) {
        ws.on('open', onOpen);
        ws.on('message', d => onMessage(d));
        ws.on('error', e => { stats.errors.push(e.message); log('Verbindungsfehler:', e.message); });
        ws.on('close', done);
      } else {
        ws.onopen = onOpen;
        ws.onmessage = e => onMessage(e.data);
        ws.onerror = e => { stats.errors.push(e.message || 'error'); log('Verbindungsfehler'); };
        ws.onclose = done;
      }
    });
    if (Date.now() >= deadline - 5000) break;
    /* Verbindung früh beendet (Netz, Dienst, falscher Schlüssel): mit wachsender Pause neu versuchen */
    if (Date.now() - started > 60000) wait = 2000;
    log('Verbindung beendet, neuer Versuch in', wait / 1000, 's');
    await new Promise(r => setTimeout(r, wait));
    wait = Math.min(wait * 2, 30000);
  }
  return stats;
}

const prev = await previous();
const state = fromPublic(prev);
log('Letzter Stand:', state.size, 'Schiffe');

let meta = { source: 'aisstream.io', regions: regions.map(r => ({ name: r.name, box: r.box })) };
if (!KEY) {
  log('Kein API-Schlüssel (Secret AISSTREAM_API_KEY) gesetzt. Schreibe leeren Datenstand mit Hinweis.');
  meta = { ...meta, ok: false, reason: 'no-key' };
} else {
  const stats = await collect(state);
  log('Meldungen empfangen:', stats.messages);
  const fresh = stats.messages > 0;
  meta = { ...meta, ok: fresh || state.size > 0, reason: fresh ? undefined : 'no-data', messages: stats.messages,
    error: fresh ? undefined : (stats.errors[0] || undefined) };
}

const now = Math.floor(Date.now() / 1000);
prune(state, now, regions);
const out = toPublic(state, { generated: now, ...meta });
await mkdir(join(root, 'out'), { recursive: true });
await writeFile(join(root, 'out', 'ships.json'), JSON.stringify(out));
log('Geschrieben: out/ships.json mit', out.count, 'Schiffen');
