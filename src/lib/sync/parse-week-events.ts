import { WeekcalendarSettings } from '../types';
import { parseWoWithDiagnostics } from '../parseWeekFile/parse-wo';
import { CalendarEvent, CollectionError } from './types';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_MS = 86400000;

function weekMonday(path: string, folder: string): Date | null {
  const relative = path.slice(folder.length + 1);
  const match = relative.match(/^(\d{4})\/weeks\/W(\d{2}) (\d{2})\.(\d{2})\.(\d{2})\.md$/);
  if (!match) return null;
  const [, year, week, day, month, shortYear] = match;
  const january4 = new Date(`${year}-01-04T00:00:00Z`);
  const monday = new Date(january4.getTime() +
    ((Number(week) - 1) * 7 - ((january4.getUTCDay() || 7) - 1)) * DAY_MS);
  const thursday = new Date(monday.getTime() + 3 * DAY_MS);
  if (Number(week) < 1 || Number(week) > 53 ||
      thursday.getUTCFullYear() !== Number(year) ||
      monday.getUTCDate() !== Number(day) || monday.getUTCMonth() + 1 !== Number(month) ||
      monday.getUTCFullYear() % 100 !== Number(shortYear)) return null;
  return monday;
}

function parseTime(value: string): number | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

// UTC arithmetic represents calendar dates and wall-clock times, not UTC instants.
function dateTime(date: string, minutes: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + minutes * 60000)
    .toISOString().slice(0, 19);
}

export function parseWeekEvents(
  content: string,
  path: string,
  settings: WeekcalendarSettings,
): { events: CalendarEvent[]; errors: CollectionError[] } {
  const events: CalendarEvent[] = [];
  const errors: CollectionError[] = [];
  const monday = weekMonday(path, settings.paths.weekFolder);
  if (!path.startsWith(`${settings.paths.weekFolder}/`) || !monday) {
    return { events, errors: [{ path, message: 'Ungültiger Wochen-Dateiname oder widersprüchliches ISO-Wochendatum.' }] };
  }

  const eventPrefix = settings.prefixes.event.trim().toLowerCase();
  if (!eventPrefix || new Set(DAY_KEYS.map((key) => settings.weekdays[key].toLowerCase())).size !== 7) {
    return { events, errors: [{ path, message: 'Terminpräfix und eindeutige Wochentagsnamen müssen konfiguriert sein.' }] };
  }

  const parsed = parseWoWithDiagnostics(content, settings);
  errors.push(...parsed.diagnostics.map((diagnostic) => ({ path, ...diagnostic })));
  if (errors.length) return { events, errors };
  const seenDays = new Set<number>();
  for (const heading of parsed.headings) {
    const dayIndex = DAY_KEYS.findIndex((key) => key === heading.section);
    if (dayIndex < 0) continue;
    if (seenDays.has(dayIndex)) {
      errors.push({ path, line: heading.line, message: 'Doppelte Wochentagsüberschrift.' });
    }
    seenDays.add(dayIndex);
    const date = new Date(monday.getTime() + dayIndex * DAY_MS);
    if (heading.dayOfMonth !== undefined && heading.dayOfMonth !== date.getUTCDate()) {
      errors.push({ path, line: heading.line, message: 'Monatstag der Überschrift passt nicht zum Wochen-Dateinamen.' });
    }
  }

  for (const event of parsed.events) {
    const dayIndex = DAY_KEYS.findIndex((key) => key === event.section);
    const sourceLine = event.line;
    const body = event.element.content.slice(1).map((line) => line.trim());
    const fail = (message: string) => errors.push({ path, line: sourceLine, message });
    const errorCount = errors.length;
    if (dayIndex < 0) fail('Termin steht nicht unter einer bekannten Wochentagsüberschrift.');
    const title = event.title ?? '';
    if (!title) fail('Termin hat keinen Titel.');
    if (event.eventIds.length !== 1) {
      fail('Termin benötigt genau eine gültige ^woev-ID. Bitte Wochen-Dateien verarbeiten.');
    }

    const fields = new Map<string, string>();
    const description: string[] = [];
    for (const item of body) {
      if (/^\^woev-/.test(item)) continue;
      const field = item.match(/^([^:]+):\s*(.*)$/);
      const key = field?.[1].trim().toLowerCase();
      if (key && [settings.prefixes.time, settings.prefixes.location, settings.prefixes.reminder]
        .some((prefix) => prefix.trim().toLowerCase() === key)) {
        if (fields.has(key)) fail(`Doppeltes Terminfeld: ${field![1]}.`);
        fields.set(key, field![2].trim());
      } else if (key && [settings.prefixes.repeat, 'WiederholungEnde', 'AusnahmeVon']
        .some((prefix) => prefix.trim().toLowerCase() === key)) {
        continue;
      } else {
        description.push(item);
      }
    }

    const date = new Date(monday.getTime() + Math.max(dayIndex, 0) * DAY_MS).toISOString().slice(0, 10);
    const timeValue = fields.get(settings.prefixes.time.trim().toLowerCase());
    let start = date;
    let end = new Date(Date.parse(`${date}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10);
    if (timeValue !== undefined) {
      const times = timeValue.split(/\s*[-–]\s*/);
      const startMinutes = parseTime(times[0]);
      const endMinutes = times.length === 1 && startMinutes !== null
        ? startMinutes + 60 : parseTime(times[1] ?? '');
      if (times.length > 2 || startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
        fail('Ungültige Zeit oder Endzeit liegt nicht nach der Startzeit.');
      } else {
        start = dateTime(date, startMinutes);
        end = dateTime(date, endMinutes);
      }
    }

    const reminderMinutes: number[] = [];
    const reminder = fields.get(settings.prefixes.reminder.trim().toLowerCase());
    if (reminder !== undefined) {
      for (const value of reminder.split(',')) {
        const match = value.trim().match(/^(\d+)\s*([dhm])$/i);
        const minutes = match ? Number(match[1]) * ({ d: 1440, h: 60, m: 1 }[match[2].toLowerCase()]!) : 0;
        if (!Number.isSafeInteger(minutes) || minutes <= 0) fail('Ungültige Erinnerung; erwartet z. B. 1d, 3h, 20m.');
        else reminderMinutes.push(minutes);
      }
    }

    if (errors.length !== errorCount) continue;
    const localId = event.element.eventId;
    events.push({
      uid: `${localId}-${date}@week-calendart`,
      localId, sourcePath: path, sourceLine, title, date,
      allDay: timeValue === undefined, start, end,
      location: fields.get(settings.prefixes.location.trim().toLowerCase()) ?? '',
      description: description.join('\n'),
      reminderMinutes: [...new Set(reminderMinutes)].sort((a, b) => a - b),
    });
  }
  return { events, errors };
}
