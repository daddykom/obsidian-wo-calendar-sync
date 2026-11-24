import { App, Notice } from 'obsidian';
import { WeekcalendarSettings } from '../types';
import { preparePreview } from '../sync/prepare-preview';
import { executeSync, requiresFullDeletionConfirmation, SyncResult } from '../sync/execute-sync';
import { getInitialSyncStatus, SyncStatus } from '../sync/sync-status';
import { SyncPreviewModal } from '../ui/sync-preview';
import { ConfirmCalendarSyncModal } from '../ui/confirm-calendar-sync';

export interface AutomaticSyncOutcome {
  status: 'off' | 'setup-required' | 'busy' | 'cancelled' | 'stale' | 'confirmation-required' | 'synced' | 'error';
  result?: SyncResult;
}

export function createCalendarSync(
  app: App,
  settings: WeekcalendarSettings,
  reportStatus: (status: SyncStatus) => void = () => {},
  onIdle: () => void = () => {},
) {
  let active = true;
  let running = false;
  let dialog: ConfirmCalendarSyncModal | undefined;
  const publishStatus = (status: SyncStatus) => {
    if (active) reportStatus(settings.caldav.autoSync === true ? status : 'off');
  };
  const publishConfigStatus = () => publishStatus(getInitialSyncStatus(settings.caldav));
  return {
    async run(): Promise<void> {
      if (!active) return;
      if (running) {
        new Notice('Ein Kalender-Sync oder dessen Bestätigung läuft bereits.');
        return;
      }
      running = true;
      publishStatus('running');
      const settingsSnapshot = JSON.stringify(settings);
      let progress: Notice | undefined;
      try {
        new Notice('Kalender-Sync: Vorschau wird erstellt …');
        const preview = await preparePreview(app.vault, JSON.parse(settingsSnapshot));
        if (!active) return;
        if (JSON.stringify(settings) !== settingsSnapshot) {
          publishConfigStatus();
          new Notice('Einstellungen wurden inzwischen geändert. Bitte Sync erneut starten.');
          return;
        }
        if (!preview.ok) {
          const initial = getInitialSyncStatus(settings.caldav);
          publishStatus(initial === 'setup-required' ? initial : 'error');
          new SyncPreviewModal(app, preview).open();
          return;
        }
        const hasChanges = preview.plan.create.length + preview.plan.update.length + preview.plan.delete.length > 0;
        let fullDeletionConfirmed = false;
        if (hasChanges) {
          dialog = new ConfirmCalendarSyncModal(app, preview);
          const approval = await dialog.waitForApproval();
          dialog = undefined;
          if (!active) return;
          if (!approval) {
            if (JSON.stringify(settings) !== settingsSnapshot) publishConfigStatus();
            else publishStatus(requiresFullDeletionConfirmation(preview) ? 'confirmation-required' : 'pending');
            return;
          }
          fullDeletionConfirmed = approval.fullDeletionConfirmed;
        }
        progress = new Notice('Kalender wird erneut geprüft und synchronisiert …', 0);
        const result = await executeSync(app.vault, settings, preview, settingsSnapshot,
          fullDeletionConfirmed, () => active);
        if (active) {
          if (JSON.stringify(settings) !== settingsSnapshot) publishConfigStatus();
          else publishStatus(result.ok ? 'synced' : 'error');
          new Notice(`${result.message}\n${result.created} neu · ${result.updated} geändert · ${result.deleted} gelöscht · ${result.unchanged} unverändert`, 20000);
        }
      } catch {
        if (JSON.stringify(settings) !== settingsSnapshot) publishConfigStatus();
        else publishStatus('error');
        if (active) new Notice('Kalender-Sync konnte nicht abgeschlossen werden. Bitte eine neue Vorschau erstellen.', 10000);
      } finally {
        progress?.hide();
        running = false;
        onIdle();
      }
    },
    async runAutomatic(): Promise<AutomaticSyncOutcome> {
      if (!active) return { status: 'cancelled' };
      if (settings.caldav.autoSync !== true) {
        publishStatus('off');
        return { status: 'off' };
      }
      // Both entry points own this same lock, including manual confirmation time.
      if (running) return { status: 'busy' };
      if (getInitialSyncStatus(settings.caldav) === 'setup-required') {
        publishStatus('setup-required');
        return { status: 'setup-required' };
      }
      running = true;
      publishStatus('running');
      const settingsSnapshot = JSON.stringify(settings);
      try {
        const preview = await preparePreview(app.vault, JSON.parse(settingsSnapshot));
        if (!active) return { status: 'cancelled' };
        if (JSON.stringify(settings) !== settingsSnapshot) {
          publishConfigStatus();
          return { status: settings.caldav.autoSync === true ? 'stale' : 'off' };
        }
        if (!preview.ok) {
          publishStatus('error');
          return { status: 'error' };
        }
        // Refuse the whole replacement plan, not just its deletion phase.
        if (requiresFullDeletionConfirmation(preview)) {
          publishStatus('confirmation-required');
          return { status: 'confirmation-required' };
        }
        const result = await executeSync(app.vault, settings, preview, settingsSnapshot,
          false, () => active && settings.caldav.autoSync === true);
        if (!active) return { status: 'cancelled', result };
        if (JSON.stringify(settings) !== settingsSnapshot) {
          publishConfigStatus();
          return { status: settings.caldav.autoSync === true ? 'stale' : 'off', result };
        }
        publishStatus(result.ok ? 'synced' : 'error');
        return { status: result.ok ? 'synced' : 'error', result };
      } catch {
        if (!active) return { status: 'cancelled' };
        if (JSON.stringify(settings) !== settingsSnapshot) {
          publishConfigStatus();
          return { status: settings.caldav.autoSync === true ? 'stale' : 'off' };
        }
        publishStatus('error');
        return { status: 'error' };
      } finally {
        running = false;
        onIdle();
      }
    },
    cancel(): void {
      active = false;
      dialog?.close();
    },
  };
}
