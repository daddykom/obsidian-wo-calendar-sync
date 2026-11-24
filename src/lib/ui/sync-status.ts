import { App, Modal, Platform, Plugin, setIcon } from 'obsidian';
import { Observable, Subscription } from 'rxjs';
import { SyncStatus, SYNC_STATUS_PRESENTATION } from '../sync/sync-status';

export class SyncStatusModal extends Modal {
  private subscription?: Subscription;

  constructor(app: App, private readonly status$: Observable<SyncStatus>) {
    super(app);
  }

  onOpen(): void {
    this.subscription?.unsubscribe();
    this.contentEl.empty();
    this.contentEl.createEl('h2', { text: 'Kalender-Sync: Status' });
    const label = this.contentEl.createEl('p');
    label.setAttribute('role', 'status');
    label.setAttribute('aria-live', 'polite');
    const description = this.contentEl.createEl('p');
    this.subscription = this.status$.subscribe({
      next: (state) => {
        const status = SYNC_STATUS_PRESENTATION[state];
        label.textContent = status.label;
        description.textContent = status.description;
      },
      complete: () => this.close(),
    });
  }

  onClose(): void {
    this.subscription?.unsubscribe();
    this.contentEl.empty();
  }
}

export function addSyncStatusUi(plugin: Plugin, status$: Observable<SyncStatus>): Subscription {
  const openStatus = () => new SyncStatusModal(plugin.app, status$).open();
  const ribbon = plugin.addRibbonIcon('calendar', 'Kalender-Sync: Status', openStatus);
  plugin.addCommand({ id: 'show-calendar-sync-status', name: 'Kalender-Sync: Status anzeigen', callback: openStatus });
  // Obsidian does not provide status bar items on mobile; ribbon and command work there.
  const statusBar = Platform.isMobile ? undefined : plugin.addStatusBarItem();
  if (statusBar) {
    statusBar.setAttribute('role', 'button');
    statusBar.setAttribute('tabindex', '0');
    plugin.registerDomEvent(statusBar, 'click', openStatus);
    plugin.registerDomEvent(statusBar, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openStatus();
      }
    });
  }
  return status$.subscribe((state) => {
    const status = SYNC_STATUS_PRESENTATION[state];
    setIcon(ribbon, status.icon);
    ribbon.setAttribute('aria-label', `Kalender-Sync: ${status.label}`);
    if (statusBar) {
      statusBar.textContent = `Kalender: ${status.label}`;
      statusBar.setAttribute('aria-label', `Kalender-Sync: ${status.label}`);
    }
  });
}
