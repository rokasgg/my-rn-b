import type { Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

export const sessionQueryKey = ['session'] as const;

async function fetchSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Ensures only one supabase.auth.onAuthStateChange subscription exists no
// matter how many components call useSession() at once — every caller pushes
// into the same query cache entry, so N listeners would just mean N redundant
// setQueryData calls per auth event.
let listenerRefCount = 0;
let unsubscribe: (() => void) | null = null;

function subscribeAuthListener(onChange: (session: Session | null) => void) {
  listenerRefCount += 1;

  if (!unsubscribe) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      onChange(session);
    });
    unsubscribe = () => data.subscription.unsubscribe();
  }

  return () => {
    listenerRefCount -= 1;
    if (listenerRefCount === 0 && unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
}

export function useSession() {
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    // The cache is only ever updated by the onAuthStateChange push below, so
    // it should never be considered stale/refetched in the background —
    // that would race the listener and could momentarily show a stale user.
    staleTime: Infinity,
  });

  useEffect(() => {
    return subscribeAuthListener((newSession) => {
      queryClient.setQueryData(sessionQueryKey, newSession);
    });
  }, [queryClient]);

  return {
    session: session ?? null,
    user: session?.user ?? null,
    isLoading,
  };
}
