import type { App } from 'obsidian';
import { Notice } from 'obsidian';
import { createCalendarSync } from './sync-calendar';
import { preparePreview, PreparedPreview } from '../sync/prepare-preview';
import { executeSync } from '../sync/execute-sync';
import { ConfirmCalendarSyncModal } from '../ui/confirm-calendar-sync';
import { SyncPreviewModal } from '../ui/sync-preview';
import { mergeSettings } from '../settings/load-settings';

jest.mock('obsidian', () => ({ Notice: jest.fn().mockImplementation(() => ({ hide: jest.fn() })) }));
jest.mock('../sync/prepare-preview', () => ({ preparePreview: jest.fn() }));
jest.mock('../sync/execute-sync', () => ({
  ...jest.requireActual('../sync/execute-sync'), executeSync: jest.fn(),
}));
jest.mock('../ui/sync-preview', () => ({ SyncPreviewModal: jest.fn().mockImplementation(() => ({ open: jest.fn() })) }));
jest.mock('../ui/confirm-calendar-sync', () => ({ ConfirmCalendarSyncModal: jest.fn() }));

const preview: PreparedPreview = {
  ok: true, calendarUrl: 'https://example.com/calendar/', timezone: 'Europe/Zurich',
  scannedFiles: 1, localCount: 0, remoteCount: 1, sources: [], local: [], remote: [],
  plan: { create: [], update: [], unchanged: 0, delete: [{
    uid: 'foreign', title: 'Fremd', url: 'https://example.com/calendar/foreign', etag: '"v1"', comparable: null,
  }] },
};
const app = { vault: {} } as App;

describe('manual calendar sync command', () => {
  const waitForApproval = jest.fn();
  const close = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (preparePreview as jest.Mock).mockResolvedValue(preview);
    (ConfirmCalendarSyncModal as jest.Mock).mockImplementation(() => ({ waitForApproval, close }));
    waitForApproval.mockResolvedValue({ fullDeletionConfirmed: true });
    (executeSync as jest.Mock).mockResolvedValue({ ok: true, created: 0, updated: 0, deleted: 1, unchanged: 0, message: 'Erfolgreich' });
  });

  it('executes only after explicit approval and passes the exact settings snapshot', async () => {
    const settings = mergeSettings();
    await createCalendarSync(app, settings).run();
    expect(executeSync).toHaveBeenCalledWith(app.vault, settings, preview, JSON.stringify(settings), true, expect.any(Function));
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('1 gelöscht'), 20000);
  });

  it('does not write when the user cancels', async () => {
    waitForApproval.mockResolvedValue(null);
    await createCalendarSync(app, mergeSettings()).run();
    expect(executeSync).not.toHaveBeenCalled();
  });

  it('shows validation errors without offering execution', async () => {
    (preparePreview as jest.Mock).mockResolvedValue({ ok: false, errors: [] });
    await createCalendarSync(app, mergeSettings()).run();
    expect(SyncPreviewModal).toHaveBeenCalled();
    expect(ConfirmCalendarSyncModal).not.toHaveBeenCalled();
    expect(executeSync).not.toHaveBeenCalled();
  });

  it('blocks parallel runs, including while a confirmation dialog is open', async () => {
    let resolve!: (value: unknown) => void;
    waitForApproval.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const sync = createCalendarSync(app, mergeSettings());
    const pending = sync.run();
    await Promise.resolve();
    await sync.run();
    expect(preparePreview).toHaveBeenCalledTimes(1);
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('läuft bereits'));
    resolve(null);
    await pending;
  });

  it('closes pending confirmation on unload and never executes afterwards', async () => {
    let resolve!: (value: unknown) => void;
    waitForApproval.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    close.mockImplementationOnce(() => resolve(null));
    const sync = createCalendarSync(app, mergeSettings());
    const pending = sync.run();
    await Promise.resolve();
    sync.cancel();
    await pending;
    expect(close).toHaveBeenCalled();
    expect(executeSync).not.toHaveBeenCalled();
  });

  it('updates the shared status after a manually approved sync when automatic mode is enabled', async () => {
    const status = jest.fn();
    await createCalendarSync(app, mergeSettings({ caldav: { autoSync: true } }), status).run();
    expect(status.mock.calls.map(([value]) => value)).toEqual(['running', 'synced']);
  });

  it('does not present automatic mode as enabled after a manual sync when the flag is off', async () => {
    const status = jest.fn();
    await createCalendarSync(app, mergeSettings(), status).run();
    expect(status).toHaveBeenLastCalledWith('off');
    expect(status).not.toHaveBeenCalledWith('synced');
  });
});
