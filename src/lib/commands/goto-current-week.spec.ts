import { getISOWeek } from 'date-fns/getISOWeek';
import { getISOWeekYear } from 'date-fns/getISOWeekYear';
import { getLastMonday, getWeekFileName } from '../utils/util';
import { gotoCurrentWeek } from './goto-current-week';

jest.mock('../utils/util', () => ({
  getLastMonday: jest.fn(),
  getWeekFileName: jest.fn(),
}));

jest.mock('date-fns/getISOWeek', () => ({
  getISOWeek: jest.fn(),
}));

jest.mock('date-fns/getISOWeekYear', () => ({
  getISOWeekYear: jest.fn(),
}));

describe('gotoCurrentWeek', () => {
  it('should open the correct week file', async () => {
    const monday = new Date('2026-03-16');

    (getLastMonday as jest.Mock).mockReturnValue(monday);
    (getISOWeek as jest.Mock).mockReturnValue(12);
    (getISOWeekYear as jest.Mock).mockReturnValue(2026);
    (getWeekFileName as jest.Mock).mockReturnValue('W12 16.03.26');

    const openLinkText = jest.fn();

    const app = {
      workspace: {
        openLinkText,
      },
    };

    const settings = {
      paths: {
        weekFolder: 'weeks',
      },
    } as unknown as any;

    await gotoCurrentWeek(app, settings)();

    expect(openLinkText).toHaveBeenCalledWith('2026/weeks/W12 16.03.26', '', false);
  });
});
