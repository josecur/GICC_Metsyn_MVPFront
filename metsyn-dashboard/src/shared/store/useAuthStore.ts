import { create } from "zustand"

export type Role = "medico" | "investigador"

/**
 * Auth (Capa 1) — mock. En producción se apoya en Supabase Auth (JWT + rol).
 * Aquí simulamos sesión iniciada y permitimos cambiar de rol para demostrar
 * los guards en la presentación.
 */
interface AuthState {
  isAuthenticated: boolean
  role: Role
  name: string
  initials: string
  setRole: (role: Role) => void
}

const ROLE_PROFILE: Record<Role, { name: string; initials: string }> = {
  medico: { name: "Dr. R. Salazar", initials: "RS" },
  investigador: { name: "Inv. M. Quispe", initials: "MQ" },
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  role: "medico",
  ...ROLE_PROFILE.medico,
  setRole: (role) => set({ role, ...ROLE_PROFILE[role] }),
}))

export const ROLE_LABELS: Record<Role, string> = {
  medico: "Médico Ocupacional",
  investigador: "Investigador GICC",
}
