import { App, Notice, TFile } from 'obsidian';
import { EventElement, Recurrence, WeekcalendarSettings, WoFileTitleStructure, ElementsStructure } from '../types';
import { generateOccurrences } from './occurrence-calculation';
import {
  findWeekFilesForRange,
  removeRecurringEventsFromFile,
  insertRecurringEventIntoFile,
  getWeekFilePath,
  readWeekFile,
} from './file-operations';
import { DeleteRecurrenceModal, DeleteRecurrenceResult } from './ui/delete-recurrence-modal';
import { stringifyWo } from '../parseWeekFile/stringify-wo';

export async function deleteRecurringEvent(
  recurrenceId: string,
  recurrence: Recurrence,
  deletedDate: Date,
  settings: WeekcalendarSettings,
  app: App
): Promise<'deleted' | 'cancelled'> {
  return new Promise((resolve) => {
    new DeleteRecurrenceModal(app, async (result: DeleteRecurrenceResult) => {
      if (result === 'cancel') {
        resolve('cancelled');
        return;
      }

      if (result === 'all') {
        const files = await findWeekFilesForRange(
          deletedDate,
          recurrence.end.endDate,
          settings,
          app
        );
        for (const file of files) {
          await removeRecurringEventsFromFile(file, recurrenceId, false, settings, app);
        }
        new Notice('Alle Folgetermine gelöscht');
        resolve('deleted');
        return;
      }

      if (result === 'single') {
        const dayBefore = new Date(deletedDate);
        dayBefore.setDate(dayBefore.getDate() - 1);

        const dayBeforeStr = `${dayBefore.getDate().toString().padStart(2, '0')}.${(dayBefore.getMonth() + 1).toString().padStart(2, '0')}.${dayBefore.getFullYear()}`;

        const filePath = getWeekFilePath(deletedDate, settings);
        const { elements, exists } = await readWeekFile(filePath, settings, app);

        if (exists) {
          let updated = false;
          const sections = Object.keys(elements) as WoFileTitleStructure[];
          for (const section of sections) {
            const sectionElements = elements[section];
            for (let i = 0; i < sectionElements.length; i++) {
              const element = sectionElements[i];
              if (element.type === 'event' && element.recurrenceId === recurrenceId) {
                const updatedContent = element.content.map((line: string) => {
                  if (line.match(/^\s*WiederholungEnde:/i)) {
                    updated = true;
                    return `  WiederholungEnde: ${dayBeforeStr}`;
                  }
                  return line;
                });
                sectionElements[i] = { ...element, content: updatedContent };
              }
            }
          }

          if (updated) {
            const abstractFile = app.vault.getAbstractFileByPath(filePath);
            if (abstractFile instanceof TFile) {
              await app.vault.modify(abstractFile, stringifyWo(elements));
            }
          }
        }

        const files = await findWeekFilesForRange(
          deletedDate,
          recurrence.end.endDate,
          settings,
          app
        );
        for (const file of files) {
          await removeRecurringEventsFromFile(file, recurrenceId, true, settings, app);
        }

        new Notice(`Wiederholung endet am ${dayBeforeStr}`);
        resolve('deleted');
        return;
      }
    }).open();
  });
}

export async function updateRecurringEvent(
  originalEvent: EventElement,
  newContent: string[],
  recurrence: Recurrence,
  startDate: Date,
  settings: WeekcalendarSettings,
  app: any
): Promise<void> {
  const occurrences = generateOccurrences(startDate, recurrence.end.endDate, recurrence);

  for (const date of occurrences) {
    if (date <= startDate) continue;

    const filePath = getWeekFilePath(date, settings);
    const newEvent: EventElement = {
      ...originalEvent,
      content: newContent,
      eventId: '',
      isException: false,
    };

    await insertRecurringEventIntoFile(filePath, newEvent, date, settings, app);
  }
}
