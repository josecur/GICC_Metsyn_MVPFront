/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Fuente de datos activa: "mock" (por defecto) o "supabase" */
  readonly VITE_DATA_SOURCE?: "mock" | "supabase"
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
