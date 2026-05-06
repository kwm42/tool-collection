import { useState, useCallback } from 'react';
import { FileNode } from '../types';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const VIDEO_EXTENSIONS = ['.mp4'];

function isImageFile(name: string): boolean {
  const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
}

function isVideoFile(name: string): boolean {
  const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
  return VIDEO_EXTENSIONS.includes(ext);
}

type VideoIndex = Map<string, string[]>;

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

  const buildVideoIndex = useCallback(async (
    handle: FileSystemDirectoryHandle,
    basePath: string = ''
  ): Promise<VideoIndex> => {
    const index: VideoIndex = new Map();

    const scan = async (dirHandle: FileSystemDirectoryHandle, currentPath: string): Promise<void> => {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'directory') {
          await scan(entry, currentPath + '/' + entry.name);
        } else if (isVideoFile(entry.name)) {
          const videos = index.get(currentPath) || [];
          videos.push(entry.name);
          index.set(currentPath, videos);
        }
      }
    };

    await scan(handle, basePath);
    return index;
  }, []);

  const scanDirectory = useCallback(async (
    handle: FileSystemDirectoryHandle,
    path: string = '',
    videoIndex?: VideoIndex
  ): Promise<FileNode[]> => {
    const entries: FileNode[] = [];

    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        const children = await scanDirectory(entry, path + '/' + entry.name, videoIndex);
        if (children.length > 0) {
          entries.push({
            name: entry.name,
            type: 'folder',
            children,
          });
        }
      } else if (isImageFile(entry.name)) {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const previewUrl = URL.createObjectURL(file);
        const filePath = path + '/' + entry.name;

        let hasVideo: boolean | undefined = undefined;
        if (videoIndex) {
          hasVideo = checkVideoExists(filePath, entry.name, videoIndex);
        }

        entries.push({
          name: entry.name,
          type: 'file',
          path: filePath,
          handle: fileHandle,
          previewUrl,
          hasVideo,
        });
      }
    }

    return entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  function checkVideoExists(imagePath: string, imageName: string, videoIndex: VideoIndex): boolean {
    const imageNameWithoutExt = imageName.slice(0, imageName.lastIndexOf('.'));
    const lastSlash = imagePath.lastIndexOf('/');
    const imageDir = imagePath.slice(0, lastSlash);
    const secondLastSlash = imageDir.lastIndexOf('/');
    const grandparentDir = secondLastSlash >= 0 ? imageDir.slice(0, secondLastSlash) : '';

    const videosInDir = videoIndex.get(grandparentDir) || [];
    return videosInDir.some(v => v.startsWith(imageNameWithoutExt));
  }

  const loadDirectory = useCallback(async () => {
    const handle = await selectDirectory();
    if (!handle) return;

    setLoading(true);
    try {
      const videoIndex = await buildVideoIndex(handle);
      const scanned = await scanDirectory(handle, '', videoIndex);
      setFiles(scanned);
    } finally {
      setLoading(false);
    }
  }, [selectDirectory, scanDirectory, buildVideoIndex]);

  return { files, loading, dirHandle, loadDirectory };
}