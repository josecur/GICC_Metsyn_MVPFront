import { useLocation } from "react-router-dom"
import { Search, Mic, Bell, Moon, Sun, ChevronDown, Check } from "lucide-react"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Separator } from "@/shared/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"
import { MODULES } from "@/shared/lib/nav"
import { useUiStore } from "@/shared/store/useUiStore"
import { useAuthStore, ROLE_LABELS, type Role } from "@/shared/store/useAuthStore"

const ROLES: Role[] = ["medico", "investigador"]

export function Header() {
  const location = useLocation()
  const title = MODULES.find((m) => location.pathname.startsWith(m.path))?.label ?? "Dashboard"

  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const setVoiceOpen = useUiStore((s) => s.setVoiceOpen)

  const { role, name, initials, setRole } = useAuthStore()

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6 shadow-[0_1px_3px_0_rgb(15_23_42_/_0.04),0_1px_2px_-1px_rgb(15_23_42_/_0.04)]">
      <h1 className="text-base font-semibold tracking-tight text-foreground">{title}</h1>

      {/* Buscador global */}
      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar variable, criterio o colaborador…"
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Comando de voz */}
        <button
          type="button"
          onClick={() => setVoiceOpen(true)}
          className="flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/70"
        >
          <Mic className="size-4" />
          <span className="hidden lg:inline">Comando de voz</span>
        </button>

        {/* Notificaciones */}
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>

        {/* Modo oscuro */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>

        <Separator orientation="vertical" className="mx-1 !h-6" />

        {/* Perfil + selector de rol */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-muted">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Cambiar rol (demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ROLES.map((r) => (
              <DropdownMenuItem key={r} onClick={() => setRole(r)} className="justify-between">
                {ROLE_LABELS[r]}
                {role === r && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
