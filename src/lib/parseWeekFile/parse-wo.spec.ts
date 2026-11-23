import { DEFAULT_SETTINGS } from '../settings/constants';
import { exampleFile } from '../test-helpers/test-data';
import { getLineType, parseWo } from './parse-wo';

describe('Test parse Wochenfile', () => {
  describe('getLineType', () => {
    it.each([
      ['# Montag (23)', 'monday'],
      ['# Dienstag (24)', 'tuesday'],
      ['# Mittwoch (25)', 'wednesday'],
      ['# Donnerstag (26)', 'thursday'],
      ['# Freitag (27)', 'friday'],
      ['# Samstag (28)', 'saturday'],
      ['# Sonntag (29)', 'sunday'],
      ['#  montag (1)   ', 'monday'],
    ])('recognizes the dated heading %s', (heading, key) => {
      expect(getLineType(heading)).toStrictEqual(['key', key]);
    });

    it.each(['# Jour férié', '# Jour férié (23)'])('recognizes configured names: %s', (heading) => {
      const settings = {
        ...DEFAULT_SETTINGS,
        weekdays: { ...DEFAULT_SETTINGS.weekdays, monday: 'Jour férié' },
      };

      expect(getLineType(heading, settings)).toStrictEqual(['key', 'monday']);
    });

    it.each(['# Notizen', '# Montag Zusatz', '# Montag (Notiz)', '# Montag (23) Zusatz'])(
      'treats an unrecognized heading as text: %s',
      (heading) => {
        expect(getLineType(heading)).toStrictEqual(['text', null]);
      },
    );

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
    it('keeps events and IDs in their dated weekday sections', () => {
      const content = [
        '# Montag (23)',
        '- Termin: Besprechung',
        '  Zeit: 10:00',
        '  ^woev-abc123',
        '# Dienstag (24)',
        '- Termin: Serie',
        '  Wiederholung: wöchentlich',
        '  ^woev-def456',
        '  ^woev-rec-series123',
      ].join('\n');

      const result = parseWo(content);

      expect(result.monday[0].content).toEqual(['# Montag (23)']);
      expect(result.monday[1]).toMatchObject({ type: 'event', eventId: 'abc123' });
      expect(result.tuesday[0].content).toEqual(['# Dienstag (24)']);
      expect(result.tuesday[1]).toMatchObject({
        type: 'event',
        eventId: 'def456',
        recurrenceId: 'series123',
      });
    });

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
