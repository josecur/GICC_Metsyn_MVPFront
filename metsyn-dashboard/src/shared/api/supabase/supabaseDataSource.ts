import type { MetSynDataSource } from "../datasource"
import type {
  MetSynFilters,
  AgePrevalence,
  RadarPoint,
  DistItem,
  TrendPoint,
  DashboardKpis,
  TrendByGender,
  CriteriaRanking,
  CriteriaComposition,
  GenderComparison,
  CritKey,
  VariableStat,
  CoOccurrenceMatrix,
  CriterioAgeHeatmap,
} from "../types"
import { CRITERIA_GRADIENT } from "@/shared/charts/theme"
import { getSupabase } from "./supabaseClient"

/**
 * Adaptador Supabase del puerto MetSynDataSource.
 * Mapeado al esquema REAL de la tabla `clinical_records` (descubierto vía API):
 *   period · sexo · edad · criterios_n · metsyn_flag(bool) · criterio_*(bool)
 * Estrategia: traer filas filtradas y agregar en JS (~4.4k filas, dataset chico).
 * Si crece, mover agregaciones a vistas/RPC de Postgres.
 */
const SCHEMA = {
  table: "clinical_records",
  col: {
    periodo: "period",
    sexo: "sexo",
    edad: "edad",
    acumulados: "criterios_n",
    metsyn: "metsyn_flag",
    crit: {
      perabd: "criterio_perabd",
      trig: "criterio_trig",
      hdl: "criterio_hdl",
      presion: "criterio_presion",
      glu: "criterio_glu",
    } as Record<string, string>,
    // valores crudos (para violines / box plots)
    vars: { perabd: "perabd", trig: "trig", hdl: "hdl", presion: "presion_sis", glu: "glu" },
  },
}

interface Registro {
  period: string
  sexo: "M" | "F"
  edad: number
  criterios_n: number
  metsyn_flag: boolean
  criterio_perabd: boolean
  criterio_trig: boolean
  criterio_hdl: boolean
  criterio_presion: boolean
  criterio_glu: boolean
  perabd: number | null
  trig: number | null
  hdl: number | null
  glu: number | null
  presion_sis: number | null
}

/** Los flags vienen como boolean; algunos datasets usan 0/1 — soportamos ambos. */
const yes = (v: unknown) => v === true || v === 1

const AGE_BINS = ["18-29", "30-39", "40-49", "50-59", "60+"]
const binOf = (edad: number) => (edad < 30 ? 0 : edad < 40 ? 1 : edad < 50 ? 2 : edad < 60 ? 3 : 4)

const PERIODOS = ["2021", "2023", "2024", "2025"]
const CRIT_COLS: { key: CritKey; col: keyof Registro; axis: string }[] = [
  { key: "perabd", col: "criterio_perabd", axis: "Obesidad Abd." },
  { key: "trig", col: "criterio_trig", axis: "Triglicéridos" },
  { key: "hdl", col: "criterio_hdl", axis: "HDL Bajo" },
  { key: "presion", col: "criterio_presion", axis: "Presión Art." },
  { key: "glu", col: "criterio_glu", axis: "Glucosa" },
]

const SELECT_COLS =
  `${SCHEMA.col.periodo},${SCHEMA.col.sexo},${SCHEMA.col.edad},${SCHEMA.col.acumulados},${SCHEMA.col.metsyn},` +
  Object.values(SCHEMA.col.crit).join(",") +
  "," +
  Object.values(SCHEMA.col.vars).join(",")
const PAGE = 1000

const VARS_META: { key: string; label: string; col: keyof Registro; threshold: number }[] = [
  { key: "perabd", label: "Cintura", col: "perabd", threshold: 94 },
  { key: "trig", label: "Trig.", col: "trig", threshold: 150 },
  { key: "hdl", label: "HDL", col: "hdl", threshold: 40 },
  { key: "presion", label: "PAS", col: "presion_sis", threshold: 130 },
  { key: "glu", label: "Glucosa", col: "glu", threshold: 100 },
]

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

/**
 * Trae TODAS las filas que cumplen los filtros, paginando de a 1000 — porque
 * PostgREST capea cada request en `db-max-rows` (1000 por defecto). Sin esto,
 * las agregaciones se calcularían sobre un subconjunto.
 */
async function fetchRegistros(f: MetSynFilters): Promise<Registro[]> {
  const sb = getSupabase()
  const all: Registro[] = []
  for (let from = 0; ; from += PAGE) {
    let q = sb
      .from(SCHEMA.table)
      .select(SELECT_COLS)
      .gte(SCHEMA.col.edad, f.edadMin)
      .lte(SCHEMA.col.edad, f.edadMax)
      .range(from, from + PAGE - 1)
    if (f.periodo !== "todos") q = q.eq(SCHEMA.col.periodo, f.periodo)
    if (f.genero !== "todos") q = q.eq(SCHEMA.col.sexo, f.genero)
    if (f.criterio !== "todos") q = q.eq(SCHEMA.col.crit[f.criterio], true)

    const { data, error } = await q
    if (error) throw error
    const batch = (data ?? []) as unknown as Registro[]
    all.push(...batch)
    if (batch.length < PAGE) break
  }
  return all
}

const pct = (num: number, den: number) => (den === 0 ? 0 : +((num / den) * 100).toFixed(1))

export const supabaseDataSource: MetSynDataSource = {
  async getDashboardKpis(f): Promise<DashboardKpis> {
    const rows = await fetchRegistros(f)
    const total = rows.length
    const positivos = rows.filter((r) => yes(r.metsyn_flag)).length
    const promedio = total === 0 ? 0 : +(rows.reduce((a, r) => a + (r.criterios_n ?? 0), 0) / total).toFixed(1)
    return { total, prevalencia: pct(positivos, total), promedio, positivos }
  },

  async getPrevalenceByAge(f): Promise<AgePrevalence> {
    const rows = await fetchRegistros(f)
    const acc = (sex: "M" | "F") => {
      const totals = Array(5).fill(0)
      const pos = Array(5).fill(0)
      rows.filter((r) => r.sexo === sex).forEach((r) => {
        const b = binOf(r.edad)
        totals[b]++
        if (yes(r.metsyn_flag)) pos[b]++
      })
      return totals.map((t, i) => pct(pos[i], t))
    }
    return {
      bins: AGE_BINS,
      masculino: f.genero === "F" ? null : acc("M"),
      femenino: f.genero === "M" ? null : acc("F"),
    }
  },

  async getCriteriaRadar(f): Promise<RadarPoint[]> {
    const rows = await fetchRegistros(f)
    const freq = (col: keyof Registro) => pct(rows.filter((r) => yes(r[col])).length, rows.length)
    return CRIT_COLS.map((c) => ({ name: c.axis, value: freq(c.col) }))
  },

  async getCriteriaDistribution(f): Promise<DistItem[]> {
    const rows = await fetchRegistros(f)
    const counts = Array(6).fill(0)
    rows.forEach((r) => counts[Math.min(5, Math.max(0, r.criterios_n ?? 0))]++)
    const total = rows.length
    return counts.map((c, i) => ({
      label: `${i} ${i === 1 ? "criterio" : "criterios"}`,
      value: pct(c, total),
      color: CRITERIA_GRADIENT[i],
    }))
  },

  async getPrevalenceTrend(f): Promise<TrendPoint[]> {
    const rows = await fetchRegistros({ ...f, periodo: "todos" })
    return PERIODOS.map((p) => {
      const sub = rows.filter((r) => r.period === p)
      const pos = sub.filter((r) => yes(r.metsyn_flag)).length
      return { periodo: p, valor: pct(pos, sub.length) }
    })
  },

  async getPrevalenceTrendByGender(f): Promise<TrendByGender> {
    const rows = await fetchRegistros({ ...f, periodo: "todos", genero: "todos" })
    const prev = (p: string, sex: "M" | "F" | "all") => {
      const sub = rows.filter((r) => r.period === p && (sex === "all" || r.sexo === sex))
      return pct(sub.filter((r) => yes(r.metsyn_flag)).length, sub.length)
    }
    return {
      periodos: PERIODOS,
      hombres: PERIODOS.map((p) => prev(p, "M")),
      mujeres: PERIODOS.map((p) => prev(p, "F")),
      general: PERIODOS.map((p) => prev(p, "all")),
    }
  },

  async getCriteriaRanking(f): Promise<CriteriaRanking> {
    const rows = await fetchRegistros({ ...f, periodo: "todos", criterio: "todos" })
    const ranks: Record<CritKey, number[]> = { perabd: [], trig: [], hdl: [], presion: [], glu: [] }
    PERIODOS.forEach((p, idx) => {
      const sub = rows.filter((r) => r.period === p)
      const freqs = CRIT_COLS.map((c) => ({ key: c.key, f: sub.filter((r) => yes(r[c.col])).length / (sub.length || 1) }))
      const sorted = [...freqs].sort((a, b) => b.f - a.f)
      sorted.forEach((x, i) => { ranks[x.key][idx] = i + 1 })
    })
    return { periodos: PERIODOS, series: CRIT_COLS.map((c) => ({ key: c.key, ranks: ranks[c.key] })) }
  },

  async getCriteriaComposition(f): Promise<CriteriaComposition> {
    const rows = await fetchRegistros({ ...f, periodo: "todos", criterio: "todos" })
    const values: Record<CritKey, number[]> = { perabd: [], trig: [], hdl: [], presion: [], glu: [] }
    PERIODOS.forEach((p, idx) => {
      const sub = rows.filter((r) => r.period === p)
      const counts = CRIT_COLS.map((c) => sub.filter((r) => yes(r[c.col])).length)
      const totalHits = counts.reduce((a, b) => a + b, 0) || 1
      CRIT_COLS.forEach((c, i) => { values[c.key][idx] = +((counts[i] / totalHits) * 100).toFixed(1) })
    })
    return { periodos: PERIODOS, series: CRIT_COLS.map((c) => ({ key: c.key, values: values[c.key] })) }
  },

  async getGenderComparison(f): Promise<GenderComparison> {
    const rows = await fetchRegistros({ ...f, genero: "todos" })
    const freq = (sex: "M" | "F", col: keyof Registro) => {
      const sub = rows.filter((r) => r.sexo === sex)
      return pct(sub.filter((r) => yes(r[col])).length, sub.length)
    }
    return {
      ejes: CRIT_COLS.map((c) => c.axis),
      hombres: CRIT_COLS.map((c) => freq("M", c.col)),
      mujeres: CRIT_COLS.map((c) => freq("F", c.col)),
    }
  },

  async getVariableStats(f): Promise<VariableStat[]> {
    const rows = await fetchRegistros(f)
    return VARS_META.map((v) => {
      const vals = rows
        .map((r) => r[v.col])
        .filter((x): x is number => typeof x === "number")
        .sort((a, b) => a - b)
      if (vals.length === 0) {
        return { key: v.key, label: v.label, min: 0, q1: 0, median: 0, q3: 0, max: 0, whiskerLow: 0, whiskerHigh: 0, outliers: [], threshold: v.threshold }
      }
      const q1 = percentile(vals, 0.25)
      const median = percentile(vals, 0.5)
      const q3 = percentile(vals, 0.75)
      const iqr = q3 - q1
      const loF = q1 - 1.5 * iqr
      const hiF = q3 + 1.5 * iqr
      const inFence = vals.filter((x) => x >= loF && x <= hiF)
      const outliers = [...new Set(vals.filter((x) => x < loF || x > hiF))].slice(0, 4)
      return {
        key: v.key,
        label: v.label,
        min: vals[0],
        q1: +q1.toFixed(1),
        median: +median.toFixed(1),
        q3: +q3.toFixed(1),
        max: vals[vals.length - 1],
        whiskerLow: inFence.length ? inFence[0] : vals[0],
        whiskerHigh: inFence.length ? inFence[inFence.length - 1] : vals[vals.length - 1],
        outliers,
        threshold: v.threshold,
      }
    })
  },

  async getCoOccurrence(f): Promise<CoOccurrenceMatrix> {
    const rows = await fetchRegistros(f)
    const n = CRIT_COLS.length
    const counts = Array.from({ length: n }, () => Array(n).fill(0))
    rows.forEach((r) => {
      for (let i = 0; i < n; i++) {
        if (!yes(r[CRIT_COLS[i].col])) continue
        for (let j = 0; j < n; j++) {
          if (i !== j && yes(r[CRIT_COLS[j].col])) counts[i][j]++
        }
      }
    })
    let maxOff = 0
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) maxOff = Math.max(maxOff, counts[i][j])
    const matrix = counts.map((row, i) => row.map((c, j) => (i === j ? -1 : maxOff ? +(c / maxOff).toFixed(2) : 0)))
    return { labels: ["Ob", "Tg", "HDL", "PA", "GI"], matrix }
  },

  async getCriterioAgeHeatmap(f): Promise<CriterioAgeHeatmap> {
    const rows = await fetchRegistros(f)
    const matrix = CRIT_COLS.map((c) =>
      AGE_BINS.map((_, bin) => {
        const sub = rows.filter((r) => binOf(r.edad) === bin)
        return +(pct(sub.filter((r) => yes(r[c.col])).length, sub.length) / 100).toFixed(3)
      })
    )
    return {
      criterios: ["Perímetro Abd.", "Triglicéridos", "HDL Bajo", "Presión Art.", "Glucosa Alta"],
      edades: AGE_BINS,
      matrix,
    }
  },
}
