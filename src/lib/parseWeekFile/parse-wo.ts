import { DEFAULT_SETTINGS } from '../settings/constants';
import {
  ElementStructure,
  LineMatcher,
  LineMatchResult,
  WeekcalendarSettings,
  WoElement,
} from '../types';

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
 */
export function parseWo(wochenFile: string, settings = DEFAULT_SETTINGS) {
  const wo = wochenFile.split('\n');
  const isolateElements = wo.reduce((acc, line): ElementStructure => {
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
 */
export function getLineType(line: string, settings = DEFAULT_SETTINGS) {
  const defaultValue: LineMatchResult = ['text', null];
  return lineMatchers(settings).reduce((acc, { matcher, type }): LineMatchResult => {
    const match = line.match(matcher);
    const text = match && match[1] ? match[1].toLowerCase() : null;
    const [key] = typedEntries(settings.weekdays).find(([, value]) => text === value) ?? [null];
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
  return { ...element, type, content: newContent };
}

function elementStructure(settings: WeekcalendarSettings): ElementStructure {
  return {
    key: 'start',
    elements: Object.entries(settings.weekdays).reduce(
      (acc, [key, item]) => ({ ...acc, [key]: [] }),
      {} as ElementStructure['elements'],
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
