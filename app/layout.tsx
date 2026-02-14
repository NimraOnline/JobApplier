import { createClient } from '@/lib/supabase/server' // ✅ FIXED: Must match the export in server.ts
import { AuthProvider } from './providers/AuthProvider'
import { Toaster } from "@/components/ui/toaster"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

// ✅ IMPORTANT: Force dynamic rendering so build doesn't crash on 'not-found'
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ FIXED: Use the correct function name
  const supabase = await createClient() 
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider initialUser={user} initialProfile={profile}>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
