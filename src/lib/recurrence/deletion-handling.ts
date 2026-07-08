import { EventElement, Recurrence, WeekcalendarSettings } from '../types';
import { generateOccurrences } from './occurrence-calculation';
import {
  findWeekFilesForRange,
  removeRecurringEventsFromFile,
  insertRecurringEventIntoFile,
  getWeekFilePath,
} from './file-operations';

export type DeleteOption = 'all' | 'enddate';

export async function deleteRecurringEvent(
  recurrenceId: string,
  recurrence: Recurrence,
  startDate: Date,
  settings: WeekcalendarSettings,
  app: any,
  option: DeleteOption,
  endDate?: Date
): Promise<void> {
  const files = await findWeekFilesForRange(
    startDate,
    recurrence.end.endDate,
    settings,
    app
  );

  if (option === 'all') {
    for (const file of files) {
      await removeRecurringEventsFromFile(file, recurrenceId, false, settings, app);
    }
  } else if (option === 'enddate' && endDate) {
    for (const file of files) {
      await removeRecurringEventsFromFile(file, recurrenceId, true, settings, app);
    }
  }
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
