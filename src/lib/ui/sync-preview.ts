import { App, Modal, Setting } from 'obsidian';
import { PreviewResult } from '../sync/prepare-preview';

export class SyncPreviewModal extends Modal {
  constructor(app: App, private readonly result: PreviewResult) {
    super(app);
  }

  onOpen(): void {
    renderSyncPreview(this.contentEl, this.result);
    new Setting(this.contentEl).addButton((button) => button.setButtonText('Schliessen').onClick(() => this.close()));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export function renderSyncPreview(contentEl: HTMLElement, result: PreviewResult, executable = false): void {
  contentEl.createEl('h2', { text: 'Kalender-Synchronisation: Vorschau' });
  contentEl.createEl('p', { text: executable
    ? 'Bisher wurde nichts verändert. „Jetzt synchronisieren“ bestätigt die unten aufgeführten Änderungen am exklusiven Zielkalender. Notizen werden nicht verändert.'
    : 'Nur Vorschau. Es wurden keine Notizen oder Kalendereinträge verändert.' });
  if (!result.ok) {
    contentEl.createEl('h3', { text: 'Kein sicherer Abgleich möglich' });
    const list = contentEl.createEl('ul');
    for (const error of result.errors) {
      list.createEl('li', { text: `${error.path}${error.line ? ':' + error.line : ''}${error.path ? ': ' : ''}${error.message}` });
    }
  } else {
    const { plan, calendarUrl, timezone, scannedFiles, localCount, remoteCount } = result;
    contentEl.createEl('p', { text: `Ziel: ${calendarUrl}\nZeitzone: ${timezone}` });
    contentEl.createEl('p', { text: `${scannedFiles} Wochen-Dateien · ${localCount} lokale Termine · ${remoteCount} Kalenderressourcen` });
    contentEl.createEl('p', { text: `${plan.create.length} neu · ${plan.update.length} ändern · ${plan.delete.length} löschen · ${plan.unchanged} unverändert` });
    if (!localCount && remoteCount) {
      contentEl.createEl('p', { text: 'ACHTUNG: Lokal sind keine Termine vorhanden. Ein Sync würde den Zielkalender vollständig leeren und benötigt eine zusätzliche Bestätigung.' });
    } else if (plan.delete.length === remoteCount && remoteCount) {
      contentEl.createEl('p', { text: 'ACHTUNG: Alle bisherigen Kalenderressourcen würden gelöscht und gegebenenfalls durch lokale Termine ersetzt. Ein Sync benötigt eine zusätzliche Bestätigung.' });
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
    contentEl.createEl('p', { text: 'Momentaufnahme: Vor Schreibzugriffen werden lokale Dateien und Serverdaten erneut geprüft. Bei Änderungen muss eine neue Vorschau bestätigt werden.' });
  }
}
