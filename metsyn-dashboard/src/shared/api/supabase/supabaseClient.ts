import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Cliente Supabase con instanciación perezosa: NO se crea mientras el data source
 * activo sea "mock", así que la app no necesita credenciales para correr en mock.
 */
let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      "Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env. " +
        "Defínelas y pon VITE_DATA_SOURCE=supabase para usar datos reales."
    )
  }
  client = createClient(url, key)
  return client
}
