import { requestUrl } from 'obsidian';
import { caldavReadFetch, CaldavHttpError } from './transport';

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
