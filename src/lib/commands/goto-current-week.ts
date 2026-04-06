import { getISOWeek } from 'date-fns/getISOWeek';
import { getISOWeekYear } from 'date-fns/getISOWeekYear';
import { WeekcalendarSettings } from '../types';
import { getLastMonday, getWeekFileName } from '../utils/util';

export const gotoCurrentWeek = (app: any, settings: WeekcalendarSettings) => async () => {
  const monday = getLastMonday(new Date());
  const week = getISOWeek(monday);
  const fileName = getWeekFileName(monday, week);
  const year = getISOWeekYear(monday);
  const filePath = `${year}/${settings.paths.weekFolder}/${fileName}`;
  app.workspace.openLinkText(filePath, '', false);
};
