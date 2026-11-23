import { DEFAULT_SETTINGS } from '../settings/constants';
import { formatDayHeading } from './format-day-heading';

describe('formatDayHeading', () => {
  const weekdays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  it.each([
    ['a regular week', new Date(2026, 10, 23), [23, 24, 25, 26, 27, 28, 29]],
    ['a month boundary', new Date(2026, 2, 30), [30, 31, 1, 2, 3, 4, 5]],
    ['an ISO week spanning two years', new Date(2025, 11, 29), [29, 30, 31, 1, 2, 3, 4]],
    ['a leap day', new Date(2024, 1, 26), [26, 27, 28, 29, 1, 2, 3]],
    ['a daylight saving boundary', new Date(2026, 9, 19), [19, 20, 21, 22, 23, 24, 25]],
  ])('formats all seven headings for %s', (_description, monday, monthDays) => {
    const headings = weekdays.map((weekday) =>
      formatDayHeading(monday, weekday, DEFAULT_SETTINGS.weekdays[weekday]),
    );

    expect(headings).toEqual(
      weekdays.map((weekday, index) =>
        `# ${DEFAULT_SETTINGS.weekdays[weekday]} (${monthDays[index]})`,
      ),
    );
  });

  it('uses the configured weekday name without padding the day number', () => {
    expect(formatDayHeading(new Date(2026, 0, 5), 'monday', 'Monday')).toBe('# Monday (5)');
  });

  it('does not mutate the supplied Monday', () => {
    const monday = new Date(2025, 11, 29);
    const originalTime = monday.getTime();

    formatDayHeading(monday, 'sunday', 'Sonntag');

    expect(monday.getTime()).toBe(originalTime);
  });
});
