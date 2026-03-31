import { App, ButtonComponent, Modal, Setting } from 'obsidian';

export class CreateYearPrompt extends Modal {
  #value = '';
  #onSubmit: (value: string) => void;
  #isValid = false;

  constructor(app: App, onSubmit: (value: string) => void) {
    super(app);
    this.#onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    let submitButton: ButtonComponent | null = null;

    new Setting(contentEl).setName('Jahr (4-stellig)').addText((text) => {
      text.onChange((value) => {
        this.#value = value;
        this.#isValid = /^\d{4}$/.test(value);
        submitButton?.setDisabled(!this.#isValid);
      });

      text.inputEl.focus();
    });

    new Setting(contentEl).addButton((btn) => {
      submitButton = btn;

      btn
        .setButtonText('OK')
        .setCta()
        .setDisabled(true)
        .onClick(() => {
          if (!this.#isValid) {
            return;
          }
          this.#onSubmit(this.#value);
          this.close();
        });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
