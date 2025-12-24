import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "ComplianceEngine - Process Mapping & Compliance Analysis",
  description: "Transform business process descriptions into structured BPMN diagrams and analyze compliance with regulatory frameworks using AI",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SidebarProvider defaultOpen={true}>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
