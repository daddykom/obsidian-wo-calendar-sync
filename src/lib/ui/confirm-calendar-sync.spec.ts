import type { App } from 'obsidian';
import { ConfirmCalendarSyncModal } from './confirm-calendar-sync';
import { PreparedPreview } from '../sync/prepare-preview';

type Button = {
  text: string; disabled: boolean; click?: () => void;
  setButtonText(text: string): Button;
  setDisabled(value: boolean): Button;
  setCta(): Button;
  onClick(callback: () => void): Button;
};
const mockButtons: Button[] = [];
let mockToggle: ((value: boolean) => void) | undefined;
jest.mock('./sync-preview', () => ({ renderSyncPreview: jest.fn() }));
jest.mock('obsidian', () => ({
  Modal: class {
    contentEl = { empty: jest.fn() };
    open() { this.onOpen(); }
    close() { this.onClose(); }
    onOpen() {}
    onClose() {}
  },
  Setting: class {
    setName() { return this; }
    setDesc() { return this; }
    addToggle(callback: (toggle: unknown) => void) {
      const toggle = {
        setValue() { return toggle; },
        onChange(callback: (value: boolean) => void) { mockToggle = callback; return toggle; },
      };
      callback(toggle);
      return this;
    }
    addButton(callback: (button: Button) => void) {
      const button: Button = {
        text: '', disabled: false,
        setButtonText(text) { this.text = text; return this; },
        setDisabled(value) { this.disabled = value; return this; },
        setCta() { return this; },
        onClick(callback) { this.click = callback; return this; },
      };
      mockButtons.push(button);
      callback(button);
      return this;
    }
  },
}));

const preview: PreparedPreview = {
  ok: true, calendarUrl: 'https://example.com/calendar/', timezone: 'Europe/Zurich',
  scannedFiles: 0, localCount: 0, remoteCount: 1, sources: [], local: [], remote: [],
  plan: { create: [], update: [], unchanged: 0, delete: [{
    uid: 'foreign', title: 'Fremd', url: 'https://example.com/calendar/foreign', etag: '"v1"', comparable: null,
  }] },
};

describe('ConfirmCalendarSyncModal', () => {
  beforeEach(() => { mockButtons.length = 0; mockToggle = undefined; });

  it('requires an additional explicit confirmation before approving deletion of all entries', async () => {
    const modal = new ConfirmCalendarSyncModal({} as App, preview);
    const pending = modal.waitForApproval();
    const submit = mockButtons.find((button) => button.text === 'Jetzt synchronisieren')!;
    expect(submit.disabled).toBe(true);
    submit.click!();
    expect(modal.contentEl.empty).not.toHaveBeenCalled();
    mockToggle!(true);
    expect(submit.disabled).toBe(false);
    submit.click!();
    expect(await pending).toEqual({ fullDeletionConfirmed: true });
  });

  it('returns no approval on cancel or closing the dialog', async () => {
    const modal = new ConfirmCalendarSyncModal({} as App, preview);
    const pending = modal.waitForApproval();
    mockButtons.find((button) => button.text === 'Abbrechen')!.click!();
    expect(await pending).toBeNull();
  });

  it('allows an ordinary explicit approval when not all existing resources are deleted', async () => {
    const modal = new ConfirmCalendarSyncModal({} as App, { ...preview, remoteCount: 2 });
    const pending = modal.waitForApproval();
    expect(mockToggle).toBeUndefined();
    const submit = mockButtons.find((button) => button.text === 'Jetzt synchronisieren')!;
    expect(submit.disabled).toBe(false);
    submit.click!();
    expect(await pending).toEqual({ fullDeletionConfirmed: false });
  });
});
