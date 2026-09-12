import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Mono, Montserrat, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "LearnVerse | AI-Powered Adaptive Microlearning",
  description: "Turn heavy study materials into summaries, flashcards, quizzes, narrated reels, and adaptive knowledge-gap maps.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${plusJakartaSans.variable} ${montserrat.variable} ${ibmPlexMono.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
