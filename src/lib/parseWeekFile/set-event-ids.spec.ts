import { exampleFile } from '../test-helpers/test-data';
import { parseWo } from './parse-wo';
import { setEventIds } from './set-event-ids';

describe('Set Event Ids', () => {
  const parsed = parseWo(exampleFile);
  const result = setEventIds(parsed, 2026, 17);
  describe('setEventIds', () => {
    it('It exists', () => {
      typeof expect(setEventIds).toBeDefined();
    });
    it('has event id, does nothing', () => {
      expect(result['tuesday'].length).toBe(3);
      expect(result['tuesday'][1].content.length).toBe(4);
      expect(result['tuesday'][1].content[3]).toMatch(/^  \^woev-/);
    });
    it('has event no id, adds one', () => {
      expect(result['thursday'][1].content.length).toBe(5);
      expect(result['thursday'][1].content[4]).toMatch(/^  \^woev-/);
    });
    it('text has no id', () => {
      expect(result['wednesday'][0].content.length).toBe(7);
      expect(result['wednesday'][0].content[6]).not.toMatch(/^  \^woev-/);
    });
  });
});
