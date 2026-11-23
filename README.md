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

## Add month days to existing week notes

After installing the updated plugin, back up your vault and run
**Monatstage in bestehenden Wochen-Dateien ergänzen** from Obsidian's command palette.
The command updates weekday headings (for example, `# Montag` → `# Montag (23)`)
in `<configured week folder>/<year>/weeks/Wxx dd.MM.yy.md`.
Other content and yearly overviews are preserved. The final notice reports checked,
changed and failed files. Running it again does not change already migrated notes.
The command does not run automatically when the plugin loads.

## Pull request checks

GitHub Actions runs all tests on every pull request using Node.js 22 and `npm ci`.
The workflow can also be started manually from the Actions tab.

To block merges when tests fail, add **All tests** as a required status check in
the target branch's GitHub ruleset or branch protection settings. The check must
run at least once before it can be selected. This repository setting is not
enabled automatically by the workflow file.

## Releases

Prepare a release with one command:

```sh
npm run release -- patch
```

Use `patch`, `minor` or `major` to increase the corresponding part of the version.
For example, `1.2.3` becomes `1.2.4`, `1.3.0` or `2.0.0`. Lower parts are reset
when needed. The manifest is the source of truth; legacy `v` prefixes and alpha
suffixes are removed (for example, a patch bump from `v0.2.1-alpha` produces `0.2.2`).

The script updates `manifest.json`, `package.json`, `package-lock.json` and
`versions.json`, preserving the minimum Obsidian version. It does not commit,
tag, push, build or publish anything.

Review the four files, commit, push and merge into `main`. When `manifest.json`
changes on `main`, the release workflow validates the version and checks whether
it is already published. For a new version it runs all tests, builds the plugin
and publishes a GitHub release with `main.js` and `manifest.json`. The version
tag is created automatically at the exact commit that was tested. You do not
need to create or push a tag yourself. A direct push to `main` with the same
version changes also triggers publication; other branches do not.

Existing published versions are skipped. Failed tests or builds prevent a
release. A failed run can be retried through GitHub Actions; the workflow also
supports a manual run on `main`. Existing draft releases or tags without a
release require inspection rather than being silently overwritten.

BRAT can install the plugin from `daddykom/obsidian-wo-calendar-sync`. With
automatic updates enabled in BRAT, new releases are downloaded and the plugin
reloaded at its next update check, not necessarily immediately after the merge.

`npm run build` performs a single production build; `npm run dev` watches for changes.

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
