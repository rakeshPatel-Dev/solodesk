export type Client = {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  notes?: string
  status?: 'Active' | 'Inactive'
  amountSpend?: number
}

export type ClientStatusFilter = 'all' | 'Active' | 'Inactive'

export type ClientStatsData = {
  total: number
  active: number
  inactive: number
  totalSpend: number
}