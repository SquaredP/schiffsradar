# Was ist neu

Neue Funktionen und Korrekturen am Schiffsradar. Neueste Einträge oben.
Die Seite liest diese Datei selbst und zeigt nach einem Update einmalig einen Hinweis an.

## 2026-11-23

- Schleusenblatt verweist auf die amtlichen Schleuseninformationen bei ELWIS (Betriebszeiten, Sperrungen). Eine maschinenlesbare amtliche Schleusenliste mit Telefonnummern gibt es nach aktuellem Stand nicht, deshalb kommen die Einträge weiter aus OpenStreetMap
- Neu: Chips „Vereine“ (Ruder- und Kanuvereine, Bootshäuser) und „Schleusen“ aus OpenStreetMap, ab Zoom 11 als antippbare Positionen. Das Blatt zeigt Telefonnummern (antippen zum Anrufen), E-Mail, Website, bei Schleusen auch UKW-Kanal, Betreiber und Maße, soweit eingetragen
- Zurückgenommen: Schifffahrtszeichen sind nicht mehr antippbar und zeigen keine Zusatzinformationen. „Zeichen“ bleibt ein einfacher Schalter, der die Zeichen komplett ein- oder ausblendet
- Neues Symbol: ein stilisierter Radar mit Schiff im Browser-Tab und auf dem Home-Bildschirm. Der Hintergrund im Browser-Tab ist transparent, das Symbol sitzt mittig
- Mein Ort: Ein kleines × am Ende des Feldes setzt den Ort zurück
- Häfen lassen sich im Hafenblatt als „Mein Ort“ wählen (Vorbeifahrten und Entfernungen beziehen sich dann auf den Hafen)
- Wird ein Hafen geöffnet, folgt die Karte einem verfolgten Schiff nicht mehr. „Hafeninfos“ aus Start oder Ziel zeigt den Hafen auf der Karte

## 2026-11-22

- Handy: Das Detailblatt öffnet kompakt und lässt sich über den Griff oben (antippen oder ziehen) auf halbe und volle Höhe bringen. Solange es offen ist, blenden sich Filterleiste und Statuszeile aus, die Karte bleibt größer sichtbar
- Im Querformat auf Notebook und iPad erscheint das Detailblatt rechts neben der Karte statt darunter, wie im Flugradar. Die Karte behält so die volle Höhe; auf dem Handy bleibt alles unverändert
- Häfen auf der Karte (Chip „Häfen“, ab Zoom 11): Hafen-, Becken-, Marina- und Fähranleger-Einträge aus OpenStreetMap. Tippen öffnet das Hafenblatt mit Betreiber, Gütern, Anschrift, Website, Schiffen im Hafenbereich, nächstem Pegel und, wenn verknüpft, einer Kurzbeschreibung aus Wikipedia
- Im Schiffsblatt: „Liegt in …“ bei liegenden Schiffen im Hafen und „Hafeninfos“ neben Start und Ziel
- Schifffahrtszeichen sind antippbar (ab Zoom 13): Ein Tipp zeigt Art, Name, Farbe, Form, Feuer, Hinweise und weitere Angaben aus OpenStreetMap. Die Seite fragt dafür nur die nähere Umgebung der Tippstelle ab
- Jedes Schiff zeigt Start und Ziel: Ziel und Ankunft laut AIS, Start = Stelle, an der das Schiff zuletzt lag (AIS meldet keinen Starthafen). Beide stehen im Schiffsblatt und als Marke auf der Karte. Ziel, Ankunft und Maße kommen auch bei Live-Daten dazu, weil die Seite sie aus der Sammlerdatei einblendet
- Korrektur: Nach dem Verschieben der Karte wurden die Flussverläufe nicht mehr nachgeladen (Fehler seit der Umstellung des Zeichen-Schalters)

## 2026-11-21

- Die Rechteinhaber unten rechts auf der Karte nennen nur noch die Daten, die gerade zu sehen sind (Seezeichen, Pegel, Schiffe mit der jeweiligen Quelle). Vorher verschwanden Pegel und Schiffsquelle, sobald die Zeichen aus waren
- Neu unter „Meine Schiffe“: „Über Schiffsradar“ mit Datenquellen, Rechteinhabern, Lizenz und Link zum Quelltext
- „Zeichen“ ist jetzt ein einfacher Schalter: Schifffahrtszeichen (OpenSeaMap) komplett an oder aus. Die Auswahl nach Art entfällt, weil sie sich mit den fertigen Kacheln nicht zuverlässig umsetzen ließ
- Menüs schließen sich gegenseitig: Öffnest du das Typen-Menü oben, klappt das untere Blatt (Karte, Mein Ort, Meine Schiffe, Schiffsdaten) ein, und umgekehrt
- Zwischenspeicher im Gerät: Beim Neuladen erscheinen sofort die zuletzt gespeicherten Schiffe, Flussverläufe und Pegel. Die aktuellen Daten kommen im Hintergrund nach, bis dahin steht oben „Gespeicherter Stand von … · aktuelle Daten werden geladen …“. Flussverläufe bleiben 24 Stunden gültig und werden nicht bei jedem Neuladen neu abgefragt
- Korrektur: Schiffe wurden an Abzweigen oft in Sackgassen (Hafenbecken, tote Seitenarme) geleitet. Die Seite meidet jetzt Abzweige, die nach kurzer Strecke enden, bleibt beim gleichen Gewässernamen (z. B. „Rhein“) und bevorzugt die höhere Wasserstraßenklasse. Erst danach zählt der geradeste Weg
- Die Schiffsdaten aktualisieren sich alle 10 Sekunden (vorher 30). Doppeltippen auf die Karte zoomt eine Stufe näher, auch auf dem iPhone
- Flussverlauf zuverlässiger: Die Seite probiert mehrere Overpass-Server nacheinander und nimmt Schiffe bis 60° neben der Flussrichtung auf. Im Schiffsblatt steht jetzt, warum ein Schiff nicht auf dem Fluss liegt (Abruf fehlgeschlagen, leer oder kein Gewässer in Fahrtrichtung)
- Gesamtstrecke zum Ziel: Kennt die Seite das AIS-Ziel, zeichnet sie den ganzen Wasserweg dorthin ein (Flüsse und Kanäle aus OpenStreetMap, kürzester Weg in Fahrtrichtung) mit Restentfernung und Ankunft. Die nächsten 30 Minuten bleiben kräftig. Ist kein Weg zu finden, bleibt es bei der gestrichelten Luftlinie
- Schiffe und Kurslinie folgen dem Flussverlauf (OpenStreetMap) statt geradeaus: auch in Bögen bleiben sie auf dem Wasser, die Linie zeigt wieder 30 Minuten voraus

- Korrektur: Schiffe liefen in Flussbögen über Land. Die Position wird nur noch bis zu 90 Sekunden fortgeschrieben, die Kurslinie zeigt 3 Minuten voraus
- „Liegende“ steht jetzt im Menü „Typen“

- Pegel auf der Karte: Pegelstand in cm direkt am Messort (ab Zoom 10), Tippen zeigt Tendenz und Stand, „Als Mein Ort“ übernimmt den Pegel. Mit dem Chip „Pegel“ ein- und ausschaltbar
- Schiffstypen als aufklappendes Menü statt einzelner Chips

- Schiffe erscheinen erst ab Zoom 11 (ca. 20 km Umkreis) und werden nur für den sichtbaren Ausschnitt direkt auf dein Gerät geladen, keine Massenabfrage mehr
- Hinweis beim ersten Öffnen zum Zoom-Level
- Kann die Live-Quelle nicht erreicht werden, springt die Seite auf die Datei im Repo zurück

- Erste Version: Karte mit Seezeichen (OpenSeaMap) und Schiffen aus AIS-Daten, Pfeil zeigt die Fahrtrichtung
- Filter nach Fracht, Tanker, Fahrgast, Dienst und Sport, liegende Schiffe zuschaltbar, Suche nach Name oder MMSI
- Schiff verfolgen: Kielwasser der letzten Stunden, Kurs voraus und Ziel laut AIS auf der Karte
- Schiffsdaten mit Typ, Flagge, Abmessungen, Tiefgang, Ziel und Ankunft laut AIS
- Mein Ort: welche Schiffe in den nächsten 90 Minuten vorbeikommen, dazu der nächste Pegel
- Meine Schiffe: Fähren, Ausflugsschiffe oder andere Schiffe merken und sehen, wo sie gerade sind
