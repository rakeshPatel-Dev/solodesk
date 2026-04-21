import { useMemo, useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { TableEmptyState } from '@/components/shared/TableEmptyState'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import { FolderOpen } from 'lucide-react'

type Project = {
  _id: string
  name: string
  description?: string
  clientId?: {
    _id: string
    name: string
  }
  budget?: number
  status?: string
  startDate?: string
  deadline?: string
}

type Client = {
  _id: string
  name: string
  email?: string
  status?: string
}

type DateRangeValue = '30d' | '3m' | '6m' | '12m' | 'custom'
type TrendRangeValue = '3m' | '6m' | '12m'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatCurrency = (value = 0) =>
  value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })

const getClientName = (project: Project) => {
  if (typeof project.clientId === 'string') return project.clientId
  return project.clientId?.name ?? 'Unknown client'
}

const Reports = () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRangeValue>('3m')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [trendRange, setTrendRange] = useState<TrendRangeValue>('6m')

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        const [projectsRes, clientsRes] = await Promise.all([
          axiosInstance.get('/projects', { params: { page: 1, limit: 100 } }),
          axiosInstance.get('/clients', { params: { page: 1, limit: 100 } }),
        ])
        setProjects(projectsRes.data.data ?? [])
        setClients(clientsRes.data.data ?? [])
      } catch (error) {
        toast.error('Failed to load reports data')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [])

  const selectedProjects = useMemo(() => {
    return projects.filter((project) => {
      const clientId = typeof project.clientId === 'string' ? project.clientId : project.clientId?._id
      const matchesClient = clientFilter === 'all' || clientId === clientFilter
      const matchesProject = projectFilter === 'all' || project._id === projectFilter
      return matchesClient && matchesProject
    })
  }, [clientFilter, projectFilter, projects])

  const selectedPayments = useMemo(() => {
    // TODO: Fetch payments from API instead of calculating from mock data
    return []
  }, [])

  const projectFinancials = selectedProjects.map((project: any) => {
    const paid = 0 // TODO: Fetch from API
    const budget = project.budget ?? 0
    const due = Math.max(budget - paid, 0)
    return {
      ...project,
      paid,
      due,
    }
  })

  const totalEarnedAllTime = projectFinancials.reduce((sum: number, project: any) => sum + project.paid, 0)
  const totalDueAllTime = projectFinancials.reduce((sum: number, project: any) => sum + project.due, 0)

  const now = useMemo(() => new Date(), [])
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonthDate = new Date(thisYear, thisMonth - 1, 1)

  const thisMonthEarned = selectedPayments
    .filter((entry: any) => entry.dateObj.getMonth() === thisMonth && entry.dateObj.getFullYear() === thisYear)
    .reduce((sum: number, entry: any) => sum + entry.amount, 0)

  const lastMonthEarned = selectedPayments
    .filter(
      (entry: any) =>
        entry.dateObj.getMonth() === lastMonthDate.getMonth() &&
        entry.dateObj.getFullYear() === lastMonthDate.getFullYear()
    )
    .reduce((sum: number, entry: any) => sum + entry.amount, 0)

  const thisMonthDue = selectedProjects
    .filter((project: any) => {
      if (!project.deadline) return false
      const deadlineDate = new Date(project.deadline)
      return deadlineDate.getMonth() === thisMonth && deadlineDate.getFullYear() === thisYear
    })
    .reduce((sum: number, project: any) => {
      return sum + Math.max((project.budget ?? 0), 0)
    }, 0)

  const lastMonthDue = selectedProjects
    .filter((project: any) => {
      if (!project.deadline) return false
      const deadlineDate = new Date(project.deadline)
      return (
        deadlineDate.getMonth() === lastMonthDate.getMonth() &&
        deadlineDate.getFullYear() === lastMonthDate.getFullYear()
      )
    })
    .reduce((sum: number, project: any) => {
      return sum + Math.max((project.budget ?? 0), 0)
    }, 0)

  const earningsGrowthPct = lastMonthEarned > 0 ? ((thisMonthEarned - lastMonthEarned) / lastMonthEarned) * 100 : 0
  const dueGrowthPct = lastMonthDue > 0 ? ((thisMonthDue - lastMonthDue) / lastMonthDue) * 100 : 0

  const monthlyTrend = useMemo(() => {
    const monthCount = trendRange === '3m' ? 3 : trendRange === '6m' ? 6 : 12

    const buckets = Array.from({ length: monthCount }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1)
      return {
        month: `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`,
        key: `${date.getFullYear()}-${date.getMonth()}`,
        earned: 0,
      }
    })

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

    selectedPayments.forEach((payment: any) => {
      const key = `${payment.dateObj.getFullYear()}-${payment.dateObj.getMonth()}`
      const bucket = bucketMap.get(key)
      if (bucket) {
        bucket.earned += payment.amount
      }
    })

    return buckets
  }, [now, selectedPayments, trendRange])

  const highestMonth = monthlyTrend.reduce(
    (best, current) => (current.earned > best.earned ? current : best),
    monthlyTrend[0] ?? { month: '-', earned: 0 }
  )

  const lowestMonth = monthlyTrend.reduce(
    (worst, current) => (current.earned < worst.earned ? current : worst),
    monthlyTrend[0] ?? { month: '-', earned: 0 }
  )

  const statusBreakdown = projectFinancials.reduce(
    (acc: any, project: any) => {
      if (project.due <= 0 && project.paid > 0) {
        acc.paid += project.paid
      } else if (project.paid > 0 && project.due > 0) {
        acc.partial += project.due
      } else {
        acc.unpaid += project.due
      }
      return acc
    },
    { paid: 0, partial: 0, unpaid: 0 }
  )

  const pendingProjects = projectFinancials
    .filter((project: any) => project.due > 0)
    .sort((a: any, b: any) => b.due - a.due)
    .map((project: any) => {
      const deadlineDate = project.deadline ? new Date(project.deadline) : null
      const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
      return {
        ...project,
        daysLeft,
      }
    })

  const clientRevenue = clients
    .map((client) => {
      const revenue = projectFinancials
        .filter((project: any) => {
          const clientId = typeof project.clientId === 'string' ? project.clientId : project.clientId?._id
          return clientId === client._id
        })
        .reduce((sum: number, project: any) => sum + project.paid, 0)

      const due = projectFinancials
        .filter((project: any) => {
          const clientId = typeof project.clientId === 'string' ? project.clientId : project.clientId?._id
          return clientId === client._id
        })
        .reduce((sum: number, project: any) => sum + project.due, 0)

      return {
        ...client,
        revenue,
        due,
      }
    })
    .filter((client) => client.revenue > 0 || client.due > 0)

  const topClients = [...clientRevenue].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  const riskClients = [...clientRevenue].filter((client) => client.due > 0).sort((a, b) => b.due - a.due).slice(0, 5)

  const topClientShare = totalEarnedAllTime > 0 && topClients.length > 0
    ? (topClients[0].revenue / totalEarnedAllTime) * 100
    : 0

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">From clarity to action: earnings, dues, and client value in one flow.</p>
      </header>

      <Card className="border border-border/60 bg-card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Select value={dateRange} onValueChange={(value: DateRangeValue) => setDateRange(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client._id} value={client._id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border border-border/60 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Earned (All Time)</p>
            <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(totalEarnedAllTime)}</p>
          </Card>
          <Card className="border border-border/60 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Due (All Time)</p>
            <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(totalDueAllTime)}</p>
          </Card>
          <Card className="border border-border/60 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">This Month Earned</p>
            <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(thisMonthEarned)}</p>
          </Card>
          <Card className="border border-border/60 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">This Month Due</p>
            <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(thisMonthDue)}</p>
          </Card>
        </div>

        <Card className="border border-border/60 bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">
            You earned <span className="font-bold text-emerald-700 dark:text-emerald-300">{Math.abs(earningsGrowthPct).toFixed(1)}%</span>{' '}
            {earningsGrowthPct >= 0 ? 'more' : 'less'} than last month.
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            Due amount <span className="font-bold text-amber-700 dark:text-amber-300">{Math.abs(dueGrowthPct).toFixed(1)}%</span>{' '}
            {dueGrowthPct >= 0 ? 'increased' : 'decreased'} compared to last month.
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-heading font-bold text-foreground">Earnings Trend</h2>
          <Select value={trendRange} onValueChange={(value: TrendRangeValue) => setTrendRange(value)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border border-border/60 p-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => formatCurrency(value ?? 0)} />
                <Bar dataKey="earned" fill="#0ea5e9" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card className="border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Highest Earning Month</p>
            <p className="mt-1 text-base font-bold text-foreground">{highestMonth.month}</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{formatCurrency(highestMonth.earned)}</p>
          </Card>
          <Card className="border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Lowest Earning Month</p>
            <p className="mt-1 text-base font-bold text-foreground">{lowestMonth.month}</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">{formatCurrency(lowestMonth.earned)}</p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground">Due & Payment Breakdown</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="border border-emerald-200/50 bg-emerald-500/5 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Paid</p>
            <p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(statusBreakdown.paid)}</p>
          </Card>
          <Card className="border border-amber-200/50 bg-amber-500/5 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Partial</p>
            <p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(statusBreakdown.partial)}</p>
          </Card>
          <Card className="border border-red-200/50 bg-red-500/5 p-4">
            <p className="text-xs uppercase tracking-wide text-red-700 dark:text-red-300">Unpaid</p>
            <p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(statusBreakdown.unpaid)}</p>
          </Card>
        </div>

        <Card className="overflow-hidden border border-border/60">
          <div className="border-b border-border/60 bg-muted/20 px-4 py-3">
            <h3 className="font-semibold text-foreground">Top Pending Projects</h3>
          </div>
          {pendingProjects.length === 0 ? (
            <TableEmptyState
              icon={FolderOpen}
              title="No pending projects"
              description="All your projects are on track or completed. Great work!"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead className="text-right">Days Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProjects.slice(0, 6).map((project) => {
                  const isOverdue = (project.daysLeft ?? 0) < 0
                  return (
                    <TableRow key={project._id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{getClientName(project)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(project.due)}</TableCell>
                      <TableCell className={`text-right font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                        {project.daysLeft == null ? '-' : isOverdue ? `Overdue ${Math.abs(project.daysLeft)}d` : `${project.daysLeft}d`}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground">Client Value Insights</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden border border-border/60">
            <div className="border-b border-border/60 bg-muted/20 px-4 py-3">
              <h3 className="font-semibold text-foreground">Top Clients by Revenue</h3>
            </div>
            {topClients.length === 0 ? (
              <TableEmptyState
                icon={FolderOpen}
                title="No client data"
                description="Create projects and record payments to see top clients by revenue."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Total Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((client) => (
                    <TableRow key={client._id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(client.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          <Card className="overflow-hidden border border-border/60">
            <div className="border-b border-border/60 bg-muted/20 px-4 py-3">
              <h3 className="font-semibold text-foreground">Risk Clients</h3>
            </div>
            {riskClients.length === 0 ? (
              <TableEmptyState
                icon={FolderOpen}
                title="No risk clients"
                description="All clients are current on their payments."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Due Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskClients.map((client) => (
                    <TableRow key={client._id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">{formatCurrency(client.due)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        <Card className="border border-border/60 bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">
            Top client contributes{' '}
            <span className="font-bold text-sky-700 dark:text-sky-300">{topClientShare.toFixed(1)}%</span>
            {' '}of your income.
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            <span className="font-bold text-amber-700 dark:text-amber-300">{riskClients.length}</span>
            {' '}clients currently have pending dues.
          </p>
        </Card>
      </section>
    </div>
  )
}

export default Reports
