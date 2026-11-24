import { WeekcalendarSettings } from '../types';
import { CalendarEvent } from '../sync/types';
import { RemoteEvent } from '../sync/compare-events';
import { openSelectedCalendar } from './read-calendar';
import { assertCalendarResource, assertStrongEtag, createCalendarWriteFetch } from './transport';

export async function openCalendarWriter(settings: WeekcalendarSettings['caldav']) {
  if (settings.managedCalendarConfirmed !== true) throw new Error('Exklusiver Zielkalender ist nicht freigegeben.');
  const { client, calendar } = await openSelectedCalendar(settings);
  const fetch = createCalendarWriteFetch(calendar.url);
  const requireSuccess = (response: Response) => {
    if (![200, 201, 204].includes(response.status)) throw new Error('Schreibzugriff wurde vom Server nicht als abgeschlossen bestätigt.');
  };
  return {
    async create(event: CalendarEvent, data: string): Promise<void> {
      const filename = `woev-${event.localId}-${event.date}.ics`;
      if (!/^woev-[a-zA-Z0-9]+-\d{4}-\d{2}-\d{2}\.ics$/.test(filename)) throw new Error('Ungültiger Termin-Dateiname.');
      // Collections are directories even when a server omits their trailing slash.
      const collection = new URL(calendar.url);
      collection.pathname = collection.pathname.replace(/\/$/, '') + '/';
      // tsdav adds If-None-Match itself; custom headers would replace its auth defaults.
      requireSuccess(await client.createCalendarObject({
        calendar: { ...calendar, url: collection.href }, filename, iCalString: data,
        fetch,
      }));
    },
    async update(event: RemoteEvent, data: string): Promise<void> {
      assertCalendarResource(event.url, calendar.url);
      assertStrongEtag(event.etag);
      requireSuccess(await client.updateCalendarObject({ calendarObject: { url: event.url, etag: event.etag, data }, fetch }));
    },
    async delete(event: RemoteEvent): Promise<void> {
      assertCalendarResource(event.url, calendar.url);
      assertStrongEtag(event.etag);
      requireSuccess(await client.deleteCalendarObject({ calendarObject: { url: event.url, etag: event.etag }, fetch }));
    },
  };
}
