export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const json = (body: unknown, status = 200, headers: Record<string,string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store', ...headers } });

export async function bodyOf(request: Request) {
  const origin = request.headers.get('origin');
  // In Azure, the public HTTPS origin can differ from the internal HTTP URL.
  const host = request.headers.get('host') || new URL(request.url).host;
  let parsedOrigin: URL | undefined;
  try { if (origin) parsedOrigin = new URL(origin); } catch { /* Rejected below. */ }
  if (!parsedOrigin || !['https:', 'http:'].includes(parsedOrigin.protocol) || parsedOrigin.host !== host)
    throw new HttpError(403, 'Solicitud no permitida.');
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new HttpError(415, 'Esperamos datos JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Faltan datos.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) { await reader.cancel(); throw new HttpError(413, 'Solicitud demasiado grande.'); }
    chunks.push(value);
  }
  try {
    const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error();
    return result;
  } catch { throw new HttpError(400, 'Datos inválidos.'); }
}

export function failure(error: unknown) {
  if (error instanceof HttpError) return json({error: error.message}, error.status);
  // Do not log queries, request bodies or connection credentials.
  console.error('Appbass API failure', { code: (error as {code?:string})?.code });
  return json({error: 'No pudimos guardar los cambios. Intentá nuevamente.'}, 503);
}
