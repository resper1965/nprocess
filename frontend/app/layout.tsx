import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComplianceEngine - Process Mapping & Compliance Analysis",
  description: "Transform business process descriptions into structured BPMN diagrams and analyze compliance with regulatory frameworks using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
