import { useRef, useState } from "react";

export function UploadPanel({ onAddFiles }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files) {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length > 0) onAddFiles(images);
  }

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors cursor-pointer ${
        dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white"
      }`}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="text-2xl">🖼️</div>
      <div className="mt-1 text-sm text-slate-600">点击或拖拽图片上传</div>
      <div className="mt-1 text-xs text-slate-400">支持多张图片</div>
    </div>
  );
}