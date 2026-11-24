import { App, TAbstractFile, TFile } from 'obsidian';
import { Observable, Subject, Subscription } from 'rxjs';
import { WeekcalendarSettings } from '../types';
import { modifyWeekFileEvent } from './modify-week-file-event';

export function affectsWeekFiles(path: string, root: string): boolean {
  const folder = root.replace(/\/$/, '');
  if (path === folder || folder.startsWith(path + '/')) return true;
  if (!path.startsWith(folder + '/')) return false;
  const relative = path.slice(folder.length + 1);
  return /^\d{4}$/.test(relative) || /^[^/]+\/weeks(?:\/W[^/]*\.md)?$/.test(relative);
}

export function watchWeekFiles(
  app: App,
  settings: WeekcalendarSettings,
  activeChanges: Observable<unknown>,
  ignoredFiles: ReadonlySet<string>,
  coordinator: {
    changed(): void;
    processingPending(): void;
    processingSettled(success: boolean): void;
  },
): Subscription {
  const subscription = new Subscription();
  const modifications = new Subject<unknown>();
  subscription.add(modifyWeekFileEvent(app, modifications, activeChanges, settings, ignoredFiles, {
    pending: () => coordinator.processingPending(),
    settled: (success) => coordinator.processingSettled(success),
  }));
  const changed = (file: TAbstractFile, oldPath?: string, deleted = false) => {
    if (ignoredFiles.has(file.path) || (oldPath !== undefined && ignoredFiles.has(oldPath))) return;
    if (![file.path, oldPath].some((path) => path !== undefined && affectsWeekFiles(path, settings.paths.weekFolder))) return;
    coordinator.changed();
    if (!deleted) {
      if (file instanceof TFile) modifications.next(file);
      else for (const child of app.vault.getMarkdownFiles()) {
        if (child.path.startsWith(file.path + '/')) modifications.next(child);
      }
    }
  };
  const refs = [
    app.vault.on('modify', (file) => changed(file)),
    app.vault.on('create', (file) => changed(file)),
    app.vault.on('delete', (file) => changed(file, undefined, true)),
    app.vault.on('rename', (file, oldPath) => changed(file, oldPath)),
  ];
  subscription.add(() => { for (const ref of refs) app.vault.offref(ref); modifications.complete(); });
  return subscription;
}
