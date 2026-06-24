import { NextRequest, NextResponse } from 'next/server';

// Daily.co video room creation
export async function POST(request: NextRequest) {
  try {
    const { consultationId } = await request.json();
    const dailyApiKey = process.env.DAILY_API_KEY;

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`
      },
      body: JSON.stringify({
        name: `consultation-${consultationId}`,
        privacy: 'private',
        properties: {
          enable_chat: true,
          enable_screenshare: false,
          enable_recording: 'cloud',
          max_participants: 2,
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
        }
      })
    });

    const room = await response.json();

    return NextResponse.json({ 
      roomUrl: room.url,
      roomName: room.name 
    });
  } catch (error) {
    console.error('Video room creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create video room' },
      { status: 500 }
    );
  }
}
