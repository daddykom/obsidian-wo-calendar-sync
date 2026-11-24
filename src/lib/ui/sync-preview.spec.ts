import { SyncPreviewModal } from './sync-preview';
import type { App } from 'obsidian';
import { PreviewResult } from '../sync/prepare-preview';

const mockText: string[] = [];
const mockButtons: string[] = [];
jest.mock('obsidian', () => ({
  Modal: class {
    contentEl = {
      empty: jest.fn(),
      createEl: (_tag: string, options?: { text?: string }) => {
        if (options?.text) mockText.push(options.text);
        return this.contentEl;
      },
    };
    close = jest.fn();
  },
  Setting: class {
    addButton(callback: (button: unknown) => void) {
      const button = {
        setButtonText(text: string) { mockButtons.push(text); return button; },
        onClick() { return button; },
      };
      callback(button);
      return this;
    }
  },
}));

describe('SyncPreviewModal', () => {
  beforeEach(() => { mockText.length = 0; mockButtons.length = 0; });

  it('shows validation errors with file and line, without an execute button', () => {
    new SyncPreviewModal({} as App, { ok: false, errors: [{ path: 'week.md', line: 4, message: 'ID fehlt' }] }).onOpen();
    expect(mockText).toContain('week.md:4: ID fehlt');
    expect(mockButtons).toEqual(['Schliessen']);
  });

  it('warns about a completely emptied calendar and lists foreign resources', () => {
    const result: PreviewResult = {
      ok: true, calendarUrl: 'https://example.com/calendar/', timezone: 'Europe/Zurich',
      scannedFiles: 1, localCount: 0, remoteCount: 1,
      plan: { create: [], update: [], unchanged: 0, delete: [{
        uid: 'foreign', title: 'Fremder Termin', url: 'https://example.com/calendar/foreign', etag: '"v1"', comparable: null,
      }] },
    };
    new SyncPreviewModal({} as App, result).onOpen();
    expect(mockText.some((text) => text.includes('vollständig leeren'))).toBe(true);
    expect(mockText.some((text) => text.includes('Fremder Termin'))).toBe(true);
    expect(mockButtons).toEqual(['Schliessen']);
  });
});
