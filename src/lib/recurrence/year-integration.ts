import { App } from 'obsidian';
import {
  EventElement,
  Recurrence,
  WeekcalendarSettings,
  woFileTitleStructure,
} from '../types';
import { parseRecurrence } from './parse-recurrence';
import { generateOccurrences } from './occurrence-calculation';
import {
  findWeekFilesForRange,
  insertRecurringEventIntoFile,
  getWeekFilePath,
  readWeekFile,
} from './file-operations';

export async function copyRecurringEventsFromYear(
  sourceYear: number,
  targetYear: number,
  settings: WeekcalendarSettings,
  app: App
): Promise<{ eventsCopied: number; occurrencesCreated: number }> {
  const sourceStart = new Date(sourceYear, 0, 1);
  const sourceEnd = new Date(sourceYear, 11, 31);
  const targetStart = new Date(targetYear, 0, 1);
  const targetEnd = new Date(targetYear, 11, 31);

  const sourceFiles = await findWeekFilesForRange(sourceStart, sourceEnd, settings, app);

  let eventsCopied = 0;
  let occurrencesCreated = 0;

  for (const filePath of sourceFiles) {
    const { elements, exists } = await readWeekFile(filePath, settings, app);
    if (!exists) continue;

    for (const section of woFileTitleStructure) {
      if (section === 'start' || section === 'links') continue;

      for (const element of elements[section]) {
        if (element.type !== 'event') continue;

        const eventElement = element as EventElement;
        if (!eventElement.recurrenceId) continue;

        const recurrence = parseRecurrence(
          eventElement.content,
          eventElement.eventId,
          eventElement.recurrenceId
        );

        if (!recurrence) continue;

        if (recurrence.end.endDate < targetStart) continue;

        const effectiveEndDate =
          recurrence.end.endDate > targetEnd ? targetEnd : recurrence.end.endDate;

        const occurrences = generateOccurrences(targetStart, effectiveEndDate, recurrence);

        for (const date of occurrences) {
          const targetFilePath = getWeekFilePath(date, settings);
          await insertRecurringEventIntoFile(
            targetFilePath,
            eventElement,
            date,
            settings,
            app
          );
          occurrencesCreated++;
        }

        eventsCopied++;
      }
    }
  }

  return { eventsCopied, occurrencesCreated };
}

export async function findRecurringEventsInYear(
  year: number,
  settings: WeekcalendarSettings,
  app: App
): Promise<{ event: EventElement; filePath: string; recurrence: Recurrence }[]> {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const files = await findWeekFilesForRange(yearStart, yearEnd, settings, app);

  const recurringEvents: { event: EventElement; filePath: string; recurrence: Recurrence }[] = [];

  for (const filePath of files) {
    const { elements, exists } = await readWeekFile(filePath, settings, app);
    if (!exists) continue;

    for (const section of woFileTitleStructure) {
      if (section === 'start' || section === 'links') continue;

      for (const element of elements[section]) {
        if (element.type !== 'event') continue;

        const eventElement = element as EventElement;
        if (!eventElement.recurrenceId) continue;

        const recurrence = parseRecurrence(
          eventElement.content,
          eventElement.eventId,
          eventElement.recurrenceId
        );

        if (!recurrence) continue;

        recurringEvents.push({
          event: eventElement,
          filePath,
          recurrence,
        });
      }
    }
  }

  return recurringEvents;
}
