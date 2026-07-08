import { WeekcalendarSettings, Weekday } from '../types';

export const WO_FILE_REGEX = /^week-calendar\/.*\/W[0-5].[0-9]. /;

export const RECURRENCE_PATTERNS = {
  field: /^\s*Wiederholung:\s*(.+)$/i,
  endField: /^\s*WiederholungEnde:\s*(.+)$/i,
  recurrenceId: /\^woev-rec-([a-zA-Z0-9]+)/,
  exceptionTag: /^\s*AusnahmeVon:\s*\^woev-([a-zA-Z0-9]+)/i,
};

const WEEKDAY_MAP: Record<string, Weekday> = {
  mo: 'Mo', montag: 'Mo',
  di: 'Di', dienstag: 'Di',
  mi: 'Mi', mittwoch: 'Mi',
  do: 'Do', donnerstag: 'Do',
  fr: 'Fr', freitag: 'Fr',
  sa: 'Sa', samstag: 'Sa',
  so: 'So', sonntag: 'So',
};

const WEEKDAY_KEYS = Object.keys(WEEKDAY_MAP);

const FREQUENCY_MAP: Record<string, string> = {
  täglich: 'daily', taeglich: 'daily',
  wöchentlich: 'weekly', wochentlich: 'weekly', wöchentl: 'weekly',
  monatlich: 'monthly-date', 'mntl': 'monthly-date', 'mntl.': 'monthly-date',
  jährlich: 'yearly', jaehrlich: 'yearly', jaehrl: 'yearly',
};

const FREQUENCY_KEYS = Object.keys(FREQUENCY_MAP);

export function normalizeShortcut(input: string): string {
  return input.toLowerCase().trim();
}

export function parseWeekday(input: string): Weekday | null {
  const normalized = normalizeShortcut(input);
  return WEEKDAY_MAP[normalized] || null;
}

export function parseWeekdays(input: string): Weekday[] {
  const result: Weekday[] = [];
  const parts = input.split(/[,\s]+/);
  for (const part of parts) {
    const wd = parseWeekday(part);
    if (wd && !result.includes(wd)) {
      result.push(wd);
    }
  }
  return result;
}

export function isFrequencyKeyword(input: string): boolean {
  const normalized = normalizeShortcut(input);
  return FREQUENCY_KEYS.includes(normalized);
}

export function normalizeFrequency(input: string): string {
  const normalized = normalizeShortcut(input);
  return FREQUENCY_MAP[normalized] || normalized;
}

export { WEEKDAY_MAP, WEEKDAY_KEYS, FREQUENCY_MAP, FREQUENCY_KEYS };

export const DEFAULT_SETTINGS: WeekcalendarSettings = {
  paths: {
    weekFolder: 'week-calendar',
    eventFolder: 'week-calendar/events',
    overviewFileName: 'Übersicht',
  },
  weekdays: {
    start: 'Start',
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag',
    links: 'Links',
  },
  prefixes: {
    event: 'Termin',
    time: 'Zeit',
    location: 'Ort',
    reminder: 'Erinnerung',
    repeat: 'Wiederholung',
  },
  caldav: {
    url: '',
    username: '',
    password: '',
    calendar: '',
  },
};
