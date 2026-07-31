import type { Session, User } from '@supabase/supabase-js';

import { sessionQueryKey } from '@/hooks/useSession';
import { queryClient } from '@/lib/queryClient';

const DEV_USER: User = {
  id: 'dev-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'dev@example.com',
  app_metadata: {},
  user_metadata: { name: 'Dev User' },
  created_at: new Date().toISOString(),
} as User;

const DEV_SESSION: Session = {
  access_token: 'dev-access-token',
  refresh_token: 'dev-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: DEV_USER,
} as Session;

/**
 * Bypasses Supabase entirely and signs in with a fake local session, so the
 * rest of the app is reachable without a working backend. Dev-only escape
 * hatch — any screen that actually calls Supabase (reset password, profile
 * update, sign out) will still fail against a real/placeholder project.
 */
export function skipAuthForDev() {
  queryClient.setQueryData(sessionQueryKey, DEV_SESSION);
}
