import { type MoneyStatus, type Project } from './project-page-types'

export const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatCurrency = (value = 0) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

export const getClientName = (project: Project) => {
  const clientValue = project.clientId
  if (typeof clientValue === 'string') return clientValue

  return clientValue?.name ?? 'Unknown client'
}

export const moneyStatusClasses: Record<MoneyStatus, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Partial: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Unpaid: 'bg-red-500/10 text-red-700 dark:text-red-300',
}
