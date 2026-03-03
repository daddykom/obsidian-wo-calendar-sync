# Obsidian WO → CalDAV Sync

A deterministic and fault-tolerant CalDAV sync plugin for weekly WO files.

## Concept

You write your appointments in weekly note files (`WO01 … WO52`).

This plugin:

1. Parses your WO files  
2. Generates one event file per appointment  
3. Creates upload jobs in an outbox  
4. Syncs them to your CalDAV calendar (iCloud) using `tsdav`  
5. Imports Feiertage and Geburtstage calendars read-only into WO files  

WO files are the **single source of truth**.

---

## Architecture

```
WO Files → Event Files → Outbox → CalDAV
```

### WO Files

- Human-editable weekly notes
- Contain appointment blocks
- Missing `localId` markers are inserted automatically

### Event Files

Stored in:

```
calendar/events/
```

One Markdown file per appointment.

Contain:

- localId
- CalDAV UID
- Source WO file
- Normalized event fields
- Server mapping (resource URL + ETag)

### Outbox

Stored in:

```
calendar/outbox/
```

- Contains upload job files
- Processed sequentially (by filename order)
- Idempotent and retry-safe
- Archived after success

---

## WO Appointment Format

### Required

```md
- Termin: Title
  ^woev-ABC123
```

### Supported Fields

```md
- Termin: John Doe
  Zeit: 11:00 - 12:00
  Ort: Foo Street 11
  Erinnerung: 1d, 3h
  Bemerkung:
    Multiline notes allowed.
    Indented continuation.
  ^woev-ABC123
```

### Time Rules

- `Zeit: HH:MM`
- `Zeit: HH:MM - HH:MM`
- No time → all-day event (DTSTART as DATE, DTEND as DATE+1)

### Reminders

- 1d
- 3h
- 20m
- Comma-separated list allowed: `1d, 3h, 20m`

### Not Supported

- No attendees
- No recurrence rules in WO files (handled via a command later)

---

## Sync Model

### Identity

Each appointment has:

- `localId` (stored in WO file)
- `uid` (CalDAV UID)
- server resource URL + ETag (stored in event file)

### Change Detection

On WO modification:

1. Parse file
2. Inject missing IDs (internal write)
3. Re-parse the updated content in-memory
4. Compare against event files
5. Generate upsert/delete operations
6. Write an outbox job

Internal writes MUST NOT trigger another processing cycle (self-write suppression + debounce).

---

## Idempotent Upload

Operations:

- `upsert(uid)`
- `delete(uid)`

Safe to retry multiple times.

ETag conflicts should trigger refetch + retry.

---

## Configuration

Stored in a vault config file (v1):

```yaml
version: 1

wo:
  folder: "2026"
  filenamePattern: "^WO\\d{2}\\.md$"
  timezone: "Europe/Zurich"
  defaultDurationMinutes: 60

storage:
  eventsFolder: "calendar/events"
  outboxFolder: "calendar/outbox"
  archiveFolder: "calendar/archive"

caldav:
  enabled: true
  url: "https://caldav.icloud.com/..."
  username: "..."
  appPassword: "..."
  calendarName: "Obsidian"
```

## License

MIT License – Copyright (c) 2026 Charley Collins, Oberwil

See [LICENSE](LICENSE) for full text.
