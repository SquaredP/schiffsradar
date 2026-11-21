# Schiffsradar

Mobile Live-Karte für Schiffe auf Rhein, Neckar, Main und Co. – das Gegenstück zum [Zugradar](https://github.com/SquaredP/zugradar). Zeigt, wo Schiffe gerade fahren, wohin sie wollen und wann sie an deinem Ort vorbeikommen.

**Live:** https://squaredp.github.io/schiffradar-/

## Funktionen

- **Karte mit Seezeichen** (OpenSeaMap) und allen Schiffen im Ausschnitt. Der Pfeil zeigt die Fahrtrichtung, liegende Schiffe sind Kreise. Gestrichelte Symbole haben seit über 20 Minuten nichts gemeldet.
- **Filter** nach Fracht, Tanker, Fahrgast, Dienst · Schlepper und Sport · Sonstige. Liegende Schiffe (festgemacht, vor Anker) sind zuschaltbar. Suche nach Name oder MMSI, Enter sucht im ganzen Datenstand.
- **Schiff verfolgen:** Die Karte folgt dem Schiff. Wie bei einem Navi ist der Kurs der nächsten 30 Minuten kräftig, das Kielwasser der letzten Stunden grau. Das Ziel laut AIS wird, wenn es sich einem Ort zuordnen lässt, gestrichelt mit Ankunftszeit eingezeichnet. „Strecke zeigen“ holt alles ins Bild.
- **Schiffsdaten:** Typ, Flagge, MMSI, IMO, Rufzeichen, Länge × Breite, Tiefgang, Ziel und Ankunft laut AIS, Navigationsstatus, Links zu VesselFinder und MarineTraffic (dort gibt es Fotos).
- **Geschwindigkeit** in km/h und Knoten, direkt aus der AIS-Meldung.
- **Mein Ort** (statt „Mein Bahnhof“): ein Ort am Wasser, z. B. der Bootssteg. Die Liste zeigt, welche Schiffe in den nächsten 90 Minuten vorbeikommen und welche in der Nähe liegen, dazu den nächsten Pegel aus PEGELONLINE mit Tendenz. Optional nur diese Schiffe auf der Karte.
- **Meine Schiffe** (statt „Meine Linien“): Schiffe merken und sehen, wo sie gerade sind. Ohne Fahrplan, weil die meisten Schiffe keinen haben.
- Hell- und Dunkelmodus, „Was ist neu“ wie beim Zugradar.

### Warum „Meine Schiffe“ trotzdem Sinn ergibt

Linienverkehr gibt es auf dem Wasser seltener als auf der Schiene, aber es gibt ihn: Rheinfähren, Ausflugs- und Fahrgastschiffe, Bodensee-Fähren, Flusskreuzfahrten. Dazu kommen Schiffe, auf die man wartet (Abholung, Besuch an Bord, ein bestimmter Schubverband an der Schleuse) und Schiffe von Freunden oder Familie. Deshalb merkt sich die Seite **einzelne Schiffe** (per MMSI) statt Linien mit Einstiegshalt, und zeigt ihren aktuellen Stand statt nächster Abfahrten.

## Wie genau sind die Positionen?

Schiffe senden ihre Position per **AIS** (Automatic Identification System) selbst, alle paar Sekunden bis Minuten. Diese Funksignale fangen ehrenamtlich betriebene Empfänger an Land auf; [aisstream.io](https://aisstream.io) stellt sie kostenlos bereit. Die Abdeckung hängt davon ab, wo solche Empfänger stehen, auf manchen Flussabschnitten fehlen Schiffe deshalb.

Die Seite ist eine reine statische Seite ohne Server. Darum holt ein GitHub-Workflow **alle 10 Minuten** für etwa 4 Minuten Meldungen ab und legt sie als `data/ships.json` ab. Zwischen zwei Abrufen schreibt die Seite die Position fahrender Schiffe mit Kurs und Fahrt fort (höchstens 10 Minuten). In Kurven kann ein Schiff dadurch kurz neben dem Fluss erscheinen. Auch die Vorbeifahrt-Zeiten unter „Mein Ort“ sind Schätzungen über die Luftlinie; auf Flüssen ist der Weg länger, das Schiff kommt also eher etwas später. GitHub startet geplante Workflows manchmal verzögert.

**Nicht für die Navigation verwenden.**

## Einrichtung

Einmalig nötig, danach läuft alles von selbst:

1. **API-Schlüssel holen:** Auf [aisstream.io](https://aisstream.io) mit dem GitHub-Konto anmelden, unter „API Keys“ einen Schlüssel erzeugen.
2. **Als Secret hinterlegen:** Im Repository unter *Settings → Secrets and variables → Actions → New repository secret* den Namen `AISSTREAM_API_KEY` und den Schlüssel als Wert eintragen. Der Schlüssel bleibt im Workflow und erscheint nie auf der Seite.
3. **GitHub Pages einschalten:** *Settings → Pages → Build and deployment → Source:* „GitHub Actions“ wählen.
4. **Ersten Lauf starten:** *Actions → „Schiffsdaten sammeln und veröffentlichen“ → Run workflow.* Nach rund zwei Minuten ist die Seite mit Daten online.

Ohne Schlüssel wird die Seite trotzdem veröffentlicht und zeigt oben einen Hinweis.

**Gebiet ändern:** In [`regions.json`](regions.json) stehen die Rechtecke, für die Daten gesammelt werden (Standard: Rhein von Basel bis zur niederländischen Grenze mit Main, Neckar, Mosel und Bodensee). Weitere Rechtecke, z. B. für die Deutsche Bucht, einfach ergänzen. Größere Gebiete bedeuten mehr Schiffe und eine größere Datei.

**Zeitplan pausiert?** GitHub hält geplante Workflows in Repositories an, in denen 60 Tage lang nichts committet wurde. Dann unter *Actions* den Workflow wieder aktivieren oder eine kleine Änderung committen.

## Neuerungen

Alle Änderungen stehen in [CHANGELOG.md](CHANGELOG.md). Die Seite liest diese Datei selbst. Neue Einträge kommen oben als `## JJJJ-MM-TT` mit Stichpunkten darunter; nur dieses Format wird angezeigt.

## Technik

- `index.html`: eine einzelne statische Datei mit Vanilla JavaScript, kein Build-Schritt. [Leaflet](https://leafletjs.com) für die Karte, Grundkarte von Esri, Seezeichen von [OpenSeaMap](https://openseamap.org).
- `collector/`: Node-Skript (Node 22, Paket `ws`), das per WebSocket Meldungen von aisstream.io sammelt, mit dem zuletzt veröffentlichten Stand zusammenführt, Kielwasser ausdünnt und alte Einträge entfernt (fahrende Schiffe nach 3 h, liegende nach 12 h). aisstream erlaubt keine Verbindungen direkt aus dem Browser, damit der Schlüssel nicht öffentlich wird; deshalb dieser Umweg.
- `.github/workflows/ais.yml`: sammelt, baut und veröffentlicht die Seite auf GitHub Pages, alle 10 Minuten und bei jedem Push auf `main`.
- Zusatzdienste direkt aus dem Browser: [PEGELONLINE](https://www.pegelonline.wsv.de) (Pegelstände der WSV) und [Nominatim](https://nominatim.openstreetmap.org) (Ortssuche, Zuordnung der AIS-Ziele, Ergebnisse werden zwischengespeichert).
- Einstellungen und gemerkte Schiffe liegen im `localStorage` des Browsers.

Lokal ausprobieren:

```sh
npm install --prefix collector
AISSTREAM_API_KEY=… COLLECT_SECONDS=60 node collector/collect.mjs   # schreibt out/ships.json
mkdir -p data && cp out/ships.json data/
python3 -m http.server   # dann http://localhost:8000 öffnen
```

## Daten und Nutzungsbedingungen

- Schiffsdaten: AIS-Meldungen über [aisstream.io](https://aisstream.io) (kostenlos, Beta, ohne Verfügbarkeitszusage). Bitte die Bedingungen des Dienstes beachten.
- Pegel: © Wasserstraßen- und Schifffahrtsverwaltung des Bundes (WSV), PEGELONLINE.
- Kartendaten: © OpenStreetMap-Mitwirkende, Esri, OpenSeaMap. Ortssuche: Nominatim / OpenStreetMap.

## Lizenz

Der Code steht unter der [MIT-Lizenz](LICENSE). Die angezeigten Karten-, Pegel- und Schiffsdaten unterliegen den Lizenzen ihrer jeweiligen Anbieter.
