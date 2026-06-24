import { useMemo } from "react"
import type { EChartsOption } from "echarts"
import { TrendingUp, ArrowUpRight, Sparkles } from "lucide-react"
import { Panel } from "@/shared/components/Panel"
import { ChartArea } from "@/shared/charts/ChartArea"
import { useChartColors, tooltipStyle, GENDER } from "@/shared/charts/theme"
import { FilterContainer, FiltroGenero, FiltroCriterio } from "@/shared/components/filters"
import { useFiltroGenero } from "@/shared/components/filters/hooks/useFiltroGenero"
import { useTendenciasData } from "@/features/tendencias/hooks/useTendenciasData"
import type { CritKey } from "@/shared/api/types"

const CRIT_META: Record<CritKey, { label: string; color: string }> = {
  perabd: { label: "Perímetro Abd.", color: "#2563eb" },
  trig: { label: "Triglicéridos", color: "#e11d48" },
  hdl: { label: "HDL Bajo", color: "#f59e0b" },
  presion: { label: "Presión Art.", color: "#10b981" },
  glu: { label: "Glucosa Alta", color: "#8b5cf6" },
}

function MiniStat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_0_rgb(15_23_42_/_0.04)]">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <ArrowUpRight className="size-4 text-emerald-600" />
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-emerald-600">{delta}</p>
    </div>
  )
}

export function TendenciasPage() {
  const c = useChartColors()
  const { genero } = useFiltroGenero()
  const { trend, ranking, composition, heatmap } = useTendenciasData()

  const prevalenceOption = useMemo<EChartsOption>(() => {
    const d = trend.data
    if (!d) return {}
    const lines = [
      { name: "Hombres", data: d.hombres, color: GENDER.M, show: genero !== "F" },
      { name: "Mujeres", data: d.mujeres, color: GENDER.F, show: genero !== "M" },
      { name: "General", data: d.general, color: "#64748b", show: true, dashed: true },
    ].filter((l) => l.show)
    return {
      tooltip: { trigger: "axis", valueFormatter: (v) => `${v}%`, ...tooltipStyle(c) },
      legend: { bottom: 0, icon: "circle", itemWidth: 9, itemHeight: 9, textStyle: { color: c.text, fontSize: 12 } },
      grid: { left: 4, right: 16, top: 16, bottom: 32, containLabel: true },
      xAxis: { type: "category", data: d.periodos, axisLabel: { color: c.text }, axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: "value", axisLabel: { color: c.text, formatter: "{value}%" }, splitLine: { lineStyle: { color: c.split } } },
      series: lines.map((l) => ({
        name: l.name,
        type: "line",
        smooth: true,
        data: l.data,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: l.color, width: l.dashed ? 2 : 2.5, type: l.dashed ? "dashed" : "solid" },
        itemStyle: { color: l.color },
      })),
    }
  }, [trend.data, genero, c])

  const rankingOption = useMemo<EChartsOption>(() => {
    const d = ranking.data
    if (!d) return {}
    return {
      tooltip: { trigger: "axis", ...tooltipStyle(c) },
      legend: { bottom: 0, icon: "circle", itemWidth: 9, itemHeight: 9, textStyle: { color: c.text, fontSize: 12 } },
      grid: { left: 4, right: 16, top: 16, bottom: 32, containLabel: true },
      xAxis: { type: "category", data: d.periodos, axisLabel: { color: c.text }, axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: "value", inverse: true, min: 1, max: 5, interval: 1, axisLabel: { color: c.text }, splitLine: { lineStyle: { color: c.split } } },
      series: d.series.map((s) => ({
        name: CRIT_META[s.key].label,
        type: "line",
        data: s.ranks,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { color: CRIT_META[s.key].color, width: 2.5 },
        itemStyle: { color: CRIT_META[s.key].color },
      })),
    }
  }, [ranking.data, c])

  const compositionOption = useMemo<EChartsOption>(() => {
    const d = composition.data
    if (!d) return {}
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => `${v}%`, ...tooltipStyle(c) },
      legend: { bottom: 0, icon: "circle", itemWidth: 9, itemHeight: 9, textStyle: { color: c.text, fontSize: 11 } },
      grid: { left: 4, right: 12, top: 12, bottom: 32, containLabel: true },
      xAxis: { type: "category", data: d.periodos, axisLabel: { color: c.text }, axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: "value", max: 100, axisLabel: { color: c.text, formatter: "{value}%" }, splitLine: { lineStyle: { color: c.split } } },
      series: d.series.map((s) => ({
        name: CRIT_META[s.key].label,
        type: "bar",
        stack: "comp",
        data: s.values,
        barMaxWidth: 44,
        itemStyle: { color: CRIT_META[s.key].color },
      })),
    }
  }, [composition.data, c])

  const general = trend.data?.general
  const actual = general ? `${general[general.length - 1]}%` : "—"
  const variacion = general ? `${(general[general.length - 1] - general[general.length - 2]).toFixed(1)} pts` : "—"

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Tendencias</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Evolución de la prevalencia de criterios metabólicos a lo largo del tiempo
        </p>
      </div>

      <FilterContainer>
        <FiltroGenero />
        <FiltroCriterio />
      </FilterContainer>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Evolución de Prevalencia General" description="Síndrome Metabólico · 2021–2025">
          <ChartArea ready={!!trend.data} option={prevalenceOption} height={300} />
        </Panel>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <MiniStat label="Prevalencia Actual (SM)" value={actual} delta="↑ vs 2024" />
            <MiniStat label="Variación 2024→2025" value={variacion} delta="al alza" />
          </div>
          <div className="flex flex-1 flex-col justify-between rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/30">
            <div>
              <Sparkles className="size-6" />
              <p className="mt-3 text-base font-semibold">Generar Reporte Predictivo</p>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Proyectar escenarios futuros basados en tendencias actuales.
              </p>
            </div>
            <button type="button" className="mt-4 inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-white/15 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25">
              <TrendingUp className="size-4" /> Generar
            </button>
          </div>
        </div>
      </div>

      <Panel title="Evolución de Ranking de Criterios" description="Cambios en el orden de prevalencia por factor de riesgo (Rank 1 = Más Prevalente)">
        <ChartArea ready={!!ranking.data} option={rankingOption} height={280} />
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Composición Relativa" description="Distribución porcentual de criterios por período">
          <ChartArea ready={!!composition.data} option={compositionOption} height={300} />
        </Panel>

        <Panel title="Heatmap: Criterio × Grupo Etario" description="Prevalencia por segmento de edad">
          {heatmap.data ? (
            <div className="overflow-x-auto">
              <div className="min-w-[420px]">
                <div className="grid grid-cols-[140px_repeat(5,1fr)] items-center gap-1.5">
                  <div />
                  {heatmap.data.edades.map((a) => (
                    <div key={a} className="text-center text-[11px] font-medium text-muted-foreground">{a}</div>
                  ))}
                  {heatmap.data.criterios.map((crit, r) => (
                    <FragmentRow key={crit} label={crit} values={heatmap.data!.matrix[r]} />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Baja</span>
                <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-500" />
                <span>Alta</span>
              </div>
            </div>
          ) : (
            <div className="h-[240px] w-full animate-pulse rounded-lg bg-muted/60" />
          )}
        </Panel>
      </div>
    </div>
  )
}

function FragmentRow({ label, values }: { label: string; values: number[] }) {
  return (
    <>
      <div className="truncate pr-2 text-right text-[11px] font-medium text-muted-foreground">{label}</div>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex h-9 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums"
          style={{
            background: `color-mix(in srgb, ${v > 0.6 ? "#f43f5e" : v > 0.4 ? "#f59e0b" : "#10b981"} ${Math.round(v * 90)}%, white)`,
            color: v > 0.55 ? "#fff" : "#475569",
          }}
        >
          {Math.round(v * 100)}%
        </div>
      ))}
    </>
  )
}
