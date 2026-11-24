import type { App } from 'obsidian';
import { Notice } from 'obsidian';
import { createCalendarSync } from './sync-calendar';
import { preparePreview, PreparedPreview } from '../sync/prepare-preview';
import { executeSync, SyncResult } from '../sync/execute-sync';
import { ConfirmCalendarSyncModal } from '../ui/confirm-calendar-sync';
import { SyncPreviewModal } from '../ui/sync-preview';
import { mergeSettings } from '../settings/load-settings';
import { parseWeekEvents } from '../sync/parse-week-events';
import { createAutomaticSyncCoordinator } from '../sync/automatic-sync-coordinator';

jest.mock('obsidian', () => ({ Notice: jest.fn().mockImplementation(() => ({ hide: jest.fn() })) }));
jest.mock('../sync/prepare-preview', () => ({ preparePreview: jest.fn() }));
jest.mock('../sync/execute-sync', () => ({ ...jest.requireActual('../sync/execute-sync'), executeSync: jest.fn() }));
jest.mock('../ui/sync-preview', () => ({ SyncPreviewModal: jest.fn() }));
jest.mock('../ui/confirm-calendar-sync', () => ({ ConfirmCalendarSyncModal: jest.fn() }));

const app = { vault: {} } as App;
const createSettings = () => mergeSettings({ caldav: {
  autoSync: true, url: 'https://example.com/', username: 'user', password: 'secret',
  calendar: 'https://example.com/calendar/', managedCalendarConfirmed: true,
} });
const settings = createSettings();
const path = 'week-calendar/2026/weeks/W48 23.11.26.md';
const content = '# Montag (23)\n- Termin: Treffen\n  ^woev-abc';
const local = parseWeekEvents(content, path, settings).events[0];
const preview: PreparedPreview = {
  ok: true, calendarUrl: settings.caldav.calendar, timezone: 'Europe/Zurich',
  scannedFiles: 1, localCount: 1, remoteCount: 0,
  sources: [{ path, content }], local: [local], remote: [],
  plan: { create: [local], update: [], delete: [], unchanged: 0 },
};
const success: SyncResult = { ok: true, created: 1, updated: 0, deleted: 0, unchanged: 0, message: 'Erfolgreich' };

describe('automatic execution entry point', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (preparePreview as jest.Mock).mockResolvedValue(preview);
    (executeSync as jest.Mock).mockResolvedValue(success);
  });

  it('reuses the guarded executor without granting full-deletion consent or opening dialogs', async () => {
    const settings = createSettings();
    const status = jest.fn();
    expect(await createCalendarSync(app, settings, status).runAutomatic()).toEqual({ status: 'synced', result: success });
    expect(executeSync).toHaveBeenCalledWith(app.vault, settings, preview, JSON.stringify(settings), false, expect.any(Function));
    expect(status.mock.calls.map(([state]) => state)).toEqual(['running', 'synced']);
    expect(ConfirmCalendarSyncModal).not.toHaveBeenCalled();
    expect(SyncPreviewModal).not.toHaveBeenCalled();
    expect(Notice).not.toHaveBeenCalled();
  });

  it('stays entirely local when automatic sync is off', async () => {
    expect(await createCalendarSync(app, mergeSettings()).runAutomatic()).toEqual({ status: 'off' });
    expect(preparePreview).not.toHaveBeenCalled();
    expect(executeSync).not.toHaveBeenCalled();
  });

  it.each([{ managedCalendarConfirmed: false }, { calendar: '' }, { url: '' }, { username: '' }, { password: '' }])
    ('requires complete setup and explicit calendar ownership before connecting: %j', async (change) => {
      const settings = createSettings();
      Object.assign(settings.caldav, change);
      const status = jest.fn();
      expect(await createCalendarSync(app, settings, status).runAutomatic()).toEqual({ status: 'setup-required' });
      expect(status).toHaveBeenLastCalledWith('setup-required');
      expect(preparePreview).not.toHaveBeenCalled();
    });

  it.each([0, 1])('blocks deleting all resources, also when replacing them with %s local events', async (localCount) => {
    const status = jest.fn();
    const foreign = { uid: 'foreign', title: 'Fremd', url: settings.caldav.calendar + 'foreign', etag: '"v1"', comparable: null };
    (preparePreview as jest.Mock).mockResolvedValue({
      ...preview, remoteCount: 1, remote: [foreign], localCount,
      plan: { ...preview.plan, create: localCount ? [local] : [], delete: [foreign] },
    });
    expect(await createCalendarSync(app, createSettings(), status).runAutomatic()).toEqual({ status: 'confirmation-required' });
    expect(status).toHaveBeenLastCalledWith('confirmation-required');
    expect(executeSync).not.toHaveBeenCalled();
    expect(ConfirmCalendarSyncModal).not.toHaveBeenCalled();
    expect(Notice).not.toHaveBeenCalled();
  });

  it('revalidates even an apparently unchanged calendar before reporting synchronized', async () => {
    (preparePreview as jest.Mock).mockResolvedValue({ ...preview, plan: { create: [], update: [], delete: [], unchanged: 1 } });
    expect((await createCalendarSync(app, createSettings()).runAutomatic()).status).toBe('synced');
    expect(executeSync).toHaveBeenCalledTimes(1);
  });

  it('reports validation failures without opening a modal or showing a notice', async () => {
    const status = jest.fn();
    (preparePreview as jest.Mock).mockResolvedValue({ ok: false, errors: [{ path: 'week.md', message: 'ID fehlt' }] });
    expect(await createCalendarSync(app, createSettings(), status).runAutomatic()).toEqual({ status: 'error' });
    expect(status).toHaveBeenLastCalledWith('error');
    expect(executeSync).not.toHaveBeenCalled();
    expect(SyncPreviewModal).not.toHaveBeenCalled();
    expect(Notice).not.toHaveBeenCalled();
  });

  it('releases the shared lock after an exception and does not expose raw errors', async () => {
    (preparePreview as jest.Mock).mockRejectedValueOnce(new Error('secret credentials'));
    const sync = createCalendarSync(app, createSettings());
    expect(await sync.runAutomatic()).toEqual({ status: 'error' });
    expect((await sync.runAutomatic()).status).toBe('synced');
    expect(Notice).not.toHaveBeenCalled();
  });

  it('does not report success or silently retry a failed or partial execution', async () => {
    const status = jest.fn();
    const failure = { ...success, ok: false, message: 'Konflikt' };
    (executeSync as jest.Mock).mockResolvedValue(failure);
    expect(await createCalendarSync(app, createSettings(), status).runAutomatic()).toEqual({ status: 'error', result: failure });
    expect(status).toHaveBeenLastCalledWith('error');
    expect(executeSync).toHaveBeenCalledTimes(1);
  });

  it('does not overlap two automatic preparations', async () => {
    let resolve!: (value: unknown) => void;
    (preparePreview as jest.Mock).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const sync = createCalendarSync(app, createSettings());
    const pending = sync.runAutomatic();
    expect(await sync.runAutomatic()).toEqual({ status: 'busy' });
    expect(preparePreview).toHaveBeenCalledTimes(1);
    resolve(preview);
    expect((await pending).status).toBe('synced');
  });

  it('does not start automatically while manual confirmation is pending', async () => {
    let resolve!: (value: unknown) => void;
    (ConfirmCalendarSyncModal as jest.Mock).mockImplementationOnce(() => ({
      waitForApproval: () => new Promise((done) => { resolve = done; }), close: jest.fn(),
    }));
    const sync = createCalendarSync(app, createSettings());
    const pending = sync.run();
    await Promise.resolve();
    expect(await sync.runAutomatic()).toEqual({ status: 'busy' });
    expect(preparePreview).toHaveBeenCalledTimes(1);
    resolve(null);
    await pending;
    expect((await sync.runAutomatic()).status).toBe('synced');
  });

  it('blocks the manual command while automatic execution is in flight', async () => {
    let resolve!: (value: unknown) => void;
    (executeSync as jest.Mock).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const sync = createCalendarSync(app, createSettings());
    const pending = sync.runAutomatic();
    await Promise.resolve();
    await sync.run();
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('läuft bereits'));
    expect(ConfirmCalendarSyncModal).not.toHaveBeenCalled();
    expect(preparePreview).toHaveBeenCalledTimes(1);
    resolve(success);
    expect((await pending).status).toBe('synced');
  });

  it('wakes the coordinator when a manual confirmation releases the shared lock', async () => {
    jest.useFakeTimers();
    let resolve!: (value: unknown) => void;
    (ConfirmCalendarSyncModal as jest.Mock).mockImplementationOnce(() => ({
      waitForApproval: () => new Promise((done) => { resolve = done; }), close: jest.fn(),
    }));
    const settings = createSettings();
    let coordinator: ReturnType<typeof createAutomaticSyncCoordinator> | undefined;
    const sync = createCalendarSync(app, settings, (status) => coordinator?.reportWorkerStatus(status),
      () => coordinator?.idle());
    const status = jest.fn();
    coordinator = createAutomaticSyncCoordinator(settings, sync.runAutomatic, status);
    try {
      const manual = sync.run();
      await Promise.resolve();
      coordinator.changed();
      await jest.advanceTimersByTimeAsync(60000);
      expect(preparePreview).toHaveBeenCalledTimes(1);
      expect(executeSync).not.toHaveBeenCalled();
      resolve(null);
      await manual;
      await jest.advanceTimersByTimeAsync(0);
      expect(preparePreview).toHaveBeenCalledTimes(2);
      expect(executeSync).toHaveBeenCalledTimes(1);
      expect(status).toHaveBeenLastCalledWith('synced');
    } finally {
      coordinator.dispose();
      sync.cancel();
      jest.useRealTimers();
    }
  });

  it('discards preparation after settings change instead of writing to a new target', async () => {
    let resolve!: (value: unknown) => void;
    (preparePreview as jest.Mock).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const settings = createSettings();
    const sync = createCalendarSync(app, settings);
    const pending = sync.runAutomatic();
    settings.caldav.calendar = 'https://example.com/other/';
    resolve(preview);
    expect(await pending).toEqual({ status: 'stale' });
    expect(executeSync).not.toHaveBeenCalled();
  });

  it('stops subsequent requests and reports off when the automatic flag is disabled mid-run', async () => {
    const settings = createSettings();
    const status = jest.fn();
    (executeSync as jest.Mock).mockImplementationOnce(async (...args) => {
      const isActive = args[5] as () => boolean;
      expect(isActive()).toBe(true);
      settings.caldav.autoSync = false;
      expect(isActive()).toBe(false);
      return { ...success, ok: false };
    });
    expect((await createCalendarSync(app, settings, status).runAutomatic()).status).toBe('off');
    expect(status).toHaveBeenLastCalledWith('off');
  });

  it('ignores late preparation results after unloading and never starts again', async () => {
    let resolve!: (value: unknown) => void;
    (preparePreview as jest.Mock).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const status = jest.fn();
    const sync = createCalendarSync(app, createSettings(), status);
    const pending = sync.runAutomatic();
    sync.cancel();
    resolve(preview);
    expect(await pending).toEqual({ status: 'cancelled' });
    expect(executeSync).not.toHaveBeenCalled();
    expect(await sync.runAutomatic()).toEqual({ status: 'cancelled' });
    expect(status).toHaveBeenCalledTimes(1);
  });

  it('does not replace disabled status with an error from an obsolete request', async () => {
    let reject!: (error: Error) => void;
    (preparePreview as jest.Mock).mockReturnValueOnce(new Promise((_resolve, fail) => { reject = fail; }));
    const settings = createSettings();
    const status = jest.fn();
    const pending = createCalendarSync(app, settings, status).runAutomatic();
    settings.caldav.autoSync = false;
    reject(new Error('old network error'));
    expect(await pending).toEqual({ status: 'off' });
    expect(status).toHaveBeenLastCalledWith('off');
    expect(executeSync).not.toHaveBeenCalled();
  });
});
