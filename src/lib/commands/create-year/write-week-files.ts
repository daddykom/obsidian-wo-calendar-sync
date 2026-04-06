import { App } from 'obsidian';
import { stringifyWo } from '../../parseWeekFile/stringify-wo';
import { ElementsStructure, WeekcalendarSettings } from '../../types';
import { createFolderIfNotExist } from '../../utils/create-folder-if-not-exist';

export async function writeWeekFiles(
  yyyy: number,
  weeks: ([string, ElementsStructure] | null)[],
  settings: WeekcalendarSettings,
  app: App,
) {
  const path = settings.paths.weekFolder;
  const yearPath = `${path}/${yyyy.toString()}`;
  const weekPath = `${yearPath}/weeks`;

  if (!app.vault.getAbstractFileByPath(path)) {
    await app.vault.createFolder(path);
  }

  await createFolderIfNotExist(weekPath, app);

  let numbExists = 0;

  for (const item of weeks) {
    if (!item) {
      continue;
    }

    const [fileName, week] = item;
    const filePath = `${weekPath}/${fileName}`;

    if (app.vault.getAbstractFileByPath(filePath)) {
      numbExists++;
      continue;
    }

    await app.vault.create(filePath, stringifyWo(week));
  }

  return numbExists;
}
