import { DEFAULT_SETTINGS, RECURRENCE_PATTERNS } from '../settings/constants';
import {
  LineMatcher,
  LineMatchResult,
  WeekcalendarSettings,
  WoElement,
  WoFileStructure,
} from '../types';

/**
 * Extract eventId from content lines
 */
function extractEventId(content: string[]): string | null {
  const matchLine = content.find(
    (line) => !line.match(RECURRENCE_PATTERNS.recurrenceId) && line.match(/\^woev-([a-zA-Z0-9]+)/)
  );
  return matchLine ? matchLine.match(/\^woev-([a-zA-Z0-9]+)/)?.[1] ?? null : null;
}

/**
 * Extract recurrenceId from content lines
 */
function extractRecurrenceId(content: string[]): string | null {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.recurrenceId));
  return matchLine ? matchLine.match(RECURRENCE_PATTERNS.recurrenceId)?.[1] ?? null : null;
}

/**
 * Extract exception info from content lines
 */
function extractExceptionInfo(content: string[]): { isException: boolean; exceptionOfRecurrenceId: string | null } {
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
  const wo = wochenFile.split('\n');
  const isolateElements = wo.reduce((acc, line): WoFileStructure => {
    const trimmedLine = line.trimEnd();
    const [lineType, key] = getLineType(trimmedLine, settings);
    switch (lineType) {
      case 'key':
        return {
          ...acc,
          key: key!,
          lastElementType: 'text',
          elements: {
            ...acc.elements,
            [key!]: [...acc.elements[key!], createElement('text', trimmedLine)],
          },
        };
      case 'event':
        return {
          ...acc,
          lastElementType: 'event',
          elements: {
            ...acc.elements,
            [acc.key]: [...acc.elements[acc.key], createElement('event', trimmedLine)],
          },
        };
      case 'followUp':
      case 'text':
        const type = lineType === 'followUp' ? 'event' : 'text';
        const length = acc.elements[acc.key].length;
        const element =
          lineType === acc.lastElementType ||
          (lineType === 'followUp' && acc.lastElementType === 'event' && length)
            ? acc.elements[acc.key][length - 1]
            : undefined;
        const elements = acc.elements[acc.key].slice(0, length - (element ? 1 : 0)) ?? [];
        return {
          ...acc,
          lastElementType: type,
          elements: {
            ...acc.elements,
            [acc.key]: [...elements, createElement(type, trimmedLine, element)],
          },
        };
    }
    return acc;
  }, elementStructure(settings));
  return isolateElements.elements;
}

/**
 * defines the line type
 * @param line
 * @param settings
 */
export function getLineType(line: string, settings = DEFAULT_SETTINGS) {
  const defaultValue: LineMatchResult = ['text', null];
  return lineMatchers(settings).reduce((acc, { matcher, type }): LineMatchResult => {
    const match = line.match(matcher);
    const text = match && match[1] ? match[1].toLowerCase() : null;
    const [key] = typedEntries(settings.weekdays).find(
      ([, value]) => text === value.toLowerCase(),
    ) ?? [null];
    if (match) {
      return [type, key];
    }
    return acc;
  }, defaultValue);
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

const lineMatchers = (settings: WeekcalendarSettings): LineMatcher[] => [
  { matcher: /^#\s+([a-z,A-Z]+)/, type: 'key' },
  { matcher: new RegExp(`^-\\s+${settings.prefixes.event}`, 'i'), type: 'event' },
  { matcher: /^\s{2}/, type: 'followUp' },
];

const typedEntries = <T extends Record<string, unknown>>(obj: T) =>
  Object.entries(obj) as [keyof T, T[keyof T]][];
