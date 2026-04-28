export type Project = {
  _id: string
  name: string
  description?: string
  clientId?: {
    _id: string
    name: string
  }
  type?: string
  budget?: number
  paidAmount?: number
  dueAmount?: number
  paymentStatus?: 'Paid' | 'Partial' | 'Unpaid'
  status?: 'Lead' | 'In Progress' | 'Completed'
  startDate?: string
  deadline?: string
}

export type PaymentEntry = {
  amount: number
  date: string
  note?: string
}

export type ProjectStatusFilter = 'all' | 'active' | 'completed'

export type ProjectSortBy = 'latest' | 'highestDue'

export type MoneyStatus = 'Paid' | 'Partial' | 'Unpaid'
