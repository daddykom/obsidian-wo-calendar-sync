export interface WoFileStructure {
  key: WoFileTitleStructure;
  lastElementType?: LineMatchertype;
  elements: ElementsStructure;
}

export type ElementsStructure = Record<WoFileTitleStructure, WoElement[]>;

export const woFileTitleStructure = [
  'start',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'links',
] as const;
export type WoFileTitleStructure = (typeof woFileTitleStructure)[number];

export type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly-date' | 'monthly-weekday' | 'yearly';

export interface RecurrenceByWeekday {
  ordinal: number;
  weekday: Weekday;
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  byDay?: Weekday[];
  byMonthDay?: number;
  byWeekday?: RecurrenceByWeekday;
  byMonth?: number;
  byYearday?: number;
}

export interface RecurrenceEnd {
  type: 'enddate';
  endDate: Date;
}

export interface Recurrence {
  rule: RecurrenceRule;
  end: RecurrenceEnd;
  originalEventId: string;
  recurrenceId: string;
}

export type WoElement = TextElement | EventElement;

export interface TextElement {
  type: 'text';
  content: string[];
}

export interface EventElement {
  type: 'event';
  content: string[];
  eventId: string;
  recurrenceId?: string;
  isException?: boolean;
  exceptionOfRecurrenceId?: string;
}

export type LineMatchertype = 'key' | 'event' | 'followUp' | 'text';

export interface LineMatcher {
  matcher: RegExp;
  type: LineMatchertype;
}

export type LineMatchResult = [LineMatchertype, WoFileTitleStructure | null];

export interface WeekcalendarSettings {
  paths: { weekFolder: string; eventFolder: string; overviewFileName: string };
  weekdays: Record<WoFileTitleStructure, string>;
  prefixes: {
    event: string;
    time: string;
    location: string;
    reminder: string;
    repeat: string;
  };
  caldav: {
    url: string;
    username: string;
    password: string;
    calendar: string;
  };
}

export interface Weeks {
  monday: Date;
  lastMonday: Date;
  nextMonday: Date;
  week: number;
  yyyy: number;
}
