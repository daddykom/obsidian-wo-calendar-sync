export interface CalendarEvent {
  uid: string;
  localId: string;
  sourcePath: string;
  sourceLine: number;
  title: string;
  date: string;
  allDay: boolean;
  start: string;
  end: string;
  location: string;
  description: string;
  reminderMinutes: number[];
}

export interface CollectionError {
  path: string;
  line?: number;
  message: string;
}

export interface SourceSnapshot {
  path: string;
  content: string;
}

export type CollectionResult =
  | { ok: true; scannedFiles: number; events: CalendarEvent[]; sources: SourceSnapshot[] }
  | { ok: false; scannedFiles: number; errors: CollectionError[] };
