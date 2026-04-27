import { useState, useEffect, useCallback } from 'react'
import ClientForm from '@/components/forms/ClientForm'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import {
  Pencil,
  Building2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ClientsHeader from './components/ClientsHeader'
import ClientsPagination from './components/ClientsPagination'
import ClientsStats from './components/ClientsStats'
import ClientsTable from './components/ClientsTable'
import {
  type Client,
  type ClientStatusFilter,
  type ClientStatsData,
} from './components/client-page-types'

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<ClientStatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalClients, setTotalClients] = useState(0)
  const [statusUpdatingClientId, setStatusUpdatingClientId] = useState<string | null>(null)
  const [clientStats, setClientStats] = useState<ClientStatsData>({
    total: 0,
    active: 0,
    inactive: 0,
    totalSpend: 0,
  })

  const limit = 10

  // Debounce search query with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchClientStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/clients/stats')
      const stats = response.data?.data ?? {}

      setClientStats({
        total: Number(stats.total ?? 0),
        active: Number(stats.active ?? 0),
        inactive: Number(stats.inactive ?? 0),
        totalSpend: Number(stats.totalSpend ?? 0),
      })
    } catch (error) {
      console.error('Failed to load client stats', error)
    }
  }, [])


  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true)
      const [clientsResponse] = await Promise.all([
        axiosInstance.get('/clients', {
          params: {
            page: currentPage,
            limit,
            sortBy: 'name',
            sortOrder: 'asc',
            status: filterStatus,
            search: debouncedSearchQuery.trim() || undefined,
          },
        }),
        fetchClientStats(),
      ])

      setClients(clientsResponse.data.data ?? [])
      setTotalPages(Number(clientsResponse.data.pagination?.pages ?? 1))
      setTotalClients(clientsResponse.data.pagination.total)
    } catch (error) {
      toast.error('Failed to load clients')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filterStatus, debouncedSearchQuery, limit, fetchClientStats])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterStatusChange = (status: ClientStatusFilter) => {
    setCurrentPage(1)
    setFilterStatus(status)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditClientOpen(true)
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      return
    }

    try {
      await axiosInstance.delete(`/clients/${clientId}`)
      toast.success('Client deleted successfully')
      await fetchClients()
    } catch (error) {
      toast.error('Failed to delete client')
      console.error(error)
    }
  }

  const handleToggleClientStatus = async (client: Client) => {
    const currentStatus = client.status === 'Inactive' ? 'Inactive' : 'Active'
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'

    try {
      setStatusUpdatingClientId(client._id)
      await axiosInstance.patch(`/clients/${client._id}/status`, { status: nextStatus })
      toast.success(`${client.name} set to ${nextStatus}`)
      await fetchClients()
    } catch (error) {
      toast.error('Failed to update client status')
      console.error(error)
    } finally {
      setStatusUpdatingClientId(null)
    }
  }

  const handleRefreshClients = async () => {
    await fetchClients()
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <ClientsHeader
        onAddClient={() => setIsAddClientOpen(true)}
      />

      <ClientsStats stats={clientStats} />

      <ClientsTable
        isLoading={isLoading}
        clients={clients}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        filterStatus={filterStatus}
        onFilterStatusChange={handleFilterStatusChange}
        onClearFilters={() => {
          setCurrentPage(1)
          setSearchQuery('')
          setFilterStatus('all')
        }}
        onCreateFirstClient={() => setIsAddClientOpen(true)}
        onEditClient={handleEditClient}
        onToggleClientStatus={handleToggleClientStatus}
        statusUpdatingClientId={statusUpdatingClientId}
        onDeleteClient={handleDeleteClient}
      />

      <ClientsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalClients={totalClients}
        pageSize={limit}
        onPageChange={(page) => {
          if (page < 1 || page > totalPages || page === currentPage) {
            return
          }
          setCurrentPage(page)
        }}
      />

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto p-2 sm:max-w-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              Add New Client
            </DialogTitle>
            <DialogDescription>
              Create a client and start assigning projects. You can add more details later.
            </DialogDescription>
          </DialogHeader>

          <ClientForm
            submitLabel="Create Client"
            showCancel={true}
            cancelLabel="Cancel"
            onSuccess={async () => {
              setIsAddClientOpen(false)
              await handleRefreshClients()
            }}
            onCancel={() => setIsAddClientOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-2 sm:max-w-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Client
            </DialogTitle>
            <DialogDescription>
              Update client information and manage their details.
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <ClientForm
              clientId={selectedClient._id}
              initialValues={{
                name: selectedClient.name,
                email: selectedClient.email ?? '',
                phone: selectedClient.phone ?? '',
                address: selectedClient.address ?? '',
                notes: selectedClient.notes ?? '',
                status: selectedClient.status ?? 'Active',
              }}
              submitLabel="Update Client"
              showCancel={true}
              cancelLabel="Cancel"
              onSuccess={async () => {
                setIsEditClientOpen(false)
                setSelectedClient(null)
                await handleRefreshClients()
              }}
              onCancel={() => {
                setIsEditClientOpen(false)
                setSelectedClient(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Clients