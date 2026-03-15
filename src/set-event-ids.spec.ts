import { getLineType, parseWo } from './parse-wo';
import { setEventIds } from './set-event-ids';
import { exampleFile } from './test-data';

describe('Set Event Ids', () => {
  const parsed = parseWo(exampleFile);
  const result = setEventIds(parsed, 2026, 17);
  describe('setEventIds', () => {
    it('It exists', () => {
      typeof expect(setEventIds).toBeDefined();
    });
    it('has event id, does nothing', () => {
      expect(result['dienstag'].length).toBe(3);
      expect(result['dienstag'][1].content.length).toBe(4);
      expect(result['dienstag'][1].content[3]).toMatch(/^  \^woev-/);
    });
    it('has event no id, adds one', () => {
      expect(result['donnerstag'][1].content.length).toBe(5);
      expect(result['donnerstag'][1].content[4]).toMatch(/^  \^woev-/);
    });
    it('text has no id', () => {
      expect(result['mittwoch'][0].content.length).toBe(7);
      expect(result['mittwoch'][0].content[6]).not.toMatch(/^  \^woev-/);
    });
  });
});
