import { App, Notice, TFile } from 'obsidian';
import { Observable, Subscription } from 'rxjs';
import { processFile } from '../commands/process-file';
import { parseWo } from '../parseWeekFile/parse-wo';
import { stringifyWo } from '../parseWeekFile/stringify-wo';
import { parseRecurrence } from '../recurrence/parse-recurrence';
import { EventElement, Recurrence, WeekcalendarSettings, WoFileTitleStructure, woFileTitleStructure } from '../types';
import { getWeekFileInfo } from '../commands/process-file';

interface RecurringEventInfo {
  event: EventElement;
  recurrence: Recurrence;
  eventDate: Date;
  section: WoFileTitleStructure;
}

function recurrenceKey(info: RecurringEventInfo): string {
  return `${info.section}|${info.recurrence.recurrenceId}|${info.event.eventId}`;
}

function recurrenceContent(event: EventElement): string {
  return event.content.filter((line) => !/^\s+\^woev-/.test(line)).join('\n');
}

export function extractDateFromFilePath(filePath: string): Date | null {
  const match = filePath.match(/W\d{2} (\d{2})\.(\d{2})\.(\d{2})\.md$/);
  if (!match) return null;
  const [, dayStr, monthStr, yearStr] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const year = 2000 + parseInt(yearStr, 10);
  return new Date(year, month, day);
}

export function detectRecurringEvents(
  fileContent: string,
  filePath: string,
  settings: WeekcalendarSettings,
): RecurringEventInfo[] {
  const elements = parseWo(fileContent, settings);
  const fileDate = extractDateFromFilePath(filePath);

  if (!fileDate) return [];

  const recurring: RecurringEventInfo[] = Object.entries(elements)
    .flatMap(([section, sectionElements]) =>
      sectionElements
        .filter(
          (element): element is EventElement =>
            element.type === 'event' &&
            (element as EventElement).recurrenceId !== undefined &&
            !(element as EventElement).isException
        )
        .map((eventElement) => {
          const recurrence = parseRecurrence(
            eventElement.content,
            eventElement.eventId,
            eventElement.recurrenceId!,
          );
          const dayIndex = woFileTitleStructure.indexOf(section as WoFileTitleStructure) - 1;
          if (!recurrence || dayIndex < 0 || dayIndex > 6) return null;
          const eventDate = new Date(fileDate);
          eventDate.setDate(eventDate.getDate() + dayIndex);
          return { event: eventElement, recurrence, eventDate, section: section as WoFileTitleStructure };
        })
    )
    .filter((item): item is RecurringEventInfo => item !== null);

  return recurring;
}

async function propagateRecurrenceChanges(
  app: App,
  settings: WeekcalendarSettings,
  recurringEvents: RecurringEventInfo[],
  isActive: () => boolean,
  baselines: Map<string, Map<string, string>>,
  ownChanges: Map<string, string>,
  sourcePath: string,
): Promise<void> {
  const protectedAnchors = new Set(recurringEvents.map((info) => `${sourcePath}\n${recurrenceKey(info)}`));
  for (const { event, recurrence, eventDate } of [...recurringEvents].sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())) {
    const endDate = recurrence.end.endDate;
    const files = app.vault.getMarkdownFiles().filter((file) =>
      getWeekFileInfo(file.path, settings.paths.weekFolder) !== null);
    for (const file of files) {
      if (!isActive()) return;
      const monday = extractDateFromFilePath(file.path);
      if (!monday || monday > endDate || monday.getTime() + 7 * 86400000 <= eventDate.getTime()) continue;
      const path = file.path;
      // Without a baseline, an imported/new note may contain an independent user edit.
      const baseline = baselines.get(path);
      if (!baseline) continue;
      const changedKeys = new Set<string>();
      const transform = (content: string) => {
        if (!isActive() || file.path !== path) return content;
        const elements = parseWo(content, settings);
        let updated = false;
        for (const section of woFileTitleStructure.slice(1, 8)) {
          const targetDate = new Date(monday);
          targetDate.setDate(targetDate.getDate() + woFileTitleStructure.indexOf(section) - 1);
          if (targetDate <= eventDate || targetDate > endDate) continue;
          elements[section] = elements[section].map((element) => {
            if (element.type !== 'event' || element.recurrenceId !== recurrence.recurrenceId || element.isException) return element;
            const key = `${section}|${element.recurrenceId}|${element.eventId}`;
            const identity = `${path}\n${key}`;
            const previous = baseline.get(key);
            const current = recurrenceContent(element);
            if (protectedAnchors.has(identity) ||
                (current !== previous && current !== ownChanges.get(identity))) return element;
            // Each occurrence keeps its own ID; copying the source ID would change its identity.
            const copied = event.content.flatMap((line) => /^\s+\^woev-(?!rec-)[a-zA-Z0-9]+\s*$/.test(line)
              ? (element.eventId ? [`  ^woev-${element.eventId}`] : []) : [line]);
            if (copied.join('\n') === element.content.join('\n')) return element;
            updated = true;
            changedKeys.add(key);
            return { ...element, content: copied };
          });
        }
        return updated ? stringifyWo(elements) : content;
      };
      try {
        const content = await app.vault.read(file);
        if (transform(content) !== content && isActive()) {
          changedKeys.clear();
          const written = await app.vault.process(file, transform);
          for (const info of detectRecurringEvents(written, file.path, settings)) {
            if (changedKeys.has(recurrenceKey(info))) ownChanges.set(`${path}\n${recurrenceKey(info)}`, recurrenceContent(info.event));
          }
        }
      } catch (error) {
        if (app.vault.getAbstractFileByPath(path)) throw error;
      }
    }
  }
}

/**
 * Set the localid if it doesn't have one yet on all changed files
 * @param app
 * @param modifyEvents
 * @param actualFileChanged$
 * @param settings
 */
export interface WeekProcessingHooks {
  pending(): void;
  settled(success: boolean): void;
}

export const modifyWeekFileEvent = (
  app: App,
  modifyEvents: Observable<unknown>,
  actualFileChanged$: Observable<unknown>,
  settings: WeekcalendarSettings,
  ignoredFiles: ReadonlySet<string> = new Set(),
  hooks?: WeekProcessingHooks,
): Subscription => {
  const subscription = new Subscription();
  const pending = new Set<string>();
  const baselines = new Map<string, Map<string, string>>();
  const ownChanges = new Map<string, string>();
  let priming = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let success = true;

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { timer = undefined; void drain(); }, settings.caldav.autoSync === true ? 500 : 10000);
  };
  const drain = async () => {
    if (running || priming || subscription.closed) return;
    running = true;
    const files = [...pending];
    pending.clear();
    try {
      for (const path of files) {
        if (subscription.closed) break;
        const file = app.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile) || ignoredFiles.has(path) || !getWeekFileInfo(file.path, settings.paths.weekFolder)) continue;
        try {
          const snapshot = JSON.stringify(settings);
          const isActive = () => !subscription.closed && JSON.stringify(settings) === snapshot;
          let content = await app.vault.read(file);
          if (!isActive()) continue;
          if (processFile(content, file, settings)) {
            content = await app.vault.process(file, (current) => isActive()
              ? processFile(current, file, settings) || current : current);
            if (settings.caldav.autoSync !== true && isActive()) new Notice(`File ${file.name} angepasst.`);
          }
          if (!isActive()) continue;
          const recurring = detectRecurringEvents(content, file.path, settings);
          const previous = baselines.get(path);
          const changed = recurring.filter((info) => previous?.get(recurrenceKey(info)) !== recurrenceContent(info.event) &&
            ownChanges.get(`${path}\n${recurrenceKey(info)}`) !== recurrenceContent(info.event));
          baselines.set(path, new Map(recurring.map((info) => [recurrenceKey(info), recurrenceContent(info.event)])));
          for (const identity of ownChanges.keys()) if (identity.startsWith(path + '\n')) ownChanges.delete(identity);
          if (changed.length && isActive()) await propagateRecurrenceChanges(app, settings, changed, isActive, baselines, ownChanges, path);
        } catch {
          if (subscription.closed || !app.vault.getAbstractFileByPath(path)) continue;
          success = false;
          if (settings.caldav.autoSync !== true) new Notice(`Fehler bei der Verarbeitung von ${file.name}.`);
        }
      }
    } finally {
      running = false;
      if (!subscription.closed) {
        if (pending.size) schedule();
        else {
          clearTimeout(timer);
          timer = undefined;
          hooks?.settled(success);
          success = true;
        }
      }
    }
  };
  subscription.add(modifyEvents.subscribe((file) => {
    if (!(file instanceof TFile) || ignoredFiles.has(file.path) || file.extension !== 'md' ||
        !getWeekFileInfo(file.path, settings.paths.weekFolder)) return;
    pending.add(file.path);
    hooks?.pending();
    schedule();
  }));
  subscription.add(actualFileChanged$.subscribe(() => {
    if (!pending.size) return;
    clearTimeout(timer);
    timer = undefined;
    void drain();
  }));
  subscription.add(() => { clearTimeout(timer); pending.clear(); baselines.clear(); ownChanges.clear(); });
  // Remember recurring payloads, not stale note contents, before the first edit.
  // A note already queued by an external edit must not become its own baseline.
  void (async () => {
    const snapshot = JSON.stringify(settings);
    try {
      for (const file of app.vault.getMarkdownFiles()) {
        if (subscription.closed) break;
        if (!getWeekFileInfo(file.path, settings.paths.weekFolder)) continue;
        try {
          const content = await app.vault.read(file);
          if (subscription.closed || JSON.stringify(settings) !== snapshot) break;
          if (!pending.has(file.path)) baselines.set(file.path,
            new Map(detectRecurringEvents(content, file.path, settings).map((info) => [recurrenceKey(info), recurrenceContent(info.event)])));
        } catch { /* A later edit/validation can report unreadable notes; never propagate into them. */ }
      }
    } catch {
      // Failure to list notes must not leave the processing queue blocked.
    } finally {
      priming = false;
      if (pending.size && !subscription.closed) schedule();
    }
  })();
  return subscription;
};
