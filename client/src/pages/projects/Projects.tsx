import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import PageStatCard from '@/components/shared/PageStatCard'
import ProjectForm from '@/components/forms/ProjectForm'
import { TableEmptyState } from '@/components/shared/TableEmptyState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
import {
  Check,
  CircleDollarSign,
  FolderKanban,
  Gauge,
  Lightbulb,
  Pencil,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Wallet,
  Filter,
  FolderOpen,
} from 'lucide-react'

type Project = {
  _id: string
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

type PaymentEntry = { amount: number; date: string; note?: string }

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

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

const getClientName = (project: Project) => {
  const clientValue = project.clientId
  if (typeof clientValue === 'string') return clientValue

  return clientValue?.name ?? 'Unknown client'
}

const moneyStatusClasses = {
  Paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Partial: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Unpaid: 'bg-red-500/10 text-red-700 dark:text-red-300',
} as const

const Projects = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paymentUpdates, setPaymentUpdates] = useState<Record<string, PaymentEntry[]>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'highestDue'>('latest')
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)

  const [paymentProjectId, setPaymentProjectId] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentNote, setPaymentNote] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get('/projects', {
          params: { page: 1, limit: 100, sortBy: 'deadline', sortOrder: 'asc' },
        })
        setProjects(response.data.data ?? [])
      } catch (error) {
        toast.error('Failed to load projects')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])


  const getPaidAmount = (projectId: string) =>
    (paymentUpdates[projectId] ?? []).reduce((sum, payment) => sum + payment.amount, 0)

  const getDueAmount = (project: Project) => Math.max((project.budget ?? 0) - getPaidAmount(project._id), 0)

  const getMoneyStatus = (project: Project) => {
    const paid = getPaidAmount(project._id)
    const budget = project.budget ?? 0
    const due = getDueAmount(project)

    if (budget > 0 && due === 0 && paid >= budget) return 'Paid'
    if (paid > 0) return 'Partial'
    return 'Unpaid'
  }


  const totalBudget = projects.reduce((sum, project) => sum + (project.budget ?? 0), 0)
  const totalPaid = projects.reduce((sum, project) => sum + getPaidAmount(project._id), 0)
  const totalDue = projects.reduce((sum, project) => sum + getDueAmount(project), 0)
  const activeProjects = projects.filter(
    (project) => project.status === 'Lead' || project.status === 'In Progress'
  ).length

  const projectStats = [
    {
      title: 'Total Projects',
      value: projects.length,
      subtitle: 'Tracked projects in your workspace',
      icon: FolderKanban,
      tone: 'sky' as const,
    },
    {
      title: 'Total Budget',
      value: formatCurrency(totalBudget),
      subtitle: 'Combined planned value',
      icon: CircleDollarSign,
      tone: 'indigo' as const,
    },
    {
      title: 'Total Paid',
      value: formatCurrency(totalPaid),
      subtitle: `${formatCurrency(totalDue)} still due`,
      icon: Gauge,
      tone: 'emerald' as const,
    },
    {
      title: 'Active Pipeline',
      value: activeProjects,
      subtitle: 'Lead and in-progress projects',
      icon: Lightbulb,
      tone: 'amber' as const,
    },
  ]


  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredProjects = projects
    .filter((project) => {
      const clientName = getClientName(project).toLowerCase()
      const projectName = project.name.toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        projectName.includes(normalizedSearch) ||
        clientName.includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
            ? project.status === 'Completed'
            : project.status === 'Lead' || project.status === 'In Progress'

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'highestDue') {
        return getDueAmount(b) - getDueAmount(a)
      }

      const aDate = a.deadline ? new Date(a.deadline).getTime() : 0
      const bDate = b.deadline ? new Date(b.deadline).getTime() : 0
      return bDate - aDate
    })

  const handleOpenPaymentModal = (projectId: string) => {
    setPaymentProjectId(projectId)
    setPaymentAmount('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setPaymentNote('')
  }

  const handleSavePayment = () => {
    if (!paymentProjectId) return
    const parsedAmount = Number(paymentAmount)
    if (!parsedAmount || parsedAmount <= 0 || !paymentDate) return

    const currentProject = projects.find((project) => project._id === paymentProjectId)
    if (!currentProject) return

    const currentPaid = getPaidAmount(paymentProjectId)
    const nextPaid = currentPaid + parsedAmount
    const budget = currentProject.budget ?? 0
    const nextDue = Math.max(budget - nextPaid, 0)

    const nextStatus: Project['status'] =
      budget > 0 && nextDue === 0 ? 'Completed' : nextPaid > 0 ? 'In Progress' : 'Lead'

    setPaymentUpdates((prev) => ({
      ...prev,
      [paymentProjectId]: [
        ...(prev[paymentProjectId] ?? []),
        { amount: parsedAmount, date: paymentDate, note: paymentNote.trim() || undefined },
      ],
    }))

    setProjects((prev) =>
      prev.map((project) =>
        project._id === paymentProjectId
          ? {
            ...project,
            status: nextStatus,
          }
          : project
      )
    )

    setPaymentProjectId(null)
    setPaymentAmount('')
    setPaymentDate('')
    setPaymentNote('')
  }

  const handleMarkCompleted = async (projectId: string) => {
    try {
      await axiosInstance.patch(`/projects/${projectId}`, { status: 'Completed' })
      setProjects((prev) =>
        prev.map((project) =>
          project._id === projectId
            ? {
              ...project,
              status: 'Completed',
            }
            : project
        )
      )
      toast.success('Project marked as completed')
    } catch (error) {
      toast.error('Failed to update project')
      console.error(error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await axiosInstance.delete(`/projects/${projectId}`)
      setProjects((prev) => prev.filter((project) => project._id !== projectId))
      toast.success('Project deleted')
    } catch (error) {
      toast.error('Failed to delete project')
      console.error(error)
    }
  }

  const openProjectDetail = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const paymentProject = paymentProjectId
    ? projects.find((project) => project._id === paymentProjectId)
    : undefined

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Projects</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage budgets, dues, and payment flow in one place.</p>
        </div>

        <Button onClick={() => setIsAddProjectOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </header>

      <Card className="border border-border/70 bg-card p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by project name or client"
              className="h-10 pl-9"
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | 'active' | 'completed') => setStatusFilter(value)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="active">Status: Active</SelectItem>
                <SelectItem value="completed">Status: Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Select
              value={sortBy}
              onValueChange={(value: 'latest' | 'highestDue') => setSortBy(value)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Sort: Latest</SelectItem>
                <SelectItem value="highestDue">Sort: Highest Due</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {projectStats.map((stat) => (
          <PageStatCard key={stat.title} stat={stat} />
        ))}
      </section>

      {filteredProjects.length === 0 ? (
        <TableEmptyState
          icon={searchTerm || statusFilter !== 'all' ? Filter : FolderOpen}
          title={searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
          description={
            searchTerm || statusFilter !== 'all'
              ? `We couldn't find any projects matching your search or filter. Try adjusting your search terms or clear the filters.`
              : 'Start by creating your first project to track budget and payments.'
          }
          action={{
            label: searchTerm || statusFilter !== 'all' ? 'Clear Filters' : 'Create First Project',
            onClick: () => {
              if (searchTerm || statusFilter !== 'all') {
                setSearchTerm('')
                setStatusFilter('all')
              } else {
                setIsAddProjectOpen(true)
              }
            },
          }}
          isFiltered={searchTerm !== '' || statusFilter !== 'all'}
        />
      ) : isLoading ? (
        <Card className="overflow-hidden border border-border/70 bg-card p-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-border/70 bg-card">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 text-xs uppercase tracking-wide text-muted-foreground">Project Name</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Client Name</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">Budget</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">Paid Amount</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">Due Amount</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</TableHead>
                <TableHead className="w-14 text-right text-xs uppercase tracking-wide text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const paidAmount = getPaidAmount(project._id)
                const dueAmount = getDueAmount(project)
                const moneyStatus = getMoneyStatus(project)

                return (
                  <TableRow
                    key={project._id}
                    className="cursor-pointer"
                    onClick={() => openProjectDetail(project._id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openProjectDetail(project._id)
                      }
                    }}
                    tabIndex={0}
                  >
                    <TableCell className="pl-4">
                      <div>
                        <p className="text-left font-semibold text-foreground hover:underline">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.type || 'General'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/90">{getClientName(project)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(project.budget ?? 0)}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(paidAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium text-foreground">{formatCurrency(dueAmount)}</p>
                      <div className="mt-1 flex justify-end">
                        <Badge className={`border-none text-[10px] ${moneyStatusClasses[moneyStatus]}`}>
                          {moneyStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border-none ${project.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
                          }`}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(project.deadline)}</TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Actions for ${project.name}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => handleOpenPaymentModal(project._id)}>
                            <Wallet className="h-4 w-4" />
                            Update Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navigate(`/projects/${project._id}`)}>
                            <Pencil className="h-4 w-4" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleMarkCompleted(project._id)}>
                            <Check className="h-4 w-4" />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onSelect={() => handleDeleteProject(project._id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Create a project and track its budget, timeline, and payments.
            </DialogDescription>
          </DialogHeader>

          <ProjectForm
            submitLabel="Create Project"
            onSuccess={async () => {
              setIsAddProjectOpen(false)
              try {
                const response = await axiosInstance.get('/projects', {
                  params: { page: 1, limit: 100, sortBy: 'deadline', sortOrder: 'asc' },
                })
                setProjects(response.data.data ?? [])
              } catch (error) {
                console.error('Failed to refresh projects:', error)
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(paymentProjectId)}
        onOpenChange={(open) => {
          if (!open) {
            setPaymentProjectId(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment</DialogTitle>
            <DialogDescription>
              Record amount received for {paymentProject?.name ?? 'this project'}.
            </DialogDescription>
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
                value={paymentAmount}
                autoFocus
                onChange={(event) => setPaymentAmount(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="payment-date" className="text-xs font-medium text-muted-foreground">
                Date
              </label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="payment-note" className="text-xs font-medium text-muted-foreground">
                Note (optional)
              </label>
              <textarea
                id="payment-note"
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                placeholder="Client paid via bank transfer"
                className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSavePayment}>Save Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Projects
