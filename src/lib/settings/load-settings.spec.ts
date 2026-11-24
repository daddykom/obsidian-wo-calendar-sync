import { mergeSettings } from './load-settings';
import { DEFAULT_SETTINGS } from './constants';

describe('mergeSettings', () => {
  it('loads safe defaults when no configuration exists', () => {
    expect(mergeSettings()).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings(null).caldav.managedCalendarConfirmed).toBe(false);
  });

  it('adds missing fields to older settings without losing existing values', () => {
    const result = mergeSettings({
      paths: { weekFolder: 'Plans' },
      caldav: { url: 'https://example.com', username: 'user', password: 'secret' },
    });
    expect(result.paths.weekFolder).toBe('Plans');
    expect(result.paths.overviewFileName).toBe(DEFAULT_SETTINGS.paths.overviewFileName);
    expect(result.caldav).toEqual({
      url: 'https://example.com', username: 'user', password: 'secret',
      calendar: '', managedCalendarConfirmed: false,
    });
  });

  it('preserves a saved target calendar and explicit consent', () => {
    const result = mergeSettings({
      caldav: { calendar: 'https://example.com/calendars/obsidian/', managedCalendarConfirmed: true },
    });
    expect(result.caldav.calendar).toBe('https://example.com/calendars/obsidian/');
    expect(result.caldav.managedCalendarConfirmed).toBe(true);
  });

  it('does not share mutable default objects between loads', () => {
    const first = mergeSettings();
    first.caldav.managedCalendarConfirmed = true;
    first.paths.weekFolder = 'changed';
    const second = mergeSettings();
    expect(second.caldav.managedCalendarConfirmed).toBe(false);
    expect(second.paths.weekFolder).toBe(DEFAULT_SETTINGS.paths.weekFolder);
  });
});
