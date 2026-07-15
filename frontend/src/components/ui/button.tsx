'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'room' | 'flatmate';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 font-medium transition-all',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          // Radius
          'rounded-[var(--radius)]',
          // Sizes
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-10 px-5 text-sm',
          size === 'lg' && 'h-12 px-8 text-base',
          size === 'icon' && 'h-10 w-10',
          // Variants
          variant === 'primary' &&
            'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] shadow-sm',
          variant === 'secondary' &&
            'bg-[var(--muted-light)] text-[var(--foreground)] hover:bg-[var(--border)]',
          variant === 'ghost' &&
            'text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] hover:text-[var(--foreground)]',
          variant === 'outline' &&
            'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted-light)] hover:border-[var(--border-hover)]',
          variant === 'destructive' &&
            'bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90',
          variant === 'room' &&
            'bg-gradient-to-r from-[var(--accent-room)] to-[#3B82F6] text-white hover:opacity-90 shadow-sm',
          variant === 'flatmate' &&
            'bg-gradient-to-r from-[var(--accent-flatmate)] to-[#EF4444] text-white hover:opacity-90 shadow-sm',
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
