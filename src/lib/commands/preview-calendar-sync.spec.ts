import { Notice } from 'obsidian';
import type { App } from 'obsidian';
import { previewCalendarSync } from './preview-calendar-sync';
import { preparePreview } from '../sync/prepare-preview';
import { SyncPreviewModal } from '../ui/sync-preview';
import { mergeSettings } from '../settings/load-settings';

jest.mock('obsidian', () => ({ Notice: jest.fn() }));
jest.mock('../sync/prepare-preview', () => ({ preparePreview: jest.fn() }));
jest.mock('../ui/sync-preview', () => ({ SyncPreviewModal: jest.fn().mockImplementation(() => ({ open: jest.fn() })) }));

describe('previewCalendarSync command', () => {
  const app = { vault: {} } as App;
  beforeEach(() => {
    jest.clearAllMocks();
    (preparePreview as jest.Mock).mockResolvedValue({ ok: false, errors: [] });
  });

  it('opens the preview without saving or modifying anything', async () => {
    const settings = mergeSettings();
    await previewCalendarSync(app, settings)();
    expect(preparePreview).toHaveBeenCalledWith(app.vault, settings);
    expect((preparePreview as jest.Mock).mock.calls[0][1]).not.toBe(settings);
    expect(SyncPreviewModal).toHaveBeenCalledWith(app, { ok: false, errors: [] });
  });

  it('rejects concurrent previews and permits another run afterwards', async () => {
    let resolve!: (value: unknown) => void;
    (preparePreview as jest.Mock).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const run = previewCalendarSync(app, mergeSettings());
    const pending = run();
    await run();
    expect(preparePreview).toHaveBeenCalledTimes(1);
    expect(Notice).toHaveBeenCalledWith('Kalender-Vorschau wird bereits erstellt.');
    resolve({ ok: false, errors: [] });
    await pending;
    await run();
    expect(preparePreview).toHaveBeenCalledTimes(2);
  });

  it('discards a preview if settings changed while loading', async () => {
    let resolve!: (value: unknown) => void;
    (preparePreview as jest.Mock).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const settings = mergeSettings();
    const pending = previewCalendarSync(app, settings)();
    settings.caldav.calendar = 'https://example.com/other/';
    resolve({ ok: false, errors: [] });
    await pending;
    expect(SyncPreviewModal).not.toHaveBeenCalled();
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('inzwischen geändert'));
  });
});
