import ProjectForm from '@/components/forms/ProjectForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type AddProjectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => Promise<void> | void
  projectId?: string
  initialValues?: {
    name?: string
    description?: string
    clientId?: string
    type?: string
    budget?: string
    status?: "Lead" | "In Progress" | "Completed"
    startDate?: string
    deadline?: string
  }
}

function AddProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  projectId,
  initialValues
}: AddProjectDialogProps) {
  const isEditMode = !!projectId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update project details and tracking information.'
              : 'Create a project and track its budget, timeline, and payments.'
            }
          </DialogDescription>
        </DialogHeader>

        <ProjectForm
          submitLabel={isEditMode ? "Update Project" : "Create Project"}
          onSuccess={() => {
            onOpenChange(false)
            onSuccess?.()
          }}
          projectId={projectId}
          initialValues={initialValues}
        />
      </DialogContent>
    </Dialog>
  )
}

export default AddProjectDialog
