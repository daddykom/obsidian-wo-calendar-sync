import { mergeSettings } from '../settings/load-settings';
import { getInitialSyncStatus, SYNC_STATUS_PRESENTATION, SyncStatus } from './sync-status';

const configured = mergeSettings({ caldav: {
  autoSync: true, url: 'https://example.com/', username: 'user', password: 'secret',
  calendar: 'https://example.com/calendar/', managedCalendarConfirmed: true,
} }).caldav;

describe('automatic sync status', () => {
  it('does not assume automatic sync is enabled for old configurations', () => {
    expect(getInitialSyncStatus(mergeSettings().caldav)).toBe('off');
    expect(getInitialSyncStatus({ ...configured, autoSync: undefined })).toBe('off');
  });

  it('starts unchecked, never already synchronized, even with saved valid settings', () => {
    expect(getInitialSyncStatus(configured)).toBe('not-checked');
  });

  it.each([
    { url: '' }, { username: ' ' }, { password: '' }, { calendar: '' }, { managedCalendarConfirmed: false },
  ])('requires setup if a required configuration value is missing: %j', (change) => {
    expect(getInitialSyncStatus({ ...configured, ...change })).toBe('setup-required');
  });

  it('provides distinct, readable labels and descriptions for every runtime state', () => {
    const states: SyncStatus[] = ['off', 'setup-required', 'not-checked', 'pending', 'running', 'synced', 'error', 'confirmation-required'];
    expect(new Set(states.map((state) => SYNC_STATUS_PRESENTATION[state].label)).size).toBe(states.length);
    for (const state of states) {
      expect(SYNC_STATUS_PRESENTATION[state].description.length).toBeGreaterThan(0);
      expect(SYNC_STATUS_PRESENTATION[state].icon.length).toBeGreaterThan(0);
    }
  });
});
