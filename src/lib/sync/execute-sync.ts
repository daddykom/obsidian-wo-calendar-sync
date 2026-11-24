import type { App, TAbstractFile } from 'obsidian';
import { WeekcalendarSettings } from '../types';
import { PreparedPreview, preparePreview } from './prepare-preview';
import { collectEvents } from './collect-events';
import { compareEvents, RemoteEvent } from './compare-events';
import { readCalendar } from '../caldav/read-calendar';
import { openCalendarWriter } from '../caldav/calendar-writer';
import { serializeEvent } from '../caldav/serialize-event';
import { assertCalendarResource, assertStrongEtag, CaldavHttpError } from '../caldav/transport';

export interface SyncResult {
  ok: boolean;
  created: number;
  updated: number;
  deleted: number;
  unchanged: number;
  message: string;
}

class SyncSafetyError extends Error {}

function previewSignature(preview: PreparedPreview): string {
  const byUid = <T extends { uid: string }>(values: T[]) => [...values].sort((a, b) => a.uid.localeCompare(b.uid));
  return JSON.stringify({
    calendarUrl: preview.calendarUrl, timezone: preview.timezone,
    sources: preview.sources, local: byUid(preview.local), remote: byUid(preview.remote),
    create: byUid(preview.plan.create),
    update: [...preview.plan.update].sort((a, b) => a.local.uid.localeCompare(b.local.uid)),
    delete: byUid(preview.plan.delete), unchanged: preview.plan.unchanged,
  });
}

export function requiresFullDeletionConfirmation(preview: PreparedPreview): boolean {
  return preview.remoteCount > 0 && preview.plan.delete.length === preview.remoteCount;
}

function verifyUpserts(preview: PreparedPreview, current: RemoteEvent[]): void {
  const byUid = new Map(current.map((event) => [event.uid, event]));
  if (byUid.size !== current.length || current.length !== preview.remote.length + preview.plan.create.length) {
    throw new SyncSafetyError('Der Serverbestand wurde inzwischen verändert oder ist unvollständig. Es wird nicht weiter gelöscht.');
  }
  const updates = new Set(preview.plan.update.map(({ local }) => local.uid));
  for (const previous of preview.remote) {
    const now = byUid.get(previous.uid);
    if (!now || now.url !== previous.url || (!updates.has(previous.uid) && now.etag !== previous.etag)) {
      throw new SyncSafetyError('Ein Kalendereintrag wurde während des Syncs verändert. Es wird nicht weiter gelöscht.');
    }
  }
  const remaining = compareEvents(preview.local, current, preview.timezone);
  if (remaining.create.length || remaining.update.length ||
      remaining.delete.length !== preview.plan.delete.length ||
      remaining.delete.some((event) => !preview.plan.delete.some((approved) =>
        approved.uid === event.uid && approved.url === event.url && approved.etag === event.etag))) {
    throw new SyncSafetyError('Geschriebene Termine konnten nicht vollständig bestätigt werden. Es wird nicht weiter gelöscht.');
  }
}

export async function executeSync(
  vault: Pick<App['vault'], 'getMarkdownFiles' | 'read' | 'on' | 'offref'>,
  settings: WeekcalendarSettings,
  approved: PreparedPreview,
  settingsSnapshot: string,
  fullDeletionConfirmed: boolean,
  isActive: () => boolean = () => true,
): Promise<SyncResult> {
  const result: SyncResult = { ok: false, created: 0, updated: 0, deleted: 0, unchanged: approved.plan.unchanged, message: '' };
  let sourcesChanged = false;
  const root = settings.paths.weekFolder.replace(/\/$/, '');
  const markChanged = (file: TAbstractFile, oldPath?: string) => {
    if ([file.path, oldPath].some((path) => path !== undefined &&
      (path === root || path.startsWith(root + '/') || root.startsWith(path + '/')))) sourcesChanged = true;
  };
  const refs = [
    vault.on('modify', markChanged), vault.on('create', markChanged),
    vault.on('delete', markChanged), vault.on('rename', markChanged),
  ];
  const checkpoint = () => {
    if (!isActive()) throw new SyncSafetyError('Sync wurde abgebrochen.');
    if (JSON.stringify(settings) !== settingsSnapshot) throw new SyncSafetyError('Einstellungen wurden geändert. Bitte eine neue Vorschau erstellen.');
    if (sourcesChanged) throw new SyncSafetyError('Lokale Kalenderdateien wurden während des Syncs geändert. Bitte eine neue Vorschau erstellen.');
  };
  try {
    checkpoint();
    const snapshot: WeekcalendarSettings = JSON.parse(settingsSnapshot);
    const fresh = await preparePreview(vault, snapshot);
    checkpoint();
    if (!fresh.ok) throw new SyncSafetyError('Die erneute Prüfung ist fehlgeschlagen. Bitte die Vorschau erneut erstellen und die gemeldeten Fehler beheben.');
    if (previewSignature(fresh) !== previewSignature(approved)) {
      throw new SyncSafetyError('Lokale Dateien oder Serverdaten unterscheiden sich von der bestätigten Vorschau. Bitte eine neue Vorschau erstellen.');
    }
    if (requiresFullDeletionConfirmation(fresh) && !fullDeletionConfirmed) {
      throw new SyncSafetyError('Die zusätzliche Bestätigung zum Löschen aller bisherigen Einträge fehlt.');
    }
    const assertSourcesCurrent = async () => {
      const current = await collectEvents(vault, snapshot);
      checkpoint();
      if (!current.ok || JSON.stringify(current.sources) !== JSON.stringify(fresh.sources)) {
        throw new SyncSafetyError('Lokale Kalenderdateien stimmen nicht mehr mit der bestätigten Vorschau überein. Bitte eine neue Vorschau erstellen.');
      }
    };
    const { plan } = fresh;
    if (!plan.create.length && !plan.update.length && !plan.delete.length) {
      await assertSourcesCurrent();
      return { ...result, ok: true, message: 'Kalender ist bereits aktuell. Keine Änderungen nötig.' };
    }
    // Validate every payload and destructive precondition before the first write.
    for (const remote of [...plan.update.map(({ remote }) => remote), ...plan.delete]) {
      assertCalendarResource(remote.url, fresh.calendarUrl);
      assertStrongEtag(remote.etag);
    }
    const creates = plan.create.map((event) => ({ event, data: serializeEvent(event, fresh.timezone) }));
    const updates = plan.update.map(({ remote, local }) => ({ remote, data: serializeEvent(local, fresh.timezone) }));
    const writer = await openCalendarWriter(snapshot.caldav);
    await assertSourcesCurrent();
    for (const { event, data } of creates) {
      checkpoint();
      await writer.create(event, data);
      result.created++;
      checkpoint();
    }
    for (const { remote, data } of updates) {
      checkpoint();
      await writer.update(remote, data);
      result.updated++;
      checkpoint();
    }
    const afterUpserts = await readCalendar(snapshot.caldav);
    checkpoint();
    verifyUpserts(fresh, afterUpserts);
    if (plan.delete.length) await assertSourcesCurrent();
    for (const remote of plan.delete) {
      checkpoint();
      await writer.delete(remote);
      result.deleted++;
      checkpoint();
    }
    const finalRemote = plan.delete.length ? await readCalendar(snapshot.caldav) : afterUpserts;
    await assertSourcesCurrent();
    const finalPlan = compareEvents(fresh.local, finalRemote, fresh.timezone);
    if (finalPlan.create.length || finalPlan.update.length || finalPlan.delete.length) {
      throw new SyncSafetyError('Die Abschlussprüfung zeigt verbleibende Unterschiede. Bitte eine neue Vorschau erstellen.');
    }
    return { ...result, ok: true, message: 'Kalender erfolgreich synchronisiert und geprüft.' };
  } catch (error) {
    const detail = error instanceof SyncSafetyError ? error.message
      : error instanceof CaldavHttpError && [409, 412].includes(error.status)
        ? 'Serverkonflikt: Ein Eintrag wurde inzwischen geändert oder bereits angelegt. Bitte eine neue Vorschau erstellen.'
        : 'Serverzugriff oder Sicherheitsprüfung fehlgeschlagen. Zugangsdaten, Verbindung und ETags prüfen und eine neue Vorschau erstellen.';
    return { ...result, message: `${detail} Bereits bestätigte Änderungen bleiben bestehen; bei Netzwerkfehlern kann auch die letzte Anfrage bereits verarbeitet worden sein. Es werden keine weiteren Einträge gelöscht.` };
  } finally {
    for (const ref of refs) vault.offref(ref);
  }
}
