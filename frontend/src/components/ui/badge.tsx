import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'room' | 'flatmate' | 'outline';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-[var(--radius-full)]',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        variant === 'default' && 'bg-[var(--muted-light)] text-[var(--foreground-secondary)]',
        variant === 'success' && 'bg-[var(--success-light)] text-[var(--success)]',
        variant === 'warning' && 'bg-[var(--warning-light)] text-[var(--warning)]',
        variant === 'destructive' && 'bg-[var(--destructive-light)] text-[var(--destructive)]',
        variant === 'room' && 'bg-[var(--accent-room-light)] text-[var(--accent-room)]',
        variant === 'flatmate' && 'bg-[var(--accent-flatmate-light)] text-[var(--accent-flatmate)]',
        variant === 'outline' && 'border border-[var(--border)] text-[var(--foreground-secondary)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
