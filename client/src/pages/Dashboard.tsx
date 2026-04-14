import StatsCard from '@/components/shared/StatsCard'
import { BadgeDollarSign, ClipboardList, FolderKanban, Users } from 'lucide-react'

const Dashboard = () => {


  const stats = [
    { title: 'Total Clients', value: 120, icon: Users, subTitle: '10 new this month', trend: '12.4%', trendDirection: 'up' },
    { title: 'Total Projects', value: 120, icon: FolderKanban, subTitle: '10 new this month', trend: '8.1%', trendDirection: 'neutral' },
    { title: 'Total Payments', value: 120, icon: BadgeDollarSign, subTitle: '10 new this month', trend: '16.7%', trendDirection: 'up' },
    { title: 'Total Tasks', value: 120, icon: ClipboardList, subTitle: '10 new this month', trend: '6.3%', trendDirection: 'down' },
  ]

  return (
    <div className="mx-auto w-full px-10">
      <div>
        <h1 className="text-4xl font-bold ">Dashboard</h1>
        <p>You have 10 new clients this month</p>

      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((individualStat) => (
          <StatsCard key={individualStat.title} stat={individualStat} />
        ))}
      </div>


    </div>
  )
}

export default Dashboard
