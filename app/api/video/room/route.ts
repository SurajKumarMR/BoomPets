import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { videoRoomSchema } from '@/lib/validation/schemas';
import { parseJsonBody } from '@/lib/validation/parse-body';

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.video, 'video-room');
  if (rateLimited) return rateLimited;

  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const dailyApiKey = process.env.DAILY_API_KEY;
    if (!dailyApiKey) {
      return NextResponse.json(
        { error: 'Video service not configured' },
        { status: 503 }
      );
    }

    const parsed = await parseJsonBody(request, videoRoomSchema);
    if ('error' in parsed) return parsed.error;

    const { consultationId } = parsed.data;

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: `consultation-${consultationId}`,
        privacy: 'private',
        properties: {
          enable_chat: true,
          enable_screenshare: false,
          enable_recording: 'cloud',
          max_participants: 2,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create video room' },
        { status: 502 }
      );
    }

    const room = await response.json();

    return NextResponse.json({
      roomUrl: room.url,
      roomName: room.name,
    });
  } catch (error) {
    console.error('Video room creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create video room' },
      { status: 500 }
    );
  }
}
