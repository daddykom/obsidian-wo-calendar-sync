import {
  parseRecurrenceRule,
  parseEndDate,
  parseRecurrence,
  findRecurrenceField,
  findEndDateField,
  extractRecurrenceId,
  extractExceptionInfo,
} from './parse-recurrence';

describe('parseRecurrenceRule', () => {
  describe('daily', () => {
    it('parses täglich', () => {
      const result = parseRecurrenceRule('täglich');
      expect(result).toEqual({
        frequency: 'daily',
        interval: 1,
      });
    });

    it('parses taeglich', () => {
      const result = parseRecurrenceRule('taeglich');
      expect(result).toEqual({
        frequency: 'daily',
        interval: 1,
      });
    });
  });

  describe('weekly', () => {
    it('parses wöchentlich', () => {
      const result = parseRecurrenceRule('wöchentlich');
      expect(result).toEqual({
        frequency: 'weekly',
        interval: 1,
      });
    });

    it('parses wöchentlich with weekdays', () => {
      const result = parseRecurrenceRule('wöchentlich, Di, Do');
      expect(result).toEqual({
        frequency: 'weekly',
        interval: 1,
        byDay: ['Di', 'Do'],
      });
    });
  });

  describe('monthly-date', () => {
    it('parses monatlich', () => {
      const result = parseRecurrenceRule('monatlich');
      expect(result).toEqual({
        frequency: 'monthly-date',
        interval: 1,
      });
    });

    it('parses monatlich with day', () => {
      const result = parseRecurrenceRule('monatlich, 15');
      expect(result).toEqual({
        frequency: 'monthly-date',
        interval: 1,
        byMonthDay: 15,
      });
    });

    it('parses mntl', () => {
      const result = parseRecurrenceRule('mntl');
      expect(result).toEqual({
        frequency: 'monthly-date',
        interval: 1,
      });
    });
  });

  describe('monthly-weekday', () => {
    it('parses j2. mo', () => {
      const result = parseRecurrenceRule('j2. mo');
      expect(result).toEqual({
        frequency: 'monthly-weekday',
        interval: 1,
        byWeekday: { ordinal: 2, weekday: 'Mo' },
      });
    });

    it('parses jeden 2. montag', () => {
      const result = parseRecurrenceRule('jeden 2. montag');
      expect(result).toEqual({
        frequency: 'monthly-weekday',
        interval: 1,
        byWeekday: { ordinal: 2, weekday: 'Mo' },
      });
    });

    it('parses j2.mo', () => {
      const result = parseRecurrenceRule('j2.mo');
      expect(result).toEqual({
        frequency: 'monthly-weekday',
        interval: 1,
        byWeekday: { ordinal: 2, weekday: 'Mo' },
      });
    });

    it('parses j2 di', () => {
      const result = parseRecurrenceRule('j2 di');
      expect(result).toEqual({
        frequency: 'monthly-weekday',
        interval: 1,
        byWeekday: { ordinal: 2, weekday: 'Di' },
      });
    });
  });

  describe('yearly', () => {
    it('parses jährlich', () => {
      const result = parseRecurrenceRule('jährlich');
      expect(result).toEqual({
        frequency: 'yearly',
        interval: 1,
      });
    });

    it('parses jährlich with month', () => {
      const result = parseRecurrenceRule('jährlich, 6');
      expect(result).toEqual({
        frequency: 'yearly',
        interval: 1,
        byMonth: 6,
      });
    });

    it('parses jaehrl', () => {
      const result = parseRecurrenceRule('jaehrl');
      expect(result).toEqual({
        frequency: 'yearly',
        interval: 1,
      });
    });
  });

  describe('invalid input', () => {
    it('returns null for empty string', () => {
      const result = parseRecurrenceRule('');
      expect(result).toBeNull();
    });

    it('returns null for unknown frequency', () => {
      const result = parseRecurrenceRule('unknown');
      expect(result).toBeNull();
    });
  });
});

describe('parseEndDate', () => {
  it('parses European format dd.MM.yyyy', () => {
    const result = parseEndDate('31.12.2026');
    expect(result).toEqual(new Date(2026, 11, 31));
  });

  it('parses single digit day and month', () => {
    const result = parseEndDate('5.6.2027');
    expect(result).toEqual(new Date(2027, 5, 5));
  });

  it('parses ISO format yyyy-MM-dd', () => {
    const result = parseEndDate('2026-12-31');
    expect(result).toEqual(new Date(2026, 11, 31));
  });

  it('parses Date constructor string', () => {
    const result = parseEndDate('December 31, 2026');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2026);
  });

  it('returns null for invalid date', () => {
    const result = parseEndDate('not a date');
    expect(result).toBeNull();
  });
});

describe('findRecurrenceField', () => {
  it('finds Wiederholung field', () => {
    const content = [
      '- Termin: Team Meeting',
      '  Zeit: 09:00 - 10:00',
      '  Wiederholung: wöchentlich, Di',
    ];
    const result = findRecurrenceField(content);
    expect(result).toBe('wöchentlich, Di');
  });

  it('returns null when no Wiederholung field', () => {
    const content = ['- Termin: Team Meeting', '  Zeit: 09:00 - 10:00'];
    const result = findRecurrenceField(content);
    expect(result).toBeNull();
  });
});

describe('findEndDateField', () => {
  it('finds WiederholungEnde field', () => {
    const content = [
      '- Termin: Team Meeting',
      '  Zeit: 09:00 - 10:00',
      '  WiederholungEnde: 31.12.2026',
    ];
    const result = findEndDateField(content);
    expect(result).toBe('31.12.2026');
  });

  it('returns null when no WiederholungEnde field', () => {
    const content = ['- Termin: Team Meeting', '  Zeit: 09:00 - 10:00'];
    const result = findEndDateField(content);
    expect(result).toBeNull();
  });
});

describe('extractRecurrenceId', () => {
  it('extracts recurrence ID', () => {
    const content = ['- Termin: Team Meeting', '  ^woev-rec-ABC123'];
    const result = extractRecurrenceId(content);
    expect(result).toBe('ABC123');
  });

  it('returns null when no recurrence ID', () => {
    const content = ['- Termin: Team Meeting', '  ^woev-ABC123'];
    const result = extractRecurrenceId(content);
    expect(result).toBeNull();
  });
});

describe('extractExceptionInfo', () => {
  it('extracts exception info', () => {
    const content = ['- Termin: Team Meeting (AUSNAHME)', '  AusnahmeVon: ^woev-ABC123'];
    const result = extractExceptionInfo(content);
    expect(result).toEqual({ isException: true, exceptionOfRecurrenceId: 'ABC123' });
  });

  it('returns not exception when no AusnahmeVon', () => {
    const content = ['- Termin: Team Meeting', '  ^woev-rec-ABC123'];
    const result = extractExceptionInfo(content);
    expect(result).toEqual({ isException: false, exceptionOfRecurrenceId: null });
  });
});

describe('parseRecurrence', () => {
  it('parses complete recurrence', () => {
    const content = [
      '- Termin: Team Meeting',
      '  Zeit: 09:00 - 10:00',
      '  Wiederholung: wöchentlich, Di',
      '  WiederholungEnde: 31.12.2026',
      '  ^woev-rec-DEF456',
    ];
    const result = parseRecurrence(content, 'ABC123', 'DEF456');
    expect(result).toEqual({
      rule: {
        frequency: 'weekly',
        interval: 1,
        byDay: ['Di'],
      },
      end: {
        type: 'enddate',
        endDate: new Date(2026, 11, 31),
      },
      originalEventId: 'ABC123',
      recurrenceId: 'DEF456',
    });
  });

  it('returns null when no Wiederholung field', () => {
    const content = ['- Termin: Team Meeting', '  Zeit: 09:00 - 10:00'];
    const result = parseRecurrence(content, 'ABC123', 'DEF456');
    expect(result).toBeNull();
  });

  it('uses default end date when not specified', () => {
    const content = ['- Termin: Team Meeting', '  Wiederholung: täglich'];
    const result = parseRecurrence(content, 'ABC123', 'DEF456');
    expect(result?.end.endDate).toEqual(new Date('2099-12-31'));
  });
});
