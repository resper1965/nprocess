'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getFirebaseAuth } from '@/lib/firebase';
import { Loader2, RefreshCw, UserCheck, X } from 'lucide-react';

interface User {
  uid: string;
  email: string;
  display_name: string;
  photo_url: string;
  status: string;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  plan: string;
}

export default function SystemAdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Approval Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');



  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';

      const [usersRes, tenantsRes] = await Promise.all([
        fetch(`${apiUrl}/v1/system/users?status_filter=pending`, { headers }),
        fetch(`${apiUrl}/v1/system/tenants`, { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (tenantsRes.ok) setTenants(await tenantsRes.json());

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleApprove = async () => {
    if (!selectedUser || !selectedTenant) return;
    setProcessing(selectedUser.uid);
    
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';

      const res = await fetch(`${apiUrl}/v1/system/approve_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_uid: selectedUser.uid,
          org_id: selectedTenant,
          role: selectedRole
        })
      });

      if (!res.ok) throw new Error('Failed to approve');

      // Success
      setSelectedUser(null);
      fetchData();

    } catch (e) {
      console.error(e);
      alert('Approval failed');
    } finally {
      setProcessing(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-6 mb-8">
        <div>
           <h1 className="text-3xl font-bold">System Admin</h1>
           <p className="text-neutral-400 mt-2">Approve new users and assign them to organizations.</p>
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
            <h3 className="font-semibold">Pending Users ({users.length})</h3>
        </div>

        {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-neutral-500" /></div>
        ) : users.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">No pending users found.</div>
        ) : (
            <div className="divide-y divide-neutral-800">
                {users.map(u => (
                    <div key={u.uid} className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-500">
                                {u.display_name?.[0] || u.email[0].toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{u.display_name || 'No Name'}</h4>
                                <p className="text-sm text-neutral-400">{u.email}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm text-neutral-500">
                             <span>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                             <button
                                onClick={() => {
                                    setSelectedUser(u);
                                    if(tenants.length > 0) setSelectedTenant(tenants[0].id);
                                }}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                             >
                                <UserCheck className="w-4 h-4" />
                                <span>Approve Access</span>
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Approval Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">Approve User</h3>
                    <button onClick={() => setSelectedUser(null)}><X className="w-5 h-5 text-neutral-500 hover:text-white" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">User</label>
                        <div className="p-3 bg-neutral-800 rounded-lg text-white">
                            {selectedUser.email}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Organization</label>
                        <select 
                            value={selectedTenant}
                            onChange={(e) => setSelectedTenant(e.target.value)}
                            className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                        >
                            {tenants.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.plan})</option>
                            ))}
                        </select>
                        {tenants.length === 0 && <p className="text-xs text-red-400 mt-1">No tenants found. Create one in Network & Access first.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Role</label>
                        <select 
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                        >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                </div>

                <div className="flex space-x-3 pt-2">
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleApprove}
                        disabled={processing === selectedUser.uid || tenants.length === 0}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium text-white transition-colors flex justify-center items-center space-x-2"
                    >
                        {processing === selectedUser.uid && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Confirm Approval</span>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
