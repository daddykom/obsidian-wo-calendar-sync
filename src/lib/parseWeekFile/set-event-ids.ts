import { WoElement, woFileTitleStructure, WoFileTitleStructure } from '../types';
import { createLocalId } from '../utils/util';

/**
 * Set the localid if it doesn't have one yet
 * @param elements
 * @param year
 * @param week
 */
export function setEventIds(
  elements: Record<WoFileTitleStructure, WoElement[]>,
  year: number,
  week: number,
) {
  return woFileTitleStructure
    .filter((key) => !['start', 'links'].includes(key))
    .reduce((acc, section) => {
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
