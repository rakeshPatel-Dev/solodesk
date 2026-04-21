import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageStatCard from '@/components/shared/PageStatCard'
import { TableEmptyState } from '@/components/shared/TableEmptyState'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDollarSign, Clock3, MoreVertical, FolderOpen } from 'lucide-react'

type Invoice = {
  _id: string
  id?: string
  clientIdentifier?: string
  clientName?: string
  projectName?: string
  amount: number | string
  date?: string
  status?: 'Paid' | 'Pending' | 'Overdue'
}

const Payments = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get('/payments', {
          params: { page: 1, limit: 100, sortBy: 'date', sortOrder: 'desc' },
        })
        setInvoices(response.data.data ?? [])
      } catch (error) {
        toast.error('Failed to load payments')
        console.error(error)
        // Fall back to empty data
        setInvoices([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const toAmount = (value: string | number) => {
    if (typeof value === 'number') return value
    return Number(String(value).replace(/[^\d.]/g, ''))
  }

  const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid').length
  const pendingInvoices = invoices.filter((invoice) => invoice.status === 'Pending').length
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'Overdue')

  const totalInvoicedAmount = invoices.reduce((sum, invoice) => sum + toAmount(invoice.amount), 0)
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + toAmount(invoice.amount), 0)

  const paymentStats = [
    {
      title: 'Total Invoiced',
      value: `$${totalInvoicedAmount.toLocaleString()}`,
      subtitle: 'Combined value across all invoices',
      icon: CircleDollarSign,
      tone: 'indigo' as const,
    },
    {
      title: 'Paid Invoices',
      value: paidInvoices,
      subtitle: 'Successfully settled invoices',
      icon: CheckCircle2,
      tone: 'emerald' as const,
    },
    {
      title: 'Pending Invoices',
      value: pendingInvoices,
      subtitle: 'Awaiting confirmation from clients',
      icon: Clock3,
      tone: 'amber' as const,
    },
    {
      title: 'Overdue Amount',
      value: `$${overdueAmount.toLocaleString()}`,
      subtitle: `${overdueInvoices.length} invoice(s) need follow-up`,
      icon: AlertTriangle,
      tone: 'rose' as const,
    },
  ]

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

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {paymentStats.map((stat) => (
          <PageStatCard key={stat.title} stat={stat} />
        ))}
      </section>

      <section>
        <Card className="bg-card rounded-xl border-none editorial-shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading payments...</p>
            </div>
          ) : invoices.length === 0 ? (
            <TableEmptyState
              icon={FolderOpen}
              title="No invoices yet"
              description="Create your first invoice to start managing client payments and track your revenue."
              action={{
                label: 'Create Invoice',
                onClick: () => {
                  // TODO: Handle create invoice action
                },
              }}
            />
          ) : (
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
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id} className="hover:bg-muted/30 transition-colors group border-none">
                    <TableCell className="py-6 font-medium text-sm">{invoice.id || invoice._id.substring(0, 8)}</TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                          {invoice.clientIdentifier || '-'}
                        </div>
                        <span className="text-sm font-medium">{invoice.clientName || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-sm text-muted-foreground">{invoice.projectName || '-'}</TableCell>
                    <TableCell className="py-6 text-sm font-bold">${typeof invoice.amount === 'number' ? invoice.amount.toLocaleString() : invoice.amount}</TableCell>
                    <TableCell className="py-6 text-sm text-muted-foreground">{invoice.date || '-'}</TableCell>
                    <TableCell className="py-6">
                      <div className="flex justify-center">
                        <Badge variant="outline" className={`border-none rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold gap-2 ${invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                          invoice.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${invoice.status === 'Paid' ? 'bg-emerald-500' :
                            invoice.status === 'Pending' ? 'bg-yellow-500' :
                              'bg-destructive'
                            }`}></span>
                          {invoice.status || 'Pending'}
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
          )}
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
        <div className="relative rounded-2xl overflow-hidden aspect-video editorial-shadow bg-secondary flex items-end p-8">
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
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
