'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getFirebaseAuth } from '@/lib/firebase';
import { Building2, Key, Loader2, Plus, Copy, Check, Shield } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  plan: string;
  created_at: string;
}

interface ApiKey {
  id: string;
  key_prefix: string;
  status: string;
  created_at: string;
}

export default function NetworkPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Creation State
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState('starter');
  
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);



  const fetchTenants = useCallback(async () => {
    if (!user) return;
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
      const res = await fetch(`${apiUrl}/v1/system/tenants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
          const data = await res.json();
          setTenants(data);
          // Only select first if none selected
          if (data.length > 0 && !selectedTenant) setSelectedTenant(data[0]);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [user, selectedTenant]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);
  
  // Refresh helper
  const refreshTenants = fetchTenants;

  const fetchKeys = useCallback(async (tenantId: string) => {
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
      const res = await fetch(`${apiUrl}/v1/system/keys?tenant_id=${tenantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setKeys(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const handleCreateTenant = async () => {
    if (!newTenantName) return;
    setCreatingTenant(true);
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
      
      const res = await fetch(`${apiUrl}/v1/system/tenants`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTenantName, plan: newTenantPlan })
      });

      if (res.ok) {
          setNewTenantName('');
          fetchTenants();
      }
    } catch (e) { alert('Failed'); } finally { setCreatingTenant(false); }
  };

  const handleGenerateKey = async () => {
    if (!selectedTenant) return;
    setGeneratingKey(true);
    setNewKey(null);
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
      
      const res = await fetch(`${apiUrl}/v1/system/keys`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: selectedTenant.id, budget: 100.0 })
      });

      if (res.ok) {
          const data = await res.json();
          setNewKey(data.key);
          fetchKeys(selectedTenant.id);
      }
    } catch (e) { alert('Failed'); } finally { setGeneratingKey(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8">
       <div className="flex justify-between items-center border-b border-neutral-800 pb-6 mb-8">
        <div>
           <h1 className="text-3xl font-bold">Network & Access</h1>
           <p className="text-neutral-400 mt-2">Manage customer organizations and API access keys.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
        
        {/* LEFT: Tenants List */}
        <div className="lg:col-span-1 bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                <h3 className="font-semibold flex items-center"><Building2 className="w-4 h-4 mr-2"/> Tenants</h3>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {/* Create Form */}
                <div className="p-4 bg-neutral-800/50 rounded-lg space-y-2 mb-4">
                    <input 
                        placeholder="New Tenant Name"
                        value={newTenantName}
                        onChange={e => setNewTenantName(e.target.value)}
                        className="w-full bg-black border border-neutral-700 rounded p-2 text-sm text-white"
                    />
                    <div className="flex space-x-2">
                        <select 
                            value={newTenantPlan}
                            onChange={e => setNewTenantPlan(e.target.value)}
                            className="bg-black border border-neutral-700 rounded p-2 text-sm text-white flex-1"
                        >
                            <option value="starter">Starter</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                        <button 
                            onClick={handleCreateTenant}
                            disabled={creatingTenant || !newTenantName}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                            {creatingTenant ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* List */}
                {loading ? <div className="text-center p-4"><Loader2 className="animate-spin inline"/></div> : 
                   tenants.map(t => (
                       <button
                          key={t.id}
                          onClick={() => setSelectedTenant(t)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${selectedTenant?.id === t.id ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-100' : 'bg-transparent border-transparent hover:bg-neutral-800'}`}
                       >
                           <div className="font-medium">{t.name}</div>
                           <div className="text-xs opacity-60 uppercase tracking-widest">{t.plan}</div>
                       </button>
                   ))
                }
            </div>
        </div>

        {/* RIGHT: Keys for Selected Tenant */}
        <div className="lg:col-span-2 bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col relative">
            {!selectedTenant ? (
                <div className="flex-1 flex items-center justify-center text-neutral-500">Select a tenant to manage access.</div>
            ) : (
                <>
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white">{selectedTenant.name}</h3>
                            <p className="text-xs text-neutral-500 font-mono mt-1">ID: {selectedTenant.id}</p>
                        </div>
                        <button 
                            onClick={handleGenerateKey}
                            disabled={generatingKey}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                        >
                            {generatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                            <span>Generate New API Key</span>
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        
                        {/* New Key Display */}
                        {newKey && (
                            <div className="mb-6 p-4 bg-green-950/20 border border-green-900 rounded-xl animate-in slide-in-from-top-2">
                                <h4 className="text-green-400 font-medium mb-2 flex items-center"><Shield className="w-4 h-4 mr-2"/> New Key Generated</h4>
                                <div className="flex items-center space-x-2">
                                    <code className="flex-1 bg-black p-3 rounded text-green-200 font-mono text-sm break-all">
                                        {newKey}
                                    </code>
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(newKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                        className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                                    </button>
                                </div>
                                <p className="text-xs text-red-400 mt-2">Save this key now. It will not be shown again.</p>
                            </div>
                        )}

                        <h4 className="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-widest">Active Keys</h4>
                        
                        <div className="space-y-3">
                            {keys.length === 0 ? <p className="text-neutral-500 text-sm">No keys found.</p> : 
                                keys.map(k => (
                                    <div key={k.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg flex justify-between items-center group hover:border-neutral-700 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-neutral-800 rounded text-neutral-400">
                                                <Key className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm text-neutral-300">{k.key_prefix}****************</div>
                                                <div className="text-xs text-neutral-500">Created {new Date(k.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 bg-green-950/30 text-green-500 text-xs rounded border border-green-900/50 uppercase">
                                            {k.status}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </>
            )}
        </div>

      </div>
    </div>
  );
}
