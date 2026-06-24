import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select"
import type { Genero } from "@/shared/store/useFilterStore"
import { useFiltroGenero } from "./hooks/useFiltroGenero"
import { GENERO_OPTIONS, GENERO_LABELS } from "./constants"

export function FiltroGenero() {
  const { genero, setGenero } = useFiltroGenero()
  return (
    <Select value={genero} onValueChange={(v) => setGenero(v as Genero)}>
      <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {GENERO_OPTIONS.map((g) => (
          <SelectItem key={g} value={g}>{GENERO_LABELS[g]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
