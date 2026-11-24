import { WeekcalendarSettings } from '../types';
import { RemoteEvent } from '../sync/compare-events';
import { loadCalendars, caldavConnectionError } from './connection';
import { parseCalendarObject } from './parse-calendar-object';
import { assertCalendarResource, validateServerUrl } from './transport';

function calendarKey(value: string): string {
  const url = new URL(validateServerUrl(value));
  url.pathname = url.pathname.replace(/\/$/, '');
  return url.href;
}

function davText(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const text = (value as Record<string, unknown>)._cdata ?? (value as Record<string, unknown>)._text;
    if (typeof text === 'string') return text;
  }
  return null;
}

export async function openSelectedCalendar(settings: WeekcalendarSettings['caldav']) {
  if (!settings.calendar) throw new Error('Bitte zuerst einen Zielkalender auswählen.');
  const targetKey = calendarKey(settings.calendar);
  const { client, calendars } = await loadCalendars(settings);
  const matches = calendars.filter((calendar) => calendarKey(calendar.url) === targetKey);
  if (matches.length !== 1) throw new Error('Der ausgewählte Zielkalender wurde nicht eindeutig gefunden. Bitte Verbindung und Auswahl prüfen.');
  const calendar = matches[0];
  return { client, calendar };
}

export async function readCalendar(settings: WeekcalendarSettings['caldav']): Promise<RemoteEvent[]> {
  const { client, calendar } = await openSelectedCalendar(settings);
  const targetKey = calendarKey(calendar.url);
  let responses: Awaited<ReturnType<typeof client.calendarQuery>>;
  try {
    // A full VCALENDAR query includes foreign resources, tasks and extensionless URLs.
    // Unlike fetchCalendarObjects, this keeps individual DAV errors visible.
    responses = await client.calendarQuery({
      url: calendar.url,
      props: { 'd:getetag': {}, 'c:calendar-data': {} },
      filters: { 'comp-filter': { _attributes: { name: 'VCALENDAR' } } },
      depth: '1',
    });
  } catch (error) {
    throw caldavConnectionError(error);
  }
  // tsdav represents a valid empty multistatus as a single status-only response.
  if (responses.length === 1 && responses[0].ok && responses[0].status === 207 &&
      !responses[0].href && !responses[0].raw && !responses[0].props) return [];
  const resources: RemoteEvent[] = [];
  const seen = new Set<string>();
  for (const response of responses) {
    if (!response.ok || response.status < 200 || response.status >= 300 || !response.href ||
        typeof response.raw === 'string') {
      throw new Error('Kalenderabfrage ist unvollständig oder enthält DAV-Fehler. Keine Vorschau erstellt.');
    }
    const url = new URL(validateServerUrl(new URL(response.href, calendar.url).href));
    if (calendarKey(url.href) === targetKey) continue;
    assertCalendarResource(url.href, calendar.url);
    const data = davText(response.props?.calendarData);
    const etag = davText(response.props?.getetag);
    if (!data || !etag || seen.has(url.href)) throw new Error('Kalenderressource fehlt, ist unvollständig oder wurde doppelt geliefert.');
    seen.add(url.href);
    try {
      resources.push(parseCalendarObject(data, url.href, etag, settings.timezone ?? 'Europe/Zurich'));
    } catch {
      throw new Error(`Kalenderressource ${url.pathname} konnte nicht eindeutig ausgewertet werden. Keine Vorschau erstellt.`);
    }
  }
  return resources;
}
