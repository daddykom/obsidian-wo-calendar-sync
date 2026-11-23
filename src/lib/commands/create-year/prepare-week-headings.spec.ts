import { stringifyWo } from '../../parseWeekFile/stringify-wo';
import { DEFAULT_SETTINGS } from '../../settings/constants';
import { prepareData } from './prepare-data';
import { prepareWeeks } from './prepare-weeks';

describe('generated week headings', () => {
  it('generates distinct dated headings for every week, including year and month boundaries', () => {
    const previousYear = prepareData(2025);
    const weeks = prepareData(2026);
    const nextYear = prepareData(2027);
    const result = prepareWeeks(
      2026,
      [previousYear[previousYear.length - 1], ...weeks, nextYear[0]],
      DEFAULT_SETTINGS,
    );
    const generated = result.filter((week) => week !== null);

    expect(generated).toHaveLength(53);
    expect(generated[0][0]).toBe('W01 29.12.25.md');
    expect(stringifyWo(generated[0][1])).toBe(
      [
        '# Montag (29)',
        '',
        '# Dienstag (30)',
        '',
        '# Mittwoch (31)',
        '',
        '# Donnerstag (1)',
        '',
        '# Freitag (2)',
        '',
        '# Samstag (3)',
        '',
        '# Sonntag (4)',
        '',
        '[[week-calendar/2025/weeks/W52 22.12.25.md|W52]] [[week-calendar/2026/weeks/W02 05.01.26.md|W02]]',
      ].join('\n'),
    );
    expect(stringifyWo(generated[1][1])).toContain('# Montag (5)');
    expect(stringifyWo(generated[13][1])).toContain('# Donnerstag (2)');
    expect(generated[52][0]).toBe('W53 28.12.26.md');
    expect(stringifyWo(generated[52][1])).toContain('# Sonntag (3)');
  });
});
