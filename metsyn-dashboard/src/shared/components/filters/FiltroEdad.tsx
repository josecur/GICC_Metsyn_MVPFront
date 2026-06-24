import { Slider } from "@/shared/components/ui/slider"
import { useFiltroEdad } from "./hooks/useFiltroEdad"
import { EDAD_MIN, EDAD_MAX } from "./constants"

/** Slider de rango (dos thumbs) → garantiza edadMin <= edadMax por construcción. */
export function FiltroEdad() {
  const { edadMin, edadMax, setEdad } = useFiltroEdad()
  return (
    <div className="flex h-9 items-center gap-3 rounded-lg border border-input bg-card px-3">
      <span className="whitespace-nowrap text-sm text-muted-foreground">Edad</span>
      <Slider
        className="w-28"
        value={[edadMin, edadMax]}
        min={EDAD_MIN}
        max={EDAD_MAX}
        step={1}
        onValueChange={([a, b]) => setEdad(a, b)}
      />
      <span className="whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
        {edadMin}–{edadMax}
      </span>
    </div>
  )
}
