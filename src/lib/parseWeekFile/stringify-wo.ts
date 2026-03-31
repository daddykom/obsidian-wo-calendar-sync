import { ElementsStructure, woFileTitleStructure } from '../types';

/**
 * make flat string from structure
 * @param elements
 */
export function stringifyWo(elements: ElementsStructure) {
  const lines = woFileTitleStructure.flatMap((key) => [
    ...elements[key].map((element) => element.content.join('\n')),
  ]);
  return lines.join('\n');
}
