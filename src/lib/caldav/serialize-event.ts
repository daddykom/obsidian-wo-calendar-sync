import ICAL from 'ical.js';
import { CalendarEvent } from '../sync/types';
import { comparableLocalEvent } from '../sync/compare-events';

export function serializeEvent(event: CalendarEvent, timezone: string, timestamp = new Date()): string {
  const normalized = comparableLocalEvent(event, timezone);
  const calendar = new ICAL.Component('vcalendar');
  calendar.updatePropertyWithValue('version', '2.0');
  calendar.updatePropertyWithValue('prodid', '-//Week Calendart//Obsidian Calendar//EN');
  calendar.updatePropertyWithValue('calscale', 'GREGORIAN');
  const component = new ICAL.Component('vevent');
  const appointment = new ICAL.Event(component);
  appointment.uid = event.uid;
  appointment.summary = event.title;
  appointment.startDate = ICAL.Time.fromString(normalized.start, undefined);
  appointment.endDate = ICAL.Time.fromString(normalized.end, undefined);
  component.updatePropertyWithValue('dtstamp', ICAL.Time.fromJSDate(timestamp, true));
  if (event.location) appointment.location = event.location;
  if (event.description) appointment.description = event.description;
  for (const minutes of normalized.reminderMinutes) {
    const seconds = minutes * 60;
    if (!Number.isSafeInteger(seconds) || seconds <= 0) throw new Error('Ungültige Erinnerungsdauer.');
    const alarm = new ICAL.Component('valarm');
    alarm.updatePropertyWithValue('action', 'DISPLAY');
    alarm.updatePropertyWithValue('description', event.title);
    alarm.updatePropertyWithValue('trigger', ICAL.Duration.fromSeconds(-seconds));
    component.addSubcomponent(alarm);
  }
  calendar.addSubcomponent(component);
  return calendar.toString() + '\r\n';
}
