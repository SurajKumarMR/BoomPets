import { NextResponse } from 'next/server';
import { z } from 'zod';

const MAX_JSON_BODY_BYTES = 64 * 1024;

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ data: T } | { error: NextResponse }> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_JSON_BODY_BYTES) {
    return {
      error: NextResponse.json({ error: 'Request body too large' }, { status: 413 }),
    };
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      error: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}
