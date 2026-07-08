import { App, ButtonComponent, Modal, Setting } from 'obsidian';

export type DeleteRecurrenceResult = 'all' | 'single' | 'cancel';

export class DeleteRecurrenceModal extends Modal {
  private result: DeleteRecurrenceResult = 'cancel';
  private onSubmit: (result: DeleteRecurrenceResult) => void;

  constructor(app: App, onSubmit: (result: DeleteRecurrenceResult) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h3', { text: 'Wiederkehrenden Termin löschen' });
    contentEl.createEl('p', {
      text: 'Möchten Sie nur diesen Termin oder alle zukünftigen Termine löschen?',
    });

    new Setting(contentEl).addButton((btn) => {
      btn.setButtonText('Alle löschen').onClick(() => {
        this.result = 'all';
        this.onSubmit(this.result);
        this.close();
      });
    });

    new Setting(contentEl).addButton((btn) => {
      btn.setButtonText('Nur diesen Termin löschen').onClick(() => {
        this.result = 'single';
        this.onSubmit(this.result);
        this.close();
      });
    });

    new Setting(contentEl).addButton((btn) => {
      btn.setButtonText('Abbrechen').onClick(() => {
        this.result = 'cancel';
        this.onSubmit(this.result);
        this.close();
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
