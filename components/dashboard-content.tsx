"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Mail, ExternalLink, Reply, Archive, Delete } from "lucide-react"

const clientAssignments = [
  {
    id: "A1",
    client: "Jane Doe",
    clientId: "A1",
    resume: "resume.pdf",
    questionnaire: "JD_q.json",
    applications: 25,
    matches: 1,
  },
  {
    id: "A2",
    client: "Ryan Johnson",
    clientId: "A2",
    resume: "ryan_jresume.pdf",
    questionnaire: "RJ_q.json",
    applications: 3,
    matches: 0,
  },
  {
    id: "A3",
    client: "Catherine Klien",
    clientId: "A3",
    resume: "CK_resume.pdf",
    questionnaire: "CK_q.json",
    applications: 0,
    matches: 0,
  },
]

const clientEmails = [
  {
    id: 1,
    from: "jane.doe@email.com",
    subject: "Invitation to Interview!",
    preview: "Hi Jane, we were really impressed with your application and would like to invite you for an interview...",
    time: "5:56 am",
    isRead: false,
    isImportant: true,
  },
  {
    id: 2,
    from: "hr@techcompany.com",
    subject: "Thank you for applying",
    preview:
      "Thank you for your interest in our company. We have received your application and will review it shortly...",
    time: "3:29 pm",
    isRead: true,
    isImportant: false,
  },
  {
    id: 3,
    from: "recruiter@startup.com",
    subject: "Application Received - Software Engineer",
    preview:
      "Ryan, we received your application for the Software Engineer position. Our team will review it and get back to you...",
    time: "3:29 pm",
    isRead: true,
    isImportant: false,
  },
  {
    id: 4,
    from: "noreply@jobboard.com",
    subject: "Your application has been viewed",
    preview: "Good news! Your application for the Marketing Manager position has been viewed by the hiring team...",
    time: "Yesterday",
    isRead: false,
    isImportant: false,
  },
  {
    id: 5,
    from: "catherine@designstudio.com",
    subject: "Portfolio Review Feedback",
    preview:
      "Hi Catherine, we've reviewed your portfolio and have some feedback to share. Overall, we're impressed with your work...",
    time: "2 days ago",
    isRead: true,
    isImportant: true,
  },
]

export function DashboardContent() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-600">Overview of client assignments and communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Clients Assigned - 50% */}
        <Card className="flex flex-col shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Clients Assigned
            </CardTitle>
            <CardDescription className="text-emerald-100">Data retrieved from Google Sheets</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Resume</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Apps</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Matches</th>
                  </tr>
                </thead>
                <tbody>
                  {clientAssignments.map((assignment, index) => (
                    <tr
                      key={assignment.id}
                      className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 text-sm">{assignment.client}</td>
                      <td className="py-3 px-4 text-slate-700 text-sm">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {assignment.clientId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-blue-600 hover:text-cyan-600 hover:underline cursor-pointer text-sm transition-colors">
                        {assignment.resume}
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-sm">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                          {assignment.applications}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.matches > 0 ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}
                        >
                          {assignment.matches}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 hover:text-white transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Google Sheets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Emails - 50% */}
        <Card className="flex flex-col shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Client Emails
            </CardTitle>
            <CardDescription className="text-blue-100">Gmail inbox integration</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {/* Gmail-like interface */}
            <div className="h-full flex flex-col">
              {/* Email toolbar */}
              <div className="flex items-center gap-2 p-3 border-b border-slate-200 bg-slate-50">
                <Button variant="ghost" size="sm" className="hover:bg-blue-100 hover:text-blue-600">
                  <Archive className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-red-100 hover:text-red-600">
                  <Delete className="w-4 h-4" />
                </Button>
                <div className="ml-auto text-xs text-slate-500">
                  1-{clientEmails.length} of {clientEmails.length}
                </div>
              </div>

              {/* Email list */}
              <div className="flex-1 overflow-auto">
                {clientEmails.map((email, index) => (
                  <div
                    key={email.id}
                    className={`p-3 border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer transition-all duration-200 ${
                      !email.isRead ? "bg-white border-l-4 border-l-blue-500" : "bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${email.isImportant ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-transparent"}`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm truncate ${!email.isRead ? "font-semibold text-slate-900" : "text-slate-700"}`}
                          >
                            {email.from}
                          </span>
                          <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{email.time}</span>
                        </div>
                        <div
                          className={`text-sm mb-1 ${!email.isRead ? "font-medium text-slate-900" : "text-slate-700"}`}
                        >
                          {email.subject}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{email.preview}</div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Reply className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gmail footer */}
              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Gmail
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
