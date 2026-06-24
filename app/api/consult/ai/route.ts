import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    if (!anthropic) {
      return NextResponse.json(
        { error: 'Anthropic API not configured' },
        { status: 503 }
      );
    }

    const { message, petInfo, conversationHistory } = await request.json();

    const systemPrompt = `You are a certified pet nutritionist and veterinary assistant. 
You provide helpful, accurate advice about pet health, nutrition, and wellness.
Pet Information: ${JSON.stringify(petInfo)}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message }
      ]
    });

    return NextResponse.json({ 
      response: response.content[0].type === 'text' ? response.content[0].text : ''
    });
  } catch (error) {
    console.error('AI consultation error:', error);
    return NextResponse.json(
      { error: 'Failed to process consultation' },
      { status: 500 }
    );
  }
}
