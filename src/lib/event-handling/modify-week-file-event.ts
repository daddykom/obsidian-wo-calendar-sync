import { App, Notice, TFile } from 'obsidian';
import {
  catchError,
  debounce,
  filter,
  from,
  map,
  Observable,
  of,
  race,
  switchMap,
  timer,
} from 'rxjs';
import { processFile } from '../commands/process-file';
import { parseWo } from '../parseWeekFile/parse-wo';
import { WO_FILE_REGEX } from '../settings/constants';
import { WeekcalendarSettings, EventElement, WoFileTitleStructure, Recurrence } from '../types';
import { parseRecurrence } from '../recurrence/parse-recurrence';
import { findWeekFilesForRange, readWeekFile } from '../recurrence/file-operations';
import { stringifyWo } from '../parseWeekFile/stringify-wo';

interface RecurringEventInfo {
  event: EventElement;
  recurrence: Recurrence;
  eventDate: Date;
}

function extractDateFromFilePath(filePath: string): Date | null {
  const match = filePath.match(/W(\d{2}) (\d{2})\.(\d{2})\.(\d{2})\.md$/);
  if (!match) return null;
  const [, weekStr, dayStr, monthStr, yearStr] = match;
  const week = parseInt(weekStr, 10);
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const year = 2000 + parseInt(yearStr, 10);
  return new Date(year, month, day);
}

function detectRecurringEvents(
  fileContent: string,
  filePath: string,
  settings: WeekcalendarSettings
): RecurringEventInfo[] {
  const elements = parseWo(fileContent, settings);
  const fileDate = extractDateFromFilePath(filePath);
  const recurring: RecurringEventInfo[] = [];

  for (const section of Object.keys(elements) as WoFileTitleStructure[]) {
    for (const element of elements[section]) {
      if (element.type === 'event') {
        const eventElement = element as EventElement;
        if (eventElement.recurrenceId && !eventElement.isException) {
          const recurrence = parseRecurrence(
            eventElement.content,
            eventElement.eventId,
            eventElement.recurrenceId
          );
          if (recurrence && fileDate) {
            recurring.push({ event: eventElement, recurrence, eventDate: fileDate });
          }
        }
      }
    }
  }

  return recurring;
}

async function propagateRecurrenceChanges(
  app: App,
  settings: WeekcalendarSettings,
  recurringEvents: RecurringEventInfo[]
): Promise<void> {
  for (const { event, recurrence, eventDate } of recurringEvents) {
    const endDate = recurrence.end.endDate;
    const files = await findWeekFilesForRange(eventDate, endDate, settings, app);

    for (const filePath of files) {
      const { elements, exists } = await readWeekFile(filePath, settings, app);
      if (!exists) continue;

      let updated = false;
      for (const section of Object.keys(elements) as WoFileTitleStructure[]) {
        const sectionElements = elements[section];
        for (let i = 0; i < sectionElements.length; i++) {
          const element = sectionElements[i];
          if (element.type === 'event') {
            const eventElement = element as EventElement;
            if (
              eventElement.recurrenceId === recurrence.recurrenceId &&
              !eventElement.isException &&
              eventElement.eventId !== event.eventId
            ) {
              sectionElements[i] = {
                ...eventElement,
                content: event.content,
              };
              updated = true;
            }
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
  }
}

/**
 * Set the localid if it doesn't have one yet on all changed files
 * @param app
 * @param modifyEvents
 * @param actualFileChanged$
 */
export const modifyWeekFileEvent = (
  app: App,
  modifyEvents: Observable<TFile>,
  actualFileChanged$: Observable<TFile>,
  settings: WeekcalendarSettings,
) =>
  modifyEvents
    .pipe(
      filter((file): file is TFile => file instanceof TFile),
      filter((file: TFile) => WO_FILE_REGEX.test(file.path)),
      filter((file: TFile) => file.extension === 'md'),
      switchMap((file: TFile) =>
        from(app.vault.read(file)).pipe(map((fileContent) => [file, fileContent] as const)),
      ),
      debounce(() => race(actualFileChanged$, timer(10000))),
      switchMap(([file, fileContent]) => {
        const changedFile = processFile(fileContent, file, settings);
        if (changedFile) {
          return from(app.vault.modify(file, changedFile)).pipe(
            switchMap(async () => {
              const recurringInFile = detectRecurringEvents(fileContent, file.path, settings);
              if (recurringInFile.length > 0) {
                await propagateRecurrenceChanges(app, settings, recurringInFile);
              }
              return new Notice(`File ${file.name} angepasst.`);
            }),
            catchError((err) =>
              of(new Notice(`Fehler bei der Anpassung von ${file.name}: ` + JSON.stringify(err))),
            ),
          );
        }
        return of('');
      }),
    )
    .subscribe();
