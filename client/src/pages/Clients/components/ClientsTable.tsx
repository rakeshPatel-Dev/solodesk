import { Filter, FolderOpen, ListFilter, MoreVertical, Pencil, Repeat2, Search, Trash2, Loader2, Mail, Copy, Phone } from 'lucide-react'

import { TableEmptyState } from '@/components/shared/TableEmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getInitials } from './client-page-utils'
import { type Client, type ClientStatusFilter } from './client-page-types'

type ClientsTableProps = {
  isLoading: boolean
  clients: Client[]
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  filterStatus: ClientStatusFilter
  onFilterStatusChange: (status: ClientStatusFilter) => void
  onClearFilters: () => void
  onCreateFirstClient: () => void
  onEditClient: (client: Client) => void
  onToggleClientStatus: (client: Client) => void
  statusUpdatingClientId?: string | null
  onDeleteClient: (clientId: string, clientName: string) => void
}

function ClientsTable({
  isLoading,
  clients,
  searchQuery,
  onSearchQueryChange,
  filterStatus,
  onFilterStatusChange,
  onClearFilters,
  onCreateFirstClient,
  onEditClient,
  onToggleClientStatus,
  statusUpdatingClientId,
  onDeleteClient,
}: ClientsTableProps) {
  return (
    <section>
      <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/30 px-6 py-4 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Client Directory</h2>
            <p className="text-xs text-muted-foreground">Review client details, status, and lifetime value.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                className="pl-9"
              />
            </div>

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
                <DropdownMenuItem onClick={() => onFilterStatusChange('all')}>
                  All Clients
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterStatusChange('Active')}>
                  Active Clients
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterStatusChange('Inactive')}>
                  Inactive Clients
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={5} />
          </div>
        ) : clients.length === 0 ? (
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
              onClick: searchQuery || filterStatus !== 'all' ? onClearFilters : onCreateFirstClient,
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
                {clients.map((client) => (
                  <TableRow
                    key={client._id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-foreground to-foreground/50 dark:bg-linear-to-br dark:from-foreground dark:to-foreground/50 border border-border dark:border-border/50 shadow-sm">
                            <span className="text-sm font-bold bg-linear-to-br from-black to-black/50 italic dark:bg-linear-to-br dark:from-white dark:to-white/50  bg-clip-text text-white dark:text-black">
                              {getInitials(client.name)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {client.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            # {client._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 group/email">
                          <Mail className="h-3 w-3 text-muted-foreground/50" />
                          <p
                            title={client.email}
                            className="text-sm text-foreground/90 truncate max-w-45">
                            {client.email}
                          </p>
                          <button
                            title="Copy email address"
                            onClick={() => navigator.clipboard.writeText(client.email)}
                            className="opacity-0 group-hover/email:opacity-100 transition-opacity"
                          >
                            <Copy className="h-3 w-3 text-muted-foreground/40 hover:text-foreground" />
                          </button>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-muted-foreground/50" />
                            <p className="text-xs text-muted-foreground">
                              {client.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center justify-between gap-2">
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

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          aria-label={`Toggle status for ${client.name}`}
                          title={`Set ${client.name} as ${client.status === 'Active' ? 'Inactive' : 'Active'}`}
                          onClick={() => onToggleClientStatus(client)}
                          disabled={statusUpdatingClientId === client._id}
                        >
                          {statusUpdatingClientId === client._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Repeat2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
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
                          <DropdownMenuItem onClick={() => onEditClient(client)}>
                            <Pencil className="h-4 w-4" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDeleteClient(client._id, client.name)}
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
  )
}

export default ClientsTable