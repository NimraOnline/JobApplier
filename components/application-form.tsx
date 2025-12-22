"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Loader2 } from "lucide-react"
import type { Client, ApplicationFormData } from "@/types/client"

interface ApplicationFormProps {
  client: Client
  onSubmit: (data: ApplicationFormData & { clientId: string }) => Promise<void> | void
}

export function ApplicationForm({ client, onSubmit }: ApplicationFormProps) {
  const [jobUrl, setJobUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ jobUrl?: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { jobUrl?: string } = {}

    if (!jobUrl.trim()) {
      newErrors.jobUrl = "Job URL is required"
    } else if (!isValidUrl(jobUrl)) {
      newErrors.jobUrl = "Please enter a valid URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onSubmit({ 
        clientId: client.id, 
        jobUrl 
      })
      setJobUrl("") // Reset on success
      setErrors({})
    } catch (error) {
      console.error("Submission failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Applications Submitted
        </CardTitle>
        <CardDescription>Submit job applications for {client.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only Client ID display */}
          <div className="space-y-2">
            <Label htmlFor={`client-id-${client.id}`}>Client ID</Label>
            <div
              id={`client-id-${client.id}`}
              className="p-2 bg-slate-100 rounded-md font-medium text-slate-800"
            >
              {client.id}
            </div>
          </div>

          {/* Job URL input */}
          <div className="space-y-2">
            <Label htmlFor={`job-url-${client.id}`}>Job URL</Label>
            <Input
              id={`job-url-${client.id}`}
              value={jobUrl}
              onChange={(e) => {
                setJobUrl(e.target.value)
                // Clear error when user starts typing
                if (errors.jobUrl) {
                  setErrors({ ...errors, jobUrl: undefined })
                }
              }}
              placeholder="https://example.com/job-posting"
              type="url"
              className={errors.jobUrl ? "border-red-500 focus:border-red-500" : ""}
            />
            {errors.jobUrl && (
              <p className="text-red-500 text-sm">{errors.jobUrl}</p>
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
              "Submit Application"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
