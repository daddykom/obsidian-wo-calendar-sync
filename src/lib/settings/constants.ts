import { WeekcalendarSettings } from '../types';

export const WO_FILE_REGEX = /^week-calendar\/.*\/WO/;

export const DEFAULT_SETTINGS: WeekcalendarSettings = {
  paths: {
    weekFolder: 'week-calendar',
    eventFolder: 'week-calendar/events',
  },
  weekdays: {
    start: 'start',
    monday: 'montag',
    tuesday: 'dienstag',
    wednesday: 'mittwoch',
    thursday: 'donnerstag',
    friday: 'freitag',
    saturday: 'samstag',
    sunday: 'sonntag',
    links: 'links',
  },
  prefixes: {
    event: 'Termin',
    time: 'zeit',
    location: 'ort',
    reminder: 'erinnerung',
    repeat: 'wiederholung',
  },
  caldav: {
    url: '',
    username: '',
    password: '',
    calendar: '',
  },
};
