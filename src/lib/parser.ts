import { WOEvent } from "./types";
import { getDateForWeekday, addMinutesToTime, parseYearFromPath } from "./dateUtils";
import { parseReminders } from "./reminderUtils";

const READONLY_MARKER = "[readonly]";

// Internal accumulator for the reduce-based line parser
interface ParseAccumulator {
  readonly currentWeekday: string | null;
  readonly currentEventLines: readonly string[];
  readonly events: readonly WOEvent[];
  readonly weekNumber: number;
  readonly year: number;
  readonly defaultDurationMinutes: number;
}

// Parses a full WO file content into a list of WOEvents
export const parseWOFile = (
  content: string,
  _filename: string,
  filePath: string,
  weekNumber: number,
  defaultDurationMinutes: number
): WOEvent[] => {
  const year = parseYearFromPath(filePath);

  const initialAcc: ParseAccumulator = {
    currentWeekday: null,
    currentEventLines: [],
    events: [],
    weekNumber,
    year,
    defaultDurationMinutes,
  };

  const finalAcc = content
    .split("\n")
    .map((line) => line.trim())
    .reduce((acc, trimmed) => processLine(acc, trimmed), initialAcc);

  // Flush last pending event block after all lines are processed
  return [...finalAcc.events, ...flushPendingEvent(finalAcc)];
};

// Processes a single trimmed line and returns the next accumulator state
const processLine = (
  acc: ParseAccumulator,
  trimmed: string
): ParseAccumulator => {
  const headingMatch = trimmed.match(/^#\s+(\w+)$/);

  if (headingMatch) {
    // New weekday heading – flush current event and update weekday
    return {
      ...acc,
      currentWeekday: headingMatch[1],
      currentEventLines: [],
      events: [...acc.events, ...flushPendingEvent(acc)],
    };
  }

  if (trimmed.startsWith("Termin:")) {
    // New event block – flush current and start fresh
    return {
      ...acc,
      currentEventLines: [trimmed],
      events: [...acc.events, ...flushPendingEvent(acc)],
    };
  }

  if (acc.currentEventLines.length > 0 && trimmed.length > 0 && !trimmed.startsWith("#")) {
    // Continuation line for current event block
    return {
      ...acc,
      currentEventLines: [...acc.currentEventLines, trimmed],
    };
  }

  return acc;
};

// Attempts to parse the current pending event block into a WOEvent
const flushPendingEvent = (acc: ParseAccumulator): readonly WOEvent[] => {
  if (acc.currentWeekday === null || acc.currentEventLines.length === 0) {
    return [];
  }
  const parsed = parseEventBlock(
    acc.currentEventLines,
    acc.currentWeekday,
    acc.weekNumber,
    acc.year,
    acc.defaultDurationMinutes
  );
  return parsed !== null ? [parsed] : [];
};

// Parses a single event block (array of lines) into a WOEvent
const parseEventBlock = (
  lines: readonly string[],
  weekday: string,
  weekNumber: number,
  year: number,
  defaultDurationMinutes: number
): WOEvent | null => {
  const fields = extractFields(lines);

  const title = fields["Termin"];
  if (!title) {
    return null;
  }

  const date = getDateForWeekday(weekday, weekNumber, year);
  if (!date) {
    return null;
  }

  const isReadOnly = lines.some((l) => l.includes(READONLY_MARKER));
  const zeitStr = fields["Zeit"] ?? null;
  const { startTime, endTime, allDay } = parseZeit(zeitStr, defaultDurationMinutes);

  const reminders = fields["Erinnerung"]
    ? parseReminders(fields["Erinnerung"])
    : [];

  return {
    title,
    date,
    startTime,
    endTime,
    allDay,
    location: fields["Ort"] ?? null,
    description: fields["Bemerkung"] ?? null,
    reminders,
    isReadOnly,
  };
};

// Extracts key-value pairs from event lines via reduce
// e.g. ["Termin: Foo", "Zeit: 11:00"] → { Termin: "Foo", Zeit: "11:00" }
const extractFields = (lines: readonly string[]): Record<string, string> =>
  lines.reduce<Record<string, string>>((acc, line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) {
      return acc;
    }
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    return key && value ? { ...acc, [key]: value } : acc;
  }, {});

// Parses "Zeit:" field into start/end times or all-day
const parseZeit = (
  zeitStr: string | null,
  defaultDurationMinutes: number
): { readonly startTime: string | null; readonly endTime: string | null; readonly allDay: boolean } => {
  if (!zeitStr) {
    return { startTime: null, endTime: null, allDay: true };
  }

  // Range like "08:00 - 12:00"
  const rangeMatch = zeitStr.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
  if (rangeMatch) {
    return { startTime: rangeMatch[1], endTime: rangeMatch[2], allDay: false };
  }

  // Single time like "11:00"
  const singleMatch = zeitStr.match(/^(\d{2}:\d{2})$/);
  if (singleMatch) {
    const startTime = singleMatch[1];
    return { startTime, endTime: addMinutesToTime(startTime, defaultDurationMinutes), allDay: false };
  }

  return { startTime: null, endTime: null, allDay: true };
};
