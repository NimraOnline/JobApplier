import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TabId, tabConfig } from "@/lib/tabs"

export function useTabsSimple() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<TabId>("dashboard")
  const [isLoading, setIsLoading] = useState(false)

  // Get initial tab from URL on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get("tab") as TabId
      if (tab && tabConfig[tab]) {
        setActiveTab(tab)
      }
    }
  }, [])

  const handleTabChange = (tab: TabId) => {
    setIsLoading(true)
    setActiveTab(tab)
    
    // Update URL without relying on searchParams
    const url = `${pathname}?tab=${tab}`
    router.push(url)
    
    setTimeout(() => setIsLoading(false), 150)
  }

  return {
    activeTab,
    isLoading,
    handleTabChange
  }
}
