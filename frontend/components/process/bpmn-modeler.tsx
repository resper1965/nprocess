'use client';

import { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { Button } from '@/components/ui/button';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import { Loader2, Maximize, Minus, Plus } from 'lucide-react';

interface BpmnModelerProps {
  xml: string;
}

export default function BpmnModeler({ xml }: BpmnModelerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Viewer
    const viewer = new BpmnViewer({
      container: containerRef.current,
      keyboard: { bindTo: document }
    });
    
    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    const importXml = async () => {
        if (!viewerRef.current || !xml) return;
        setLoading(true);
        setError(null);
        
        try {
            await viewerRef.current.importXML(xml);
            const canvas = viewerRef.current.get('canvas');
            canvas.zoom('fit-viewport');
            setLoading(false);
        } catch (err: any) {
            console.error('BPMN Import Error', err);
            setError('Failed to render diagram. Invalid BPMN XML.');
            setLoading(false);
        }
    };

    importXml();
  }, [xml]);

  const handleZoom = (delta: number) => {
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas');
    canvas.zoom(canvas.zoom() + delta);
  };

  const handleFit = () => {
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas');
    canvas.zoom('fit-viewport');
  };

  return (
    <div className="relative w-full h-full bg-white rounded-lg overflow-hidden border border-neutral-800">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2 bg-neutral-900/90 p-1.5 rounded-lg border border-neutral-700 shadow-lg text-white">
            <Button variant="ghost" size="icon" onClick={() => handleZoom(0.2)} className="h-8 w-8 hover:bg-neutral-700 text-white"><Plus className="w-4 h-4"/></Button>
            <Button variant="ghost" size="icon" onClick={() => handleZoom(-0.2)} className="h-8 w-8 hover:bg-neutral-700 text-white"><Minus className="w-4 h-4"/></Button>
            <Button variant="ghost" size="icon" onClick={handleFit} className="h-8 w-8 hover:bg-neutral-700 text-white"><Maximize className="w-4 h-4"/></Button>
        </div>

        {/* Loading Overlay */}
        {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        )}

        {/* Error Overlay */}
        {error && (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-50/90 text-red-600 p-4 text-center">
                 <div>
                    <p className="font-bold">Rendering Error</p>
                    <p className="text-sm">{error}</p>
                 </div>
             </div>
        )}

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
