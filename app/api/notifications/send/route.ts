import { NextRequest, NextResponse } from 'next/server';

// OneSignal push notifications
export async function POST(request: NextRequest) {
  try {
    const { userId, heading, content, data } = await request.json();

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: [userId],
        headings: { en: heading },
        contents: { en: content },
        data
      })
    });

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
