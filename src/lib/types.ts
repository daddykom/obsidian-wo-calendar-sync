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

export type WoElement = TextElement | EventElement;

interface TextElement {
  type: 'text';
  content: string[];
}

interface EventElement {
  type: 'event';
  content: string[];
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
