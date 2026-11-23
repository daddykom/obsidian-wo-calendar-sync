import {
  stringifyRecurrenceRule,
  formatEndDate,
  stringifyRecurrence,
} from './stringify-recurrence';
import { RecurrenceRule } from '../types';

describe('stringifyRecurrenceRule', () => {
  describe('daily', () => {
    it('converts daily to täglich', () => {
      const rule: RecurrenceRule = { frequency: 'daily', interval: 1 };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('täglich');
    });
  });

  describe('weekly', () => {
    it('converts weekly to wöchentlich', () => {
      const rule: RecurrenceRule = { frequency: 'weekly', interval: 1 };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('wöchentlich');
    });

    it('includes weekdays', () => {
      const rule: RecurrenceRule = { frequency: 'weekly', interval: 1, byDay: ['Di', 'Do'] };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('wöchentlich, Di, Do');
    });

    it('handles single weekday', () => {
      const rule: RecurrenceRule = { frequency: 'weekly', interval: 1, byDay: ['Mo'] };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('wöchentlich, Mo');
    });
  });

  describe('monthly-date', () => {
    it('converts monthly-date to monatlich', () => {
      const rule: RecurrenceRule = { frequency: 'monthly-date', interval: 1 };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('monatlich');
    });

    it('includes month day', () => {
      const rule: RecurrenceRule = { frequency: 'monthly-date', interval: 1, byMonthDay: 15 };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('monatlich, 15');
    });
  });

  describe('monthly-weekday', () => {
    it('converts monthly-weekday to monatlich', () => {
      const rule: RecurrenceRule = {
        frequency: 'monthly-weekday',
        interval: 1,
        byWeekday: { ordinal: 2, weekday: 'Mo' },
      };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('monatlich, 2. Mo');
    });

    it('handles first weekday', () => {
      const rule: RecurrenceRule = {
        frequency: 'monthly-weekday',
        interval: 1,
        byWeekday: { ordinal: 1, weekday: 'Di' },
      };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('monatlich, 1. Di');
    });
  });

  describe('yearly', () => {
    it('converts yearly to jährlich', () => {
      const rule: RecurrenceRule = { frequency: 'yearly', interval: 1 };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('jährlich');
    });

    it('includes month', () => {
      const rule: RecurrenceRule = { frequency: 'yearly', interval: 1, byMonth: 6 };
      const result = stringifyRecurrenceRule(rule);
      expect(result).toBe('jährlich, 6');
    });
  });
});

describe('formatEndDate', () => {
  it('formats date in European format dd.MM.yyyy', () => {
    const date = new Date(2026, 11, 31);
    const result = formatEndDate(date);
    expect(result).toBe('31.12.2026');
  });

  it('pads single digit day and month', () => {
    const date = new Date(2027, 5, 5);
    const result = formatEndDate(date);
    expect(result).toBe('05.06.2027');
  });

  it('handles January correctly', () => {
    const date = new Date(2026, 0, 1);
    const result = formatEndDate(date);
    expect(result).toBe('01.01.2026');
  });
});

describe('stringifyRecurrence', () => {
  it('generates correct recurrence lines', () => {
    const rule: RecurrenceRule = { frequency: 'weekly', interval: 1, byDay: ['Di', 'Do'] };
    const endDate = new Date(2026, 11, 31);
    const result = stringifyRecurrence(rule, endDate, 'DEF456');

    expect(result).toEqual([
      '  Wiederholung: wöchentlich, Di, Do',
      '  WiederholungEnde: 31.12.2026',
      '  ^woev-rec-DEF456',
    ]);
  });

  it('handles daily recurrence', () => {
    const rule: RecurrenceRule = { frequency: 'daily', interval: 1 };
    const endDate = new Date(2026, 11, 31);
    const result = stringifyRecurrence(rule, endDate, 'ABC123');

    expect(result).toEqual([
      '  Wiederholung: täglich',
      '  WiederholungEnde: 31.12.2026',
      '  ^woev-rec-ABC123',
    ]);
  });

  it('handles monthly-weekday recurrence', () => {
    const rule: RecurrenceRule = {
      frequency: 'monthly-weekday',
      interval: 1,
      byWeekday: { ordinal: 2, weekday: 'Mo' },
    };
    const endDate = new Date(2026, 11, 31);
    const result = stringifyRecurrence(rule, endDate, 'GHI789');

    expect(result).toEqual([
      '  Wiederholung: monatlich, 2. Mo',
      '  WiederholungEnde: 31.12.2026',
      '  ^woev-rec-GHI789',
    ]);
  });
});
