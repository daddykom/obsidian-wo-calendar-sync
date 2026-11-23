import { WeekcalendarSettings, WoFileStructure, woFileTitleStructure } from '../../types';
import { formatDayHeading } from '../../utils/format-day-heading';

export function prepareElementStructure(
  settings: WeekcalendarSettings,
  monday: Date,
): WoFileStructure['elements'] {
  return woFileTitleStructure.reduce(
    (acc, key) => {
      const name = settings.weekdays[key];
      const text =
        key === 'start' ? '' : key === 'links' ? `# ${name}` : formatDayHeading(monday, key, name);
      return {
        ...acc,
        [key]: key !== 'start' ? [{ type: 'text', content: [text, ''] }] : [],
      };
    },
    {} as WoFileStructure['elements'],
  );
}
