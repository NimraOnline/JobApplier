import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TabId, tabConfig } from "@/lib/tabs"

export function useTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>("dashboard")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const tab = searchParams.get("tab") as TabId
    if (tab && tabConfig[tab]) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab: TabId) => {
    setIsLoading(true)
    setActiveTab(tab)
    setSearchParams({ tab })
    
    // Simulate loading for better UX
    setTimeout(() => setIsLoading(false), 150)
  }

  return {
    activeTab,
    isLoading,
    handleTabChange
  }
}
