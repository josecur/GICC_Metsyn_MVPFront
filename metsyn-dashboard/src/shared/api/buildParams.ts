import type { MetSynFilters, MetSynQueryParams } from "./types"

/**
 * Único lugar que traduce los filtros de Zustand a params del backend.
 * Omite los valores 'todos' para que el backend no filtre por ellos.
 */
export function buildParams(f: MetSynFilters): MetSynQueryParams {
  return {
    ...(f.periodo !== "todos" && { periodo: f.periodo }),
    ...(f.genero !== "todos" && { sexo: f.genero }),
    ...(f.criterio !== "todos" && { criterio: f.criterio }),
    edad_min: f.edadMin,
    edad_max: f.edadMax,
  }
}

/** Clave estable para TanStack Query / caché, derivada de los filtros. */
export function filterKey(f: MetSynFilters): (string | number)[] {
  return [f.periodo, f.genero, f.criterio, f.edadMin, f.edadMax]
}
