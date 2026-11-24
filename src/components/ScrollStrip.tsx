import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface ScrollStripProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  ariaLabel?: string;
}

/**
 * Horizontal pill/tab strip with dynamic left/right overflow fade cues
 * and subtle chevron scroll buttons on desktop viewports.
 */
export default function ScrollStrip({
  children,
  className,
  innerClassName,
  ariaLabel,
}: ScrollStripProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    checkOverflow();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(checkOverflow) : null;
    ro?.observe(el);
    window.addEventListener('resize', checkOverflow, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow, children]);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative flex items-center', className)} aria-label={ariaLabel}>
      {canLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-7 bg-gradient-to-r from-white dark:from-navy-900 to-transparent z-10 flex items-center">
          <button
            type="button"
            onClick={() => scrollBy(-220)}
            className="pointer-events-auto hidden sm:flex w-6 h-6 rounded-full bg-white/95 dark:bg-navy-800/95 border border-slate-200 dark:border-white/15 shadow-sm items-center justify-center text-slate-600 dark:text-slate-200 hover:text-navy-DEFAULT dark:hover:text-orange-DEFAULT transition-colors"
            aria-label="Scroll left"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      )}

      <div
        ref={scrollerRef}
        onScroll={checkOverflow}
        className={cn('rs-pill-strip flex items-center w-full', innerClassName)}
      >
        {children}
      </div>

      {canRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-7 bg-gradient-to-l from-white dark:from-navy-900 to-transparent z-10 flex items-center justify-end">
          <button
            type="button"
            onClick={() => scrollBy(220)}
            className="pointer-events-auto hidden sm:flex w-6 h-6 rounded-full bg-white/95 dark:bg-navy-800/95 border border-slate-200 dark:border-white/15 shadow-sm items-center justify-center text-slate-600 dark:text-slate-200 hover:text-navy-DEFAULT dark:hover:text-orange-DEFAULT transition-colors"
            aria-label="Scroll right"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
