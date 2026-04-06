import { processActiveFile } from './process-active-file';
import { processFile } from './process-file';

// Mock the obsidian module
jest.mock('obsidian', () => ({
  Notice: jest.fn(),
}));

// Mock the processFile dependency
jest.mock('./process-file', () => ({
  processFile: jest.fn(),
}));

import { Notice } from 'obsidian';
import { DEFAULT_SETTINGS } from '../settings/constants';

describe('processActiveFile', () => {
  const mockRead = jest.fn();
  const mockModify = jest.fn();
  const mockGetActiveFile = jest.fn();

  const mockApp = {
    workspace: { getActiveFile: mockGetActiveFile },
    vault: { read: mockRead, modify: mockModify },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a notice and returns early when no active file exists', async () => {
    mockGetActiveFile.mockReturnValue(null);

    await processActiveFile(mockApp as unknown as any, DEFAULT_SETTINGS)();

    expect(Notice).toHaveBeenCalledWith('No active file.');
    expect(mockRead).not.toHaveBeenCalled();
    expect(mockModify).not.toHaveBeenCalled();
  });

  it('modifies the file and shows success notice when processFile returns content', async () => {
    const mockFile = { name: 'test.md' };
    const mockContent = '# Original content';
    const mockChanged = '# Changed content';

    mockGetActiveFile.mockReturnValue(mockFile);
    mockRead.mockResolvedValue(mockContent);
    (processFile as jest.Mock).mockReturnValue(mockChanged);

    await processActiveFile(mockApp as unknown as any, DEFAULT_SETTINGS)();

    expect(mockRead).toHaveBeenCalledWith(mockFile);
    expect(processFile).toHaveBeenCalledWith(mockContent, mockFile, DEFAULT_SETTINGS);
    expect(mockModify).toHaveBeenCalledWith(mockFile, mockChanged);
    expect(Notice).toHaveBeenCalledWith('Processed current file.  Filename: test.md');
  });

  it('shows no-change notice when processFile returns null', async () => {
    const mockFile = { name: 'unchanged.md' };
    const mockContent = '# No changes needed';

    mockGetActiveFile.mockReturnValue(mockFile);
    mockRead.mockResolvedValue(mockContent);
    (processFile as jest.Mock).mockReturnValue(null);

    await processActiveFile(mockApp as unknown as any, DEFAULT_SETTINGS)();

    expect(mockModify).not.toHaveBeenCalled();
    expect(Notice).toHaveBeenCalledWith('Es hat keine Änderungen gegeben!');
  });

  it('shows no-change notice when processFile returns undefined', async () => {
    const mockFile = { name: 'unchanged.md' };

    mockGetActiveFile.mockReturnValue(mockFile);
    mockRead.mockResolvedValue('some content');
    (processFile as jest.Mock).mockReturnValue(undefined);

    await processActiveFile(mockApp as unknown as any, DEFAULT_SETTINGS)();

    expect(mockModify).not.toHaveBeenCalled();
    expect(Notice).toHaveBeenCalledWith('Es hat keine Änderungen gegeben!');
  });
});
