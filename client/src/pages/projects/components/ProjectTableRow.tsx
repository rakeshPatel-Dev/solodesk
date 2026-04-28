import { AlertCircle, Calendar, Check, MoreVertical, Pencil, Trash2, Wallet } from 'lucide-react'

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

import { formatCurrency, formatDate, getClientName, moneyStatusClasses } from './project-page-utils'
import { type Project } from './project-page-types'

type ProjectTableRowProps = {
  project: Project
  onOpenProjectDetail: (projectId: string) => void
  onOpenPaymentModal: (projectId: string) => void
  onEditProject: (projectId: string) => void
  onMarkCompleted: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
}

const getDaysUntilDeadline = (deadline?: string) => {
  if (!deadline) return null

  const deadlineDate = new Date(deadline)
  if (Number.isNaN(deadlineDate.getTime())) return null

  const today = new Date()
  const diffTime = deadlineDate.getTime() - today.getTime()

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function ProjectTableRow({
  project,
  onOpenProjectDetail,
  onOpenPaymentModal,
  onEditProject,
  onMarkCompleted,
  onDeleteProject,
}: ProjectTableRowProps) {
  const paidAmount = project.paidAmount ?? 0
  const dueAmount = project.dueAmount ?? 0
  const paymentStatus = project.paymentStatus ?? 'Unpaid'
  const projectStatus = project.status ?? 'Lead'
  const daysUntilDeadline = getDaysUntilDeadline(project.deadline)
  const deadlineInfo =
    daysUntilDeadline === null
      ? {
        text: 'text-muted-foreground',
        label: 'No deadline',
        isOverdue: false,
      }
      : daysUntilDeadline < 0 && projectStatus !== 'Completed'
        ? { text: 'text-red-600 dark:text-red-400', label: 'Overdue', isOverdue: true }
        : daysUntilDeadline <= 3
          ? {
            text: 'text-amber-600 dark:text-amber-400',
            label: `Due in ${daysUntilDeadline}d`,
            isOverdue: false,
          }
          : daysUntilDeadline <= 7
            ? {
              text: 'text-yellow-600 dark:text-yellow-400',
              label: `${daysUntilDeadline}d left`,
              isOverdue: false,
            }
            : {
              text: 'text-muted-foreground',
              label: formatDate(project.deadline),
              isOverdue: false,
            }

  return (
    <TableRow
      className="border-b border-border/50 transition-colors hover:bg-muted/40 cursor-pointer"
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
          <p className="font-semibold text-foreground hover:underline">{project.name}</p>
          <Badge className="text-xs">{project.type || 'General'}</Badge>
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
          <Badge className={`border-none text-[10px] ${moneyStatusClasses[paymentStatus]}`}>
            {paymentStatus}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Badge
          className={`border-none ${projectStatus === 'Completed'
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
            }`}
        >
          {projectStatus}
        </Badge>
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