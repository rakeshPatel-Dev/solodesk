import { useMemo, useState, useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import { CircleDollarSign, CalendarDays, Wallet, BadgeCheck, PlusCircle, AlertCircle } from 'lucide-react'

type Project = {
  _id: string
  id?: string
  name: string
  description?: string
  clientId?: {
    _id: string
    name: string
  }
  type?: string
  budget?: number
  status?: 'Lead' | 'In Progress' | 'Completed'
  startDate?: string
  deadline?: string
}

type PaymentUpdate = {
  _id: string
  amount: number
  date: string
  note?: string
}

const formatDate = (value?: string) => {
  if (!value) return 'No deadline (procrastination station)'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No deadline'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatCurrency = (value = 0) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

const formatHistoryDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const ProjectDetail = () => {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentUpdates, setPaymentUpdates] = useState<PaymentUpdate[]>([])
  const [amountInput, setAmountInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSavingPayment, setIsSavingPayment] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const [projectResponse, paymentTxResponse] = await Promise.all([
          axiosInstance.get(`/projects/${id}`),
          axiosInstance.get(`/payments/project/${id}/transactions`),
        ])

        setProject(projectResponse.data.data)
        setPaymentUpdates(paymentTxResponse.data.data ?? [])
      } catch (error) {
        toast.error('Failed to load project')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const sortedPaymentUpdates = useMemo(() => {
    return [...paymentUpdates].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [paymentUpdates])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  const totalBudget = project.budget ?? 0
  const totalPaid = paymentUpdates.reduce((sum, entry) => sum + entry.amount, 0)
  const totalDue = Math.max(totalBudget - totalPaid, 0)
  const paidPercent = totalBudget > 0 ? Math.min(Math.round((totalPaid / totalBudget) * 100), 100) : 0

  const clientName =
    typeof project.clientId === 'string' ? project.clientId : project.clientId?.name ?? 'Unknown client'

  const statusClasses =
    project.status === 'Completed'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      : project.status === 'Lead'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'

  const handleAddPayment = async () => {
    const parsedAmount = Number(amountInput)

    if (!parsedAmount || parsedAmount <= 0 || !dateInput) {
      toast.error('Enter a valid amount and date')
      return
    }

    if (!id) return

    try {
      setIsSavingPayment(true)
      const response = await axiosInstance.post(`/payments/project/${id}/transactions`, {
        amount: parsedAmount,
        date: dateInput,
      })

      setPaymentUpdates((prev) => [response.data.data, ...prev])
      toast.success('Payment recorded')
      setAmountInput('')
      setDateInput('')
      setDialogOpen(false)
    } catch (error) {
      toast.error('Failed to save payment')
      console.error(error)
    } finally {
      setIsSavingPayment(false)
    }
  }

  const isOverBudget = totalPaid > totalBudget
  const isCuttingItClose = paidPercent >= 80 && paidPercent < 100

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
          💸 Project Details
        </h1>
        <p className="text-sm text-muted-foreground">
          Because tracking money is fun when it's not yours (kidding... mostly)
        </p>
      </header>

      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-sm transition-all hover:shadow-md">
        <h2 className="text-lg font-heading font-bold text-foreground">📋 Project Tea</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Project Name</p>
            <p className="mt-1 font-semibold text-foreground">{project.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Client</p>
            <p className="mt-1 font-semibold text-foreground">{clientName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
            <p className="mt-1 font-semibold text-foreground">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</p>
            <p className="mt-1 font-semibold text-foreground">{formatDate(project.deadline)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
            <Badge className={`mt-1 border ${statusClasses}`}>{project.status}</Badge>
          </div>
        </div>
      </Card>

      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-heading font-bold text-foreground">💰 Money, Honey</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-muted/25 p-4 transition-all hover:scale-105">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CircleDollarSign className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wide">Total Budget</p>
            </div>
            <p className="mt-2 text-xl font-black text-foreground">{formatCurrency(totalBudget)}</p>
          </div>

          <div className="rounded-lg border border-emerald-200/50 bg-emerald-500/5 p-4 transition-all hover:scale-105">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <BadgeCheck className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wide">Total Paid</p>
            </div>
            <p className="mt-2 text-xl font-black text-foreground">{formatCurrency(totalPaid)}</p>
          </div>

          <div className={`rounded-lg border p-4 transition-all hover:scale-105 ${totalDue === 0
            ? 'border-emerald-200/50 bg-emerald-500/5'
            : 'border-amber-200/50 bg-amber-500/5'
            }`}>
            <div className={`flex items-center gap-2 ${totalDue === 0
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-amber-700 dark:text-amber-300'
              }`}>
              <Wallet className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wide">
                {totalDue === 0 ? 'All Paid!' : 'Still Owing'}
              </p>
            </div>
            <p className="mt-2 text-xl font-black text-foreground">
              {totalDue === 0 ? '🎉 PAID IN FULL 🎉' : formatCurrency(totalDue)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">
              {isOverBudget ? "📈 Over Budget (Yikes!)" : "Progress"}
            </span>
            <span className={`font-bold ${isOverBudget ? 'text-red-600' : isCuttingItClose ? 'text-amber-600' : 'text-emerald-600'
              }`}>
              {isOverBudget ? `${Math.min(paidPercent, 200)}% 😬` : `${paidPercent}%`}
            </span>
          </div>
          <Progress
            value={Math.min(paidPercent, 100)}
            className={`h-2 ${isOverBudget ? 'bg-red-200' : ''}`}
          />
          {isOverBudget && (
            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Whoops! You've paid {formatCurrency(totalPaid - totalBudget)} over budget
            </p>
          )}
        </div>
      </Card>

      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-heading font-bold text-foreground">📜 Payment Paper Trail</h2>
        <div className="mt-5 space-y-3">
          {sortedPaymentUpdates.length > 0 ? (
            sortedPaymentUpdates.map((entry, index) => (
              <div
                key={entry._id || `${entry.date}-${entry.amount}-${index}`}
                className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 transition-all hover:bg-muted/30"
              >
                <p className="font-bold text-emerald-700 dark:text-emerald-300">
                  +{formatCurrency(entry.amount)}
                </p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {formatHistoryDate(entry.date)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No payments yet. *cricket sounds*</p>
              <p className="text-xs mt-1">Time to chase that bag! 💰</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground">⚡ Quick Action</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Got paid? Record it here before you forget (and spend it all on coffee)
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                cha-ching! Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>💰 Show Me The Money!</DialogTitle>
                <DialogDescription>
                  Add a payment entry so we know who's paying their bills (and who isn't)
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="payment-amount" className="text-xs font-medium text-muted-foreground">
                    Amount Received 💵
                  </label>
                  <Input
                    id="payment-amount"
                    type="number"
                    min="1"
                    placeholder="e.g., 5000"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="payment-date" className="text-xs font-medium text-muted-foreground">
                    When Did You Get It? 📅
                  </label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={dateInput}
                    onChange={(event) => setDateInput(event.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Never mind
                </Button>
                <Button onClick={handleAddPayment} className="bg-emerald-600 hover:bg-emerald-700" disabled={isSavingPayment}>
                  {isSavingPayment ? 'Saving...' : 'Save & Celebrate 🎉'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  )
}

export default ProjectDetail