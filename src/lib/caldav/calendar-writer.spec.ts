import { createDAVClient } from 'tsdav';
import { requestUrl } from 'obsidian';
import { openSelectedCalendar } from './read-calendar';
import { openCalendarWriter } from './calendar-writer';
import { caldavReadFetch, CaldavHttpError } from './transport';
import { mergeSettings } from '../settings/load-settings';
import { parseWeekEvents } from '../sync/parse-week-events';

jest.mock('obsidian', () => ({ requestUrl: jest.fn() }));
jest.mock('./read-calendar', () => ({ openSelectedCalendar: jest.fn() }));

const settings = mergeSettings({ caldav: { calendar: 'https://example.com/calendar/', managedCalendarConfirmed: true } });
const event = parseWeekEvents('# Montag (23)\n- Termin: Treffen\n  ^woev-abc',
  'week-calendar/2026/weeks/W48 23.11.26.md', settings).events[0];
const remote = { url: 'https://example.com/calendar/existing', etag: '"v1"', uid: event.uid, title: 'Alt', comparable: null };

describe('calendar writer using real tsdav', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const client = await createDAVClient({
      serverUrl: 'https://example.com/', credentials: {}, authMethod: 'Custom',
      authFunction: async () => ({ authorization: 'Basic test' }), fetch: caldavReadFetch,
    });
    (openSelectedCalendar as jest.Mock).mockResolvedValue({ client, calendar: { url: settings.caldav.calendar } });
    (requestUrl as jest.Mock).mockResolvedValue({ status: 201, headers: {}, text: '' });
  });

  it('creates deterministic resources without overwriting an existing object', async () => {
    const writer = await openCalendarWriter(settings.caldav);
    await writer.create(event, 'ICS');
    expect(requestUrl).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://example.com/calendar/woev-abc-2026-11-23.ics', method: 'PUT', body: 'ICS',
      headers: expect.objectContaining({ 'if-none-match': '*', authorization: 'Basic test' }),
    }));
  });

  it('protects updates and deletions with the resource ETag', async () => {
    const writer = await openCalendarWriter(settings.caldav);
    await writer.update(remote, 'ICS');
    await writer.delete(remote);
    expect((requestUrl as jest.Mock).mock.calls.map(([request]) => [request.method, request.headers['if-match']]))
      .toEqual([['PUT', '"v1"'], ['DELETE', '"v1"']]);
  });

  it('does not silently retry or force an ETag conflict', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({ status: 412, headers: {}, text: 'sensitive response' });
    const writer = await openCalendarWriter(settings.caldav);
    await expect(writer.update(remote, 'ICS')).rejects.toEqual(new CaldavHttpError(412));
    expect(requestUrl).toHaveBeenCalledTimes(1);
  });

  it('rejects unconfirmed, asynchronous or redirected write responses', async () => {
    const writer = await openCalendarWriter(settings.caldav);
    for (const status of [202, 302]) {
      (requestUrl as jest.Mock).mockResolvedValue({ status, headers: {}, text: '' });
      await expect(writer.create(event, 'ICS')).rejects.toThrow('nicht als abgeschlossen');
    }
  });

  it('requires dedicated calendar consent before opening a writer', async () => {
    await expect(openCalendarWriter({ ...settings.caldav, managedCalendarConfirmed: false })).rejects.toThrow('nicht freigegeben');
    expect(openSelectedCalendar).not.toHaveBeenCalled();
  });
});
