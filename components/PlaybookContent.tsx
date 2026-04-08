"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
// Fixed: changed 'clock' to 'Clock'
import { Lightbulb, Clock, Send, CheckCircle2, ClipboardList, BookOpen } from "lucide-react"

export function PlaybookContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Application Strategy Playbook
        </h2>
        <p className="text-slate-500">The gold standard for securing interviews for our clients.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Principles */}
        <Card className="md:col-span-2 border-l-4 border-l-blue-600 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" /> Core Principles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 shrink-0">0</Badge>
              <p>Target <span className="font-bold italic">high probability (0.7+)</span> listings from LinkedIn/Indeed.</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 shrink-0">1</Badge>
              <p className="font-semibold text-red-700 underline decoration-red-200">ALWAYS apply via the hiring company's website. Never use "Easy Apply".</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 shrink-0">2</Badge>
              <div>
                <p className="font-medium">Quality Over Quantity: 15-45 minutes per application.</p>
                <ul className="ml-4 mt-2 list-disc text-sm space-y-1 text-slate-600">
                  <li>Fill out <strong>ALL</strong> optional fields.</li>
                  <li>In "How did you hear about us?" mention a specific interest in the team's mission.</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 shrink-0">3</Badge>
              <p>Upload quality-checked, tailored resume + cover letter. <strong>Never skip the cover letter.</strong></p>
            </div>
          </CardContent>
        </Card>

        {/* Timing Strategy */}
        <Card className="border-l-4 border-l-cyan-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700">
              {/* Fixed: changed <clock> to <Clock> */}
              <Clock className="w-5 h-5" /> Timing Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
                <p className="text-sm font-bold text-cyan-900 mb-2">Prime Window:</p>
                <p className="text-2xl font-black text-cyan-600 italic text-center uppercase tracking-tighter">Tues - Thurs</p>
                <p className="text-lg font-bold text-cyan-600 text-center">6:00 AM - 10:00 AM</p>
                <p className="text-[10px] text-cyan-800 text-center mt-2">(Company Local Time)</p>
             </div>
             <p className="text-xs text-slate-500">Recruiters review first thing; we want our clients at the top. Avoid Monday (backlog) and Friday (weekend skip).</p>
          </CardContent>
        </Card>

        {/* Frequency Constraint */}
        <Card className="border-l-4 border-l-amber-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <CheckCircle2 className="w-5 h-5" /> Frequency Guardrails
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[120px]">
             <p className="text-center text-lg font-medium text-slate-800 italic">
               "Never apply to more than one posting for the same company within the same <span className="font-black text-amber-600 not-italic uppercase">Fortnight</span>."
             </p>
          </CardContent>
        </Card>

        {/* Follow-up Section */}
        <Card className="md:col-span-2 border-l-4 border-l-green-600 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Send className="w-5 h-5" /> The Multi-Touch Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h4 className="font-bold text-sm text-slate-900 border-b pb-1">Step A: Immediate (24 Hours)</h4>
                    <p className="text-xs text-slate-600 font-medium">Connect with recruiter on LinkedIn.</p>
                    <div className="p-3 bg-slate-50 rounded border text-xs italic text-slate-600 leading-relaxed shadow-sm">
                        "I applied for [role] today. Happy to provide additional information about my experience with [relevant skill]."
                    </div>
                </div>
                <div className="space-y-2">
                    <h4 className="font-bold text-sm text-slate-900 border-b pb-1">Step B: 3-5 Days Later</h4>
                    <p className="text-xs text-slate-600 font-medium">Email hiring manager directly. <span className="text-green-600 font-bold">50% Success Rate.</span></p>
                    <div className="p-3 bg-green-50 border-green-100 rounded border text-xs text-slate-700 leading-relaxed shadow-sm">
                        "I submitted my application for [role] on [date]. Given my background in [specific experience], I believe I could contribute to [specific goal]. Would you be open to a brief conversation?"
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Section */}
        <Card className="md:col-span-2 border-t-4 border-t-slate-800 shadow-inner bg-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
              <ClipboardList className="w-5 h-5" /> Mandatory Tracking Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
                {["App Date", "Company", "Role", "Source", "Follow-up Date", "Response? (Y/N)", "Interview? (Y/N)"].map(field => (
                    <Badge key={field} variant="secondary" className="bg-white border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                      {field}
                    </Badge>
                ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 italic">Everything must be tracked in the client-specific spreadsheet tab without exception.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
