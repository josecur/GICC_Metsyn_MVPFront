import { useMemo } from "react"
import type { EChartsOption } from "echarts"
import { Users, Activity, ClipboardList, CircleCheck, Download } from "lucide-react"
import { Panel } from "@/shared/components/Panel"
import { KpiCard } from "@/shared/components/KpiCard"
import { ChartArea } from "@/shared/charts/ChartArea"
import { useChartColors, tooltipStyle, GENDER, PALETTE } from "@/shared/charts/theme"
import { FilterContainer, FiltroPeriodo, FiltroGenero, FiltroCriterio, FiltroEdad } from "@/shared/components/filters"
import { useFiltroPeriodo } from "@/shared/components/filters/hooks/useFiltroPeriodo"
import { PERIODO_LABELS } from "@/shared/components/filters/constants"
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData"
import { formatNumber } from "@/shared/lib/mockData"

export function DashboardPage() {
  const c = useChartColors()
  const { periodo } = useFiltroPeriodo()
  const { kpis, ageBars, radar, dist, trend } = useDashboardData()

  const k = kpis.data ?? { total: 0, prevalencia: 0, promedio: 0, positivos: 0 }

  const barOption = useMemo<EChartsOption>(() => {
    const data = ageBars.data
    const series: EChartsOption["series"] = []
    if (data?.masculino) series.push({ name: "Masculino", type: "bar", data: data.masculino, itemStyle: { color: GENDER.M, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 22 })
    if (data?.femenino) series.push({ name: "Femenino", type: "bar", data: data.femenino, itemStyle: { color: GENDER.F, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 22 })
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => `${v}%`, ...tooltipStyle(c) },
      legend: { bottom: 0, icon: "circle", itemWidth: 9, itemHeight: 9, textStyle: { color: c.text, fontSize: 12 } },
      grid: { left: 4, right: 12, top: 12, bottom: 32, containLabel: true },
      xAxis: { type: "category", data: data?.bins ?? [], axisLabel: { color: c.text }, axisTick: { show: false }, axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: "value", max: 100, axisLabel: { color: c.text, formatter: "{value}%" }, splitLine: { lineStyle: { color: c.split } } },
      series,
    }
  }, [ageBars.data, c])

  const radarOption = useMemo<EChartsOption>(() => {
    const data = radar.data ?? []
    return {
      tooltip: { ...tooltipStyle(c) },
      radar: {
        indicator: data.map((d) => ({ name: d.name, max: 100 })),
        radius: "66%",
        splitNumber: 4,
        axisName: { color: c.text, fontSize: 11 },
        splitLine: { lineStyle: { color: c.split } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: c.split } },
      },
      series: [
        {
          type: "radar",
          data: [{ value: data.map((d) => d.value), name: "Frecuencia" }],
          symbolSize: 4,
          lineStyle: { color: PALETTE.primary, width: 2 },
          itemStyle: { color: PALETTE.primary },
          areaStyle: { color: PALETTE.primary, opacity: 0.2 },
        },
      ],
    }
  }, [radar.data, c])

  const distOption = useMemo<EChartsOption>(() => {
    const data = dist.data ?? []
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => `${v}%`, ...tooltipStyle(c) },
      grid: { left: 4, right: 28, top: 8, bottom: 4, containLabel: true },
      xAxis: { type: "value", axisLabel: { color: c.text, formatter: "{value}%" }, splitLine: { lineStyle: { color: c.split } } },
      yAxis: { type: "category", inverse: true, data: data.map((d) => d.label), axisLabel: { color: c.text, fontSize: 11 }, axisTick: { show: false }, axisLine: { lineStyle: { color: c.axis } } },
      series: [
        {
          type: "bar",
          data: data.map((d) => ({ value: d.value, itemStyle: { color: d.color, borderRadius: [0, 4, 4, 0] } })),
          barMaxWidth: 18,
          label: { show: true, position: "right", formatter: "{c}%", color: c.text, fontSize: 11 },
        },
      ],
    }
  }, [dist.data, c])

  const trendOption = useMemo<EChartsOption>(() => {
    const data = trend.data ?? []
    return {
      tooltip: { trigger: "axis", valueFormatter: (v) => `${v}%`, ...tooltipStyle(c) },
      grid: { left: 4, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: data.map((d) => d.periodo), axisLabel: { color: c.text }, axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: "value", axisLabel: { color: c.text, formatter: "{value}%" }, splitLine: { lineStyle: { color: c.split } } },
      series: [
        {
          name: "Prevalencia MetSyn",
          type: "line",
          smooth: true,
          data: data.map((d) => d.valor),
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { color: PALETTE.primary, width: 2.5 },
          itemStyle: { color: PALETTE.primary },
          areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(37,99,235,0.35)" }, { offset: 1, color: "rgba(37,99,235,0)" }] } },
        },
      ],
    }
  }, [trend.data, c])

  return (
    <div className="space-y-5">
      {/* Filtros reutilizables (compound) — todos viven en el store de Filtros */}
      <FilterContainer
        actions={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-colors hover:bg-primary/90"
          >
            <Download className="size-4" /> Exportar
          </button>
        }
      >
        <FiltroPeriodo />
        <FiltroGenero />
        <FiltroCriterio />
        <FiltroEdad />
      </FilterContainer>

      {/* KPIs reactivos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Registros" value={formatNumber(k.total)} sub={PERIODO_LABELS[periodo]} icon={Users} iconTone="blue" />
        <KpiCard
          label="Prevalencia MetSyn"
          value={`${k.prevalencia}%`}
          delta={`${(k.prevalencia - 27.8).toFixed(1)} pts`}
          deltaTone={k.prevalencia >= 27.8 ? "up" : "down"}
          sub="vs media global"
          icon={Activity}
          iconTone="rose"
        />
        <KpiCard label="Criterios Promedio" value={`${k.promedio}`} sub="de 5 criterios ATP-III" icon={ClipboardList} iconTone="amber" />
        <KpiCard label="Casos Positivos" value={formatNumber(k.positivos)} sub="≥3 criterios" icon={CircleCheck} iconTone="emerald" />
      </div>

      {/* Fila 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Prevalencia por Grupo Etario y Género" description="Distribución de diagnósticos positivos en Síndrome Metabólico">
          <ChartArea ready={!!ageBars.data} option={barOption} height={300} />
        </Panel>
        <Panel title="Criterios ATP-III Alterados" description="Frecuencia relativa de alteraciones">
          <ChartArea ready={!!radar.data} option={radarOption} height={300} />
        </Panel>
      </div>

      {/* Fila 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Distribución de criterios cumplidos" description="N° de criterios ATP-III por registro">
          <ChartArea ready={!!dist.data} option={distOption} height={280} />
        </Panel>
        <Panel className="lg:col-span-2" title="Tendencia Temporal de Prevalencia" description="Evolución por período (2021–2025)">
          <ChartArea ready={!!trend.data} option={trendOption} height={280} />
        </Panel>
      </div>
    </div>
  )
}
