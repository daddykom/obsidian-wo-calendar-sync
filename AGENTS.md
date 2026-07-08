# AGENTS.md

## Projektkontext

Dieses Projekt dreht sich um den Einsatz von Obsidian als zentrales Werkzeug für Notizen, Wochenplanung, Kalenderdaten und das Schreiben von Briefen.

Die Lösung soll auf Mac, iPad und iPhone sinnvoll funktionieren. Der Mac ist die Hauptumgebung für technische Arbeiten, Automatisierung, Pandoc und Entwicklung. iPad und iPhone sollen möglichst reibungslos für Lesen, Schreiben und Erfassen funktionieren.

## Grundhaltung

Bevorzuge einfache, robuste Lösungen gegenüber komplexen Frameworks oder überautomatisierten Workflows.

Technische Lösungen sollen verständlich, wartbar und nachvollziehbar sein. Keine unnötige Magie. Keine komplizierten Abstraktionen, wenn eine klare direkte Lösung genügt.

Wenn ein Problem durch eine kleine Konvention, ein sauberes Markdown-Format oder einen klaren Dateinamen gelöst werden kann, ist das meist besser als ein komplexes Plugin- oder Skript-System.

## Arbeitsweise

- Erst fachlich klären, dann technisch umsetzen.
- Bestehende Struktur respektieren.
- Kleine, nachvollziehbare Änderungen bevorzugen.
- Keine grossen Umbauten ohne klaren Nutzen.
- Bei Unsicherheit zuerst erklären, welche Annahme getroffen wird.
- Lösungen sollen auch nach Monaten noch verständlich sein.

## Obsidian

Obsidian ist das zentrale Schreib- und Notizsystem.

Markdown soll möglichst schlicht und portabel bleiben. Spezialsyntax nur verwenden, wenn sie einen klaren Nutzen bringt und nicht zu stark an ein einzelnes Plugin bindet.

Dateien und Ordner sollen so organisiert sein, dass sie auch ohne Obsidian noch verständlich sind.

Links, Backlinks und klare Dateinamen sind wichtiger als übermässige Metadaten.

## Briefe und Export

Briefe werden in Obsidian bzw. Markdown geschrieben und bei Bedarf nach DOCX oder PDF exportiert.

Pandoc darf verwendet werden, aber die Lösung soll nicht unnötig kompliziert werden.

Für DOCX-Exporte sind `reference.docx`, Templates und YAML-Metadaten akzeptabel, solange sie stabil und nachvollziehbar bleiben.

Wenn ein Wert wie eine Referenz, ein Betreff oder ein Dateiname im Footer erscheinen soll, ist eine explizite Markdown-/YAML-Variable oft besser als ein Word-Feld, das beim Öffnen nicht zuverlässig aktualisiert wird.

## Markdown-Stil

Markdown soll gut lesbar bleiben.

Bevorzugt:

- klare Überschriften
- einfache Listen
- Tabellen nur, wenn sie wirklich sinnvoll sind
- YAML-Frontmatter für Dokument-Metadaten
- keine unnötige Plugin-Syntax

Vermeiden:

- komplexe verschachtelte Strukturen
- schwer lesbare Inline-Attribute
- Markdown, das nur mit einem bestimmten Plugin verständlich ist
- unnötige HTML-Blöcke

## Programmierstil

Code soll klar, direkt und testbar sein.

Bevorzugt wird ein funktionaler Stil mit kleinen, reinen Funktionen, wo das sinnvoll ist.

Klassen nur verwenden, wenn sie fachlich oder technisch wirklich passen, zum Beispiel für Components, Services oder klar zustandsbehaftete Objekte.

Keine trivialen Einzeiler-Helper nur um der Abstraktion willen.

Kommentare sparsam einsetzen. Kommentare sollen erklären, warum etwas gemacht wird, nicht was der Code offensichtlich tut.

## Architektur

Architektur soll helfen, Komplexität zu reduzieren, nicht sie zu vermehren.

Bevorzugt:

- klare Verantwortlichkeiten
- kleine Module
- explizite Datenflüsse
- idempotente Verarbeitung, wo möglich
- einfache Fehlerbilder
- nachvollziehbare Tests

Vermeiden:

- globale Seiteneffekte
- versteckte Zustände
- unnötig generische Framework-Strukturen
- Lösungen, die nur funktionieren, wenn man viele implizite Regeln kennt

## Tests

Wichtige Logik soll getestet werden.

Tests sollen das Verhalten beschreiben, nicht interne Implementierungsdetails zementieren.

Parser, Dateinamenlogik, Exportlogik und Transformationen sind gute Kandidaten für Unit-Tests.

## Obsidian-Plugin-Entwicklung

Bei Plugin-Code ist wichtig:

- idempotentes Verhalten
- keine doppelten oder unkontrollierten Änderungen an Notizen
- klare Trennung zwischen Parsen, Modell, Verarbeitung und Schreiben
- bestehende Inhalte möglichst erhalten
- sichere Aktualisierung von Dateien
- nachvollziehbare Commands

Mobile Nutzung beachten: iPad und iPhone dürfen durch das Format nicht unnötig behindert werden.

## Kalender- und Wochenlogik

Wochenlogik folgt ISO-Wochen:

- Woche beginnt am Montag
- Woche 1 ist die Woche mit dem ersten Donnerstag des Jahres

Wochen-, Tages- und Terminstrukturen sollen aus Markdown gut lesbar bleiben.

Automatische IDs und Synchronisationsdaten dürfen verwendet werden, sollen aber die Lesbarkeit der eigentlichen Notiz nicht dominieren.

## Wiederkehrende Termine

Termine können ein `Wiederholung:` Feld haben und werden dann als wiederkehrend erkannt.

Änderungen an wiederkehrenden Terminen propagieren automatisch auf alle Folge-termine. Es gibt keinen separaten "Update All" Command - die Aktualisierung erfolgt implizit beim Verarbeiten der Week-Files.

Ausnahmen (einzelne Termine, die vom Original abweichen) werden mit `isException: true` markiert und bei Änderungen des Originals nicht automatisch überschrieben.

## Umgang mit Tools und Agenten

Ein Agent soll nicht einfach grosse Änderungen ausführen, sondern zuerst die bestehende Struktur verstehen.

Vor Codeänderungen:

1. relevante Dateien lesen
2. bestehende Konventionen erkennen
3. kleinste sinnvolle Änderung planen
4. Änderung umsetzen
5. Tests oder nachvollziehbare Prüfung durchführen

Keine neuen Dependencies ohne klaren Grund.

Keine Formatierung grosser Dateien nur nebenbei.

Keine Umbenennungen oder Strukturänderungen ohne ausdrücklichen Nutzen.

## Sprache

Erklärungen an den Benutzer auf Deutsch.

Code, Dateinamen, technische Bezeichner und Kommentare im Code auf Englisch.

## Entscheidungsprinzip

Wenn mehrere Lösungen möglich sind, wähle diejenige, die:

1. am einfachsten verständlich ist
2. am robustesten funktioniert
3. am wenigsten Spezialwissen voraussetzt
4. gut mit Obsidian auf Mac, iPad und iPhone funktioniert
5. langfristig wartbar bleibt