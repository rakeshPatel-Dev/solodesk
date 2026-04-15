import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PageStatCard from '@/components/shared/PageStatCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mockClients } from '@/data/mockData'
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

const Clients = () => {
  const activeClients = mockClients.filter((client) => client.status === 'Active').length
  const inactiveClients = mockClients.length - activeClients
  const totalClientSpend = mockClients.reduce((sum, client) => {
    const parsedAmount = Number(client.spent.replace(/[^\d.]/g, ''))
    return sum + (Number.isNaN(parsedAmount) ? 0 : parsedAmount)
  }, 0)

  const clientStats = [
    {
      title: 'Total Clients',
      value: mockClients.length,
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
            <input
              type="text"
              placeholder="Search clients..."
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Clients</DropdownMenuItem>
              <DropdownMenuItem>Active Clients</DropdownMenuItem>
              <DropdownMenuItem>Inactive Clients</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="hidden h-8 sm:block" />

          {/* New Client Button */}
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
              {mockClients.length} records
            </Badge>
          </div>
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
                  <TableHead className="py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Spent
                  </TableHead>
                  <TableHead className="w-12 py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-200/70 bg-sky-500/10 text-xs font-semibold text-sky-700 dark:border-sky-400/20 dark:text-sky-300">
                          {client.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {client.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            ID: {client.id}
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
                    <TableCell className="py-4 text-right font-mono text-sm font-semibold text-foreground">
                      {client.spent}
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
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">
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
        </Card>
      </section>
    </div>
  )
}

export default Clients