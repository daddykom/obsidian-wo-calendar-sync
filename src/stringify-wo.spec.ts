import { stringifyWo } from './stringify-wo';
import { ElementStructure } from './types';
import { parseWo } from './parse-wo';
import { exampleFile } from './test-data';

const elementStructure: ElementStructure = {
  key: 'start',
  elements: {
    start: [],
    montag: [],
    dienstag: [],
    mittwoch: [],
    donnerstag: [],
    freitag: [],
    samstag: [],
    sonntag: [],
    links: [],
  },
};

describe('Test stringify Wochenfile', () => {
  const parsed = parseWo(exampleFile);
  describe('stringifyWo', () => {
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
