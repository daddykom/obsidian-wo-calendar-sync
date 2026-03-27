import { App, Notice, TFile } from 'obsidian';
import {
  catchError,
  debounce,
  filter,
  from,
  map,
  Observable,
  of,
  race,
  switchMap,
  timer,
} from 'rxjs';
import { processFile } from '../commands/process-file';
import { WO_FILE_REGEX } from '../settings/constants';

/**
 * Set the localid if it doesn't have one yet on all changed files
 * @param app
 * @param modifyEvents
 * @param actualFileChanded$
 */
export const modifyWeekFileEvent = (
  app: App,
  modifyEvents: Observable<any>,
  actualFileChanded$: Observable<any>,
) =>
  modifyEvents
    .pipe(
      filter((file): file is TFile => file instanceof TFile),
      filter((file: TFile) => WO_FILE_REGEX.test(file.path)),
      filter((file: TFile) => file.extension === 'md'),
      switchMap((file: TFile) =>
        from(app.vault.read(file)).pipe(map((fileContent) => [file, fileContent] as const)),
      ),
      debounce(() => race(actualFileChanded$, timer(10000))),
      switchMap(([file, fileContent]) => {
        const changedFile = processFile(fileContent, file);
        if (changedFile) {
          return from(app.vault.modify(file, changedFile)).pipe(
            map(() => new Notice(`File ${file.name} angepasst.`)),
            catchError((err) =>
              of(new Notice(`Fehler bei der Anpassung von ${file.name}: ` + JSON.stringify(err))),
            ),
          );
        }
        return of('');
      }),
    )
    .subscribe();
