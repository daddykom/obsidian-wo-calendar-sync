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

// Obsidian's native transport avoids CORS on desktop and mobile. This stage is read-only.
export const caldavReadFetch: typeof fetch = async (input, init) => {
  const request = input instanceof Request ? input : undefined;
  const url = validateServerUrl(request?.url ?? String(input));
  const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS', 'PROPFIND', 'REPORT'].includes(method)) {
    throw new Error('Schreibzugriffe sind bei der Kalenderauswahl nicht erlaubt.');
  }
  const headers = new Headers(init?.headers ?? request?.headers);
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
};
