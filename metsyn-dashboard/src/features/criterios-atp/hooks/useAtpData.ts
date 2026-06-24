import { useQuery } from "@tanstack/react-query"
import { dataSource } from "@/shared/api/datasource"
import { filterKey } from "@/shared/api/buildParams"
import { useActiveFilters } from "@/shared/components/filters/hooks/useActiveFilters"

/** Datos de Criterios ATP-III vía TanStack Query. */
export function useAtpData() {
  const f = useActiveFilters()
  const key = filterKey(f)

  const gender = useQuery({ queryKey: ["atp", "gender", ...key], queryFn: () => dataSource.getGenderComparison(f) })
  const stats = useQuery({ queryKey: ["atp", "stats", ...key], queryFn: () => dataSource.getVariableStats(f) })
  const cooc = useQuery({ queryKey: ["atp", "cooc", ...key], queryFn: () => dataSource.getCoOccurrence(f) })

  return { gender, stats, cooc }
}
