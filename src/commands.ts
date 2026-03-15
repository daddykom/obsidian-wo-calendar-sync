import { Notice } from 'obsidian';

export const prozessActiveFile = (app: any) => async () => {
  const file = app.workspace.getActiveFile();

  if (!file) {
    new Notice('No active file.');
    return;
  }
  new Notice('Processed current file.  Filename: ' + file.name);
};

export const processAll = (app: any) => async () => {
  const files = app.vault.getMarkdownFiles();
  const woFiles = files.filter((f: any) => /^WO\d{2}\.md$/i.test(f.name));
  console.log(woFiles);
  new Notice(`Processed ${woFiles.length} WO files.`);
};
