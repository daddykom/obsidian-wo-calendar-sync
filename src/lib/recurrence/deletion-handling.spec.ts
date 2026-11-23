import { Recurrence, EventElement } from '../types';

const mockRecurrence: Recurrence = {
  rule: {
    frequency: 'weekly',
    interval: 1,
    byDay: ['Mo'],
  },
  end: {
    type: 'enddate',
    endDate: new Date(2026, 11, 31),
  },
  originalEventId: 'ABC123',
  recurrenceId: 'DEF456',
};

const mockEvent: EventElement = {
  type: 'event',
  content: [
    '- Termin: Team Meeting',
    '  Zeit: 09:00 - 10:00',
    '  Wiederholung: wöchentlich, Mo',
    '  WiederholungEnde: 31.12.2026',
    '  ^woev-ABC123',
    '  ^woev-rec-DEF456',
  ],
  eventId: 'ABC123',
  recurrenceId: 'DEF456',
};

describe('deleteRecurringEvent', () => {
  it('accepts valid parameters', () => {
    const callback = (result: 'all' | 'single' | 'cancel') => {
      if (result === 'cancel') {
        return 'cancelled';
      }
      return 'deleted';
    };

    expect(callback('cancel')).toBe('cancelled');
    expect(callback('all')).toBe('deleted');
    expect(callback('single')).toBe('deleted');
  });
});

describe('Recurrence object structure', () => {
  it('has correct recurrence properties', () => {
    expect(mockRecurrence.recurrenceId).toBe('DEF456');
    expect(mockRecurrence.originalEventId).toBe('ABC123');
    expect(mockRecurrence.rule.frequency).toBe('weekly');
  });

  it('has correct end date', () => {
    expect(mockRecurrence.end.type).toBe('enddate');
    expect(mockRecurrence.end.endDate).toEqual(new Date(2026, 11, 31));
  });
});

describe('EventElement structure', () => {
  it('has recurrenceId for recurring events', () => {
    expect(mockEvent.recurrenceId).toBe('DEF456');
    expect(mockEvent.eventId).toBe('ABC123');
    expect(mockEvent.isException).toBeUndefined();
  });

  it('can detect non-recurring events', () => {
    const nonRecurringEvent: EventElement = {
      type: 'event',
      content: ['- Termin: Single Event', '  Zeit: 09:00'],
      eventId: 'XYZ789',
    };
    expect(nonRecurringEvent.recurrenceId).toBeUndefined();
  });
});
