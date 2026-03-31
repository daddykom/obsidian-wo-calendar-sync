import type { App } from 'obsidian';
import { createFolderIfNotExist } from './create-folder-if-not-exist';

describe('createFolderIfNotExist', () => {
  const createApp = (existingPaths: string[] = []): App =>
    ({
      vault: {
        getAbstractFileByPath: jest.fn((path: string) =>
          existingPaths.includes(path) ? { path } : null,
        ),
        createFolder: jest.fn().mockResolvedValue(undefined),
      },
    }) as unknown as App;

  it('creates all missing folders of a nested path', async () => {
    const app = createApp();

    await createFolderIfNotExist('2026/WO/Events', app);

    expect(app.vault.getAbstractFileByPath).toHaveBeenNthCalledWith(1, '2026');
    expect(app.vault.getAbstractFileByPath).toHaveBeenNthCalledWith(2, '2026/WO');
    expect(app.vault.getAbstractFileByPath).toHaveBeenNthCalledWith(3, '2026/WO/Events');

    expect(app.vault.createFolder).toHaveBeenCalledTimes(3);
    expect(app.vault.createFolder).toHaveBeenNthCalledWith(1, '2026');
    expect(app.vault.createFolder).toHaveBeenNthCalledWith(2, '2026/WO');
    expect(app.vault.createFolder).toHaveBeenNthCalledWith(3, '2026/WO/Events');
  });

  it('creates only folders that do not already exist', async () => {
    const app = createApp(['2026', '2026/WO']);

    await createFolderIfNotExist('2026/WO/Events', app);

    expect(app.vault.getAbstractFileByPath).toHaveBeenNthCalledWith(1, '2026');
    expect(app.vault.getAbstractFileByPath).toHaveBeenNthCalledWith(2, '2026/WO');
    expect(app.vault.getAbstractFileByPath).toHaveBeenNthCalledWith(3, '2026/WO/Events');

    expect(app.vault.createFolder).toHaveBeenCalledTimes(1);
    expect(app.vault.createFolder).toHaveBeenCalledWith('2026/WO/Events');
  });

  it('does nothing when the full folder path already exists', async () => {
    const app = createApp(['2026', '2026/WO', '2026/WO/Events']);

    await createFolderIfNotExist('2026/WO/Events', app);

    expect(app.vault.createFolder).not.toHaveBeenCalled();
  });

  it('creates a single folder when the path has only one segment', async () => {
    const app = createApp();

    await createFolderIfNotExist('2026', app);

    expect(app.vault.getAbstractFileByPath).toHaveBeenCalledTimes(1);
    expect(app.vault.getAbstractFileByPath).toHaveBeenCalledWith('2026');

    expect(app.vault.createFolder).toHaveBeenCalledTimes(1);
    expect(app.vault.createFolder).toHaveBeenCalledWith('2026');
  });
});
