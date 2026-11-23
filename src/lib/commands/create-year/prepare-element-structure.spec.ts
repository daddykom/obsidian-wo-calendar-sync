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

    const result = prepareElementStructure(settings, new Date(2026, 10, 23));

    expect(result).toEqual({
      start: [],
      monday: [{ type: 'text', content: ['# Montag (23)', ''] }],
      tuesday: [{ type: 'text', content: ['# Dienstag (24)', ''] }],
      wednesday: [{ type: 'text', content: ['# Mittwoch (25)', ''] }],
      thursday: [{ type: 'text', content: ['# Donnerstag (26)', ''] }],
      friday: [{ type: 'text', content: ['# Freitag (27)', ''] }],
      saturday: [{ type: 'text', content: ['# Samstag (28)', ''] }],
      sunday: [{ type: 'text', content: ['# Sonntag (29)', ''] }],
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

    const result = prepareElementStructure(settings, new Date(2026, 10, 23));

    expect(result.start).toEqual([]);
  });
});
