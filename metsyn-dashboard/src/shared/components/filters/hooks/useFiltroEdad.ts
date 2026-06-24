import { useFilterStore } from "@/shared/store/useFilterStore"

export function useFiltroEdad() {
  const edadMin = useFilterStore((s) => s.edadMin)
  const edadMax = useFilterStore((s) => s.edadMax)
  const setEdad = useFilterStore((s) => s.setEdad)
  return { edadMin, edadMax, setEdad }
}
