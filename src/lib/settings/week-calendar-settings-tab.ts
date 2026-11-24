import { App, ButtonComponent, DropdownComponent, PluginSettingTab, Setting, ToggleComponent } from 'obsidian';
import WeekCalendartPlugin from '../../main';
import { CaldavCalendar, discoverCalendars } from '../caldav/discover-calendars';
import { Subscription } from 'rxjs';
import { SYNC_STATUS_PRESENTATION } from '../sync/sync-status';

/**
 * Schow Screen to change Settings
 */
export class WeekCalendartSettingTab extends PluginSettingTab {
  plugin: WeekCalendartPlugin;
  private caldavViewVersion = 0;
  private statusSubscription?: Subscription;

  constructor(app: App, plugin: WeekCalendartPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const viewVersion = ++this.caldavViewVersion;
    this.statusSubscription?.unsubscribe();
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
    let calendarDropdown: DropdownComponent | undefined;
    let connectButton: ButtonComponent | undefined;
    let calendars: CaldavCalendar[] = [];
    let requestVersion = 0;
    let loading = false;
    const connectionSetting = new Setting(containerEl)
      .setName('CalDAV-Verbindung')
      .setDesc('Liest die verfügbaren Kalender. Es werden keine Termine verändert.');

    const invalidateConnection = () => {
      requestVersion++;
      loading = false;
      calendars = [];
      this.plugin.settings.caldav.managedCalendarConfirmed = false;
      confirmationToggle?.setValue(false);
      calendarDropdown?.selectEl.replaceChildren();
      calendarDropdown?.addOption('', 'Zuerst Verbindung prüfen').setValue('').setDisabled(true);
      connectButton?.setDisabled(false).setButtonText('Verbindung prüfen');
      connectionSetting.setDesc('Zugangsdaten geändert. Bitte Verbindung erneut prüfen.');
    };

    new Setting(containerEl).setName('URL').addText((text) =>
      text.setValue(this.plugin.settings.caldav.url).onChange(async (val) => {
        this.plugin.settings.caldav.url = val;
        invalidateConnection();
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName('Benutzername').addText((text) =>
      text.setValue(this.plugin.settings.caldav.username).onChange(async (val) => {
        this.plugin.settings.caldav.username = val;
        invalidateConnection();
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
          invalidateConnection();
          await this.plugin.saveSettings();
        });
      });

    connectionSetting.addButton((button) => {
      connectButton = button;
      button.setButtonText('Verbindung prüfen').onClick(async () => {
        if (loading) return;
        loading = true;
        const version = ++requestVersion;
        const connection = { ...this.plugin.settings.caldav };
        button.setDisabled(true).setButtonText('Verbinde …');
        calendarDropdown?.setDisabled(true);
        connectionSetting.setDesc('Verbindung wird geprüft …');
        try {
          const found = await discoverCalendars(connection);
          if (version !== requestVersion || viewVersion !== this.caldavViewVersion) return;
          calendars = found;
          calendarDropdown!.selectEl.replaceChildren();
          calendarDropdown!.addOption('', 'Bitte einen exklusiven Kalender auswählen');
          for (const calendar of calendars) {
            calendarDropdown!.addOption(calendar.url, `${calendar.name} — ${calendar.url}`);
          }
          const selected = calendars.some((calendar) => calendar.url === connection.calendar);
          calendarDropdown!.setValue(selected ? connection.calendar : '').setDisabled(!calendars.length);
          connectionSetting.setDesc(calendars.length
            ? `${calendars.length} Kalender gefunden. Es wurden keine Termine verändert.${connection.calendar && !selected ? ' Der gespeicherte Zielkalender wurde nicht gefunden; bitte neu auswählen.' : ''}`
            : 'Verbindung erfolgreich, aber keine Kalender für Termine (VEVENT) gefunden.');
        } catch (error) {
          if (version !== requestVersion || viewVersion !== this.caldavViewVersion) return;
          calendars = [];
          calendarDropdown!.selectEl.replaceChildren();
          calendarDropdown!.addOption('', 'Verbindung fehlgeschlagen').setValue('').setDisabled(true);
          connectionSetting.setDesc(error instanceof Error ? error.message : 'CalDAV-Verbindung fehlgeschlagen.');
        } finally {
          if (version === requestVersion && viewVersion === this.caldavViewVersion) {
            loading = false;
            button.setDisabled(false).setButtonText('Verbindung prüfen');
          }
        }
      });
    });

    new Setting(containerEl)
      .setName('Zeitzone')
      .setDesc('IANA-Zeitzone für lokale Terminzeiten, unabhängig von der Gerätezeitzone, z. B. Europe/Zurich.')
      .addText((text) => text.setValue(this.plugin.settings.caldav.timezone ?? 'Europe/Zurich')
        .onChange(async (value) => {
          this.plugin.settings.caldav.timezone = value.trim();
          await this.plugin.saveSettings();
        }));

    const targetSetting = new Setting(containerEl)
      .setName('Zielkalender')
      .setDesc(`Nur einen ausschliesslich für dieses Plugin vorgesehenen Kalender auswählen. Gespeicherte URL: ${this.plugin.settings.caldav.calendar || '(keine)'}`)
      .addDropdown((dropdown) => {
        calendarDropdown = dropdown;
        dropdown
          .addOption('', 'Zuerst Verbindung prüfen')
          .setValue('')
          .setDisabled(true)
          .onChange(async (value) => {
            if (loading || !calendars.some((calendar) => calendar.url === value)) return;
            this.plugin.settings.caldav.calendar = value;
            this.plugin.settings.caldav.managedCalendarConfirmed = false;
            confirmationToggle?.setValue(false);
            targetSetting.setDesc(`Exklusiver Zielkalender: ${value}`);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Exklusiven Zielkalender freigeben')
      .setDesc(
        'Dieser Kalender wird ausschliesslich vom Plugin verwaltet. Fremde oder lokal gelöschte Einträge dürfen entfernt werden. Die Automatik übernimmt gewöhnliche Änderungen ohne Dialog; vollständiges Leeren oder Ersetzen bleibt manuell bestätigungspflichtig.',
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

    new Setting(containerEl)
      .setName('Automatisch synchronisieren')
      .setDesc('Auf Mac, iPad und iPhone nach fünf Sekunden ohne Kalenderänderung abgleichen, sobald die lokale Verarbeitung fertig ist. Obsidian muss laufen. Das Nachholen beim erneuten Aktivieren folgt im nächsten Umsetzungsschritt.')
      .addToggle((toggle) => toggle.setValue(this.plugin.settings.caldav.autoSync === true)
        .onChange(async (value) => {
          this.plugin.settings.caldav.autoSync = value;
          await this.plugin.saveSettings();
        }));

    const statusSetting = new Setting(containerEl).setName('Automatik-Status');
    this.statusSubscription = this.plugin.syncStatus$.subscribe((state) => {
      const status = SYNC_STATUS_PRESENTATION[state];
      statusSetting.setDesc(`${status.label}. ${status.description}`);
    });
  }

  hide(): void {
    this.caldavViewVersion++;
    this.statusSubscription?.unsubscribe();
  }
}
