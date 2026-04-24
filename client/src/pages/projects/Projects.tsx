import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import ProjectsFilters from './components/ProjectsFilters'
import ProjectsHeader from './components/ProjectsHeader'
import ProjectsStats from './components/ProjectsStats'
import ProjectsTable from './components/ProjectsTable'
import { getClientName } from './components/project-page-utils'
import {
  type MoneyStatus,
  type Project,
  type ProjectSortBy,
  type ProjectStatusFilter,
} from './components/project-page-types'

const AddProjectDialog = lazy(() => import('./components/AddProjectDialog'))
const ProjectPaymentDialog = lazy(() => import('./components/ProjectPaymentDialog'))

const Projects = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all')
  const [sortBy, setSortBy] = useState<ProjectSortBy>('latest')
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  const [paymentProjectId, setPaymentProjectId] = useState<string | null>(null)

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

  useEffect(() => {
    fetchProjects()
  }, [])


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPaidAmount = (_projectId: string) => {
    // Payment tracking is now handled by the API
    // This can be updated if the Project object includes payment data
    return 0
  }

  const getDueAmount = (project: Project) => {
    // Due amount is calculated from budget (payments tracked by API)
    return project.budget ?? 0
  }

  const getMoneyStatus = (project: Project): MoneyStatus => {
    const paid = getPaidAmount(project._id)
    const budget = project.budget ?? 0
    const due = getDueAmount(project)

    if (budget > 0 && due === 0 && paid >= budget) return 'Paid'
    if (paid > 0) return 'Partial'
    return 'Unpaid'
  }


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
  }

  const handleSavePayment = async () => {
    if (!paymentProjectId) return
    await fetchProjects()
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

  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId)
    setIsAddProjectOpen(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const editingProject = editingProjectId
    ? projects.find((project) => project._id === editingProjectId)
    : undefined

  const paymentProject = paymentProjectId
    ? projects.find((project) => project._id === paymentProjectId)
    : undefined

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <ProjectsHeader onAddProject={() => setIsAddProjectOpen(true)} />

      <ProjectsFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <ProjectsStats
        projects={projects}
        getPaidAmount={getPaidAmount}
        getDueAmount={getDueAmount}
      />

      <ProjectsTable
        isLoading={isLoading}
        projects={filteredProjects}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        getPaidAmount={getPaidAmount}
        getDueAmount={getDueAmount}
        getMoneyStatus={getMoneyStatus}
        onClearFilters={handleClearFilters}
        onCreateFirstProject={() => setIsAddProjectOpen(true)}
        onOpenProjectDetail={openProjectDetail}
        onOpenPaymentModal={handleOpenPaymentModal}
        onEditProject={handleEditProject}
        onMarkCompleted={handleMarkCompleted}
        onDeleteProject={handleDeleteProject}
      />

      {isAddProjectOpen && (
        <Suspense fallback={null}>
          <AddProjectDialog
            open={isAddProjectOpen}
            onOpenChange={(open) => {
              setIsAddProjectOpen(open)
              if (!open) {
                setEditingProjectId(null)
              }
            }}
            projectId={editingProjectId || undefined}
            initialValues={editingProject ? {
              name: editingProject.name,
              description: editingProject.description,
              clientId: editingProject.clientId?._id,
              type: editingProject.type,
              budget: editingProject.budget?.toString(),
              status: editingProject.status as "Lead" | "In Progress" | "Completed",
              startDate: editingProject.startDate,
              deadline: editingProject.deadline,
            } : undefined}
            onSuccess={async () => {
              setIsAddProjectOpen(false)
              setEditingProjectId(null)
              await fetchProjects()
            }}
          />
        </Suspense>
      )}

      {Boolean(paymentProjectId) && (
        <Suspense fallback={null}>
          <ProjectPaymentDialog
            open={Boolean(paymentProjectId)}
            projectId={paymentProjectId!}
            projectName={paymentProject?.name}
            onOpenChange={(open) => {
              if (!open) {
                setPaymentProjectId(null)
              }
            }}
            onSuccess={handleSavePayment}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Projects
