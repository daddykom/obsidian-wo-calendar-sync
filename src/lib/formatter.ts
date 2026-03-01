import { WOEvent, FullCalendarEvent } from "./types";

// Converts a WOEvent into a Full Calendar markdown string with source tag
export const formatFullCalendarFileWithSource = (
  event: WOEvent,
  sourceWOFile: string
): string =>
  buildMarkdown(woEventToFullCalendar(event)) + `# source: ${sourceWOFile}\n`;

// Maps a WOEvent to the FullCalendarEvent shape
const woEventToFullCalendar = (event: WOEvent): FullCalendarEvent => ({
  title: event.title,
  date: event.allDay ? event.date : `${event.date}T${event.startTime}`,
  endDate: !event.allDay && event.endTime !== null
    ? `${event.date}T${event.endTime}`
    : null,
  allDay: event.allDay,
  location: event.location,
  description: event.description,
  alarms: event.reminders,
  readonly: event.isReadOnly,
});

// Builds required frontmatter lines (always present)
const buildRequiredLines = (fc: FullCalendarEvent): readonly string[] => [
  "---",
  `title: "${escapeFrontmatter(fc.title)}"`,
  `date: ${fc.date}`,
  ...(fc.endDate !== null ? [`endDate: ${fc.endDate}`] : []),
  `allDay: ${fc.allDay}`,
];

// Builds optional frontmatter lines (only present when value exists)
const buildOptionalLines = (fc: FullCalendarEvent): readonly string[] => [
  ...(fc.location !== null ? [`location: "${escapeFrontmatter(fc.location)}"`] : []),
  ...(fc.description !== null ? [`description: "${escapeFrontmatter(fc.description)}"`] : []),
  ...(fc.alarms.length > 0
    ? ["alarms:", ...fc.alarms.map((alarm) => `  - ${alarm}`)]
    : []),
  ...(fc.readonly ? ["readonly: true"] : []),
];

// Assembles the full YAML frontmatter markdown string for Full Calendar
const buildMarkdown = (fc: FullCalendarEvent): string =>
  [
    ...buildRequiredLines(fc),
    ...buildOptionalLines(fc),
    "---",
    "",
  ].join("\n");

// Escapes double quotes in YAML frontmatter string values
const escapeFrontmatter = (value: string): string =>
  value.replace(/"/g, '\\"');

// Generates a stable filename for a Full Calendar event file
// Format: YYYY-MM-DD_title-slug.md
export const getEventFilename = (event: WOEvent): string => {
  const slug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${event.date}_${slug}.md`;
};
