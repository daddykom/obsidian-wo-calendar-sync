import { mergeSettings } from '../settings/load-settings';
import { parseWeekEvents } from './parse-week-events';
import { parseWoWithDiagnostics } from '../parseWeekFile/parse-wo';
import { processFile } from '../commands/process-file';
import type { TFile } from 'obsidian';

const settings = mergeSettings();
const path = 'week-calendar/2026/weeks/W48 23.11.26.md';
const appointment = (fields = '', title = 'Besprechung') =>
  `# Montag (23)\n- Termin: ${title}\n${fields}  ^woev-abc123\n`;

describe('parseWeekEvents', () => {
  it('normalizes the exact events and IDs recognized by the shared parser', () => {
    const content = '# Montag (23)\n- Termin: Erstes\n  Zeit: 09:00\n# Dienstag (24)\n- Termin: Zweites\n';
    const processed = processFile(content, { path } as TFile, settings);
    const parsed = parseWoWithDiagnostics(processed, settings);
    const result = parseWeekEvents(processed, path, settings);
    expect(result.errors).toEqual([]);
    expect(result.events.map((event) => [event.localId, event.title, event.sourceLine]))
      .toEqual(parsed.events.map((event) => [event.element.eventId, event.title, event.line]));
  });
  it('normalizes title, location, time, description and reminders', () => {
    const result = parseWeekEvents(appointment([
      '  Zeit: 09:30 - 10:45', '  Ort: Büro', '  Erinnerung: 1d, 3h, 20m, 20m',
      '  Bemerkung:', '    Unterlagen mitbringen', '',
    ].join('\n')), path, settings);
    expect(result.errors).toEqual([]);
    expect(result.events).toEqual([{
      uid: 'abc123-2026-11-23@week-calendart', localId: 'abc123',
      sourcePath: path, sourceLine: 2, title: 'Besprechung', date: '2026-11-23',
      allDay: false, start: '2026-11-23T09:30:00', end: '2026-11-23T10:45:00',
      location: 'Büro', description: 'Bemerkung:\nUnterlagen mitbringen',
      reminderMinutes: [20, 180, 1440],
    }]);
  });

  it('uses an exclusive next-day end for all-day appointments', () => {
    const result = parseWeekEvents(appointment(), path, settings);
    expect(result.errors).toEqual([]);
    expect(result.events[0]).toMatchObject({ allDay: true, start: '2026-11-23', end: '2026-11-24' });
  });

  it('uses 60 minutes for a single time, including across midnight', () => {
    const result = parseWeekEvents(appointment('  Zeit: 23:30\n'), path, settings);
    expect(result.errors).toEqual([]);
    expect(result.events[0]).toMatchObject({ start: '2026-11-23T23:30:00', end: '2026-11-24T00:30:00' });
  });

  it('supports short hour notation and an en dash', () => {
    const result = parseWeekEvents(appointment('  Zeit: 9:00 – 10:00\n'), path, settings);
    expect(result.errors).toEqual([]);
    expect(result.events[0].start).toBe('2026-11-23T09:00:00');
  });

  it('uses configured literal prefixes and weekday names', () => {
    const custom = mergeSettings({
      paths: { weekFolder: 'Plans [private]/Calendar' },
      weekdays: { monday: 'Monday' },
      prefixes: { event: 'Meeting [work]', time: 'When', location: 'Where', reminder: 'Alert' },
    });
    const result = parseWeekEvents(
      '# Monday (23)\n- Meeting [work]: Title\n  When: 10:00\n  Where: Home\n  Alert: 5m\n  ^woev-x1',
      'Plans [private]/Calendar/2026/weeks/W48 23.11.26.md', custom,
    );
    expect(result.errors).toEqual([]);
    expect(result.events[0]).toMatchObject({ title: 'Title', location: 'Home', reminderMinutes: [5] });
  });

  it('uses ISO week years at year boundaries', () => {
    const result = parseWeekEvents(
      '# Montag (29)\n- Termin: Altjahr\n  ^woev-old\n# Sonntag (4)\n- Termin: Neujahr\n  ^woev-new',
      'week-calendar/2026/weeks/W01 29.12.25.md', settings,
    );
    expect(result.errors).toEqual([]);
    expect(result.events.map((event) => event.date)).toEqual(['2025-12-29', '2026-01-04']);
  });

  it('keeps wall-clock times unchanged over a daylight saving transition', () => {
    const result = parseWeekEvents(
      '# Sonntag (29)\n- Termin: Frühstück\n  Zeit: 09:00\n  ^woev-dst',
      'week-calendar/2026/weeks/W13 23.03.26.md', settings,
    );
    expect(result.errors).toEqual([]);
    expect(result.events[0].start).toBe('2026-03-29T09:00:00');
  });

  it('collects recurrence occurrences and exceptions without generating new occurrences', () => {
    const content = [
      '# Montag (23)', '- Termin: Serie', '  Wiederholung: täglich',
      '  WiederholungEnde: 31.12.2026', '  ^woev-shared', '  ^woev-rec-series',
      '# Dienstag (24)', '- Termin: Ausnahme', '  AusnahmeVon: ^woev-shared',
      '  ^woev-exception',
    ].join('\n');
    const result = parseWeekEvents(content, path, settings);
    expect(result.errors).toEqual([]);
    expect(result.events).toHaveLength(2);
    expect(result.events.map((event) => event.localId)).toEqual(['shared', 'exception']);
    expect(result.events.map((event) => event.description)).toEqual(['', '']);
  });

  it('ignores frontmatter, code examples and ordinary notes', () => {
    const content = [
      '---', 'example: text', '- Termin: YAML example', '---',
      '# Montag (23)', '- Einkaufen', '  Milch',
      '```md', '- Termin: Example', '  ^woev-example', '```', appointment(),
    ].join('\n').replace(appointment(), '- Termin: Echt\n  ^woev-real');
    const result = parseWeekEvents(content, path, settings);
    expect(result.errors).toEqual([]);
    expect(result.events.map((event) => event.title)).toEqual(['Echt']);
  });

  it.each([
    'week-calendar/2026/weeks/W48 24.11.26.md',
    'week-calendar/2026/weeks/W48 23.11.25.md',
    'week-calendar/2025/weeks/W53 29.12.25.md',
    'week-calendar/2026/weeks/W00 23.11.26.md',
    'week-calendar/2026/weeks/W54 23.11.26.md',
    'other/2026/weeks/W48 23.11.26.md',
  ])('rejects invalid week filenames: %s', (filePath) => {
    const result = parseWeekEvents(appointment(), filePath, settings);
    expect(result.events).toEqual([]);
    expect(result.errors).toHaveLength(1);
  });

  it.each(['24:00', '12:60', '', '10:00 - 09:00', '10:00 - 10:00', '10:00 - 11:00 - 12:00'])
    ('rejects invalid or ambiguous time: %s', (time) => {
      const result = parseWeekEvents(appointment(`  Zeit: ${time}\n`), path, settings);
      expect(result.events).toEqual([]);
      expect(result.errors[0]).toMatchObject({ path, line: 2 });
    });

  it.each(['', 'tomorrow', '0m', '-5m', '1h,', '9999999999999999999d'])
    ('rejects invalid reminders: %s', (reminder) => {
      const result = parseWeekEvents(appointment(`  Erinnerung: ${reminder}\n`), path, settings);
      expect(result.events).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
    });

  it.each([
    '# Montag (23)\n- Termin: Titel',
    '# Montag (23)\n- Termin: Titel\n  ^woev-rec-series',
    '# Montag (23)\n- Termin: Titel\n  AusnahmeVon: ^woev-original',
    '# Montag (23)\n- Termin: Titel\n  ^woev-a\n  ^woev-b',
    '# Montag (23)\n- Termin: Titel\n  ^woev-bad-id',
    '# Montag (23)\n- Termin: \n  ^woev-a',
    '- Termin: Titel\n  ^woev-a',
    '# Unbekannt\n- Termin: Titel\n  ^woev-a',
    '# Montag (23)\n-Termin: Titel\n  ^woev-a',
    '# Montag (23)\n- Termin Titel\n  ^woev-a',
    '# Montag (23)\n- Termin: Titel\n  Zeit: 09:00\n  Zeit: 10:00\n  ^woev-a',
    '# Montag (23)\n- Termin: Titel\n  ^woev-a\n  - Termin: Versteckt',
  ])('reports malformed or incomplete appointments instead of silently skipping them', (content) => {
    const result = parseWeekEvents(content, path, settings);
    expect(result.events).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it.each([
    appointment().replace('(23)', '(24)'),
    appointment() + '# Montag (23)',
    '---\nnot closed',
    '# Montag (23)\n```md\nnot closed',
  ])('reports ambiguous document structure', (content) => {
    expect(parseWeekEvents(content, path, settings).errors.length).toBeGreaterThan(0);
  });

  it('supports CRLF line endings', () => {
    const result = parseWeekEvents(appointment().replace(/\n/g, '\r\n'), path, settings);
    expect(result.errors).toEqual([]);
    expect(result.events).toHaveLength(1);
  });
});
