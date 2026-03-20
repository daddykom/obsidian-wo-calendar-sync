import { WeekcalendarSettings, WoFileStructure } from '../types';

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
export function day(weekDay: WoFileStructure, settings: WeekcalendarSettings): string {
  return settings.weekdays[weekDay];
}
