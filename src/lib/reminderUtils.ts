// Parses a reminder string like "20min, 1tg" into an array of minutes
export const parseReminders = (reminderStr: string): number[] =>
  reminderStr
    .split(",")
    .map((part) => part.trim())
    .map(parseReminderPart)
    .filter((v): v is number => v !== null);

// Parses a single reminder token into minutes, returns null if unrecognised
const parseReminderPart = (part: string): number | null => {
  const matchers: ReadonlyArray<{ pattern: RegExp; toMinutes: (n: number) => number }> = [
    { pattern: /^(\d+)min$/i, toMinutes: (n) => n },
    { pattern: /^(\d+)tg$/i,  toMinutes: (n) => n * 1440 },
    { pattern: /^(\d+)h$/i,   toMinutes: (n) => n * 60 },
  ];

  return matchers.reduce<number | null>((result, { pattern, toMinutes }) => {
    if (result !== null) {
      return result;
    }
    const match = part.match(pattern);
    return match ? toMinutes(parseInt(match[1], 10)) : null;
  }, null);
};
