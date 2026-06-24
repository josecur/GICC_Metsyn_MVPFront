import { useQuery } from "@tanstack/react-query"
import { dataSource } from "@/shared/api/datasource"
import { filterKey } from "@/shared/api/buildParams"
import { useActiveFilters } from "@/shared/components/filters/hooks/useActiveFilters"

/**
 * Datos del Dashboard vía TanStack Query. Lee los filtros del servicio de
 * Filtros (hooks de aislamiento) → queryKey → DataSource (mock|supabase).
 */
export function useDashboardData() {
  const f = useActiveFilters()
  const key = filterKey(f)

  const kpis = useQuery({ queryKey: ["dashboard", "kpis", ...key], queryFn: () => dataSource.getDashboardKpis(f) })
  const ageBars = useQuery({ queryKey: ["dashboard", "age", ...key], queryFn: () => dataSource.getPrevalenceByAge(f) })
  const radar = useQuery({ queryKey: ["dashboard", "radar", ...key], queryFn: () => dataSource.getCriteriaRadar(f) })
  const dist = useQuery({ queryKey: ["dashboard", "dist", ...key], queryFn: () => dataSource.getCriteriaDistribution(f) })
  const trend = useQuery({ queryKey: ["dashboard", "trend", ...key], queryFn: () => dataSource.getPrevalenceTrend(f) })

  return { kpis, ageBars, radar, dist, trend }
}
