import type { EChartsOption } from "echarts"
import { EChart } from "./EChart"

/** Monta el gráfico solo cuando hay datos; evita opciones ECharts degeneradas. */
export function ChartArea({ ready, option, height }: { ready: boolean; option: EChartsOption; height: number }) {
  if (!ready) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <div className="h-full w-full animate-pulse rounded-lg bg-muted/60" />
      </div>
    )
  }
  return <EChart option={option} height={height} />
}
