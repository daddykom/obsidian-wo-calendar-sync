import { Notice, TFile } from 'obsidian';
import { processAll } from './process-all';
import { processFile } from './process-file';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('./process-file', () => ({
  processFile: jest.fn(),
}));

jest.mock('../settings/constants', () => ({
  WO_FILE_REGEX: /wo-/i,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createFileMock = (path: string): TFile => ({ path }) as unknown as TFile;

const createAppMock = (files: TFile[], fileContent = 'content') => ({
  vault: {
    getMarkdownFiles: jest.fn().mockReturnValue(files),
    read: jest.fn().mockResolvedValue(fileContent),
    modify: jest.fn().mockResolvedValue(undefined),
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('processAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when WO files are present and processFile returns changed content', () => {
    it('modifies each changed file and shows the correct notice', async () => {
      const woFile1 = createFileMock('notes/wo-2024-01.md');
      const woFile2 = createFileMock('notes/wo-2024-02.md');
      const app = createAppMock([woFile1, woFile2]);

      (processFile as jest.Mock).mockReturnValue('changed content');

      await processAll(app)();

      expect(app.vault.modify).toHaveBeenCalledTimes(2);
      expect(app.vault.modify).toHaveBeenCalledWith(woFile1, 'changed content');
      expect(app.vault.modify).toHaveBeenCalledWith(woFile2, 'changed content');

      expect(Notice).toHaveBeenCalledWith(
        'Es wurden 2 WochenFiles verarbeitet und davon 2 angepasst.',
      );
    });
  });

  describe('when no WO files are found', () => {
    it('does not modify any file and shows zero counts in the notice', async () => {
      const nonWoFile = createFileMock('notes/daily-2024-01.md');
      const app = createAppMock([nonWoFile]);

      await processAll(app)();

      expect(app.vault.read).not.toHaveBeenCalled();
      expect(app.vault.modify).not.toHaveBeenCalled();

      expect(Notice).toHaveBeenCalledWith(
        'Es wurden 0 WochenFiles verarbeitet und davon 0 angepasst.',
      );
    });
  });

  describe('when processFile returns null for a file', () => {
    it('does not modify the file but still counts it as processed', async () => {
      const woFile = createFileMock('notes/wo-2024-01.md');
      const app = createAppMock([woFile]);

      (processFile as jest.Mock).mockReturnValue(null);

      await processAll(app)();

      expect(app.vault.modify).not.toHaveBeenCalled();

      expect(Notice).toHaveBeenCalledWith(
        'Es wurden 1 WochenFiles verarbeitet und davon 0 angepasst.',
      );
    });
  });
});
