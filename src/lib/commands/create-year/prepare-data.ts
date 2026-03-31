import { Weeks } from '../../types';
import { beforeAWeek, getIsoWeek1Monday, inAWeek } from '../../utils/util';

/**
 * prepairs the data for all week files of the year
 * @param yyyy
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
