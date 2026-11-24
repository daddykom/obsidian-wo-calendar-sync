import { App, TFile } from 'obsidian';
import { Subject } from 'rxjs';
import { DEFAULT_SETTINGS } from '../settings/constants';
import { modifyWeekFileEvent } from './modify-week-file-event';

jest.mock('obsidian', () => ({
  TFile: class {},
  Notice: jest.fn(),
}));
jest.mock('../settings/constants', () => ({
  ...jest.requireActual('../settings/constants'),
  WO_FILE_REGEX: /^week-calendar\//,
}));

it('ignores migration writes before reading or scheduling automatic appointment processing', async () => {
  jest.useFakeTimers();
  const file = Object.assign(new TFile(), {
    path: 'week-calendar/2026/weeks/W48 23.11.26.md',
    extension: 'md',
  });
  const app = { vault: { read: jest.fn().mockResolvedValue('# Montag (23)'), getAbstractFileByPath: jest.fn(() => file), getMarkdownFiles: () => [] } };
  const modifications = new Subject<TFile>();
  const activeChanges = new Subject<unknown>();
  const migratingFiles = new Set([file.path]);
  const subscription = modifyWeekFileEvent(
    app as unknown as App,
    modifications,
    activeChanges,
    DEFAULT_SETTINGS,
    migratingFiles,
  );

  try {
    modifications.next(file);
    await jest.advanceTimersByTimeAsync(10000);
    expect(app.vault.read).not.toHaveBeenCalled();

    migratingFiles.delete(file.path);
    modifications.next(file);
    await jest.advanceTimersByTimeAsync(10000);
    expect(app.vault.read).toHaveBeenCalledWith(file);
  } finally {
    subscription.unsubscribe();
    jest.useRealTimers();
  }
});
