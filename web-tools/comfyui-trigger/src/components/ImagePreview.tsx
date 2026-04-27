import { FileNode } from '../types';

interface ImagePreviewProps {
  file: FileNode | null;
}

export function ImagePreview({ file }: ImagePreviewProps) {
  if (!file || file.type !== 'file') {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        请选择图片文件
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {file.previewUrl ? (
        <img
          src={file.previewUrl}
          alt={file.name}
          className="max-w-full max-h-64 mx-auto rounded"
        />
      ) : (
        <div className="text-center text-gray-500">无法预览</div>
      )}
      <p className="mt-2 text-sm text-gray-600 text-center truncate">{file.name}</p>
    </div>
  );
}