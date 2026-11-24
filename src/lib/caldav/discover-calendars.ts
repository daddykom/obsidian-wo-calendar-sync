import { WeekcalendarSettings } from '../types';
import { loadCalendars } from './connection';

export interface CaldavCalendar {
  url: string;
  name: string;
}

export async function discoverCalendars(
  settings: WeekcalendarSettings['caldav'],
): Promise<CaldavCalendar[]> {
  const { calendars } = await loadCalendars(settings);
  const result = new Map<string, CaldavCalendar>();
  for (const calendar of calendars) {
    const url = new URL(calendar.url).href;
    const name = typeof calendar.displayName === 'string' && calendar.displayName.trim()
      ? calendar.displayName.trim() : url;
    result.set(url, { url, name });
  }
  return [...result.values()].sort((a, b) => a.name.localeCompare(b.name) || a.url.localeCompare(b.url));
}
