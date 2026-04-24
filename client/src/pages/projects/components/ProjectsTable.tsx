import { MoreVertical, Check, Pencil, Trash2, Wallet, Filter, FolderOpen } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TableEmptyState } from '@/components/shared/TableEmptyState'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { formatCurrency, formatDate, getClientName, moneyStatusClasses } from './project-page-utils'
import { type MoneyStatus, type Project, type ProjectStatusFilter } from './project-page-types'

type ProjectsTableProps = {
  isLoading: boolean
  projects: Project[]
  searchTerm: string
  statusFilter: ProjectStatusFilter
  getPaidAmount: (projectId: string) => number
  getDueAmount: (project: Project) => number
  getMoneyStatus: (project: Project) => MoneyStatus
  onClearFilters: () => void
  onCreateFirstProject: () => void
  onOpenProjectDetail: (projectId: string) => void
  onOpenPaymentModal: (projectId: string) => void
  onEditProject: (projectId: string) => void
  onMarkCompleted: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
}

function ProjectsTable({
  isLoading,
  projects,
  searchTerm,
  statusFilter,
  getPaidAmount,
  getDueAmount,
  getMoneyStatus,
  onClearFilters,
  onCreateFirstProject,
  onOpenProjectDetail,
  onOpenPaymentModal,
  onEditProject,
  onMarkCompleted,
  onDeleteProject,
}: ProjectsTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border border-border/70 bg-card p-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
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
          onClick: searchTerm || statusFilter !== 'all' ? onClearFilters : onCreateFirstProject,
        }}
        isFiltered={searchTerm !== '' || statusFilter !== 'all'}
      />
    )
  }

  return (
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
          {projects.map((project) => {
            const paidAmount = getPaidAmount(project._id)
            const dueAmount = getDueAmount(project)
            const moneyStatus = getMoneyStatus(project)

            return (
              <TableRow
                key={project._id}
                className="cursor-pointer"
                onClick={() => onOpenProjectDetail(project._id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpenProjectDetail(project._id)
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
                      <DropdownMenuItem onSelect={() => onOpenPaymentModal(project._id)}>
                        <Wallet className="h-4 w-4" />
                        Update Payment
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onEditProject(project._id)}>
                        <Pencil className="h-4 w-4" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onMarkCompleted(project._id)}>
                        <Check className="h-4 w-4" />
                        Mark Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => onDeleteProject(project._id)}>
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
  )
}

export default ProjectsTable
