import { DEFAULT_SETTINGS } from '../settings/constants';
import { exampleFile } from '../test-helpers/test-data';
import { WoFileStructure } from '../types';
import { parseWo } from './parse-wo';
import { stringifyWo } from './stringify-wo';

const elementStructure: WoFileStructure = {
  key: 'start',
  elements: {
    start: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
    links: [],
  },
};

describe('Test stringify Wochenfile', () => {
  const parsed = parseWo(exampleFile);
  describe('stringifyWo', () => {
    it.each([
      ['dated headings', '# Montag (23)', '# Dienstag (24)'],
      ['mixed old and dated headings', '# Montag', '# Dienstag (24)'],
    ])('preserves %s, event IDs, recurrence metadata and free text', (_name, monday, tuesday) => {
      const content = [
        monday,
        '',
        '- Termin: Besprechung',
        '  Zeit: 10:00',
        '  ^woev-abc123',
        '',
        '# Eigene Notizen',
        'Freitext bleibt erhalten.',
        '',
        tuesday,
        '- Termin: Serie',
        '  Wiederholung: wöchentlich',
        '  ^woev-def456',
        '  ^woev-rec-series123',
        '',
        '# Links',
        '[[Vorige Woche]] [[Nächste Woche]]',
      ].join('\n');

      expect(stringifyWo(parseWo(content))).toBe(content);
    });

    it('preserves configured weekday names with spaces and accents', () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        weekdays: { ...DEFAULT_SETTINGS.weekdays, monday: 'Jour férié' },
      };
      const content = '# Jour férié (23)\n- Termin: Besprechung\n  ^woev-abc123';

      expect(stringifyWo(parseWo(content, settings))).toBe(content);
    });

    it('exists', () => {
      const result = stringifyWo(elementStructure.elements);
      expect(result).toBe('');
    });
    it('bring back same as original', () => {
      const result = stringifyWo(parsed);
      expect(result).toEqual(exampleFile);
    });
  });
});
