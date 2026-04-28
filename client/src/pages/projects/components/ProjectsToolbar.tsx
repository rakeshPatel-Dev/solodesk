import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ProjectsToolbarProps = {
  onAddProject: () => void
}

function ProjectsToolbar({ onAddProject }: ProjectsToolbarProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground lg:text-3xl">
          Projects
        </h1>
        <p className="text-sm text-muted-foreground">
          Track budgets, deadlines, and payment flow in one place.
        </p>
      </div>

      <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onAddProject}>
        <Plus className="mr-2 h-4 w-4" />
        New Project
      </Button>
    </header>
  )
}

export default ProjectsToolbar