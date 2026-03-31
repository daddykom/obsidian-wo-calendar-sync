import { beforeAWeek, getIsoWeek1Monday, inAWeek } from '../../utils/util';
import { prepareData } from './prepare-data';

jest.mock('../../utils/util', () => ({
  getIsoWeek1Monday: jest.fn(),
  inAWeek: jest.fn(),
  beforeAWeek: jest.fn(),
}));

describe('prepareData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate sequential weeks between year boundaries', () => {
    const d1 = new Date('2026-01-05');
    const d2 = new Date('2026-01-12');
    const d3 = new Date('2026-01-19');
    const end = new Date('2026-01-26');

    (getIsoWeek1Monday as jest.Mock)
      .mockReturnValueOnce(d1) // year start
      .mockReturnValueOnce(end); // next year start

    (inAWeek as jest.Mock).mockImplementation((date: Date) => {
      if (date === d1) return d2;
      if (date === d2) return d3;
      if (date === d3) return end;
      return end;
    });

    (beforeAWeek as jest.Mock).mockImplementation((date: Date) => {
      if (date === d1) return new Date('2025-12-29');
      if (date === d2) return d1;
      if (date === d3) return d2;
      return undefined;
    });

    const result = prepareData(2026);

    expect(getIsoWeek1Monday).toHaveBeenCalledWith(2026);
    expect(getIsoWeek1Monday).toHaveBeenCalledWith(2027);

    expect(result).toEqual([
      {
        monday: d1,
        lastMonday: new Date('2025-12-29'),
        nextMonday: d2,
        week: 1,
        yyyy: 2026,
      },
      {
        monday: d2,
        lastMonday: d1,
        nextMonday: d3,
        week: 2,
        yyyy: 2026,
      },
      {
        monday: d3,
        lastMonday: d2,
        nextMonday: end,
        week: 3,
        yyyy: 2026,
      },
    ]);
  });

  it('should return empty array if no weeks exist (edge case)', () => {
    const d = new Date('2026-01-05');

    (getIsoWeek1Monday as jest.Mock).mockReturnValueOnce(d).mockReturnValueOnce(d);

    const result = prepareData(2026);

    expect(result).toEqual([]);
  });
});
