import { format } from 'date-fns/format';
import { ElementsStructure, WeekcalendarSettings, Weeks } from '../../types';
import { prepareElementStructure } from './prepare-element-structure';

export function prepareWeeks(yyyy: number, weeks: Weeks[], settings: WeekcalendarSettings) {
  const dirPath = settings.paths.weekFolder;
  const template = prepareElementStructure(settings);
  return weeks.map((week, index): [string, ElementsStructure] | null => {
    if (week.yyyy !== yyyy) {
      return null;
    }
    const lastWeekNo = weeks[index - 1].week.toString().padStart(2, '0');
    const weekNo = index.toString().padStart(2, '0');
    const nextWeekNo = weeks[index + 1].week.toString().padStart(2, '0');
    const backLink = `${dirPath}/${weeks[index - 1].yyyy}/weeks/W${lastWeekNo} ${format(week.lastMonday, 'dd.MM.yy')}.md`;
    const fileName = `W${weekNo} ${format(week.monday, 'dd.MM.yy')}.md`;
    const nextLink = `${dirPath}/${weeks[index + 1].yyyy}/weeks/W${nextWeekNo} ${format(week.nextMonday, 'dd.MM.yy')}.md`;
    const linkText = `[[${backLink}|W${lastWeekNo}]] [[${nextLink}|W${nextWeekNo}]]`;
    return [fileName, { ...template, links: [{ type: 'text', content: [linkText] }] }];
  });
}
