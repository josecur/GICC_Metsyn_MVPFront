import type {
  MetSynFilters,
  DashboardKpis,
  AgePrevalence,
  RadarPoint,
  DistItem,
  TrendPoint,
  TrendByGender,
  CriteriaRanking,
  CriteriaComposition,
  GenderComparison,
  VariableStat,
  CoOccurrenceMatrix,
  CriterioAgeHeatmap,
} from "./types"
import { mockDataSource } from "./mock/mockDataSource"
import { supabaseDataSource } from "./supabase/supabaseDataSource"

/**
 * Puerto de datos (Capa 1). La UI depende SOLO de esta interfaz, no de dónde
 * vienen los datos. Cambiar de mock a Supabase = cambiar `VITE_DATA_SOURCE`.
 * Si en el futuro se agrega FastAPI, basta un tercer adaptador (axios) aquí.
 */
export interface MetSynDataSource {
  getDashboardKpis(f: MetSynFilters): Promise<DashboardKpis>
  getPrevalenceByAge(f: MetSynFilters): Promise<AgePrevalence>
  getCriteriaRadar(f: MetSynFilters): Promise<RadarPoint[]>
  getCriteriaDistribution(f: MetSynFilters): Promise<DistItem[]>
  getPrevalenceTrend(f: MetSynFilters): Promise<TrendPoint[]>
  // Tendencias
  getPrevalenceTrendByGender(f: MetSynFilters): Promise<TrendByGender>
  getCriteriaRanking(f: MetSynFilters): Promise<CriteriaRanking>
  getCriteriaComposition(f: MetSynFilters): Promise<CriteriaComposition>
  // ATP
  getGenderComparison(f: MetSynFilters): Promise<GenderComparison>
  getVariableStats(f: MetSynFilters): Promise<VariableStat[]>
  getCoOccurrence(f: MetSynFilters): Promise<CoOccurrenceMatrix>
  // Tendencias
  getCriterioAgeHeatmap(f: MetSynFilters): Promise<CriterioAgeHeatmap>
}

export const ACTIVE_SOURCE = ((import.meta.env.VITE_DATA_SOURCE ?? "mock").trim()) as "mock" | "supabase"

export const dataSource: MetSynDataSource =
  ACTIVE_SOURCE === "supabase" ? supabaseDataSource : mockDataSource
