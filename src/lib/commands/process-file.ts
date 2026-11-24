import { TFile } from 'obsidian';
import { parseWo } from '../parseWeekFile/parse-wo';
import { setEventIds } from '../parseWeekFile/set-event-ids';
import { stringifyWo } from '../parseWeekFile/stringify-wo';
import { WeekcalendarSettings } from '../types';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getWeekFileInfo(
  filePath: string,
  weekFolder: string,
): { year: number; week: number } | null {
  const matcher = new RegExp(
    `^${escapeRegExp(weekFolder)}/(\\d{4})/weeks/W(\\d{1,2})(?:\\s|$)`,
  );
  const match = filePath.match(matcher);
  if (!match) return null;

  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(week) || week < 1 || week > 53) {
    return null;
  }
  return { year, week };
}

/**
 * process a file from read to change to write
 * @param fileContent
 * @param file
 * @param settings
 * @return changed content
 */
export function processFile(fileContent: string, file: TFile, settings: WeekcalendarSettings) {
  const weekFileInfo = getWeekFileInfo(file.path, settings.paths.weekFolder);
  if (!weekFileInfo) return '';

  const structuredFile = parseWo(fileContent, settings);
  const originalContent = stringifyWo(structuredFile);
  const changedFileContent = stringifyWo(
    setEventIds(structuredFile, weekFileInfo.year, weekFileInfo.week),
  );
  if (originalContent === changedFileContent) {
    return '';
  }
  return changedFileContent;
}
