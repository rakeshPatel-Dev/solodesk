import { CircleDollarSign, FolderKanban, Gauge, Lightbulb } from 'lucide-react'

import PageStatCard from '@/components/shared/PageStatCard'

import { formatCurrency } from './project-page-utils'
import { type Project } from './project-page-types'

type ProjectsStatsProps = {
  projects: Project[]
}

function ProjectsStats({ projects }: ProjectsStatsProps) {
  const totalBudget = projects.reduce((sum, project) => sum + (project.budget ?? 0), 0)
  const totalPaid = projects.reduce((sum, project) => sum + (project.paidAmount ?? 0), 0)
  const totalDue = projects.reduce((sum, project) => sum + (project.dueAmount ?? 0), 0)
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

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {projectStats.map((stat) => (
        <PageStatCard key={stat.title} stat={stat} />
      ))}
    </section>
  )
}

export default ProjectsStats
