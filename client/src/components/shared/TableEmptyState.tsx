import React from 'react'
import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TableEmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  isFiltered?: boolean
}

export function TableEmptyState({
  icon: Icon,
  title,
  description,
  action,
  isFiltered = false,
}: TableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="mb-4 rounded-full bg-muted/50 p-3">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          variant={isFiltered ? 'outline' : 'default'}
          className={isFiltered ? 'text-muted-foreground' : ''}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
