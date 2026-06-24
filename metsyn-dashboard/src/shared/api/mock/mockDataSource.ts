import type { MetSynDataSource } from "../datasource"
import {
  dashboardKpis,
  prevalenceByAge,
  criteriaRadar,
  criteriaDistribution,
  prevalenceTrend,
  prevalenceTrendByGender,
  criteriaRanking,
  criteriaComposition,
  genderComparison,
  variableStats,
  coOccurrence,
  criterioAgeHeatmap,
} from "@/shared/lib/mockData"

/** DataSource mock: agrega sobre los números reales del spec, en memoria. */
export const mockDataSource: MetSynDataSource = {
  getDashboardKpis: async (f) => dashboardKpis(f),
  getPrevalenceByAge: async (f) => prevalenceByAge(f),
  getCriteriaRadar: async (f) => criteriaRadar(f),
  getCriteriaDistribution: async (f) => criteriaDistribution(f),
  getPrevalenceTrend: async (f) => prevalenceTrend(f),
  getPrevalenceTrendByGender: async (f) => prevalenceTrendByGender(f),
  getCriteriaRanking: async (f) => criteriaRanking(f),
  getCriteriaComposition: async (f) => criteriaComposition(f),
  getGenderComparison: async (f) => genderComparison(f),
  getVariableStats: async (f) => variableStats(f),
  getCoOccurrence: async (f) => coOccurrence(f),
  getCriterioAgeHeatmap: async (f) => criterioAgeHeatmap(f),
}
