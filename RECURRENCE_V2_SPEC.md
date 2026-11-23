# RECURRENCE_V2_SPEC.md - Offene Punkte und Implementierung

## Überblick

Dieses Dokument beschreibt die verbleibenden offenen Punkte für die wiederkehrenden Termine und die geplante Implementierung.

## Offene Punkte aus RECURRENCE_SPEC.md

| Punkt | Beschreibung | Status |
|-------|--------------|--------|
| 5.2 | "Update all" command | ❌ Nicht nötig (Propagation ist implizit) |
| 5.3 | Exception prompt UI | ❌ Nicht nötig (Ausnahmen werden markiert) |
| 6.2 | Delete dialog with options | 🔲 Muss als Obsidian Modal implementiert werden |
| 7.2 | Integrate into year creation | 🔲 Muss in Create-Year Command integriert werden |

---

## Implementierungsplan Phase 2

### Schritt 1: Delete-Recurrence-Modal

**Datei:** `src/lib/recurrence/ui/delete-recurrence-modal.ts`

```
1. Modal-Klasse erstellen, die Obsidian's Modal-Interface implementiert
2. Zwei Optionen als Buttons:
   - "Alle löschen" → löscht alle Folgetermine komplett
   - "Nur diesen Termin löschen" → setzt WiederholungEnde auf den VORTAG dieses Terms
   - "Abbrechen" → schliesst Modal ohne Änderung
3. Bei "Nur diesen Termin": Enddatum = (gelöschter Termin) - 1 Tag
4. Keine separate Enddatum-Abfrage nötig
```

**Integration:** `deletion-handling.ts` → `DeleteRecurrenceModal` statt `prompt()`

**Akzeptanzkriterien:**
- Modal öffnet sich bei Delete eines wiederkehrenden Terms
- "Alle löschen" entfernt alle Termine der Serie
- "Nur diesen Termin" setzt WiederholungEnde auf Vortag des gelöschten Terms
- Keine `prompt()` oder `alert()` Verwendung

---

### Schritt 2: Year-Creation Integration

**Datei:** `src/lib/commands/create-year/create-year.ts`

```
1. Nach Jahr-Erstellung (bestehend)
2. Automatisch: copyRecurringEventsFromYear() aufrufen
3. Notice bei Erfolg: "X Terminserien mit Y Vorkommen kopiert"
4. Notice bei Misserfolg: "Kopieren fehlgeschlagen: [Grund]"
```

**Akzeptanzkriterien:**
- Wiederkehrende Termine werden automatisch aus Vorjahr kopiert (keine Option)
- Bei Erfolg: Notice mit Anzahl Terminserien
- Bei Misserfolg: Notice mit Fehlergrund

---

### Schritt 3: Prozess-Integration (implizite Propagation)

**Datei:** `src/lib/event-handling/process-file.ts`

```
1. Beim Verarbeiten einer Week-File:
   - Prüfen ob Termine Wiederholung haben
   - Falls recurrenceId existiert und Original geändert:
     → Alle Folgetermine in existierenden Files aktualisieren
2. Ausnahmen (isException) NICHT überschreiben
```

**Akzeptanzkriterien:**
- Änderung am Original propagiert zu Folgeterminen
- Ausnahmen bleiben unberührt
- Keine endlosen Schleifen oder doppelten Einträge

---

## Detaillierte Tasks

### Task 1.1: Delete-Recurrence-Modal erstellen
- [ ] `src/lib/recurrence/ui/` Verzeichnis erstellen
- [ ] `delete-recurrence-modal.ts` mit Obsidian Modal implementieren
- [ ] `onOpen()`: Container mit Buttons und Text
- [ ] `onClose()`: Cleanup
- [ ] Click-Handler:
  - "Alle löschen" → löscht alle Folgetermine der Serie
  - "Nur diesen Termin" → setzt WiederholungEnde auf Vortag des gelöschten Terms
  - "Abbrechen" → schliesst ohne Änderung

### Task 1.2: Modal testen
- [ ] Unit-Tests für Modal-Logik
- [ ] Manuelle Prüfung in Obsidian

### Task 2.1: Create-Year Command erweitern
- [ ] `src/lib/commands/create-year/create-year.ts` lesen
- [ ] Nach Jahr-Erstellung automatisch `copyRecurringEventsFromYear()` aufrufen
- [ ] Notice bei Erfolg mit: "[X] Terminserien mit [Y] Vorkommen kopiert"
- [ ] Notice bei Misserfolg mit Fehlergrund

### Task 2.2: Year-Creation testen
- [ ] Test mit bestehendem Jahr
- [ ] Verify Kopie funktioniert

### Task 3.1: Process-File erweitern
- [ ] `src/lib/event-handling/process-file.ts` lesen
- [ ] Recurrence-Logik einbauen
- [ ] Ausnahme-Erkennung

### Task 3.2: Propagation testen
- [ ] Test dass Änderung propagiert
- [ ] Test dass Ausnahme nicht überschrieben

---

## Abhängigkeiten

```
Task 1.1 → Task 1.2
Task 2.1 → Task 2.2
Task 3.1 → Task 3.2
```

Alle Tasks können parallel zu den anderen implementiert werden.

---

## Zu beachten

- Keine `prompt()`, `alert()`, `confirm()` verwenden → nur Obsidian Modals
- Idempotentes Verhalten: mehrmaliges Ausführen soll gleiches Ergebnis haben
- Bestehende 145 Tests müssen weiterhin bestehen
