type MockTextComponent = {
  inputEl: { type: string };
  placeholder: string;
  value: string;
  onChangeCallback?: (value: string) => Promise<void> | void;
  setPlaceholder: (value: string) => MockTextComponent;
  setValue: (value: string) => MockTextComponent;
  onChange: (callback: (value: string) => Promise<void> | void) => MockTextComponent;
};

type MockToggleComponent = {
  value: boolean;
  onChangeCallback?: (value: boolean) => Promise<void> | void;
  setValue: (value: boolean) => MockToggleComponent;
  onChange: (callback: (value: boolean) => Promise<void> | void) => MockToggleComponent;
};

type MockButtonComponent = {
  text: string;
  disabled: boolean;
  onClickCallback?: () => Promise<void> | void;
  setButtonText: (text: string) => MockButtonComponent;
  setDisabled: (disabled: boolean) => MockButtonComponent;
  onClick: (callback: () => Promise<void> | void) => MockButtonComponent;
};

type MockDropdownComponent = {
  value: string;
  disabled: boolean;
  options: Record<string, string>;
  selectEl: { replaceChildren: () => void };
  onChangeCallback?: (value: string) => Promise<void> | void;
  addOption: (value: string, label: string) => MockDropdownComponent;
  setValue: (value: string) => MockDropdownComponent;
  setDisabled: (disabled: boolean) => MockDropdownComponent;
  onChange: (callback: (value: string) => Promise<void> | void) => MockDropdownComponent;
};

type MockSettingInstance = {
  containerEl: unknown;
  name: string;
  desc: string;
  textComponent?: MockTextComponent;
  toggleComponent?: MockToggleComponent;
  buttonComponent?: MockButtonComponent;
  dropdownComponent?: MockDropdownComponent;
  setName: (value: string) => MockSettingInstance;
  setDesc: (value: string) => MockSettingInstance;
  addText: (callback: (text: MockTextComponent) => unknown) => MockSettingInstance;
};

type MockPluginSettingTabInstance = {
  containerEl: {
    empty: jest.Mock;
    createEl: jest.Mock;
  };
};

const mockSettingInstances: MockSettingInstance[] = [];

jest.mock(
  'obsidian',
  () => {
    class PluginSettingTab {
      app: unknown;
      plugin: unknown;
      containerEl: {
        empty: jest.Mock;
        createEl: jest.Mock;
      };

      constructor(app: unknown, plugin: unknown) {
        this.app = app;
        this.plugin = plugin;
        this.containerEl = {
          empty: jest.fn(),
          createEl: jest.fn(),
        };
      }
    }

    class Setting {
      containerEl: unknown;
      name = '';
      desc = '';
      textComponent?: MockTextComponent;
      toggleComponent?: MockToggleComponent;
      buttonComponent?: MockButtonComponent;
      dropdownComponent?: MockDropdownComponent;

      constructor(containerEl: unknown) {
        this.containerEl = containerEl;
        mockSettingInstances.push(this as unknown as MockSettingInstance);
      }

      setName(value: string) {
        this.name = value;
        return this;
      }

      setDesc(value: string) {
        this.desc = value;
        return this;
      }

      addText(callback: (text: MockTextComponent) => unknown) {
        const text: MockTextComponent = {
          inputEl: { type: 'text' },
          placeholder: '',
          value: '',
          onChangeCallback: undefined,
          setPlaceholder(value: string) {
            this.placeholder = value;
            return this;
          },
          setValue(value: string) {
            this.value = value;
            return this;
          },
          onChange(callback: (value: string) => Promise<void> | void) {
            this.onChangeCallback = callback;
            return this;
          },
        };

        this.textComponent = text;
        callback(text);
        return this;
      }

      addToggle(callback: (toggle: MockToggleComponent) => unknown) {
        const toggle: MockToggleComponent = {
          value: false,
          setValue(value) {
            this.value = value;
            return this;
          },
          onChange(callback) {
            this.onChangeCallback = callback;
            return this;
          },
        };
        this.toggleComponent = toggle;
        callback(toggle);
        return this;
      }

      addButton(callback: (button: MockButtonComponent) => unknown) {
        const button: MockButtonComponent = {
          text: '', disabled: false,
          setButtonText(text) { this.text = text; return this; },
          setDisabled(disabled) { this.disabled = disabled; return this; },
          onClick(callback) { this.onClickCallback = callback; return this; },
        };
        this.buttonComponent = button;
        callback(button);
        return this;
      }

      addDropdown(callback: (dropdown: MockDropdownComponent) => unknown) {
        const dropdown: MockDropdownComponent = {
          value: '', disabled: false, options: {},
          selectEl: { replaceChildren: () => { dropdown.options = {}; } },
          addOption(value, label) { this.options[value] = label; return this; },
          setValue(value) { this.value = value; return this; },
          setDisabled(disabled) { this.disabled = disabled; return this; },
          onChange(callback) { this.onChangeCallback = callback; return this; },
        };
        this.dropdownComponent = dropdown;
        callback(dropdown);
        return this;
      }
    }

    class App {}

    return {
      App,
      PluginSettingTab,
      Setting,
    };
  },
  { virtual: true },
);

import { WeekCalendartSettingTab } from './week-calendar-settings-tab';
import { discoverCalendars } from '../caldav/discover-calendars';
import { BehaviorSubject } from 'rxjs';
import { SyncStatus } from '../sync/sync-status';

jest.mock('../caldav/discover-calendars', () => ({ discoverCalendars: jest.fn() }));

describe('WeekCalendartSettingTab', () => {
  const createPlugin = () => ({
    settings: {
      paths: {
        weekFolder: 'wochen',
        eventFolder: 'events',
      },
      weekdays: {
        start: 'Start',
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag',
        links: 'Links',
      },
      prefixes: {
        termin: 'Termin',
        zeit: 'Zeit',
        ort: 'Ort',
        erinnerung: 'Erinnerung',
        bemerkung: 'Bemerkung',
      },
      caldav: {
        url: 'https://example.com/caldav',
        username: 'charley',
        password: 'secret',
        calendar: 'https://example.com/calendars/obsidian/',
        managedCalendarConfirmed: false,
        timezone: 'Europe/Zurich',
        autoSync: false,
      },
    },
    saveSettings: jest.fn().mockResolvedValue(undefined),
    syncStatus$: new BehaviorSubject<SyncStatus>('off'),
  });

  const getSettingInstances = (): MockSettingInstance[] => mockSettingInstances;

  beforeEach(() => {
    mockSettingInstances.length = 0;
    jest.clearAllMocks();
  });

  it('renders all section headings', () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);
    const typedTab = tab as unknown as MockPluginSettingTabInstance;

    tab.display();

    expect(typedTab.containerEl.empty).toHaveBeenCalledTimes(1);
    expect(typedTab.containerEl.createEl).toHaveBeenNthCalledWith(1, 'h2', { text: 'Folders' });
    expect(typedTab.containerEl.createEl).toHaveBeenNthCalledWith(2, 'h2', {
      text: 'Week File Titles',
    });
    expect(typedTab.containerEl.createEl).toHaveBeenNthCalledWith(3, 'h2', {
      text: 'Event Fields',
    });
    expect(typedTab.containerEl.createEl).toHaveBeenNthCalledWith(4, 'h2', { text: 'CalDAV' });
  });

  it('creates all expected settings', () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const names = getSettingInstances().map((setting) => setting.name);

    expect(names).toEqual([
      'Week Folder',
      'Event Folder',
      'Overview File Name',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      'links',
      'termin',
      'zeit',
      'ort',
      'erinnerung',
      'bemerkung',
      'CalDAV-Verbindung',
      'URL',
      'Benutzername',
      'Passwort',
      'Zeitzone',
      'Zielkalender',
      'Exklusiven Zielkalender freigeben',
      'Automatisch synchronisieren',
      'Automatik-Status',
    ]);
  });

  it('does not render the start weekday as a setting', () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const names = getSettingInstances().map((setting) => setting.name);

    expect(names).not.toContain('start');
  });

  it('initializes path fields with current values and placeholders', () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const settings = getSettingInstances();

    expect(settings[0].textComponent?.placeholder).toBe('wochen');
    expect(settings[0].textComponent?.value).toBe('wochen');
    expect(settings[1].textComponent?.placeholder).toBe('events');
    expect(settings[1].textComponent?.value).toBe('events');
  });

  it('updates week folder and saves settings on change', async () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const weekFolderSetting = getSettingInstances().find(
      (setting) => setting.name === 'Week Folder',
    );

    await weekFolderSetting?.textComponent?.onChangeCallback?.('my-weeks');

    expect(plugin.settings.paths.weekFolder).toBe('my-weeks');
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('updates event folder and saves settings on change', async () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const eventFolderSetting = getSettingInstances().find(
      (setting) => setting.name === 'Event Folder',
    );

    await eventFolderSetting?.textComponent?.onChangeCallback?.('my-events');

    expect(plugin.settings.paths.eventFolder).toBe('my-events');
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('updates a weekday and saves settings on change', async () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const mondaySetting = getSettingInstances().find((setting) => setting.name === 'monday');

    await mondaySetting?.textComponent?.onChangeCallback?.('Mon');

    expect(plugin.settings.weekdays.monday).toBe('Mon');
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('updates a prefix and saves settings on change', async () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const terminSetting = getSettingInstances().find((setting) => setting.name === 'termin');

    await terminSetting?.textComponent?.onChangeCallback?.('Appointment');

    expect(plugin.settings.prefixes.termin).toBe('Appointment');
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('updates caldav url and saves settings on change', async () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const urlSetting = getSettingInstances().find((setting) => setting.name === 'URL');

    await urlSetting?.textComponent?.onChangeCallback?.('https://new.example.com/caldav');

    expect(plugin.settings.caldav.url).toBe('https://new.example.com/caldav');
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('updates caldav username and saves settings on change', async () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const usernameSetting = getSettingInstances().find(
      (setting) => setting.name === 'Benutzername',
    );

    await usernameSetting?.textComponent?.onChangeCallback?.('new-user');

    expect(plugin.settings.caldav.username).toBe('new-user');
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('updates caldav password and saves settings on change', async () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);

    tab.display();

    const passwordSetting = getSettingInstances().find((setting) => setting.name === 'Passwort');

    await passwordSetting?.textComponent?.onChangeCallback?.('new-password');

    expect(plugin.settings.caldav.password).toBe('new-password');
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('masks the password input', () => {
    const plugin = createPlugin();
    new WeekCalendartSettingTab({} as never, plugin as never).display();
    const password = getSettingInstances().find((setting) => setting.name === 'Passwort');
    expect(password?.textComponent?.inputEl.type).toBe('password');
    expect(password?.desc).toContain('unverschlüsselt');
  });

  it('defaults automatic sync to off and persists explicit opt-in without contacting the server', async () => {
    const plugin = createPlugin();
    new WeekCalendartSettingTab({} as never, plugin as never).display();
    const setting = getSettingInstances().find((setting) => setting.name === 'Automatisch synchronisieren')!;
    expect(setting.toggleComponent!.value).toBe(false);
    expect(setting.desc).toContain('fünf Sekunden');
    await setting.toggleComponent!.onChangeCallback!(true);
    expect(plugin.settings.caldav.autoSync).toBe(true);
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
    expect(discoverCalendars).not.toHaveBeenCalled();
  });

  it('updates the status text while visible and stops updates when hidden', () => {
    const plugin = createPlugin();
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);
    tab.display();
    const setting = getSettingInstances().find((setting) => setting.name === 'Automatik-Status')!;
    expect(setting.desc).toContain('Automatik aus');
    plugin.syncStatus$.next('pending');
    expect(setting.desc).toContain('Ausstehend');
    tab.hide();
    plugin.syncStatus$.next('synced');
    expect(setting.desc).toContain('Ausstehend');
  });

  it('saves an explicit calendar timezone without changing calendar consent', async () => {
    const plugin = createPlugin();
    plugin.settings.caldav.managedCalendarConfirmed = true;
    new WeekCalendartSettingTab({} as never, plugin as never).display();
    await getSettingInstances().find((setting) => setting.name === 'Zeitzone')!
      .textComponent!.onChangeCallback!(' UTC ');
    expect(plugin.settings.caldav.timezone).toBe('UTC');
    expect(plugin.settings.caldav.managedCalendarConfirmed).toBe(true);
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('requires explicit consent and persists it', async () => {
    const plugin = createPlugin();
    new WeekCalendartSettingTab({} as never, plugin as never).display();
    const confirmation = getSettingInstances().find(
      (setting) => setting.name === 'Exklusiven Zielkalender freigeben',
    );
    expect(confirmation?.toggleComponent?.value).toBe(false);
    await confirmation?.toggleComponent?.onChangeCallback?.(true);
    expect(plugin.settings.caldav.managedCalendarConfirmed).toBe(true);
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it.each(['URL', 'Benutzername', 'Passwort'])(
    'revokes consent when %s changes',
    async (name) => {
      const plugin = createPlugin();
      plugin.settings.caldav.managedCalendarConfirmed = true;
      new WeekCalendartSettingTab({} as never, plugin as never).display();
      const confirmation = getSettingInstances().find(
        (setting) => setting.name === 'Exklusiven Zielkalender freigeben',
      );
      expect(confirmation?.toggleComponent?.value).toBe(true);
      await getSettingInstances().find((setting) => setting.name === name)
        ?.textComponent?.onChangeCallback?.('new-value');
      expect(plugin.settings.caldav.managedCalendarConfirmed).toBe(false);
      expect(confirmation?.toggleComponent?.value).toBe(false);
      expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
    },
  );

  it('loads calendars only on demand and requires an explicit selection', async () => {
    const plugin = createPlugin();
    (discoverCalendars as jest.Mock).mockResolvedValue([{ url: 'https://example.com/new/', name: 'Planung' }]);
    new WeekCalendartSettingTab({} as never, plugin as never).display();
    const connection = getSettingInstances().find((setting) => setting.name === 'CalDAV-Verbindung')!;
    const dropdown = getSettingInstances().find((setting) => setting.name === 'Zielkalender')!.dropdownComponent!;
    expect(discoverCalendars).not.toHaveBeenCalled();
    expect(dropdown.disabled).toBe(true);
    await connection.buttonComponent!.onClickCallback!();
    expect(dropdown.disabled).toBe(false);
    expect(dropdown.value).toBe('');
    expect(plugin.settings.caldav.calendar).toBe('https://example.com/calendars/obsidian/');
    expect(plugin.saveSettings).not.toHaveBeenCalled();
    plugin.settings.caldav.managedCalendarConfirmed = true;
    await dropdown.onChangeCallback!('https://example.com/new/');
    expect(plugin.settings.caldav.calendar).toBe('https://example.com/new/');
    expect(plugin.settings.caldav.managedCalendarConfirmed).toBe(false);
    expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('does not accept a calendar URL absent from the server list', async () => {
    const plugin = createPlugin();
    new WeekCalendartSettingTab({} as never, plugin as never).display();
    const dropdown = getSettingInstances().find((setting) => setting.name === 'Zielkalender')!.dropdownComponent!;
    await dropdown.onChangeCallback!('https://unlisted.example.com/');
    expect(plugin.settings.caldav.calendar).toBe('https://example.com/calendars/obsidian/');
    expect(plugin.saveSettings).not.toHaveBeenCalled();
  });

  it('shows an error and permits retry when connection fails', async () => {
    const plugin = createPlugin();
    (discoverCalendars as jest.Mock).mockRejectedValue(new Error('CalDAV-Anmeldung fehlgeschlagen.'));
    new WeekCalendartSettingTab({} as never, plugin as never).display();
    const connection = getSettingInstances().find((setting) => setting.name === 'CalDAV-Verbindung')!;
    await connection.buttonComponent!.onClickCallback!();
    expect(connection.desc).toContain('Anmeldung fehlgeschlagen');
    expect(connection.buttonComponent!.disabled).toBe(false);
    expect(plugin.saveSettings).not.toHaveBeenCalled();
  });

  it('ignores outdated results after credentials change and prevents concurrent clicks', async () => {
    const plugin = createPlugin();
    let resolve!: (value: unknown) => void;
    (discoverCalendars as jest.Mock).mockReturnValue(new Promise((done) => { resolve = done; }));
    new WeekCalendartSettingTab({} as never, plugin as never).display();
    const connection = getSettingInstances().find((setting) => setting.name === 'CalDAV-Verbindung')!;
    const dropdown = getSettingInstances().find((setting) => setting.name === 'Zielkalender')!.dropdownComponent!;
    const pending = connection.buttonComponent!.onClickCallback!();
    await connection.buttonComponent!.onClickCallback!();
    expect(discoverCalendars).toHaveBeenCalledTimes(1);
    await getSettingInstances().find((setting) => setting.name === 'URL')!.textComponent!.onChangeCallback!('https://new.example.com/');
    resolve([{ url: 'https://old.example.com/', name: 'Alt' }]);
    await pending;
    expect(dropdown.disabled).toBe(true);
    expect(dropdown.options).not.toHaveProperty('https://old.example.com/');
    expect(connection.desc).toContain('erneut prüfen');
  });

  it('ignores results when the settings view has been closed', async () => {
    const plugin = createPlugin();
    let resolve!: (value: unknown) => void;
    (discoverCalendars as jest.Mock).mockReturnValue(new Promise((done) => { resolve = done; }));
    const tab = new WeekCalendartSettingTab({} as never, plugin as never);
    tab.display();
    const connection = getSettingInstances().find((setting) => setting.name === 'CalDAV-Verbindung')!;
    const pending = connection.buttonComponent!.onClickCallback!();
    tab.hide();
    resolve([{ url: 'https://example.com/new/', name: 'Neu' }]);
    await pending;
    expect(connection.desc).toBe('Verbindung wird geprüft …');
    expect(plugin.saveSettings).not.toHaveBeenCalled();
  });
});
