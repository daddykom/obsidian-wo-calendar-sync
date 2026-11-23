import { App, Notice, TFile } from 'obsidian';
import { DEFAULT_SETTINGS } from '../settings/constants';
import { migrateAllWeekHeadings } from './migrate-week-headings';

jest.mock('obsidian', () => ({ Notice: jest.fn() }));

const weekPath = 'week-calendar/2026/weeks/W48 23.11.26.md';

function createApp(contents: Record<string, string>, migratingFiles = new Set<string>()) {
  const notes = new Map(Object.entries(contents));
  const app = {
    vault: {
      getMarkdownFiles: jest.fn(() => [...notes.keys()].map((path) => ({ path }) as TFile)),
      read: jest.fn(async (file: TFile) => notes.get(file.path)!),
      process: jest.fn(async (file: TFile, transform: (content: string) => string) => {
        expect(migratingFiles.has(file.path)).toBe(true);
        const content = transform(notes.get(file.path)!);
        notes.set(file.path, content);
        return content;
      }),
    },
  };
  return { app, notes, migratingFiles };
}

describe('migrateAllWeekHeadings', () => {
  beforeEach(() => jest.clearAllMocks());

  it('migrates only week files and leaves appointments and other notes unchanged', async () => {
    const original = '# Montag\n- Termin: Besprechung\n  ^woev-abc123\n';
    const { app, notes, migratingFiles } = createApp({
      [weekPath]: original,
      'week-calendar/2026/weeks/W49 30.11.26.md': '# Montag (30)',
      'week-calendar/2026/Übersicht.md': '# Montag',
      'week-calendar/events/Termin.md': '# Montag',
      'other/2026/weeks/W48 23.11.26.md': '# Montag',
    });

    const command = migrateAllWeekHeadings(app as unknown as App, DEFAULT_SETTINGS, migratingFiles);
    await command();

    expect(notes.get(weekPath)).toBe(original.replace('# Montag', '# Montag (23)'));
    expect(notes.get('week-calendar/2026/Übersicht.md')).toBe('# Montag');
    expect(notes.get('week-calendar/events/Termin.md')).toBe('# Montag');
    expect(notes.get('other/2026/weeks/W48 23.11.26.md')).toBe('# Montag');
    expect(app.vault.read).toHaveBeenCalledTimes(2);
    expect(app.vault.process).toHaveBeenCalledTimes(1);
    expect(migratingFiles.size).toBe(0);
    expect(Notice).toHaveBeenLastCalledWith(
      'Monatstage: 2 Wochen-Dateien geprüft, 1 angepasst, 0 Fehler.',
    );

    await command();

    expect(app.vault.process).toHaveBeenCalledTimes(1);
    expect(Notice).toHaveBeenLastCalledWith(
      'Monatstage: 2 Wochen-Dateien geprüft, 0 angepasst, 0 Fehler.',
    );
  });

  it('uses the configured calendar folder and weekday names', async () => {
    const path = 'Plans [private]/Calendar/2026/weeks/W48 23.11.26.md';
    const { app, notes, migratingFiles } = createApp({ [path]: '# Jour férié' });
    const settings = {
      ...DEFAULT_SETTINGS,
      paths: { ...DEFAULT_SETTINGS.paths, weekFolder: 'Plans [private]/Calendar' },
      weekdays: { ...DEFAULT_SETTINGS.weekdays, monday: 'Jour férié' },
    };

    await migrateAllWeekHeadings(app as unknown as App, settings, migratingFiles)();

    expect(notes.get(path)).toBe('# Jour férié (23)');
  });

  it('transforms the latest content instead of overwriting concurrent edits', async () => {
    const { app, notes, migratingFiles } = createApp({ [weekPath]: '# Montag' });
    app.vault.read.mockImplementationOnce(async () => {
      notes.set(weekPath, '# Montag\nNeue Notiz');
      return '# Montag';
    });

    await migrateAllWeekHeadings(app as unknown as App, DEFAULT_SETTINGS, migratingFiles)();

    expect(notes.get(weekPath)).toBe('# Montag (23)\nNeue Notiz');
  });

  it('continues after a failed write, reports it and clears the suppression marker', async () => {
    const secondPath = 'week-calendar/2026/weeks/W49 30.11.26.md';
    const { app, notes, migratingFiles } = createApp({
      [weekPath]: '# Montag',
      [secondPath]: '# Montag',
    });
    app.vault.process.mockRejectedValueOnce(new Error('Write failed'));
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await migrateAllWeekHeadings(app as unknown as App, DEFAULT_SETTINGS, migratingFiles)();

      expect(notes.get(weekPath)).toBe('# Montag');
      expect(notes.get(secondPath)).toBe('# Montag (30)');
      expect(migratingFiles.size).toBe(0);
      expect(Notice).toHaveBeenLastCalledWith(
        'Monatstage: 2 Wochen-Dateien geprüft, 1 angepasst, 1 Fehler.',
      );
    } finally {
      errorLog.mockRestore();
    }
  });

  it('reports an empty calendar without writing anything', async () => {
    const { app, migratingFiles } = createApp({});

    await migrateAllWeekHeadings(app as unknown as App, DEFAULT_SETTINGS, migratingFiles)();

    expect(app.vault.process).not.toHaveBeenCalled();
    expect(Notice).toHaveBeenLastCalledWith(
      'Monatstage: 0 Wochen-Dateien geprüft, 0 angepasst, 0 Fehler.',
    );
  });

  it('does not run two migrations concurrently', async () => {
    const { app, migratingFiles } = createApp({ [weekPath]: '# Montag' });
    let finishRead!: (content: string) => void;
    app.vault.read.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        finishRead = resolve;
      }),
    );
    const command = migrateAllWeekHeadings(app as unknown as App, DEFAULT_SETTINGS, migratingFiles);

    const first = command();
    await command();

    expect(Notice).toHaveBeenCalledWith('Die Ergänzung der Monatstage läuft bereits.');
    expect(app.vault.getMarkdownFiles).toHaveBeenCalledTimes(1);
    finishRead('# Montag');
    await first;
    expect(app.vault.process).toHaveBeenCalledTimes(1);
  });
});
