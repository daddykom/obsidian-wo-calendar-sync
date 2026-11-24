import { App, Modal, Setting } from 'obsidian';
import { PreviewResult } from '../sync/prepare-preview';

export class SyncPreviewModal extends Modal {
  constructor(app: App, private readonly result: PreviewResult) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Kalender-Synchronisation: Vorschau' });
    contentEl.createEl('p', { text: 'Nur Vorschau. Es wurden keine Notizen oder Kalendereinträge verändert.' });
    if (!this.result.ok) {
      contentEl.createEl('h3', { text: 'Kein sicherer Abgleich möglich' });
      const list = contentEl.createEl('ul');
      for (const error of this.result.errors) {
        list.createEl('li', { text: `${error.path}${error.line ? ':' + error.line : ''}${error.path ? ': ' : ''}${error.message}` });
      }
    } else {
      const { plan, calendarUrl, timezone, scannedFiles, localCount, remoteCount } = this.result;
      contentEl.createEl('p', { text: `Ziel: ${calendarUrl}\nZeitzone: ${timezone}` });
      contentEl.createEl('p', { text: `${scannedFiles} Wochen-Dateien · ${localCount} lokale Termine · ${remoteCount} Kalenderressourcen` });
      contentEl.createEl('p', { text: `${plan.create.length} neu · ${plan.update.length} ändern · ${plan.delete.length} löschen · ${plan.unchanged} unverändert` });
      if (!localCount && remoteCount) {
        contentEl.createEl('p', { text: 'ACHTUNG: Lokal sind keine Termine vorhanden. Ein späterer Sync würde den Zielkalender vollständig leeren und benötigt eine zusätzliche Bestätigung.' });
      } else if (plan.delete.length === remoteCount && remoteCount) {
        contentEl.createEl('p', { text: 'ACHTUNG: Alle bisherigen Kalenderressourcen würden gelöscht und gegebenenfalls durch lokale Termine ersetzt. Ein späterer Sync benötigt eine zusätzliche Bestätigung.' });
      }
      for (const [heading, items] of [
        ['Neu anlegen', plan.create.map((event) => `${event.date}: ${event.title} — ${event.sourcePath}:${event.sourceLine}`)],
        ['Ändern', plan.update.map(({ local, fields }) => `${local.date}: ${local.title} — ${fields.join(', ')}`)],
        ['Löschen (auch fremde Einträge)', plan.delete.map((event) => `${event.title} — ${event.url}`)],
      ] as const) {
        if (!items.length) continue;
        contentEl.createEl('h3', { text: `${heading} (${items.length})` });
        const list = contentEl.createEl('ul');
        for (const text of items) list.createEl('li', { text });
      }
      contentEl.createEl('p', { text: 'Momentaufnahme: Vor einem späteren Schreibzugriff müssen lokale Dateien und Serverdaten erneut geprüft werden.' });
    }
    new Setting(contentEl).addButton((button) => button.setButtonText('Schliessen').onClick(() => this.close()));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
