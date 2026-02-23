"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Loader2 } from "lucide-react"
import type { Client } from "@/types/client"

// Updated to include the new fields
interface ApplicationFormProps {
  client: Client
  onSubmit: (data: { clientId: string, companyName: string, jobTitle: string, jobUrl: string }) => Promise<void> | void
}

export function ApplicationForm({ client, onSubmit }: ApplicationFormProps) {
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [jobUrl, setJobUrl] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ companyName?: string; jobTitle?: string; jobUrl?: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { companyName?: string; jobTitle?: string; jobUrl?: string } = {}

    if (!companyName.trim()) newErrors.companyName = "Company Name is required"
    if (!jobTitle.trim()) newErrors.jobTitle = "Job Title is required"
    
    if (jobUrl.trim() && !isValidUrl(jobUrl)) {
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
      // Send all the data to the Server Action
      await onSubmit({ 
        clientId: client.id, 
        companyName,
        jobTitle,
        jobUrl 
      })
      
      // Reset everything on success
      setCompanyName("")
      setJobTitle("")
      setJobUrl("")
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
          Log Job Application
        </CardTitle>
        <CardDescription>Track an application submitted for {client.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor={`company-${client.id}`}>Company Name <span className="text-red-500">*</span></Label>
            <Input
              id={`company-${client.id}`}
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value)
                if (errors.companyName) setErrors({ ...errors, companyName: undefined })
              }}
              placeholder="e.g. Google, Stripe"
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor={`title-${client.id}`}>Job Title <span className="text-red-500">*</span></Label>
            <Input
              id={`title-${client.id}`}
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value)
                if (errors.jobTitle) setErrors({ ...errors, jobTitle: undefined })
              }}
              placeholder="e.g. Senior Frontend Engineer"
              className={errors.jobTitle ? "border-red-500" : ""}
            />
            {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle}</p>}
          </div>

          {/* Job URL */}
          <div className="space-y-2">
            <Label htmlFor={`job-url-${client.id}`}>Job URL</Label>
            <Input
              id={`job-url-${client.id}`}
              value={jobUrl}
              onChange={(e) => {
                setJobUrl(e.target.value)
                if (errors.jobUrl) setErrors({ ...errors, jobUrl: undefined })
              }}
              placeholder="https://linkedin.com/jobs/..."
              type="url"
              className={errors.jobUrl ? "border-red-500" : ""}
            />
            {errors.jobUrl && <p className="text-red-500 text-sm">{errors.jobUrl}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
