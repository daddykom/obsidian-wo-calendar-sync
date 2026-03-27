import { format } from 'date-fns/format';
import { App, Notice } from 'obsidian';
import { stringifyWo } from '../parseWeekFile/stringify-wo';
import { ElementsStructure, WeekcalendarSettings, Weeks, WoFileStructure } from '../types';
import { CreateYearPrompt } from '../ui/create-year-prompt';
import { beforeAWeek, getIsoWeek1Monday, inAWeek } from '../utils/util';

export const createYear = (app: any, settings: WeekcalendarSettings) => async () => {
  new CreateYearPrompt(app, (year) => {
    const yyyy = Number.parseInt(year, 10);

    const lastYear = prepareData(yyyy - 1);
    const nextYear = prepareData(yyyy + 1);
    const weeks = prepareData(yyyy);
    const expandedWeeks = [lastYear[lastYear.length - 1], ...weeks, nextYear[0]];

    const preparedWeeks = prepareWeeks(yyyy, expandedWeeks, settings);
    const numbFiles = writeWeekFiles(yyyy, preparedWeeks, settings, app);
    new Notice(
      `Total ${weeks.length} Wochen, davon ${weeks.length - numbFiles} erstellt, ${numbFiles} existierten schon`,
    );
  }).open();
};

/**
 * prepairs the data for all week files of the year
 * @param year
 */
export function prepareData(yyyy: number): Weeks[] {
  const firstDay = getIsoWeek1Monday(yyyy);
  const firstDayNextYear = getIsoWeek1Monday(yyyy + 1);
  const weeks: Weeks[] = [];
  let week = 0;
  for (let monday = firstDay; monday < firstDayNextYear; monday = inAWeek(monday)) {
    weeks.push({
      monday,
      lastMonday: beforeAWeek(monday),
      nextMonday: inAWeek(monday),
      week: (week += 1),
      yyyy,
    });
  }
  return weeks;
}

export function prepareWeeks(yyyy: number, weeks: Weeks[], settings: WeekcalendarSettings) {
  const dirPath = settings.paths.weekFolder;
  const weekPath = `${dirPath}/${yyyy.toString()}/weeks`;
  const template = prepareElementStructure(settings);
  const preparedWeeks = weeks.map((week, index): [string, ElementsStructure] | null => {
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
  return preparedWeeks;
}

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

export function writeWeekFiles(
  yyyy: number,
  weeks: ([string, ElementsStructure] | null)[],
  settings: WeekcalendarSettings,
  app: App,
) {
  const path = settings.paths.weekFolder;
  const yearPath = `${path}/${yyyy.toString()}`;
  const weekPath = `${yearPath}/weeks`;
  if (!app.vault.getAbstractFileByPath(path)) {
    app.vault.createFolder(path);
  }
  createFolderIfNotExist(weekPath, app);
  let numbExists = 0;
  weeks.forEach((item) => {
    if (!item) {
      return;
    }
    const [fileName, week] = item;
    const path = `${weekPath}/${fileName}`;
    if (app.vault.getAbstractFileByPath(path)) {
      numbExists++;
      return;
    }
    console.log('create', path, stringifyWo(week));
    app.vault.create(path, stringifyWo(week));
  });
  return numbExists;
}

export function createFolderIfNotExist(path: string, app: App) {
  const segments = path.split('/');
  const paths = segments.reduce((acc, item) => {
    if (acc.length) {
      return [...acc, `${acc[acc.length - 1]}/${item}`];
    }
    return [item];
  }, [] as string[]);
  paths.forEach((path) => {
    if (!app.vault.getAbstractFileByPath(path)) {
      app.vault.createFolder(path);
    }
  });
}
