import type { Metadata } from "next"
import { Montserrat } from 'next/font/google'
import "./globals.css"
import { Providers } from "@/components/providers/providers"

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: "ness. | n.process Admin",
  description: "Manage your n.process platform with ease",
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
      <body className={`${montserrat.variable} font-montserrat antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
