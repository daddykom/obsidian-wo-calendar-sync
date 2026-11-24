import type { TFile } from 'obsidian';
import { mergeSettings } from '../settings/load-settings';
import { collectEvents } from './collect-events';

const settings = mergeSettings();
const path = 'week-calendar/2026/weeks/W48 23.11.26.md';
const content = '# Montag (23)\n- Termin: Treffen\n  ^woev-abc';

function createVault(notes: Record<string, string>) {
  return {
    getMarkdownFiles: () => Object.keys(notes).map((path) => ({ path }) as TFile),
    read: jest.fn(async (file: TFile) => notes[file.path]),
  };
}

describe('collectEvents', () => {
  it('reads all years, including the past, but not overviews, events or other folders', async () => {
    const vault = createVault({
      [path]: content,
      'week-calendar/2024/weeks/W01 01.01.24.md': '# Montag (1)\n- Termin: Alt\n  ^woev-old',
      'week-calendar/2026/Übersicht.md': content,
      'week-calendar/events/Termin.md': content,
      'other/2026/weeks/W48 23.11.26.md': content,
    });
    const result = await collectEvents(vault, settings);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected valid collection');
    expect(result.scannedFiles).toBe(2);
    expect(result.events.map((event) => event.title)).toEqual(['Alt', 'Treffen']);
    expect(vault.read).toHaveBeenCalledTimes(2);
  });

  it('does not expose a partial snapshot if one appointment is invalid', async () => {
    const result = await collectEvents(createVault({ [path]: content + '\n- Termin: Ohne ID' }), settings);
    expect(result.ok).toBe(false);
    expect(result).not.toHaveProperty('events');
    if (result.ok) throw new Error('Expected invalid collection');
    expect(result.errors[0]).toMatchObject({ path, line: 4 });
  });

  it('reports invalid week filenames instead of silently ignoring them', async () => {
    const result = await collectEvents(createVault({
      [path]: content,
      'week-calendar/2026/weeks/W48 wrong.md': content,
    }), settings);
    expect(result.ok).toBe(false);
    expect(result.scannedFiles).toBe(2);
    expect(result).not.toHaveProperty('events');
  });

  it('reports unreadable files without returning a partial snapshot', async () => {
    const vault = createVault({ [path]: content });
    vault.read.mockRejectedValueOnce(new Error('read failed'));
    const result = await collectEvents(vault, settings);
    expect(result).toMatchObject({ ok: false, scannedFiles: 1, errors: [{ path }] });
    expect(result).not.toHaveProperty('events');
  });

  it('rejects duplicate identities on the same date', async () => {
    const result = await collectEvents(createVault({
      [path]: content + '\n- Termin: Andere Uhrzeit\n  Zeit: 10:00\n  ^woev-abc',
    }), settings);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected duplicate error');
    expect(result.errors[0].message).toContain('Doppelte Termin-ID');
  });

  it('allows shared series ids on different dates, with distinct stable uids', async () => {
    const vault = createVault({ [path]: content + '\n# Dienstag (24)\n- Termin: Serie\n  ^woev-abc' });
    const first = await collectEvents(vault, settings);
    const second = await collectEvents(vault, settings);
    expect(first).toEqual(second);
    if (!first.ok) throw new Error('Expected valid collection');
    expect(new Set(first.events.map((event) => event.uid)).size).toBe(2);
  });

  it('returns an explicitly empty snapshot without writing anything', async () => {
    expect(await collectEvents(createVault({}), settings)).toEqual({
      ok: true, scannedFiles: 0, events: [],
    });
  });
});
