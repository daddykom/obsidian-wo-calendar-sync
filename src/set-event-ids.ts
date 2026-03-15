import { WoElement, woFileStructure, WoFileStructure } from './types';
import { createHash } from 'crypto';
import { WoFileStruct, WoFileStructKey } from './parse-wo-2';
import { createLocalId } from './util';

export function setEventIds(
  elements: Record<WoFileStructure, WoElement[]>,
  year: number,
  week: number,
) {
  return woFileStructure.reduce((acc, section) => {
    const elements = acc[section].map((element: WoElement) => {
      if (element.type === 'event') {
        const content = element.content;
        if (content[content.length - 1].match(/^  \^woev-/)) {
          return element;
        }
        const contentString = content.map((item) => item.trim()).join('|');
        const hashValue = `${year}|${week}|${section}|${contentString}`;
        const hash = createLocalId(hashValue);
        return { ...element, content: [...content, `  ^woev-${hash}`] };
      }
      return element;
    });
    return { ...acc, [section]: elements };
  }, elements);
}
