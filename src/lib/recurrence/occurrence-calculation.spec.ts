import {
  calculateNextOccurrence,
  generateOccurrences,
  checkIfIsException,
  getWeekdayFromDate,
} from './occurrence-calculation';
import { RecurrenceRule, Recurrence, RecurrenceFrequency } from '../types';

describe('calculateNextOccurrence', () => {
  describe('daily', () => {
    it('calculates next day', () => {
      const from = new Date(2026, 6, 8);
      const rule: RecurrenceRule = { frequency: 'daily', interval: 1 };
      const result = calculateNextOccurrence(from, rule);
      expect(result).toEqual(new Date(2026, 6, 9));
    });

    it('calculates next day with interval 2', () => {
      const from = new Date(2026, 6, 8);
      const rule: RecurrenceRule = { frequency: 'daily', interval: 2 };
      const result = calculateNextOccurrence(from, rule);
      expect(result).toEqual(new Date(2026, 6, 10));
    });
  });

  describe('weekly', () => {
    it('calculates next week', () => {
      const from = new Date(2026, 6, 8);
      const rule: RecurrenceRule = { frequency: 'weekly', interval: 1 };
      const result = calculateNextOccurrence(from, rule);
      expect(result).toEqual(new Date(2026, 6, 15));
    });

    it('calculates next weekday for weekly with byDay', () => {
      const from = new Date(2026, 6, 6);
      const rule: RecurrenceRule = { frequency: 'weekly', interval: 1, byDay: ['Mo', 'Mi', 'Fr'] };
      const result = calculateNextOccurrence(from, rule);
      expect(result).toEqual(new Date(2026, 6, 8));
    });
  });

  describe('monthly-date', () => {
    it('calculates next month same day-of-month', () => {
      const from = new Date(2026, 6, 8);
      const rule: RecurrenceRule = { frequency: 'monthly-date', interval: 1 };
      const result = calculateNextOccurrence(from, rule);
      expect(result).toEqual(new Date(2026, 7, 8));
    });

    it('calculates to next month if day has passed', () => {
      const from = new Date(2026, 6, 15);
      const rule: RecurrenceRule = { frequency: 'monthly-date', interval: 1, byMonthDay: 10 };
      const result = calculateNextOccurrence(from, rule);
      expect(result).toEqual(new Date(2026, 7, 10));
    });
  });

  describe('monthly-weekday', () => {
    it('calculates 2nd Monday of next month', () => {
      const from = new Date(2026, 6, 1);
      const rule: RecurrenceRule = {
        frequency: 'monthly-weekday',
        interval: 1,
        byWeekday: { ordinal: 2, weekday: 'Mo' },
      };
      const result = calculateNextOccurrence(from, rule);
      expect(result).toEqual(new Date(2026, 6, 13));
    });
  });

  describe('yearly', () => {
    it('calculates next year', () => {
      const from = new Date(2026, 6, 8);
      const rule: RecurrenceRule = { frequency: 'yearly', interval: 1 };
      const result = calculateNextOccurrence(from, rule);
      expect(result).toEqual(new Date(2027, 6, 8));
    });
  });
});

describe('generateOccurrences', () => {
  it('generates occurrences within range', () => {
    const startDate = new Date(2026, 6, 6);
    const endDate = new Date(2026, 6, 31);
    const recurrence: Recurrence = {
      rule: { frequency: 'weekly', interval: 1, byDay: ['Mo'] },
      end: { type: 'enddate', endDate: new Date(2026, 11, 31) },
      originalEventId: 'ABC123',
      recurrenceId: 'DEF456',
    };

    const result = generateOccurrences(startDate, endDate, recurrence);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].getDay()).toBe(1);
  });

  it('stops at end date', () => {
    const startDate = new Date(2026, 6, 6);
    const endDate = new Date(2026, 6, 20);
    const recurrence: Recurrence = {
      rule: { frequency: 'daily', interval: 1 },
      end: { type: 'enddate', endDate: new Date(2026, 6, 15) },
      originalEventId: 'ABC123',
      recurrenceId: 'DEF456',
    };

    const result = generateOccurrences(startDate, endDate, recurrence);

    expect(result.length).toBe(10);
  });
});

describe('checkIfIsException', () => {
  it('detects exception marker', () => {
    const content = ['- Termin: Team Meeting (AUSNAHME)', '  Zeit: 10:00'];
    const recurrence: Recurrence = {
      rule: { frequency: 'weekly' as RecurrenceFrequency, interval: 1 },
      end: { type: 'enddate', endDate: new Date(2026, 11, 31) },
      originalEventId: 'ABC123',
      recurrenceId: 'DEF456',
    };
    const date = new Date(2026, 6, 15);

    const result = checkIfIsException(content, recurrence, date);
    expect(result).toBe(true);
  });

  it('returns false for regular recurring event', () => {
    const content = ['- Termin: Team Meeting', '  Zeit: 09:00'];
    const recurrence: Recurrence = {
      rule: { frequency: 'weekly' as RecurrenceFrequency, interval: 1 },
      end: { type: 'enddate', endDate: new Date(2026, 11, 31) },
      originalEventId: 'ABC123',
      recurrenceId: 'DEF456',
    };
    const date = new Date(2026, 6, 15);

    const result = checkIfIsException(content, recurrence, date);
    expect(result).toBe(false);
  });
});

describe('getWeekdayFromDate', () => {
  it('returns correct weekday', () => {
    expect(getWeekdayFromDate(new Date(2026, 6, 6))).toBe('Mo');
    expect(getWeekdayFromDate(new Date(2026, 6, 7))).toBe('Di');
    expect(getWeekdayFromDate(new Date(2026, 6, 8))).toBe('Mi');
    expect(getWeekdayFromDate(new Date(2026, 6, 9))).toBe('Do');
    expect(getWeekdayFromDate(new Date(2026, 6, 10))).toBe('Fr');
    expect(getWeekdayFromDate(new Date(2026, 6, 11))).toBe('Sa');
    expect(getWeekdayFromDate(new Date(2026, 6, 12))).toBe('So');
  });
});
