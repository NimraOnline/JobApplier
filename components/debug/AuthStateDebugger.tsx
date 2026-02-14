"use client"

import { useAuth } from "@/app/providers/AuthProvider"
import { useState } from "react"

export function AuthStateDebugger() {
  const auth = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (process.env.NODE_ENV === "production") return null

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg hover:bg-red-700"
      >
        Debug Auth
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-black/90 text-green-400 p-4 rounded-lg shadow-2xl text-xs font-mono overflow-auto max-h-[500px] border border-green-800">
      <div className="flex justify-between items-center mb-2 border-b border-green-800 pb-2">
        <strong className="text-white">Auth State Snapshot</strong>
        <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-300">Close</button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Loading:</span> {auth.loading ? "TRUE" : "FALSE"}
        </div>
        <div>
          <span className="text-gray-400">User ID:</span> 
          <span className="text-white ml-2">{auth.user?.id || "NULL"}</span>
        </div>
        <div>
          <span className="text-gray-400">Email:</span> 
          <span className="text-white ml-2">{auth.user?.email || "NULL"}</span>
        </div>
        <div>
          <span className="text-gray-400">Role (Is Employee?):</span> 
          <span className="text-yellow-400 ml-2">{auth.isEmployee ? "YES" : "NO"}</span>
        </div>
        
        <div className="mt-4 border-t border-gray-700 pt-2">
          <div className="text-gray-400 mb-1">Profile Data:</div>
          <pre className="whitespace-pre-wrap break-all bg-gray-900 p-2 rounded">
            {JSON.stringify(auth.profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
