import { useMemo, useState } from "react"
import {
  Mars,
  Venus,
  TriangleAlert,
  ListChecks,
  Check,
  Square,
  BarChart3,
  Save,
  FileText,
  Calculator,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"
import { Slider } from "@/shared/components/ui/slider"
import { cn } from "@/shared/lib/utils"

type Dir = "high" | "low"
interface Criterion {
  id: string
  label: string
  short: string
  unit: string
  min: number
  max: number
  threshold: number
  dir: Dir
  initial: number
}

const CRITERIA: Criterion[] = [
  { id: "waist", label: "Per. abdominal", short: "Per. abdominal", unit: "cm", min: 70, max: 140, threshold: 95, dir: "high", initial: 98 },
  { id: "trig", label: "Triglicéridos", short: "Triglicéridos", unit: "mg/dL", min: 50, max: 400, threshold: 150, dir: "high", initial: 182 },
  { id: "hdl", label: "HDL colesterol", short: "HDL colesterol", unit: "mg/dL", min: 20, max: 90, threshold: 40, dir: "low", initial: 44 },
  { id: "sys", label: "Presión sistólica", short: "Presión arterial", unit: "mmHg", min: 90, max: 200, threshold: 130, dir: "high", initial: 138 },
  { id: "glu", label: "Glucosa ayunas", short: "Glucosa ayunas", unit: "mg/dL", min: 60, max: 200, threshold: 110, dir: "high", initial: 108 },
]

type Status = "umbral" | "borderline" | "normal"
function statusOf(c: Criterion, v: number): Status {
  if (c.dir === "high") {
    if (v >= c.threshold) return "umbral"
    if (v >= c.threshold * 0.95) return "borderline"
    return "normal"
  }
  if (v <= c.threshold) return "umbral"
  if (v <= c.threshold * 1.06) return "borderline"
  return "normal"
}

const STATUS_BADGE: Record<Status, string> = {
  umbral: "bg-destructive/10 text-destructive",
  borderline: "bg-amber-100 text-amber-700",
  normal: "bg-emerald-100 text-emerald-700",
}
const STATUS_LABEL: Record<Status, string> = { umbral: "Umbral", borderline: "Borderline", normal: "Normal" }

const SHAP = [
  { label: "Per. abdominal", value: 0.42, color: "#dc2626" },
  { label: "Triglicéridos", value: 0.31, color: "#f87171" },
  { label: "IMC", value: 0.19, color: "#f59e0b" },
  { label: "Edad", value: 0.11, color: "#ea580c" },
  { label: "HDL colesterol", value: -0.08, color: "#10b981" },
]
const SHAP_MAX = 0.45

function SectionCard({
  icon: Icon,
  title,
  action,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_0_rgb(15_23_42_/_0.04)]", className)}>
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon className="size-4" /> {title}
        </p>
        {action}
      </div>
      {children}
    </div>
  )
}

function Gauge({ value }: { value: number }) {
  const r = 62
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c
  const color = value >= 70 ? "#dc2626" : value >= 50 ? "#f59e0b" : "#10b981"
  return (
    <svg viewBox="0 0 160 160" className="size-44">
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--muted)" strokeWidth="14" />
      <circle
        cx="80"
        cy="80"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 80 80)"
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      <text x="80" y="76" textAnchor="middle" className="fill-foreground text-3xl font-bold" style={{ fontSize: 34 }}>
        {value}%
      </text>
      <text x="80" y="98" textAnchor="middle" className="fill-[var(--muted-foreground)]" style={{ fontSize: 12 }}>
        probabilidad
      </text>
    </svg>
  )
}

export function ModeloMlPage() {
  const [gender, setGender] = useState<"M" | "F">("M")
  const [age, setAge] = useState(44)
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(CRITERIA.map((c) => [c.id, c.initial]))
  )
  const [imc, setImc] = useState(27.4)
  const [showExtra, setShowExtra] = useState(true)

  const statuses = useMemo(
    () => CRITERIA.map((c) => ({ c, status: statusOf(c, values[c.id]) })),
    [values]
  )
  const metCount = statuses.filter((s) => s.status === "umbral").length
  const probability = useMemo(() => {
    const raw = 38 + metCount * 13 + (age - 30) * 0.5 + (imc - 25) * 1.2
    return Math.max(2, Math.min(99, Math.round(raw)))
  }, [metCount, age, imc])
  const positive = probability >= 50

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Calculadora de Riesgo Metabólico</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Los resultados son orientativos y no reemplazan el criterio clínico del profesional de salud.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
            <BarChart3 className="size-3.5 text-primary" /> Modelo XGBoost v1.0
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
            AUC 0.88
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Columna izquierda: inputs */}
        <div className="space-y-4">
          <SectionCard icon={ListChecks} title="Datos Demográficos">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm text-muted-foreground">Género</span>
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("M")}
                    className={cn(
                      "flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
                      gender === "M" ? "border-primary bg-accent text-primary" : "border-input text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Mars className="size-4" /> Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("F")}
                    className={cn(
                      "flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
                      gender === "F" ? "border-primary bg-accent text-primary" : "border-input text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Venus className="size-4" /> Femenino
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm text-muted-foreground">Edad</span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="h-10 w-24 rounded-lg border border-input bg-background px-3 text-lg font-semibold text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <span className="text-sm text-muted-foreground">años</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={ListChecks} title="Criterios ATP-III">
            <div className="space-y-5">
              {statuses.map(({ c, status }) => (
                <div key={c.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{c.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold tabular-nums text-foreground">{values[c.id]}</span>
                      <span className="text-xs text-muted-foreground">{c.unit}</span>
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", STATUS_BADGE[status])}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[values[c.id]]}
                    min={c.min}
                    max={c.max}
                    step={1}
                    onValueChange={([v]) => setValues((prev) => ({ ...prev, [c.id]: v }))}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={ListChecks}
            title="Variables Adicionales"
            action={
              <button type="button" onClick={() => setShowExtra((v) => !v)} className="text-muted-foreground hover:text-foreground">
                <ChevronDown className={cn("size-4 transition-transform", !showExtra && "-rotate-90")} />
              </button>
            }
          >
            {showExtra && (
              <div className="space-y-5">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IMC</span>
                    <span><span className="text-base font-bold tabular-nums text-foreground">{imc.toFixed(1)}</span> <span className="text-xs text-muted-foreground">kg/m²</span></span>
                  </div>
                  <Slider value={[imc]} min={16} max={45} step={0.1} onValueChange={([v]) => setImc(v)} />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hemoglobina</span>
                    <span className="text-base font-bold tabular-nums text-foreground">14.5 <span className="text-xs font-normal text-muted-foreground">g/dL</span></span>
                  </div>
                  <Slider defaultValue={[14.5]} min={8} max={20} step={0.1} />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Col. Total</span>
                    <span className="text-base font-bold tabular-nums text-foreground">214 <span className="text-xs font-normal text-muted-foreground">mg/dL</span></span>
                  </div>
                  <Slider defaultValue={[214]} min={120} max={320} step={1} />
                </div>
              </div>
            )}
          </SectionCard>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
          >
            <Calculator className="size-5" /> Calcular Riesgo
          </button>
        </div>

        {/* Columna derecha: resultados */}
        <div className="space-y-4">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_0_rgb(15_23_42_/_0.04)]">
            <Gauge value={probability} />
            <p className={cn("mt-3 flex items-center gap-2 text-lg font-semibold", positive ? "text-destructive" : "text-emerald-600")}>
              {positive && <TriangleAlert className="size-5" />}
              {positive ? "MetSyn probable" : "Riesgo bajo"}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                <ListChecks className="size-3.5" /> ATP-III: {metCount}/5 criterios
              </span>
              <span className="text-sm text-muted-foreground">Score ML: {(probability / 100).toFixed(2)}</span>
            </div>
          </div>

          <SectionCard icon={ListChecks} title="Desglose ATP-III">
            <div className="divide-y divide-border">
              {statuses.map(({ c, status }) => {
                const met = status === "umbral"
                return (
                  <div key={c.id} className="flex items-center gap-3 py-2.5">
                    {met ? (
                      <Check className="size-4 shrink-0 text-emerald-600" strokeWidth={3} />
                    ) : (
                      <Square className="size-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className="flex-1 text-sm text-foreground">{c.short}</span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {values[c.id]} {c.unit}
                    </span>
                    <span className="w-20 text-right text-xs text-muted-foreground">umbral {c.threshold}</span>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard icon={BarChart3} title="Contribuciones SHAP">
            <div className="space-y-3">
              {SHAP.map((s) => {
                const pct = (Math.abs(s.value) / SHAP_MAX) * 100
                const negative = s.value < 0
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-foreground">{s.label}</span>
                    <div className="relative flex h-2 flex-1 items-center rounded-full bg-muted">
                      <div
                        className="absolute h-2 rounded-full"
                        style={{ width: `${pct}%`, background: s.color, [negative ? "right" : "left"]: "50%" } as React.CSSProperties}
                      />
                      <span className="absolute left-1/2 h-3 w-px -translate-x-1/2 bg-border" />
                    </div>
                    <span className={cn("w-12 text-right text-sm font-semibold tabular-nums", negative ? "text-emerald-600" : "text-destructive")}>
                      {s.value > 0 ? "+" : ""}
                      {s.value.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
              El perímetro abdominal y los triglicéridos son los principales factores de riesgo. El HDL actúa como factor protector.
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-card text-sm font-medium text-foreground hover:bg-muted">
                <Save className="size-4" /> Guardar
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-card text-sm font-medium text-foreground hover:bg-muted">
                <FileText className="size-4" /> Exportar PDF
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
