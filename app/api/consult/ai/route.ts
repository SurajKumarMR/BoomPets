import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { anthropic } from '@/lib/anthropic';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { aiConsultationSchema } from '@/lib/validation/schemas';
import { parseJsonBody } from '@/lib/validation/parse-body';
import { 
  apiResponse, 
  apiError, 
  requireMethod, 
  getClientIp,
  logSecurityEvent 
} from '@/lib/security/api-middleware';
import { sanitizeUserText, containsMaliciousPatterns } from '@/lib/security/sanitize';

export async function POST(request: NextRequest) {
  // Validate HTTP method
  const methodError = requireMethod(request, ['POST']);
  if (methodError) return methodError;

  // Rate limiting
  const rateLimited = checkRateLimit(request, RATE_LIMITS.ai, 'consult-ai');
  if (rateLimited) return rateLimited;

  // Authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  try {
    if (!anthropic) {
      logSecurityEvent('ai_service_unavailable', 'warning', {
        userId: user.id,
        ip: getClientIp(request),
      });
      return apiError('Anthropic API not configured', 503);
    }

    const parsed = await parseJsonBody(request, aiConsultationSchema);
    if ('error' in parsed) return parsed.error;

    const { message, petInfo, conversationHistory } = parsed.data;

    // Sanitize user input
    const cleanMessage = sanitizeUserText(message, 5000);
    
    // Check for malicious patterns
    if (containsMaliciousPatterns(cleanMessage)) {
      logSecurityEvent('malicious_input_detected', 'error', {
        userId: user.id,
        ip: getClientIp(request),
        pattern: 'ai_consultation',
      });
      return apiError('Invalid input detected', 400);
    }

    const systemPrompt = `You are a certified pet nutritionist and veterinary assistant.
You provide helpful, accurate advice about pet health, nutrition, and wellness.
Always recommend consulting a licensed veterinarian for serious medical concerns.
Pet Information: ${JSON.stringify(petInfo ?? {})}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [...conversationHistory, { role: 'user', content: cleanMessage }],
    });

    // Log successful consultation
    logSecurityEvent('ai_consultation_success', 'info', {
      userId: user.id,
      messageLength: cleanMessage.length,
    });

    return apiResponse({
      response:
        response.content[0].type === 'text' ? response.content[0].text : '',
    });
  } catch (error) {
    console.error('AI consultation error:', error);
    logSecurityEvent('ai_consultation_error', 'error', {
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError('Failed to process consultation', 500);
  }
}
