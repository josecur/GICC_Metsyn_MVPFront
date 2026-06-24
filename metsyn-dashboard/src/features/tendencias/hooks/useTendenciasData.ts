import { useQuery } from "@tanstack/react-query"
import { dataSource } from "@/shared/api/datasource"
import { filterKey } from "@/shared/api/buildParams"
import { useActiveFilters } from "@/shared/components/filters/hooks/useActiveFilters"

/** Datos de Tendencias vía TanStack Query (mock|supabase transparente). */
export function useTendenciasData() {
  const f = useActiveFilters()
  const key = filterKey(f)

  const trend = useQuery({ queryKey: ["tendencias", "trend", ...key], queryFn: () => dataSource.getPrevalenceTrendByGender(f) })
  const ranking = useQuery({ queryKey: ["tendencias", "ranking", ...key], queryFn: () => dataSource.getCriteriaRanking(f) })
  const composition = useQuery({ queryKey: ["tendencias", "composition", ...key], queryFn: () => dataSource.getCriteriaComposition(f) })
  const heatmap = useQuery({ queryKey: ["tendencias", "heatmap", ...key], queryFn: () => dataSource.getCriterioAgeHeatmap(f) })

  return { trend, ranking, composition, heatmap }
}
