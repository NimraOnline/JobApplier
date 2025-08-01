"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, FileText, Upload } from "lucide-react"

const clients = [
  { name: "Jane Doe", id: "A1" },
  { name: "Ryan Johnson", id: "A2" },
  { name: "Catherine Klien", id: "A3" },
]

export function ClientsContent() {
  const [activeClient, setActiveClient] = useState("jane-doe")
  const [formData, setFormData] = useState({
    clientId: "",
    jobUrl: "",
    emlFile: null as File | null,
    dateMatched: "",
  })

  const getCurrentClient = () => {
    switch (activeClient) {
      case "jane-doe":
        return clients[0]
      case "ryan-johnson":
        return clients[1]
      case "catherine-klien":
        return clients[2]
      default:
        return clients[0]
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      emlFile: file,
    }))
  }

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Application submitted:", {
      client: getCurrentClient().name,
      clientId: formData.clientId,
      jobUrl: formData.jobUrl,
    })
    // Reset form
    setFormData((prev) => ({ ...prev, clientId: "", jobUrl: "" }))
  }

  const handleJobMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Job match submitted:", {
      client: getCurrentClient().name,
      clientId: formData.clientId,
      emlFile: formData.emlFile,
      dateMatched: formData.dateMatched,
    })
    // Reset form
    setFormData((prev) => ({ ...prev, clientId: "", emlFile: null, dateMatched: "" }))
  }

  const currentClient = getCurrentClient()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Clients
        </h1>
        <p className="text-slate-600">Manage individual client applications and job matches</p>
      </div>

      <Tabs value={activeClient} onValueChange={setActiveClient} className="space-y-6">
        {/* Client Name Tabs */}
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-slate-200">
          <TabsTrigger value="jane-doe" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Jane Doe
          </TabsTrigger>
          <TabsTrigger value="ryan-johnson" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Ryan Johnson
          </TabsTrigger>
          <TabsTrigger value="catherine-klien" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Catherine Klien
          </TabsTrigger>
        </TabsList>

        {/* Jane Doe Tab */}
        <TabsContent value="jane-doe" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Jane Doe
            </h2>
            <p className="text-slate-600">
              Client ID:{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                A1
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications Submitted Form */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Applications Submitted
                </CardTitle>
                <CardDescription>Submit job applications for Jane Doe</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-id-app">Client ID</Label>
                    <Input
                      id="client-id-app"
                      value={formData.clientId}
                      onChange={(e) => handleInputChange("clientId", e.target.value)}
                      placeholder="Enter client ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-url">Job URL</Label>
                    <Input
                      id="job-url"
                      value={formData.jobUrl}
                      onChange={(e) => handleInputChange("jobUrl", e.target.value)}
                      placeholder="Paste job URL here"
                      type="url"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200"
                  >
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Job Matches Form */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Job Matches
                </CardTitle>
                <CardDescription>Upload job match information for Jane Doe</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobMatchSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-id-match">Client ID</Label>
                    <Input
                      id="client-id-match"
                      value={formData.clientId}
                      onChange={(e) => handleInputChange("clientId", e.target.value)}
                      placeholder="Enter client ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eml-file">.eml File</Label>
                    <Input
                      id="eml-file"
                      type="file"
                      accept=".eml"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-matched">Date Matched</Label>
                    <Input
                      id="date-matched"
                      type="date"
                      value={formData.dateMatched}
                      onChange={(e) => handleInputChange("dateMatched", e.target.value)}
                      placeholder="MM/DD/YY"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200"
                  >
                    Submit Job Match
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ryan Johnson Tab */}
        <TabsContent value="ryan-johnson" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Ryan Johnson
            </h2>
            <p className="text-slate-600">
              Client ID:{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                A2
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications Submitted Form */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Applications Submitted
                </CardTitle>
                <CardDescription>Submit job applications for Ryan Johnson</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-id-app-ryan">Client ID</Label>
                    <Input
                      id="client-id-app-ryan"
                      value={formData.clientId}
                      onChange={(e) => handleInputChange("clientId", e.target.value)}
                      placeholder="Enter client ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-url-ryan">Job URL</Label>
                    <Input
                      id="job-url-ryan"
                      value={formData.jobUrl}
                      onChange={(e) => handleInputChange("jobUrl", e.target.value)}
                      placeholder="Paste job URL here"
                      type="url"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200"
                  >
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Job Matches Form */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Job Matches
                </CardTitle>
                <CardDescription>Upload job match information for Ryan Johnson</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobMatchSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-id-match-ryan">Client ID</Label>
                    <Input
                      id="client-id-match-ryan"
                      value={formData.clientId}
                      onChange={(e) => handleInputChange("clientId", e.target.value)}
                      placeholder="Enter client ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eml-file-ryan">.eml File</Label>
                    <Input
                      id="eml-file-ryan"
                      type="file"
                      accept=".eml"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-matched-ryan">Date Matched</Label>
                    <Input
                      id="date-matched-ryan"
                      type="date"
                      value={formData.dateMatched}
                      onChange={(e) => handleInputChange("dateMatched", e.target.value)}
                      placeholder="MM/DD/YY"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200"
                  >
                    Submit Job Match
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Catherine Klien Tab */}
        <TabsContent value="catherine-klien" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Catherine Klien
            </h2>
            <p className="text-slate-600">
              Client ID:{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                A3
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications Submitted Form */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Applications Submitted
                </CardTitle>
                <CardDescription>Submit job applications for Catherine Klien</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-id-app-catherine">Client ID</Label>
                    <Input
                      id="client-id-app-catherine"
                      value={formData.clientId}
                      onChange={(e) => handleInputChange("clientId", e.target.value)}
                      placeholder="Enter client ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-url-catherine">Job URL</Label>
                    <Input
                      id="job-url-catherine"
                      value={formData.jobUrl}
                      onChange={(e) => handleInputChange("jobUrl", e.target.value)}
                      placeholder="Paste job URL here"
                      type="url"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200"
                  >
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Job Matches Form */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Job Matches
                </CardTitle>
                <CardDescription>Upload job match information for Catherine Klien</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobMatchSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-id-match-catherine">Client ID</Label>
                    <Input
                      id="client-id-match-catherine"
                      value={formData.clientId}
                      onChange={(e) => handleInputChange("clientId", e.target.value)}
                      placeholder="Enter client ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eml-file-catherine">.eml File</Label>
                    <Input
                      id="eml-file-catherine"
                      type="file"
                      accept=".eml"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-matched-catherine">Date Matched</Label>
                    <Input
                      id="date-matched-catherine"
                      type="date"
                      value={formData.dateMatched}
                      onChange={(e) => handleInputChange("dateMatched", e.target.value)}
                      placeholder="MM/DD/YY"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200"
                  >
                    Submit Job Match
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
