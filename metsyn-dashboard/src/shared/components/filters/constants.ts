import type { Periodo, Genero, Criterio } from "@/shared/store/useFilterStore"
import { PERIODO_LABELS, GENERO_LABELS, CRITERIO_LABELS } from "@/shared/store/useFilterStore"

/**
 * Única fuente de verdad de opciones y rangos de los filtros.
 * (Nivel 0 del servicio de Filtros — evita strings mágicos repartidos.)
 */
export const PERIODO_OPTIONS: Periodo[] = ["todos", "2021", "2023", "2024", "2025"] // sin 2022
export const GENERO_OPTIONS: Genero[] = ["todos", "M", "F"]
export const CRITERIO_OPTIONS: Criterio[] = ["todos", "perabd", "trig", "hdl", "presion", "glu"]

export const EDAD_MIN = 18
export const EDAD_MAX = 80

export { PERIODO_LABELS, GENERO_LABELS, CRITERIO_LABELS }
