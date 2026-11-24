import { parseWo, parseWoWithDiagnostics } from './parse-wo';
import { stringifyWo } from './stringify-wo';
import { mergeSettings } from '../settings/load-settings';
import { processFile } from '../commands/process-file';
import type { TFile } from 'obsidian';

const settings = mergeSettings();

describe('shared weekly Markdown parser', () => {
  it('returns the same elements through both APIs, with source positions and parsed IDs', () => {
    const content = '# Montag (23)\n- Termin: Titel\n  Zeit: 09:00\n  ^woev-abc\n';
    const parsed = parseWoWithDiagnostics(content, settings);
    expect(parsed.elements).toEqual(parseWo(content, settings));
    expect(parsed.events).toHaveLength(1);
    expect(parsed.events[0]).toMatchObject({
      section: 'monday', line: 2, title: 'Titel', eventIds: ['abc'],
      element: { eventId: 'abc', content: ['- Termin: Titel', '  Zeit: 09:00', '  ^woev-abc'] },
    });
    expect(parsed.events[0].element).toBe(parsed.elements.monday[1]);
    expect(parsed.headings).toEqual([{ section: 'monday', line: 1, dayOfMonth: 23 }]);
    expect(parsed.diagnostics).toEqual([]);
    expect(stringifyWo(parsed.elements)).toBe(content);
  });

  it('does not create events from frontmatter, fenced examples or orphaned indentation', () => {
    const content = [
      '---', 'example:', '  text: value', '- Termin: YAML', '# Dienstag', '---',
      '# Montag (23)', '- Einkaufen', '  Milch',
      '```md', '# Dienstag', '- Termin: Beispiel', '  ^woev-example', '```',
      '- Termin: Echt', '  Zeit: 09:00', '',
    ].join('\n');
    const parsed = parseWoWithDiagnostics(content, settings);
    expect(parsed.events.map((event) => event.title)).toEqual(['Echt']);
    expect(parsed.events[0].section).toBe('monday');
    expect(parsed.headings).toHaveLength(1);
    expect(parsed.diagnostics).toEqual([]);
    expect(stringifyWo(parsed.elements)).toBe(content);

    const processed = processFile(content, { path: 'week-calendar/2026/weeks/W48 23.11.26.md' } as TFile, settings);
    expect(processed.match(/^  \^woev-/gm)).toHaveLength(2); // One example ID and one real ID.
    expect(processed).toContain('- Einkaufen\n  Milch\n```md');
  });

  it('handles literal custom prefixes consistently during ID insertion', () => {
    const custom = mergeSettings({ prefixes: { event: 'Meeting [work]' } });
    const content = '# Montag (23)\n- Meeting [work]: Titel\n';
    const processed = processFile(content, { path: 'week-calendar/2026/weeks/W48 23.11.26.md' } as TFile, custom);
    const parsed = parseWoWithDiagnostics(processed, custom);
    expect(parsed.events).toHaveLength(1);
    expect(parsed.events[0].eventIds).toHaveLength(1);
    expect(parsed.diagnostics).toEqual([]);
  });

  it('does not mistake a prefix substring for an appointment', () => {
    const parsed = parseWoWithDiagnostics('# Montag\n- Terminologie: Notiz', settings);
    expect(parsed.events).toEqual([]);
    expect(parsed.diagnostics).toEqual([]);
  });

  it('records unknown heading context without rearranging the original note', () => {
    const content = '# Montag\n# Notizen\n- Termin: Ohne Tag\n  ^woev-a';
    const parsed = parseWoWithDiagnostics(content, settings);
    expect(parsed.events[0].section).toBeNull();
    expect(parsed.headings[1]).toMatchObject({ section: null, line: 2 });
    expect(stringifyWo(parsed.elements)).toBe(content);
  });

  it('keeps exception references separate from occurrence IDs', () => {
    const content = '# Montag\n- Termin: Ausnahme\n  AusnahmeVon: ^woev-original\n  ^woev-actual\n  ^woev-rec-series';
    const parsed = parseWoWithDiagnostics(content, settings);
    expect(parsed.events[0]).toMatchObject({
      eventIds: ['actual'],
      element: { eventId: 'actual', recurrenceId: 'series', isException: true, exceptionOfRecurrenceId: 'original' },
    });
  });

  it('reports malformed syntax with source line numbers while preserving content', () => {
    const content = '# Montag\n-Termin: Fehler\n- Termin Ohne Doppelpunkt\n  ^woev-bad-id';
    const parsed = parseWoWithDiagnostics(content, settings);
    expect(parsed.diagnostics.map((diagnostic) => diagnostic.line)).toEqual([2, 3, 4]);
    expect(stringifyWo(parsed.elements)).toBe(content);
  });

  it('reports unclosed blocks without interpreting their contents as events', () => {
    const parsed = parseWoWithDiagnostics('# Montag\n~~~md\n- Termin: Beispiel', settings);
    expect(parsed.events).toEqual([]);
    expect(parsed.diagnostics).toEqual([{ line: 2, message: 'Codeblock ist nicht abgeschlossen.' }]);
  });
});
