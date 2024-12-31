// /src/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase server URL or key not defined in environment variables')
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey)