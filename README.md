# Schiffsradar

Mobile Live-Karte für Schiffe auf Rhein, Neckar, Main und Co. – das Gegenstück zum [Zugradar](https://github.com/SquaredP/zugradar). Zeigt, wo Schiffe gerade fahren, wohin sie wollen und wann sie an deinem Ort vorbeikommen.

**Live:** https://squaredp.github.io/schiffsradar/

## Funktionen

- **Karte mit Seezeichen** (OpenSeaMap) und allen Schiffen im Ausschnitt. Der Pfeil zeigt die Fahrtrichtung, liegende Schiffe sind Kreise. Gestrichelte Symbole haben seit über 20 Minuten nichts gemeldet.
- **Filter:** Das Menü „Typen“ klappt auf und schaltet Fracht, Tanker, Fahrgast, Dienst · Schlepper und Sport · Sonstige einzeln. Liegende Schiffe (festgemacht, vor Anker) lassen sich im selben Menü zuschalten.
- **Pegel auf der Karte:** Messstellen der WSV (PEGELONLINE) mit Pegelstand in cm, ab Zoom 10. Tippen zeigt Gewässer, Kilometer, Tendenz und Stand. Mit dem Chip „Pegel“ abschaltbar.
- **Schifffahrtszeichen ausblenden:** Im Menü „Zeichen“ lassen sich Tonnen, Baken, Feuer, Tafeln, Bauwerke und Häfen einzeln abschalten. Sind alle an, zeigt die Karte die fertigen OpenSeaMap-Symbole. Sobald eine Art aus ist, lädt die Seite die Zeichen ab Zoom 13 für den sichtbaren Ausschnitt aus OpenStreetMap (Overpass-API) und zeigt sie als farbige Punkte, weil sich die fertigen Kacheln nicht filtern lassen. Suche nach Name oder MMSI, Enter sucht im ganzen Datenstand.
- **Schiff verfolgen:** Die Karte folgt dem Schiff. Wie bei einem Navi ist das Kielwasser der letzten Stunden grau und der Weg der nächsten 30 Minuten kräftig. Dieser folgt dem Flussverlauf; an Abzweigen nimmt die Seite den geradesten Weg (das gemeldete Ziel berücksichtigt sie dabei noch nicht). Wo kein Gewässer bekannt ist (z. B. in Hafenbecken oder auf Seen), zeigt die Linie nur 3 Minuten geradeaus. Das Ziel laut AIS wird, wenn es sich einem Ort zuordnen lässt, gestrichelt mit Ankunftszeit eingezeichnet. „Strecke zeigen“ holt alles ins Bild.
- **Schiffsdaten:** Typ, Flagge, MMSI, IMO, Rufzeichen, Länge × Breite, Tiefgang, Ziel und Ankunft laut AIS, Navigationsstatus, Links zu VesselFinder und MarineTraffic (dort gibt es Fotos).
- **Geschwindigkeit** in km/h und Knoten, direkt aus der AIS-Meldung.
- **Mein Ort** (statt „Mein Bahnhof“): ein Ort am Wasser, z. B. der Bootssteg. Die Liste zeigt, welche Schiffe in den nächsten 90 Minuten vorbeikommen und welche in der Nähe liegen, dazu den nächsten Pegel aus PEGELONLINE mit Tendenz. Optional nur diese Schiffe auf der Karte.
- **Meine Schiffe** (statt „Meine Linien“): Schiffe merken und sehen, wo sie gerade sind. Ohne Fahrplan, weil die meisten Schiffe keinen haben.
- Hell- und Dunkelmodus, „Was ist neu“ wie beim Zugradar.

### Warum „Meine Schiffe“ trotzdem Sinn ergibt

Linienverkehr gibt es auf dem Wasser seltener als auf der Schiene, aber es gibt ihn: Rheinfähren, Ausflugs- und Fahrgastschiffe, Bodensee-Fähren, Flusskreuzfahrten. Dazu kommen Schiffe, auf die man wartet (Abholung, Besuch an Bord, ein bestimmter Schubverband an der Schleuse) und Schiffe von Freunden oder Familie. Deshalb merkt sich die Seite **einzelne Schiffe** (per MMSI) statt Linien mit Einstiegshalt, und zeigt ihren aktuellen Stand statt nächster Abfahrten.

## Wie genau sind die Positionen?

Schiffe senden ihre Position per **AIS** (Automatic Identification System) selbst, alle paar Sekunden bis Minuten. Diese Funksignale fangen Behörden und ehrenamtliche Empfänger an Land auf. Die Abdeckung hängt davon ab, wo solche Empfänger stehen, auf manchen Flussabschnitten fehlen Schiffe deshalb.

**Datensparsam:** Schiffe erscheinen erst ab Zoom 11 (rund 20 km Umkreis). Unterhalb davon fragt die Seite nichts ab. Darüber lädt dein Gerät nur den **sichtbaren Ausschnitt** direkt von [Open Waters AIS](https://openwaters.io/ais/) (kein Konto, kein Schlüssel), beim Verschieben der Karte und danach alle 30 Sekunden. Es gibt keine Massenabfrage aller Schiffe. Das Kielwasser sammelt die Seite selbst, solange sie offen ist.

**Rückfall:** Kann der Browser Open Waters nicht erreichen, nutzt die Seite die Datei `data/ships.json`. Die füllt ein GitHub-Workflow alle 10 Minuten aus [aisstream.io](https://aisstream.io) (siehe Einrichtung). Diese Datei enthält zusätzlich Ziel, Ankunft und Abmessungen, die der Live-Weg nicht liefert.

**Flussverlauf:** Zwischen zwei Meldungen schreibt die Seite die Position fahrender Schiffe fort. Dafür lädt sie die Flüsse und Kanäle des sichtbaren Ausschnitts aus OpenStreetMap (Overpass, 30 Minuten zwischengespeichert), legt jedes fahrende Schiff auf das nächste Gewässer in Fahrtrichtung (bis 250 m Abstand) und rückt es dort entlang des Flusses vor, höchstens 10 Minuten lang, auch durch Bögen. Der seitliche Versatz zur Flussmitte klingt nach 1,5 km ab. Findet die Seite kein passendes Gewässer, rechnet sie nur 90 Sekunden geradeaus weiter, damit Schiffe nicht über Land laufen. Querende Fähren und Schiffe in Hafenbecken bleiben deshalb an ihrer gemeldeten Stelle. Die Vorbeifahrt-Zeiten unter „Mein Ort“ sind Schätzungen über die Luftlinie; auf Flüssen ist der Weg länger, das Schiff kommt daher meist etwas später.

**Nicht für die Navigation verwenden.**

## Einrichtung (nur für den Rückfall nötig)

Die Seite funktioniert live auch ohne diese Schritte, sofern Open Waters für dein Gebiet Schiffe hat. Für den Rückfall über aisstream.io einmalig:

1. **API-Schlüssel holen:** Auf [aisstream.io](https://aisstream.io) mit dem GitHub-Konto anmelden, unter „API Keys“ einen Schlüssel erzeugen.
2. **Als Secret hinterlegen:** Im Repository unter *Settings → Secrets and variables → Actions → New repository secret* den Namen `AISSTREAM_API_KEY` und den Schlüssel als Wert eintragen. Der Schlüssel bleibt im Workflow und erscheint nie auf der Seite.
3. **GitHub Pages einschalten:** *Settings → Pages → Build and deployment → Source:* „GitHub Actions“ wählen.
4. **Ersten Lauf starten:** *Actions → „Schiffsdaten sammeln und veröffentlichen“ → Run workflow.* Nach rund zwei Minuten ist die Seite mit Daten online.

Ohne Schlüssel wird die Seite trotzdem veröffentlicht; der Rückfall bleibt dann leer.

**Gebiet ändern:** In [`regions.json`](regions.json) stehen die Rechtecke, für die Daten gesammelt werden (Standard: Rhein von Basel bis zur niederländischen Grenze mit Main, Neckar, Mosel und Bodensee). Weitere Rechtecke, z. B. für die Deutsche Bucht, einfach ergänzen. Größere Gebiete bedeuten mehr Schiffe und eine größere Datei.

**Zeitplan pausiert?** GitHub hält geplante Workflows in Repositories an, in denen 60 Tage lang nichts committet wurde. Dann unter *Actions* den Workflow wieder aktivieren oder eine kleine Änderung committen.

## Neuerungen

Alle Änderungen stehen in [CHANGELOG.md](CHANGELOG.md). Die Seite liest diese Datei selbst. Neue Einträge kommen oben als `## JJJJ-MM-TT` mit Stichpunkten darunter; nur dieses Format wird angezeigt.

## Technik

- `index.html`: eine einzelne statische Datei mit Vanilla JavaScript, kein Build-Schritt. [Leaflet](https://leafletjs.com) für die Karte, Grundkarte von Esri, Seezeichen von [OpenSeaMap](https://openseamap.org).
- `collector/`: Node-Skript (Node 22, Paket `ws`), das per WebSocket Meldungen von aisstream.io sammelt, mit dem zuletzt veröffentlichten Stand zusammenführt, Kielwasser ausdünnt und alte Einträge entfernt (fahrende Schiffe nach 3 h, liegende nach 12 h). aisstream erlaubt keine Verbindungen direkt aus dem Browser, damit der Schlüssel nicht öffentlich wird; deshalb dieser Umweg.
- `.github/workflows/ais.yml`: sammelt, baut und veröffentlicht die Seite auf GitHub Pages, alle 10 Minuten und bei jedem Push auf `main`.
- Zusatzdienste direkt aus dem Browser: [PEGELONLINE](https://www.pegelonline.wsv.de) (Pegelstände der WSV), [Overpass](https://overpass-api.de) (Flussverlauf aus OpenStreetMap, dazu Seezeichen bei aktivem Zeichenfilter) und [Nominatim](https://nominatim.openstreetmap.org) (Ortssuche, Zuordnung der AIS-Ziele, Ergebnisse werden zwischengespeichert).
- Einstellungen und gemerkte Schiffe liegen im `localStorage` des Browsers.

Lokal ausprobieren:

```sh
npm install --prefix collector
AISSTREAM_API_KEY=… COLLECT_SECONDS=60 node collector/collect.mjs   # schreibt out/ships.json
mkdir -p data && cp out/ships.json data/
python3 -m http.server   # dann http://localhost:8000 öffnen
```

## Daten und Nutzungsbedingungen

- Schiffsdaten live: [Open Waters AIS](https://openwaters.io/ais/), für den privaten Gebrauch kostenlos. Quellen sind u. a. norwegische und finnische Behörden (NLOD 2.0, CC BY 4.0), ehrenamtliche Empfänger (CC0) und AISHub. Bitte die [Bedingungen](https://openwaters.io/license/) beachten.
- Schiffsdaten im Rückfall: [aisstream.io](https://aisstream.io) (kostenlos, Beta, ohne Verfügbarkeitszusage).
- Pegel: © Wasserstraßen- und Schifffahrtsverwaltung des Bundes (WSV), PEGELONLINE.
- Kartendaten: © OpenStreetMap-Mitwirkende, Esri, OpenSeaMap. Ortssuche: Nominatim / OpenStreetMap.

## Lizenz

Der Code steht unter der [MIT-Lizenz](LICENSE). Die angezeigten Karten-, Pegel- und Schiffsdaten unterliegen den Lizenzen ihrer jeweiligen Anbieter.
