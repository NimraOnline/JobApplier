import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "./providers/AuthProvider" // <--- Import AuthProvider
// import { ToasterProvider } from './providers/ToasterProvider'; // If you have a custom ToasterProvider that wraps shadcn/ui Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Employee Portal",
  description: "Employee portal for managing clients and AI tools",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/* <--- Wrap children with AuthProvider */}
          {children}
        </AuthProvider>
        <Toaster /> {/* <--- Make sure this is present if using shadcn/ui toast */}
      </body>
    </html>
  )
}
