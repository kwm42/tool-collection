import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:scale-95',
    secondary: 'bg-background-card border border-border text-text-secondary hover:border-primary hover:text-text-primary active:scale-95',
    icon: 'bg-transparent text-text-secondary hover:bg-background-hover active:scale-95',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-helper',
    md: 'px-4 py-2 text-body',
    lg: 'px-6 py-3 text-section-title',
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
