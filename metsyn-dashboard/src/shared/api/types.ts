import type { Periodo, Genero, Criterio } from "@/shared/store/useFilterStore"

/**
 * Contratos de datos del frontend (Capa 3 — Contrato de tipos).
 * Deben mantenerse en espejo con los esquemas Pydantic del backend / vistas de Supabase.
 * Los nombres de parámetros de filtro están congelados (sexo, edad_min, etc.).
 */

export interface MetSynFilters {
  periodo: Periodo
  genero: Genero
  criterio: Criterio
  edadMin: number
  edadMax: number
}

/** Parámetros que viajan al backend (snake_case, omitiendo 'todos'). */
export interface MetSynQueryParams {
  periodo?: string
  sexo?: "M" | "F"
  criterio?: Exclude<Criterio, "todos">
  edad_min: number
  edad_max: number
}

export interface DashboardKpis {
  total: number
  prevalencia: number
  promedio: number
  positivos: number
}

export interface AgePrevalence {
  bins: string[]
  masculino: number[] | null
  femenino: number[] | null
}

export interface RadarPoint {
  name: string
  value: number
}

export interface DistItem {
  label: string
  value: number
  color: string
}

export interface TrendPoint {
  periodo: string
  valor: number
}

/** Claves estables de los 5 criterios ATP-III (sin "todos"). */
export type CritKey = "perabd" | "trig" | "hdl" | "presion" | "glu"

/** Tendencias — evolución de prevalencia por género (3 líneas). */
export interface TrendByGender {
  periodos: string[]
  hombres: number[]
  mujeres: number[]
  general: number[]
}

/** Tendencias — ranking de criterios por período (1 = más prevalente). */
export interface CriteriaRanking {
  periodos: string[]
  series: { key: CritKey; ranks: number[] }[]
}

/** Tendencias — composición relativa de criterios por período (% apilado). */
export interface CriteriaComposition {
  periodos: string[]
  series: { key: CritKey; values: number[] }[]
}

/** ATP — comparativa de criterios por género (radar). */
export interface GenderComparison {
  ejes: string[]
  hombres: number[]
  mujeres: number[]
}

/** ATP — estadísticos de distribución de una variable clínica (violín + box plot). */
export interface VariableStat {
  key: string
  label: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  whiskerLow: number
  whiskerHigh: number
  outliers: number[]
  threshold: number
}

/** ATP — co-ocurrencia de criterios (matriz N×N; diagonal = -1). */
export interface CoOccurrenceMatrix {
  labels: string[]
  matrix: number[][]
}

/** Tendencias — prevalencia de cada criterio por grupo etario (0..1). */
export interface CriterioAgeHeatmap {
  criterios: string[]
  edades: string[]
  matrix: number[][]
}
