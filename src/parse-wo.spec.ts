import { getLineType, parseWo } from './parse-wo';
import { exampleFile } from './test-data';

describe('Test parse Wochenfile', () => {
  describe('getLineType', () => {
    it('Test all Lines', () => {
      expect(getLineType('# Montag')).toStrictEqual(['key', 'montag']);
      expect(getLineType('#  Dienstag   ')).toStrictEqual(['key', 'dienstag']);
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
      expect(result['montag'][0].type).toStrictEqual('text');
      expect(result['montag'][0].content).toStrictEqual(['# Montag']);
      expect(result['montag'][1].type).toStrictEqual('event');
      expect(result['montag'][1].content[0]).toStrictEqual('- Termin: Geburtstag Charley');
      expect(result['dienstag'][1].content[0]).toStrictEqual('- Termin: EBIL Vorstandssitzung');
      expect(result['dienstag'][1].content[1]).toStrictEqual('  Zeit: 18:20 - 22:00');
      expect(result['dienstag'][1].content[3]).toStrictEqual('  ^woev-1234567abc');

      expect(result['mittwoch'][0].type).toStrictEqual('text');
      expect(result['mittwoch'][0].content[1]).toStrictEqual('');
      expect(result['mittwoch'][0].content[2]).toStrictEqual('Das ist irgend ein Text');
      expect(result['mittwoch'][0].content[4]).toStrictEqual('');
      expect(result['mittwoch'][0].content[5]).toStrictEqual('und noch einer');
      expect(result['donnerstag'][0].type).toStrictEqual('text');
      expect(result['donnerstag'][0].content[1]).toStrictEqual('Ein text ohne Termin');
      expect(result['donnerstag'][1].type).toStrictEqual('event');
      expect(result['donnerstag'][1].content[0]).toStrictEqual('- Termin: Hans Muster');
      expect(result['donnerstag'][1].content[3]).toStrictEqual(
        '  Bermerkung: Wir erkennen uns an der Mütze',
      );
      expect(result['donnerstag'][2].type).toStrictEqual('text');
      expect(result['donnerstag'][2].content[0]).toStrictEqual('');

      expect(result['freitag'][0].content[1]).toStrictEqual('');
      expect(result['freitag'].length).toStrictEqual(1);

      expect(result['samstag'][1].type).toStrictEqual('event');
      expect(result['samstag'][1].content[0]).toStrictEqual('- Termin: EBIL Vorstandssitzung');
      expect(result['samstag'][1].content[3]).toStrictEqual('  ^woev-1234567abc');
      expect(result['samstag'][2].type).toStrictEqual('text');
      expect(result['samstag'][2].content[0]).toStrictEqual('');
      expect(result['samstag'][3].type).toStrictEqual('event');
      expect(result['samstag'][3].content[0]).toStrictEqual('- Termin: Geburtstag Fritzi');
      expect(result['samstag'][5].type).toStrictEqual('event');
      expect(result['samstag'][5].content[0]).toStrictEqual('- Termin: Hans Muster');

      expect(result['sonntag'].length).toStrictEqual(3);
      expect(result['links'].length).toStrictEqual(1);
    });
  });
});
