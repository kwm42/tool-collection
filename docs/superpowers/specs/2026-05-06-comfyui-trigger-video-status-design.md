# ComfyUI Trigger - Video Status Display Design

## Overview

Add video file existence status to the FileTree component in comfyui-trigger web tool. When displaying image files, show a colored dot indicating whether a corresponding video file exists in the parent directory.

## Requirements

- Video files are located in the **parent directory** of the image file
- Video filename starts with the **image filename (without extension)** as prefix
- Display status as a colored dot on image nodes in FileTree:
  - 🟢 Green dot: Video exists
  - ⚪ Gray dot: No video found

## File Changes

### 1. `src/types/index.ts`

Add `hasVideo` field to `FileNode` interface:

```typescript
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  handle?: FileSystemFileHandle;
  children?: FileNode[];
  previewUrl?: string;
  hasVideo?: boolean;  // New: whether corresponding video exists
}
```

### 2. `src/hooks/useFileSystem.ts`

Modify `scanDirectory` to perform two-phase scanning:

**Phase 1 - Build video index:**
- Scan all directories recursively
- Collect video files (`.mp4`) and build a Map: `parentDirPath → Map<filenamePrefix, videoFile[]>`
- Video prefix = video filename split on `___` or first `_` pattern (video filename before `___`)

**Phase 2 - Scan images and check video existence:**
- For each image file, calculate its parent directory path
- Look up the video index using parent path + image filename (without extension)
- Set `hasVideo = true` if match found, `false` otherwise

**Key logic:**
```typescript
// For image at path: "folder/subfolder/image.png"
// Parent dir: "folder/subfolder" -> go up one level -> "folder"
// Check if any video in "folder/" starts with "image" (without .png)
```

Actually, based on user clarification:
- Image: `伊芙琳-Cowgirl...v1/伊芙琳-Cowgirl...v1_00002_.png`
- Video in parent: `伊芙琳-Cowgirl...v1/伊芙琳-Cowgirl...v1_00002___cowgirl-通用_00001.mp4`

So the video is in the **same directory as the image's parent folder**, meaning:
- Image path: `A/B/C/image.png`
- Video location: `A/B/` (parent of C)
- Video filename starts with `image` (without .png)

**Implementation approach:**
1. First pass: scan all `.mp4` files, store as `Map<parentDirPath, Map<videoPrefix, videoFile>>`
2. Second pass: scan images, for each image at `path`, get parent dir, look up video index

### 3. `src/components/FileTree.tsx`

Update `TreeNode` component to display video status dot:

```tsx
// Inside TreeNode for file type
<div className="flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 ...">
  <span className="text-xs">📄</span>
  {node.type === 'file' && node.hasVideo !== undefined && (
    <span
      className={`w-2 h-2 rounded-full ${node.hasVideo ? 'bg-green-500' : 'bg-gray-300'}`}
    />
  )}
  <span>{node.name}</span>
</div>
```

## Data Flow

1. User selects directory via DirectoryPicker
2. `useFileSystem.scanDirectory` is called
3. Two-phase scan:
   - Phase 1: Build video index (Map of parent dir → video files by prefix)
   - Phase 2: Scan images, mark `hasVideo` based on video index
4. `FileTree` renders with colored dots on image nodes

## Edge Cases

- No video in parent dir: show gray dot
- Multiple videos match prefix: still show green dot (at least one exists)
- Image in root directory (no parent): no video check, no dot shown
- Non-image files: no dot shown

## Testing

- Select directory with known image/video pairs
- Verify green dot appears for images with videos
- Verify gray dot appears for images without videos
- Verify folders and non-image files have no dots
