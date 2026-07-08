import { extractDateFromFilePath, detectRecurringEvents } from './modify-week-file-event';
import { parseWo } from '../parseWeekFile/parse-wo';
import { WeekcalendarSettings, EventElement } from '../types';

jest.mock('../parseWeekFile/parse-wo');

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

describe('extractDateFromFilePath', () => {
  it('extracts date from valid week file path', () => {
    const result = extractDateFromFilePath('week-calendar/2026/W01 05.01.26.md');
    expect(result).toEqual(new Date(2026, 0, 5));
  });

  it('extracts date from path with single digit day', () => {
    const result = extractDateFromFilePath('week-calendar/2026/W01 01.01.26.md');
    expect(result).toEqual(new Date(2026, 0, 1));
  });

  it('extracts date from path with December date', () => {
    const result = extractDateFromFilePath('week-calendar/2026/W52 31.12.26.md');
    expect(result).toEqual(new Date(2026, 11, 31));
  });

  it('returns null for invalid path format', () => {
    expect(extractDateFromFilePath('invalid/path.md')).toBeNull();
  });

  it('returns null for path without week number', () => {
    expect(extractDateFromFilePath('week-calendar/2026/05.01.26.md')).toBeNull();
  });

  it('returns null for non-md extension', () => {
    expect(extractDateFromFilePath('week-calendar/2026/W01 05.01.26.txt')).toBeNull();
  });

  it('handles various week formats', () => {
    expect(extractDateFromFilePath('folder/W01 15.06.26.md')).toEqual(new Date(2026, 5, 15));
    expect(extractDateFromFilePath('folder/W26 15.06.26.md')).toEqual(new Date(2026, 5, 15));
  });
});

describe('detectRecurringEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array when no recurring events found', () => {
    const mockElements = {
      monday: [
        {
          type: 'event' as const,
          content: ['- Termin: Single Event', '  Zeit: 09:00'],
          eventId: 'abc123',
        },
      ],
    };
    (parseWo as jest.Mock).mockReturnValue(mockElements);

    const result = detectRecurringEvents('content', 'folder/W01 05.01.26.md', mockSettings);
    expect(result).toEqual([]);
  });

  it('detects recurring event with recurrenceId', () => {
    const mockEvent: EventElement = {
      type: 'event',
      content: [
        '- Termin: Weekly Meeting',
        '  Zeit: 09:00',
        '  Wiederholung: wöchentlich, Mo',
        '  WiederholungEnde: 31.12.2026',
        '  ^woev-abc123',
        '  ^woev-rec-rec456',
      ],
      eventId: 'abc123',
      recurrenceId: 'rec456',
    };

    const mockElements = {
      monday: [mockEvent],
    };
    (parseWo as jest.Mock).mockReturnValue(mockElements);

    const result = detectRecurringEvents('content', 'folder/W01 05.01.26.md', mockSettings);

    expect(result).toHaveLength(1);
    expect(result[0].event.eventId).toBe('abc123');
    expect(result[0].recurrence.recurrenceId).toBe('rec456');
    expect(result[0].eventDate).toEqual(new Date(2026, 0, 5));
  });

  it('excludes exception events', () => {
    const mockExceptionEvent: EventElement = {
      type: 'event',
      content: [
        '- Termin: Weekly Meeting (AUSNAHME)',
        '  Zeit: 10:00',
        '  AusnahmeVon: ^woev-abc123',
        '  ^woev-xyz789',
        '  ^woev-rec-rec456',
      ],
      eventId: 'xyz789',
      recurrenceId: 'rec456',
      isException: true,
    };

    const mockElements = {
      monday: [mockExceptionEvent],
    };
    (parseWo as jest.Mock).mockReturnValue(mockElements);

    const result = detectRecurringEvents('content', 'folder/W01 05.01.26.md', mockSettings);
    expect(result).toEqual([]);
  });

  it('returns empty for non-week file path', () => {
    const result = detectRecurringEvents('content', 'invalid/path.md', mockSettings);
    expect(result).toEqual([]);
  });

  it('handles multiple events with one recurring', () => {
    const recurringEvent: EventElement = {
      type: 'event',
      content: [
        '- Termin: Weekly Meeting',
        '  Zeit: 09:00',
        '  Wiederholung: wöchentlich, Mo',
        '  WiederholungEnde: 31.12.2026',
        '  ^woev-abc123',
        '  ^woev-rec-rec456',
      ],
      eventId: 'abc123',
      recurrenceId: 'rec456',
    };

    const singleEvent = {
      type: 'event' as const,
      content: ['- Termin: Single', '  Zeit: 09:00'],
      eventId: 'def456',
    };

    const mockElements = {
      monday: [singleEvent, recurringEvent],
    };
    (parseWo as jest.Mock).mockReturnValue(mockElements);

    const result = detectRecurringEvents('content', 'folder/W01 05.01.26.md', mockSettings);

    expect(result).toHaveLength(1);
    expect(result[0].event.eventId).toBe('abc123');
  });
});
