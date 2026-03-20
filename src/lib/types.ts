export interface ElementStructure {
  key: WoFileStructure;
  lastElementType?: LineMatchertype;
  elements: Record<WoFileStructure, WoElement[]>;
}

export const woFileStructure = [
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

export type WoFileStructure = (typeof woFileStructure)[number];

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

export type LineMatchResult = [LineMatchertype, WoFileStructure | null];

export interface WeekcalendarSettings {
  paths: { weekFolder: string; eventFolder: string };
  weekdays: Record<WoFileStructure, string>;
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
