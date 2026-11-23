import { App, TFile } from 'obsidian';
import { parseWo } from '../parseWeekFile/parse-wo';
import { insertRecurringEventIntoFile } from '../recurrence/file-operations';
import { DEFAULT_SETTINGS } from '../settings/constants';
import { EventElement } from '../types';
import { prepareData } from './create-year/prepare-data';
import { prepareWeeks } from './create-year/prepare-weeks';
import { writeWeekFiles } from './create-year/write-week-files';
import { processFile } from './process-file';

jest.mock('obsidian', () => ({ TFile: class {}, Notice: jest.fn() }));

function createVault() {
  const notes = new Map<string, string>();
  const files = new Map<string, TFile>();
  const folders = new Set<string>();
  const app = {
    vault: {
      getAbstractFileByPath: (path: string) => files.get(path) ?? (folders.has(path) ? {} : null),
      createFolder: async (path: string) => {
        folders.add(path);
      },
      create: async (path: string, content: string) => {
        const file = Object.assign(new TFile(), { path });
        files.set(path, file);
        notes.set(path, content);
        return file;
      },
      read: async (file: TFile) => notes.get(file.path)!,
      modify: async (file: TFile, content: string) => {
        notes.set(file.path, content);
      },
    },
  } as unknown as App;
  return { app, notes, files };
}

describe('week heading workflow', () => {
  it('writes an entire new year with dated headings and preserves existing notes on regeneration', async () => {
    const { app, notes } = createVault();
    const previous = prepareData(2026);
    const current = prepareData(2027);
    const next = prepareData(2028);
    const weeks = prepareWeeks(
      2027,
      [previous[previous.length - 1], ...current, next[0]],
      DEFAULT_SETTINGS,
    );

    expect(await writeWeekFiles(2027, weeks, DEFAULT_SETTINGS, app)).toBe(0);
    expect(notes.size).toBe(52);
    expect(notes.get('week-calendar/2027/weeks/W01 04.01.27.md')).toContain('# Montag (4)');
    expect(notes.get('week-calendar/2027/weeks/W52 27.12.27.md')).toContain('# Sonntag (2)');

    for (const content of notes.values()) {
      expect(content.match(/^# .+ \(\d{1,2}\)$/gm)).toHaveLength(7);
    }

    const path = 'week-calendar/2027/weeks/W01 04.01.27.md';
    notes.set(path, notes.get(path)! + '\nEigene Notiz');
    const original = new Map(notes);

    expect(await writeWeekFiles(2027, weeks, DEFAULT_SETTINGS, app)).toBe(52);
    expect(notes).toEqual(original);
  });

  it('preserves dated headings through appointment processing and recurring-event insertion', async () => {
    const { app, notes, files } = createVault();
    const path = 'week-calendar/2027/weeks/W01 04.01.27.md';
    const original = '# Montag (4)\n- Termin: Besprechung\n  Zeit: 10:00\n# Dienstag (5)\n';
    await app.vault.create(path, original);
    const file = files.get(path)!;
    const processed = processFile(original, file, DEFAULT_SETTINGS);

    expect(processed).toContain('# Montag (4)');
    expect(processed).toContain('# Dienstag (5)');
    expect(processed).toMatch(/\^woev-[a-zA-Z0-9]+/);
    await app.vault.modify(file, processed);

    const recurring: EventElement = {
      type: 'event',
      eventId: 'abc123',
      recurrenceId: 'series123',
      content: [
        '- Termin: Serie',
        '  Wiederholung: wöchentlich',
        '  ^woev-abc123',
        '  ^woev-rec-series123',
      ],
    };
    await insertRecurringEventIntoFile(
      path,
      recurring,
      new Date(2027, 0, 5),
      DEFAULT_SETTINGS,
      app,
    );

    const content = notes.get(path)!;
    expect(content).toContain('# Montag (4)');
    expect(content).toContain('# Dienstag (5)');
    expect(parseWo(content).tuesday[1]).toMatchObject({
      eventId: 'abc123',
      recurrenceId: 'series123',
    });
    expect(processFile(content, file, DEFAULT_SETTINGS)).toBe('');
  });
});
