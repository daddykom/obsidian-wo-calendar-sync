import { App, EventRef, TAbstractFile, TFile } from 'obsidian';

export function memoryCalendarVault(initial: Record<string, string>) {
  const notes = new Map<string, string>();
  const files = new Map<string, TFile>();
  const listeners = new Map<string, Set<(file: TAbstractFile, oldPath?: string) => void>>();
  const emit = (event: string, file: TAbstractFile, oldPath?: string) => {
    for (const callback of [...listeners.get(event) ?? []]) callback(file, oldPath);
  };
  const add = (path: string, content: string, notify = true) => {
    const file = Object.assign(new TFile(), { path, extension: 'md', name: path.split('/').pop()! });
    files.set(path, file);
    notes.set(path, content);
    if (notify) emit('create', file);
    return file;
  };
  for (const [path, content] of Object.entries(initial)) add(path, content, false);
  const vault = {
    getAbstractFileByPath: (path: string) => files.get(path) ?? null,
    getMarkdownFiles: () => [...files.values()],
    read: jest.fn(async (file: TFile) => {
      if (!notes.has(file.path)) throw new Error('Missing file');
      return notes.get(file.path)!;
    }),
    process: jest.fn(async (file: TFile, transform: (content: string) => string) => {
      const original = notes.get(file.path)!;
      const content = transform(original);
      if (content !== original) {
        notes.set(file.path, content);
        emit('modify', file);
      }
      return content;
    }),
    on: (event: string, callback: (file: TAbstractFile, oldPath?: string) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(callback);
      return { event, callback } as unknown as EventRef;
    },
    offref: (ref: EventRef) => {
      const { event, callback } = ref as unknown as { event: string; callback: (file: TAbstractFile, oldPath?: string) => void };
      listeners.get(event)?.delete(callback);
    },
  };
  return {
    app: { vault } as unknown as App, vault, notes, files, emit, add,
    change(path: string, content: string) { notes.set(path, content); emit('modify', files.get(path)!); },
    remove(path: string) {
      const file = files.get(path)!;
      files.delete(path);
      notes.delete(path);
      emit('delete', file);
    },
    rename(path: string, newPath: string) {
      const file = files.get(path)!;
      const content = notes.get(path)!;
      files.delete(path);
      notes.delete(path);
      file.path = newPath;
      files.set(newPath, file);
      notes.set(newPath, content);
      emit('rename', file, path);
    },
  };
}
