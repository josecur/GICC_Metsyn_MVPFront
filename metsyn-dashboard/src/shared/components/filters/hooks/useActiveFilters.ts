import type { MetSynFilters } from "@/shared/api/types"
import { useFiltroPeriodo } from "./useFiltroPeriodo"
import { useFiltroGenero } from "./useFiltroGenero"
import { useFiltroCriterio } from "./useFiltroCriterio"
import { useFiltroEdad } from "./useFiltroEdad"

/**
 * Filtros activos para el Query Layer. Lee vía los hooks de aislamiento
 * (no el store directo) → la dirección de dependencia es Query → Filtros.
 */
export function useActiveFilters(): MetSynFilters {
  const { periodo } = useFiltroPeriodo()
  const { genero } = useFiltroGenero()
  const { criterio } = useFiltroCriterio()
  const { edadMin, edadMax } = useFiltroEdad()
  return { periodo, genero, criterio, edadMin, edadMax }
}
