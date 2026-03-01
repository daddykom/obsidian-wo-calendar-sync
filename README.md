# WO Calendar Sync

An [Obsidian](https://obsidian.md) plugin that synchronises weekly note files
in the **WO format** with [Full Calendar](https://github.com/davish/obsidian-full-calendar),
which in turn syncs your events to iCloud Calendar via CalDAV.

Works on **iOS and macOS** – no external scripts or servers required.

---

## How it works

```
WO09.md  →  [this plugin]  →  calendar/events/*.md  →  [Full Calendar]  →  iCloud
```

1. You write your appointments in weekly note files (`WO01` … `WO52`).
2. This plugin converts them into Full Calendar-compatible markdown files.
3. Full Calendar handles the CalDAV sync with iCloud.
4. Feiertage and Geburtstage calendars are imported read-only into your WO files.

---

## WO File Format

Files are named `WO{nn}.md` (e.g. `WO09.md`) and live in your configured WO folder (default: `2026/`).

```markdown
# Montag

Termin: Susanne Altherr
Zeit: 11:00
Ort: Talstrasse 11, 4104 Oberwil
Erinnerung: 20min, 1tg

Termin: Workshop
Zeit: 08:00 - 12:00
Erinnerung: 30min

Termin: Schulferien Basel
(no Zeit line = all-day event)

# Dienstag

Termin: Fritz anrufen
Zeit: 18:30
Bemerkung: +41792047818
Erinnerung: 0min

# Mittwoch

# Donnerstag

# Freitag

# Samstag

# Sonntag
```

### Supported fields

| Field | Required | Description |
|---|---|---|
| `Termin:` | yes | Event title |
| `Zeit:` | no | `11:00` (1h default) or `08:00 - 12:00` (explicit end). Omit for all-day. |
| `Ort:` | no | Location |
| `Erinnerung:` | no | Comma-separated reminders: `0min`, `20min`, `30min`, `1tg` |
| `Bemerkung:` | no | Description / notes |

---

## Requirements

- [Obsidian](https://obsidian.md) 1.0.0 or later
- [Full Calendar](https://github.com/davish/obsidian-full-calendar) plugin installed and configured with your iCloud CalDAV account

---

## Installation

### Manual (while awaiting Community Plugin approval)

1. Download the latest release from the [Releases page](../../releases).
2. Extract the files into your vault's plugin folder:
   `.obsidian/plugins/wo-calendar-sync/`
3. Enable the plugin under **Settings → Community Plugins**.

### Build from source

```bash
git clone https://github.com/YOUR-USERNAME/obsidian-wo-calendar-sync.git
cd obsidian-wo-calendar-sync
npm install
npm run build
```

Copy `main.js` and `manifest.json` into `.obsidian/plugins/wo-calendar-sync/`.

---

## Configuration

Open **Settings → WO Calendar Sync**:

| Setting | Default | Description |
|---|---|---|
| WO folder | `2026` | Folder containing your WO weekly files |
| Events folder | `calendar/events` | Output folder for Full Calendar event files |
| Default duration | `60` | Duration in minutes when no end time is given |
| Auto-sync on save | `on` | Sync automatically when a WO file is saved |
| Read-only calendars | `Feiertage, Geburtstage` | Calendars imported read-only into WO files |

---

## Commands

| Command | Description |
|---|---|
| `Aktuelle WO-Datei synchronisieren` | Syncs the currently open WO file |
| `Alle WO-Dateien synchronisieren` | Syncs all WO files in the configured folder |

---

## Roadmap

- [ ] Read-only import of Feiertage / Geburtstage back into WO files
- [ ] Recurring events support

---

## License

MIT License – Copyright (c) 2026 Charley Collins, Oberwil

See [LICENSE](LICENSE) for full text.
