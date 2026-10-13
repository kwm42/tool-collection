export interface ToastItem {
  id: number;
  message: string;
}

interface Props {
  toasts: ToastItem[];
}

export function Toasts({ toasts }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-lg bg-[#333] px-5 py-3 text-[13px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
