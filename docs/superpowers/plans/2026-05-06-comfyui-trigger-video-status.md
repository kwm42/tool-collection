# ComfyUI Trigger - Video Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display colored dots on image files in FileTree to indicate whether a corresponding video file exists in the parent directory.

**Architecture:** Two-pass scanning approach. First pass builds a video index (mapping parent directories to video filenames). Second pass scans images and checks the video index to set `hasVideo` flag on FileNode.

**Tech Stack:** React, TypeScript, File System Access API

---

### Task 1: Add hasVideo field to FileNode type

**Files:**
- Modify: `web-tools/comfyui-trigger/src/types/index.ts:1-8`

- [ ] **Step 1: Add hasVideo to FileNode interface**

```typescript
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  handle?: FileSystemFileHandle;
  children?: FileNode[];
  previewUrl?: string;
  hasVideo?: boolean;
}
```

- [ ] **Step 2: Verify type compiles**

Run: `cd web-tools/comfyui-trigger && pnpm tsc --noEmit`
Expected: No errors (hasVideo is optional, so existing code still works)

- [ ] **Step 3: Commit**

```bash
git add web-tools/comfyui-trigger/src/types/index.ts
git commit -m "feat(comfyui-trigger): add hasVideo field to FileNode type"
```

---

### Task 2: Implement two-pass scanning in useFileSystem

**Files:**
- Modify: `web-tools/comfyui-trigger/src/hooks/useFileSystem.ts:1-74`

- [ ] **Step 1: Add video file helper and type definition**

Add after line 9 (`isImageFile` function):

```typescript
const VIDEO_EXTENSIONS = ['.mp4'];

function isVideoFile(name: string): boolean {
  const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
  return VIDEO_EXTENSIONS.includes(ext);
}

type VideoIndex = Map<string, string[]>;
```

- [ ] **Step 2: Add buildVideoIndex function**

Add after line 25 (after `selectDirectory` function):

```typescript
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
```

- [ ] **Step 3: Update scanDirectory to accept videoIndex and set hasVideo**

Replace the `scanDirectory` function (lines 27-58) with:

```typescript
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
```

- [ ] **Step 4: Update loadDirectory to use two-pass scanning**

Replace the `loadDirectory` function (lines 60-71) with:

```typescript
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
```

- [ ] **Step 5: Verify the hook compiles**

Run: `cd web-tools/comfyui-trigger && pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add web-tools/comfyui-trigger/src/hooks/useFileSystem.ts
git commit -m "feat(comfyui-trigger): implement two-pass scanning with video index"
```

---

### Task 3: Update FileTree to display video status dots

**Files:**
- Modify: `web-tools/comfyui-trigger/src/components/FileTree.tsx:49-57`

- [ ] **Step 1: Update TreeNode to display video status dot**

Replace the file rendering section in `TreeNode` (lines 49-57) with:

```tsx
  const isSelected = selectedFile?.path === node.path;

  if (node.type === 'file') {
    return (
      <div
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
        onClick={() => onSelect(node)}
      >
        <span className="text-xs">📄</span>
        {node.hasVideo !== undefined && (
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              node.hasVideo ? 'bg-green-500' : 'bg-gray-300'
            }`}
            title={node.hasVideo ? '有视频' : '无视频'}
          />
        )}
        <span>{node.name}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
      onClick={() => onSelect(node)}
    >
      <span className="text-xs">📄</span>
      <span>{node.name}</span>
    </div>
  );
```

Actually, the original code has the file rendering at lines 49-57. Let me provide the complete `TreeNode` function replacement:

Replace lines 17-58 (entire TreeNode function) with:

```tsx
function TreeNode({ node, level, selectedFile, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level === 0);

  if (node.type === 'folder') {
    return (
      <div>
        <div
          className="flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-xs">{expanded ? '▼' : '▶'}</span>
          <span className="font-medium">📁 {node.name}</span>
        </div>
        {expanded && node.children && (
          <div className="ml-4">
            {node.children.map((child, idx) => (
              <TreeNode
                key={idx}
                node={child}
                level={level + 1}
                selectedFile={selectedFile}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedFile?.path === node.path;

  return (
    <div
      className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
      onClick={() => onSelect(node)}
    >
      <span className="text-xs">📄</span>
      {node.hasVideo !== undefined && (
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            node.hasVideo ? 'bg-green-500' : 'bg-gray-300'
          }`}
          title={node.hasVideo ? '有视频' : '无视频'}
        />
      )}
      <span>{node.name}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify FileTree compiles**

Run: `cd web-tools/comfyui-trigger && pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Visual test**

Run: `cd web-tools/comfyui-trigger && pnpm dev`
- Open browser to the dev URL
- Select a directory containing images with and without corresponding videos
- Verify green dots appear on images with videos in parent directory
- Verify gray dots appear on images without videos
- Verify folders have no dots

- [ ] **Step 4: Commit**

```bash
git add web-tools/comfyui-trigger/src/components/FileTree.tsx
git commit -m "feat(comfyui-trigger): display video status dots in FileTree"
```

---

### Task 4: Final verification

- [ ] **Step 1: Run type check**

Run: `cd web-tools/comfyui-trigger && pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run build**

Run: `cd web-tools/comfyui-trigger && pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "feat(comfyui-trigger): add video status display in file tree"
```

---

## Self-Review Checklist

✅ Spec coverage:
- Video status display: Task 3 implements the colored dots
- Video detection in parent directory: Task 2 implements `checkVideoExists`
- Video filename prefix matching: Task 2 uses `startsWith(imageNameWithoutExt)`

✅ No placeholders: All code is complete with actual implementation

✅ Type consistency:
- `hasVideo` is `boolean | undefined` in FileNode
- `VideoIndex` type is properly defined and used
- All function signatures match between definition and usage
