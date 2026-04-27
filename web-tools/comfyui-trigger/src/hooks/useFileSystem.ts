import { useState, useCallback } from 'react';
import { FileNode } from '../types';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

function isImageFile(name: string): boolean {
  const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
}

export function useFileSystem() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const selectDirectory = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirHandle(handle);
      return handle;
    } catch (e) {
      console.error('Failed to select directory:', e);
      return null;
    }
  }, []);

  const scanDirectory = useCallback(async (handle: FileSystemDirectoryHandle, path = ''): Promise<FileNode[]> => {
    const entries: FileNode[] = [];
    
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        const children = await scanDirectory(entry, path + '/' + entry.name);
        if (children.length > 0) {
          entries.push({
            name: entry.name,
            type: 'folder',
            children,
          });
        }
      } else if (isImageFile(entry.name)) {
        entries.push({
          name: entry.name,
          type: 'file',
          path: path + '/' + entry.name,
          handle: entry as FileSystemFileHandle,
        });
      }
    }
    
    return entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const loadDirectory = useCallback(async () => {
    const handle = await selectDirectory();
    if (!handle) return;
    
    setLoading(true);
    try {
      const scanned = await scanDirectory(handle);
      setFiles(scanned);
    } finally {
      setLoading(false);
    }
  }, [selectDirectory, scanDirectory]);

  return { files, loading, dirHandle, loadDirectory };
}