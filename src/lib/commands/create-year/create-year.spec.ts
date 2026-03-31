import { Notice } from 'obsidian';
import { CreateYearPrompt } from '../../ui/create-year-prompt';
import { createYear } from './create-year';
import { prepareData } from './prepare-data';
import { prepareWeeks } from './prepare-weeks';
import { writeWeekFiles } from './write-week-files';

jest.mock('obsidian', () => ({
  Notice: jest.fn(),
}));

jest.mock('../../ui/create-year-prompt', () => ({
  CreateYearPrompt: jest.fn(),
}));

jest.mock('./prepare-data', () => ({
  prepareData: jest.fn(),
}));

jest.mock('./prepare-weeks', () => ({
  prepareWeeks: jest.fn(),
}));

jest.mock('./write-week-files', () => ({
  writeWeekFiles: jest.fn(),
}));

describe('createYear', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create week files and show success notice', async () => {
    const app = {};
    const settings = {} as any;

    const lastYear = [{ yyyy: 2025, week: 52 }];
    const weeks = [
      { yyyy: 2026, week: 1 },
      { yyyy: 2026, week: 2 },
      { yyyy: 2026, week: 3 },
    ];
    const nextYear = [{ yyyy: 2027, week: 1 }];

    (prepareData as jest.Mock)
      .mockReturnValueOnce(lastYear)
      .mockReturnValueOnce(nextYear)
      .mockReturnValueOnce(weeks);

    const preparedWeeks = ['prepared'] as any;
    (prepareWeeks as jest.Mock).mockReturnValue(preparedWeeks);
    (writeWeekFiles as jest.Mock).mockResolvedValue(1);

    let submit: ((year: string) => Promise<void>) | undefined;
    const openMock = jest.fn();

    (CreateYearPrompt as jest.Mock).mockImplementation((_app, onSubmit) => {
      submit = onSubmit;
      return {
        open: openMock,
      };
    });

    await createYear(app, settings)();

    expect(openMock).toHaveBeenCalled();

    await submit?.('2026');

    expect(prepareData).toHaveBeenNthCalledWith(1, 2025);
    expect(prepareData).toHaveBeenNthCalledWith(2, 2027);
    expect(prepareData).toHaveBeenNthCalledWith(3, 2026);

    expect(prepareWeeks).toHaveBeenCalledWith(
      2026,
      [lastYear[lastYear.length - 1], ...weeks, nextYear[0]],
      settings,
    );

    expect(writeWeekFiles).toHaveBeenCalledWith(2026, preparedWeeks, settings, app);

    expect(Notice).toHaveBeenCalledWith('Total 3 Wochen, davon 2 erstellt, 1 existierten schon');
  });

  it('should show error notice when writing week files fails', async () => {
    const app = {};
    const settings = {} as any;
    const error = new Error('write failed');

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (prepareData as jest.Mock)
      .mockReturnValueOnce([{ yyyy: 2025, week: 52 }])
      .mockReturnValueOnce([{ yyyy: 2027, week: 1 }])
      .mockReturnValueOnce([{ yyyy: 2026, week: 1 }]);

    (prepareWeeks as jest.Mock).mockReturnValue(['prepared']);
    (writeWeekFiles as jest.Mock).mockRejectedValue(error);

    let submit: ((year: string) => Promise<void>) | undefined;

    (CreateYearPrompt as jest.Mock).mockImplementation((_app, onSubmit) => {
      submit = onSubmit;
      return {
        open: jest.fn(),
      };
    });

    await createYear(app, settings)();
    await submit?.('2026');

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    expect(Notice).toHaveBeenCalledWith('Fehler beim Erstellen der Wochen-Dateien');

    consoleErrorSpy.mockRestore();
  });

  it('should parse the entered year as integer', async () => {
    const app = {};
    const settings = {} as any;

    (prepareData as jest.Mock)
      .mockReturnValueOnce([{}])
      .mockReturnValueOnce([{}])
      .mockReturnValueOnce([{}]);

    (prepareWeeks as jest.Mock).mockReturnValue([]);
    (writeWeekFiles as jest.Mock).mockResolvedValue(0);

    let submit: ((year: string) => Promise<void>) | undefined;

    (CreateYearPrompt as jest.Mock).mockImplementation((_app, onSubmit) => {
      submit = onSubmit;
      return {
        open: jest.fn(),
      };
    });

    await createYear(app, settings)();
    await submit?.('2025abc');

    expect(prepareData).toHaveBeenNthCalledWith(1, 2024);
    expect(prepareData).toHaveBeenNthCalledWith(2, 2026);
    expect(prepareData).toHaveBeenNthCalledWith(3, 2025);
  });
});
