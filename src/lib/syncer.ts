import { App, TFile, normalizePath } from "obsidian";
import { WOEvent, WOCalendarSettings } from "./types";
import { parseWOFile } from "./parser";
import { formatFullCalendarFileWithSource, getEventFilename } from "./formatter";
import { parseWeekNumber } from "./dateUtils";

// Syncs a single WO file to Full Calendar event files
export const syncWOFile = async (
  app: App,
  file: TFile,
  settings: WOCalendarSettings
): Promise<void> => {
  const weekNumber = parseWeekNumber(file.basename);
  if (weekNumber === null) {
    return;
  }

  const content = await app.vault.read(file);

  const userEvents = parseWOFile(
    content,
    file.basename,
    file.path,
    weekNumber,
    settings.defaultDurationMinutes
  ).filter((e) => !e.isReadOnly);

  await ensureFolder(app, settings.eventsFolder);

  const expectedFilenames = new Set(userEvents.map(getEventFilename));

  // Write all user events in parallel
  await Promise.all(
    userEvents.map((event) =>
      writeEventFile(app, event, settings.eventsFolder, file.basename)
    )
  );

  await deleteOrphanedEvents(app, settings.eventsFolder, file.basename, expectedFilenames);
};

// Syncs all WO files in the configured folder
export const syncAllWOFiles = async (
  app: App,
  settings: WOCalendarSettings
): Promise<number> => {
  const folder = app.vault.getFolderByPath(settings.woFolder);
  if (!folder) {
    return 0;
  }

  const woFiles = folder.children.filter(
    (child): child is TFile =>
      child instanceof TFile &&
      child.extension === "md" &&
      parseWeekNumber(child.basename) !== null
  );

  await Promise.all(woFiles.map((file) => syncWOFile(app, file, settings)));

  return woFiles.length;
};

// Writes a single WOEvent as a Full Calendar markdown file
const writeEventFile = async (
  app: App,
  event: WOEvent,
  eventsFolder: string,
  woBasename: string
): Promise<void> => {
  const path = normalizePath(`${eventsFolder}/${getEventFilename(event)}`);
  const content = formatFullCalendarFileWithSource(event, woBasename);
  const existing = app.vault.getFileByPath(path);

  if (existing instanceof TFile) {
    await app.vault.modify(existing, content);
  } else {
    await app.vault.create(path, content);
  }
};

// Reads all event files in eventsFolder that belong to woBasename, deletes orphans
const deleteOrphanedEvents = async (
  app: App,
  eventsFolder: string,
  woBasename: string,
  expectedFilenames: Set<string>
): Promise<void> => {
  const folder = app.vault.getFolderByPath(eventsFolder);
  if (!folder) {
    return;
  }

  const candidateFiles = folder.children.filter(
    (child): child is TFile =>
      child instanceof TFile && child.extension === "md"
  );

  // Read all candidate files, then delete those that are orphaned
  const deleteIfOrphaned = async (file: TFile): Promise<void> => {
    const content = await app.vault.read(file);
    const belongsToThisWO = content.includes(`# source: ${woBasename}`);
    const isReadOnly = content.includes("readonly: true");
    const isOrphaned = !expectedFilenames.has(file.name);

    if (belongsToThisWO && !isReadOnly && isOrphaned) {
      await app.vault.delete(file);
    }
  };

  await Promise.all(candidateFiles.map(deleteIfOrphaned));
};

// Ensures a folder exists, creates it if it does not
const ensureFolder = async (app: App, folderPath: string): Promise<void> => {
  const normalized = normalizePath(folderPath);
  if (!app.vault.getFolderByPath(normalized)) {
    await app.vault.createFolder(normalized);
  }
};
