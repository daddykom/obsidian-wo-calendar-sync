# Recurring Appointments - Implementation Specification

## Overview

This specification describes the implementation of recurring appointments (wiederkehrende Termine) for the week-calendar Obsidian plugin.

---

## 1. Data Structures

### 1.1 Recurrence Types (`src/lib/types.ts`)

```typescript
type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly-date' | 'monthly-weekday' | 'yearly';

interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;           // every N days/weeks/months/years
  byDay?: Weekday[];          // for weekly: [Mo, Di, Do]
  byMonthDay?: number;        // for monthly-date: 1-31
  byWeekday?: { ordinal: number; weekday: Weekday }; // for monthly-weekday: 2nd Monday
  byMonth?: number;          // for yearly: 1-12
  byYearday?: number;         // for yearly: day of year
}

interface RecurrenceEnd {
  type: 'enddate';
  endDate: Date;
}

interface Recurrence {
  rule: RecurrenceRule;
  end: RecurrenceEnd;
  originalEventId: string;     // ^woev-ABC123 of the first/original event
  recurrenceId: string;       // ^woev-rec-DEF456 unique to this recurrence series
}

type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';
```

### 1.2 Event Element Extension

```typescript
interface EventElement {
  type: 'event';
  content: string[];
  eventId: string;            // ^woev-ABC123
  recurrenceId?: string;      // ^woev-rec-DEF456 (only for recurring)
  isException?: boolean;      // true if this was manually modified
  exceptionOfRecurrenceId?: string; // links back to original recurrence
}
```

---

## 2. Parsing Recurrence Fields

### 2.1 Regex Patterns (`src/lib/settings/constants.ts`)

```typescript
const RECURRENCE_PATTERNS = {
  // Field: Wiederholung: wöchentlich, Di, Do
  field: /^Wiederholung:\s*(.+)$/i,

  // Field: WiederholungEnde: 31.12.2026
  endField: /^WiederholungEnde:\s*(.+)$/i,

  // Recurrence ID: ^woev-rec-ABC123
  recurrenceId: /\^woev-rec-([a-z0-9]+)/,

  // Shortcuts (normalized during parsing)
  shortcutMap: {
    'täglich': 'daily',
    'taeglich': 'daily',
    'wöchentlich': 'weekly',
    'woechentlich': 'weekly',
    'wöchentl': 'weekly',
    'monatlich': 'monthly-date',
    'mntl': 'monthly-date',
    'j2. mo': 'monthly-weekday,2,mo',
    'jeden 2. montag': 'monthly-weekday,2,mo',
    'j2.mo': 'monthly-weekday,2,mo',
    'j2 mo': 'monthly-weekday,2,mo',
    'j2.di': 'monthly-weekday,2,di',
    'j2. di': 'monthly-weekday,2,di',
    'jährlich': 'yearly',
    'jaehrlich': 'yearly',
    'jaehrl': 'yearly',
  }
};
```

### 2.2 Parsing Logic

**Function:** `parseRecurrence(content: string[]): Recurrence | null`

1. Find `Wiederholung:` line
2. Normalize shortcut words
3. Parse frequency and parameters
4. Parse `WiederholungEnde:` for end date
5. Extract/create recurrence ID
6. Return Recurrence object or null if incomplete

---

## 3. Calculating Occurrences

### 3.1 Core Function

**Function:** `calculateNextOccurrence(from: Date, rule: RecurrenceRule): Date`

```
Input:  A date and a recurrence rule
Output: The next occurrence date after `from`
Logic:
  - daily:     from + interval days
  - weekly:     next matching weekday, + interval weeks if needed
  - monthly-date: next matching day-of-month
  - monthly-weekday: next matching ordinal weekday (e.g., 2nd Monday)
  - yearly:    next matching month+day, + interval years if needed
```

### 3.2 Generate Occurrences

**Function:** `generateOccurrences(startDate: Date, endDate: Date, recurrence: Recurrence): Date[]`

```
1. current = first occurrence date (from original event)
2. while current <= endDate AND current <= recurrence.end.endDate:
   a. if current >= startDate: add to results
   b. current = calculateNextOccurrence(current, rule)
3. return results
```

---

## 4. File Operations

### 4.1 Week File Discovery

**Function:** `findWeekFilesForRange(startWeek: number, startYear: number, endWeek: number, endYear: number): WoFileTitleStructure[]`

```
1. Iterate week by week from start to end
2. Check if file exists (W{weekNo} {dd.MM.yy}.md)
3. Return array of file titles that exist
```

### 4.2 Insert Recurring Event into Week File

**Function:** `insertRecurringEventIntoFile(fileTitle: WoFileTitleStructure, event: EventElement, date: Date): Promise<void>`

```
1. Read existing file
2. Find correct weekday section
3. Insert event after existing content
4. Preserve original event's Wiederholung and WiederholungEnde fields
5. Set recurrenceId on the inserted event
6. Write back with proper formatting
```

### 4.3 Remove Recurring Events from Week File

**Function:** `removeRecurringEventsFromFile(fileTitle: WoFileTitleStructure, recurrenceId: string): Promise<void>`

```
1. Read file
2. Parse elements
3. Remove all elements with matching recurrenceId (except original)
4. Write back
```

---

## 5. Modification Handling

### 5.1 Detecting Recurrence Changes

**Function:** `handleRecurrenceModification(originalEvent: EventElement, newContent: string[]): ModificationResult`

**ModificationResult:**
```typescript
interface ModificationResult {
  action: 'update_original' | 'ask_exception' | 'update_all';
  affectedOccurrences: { file: WoFileTitleStructure; isException: boolean }[];
}
```

### 5.2 Exception Detection

**Function:** `checkIfIsException(eventContent: string[], recurrence: Recurrence, expectedDate: Date): boolean`

```
1. Parse the event content
2. Compare key fields (title, time, location) with recurrence
3. If any field differs: return true (is an exception)
4. If identical: return false
```

### 5.3 Update All Logic

**When user chooses "Update all":**

```
1. Find all future occurrences that are NOT exceptions
2. For each: update content to match new original
3. For exceptions: prompt "This occurrence was modified. Update anyway? Skip? Make this the new original?"
4. Apply user's choice
```

---

## 6. Deletion Handling

### 6.1 Delete Dialog Options

When deleting a recurring event:
- **Option A:** "Delete all" - removes ALL occurrences including past
- **Option B:** "Set end date" - prompts for date, removes all AFTER that date
- **Option C:** Cancel

### 6.2 Implementation

**Function:** `deleteRecurringEvent(recurrenceId: string, deleteOption: 'all' | 'enddate', endDate?: Date): Promise<void>`

```
1. Find all files containing events with this recurrenceId
2. Filter by date based on deleteOption:
   - 'all': all files
   - 'enddate': files with dates > endDate
3. For each file: remove matching events
4. For 'all': optionally keep one "ghost" entry with end date info
```

---

## 7. Year Creation Integration

### 7.1 Copy Recurring Events

**Function:** `copyRecurringEventsFromYear(sourceYear: number, targetYear: number): Promise<void>`

```
1. Scan all week files of sourceYear
2. For each recurring event found:
   a. Parse recurrence rule
   b. Calculate which occurrences fall in targetYear
   c. For each occurrence in targetYear:
      - Find/create target week file
      - Insert event (marking as recurring, same recurrenceId)
3. Log summary: X events copied to Y occurrences
```

---

## 8. File Format Examples

### 8.1 Original Recurring Event

```markdown
# Dienstag

- Termin: Team Meeting
  Zeit: 09:00 - 10:00
  Ort: Büro
  Wiederholung: wöchentlich, Di
  WiederholungEnde: 31.12.2026
  ^woev-ABC123
  ^woev-rec-DEF456
```

### 8.2 Exception (Modified Occurrence)

```markdown
# Dienstag

- Termin: Team Meeting (AUSNAME)
  Zeit: 10:00 - 11:00
  Ort: Home Office
  Wiederholung: wöchentlich, Di
  WiederholungEnde: 31.12.2026
  ^woev-GHI789
  ^woev-rec-DEF456
  AusnahmeVon: ^woev-ABC123
```

### 8.3 Auto-Inserted Occurrence

```markdown
# Dienstag

- Termin: Team Meeting
  Zeit: 09:00 - 10:00
  Ort: Büro
  Wiederholung: wöchentlich, Di
  WiederholungEnde: 31.12.2026
  ^woev-JKL012
  ^woev-rec-DEF456
```

---

## 9. Implementation Phases

### Phase 1: Types & Structures
- [x] 1.1 Add recurrence types to types.ts
- [x] 1.2 Add recurrence patterns to constants.ts
- [x] 1.3 Extend EventElement type with recurrence fields

### Phase 2: Parsing & Stringify
- [x] 2.1 Implement `parseRecurrence()` function
- [x] 2.2 Implement `stringifyRecurrence()` function
- [x] 2.3 Update parse-wo.ts to extract recurrence
- [x] 2.4 Update stringify-wo.ts to output recurrence fields

### Phase 3: Occurrence Calculation
- [x] 3.1 Implement `calculateNextOccurrence()`
- [x] 3.2 Implement `generateOccurrences()`
- [x] 3.3 Implement `checkIfIsException()`
- [x] 3.4 Write unit tests for occurrence calculation

### Phase 4: File Operations
- [x] 4.1 Implement `findWeekFilesForRange()`
- [x] 4.2 Implement `insertRecurringEventIntoFile()`
- [x] 4.3 Implement `removeRecurringEventsFromFile()`

### Phase 5: Modification Handling
- [x] 5.1 Implement `handleRecurrenceModification()`
- [ ] 5.2 Add "Update all" command (integrated into deletion-handling.ts)
- [ ] 5.3 Add exception prompt UI (basic implementation)

### Phase 6: Deletion Handling
- [x] 6.1 Implement `deleteRecurringEvent()`
- [ ] 6.2 Add delete dialog with options (basic implementation)
- [x] 6.3 Handle "Set end date" flow

### Phase 7: Year Creation Integration
- [x] 7.1 Implement `copyRecurringEventsFromYear()`
- [ ] 7.2 Integrate into year creation flow

### Phase 8: Testing & Polish
- [x] 8.1 Write integration tests (145 tests passing)
- [ ] 8.2 Manual testing
- [x] 8.3 Documentation (this file)

---

## 10. Implementation Status

**Implemented Files:**
- `src/lib/recurrence/parse-recurrence.ts` - Parse recurrence fields from content
- `src/lib/recurrence/stringify-recurrence.ts` - Convert recurrence to content lines
- `src/lib/recurrence/occurrence-calculation.ts` - Calculate next occurrences, generate all
- `src/lib/recurrence/file-operations.ts` - Week file CRUD operations
- `src/lib/recurrence/modification-handling.ts` - Handle modification of recurring events
- `src/lib/recurrence/deletion-handling.ts` - Delete recurring events with options
- `src/lib/recurrence/year-integration.ts` - Copy recurring events between years

**Type Changes:**
- `src/lib/types.ts` - Added `Weekday`, `RecurrenceFrequency`, `RecurrenceRule`, `Recurrence`, `RecurrenceEnd`, extended `EventElement`
- `src/lib/settings/constants.ts` - Added `RECURRENCE_PATTERNS`, weekday/frequency maps
- `src/lib/parseWeekFile/parse-wo.ts` - Extract eventId, recurrenceId, isException

| Input | Normalized |
|-------|------------|
| täglich, taeglich | daily |
| wöchentlich, wochentlich, wöchentl | weekly |
| monatlich, mntl | monthly-date |
| monatlich 15, mntl. 15 | monthly-date, byMonthDay: 15 |
| j2. mo, jeden 2. montag | monthly-weekday, ordinal: 2, weekday: mo |
| j2. di | monthly-weekday, ordinal: 2, weekday: di |
| jährlich, jaehrlich | yearly |

### Day Abbreviations
| Input | Normalized |
|-------|------------|
| mo, montag, montag | Mo |
| di, dienstag | Di |
| mi, mittwoch | Mi |
| do, donnerstag | Do |
| fr, freitag | Fr |
| sa, samstag | Sa |
| so, sonntag | So |
