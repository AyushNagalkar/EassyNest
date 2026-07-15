import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3.5 rounded-[var(--radius)] border border-[var(--border)]',
            'bg-[var(--surface)] text-[var(--foreground)] text-sm',
            'placeholder:text-[var(--foreground-muted)]',
            'transition-all duration-200',
            'hover:border-[var(--border-hover)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--primary)] focus:bg-[var(--surface)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--destructive)] focus:ring-[var(--destructive)]/20 focus:border-[var(--destructive)]',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--destructive)] flex items-center gap-1">
            <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="8" opacity="0.15"/><path d="M8 4.5v4M8 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
