import { WeekcalendarSettings } from '../types';
import { formatDayHeading } from '../utils/format-day-heading';
import { getLineType } from './parse-wo';

export function migrateWeekHeadings(
  content: string,
  filePath: string,
  settings: WeekcalendarSettings,
): string {
  const prefix = `${settings.paths.weekFolder}/`;
  if (!filePath.startsWith(prefix)) return content;

  const match = filePath
    .slice(prefix.length)
    .match(/^\d{4}\/weeks\/W(0[1-9]|[1-4]\d|5[0-3]) (\d{2})\.(\d{2})\.(\d{2})\.md$/);
  if (!match) return content;

  const [, , day, month, year] = match;
  const monday = new Date(2000 + Number(year), Number(month) - 1, Number(day));
  if (
    monday.getFullYear() !== 2000 + Number(year) ||
    monday.getMonth() !== Number(month) - 1 ||
    monday.getDate() !== Number(day) ||
    monday.getDay() !== 1
  ) {
    return content;
  }

  let frontmatter = false;
  let fence: string | null = null;

  return content
    .split('\n')
    .map((line, index) => {
      const text = line.endsWith('\r') ? line.slice(0, -1) : line;
      if (index === 0 && /^\uFEFF?---$/.test(text)) {
        frontmatter = true;
        return line;
      }
      if (frontmatter) {
        if (/^(---|\.\.\.)$/.test(text)) frontmatter = false;
        return line;
      }

      if (fence) {
        const closing = text.match(/^ {0,3}(`+|~+)\s*$/)?.[1];
        if (closing && closing[0] === fence[0] && closing.length >= fence.length) fence = null;
        return line;
      }
      const opening = text.match(/^ {0,3}(`{3,}|~{3,})/);
      if (opening) {
        fence = opening[1];
        return line;
      }

      const [type, key] = getLineType(text, settings);
      if (type !== 'key' || key === null || key === 'start' || key === 'links') return line;

      return formatDayHeading(monday, key, settings.weekdays[key]) + (line.endsWith('\r') ? '\r' : '');
    })
    .join('\n');
}
