import { useFilterStore } from "@/shared/store/useFilterStore"

export function useResetFiltros() {
  return useFilterStore((s) => s.reset)
}
