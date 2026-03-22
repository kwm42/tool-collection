import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'selected';
  children: ReactNode;
}

export function Card({
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-md bg-background-card shadow-card transition-all duration-200';
  
  const variantStyles = {
    default: 'border border-border',
    hover: 'border border-border hover:border-primary hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
    selected: 'border-2 border-primary bg-background-selected',
  };
  
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
