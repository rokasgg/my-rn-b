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
  updateProfile: (updates: { name?: string; avatarUrl?: string }) => Promise<{ error: string | null }>;
  uploadAvatar: (localUri: string) => Promise<{ url: string | null; error: string | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

  updateProfile: async ({ name, avatarUrl }) => {
    const data: Record<string, string> = {};
    if (name !== undefined) data.name = name;
    if (avatarUrl !== undefined) data.avatar_url = avatarUrl;

    const { error } = await supabase.auth.updateUser({ data });
    return { error: error?.message ?? null };
  },

  uploadAvatar: async (localUri: string) => {
    const user = get().user;
    if (!user) return { url: null, error: 'You must be signed in.' };

    try {
      const response = await fetch(localUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) return { url: null, error: uploadError.message };

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      return { url: `${data.publicUrl}?updated=${Date.now()}`, error: null };
    } catch {
      return { url: null, error: 'Failed to upload avatar.' };
    }
  },
}));
