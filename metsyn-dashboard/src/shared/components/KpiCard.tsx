import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  delta?: string
  deltaTone?: "up" | "down" | "neutral"
  icon: LucideIcon
  iconTone?: "blue" | "rose" | "emerald" | "amber"
}

const ICON_TONES: Record<string, string> = {
  blue: "bg-primary/10 text-primary",
  rose: "bg-destructive/10 text-destructive",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
}

export function KpiCard({
  label,
  value,
  sub,
  delta,
  deltaTone = "neutral",
  icon: Icon,
  iconTone = "blue",
}: KpiCardProps) {
  const DeltaIcon = deltaTone === "down" ? ArrowDownRight : ArrowUpRight
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_0_rgb(15_23_42_/_0.04)]">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn("flex size-9 items-center justify-center rounded-lg", ICON_TONES[iconTone])}>
          <Icon className="size-[18px]" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
              deltaTone === "up" && "bg-emerald-100 text-emerald-700",
              deltaTone === "down" && "bg-destructive/10 text-destructive",
              deltaTone === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {deltaTone !== "neutral" && <DeltaIcon className="size-3" />}
            {delta}
          </span>
        )}
        {sub && <span className="truncate text-muted-foreground">{sub}</span>}
      </div>
    </div>
  )
}
