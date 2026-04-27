import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type ClientsPaginationProps = {
  currentPage: number
  totalPages: number
  totalClients: number
  pageSize: number
  onPageChange: (page: number) => void
}

const MAX_VISIBLE_PAGES = 5

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])

  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) pages.add(page)
  }

  return Array.from(pages).sort((a, b) => a - b)
}

function ClientsPagination({
  currentPage,
  totalPages,
  totalClients,
  pageSize,
  onPageChange,
}: ClientsPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalClients)
  const pages = getVisiblePages(currentPage, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing {start} to {end} of {totalClients} clients
      </p>

      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            />
          </PaginationItem>

          {pages.map((page, index) => {
            const previousPage = pages[index - 1]
            const shouldShowEllipsis = previousPage && page - previousPage > 1

            return (
              <PaginationItem key={page}>
                {shouldShowEllipsis && <PaginationEllipsis />}
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default ClientsPagination