import {
  LayoutDashboard,
  ClipboardCheck,
  TrendingUp,
  Search,
  Brain,
  Database,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "@/shared/store/useAuthStore"

export interface ModuleDef {
  id: string
  label: string
  path: string
  /** Texto que aparece bajo el logo cuando el módulo está activo */
  context: string
  icon: LucideIcon
  /** Roles que pueden ver/entrar al módulo */
  roles: Role[]
}

export const MODULES: ModuleDef[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", context: "Resumen General", icon: LayoutDashboard, roles: ["medico", "investigador"] },
  { id: "criterios-atp", label: "Criterios ATP-III", path: "/criterios-atp", context: "Criterios ATP-III", icon: ClipboardCheck, roles: ["medico", "investigador"] },
  { id: "tendencias", label: "Tendencias", path: "/tendencias", context: "Análisis Temporal", icon: TrendingUp, roles: ["medico", "investigador"] },
  { id: "exploracion", label: "Exploración Multivariada", path: "/exploracion", context: "Exploración Multivariada", icon: Search, roles: ["medico", "investigador"] },
  { id: "modelo-ml", label: "Modelo ML", path: "/modelo-ml", context: "Risk Score", icon: Brain, roles: ["medico"] },
  { id: "ingesta", label: "Ingesta de Datos", path: "/ingesta", context: "Pipeline ETL", icon: Database, roles: ["medico"] },
]

export function modulesForRole(role: Role): ModuleDef[] {
  return MODULES.filter((m) => m.roles.includes(role))
}
