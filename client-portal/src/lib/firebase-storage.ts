/**
 * Firebase Storage helpers for file uploads
 */
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebase-config';

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (
  file: File,
  path: string,
  metadata?: { contentType?: string; customMetadata?: Record<string, string> }
): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: metadata?.contentType || file.type,
    customMetadata: metadata?.customMetadata || {}
  });
  return await getDownloadURL(snapshot.ref);
};

/**
 * Upload a backup file
 */
export const uploadBackup = async (
  file: File,
  userId: string,
  backupId: string
): Promise<string> => {
  const path = `backups/${userId}/${backupId}/${file.name}`;
  return await uploadFile(file, path, {
    contentType: 'application/zip',
    customMetadata: {
      userId,
      backupId,
      uploadedAt: new Date().toISOString()
    }
  });
};

/**
 * Upload a document
 */
export const uploadDocument = async (
  file: File,
  userId: string,
  documentId: string
): Promise<string> => {
  const path = `documents/${userId}/${documentId}/${file.name}`;
  return await uploadFile(file, path, {
    contentType: file.type,
    customMetadata: {
      userId,
      documentId,
      uploadedAt: new Date().toISOString()
    }
  });
};

/**
 * Upload a template
 */
export const uploadTemplate = async (
  file: File,
  templateId: string
): Promise<string> => {
  const path = `templates/${templateId}/${file.name}`;
  return await uploadFile(file, path, {
    contentType: file.type,
    customMetadata: {
      templateId,
      uploadedAt: new Date().toISOString(),
      public: 'true'
    }
  });
};

/**
 * Get download URL for a file
 */
export const getFileUrl = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};

/**
 * Delete a file
 */
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

/**
 * List files in a directory
 */
export const listFiles = async (path: string): Promise<string[]> => {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);
  return result.items.map(item => item.fullPath);
};

