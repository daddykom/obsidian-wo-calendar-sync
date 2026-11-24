import { createDAVClient } from 'tsdav';
import { requestUrl } from 'obsidian';
import { loadCalendars } from './connection';
import { caldavReadFetch } from './transport';
import { readCalendar } from './read-calendar';
import { mergeSettings } from '../settings/load-settings';

jest.mock('obsidian', () => ({ requestUrl: jest.fn() }));
jest.mock('./connection', () => ({ loadCalendars: jest.fn(), caldavConnectionError: () => new Error('Verbindung fehlgeschlagen') }));

const settings = { ...mergeSettings().caldav, calendar: 'https://example.com/calendar/' };
const multi = (body: string) => `<d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">${body}</d:multistatus>`;

describe('real tsdav REPORT parsing through the native transport', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const client = await createDAVClient({
      serverUrl: 'https://example.com/', credentials: {}, authMethod: 'Custom',
      authFunction: async () => ({}), fetch: caldavReadFetch,
    });
    (loadCalendars as jest.Mock).mockResolvedValue({ client, calendars: [{ url: settings.calendar }] });
  });

  it('reads extensionless resources and preserves their ETags', async () => {
    const data = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:abc\nSUMMARY:Treffen\nDTSTART;VALUE=DATE:20261123\nEND:VEVENT\nEND:VCALENDAR';
    (requestUrl as jest.Mock).mockResolvedValue({ status: 207, headers: { 'content-type': 'application/xml' }, text: multi(`
      <d:response><d:href>/calendar/object</d:href><d:propstat><d:prop><d:getetag>"v1"</d:getetag>
      <c:calendar-data><![CDATA[${data}]]></c:calendar-data></d:prop>
      <d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>`) });
    expect(await readCalendar(settings)).toMatchObject([{ uid: 'abc', etag: '"v1"', url: 'https://example.com/calendar/object' }]);
    expect(requestUrl).toHaveBeenCalledWith(expect.objectContaining({ method: 'REPORT', url: settings.calendar }));
  });

  it('recognizes a genuinely empty multistatus response', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({ status: 207, headers: { 'content-type': 'application/xml' }, text: multi('') });
    expect(await readCalendar(settings)).toEqual([]);
  });

  it('does not mistake an HTML login page for an empty calendar', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({ status: 200, headers: { 'content-type': 'text/html' }, text: '<html>Login</html>' });
    await expect(readCalendar(settings)).rejects.toThrow();
  });

  it('rejects an individual error inside an otherwise successful multistatus', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({ status: 207, headers: { 'content-type': 'application/xml' }, text: multi(`
      <d:response><d:href>/calendar/object</d:href><d:status>HTTP/1.1 507 Insufficient Storage</d:status></d:response>`) });
    await expect(readCalendar(settings)).rejects.toThrow();
  });
});
