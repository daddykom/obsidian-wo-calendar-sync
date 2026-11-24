import { Notice, Plugin } from 'obsidian';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { createYear } from './lib/commands/create-year/create-year';
import { gotoCurrentWeek } from './lib/commands/goto-current-week';
import { migrateAllWeekHeadings } from './lib/commands/migrate-week-headings';
import { processActiveFile } from './lib/commands/process-active-file';
import { processAll } from './lib/commands/process-all';
import { previewCalendarSync } from './lib/commands/preview-calendar-sync';
import { createCalendarSync } from './lib/commands/sync-calendar';
import { modifyWeekFileEvent } from './lib/event-handling/modify-week-file-event';
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

  async onload(): Promise<void> {
    const versionCheck = checkToSplicedCompatibility();
    if (versionCheck) {
      new Notice(versionCheck, 10000);
      return;
    }
    await this.loadSettings();
    this.syncStatus$.next(getInitialSyncStatus(this.settings.caldav));
    this.subscription.add(addSyncStatusUi(this, this.syncStatus$));

    const calendarSync = createCalendarSync(this.app, this.settings);
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

    this.subscription.add(
      modifyWeekFileEvent(
        this.app,
        fromEvent(this.app.vault, 'modify'),
        this.actualFileChanded$,
        this.settings,
        this.migratingFiles,
      ),
    );

    this.addSettingTab(new WeekCalendartSettingTab(this.app, this));
    new Notice('Week Calendart loaded.');
  }

  async loadSettings() {
    this.settings = mergeSettings(await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.syncStatus$.next(getInitialSyncStatus(this.settings.caldav));
  }

  onunload(): void {
    this.stopCalendarSync?.();
    new Notice('Week Calendart unload.');
    this.subscription.unsubscribe();
    this.syncStatus$.complete();
  }
}
