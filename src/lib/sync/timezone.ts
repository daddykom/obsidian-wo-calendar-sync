export function validateTimezone(timezone: string): void {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: timezone });
    if (!timezone.trim()) throw new Error();
  } catch {
    throw new Error('Ungültige Zeitzone. Bitte einen IANA-Namen wie Europe/Zurich verwenden.');
  }
}

export function wallTimeToUtc(value: string, timezone: string): string {
  validateTimezone(timezone);
  const naive = Date.parse(`${value}Z`);
  if (!Number.isFinite(naive) || new Date(naive).toISOString().slice(0, 19) !== value) {
    throw new Error('Ungültiges lokales Datum oder Uhrzeit.');
  }
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const wallTime = (instant: number) => {
    const parts = Object.fromEntries(formatter.formatToParts(instant).map((part) => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
  };
  // Both sides of a possible DST transition: reject missing AND ambiguous wall times.
  const candidates = new Set<number>();
  for (const hours of [-36, 0, 36]) {
    const sample = naive + hours * 3600000;
    const offset = Date.parse(`${wallTime(sample)}Z`) - sample;
    const candidate = naive - offset;
    if (wallTime(candidate) === value) candidates.add(candidate);
  }
  if (candidates.size !== 1) {
    throw new Error(`Uhrzeit ${value} ist wegen einer Zeitumstellung in ${timezone} nicht eindeutig oder existiert nicht.`);
  }
  return new Date([...candidates][0]).toISOString().slice(0, 19) + 'Z';
}
