import { TFile } from 'obsidian';
import { parseWo } from '../parseWeekFile/parse-wo';
import { setEventIds } from '../parseWeekFile/set-event-ids';
import { stringifyWo } from '../parseWeekFile/stringify-wo';

/**
 * process a file from read to change to write
 * @param fileContent
 * @param file
 * @return changed content
 */
export function processFile(fileContent: string, file: TFile) {
  const [, year, week] = file.path.match(/^\/week-calendar\/([0-9]+)\/WO([0-9])/) ?? [];

  const structuredFile = parseWo(fileContent);
  const originalContent = stringifyWo(structuredFile);
  const changedFileContent = stringifyWo(setEventIds(structuredFile, Number(year), Number(week)));
  if (originalContent === changedFileContent) {
    return '';
  }
  return changedFileContent;
}
