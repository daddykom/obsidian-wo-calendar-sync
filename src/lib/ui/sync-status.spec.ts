import { BehaviorSubject } from 'rxjs';
import { Platform, Plugin, setIcon } from 'obsidian';
import type { App } from 'obsidian';
import { addSyncStatusUi, SyncStatusModal } from './sync-status';
import { SyncStatus } from '../sync/sync-status';

const mockElements: { textContent: string; setAttribute: jest.Mock }[] = [];
jest.mock('obsidian', () => ({
  Platform: { isMobile: false },
  setIcon: jest.fn(),
  Modal: class {
    contentEl = {
      empty: jest.fn(),
      createEl: (_tag: string, options?: { text: string }) => {
        const element = { textContent: options?.text ?? '', setAttribute: jest.fn() };
        mockElements.push(element);
        return element;
      },
    };
    open() { this.onOpen(); }
    close = jest.fn(() => this.onClose());
    onOpen() {}
    onClose() {}
  },
}));

describe('sync status UI on desktop and mobile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElements.length = 0;
    (Platform as { isMobile: boolean }).isMobile = false;
  });

  const createPlugin = () => {
    const ribbon = { setAttribute: jest.fn() };
    const bar = { setAttribute: jest.fn(), textContent: '' };
    return {
      ribbon, bar,
      plugin: {
        app: {}, addRibbonIcon: jest.fn(() => ribbon), addStatusBarItem: jest.fn(() => bar),
        addCommand: jest.fn(), registerDomEvent: jest.fn(),
      },
    };
  };

  it('updates desktop text and the ribbon icon without making any network request', () => {
    const { plugin, ribbon, bar } = createPlugin();
    const status$ = new BehaviorSubject<SyncStatus>('off');
    const subscription = addSyncStatusUi(plugin as unknown as Plugin, status$);
    expect(bar.textContent).toBe('Kalender: Automatik aus');
    status$.next('pending');
    expect(bar.textContent).toBe('Kalender: Ausstehend');
    expect(ribbon.setAttribute).toHaveBeenLastCalledWith('aria-label', 'Kalender-Sync: Ausstehend');
    expect(setIcon).toHaveBeenLastCalledWith(ribbon, 'clock');
    subscription.unsubscribe();
    status$.next('synced');
    expect(bar.textContent).toBe('Kalender: Ausstehend');
  });

  it('offers ribbon and command access on mobile without calling the unsupported status bar API', () => {
    (Platform as { isMobile: boolean }).isMobile = true;
    const { plugin } = createPlugin();
    const status$ = new BehaviorSubject<SyncStatus>('not-checked');
    const subscription = addSyncStatusUi(plugin as unknown as Plugin, status$);
    expect(plugin.addStatusBarItem).not.toHaveBeenCalled();
    expect(plugin.addRibbonIcon).toHaveBeenCalledTimes(1);
    const command = plugin.addCommand.mock.calls[0][0] as { name: string; callback: () => void };
    expect(command.name).toBe('Kalender-Sync: Status anzeigen');
    command.callback();
    expect(mockElements[1].textContent).toBe('Noch nicht geprüft');
    status$.complete();
    subscription.unsubscribe();
  });

  it('updates an open status dialog and unsubscribes when closed', () => {
    const status$ = new BehaviorSubject<SyncStatus>('pending');
    const modal = new SyncStatusModal({} as App, status$);
    modal.onOpen();
    const label = mockElements[1];
    expect(label.textContent).toBe('Ausstehend');
    status$.next('synced');
    expect(label.textContent).toBe('Synchronisiert');
    modal.onClose();
    status$.next('error');
    expect(label.textContent).toBe('Synchronisiert');
  });

  it('closes an open dialog when the plugin completes its status stream', () => {
    const status$ = new BehaviorSubject<SyncStatus>('not-checked');
    const modal = new SyncStatusModal({} as App, status$);
    modal.onOpen();
    status$.complete();
    expect(modal.close).toHaveBeenCalledTimes(1);
  });
});
