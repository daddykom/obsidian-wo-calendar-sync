/**
 * Array.toSpliced ist erst ab ES2023 vorhanden.
 */
export function checkToSplicedCompatibility() {
  if (!('toSpliced' in Array.prototype)) {
    return `Deine Obsidian-Version ist zu alt für dieses Plugin.\nFehlende Features: toSpliced verlangs ES2023}`;
  }
  return null;
}
