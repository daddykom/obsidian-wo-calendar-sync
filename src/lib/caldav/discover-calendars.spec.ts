import { createDAVClient } from 'tsdav';
import { discoverCalendars } from './discover-calendars';
import { caldavReadFetch, CaldavHttpError } from './transport';
import { mergeSettings } from '../settings/load-settings';

jest.mock('tsdav', () => ({ createDAVClient: jest.fn() }));
jest.mock('obsidian', () => ({ requestUrl: jest.fn() }));

const settings = {
  ...mergeSettings().caldav,
  url: 'https://example.com/dav/', username: 'user', password: 'secret',
};

describe('discoverCalendars', () => {
  const fetchCalendars = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (createDAVClient as jest.Mock).mockResolvedValue({ fetchCalendars });
    fetchCalendars.mockResolvedValue([]);
  });

  it('uses the native read-only transport and Basic authentication without the credential debug helper', async () => {
    await discoverCalendars(settings);
    expect(createDAVClient).toHaveBeenCalledWith(expect.objectContaining({
      serverUrl: settings.url, defaultAccountType: 'caldav', authMethod: 'Custom', fetch: caldavReadFetch,
    }));
    const options = (createDAVClient as jest.Mock).mock.calls[0][0];
    expect(await options.authFunction(options.credentials)).toEqual({
      authorization: `Basic ${btoa('user:secret')}`,
    });
    expect(fetchCalendars).toHaveBeenCalledTimes(1);
  });

  it('returns unique VEVENT calendars sorted by name with unambiguous URLs', async () => {
    fetchCalendars.mockResolvedValue([
      { url: 'https://example.com/b/', displayName: 'Planung', components: ['VEVENT'] },
      { url: 'https://example.com/a/', displayName: 'Planung', components: ['VEVENT', 'VTODO'] },
      { url: 'https://example.com/b/', displayName: 'Planung', components: ['VEVENT'] },
      { url: 'https://example.com/tasks/', displayName: 'Aufgaben', components: ['VTODO'] },
      { url: 'https://example.com/unknown/', displayName: 'Unbekannt' },
    ]);
    expect(await discoverCalendars(settings)).toEqual([
      { url: 'https://example.com/a/', name: 'Planung' },
      { url: 'https://example.com/b/', name: 'Planung' },
    ]);
  });

  it('falls back to the URL for missing or non-string display names', async () => {
    fetchCalendars.mockResolvedValue([{ url: 'https://example.com/a/', displayName: {}, components: ['VEVENT'] }]);
    expect(await discoverCalendars(settings)).toEqual([{ url: 'https://example.com/a/', name: 'https://example.com/a/' }]);
  });

  it.each([
    { url: 'http://example.com/' }, { url: 'not a URL' },
    { url: 'https://user:secret@example.com/' }, { url: 'https://example.com/#fragment' },
    { username: '' }, { password: '' },
  ])('validates credentials before starting requests: %j', async (change) => {
    await expect(discoverCalendars({ ...settings, ...change })).rejects.toThrow();
    expect(createDAVClient).not.toHaveBeenCalled();
  });

  it.each([401, 403])('reports HTTP %s as an authentication/access problem', async (status) => {
    fetchCalendars.mockRejectedValue(new CaldavHttpError(status));
    await expect(discoverCalendars(settings)).rejects.toThrow('Zugangsdaten');
  });

  it('does not expose raw library error messages or a partial calendar list', async () => {
    fetchCalendars.mockRejectedValue(new Error('secret authorization: Basic user:secret'));
    await expect(discoverCalendars(settings)).rejects.toThrow('Server-URL, Netzwerk');
    await expect(discoverCalendars(settings)).rejects.not.toThrow('secret');
  });
});
