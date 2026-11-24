import type { App } from 'obsidian';
import { WeekcalendarSettings } from '../types';
import { parseWeekEvents } from './parse-week-events';
import { CalendarEvent, CollectionError, CollectionResult } from './types';

export async function collectEvents(
  vault: Pick<App['vault'], 'getMarkdownFiles' | 'read'>,
  settings: WeekcalendarSettings,
): Promise<CollectionResult> {
  const prefix = `${settings.paths.weekFolder}/`;
  const files = vault.getMarkdownFiles()
    .filter((file) => file.path.startsWith(prefix) && /^[^/]+\/weeks\/W[^/]*\.md$/.test(file.path.slice(prefix.length)))
    .sort((a, b) => a.path.localeCompare(b.path));
  const events: CalendarEvent[] = [];
  const errors: CollectionError[] = [];
  const seen = new Map<string, CalendarEvent>();

  for (const file of files) {
    try {
      const parsed = parseWeekEvents(await vault.read(file), file.path, settings);
      errors.push(...parsed.errors);
      for (const event of parsed.events) {
        const previous = seen.get(event.uid);
        if (previous) {
          errors.push({
            path: file.path, line: event.sourceLine,
            message: `Doppelte Termin-ID am selben Datum; bereits in ${previous.sourcePath}:${previous.sourceLine}.`,
          });
        } else {
          seen.set(event.uid, event);
          events.push(event);
        }
      }
    } catch {
      errors.push({ path: file.path, message: 'Wochen-Datei konnte nicht gelesen oder verarbeitet werden.' });
    }
  }

  // Never expose a partial snapshot: later sync steps must require ok === true.
  return errors.length > 0
    ? { ok: false, scannedFiles: files.length, errors }
    : { ok: true, scannedFiles: files.length, events };
}
