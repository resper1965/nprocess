'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getFirebaseAuth } from '@/lib/firebase';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function DocumentUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setStatus('idle');
    setMessage('');

    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', 'private');
      formData.append('strategy', 'default');
      formData.append('metadata', JSON.stringify({
        title: file.name,
        source: 'upload_ui'
      }));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
      
      const res = await fetch(`${apiUrl}/v1/knowledge/ingest/file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();
      setStatus('success');
      setMessage(`Successfully ingested ${data.chunk_count} chunks from ${file.name}`);

    } catch (error: unknown) {
      console.error(error);
      setStatus('error');
      const messageText = error instanceof Error ? error.message : 'Upload failed';
      setMessage(messageText);
    } finally {
      setUploading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-cyan-500 bg-cyan-950/20' : 'border-neutral-700 hover:border-neutral-500'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-neutral-800 rounded-full">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-neutral-400" />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-lg font-medium text-white">
              {uploading ? 'Processing Document...' : 'Drop PDF or Text file here'}
            </p>
            <p className="text-sm text-neutral-400">
              Drag & drop or click to select
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-950/30 border border-green-900 rounded-lg flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-200 text-sm">{message}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-950/30 border border-red-900 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-200 text-sm">{message}</span>
        </div>
      )}
    </div>
  );
}
