import { App, Notice } from 'obsidian';
import { migrateWeekHeadings } from '../parseWeekFile/migrate-week-headings';
import { WeekcalendarSettings } from '../types';

export const migrateAllWeekHeadings = (
  app: App,
  settings: WeekcalendarSettings,
  migratingFiles: Set<string>,
) => {
  let running = false;

  return async () => {
    if (running) {
      new Notice('Die Ergänzung der Monatstage läuft bereits.');
      return;
    }
    running = true;
    let changed = 0;
    let failed = 0;

    try {
      const prefix = `${settings.paths.weekFolder}/`;
      const files = app.vault
        .getMarkdownFiles()
        .filter(
          (file) =>
            file.path.startsWith(prefix) &&
            /^\d{4}\/weeks\/W\d{2} \d{2}\.\d{2}\.\d{2}\.md$/.test(file.path.slice(prefix.length)),
        );

      for (const file of files) {
        try {
          const content = await app.vault.read(file);
          if (migrateWeekHeadings(content, file.path, settings) === content) continue;

          migratingFiles.add(file.path);
          let updated = false;
          await app.vault.process(file, (current) => {
            const migrated = migrateWeekHeadings(current, file.path, settings);
            updated = migrated !== current;
            return migrated;
          });
          if (updated) changed++;
        } catch (error) {
          failed++;
          console.error(`Failed to migrate week headings: ${file.path}`, error);
        } finally {
          migratingFiles.delete(file.path);
        }
      }

      new Notice(
        `Monatstage: ${files.length} Wochen-Dateien geprüft, ${changed} angepasst, ${failed} Fehler.`,
      );
    } finally {
      running = false;
    }
  };
};
