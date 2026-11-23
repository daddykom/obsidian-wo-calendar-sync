import { WoFileTitleStructure } from '../types';

const weekdayOffsets: Record<Exclude<WoFileTitleStructure, 'start' | 'links'>, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

export function formatDayHeading(
  monday: Date,
  weekday: keyof typeof weekdayOffsets,
  name: string,
): string {
  const date = new Date(monday);
  date.setDate(date.getDate() + weekdayOffsets[weekday]);
  return `# ${name} (${date.getDate()})`;
}
