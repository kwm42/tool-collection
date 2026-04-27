interface DirectoryPickerProps {
  dirHandle: FileSystemDirectoryHandle | null;
  onSelect: () => void;
  loading: boolean;
}

export function DirectoryPicker({ dirHandle, onSelect, loading }: DirectoryPickerProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
      <button
        onClick={onSelect}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? '加载中...' : '选择目录'}
      </button>
      <span className="text-sm text-gray-600">
        {dirHandle ? `已选择: ${dirHandle.name}` : '请选择图片目录'}
      </span>
    </div>
  );
}