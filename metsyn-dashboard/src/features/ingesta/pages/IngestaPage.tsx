import { CloudUpload, Download, FileSpreadsheet, Check, Clock, Loader, CircleCheck, TriangleAlert, Eye } from "lucide-react"
import { Panel } from "@/shared/components/Panel"
import { Progress } from "@/shared/components/ui/progress"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table"
import { cn } from "@/shared/lib/utils"

type StepState = "done" | "active" | "pending"
const STEPS: { n: number; title: string; desc: string; state: StepState; progress?: number }[] = [
  { n: 1, title: "Validación de Esquema", desc: "Verificando columnas requeridas y tipos de datos.", state: "done" },
  { n: 2, title: "Limpieza e Imputación", desc: "Normalizando formatos y tratando valores nulos (ATP-III).", state: "active", progress: 68 },
  { n: 3, title: "Cálculo de Variables", desc: "Generando indicadores de riesgo y flags clínicos.", state: "pending" },
]

type Result = "ok" | "error" | "processing"
const HISTORY: { fecha: string; archivo: string; periodo: string; registros: string; result: Result }[] = [
  { fecha: "12 Oct 2023 · 09:14", archivo: "examenes_anuales_q3.xlsx", periodo: "Jul–Sep 2023", registros: "8,440", result: "ok" },
  { fecha: "01 Oct 2023 · 16:38", archivo: "biometrias_urgencias.csv", periodo: "Oct 2023", registros: "1,205", result: "processing" },
  { fecha: "08 Oct 2023 · 11:02", archivo: "datos_historicos_v2.xlsx", periodo: "Ene–Jun 2023", registros: "12,310", result: "error" },
  { fecha: "01 Abr 2023 · 08:30", archivo: "laboratorio_general_q1.xlsx", periodo: "Ene–Mar 2023", registros: "10,998", result: "ok" },
]

function ResultBadge({ result }: { result: Result }) {
  if (result === "ok")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CircleCheck className="size-3.5" /> Éxito
      </span>
    )
  if (result === "error")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
        <TriangleAlert className="size-3.5" /> Con Errores
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      <Loader className="size-3.5 animate-spin" /> Procesando
    </span>
  )
}

export function IngestaPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Ingesta de Datos Biomédicos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Carga archivos estructurados (Excel/CSV) con validación clínica para iniciar el pipeline de
            procesamiento, limpieza y validación de historias médicas.
          </p>
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-muted">
          <Download className="size-4" /> Descargar Plantilla
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Área de carga */}
        <Panel className="lg:col-span-2" title="Área de Carga">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/30 px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-accent/40">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
              <CloudUpload className="size-7" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">Arrastre su archivo Excel aquí</p>
            <p className="mt-1 text-sm text-muted-foreground">
              o haga clic para seleccionar · Formatos: .xlsx, .xls, .csv (máx. 50 MB)
            </p>
            <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary/90">
              <FileSpreadsheet className="size-4" /> Seleccionar Archivo
            </button>
          </div>
        </Panel>

        {/* Estado ETL */}
        <Panel
          title="Estado ETL"
          action={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Loader className="size-3.5 animate-spin" /> Procesando
            </span>
          }
        >
          <ol className="space-y-5">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      step.state === "done" && "bg-emerald-100 text-emerald-700",
                      step.state === "active" && "bg-primary text-primary-foreground",
                      step.state === "pending" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.state === "done" ? <Check className="size-4" strokeWidth={3} /> : step.state === "pending" ? <Clock className="size-3.5" /> : step.n}
                  </div>
                  {step.n < STEPS.length && <span className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-1">
                  <p className={cn("text-sm font-semibold", step.state === "pending" ? "text-muted-foreground" : "text-foreground")}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
                  {step.state === "active" && step.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={step.progress} className="h-1.5" />
                      <p className="mt-1 text-xs font-medium text-primary">{step.progress}% completado</p>
                    </div>
                  )}
                  {step.state === "done" && <p className="mt-0.5 text-xs font-medium text-emerald-600">Completado</p>}
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* Historial */}
      <Panel title="Historial de Ingestas" bodyClassName="-mx-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Archivo Original</TableHead>
              <TableHead>Período Clínico</TableHead>
              <TableHead className="text-right">Registros</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HISTORY.map((row) => (
              <TableRow key={row.archivo}>
                <TableCell className="text-muted-foreground">{row.fecha}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <FileSpreadsheet className="size-4 text-emerald-600" /> {row.archivo}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.periodo}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-foreground">{row.registros}</TableCell>
                <TableCell><ResultBadge result={row.result} /></TableCell>
                <TableCell className="text-right">
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-accent">
                    <Eye className="size-3.5" /> Ver
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-between px-1 text-sm text-muted-foreground">
          <span>Mostrando 1 a 4 de 12 ingestas</span>
          <div className="flex items-center gap-1">
            <button type="button" className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">1</button>
            <button type="button" className="flex size-8 items-center justify-center rounded-md text-sm font-medium text-foreground hover:bg-muted">2</button>
            <button type="button" className="flex size-8 items-center justify-center rounded-md text-sm font-medium text-foreground hover:bg-muted">3</button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
