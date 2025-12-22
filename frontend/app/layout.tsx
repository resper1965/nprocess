import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComplianceEngine - Mapeamento e Análise de Compliance",
  description: "Plataforma para mapeamento de processos e análise de compliance usando IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
