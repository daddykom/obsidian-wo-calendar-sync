import { DEFAULT_SETTINGS, RECURRENCE_PATTERNS } from '../settings/constants';
import {
  EventElement,
  LineMatchResult,
  WeekcalendarSettings,
  WoElement,
  WoFileStructure,
  WoFileTitleStructure,
} from '../types';

const EVENT_ID_PATTERN = /^\s+\^woev-([a-zA-Z0-9]+)\s*$/;

/**
 * Extract eventId from content lines
 */
function extractEventId(content: string[]): string | null {
  return content.flatMap((line) => {
    const match = line.match(EVENT_ID_PATTERN);
    return match ? [match[1]] : [];
  })[0] ?? null;
}

/**
 * Extract recurrenceId from content lines
 */
function extractRecurrenceId(content: string[]): string | null {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.recurrenceId));
  return matchLine ? (matchLine.match(RECURRENCE_PATTERNS.recurrenceId)?.[1] ?? null) : null;
}

/**
 * Extract exception info from content lines
 */
function extractExceptionInfo(content: string[]): {
  isException: boolean;
  exceptionOfRecurrenceId: string | null;
} {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.exceptionTag));
  if (matchLine) {
    const match = matchLine.match(RECURRENCE_PATTERNS.exceptionTag);
    return { isException: true, exceptionOfRecurrenceId: match?.[1] ?? null };
  }
  return { isException: false, exceptionOfRecurrenceId: null };
}

/**
 * parses WochenFile into blocks of text
 * @param wochenFile
 *
 * Bsp:
 *   {
 *     'monday': [
 *       { type: 'event', content: [ '- Termin 1', '  Zeit: 17:00' ] }
 *       { type: 'text', content: [ 'Irgend ein Text' ] }
 *       ]
 *   }
 *   @param settings
 */
export function parseWo(wochenFile: string, settings = DEFAULT_SETTINGS) {
  return parseWoWithDiagnostics(wochenFile, settings).elements;
}

export interface ParsedWoEvent {
  element: EventElement;
  section: WoFileTitleStructure | null;
  line: number;
  title: string | null;
  eventIds: string[];
}

export interface ParsedWoHeading {
  section: WoFileTitleStructure | null;
  line: number;
  dayOfMonth?: number;
}

export function parseWoWithDiagnostics(wochenFile: string, settings = DEFAULT_SETTINGS) {
  const state = elementStructure(settings);
  const events: ParsedWoEvent[] = [];
  const headings: ParsedWoHeading[] = [];
  const diagnostics: { line: number; message: string }[] = [];
  const lines = wochenFile.replace(/\r\n/g, '\n').split('\n');
  let section: WoFileTitleStructure | null = 'start';
  let activeEvent: ParsedWoEvent | undefined;
  let frontmatter = lines[0] === '---';
  let fence: { marker: string; length: number; line: number } | null = null;
  const eventPrefix = settings.prefixes.event.trim().toLowerCase();

  const appendText = (line: string) => {
    const elements = state.elements[state.key];
    const previous = elements[elements.length - 1];
    if (previous?.type === 'text') previous.content.push(line);
    else elements.push(createElement('text', line));
    activeEvent = undefined;
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trimEnd();
    const lineNumber = index + 1;
    if (frontmatter) {
      appendText(line);
      if (index > 0 && /^(---|\.\.\.)\s*$/.test(line)) frontmatter = false;
      continue;
    }
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      appendText(line);
      if (fenceMatch && fenceMatch[1][0] === fence.marker &&
          fenceMatch[1].length >= fence.length && !fenceMatch[2].trim()) fence = null;
      continue;
    }
    if (fenceMatch) {
      fence = { marker: fenceMatch[1][0], length: fenceMatch[1].length, line: lineNumber };
      appendText(line);
      continue;
    }

    const [lineType, key] = getLineType(line, settings);
    const heading = line.match(HEADING_PATTERN);
    if (heading) {
      section = key;
      headings.push({ section, line: lineNumber, dayOfMonth: heading[2] ? Number(heading[2]) : undefined });
    }
    if (lineType === 'key') {
      state.key = key!;
      state.elements[state.key].push(createElement('text', line));
      activeEvent = undefined;
      continue;
    }

    const candidate = line.match(/^\s*[-*+]\s*([^:]+):/);
    if (candidate?.[1].trim().toLowerCase() === eventPrefix && lineType !== 'event') {
      diagnostics.push({ line: lineNumber, message: 'Termin muss ohne Einrückung mit „- Terminpräfix: Titel“ beginnen.' });
    }
    if (lineType === 'event') {
      const titleMatch = line.match(eventPattern(settings, true));
      if (!titleMatch) diagnostics.push({ line: lineNumber, message: 'Terminpräfix muss von einem Doppelpunkt gefolgt werden.' });
      const element = createElement('event', line) as EventElement;
      state.elements[state.key].push(element);
      activeEvent = { element, section, line: lineNumber, title: titleMatch?.[1].trim() ?? null, eventIds: [] };
      events.push(activeEvent);
    } else if (lineType === 'followUp' && activeEvent) {
      const elements = state.elements[state.key];
      activeEvent.element = createElement('event', line, activeEvent.element) as EventElement;
      elements[elements.length - 1] = activeEvent.element;
    } else {
      appendText(line);
    }
  }

  for (const event of events) {
    event.eventIds = event.element.content.flatMap((line, index) => {
      const match = line.match(EVENT_ID_PATTERN);
      if (/^\s+\^woev-(?!rec-)/.test(line) && !match) {
        diagnostics.push({ line: event.line + index, message: 'Ungültige ^woev-ID.' });
      }
      return match ? [match[1]] : [];
    });
  }
  if (frontmatter) diagnostics.push({ line: 1, message: 'YAML-Frontmatter ist nicht abgeschlossen.' });
  if (fence) diagnostics.push({ line: fence.line, message: 'Codeblock ist nicht abgeschlossen.' });
  return { elements: state.elements, events, headings, diagnostics };
}

/**
 * defines the line type
 * @param line
 * @param settings
 */
export function getLineType(line: string, settings = DEFAULT_SETTINGS) {
  const heading = line.match(HEADING_PATTERN);
  if (heading) {
    const text = heading[1].trim().toLowerCase();
    const [key] = typedEntries(settings.weekdays).find(
      ([, value]) => text === value.trim().toLowerCase(),
    ) ?? [null];
    if (key !== null) return ['key', key] as LineMatchResult;
  }
  if (line.match(eventPattern(settings))) return ['event', null] as LineMatchResult;
  if (/^(?: {2,}|\t)/.test(line)) return ['followUp', null] as LineMatchResult;
  return ['text', null] as LineMatchResult;
}

const HEADING_PATTERN = /^#\s+(.+?)(?:\s+\((\d{1,2})\))?\s*$/;

function eventPattern(settings: WeekcalendarSettings, withTitle = false): RegExp {
  const prefix = settings.prefixes.event.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^-\\s+${prefix}${withTitle ? '\\s*:\\s*(.*)$' : '(?=:|\\s|$)'}`, 'i');
}

/**
 * Create a WoElement Object
 * @param type
 * @param content
 * @param element
 */
function createElement(type: WoElement['type'], content: string, element?: WoElement): WoElement {
  const newContent = element ? [...element.content, content] : [content];

  if (type === 'event') {
    const eventId = extractEventId(newContent);
    const recurrenceId = extractRecurrenceId(newContent);
    const exceptionInfo = extractExceptionInfo(newContent);

    const result: WoElement = {
      type: 'event',
      content: newContent,
      eventId: eventId || '',
    };
    if (recurrenceId) {
      result.recurrenceId = recurrenceId;
    }
    if (exceptionInfo.isException && exceptionInfo.exceptionOfRecurrenceId) {
      result.isException = true;
      result.exceptionOfRecurrenceId = exceptionInfo.exceptionOfRecurrenceId;
    }
    return result;
  }

  return { type, content: newContent };
}

function elementStructure(settings: WeekcalendarSettings): WoFileStructure {
  return {
    key: 'start',
    elements: Object.entries(settings.weekdays).reduce(
      (acc, [key]) => ({ ...acc, [key]: [] }),
      {} as WoFileStructure['elements'],
    ),
  };
}

const typedEntries = <T extends Record<string, unknown>>(obj: T) =>
  Object.entries(obj) as [keyof T, T[keyof T]][];
