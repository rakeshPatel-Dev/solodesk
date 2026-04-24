import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ProjectsHeaderProps = {
  onAddProject: () => void
}

function ProjectsHeader({ onAddProject }: ProjectsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Projects</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage budgets, dues, and payment flow in one place.</p>
      </div>

      <Button onClick={onAddProject}>
        <Plus className="mr-2 h-4 w-4" />
        Add Project
      </Button>
    </header>
  )
}

export default ProjectsHeader
