import { type MoneyStatus, type Project } from './project-page-types'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const parseDateValue = (value?: string) => {
  if (!value) return null

  const isDateOnlyValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const parsedDate = isDateOnlyValue ? new Date(`${value}T00:00:00`) : new Date(value)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const toLocalStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const getDaysUntilDate = (value?: string) => {
  const date = parseDateValue(value)
  if (!date) return null

  const today = toLocalStartOfDay(new Date())
  const target = toLocalStartOfDay(date)

  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY)
}

export const formatDate = (value?: string) => {
  const date = parseDateValue(value)
  if (!date) return '-'

  const todayOffset = getDaysUntilDate(value)

  if (todayOffset === 0) return 'Today'
  if (todayOffset === 1) return 'Tomorrow'

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
