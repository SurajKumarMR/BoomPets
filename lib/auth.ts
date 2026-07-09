import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'pet_owner' | 'nutritionist' | 'vet';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'pet_owner' || value === 'nutritionist' || value === 'vet';
}

function createSupabaseFromRequest(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Session refresh is handled by middleware.
      },
    },
  });
}

function mapUser(user: User): AuthenticatedUser {
  const role = user.user_metadata?.role;
  return {
    id: user.id,
    email: user.email ?? '',
    role: isUserRole(role) ? role : 'pet_owner',
  };
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const supabase = createSupabaseFromRequest(request);
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return mapUser(user);
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthenticatedUser | NextResponse> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: 'Authentication service not configured' },
      { status: 503 }
    );
  }

  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return user;
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthenticatedUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) {
    return result;
  }

  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return result;
}
