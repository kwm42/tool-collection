import type { ButtonHTMLAttributes } from 'react';

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Tag({ selected = false, children, className = '', ...props }: TagProps) {
  return (
    <button
      className={`
        px-3 py-1.5 text-label rounded-sm transition-all duration-200
        ${selected 
          ? 'bg-primary text-white' 
          : 'bg-background-hover text-text-secondary hover:bg-background-selected hover:text-primary'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
