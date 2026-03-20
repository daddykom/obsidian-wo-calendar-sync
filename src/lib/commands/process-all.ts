import { Notice, TFile } from 'obsidian';
import { WO_FILE_REGEX } from '../settings/constants';
import { processFile } from './process-file';

/**
 * process all week files
 * @param app
 */
export const processAll = (app: any) => async () => {
  let numb = 0;
  const files = app.vault.getMarkdownFiles();
  const woFiles = files.filter((file: any) => WO_FILE_REGEX.test(file.path));

  await Promise.all(
    woFiles.map(async (file: TFile) => {
      const fileContent = await app.vault.read(file);
      const changedFile = processFile(fileContent, file);

      if (changedFile) {
        ++numb;
        return app.vault.modify(file, changedFile);
      }
    }),
  );

  new Notice(`Es wurden ${woFiles.length} WochenFiles verarbeitet und davon ${numb} angepasst.`);
};
