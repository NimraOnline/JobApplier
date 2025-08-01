"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Bot,
  Brain,
  FileText,
  BarChart3,
  MessageSquare,
  ImageIcon,
  Code,
  Zap,
  Play,
  Settings,
  Star,
} from "lucide-react"

const aiTools = [
  {
    id: "content-generator",
    name: "Content Generator",
    description: "Generate high-quality content for marketing campaigns and client communications",
    icon: FileText,
    category: "Content",
    status: "Active",
    usage: "High",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "data-analyzer",
    name: "Data Analyzer",
    description: "Analyze client data and generate insights and reports automatically",
    icon: BarChart3,
    category: "Analytics",
    status: "Active",
    usage: "Medium",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "chatbot-assistant",
    name: "Chatbot Assistant",
    description: "AI-powered chatbot for handling client inquiries and support",
    icon: MessageSquare,
    category: "Support",
    status: "Active",
    usage: "High",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "image-generator",
    name: "Image Generator",
    description: "Create custom images and graphics for client presentations",
    icon: ImageIcon,
    category: "Design",
    status: "Beta",
    usage: "Low",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    id: "code-assistant",
    name: "Code Assistant",
    description: "AI-powered coding help for technical implementations",
    icon: Code,
    category: "Development",
    status: "Active",
    usage: "Medium",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "smart-scheduler",
    name: "Smart Scheduler",
    description: "Intelligent scheduling system for client meetings and tasks",
    icon: Brain,
    category: "Productivity",
    status: "Active",
    usage: "High",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
]

export function AIToolsContent() {
  const [selectedTool, setSelectedTool] = useState<(typeof aiTools)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleToolClick = (tool: (typeof aiTools)[0]) => {
    setSelectedTool(tool)
    setIsDialogOpen(true)
  }

  const getUsageColor = (usage: string) => {
    switch (usage) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Beta":
        return "bg-blue-100 text-blue-800"
      case "Inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-gray-600">Access and manage your AI-powered tools and assistants</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool) => (
          <Card
            key={tool.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => handleToolClick(tool)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(tool.status)} text-xs`}>{tool.status}</Badge>
                  <Star className="w-4 h-4 text-gray-300 hover:text-yellow-500 cursor-pointer" />
                </div>
              </div>
              <CardTitle className="text-lg">{tool.name}</CardTitle>
              <CardDescription className="text-sm">{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Category:</span>
                  <Badge variant="outline" className="text-xs">
                    {tool.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Usage:</span>
                  <Badge className={`${getUsageColor(tool.usage)} text-xs`}>{tool.usage}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Launch
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTool && (
                <>
                  <div className={`p-2 rounded-lg ${selectedTool.bgColor}`}>
                    <selectedTool.icon className={`w-5 h-5 ${selectedTool.color}`} />
                  </div>
                  {selectedTool.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>{selectedTool?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <Badge className={`${getStatusColor(selectedTool?.status || "")} text-xs`}>
                  {selectedTool?.status}
                </Badge>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Usage Level</h4>
                <Badge className={`${getUsageColor(selectedTool?.usage || "")} text-xs`}>{selectedTool?.usage}</Badge>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Tool Interface</h4>
              <div className="bg-white p-6 rounded border-2 border-dashed border-blue-200 text-center">
                <Bot className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">{selectedTool?.name} interface would load here</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Using Tool
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
