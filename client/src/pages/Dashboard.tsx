import { memo, useMemo, useState, useEffect } from "react"
import { ChartAreaInteractive } from '@/components/sections/dashboard/chart'
import StatsCard from '@/components/shared/StatsCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import axiosInstance from '@/lib/axios'
import { ArrowRight, BookOpen, DoorOpen, FolderPlus, UserPlus, BadgeDollarSign, ClipboardList } from 'lucide-react'

const recentActivities = [
  {
    id: '1',
    title: 'New client added',
    description: 'Client was added to your client list.',
    time: '2h ago',
  },
  {
    id: '2',
    title: 'Project updated',
    description: 'Project moved to In Progress.',
    time: '5h ago',
  },
  {
    id: '3',
    title: 'Payment received',
    description: 'Invoice was marked as paid.',
    time: 'Yesterday',
  },
]

const quickActions = [
  { icon: UserPlus, label: 'Add Client', variant: 'outline' as const },
  { icon: FolderPlus, label: 'Add Project', variant: 'outline' as const },
  { icon: DoorOpen, label: 'View Payments', variant: 'outline' as const },
  { icon: BookOpen, label: 'View Invoices', variant: 'outline' as const },
]

const RecentActivityItem = memo(({ activity }: { activity: typeof recentActivities[0] }) => (
  <div className="group rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50">
    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
      {activity.title}
    </p>
    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
      {activity.description}
    </p>
    <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
      {activity.time}
    </p>
  </div>
))

RecentActivityItem.displayName = 'RecentActivityItem'

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [projectStats, setProjectStats] = useState({ total: 0, active: 0, completed: 0, totalBudget: 0, totalPaid: 0 })
  const [clientStats, setClientStats] = useState({ total: 0, active: 0 })
  const [paymentStats, setPaymentStats] = useState({ totalInvoiced: 0, paid: 0, pending: 0, overdue: 0 })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [projectsRes, clientsRes, paymentsRes] = await Promise.all([
          axiosInstance.get('/projects', { params: { page: 1, limit: 100 } }),
          axiosInstance.get('/clients', { params: { page: 1, limit: 100 } }),
          axiosInstance.get('/payments', { params: { page: 1, limit: 100 } }),
        ])

        const projects = projectsRes.data.data ?? []
        const clients = clientsRes.data.data ?? []
        const payments = paymentsRes.data.data ?? []

        // Calculate project stats
        setProjectStats({
          total: projects.length,
          active: projects.filter((p: any) => p.status === 'Lead' || p.status === 'In Progress').length,
          completed: projects.filter((p: any) => p.status === 'Completed').length,
          totalBudget: projects.reduce((sum: number, p: any) => sum + (p.budget ?? 0), 0),
          totalPaid: projects.reduce((sum: number, p: any) => sum + (p.budget ?? 0), 0) * 0.65, // Placeholder
        })

        // Calculate client stats
        setClientStats({
          total: clients.length,
          active: clients.filter((c: any) => c.status === 'Active').length,
        })

        // Calculate payment stats
        const toAmount = (value: string | number) => {
          if (typeof value === 'number') return value
          return Number(String(value).replace(/[^\d.]/g, ''))
        }

        setPaymentStats({
          totalInvoiced: payments.reduce((sum: number, p: any) => sum + toAmount(p.amount), 0),
          paid: payments.filter((p: any) => p.status === 'Paid').length,
          pending: payments.filter((p: any) => p.status === 'Pending').length,
          overdue: payments.filter((p: any) => p.status === 'Overdue').reduce((sum: number, p: any) => sum + toAmount(p.amount), 0),
        })
      } catch (error) {
        toast.error('Failed to load dashboard data')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const dashboardStats = useMemo(() => [
    { title: 'Total Revenue', value: `$${projectStats.totalPaid.toLocaleString()}`, icon: BadgeDollarSign, subTitle: '12% from last month', trend: '12%', trendDirection: 'up' as const },
    { title: 'Paid Invoices', value: paymentStats.paid, icon: ClipboardList, subTitle: 'All clear this week', trend: '80%', trendDirection: 'neutral' as const },
    { title: 'Outstanding', value: `$${paymentStats.overdue.toLocaleString()}`, icon: FolderPlus, subTitle: '3 overdue notices sent', trend: '2.5%', trendDirection: 'down' as const },
    { title: 'Active Projects', value: projectStats.active, icon: FolderPlus, subTitle: 'Currently in progress', trend: '3.9%', trendDirection: 'up' as const },
  ], [projectStats, paymentStats])

  const welcomeMessage = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 lg:px-8 lg:py-4">
      {/* Header Section */}
      <div className="space-y-1  border-neutral-200 pb-4 dark:border-neutral-800">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 lg:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {welcomeMessage}, Freelance Manager
        </p>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatsCard key={stat.title || index} stat={stat} />
        ))}
      </section>

      {/* Quick Actions Card */}
      <Card className="border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 lg:text-xl">
              Quick Actions
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Access your most used features
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[540px] lg:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="default"
                className="w-full border-neutral-300 bg-white text-neutral-700 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Chart & Activities Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:p-6">
            <ChartAreaInteractive />
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="flex h-full flex-col border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 lg:text-lg">
                Recent Activity
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 space-y-3">
              {recentActivities.map((activity) => (
                <RecentActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default memo(Dashboard)