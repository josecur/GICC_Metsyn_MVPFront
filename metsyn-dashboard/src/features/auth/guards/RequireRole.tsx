import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore, type Role } from "@/shared/store/useAuthStore"

/**
 * Restringe una ruta a ciertos roles. Si el rol no coincide, redirige a
 * /dashboard (la vista que ambos roles comparten). La voz no puede saltar
 * esto: navega por la misma ruta y pasa por este mismo guard.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const role = useAuthStore((s) => s.role)
  if (!roles.includes(role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
