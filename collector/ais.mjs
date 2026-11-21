/* Reine Funktionen des Sammlers: AIS-Meldungen von aisstream.io in einen Schiffsbestand einarbeiten.
   Keine Ein-/Ausgabe hier, damit sich alles ohne Netz testen lässt. */

export const TRACK_MAX_POINTS = 60;      // höchstens so viele Punkte Kielwasser je Schiff
export const TRACK_MAX_AGE = 3 * 3600;   // Kielwasser der letzten 3 Stunden (Sekunden)
export const MOVING_MAX_AGE = 3 * 3600;  // fahrende Schiffe ohne neue Meldung nach 3 h entfernen
export const STILL_MAX_AGE = 12 * 3600;  // liegende Schiffe melden selten, daher 12 h behalten

const r5 = x => Math.round(x * 1e5) / 1e5;
const r1 = x => Math.round(x * 10) / 10;

export function dist(a, b) {
  const k = Math.cos((a[0] + b[0]) * Math.PI / 360);
  const dy = (a[0] - b[0]) * 111320, dx = (a[1] - b[1]) * 111320 * k;
  return Math.sqrt(dx * dx + dy * dy);
}

export function validPos(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 &&
    !(lat === 0 && lon === 0) && lat !== 91 && lon !== 181;
}

export function inRegions(lat, lon, regions) {
  if (!regions || !regions.length) return true;
  return regions.some(r => {
    const [[a, b], [c, d]] = r.box;
    return lat >= Math.min(a, c) && lat <= Math.max(a, c) && lon >= Math.min(b, d) && lon <= Math.max(b, d);
  });
}

/* aisstream-Zeit: "2026-11-21 09:14:31.318353 +0000 UTC" -> Sekunden seit 1970 */
export function parseTime(s, fallback) {
  if (typeof s === 'string') {
    const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?/);
    if (m) {
      const t = Date.parse(m[1] + 'T' + m[2] + 'Z');
      if (!Number.isNaN(t)) return Math.floor(t / 1000);
    }
  }
  return fallback;
}

const cleanText = s => typeof s === 'string' ? s.replace(/@+/g, ' ').replace(/\s+/g, ' ').trim() : '';

function ship(state, mmsi) {
  let s = state.get(mmsi);
  if (!s) { s = { m: mmsi }; state.set(mmsi, s); }
  return s;
}

function setDims(s, dim) {
  if (!dim) return;
  const l = (dim.A || 0) + (dim.B || 0), w = (dim.C || 0) + (dim.D || 0);
  if (l > 0 && l < 500) s.l = l;
  if (w > 0 && w < 80) s.w = w;
}

function setPosition(s, p, ts, cls) {
  const lat = p.Latitude, lon = p.Longitude;
  if (!validPos(lat, lon)) return false;
  if (s.ts != null && ts < s.ts) return false; // ältere Meldung, die verspätet kam
  s.lat = r5(lat); s.lon = r5(lon); s.ts = ts; s.cls = cls;
  s.sog = Number.isFinite(p.Sog) && p.Sog < 102.2 ? r1(p.Sog) : null;
  s.cog = Number.isFinite(p.Cog) && p.Cog < 360 ? r1(p.Cog) : null;
  s.hdg = Number.isFinite(p.TrueHeading) && p.TrueHeading < 360 ? p.TrueHeading : null;
  if (cls === 'A' && Number.isFinite(p.NavigationalStatus)) s.st = p.NavigationalStatus;
  addTrack(s);
  return true;
}

export function isStill(s) {
  return s.st === 1 || s.st === 5 || s.st === 6 || s.sog == null || s.sog < 0.5;
}

/* Kielwasser ausdünnen: neuer Punkt nur bei spürbarer Bewegung */
function addTrack(s) {
  const tr = s.tr || (s.tr = []);
  const n = tr.length;
  if (n >= 3) {
    const last = [tr[n - 3], tr[n - 2]], lt = tr[n - 1];
    const d = dist(last, [s.lat, s.lon]);
    if (d < 30) return;
    if (d < 200 && s.ts - lt < 120) return;
  }
  tr.push(s.lat, s.lon, s.ts);
}

/* Eine Meldung von aisstream einarbeiten. Gibt true zurück, wenn sich etwas geändert hat. */
export function applyMessage(state, msg, nowSec) {
  if (!msg || typeof msg !== 'object' || !msg.Message) return false;
  const type = msg.MessageType, body = msg.Message[type], meta = msg.MetaData || {};
  if (!body) return false;
  const mmsi = Number(meta.MMSI ?? body.UserID);
  if (!Number.isInteger(mmsi) || mmsi < 100000000 || mmsi > 999999999) return false;
  const ts = parseTime(meta.time_utc ?? meta.TimeUtc, nowSec);
  const s = ship(state, mmsi);
  const metaName = cleanText(meta.ShipName);
  if (metaName && !s.n) s.n = metaName;

  switch (type) {
    case 'PositionReport':
      return setPosition(s, body, ts, 'A');
    case 'StandardClassBPositionReport':
      return setPosition(s, body, ts, 'B');
    case 'ExtendedClassBPositionReport': {
      const name = cleanText(body.Name);
      if (name) s.n = name;
      if (Number.isFinite(body.Type) && body.Type > 0) s.t = body.Type;
      setDims(s, body.Dimension);
      return setPosition(s, body, ts, 'B');
    }
    case 'ShipStaticData': {
      const name = cleanText(body.Name);
      if (name) s.n = name;
      if (Number.isFinite(body.Type) && body.Type > 0) s.t = body.Type;
      setDims(s, body.Dimension);
      const dest = cleanText(body.Destination);
      s.d = dest || undefined;
      const e = body.Eta;
      s.eta = e && e.Month >= 1 && e.Month <= 12 && e.Day >= 1 && e.Day <= 31 && e.Hour < 24 && e.Minute < 60
        ? [e.Month, e.Day, e.Hour, e.Minute] : undefined;
      if (Number.isFinite(body.MaximumStaticDraught) && body.MaximumStaticDraught > 0) s.dr = r1(body.MaximumStaticDraught);
      if (Number.isFinite(body.ImoNumber) && body.ImoNumber >= 1000000 && body.ImoNumber <= 9999999) s.imo = body.ImoNumber;
      const cs = cleanText(body.CallSign);
      if (cs) s.cs = cs;
      if (!s.cls) s.cls = 'A';
      return true;
    }
    case 'StaticDataReport': {
      const a = body.ReportA, b = body.ReportB;
      if (a && a.Valid !== false) { const name = cleanText(a.Name); if (name) s.n = name; }
      if (b && b.Valid !== false) {
        if (Number.isFinite(b.ShipType) && b.ShipType > 0) s.t = b.ShipType;
        const cs = cleanText(b.CallSign); if (cs) s.cs = cs;
        setDims(s, b.Dimension);
      }
      return true;
    }
    default:
      return false;
  }
}

/* Alte Einträge und Kielwasser entfernen */
export function prune(state, nowSec, regions) {
  for (const [k, s] of state) {
    if (s.ts == null || s.lat == null) { state.delete(k); continue; }
    const age = nowSec - s.ts;
    if (age > (isStill(s) ? STILL_MAX_AGE : MOVING_MAX_AGE) || !inRegions(s.lat, s.lon, regions)) { state.delete(k); continue; }
    if (s.tr) {
      let start = 0;
      while (start < s.tr.length && nowSec - s.tr[start + 2] > TRACK_MAX_AGE) start += 3;
      if (s.tr.length - start > TRACK_MAX_POINTS * 3) start = s.tr.length - TRACK_MAX_POINTS * 3;
      s.tr = s.tr.slice(start);
      if (!s.tr.length) delete s.tr;
    }
  }
}

export function fromPublic(json) {
  const state = new Map();
  for (const s of (json && Array.isArray(json.ships) ? json.ships : [])) {
    if (Number.isInteger(s.m)) state.set(s.m, { ...s, tr: Array.isArray(s.tr) ? s.tr.slice() : undefined });
  }
  return state;
}

export function toPublic(state, meta) {
  const ships = [];
  for (const s of state.values()) {
    const o = {};
    for (const [k, v] of Object.entries(s)) if (v !== undefined && v !== null && !(Array.isArray(v) && !v.length)) o[k] = v;
    ships.push(o);
  }
  ships.sort((a, b) => a.m - b.m);
  return { v: 1, ...meta, count: ships.length, ships };
}
