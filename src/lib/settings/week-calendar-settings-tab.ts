import { App, PluginSettingTab, Setting } from 'obsidian';
import WeekCalendartPlugin from '../../main';

/**
 * Schow Screen to change Settings
 */
export class WeekCalendartSettingTab extends PluginSettingTab {
  plugin: WeekCalendartPlugin;

  constructor(app: App, plugin: WeekCalendartPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // --- Paths ---
    containerEl.createEl('h2', { text: 'Folders' });

    new Setting(containerEl)
      .setName('Week Folder')
      .setDesc('Folder for all Week Files')
      .addText((text) =>
        text
          .setPlaceholder('wochen')
          .setValue(this.plugin.settings.paths.weekFolder)
          .onChange(async (value) => {
            this.plugin.settings.paths.weekFolder = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Event Folder')
      .setDesc('Folder for CalDav Events')
      .addText((text) =>
        text
          .setPlaceholder('events')
          .setValue(this.plugin.settings.paths.eventFolder)
          .onChange(async (value) => {
            this.plugin.settings.paths.eventFolder = value;
            await this.plugin.saveSettings();
          }),
      );

    // --- Weekdays ---
    containerEl.createEl('h2', { text: 'Week File Titles' });

    Object.entries(this.plugin.settings.weekdays)
      .filter(([key]) => key !== 'start')
      .forEach(([key, value]) => {
        new Setting(containerEl).setName(key).addText((text) =>
          text.setValue(value).onChange(async (val) => {
            this.plugin.settings.weekdays[key as keyof typeof this.plugin.settings.weekdays] = val;
            await this.plugin.saveSettings();
          }),
        );
      });

    // --- Prefixes ---
    containerEl.createEl('h2', { text: 'Event Fields' });

    Object.entries(this.plugin.settings.prefixes).forEach(([key, value]) => {
      new Setting(containerEl).setName(key).addText((text) =>
        text.setValue(value).onChange(async (val) => {
          this.plugin.settings.prefixes[key as keyof typeof this.plugin.settings.prefixes] = val;
          await this.plugin.saveSettings();
        }),
      );
    });

    // --- CalDAV ---
    containerEl.createEl('h2', { text: 'CalDAV' });

    new Setting(containerEl).setName('URL').addText((text) =>
      text.setValue(this.plugin.settings.caldav.url).onChange(async (val) => {
        this.plugin.settings.caldav.url = val;
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName('Benutzername').addText((text) =>
      text.setValue(this.plugin.settings.caldav.username).onChange(async (val) => {
        this.plugin.settings.caldav.username = val;
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName('Passwort').addText((text) =>
      text.setValue(this.plugin.settings.caldav.password).onChange(async (val) => {
        this.plugin.settings.caldav.password = val;
        await this.plugin.saveSettings();
      }),
    );
  }
}
