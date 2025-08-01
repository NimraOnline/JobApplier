"use client"
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

const navigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard",
  },
  {
    title: "Clients",
    icon: Users,
    id: "clients",
  },
  {
    title: "Generate & Edit",
    icon: Bot,
    id: "generate-edit",
  },
]

interface TopNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 border-b border-blue-700 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Employee Portal</h1>
              <p className="text-xs text-blue-100">Workspace</p>
            </div>
          </div>

          {/* Navigation Buttons */}
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
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold">
                  S
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Sarah</p>
                <p className="text-xs text-blue-100">Employee</p>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border border-slate-200">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-900">Sarah</p>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                employee_generated_email@gmail.com
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
