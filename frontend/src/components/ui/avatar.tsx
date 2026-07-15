import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = 'md', showStatus, online, className }: AvatarProps) {
  const dimensions = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-lg',
  }[size];

  const statusSize = {
    sm: 'h-2.5 w-2.5 border-[1.5px]',
    md: 'h-3 w-3 border-2',
    lg: 'h-3.5 w-3.5 border-2',
    xl: 'h-4 w-4 border-2',
  }[size];

  const content = src ? (
    <img
      src={src}
      alt={name}
      className={cn(
        'rounded-full object-cover ring-2 ring-[var(--surface)] shrink-0',
        dimensions,
        className,
      )}
    />
  ) : (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0',
        'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-gradient-to)] text-white',
        dimensions,
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );

  if (showStatus) {
    return (
      <div className="relative inline-flex shrink-0">
        {content}
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-[var(--surface)]',
            statusSize,
            online ? 'bg-[var(--success)]' : 'bg-[var(--foreground-muted)]',
          )}
        />
      </div>
    );
  }

  return content;
}
