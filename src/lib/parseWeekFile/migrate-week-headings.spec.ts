import { DEFAULT_SETTINGS } from '../settings/constants';
import { migrateWeekHeadings } from './migrate-week-headings';

describe('migrateWeekHeadings', () => {
  const path = 'week-calendar/2026/weeks/W48 23.11.26.md';
  const content = [
    '# Montag',
    '- Termin: Besprechung',
    '  Zeit: 10:00',
    '  ^woev-abc123',
    '',
    '# Dienstag (24)',
    '- Termin: Serie',
    '  Wiederholung: wöchentlich',
    '  ^woev-def456',
    '  ^woev-rec-series123',
    '  AusnahmeVon: ^woev-original123',
    '',
    '# Eigene Notizen',
    'Freitext bleibt erhalten.  ',
    '# Mittwoch (1)',
    '# Donnerstag',
    '# Freitag',
    '# Samstag',
    '# Sonntag',
    '# Links',
    '[[Vorige Woche]] [[Nächste Woche]]',
    '',
  ].join('\n');
  const expected = content
    .replace('# Montag\n', '# Montag (23)\n')
    .replace('# Mittwoch (1)', '# Mittwoch (25)')
    .replace('# Donnerstag', '# Donnerstag (26)')
    .replace('# Freitag', '# Freitag (27)')
    .replace('# Samstag', '# Samstag (28)')
    .replace('# Sonntag', '# Sonntag (29)');

  it('updates only weekday headings in a mixture of old and dated sections', () => {
    expect(migrateWeekHeadings(content, path, DEFAULT_SETTINGS)).toBe(expected);
  });

  it('does not change an already migrated file on subsequent runs', () => {
    const migrated = migrateWeekHeadings(content, path, DEFAULT_SETTINGS);
    expect(migrateWeekHeadings(migrated, path, DEFAULT_SETTINGS)).toBe(migrated);
    expect(migrateWeekHeadings(expected, path, DEFAULT_SETTINGS)).toBe(expected);
  });

  it('preserves CRLF line endings and trailing whitespace outside headings', () => {
    expect(migrateWeekHeadings(content.replace(/\n/g, '\r\n'), path, DEFAULT_SETTINGS))
      .toBe(expected.replace(/\n/g, '\r\n'));
  });

  it.each([
    ['week-calendar/2026/weeks/W14 30.03.26.md', '# Mittwoch', '# Mittwoch (1)'],
    ['week-calendar/2026/weeks/W01 29.12.25.md', '# Donnerstag', '# Donnerstag (1)'],
    ['week-calendar/2024/weeks/W09 26.02.24.md', '# Donnerstag', '# Donnerstag (29)'],
  ])('handles month, ISO-year and leap-day boundaries in %s', (filePath, heading, dated) => {
    expect(migrateWeekHeadings(heading, filePath, DEFAULT_SETTINGS)).toBe(dated);
  });

  it.each([
    'other/2026/weeks/W48 23.11.26.md',
    'week-calendar/2026/Übersicht.md',
    'week-calendar/events/W48 23.11.26.md',
    'week-calendar/2026/weeks/W00 23.11.26.md',
    'week-calendar/2026/weeks/W54 23.11.26.md',
    'week-calendar/2026/weeks/W48 24.11.26.md',
    'week-calendar/2026/weeks/W48 31.02.26.md',
    'week-calendar/2026/weeks/W48 23.13.26.md',
    'week-calendar/2026/weeks/W48 23.11.26.txt',
  ])('leaves files with an unsupported path or invalid Monday unchanged: %s', (filePath) => {
    expect(migrateWeekHeadings(content, filePath, DEFAULT_SETTINGS)).toBe(content);
  });

  it('supports configured paths and weekday names', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      paths: { ...DEFAULT_SETTINGS.paths, weekFolder: 'Plans [private]/Calendar' },
      weekdays: { ...DEFAULT_SETTINGS.weekdays, monday: 'Jour férié' },
    };
    expect(migrateWeekHeadings(
      '# Jour férié\nNotizen',
      'Plans [private]/Calendar/2026/weeks/W48 23.11.26.md',
      settings,
    )).toBe('# Jour férié (23)\nNotizen');
  });

  it.each(['```', '~~~~'])('preserves headings inside fenced code using %s', (fence) => {
    const source = `${fence}markdown\n# Montag\n${fence}\n# Montag`;
    expect(migrateWeekHeadings(source, path, DEFAULT_SETTINGS))
      .toBe(`${fence}markdown\n# Montag\n${fence}\n# Montag (23)`);
  });

  it('preserves YAML frontmatter containing heading-like lines', () => {
    const source = '---\ndescription: |\n# Montag\n---\n# Montag';
    expect(migrateWeekHeadings(source, path, DEFAULT_SETTINGS))
      .toBe('---\ndescription: |\n# Montag\n---\n# Montag (23)');
  });
});
