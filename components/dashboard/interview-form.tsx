"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { submitJobApplication } from "@/app/actions/client-actions"
import { Loader2 } from "lucide-react"

interface InterviewFormProps {
  clientId: string
  onSuccess?: () => void
}

export function InterviewForm({ clientId, onSuccess }: InterviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    // We format the data to match what submitJobApplication expects
    const data = {
      clientId: clientId,
      companyName: formData.get("companyName"),
      jobTitle: formData.get("jobTitle"),
      jobUrl: formData.get("jobUrl"),
      status: "interview", // ✅ HARDCODED: This makes it an interview record
      notes: formData.get("notes"),
    }

    try {
      const result = await submitJobApplication(data)
      if (result.success) {
        toast.success("Interview logged successfully!")
        if (onSuccess) onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to log interview")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          name="companyName"
          placeholder="e.g. Acme Corp"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          name="jobTitle"
          placeholder="e.g. Senior Frontend Engineer"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobUrl">Job URL (Optional)</Label>
        <Input
          id="jobUrl"
          name="jobUrl"
          type="url"
          placeholder="https://..."
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Interview Details / Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          disabled={isSubmitting}
          placeholder="Date: Tuesday at 2 PM. Interviewer: Jane Smith..."
          className="resize-none"
        />
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Log Interview"
        )}
      </Button>
    </form>
  )
}