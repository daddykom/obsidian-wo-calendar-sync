import { Notice, TFile } from 'obsidian';
import { WeekcalendarSettings, Weeks } from '../../types';
import { createFolderIfNotExist } from '../../utils/create-folder-if-not-exist';
import { createYearFile } from './create-year-file';

jest.mock('obsidian');
jest.mock('../../utils/create-folder-if-not-exist', () => ({
  createFolderIfNotExist: jest.fn(),
}));

describe('createYearFile', () => {
  const settings: WeekcalendarSettings = {
    paths: {
      weekFolder: 'calendar',
      overviewFileName: 'index',
    },
  } as unknown as WeekcalendarSettings;

  const createApp = () =>
    ({
      vault: {
        getAbstractFileByPath: jest.fn(),
        create: jest.fn(),
        modify: jest.fn(),
      },
    }) as unknown as {
      vault: {
        getAbstractFileByPath: jest.Mock;
        create: jest.Mock;
        modify: jest.Mock;
      };
    };

  const makeWeek = (week: number, year: number, month: number, day: number): Weeks =>
    ({
      week,
      monday: new Date(year, month, day),
    }) as unknown as Weeks;

  beforeEach(() => {
    jest.clearAllMocks();
    (createFolderIfNotExist as jest.Mock).mockResolvedValue(undefined);
  });

  it('creates the overview file when it does not exist', async () => {
    const app = createApp();
    app.vault.getAbstractFileByPath.mockReturnValue(null);

    const weeks: Weeks[] = [
      makeWeek(1, 2025, 11, 29),
      makeWeek(2, 2026, 0, 5),
      makeWeek(3, 2026, 0, 12),
      makeWeek(4, 2026, 0, 19),
      makeWeek(5, 2026, 0, 26),
      makeWeek(6, 2026, 1, 2),
      makeWeek(7, 2026, 1, 9),
      makeWeek(8, 2026, 1, 16),
    ];

    await createYearFile(2026, weeks, settings, app as unknown as any);

    expect(createFolderIfNotExist).toHaveBeenCalledWith('calendar/2026/weeks', app);

    expect(app.vault.modify).not.toHaveBeenCalled();
    expect(app.vault.create).toHaveBeenCalledWith(
      'calendar/2026/index.md',
      [
        '# 2026',
        '',
        '| | | | | | | |',
        '|---|---|---|---|---|---|---|',
        '|<b>[[calendar/2026/weeks/W08 16.02.26\\|W08]]</b><br>16.02|',
        '|<b>[[calendar/2026/weeks/W01 29.12.25\\|W01]]</b><br>29.12|<b>[[calendar/2026/weeks/W02 05.01.26\\|W02]]</b><br>05.01|<b>[[calendar/2026/weeks/W03 12.01.26\\|W03]]</b><br>12.01|<b>[[calendar/2026/weeks/W04 19.01.26\\|W04]]</b><br>19.01|<b>[[calendar/2026/weeks/W05 26.01.26\\|W05]]</b><br>26.01|<b>[[calendar/2026/weeks/W06 02.02.26\\|W06]]</b><br>02.02|<b>[[calendar/2026/weeks/W07 09.02.26\\|W07]]</b><br>09.02|',
      ].join('\n'),
    );

    expect(Notice).toHaveBeenCalledWith('calendar/2026/index.md wurde erstellt');
  });

  it('modifies the overview file when it already exists', async () => {
    const app = createApp();

    const file = new TFile();
    file.path = 'calendar/2026/index.md';

    app.vault.getAbstractFileByPath.mockReturnValue(file);

    const weeks: Weeks[] = [makeWeek(1, 2025, 11, 29)];

    await createYearFile(2026, weeks, settings, app as unknown as any);

    expect(createFolderIfNotExist).toHaveBeenCalledWith('calendar/2026/weeks', app);

    expect(app.vault.create).not.toHaveBeenCalled();
    expect(app.vault.modify).toHaveBeenCalledWith(
      file,
      [
        '# 2026',
        '',
        '| | | | | | | |',
        '|---|---|---|---|---|---|---|',
        '|<b>[[calendar/2026/weeks/W01 29.12.25\\|W01]]</b><br>29.12|',
      ].join('\n'),
    );

    expect(Notice).toHaveBeenCalledWith('calendar/2026/index.md wurde angepasst');
  });

  it('shows a notice when the target path exists but is not a file', async () => {
    const app = createApp();
    app.vault.getAbstractFileByPath.mockReturnValue({ path: 'calendar/2026/index.md' });

    const weeks: Weeks[] = [makeWeek(1, 2025, 11, 29)];

    await createYearFile(2026, weeks, settings, app as unknown as any);

    expect(createFolderIfNotExist).toHaveBeenCalledWith('calendar/2026/weeks', app);

    expect(app.vault.create).not.toHaveBeenCalled();
    expect(app.vault.modify).not.toHaveBeenCalled();

    expect(Notice).toHaveBeenCalledWith(
      'Der Pfad calendar/2026/index.md ist ein Ordner und keine Datei',
    );
  });
});
