import type { Periodo, Genero, Criterio } from "@/shared/store/useFilterStore"
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
  VariableStat,
  CoOccurrenceMatrix,
  CriterioAgeHeatmap,
} from "@/shared/api/types"
import { CRITERIA_GRADIENT } from "@/shared/charts/theme"

/**
 * Datos mock basados en los números REALES del spec (vault Obsidian).
 * Dataset: 4,371 registros, períodos 2021/2023/2024/2025 (sin 2022).
 * Detrás del DataSource mock; al pasar a Supabase no se toca la UI.
 */

const PERIODOS_REALES = ["2021", "2023", "2024", "2025"] as const

const PREVALENCIA: Record<string, { M: number; F: number; total: number }> = {
  "2021": { M: 38.5, F: 21.8, total: 29.5 },
  "2023": { M: 45.4, F: 25.0, total: 34.5 },
  "2024": { M: 25.2, F: 18.2, total: 21.5 },
  "2025": { M: 33.4, F: 22.3, total: 27.4 },
}

const CRITERIA_FREQ = {
  M: { perabd: 70.9, trig: 45.0, hdl: 35.8, presion: 13.7, glu: 23.7 },
  F: { perabd: 76.4, trig: 25.1, hdl: 39.4, presion: 5.4, glu: 14.3 },
}

const CRITERIA_ACUM: Record<string, number[]> = {
  "2021": [138, 215, 233, 180, 61, 4],
  "2023": [141, 316, 292, 252, 116, 27],
  "2024": [286, 448, 333, 208, 76, 8],
  "2025": [202, 277, 274, 208, 73, 13],
}
const TOTAL_BY_PERIOD: Record<string, number> = { "2021": 831, "2023": 1144, "2024": 1359, "2025": 1037 }
const TOTAL_GLOBAL = 4371

const AGE_BINS = ["18-29", "30-39", "40-49", "50-59", "60+"]
const AGE_MULT = [0.5, 0.78, 1.1, 1.3, 1.45]

/** Al filtrar por un criterio se mira la subpoblación que lo cumple → más prevalencia. */
const CRITERIO_FACTOR: Record<Criterio, number> = {
  todos: 1, perabd: 1.12, trig: 1.32, hdl: 1.22, presion: 1.6, glu: 1.4,
}
type CritKey = "perabd" | "trig" | "hdl" | "presion" | "glu"

const periodKeys = (p: Periodo): string[] => (p === "todos" ? [...PERIODOS_REALES] : [p])
const cap = (n: number) => Math.min(95, +n.toFixed(1))

function prevalenceFor(p: Periodo, g: "M" | "F" | "total", crit: Criterio): number {
  const keys = periodKeys(p)
  const sum = keys.reduce((acc, k) => acc + PREVALENCIA[k][g], 0)
  return cap((sum / keys.length) * CRITERIO_FACTOR[crit])
}

export function prevalenceByAge(f: MetSynFilters): AgePrevalence {
  const base = { M: prevalenceFor(f.periodo, "M", f.criterio), F: prevalenceFor(f.periodo, "F", f.criterio) }
  const row = (sex: "M" | "F") => AGE_MULT.map((m) => cap(base[sex] * m))
  return {
    bins: AGE_BINS,
    masculino: f.genero === "F" ? null : row("M"),
    femenino: f.genero === "M" ? null : row("F"),
  }
}

export function criteriaRadar(f: MetSynFilters): RadarPoint[] {
  const g = f.genero
  const pick = (k: CritKey) =>
    g === "M" ? CRITERIA_FREQ.M[k] : g === "F" ? CRITERIA_FREQ.F[k] : +((CRITERIA_FREQ.M[k] + CRITERIA_FREQ.F[k]) / 2).toFixed(1)
  // Si hay un criterio filtrado, su eje sube (toda la subpoblación lo cumple).
  const val = (k: CritKey) => (f.criterio === k ? Math.max(pick(k), 96) : pick(k))
  return [
    { name: "Obesidad Abd.", value: val("perabd") },
    { name: "Triglicéridos", value: val("trig") },
    { name: "HDL Bajo", value: val("hdl") },
    { name: "Presión Art.", value: val("presion") },
    { name: "Glucosa", value: val("glu") },
  ]
}

export function criteriaDistribution(f: MetSynFilters): DistItem[] {
  const keys = periodKeys(f.periodo)
  let counts = [0, 1, 2, 3, 4, 5].map((i) => keys.reduce((acc, k) => acc + CRITERIA_ACUM[k][i], 0))
  // Subpoblación con un criterio cumplido → nadie tiene 0.
  if (f.criterio !== "todos") counts = counts.map((c, i) => (i === 0 ? 0 : c))
  const total = counts.reduce((a, b) => a + b, 0)
  return counts.map((c, i) => ({
    label: `${i} ${i === 1 ? "criterio" : "criterios"}`,
    value: +((c / total) * 100).toFixed(1),
    color: CRITERIA_GRADIENT[i],
  }))
}

export function prevalenceTrend(f: MetSynFilters): TrendPoint[] {
  const key = f.genero === "todos" ? "total" : f.genero
  return PERIODOS_REALES.map((p) => ({ periodo: p, valor: cap(PREVALENCIA[p][key] * CRITERIO_FACTOR[f.criterio]) }))
}

export function dashboardKpis(f: MetSynFilters): DashboardKpis {
  const total = f.periodo === "todos" ? TOTAL_GLOBAL : TOTAL_BY_PERIOD[f.periodo]
  const prev = prevalenceFor(f.periodo, f.genero === "todos" ? "total" : f.genero, f.criterio)
  const keys = periodKeys(f.periodo)
  const acum = [0, 1, 2, 3, 4, 5].map((i) => keys.reduce((a, k) => a + CRITERIA_ACUM[k][i], 0))
  const acumTotal = acum.reduce((a, b) => a + b, 0)
  const promedio = +(acum.reduce((a, c, i) => a + c * i, 0) / acumTotal + (f.criterio !== "todos" ? 0.8 : 0)).toFixed(1)
  const positivos = Math.round((total * prev) / 100)
  return { total, prevalencia: prev, promedio, positivos }
}

/* ── Tendencias ─────────────────────────────────────────────────────── */

const CRIT_ORDER: CritKey[] = ["perabd", "trig", "hdl", "presion", "glu"]
const CRIT_AXIS: Record<CritKey, string> = {
  perabd: "Obesidad Abd.", trig: "Triglicéridos", hdl: "HDL Bajo", presion: "Presión Art.", glu: "Glucosa",
}
const RANKING_RANKS: Record<CritKey, number[]> = {
  perabd: [2, 1, 1, 1], trig: [1, 2, 2, 3], hdl: [3, 3, 4, 2], presion: [4, 4, 3, 5], glu: [5, 5, 5, 4],
}
const COMPOSITION_VALUES: Record<CritKey, number[]> = {
  perabd: [18, 18, 19, 20], trig: [22, 21, 19, 19], hdl: [20, 21, 22, 21], presion: [22, 21, 20, 19], glu: [18, 19, 20, 21],
}

export function prevalenceTrendByGender(f: MetSynFilters): TrendByGender {
  const fac = CRITERIO_FACTOR[f.criterio]
  return {
    periodos: [...PERIODOS_REALES],
    hombres: PERIODOS_REALES.map((p) => cap(PREVALENCIA[p].M * fac)),
    mujeres: PERIODOS_REALES.map((p) => cap(PREVALENCIA[p].F * fac)),
    general: PERIODOS_REALES.map((p) => cap(PREVALENCIA[p].total * fac)),
  }
}

export function criteriaRanking(_f: MetSynFilters): CriteriaRanking {
  return { periodos: [...PERIODOS_REALES], series: CRIT_ORDER.map((k) => ({ key: k, ranks: RANKING_RANKS[k] })) }
}

export function criteriaComposition(_f: MetSynFilters): CriteriaComposition {
  return { periodos: [...PERIODOS_REALES], series: CRIT_ORDER.map((k) => ({ key: k, values: COMPOSITION_VALUES[k] })) }
}

/* ── ATP ────────────────────────────────────────────────────────────── */

export function genderComparison(f: MetSynFilters): GenderComparison {
  const boost = (k: CritKey, v: number) => (f.criterio === k ? Math.max(v, 96) : v)
  return {
    ejes: CRIT_ORDER.map((k) => CRIT_AXIS[k]),
    hombres: CRIT_ORDER.map((k) => boost(k, CRITERIA_FREQ.M[k])),
    mujeres: CRIT_ORDER.map((k) => boost(k, CRITERIA_FREQ.F[k])),
  }
}

export function variableStats(_f: MetSynFilters): VariableStat[] {
  return [
    { key: "perabd", label: "Cintura", min: 68, q1: 86, median: 94, q3: 103, max: 138, whiskerLow: 68, whiskerHigh: 120, outliers: [135, 138], threshold: 94 },
    { key: "trig", label: "Trig.", min: 45, q1: 98, median: 140, q3: 190, max: 410, whiskerLow: 45, whiskerHigh: 300, outliers: [380, 410], threshold: 150 },
    { key: "hdl", label: "HDL", min: 22, q1: 38, median: 46, q3: 56, max: 92, whiskerLow: 22, whiskerHigh: 80, outliers: [], threshold: 40 },
    { key: "presion", label: "PAS", min: 90, q1: 112, median: 122, q3: 134, max: 190, whiskerLow: 90, whiskerHigh: 160, outliers: [185, 190], threshold: 130 },
    { key: "glu", label: "Glucosa", min: 60, q1: 84, median: 92, q3: 104, max: 210, whiskerLow: 60, whiskerHigh: 140, outliers: [190, 210], threshold: 100 },
  ]
}

export function coOccurrence(_f: MetSynFilters): CoOccurrenceMatrix {
  return {
    labels: ["Ob", "Tg", "HDL", "PA", "GI"],
    matrix: [
      [-1, 0.25, 0.95, 0.45, 0.3],
      [0.25, -1, 0.78, 0.35, 0.5],
      [0.95, 0.78, -1, 0.2, 0.28],
      [0.45, 0.35, 0.2, -1, 0.22],
      [0.3, 0.5, 0.28, 0.22, -1],
    ],
  }
}

export function criterioAgeHeatmap(_f: MetSynFilters): CriterioAgeHeatmap {
  return {
    criterios: ["Perímetro Abd.", "Triglicéridos", "HDL Bajo", "Presión Art.", "Glucosa Alta"],
    edades: ["18-29", "30-39", "40-49", "50-59", "60+"],
    matrix: [
      [0.2, 0.38, 0.55, 0.72, 0.85],
      [0.18, 0.32, 0.5, 0.64, 0.7],
      [0.25, 0.4, 0.48, 0.58, 0.62],
      [0.15, 0.3, 0.46, 0.68, 0.8],
      [0.12, 0.28, 0.42, 0.6, 0.75],
    ],
  }
}

export function formatNumber(n: number): string {
  return n.toLocaleString("es-PE")
}

// Tipos re-exportados por conveniencia
export type { Periodo, Genero }
