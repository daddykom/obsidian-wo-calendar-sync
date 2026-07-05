import { WeekcalendarSettings } from '../../types';
import { prepareElementStructure } from './prepare-element-structure';

describe('prepareElementStructure', () => {
  it('should create the default element structure from weekday settings', () => {
    const settings: WeekcalendarSettings = {
      paths: { weekFolder: '', eventFolder: '', overviewFileName: '' },
      weekdays: {
        start: 'Start',
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag',
        links: 'Links',
      },
      prefixes: { event: '', time: '', location: '', reminder: '', repeat: '' },
      caldav: { url: '', username: '', password: '', calendar: '' },
    };

    const result = prepareElementStructure(settings);

    expect(result).toEqual({
      start: [],
      monday: [{ type: 'text', content: ['# Montag', ''] }],
      tuesday: [{ type: 'text', content: ['# Dienstag', ''] }],
      wednesday: [{ type: 'text', content: ['# Mittwoch', ''] }],
      thursday: [{ type: 'text', content: ['# Donnerstag', ''] }],
      friday: [{ type: 'text', content: ['# Freitag', ''] }],
      saturday: [{ type: 'text', content: ['# Samstag', ''] }],
      sunday: [{ type: 'text', content: ['# Sonntag', ''] }],
      links: [{ type: 'text', content: ['# Links', ''] }],
    });
  });

  it('should return an empty array for start', () => {
    const settings: WeekcalendarSettings = {
      paths: { weekFolder: '', eventFolder: '', overviewFileName: '' },
      weekdays: {
        start: 'Start',
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag',
        links: 'Links',
      },
      prefixes: { event: '', time: '', location: '', reminder: '', repeat: '' },
      caldav: { url: '', username: '', password: '', calendar: '' },
    };

    const result = prepareElementStructure(settings);

    expect(result.start).toEqual([]);
  });
});
