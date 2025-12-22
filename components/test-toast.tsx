"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function TestToast() {
  const { toast } = useToast()

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h3 className="font-bold mb-2">Toast Test</h3>
      <Button 
        onClick={() => {
          console.log("Test toast clicked")
          toast({
            title: "Test Toast",
            description: "If you see this, toasts are working!",
          })
        }}
      >
        Test Toast Button
      </Button>
    </div>
  )
}
