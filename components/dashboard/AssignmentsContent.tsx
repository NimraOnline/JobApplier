"use client"

import { useState, useMemo } from "react"
import { bulkAssignAction } from "@/app/actions/assignments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { toast } from "sonner"
import { Loader2, UserPlus2, ShieldCheck, Users, ArrowUpDown, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AssignmentsContentProps {
  clients: any[]
  employees: any[]
}

type SortConfig = {
  key: 'name' | 'email' | 'status'
  direction: 'asc' | 'desc'
}

export function AssignmentsContent({ clients, employees }: AssignmentsContentProps) {
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null) // 3. Error state
  
  // 1. Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' })

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Logic to process clients (Sorting)
  const sortedClients = useMemo(() => {
    let items = [...clients]
    items.sort((a, b) => {
      const valA = a[sortConfig.key]?.toLowerCase() || ""
      const valB = b[sortConfig.key]?.toLowerCase() || ""
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return items
  }, [clients, sortConfig])

  const handleAssign = async () => {
    if (!selectedEmployeeId || selectedClientIds.length === 0) return
    setIsPending(true)
    setServerError(null)

    const result = await bulkAssignAction(selectedEmployeeId, selectedClientIds)
    setIsPending(false)

    if (result.success) {
      toast.success(`Successfully assigned ${selectedClientIds.length} clients!`)
      setSelectedClientIds([])
    } else {
      setServerError(result.error || "An unexpected server error occurred.") // Show error in UI
      toast.error("Assignment failed")
    }
  }

  return (
    <div className="space-y-6">
      {/* --- SERVER ERROR DISPLAY --- */}
      {serverError && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Server Error</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Bulk Assignment
          </h2>
          <p className="text-muted-foreground">Manage client workloads for your team.</p>
        </div>

        <Card className="w-full md:w-80 border-blue-200 bg-blue-50/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-700">Target Employee</label>
              <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
                <SelectTrigger className="bg-white">
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
                className="w-full mt-2 font-bold shadow-md" 
                disabled={isPending || !selectedEmployeeId || selectedClientIds.length === 0}
                onClick={handleAssign}
              >
                {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus2 className="mr-2 h-4 w-4" />}
                Assign {selectedClientIds.length > 0 ? selectedClientIds.length : ""} Clients
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" /> Total Clients ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedClientIds.length === clients.length && clients.length > 0} 
                    onCheckedChange={() => {
                        if (selectedClientIds.length === clients.length) setSelectedClientIds([])
                        else setSelectedClientIds(clients.map(c => c.id))
                    }}
                  />
                </TableHead>
                {/* 1. SORTABLE HEADERS */}
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-blue-600 transition-colors">
                  Name <ArrowUpDown className="inline ml-1 w-3 h-3" />
                </TableHead>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer hover:text-blue-600 transition-colors">
                  Email <ArrowUpDown className="inline ml-1 w-3 h-3" />
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:text-blue-600 transition-colors">
                  Status <ArrowUpDown className="inline ml-1 w-3 h-3" />
                </TableHead>
                {/* 2. NEW COLUMN: ASSIGNED TO */}
                <TableHead>Currently Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No clients found matching current criteria.
                  </TableCell>
                </TableRow>
              ) : (
                sortedClients.map((client) => {
                  // 1. Safely handle the assignments array
                  const assignments = Array.isArray(client.assignments) ? client.assignments : [];
                  
                  // 2. Find the active assignment (if one exists)
                  const activeAssignment = assignments.find((a: any) => a.is_active);
                  
                  // 3. Extract the employee name safely
                  const assignedName = activeAssignment?.employee?.full_name;

                  return (
                    <TableRow 
                      key={client.id} 
                      className={selectedClientIds.includes(client.id) ? "bg-blue-50/50" : "hover:bg-slate-50/50"}
                    >
                      {/* Checkbox Column */}
                      <TableCell>
                        <Checkbox 
                          checked={selectedClientIds.includes(client.id)}
                          onCheckedChange={() => {
                            setSelectedClientIds(prev => 
                              prev.includes(client.id) 
                                ? prev.filter(i => i !== client.id) 
                                : [...prev, client.id]
                            )
                          }}
                        />
                      </TableCell>

                      {/* Name Column */}
                      <TableCell className="font-semibold text-slate-900">
                        {client.name}
                      </TableCell>

                      {/* Email Column */}
                      <TableCell className="text-slate-500 text-sm">
                        {client.email}
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600">
                          {client.status}
                        </span>
                      </TableCell>

                      {/* Assigned To Column */}
                      <TableCell>
                        {assignedName ? (
                          <div className="flex items-center gap-2 text-sm text-blue-700 font-medium bg-blue-50/50 px-2 py-1 rounded-md w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            {assignedName}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 text-xs italic px-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Not assigned
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
