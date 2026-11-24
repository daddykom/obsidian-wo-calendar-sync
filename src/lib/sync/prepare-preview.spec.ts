import { preparePreview } from './prepare-preview';
import { collectEvents } from './collect-events';
import { readCalendar } from '../caldav/read-calendar';
import { mergeSettings } from '../settings/load-settings';
import { parseWeekEvents } from './parse-week-events';

jest.mock('./collect-events', () => ({ collectEvents: jest.fn() }));
jest.mock('../caldav/read-calendar', () => ({ readCalendar: jest.fn() }));

const settings = mergeSettings({ caldav: { calendar: 'https://example.com/calendar/', managedCalendarConfirmed: true } });
const event = parseWeekEvents('# Montag (23)\n- Termin: Treffen\n  Zeit: 09:00\n  ^woev-abc',
  'week-calendar/2026/weeks/W48 23.11.26.md', settings).events[0];
const vault = { getMarkdownFiles: jest.fn(), read: jest.fn() };

describe('preparePreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (collectEvents as jest.Mock).mockResolvedValue({ ok: true, scannedFiles: 1, events: [event] });
    (readCalendar as jest.Mock).mockResolvedValue([]);
  });

  it('returns a read-only plan with collection statistics', async () => {
    const result = await preparePreview(vault, settings);
    expect(result).toMatchObject({ ok: true, scannedFiles: 1, localCount: 1, remoteCount: 0, plan: { create: [event] } });
  });

  it('requires explicit calendar consent before accessing the network', async () => {
    const result = await preparePreview(vault, { ...settings, caldav: { ...settings.caldav, managedCalendarConfirmed: false } });
    expect(result.ok).toBe(false);
    expect(readCalendar).not.toHaveBeenCalled();
  });

  it('does not contact the server or expose a plan if local validation fails', async () => {
    (collectEvents as jest.Mock).mockResolvedValue({ ok: false, errors: [{ path: 'week.md', line: 4, message: 'ID fehlt' }] });
    expect(await preparePreview(vault, settings)).toMatchObject({ ok: false, errors: [{ path: 'week.md', line: 4 }] });
    expect(readCalendar).not.toHaveBeenCalled();
  });

  it('validates local timezone transitions before contacting the server', async () => {
    (collectEvents as jest.Mock).mockResolvedValue({ ok: true, scannedFiles: 1, events: [{ ...event, start: '2026-03-29T02:30:00' }] });
    expect((await preparePreview(vault, settings)).ok).toBe(false);
    expect(readCalendar).not.toHaveBeenCalled();
  });

  it('returns errors without a plan on remote failures', async () => {
    (readCalendar as jest.Mock).mockRejectedValue(new Error('Unvollständige Kalenderabfrage'));
    const result = await preparePreview(vault, settings);
    expect(result.ok).toBe(false);
    expect(result).not.toHaveProperty('plan');
  });
});
