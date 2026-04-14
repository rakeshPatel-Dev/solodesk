import { useMemo } from 'react'

const DateComponent = () => {
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  return (
    <div className="flex items-center justify-center px-4 bg-linear-to-r from-accent py-2 border border-border/60 to-muted/30 gap-2">
      <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Today
      </span>
      <span className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
      <time
        dateTime={new Date().toISOString().split('T')[0]}
        className="text-base font-semibold text-neutral-700 dark:text-neutral-300"
      >
        {currentDate}
      </time>
    </div>
  )
}

export default DateComponent