import { useState, useEffect } from 'react';
import { getDarkMode, setDarkMode } from '@/lib/storage';
import { cn } from '@/lib/cn';

export default function ThemeToggle({ variant = 'on-dark' }: { variant?: 'on-dark' | 'adaptive' }) {
  const [dark, setDark] = useState(getDarkMode);

  useEffect(() => {
    setDarkMode(dark);
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((v) => !v)}
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
        variant === 'adaptive'
          ? 'text-slate-600 hover:text-navy-DEFAULT hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          : 'text-white/80 hover:text-white hover:bg-white/10 border border-white/15'
      )}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
