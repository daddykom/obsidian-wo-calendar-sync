import {
  ElementStructure,
  LineMatcher,
  LineMatchResult,
  WoElement,
  WoFileStructure,
} from './types';

const lineMatchers: LineMatcher[] = [
  { matcher: /^#\s+([a-z,A-Z]+)/, type: 'key' },
  { matcher: /^-\s+Termin/i, type: 'event' },
  { matcher: /^\s{2}/, type: 'followUp' },
];

const elementStructure: ElementStructure = {
  key: 'start',
  elements: {
    start: [],
    montag: [],
    dienstag: [],
    mittwoch: [],
    donnerstag: [],
    freitag: [],
    samstag: [],
    sonntag: [],
    links: [],
  },
};

/**
 * parses WochenFile into blocks of text
 * @param wochenFile
 *
 * Bsp:
 *   {
 *     'montag': [
 *       { type: 'event', content: [ '- Termin 1', '  Zeit: 17:00' ] }
 *       { type: 'text', content: [ 'Irgend ein Text' ] }
 *       ]
 *   }
 */
export function parseWo(wochenFile: string) {
  const wo = wochenFile.split('\n');
  const isolateElements = wo.reduce((acc, line): ElementStructure => {
    const trimmedLine = line.trimEnd();
    const [lineType, key] = getLineType(trimmedLine);
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
  }, elementStructure);
  return isolateElements.elements;
}

/**
 * defines the line type
 * @param line
 */
export function getLineType(line: string) {
  const defaultValue: LineMatchResult = ['text', null];
  return lineMatchers.reduce((acc, { matcher, type }): LineMatchResult => {
    const match = line.match(matcher);
    const key = match && match[1] ? (match[1].toLowerCase() as WoFileStructure) : null;
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
