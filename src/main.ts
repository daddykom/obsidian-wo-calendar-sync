import { Notice, Plugin } from 'obsidian';
import { fromEvent, Subscription } from 'rxjs';
import { createYear } from './lib/commands/create-year/create-year';
import { processActiveFile } from './lib/commands/process-active-file';
import { processAll } from './lib/commands/process-all';
import { modifyWeekFileEvent } from './lib/event-handling/modify-week-file-event';
import { DEFAULT_SETTINGS } from './lib/settings/constants';
import { WeekCalendartSettingTab } from './lib/settings/week-calendar-settings-tab';
import { checkToSplicedCompatibility } from './lib/utils/check-toSpliced-compatibility';

export default class WeekCalendartPlugin extends Plugin {
  actualFileChanded$ = fromEvent(this.app.workspace, 'active-leaf-change');
  subscription = new Subscription();
  settings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    const versionCheck = checkToSplicedCompatibility();
    if (versionCheck) {
      new Notice(versionCheck, 10000);
      return;
    }
    this.addCommand({
      id: 'process-active-wo-file',
      name: 'Aktives Wochenfile verarbeiten',
      callback: processActiveFile(this.app),
    });

    this.addCommand({
      id: 'process-all-wo-file',
      name: 'Alle Wochenfile verarbeiten',
      callback: processAll(this.app),
    });

    this.addCommand({
      id: 'create-new-calendar-year',
      name: 'Ein neues Kalenderjahr erstellen',
      callback: createYear(this.app, this.settings),
    });

    this.subscription.add(
      modifyWeekFileEvent(this.app, fromEvent(this.app.vault, 'modify'), this.actualFileChanded$),
    );

    this.addSettingTab(new WeekCalendartSettingTab(this.app, this));
    new Notice('Week Calendart loaded.');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload(): void {
    new Notice('Week Calendart unload.');
    this.subscription.unsubscribe();
  }
}
