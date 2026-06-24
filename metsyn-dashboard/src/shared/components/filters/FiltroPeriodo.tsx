import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select"
import type { Periodo } from "@/shared/store/useFilterStore"
import { useFiltroPeriodo } from "./hooks/useFiltroPeriodo"
import { PERIODO_OPTIONS, PERIODO_LABELS } from "./constants"

export function FiltroPeriodo() {
  const { periodo, setPeriodo } = useFiltroPeriodo()
  return (
    <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
      <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {PERIODO_OPTIONS.map((p) => (
          <SelectItem key={p} value={p}>{PERIODO_LABELS[p]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
