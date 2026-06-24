import { useMemo } from "react"
import type { EChartsOption } from "echarts"
import { SlidersHorizontal, Download } from "lucide-react"
import { Panel } from "@/shared/components/Panel"
import { EChart } from "@/shared/charts/EChart"
import { useChartColors, tooltipStyle, PALETTE } from "@/shared/charts/theme"

/* PRNG determinista para datos de ejemplo estables */
function seeded(seed: number) {
  let s = seed
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
}
const rand = seeded(42)

const PC_AXES = ["Cintura", "Triglic.", "HDL", "LDL", "PAS", "Glucosa", "IMC"]
const PC_LINES = Array.from({ length: 20 }, () => {
  const risk = rand() > 0.62
  const base = risk ? 0.58 : 0.32
  return { risk, vals: PC_AXES.map(() => Math.min(0.94, Math.max(0.06, base + (rand() - 0.5) * 0.5))) }
})

const SCATTER_LOW: [number, number][] = Array.from({ length: 26 }, () => [+(22 + rand() * 5).toFixed(1), +(78 + rand() * 12).toFixed(0)])
const SCATTER_HIGH: [number, number][] = Array.from({ length: 18 }, () => [+(28 + rand() * 8).toFixed(1), +(96 + rand() * 20).toFixed(0)])

const PROFILE = [
  { eje: "Cintura", individual: 82, promedio: 55 },
  { eje: "Triglic.", individual: 74, promedio: 52 },
  { eje: "HDL", individual: 40, promedio: 60 },
  { eje: "PAS", individual: 78, promedio: 58 },
  { eje: "Glucosa", individual: 68, promedio: 50 },
  { eje: "IMC", individual: 71, promedio: 54 },
]

function ParallelCoordinates() {
  const W = 720
  const H = 240
  const padX = 50
  const padY = 24
  const step = (W - padX * 2) / (PC_AXES.length - 1)
  const yOf = (v: number) => padY + (1 - v) * (H - padY * 2)
  const xOf = (i: number) => padX + i * step
  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" role="img" aria-label="Coordenadas paralelas">
      {PC_AXES.map((_, i) => (
        <line key={i} x1={xOf(i)} y1={padY} x2={xOf(i)} y2={H - padY} stroke="var(--border)" strokeWidth={1} />
      ))}
      {PC_LINES.map((line, k) => {
        const d = line.vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i)} ${yOf(v)}`).join(" ")
        return <path key={k} d={d} fill="none" stroke={line.risk ? "#e11d48" : "#2563eb"} strokeOpacity={line.risk ? 0.5 : 0.32} strokeWidth={1.5} />
      })}
      {PC_AXES.map((label, i) => (
        <text key={label} x={xOf(i)} y={H + 6} textAnchor="middle" className="fill-[var(--muted-foreground)] text-[11px]">
          {label}
        </text>
      ))}
    </svg>
  )
}

function VennDiagram() {
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 420 260" className="w-full max-w-[460px]">
        <circle cx="160" cy="110" r="80" fill="#2563eb" fillOpacity={0.22} stroke="#2563eb" strokeOpacity={0.5} />
        <circle cx="260" cy="110" r="80" fill="#e11d48" fillOpacity={0.2} stroke="#e11d48" strokeOpacity={0.5} />
        <circle cx="210" cy="180" r="80" fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeOpacity={0.5} />
        <text x="120" y="95" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">Diabetes</text>
        <text x="120" y="113" textAnchor="middle" className="fill-[var(--muted-foreground)] text-[12px]">412</text>
        <text x="300" y="95" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">HTA</text>
        <text x="300" y="113" textAnchor="middle" className="fill-[var(--muted-foreground)] text-[12px]">538</text>
        <text x="210" y="215" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">Dislipidemia</text>
        <text x="210" y="233" textAnchor="middle" className="fill-[var(--muted-foreground)] text-[12px]">347</text>
        <text x="210" y="120" textAnchor="middle" className="fill-foreground text-[14px] font-bold">128</text>
      </svg>
    </div>
  )
}

export function ExploracionPage() {
  const c = useChartColors()

  const scatterOption = useMemo<EChartsOption>(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tooltip: { trigger: "item", formatter: (p: any) => `${p.seriesName}<br/>IMC ${p.value[0]} · Perímetro ${p.value[1]} cm`, ...tooltipStyle(c) },
      legend: { bottom: 0, icon: "circle", itemWidth: 9, itemHeight: 9, textStyle: { color: c.text, fontSize: 12 } },
      grid: { left: 4, right: 16, top: 12, bottom: 32, containLabel: true },
      xAxis: { type: "value", name: "IMC", min: 18, max: 40, nameTextStyle: { color: c.text }, axisLabel: { color: c.text }, splitLine: { lineStyle: { color: c.split } }, axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: "value", name: "Perímetro", min: 70, max: 130, nameTextStyle: { color: c.text }, axisLabel: { color: c.text }, splitLine: { lineStyle: { color: c.split } } },
      series: [
        { name: "Riesgo bajo", type: "scatter", symbolSize: 9, data: SCATTER_LOW, itemStyle: { color: PALETTE.primary, opacity: 0.7 } },
        { name: "Riesgo alto", type: "scatter", symbolSize: 9, data: SCATTER_HIGH, itemStyle: { color: PALETTE.rose, opacity: 0.75 } },
      ],
    }),
    [c]
  )

  const profileOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { ...tooltipStyle(c) },
      legend: { bottom: 0, icon: "circle", itemWidth: 9, itemHeight: 9, textStyle: { color: c.text, fontSize: 11 } },
      radar: {
        indicator: PROFILE.map((d) => ({ name: d.eje, max: 100 })),
        radius: "62%",
        splitNumber: 4,
        axisName: { color: c.text, fontSize: 11 },
        splitLine: { lineStyle: { color: c.split } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: c.split } },
      },
      series: [
        {
          type: "radar",
          data: [
            { value: PROFILE.map((d) => d.individual), name: "Individual", lineStyle: { color: PALETTE.rose, width: 2 }, itemStyle: { color: PALETTE.rose }, areaStyle: { color: PALETTE.rose, opacity: 0.2 } },
            { value: PROFILE.map((d) => d.promedio), name: "Promedio", lineStyle: { color: PALETTE.primary, width: 2 }, itemStyle: { color: PALETTE.primary }, areaStyle: { color: PALETTE.primary, opacity: 0.1 } },
          ],
        },
      ],
    }),
    [c]
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Exploración Multivariada</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Análisis profundo de variables de salud ocupacional. Identificación de perfiles de riesgo y
            correlaciones complejas en la población trabajadora.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-muted">
            <SlidersHorizontal className="size-4" /> Filtros Avanzados
          </button>
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Download className="size-4" /> Exportar Datos
          </button>
        </div>
      </div>

      <Panel
        title="Perfiles de Riesgo Metabólico"
        description="Análisis de Coordenadas Paralelas · 7 variables clínicas"
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">7 Variables</span>
            <span className="rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Riesgo Alto</span>
          </div>
        }
      >
        <ParallelCoordinates />
        <div className="mt-1 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#2563eb]" /> Riesgo bajo</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#e11d48]" /> Riesgo alto</span>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="IMC vs Perímetro Abdominal" description="Coloreado por riesgo de Síndrome Metabólico">
          <EChart option={scatterOption} height={320} />
        </Panel>

        <Panel title="Perfil Individual vs Promedio">
          <EChart option={profileOption} height={320} />
        </Panel>
      </div>

      <Panel title="Co-morbilidades" description="Intersección de Diabetes, HTA y Dislipidemias">
        <VennDiagram />
      </Panel>
    </div>
  )
}
