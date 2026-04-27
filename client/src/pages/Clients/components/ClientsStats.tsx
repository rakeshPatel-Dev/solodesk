import { CircleDollarSign, UserCheck, UserX, Users } from 'lucide-react'

import PageStatCard from '@/components/shared/PageStatCard'

import { type ClientStatsData } from './client-page-types'

type ClientsStatsProps = {
  stats: ClientStatsData
}

function ClientsStats({ stats }: ClientsStatsProps) {
  const { total, active, inactive, totalSpend } = stats

  const clientStats = [
    {
      title: 'Total Clients',
      value: total,
      icon: Users,
      subTitle: 'All organizations onboarded',
      tone: 'sky' as const,
    },
    {
      title: 'Active Clients',
      value: active,
      icon: UserCheck,
      subTitle: 'Currently engaged this month',
      tone: 'emerald' as const,
    },
    {
      title: 'Inactive Clients',
      value: inactive,
      icon: UserX,
      subTitle: 'Need re-engagement follow-up',
      tone: 'amber' as const,
    },
    {
      title: 'Total Spend',
      value: `$${totalSpend.toLocaleString()}`,
      icon: CircleDollarSign,
      subTitle: 'Lifetime spend from all clients',
      tone: 'indigo' as const,
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {clientStats.map((stat) => (
        <PageStatCard
          key={stat.title}
          stat={{
            title: stat.title,
            value: stat.value,
            icon: stat.icon,
            subtitle: stat.subTitle,
            tone: stat.tone,
          }}
        />
      ))}
    </section>
  )
}

export default ClientsStats