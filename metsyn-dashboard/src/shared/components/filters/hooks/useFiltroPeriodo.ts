import { useFilterStore } from "@/shared/store/useFilterStore"

/** Nivel 2 — aislamiento. Los componentes NUNCA tocan el store directo. */
export function useFiltroPeriodo() {
  const periodo = useFilterStore((s) => s.periodo)
  const setPeriodo = useFilterStore((s) => s.setPeriodo)
  return { periodo, setPeriodo }
}
