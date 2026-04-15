import { useMemo, useState } from 'react'
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
import { mockProjectPaymentUpdates, mockProjects } from '@/data/mockData'
import { CircleDollarSign, CalendarDays, Wallet, BadgeCheck, PlusCircle } from 'lucide-react'

const formatDate = (value?: string) => {
  if (!value) return 'No deadline'
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
  const project = mockProjects.find((item) => item.id === id)

  const [paymentUpdates, setPaymentUpdates] = useState(
    id ? mockProjectPaymentUpdates[id] ?? [] : []
  )
  const [amountInput, setAmountInput] = useState('')
  const [dateInput, setDateInput] = useState('')

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
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : project.status === 'Lead'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : 'bg-sky-500/10 text-sky-700 dark:text-sky-300'

  const sortedPaymentUpdates = useMemo(() => {
    return [...paymentUpdates].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [paymentUpdates])

  const handleAddPayment = () => {
    const parsedAmount = Number(amountInput)

    if (!parsedAmount || parsedAmount <= 0 || !dateInput) {
      return
    }

    setPaymentUpdates((prev) => [...prev, { amount: parsedAmount, date: dateInput }])
    setAmountInput('')
    setDateInput('')
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Project Detail</h1>
        <p className="text-sm text-muted-foreground">
          A clear financial and delivery snapshot for this project.
        </p>
      </header>

      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-heading font-bold text-foreground">Project Info</h2>
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
            <Badge className={`mt-1 border-none ${statusClasses}`}>{project.status}</Badge>
          </div>
        </div>
      </Card>

      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-heading font-bold text-foreground">Payment Summary</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-muted/25 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CircleDollarSign className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wide">Total Budget</p>
            </div>
            <p className="mt-2 text-xl font-black text-foreground">{formatCurrency(totalBudget)}</p>
          </div>

          <div className="rounded-lg border border-emerald-200/50 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <BadgeCheck className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wide">Total Paid</p>
            </div>
            <p className="mt-2 text-xl font-black text-foreground">{formatCurrency(totalPaid)}</p>
          </div>

          <div className="rounded-lg border border-amber-200/50 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Wallet className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wide">Total Due</p>
            </div>
            <p className="mt-2 text-xl font-black text-foreground">{formatCurrency(totalDue)}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Paid %</span>
            <span className="text-foreground">{paidPercent}%</span>
          </div>
          <Progress value={paidPercent} className="h-2" />
        </div>
      </Card>

      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-heading font-bold text-foreground">Payment Updates</h2>
        <div className="mt-5 space-y-3">
          {sortedPaymentUpdates.length > 0 ? (
            sortedPaymentUpdates.map((entry, index) => (
              <div
                key={`${entry.date}-${entry.amount}-${index}`}
                className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
              >
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  +{formatCurrency(entry.amount)}
                </p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  on {formatHistoryDate(entry.date)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No payment updates yet.</p>
          )}
        </div>
      </Card>

      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground">Action</h2>
            <p className="mt-1 text-sm text-muted-foreground">Record new payments as they arrive to keep this project transparent.</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Update Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Payment</DialogTitle>
                <DialogDescription>Add a payment entry to this project history.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="payment-amount" className="text-xs font-medium text-muted-foreground">
                    Amount
                  </label>
                  <Input
                    id="payment-amount"
                    type="number"
                    min="1"
                    placeholder="5000"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="payment-date" className="text-xs font-medium text-muted-foreground">
                    Date
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
                <Button onClick={handleAddPayment}>Save Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  )
}

export default ProjectDetail