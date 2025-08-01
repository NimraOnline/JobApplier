"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Upload, Download, FileText } from "lucide-react"

export function GenerateEditContent() {
  const [jobDescription, setJobDescription] = useState("")
  const [isGenerated, setIsGenerated] = useState(false)
  const [documentContent, setDocumentContent] = useState("")

  const handleGenerate = () => {
    if (jobDescription.trim()) {
      setIsGenerated(true)
      setDocumentContent(`RESUME

John Doe
Software Engineer
Email: john.doe@email.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with expertise in full-stack development...

EXPERIENCE
Senior Software Engineer | Tech Company | 2020-Present
• Developed and maintained web applications using React and Node.js
• Led a team of 5 developers on multiple projects
• Improved application performance by 40%

Software Engineer | StartUp Inc | 2018-2020
• Built responsive web applications
• Collaborated with cross-functional teams
• Implemented automated testing procedures

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2018

SKILLS
• JavaScript, React, Node.js, Python
• Database Management (SQL, MongoDB)
• Cloud Services (AWS, Azure)
• Agile Development Methodologies`)
    }
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([documentContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "resume.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Generate & Edit
        </h1>
        <p className="text-slate-600">AI-powered resume and cover letter generation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left Side - Input Section */}
        <Card className="flex flex-col shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Generate Resume & Cover Letter
            </CardTitle>
            <CardDescription>AI-powered resume and cover letter generation</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            {/* Job Description Input */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="job-description" className="text-base font-medium">
                  Job Description
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Paste job description. Include details such as company, job title and anything else that would help
                  guide the AI
                </p>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here..."
                  className="min-h-[200px]"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Client Questionnaire</Label>
                <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload client questionnaire file</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                className="px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200"
                disabled={!jobDescription.trim()}
                onClick={handleGenerate}
              >
                <Bot className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Document Editor */}
        <Card className="flex flex-col shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generated Document
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!isGenerated}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {/* Document Editor Area */}
            <div className="h-full bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-inner">
              {/* Document Toolbar */}
              <div className="border-b border-gray-200 p-2 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    File
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Insert
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Format
                  </Button>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 p-6 bg-white overflow-auto">
                {isGenerated ? (
                  <div className="max-w-none">
                    <textarea
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      className="w-full h-full min-h-[500px] border-none outline-none resize-none font-serif text-sm leading-relaxed"
                      style={{
                        fontFamily: "Times New Roman, serif",
                        fontSize: "12pt",
                        lineHeight: "1.6",
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg mb-2">Document will appear here</p>
                      <p className="text-sm">Generate content to start editing</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Footer */}
              <div className="border-t border-gray-200 p-2 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                <span>Page 1 of 1</span>
                <span>{documentContent.length} characters</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
