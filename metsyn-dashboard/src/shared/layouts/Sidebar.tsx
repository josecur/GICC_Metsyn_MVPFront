import { NavLink, useLocation } from "react-router-dom"
import { Activity, User, Settings, LifeBuoy, LogOut } from "lucide-react"
import { MODULES, modulesForRole } from "@/shared/lib/nav"
import { useAuthStore } from "@/shared/store/useAuthStore"
import { cn } from "@/shared/lib/utils"

const FOOTER_ITEMS = [
  { label: "[Mi perfil]", icon: User },
  { label: "Configuración", icon: Settings },
  { label: "Centro de Ayuda", icon: LifeBuoy },
]

export function Sidebar() {
  const role = useAuthStore((s) => s.role)
  const location = useLocation()
  const modules = modulesForRole(role)
  const activeModule = MODULES.find((m) => location.pathname.startsWith(m.path))

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex flex-col gap-2 px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Activity className="size-5" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold tracking-tight text-foreground">MedSyn</p>
            <p className="-mt-0.5 text-[15px] font-bold tracking-tight text-foreground">DashBoard</p>
          </div>
        </div>
        <p className="pl-0.5 text-xs text-muted-foreground">{activeModule?.context ?? "Dashboard"}</p>
      </div>

      {/* Body — módulos (filtrados por rol) */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {modules.map((m) => {
          const Icon = m.icon
          return (
            <NavLink
              key={m.id}
              to={m.path}
              className={({ isActive }) =>
                cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-muted/70 hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                  <span className="truncate">{m.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-sidebar-border px-3 py-3">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={2} />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-[18px] shrink-0" strokeWidth={2} />
          <span className="truncate">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
