# Was ist neu

Neue Funktionen und Korrekturen am Schiffsradar. Neueste Einträge oben.
Die Seite liest diese Datei selbst und zeigt nach einem Update einmalig einen Hinweis an.

## 2026-11-21

- Schiffe und Kurslinie folgen dem Flussverlauf (OpenStreetMap) statt geradeaus: auch in Bögen bleiben sie auf dem Wasser, die Linie zeigt wieder 30 Minuten voraus

- Korrektur: Schiffe liefen in Flussbögen über Land. Die Position wird nur noch bis zu 90 Sekunden fortgeschrieben, die Kurslinie zeigt 3 Minuten voraus
- „Liegende“ steht jetzt im Menü „Typen“

- Pegel auf der Karte: Pegelstand in cm direkt am Messort (ab Zoom 10), Tippen zeigt Tendenz und Stand, „Als Mein Ort“ übernimmt den Pegel. Mit dem Chip „Pegel“ ein- und ausschaltbar
- Schiffstypen als aufklappendes Menü statt einzelner Chips
- Schifffahrtszeichen nach Art ausblenden (Tonnen, Baken, Feuer, Tafeln, Brücken und Schleusen, Häfen) über das Menü „Zeichen“

- Schiffe erscheinen erst ab Zoom 11 (ca. 20 km Umkreis) und werden nur für den sichtbaren Ausschnitt direkt auf dein Gerät geladen, keine Massenabfrage mehr
- Hinweis beim ersten Öffnen zum Zoom-Level
- Kann die Live-Quelle nicht erreicht werden, springt die Seite auf die Datei im Repo zurück

- Erste Version: Karte mit Seezeichen (OpenSeaMap) und Schiffen aus AIS-Daten, Pfeil zeigt die Fahrtrichtung
- Filter nach Fracht, Tanker, Fahrgast, Dienst und Sport, liegende Schiffe zuschaltbar, Suche nach Name oder MMSI
- Schiff verfolgen: Kielwasser der letzten Stunden, Kurs voraus und Ziel laut AIS auf der Karte
- Schiffsdaten mit Typ, Flagge, Abmessungen, Tiefgang, Ziel und Ankunft laut AIS
- Mein Ort: welche Schiffe in den nächsten 90 Minuten vorbeikommen, dazu der nächste Pegel
- Meine Schiffe: Fähren, Ausflugsschiffe oder andere Schiffe merken und sehen, wo sie gerade sind
