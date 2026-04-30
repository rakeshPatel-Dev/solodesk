import { AlertCircle, Calendar, Check, CircleCheck, Loader, MoreVertical, Pencil, Trash2, Wallet } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { formatCurrency, formatDate, getClientName, getDaysUntilDate, moneyStatusClasses } from './project-page-utils'
import { type Project } from './project-page-types'

type ProjectTableRowProps = {
  project: Project
  onOpenProjectDetail: (projectId: string) => void
  onOpenPaymentModal: (projectId: string) => void
  onEditProject: (projectId: string) => void
  onMarkCompleted: (projectId: string) => void
  onMarkInProgress: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
}

function ProjectTableRow({
  project,
  onOpenProjectDetail,
  onOpenPaymentModal,
  onEditProject,
  onMarkCompleted,
  onMarkInProgress,
  onDeleteProject,
}: ProjectTableRowProps) {
  const paidAmount = project.paidAmount ?? 0
  const dueAmount = project.dueAmount ?? 0
  const paymentStatus = project.paymentStatus ?? 'Unpaid'
  const projectStatus = project.status ?? 'Lead'
  const daysUntilDeadline = getDaysUntilDate(project.deadline)
  const canMarkInProgress = projectStatus === 'Lead'
  const canMarkCompleted = projectStatus !== 'Completed'

  const getDeadlineInfo = () => {
    if (daysUntilDeadline === null) {
      return { text: 'text-muted-foreground', label: 'No deadline', isOverdue: false }
    }
    if (daysUntilDeadline < 0 && projectStatus !== 'Completed') {
      return { text: 'text-red-600 dark:text-red-400', label: 'Overdue', isOverdue: true }
    }
    if (daysUntilDeadline === 0) {
      return { text: 'text-amber-600 dark:text-amber-400', label: 'Today', isOverdue: false }
    }
    if (daysUntilDeadline === 1) {
      return { text: 'text-amber-600 dark:text-amber-400', label: 'Tomorrow', isOverdue: false }
    }
    if (daysUntilDeadline <= 3) {
      return { text: 'text-amber-600 dark:text-amber-400', label: `Due in ${daysUntilDeadline}d`, isOverdue: false }
    }
    if (daysUntilDeadline <= 7) {
      return { text: 'text-yellow-600 dark:text-yellow-400', label: `${daysUntilDeadline}d left`, isOverdue: false }
    }
    return { text: 'text-muted-foreground', label: formatDate(project.deadline), isOverdue: false }
  }

  const deadlineInfo = getDeadlineInfo()

  return (
    <TableRow
      className="group border-b border-border/50 transition-colors hover:bg-muted/40 cursor-pointer"
      onClick={() => onOpenProjectDetail(project._id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenProjectDetail(project._id)
        }
      }}
      tabIndex={0}
    >
      <TableCell className="py-4 pl-6">
        <div>
          <p className="font-semibold text-foreground group-hover:underline">{project.name}</p>
          <Badge variant="secondary" className="text-xs">{project.type || 'General'}</Badge>
        </div>
      </TableCell>
      <TableCell className="py-4 text-foreground/90">{getClientName(project)}</TableCell>
      <TableCell className="py-4 text-right font-medium">{formatCurrency(project.budget ?? 0)}</TableCell>
      <TableCell className="py-4 text-right font-medium text-emerald-700 dark:text-emerald-300">
        {formatCurrency(paidAmount)}
      </TableCell>
      <TableCell className="py-4 text-right">
        <p className="font-medium text-foreground">{formatCurrency(dueAmount)}</p>
        <div className="mt-1 flex justify-end">
          <Badge variant="outline" className={`text-[10px] ${moneyStatusClasses[paymentStatus]}`}>
            {paymentStatus}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <TooltipProvider delayDuration={150}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={`
                ${projectStatus === 'Completed' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}
                ${projectStatus === 'In Progress' && 'bg-sky-500/10 text-sky-700 dark:text-sky-300'}
                ${projectStatus === 'Lead' && 'bg-slate-500/10 text-slate-700 dark:text-slate-300'}
              `}
            >
              {projectStatus}
            </Badge>

            {canMarkInProgress && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-border/70 bg-background/80 text-sky-700 shadow-none transition-all hover:border-sky-300 hover:bg-sky-500/10 hover:text-sky-800 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-sky-500/15"
                    onClick={(event) => {
                      event.stopPropagation()
                      onMarkInProgress(project._id)
                    }}
                    aria-label={`Move ${project.name} to In Progress`}
                  >
                    <Loader className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>In Progress</TooltipContent>
              </Tooltip>
            )}

            {canMarkCompleted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-emerald-800 text-white shadow-sm transition-all hover:bg-emerald-900"
                    onClick={(event) => {
                      event.stopPropagation()
                      onMarkCompleted(project._id)
                    }}
                    aria-label={`Mark ${project.name} as Completed`}
                  >
                    <CircleCheck className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Completed</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </TableCell>
      <TableCell className="py-4 text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center justify-center gap-1.5 text-sm ${deadlineInfo.text}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>{deadlineInfo.label}</span>
                {deadlineInfo.isOverdue && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Deadline: {formatDate(project.deadline)}</p>
              {deadlineInfo.isOverdue && (
                <p className="text-red-500">Overdue by {Math.abs(daysUntilDeadline ?? 0)} days</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell
        className="py-4 pr-4 text-right"
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
}

export default ProjectTableRow