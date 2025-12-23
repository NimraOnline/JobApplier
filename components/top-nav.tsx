"use client"

// Remove "useRouter" and "createClient" imports, we don't need them directly anymore
// import { useRouter } from "next/navigation" 
// import { createClient } from "@/lib/supabase/client"

import { useAuth } from "@/app/providers/AuthProvider" // Use our shared context
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, Users, Bot, LogOut, Mail, Building2, ChevronDown } from "lucide-react"

// ... (Keep the navigation array the same) ...
const navigation = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Clients", icon: Users, id: "clients" },
  { title: "Generate & Edit", icon: Bot, id: "generate-edit" },
]

interface TopNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  // 1. Get the shared supabase instance from context
  const { supabase, user, profile } = useAuth()

  // 2. The Robust Sign Out Function
  const handleSignOut = async () => {
    // Await the sign out from Supabase
    await supabase.auth.signOut()
    
    // FORCE a hard refresh to the login page.
    // This clears the browser cache and prevents Middleware loops.
    window.location.href = "/login"
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Employee"
  const displayRole = profile?.role || "Team Member"
  const userEmail = user?.email || "No email"
  
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "EM"
  }

  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 border-b border-blue-700 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* ... (Left side - Logo and Navigation code stays exactly the same) ... */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Employee Portal</h1>
              <p className="text-xs text-blue-100">Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {navigation.map((item) => (
              <Button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                variant="ghost"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Right side - User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <Avatar className="w-8 h-8 ring-2 ring-white/30">
                <AvatarImage src="" /> 
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-white truncate max-w-[150px]">
                  {displayName}
                </p>
                <p className="text-xs text-blue-100 capitalize">
                  {displayRole}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-100" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border border-slate-200">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-600 flex items-center gap-1 mt-1 truncate">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{userEmail}</span>
              </p>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer focus:text-red-700 focus:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
