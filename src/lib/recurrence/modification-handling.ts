import { App } from 'obsidian';
import {
  EventElement,
  Recurrence,
  WeekcalendarSettings,
} from '../types';
import { checkIfIsException } from './occurrence-calculation';
import { readWeekFile } from './file-operations';

export type ModificationAction = 'update_original' | 'ask_exception' | 'update_all';

export interface AffectedOccurrence {
  file: string;
  date: Date;
  isException: boolean;
}

export interface ModificationResult {
  action: ModificationAction;
  affectedOccurrences: AffectedOccurrence[];
}

export async function handleRecurrenceModification(
  originalEvent: EventElement,
  newContent: string[],
  recurrence: Recurrence,
  startDate: Date,
  endDate: Date
): Promise<ModificationResult> {
  const affectedOccurrences: AffectedOccurrence[] = [];

  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate && current <= recurrence.end.endDate) {
    if (current > startDate) {
      const isException = checkIfIsException(newContent, recurrence, current);
      affectedOccurrences.push({
        file: '',
        date: new Date(current),
        isException,
      });
    }
    current.setDate(current.getDate() + 7);
  }

  const hasExceptions = affectedOccurrences.some((o) => o.isException);

  if (hasExceptions) {
    return {
      action: 'ask_exception',
      affectedOccurrences,
    };
  }

  return {
    action: 'update_all',
    affectedOccurrences,
  };
}

export async function checkExistingExceptions(
  filePath: string,
  recurrenceId: string,
  settings: WeekcalendarSettings,
  app: App
): Promise<AffectedOccurrence[]> {
  const { elements, exists } = await readWeekFile(filePath, settings, app);
  if (!exists) return [];

  const exceptions: AffectedOccurrence[] = Object.entries(elements)
    .flatMap(([, sectionElements]) =>
      sectionElements
        .filter(
          (element): element is EventElement =>
            element.type === 'event' &&
            (element as EventElement).recurrenceId === recurrenceId &&
            (element as EventElement).isException === true
        )
        .map(() => ({
          file: filePath,
          date: new Date(),
          isException: true,
        }))
    );

  return exceptions;
}

export function compareEventContent(
  content1: string[],
  content2: string[]
): boolean {
  if (content1.length !== content2.length) return false;

  const keyFields = ['Termin', 'Zeit', 'Ort', 'Wiederholung', 'WiederholungEnde'];

  for (const field of keyFields) {
    const line1 = content1.find((l) => l.includes(field));
    const line2 = content2.find((l) => l.includes(field));
    if (line1 !== line2) return false;
  }

  return true;
}
