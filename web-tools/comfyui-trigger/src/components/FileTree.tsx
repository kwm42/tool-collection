import { useState } from 'react';
import { FileNode } from '../types';

interface FileTreeProps {
  files: FileNode[];
  selectedFile: FileNode | null;
  onSelect: (file: FileNode) => void;
}

interface TreeNodeProps {
  node: FileNode;
  level: number;
  selectedFile: FileNode | null;
  onSelect: (file: FileNode) => void;
}

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
      <span>{node.name}</span>
    </div>
  );
}

export function FileTree({ files, selectedFile, onSelect }: FileTreeProps) {
  if (files.length === 0) {
    return <div className="p-4 text-gray-500">请先选择目录</div>;
  }

  return (
    <div className="border rounded-lg overflow-auto" style={{ maxHeight: '70vh' }}>
      {files.map((node, idx) => (
        <TreeNode
          key={idx}
          node={node}
          level={0}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}