import { requestUrl } from 'obsidian';
import { caldavReadFetch, CaldavHttpError, createCalendarWriteFetch } from './transport';

jest.mock('obsidian', () => ({ requestUrl: jest.fn() }));

describe('caldavReadFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requestUrl as jest.Mock).mockResolvedValue({
      status: 207, headers: { 'content-type': 'application/xml' }, text: '<multistatus/>',
    });
  });

  it('adapts PROPFIND headers, XML body and response for tsdav', async () => {
    const response = await caldavReadFetch('https://example.com/dav/', {
      method: 'PROPFIND', headers: { Depth: '1', Authorization: 'Basic test' }, body: '<propfind/>',
    });
    expect(requestUrl).toHaveBeenCalledWith({
      url: 'https://example.com/dav/', method: 'PROPFIND',
      headers: { depth: '1', authorization: 'Basic test' }, body: '<propfind/>', throw: false,
    });
    expect(response.ok).toBe(true);
    expect(response.status).toBe(207);
    expect(response.url).toBe('https://example.com/dav/');
    expect(response.headers.get('content-type')).toBe('application/xml');
    expect(await response.text()).toBe('<multistatus/>');
  });

  it.each(['PUT', 'DELETE', 'POST', 'MKCALENDAR', 'PROPPATCH'])('blocks writing method %s before sending', async (method) => {
    await expect(caldavReadFetch('https://example.com/', { method })).rejects.toThrow('Schreibzugriffe');
    expect(requestUrl).not.toHaveBeenCalled();
  });

  it('rejects insecure URLs before forwarding credentials', async () => {
    await expect(caldavReadFetch('http://example.com/', { method: 'PROPFIND' })).rejects.toThrow('HTTPS');
    expect(requestUrl).not.toHaveBeenCalled();
  });

  it('reports HTTP errors without including server response bodies', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({ status: 401, headers: {}, text: 'sensitive data' });
    await expect(caldavReadFetch('https://example.com/', { method: 'PROPFIND' })).rejects.toEqual(new CaldavHttpError(401));
  });

  it('sanitizes native errors before they reach the library', async () => {
    (requestUrl as jest.Mock).mockRejectedValue(new Error('authorization: sensitive-data'));
    await expect(caldavReadFetch('https://example.com/', { method: 'PROPFIND' }))
      .rejects.toThrow('CalDAV-Netzwerkanfrage fehlgeschlagen.');
  });
});

describe('calendar-scoped write transport', () => {
  const write = createCalendarWriteFetch('https://example.com/calendar/');
  beforeEach(() => {
    jest.clearAllMocks();
    (requestUrl as jest.Mock).mockResolvedValue({ status: 204, headers: {}, text: '' });
  });

  it.each([
    ['PUT', { 'If-None-Match': '*' }],
    ['PUT', { 'If-Match': '"v1"' }],
    ['DELETE', { 'If-Match': '"v1"' }],
  ])('permits a conditional %s inside the selected calendar', async (method, headers) => {
    await expect(write('https://example.com/calendar/object', { method: method as string, headers }))
      .resolves.toHaveProperty('status', 204);
  });

  it.each([
    ['https://example.com/calendar/', 'DELETE', { 'If-Match': '"v1"' }],
    ['https://example.com/other/object', 'DELETE', { 'If-Match': '"v1"' }],
    ['https://foreign.example.com/calendar/object', 'PUT', { 'If-None-Match': '*' }],
    ['https://example.com/calendar/object', 'DELETE', {}],
    ['https://example.com/calendar/object', 'DELETE', { 'If-Match': '*' }],
    ['https://example.com/calendar/object', 'PUT', { 'If-Match': 'W/"v1"' }],
    ['https://example.com/calendar/object', 'POST', {}],
  ])('rejects unsafe or out-of-calendar writes', async (url, method, headers) => {
    await expect(write(url as string, { method: method as string, headers })).rejects.toThrow();
    expect(requestUrl).not.toHaveBeenCalled();
  });
});
