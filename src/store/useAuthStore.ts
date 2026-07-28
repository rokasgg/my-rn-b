import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      isInitialized: true,
    });
  },

  signUp: async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null };
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  },
}));
