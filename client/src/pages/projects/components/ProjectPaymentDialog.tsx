import ProjectPaymentForm from '@/components/forms/ProjectPaymentForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ProjectPaymentDialogProps = {
  open: boolean
  projectId: string
  projectName?: string
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function ProjectPaymentDialog({
  open,
  projectId,
  projectName,
  onOpenChange,
  onSuccess,
}: ProjectPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Log a payment received for this project. Track your project finances in real-time.
          </DialogDescription>
        </DialogHeader>

        <ProjectPaymentForm
          projectId={projectId}
          projectName={projectName}
          submitLabel="Record Payment"
          onSuccess={() => {
            onOpenChange(false)
            onSuccess?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ProjectPaymentDialog
