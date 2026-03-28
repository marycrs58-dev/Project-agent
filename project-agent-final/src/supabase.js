import { createClient } from '@supabase/supabase-js'

// ─── REEMPLAZA CON TUS CREDENCIALES DE SUPABASE ───────────────────────────────
const SUPABASE_URL = 'https://nnunpupacqjnpxgqplod.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_5uNbPTuBgB8XyNOi51yYaA_4cJ5Jnho'
// ─────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
