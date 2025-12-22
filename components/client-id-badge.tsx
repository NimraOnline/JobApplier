import { Client } from "@/types/client"

interface ClientIdBadgeProps {
  client: Client;
}

export function ClientIdBadge({ id }: { id: string }) {
  if (!id) return <span className="text-red-500">⚠️ Invalid ID</span>
  return (
    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full text-xs font-medium">
      {id}
    </span>
  )
}
