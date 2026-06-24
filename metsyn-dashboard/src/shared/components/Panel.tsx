import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

interface PanelProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/** Tarjeta blanca con borde sutil y cabecera opcional. Base de todos los paneles. */
export function Panel({ title, description, action, children, className, bodyClassName }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_0_rgb(15_23_42_/_0.04)]",
        className
      )}
    >
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
