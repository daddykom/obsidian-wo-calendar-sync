export const woFileStructKey = [
  'start',
  'montag',
  'dienstag',
  'mittwoch',
  'donnerstag',
  'freitag',
  'samstag',
  'sonntag',
] as const;

export type WoFileStructKey = (typeof woFileStructKey)[number];

export interface Event {
  type: 'event';
  event: string;
  time: [from: number, to: number];
  reminder: string[];
  comment: string;
  location: string;
  id: string;
}

export interface Text {
  type: 'text';
  text: string[];
}

export type WoFileEntry = Event | Text;
export type WoFileStruct = Record<WoFileStructKey, WoFileEntry[]>;

interface EventDraft {
  event: string;
  time: [from: number, to: number];
  reminder: string[];
  comment: string;
  location: string;
}

interface ParseState {
  result: WoFileStruct;
  currentDay: WoFileStructKey;
  currentEvent: EventDraft | null;
}

interface LinePattern {
  regex: RegExp;
  handle: (state: ParseState, match: RegExpMatchArray) => ParseState;
}

/* =========================
   export API
   ========================= */

export const parseWoFile = (content: string): WoFileStruct => {
  const finalState = content.split('\n').reduce((state, line) => {
    return applyPattern(state, line);
  }, createInitialState());

  return finalizeCurrentEvent(finalState).result;
};

/* =========================
   main functions
   ========================= */

const applyPattern = (state: ParseState, rawLine: string): ParseState => {
  const line = rawLine.trim();

  if (line.length === 0) {
    return state;
  }

  const matchedPattern = linePatterns.find((pattern) => {
    return pattern.regex.test(line);
  });

  if (!matchedPattern) {
    return appendText(state, line);
  }

  const match = line.match(matchedPattern.regex);

  if (!match) {
    return appendText(state, line);
  }

  return matchedPattern.handle(state, match);
};

const createInitialState = (): ParseState => {
  return {
    result: createEmptyWoFileStruct(),
    currentDay: 'start',
    currentEvent: null,
  };
};

const linePatterns: readonly LinePattern[] = [
  {
    regex: /^#\s+(.+)$/,
    handle: (state, match) => {
      return changeDay(state, match[1]);
    },
  },
  {
    regex: /^-\s+Termin:\s*(.+)$/,
    handle: (state, match) => {
      return startEvent(state, match[1]);
    },
  },
  {
    regex: /^Zeit:\s*(.+)$/,
    handle: (state, match) => {
      return updateCurrentEvent(state, (draft) => {
        return {
          ...draft,
          time: parseTime(match[1]),
        };
      });
    },
  },
  {
    regex: /^Erinnerung:\s*(.+)$/,
    handle: (state, match) => {
      return updateCurrentEvent(state, (draft) => {
        return {
          ...draft,
          reminder: parseReminder(match[1]),
        };
      });
    },
  },
  {
    regex: /^Bemerkung:\s*(.+)$/,
    handle: (state, match) => {
      return updateCurrentEvent(state, (draft) => {
        return {
          ...draft,
          comment: match[1].trim(),
        };
      });
    },
  },
  {
    regex: /^Ort:\s*(.+)$/,
    handle: (state, match) => {
      return updateCurrentEvent(state, (draft) => {
        return {
          ...draft,
          location: match[1].trim(),
        };
      });
    },
  },
];

/* =========================
   domain helpers
   ========================= */

const createEmptyWoFileStruct = (): WoFileStruct => {
  return Object.fromEntries(
    woFileStructKey.map((key) => [key, [] as WoFileEntry[]]),
  ) as unknown as WoFileStruct;
};

const finalizeCurrentEvent = (state: ParseState): ParseState => {
  if (state.currentEvent === null) {
    return state;
  }

  const event: Event = {
    type: 'event',
    event: state.currentEvent.event,
    time: state.currentEvent.time,
    reminder: state.currentEvent.reminder,
    comment: state.currentEvent.comment,
    location: state.currentEvent.location,
    id: buildEventId(state.currentDay, state.currentEvent),
  };

  return {
    ...state,
    result: {
      ...state.result,
      [state.currentDay]: [...state.result[state.currentDay], event],
    },
    currentEvent: null,
  };
};

const appendText = (state: ParseState, value: string): ParseState => {
  const text = value.trim();

  if (text.length === 0) {
    return state;
  }

  const finalizedState = finalizeCurrentEvent(state);
  const entries = finalizedState.result[finalizedState.currentDay];
  const lastEntry = entries.at(-1);

  if (lastEntry?.type === 'text') {
    const updatedLastEntry: Text = {
      ...lastEntry,
      text: [...lastEntry.text, text],
    };

    return {
      ...finalizedState,
      result: {
        ...finalizedState.result,
        [finalizedState.currentDay]: [...entries.slice(0, -1), updatedLastEntry],
      },
    };
  }

  return {
    ...finalizedState,
    result: {
      ...finalizedState.result,
      [finalizedState.currentDay]: [
        ...entries,
        {
          type: 'text',
          text: [text],
        },
      ],
    },
  };
};

const startEvent = (state: ParseState, title: string): ParseState => {
  const finalizedState = finalizeCurrentEvent(state);

  return {
    ...finalizedState,
    currentEvent: {
      event: title.trim(),
      time: [0, 0],
      reminder: [],
      comment: '',
      location: '',
    },
  };
};

const changeDay = (state: ParseState, value: string): ParseState => {
  const day = normalizeDay(value);

  if (day === null) {
    return appendText(state, `# ${value}`);
  }

  const finalizedState = finalizeCurrentEvent(state);

  return {
    ...finalizedState,
    currentDay: day,
  };
};

const updateCurrentEvent = (
  state: ParseState,
  updater: (draft: EventDraft) => EventDraft,
): ParseState => {
  if (state.currentEvent === null) {
    return state;
  }

  return {
    ...state,
    currentEvent: updater(state.currentEvent),
  };
};

const buildEventId = (day: WoFileStructKey, event: EventDraft): string => {
  return `${day}|${event.time[0]}|${event.time[1]}|${event.event}`;
};

/* =========================
   low-level helpers
   ========================= */

const normalizeDay = (value: string): WoFileStructKey | null => {
  const normalized = value.trim().toLowerCase();

  if (woFileStructKey.includes(normalized as WoFileStructKey)) {
    return normalized as WoFileStructKey;
  }

  return null;
};

const parseReminder = (value: string): string[] => {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

const parseTime = (value: string): [from: number, to: number] => {
  const trimmed = value.trim();

  if (trimmed.includes('-')) {
    const [fromRaw, toRaw] = trimmed.split('-').map((part) => part.trim());

    return [toMinutes(fromRaw), toMinutes(toRaw)];
  }

  const minutes = toMinutes(trimmed);

  return [minutes, minutes];
};

const toMinutes = (value: string): number => {
  const [hoursRaw, minutesRaw] = value.trim().split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
};
