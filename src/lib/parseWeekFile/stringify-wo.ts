import { WoElement, woFileStructure, WoFileStructure } from '../types';

/**
 * make flat string from structure
 * @param elements
 */
export function stringifyWo(elements: Record<WoFileStructure, WoElement[]>) {
  const lines = woFileStructure.flatMap((key) => [
    ...elements[key].map((element) => element.content.join('\n')),
  ]);
  return lines.join('\n');
}
