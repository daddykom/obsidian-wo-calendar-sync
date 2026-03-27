import { WeekcalendarSettings, WoFileTitleStructure } from '../types';

/**
 * create a local ID
 * @param input
 */
export const createLocalId = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

/**
 * returns translated week day
 * @param weekDay
 * @param settings
 */
export function day(weekDay: WoFileTitleStructure, settings: WeekcalendarSettings): string {
  return settings.weekdays[weekDay];
}

/**
 * calkulate the date of monday of week 1
 * @param year
 */
export const getIsoWeek1Monday = (year: number): Date => {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7; // Sunday -> 7
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (day - 1));
  return monday;
};

/**
 * returns the date of exact 1 week later.
 * @param date
 */
export const inAWeek = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + 7);
  return result;
};

/**
 * returns the date of exact 1 week earlier.
 * @param date
 */
export const beforeAWeek = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - 7);
  return result;
};
