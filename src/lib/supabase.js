import { createClient } from '@supabase/supabase-js'

// Only the URL + anon/publishable key belong in the browser. NEVER put the service_role key here.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key',
)
export const supabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
