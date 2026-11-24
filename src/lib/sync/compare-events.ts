import { CalendarEvent } from './types';
import { wallTimeToUtc } from './timezone';

export interface ComparableEvent {
  title: string;
  allDay: boolean;
  start: string;
  end: string;
  location: string;
  description: string;
  reminderMinutes: number[];
}

export interface RemoteEvent {
  url: string;
  etag: string;
  uid: string;
  title: string;
  comparable: ComparableEvent | null;
}

export interface SyncPlan {
  create: CalendarEvent[];
  update: { local: CalendarEvent; remote: RemoteEvent; fields: string[] }[];
  delete: RemoteEvent[];
  unchanged: number;
}

export function comparableLocalEvent(event: CalendarEvent, timezone: string): ComparableEvent {
  return {
    title: event.title, allDay: event.allDay,
    start: event.allDay ? event.start : wallTimeToUtc(event.start, timezone),
    end: event.allDay ? event.end : wallTimeToUtc(event.end, timezone),
    location: event.location, description: event.description,
    reminderMinutes: [...new Set(event.reminderMinutes)].sort((a, b) => a - b),
  };
}

const FIELD_LABELS: Record<keyof ComparableEvent, string> = {
  title: 'Titel', allDay: 'Ganztägig', start: 'Beginn', end: 'Ende',
  location: 'Ort', description: 'Beschreibung', reminderMinutes: 'Erinnerungen',
};

export function compareEvents(local: CalendarEvent[], remote: RemoteEvent[], timezone: string): SyncPlan {
  const plan: SyncPlan = { create: [], update: [], delete: [], unchanged: 0 };
  const desired = new Map(local.map((event) => [event.uid, event]));
  const existing = new Map(remote.map((event) => [event.uid, event]));
  if (desired.size !== local.length || existing.size !== remote.length) {
    throw new Error('Doppelte Termin-UIDs verhindern einen eindeutigen Kalenderabgleich.');
  }
  for (const event of local) {
    let comparable: ComparableEvent;
    try {
      comparable = comparableLocalEvent(event, timezone);
    } catch (error) {
      throw new Error(`${event.sourcePath}:${event.sourceLine}: ${error instanceof Error ? error.message : 'Ungültige Terminzeit.'}`);
    }
    if (!event.allDay && comparable.end <= comparable.start) {
      throw new Error(`${event.sourcePath}:${event.sourceLine}: Endzeit liegt nicht nach der Startzeit.`);
    }
    const previous = existing.get(event.uid);
    if (!previous) {
      plan.create.push(event);
      continue;
    }
    const fields = previous.comparable
      ? (Object.keys(FIELD_LABELS) as (keyof ComparableEvent)[])
        .filter((key) => JSON.stringify(comparable[key]) !== JSON.stringify(previous.comparable![key]))
        .map((key) => FIELD_LABELS[key])
      : ['Terminstruktur (z. B. Wiederholungsregel oder zusätzliche Teilnehmer)'];
    if (fields.length) plan.update.push({ local: event, remote: previous, fields });
    else plan.unchanged++;
  }
  plan.delete = remote.filter((event) => !desired.has(event.uid));
  return plan;
}
