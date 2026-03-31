import { WeekcalendarSettings, WoFileStructure } from '../../types';

export function prepareElementStructure(
  settings: WeekcalendarSettings,
): WoFileStructure['elements'] {
  return Object.entries(settings.weekdays).reduce(
    (acc, [key, name]) => {
      const text = key !== 'start' ? `# ${name}` : '';
      return {
        ...acc,
        [key]: key !== 'start' ? [{ type: 'text', content: [text, ''] }] : [],
      };
    },
    {} as WoFileStructure['elements'],
  );
}
