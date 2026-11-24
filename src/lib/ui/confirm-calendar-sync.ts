import { App, ButtonComponent, Modal, Setting } from 'obsidian';
import { PreparedPreview } from '../sync/prepare-preview';
import { requiresFullDeletionConfirmation } from '../sync/execute-sync';
import { renderSyncPreview } from './sync-preview';

export interface SyncApproval {
  fullDeletionConfirmed: boolean;
}

export class ConfirmCalendarSyncModal extends Modal {
  private resolve?: (approval: SyncApproval | null) => void;
  private approval: SyncApproval | null = null;

  constructor(app: App, private readonly preview: PreparedPreview) {
    super(app);
  }

  waitForApproval(): Promise<SyncApproval | null> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.open();
    });
  }

  onOpen(): void {
    renderSyncPreview(this.contentEl, this.preview, true);
    const fullDeletion = requiresFullDeletionConfirmation(this.preview);
    let fullDeletionConfirmed = false;
    let submit: ButtonComponent | undefined;
    if (fullDeletion) {
      new Setting(this.contentEl)
        .setName('Alle bisherigen Kalendereinträge löschen')
        .setDesc('Ich bestätige ausdrücklich, dass sämtliche bisherigen Einträge dieses Zielkalenders gelöscht werden dürfen.')
        .addToggle((toggle) => toggle.setValue(false).onChange((value) => {
          fullDeletionConfirmed = value;
          submit?.setDisabled(!value);
        }));
    }
    new Setting(this.contentEl)
      .addButton((button) => button.setButtonText('Abbrechen').onClick(() => this.close()))
      .addButton((button) => {
        submit = button;
        button.setButtonText('Jetzt synchronisieren').setCta().setDisabled(fullDeletion)
          .onClick(() => {
            if (fullDeletion && !fullDeletionConfirmed) return;
            this.approval = { fullDeletionConfirmed };
            this.close();
          });
      });
  }

  onClose(): void {
    this.resolve?.(this.approval);
    this.resolve = undefined;
    this.contentEl.empty();
  }
}
