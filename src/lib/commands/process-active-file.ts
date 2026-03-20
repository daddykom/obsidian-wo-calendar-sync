import { Notice } from 'obsidian';
import { processFile } from './process-file';

/**
 * process the active file
 * @param app
 */
export const processActiveFile = (app: any) => async () => {
  const file = app.workspace.getActiveFile();
  if (!file) {
    new Notice('No active file.');
    return;
  }
  const fileContent = await app.vault.read(file);
  const changedFile = processFile(fileContent, file);
  if (changedFile) {
    await app.vault.modify(file, changedFile);
    new Notice('Processed current file.  Filename: ' + file.name);
  } else {
    new Notice('Es hat keine Änderungen gegeben!');
  }
};
