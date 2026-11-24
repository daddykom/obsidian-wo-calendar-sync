import { createDAVClient } from 'tsdav';
import { WeekcalendarSettings } from '../types';
import { caldavReadFetch, CaldavHttpError, validateServerUrl } from './transport';

export interface CaldavCalendar {
  url: string;
  name: string;
}

export async function discoverCalendars(
  settings: WeekcalendarSettings['caldav'],
): Promise<CaldavCalendar[]> {
  const serverUrl = validateServerUrl(settings.url);
  if (!settings.username.trim() || !settings.password) {
    throw new Error('Bitte Benutzername und Passwort eingeben.');
  }
  try {
    const client = await createDAVClient({
      serverUrl,
      credentials: { username: settings.username.trim(), password: settings.password },
      // tsdav's Basic helper logs the encoded credentials when debug is enabled.
      authMethod: 'Custom',
      authFunction: async (credentials) => {
        const bytes = new TextEncoder().encode(`${credentials.username}:${credentials.password}`);
        return { authorization: `Basic ${btoa(String.fromCharCode(...bytes))}` };
      },
      defaultAccountType: 'caldav',
      fetch: caldavReadFetch,
    });
    const calendars = await client.fetchCalendars();
    const result = new Map<string, CaldavCalendar>();
    for (const calendar of calendars) {
      if (!calendar.components?.includes('VEVENT')) continue;
      const url = validateServerUrl(calendar.url);
      const name = typeof calendar.displayName === 'string' && calendar.displayName.trim()
        ? calendar.displayName.trim() : url;
      result.set(url, { url, name });
    }
    return [...result.values()].sort((a, b) => a.name.localeCompare(b.name) || a.url.localeCompare(b.url));
  } catch (error) {
    if (error instanceof CaldavHttpError && [401, 403].includes(error.status)) {
      throw new Error('CalDAV-Anmeldung fehlgeschlagen oder Zugriff verweigert. Zugangsdaten und app-spezifisches Passwort prüfen.');
    }
    // Library and native errors may contain credentials or server response data.
    throw new Error('CalDAV-Verbindung fehlgeschlagen. Server-URL, Netzwerk und Zugriffsrechte prüfen.');
  }
}
