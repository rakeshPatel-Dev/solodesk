import { cn } from '@/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

type TableSkeletonProps = {
  rows?: number
  columns?: number
}

function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          {Array.from({ length: columns - 2 }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 w-16" />
          ))}
        </div>
      ))}
    </div>
  )
}

type CardSkeletonProps = {
  lines?: number
}

function CardSkeleton({ lines = 3 }: CardSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4', index === lines - 1 && 'w-1/2')}
        />
      ))}
    </div>
  )
}

export { Skeleton, TableSkeleton, CardSkeleton }
