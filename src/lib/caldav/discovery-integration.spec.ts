import { requestUrl } from 'obsidian';
import { discoverCalendars } from './discover-calendars';
import { mergeSettings } from '../settings/load-settings';

jest.mock('obsidian', () => ({ requestUrl: jest.fn() }));

const multistatus = (href: string, properties: string) => `<?xml version="1.0"?>
  <d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
    <d:response><d:href>${href}</d:href><d:propstat><d:prop>${properties}</d:prop>
      <d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>
  </d:multistatus>`;

describe('tsdav discovery through the native read-only adapter', () => {
  it('discovers a VEVENT calendar using real tsdav and simulated DAV XML responses', async () => {
    const methods: string[] = [];
    (requestUrl as jest.Mock).mockImplementation(async ({ url, method, body, headers }) => {
      methods.push(method);
      expect(headers.authorization).toBe(`Basic ${btoa('user:secret')}`);
      if (url.endsWith('/.well-known/caldav')) return { status: 404, headers: {}, text: '' };
      let text: string;
      if (body.includes('current-user-principal')) {
        text = multistatus('/dav/', '<d:current-user-principal><d:href>/principal/</d:href></d:current-user-principal>');
      } else if (body.includes('calendar-home-set')) {
        text = multistatus('/principal/', '<c:calendar-home-set><d:href>/calendars/</d:href></c:calendar-home-set>');
      } else if (body.includes('supported-report-set')) {
        text = multistatus('/calendars/obsidian/', '<d:supported-report-set/>');
      } else {
        expect(url).toBe('https://example.com/calendars/');
        text = multistatus('/calendars/obsidian/', `
          <d:displayname>Obsidian</d:displayname>
          <d:resourcetype><d:collection/><c:calendar/></d:resourcetype>
          <c:supported-calendar-component-set><c:comp name="VEVENT"/></c:supported-calendar-component-set>`);
      }
      return { status: 207, headers: { 'content-type': 'application/xml' }, text };
    });
    const result = await discoverCalendars({
      ...mergeSettings().caldav, url: 'https://example.com/dav/', username: 'user', password: 'secret',
    });
    expect(result).toEqual([{ url: 'https://example.com/calendars/obsidian/', name: 'Obsidian' }]);
    expect(methods).toHaveLength(5);
    expect(new Set(methods)).toEqual(new Set(['PROPFIND']));
  });
});
