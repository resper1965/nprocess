'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
      mermaid.contentLoaded();
      
      const renderChart = async () => {
        try {
            // Unique ID for the container
             const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
             const { svg } = await mermaid.render(id, chart);
             if (containerRef.current) {
                containerRef.current.innerHTML = svg;
             }
        } catch (error) {
            console.error("Failed to render mermaid chart", error);
            if (containerRef.current) {
              containerRef.current.innerHTML = "<p>Diagram loading failed</p>";
            }
        }
      };

      renderChart();
    }
  }, [chart]);

  return <div ref={containerRef} className="mermaid-chart flex justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto" />;
}
