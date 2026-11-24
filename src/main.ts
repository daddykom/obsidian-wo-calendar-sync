import { Notice, Plugin } from 'obsidian';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { createYear } from './lib/commands/create-year/create-year';
import { gotoCurrentWeek } from './lib/commands/goto-current-week';
import { migrateAllWeekHeadings } from './lib/commands/migrate-week-headings';
import { processActiveFile } from './lib/commands/process-active-file';
import { processAll } from './lib/commands/process-all';
import { previewCalendarSync } from './lib/commands/preview-calendar-sync';
import { createCalendarSync } from './lib/commands/sync-calendar';
import { watchWeekFiles } from './lib/event-handling/watch-week-files';
import { createAutomaticSyncCoordinator } from './lib/sync/automatic-sync-coordinator';
import { mergeSettings } from './lib/settings/load-settings';
import { WeekCalendartSettingTab } from './lib/settings/week-calendar-settings-tab';
import { checkToSplicedCompatibility } from './lib/utils/check-toSpliced-compatibility';
import { getInitialSyncStatus, SyncStatus } from './lib/sync/sync-status';
import { addSyncStatusUi } from './lib/ui/sync-status';

export default class WeekCalendartPlugin extends Plugin {
  actualFileChanded$ = fromEvent(this.app.workspace, 'active-leaf-change');
  subscription = new Subscription();
  settings = mergeSettings();
  syncStatus$ = new BehaviorSubject<SyncStatus>('off');
  migratingFiles = new Set<string>();
  private stopCalendarSync?: () => void;
  private automaticSync?: ReturnType<typeof createAutomaticSyncCoordinator>;

  async onload(): Promise<void> {
    const versionCheck = checkToSplicedCompatibility();
    if (versionCheck) {
      new Notice(versionCheck, 10000);
      return;
    }
    await this.loadSettings();
    this.syncStatus$.next(getInitialSyncStatus(this.settings.caldav));
    this.subscription.add(addSyncStatusUi(this, this.syncStatus$));

    const calendarSync = createCalendarSync(this.app, this.settings,
      (status) => this.automaticSync?.reportWorkerStatus(status),
      () => this.automaticSync?.idle());
    const automaticSync = createAutomaticSyncCoordinator(this.settings, calendarSync.runAutomatic,
      (status) => this.syncStatus$.next(status));
    this.automaticSync = automaticSync;
    this.subscription.add(() => automaticSync.dispose());
    this.stopCalendarSync = calendarSync.cancel;
    this.addCommand({
      id: 'sync-calendar',
      name: 'Kalender synchronisieren',
      callback: calendarSync.run,
    });

    this.addCommand({
      id: 'preview-calendar-sync',
      name: 'Kalender-Synchronisation: Vorschau',
      callback: previewCalendarSync(this.app, this.settings),
    });

    this.addCommand({
      id: 'process-active-wo-file',
      name: 'Aktives Wochenfile verarbeiten',
      callback: processActiveFile(this.app, this.settings),
    });

    this.addCommand({
      id: 'process-all-wo-file',
      name: 'Alle Wochenfile verarbeiten',
      callback: processAll(this.app, this.settings),
    });

    this.addCommand({
      id: 'create-new-calendar-year',
      name: 'Ein neues Kalenderjahr erstellen',
      callback: createYear(this.app, this.settings),
    });

    this.addCommand({
      id: 'migrate-week-day-headings',
      name: 'Monatstage in bestehenden Wochen-Dateien ergänzen',
      callback: migrateAllWeekHeadings(this.app, this.settings, this.migratingFiles),
    });

    this.addCommand({
      id: 'get-current-week-file',
      name: 'Das aktuelle Wochen-File öffnen',
      callback: gotoCurrentWeek(this.app, this.settings),
    });

    // Vault "create" also fires during initial loading; only watch actual changes after layout readiness.
    this.app.workspace.onLayoutReady(() => {
      if (this.subscription.closed) return;
      this.subscription.add(watchWeekFiles(this.app, this.settings, this.actualFileChanded$,
        this.migratingFiles, automaticSync));
    });

    this.addSettingTab(new WeekCalendartSettingTab(this.app, this));
    new Notice('Week Calendart loaded.');
  }

  async loadSettings() {
    this.settings = mergeSettings(await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    if (this.automaticSync) this.automaticSync.configurationChanged();
    else this.syncStatus$.next(getInitialSyncStatus(this.settings.caldav));
  }

  onunload(): void {
    this.stopCalendarSync?.();
    new Notice('Week Calendart unload.');
    this.subscription.unsubscribe();
    this.syncStatus$.complete();
  }
}
