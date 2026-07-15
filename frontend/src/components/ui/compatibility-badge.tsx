'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScoreColor, getScoreLabel } from '@/lib/utils';

interface CompatibilityBadgeProps {
  score: number | null | undefined;
  explanation?: string | null;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

export function CompatibilityBadge({
  score,
  explanation,
  size = 'md',
  animate = true,
  className,
}: CompatibilityBadgeProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [revealed, setRevealed] = useState(!animate);
  const popoverRef = useRef<HTMLDivElement>(null);

  const dimensions = {
    sm: { outer: 44, stroke: 3, fontSize: '11px', labelSize: '8px' },
    md: { outer: 64, stroke: 4, fontSize: '16px', labelSize: '10px' },
    lg: { outer: 88, stroke: 5, fontSize: '22px', labelSize: '12px' },
  }[size];

  const radius = (dimensions.outer - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score != null ? score / 100 : 0;
  const offset = circumference * (1 - progress);
  const color = getScoreColor(score);

  // Reveal animation on mount
  useEffect(() => {
    if (animate && score != null) {
      const timer = setTimeout(() => setRevealed(true), 200);
      return () => clearTimeout(timer);
    }
  }, [animate, score]);

  // Close popover on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    }
    if (showPopover) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPopover]);

  if (score == null) return null;

  return (
    <div className={`relative inline-flex ${className || ''}`} ref={popoverRef}>
      {/* Ring */}
      <button
        onClick={() => explanation && setShowPopover(!showPopover)}
        className="relative flex items-center justify-center cursor-pointer group"
        aria-label={`Compatibility score: ${score}%`}
        style={{ width: dimensions.outer, height: dimensions.outer }}
      >
        <svg
          width={dimensions.outer}
          height={dimensions.outer}
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={dimensions.outer / 2}
            cy={dimensions.outer / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={dimensions.stroke}
          />
          {/* Progress ring */}
          <motion.circle
            cx={dimensions.outer / 2}
            cy={dimensions.outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: revealed ? offset : circumference }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>

        {/* Score number */}
        <motion.span
          className="absolute font-bold"
          style={{ fontSize: dimensions.fontSize, color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.5 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          {score}
        </motion.span>

        {/* Pulse ring on hover */}
        {explanation && (
          <span
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              boxShadow: `0 0 0 2px ${color}20`,
            }}
          />
        )}
      </button>

      {/* Explanation popover */}
      <AnimatePresence>
        {showPopover && explanation && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-72 p-4 rounded-[var(--radius-lg)] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-sm font-semibold"
                style={{ color }}
              >
                {getScoreLabel(score)} — {score}%
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--foreground-secondary)]">
              {explanation}
            </p>
            {/* Arrow */}
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[var(--surface-elevated)] border-l border-t border-[var(--border)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
