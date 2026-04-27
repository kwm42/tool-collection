export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  handle?: FileSystemFileHandle;
  children?: FileNode[];
  previewUrl?: string;
}

export interface Workflow {
  id: string;
  name: string;
}

export interface TaskParams {
  prompt: string;
  seconds: number;
  inputImage: string;
  width: number;
  height: number;
  workflow: string;
  filenamePrefix: string;
}

export interface AppState {
  apiUrl: string;
  basePath: string;
  dirHandle: FileSystemDirectoryHandle | null;
  files: FileNode[];
  selectedFile: FileNode | null;
  workflows: Workflow[];
  params: Omit<TaskParams, 'filenamePrefix'>;
}