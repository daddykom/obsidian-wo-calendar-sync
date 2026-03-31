import { format } from 'date-fns/format';
import { App, Notice, TFile } from 'obsidian';
import { WeekcalendarSettings, Weeks } from '../../types';
import { createFolderIfNotExist } from '../../utils/create-folder-if-not-exist';

/**
 * Create Overview File
 * @param yyyy
 * @param weeks
 * @param settings
 * @param app
 */
export async function createYearFile(
  yyyy: number,
  weeks: Weeks[],
  settings: WeekcalendarSettings,
  app: App,
) {
  const path = settings.paths.weekFolder;
  const yearPath = `${path}/${yyyy.toString()}`;
  const weekPath = `${yearPath}/weeks`;

  const weekStrings = weeks.map((week) => {
    const weekNo = week.week.toString().padStart(2, '0');
    const monday = format(week.monday, 'dd.MM.yy');
    const fileName = `W${weekNo} ${monday}`;
    return `<b>[[${weekPath}/${fileName}\\|W${weekNo}]]</b><br>${monday.substring(0, 5)}`;
  });

  const weekArray = weekStrings
    .reduce((acc, week, i) => {
      const x = i % 7;
      const row = x ? (acc[acc.length - 1] ?? []) : [];
      const newRow = [...row, week];
      if (x === 0) {
        return [...acc, newRow];
      } else {
        return [...acc.toSpliced(-1), newRow];
      }
    }, [] as string[][])
    .reverse();

  const header = makeRow(Array(7).fill(' '));
  const headerLine = makeRow(Array(7).fill('---'));
  const body = weekArray.map((week) => makeRow(week)).join('\n');

  const fileContent = `# ${yyyy.toString()}\n\n${header}\n${headerLine}\n${body}`;
  const filePath = `${yearPath}/${settings.paths.overviewFileName}.md`;
  await createFolderIfNotExist(weekPath, app);
  const file = app.vault.getAbstractFileByPath(filePath);
  if (file instanceof TFile) {
    await app.vault.modify(file, fileContent);
    new Notice(`${filePath} wurde angepasst`);
    return;
  }
  if (file) {
    new Notice(`Der Pfad ${filePath} ist ein Ordner und keine Datei`);
    return;
  }
  await app.vault.create(filePath, fileContent);
  new Notice(`${filePath} wurde erstellt`);
}

const makeRow = (line: string[]) => {
  const strLine = line.join('|');
  return `|${strLine}|`;
};
