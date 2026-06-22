import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

// Export null when env vars are absent (e.g. GitHub Pages without secrets
// configured) so the app renders normally — save/load just won't work.
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null
