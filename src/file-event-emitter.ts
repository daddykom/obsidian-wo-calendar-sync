import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Notice, Plugin, TAbstractFile, TFile } from 'obsidian';

type JQueryStyleEventEmitter<TContext, TEvent> = {
  on(name: string, callback: (event: TEvent) => unknown, ctx?: TContext): unknown;
  off(name: string, callback: (event: TEvent) => unknown): unknown;
};

export default class WeekCalendartPlugin extends Plugin {
  readonly #internalWrites = new Set<string>();
  readonly #pendingSyncs = new Map<string, number>();

  override onload(): void {
    this.registerModifyPipeline();
  }

  override onunload(): void {
    for (const timeoutId of this.#pendingSyncs.values()) {
      window.clearTimeout(timeoutId);
    }

    this.#pendingSyncs.clear();
    this.#internalWrites.clear();
  }

  private registerModifyPipeline(): void {
    const vaultEmitter = this.app.vault as unknown as JQueryStyleEventEmitter<
      unknown,
      TAbstractFile
    >;

    const subscription = fromEvent<TAbstractFile>(vaultEmitter, 'modify')
      .pipe(
        filter((file): file is TFile => file instanceof TFile),
        filter((file) => file.extension === 'md'),
        filter((file) => !this.#internalWrites.has(file.path)),
      )
      .subscribe((file) => {
        this.scheduleEnsureLocalIdsAndSync(file);
      });

    this.register(() => subscription.unsubscribe());
  }

  private scheduleEnsureLocalIdsAndSync(file: TFile): void {
    const existingTimeoutId = this.#pendingSyncs.get(file.path);

    if (existingTimeoutId !== undefined) {
      window.clearTimeout(existingTimeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      this.#pendingSyncs.delete(file.path);

      void this.ensureLocalIdsAndSync(file.path).catch((error: unknown) => {
        console.error('[week-calendart] modify pipeline failed', error);
        new Notice('Week Calendart: Verarbeitung fehlgeschlagen (siehe Konsole)');
      });
    }, 3000);

    this.#pendingSyncs.set(file.path, timeoutId);
  }

  private async ensureLocalIdsAndSync(path: string): Promise<void> {
    const currentFile = this.app.vault.getAbstractFileByPath(path);

    if (!(currentFile instanceof TFile)) {
      return;
    }

    const activeFile = this.app.workspace.getActiveFile();

    if (activeFile?.path === currentFile.path) {
      this.scheduleEnsureLocalIdsAndSync(currentFile);
      return;
    }

    const originalContent = await this.app.vault.read(currentFile);
    const updatedContent = this.ensureLocalIdsInContent(originalContent);

    if (updatedContent !== originalContent) {
      await this.writeInternal(currentFile, updatedContent);
    }

    await this.syncFile(currentFile);
  }

  private async writeInternal(file: TFile, content: string): Promise<void> {
    this.#internalWrites.add(file.path);

    try {
      await this.app.vault.modify(file, content);
    } finally {
      window.setTimeout(() => {
        this.#internalWrites.delete(file.path);
      }, 0);
    }
  }

  private async syncFile(file: TFile): Promise<void> {
    console.log('[week-calendart] sync', file.path);
  }

  private ensureLocalIdsInContent(content: string): string {
    const lines = content.split('\n');
    const result: string[] = [];

    let insideEvent = false;
    let block: string[] = [];

    const flushBlock = (): void => {
      if (block.length === 0) {
        return;
      }

      const hasLocalId = block.some((line) => line.trimStart().startsWith('localId:'));

      if (!hasLocalId) {
        block.push(`  localId: ${crypto.randomUUID()}`);
      }

      result.push(...block);
      block = [];
    };

    for (const line of lines) {
      if (/^#\s/.test(line)) {
        flushBlock();
        insideEvent = false;
        result.push(line);
        continue;
      }

      if (line.startsWith('- ')) {
        flushBlock();
        insideEvent = true;
        block = [line];
        continue;
      }

      if (insideEvent) {
        if (line.trim() === '') {
          flushBlock();
          insideEvent = false;
          result.push(line);
          continue;
        }

        block.push(line);
        continue;
      }

      result.push(line);
    }

    flushBlock();

    return result.join('\n');
  }
}
