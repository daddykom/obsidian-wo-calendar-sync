import { App, TFile } from 'obsidian';
import { format } from 'date-fns/format';
import {
  ElementsStructure,
  EventElement,
  WeekcalendarSettings,
  WoFileTitleStructure,
  woFileTitleStructure,
} from '../types';
import { parseWo } from '../parseWeekFile/parse-wo';
import { stringifyWo } from '../parseWeekFile/stringify-wo';
import { getWeekdayFromDate } from './occurrence-calculation';

const WEEKDAY_MAP: Record<string, WoFileTitleStructure> = {
  Mo: 'monday',
  Di: 'tuesday',
  Mi: 'wednesday',
  Do: 'thursday',
  Fr: 'friday',
  Sa: 'saturday',
  So: 'sunday',
};

export function getWeekFilePath(
  date: Date,
  settings: WeekcalendarSettings
): string {
  const year = date.getFullYear();
  const monday = getMondayOfWeek(date);
  const weekNo = getWeekNumber(date);
  const fileName = `W${weekNo.toString().padStart(2, '0')} ${format(monday, 'dd.MM.yy')}.md`;
  return `${settings.paths.weekFolder}/${year}/weeks/${fileName}`;
}

export function getWeekFileTitle(date: Date): string {
  const monday = getMondayOfWeek(date);
  const weekNo = getWeekNumber(date);
  return `W${weekNo.toString().padStart(2, '0')} ${format(monday, 'dd.MM.yy')}`;
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export { getMondayOfWeek };

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getWeekdaySection(date: Date): WoFileTitleStructure {
  const wd = getWeekdayFromDate(date);
  return WEEKDAY_MAP[wd];
}

export async function findWeekFilesForRange(
  startDate: Date,
  endDate: Date,
  settings: WeekcalendarSettings,
  app: App
): Promise<string[]> {
  const files: string[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const filePath = getWeekFilePath(current, settings);
    const abstractFile = app.vault.getAbstractFileByPath(filePath);
    if (abstractFile instanceof TFile) {
      files.push(filePath);
    }
    current.setDate(current.getDate() + 7);
  }

  return files;
}

export async function insertRecurringEventIntoFile(
  filePath: string,
  event: EventElement,
  date: Date,
  settings: WeekcalendarSettings,
  app: App
): Promise<void> {
  const abstractFile = app.vault.getAbstractFileByPath(filePath);
  if (!(abstractFile instanceof TFile)) {
    return;
  }

  const content = await app.vault.read(abstractFile);
  const elements = parseWo(content, settings);
  const section = getWeekdaySection(date);

  const newElements = [...elements[section], event];
  const updatedElements: ElementsStructure = {
    ...elements,
    [section]: newElements,
  };

  await app.vault.modify(abstractFile, stringifyWo(updatedElements));
}

export async function removeRecurringEventsFromFile(
  filePath: string,
  recurrenceId: string,
  keepOriginal: boolean,
  settings: WeekcalendarSettings,
  app: App
): Promise<void> {
  const abstractFile = app.vault.getAbstractFileByPath(filePath);
  if (!(abstractFile instanceof TFile)) {
    return;
  }

  const content = await app.vault.read(abstractFile);
  const elements = parseWo(content, settings);

  const updatedElements: ElementsStructure = {} as ElementsStructure;

  for (const key of woFileTitleStructure) {
    updatedElements[key] = elements[key].filter((element) => {
      if (element.type !== 'event') {
        return true;
      }
      const eventElement = element as EventElement;
      if (eventElement.recurrenceId !== recurrenceId) {
        return true;
      }
      if (keepOriginal && eventElement.eventId) {
        return true;
      }
      return false;
    });
  }

  await app.vault.modify(abstractFile, stringifyWo(updatedElements));
}

export async function readWeekFile(
  filePath: string,
  settings: WeekcalendarSettings,
  app: App
): Promise<{ elements: ElementsStructure; exists: boolean }> {
  const abstractFile = app.vault.getAbstractFileByPath(filePath);
  if (!(abstractFile instanceof TFile)) {
    return { elements: {} as ElementsStructure, exists: false };
  }

  const content = await app.vault.read(abstractFile);
  const elements = parseWo(content, settings);
  return { elements, exists: true };
}
