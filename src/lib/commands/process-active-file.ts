import { Notice } from 'obsidian';
import { WeekcalendarSettings } from '../types';
import { processFile } from './process-file';

/**
 * process the active file
 * @param app
 * @param settings
 */
export const processActiveFile = (app: any, settings: WeekcalendarSettings) => async () => {
  const file = app.workspace.getActiveFile();
  if (!file) {
    new Notice('No active file.');
    return;
  }
  const fileContent = await app.vault.read(file);
  const changedFile = processFile(fileContent, file, settings);
  if (changedFile) {
    await app.vault.modify(file, changedFile);
    new Notice('Processed current file.  Filename: ' + file.name);
  } else {
    new Notice('Es hat keine Änderungen gegeben!');
  }
};
