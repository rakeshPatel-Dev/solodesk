import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

type StatTone = 'sky' | 'emerald' | 'amber' | 'indigo' | 'rose'

interface PageStatCardProps {
  stat: {
    title: string
    value: string | number
    subtitle: string
    icon: LucideIcon
    tone?: StatTone
  }
}

const toneClassMap: Record<StatTone, { badge: string; icon: string; value: string }> = {
  sky: {
    badge: 'border-sky-200/70 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:text-sky-300',
    icon: 'text-sky-700 dark:text-sky-300',
    value: 'text-sky-950 dark:text-sky-100',
  },
  emerald: {
    badge: 'border-emerald-200/70 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-300',
    icon: 'text-emerald-700 dark:text-emerald-300',
    value: 'text-emerald-950 dark:text-emerald-100',
  },
  amber: {
    badge: 'border-amber-200/70 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:text-amber-300',
    icon: 'text-amber-700 dark:text-amber-300',
    value: 'text-amber-950 dark:text-amber-100',
  },
  indigo: {
    badge: 'border-indigo-200/70 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/20 dark:text-indigo-300',
    icon: 'text-indigo-700 dark:text-indigo-300',
    value: 'text-indigo-950 dark:text-indigo-100',
  },
  rose: {
    badge: 'border-rose-200/70 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:text-rose-300',
    icon: 'text-rose-700 dark:text-rose-300',
    value: 'text-rose-950 dark:text-rose-100',
  },
}

const PageStatCard = ({ stat }: PageStatCardProps) => {
  const Icon = stat.icon
  const tone = stat.tone ?? 'sky'
  const toneClasses = toneClassMap[tone]

  return (
    <Card className="relative overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-transparent via-primary/30 to-transparent" />

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{stat.title}</p>
        <div className={`rounded-md border p-2 ${toneClasses.badge}`}>
          <Icon className={`h-4 w-4 ${toneClasses.icon}`} />
        </div>
      </div>

      <p className={`text-2xl font-black tracking-tight ${toneClasses.value}`}>{stat.value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{stat.subtitle}</p>
    </Card>
  )
}

export default PageStatCard