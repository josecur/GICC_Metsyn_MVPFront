import { useFilterStore } from "@/shared/store/useFilterStore"

export function useFiltroCriterio() {
  const criterio = useFilterStore((s) => s.criterio)
  const setCriterio = useFilterStore((s) => s.setCriterio)
  return { criterio, setCriterio }
}
