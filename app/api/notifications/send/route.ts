import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { notificationSchema } from '@/lib/validation/schemas';
import { parseJsonBody } from '@/lib/validation/parse-body';

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(
    request,
    RATE_LIMITS.notifications,
    'notifications-send'
  );
  if (rateLimited) return rateLimited;

  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;
    if (!appId || !apiKey) {
      return NextResponse.json(
        { error: 'Notification service not configured' },
        { status: 503 }
      );
    }

    const parsed = await parseJsonBody(request, notificationSchema);
    if ('error' in parsed) return parsed.error;

    const { heading, content, data } = parsed.data;

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        include_external_user_ids: [authResult.id],
        headings: { en: heading },
        contents: { en: content },
        data,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 502 }
      );
    }

    const result = await response.json();

    return NextResponse.json({ success: true, notificationId: result.id });
  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
