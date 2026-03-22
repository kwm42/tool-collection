import { X } from 'lucide-react';
import { Button } from './common';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  alt = 'Fullscreen preview',
}: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-padding"
      onClick={onClose}
    >
      <Button
        variant="icon"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
        title="关闭"
      >
        <X className="w-6 h-6" />
      </Button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
