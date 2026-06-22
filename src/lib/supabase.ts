import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — createClient is deferred until first call so the module
// can be imported server-side without throwing when env vars aren't embedded yet.
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  _client = createClient(url, key)
  return _client
}
