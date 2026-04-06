import { TFile } from 'obsidian';
import { parseWo } from '../parseWeekFile/parse-wo';
import { setEventIds } from '../parseWeekFile/set-event-ids';
import { stringifyWo } from '../parseWeekFile/stringify-wo';
import { WeekcalendarSettings } from '../types';

/**
 * process a file from read to change to write
 * @param fileContent
 * @param file
 * @param settings
 * @return changed content
 */
export function processFile(fileContent: string, file: TFile, settings: WeekcalendarSettings) {
  const regex = new RegExp(`^${settings.paths.weekFolder}/([0-9]+)/weeks/W([0-9])`);
  const [, year, week] = file.path.match(regex) ?? [];
  const structuredFile = parseWo(fileContent);
  const originalContent = stringifyWo(structuredFile);
  const changedFileContent = stringifyWo(setEventIds(structuredFile, Number(year), Number(week)));
  if (originalContent === changedFileContent) {
    return '';
  }
  return changedFileContent;
}
