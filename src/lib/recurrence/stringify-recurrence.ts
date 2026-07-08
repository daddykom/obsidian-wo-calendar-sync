import {
  Recurrence,
  RecurrenceRule,
  Weekday,
} from '../types';

const WEEKDAY_TO_GERMAN: Record<Weekday, string> = {
  Mo: 'Mo',
  Di: 'Di',
  Mi: 'Mi',
  Do: 'Do',
  Fr: 'Fr',
  Sa: 'Sa',
  So: 'So',
};

const FREQUENCY_TO_GERMAN: Record<string, string> = {
  daily: 'täglich',
  weekly: 'wöchentlich',
  'monthly-date': 'monatlich',
  'monthly-weekday': 'monatlich',
  yearly: 'jährlich',
};

/**
 * Convert a RecurrenceRule back to a human-readable string
 */
export function stringifyRecurrenceRule(rule: RecurrenceRule): string {
  const parts: string[] = [FREQUENCY_TO_GERMAN[rule.frequency] || rule.frequency];

  switch (rule.frequency) {
    case 'weekly':
      if (rule.byDay && rule.byDay.length > 0) {
        parts.push(rule.byDay.map((d) => WEEKDAY_TO_GERMAN[d]).join(', '));
      }
      break;

    case 'monthly-date':
      if (rule.byMonthDay) {
        parts.push(rule.byMonthDay.toString());
      }
      break;

    case 'monthly-weekday':
      if (rule.byWeekday) {
        parts.push(`${rule.byWeekday.ordinal}. ${WEEKDAY_TO_GERMAN[rule.byWeekday.weekday]}`);
      }
      break;

    case 'yearly':
      if (rule.byMonth) {
        parts.push(rule.byMonth.toString());
      }
      break;
  }

  return parts.join(', ');
}

/**
 * Format a Date to European format (dd.MM.yyyy)
 */
export function formatEndDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Generate the content lines for a recurrence event
 */
export function stringifyRecurrence(
  rule: RecurrenceRule,
  endDate: Date,
  recurrenceId: string
): string[] {
  const lines: string[] = [];

  lines.push(`  Wiederholung: ${stringifyRecurrenceRule(rule)}`);
  lines.push(`  WiederholungEnde: ${formatEndDate(endDate)}`);
  lines.push(`  ^woev-rec-${recurrenceId}`);

  return lines;
}
