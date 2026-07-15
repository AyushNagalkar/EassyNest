'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'room' | 'flatmate';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.97] transform-gpu',
          'cursor-pointer',
          // Radius
          'rounded-[var(--radius)]',
          // Sizes
          size === 'sm' && 'h-8 px-3.5 text-xs',
          size === 'md' && 'h-10 px-5 text-sm',
          size === 'lg' && 'h-12 px-8 text-base',
          size === 'icon' && 'h-10 w-10',
          // Variants
          variant === 'primary' &&
            'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md',
          variant === 'secondary' &&
            'bg-[var(--muted-light)] text-[var(--foreground)] hover:bg-[var(--border)]',
          variant === 'ghost' &&
            'text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] hover:text-[var(--foreground)]',
          variant === 'outline' &&
            'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted-light)] hover:border-[var(--border-hover)]',
          variant === 'destructive' &&
            'bg-[var(--destructive)] text-white hover:brightness-110 shadow-sm',
          variant === 'room' &&
            'bg-gradient-to-r from-[var(--accent-room)] to-[#3B82F6] text-white hover:shadow-lg hover:shadow-[var(--accent-room)]/20 shadow-sm',
          variant === 'flatmate' &&
            'bg-gradient-to-r from-[var(--accent-flatmate)] to-[#EF4444] text-white hover:shadow-lg hover:shadow-[var(--accent-flatmate)]/20 shadow-sm',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
