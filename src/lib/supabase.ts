import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const memoryStore = new Map<string, string>();

const inMemoryStorage = {
  getItem: async (key: string) => memoryStore.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryStore.delete(key);
  },
};

function isAsyncStorageAvailable() {
  try {
    return typeof AsyncStorage?.getItem === 'function';
  } catch {
    return false;
  }
}

function getAuthStorage() {
  if (!isAsyncStorageAvailable()) {
    console.warn(
      'AsyncStorage native module is unavailable — using in-memory session storage (session will not persist across app restarts).',
    );
    return inMemoryStorage;
  }

  return {
    getItem: async (key: string) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (err) {
        console.warn('AsyncStorage.getItem failed, using in-memory fallback:', err);
        return inMemoryStorage.getItem(key);
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (err) {
        console.warn('AsyncStorage.setItem failed, using in-memory fallback:', err);
        await inMemoryStorage.setItem(key, value);
      }
    },
    removeItem: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (err) {
        console.warn('AsyncStorage.removeItem failed, using in-memory fallback:', err);
        await inMemoryStorage.removeItem(key);
      }
    },
  };
}

const authStorage = getAuthStorage();

let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY — falling back to a placeholder Supabase client. Auth calls will fail until you set these in .env (see .env.example).',
  );
  supabaseUrl = 'https://placeholder.supabase.co';
  supabaseAnonKey = 'placeholder-key';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
