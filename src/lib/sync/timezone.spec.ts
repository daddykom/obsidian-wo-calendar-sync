import { validateTimezone, wallTimeToUtc } from './timezone';

describe('explicit calendar timezone', () => {
  it.each([
    ['2026-01-15T09:00:00', 'Europe/Zurich', '2026-01-15T08:00:00Z'],
    ['2026-07-15T09:00:00', 'Europe/Zurich', '2026-07-15T07:00:00Z'],
    ['2026-07-15T09:00:00', 'UTC', '2026-07-15T09:00:00Z'],
    ['2026-07-15T09:00:00', 'Asia/Kathmandu', '2026-07-15T03:15:00Z'],
  ])('converts %s in %s independently of the device timezone', (value, zone, expected) => {
    expect(wallTimeToUtc(value, zone)).toBe(expected);
  });

  it.each(['2026-03-29T02:30:00', '2026-10-25T02:30:00'])
    ('rejects missing or ambiguous DST wall times: %s', (value) => {
      expect(() => wallTimeToUtc(value, 'Europe/Zurich')).toThrow('Zeitumstellung');
    });

  it.each(['', 'Invalid/Zone'])('rejects invalid zones: %s', (zone) => {
    expect(() => validateTimezone(zone)).toThrow('Ungültige Zeitzone');
  });
});
