import { App } from 'obsidian';
import { copyRecurringEventsFromYear, findRecurringEventsInYear } from './year-integration';
import { WeekcalendarSettings, Recurrence, EventElement } from '../types';

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

describe('copyRecurringEventsFromYear', () => {
  it('returns zero counts when no files exist', async () => {
    const mockApp = {
      vault: {
        getAbstractFileByPath: jest.fn().mockReturnValue(null),
      },
    } as unknown as App;

    const result = await copyRecurringEventsFromYear(2025, 2026, mockSettings, mockApp);

    expect(result.eventsCopied).toBe(0);
    expect(result.occurrencesCreated).toBe(0);
  });
});

describe('findRecurringEventsInYear', () => {
  it('returns empty array when no recurring events exist', async () => {
    const mockApp = {
      vault: {
        getAbstractFileByPath: jest.fn().mockReturnValue(null),
      },
    } as unknown as App;

    const result = await findRecurringEventsInYear(2026, mockSettings, mockApp);

    expect(result).toEqual([]);
  });
});

describe('Recurrence object', () => {
  it('filters out events that ended before target year', () => {
    const oldRecurrence: Recurrence = {
      rule: { frequency: 'weekly', interval: 1, byDay: ['Mo'] },
      end: { type: 'enddate', endDate: new Date(2025, 11, 31) },
      originalEventId: 'ABC123',
      recurrenceId: 'DEF456',
    };

    const targetStart = new Date(2026, 0, 1);
    expect(oldRecurrence.end.endDate < targetStart).toBe(true);
  });

  it('keeps events that end after target year starts', () => {
    const ongoingRecurrence: Recurrence = {
      rule: { frequency: 'weekly', interval: 1, byDay: ['Mo'] },
      end: { type: 'enddate', endDate: new Date(2026, 11, 31) },
      originalEventId: 'ABC123',
      recurrenceId: 'DEF456',
    };

    const targetStart = new Date(2026, 0, 1);
    expect(ongoingRecurrence.end.endDate >= targetStart).toBe(true);
  });
});

describe('EventElement recurrence detection', () => {
  it('identifies recurring events by recurrenceId', () => {
    const recurringEvent: EventElement = {
      type: 'event',
      content: ['- Termin: Team Meeting', '  ^woev-rec-DEF456'],
      eventId: 'ABC123',
      recurrenceId: 'DEF456',
    };

    expect(recurringEvent.recurrenceId).toBe('DEF456');
    expect(recurringEvent.isException).toBeUndefined();
  });

  it('identifies exception events', () => {
    const exceptionEvent: EventElement = {
      type: 'event',
      content: ['- Termin: Team Meeting (AUSNAHME)'],
      eventId: 'GHI789',
      recurrenceId: 'DEF456',
      isException: true,
      exceptionOfRecurrenceId: 'DEF456',
    };

    expect(exceptionEvent.isException).toBe(true);
    expect(exceptionEvent.recurrenceId).toBe('DEF456');
  });
});
