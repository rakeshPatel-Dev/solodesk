import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockClients } from '@/data/mockData'
import { MoreVertical } from 'lucide-react'

const Clients = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-2">View and manage your client relationships.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="font-heading font-bold tracking-tight">Import</Button>
          <Button className="font-heading font-bold tracking-tight">Add Client</Button>
        </div>
      </header>

      <section>
        <Card className="bg-card rounded-xl border-none editorial-shadow overflow-hidden p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="py-5 pl-8 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Client Info</TableHead>
                <TableHead className="py-5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="py-5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground text-right">Total Spent</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {mockClients.map((client, i) => (
                <TableRow key={i} className="hover:bg-muted/30 transition-colors group border-none">
                  <TableCell className="py-6 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                        {client.initial}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{client.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant="outline" className={`border-none rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold gap-2 ${
                      client.status === 'Active' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></span>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 text-right font-heading font-bold">
                    {client.spent}
                  </TableCell>
                  <TableCell className="py-6 text-right pr-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  )
}

export default Clients
