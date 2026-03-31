import { App } from 'obsidian';

export async function createFolderIfNotExist(path: string, app: App): Promise<void> {
  const segments = path.split('/');

  const paths = segments.reduce((acc, item) => {
    if (acc.length) {
      return [...acc, `${acc[acc.length - 1]}/${item}`];
    }
    return [item];
  }, [] as string[]);

  for (const folderPath of paths) {
    if (!app.vault.getAbstractFileByPath(folderPath)) {
      await app.vault.createFolder(folderPath);
    }
  }
}
