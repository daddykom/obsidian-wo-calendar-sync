import { WeekcalendarSettings } from '../types';

export type SyncStatus =
  | 'off'
  | 'setup-required'
  | 'not-checked'
  | 'pending'
  | 'running'
  | 'synced'
  | 'error'
  | 'confirmation-required';

export const SYNC_STATUS_PRESENTATION = {
  off: {
    label: 'Automatik aus', icon: 'calendar',
    description: 'Der automatische Kalender-Sync ist ausgeschaltet. Der manuelle Sync bleibt verfügbar.',
  },
  'setup-required': {
    label: 'Einrichtung erforderlich', icon: 'settings',
    description: 'Bitte CalDAV-Zugang, Zielkalender und die Freigabe des exklusiven Kalenders in den Einstellungen prüfen.',
  },
  'not-checked': {
    label: 'Noch nicht geprüft', icon: 'help-circle',
    description: 'In dieser Sitzung wurde noch kein Kalenderabgleich bestätigt.',
  },
  pending: {
    label: 'Ausstehend', icon: 'clock',
    description: 'Lokale Kalenderänderungen warten auf einen Abgleich.',
  },
  running: {
    label: 'Synchronisierung läuft', icon: 'refresh-cw',
    description: 'Der Kalenderabgleich wird gerade ausgeführt.',
  },
  synced: {
    label: 'Synchronisiert', icon: 'check-circle',
    description: 'Der zuletzt geprüfte lokale Terminbestand stimmt mit dem Zielkalender überein.',
  },
  error: {
    label: 'Fehler', icon: 'alert-circle',
    description: 'Der letzte Kalenderabgleich konnte nicht abgeschlossen werden. Bitte die manuelle Kalender-Vorschau prüfen.',
  },
  'confirmation-required': {
    label: 'Bestätigung nötig', icon: 'shield-alert',
    description: 'Das vollständige Leeren oder Ersetzen des Kalenders muss über „Kalender synchronisieren“ manuell bestätigt werden.',
  },
} as const satisfies Record<SyncStatus, { label: string; icon: string; description: string }>;

export function getInitialSyncStatus(settings: WeekcalendarSettings['caldav']): SyncStatus {
  if (settings.autoSync !== true) return 'off';
  if (!settings.url.trim() || !settings.username.trim() || !settings.password ||
      !settings.calendar || settings.managedCalendarConfirmed !== true) return 'setup-required';
  // A saved setting is not evidence of a successful sync in this session.
  return 'not-checked';
}
