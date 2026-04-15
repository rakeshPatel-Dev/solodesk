import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockInvoices } from '@/data/mockData'
import { MoreVertical, ArrowRight } from 'lucide-react'

const Payments = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage your transactional history and client billing.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="font-heading font-bold tracking-tight">Export CSV</Button>
          <Button className="font-heading font-bold tracking-tight">Create Invoice</Button>
        </div>
      </header>

      <section>
        <Card className="bg-card rounded-xl border-none editorial-shadow overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="py-5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Invoice ID</TableHead>
                <TableHead className="py-5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Client</TableHead>
                <TableHead className="py-5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Project</TableHead>
                <TableHead className="py-5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Amount</TableHead>
                <TableHead className="py-5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Date</TableHead>
                <TableHead className="py-5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground text-center">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {mockInvoices.map((invoice, i) => (
                <TableRow key={i} className="hover:bg-muted/30 transition-colors group border-none">
                  <TableCell className="py-6 font-medium text-sm">{invoice.id}</TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {invoice.clientIdentifier}
                      </div>
                      <span className="text-sm font-medium">{invoice.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-sm text-muted-foreground">{invoice.project}</TableCell>
                  <TableCell className="py-6 text-sm font-bold">{invoice.amount}</TableCell>
                  <TableCell className="py-6 text-sm text-muted-foreground">{invoice.date}</TableCell>
                  <TableCell className="py-6">
                    <div className="flex justify-center">
                      <Badge variant="outline" className={`border-none rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold gap-2 ${
                        invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                        invoice.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          invoice.status === 'Paid' ? 'bg-emerald-500' :
                          invoice.status === 'Pending' ? 'bg-yellow-500' :
                          'bg-destructive'
                        }`}></span>
                        {invoice.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-right">
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
        <div className="relative rounded-2xl overflow-hidden aspect-video editorial-shadow bg-secondary flex items-end p-8">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <div className="relative z-20">
            <h4 className="text-white font-heading text-xl font-bold">Payment Insights</h4>
            <p className="text-white/80 text-sm mt-2">See how your revenue has grown over the last fiscal quarter with our new deep-dive analytics tool.</p>
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <h4 className="font-heading text-2xl font-bold tracking-tight">Need help with taxes?</h4>
          <p className="text-muted-foreground leading-relaxed">
            Our premium edition includes automated tax filing reports and expense tracking. Connect your bank account to automate the reconciliation process for all your freelance projects.
          </p>
          <div>
            <Button variant="link" className="px-0 font-bold group inline-flex items-center gap-2">
              Explore Premium Features
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Payments
