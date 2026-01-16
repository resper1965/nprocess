'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/providers/auth-provider';
import { getFirebaseAuth } from '@/lib/firebase';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

// Dynamic import for client-side only BPMN library
const BpmnModeler = dynamic(() => import('@/components/process/bpmn-modeler'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
    </div>
  ),
});

export default function ProcessPage() {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [xml, setXml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description || !user) return;
    setGenerating(true);
    setXml(null);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';

      const res = await fetch(`${apiUrl}/v1/process/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           description,
           context: "Business Process Model and Notation 2.0"
        })
      });

      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Generation failed');
      }

      const data = await res.json();
      setXml(data.bpmn_xml);

    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const samplePrompts = [
    "Processo de reembolso de despesas corporativas com aprovação do gestor e financeiro.",
    "Onboarding de novo funcionário: criar email, acesso ao Slack e agendar reuniões.",
    "Fluxo de atendimento ao cliente N1, N2 e N3 com SLAs definidos."
  ];

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
       {/* Header */}
       <div className="border-b border-neutral-800 p-4 shrink-0 flex justify-between items-center bg-neutral-900/50">
           <div>
               <h1 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> AI Process Engine</h1>
               <p className="text-xs text-neutral-400">Generate standard BPMN 2.0 diagrams from natural language.</p>
           </div>
           {xml && (
               <button 
                  onClick={() => {
                        const blob = new Blob([xml], { type: 'text/xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `process-${Date.now()}.bpmn`;
                        a.click();
                  }}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-medium transition-colors"
               >
                 Download .bpmn
               </button>
           )}
       </div>

       <div className="flex-1 flex overflow-hidden">
           
           {/* LEFT: Prompt Input */}
           <div className="w-[400px] border-r border-neutral-800 bg-neutral-900/30 p-6 flex flex-col shrink-0 overflow-y-auto">
               <div className="flex-1 space-y-6">
                   <div>
                       <label className="block text-sm font-medium text-neutral-300 mb-2">Process Description</label>
                       <textarea 
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           placeholder="Describe your process in detail..."
                           className="w-full h-48 bg-black border border-neutral-800 rounded-lg p-4 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                       />
                   </div>

                   <div>
                       <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-widest">Try a generic example</p>
                       <div className="space-y-2">
                           {samplePrompts.map((sample, i) => (
                               <button 
                                  key={i}
                                  onClick={() => setDescription(sample)}
                                  className="w-full text-left p-2 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white rounded transition-colors truncate"
                               >
                                  {sample}
                               </button>
                           ))}
                       </div>
                   </div>
               </div>

               <div className="mt-6 pt-6 border-t border-neutral-800">
                   {error && (
                       <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400">
                           {error}
                       </div>
                   )}
                   
                   <button
                       onClick={handleGenerate}
                       disabled={generating || !description}
                       className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center space-x-2 group"
                   >
                       {generating ? (
                           <Loader2 className="w-5 h-5 animate-spin" />
                       ) : (
                           <>
                               <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                               <span>Generate Diagram</span>
                           </>
                       )}
                   </button>
               </div>
           </div>

           {/* RIGHT: Canvas */}
           <div className="flex-1 bg-neutral-950 relative overflow-hidden">
               {xml ? (
                   <BpmnModeler xml={xml} />
               ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600 space-y-4">
                        <div className="w-24 h-24 rounded-full bg-neutral-900 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-neutral-700" />
                        </div>
                        <p className="text-sm">Your diagram will appear here</p>
                    </div>
               )}
           </div>

       </div>
    </div>
  );
}


