import { parseCalendarObject } from './parse-calendar-object';

const wrap = (properties: string, extra = '') =>
  `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:abc\r\nSUMMARY:Treffen\r\n${properties}\r\nEND:VEVENT\r\n${extra}END:VCALENDAR\r\n`;
const parse = (data: string) => parseCalendarObject(data, 'https://example.com/cal/object', '"v1"', 'Europe/Zurich');

describe('parseCalendarObject', () => {
  it('normalizes UTC dates, escaped/folded text and duration alarms', () => {
    const result = parse(wrap([
      'DTSTART:20261123T080000Z', 'DTEND:20261123T090000Z',
      'LOCATION:Büro\\, Basel', 'DESCRIPTION:Erste Zeile\\nZweite', ' Zeile',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT1H', 'DESCRIPTION:Erinnerung', 'END:VALARM',
    ].join('\r\n')));
    expect(result.comparable).toEqual({
      title: 'Treffen', allDay: false, start: '2026-11-23T08:00:00Z', end: '2026-11-23T09:00:00Z',
      location: 'Büro, Basel', description: 'Erste Zeile\nZweiteZeile', reminderMinutes: [60],
    });
  });

  it('treats DATE values as all-day, defaulting a missing end to the next day', () => {
    expect(parse(wrap('DTSTART;VALUE=DATE:20261123')).comparable).toMatchObject({
      allDay: true, start: '2026-11-23', end: '2026-11-24',
    });
  });

  it.each(['DTSTART;TZID=Europe/Zurich:20261123T090000', 'DTSTART:20261123T090000'])
    ('normalizes IANA or floating times: %s', (start) => {
      expect(parse(wrap(start + '\r\nDURATION:PT1H')).comparable).toMatchObject({
        start: '2026-11-23T08:00:00Z', end: '2026-11-23T09:00:00Z',
      });
    });

  it.each(['RRULE:FREQ=DAILY', 'ATTENDEE:mailto:someone@example.com', 'STATUS:CANCELLED'])
    ('marks unsupported structures for replacement: %s', (extra) => {
      expect(parse(wrap('DTSTART:20261123T080000Z\r\n' + extra)).comparable).toBeNull();
    });

  it('includes a foreign VTODO without trying to convert it to a local appointment', () => {
    const result = parse('BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VTODO\nUID:task\nSUMMARY:Aufgabe\nEND:VTODO\nEND:VCALENDAR');
    expect(result).toMatchObject({ uid: 'task', title: 'Aufgabe', comparable: null });
  });

  it('uses embedded VTIMEZONE definitions without relying on the device timezone', () => {
    const data = wrap('DTSTART;TZID=Custom/Fixed:20261123T090000\r\nDTEND;TZID=Custom/Fixed:20261123T100000', [
      'BEGIN:VTIMEZONE', 'TZID:Custom/Fixed', 'BEGIN:STANDARD', 'DTSTART:19700101T000000',
      'TZOFFSETFROM:+0130', 'TZOFFSETTO:+0130', 'END:STANDARD', 'END:VTIMEZONE', '',
    ].join('\r\n'));
    expect(parse(data).comparable).toMatchObject({ start: '2026-11-23T07:30:00Z', end: '2026-11-23T08:30:00Z' });
  });

  it.each([
    'not ICS',
    'BEGIN:VCALENDAR\nEND:VCALENDAR',
    wrap('DTSTART:20261123T080000Z').replace('UID:abc', 'UID:'),
    wrap('DTSTART:20261123T080000Z\r\nUID:second'),
    wrap('DTSTART:20261123T080000Z\r\nDTSTART:20261124T080000Z'),
  ])('rejects incomplete or ambiguous calendar data', (data) => {
    expect(() => parse(data)).toThrow();
  });
});
