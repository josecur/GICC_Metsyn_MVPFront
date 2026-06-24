import { useFilterStore } from "@/shared/store/useFilterStore"

export function useFiltroGenero() {
  const genero = useFilterStore((s) => s.genero)
  const setGenero = useFilterStore((s) => s.setGenero)
  return { genero, setGenero }
}
