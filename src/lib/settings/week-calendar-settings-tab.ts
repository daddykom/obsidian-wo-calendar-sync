import { App, PluginSettingTab, Setting, ToggleComponent } from 'obsidian';
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

    new Setting(containerEl)
      .setName('Overview File Name')
      .setDesc('Name of the File, where the Links to all Week Files are.')
      .addText((text) =>
        text
          .setPlaceholder('Übersicht')
          .setValue(this.plugin.settings.paths.overviewFileName)
          .onChange(async (value) => {
            this.plugin.settings.paths.overviewFileName = value;
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
    let confirmationToggle: ToggleComponent | undefined;

    new Setting(containerEl).setName('URL').addText((text) =>
      text.setValue(this.plugin.settings.caldav.url).onChange(async (val) => {
        this.plugin.settings.caldav.url = val;
        this.plugin.settings.caldav.managedCalendarConfirmed = false;
        confirmationToggle?.setValue(false);
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName('Benutzername').addText((text) =>
      text.setValue(this.plugin.settings.caldav.username).onChange(async (val) => {
        this.plugin.settings.caldav.username = val;
        this.plugin.settings.caldav.managedCalendarConfirmed = false;
        confirmationToggle?.setValue(false);
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl)
      .setName('Passwort')
      .setDesc(
        'Wird in der Plugin-Konfiguration unverschlüsselt gespeichert. Bei iCloud ein app-spezifisches Passwort verwenden.',
      )
      .addText((text) => {
        text.inputEl.type = 'password';
        text.setValue(this.plugin.settings.caldav.password).onChange(async (val) => {
          this.plugin.settings.caldav.password = val;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Zielkalender-URL')
      .setDesc(
        'URL eines ausschliesslich für dieses Plugin vorgesehenen Kalenders, nicht die Server-URL. Die Auswahl vom Server folgt im nächsten Verbindungsschritt.',
      )
      .addText((text) =>
        text.setValue(this.plugin.settings.caldav.calendar).onChange(async (val) => {
          this.plugin.settings.caldav.calendar = val;
          this.plugin.settings.caldav.managedCalendarConfirmed = false;
          confirmationToggle?.setValue(false);
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Exklusiven Zielkalender freigeben')
      .setDesc(
        'Dieser Kalender wird ausschliesslich vom Plugin verwaltet. Beim späteren Sync dürfen alle Einträge gelöscht werden, die nicht in den Wochen-Dateien vorkommen. Aktuell erfolgt noch keine Synchronisation.',
      )
      .addToggle((toggle) => {
        confirmationToggle = toggle;
        toggle
          .setValue(this.plugin.settings.caldav.managedCalendarConfirmed === true)
          .onChange(async (value) => {
            this.plugin.settings.caldav.managedCalendarConfirmed = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
