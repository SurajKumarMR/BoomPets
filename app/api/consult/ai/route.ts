import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { anthropic } from '@/lib/anthropic';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { aiConsultationSchema } from '@/lib/validation/schemas';
import { parseJsonBody } from '@/lib/validation/parse-body';

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.ai, 'consult-ai');
  if (rateLimited) return rateLimited;

  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (!anthropic) {
      return NextResponse.json(
        { error: 'Anthropic API not configured' },
        { status: 503 }
      );
    }

    const parsed = await parseJsonBody(request, aiConsultationSchema);
    if ('error' in parsed) return parsed.error;

    const { message, petInfo, conversationHistory } = parsed.data;

    const systemPrompt = `You are a certified pet nutritionist and veterinary assistant.
You provide helpful, accurate advice about pet health, nutrition, and wellness.
Always recommend consulting a licensed veterinarian for serious medical concerns.
Pet Information: ${JSON.stringify(petInfo ?? {})}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [...conversationHistory, { role: 'user', content: message }],
    });

    return NextResponse.json({
      response:
        response.content[0].type === 'text' ? response.content[0].text : '',
    });
  } catch (error) {
    console.error('AI consultation error:', error);
    return NextResponse.json(
      { error: 'Failed to process consultation' },
      { status: 500 }
    );
  }
}
