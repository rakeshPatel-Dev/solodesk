import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  stat: {
    title: string;
    value: number;
    icon: React.ElementType;
    subTitle: string;
    trend: string;
  }
}

const StatsCard = ({ stat }: StatsCardProps) => {
  return (
    <Card
      key={stat.title}
      className="group relative overflow-hidden border border-border/60 bg-linear-to-br from-background to-muted/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary  to-transparent" />

      <CardHeader className="pb-2">
        <CardTitle className=" font-bold text-muted-foreground">{stat.title}</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-3xl font-black tracking-tight">{stat.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subTitle}</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/80 p-2.5 text-sky-600 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:text-sky-400">
            <stat.icon size={22} />
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-full border border-emerald-300/50 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
          {stat.trend} vs last month
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsCard
