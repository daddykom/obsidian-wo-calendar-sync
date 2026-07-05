import { WeekcalendarSettings, WoFileTitleStructure } from '../types';
import {
  beforeAWeek,
  createLocalId,
  day,
  getIsoWeek1Monday,
  getLastMonday,
  getWeekFileName,
  inAWeek,
} from './util';

describe('util', () => {
  describe('createLocalId', () => {
    it('should create a consistent hash for the same input', () => {
      const result1 = createLocalId('test');
      const result2 = createLocalId('test');
      expect(result1).toBe(result2);
    });

    it('should create different hashes for different inputs', () => {
      const hash1 = createLocalId('test1');
      const hash2 = createLocalId('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('should return a positive number as string', () => {
      const result = createLocalId('any input');
      expect(result).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('day', () => {
    const settings: WeekcalendarSettings = {
      paths: { weekFolder: '', eventFolder: '', overviewFileName: '' },
      weekdays: {
        start: 'Start',
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag',
        links: 'Links',
      },
      prefixes: { event: '', time: '', location: '', reminder: '', repeat: '' },
      caldav: { url: '', username: '', password: '', calendar: '' },
    };

    it('should return the translated weekday', () => {
      expect(day('monday', settings)).toBe('Montag');
      expect(day('sunday', settings)).toBe('Sonntag');
    });

    it('should return undefined for missing weekday key', () => {
      const partialSettings = {
        ...settings,
        weekdays: { monday: 'Montag', tuesday: 'Dienstag' } as unknown as Record<
          WoFileTitleStructure,
          string
        >,
      };
      expect(day('sunday', partialSettings)).toBeUndefined();
    });
  });

  describe('getIsoWeek1Monday', () => {
    it('should return January 4th adjusted to Monday', () => {
      const result = getIsoWeek1Monday(2024);
      expect(result.getUTCDay()).toBe(1);
      expect(result.getUTCMonth()).toBe(0);
    });

    it('should return correct date for 2024', () => {
      const result = getIsoWeek1Monday(2024);
      expect(result.getUTCFullYear()).toBe(2024);
    });
  });

  describe('inAWeek', () => {
    it('should add 7 days to the given date', () => {
      const date = new Date('2024-01-01');
      const result = inAWeek(date);
      expect(result.getDate() - date.getDate()).toBe(7);
    });

    it('should not mutate the original date', () => {
      const date = new Date('2024-01-01');
      const originalTime = date.getTime();
      inAWeek(date);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('beforeAWeek', () => {
    it('should subtract 7 days from the given date', () => {
      const date = new Date('2024-01-15');
      const result = beforeAWeek(date);
      expect(date.getDate() - result.getDate()).toBe(7);
    });

    it('should not mutate the original date', () => {
      const date = new Date('2024-01-15');
      const originalTime = date.getTime();
      beforeAWeek(date);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('getLastMonday', () => {
    it('should return the same date if it is a Monday', () => {
      const monday = new Date('2024-01-01');
      monday.setUTCHours(0, 0, 0, 0);
      expect(getLastMonday(monday).getUTCDay()).toBe(1);
    });

    it('should return the previous Monday for a Wednesday', () => {
      const wednesday = new Date('2024-01-03');
      const result = getLastMonday(wednesday);
      expect(result.getUTCDay()).toBe(1);
    });

    it('should return the same Monday for a Sunday', () => {
      const sunday = new Date('2024-01-07');
      const result = getLastMonday(sunday);
      expect(result.getUTCDay()).toBe(1);
    });
  });

  describe('getWeekFileName', () => {
    it('should format week file name correctly', () => {
      const monday = new Date('2024-01-01');
      const result = getWeekFileName(monday, 1);
      expect(result).toBe('W01 01.01.24');
    });

    it('should pad week number to 2 digits', () => {
      const monday = new Date('2024-01-01');
      expect(getWeekFileName(monday, 1)).toBe('W01 01.01.24');
      expect(getWeekFileName(monday, 10)).toBe('W10 01.01.24');
    });
  });
});
