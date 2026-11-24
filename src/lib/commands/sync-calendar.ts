import { App, Notice } from 'obsidian';
import { WeekcalendarSettings } from '../types';
import { preparePreview } from '../sync/prepare-preview';
import { executeSync } from '../sync/execute-sync';
import { SyncPreviewModal } from '../ui/sync-preview';
import { ConfirmCalendarSyncModal } from '../ui/confirm-calendar-sync';

export function createCalendarSync(app: App, settings: WeekcalendarSettings) {
  let active = true;
  let running = false;
  let dialog: ConfirmCalendarSyncModal | undefined;
  return {
    async run(): Promise<void> {
      if (!active) return;
      if (running) {
        new Notice('Ein Kalender-Sync oder dessen Bestätigung läuft bereits.');
        return;
      }
      running = true;
      const settingsSnapshot = JSON.stringify(settings);
      let progress: Notice | undefined;
      try {
        new Notice('Kalender-Sync: Vorschau wird erstellt …');
        const preview = await preparePreview(app.vault, JSON.parse(settingsSnapshot));
        if (!active) return;
        if (JSON.stringify(settings) !== settingsSnapshot) {
          new Notice('Einstellungen wurden inzwischen geändert. Bitte Sync erneut starten.');
          return;
        }
        if (!preview.ok) {
          new SyncPreviewModal(app, preview).open();
          return;
        }
        if (!preview.plan.create.length && !preview.plan.update.length && !preview.plan.delete.length) {
          new Notice('Kalender ist bereits aktuell. Keine Änderungen nötig.');
          return;
        }
        dialog = new ConfirmCalendarSyncModal(app, preview);
        const approval = await dialog.waitForApproval();
        dialog = undefined;
        if (!approval || !active) return;
        progress = new Notice('Kalender wird erneut geprüft und synchronisiert …', 0);
        const result = await executeSync(app.vault, settings, preview, settingsSnapshot,
          approval.fullDeletionConfirmed, () => active);
        if (active) {
          new Notice(`${result.message}\n${result.created} neu · ${result.updated} geändert · ${result.deleted} gelöscht · ${result.unchanged} unverändert`, 20000);
        }
      } catch {
        if (active) new Notice('Kalender-Sync konnte nicht abgeschlossen werden. Bitte eine neue Vorschau erstellen.', 10000);
      } finally {
        progress?.hide();
        running = false;
      }
    },
    cancel(): void {
      active = false;
      dialog?.close();
    },
  };
}
