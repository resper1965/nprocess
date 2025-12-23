'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface DiagramViewerProps {
  mermaidCode: string;
  className?: string;
}

export default function DiagramViewer({ mermaidCode, className = '' }: DiagramViewerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !mermaidCode) return;

    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#00ade8',
        primaryTextColor: '#cbd5e1',
        primaryBorderColor: '#475569',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
      },
    });

    const render = async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        ref.current!.innerHTML = '';
        const { svg } = await mermaid.render(id, mermaidCode);
        ref.current!.innerHTML = svg;
      } catch (error) {
        console.error('Erro ao renderizar diagrama:', error);
        ref.current!.innerHTML = '<p class="text-red-400">Erro ao renderizar diagrama Mermaid</p>';
      }
    };

    render();
  }, [mermaidCode]);

  if (!mermaidCode) {
    return (
      <div className={`p-8 text-center text-[var(--foreground-muted)] ${className}`}>
        Nenhum diagrama disponível
      </div>
    );
  }

  return (
    <div className={`bg-[var(--background-secondary)] rounded-lg border border-[var(--border)] p-6 overflow-auto ${className}`}>
      <div ref={ref} className="mermaid-container flex justify-center items-center min-h-[200px]"></div>
    </div>
  );
}


