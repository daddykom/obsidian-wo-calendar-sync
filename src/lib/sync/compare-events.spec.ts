import { CalendarEvent } from './types';
import { comparableLocalEvent, compareEvents, RemoteEvent } from './compare-events';

const event: CalendarEvent = {
  uid: 'id-2026-11-23@week-calendart', localId: 'id', sourcePath: 'week.md', sourceLine: 2,
  title: 'Treffen', date: '2026-11-23', allDay: false,
  start: '2026-11-23T09:00:00', end: '2026-11-23T10:00:00',
  location: 'Büro', description: 'Notiz', reminderMinutes: [60],
};

const remote: RemoteEvent = {
  uid: event.uid, title: event.title, url: 'https://example.com/calendar/id', etag: '"v1"',
  comparable: comparableLocalEvent(event, 'Europe/Zurich'),
};

describe('compareEvents', () => {
  it('plans creations, changes, foreign deletions and unchanged entries', () => {
    const result = compareEvents([event, { ...event, uid: 'new' }, { ...event, uid: 'changed', title: 'Neu' }], [
      remote, { ...remote, uid: 'foreign' }, { ...remote, uid: 'changed' },
    ], 'Europe/Zurich');
    expect(result.create.map((item) => item.uid)).toEqual(['new']);
    expect(result.update[0].fields).toEqual(['Titel']);
    expect(result.delete.map((item) => item.uid)).toEqual(['foreign']);
    expect(result.unchanged).toBe(1);
  });

  it('ignores resource URLs, etags and local source paths when comparing content', () => {
    const result = compareEvents([{ ...event, sourcePath: 'moved.md', sourceLine: 10 }], [
      { ...remote, etag: '"v2"', url: 'https://example.com/calendar/renamed' },
    ], 'Europe/Zurich');
    expect(result.unchanged).toBe(1);
    expect(result.update).toEqual([]);
  });

  it('identifies changes in time, location, description and reminders', () => {
    const result = compareEvents([{
      ...event, start: '2026-11-23T09:30:00', location: 'Daheim', description: 'Neu', reminderMinutes: [],
    }], [remote], 'Europe/Zurich');
    expect(result.update[0].fields).toEqual(['Beginn', 'Ort', 'Beschreibung', 'Erinnerungen']);
  });

  it('plans replacement of an unsupported server recurrence or participant structure', () => {
    expect(compareEvents([event], [{ ...remote, comparable: null }], 'Europe/Zurich').update).toHaveLength(1);
  });

  it('plans complete deletion for an empty local collection, without performing it', () => {
    expect(compareEvents([], [remote], 'Europe/Zurich').delete).toEqual([remote]);
  });

  it('rejects duplicate local or remote UIDs', () => {
    expect(() => compareEvents([event, event], [], 'Europe/Zurich')).toThrow('Doppelte');
    expect(() => compareEvents([], [remote, remote], 'Europe/Zurich')).toThrow('Doppelte');
  });

  it('reports the local source location for invalid times', () => {
    expect(() => compareEvents([{
      ...event, start: '2026-03-29T02:30:00',
    }], [], 'Europe/Zurich')).toThrow('week.md:2');
  });
});
