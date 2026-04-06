"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { submitJobApplication } from "@/app/actions/client-actions"
import { Loader2, AlertCircle } from "lucide-react"

interface InterviewFormProps {
  clientId: string
  onSuccess?: () => void
}

export function InterviewForm({ clientId, onSuccess }: InterviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null) // Added visible error state

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null) // Clear previous errors

    const formData = new FormData(e.currentTarget)

    // Explicitly cast to string to prevent Null crashes in Zod
    const data = {
      clientId: clientId,
      companyName: formData.get("companyName") as string,
      jobTitle: formData.get("jobTitle") as string,
      jobUrl: formData.get("jobUrl") as string || "",
      status: "interview",
      notes: formData.get("notes") as string || "",
    }

    try {
      const result = await submitJobApplication(data)

      if (result.error) {
        setErrorMsg(result.error)
        toast.error(result.error) // Try toast, but rely on inline error
      } else if (result.success) {
        toast.success("Interview logged successfully!")
        if (onSuccess) onSuccess()
      }
    } catch (error: any) {
      setErrorMsg("A network error occurred. Please try again.")
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

      {/* INLINE ERROR DISPLAY */}
      {errorMsg && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

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