import { App, Notice } from 'obsidian';
import { WeekcalendarSettings } from '../types';
import { preparePreview } from '../sync/prepare-preview';
import { SyncPreviewModal } from '../ui/sync-preview';

export function previewCalendarSync(app: App, settings: WeekcalendarSettings): () => Promise<void> {
  let running = false;
  return async () => {
    if (running) {
      new Notice('Kalender-Vorschau wird bereits erstellt.');
      return;
    }
    running = true;
    const snapshot = JSON.stringify(settings);
    try {
      new Notice('Kalender-Vorschau wird erstellt …');
      const result = await preparePreview(app.vault, JSON.parse(snapshot));
      if (JSON.stringify(settings) !== snapshot) {
        new Notice('Einstellungen wurden inzwischen geändert. Bitte Vorschau erneut erstellen.');
        return;
      }
      new SyncPreviewModal(app, result).open();
    } finally {
      running = false;
    }
  };
}
