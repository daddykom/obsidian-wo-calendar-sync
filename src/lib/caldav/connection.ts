import { createDAVClient } from 'tsdav';
import { WeekcalendarSettings } from '../types';
import { caldavReadFetch, CaldavHttpError, validateServerUrl } from './transport';

export function caldavConnectionError(error: unknown): Error {
  if (error instanceof CaldavHttpError && [401, 403].includes(error.status)) {
    return new Error('CalDAV-Anmeldung fehlgeschlagen oder Zugriff verweigert. Zugangsdaten und app-spezifisches Passwort prüfen.');
  }
  return new Error('CalDAV-Verbindung fehlgeschlagen. Server-URL, Netzwerk und Zugriffsrechte prüfen.');
}

export async function loadCalendars(settings: WeekcalendarSettings['caldav']) {
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
    const calendars = (await client.fetchCalendars())
      .filter((calendar) => calendar.components?.includes('VEVENT'));
    for (const calendar of calendars) validateServerUrl(calendar.url);
    return { client, calendars };
  } catch (error) {
    throw caldavConnectionError(error);
  }
}
