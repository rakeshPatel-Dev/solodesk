import { Filter, FolderOpen } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { TableEmptyState } from '@/components/shared/TableEmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import ProjectTableRow from './ProjectTableRow'
import { type Project, type ProjectStatusFilter } from './project-page-types'


type ProjectsTableProps = {
  isLoading: boolean
  projects: Project[]
  searchTerm: string
  statusFilter: ProjectStatusFilter
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
      <Card className="overflow-hidden border border-border/70 bg-card">
        <div className="border-b border-border/60 bg-muted/30 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Project Directory</h2>
            <p className="text-xs text-muted-foreground">Review project budgets, deadlines, and payment progress.</p>
          </div>
        </div>
        <div className="p-6">
          <TableSkeleton rows={5} columns={8} />
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
    <section>
      <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/30 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Project Directory</h2>
            <p className="text-xs text-muted-foreground">Review project budgets, deadlines, and payment progress.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-border/60 bg-background/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Project
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client
                </TableHead>
                <TableHead className="py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Budget
                </TableHead>
                <TableHead className="py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paid
                </TableHead>
                <TableHead className="py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Due
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Deadline
                </TableHead>
                <TableHead className="w-12 py-4"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.map((project) => (
                <ProjectTableRow
                  key={project._id}
                  project={project}
                  onOpenProjectDetail={onOpenProjectDetail}
                  onOpenPaymentModal={onOpenPaymentModal}
                  onEditProject={onEditProject}
                  onMarkCompleted={onMarkCompleted}
                  onDeleteProject={onDeleteProject}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </section>
  )
}

export default ProjectsTable
