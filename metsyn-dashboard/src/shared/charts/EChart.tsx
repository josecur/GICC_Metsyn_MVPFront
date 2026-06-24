import { useEffect, useRef } from "react"
import * as echarts from "echarts/core"
import { BarChart, LineChart, RadarChart, ScatterChart, GaugeChart, HeatmapChart, PieChart } from "echarts/charts"
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkAreaComponent,
  MarkPointComponent,
} from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"
import type { EChartsOption } from "echarts"

// Tree-shaking: solo se registran los módulos que el dashboard usa.
echarts.use([
  BarChart,
  LineChart,
  RadarChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkAreaComponent,
  MarkPointComponent,
  CanvasRenderer,
])

interface EChartProps {
  option: EChartsOption
  height?: number | string
  className?: string
}

/** Wrapper React para Apache ECharts: maneja init, resize y dispose. */
export function EChart({ option, height = 300, className }: EChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const instance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current, undefined, { renderer: "canvas" })
    instance.current = chart
    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(ref.current)
    return () => {
      ro.disconnect()
      chart.dispose()
      instance.current = null
    }
  }, [])

  // notMerge: true — evita el gotcha de ECharts que no reacciona a datos nuevos.
  // try/catch: una option transitoria inválida (datos aún cargando) no debe
  // tumbar el árbol de React.
  useEffect(() => {
    try {
      instance.current?.setOption(option, true)
    } catch (err) {
      console.warn("[EChart] setOption falló (option transitoria):", err)
    }
  }, [option])

  return <div ref={ref} style={{ height, width: "100%" }} className={className} />
}
