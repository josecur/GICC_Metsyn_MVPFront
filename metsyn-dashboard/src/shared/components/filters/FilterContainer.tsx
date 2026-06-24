import type { ReactNode } from "react"
import { RefreshCw } from "lucide-react"
import { useResetFiltros } from "./hooks/useResetFiltros"

/**
 * Compound parent: solo layout + botón de reset. No conoce a sus hijos —
 * cada feature monta los sub-filtros que necesita. `actions` = contenido
 * extra a la derecha (ej. botón Exportar).
 */
export function FilterContainer({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const reset = useResetFiltros()
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="size-4" /> Limpiar
        </button>
        {actions}
      </div>
    </div>
  )
}
