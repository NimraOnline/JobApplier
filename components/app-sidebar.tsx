"use client"
import { LayoutDashboard, Users, Bot, LogOut, Building2, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-gradient-to-b from-blue-50 to-cyan-50">
      <SidebarHeader className="border-b border-slate-200 p-4 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold text-white">Employee Portal</h2>
            <p className="text-xs text-blue-100">Workspace</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-blue-50 to-cyan-50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-600 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className={`w-full justify-start transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                        : "text-slate-700 hover:bg-white/60 hover:text-blue-600"
                    }`}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                    {activeTab === item.id && (
                      <ChevronRight className="w-4 h-4 ml-auto group-data-[collapsible=icon]:hidden" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center gap-3 mb-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="w-8 h-8 ring-2 ring-blue-200">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">S</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-slate-900 truncate">Sarah</p>
            <p className="text-xs text-slate-600 truncate">employee_generated_email@gmail.com</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-600 hover:bg-white/60 hover:text-red-600 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
        >
          <LogOut className="w-4 h-4 group-data-[collapsible=icon]:mr-0 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
