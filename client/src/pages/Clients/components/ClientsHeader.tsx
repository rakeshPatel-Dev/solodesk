import { UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ClientsHeaderProps = {
  onAddClient: () => void
}

function ClientsHeader({ onAddClient }: ClientsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground lg:text-3xl">
          Clients
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage your client relationships
        </p>
      </div>

      <Button
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onAddClient}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        New Client
      </Button>
    </div>
  )
}

export default ClientsHeader