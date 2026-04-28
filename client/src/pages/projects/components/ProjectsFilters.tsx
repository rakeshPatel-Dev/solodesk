import { Filter, Search } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { type ProjectSortBy, type ProjectStatusFilter } from './project-page-types'

type ProjectsFiltersProps = {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  statusFilter: ProjectStatusFilter
  onStatusFilterChange: (value: ProjectStatusFilter) => void
  sortBy: ProjectSortBy
  onSortByChange: (value: ProjectSortBy) => void
}

function ProjectsFilters({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}: ProjectsFiltersProps) {
  return (
    <Card className="border border-border/70 bg-card p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-12">
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search projects by name or client..."
            className="pl-9"
          />
        </div>

        <div className="md:col-span-3">
          <Select
            value={statusFilter}
            onValueChange={(value: ProjectStatusFilter) => onStatusFilterChange(value)}
          >
            <SelectTrigger className="w-full">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="active">Status: Active</SelectItem>
              <SelectItem value="completed">Status: Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <Select
            value={sortBy}
            onValueChange={(value: ProjectSortBy) => onSortByChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Sort: Latest</SelectItem>
              <SelectItem value="highestDue">Sort: Highest Due</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}

export default ProjectsFilters
