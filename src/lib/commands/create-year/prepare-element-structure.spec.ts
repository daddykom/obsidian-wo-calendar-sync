import { prepareElementStructure } from './prepare-element-structure';

describe('prepareElementStructure', () => {
  it('should create the default element structure from weekday settings', () => {
    const settings = {
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
    } as any;

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
    const settings = {
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
    } as any;

    const result = prepareElementStructure(settings);

    expect(result.start).toEqual([]);
  });
});
