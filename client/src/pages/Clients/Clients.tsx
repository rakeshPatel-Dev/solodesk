import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import PageStatCard from '@/components/shared/PageStatCard'
import ClientForm from '@/components/forms/ClientForm'
import { TableEmptyState } from '@/components/shared/TableEmptyState'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import {
  CircleDollarSign,
  ListFilter,
  MoreVertical,
  Pencil,
  Search,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Trash2,
  Building2,
  FolderOpen,
  Filter,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Client = {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  notes?: string
  status?: 'Active' | 'Inactive'
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all')

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get('/clients', {
        params: { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' },
      })
      setClients(response.data.data ?? [])
    } catch (error) {
      toast.error('Failed to load clients')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditClientOpen(true)
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      return
    }

    try {
      await axiosInstance.delete(`/clients/${clientId}`)
      toast.success('Client deleted successfully')
      await fetchClients()
    } catch (error) {
      toast.error('Failed to delete client')
      console.error(error)
    }
  }

  const handleRefreshClients = async () => {
    await fetchClients()
  }

  // Filter and search clients
  const filteredClients = clients.filter((client) => {
    // Filter by status
    if (filterStatus !== 'all' && client.status !== filterStatus) {
      return false
    }

    // Search by name, email, or phone
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesName = client.name.toLowerCase().includes(query)
      const matchesEmail = client.email?.toLowerCase().includes(query)
      const matchesPhone = client.phone?.toLowerCase().includes(query)

      return matchesName || matchesEmail || matchesPhone
    }

    return true
  })

  const activeClients = clients.filter((client) => client.status === 'Active').length
  const inactiveClients = clients.length - activeClients
  const totalClientSpend = 0 // Would need to calculate from projects associated with each client

  const clientStats = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: Users,
      subTitle: 'All organizations onboarded',
      tone: 'sky' as const,
    },
    {
      title: 'Active Clients',
      value: activeClients,
      icon: UserCheck,
      subTitle: 'Currently engaged this month',
      tone: 'emerald' as const,
    },
    {
      title: 'Inactive Clients',
      value: inactiveClients,
      icon: UserX,
      subTitle: 'Need re-engagement follow-up',
      tone: 'amber' as const,
    },
    {
      title: 'Total Spend',
      value: `$${totalClientSpend.toLocaleString()}`,
      icon: CircleDollarSign,
      subTitle: 'Lifetime spend from all clients',
      tone: 'indigo' as const,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground lg:text-3xl">
            Clients
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage your client relationships
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-border bg-background text-foreground hover:bg-muted/60"
              >
                <ListFilter className="mr-2 h-4 w-4" />
                Filter {filterStatus !== 'all' && `(${filterStatus})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Active')}>
                Active Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Inactive')}>
                Inactive Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="hidden h-8 sm:block" />

          {/* New Client Button */}
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsAddClientOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {clientStats.map((stat) => (
          <PageStatCard
            key={stat.title}
            stat={{
              title: stat.title,
              value: stat.value,
              icon: stat.icon,
              subtitle: stat.subTitle,
              tone: stat.tone,
            }}
          />
        ))}
      </section>

      {/* Clients Table */}
      <section>
        <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Client Directory</h2>
              <p className="text-xs text-muted-foreground">Review client details, status, and lifetime value.</p>
            </div>
            <Badge variant="secondary" className="bg-sky-500/10 text-sky-700 dark:text-sky-300">
              {filteredClients.length} of {clients.length} records
            </Badge>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <TableEmptyState
              icon={searchQuery || filterStatus !== 'all' ? Filter : FolderOpen}
              title={searchQuery || filterStatus !== 'all' ? 'No results found' : 'No clients yet'}

              description={
                searchQuery || filterStatus !== 'all'
                  ? `We couldn't find any clients matching your search or filter. Try adjusting your search terms or clear the filters.`
                  : 'Start by creating your first client to manage your client relationships.'
              }
              action={{
                label: searchQuery || filterStatus !== 'all' ? 'Clear Filters' : 'Create First Client',
                onClick: () => {
                  if (searchQuery || filterStatus !== 'all') {
                    setSearchQuery('')
                    setFilterStatus('all')
                  } else {
                    setIsAddClientOpen(true)
                  }
                },
              }}
              isFiltered={searchQuery !== '' || filterStatus !== 'all'}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-border/60 bg-background/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Client
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contact
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Notes
                    </TableHead>
                    <TableHead className="py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Spent
                    </TableHead>
                    <TableHead className="w-12 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow
                      key={client._id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-200/70 bg-sky-500/10 text-xs font-semibold text-sky-700 dark:border-sky-400/20 dark:text-sky-300">
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {client.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              ID: {client._id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <p className="text-sm text-foreground/90">
                            {client.email}
                          </p>
                          {client.phone && (
                            <p className="text-xs text-muted-foreground">
                              {client.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={`rounded-full border-none px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${client.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            }`}
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${client.status === 'Active'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                              }`}
                          ></span>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {client.notes ? (
                          <div className="max-w-xs truncate text-sm text-muted-foreground" title={client.notes}>
                            {client.notes}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground/50 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-right font-mono text-sm font-semibold text-foreground">
                        $0
                      </TableCell>
                      <TableCell className="py-4 pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Open actions for ${client.name}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditClient(client)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteClient(client._id, client.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </section>

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto p-2 sm:max-w-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              Add New Client
            </DialogTitle>
            <DialogDescription>
              Create a client and start assigning projects. You can add more details later.
            </DialogDescription>
          </DialogHeader>

          <ClientForm
            submitLabel="Create Client"
            showCancel={true}
            cancelLabel="Cancel"
            onSuccess={async () => {
              setIsAddClientOpen(false)
              await handleRefreshClients()
            }}
            onCancel={() => setIsAddClientOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-2 sm:max-w-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Client
            </DialogTitle>
            <DialogDescription>
              Update client information and manage their details.
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <ClientForm
              clientId={selectedClient._id}
              initialValues={{
                name: selectedClient.name,
                email: selectedClient.email ?? '',
                phone: selectedClient.phone ?? '',
                address: selectedClient.address ?? '',
                notes: selectedClient.notes ?? '',
                status: selectedClient.status ?? 'Active',
              }}
              submitLabel="Update Client"
              showCancel={true}
              cancelLabel="Cancel"
              onSuccess={async () => {
                setIsEditClientOpen(false)
                setSelectedClient(null)
                await handleRefreshClients()
              }}
              onCancel={() => {
                setIsEditClientOpen(false)
                setSelectedClient(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Clients