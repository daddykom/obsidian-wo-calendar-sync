import { TFile } from 'obsidian';
import { DEFAULT_SETTINGS } from '../settings/constants';
import { WeekcalendarSettings } from '../types';
import { getWeekFileInfo, processFile } from './process-file';

const settings: WeekcalendarSettings = {
  ...DEFAULT_SETTINGS,
  paths: { ...DEFAULT_SETTINGS.paths, weekFolder: 'Plans/Calendar' },
};

describe('processFile', () => {
  it('extracts two-digit week numbers from configured week folders', () => {
    expect(getWeekFileInfo('Plans/Calendar/2026/weeks/W48 23.11.26.md', settings.paths.weekFolder)).toEqual({
      year: 2026,
      week: 48,
    });
  });

  it('adds an id to an event in a configured week file', () => {
    const file = { path: 'Plans/Calendar/2026/weeks/W48 23.11.26.md' } as TFile;
    const result = processFile('# Montag (23)\n- Termin: Besprechung\n', file, settings);

    expect(result).toMatch(/\^woev-[a-zA-Z0-9]+/);
  });

  it('does not process files outside the configured week folder', () => {
    const file = { path: 'other/2026/weeks/W48 23.11.26.md' } as TFile;

    expect(processFile('# Montag (23)\n- Termin: Besprechung\n', file, settings)).toBe('');
  });
});
