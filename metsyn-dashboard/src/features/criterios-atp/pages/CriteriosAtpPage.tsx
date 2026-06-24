import { useMemo } from "react"
import type { EChartsOption } from "echarts"
import { Panel } from "@/shared/components/Panel"
import { ChartArea } from "@/shared/charts/ChartArea"
import { useChartColors, tooltipStyle, GENDER } from "@/shared/charts/theme"
import { FilterContainer, FiltroGenero, FiltroEdad, FiltroCriterio } from "@/shared/components/filters"
import { useAtpData } from "@/features/criterios-atp/hooks/useAtpData"
import type { VariableStat, CoOccurrenceMatrix } from "@/shared/api/types"

const H = 200 // alto del área de dibujo custom
const y = (frac: number) => H - frac * H

function Pulse({ h }: { h: number }) {
  return <div style={{ height: h }} className="w-full animate-pulse rounded-lg bg-muted/60" />
}

/** Cada variable se normaliza por su propio rango [min,max] real. */
function ViolinChart({ stats }: { stats: VariableStat[] }) {
  return (
    <svg viewBox="0 0 500 240" className="w-full" role="img" aria-label="Distribución real por variable">
      {["Max", "Med", "Min"].map((lbl, i) => (
        <text key={lbl} x={4} y={20 + i * (H / 2 - 6)} className="fill-[var(--muted-foreground)] text-[10px]">{lbl}</text>
      ))}
      {stats.map((s, i) => {
        const range = s.max - s.min || 1
        const norm = (v: number) => Math.max(0, Math.min(1, (v - s.min) / range))
        const cx = 60 + i * ((500 - 70) / stats.length) + 20
        const w = 26
        const top = y(1)
        const bottom = y(0)
        const cy = y(norm(s.median))
        const path = `M ${cx} ${top} Q ${cx - w} ${cy} ${cx} ${bottom} Q ${cx + w} ${cy} ${cx} ${top} Z`
        return (
          <g key={s.key}>
            <line x1={cx} y1={top} x2={cx} y2={bottom} stroke="var(--chart-1)" strokeWidth={1.5} />
            <path d={path} fill="var(--chart-1)" fillOpacity={0.22} stroke="var(--chart-1)" strokeOpacity={0.5} strokeWidth={1} />
            <line x1={cx - 16} y1={y(norm(s.threshold))} x2={cx + 16} y2={y(norm(s.threshold))} stroke="#dc2626" strokeWidth={2} />
            <text x={cx} y={H + 24} textAnchor="middle" className="fill-[var(--muted-foreground)] text-[10px]">{s.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function BoxPlotChart({ stats }: { stats: VariableStat[] }) {
  return (
    <svg viewBox="0 0 500 240" className="w-full" role="img" aria-label="Box plot y outliers">
      {stats.map((s, i) => {
        const range = s.max - s.min || 1
        const norm = (v: number) => Math.max(0, Math.min(1, (v - s.min) / range))
        const cx = 60 + i * ((500 - 70) / stats.length) + 20
        const w = 24
        return (
          <g key={s.key}>
            <line x1={cx} y1={y(norm(s.whiskerHigh))} x2={cx} y2={y(norm(s.whiskerLow))} stroke="var(--muted-foreground)" strokeWidth={1.2} />
            <line x1={cx - 8} y1={y(norm(s.whiskerHigh))} x2={cx + 8} y2={y(norm(s.whiskerHigh))} stroke="var(--muted-foreground)" strokeWidth={1.2} />
            <line x1={cx - 8} y1={y(norm(s.whiskerLow))} x2={cx + 8} y2={y(norm(s.whiskerLow))} stroke="var(--muted-foreground)" strokeWidth={1.2} />
            <rect x={cx - w / 2} y={y(norm(s.q3))} width={w} height={Math.max(2, y(norm(s.q1)) - y(norm(s.q3)))} rx={2} fill="var(--chart-1)" fillOpacity={0.85} />
            <line x1={cx - w / 2} y1={y(norm(s.median))} x2={cx + w / 2} y2={y(norm(s.median))} stroke="#fff" strokeWidth={1.6} />
            {s.outliers.map((o, k) => (
              <circle key={k} cx={cx} cy={y(norm(o))} r={3.2} fill="#dc2626" />
            ))}
            <text x={cx} y={H + 24} textAnchor="middle" className="fill-[var(--muted-foreground)] text-[10px]">{s.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function CoOccurrence({ data }: { data: CoOccurrenceMatrix }) {
  const cell = 56
  const offset = 34
  const { labels, matrix } = data
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${offset + labels.length * cell + 4} ${offset + labels.length * cell + 4}`} className="w-full max-w-[360px]">
        {labels.map((l, c) => (
          <text key={`c${c}`} x={offset + c * cell + cell / 2} y={offset - 12} textAnchor="middle" className="fill-[var(--muted-foreground)] text-[11px]">{l}</text>
        ))}
        {labels.map((l, r) => (
          <text key={`r${r}`} x={offset - 10} y={offset + r * cell + cell / 2 + 4} textAnchor="end" className="fill-[var(--muted-foreground)] text-[11px]">{l}</text>
        ))}
        {matrix.map((row, r) =>
          row.map((val, c) => {
            const isDiag = val < 0
            return (
              <rect
                key={`${r}-${c}`}
                x={offset + c * cell}
                y={offset + r * cell}
                width={cell - 4}
                height={cell - 4}
                rx={5}
                fill={isDiag ? "var(--muted)" : "#2563eb"}
                fillOpacity={isDiag ? 1 : 0.12 + val * 0.85}
              />
            )
          })
        )}
      </svg>
      <div className="mt-3 flex w-full max-w-[360px] items-center gap-2 text-[11px] text-muted-foreground">
        <span>Baja</span>
        <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-600" />
        <span>Alta</span>
      </div>
    </div>
  )
}

export function CriteriosAtpPage() {
  const c = useChartColors()
  const { gender, stats, cooc } = useAtpData()

  const radarOption = useMemo<EChartsOption>(() => {
    const d = gender.data
    if (!d) return {}
    return {
      tooltip: { ...tooltipStyle(c) },
      legend: { bottom: 0, icon: "circle", itemWidth: 9, itemHeight: 9, textStyle: { color: c.text, fontSize: 12 } },
      radar: {
        indicator: d.ejes.map((name) => ({ name, max: 100 })),
        radius: "66%",
        splitNumber: 4,
        axisName: { color: c.text, fontSize: 12 },
        splitLine: { lineStyle: { color: c.split } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: c.split } },
      },
      series: [
        {
          type: "radar",
          data: [
            { value: d.hombres, name: "Hombres", lineStyle: { color: GENDER.M, width: 2 }, itemStyle: { color: GENDER.M }, areaStyle: { color: GENDER.M, opacity: 0.12 } },
            { value: d.mujeres, name: "Mujeres", lineStyle: { color: GENDER.F, width: 2 }, itemStyle: { color: GENDER.F }, areaStyle: { color: GENDER.F, opacity: 0.18 } },
          ],
        },
      ],
    }
  }, [gender.data, c])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Diagnóstico ATP-III</h2>
        <p className="mt-1 text-sm text-muted-foreground">Análisis clínico de criterios de Síndrome Metabólico</p>
      </div>

      <FilterContainer>
        <FiltroGenero />
        <FiltroEdad />
        <FiltroCriterio />
      </FilterContainer>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Distribución Real"
          action={
            <button type="button" className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
              Umbrales ATP-III
            </button>
          }
        >
          {stats.data ? <ViolinChart stats={stats.data} /> : <Pulse h={220} />}
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-0.5 w-4 bg-destructive" /> Umbral clínico ATP-III
          </p>
        </Panel>

        <Panel title="Comparativa por Género">
          <ChartArea ready={!!gender.data} option={radarOption} height={300} />
        </Panel>

        <Panel title="Box Plot & Outliers">
          {stats.data ? <BoxPlotChart stats={stats.data} /> : <Pulse h={220} />}
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-destructive" /> Valores atípicos (outliers)
          </p>
        </Panel>

        <Panel title="Co-ocurrencia 5×5" description="Frecuencia conjunta de criterios alterados">
          {cooc.data ? <CoOccurrence data={cooc.data} /> : <Pulse h={220} />}
        </Panel>
      </div>
    </div>
  )
}
