"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"
import type { Client, JobMatchFormData } from "@/types/client"

interface JobMatchFormProps {
  client: Client
  onSubmit: (data: JobMatchFormData & { clientId: string }) => Promise<void> | void
}

export function JobMatchForm({ client, onSubmit }: JobMatchFormProps) {
  const [emlFile, setEmlFile] = useState<File | null>(null)
  const [dateMatched, setDateMatched] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ emlFile?: string; dateMatched?: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { emlFile?: string; dateMatched?: string } = {}

    if (!emlFile) {
      newErrors.emlFile = "EML file is required"
    } else if (emlFile.name && !emlFile.name.toLowerCase().endsWith('.eml')) {
      newErrors.emlFile = "Please select a valid .eml file"
    }

    if (!dateMatched) {
      newErrors.dateMatched = "Date matched is required"
    } else if (new Date(dateMatched) > new Date()) {
      newErrors.dateMatched = "Date cannot be in the future"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onSubmit({ 
        clientId: client.id, 
        emlFile,
        dateMatched
      })
      // Reset form on success
      setEmlFile(null)
      setDateMatched("")
      setErrors({})
      // Reset file input
      const fileInput = document.getElementById(`eml-file-${client.id}`) as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Submission failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setEmlFile(file)
    // Clear error when user selects a file
    if (errors.emlFile) {
      setErrors({ ...errors, emlFile: undefined })
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-green-600" />
          Job Matches
        </CardTitle>
        <CardDescription>Upload job match information for {client.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only Client ID display */}
          <div className="space-y-2">
            <Label htmlFor={`client-id-match-${client.id}`}>Client ID</Label>
            <div
              id={`client-id-match-${client.id}`}
              className="p-2 bg-slate-100 rounded-md font-medium text-slate-800"
            >
              {client.id}
            </div>
          </div>

          {/* EML File upload */}
          <div className="space-y-2">
            <Label htmlFor={`eml-file-${client.id}`}>.eml File</Label>
            <Input
              id={`eml-file-${client.id}`}
              type="file"
              accept=".eml"
              onChange={handleFileChange}
              className={errors.emlFile ? "border-red-500 focus:border-red-500" : ""}
            />
            {errors.emlFile && (
              <p className="text-red-500 text-sm">{errors.emlFile}</p>
            )}
            {emlFile && (
              <p className="text-green-600 text-sm">Selected: {emlFile.name}</p>
            )}
          </div>

          {/* Date matched */}
          <div className="space-y-2">
            <Label htmlFor={`date-matched-${client.id}`}>Date Matched</Label>
            <Input
              id={`date-matched-${client.id}`}
              type="date"
              value={dateMatched}
              onChange={(e) => {
                setDateMatched(e.target.value)
                // Clear error when user selects a date
                if (errors.dateMatched) {
                  setErrors({ ...errors, dateMatched: undefined })
                }
              }}
              className={errors.dateMatched ? "border-red-500 focus:border-red-500" : ""}
            />
            {errors.dateMatched && (
              <p className="text-red-500 text-sm">{errors.dateMatched}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Job Match"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
