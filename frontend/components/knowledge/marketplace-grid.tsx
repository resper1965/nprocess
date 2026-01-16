'use client';

import { useState } from 'react';
import { BookOpen, Shield, Code, Check } from 'lucide-react';

const DRIVERS = [
  {
    id: 'lgpd',
    title: 'LGPD Complete',
    description: 'Lei Geral de Proteção de Dados (Brasil). Includes all articles and latest amendments.',
    icon: Shield,
    version: '2025.1'
  },
  {
    id: 'gdpr',
    title: 'GDPR Standard',
    description: 'General Data Protection Regulation (EU). Enhanced privacy controls context.',
    icon: Shield,
    version: '2.0'
  },
  {
    id: 'bpmn',
    title: 'BPMN 2.0 Spec',
    description: 'Object Management Group official specification for business process modeling.',
    icon: Code,
    version: '2.0.2'
  },
  {
    id: 'cvm',
    title: 'CVM Regulations',
    description: 'Brazilian Securities Commission norms for financial market audits.',
    icon: BookOpen,
    version: '1.4'
  }
];

export default function MarketplaceGrid() {
  const [activeDrivers, setActiveDrivers] = useState<Set<string>>(new Set(['lgpd', 'bpmn']));

  const toggleDriver = (id: string) => {
    setActiveDrivers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DRIVERS.map((driver) => {
        const isActive = activeDrivers.has(driver.id);
        
        return (
          <div 
            key={driver.id} 
            className={`
              relative p-6 rounded-xl border transition-all duration-300
              ${isActive 
                ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_15px_rgba(0,173,232,0.1)]' 
                : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
              }
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${isActive ? 'bg-cyan-900/30 text-cyan-400' : 'bg-neutral-800 text-neutral-400'}`}>
                <driver.icon className="w-6 h-6" />
              </div>
              <button
                onClick={() => toggleDriver(driver.id)}
                className={`
                  text-xs font-medium px-3 py-1 rounded-full border transition-colors
                  ${isActive 
                    ? 'bg-cyan-500 text-white border-cyan-500' 
                    : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500'
                  }
                `}
              >
                {isActive ? 'ACTIVE' : 'ACTIVATE'}
              </button>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{driver.title}</h3>
            <p className="text-sm text-neutral-400 mb-4 h-10 line-clamp-2">
              {driver.description}
            </p>

            <div className="flex items-center space-x-2 text-xs text-neutral-500">
              <span className="px-2 py-0.5 bg-neutral-800 rounded">v{driver.version}</span>
              <span>•</span>
              <span>Verified Driver</span>
            </div>
            
            {isActive && (
               <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                 {/* Optional checkmark indicator */}
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
