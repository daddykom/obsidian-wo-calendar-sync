import {
  Recurrence,
  RecurrenceRule,
  RecurrenceFrequency,
  Weekday,
} from '../types';

const WEEKDAY_TO_NUMBER: Record<Weekday, number> = {
  Mo: 1,
  Di: 2,
  Mi: 3,
  Do: 4,
  Fr: 5,
  Sa: 6,
  So: 0,
};

const NUMBER_TO_WEEKDAY: Record<number, Weekday> = {
  0: 'So',
  1: 'Mo',
  2: 'Di',
  3: 'Mi',
  4: 'Do',
  5: 'Fr',
  6: 'Sa',
};

export function calculateNextOccurrence(from: Date, rule: RecurrenceRule): Date | null {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);

  switch (rule.frequency) {
    case 'daily':
      result.setDate(result.getDate() + rule.interval);
      return result;

    case 'weekly':
      return calculateNextWeekly(from, rule);

    case 'monthly-date':
      return calculateNextMonthlyDate(from, rule);

    case 'monthly-weekday':
      return calculateNextMonthlyWeekday(from, rule);

    case 'yearly':
      return calculateNextYearly(from, rule);

    default:
      return null;
  }
}

function calculateNextWeekly(from: Date, rule: RecurrenceRule): Date {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);

  if (!rule.byDay || rule.byDay.length === 0) {
    result.setDate(result.getDate() + 7 * rule.interval);
    return result;
  }

  const currentDay = result.getDay();
  const sortedDays = rule.byDay.map((d) => WEEKDAY_TO_NUMBER[d]).sort((a, b) => a - b);

  for (const targetDay of sortedDays) {
    if (targetDay > currentDay) {
      result.setDate(result.getDate() + (targetDay - currentDay));
      return result;
    }
  }

  const weeksToAdd = 7 * rule.interval;
  const daysToAdd = weeksToAdd - ((currentDay - sortedDays[sortedDays.length - 1] + 7) % 7);
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

function calculateNextMonthlyDate(from: Date, rule: RecurrenceRule): Date {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);

  const currentDay = result.getDate();
  const targetDay = rule.byMonthDay ?? currentDay;

  if (currentDay < targetDay) {
    result.setDate(targetDay);
    return result;
  }

  result.setMonth(result.getMonth() + rule.interval);

  const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(targetDay, daysInMonth));

  return result;
}

function calculateNextMonthlyWeekday(from: Date, rule: RecurrenceRule): Date | null {
  if (!rule.byWeekday) return null;

  const result = new Date(from);
  result.setHours(0, 0, 0, 0);

  const { ordinal, weekday } = rule.byWeekday;
  const targetWeekday = WEEKDAY_TO_NUMBER[weekday];

  result.setDate(1);

  let currentMonth = result.getMonth();
  let targetDate = findNthWeekdayOfMonth(result.getFullYear(), currentMonth, targetWeekday, ordinal);

  if (targetDate && targetDate > result.getDate()) {
    result.setDate(targetDate);
    return result;
  }

  currentMonth = currentMonth + rule.interval;
  if (currentMonth >= 12) {
    result.setFullYear(result.getFullYear() + Math.floor(currentMonth / 12));
    currentMonth = currentMonth % 12;
  }

  targetDate = findNthWeekdayOfMonth(result.getFullYear(), currentMonth, targetWeekday, ordinal);

  if (targetDate) {
    result.setMonth(currentMonth);
    result.setDate(targetDate);
    return result;
  }

  return null;
}

function findNthWeekdayOfMonth(year: number, month: number, weekday: number, ordinal: number): number | null {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();

  let daysToAdd = weekday - firstWeekday;
  if (daysToAdd < 0) daysToAdd += 7;

  const firstOccurrence = 1 + daysToAdd;
  const nthOccurrence = firstOccurrence + (ordinal - 1) * 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  if (nthOccurrence > daysInMonth) return null;

  return nthOccurrence;
}

function calculateNextYearly(from: Date, rule: RecurrenceRule): Date {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);

  const targetMonth = rule.byMonth !== undefined ? rule.byMonth - 1 : result.getMonth();
  const targetDay = rule.byMonthDay ?? result.getDate();

  if (result.getMonth() < targetMonth ||
      (result.getMonth() === targetMonth && result.getDate() < targetDay)) {
    result.setMonth(targetMonth);
    const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(targetDay, daysInMonth));
    return result;
  }

  result.setFullYear(result.getFullYear() + rule.interval);
  result.setMonth(targetMonth);
  const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(targetDay, daysInMonth));

  return result;
}

export function generateOccurrences(
  startDate: Date,
  endDate: Date,
  recurrence: Recurrence
): Date[] {
  const occurrences: Date[] = [];

  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const maxIterations = 1000;
  let iterations = 0;

  while (current <= endDate && current <= recurrence.end.endDate && iterations < maxIterations) {
    occurrences.push(new Date(current));
    const next = calculateNextOccurrence(current, recurrence.rule);
    if (!next) break;
    current = next;
    iterations++;
  }

  return occurrences;
}

export function checkIfIsException(
  eventContent: string[],
  recurrence: Recurrence,
  expectedDate: Date
): boolean {
  const titleLine = eventContent.find((line) => line.startsWith('- Termin:'));
  if (!titleLine) return false;

  const titleWithoutMarker = titleLine.replace(/\s*\(AUSNAHME\)/i, '').trim();

  const hasExceptionMarker = titleLine.includes('(AUSNAHME)') || titleLine.includes('(AUSNAME)');

  return hasExceptionMarker;
}

export function getWeekdayFromDate(date: Date): Weekday {
  return NUMBER_TO_WEEKDAY[date.getDay()];
}

export function getDateWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
