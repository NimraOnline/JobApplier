"use client"

import { useState } from "react"

export interface Client {
  id: string
  name: string
  company: string
  status: "active" | "pending" | "inactive"
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([
    { id: "1", name: "John Doe", company: "Tech Corp", status: "active" },
    { id: "2", name: "Jane Smith", company: "Design Inc", status: "active" },
    { id: "3", name: "Mike Johnson", company: "Dev Studios", status: "pending" },
  ])

  const [isLoading, setIsLoading] = useState(false)

  return {
    clients,
    isLoading,
    setClients,
  }
}
