import { useUiStore } from "@/shared/store/useUiStore"

/** Paleta del mock (se mantiene, NO la del borrador del .md). */
export const PALETTE = {
  primary: "#2563eb",
  sky: "#38bdf8",
  rose: "#e11d48",
  amber: "#f59e0b",
  emerald: "#10b981",
  violet: "#8b5cf6",
}

/** Color por género, consistente en todos los gráficos. */
export const GENDER = { M: "#2563eb", F: "#e11d48" }

/** Gradiente semáforo para criterios acumulados 0→5. */
export const CRITERIA_GRADIENT = ["#10b981", "#84cc16", "#f59e0b", "#f97316", "#ef4444", "#b91c1c"]

export interface ChartColors {
  dark: boolean
  text: string
  axis: string
  split: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
}

/** Colores de ejes/tooltip según el tema activo (canvas no lee CSS vars). */
export function useChartColors(): ChartColors {
  const dark = useUiStore((s) => s.theme === "dark")
  return {
    dark,
    text: dark ? "#94a3b8" : "#64748b",
    axis: dark ? "#1e293b" : "#e6eaef",
    split: dark ? "#1e293b" : "#eef2f7",
    tooltipBg: dark ? "#111a2e" : "#ffffff",
    tooltipBorder: dark ? "#1e293b" : "#e6eaef",
    tooltipText: dark ? "#e2e8f0" : "#0f172a",
  }
}

/** Config de tooltip con estética de tarjeta, reutilizable en cada option. */
export function tooltipStyle(c: ChartColors) {
  return {
    backgroundColor: c.tooltipBg,
    borderColor: c.tooltipBorder,
    borderWidth: 1,
    textStyle: { color: c.tooltipText, fontSize: 12 },
    extraCssText: "border-radius:8px;box-shadow:0 4px 12px rgba(15,23,42,0.1);",
  }
}
