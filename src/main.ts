import { App, Notice, Plugin, PluginManifest, TAbstractFile, TFile, Vault } from 'obsidian';
import { processAll, prozessActiveFile } from './commands';
import {
  catchError,
  concatMap,
  debounce,
  debounceTime,
  distinct,
  filter,
  from,
  fromEvent,
  groupBy,
  map,
  mergeMap,
  Observable,
  of,
  race,
  switchMap,
  tap,
  timer,
  withLatestFrom,
} from 'rxjs';
import { parseWo } from './parse-wo';
import { createHash } from 'crypto';
import { JQueryStyleEventEmitter } from 'rxjs/internal/observable/fromEvent';
import { setEventIds } from './set-event-ids';
import { stringifyWo } from './stringify-wo';
import { popNumber } from 'rxjs/internal/util/args';
import { subscribe } from 'node:diagnostics_channel';

export default class WeekCalendartPlugin extends Plugin {
  actualFileChanded$ = fromEvent(this.app.workspace, 'active-leaf-change');
  fileChanged$ = fromEvent(this.app.vault, 'modify');

  async onload(): Promise<void> {
    console.log('WeekCalendartPlugin start load');
    this.addCommand({
      id: 'week-calendart-sync-current-file',
      name: 'Week Calendart: Sync current WO file',
      callback: prozessActiveFile(this.app),
    });

    this.addCommand({
      id: 'week-calendart-sync-all',
      name: 'Week Calendart: Sync all WO files',
      callback: processAll(this.app),
    });

    this.fileChanged$
      .pipe(
        filter((file): file is TFile => file instanceof TFile),
        filter((file: TFile) => !!file.path.match(/^\/week-calendar\/.*\/WO/)),
        filter((file: TFile) => file.extension === 'md'),
        switchMap((file: TFile) =>
          from(this.app.vault.read(file)).pipe(map((fileContent) => [file, fileContent] as const)),
        ),
        debounce(() => race(this.actualFileChanded$, timer(10_000))),
        filter(([file, fileContent]) => {
          const [, year, week] = file.path.match(/^\/week-calendar\/([0-9]+)\/WO([0-9])/) ?? [];
          const structFile = parseWo(fileContent);
          const before = stringifyWo(structFile).split(/\n/);
          const after = stringifyWo(setEventIds(structFile, Number(year), Number(week))).split(
            /\n/,
          );
          return after.length !== before.length;
        }),
        switchMap(([file, fileContent]) => {
          const [, year, week] = file.path.match(/^\/week-calendar\/([0-9]+)\/WO([0-9])/) ?? [];
          const structFile = parseWo(fileContent);
          const changedFile = stringifyWo(setEventIds(structFile, Number(year), Number(week)));
          return from(this.app.vault.modify(file, changedFile)).pipe(
            map(() => new Notice(`File ${file.name} angepasst.`)),
            catchError((err) =>
              of(new Notice(`Fehler bei der Anpassung von ${file.name}: ` + JSON.stringify(err))),
            ),
          );
        }),
      )
      .subscribe();

    new Notice('Week Calendart loaded.');
  }

  onunload(): void {
    // no-opπ
  }
}
