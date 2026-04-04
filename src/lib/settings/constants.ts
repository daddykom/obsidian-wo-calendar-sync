import { WeekcalendarSettings } from '../types';

export const WO_FILE_REGEX = /^week-calendar\/.*\/W[0-5].[0-9]. /;

export const DEFAULT_SETTINGS: WeekcalendarSettings = {
  paths: {
    weekFolder: 'week-calendar',
    eventFolder: 'week-calendar/events',
    overviewFileName: 'Übersicht',
  },
  weekdays: {
    start: 'Start',
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag',
    links: 'Links',
  },
  prefixes: {
    event: 'Termin',
    time: 'Zeit',
    location: 'Ort',
    reminder: 'Erinnerung',
    repeat: 'Wiederholung',
  },
  caldav: {
    url: '',
    username: '',
    password: '',
    calendar: '',
  },
};
