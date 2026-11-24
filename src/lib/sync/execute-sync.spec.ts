import type { TFile } from 'obsidian';
import { executeSync } from './execute-sync';
import { preparePreview, PreparedPreview } from './prepare-preview';
import { mergeSettings } from '../settings/load-settings';
import { readCalendar } from '../caldav/read-calendar';
import { openCalendarWriter } from '../caldav/calendar-writer';
import { parseCalendarObject } from '../caldav/parse-calendar-object';
import { serializeEvent } from '../caldav/serialize-event';
import { CaldavHttpError } from '../caldav/transport';
import { RemoteEvent } from './compare-events';
import { CalendarEvent } from './types';

jest.mock('../caldav/read-calendar', () => ({ readCalendar: jest.fn() }));
jest.mock('../caldav/calendar-writer', () => ({ openCalendarWriter: jest.fn() }));
jest.mock('obsidian', () => ({ requestUrl: jest.fn() }));

const path = 'week-calendar/2026/weeks/W48 23.11.26.md';
const content = '# Montag (23)\n- Termin: Neu\n  ^woev-a\n- Termin: Geändert\n  ^woev-b\n- Termin: Gleich\n  ^woev-c';

describe('executeSync safety and retry behavior', () => {
  let settings: ReturnType<typeof mergeSettings>;
  let notes: Record<string, string>;
  let server: RemoteEvent[];
  let approved: PreparedPreview;
  let revision: number;
  let calls: string[];
  const listeners = new Map<string, (file: { path: string }, oldPath?: string) => void>();
  const read = jest.fn(async (file: TFile) => notes[file.path]);
  const offref = jest.fn((ref: { event: string }) => { listeners.delete(ref.event); });
  const vault = {
    getMarkdownFiles: () => Object.keys(notes).map((path) => ({ path }) as TFile), read,
    on: (event: string, callback: (file: { path: string }, oldPath?: string) => void) => {
      listeners.set(event, callback);
      return { event };
    }, offref,
  } as unknown as Parameters<typeof executeSync>[0];
  const writer = { create: jest.fn(), update: jest.fn(), delete: jest.fn() };
  const freshApproval = async () => {
    const preview = await preparePreview(vault, settings);
    if (!preview.ok) throw new Error('Expected valid fixture preview');
    return preview;
  };
  const run = (fullDeletion = false, active: () => boolean = () => true) =>
    executeSync(vault, settings, approved, JSON.stringify(settings), fullDeletion, active);

  beforeEach(async () => {
    jest.clearAllMocks();
    listeners.clear();
    revision = 0;
    calls = [];
    settings = mergeSettings({ caldav: { calendar: 'https://example.com/calendar/', managedCalendarConfirmed: true } });
    notes = { [path]: content };
    server = [];
    read.mockImplementation(async (file: TFile) => notes[file.path]);
    (readCalendar as jest.Mock).mockImplementation(async () => JSON.parse(JSON.stringify(server)));
    (openCalendarWriter as jest.Mock).mockResolvedValue(writer);
    writer.create.mockImplementation(async (event: CalendarEvent, data: string) => {
      calls.push('create');
      server.push(parseCalendarObject(data, `https://example.com/calendar/woev-${event.localId}-${event.date}.ics`, `"new${++revision}"`, 'Europe/Zurich'));
    });
    writer.update.mockImplementation(async (remote: RemoteEvent, data: string) => {
      calls.push('update');
      const index = server.findIndex((item) => item.url === remote.url && item.etag === remote.etag);
      if (index < 0) throw new CaldavHttpError(412);
      server[index] = parseCalendarObject(data, remote.url, `"new${++revision}"`, 'Europe/Zurich');
    });
    writer.delete.mockImplementation(async (remote: RemoteEvent) => {
      calls.push('delete');
      const index = server.findIndex((item) => item.url === remote.url && item.etag === remote.etag);
      if (index < 0) throw new CaldavHttpError(412);
      server.splice(index, 1);
    });
    const initial = await freshApproval();
    server = initial.local.slice(1).map((event) => parseCalendarObject(
      serializeEvent(event.localId === 'b' ? { ...event, title: 'Alt' } : event, 'Europe/Zurich'),
      `https://example.com/calendar/${event.localId}`, '"old"', 'Europe/Zurich',
    ));
    server.push({ uid: 'foreign', title: 'Fremd', url: 'https://example.com/calendar/foreign', etag: '"old"', comparable: null });
    approved = await freshApproval();
  });

  it('writes new and changed events before deletion, verifies the result and cleans up observers', async () => {
    const result = await run();
    expect(result).toMatchObject({ ok: true, created: 1, updated: 1, deleted: 1, unchanged: 1 });
    expect(calls).toEqual(['create', 'update', 'delete']);
    expect((await freshApproval()).plan).toMatchObject({ create: [], update: [], delete: [], unchanged: 3 });
    expect(offref).toHaveBeenCalledTimes(4);
    expect(listeners.size).toBe(0);
  });

  it('does not write again on a second completed sync', async () => {
    expect((await run()).ok).toBe(true);
    approved = await freshApproval();
    calls = [];
    const result = await run();
    expect(result).toMatchObject({ ok: true, created: 0, updated: 0, deleted: 0 });
    expect(calls).toEqual([]);
  });

  it('rechecks source contents before reporting an unchanged calendar as synchronized', async () => {
    expect((await run()).ok).toBe(true);
    approved = await freshApproval();
    calls = [];
    (readCalendar as jest.Mock).mockImplementationOnce(async () => {
      notes[path] += '\nExtern geändert, noch ohne Vault-Event';
      return JSON.parse(JSON.stringify(server));
    });
    expect((await run()).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it('rejects changed local note contents even if appointments are semantically unchanged', async () => {
    notes[path] += '\nEigene Notiz';
    expect((await run()).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it('rejects a changed server snapshot before the first write', async () => {
    server[0].etag = '"changed"';
    expect((await run()).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it('does not write if settings changed since confirmation', async () => {
    const snapshot = JSON.stringify(settings);
    settings.caldav.calendar = 'https://example.com/other/';
    const result = await executeSync(vault, settings, approved, snapshot, false);
    expect(result.ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it('requires additional consent to clear the entire calendar', async () => {
    notes[path] = '# Montag (23)';
    approved = await freshApproval();
    expect((await run()).ok).toBe(false);
    expect(calls).toEqual([]);
    expect(await run(true)).toMatchObject({ ok: true, deleted: 3 });
    expect(server).toEqual([]);
  });

  it('rejects weak ETags before any creations or changes', async () => {
    server.find((event) => event.uid === 'foreign')!.etag = 'W/"old"';
    approved = await freshApproval();
    expect((await run()).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it('never deletes after an update conflict', async () => {
    writer.update.mockRejectedValueOnce(new CaldavHttpError(412));
    const result = await run();
    expect(result).toMatchObject({ ok: false, created: 1, updated: 0, deleted: 0 });
    expect(result.message).toContain('Serverkonflikt');
    expect(writer.delete).not.toHaveBeenCalled();
  });

  it('handles a lost create response without duplicates on retry', async () => {
    const create = writer.create.getMockImplementation()!;
    writer.create.mockImplementationOnce(async (...args) => {
      await create(...args);
      throw new Error('sensitive native error');
    });
    const first = await run();
    expect(first.ok).toBe(false);
    expect(first.message).not.toContain('sensitive');
    expect(writer.delete).not.toHaveBeenCalled();
    approved = await freshApproval();
    expect((await run()).ok).toBe(true);
    expect(writer.create).toHaveBeenCalledTimes(1);
    expect(new Set(server.map((event) => event.uid)).size).toBe(3);
  });

  it.each(['modify', 'create', 'delete', 'rename'])('stops further writes after a local %s event', async (type) => {
    const create = writer.create.getMockImplementation()!;
    writer.create.mockImplementationOnce(async (...args) => {
      await create(...args);
      listeners.get(type)!({ path }, type === 'rename' ? path : undefined);
    });
    expect(await run()).toMatchObject({ ok: false, created: 1, deleted: 0 });
    expect(writer.update).not.toHaveBeenCalled();
    expect(writer.delete).not.toHaveBeenCalled();
  });

  it('stops writes if the plugin is unloaded during a request', async () => {
    let active = true;
    const create = writer.create.getMockImplementation()!;
    writer.create.mockImplementationOnce(async (...args) => { await create(...args); active = false; });
    expect(await run(false, () => active)).toMatchObject({ ok: false, created: 1, deleted: 0 });
    expect(writer.update).not.toHaveBeenCalled();
    expect(listeners.size).toBe(0);
  });

  it('stops before deletion if another resource appears during upload', async () => {
    const update = writer.update.getMockImplementation()!;
    writer.update.mockImplementationOnce(async (...args) => {
      await update(...args);
      server.push({ uid: 'unexpected', title: 'Neu vom Server', url: 'https://example.com/calendar/unexpected', etag: '"v1"', comparable: null });
    });
    expect(await run()).toMatchObject({ ok: false, created: 1, updated: 1, deleted: 0 });
    expect(writer.delete).not.toHaveBeenCalled();
  });

  it('rereads notes before deletion even when an external change has not emitted an event', async () => {
    const update = writer.update.getMockImplementation()!;
    writer.update.mockImplementationOnce(async (...args) => {
      await update(...args);
      notes[path] += '\n- Termin: Neu ohne ID';
    });
    expect(await run()).toMatchObject({ ok: false, created: 1, updated: 1, deleted: 0 });
    expect(writer.delete).not.toHaveBeenCalled();
  });

  it('reports partial deletions honestly and can safely resume from a new preview', async () => {
    server.push({ uid: 'secondForeign', title: 'Weiterer Fremder', url: 'https://example.com/calendar/foreign2', etag: '"old"', comparable: null });
    approved = await freshApproval();
    const remove = writer.delete.getMockImplementation()!;
    writer.delete.mockImplementationOnce(remove).mockRejectedValueOnce(new CaldavHttpError(412));
    expect(await run()).toMatchObject({ ok: false, created: 1, updated: 1, deleted: 1 });
    expect(server.some((event) => event.uid === 'foreign')).toBe(false);
    expect(server.some((event) => event.uid === 'secondForeign')).toBe(true);
    approved = await freshApproval();
    expect(await run()).toMatchObject({ ok: true, created: 0, updated: 0, deleted: 1 });
  });

  it('stops at a deletion conflict and reports only confirmed deletions', async () => {
    writer.delete.mockRejectedValueOnce(new CaldavHttpError(412));
    expect(await run()).toMatchObject({ ok: false, created: 1, updated: 1, deleted: 0 });
    expect(writer.delete).toHaveBeenCalledTimes(1);
  });
});
