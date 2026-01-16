'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getFirebaseAuth } from '@/lib/firebase';
import { FileText, Trash2, Loader2, RefreshCw } from 'lucide-react';

interface Document {
  doc_id: string;
  source_doc_id?: string;
  chunk_count: number;
  metadata?: {
    title?: string;
    filename?: string;
    ingested_at?: string;
    [key: string]: any;
  };
}

export default function DocumentList() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
      
      const res = await fetch(`${apiUrl}/v1/knowledge/documents?doc_type=private`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleRefresh = () => {
      fetchDocuments();
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setDeleting(docId);
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
      
      await fetch(`${apiUrl}/v1/knowledge/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh
      fetchDocuments();
    } catch (e) {
      console.error(e);
      alert('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Your Documents</h3>
        <button 
          onClick={handleRefresh}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
        </div>
      )}

      {!loading && documents.length === 0 && (
        <div className="text-center p-8 border border-dashed border-neutral-800 rounded-lg">
          <p className="text-neutral-500 text-sm">No documents found. Upload one above.</p>
        </div>
      )}

      <div className="space-y-2">
        {documents.map((doc) => (
          <div 
            key={doc.doc_id} 
            className="flex items-center justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-neutral-800 rounded">
                <FileText className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">
                  {doc.metadata?.title || doc.metadata?.filename || doc.doc_id}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-neutral-500">
                  <span>{doc.chunk_count} chunks</span>
                  <span>•</span>
                  <span>{new Date(doc.metadata?.ingested_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleDelete(doc.doc_id)}
              disabled={deleting === doc.doc_id}
              className="p-2 text-neutral-500 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
