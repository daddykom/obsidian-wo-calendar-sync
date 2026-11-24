import { DEFAULT_SETTINGS } from './constants';
import { WeekcalendarSettings } from '../types';

type SavedSettings = {
  [K in keyof WeekcalendarSettings]?: Partial<WeekcalendarSettings[K]>;
};

export function mergeSettings(saved: SavedSettings | null = null): WeekcalendarSettings {
  return {
    paths: { ...DEFAULT_SETTINGS.paths, ...saved?.paths },
    weekdays: { ...DEFAULT_SETTINGS.weekdays, ...saved?.weekdays },
    prefixes: { ...DEFAULT_SETTINGS.prefixes, ...saved?.prefixes },
    caldav: { ...DEFAULT_SETTINGS.caldav, ...saved?.caldav },
  };
}
