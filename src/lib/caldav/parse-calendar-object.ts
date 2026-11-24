/*! Includes unmodified ical.js (MPL-2.0), bundled from https://github.com/kewisch/ical.js.
 * License: https://mozilla.org/MPL/2.0/ */
import ICAL from 'ical.js';
import { ComparableEvent, RemoteEvent } from '../sync/compare-events';
import { wallTimeToUtc } from '../sync/timezone';

function canonicalTime(time: ICAL.Time, property: ICAL.Property | null, timezone: string): string {
  if (time.isDate) return time.toString();
  if (time.zone !== ICAL.Timezone.localTimezone) {
    return new Date(time.toUnixTime() * 1000).toISOString().slice(0, 19) + 'Z';
  }
  const tzid = property?.getParameter('tzid');
  return wallTimeToUtc(time.toString(), typeof tzid === 'string' ? tzid : timezone);
}

export function parseCalendarObject(data: string, url: string, etag: string, timezone: string): RemoteEvent {
  const calendar = new ICAL.Component(ICAL.parse(data));
  if (calendar.name !== 'vcalendar') throw new Error('Kein VCALENDAR.');
  const components = calendar.getAllSubcomponents().filter((component) => component.name !== 'vtimezone');
  if (!components.length) throw new Error('Leere Kalenderressource.');
  const uids = components.map((component) => component.getFirstPropertyValue('uid'));
  if (uids.some((uid) => typeof uid !== 'string' || !uid.trim()) || new Set(uids).size !== 1 ||
      components.some((component) => component.getAllProperties('uid').length !== 1)) {
    throw new Error('Kalenderressource enthält keine eindeutige UID.');
  }
  const component = components[0];
  const titleValue = component.getFirstPropertyValue('summary');
  const title = typeof titleValue === 'string' ? titleValue : '(ohne Titel)';
  let comparable: ComparableEvent | null = null;
  const unsupported = ['rrule', 'rdate', 'exdate', 'recurrence-id', 'attendee', 'organizer'];
  const status = component.getFirstPropertyValue('status');
  if (components.length === 1 && component.name === 'vevent' &&
      (!status || status === 'CONFIRMED') && !calendar.hasProperty('method') &&
      !unsupported.some((name) => component.hasProperty(name))) {
    const event = new ICAL.Event(component);
    if (!component.hasProperty('dtstart')) throw new Error('DTSTART fehlt.');
    for (const name of ['uid', 'summary', 'dtstart', 'dtend', 'duration', 'location', 'description']) {
      if (component.getAllProperties(name).length > 1) throw new Error('Mehrdeutige Termineigenschaften.');
    }
    if (component.hasProperty('dtend') && component.hasProperty('duration')) throw new Error('DTEND und DURATION gleichzeitig.');
    const start = event.startDate;
    const end = event.endDate;
    if (start.isDate !== end.isDate) throw new Error('Unterschiedliche Datumsformate.');
    const reminderMinutes: number[] = [];
    let supportedAlarms = true;
    for (const alarm of component.getAllSubcomponents('valarm')) {
      const triggerProperty = alarm.getFirstProperty('trigger');
      const trigger = triggerProperty?.getFirstValue();
      const seconds = trigger instanceof ICAL.Duration ? trigger.toSeconds() : 0;
      if (alarm.getFirstPropertyValue('action') !== 'DISPLAY' ||
          alarm.getAllProperties('trigger').length !== 1 ||
          triggerProperty?.getParameter('related') === 'END' ||
          alarm.hasProperty('repeat') || alarm.hasProperty('duration') ||
          seconds >= 0 || seconds % 60 !== 0) {
        supportedAlarms = false;
      } else reminderMinutes.push(-seconds / 60);
    }
    const location = component.getFirstPropertyValue('location') ?? '';
    const description = component.getFirstPropertyValue('description') ?? '';
    if (typeof location !== 'string' || typeof description !== 'string') throw new Error('Ungültige Textfelder.');
    if (supportedAlarms) {
      comparable = {
        title: typeof titleValue === 'string' ? titleValue : '', allDay: start.isDate,
        start: canonicalTime(start, component.getFirstProperty('dtstart'), timezone),
        end: canonicalTime(end, component.getFirstProperty('dtend') ?? component.getFirstProperty('dtstart'), timezone),
        location, description,
        reminderMinutes: [...new Set(reminderMinutes)].sort((a, b) => a - b),
      };
    }
  }
  return { url, etag, uid: uids[0] as string, title, comparable };
}
