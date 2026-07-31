import { supabase } from '@/lib/supabase';

import { useAuthStore } from './useAuthStore';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}));

describe('useAuthStore', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('signIn returns error: null on success', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });

    const result = await useAuthStore.getState().signIn('user@example.com', 'secret1');

    expect(result).toEqual({ error: null });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret1',
    });
  });

  it('signIn returns the Supabase error message instead of throwing', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    const result = await useAuthStore.getState().signIn('user@example.com', 'wrong-password');

    expect(result).toEqual({ error: 'Invalid login credentials' });
  });

  it('signUp forwards the name into options.data', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({ error: null });

    await useAuthStore.getState().signUp('jane@example.com', 'secret1', 'Jane Doe');

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'secret1',
      options: { data: { name: 'Jane Doe' } },
    });
  });
});
