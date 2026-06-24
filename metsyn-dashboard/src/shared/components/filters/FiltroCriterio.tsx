import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select"
import type { Criterio } from "@/shared/store/useFilterStore"
import { useFiltroCriterio } from "./hooks/useFiltroCriterio"
import { CRITERIO_OPTIONS, CRITERIO_LABELS } from "./constants"

export function FiltroCriterio() {
  const { criterio, setCriterio } = useFiltroCriterio()
  return (
    <Select value={criterio} onValueChange={(v) => setCriterio(v as Criterio)}>
      <SelectTrigger className="h-9 w-[190px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {CRITERIO_OPTIONS.map((c) => (
          <SelectItem key={c} value={c}>{CRITERIO_LABELS[c]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
