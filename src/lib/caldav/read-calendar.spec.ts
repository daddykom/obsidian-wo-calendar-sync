import { loadCalendars } from './connection';
import { readCalendar } from './read-calendar';
import { mergeSettings } from '../settings/load-settings';

jest.mock('./connection', () => ({
  loadCalendars: jest.fn(), caldavConnectionError: () => new Error('CalDAV-Verbindung fehlgeschlagen.'),
}));
jest.mock('obsidian', () => ({ requestUrl: jest.fn() }));

const settings = { ...mergeSettings().caldav, calendar: 'https://example.com/calendar/' };
const data = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:abc\nSUMMARY:Treffen\nDTSTART;VALUE=DATE:20261123\nEND:VEVENT\nEND:VCALENDAR';
const response = {
  ok: true, status: 207, href: '/calendar/extensionless', raw: {},
  props: { getetag: '"v1"', calendarData: { _cdata: data } },
};

describe('readCalendar', () => {
  const calendarQuery = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (loadCalendars as jest.Mock).mockResolvedValue({
      client: { calendarQuery }, calendars: [{ url: settings.calendar }],
    });
    calendarQuery.mockResolvedValue([response]);
  });

  it('queries every resource without a time limit or .ics filter', async () => {
    const result = await readCalendar(settings);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://example.com/calendar/extensionless');
    expect(calendarQuery).toHaveBeenCalledWith({
      url: settings.calendar, depth: '1', props: { 'd:getetag': {}, 'c:calendar-data': {} },
      filters: { 'comp-filter': { _attributes: { name: 'VCALENDAR' } } },
    });
  });

  it('never falls back to another calendar if the selected one is missing', async () => {
    (loadCalendars as jest.Mock).mockResolvedValue({ client: { calendarQuery }, calendars: [{ url: 'https://example.com/other/' }] });
    await expect(readCalendar(settings)).rejects.toThrow('nicht eindeutig gefunden');
    expect(calendarQuery).not.toHaveBeenCalled();
  });

  it.each([
    { ...response, status: 507 },
    { ...response, ok: false },
    { ...response, raw: '<html>Error</html>' },
    { ...response, props: { getetag: '"v1"' } },
    { ...response, props: { calendarData: data } },
    { ...response, href: '/outside/object' },
    { ...response, href: 'https://other.example.com/calendar/object' },
    { ...response, props: { getetag: '"v1"', calendarData: 'invalid ICS' } },
  ])('rejects incomplete or out-of-scope responses instead of returning a partial snapshot', async (broken) => {
    calendarQuery.mockResolvedValue([response, broken]);
    await expect(readCalendar(settings)).rejects.toThrow();
  });

  it('accepts the library representation of an empty calendar', async () => {
    calendarQuery.mockResolvedValue([{ ok: true, status: 207 }]);
    expect(await readCalendar(settings)).toEqual([]);
  });
});
