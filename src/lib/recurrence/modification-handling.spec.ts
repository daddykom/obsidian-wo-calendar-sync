import {
  compareEventContent,
} from './modification-handling';

describe('compareEventContent', () => {
  it('returns true for identical content', () => {
    const content1 = [
      '- Termin: Team Meeting',
      '  Zeit: 09:00 - 10:00',
      '  Ort: Büro',
    ];
    const content2 = [
      '- Termin: Team Meeting',
      '  Zeit: 09:00 - 10:00',
      '  Ort: Büro',
    ];
    expect(compareEventContent(content1, content2)).toBe(true);
  });

  it('returns false for different content', () => {
    const content1 = [
      '- Termin: Team Meeting',
      '  Zeit: 09:00 - 10:00',
    ];
    const content2 = [
      '- Termin: Team Meeting',
      '  Zeit: 10:00 - 11:00',
    ];
    expect(compareEventContent(content1, content2)).toBe(false);
  });

  it('returns false for different length', () => {
    const content1 = ['- Termin: Team Meeting'];
    const content2 = ['- Termin: Team Meeting', '  Zeit: 09:00'];
    expect(compareEventContent(content1, content2)).toBe(false);
  });

  it('detects whitespace differences', () => {
    const content1 = ['- Termin: Team Meeting', '  Zeit: 09:00'];
    const content2 = ['- Termin: Team Meeting', '  Zeit:  09:00'];
    expect(compareEventContent(content1, content2)).toBe(false);
  });
});
