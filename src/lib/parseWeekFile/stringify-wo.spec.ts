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
