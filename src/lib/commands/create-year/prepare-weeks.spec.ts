import { prepareElementStructure } from './prepare-element-structure';
import { prepareWeeks } from './prepare-weeks';

jest.mock('./prepare-element-structure', () => ({
  prepareElementStructure: jest.fn(),
}));

describe('prepareWeeks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should prepare week files with previous and next links for matching year', () => {
    (prepareElementStructure as jest.Mock).mockReturnValue({
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
      links: [],
    });

    const settings = {
      paths: {
        weekFolder: 'calendar',
      },
    } as any;

    const weeks = [
      {
        yyyy: 2025,
        week: 52,
        monday: new Date('2025-12-22'),
        lastMonday: new Date('2025-12-15'),
        nextMonday: new Date('2025-12-29'),
      },
      {
        yyyy: 2026,
        week: 1,
        monday: new Date('2025-12-29'),
        lastMonday: new Date('2025-12-22'),
        nextMonday: new Date('2026-01-05'),
      },
      {
        yyyy: 2026,
        week: 2,
        monday: new Date('2026-01-05'),
        lastMonday: new Date('2025-12-29'),
        nextMonday: new Date('2026-01-12'),
      },
      {
        yyyy: 2026,
        week: 3,
        monday: new Date('2026-01-12'),
        lastMonday: new Date('2026-01-05'),
        nextMonday: new Date('2026-01-19'),
      },
      {
        yyyy: 2026,
        week: 4,
        monday: new Date('2026-01-19'),
        lastMonday: new Date('2026-01-12'),
        nextMonday: new Date('2026-01-26'),
      },
      {
        yyyy: 2027,
        week: 1,
        monday: new Date('2026-01-26'),
        lastMonday: new Date('2026-01-19'),
        nextMonday: new Date('2026-02-02'),
      },
    ] as any;

    const result = prepareWeeks(2026, weeks, settings);

    expect(prepareElementStructure).toHaveBeenCalledWith(settings);

    expect(result).toEqual([
      null,
      [
        'W01 29.12.25.md',
        {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
          links: [
            {
              type: 'text',
              content: [
                '[[calendar/2025/weeks/W52 22.12.25.md|W52]] [[calendar/2026/weeks/W02 05.01.26.md|W02]]',
              ],
            },
          ],
        },
      ],
      [
        'W02 05.01.26.md',
        {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
          links: [
            {
              type: 'text',
              content: [
                '[[calendar/2026/weeks/W01 29.12.25.md|W01]] [[calendar/2026/weeks/W03 12.01.26.md|W03]]',
              ],
            },
          ],
        },
      ],
      [
        'W03 12.01.26.md',
        {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
          links: [
            {
              type: 'text',
              content: [
                '[[calendar/2026/weeks/W02 05.01.26.md|W02]] [[calendar/2026/weeks/W04 19.01.26.md|W04]]',
              ],
            },
          ],
        },
      ],
      [
        'W04 19.01.26.md',
        {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
          links: [
            {
              type: 'text',
              content: [
                '[[calendar/2026/weeks/W03 12.01.26.md|W03]] [[calendar/2027/weeks/W01 26.01.26.md|W01]]',
              ],
            },
          ],
        },
      ],
      null,
    ]);
  });

  it('should return only null values when no week matches the requested year', () => {
    (prepareElementStructure as jest.Mock).mockReturnValue({
      links: [],
    });

    const settings = {
      paths: {
        weekFolder: 'calendar',
      },
    } as any;

    const weeks = [
      {
        yyyy: 2025,
        week: 51,
        monday: new Date('2025-12-15'),
        lastMonday: new Date('2025-12-08'),
        nextMonday: new Date('2025-12-22'),
      },
      {
        yyyy: 2025,
        week: 52,
        monday: new Date('2025-12-22'),
        lastMonday: new Date('2025-12-15'),
        nextMonday: new Date('2025-12-29'),
      },
    ] as any;

    const result = prepareWeeks(2026, weeks, settings);

    expect(result).toEqual([null, null]);
  });
});
