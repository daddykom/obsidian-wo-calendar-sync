import { Notice, TAbstractFile } from 'obsidian';
import { Subject } from 'rxjs';
import { memoryCalendarVault } from '../test-helpers/memory-calendar-vault';
import { mergeSettings } from '../settings/load-settings';
import { watchWeekFiles, affectsWeekFiles } from './watch-week-files';
import { createAutomaticSyncCoordinator } from '../sync/automatic-sync-coordinator';
import { parseWo } from '../parseWeekFile/parse-wo';
import { EventElement } from '../types';

jest.mock('obsidian', () => ({ TFile: class {}, Notice: jest.fn() }));

const path = 'week-calendar/2026/weeks/W48 23.11.26.md';
const nextPath = 'week-calendar/2026/weeks/W49 30.11.26.md';
const original = '# Montag (23)\n- Termin: Treffen\n';
const next = '# Montag (30)\n- Termin: Weiteres Treffen\n';

describe('vault changes, local processing and automatic quiet time', () => {
  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(0); jest.clearAllMocks(); });
  afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

  const setup = (initial: Record<string, string> = { [path]: original }, autoSync = true) => {
    const memory = memoryCalendarVault(initial);
    const settings = mergeSettings({ caldav: {
      autoSync, url: 'https://example.com/', username: 'user', password: 'secret',
      calendar: 'https://example.com/calendar/', managedCalendarConfirmed: true,
    } });
    const run = jest.fn().mockResolvedValue({ status: 'synced' });
    const status = jest.fn();
    const active = new Subject<unknown>();
    const ignored = new Set<string>();
    const coordinator = createAutomaticSyncCoordinator(settings, run, status);
    const subscription = watchWeekFiles(memory.app, settings, active, ignored, coordinator);
    const dispose = () => { subscription.unsubscribe(); coordinator.dispose(); };
    return { ...memory, settings, run, status, active, ignored, coordinator, dispose };
  };

  it('adds IDs before syncing, and self-writes settle without an endless feedback loop', async () => {
    const test = setup();
    test.change(path, original);
    await jest.advanceTimersByTimeAsync(499);
    expect(test.vault.process).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(test.notes.get(path)).toMatch(/\^woev-/);
    await jest.advanceTimersByTimeAsync(4999);
    expect(test.run).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(test.run).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(60000);
    expect(test.run).toHaveBeenCalledTimes(1);
    expect(test.vault.process).toHaveBeenCalledTimes(1);
    expect(Notice).not.toHaveBeenCalled();
    test.dispose();
  });

  it('processes all rapidly edited files instead of dropping the first one', async () => {
    const test = setup({ [path]: original, [nextPath]: next });
    test.change(path, original);
    await jest.advanceTimersByTimeAsync(100);
    test.change(nextPath, next);
    await jest.advanceTimersByTimeAsync(6500);
    expect(test.notes.get(path)).toMatch(/\^woev-/);
    expect(test.notes.get(nextPath)).toMatch(/\^woev-/);
    expect(test.run).toHaveBeenCalledTimes(1);
    test.dispose();
  });

  it('updates an existing appointment even when no new ID needs to be inserted', async () => {
    const test = setup({ [path]: original + '  ^woev-existing\n' });
    test.change(path, '# Montag (23)\n- Termin: Neuer Titel\n  ^woev-existing\n');
    await jest.advanceTimersByTimeAsync(5000);
    expect(test.run).toHaveBeenCalledTimes(1);
    expect(test.vault.process).not.toHaveBeenCalled();
    test.dispose();
  });

  it('uses the atomic current contents instead of overwriting an edit made after the initial read', async () => {
    const test = setup();
    const process = test.vault.process.getMockImplementation()!;
    test.vault.process.mockImplementationOnce(async (file, transform) => {
      test.notes.set(file.path, original + '\nEigene neue Notiz');
      return process(file, transform);
    });
    test.change(path, original);
    await jest.advanceTimersByTimeAsync(6500);
    expect(test.notes.get(path)).toContain('Eigene neue Notiz');
    expect(test.notes.get(path)).toMatch(/\^woev-/);
    expect(test.run).toHaveBeenCalledTimes(1);
    test.dispose();
  });

  it('does not bypass the five-second quiet period when changing the active note', async () => {
    const test = setup({ [path]: original + '  ^woev-existing\n' });
    test.change(path, test.notes.get(path)!);
    test.active.next(null);
    await jest.advanceTimersByTimeAsync(4999);
    expect(test.run).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(test.run).toHaveBeenCalledTimes(1);
    test.dispose();
  });

  it('handles creation, deletion, and moving a week note out of the folder', async () => {
    const test = setup({});
    test.add(path, original);
    await jest.advanceTimersByTimeAsync(6500);
    expect(test.run).toHaveBeenCalledTimes(1);
    test.rename(path, 'Archive/note.md');
    await jest.advanceTimersByTimeAsync(5000);
    expect(test.run).toHaveBeenCalledTimes(2);
    test.add(nextPath, next);
    test.remove(nextPath);
    await jest.advanceTimersByTimeAsync(5000);
    expect(test.run).toHaveBeenCalledTimes(3);
    test.dispose();
  });

  it('does not schedule ignored migration writes or unrelated note changes', async () => {
    const test = setup({ [path]: original, 'notes/other.md': 'Notiz' });
    await jest.advanceTimersByTimeAsync(0);
    test.vault.read.mockClear();
    test.ignored.add(path);
    test.change(path, original);
    test.change('notes/other.md', 'Neu');
    await jest.advanceTimersByTimeAsync(20000);
    expect(test.run).not.toHaveBeenCalled();
    expect(test.vault.read).not.toHaveBeenCalled();
    test.dispose();
  });

  it('processes notes inside a moved-in week folder before syncing', async () => {
    const test = setup();
    await jest.advanceTimersByTimeAsync(0);
    test.emit('rename', { path: 'week-calendar/2026/weeks' } as TAbstractFile, 'Inbox/weeks');
    await jest.advanceTimersByTimeAsync(6500);
    expect(test.notes.get(path)).toMatch(/\^woev-/);
    expect(test.run).toHaveBeenCalledTimes(1);
    test.dispose();
  });

  it('keeps ordinary local processing but makes no automatic server calls when disabled', async () => {
    const test = setup({ [path]: original }, false);
    test.change(path, original);
    await jest.advanceTimersByTimeAsync(20000);
    expect(test.notes.get(path)).toMatch(/\^woev-/);
    expect(test.run).not.toHaveBeenCalled();
    test.dispose();
  });

  it('prevents automatic sync after a failed local read and can recover on a new edit', async () => {
    const test = setup();
    await jest.advanceTimersByTimeAsync(0);
    test.vault.read.mockRejectedValueOnce(new Error('read failed'));
    test.change(path, original);
    await jest.advanceTimersByTimeAsync(10000);
    expect(test.run).not.toHaveBeenCalled();
    expect(test.status).toHaveBeenLastCalledWith('error');
    test.change(path, original);
    await jest.advanceTimersByTimeAsync(6500);
    expect(test.run).toHaveBeenCalledTimes(1);
    test.dispose();
  });

  it('finishes recurring propagation first, preserving occurrence IDs and exceptions', async () => {
    const series = '# Montag (23)\n- Termin: Neu\n  Wiederholung: wöchentlich, Mo\n  WiederholungEnde: 31.12.2026\n  ^woev-a\n  ^woev-rec-series';
    const future = '# Montag (30)\n- Termin: Alt\n  Wiederholung: wöchentlich, Mo\n  WiederholungEnde: 31.12.2026\n  ^woev-b\n  ^woev-rec-series\n# Dienstag (1)\n- Termin: Ausnahme\n  AusnahmeVon: ^woev-series\n  ^woev-exception\n  ^woev-rec-series';
    const test = setup({ [path]: series.replace('Neu', 'Alt'), [nextPath]: future });
    await jest.advanceTimersByTimeAsync(0);
    test.change(path, series);
    await jest.advanceTimersByTimeAsync(6500);
    const parsed = parseWo(test.notes.get(nextPath)!);
    expect(parsed.monday[1]).toMatchObject({ eventId: 'b', content: expect.arrayContaining(['- Termin: Neu', '  ^woev-b']) });
    expect(parsed.tuesday[1]).toMatchObject({ eventId: 'exception', isException: true });
    expect((parsed.tuesday[1] as EventElement).content).toContain('- Termin: Ausnahme');
    expect(test.run).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(60000);
    expect(test.run).toHaveBeenCalledTimes(1);
    test.dispose();
  });

  const occurrence = (heading: string, title: string, id: string) =>
    `# ${heading}\n- Termin: ${title}\n  Wiederholung: wöchentlich, Mo, Di\n  WiederholungEnde: 31.12.2026\n  ^woev-${id}\n  ^woev-rec-series\n`;

  it('does not let a stale same-series occurrence undo an earlier edit in the same note', async () => {
    const monday = occurrence('Montag (23)', 'Alt', 'a');
    const tuesday = occurrence('Dienstag (24)', 'Alt', 'b');
    const test = setup({ [path]: monday + tuesday, [nextPath]: occurrence('Montag (30)', 'Alt', 'c') });
    await jest.advanceTimersByTimeAsync(0);
    test.change(path, monday.replace('Alt', 'Neu') + tuesday);
    await jest.advanceTimersByTimeAsync(6500);
    expect(test.notes.get(path)).not.toContain('Termin: Alt');
    expect(test.notes.get(nextPath)).toContain('Termin: Neu');
    expect(test.notes.get(path)).toContain('^woev-b');
    expect(test.notes.get(nextPath)).toContain('^woev-c');
    expect(test.run).toHaveBeenCalledTimes(1);
    test.dispose();
  });

  it.each([true, false])('preserves independently edited later anchors (same note: %s)', async (sameNote) => {
    const monday = occurrence('Montag (23)', 'Alt', 'a');
    const tuesday = occurrence('Dienstag (24)', 'Alt', 'b');
    const future = occurrence('Montag (30)', 'Alt', 'c');
    const laterPath = 'week-calendar/2026/weeks/W50 07.12.26.md';
    const test = setup({ [path]: monday + (sameNote ? tuesday : ''), [nextPath]: future,
      [laterPath]: occurrence('Montag (7)', 'Alt', 'd') });
    await jest.advanceTimersByTimeAsync(0);
    test.change(path, monday.replace('Alt', 'Montag neu') + (sameNote ? tuesday.replace('Alt', 'Später neu') : ''));
    if (!sameNote) test.change(nextPath, future.replace('Alt', 'Später neu'));
    await jest.advanceTimersByTimeAsync(7000);
    expect(test.notes.get(path)).toContain('Termin: Montag neu');
    expect(test.notes.get(sameNote ? path : nextPath)).toContain('Termin: Später neu');
    expect(test.notes.get(laterPath)).toContain('Termin: Später neu');
    expect(test.run).toHaveBeenCalledTimes(1);
    test.dispose();
  });

  it('waits for an in-flight local read and ignores it after unload', async () => {
    const test = setup();
    await jest.advanceTimersByTimeAsync(0);
    let resolve!: (content: string) => void;
    test.vault.read.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    test.change(path, original);
    await jest.advanceTimersByTimeAsync(10000);
    expect(test.run).not.toHaveBeenCalled();
    test.dispose();
    const count = test.status.mock.calls.length;
    resolve(original);
    await jest.advanceTimersByTimeAsync(10000);
    expect(test.vault.process).not.toHaveBeenCalled();
    expect(test.run).not.toHaveBeenCalled();
    expect(test.status).toHaveBeenCalledTimes(count);
  });

  it('cleans up vault subscriptions and timers when unloaded', async () => {
    const test = setup();
    test.change(path, original);
    test.dispose();
    await jest.advanceTimersByTimeAsync(20000);
    test.change(path, original);
    await jest.advanceTimersByTimeAsync(20000);
    expect(test.run).not.toHaveBeenCalled();
    expect(test.vault.process).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it.each([
    ['week-calendar/2026/weeks/W48 23.11.26.md', true],
    ['week-calendar/2026/weeks/W00 invalid.md', true],
    ['week-calendar/2026/weeks', true],
    ['week-calendar/2026', true],
    ['week-calendar', true],
    ['week-calendar/2026/Übersicht.md', false],
    ['week-calendar/events/event.md', false],
    ['other/week-calendar/2026/weeks/W48 23.11.26.md', false],
  ])('recognizes affected week paths and parent folders: %s', (filePath, expected) => {
    expect(affectsWeekFiles(filePath, 'week-calendar')).toBe(expected);
  });
});
