export interface ElementStructure {
  key: WoFileStructure;
  lastElementType?: LineMatchertype;
  elements: Record<WoFileStructure, WoElement[]>;
}

export const woFileStructure = [
  'start',
  'montag',
  'dienstag',
  'mittwoch',
  'donnerstag',
  'freitag',
  'samstag',
  'sonntag',
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
