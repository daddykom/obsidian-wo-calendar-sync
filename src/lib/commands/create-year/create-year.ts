import { Notice } from 'obsidian';
import { WeekcalendarSettings } from '../../types';
import { CreateYearPrompt } from '../../ui/create-year-prompt';
import { createYearFile } from './create-year-file';
import { prepareData } from './prepare-data';
import { prepareWeeks } from './prepare-weeks';
import { writeWeekFiles } from './write-week-files';

export const createYear = (app: any, settings: WeekcalendarSettings) => async () => {
  new CreateYearPrompt(app, async (year) => {
    try {
      const yyyy = Number.parseInt(year, 10);

      const lastYear = prepareData(yyyy - 1);
      const nextYear = prepareData(yyyy + 1);
      const weeks = prepareData(yyyy);
      const expandedWeeks = [lastYear[lastYear.length - 1], ...weeks, nextYear[0]];

      const preparedWeeks = prepareWeeks(yyyy, expandedWeeks, settings);
      const numbFiles = await writeWeekFiles(yyyy, preparedWeeks, settings, app);
      createYearFile(yyyy, weeks, settings, app);

      new Notice(
        `Total ${weeks.length} Wochen, davon ${weeks.length - numbFiles} erstellt, ${numbFiles} existierten schon`,
      );
    } catch (error) {
      console.error(error);
      new Notice('Fehler beim Erstellen der Wochen-Dateien');
    }
  }).open();
};
