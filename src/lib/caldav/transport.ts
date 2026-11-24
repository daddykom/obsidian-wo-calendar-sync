import { requestUrl } from 'obsidian';

export class CaldavHttpError extends Error {
  constructor(public readonly status: number) {
    super(`CalDAV HTTP ${status}`);
  }
}

export function validateServerUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Bitte eine gültige HTTPS-Server-URL eingeben.');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) {
    throw new Error('CalDAV benötigt eine HTTPS-URL ohne eingebettete Zugangsdaten oder Fragment.');
  }
  return url.href;
}

async function nativeFetch(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  authorize: (url: string, method: string, headers: Headers) => void,
): Promise<Response> {
  const request = input instanceof Request ? input : undefined;
  const url = validateServerUrl(request?.url ?? String(input));
  const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
  const headers = new Headers(init?.headers ?? request?.headers);
  authorize(url, method, headers);
  const requestHeaders: Record<string, string> = {};
  headers.forEach((value, key) => { requestHeaders[key] = value; });
  const body = init?.body ?? (request ? await request.text() : undefined);
  if (body !== undefined && body !== null && typeof body !== 'string') {
    throw new Error('Nicht unterstützter CalDAV-Anfrageinhalt.');
  }
  const result = await requestUrl({
    url, method, headers: requestHeaders,
    body: body ?? undefined, throw: false,
  }).catch(() => {
    throw new Error('CalDAV-Netzwerkanfrage fehlgeschlagen.');
  });
  // Keep status codes available to the connection layer, never include response bodies in errors.
  if (result.status >= 400) throw new CaldavHttpError(result.status);
  const response = new Response([204, 205, 304].includes(result.status) || method === 'HEAD' ? null : result.text, {
    status: result.status,
    headers: result.headers,
  });
  Object.defineProperty(response, 'url', { value: url });
  return response;
}

// Discovery and preview can never acquire write access through this transport.
export const caldavReadFetch: typeof fetch = (input, init) => nativeFetch(input, init, (_url, method) => {
  if (!['GET', 'HEAD', 'OPTIONS', 'PROPFIND', 'REPORT'].includes(method)) {
    throw new Error('Schreibzugriffe sind im Lesemodus nicht erlaubt.');
  }
});

export function assertCalendarResource(url: string, calendarUrl: string): void {
  const resource = new URL(validateServerUrl(url));
  const calendar = new URL(validateServerUrl(calendarUrl));
  if (resource.origin !== calendar.origin || resource.pathname.endsWith('/') ||
      !resource.pathname.startsWith(calendar.pathname.replace(/\/$/, '') + '/')) {
    throw new Error('Ressource liegt ausserhalb des ausgewählten Kalenders.');
  }
}

export function assertStrongEtag(etag: string): void {
  if (!/^"[\x21\x23-\x7e\x80-\xff]*"$/.test(etag)) throw new Error('Für sichere Änderungen ist ein starker ETag erforderlich.');
}

export function createCalendarWriteFetch(calendarUrl: string): typeof fetch {
  validateServerUrl(calendarUrl);
  return (input, init) => nativeFetch(input, init, (url, method, headers) => {
    assertCalendarResource(url, calendarUrl);
    const match = headers.get('if-match');
    const noneMatch = headers.get('if-none-match');
    if (method === 'PUT' && noneMatch === '*' && !match) return;
    if ((method === 'PUT' || method === 'DELETE') && match && !noneMatch) {
      assertStrongEtag(match);
      return;
    }
    throw new Error('Schreibzugriff ohne eindeutige Methode oder Konfliktschutz verweigert.');
  });
}
