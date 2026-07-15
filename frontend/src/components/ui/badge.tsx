import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'room' | 'flatmate' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'sm', dot, children, className }: BadgeProps) {
  const dotColors: Record<string, string> = {
    default: 'bg-[var(--foreground-muted)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    destructive: 'bg-[var(--destructive)]',
    room: 'bg-[var(--accent-room)]',
    flatmate: 'bg-[var(--accent-flatmate)]',
    outline: 'bg-[var(--foreground-muted)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-full)] whitespace-nowrap',
        size === 'sm' && 'px-2.5 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        variant === 'default' && 'bg-[var(--muted-light)] text-[var(--foreground-secondary)] border border-[var(--muted-light)]',
        variant === 'success' && 'bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/10',
        variant === 'warning' && 'bg-[var(--warning-light)] text-[var(--warning)] border border-[var(--warning)]/10',
        variant === 'destructive' && 'bg-[var(--destructive-light)] text-[var(--destructive)] border border-[var(--destructive)]/10',
        variant === 'room' && 'bg-[var(--accent-room-light)] text-[var(--accent-room)] border border-[var(--accent-room)]/10',
        variant === 'flatmate' && 'bg-[var(--accent-flatmate-light)] text-[var(--accent-flatmate)] border border-[var(--accent-flatmate)]/10',
        variant === 'outline' && 'border border-[var(--border)] text-[var(--foreground-secondary)] bg-transparent',
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
