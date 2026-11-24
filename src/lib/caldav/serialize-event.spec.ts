import { serializeEvent } from './serialize-event';
import { parseCalendarObject } from './parse-calendar-object';
import { parseWeekEvents } from '../sync/parse-week-events';
import { comparableLocalEvent, compareEvents } from '../sync/compare-events';
import { mergeSettings } from '../settings/load-settings';

const settings = mergeSettings();
const event = parseWeekEvents([
  '# Montag (23)', '- Termin: Besprechung, Büro; Zürich', '  Zeit: 09:00 - 10:00',
  '  Ort: Büro, Basel', '  Bemerkung:', '    Erste Zeile', '    Zweite Zeile',
  '  Erinnerung: 1d, 3h, 20m', '  ^woev-abc',
].join('\n'), 'week-calendar/2026/weeks/W48 23.11.26.md', settings).events[0];

describe('serializeEvent', () => {
  it('roundtrips text, UTC times and reminders without changing the event meaning', () => {
    const data = serializeEvent(event, 'Europe/Zurich', new Date('2026-11-24T12:00:00Z'));
    const remote = parseCalendarObject(data, 'https://example.com/cal/abc.ics', '"v1"', 'Europe/Zurich');
    expect(remote.uid).toBe(event.uid);
    expect(remote.comparable).toEqual(comparableLocalEvent(event, 'Europe/Zurich'));
    expect(data).toContain('DTSTART:20261123T080000Z');
    expect(data).toContain('DTSTAMP:20261124T120000Z');
    expect(data).toContain('SUMMARY:Besprechung\\, Büro\\; Zürich');
  });

  it('writes exclusive DATE boundaries for all-day appointments', () => {
    const allDay = { ...event, allDay: true, start: event.date, end: '2026-11-24' };
    const data = serializeEvent(allDay, 'Europe/Zurich');
    expect(data).toContain('DTSTART;VALUE=DATE:20261123');
    expect(data).toContain('DTEND;VALUE=DATE:20261124');
    expect(parseCalendarObject(data, 'https://example.com/cal/a.ics', '"v1"', 'Europe/Zurich').comparable)
      .toEqual(comparableLocalEvent(allDay, 'Europe/Zurich'));
  });

  it('does not cause another update merely because DTSTAMP changed', () => {
    const remote = parseCalendarObject(serializeEvent(event, 'Europe/Zurich', new Date('2020-01-01Z')),
      'https://example.com/cal/a.ics', '"v1"', 'Europe/Zurich');
    expect(compareEvents([event], [remote], 'Europe/Zurich').unchanged).toBe(1);
  });
});
