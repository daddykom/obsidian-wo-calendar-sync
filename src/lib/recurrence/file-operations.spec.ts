import {
  getWeekFilePath,
  getWeekFileTitle,
  getWeekdaySection,
  getMondayOfWeek,
} from './file-operations';
import { WeekcalendarSettings } from '../types';

const mockSettings: WeekcalendarSettings = {
  paths: {
    weekFolder: 'week-calendar',
    eventFolder: 'week-calendar/events',
    overviewFileName: 'Übersicht',
  },
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
  prefixes: {
    event: 'Termin',
    time: 'Zeit',
    location: 'Ort',
    reminder: 'Erinnerung',
    repeat: 'Wiederholung',
  },
  caldav: {
    url: '',
    username: '',
    password: '',
    calendar: '',
  },
};

describe('getMondayOfWeek', () => {
  it('returns same date for monday', () => {
    const monday = new Date(2026, 6, 6);
    const result = getMondayOfWeek(monday);
    expect(result.getDate()).toBe(6);
  });

  it('returns previous monday for wednesday', () => {
    const wednesday = new Date(2026, 6, 8);
    const result = getMondayOfWeek(wednesday);
    expect(result.getDate()).toBe(6);
  });

  it('returns previous monday for sunday', () => {
    const sunday = new Date(2026, 6, 12);
    const result = getMondayOfWeek(sunday);
    expect(result.getDate()).toBe(6);
  });
});

describe('getWeekFilePath', () => {
  it('generates correct path for date', () => {
    const date = new Date(2026, 6, 6);
    const result = getWeekFilePath(date, mockSettings);
    expect(result).toContain('week-calendar');
    expect(result).toContain('2026');
    expect(result).toContain('weeks');
  });
});

describe('getWeekFileTitle', () => {
  it('generates correct title format', () => {
    const date = new Date(2026, 6, 6);
    const result = getWeekFileTitle(date);
    expect(result).toMatch(/^W\d{2} \d{2}\.\d{2}\.\d{2}$/);
  });
});

describe('getWeekdaySection', () => {
  it('returns monday for monday date', () => {
    const monday = new Date(2026, 6, 6);
    const result = getWeekdaySection(monday);
    expect(result).toBe('monday');
  });

  it('returns tuesday for tuesday date', () => {
    const tuesday = new Date(2026, 6, 7);
    const result = getWeekdaySection(tuesday);
    expect(result).toBe('tuesday');
  });

  it('returns sunday for sunday date', () => {
    const sunday = new Date(2026, 6, 12);
    const result = getWeekdaySection(sunday);
    expect(result).toBe('sunday');
  });
});
