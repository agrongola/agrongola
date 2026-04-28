/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValid = (url?: string, key?: string) => {
  return !!(url && key && url.startsWith('http') && !url.includes('your-project-url'));
};

const createMockSupabase = () => {
  const mock: any = {
    from: () => mock,
    select: () => mock,
    insert: () => mock,
    update: () => mock,
    upsert: () => mock,
    delete: () => mock,
    eq: () => mock,
    order: () => mock,
    limit: () => mock,
    single: () => mock,
    then: (cb: any) => Promise.resolve(cb({ data: [], error: null })),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    }
  };
  return mock;
};

export const supabase = isValid(supabaseUrl, supabaseAnonKey)
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createMockSupabase();
