import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers/providers"

export const metadata: Metadata = {
  title: "ComplianceEngine - Admin Dashboard",
  description: "Manage your compliance platform with ease",
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
