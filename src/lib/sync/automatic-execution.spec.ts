import type { App, TFile } from 'obsidian';
import { Notice } from 'obsidian';
import { createCalendarSync } from '../commands/sync-calendar';
import { mergeSettings } from '../settings/load-settings';
import { parseWeekEvents } from './parse-week-events';
import { readCalendar } from '../caldav/read-calendar';
import { openCalendarWriter } from '../caldav/calendar-writer';
import { serializeEvent } from '../caldav/serialize-event';
import { parseCalendarObject } from '../caldav/parse-calendar-object';
import { CaldavHttpError } from '../caldav/transport';
import { CalendarEvent } from './types';
import { RemoteEvent } from './compare-events';
import { ConfirmCalendarSyncModal } from '../ui/confirm-calendar-sync';
import { SyncPreviewModal } from '../ui/sync-preview';

jest.mock('obsidian', () => ({ Notice: jest.fn(), requestUrl: jest.fn() }));
jest.mock('../caldav/read-calendar', () => ({ readCalendar: jest.fn() }));
jest.mock('../caldav/calendar-writer', () => ({ openCalendarWriter: jest.fn() }));
jest.mock('../ui/confirm-calendar-sync', () => ({ ConfirmCalendarSyncModal: jest.fn() }));
jest.mock('../ui/sync-preview', () => ({ SyncPreviewModal: jest.fn() }));

const path = 'week-calendar/2026/weeks/W48 23.11.26.md';
const content = '# Montag (23)\n- Termin: Erster\n  ^woev-a\n- Termin: Zweiter\n  ^woev-b';

describe('automatic entry point with the real guarded execution pipeline', () => {
  let settings: ReturnType<typeof mergeSettings>;
  let server: RemoteEvent[];
  let local: CalendarEvent[];
  let operations: string[];
  const status = jest.fn();
  const writer = { create: jest.fn(), update: jest.fn(), delete: jest.fn() };
  const vault = {
    getMarkdownFiles: () => [{ path } as TFile], read: async () => content,
    on: jest.fn(() => ({})), offref: jest.fn(),
  };
  const app = { vault } as unknown as App;
  const toRemote = (event: CalendarEvent) => parseCalendarObject(serializeEvent(event, 'Europe/Zurich'),
    `https://example.com/calendar/${event.localId}`, '"v1"', 'Europe/Zurich');

  beforeEach(() => {
    jest.clearAllMocks();
    settings = mergeSettings({ caldav: {
      autoSync: true, url: 'https://example.com/', username: 'user', password: 'secret',
      calendar: 'https://example.com/calendar/', managedCalendarConfirmed: true,
    } });
    local = parseWeekEvents(content, path, settings).events;
    server = [toRemote(local[0]), {
      uid: 'foreign', title: 'Fremd', url: 'https://example.com/calendar/foreign', etag: '"v1"', comparable: null,
    }];
    operations = [];
    (readCalendar as jest.Mock).mockImplementation(async () => JSON.parse(JSON.stringify(server)));
    (openCalendarWriter as jest.Mock).mockResolvedValue(writer);
    writer.create.mockImplementation(async (event: CalendarEvent, data: string) => {
      operations.push('create');
      server.push(parseCalendarObject(data, `https://example.com/calendar/${event.localId}`, '"v2"', 'Europe/Zurich'));
    });
    writer.update.mockImplementation(async (remote: RemoteEvent, data: string) => {
      operations.push('update');
      const index = server.findIndex((item) => item.url === remote.url && item.etag === remote.etag);
      if (index < 0) throw new CaldavHttpError(412);
      server[index] = parseCalendarObject(data, remote.url, '"v2"', 'Europe/Zurich');
    });
    writer.delete.mockImplementation(async (remote: RemoteEvent) => {
      operations.push('delete');
      const index = server.findIndex((item) => item.url === remote.url && item.etag === remote.etag);
      if (index < 0) throw new CaldavHttpError(412);
      server.splice(index, 1);
    });
  });

  it('creates before ordinary deletions and verifies the final calendar without any confirmation UI', async () => {
    const result = await createCalendarSync(app, settings, status).runAutomatic();
    expect(result).toMatchObject({ status: 'synced', result: { ok: true, created: 1, deleted: 1, unchanged: 1 } });
    expect(operations).toEqual(['create', 'delete']);
    expect(server.map((event) => event.uid).sort()).toEqual(local.map((event) => event.uid).sort());
    expect(status).toHaveBeenLastCalledWith('synced');
    expect(ConfirmCalendarSyncModal).not.toHaveBeenCalled();
    expect(SyncPreviewModal).not.toHaveBeenCalled();
    expect(Notice).not.toHaveBeenCalled();
  });

  it('blocks a full replacement before opening the writer, including all proposed creations', async () => {
    server = server.filter((event) => event.uid === 'foreign');
    expect(await createCalendarSync(app, settings, status).runAutomatic()).toEqual({ status: 'confirmation-required' });
    expect(operations).toEqual([]);
    expect(openCalendarWriter).not.toHaveBeenCalled();
    expect(status).toHaveBeenLastCalledWith('confirmation-required');
  });

  it('keeps conflict protection and resumes only on a later explicit invocation without duplicate creations', async () => {
    server[0] = toRemote({ ...local[0], title: 'Alt' });
    writer.update.mockRejectedValueOnce(new CaldavHttpError(412));
    const sync = createCalendarSync(app, settings, status);
    expect(await sync.runAutomatic()).toMatchObject({ status: 'error', result: { ok: false, created: 1, updated: 0, deleted: 0 } });
    expect(writer.update).toHaveBeenCalledTimes(1);
    expect(writer.delete).not.toHaveBeenCalled();
    expect(await sync.runAutomatic()).toMatchObject({ status: 'synced', result: { ok: true, created: 0, updated: 1, deleted: 1 } });
    expect(writer.create).toHaveBeenCalledTimes(1);
    expect(new Set(server.map((event) => event.uid)).size).toBe(2);
  });

  it('stops before the first write when automatic mode is disabled during execution preparation', async () => {
    (openCalendarWriter as jest.Mock).mockImplementationOnce(async () => {
      settings.caldav.autoSync = false;
      return writer;
    });
    expect(await createCalendarSync(app, settings, status).runAutomatic()).toMatchObject({ status: 'off', result: { ok: false, created: 0, deleted: 0 } });
    expect(operations).toEqual([]);
    expect(status).toHaveBeenLastCalledWith('off');
    expect(vault.offref).toHaveBeenCalledTimes(4);
  });

  it('stops subsequent operations when the same cancellation used by plugin unload is invoked', async () => {
    const sync = createCalendarSync(app, settings, status);
    (openCalendarWriter as jest.Mock).mockImplementationOnce(async () => {
      sync.cancel();
      return writer;
    });
    expect(await sync.runAutomatic()).toMatchObject({ status: 'cancelled', result: { ok: false } });
    expect(operations).toEqual([]);
    expect(status).toHaveBeenCalledTimes(1);
    expect(vault.offref).toHaveBeenCalledTimes(4);
  });

  it('reports unchanged data as synchronized only after guarded revalidation, without opening the writer', async () => {
    server = local.map(toRemote);
    expect(await createCalendarSync(app, settings, status).runAutomatic()).toMatchObject({
      status: 'synced', result: { ok: true, created: 0, updated: 0, deleted: 0, unchanged: 2 },
    });
    expect(openCalendarWriter).not.toHaveBeenCalled();
    expect(operations).toEqual([]);
    expect(vault.offref).toHaveBeenCalledTimes(4);
  });
});
