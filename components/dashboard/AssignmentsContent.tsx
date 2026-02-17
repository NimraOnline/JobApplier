"use client"

import { useState } from "react"
import { bulkAssignAction } from "@/app/actions/assignments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Loader2, UserPlus2, ShieldCheck, Users } from "lucide-react"

interface AssignmentsContentProps {
  clients: any[]
  employees: any[]
}

export function AssignmentsContent({ clients, employees }: AssignmentsContentProps) {
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [isPending, setIsPending] = useState(false)

  // 1. Toggle single selection
  const toggleClient = (id: string) => {
    setSelectedClientIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // 2. Toggle "Select All"
  const toggleAll = () => {
    if (selectedClientIds.length === clients.length) {
      setSelectedClientIds([])
    } else {
      setSelectedClientIds(clients.map(c => c.id))
    }
  }

  // 3. Handle the assignment
  const handleAssign = async () => {
    if (!selectedEmployeeId || selectedClientIds.length === 0) return

    setIsPending(true)
    const result = await bulkAssignAction(selectedEmployeeId, selectedClientIds)
    setIsPending(false)

    if (result.success) {
      toast.success(`Successfully assigned ${selectedClientIds.length} clients!`)
      setSelectedClientIds([]) // Clear selection on success
    } else {
      toast.error(result.error || "Failed to assign clients")
    }
  }

  return (
    <div className="space-y-6">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Bulk Assignment
          </h2>
          <p className="text-muted-foreground">Reassign multiple clients to a staff member.</p>
        </div>

        <Card className="w-full md:w-80 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-blue-700">Assign To:</label>
              <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="w-full mt-2" 
                disabled={isPending || !selectedEmployeeId || selectedClientIds.length === 0}
                onClick={handleAssign}
              >
                {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus2 className="mr-2 h-4 w-4" />}
                Confirm Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Selection Table --- */}
      <Card>
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" /> Client List 
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {selectedClientIds.length} Selected
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedClientIds.length === clients.length && clients.length > 0} 
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className={selectedClientIds.includes(client.id) ? "bg-blue-50/30" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedClientIds.includes(client.id)}
                      onCheckedChange={() => toggleClient(client.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-slate-500">{client.email}</TableCell>
                  <TableCell>
                    <span className="capitalize px-2 py-1 rounded-md text-xs bg-slate-100 border">
                      {client.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No clients found in database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
