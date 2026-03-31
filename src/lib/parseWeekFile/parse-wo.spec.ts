import { exampleFile } from '../test-helpers/test-data';
import { getLineType, parseWo } from './parse-wo';

describe('Test parse Wochenfile', () => {
  describe('getLineType', () => {
    it('Test all Lines', () => {
      expect(getLineType('# Montag')).toStrictEqual(['key', 'monday']);
      expect(getLineType('#  Dienstag   ')).toStrictEqual(['key', 'tuesday']);
      expect(getLineType('- Termin: Geburtstag Charley')).toStrictEqual(['event', null]);
      expect(getLineType('Das ist irgend ein Text ')).toStrictEqual(['text', null]);
      expect(getLineType('  Zeit: 22:00 ')).toStrictEqual(['followUp', null]);
      expect(getLineType('# Links')).toStrictEqual(['key', 'links']);
    });
  });
  describe('parseWo', () => {
    it('check parse File', () => {
      const result = parseWo(exampleFile);
      //expect(result).toStrictEqual({});
      expect(result['monday'][0].type).toStrictEqual('text');
      expect(result['monday'][0].content).toStrictEqual(['# Montag']);
      expect(result['monday'][1].type).toStrictEqual('event');
      expect(result['monday'][1].content[0]).toStrictEqual('- Termin: Geburtstag Charley');
      expect(result['tuesday'][1].content[0]).toStrictEqual('- Termin: EBIL Vorstandssitzung');
      expect(result['tuesday'][1].content[1]).toStrictEqual('  Zeit: 18:20 - 22:00');
      expect(result['tuesday'][1].content[3]).toStrictEqual('  ^woev-1234567abc');

      expect(result['wednesday'][0].type).toStrictEqual('text');
      expect(result['wednesday'][0].content[1]).toStrictEqual('');
      expect(result['wednesday'][0].content[2]).toStrictEqual('Das ist irgend ein Text');
      expect(result['wednesday'][0].content[4]).toStrictEqual('');
      expect(result['wednesday'][0].content[5]).toStrictEqual('und noch einer');
      expect(result['thursday'][0].type).toStrictEqual('text');
      expect(result['thursday'][0].content[1]).toStrictEqual('Ein text ohne Termin');
      expect(result['thursday'][1].type).toStrictEqual('event');
      expect(result['thursday'][1].content[0]).toStrictEqual('- Termin: Hans Muster');
      expect(result['thursday'][1].content[3]).toStrictEqual(
        '  Bermerkung: Wir erkennen uns an der Mütze',
      );
      expect(result['thursday'][2].type).toStrictEqual('text');
      expect(result['thursday'][2].content[0]).toStrictEqual('');

      expect(result['friday'][0].content[1]).toStrictEqual('');
      expect(result['friday'].length).toStrictEqual(1);

      expect(result['saturday'][1].type).toStrictEqual('event');
      expect(result['saturday'][1].content[0]).toStrictEqual('- Termin: EBIL Vorstandssitzung');
      expect(result['saturday'][1].content[3]).toStrictEqual('  ^woev-1234567abc');
      expect(result['saturday'][2].type).toStrictEqual('text');
      expect(result['saturday'][2].content[0]).toStrictEqual('');
      expect(result['saturday'][3].type).toStrictEqual('event');
      expect(result['saturday'][3].content[0]).toStrictEqual('- Termin: Geburtstag Fritzi');
      expect(result['saturday'][5].type).toStrictEqual('event');
      expect(result['saturday'][5].content[0]).toStrictEqual('- Termin: Hans Muster');

      expect(result['sunday'].length).toStrictEqual(3);
      expect(result['links'].length).toStrictEqual(1);
    });
  });
});
