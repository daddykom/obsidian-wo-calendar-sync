import type { App } from 'obsidian';
import { WeekcalendarSettings } from '../types';
import { collectEvents } from './collect-events';
import { compareEvents, SyncPlan } from './compare-events';
import { CollectionError } from './types';
import { readCalendar } from '../caldav/read-calendar';
import { validateTimezone } from './timezone';

export type PreviewResult =
  | { ok: false; errors: CollectionError[] }
  | { ok: true; calendarUrl: string; timezone: string; scannedFiles: number; localCount: number; remoteCount: number; plan: SyncPlan };

export async function preparePreview(
  vault: Pick<App['vault'], 'getMarkdownFiles' | 'read'>,
  settings: WeekcalendarSettings,
): Promise<PreviewResult> {
  if (!settings.caldav.calendar || settings.caldav.managedCalendarConfirmed !== true) {
    return { ok: false, errors: [{ path: '', message: 'Bitte einen exklusiven Zielkalender auswählen und in den Einstellungen ausdrücklich freigeben.' }] };
  }
  const timezone = settings.caldav.timezone ?? 'Europe/Zurich';
  try {
    validateTimezone(timezone);
    const local = await collectEvents(vault, settings);
    if (!local.ok) return { ok: false, errors: local.errors };
    // Validate local times before making network requests.
    compareEvents(local.events, [], timezone);
    const remote = await readCalendar(settings.caldav);
    return {
      ok: true, calendarUrl: settings.caldav.calendar, timezone,
      scannedFiles: local.scannedFiles, localCount: local.events.length, remoteCount: remote.length,
      plan: compareEvents(local.events, remote, timezone),
    };
  } catch (error) {
    return { ok: false, errors: [{ path: '', message: error instanceof Error ? error.message : 'Kalender-Vorschau konnte nicht erstellt werden.' }] };
  }
}
