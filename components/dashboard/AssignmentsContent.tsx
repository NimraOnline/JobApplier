"use client"

import { useState, useMemo } from "react"
import { bulkAssignAction } from "@/app/actions/assignments"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  Loader2, 
  UserPlus2, 
  ShieldCheck, 
  Users, 
  ArrowUpDown, 
  AlertCircle,
  Search,
  X,
  CheckCircle2
} from "lucide-react"

interface AssignmentsContentProps {
  clients: any[]
  employees: any[]
}

type SortConfig = {
  key: 'name' | 'email' | 'status' | 'assigned_to'
  direction: 'asc' | 'desc'
}

type FilterType = 'all' | 'unassigned' | 'assigned'

export function AssignmentsContent({ clients, employees }: AssignmentsContentProps) {
  // Action State
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [filterType, setFilterType] = useState<FilterType>('all')
  
  // Sort State
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' })

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // The Master Data Pipeline: Filter -> Search -> Sort
  const filteredAndSortedClients = useMemo(() => {
    if (!clients) return []
    let result = [...clients]

    // 1. Apply Quick Filters (Unassigned / Assigned)
    if (filterType === 'unassigned') {
      result = result.filter(c => {
        const assignments = Array.isArray(c.client_assignments) ? c.client_assignments : []
        return !assignments.find((a: any) => a.is_active)
      })
    } else if (filterType === 'assigned') {
      result = result.filter(c => {
        const assignments = Array.isArray(c.client_assignments) ? c.client_assignments : []
        return !!assignments.find((a: any) => a.is_active)
      })
    }

    // 2. Apply Omni-Search (Name, Email, or Assigned Employee Name)
    if (debouncedSearch) {
      const lowerQuery = debouncedSearch.toLowerCase()
      result = result.filter(c => {
        const assignments = Array.isArray(c.client_assignments) ? c.client_assignments : []
        const active = assignments.find((a: any) => a.is_active)
        const assignedName = (active?.user_profiles?.full_name || active?.user_profiles?.[0]?.full_name || "").toLowerCase()
        
        return (
          (c.name || "").toLowerCase().includes(lowerQuery) ||
          (c.email || "").toLowerCase().includes(lowerQuery) ||
          assignedName.includes(lowerQuery)
        )
      })
    }

    // 3. Apply Sorting
    result.sort((a, b) => {
      let valA = ""
      let valB = ""

      if (sortConfig.key === 'assigned_to') {
        const assignmentsA = Array.isArray(a.client_assignments) ? a.client_assignments : []
        const activeA = assignmentsA.find((ass: any) => ass.is_active)
        valA = (activeA?.user_profiles?.full_name || activeA?.user_profiles?.[0]?.full_name || "").toLowerCase()

        const assignmentsB = Array.isArray(b.client_assignments) ? b.client_assignments : []
        const activeB = assignmentsB.find((ass: any) => ass.is_active)
        valB = (activeB?.user_profiles?.full_name || activeB?.user_profiles?.[0]?.full_name || "").toLowerCase()
      } else {
        valA = (a[sortConfig.key] || "").toLowerCase()
        valB = (b[sortConfig.key] || "").toLowerCase()
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [clients, sortConfig, filterType, debouncedSearch])

  // Bulk Assign Handler
  const handleAssign = async () => {
    if (!selectedEmployeeId || selectedClientIds.length === 0) return
    setIsPending(true)
    setServerError(null)

    const result = await bulkAssignAction(selectedEmployeeId, selectedClientIds)
    setIsPending(false)

    if (result.success) {
      toast.success(`Successfully assigned ${selectedClientIds.length} clients!`)
      setSelectedClientIds([])
      // Reset filter to 'assigned' to immediately see the changes
      setFilterType('assigned') 
    } else {
      setServerError(result.error || "An unexpected server error occurred.")
      toast.error("Assignment failed")
    }
  }

  // Helper to render intelligent empty states
  const renderEmptyState = () => {
    if (clients.length === 0) {
      return "There are no clients in the system yet."
    }
    if (filterType === 'unassigned' && !debouncedSearch) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 text-emerald-600">
          <CheckCircle2 className="w-8 h-8 opacity-80" />
          <span className="font-medium">All caught up! Every client is currently assigned.</span>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center space-y-1 text-slate-500">
        <Search className="w-6 h-6 opacity-40 mb-2" />
        <span>No clients found matching your search criteria.</span>
        <Button variant="link" onClick={() => { setSearchQuery(""); setFilterType("all"); }} className="h-auto p-0 text-blue-600">
          Clear all filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Server Error</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Top Section: Title & Bulk Action Card */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="mt-2">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Client Assignments
          </h2>
          <p className="text-muted-foreground mt-1">Search, filter, and manage workloads for your team.</p>
        </div>

        <Card className="w-full lg:w-96 border-blue-200 bg-blue-50/40 shadow-sm shrink-0">
          <CardContent className="pt-5 pb-5">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Target Employee
              </label>
              <div className="flex gap-2">
                <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
                  <SelectTrigger className="bg-white flex-1 border-blue-100 shadow-sm">
                    <SelectValue placeholder="Select Staff Member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  className="font-bold shadow-sm bg-blue-600 hover:bg-blue-700 transition-colors" 
                  disabled={isPending || !selectedEmployeeId || selectedClientIds.length === 0}
                  onClick={handleAssign}
                >
                  {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <UserPlus2 className="h-4 w-4" />}
                  {selectedClientIds.length > 0 && <span className="ml-2">{selectedClientIds.length}</span>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table Card */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        {/* Toolbar: Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b bg-slate-50/50">
          
          {/* Omni-Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or employee..."
              className="pl-9 pr-9 bg-white border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex bg-slate-200/60 p-1 rounded-lg border border-slate-200 w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setFilterType('all')} 
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap", 
                filterType === 'all' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              All Clients
            </button>
            <button 
              onClick={() => setFilterType('unassigned')} 
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap", 
                filterType === 'unassigned' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              Unassigned
            </button>
            <button 
              onClick={() => setFilterType('assigned')} 
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap", 
                filterType === 'assigned' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              Assigned
            </button>
          </div>
        </div>

        {/* Table Details Header */}
        <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center text-sm text-slate-500">
          Showing {filteredAndSortedClients.length} of {clients?.length || 0} total clients
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={selectedClientIds.length === filteredAndSortedClients.length && filteredAndSortedClients.length > 0} 
                    onCheckedChange={() => {
                        if (selectedClientIds.length === filteredAndSortedClients.length) setSelectedClientIds([])
                        else setSelectedClientIds(filteredAndSortedClients.map(c => c.id))
                    }}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-blue-600 select-none">
                  Name <ArrowUpDown className="inline ml-1 w-3 h-3 opacity-50" />
                </TableHead>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer hover:text-blue-600 select-none hidden sm:table-cell">
                  Email <ArrowUpDown className="inline ml-1 w-3 h-3 opacity-50" />
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:text-blue-600 select-none">
                  Status <ArrowUpDown className="inline ml-1 w-3 h-3 opacity-50" />
                </TableHead>
                <TableHead onClick={() => handleSort('assigned_to')} className="cursor-pointer hover:text-blue-600 select-none">
                  Currently Assigned To <ArrowUpDown className="inline ml-1 w-3 h-3 opacity-50" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center bg-slate-50/30">
                    {renderEmptyState()}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedClients.map((client) => {
                  const assignments = Array.isArray(client.client_assignments) ? client.client_assignments : [];
                  const activeAssignment = assignments.find((a: any) => a.is_active);
                  const assignedName = activeAssignment?.user_profiles?.full_name || activeAssignment?.user_profiles?.[0]?.full_name;

                  return (
                    <TableRow 
                      key={client.id} 
                      className={cn(
                        "transition-colors",
                        selectedClientIds.includes(client.id) ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-slate-50"
                      )}
                    >
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedClientIds.includes(client.id)}
                          onCheckedChange={() => {
                            setSelectedClientIds(prev => 
                              prev.includes(client.id) ? prev.filter(i => i !== client.id) : [...prev, client.id]
                            )
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{client.name}</TableCell>
                      <TableCell className="text-slate-500 text-sm hidden sm:table-cell">{client.email}</TableCell>
                      <TableCell>
                        <span className="capitalize px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm">
                          {client.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {assignedName ? (
                          <div className="flex items-center gap-2 text-sm text-blue-700 font-medium bg-blue-50/50 w-fit px-2.5 py-1 rounded-md border border-blue-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
                            {assignedName}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
