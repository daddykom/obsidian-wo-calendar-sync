import { App } from 'obsidian';
import { stringifyWo } from '../../parseWeekFile/stringify-wo';
import { ElementsStructure, WeekcalendarSettings } from '../../types';
import { createFolderIfNotExist } from '../../utils/create-folder-if-not-exist';
import { writeWeekFiles } from './write-week-files';

jest.mock('../../parseWeekFile/stringify-wo', () => ({
  stringifyWo: jest.fn(),
}));

jest.mock('../../utils/create-folder-if-not-exist', () => ({
  createFolderIfNotExist: jest.fn(),
}));

describe('writeWeekFiles', () => {
  const settings: WeekcalendarSettings = {
    paths: {
      weekFolder: 'calendar',
    },
  } as unknown as WeekcalendarSettings;

  const week1 = { id: 'week-1' } as unknown as ElementsStructure;
  const week2 = { id: 'week-2' } as unknown as ElementsStructure;

  const setup = (existingPaths: string[] = []) => {
    const app = {
      vault: {
        getAbstractFileByPath: jest.fn((path: string) => {
          return existingPaths.includes(path) ? {} : null;
        }),
        createFolder: jest.fn().mockResolvedValue(undefined),
        create: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as App;

    return { app };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createFolderIfNotExist as jest.Mock).mockResolvedValue(undefined);
    (stringifyWo as jest.Mock).mockImplementation((week: ElementsStructure) => {
      return `content:${JSON.stringify(week)}`;
    });
  });

  it('creates the root folder when it does not exist', async () => {
    const { app } = setup();

    await writeWeekFiles(2026, [['WO01.md', week1]], settings, app);

    expect(app.vault.createFolder).toHaveBeenCalledWith('calendar');
  });

  it('does not create the root folder when it already exists', async () => {
    const { app } = setup(['calendar']);

    await writeWeekFiles(2026, [['WO01.md', week1]], settings, app);

    expect(app.vault.createFolder).not.toHaveBeenCalled();
  });

  it('ensures the week folder path exists', async () => {
    const { app } = setup(['calendar']);

    await writeWeekFiles(2026, [['WO01.md', week1]], settings, app);

    expect(createFolderIfNotExist).toHaveBeenCalledWith('calendar/2026/weeks', app);
  });

  it('creates all missing week files', async () => {
    const { app } = setup(['calendar']);

    const result = await writeWeekFiles(
      2026,
      [
        ['WO01.md', week1],
        ['WO02.md', week2],
      ],
      settings,
      app,
    );

    expect(app.vault.create).toHaveBeenNthCalledWith(
      1,
      'calendar/2026/weeks/WO01.md',
      'content:{"id":"week-1"}',
    );
    expect(app.vault.create).toHaveBeenNthCalledWith(
      2,
      'calendar/2026/weeks/WO02.md',
      'content:{"id":"week-2"}',
    );
    expect(result).toBe(0);
  });

  it('skips existing week files and returns their count', async () => {
    const { app } = setup(['calendar', 'calendar/2026/weeks/WO01.md']);

    const result = await writeWeekFiles(
      2026,
      [
        ['WO01.md', week1],
        ['WO02.md', week2],
      ],
      settings,
      app,
    );

    expect(app.vault.create).toHaveBeenCalledTimes(1);
    expect(app.vault.create).toHaveBeenCalledWith(
      'calendar/2026/weeks/WO02.md',
      'content:{"id":"week-2"}',
    );
    expect(result).toBe(1);
  });

  it('ignores null entries', async () => {
    const { app } = setup(['calendar']);

    const result = await writeWeekFiles(2026, [null, ['WO02.md', week2]], settings, app);

    expect(app.vault.create).toHaveBeenCalledTimes(1);
    expect(app.vault.create).toHaveBeenCalledWith(
      'calendar/2026/weeks/WO02.md',
      'content:{"id":"week-2"}',
    );
    expect(result).toBe(0);
  });

  it('stringifies the week before creating the file', async () => {
    const { app } = setup(['calendar']);

    await writeWeekFiles(2026, [['WO01.md', week1]], settings, app);

    expect(stringifyWo).toHaveBeenCalledWith(week1);
  });
});
