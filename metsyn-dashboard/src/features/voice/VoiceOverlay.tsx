import { Mic, MicOff, X, MessageSquare, LayoutDashboard, Database, TrendingUp, Moon } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { VoiceStatus } from "./useVoiceCommands"

interface VoiceState {
  status: VoiceStatus
  transcript: string
  lastCommand: string | null
  supported: boolean
}

interface VoiceOverlayProps {
  open: boolean
  onClose: () => void
  voice: VoiceState
}

const COMMANDS = [
  { icon: LayoutDashboard, text: "'Ir a Dashboard'" },
  { icon: Database, text: "'Ir a Ingesta'" },
  { icon: TrendingUp, text: "'Ver Tendencias'" },
  { icon: Moon, text: "'Cambiar a Modo Oscuro'" },
]

const STATUS_TITLE: Record<VoiceStatus, string> = {
  idle: "Listo para escuchar",
  listening: "Escuchando…",
  processing: "Procesando…",
  error: "No se pudo reconocer",
  unsupported: "Voz no disponible",
}

export function VoiceOverlay({ open, onClose, voice }: VoiceOverlayProps) {
  if (!open) return null
  const listening = voice.status === "listening"
  const unsupported = voice.status === "unsupported" || !voice.supported

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        {/* Micrófono */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />}
            <div
              className={cn(
                "relative flex size-16 items-center justify-center rounded-full text-primary-foreground shadow-lg",
                unsupported ? "bg-muted-foreground" : "bg-primary shadow-primary/40"
              )}
            >
              {unsupported ? <MicOff className="size-7" /> : <Mic className="size-7" />}
            </div>
          </div>
          <p className={cn("mt-4 text-lg font-semibold", voice.status === "error" ? "text-destructive" : "text-primary")}>
            {STATUS_TITLE[voice.status]}
          </p>
          {/* Waveform animada solo al escuchar */}
          {listening && (
            <div className="mt-2 flex items-end gap-1">
              {[10, 18, 8, 22, 14, 26, 12, 20, 9].map((h, i) => (
                <span
                  key={i}
                  className="w-1 animate-pulse rounded-full bg-primary"
                  style={{ height: h, animationDelay: `${i * 90}ms`, animationDuration: "900ms" }}
                />
              ))}
            </div>
          )}
          {/* Transcript en vivo */}
          {listening && voice.transcript && (
            <p className="mt-2 max-w-sm text-center text-sm italic text-muted-foreground">"{voice.transcript}"</p>
          )}
        </div>

        {unsupported ? (
          <div className="mt-6 rounded-xl border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
            Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge para esta función.
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-border bg-muted/50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Último comando reconocido
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
              <MessageSquare className="size-4 shrink-0 text-primary" />
              <span>{voice.lastCommand ?? "Esperando comando…"}</span>
            </p>
          </div>
        )}

        {/* Guía de comandos */}
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-foreground">Guía de Comandos</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {COMMANDS.map((c) => {
              const Icon = c.icon
              return (
                <div key={c.text} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11px] text-muted-foreground">Di:</p>
                    <p className="text-sm font-semibold text-foreground">{c.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Navegación por voz · v1 solo páginas (filtros próximamente).
        </p>
      </div>
    </div>
  )
}
