// Returns the Monday date of a given ISO week number and year
export const getMondayOfWeek = (week: number, year: number): Date => {
  // Jan 4th is always in week 1 per ISO 8601
  const jan4 = new Date(year, 0, 4);
  const jan4DayOfWeek = jan4.getDay() === 0 ? 7 : jan4.getDay();
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - (jan4DayOfWeek - 1) + (week - 1) * 7);
  return monday;
};

// Maps German weekday headings to day offset from Monday (0–6)
const WEEKDAY_OFFSETS: Readonly<Record<string, number>> = {
  Montag: 0,
  Dienstag: 1,
  Mittwoch: 2,
  Donnerstag: 3,
  Freitag: 4,
  Samstag: 5,
  Sonntag: 6,
};

// Returns ISO date string YYYY-MM-DD for a given weekday in a given week/year
export const getDateForWeekday = (
  weekday: string,
  week: number,
  year: number
): string | null => {
  const offset = WEEKDAY_OFFSETS[weekday];
  if (offset === undefined) {
    return null;
  }
  const monday = getMondayOfWeek(week, year);
  const date = new Date(monday);
  date.setDate(monday.getDate() + offset);
  return formatDate(date);
};

// Formats a Date as YYYY-MM-DD
export const formatDate = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

// Adds minutes to a HH:MM time string, returns HH:MM
export const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  return [
    String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0"),
    String(totalMinutes % 60).padStart(2, "0"),
  ].join(":");
};

// Parses week number from WO filename (e.g. "WO09" → 9)
export const parseWeekNumber = (filename: string): number | null => {
  const match = filename.match(/^WO(\d{1,2})$/i);
  return match ? parseInt(match[1], 10) : null;
};

// Parses year from folder path or defaults to current year
export const parseYearFromPath = (path: string): number => {
  const match = path.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
};
