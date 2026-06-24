import { create } from "zustand"

export type Periodo = "todos" | "2021" | "2023" | "2024" | "2025"
export type Genero = "todos" | "M" | "F"
export type Criterio = "todos" | "perabd" | "trig" | "hdl" | "presion" | "glu"

/**
 * Fuente de verdad del estado de filtros del usuario (Capa 1 — Filtros).
 * Todos los módulos leen de aquí → cross-filtering. La voz (v2) disparará
 * estas mismas acciones. Períodos reales del dataset: 2021/2023/2024/2025 (sin 2022).
 */
interface FilterState {
  periodo: Periodo
  genero: Genero
  criterio: Criterio
  edadMin: number
  edadMax: number
  setPeriodo: (p: Periodo) => void
  setGenero: (g: Genero) => void
  setCriterio: (c: Criterio) => void
  setEdad: (min: number, max: number) => void
  reset: () => void
}

const DEFAULTS = { periodo: "2025", genero: "todos", criterio: "todos", edadMin: 18, edadMax: 70 } as const

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULTS,
  setPeriodo: (periodo) => set({ periodo }),
  setGenero: (genero) => set({ genero }),
  setCriterio: (criterio) => set({ criterio }),
  // Garantiza el invariante edadMin <= edadMax (riesgo F5).
  setEdad: (min, max) => set({ edadMin: Math.min(min, max), edadMax: Math.max(min, max) }),
  reset: () => set({ ...DEFAULTS }),
}))

export const PERIODO_LABELS: Record<Periodo, string> = {
  todos: "Todos los Períodos",
  "2021": "2021",
  "2023": "2023",
  "2024": "2024",
  "2025": "2025",
}

export const GENERO_LABELS: Record<Genero, string> = {
  todos: "Todos los Géneros",
  M: "Masculino",
  F: "Femenino",
}

export const CRITERIO_LABELS: Record<Criterio, string> = {
  todos: "Todos los Criterios",
  perabd: "Perímetro abdominal",
  trig: "Triglicéridos",
  hdl: "HDL bajo",
  presion: "Presión arterial",
  glu: "Glucosa elevada",
}
