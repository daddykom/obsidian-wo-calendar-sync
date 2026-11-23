import {
  Recurrence,
  RecurrenceFrequency,
  RecurrenceRule,
  Weekday,
} from '../types';
import {
  RECURRENCE_PATTERNS,
  normalizeFrequency,
  normalizeShortcut,
  parseWeekday,
  parseWeekdays,
} from '../settings/constants';

const WEEKDAY_SHORTCUT_MAP: Record<string, { frequency: RecurrenceFrequency; ordinal?: number; weekday?: Weekday }> = {
  'j2. mo': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Mo' },
  'j2.mo': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Mo' },
  'j2 mo': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Mo' },
  'jeden 2. montag': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Mo' },
  'j2. di': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Di' },
  'j2.di': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Di' },
  'j2 di': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Di' },
  'jeden 2. dienstag': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Di' },
  'j2. mi': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Mi' },
  'jeden 2. mittwoch': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Mi' },
  'j2. do': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Do' },
  'jeden 2. donnerstag': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Do' },
  'j2. fr': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Fr' },
  'jeden 2. freitag': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Fr' },
  'j2. sa': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Sa' },
  'jeden 2. samstag': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'Sa' },
  'j2. so': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'So' },
  'jeden 2. sonntag': { frequency: 'monthly-weekday', ordinal: 2, weekday: 'So' },
};

const WEEKDAY_SHORTCUT_KEYS = Object.keys(WEEKDAY_SHORTCUT_MAP);

/**
 * Parse a recurrence field value into a RecurrenceRule
 * @param fieldValue - e.g., "wöchentlich, Di, Do" or "monatlich, 15" or "j2. mo"
 */
export function parseRecurrenceRule(fieldValue: string): RecurrenceRule | null {
  const normalized = normalizeShortcut(fieldValue);

  const matchedKey = WEEKDAY_SHORTCUT_KEYS.find(
    (key) => normalized.startsWith(key) || normalized === key
  );
  if (matchedKey) {
    const shortcut = WEEKDAY_SHORTCUT_MAP[matchedKey];
    const rule: RecurrenceRule = {
      frequency: shortcut.frequency,
      interval: 1,
    };
    if (shortcut.ordinal !== undefined && shortcut.weekday !== undefined) {
      rule.byWeekday = { ordinal: shortcut.ordinal, weekday: shortcut.weekday };
    }
    return rule;
  }

  const parts = fieldValue.split(',').map((p) => p.trim());
  if (parts.length === 0) return null;

  const frequencyInput = parts[0];
  const frequency = normalizeFrequency(frequencyInput) as RecurrenceFrequency;

  if (!['daily', 'weekly', 'monthly-date', 'monthly-weekday', 'yearly'].includes(frequency)) {
    return null;
  }

  const rule: RecurrenceRule = {
    frequency,
    interval: 1,
  };

  switch (frequency) {
    case 'daily':
      break;

    case 'weekly':
      if (parts.length > 1) {
        const days = parseWeekdays(parts.slice(1).join(','));
        if (days.length > 0) {
          rule.byDay = days;
        }
      }
      break;

    case 'monthly-date':
      if (parts.length > 1) {
        const day = parseInt(parts[1], 10);
        if (!isNaN(day) && day >= 1 && day <= 31) {
          rule.byMonthDay = day;
        }
      }
      break;

    case 'monthly-weekday': {
      if (parts.length >= 2) {
        const second = parts[1].toLowerCase().trim();
        const ordinalMatch = second.match(/^(\d+)\.?\s*(.+)$/);
        if (ordinalMatch) {
          rule.byWeekday = {
            ordinal: parseInt(ordinalMatch[1], 10),
            weekday: parseWeekday(ordinalMatch[2]) || 'Mo',
          };
        } else {
          const day = parseWeekday(second);
          if (day) {
            rule.byWeekday = { ordinal: 1, weekday: day };
          }
        }
      }
      if (parts.length >= 3) {
        const day = parseWeekday(parts[2]);
        if (day) {
          rule.byWeekday = rule.byWeekday || { ordinal: 1, weekday: day };
          rule.byWeekday.weekday = day;
        }
      }
      break;
    }

    case 'yearly':
      if (parts.length > 1) {
        const month = parseInt(parts[1], 10);
        if (!isNaN(month) && month >= 1 && month <= 12) {
          rule.byMonth = month;
        }
      }
      break;
  }

  return rule;
}

/**
 * Parse the end date from a "WiederholungEnde:" field value
 * @param fieldValue - e.g., "31.12.2026" or "2026-12-31"
 */
export function parseEndDate(fieldValue: string): Date | null {
  const trimmed = fieldValue.trim();

  const europeanMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (europeanMatch) {
    return new Date(
      parseInt(europeanMatch[3], 10),
      parseInt(europeanMatch[2], 10) - 1,
      parseInt(europeanMatch[1], 10)
    );
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(
      parseInt(isoMatch[1], 10),
      parseInt(isoMatch[2], 10) - 1,
      parseInt(isoMatch[3], 10)
    );
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Extract recurrence ID from content lines
 */
export function extractRecurrenceId(content: string[]): string | null {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.recurrenceId));
  return matchLine ? matchLine.match(RECURRENCE_PATTERNS.recurrenceId)?.[1] ?? null : null;
}

/**
 * Extract exception info from content lines
 */
export function extractExceptionInfo(
  content: string[]
): { isException: boolean; exceptionOfRecurrenceId: string | null } {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.exceptionTag));
  if (matchLine) {
    const match = matchLine.match(RECURRENCE_PATTERNS.exceptionTag);
    return { isException: true, exceptionOfRecurrenceId: match?.[1] ?? null };
  }
  return { isException: false, exceptionOfRecurrenceId: null };
}

/**
 * Find the Wiederholung field value in content
 */
export function findRecurrenceField(content: string[]): string | null {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.field));
  return matchLine ? matchLine.match(RECURRENCE_PATTERNS.field)?.[1].trim() ?? null : null;
}

/**
 * Find the WiederholungEnde field value in content
 */
export function findEndDateField(content: string[]): string | null {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.endField));
  return matchLine ? matchLine.match(RECURRENCE_PATTERNS.endField)?.[1].trim() ?? null : null;
}

/**
 * Parse a full recurring event from event element content
 */
export function parseRecurrence(
  content: string[],
  originalEventId: string,
  recurrenceId: string
): Recurrence | null {
  const ruleValue = findRecurrenceField(content);
  if (!ruleValue) return null;

  const rule = parseRecurrenceRule(ruleValue);
  if (!rule) return null;

  const endValue = findEndDateField(content);
  const endDate = endValue ? parseEndDate(endValue) : null;

  return {
    rule,
    end: {
      type: 'enddate',
      endDate: endDate || new Date('2099-12-31'),
    },
    originalEventId,
    recurrenceId,
  };
}
