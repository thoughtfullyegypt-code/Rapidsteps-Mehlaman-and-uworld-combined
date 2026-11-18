import React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function SystemIcon({
  systemId,
  size = 18,
  className = '',
  strokeWidth = 1.85,
}: IconProps & { systemId: string }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
  };

  switch (systemId) {
    case 'cardio':
      return (
        <svg {...props}>
          <path d="M19.5 12.572 12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
          <path d="M7.5 12h2l1.2-2.5 2.1 5 1.3-2.5h2.4" />
        </svg>
      );
    case 'renal':
      return (
        <svg {...props}>
          <path d="M8.5 4C5.5 4 3.5 6.8 3.5 10.5S5.5 17 8.2 17c1.7 0 2.6-1.1 2.6-2.5 0-1.1-.8-1.8-.8-3s.8-1.9.8-3C10.8 7.1 10 4 8.5 4Z" />
          <path d="M15.5 4c3 0 5 2.8 5 6.5S18.5 17 15.8 17c-1.7 0-2.6-1.1-2.6-2.5 0-1.1.8-1.8.8-3s-.8-1.9-.8-3C13.2 7.1 14 4 15.5 4Z" />
          <path d="M10 11.5h1.5v8.5M14 11.5h-1.5v8.5" />
        </svg>
      );
    case 'pulm':
      return (
        <svg {...props}>
          <path d="M12 3v7" />
          <path d="M12 10 8.5 12.5M12 10l3.5 2.5" />
          <path d="M9.5 6.5C6 6.5 3.5 10.5 3.5 15.5c0 2.5 1.5 4 3.8 4 2.2 0 3.2-1.2 3.2-3.5V11" />
          <path d="M14.5 6.5c3.5 0 6 4 6 9 0 2.5-1.5 4-3.8 4-2.2 0-3.2-1.2-3.2-3.5V11" />
        </svg>
      );
    case 'gi':
      return (
        <svg {...props}>
          <path d="M10 3v3.5c0 1.5-1.2 2.5-2.8 3.2C4.8 10.8 4 13 4.5 15.5c.6 3 3.4 4.8 6.8 4.5 3.8-.3 6.7-3.2 6.7-7 0-2.8-1.8-4.8-4.2-5.2-1.2-.2-1.8-.8-1.8-2V3" />
          <path d="M11 20v1.5" />
        </svg>
      );
    case 'endo':
      return (
        <svg {...props}>
          <path d="M12 8v8" />
          <path d="M12 9.5C10.2 7 6.5 6.5 5 9c-1.4 2.3-.8 6.2 1.5 7.8 2 1.4 4.3.2 5.5-2" />
          <path d="M12 9.5c1.8-2.5 5.5-3 7-.5 1.4 2.3.8 6.2-1.5 7.8-2 1.4-4.3.2-5.5-2" />
          <circle cx="12" cy="4.5" r="1.5" />
        </svg>
      );
    case 'repro':
      return (
        <svg {...props}>
          <circle cx="12" cy="10" r="5.5" />
          <path d="M12 15.5V21M9.5 18.5h5" />
          <path d="M4.5 6.5C6.5 8 8 9 8.5 10M19.5 6.5C17.5 8 16 9 15.5 10" />
        </svg>
      );
    case 'heme':
      return (
        <svg {...props}>
          <path d="M12 3s6.5 6.8 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 9.8 12 3 12 3Z" />
          <circle cx="12" cy="14.5" r="2.5" />
        </svg>
      );
    case 'neuro':
      return (
        <svg {...props}>
          <path d="M12 5a3 3 0 0 0-5.9.8A3.5 3.5 0 0 0 4 9.2a3.5 3.5 0 0 0 1.2 6.2A3 3 0 0 0 9.5 19H12V5Z" />
          <path d="M12 5a3 3 0 0 1 5.9.8A3.5 3.5 0 0 1 20 9.2a3.5 3.5 0 0 1-1.2 6.2A3 3 0 0 1 14.5 19H12V5Z" />
          <path d="M12 19v2.5M9 10.5h1.5M13.5 13h1.5" />
        </svg>
      );
    case 'msk':
      return (
        <svg {...props}>
          <path d="M16.5 4.5a2.2 2.2 0 0 1 3 3c-.5.5-1.2.6-1.8.5l-9.4 9.4c.1.6 0 1.3-.5 1.8a2.2 2.2 0 1 1-3-3c.5-.5 1.2-.6 1.8-.5l9.4-9.4c-.1-.6 0-1.3.5-1.8Z" />
          <path d="M5 5.5a2 2 0 0 1 2.8 0M16.2 18.5a2 2 0 0 0 2.8 0" />
        </svg>
      );
    case 'derm':
      return (
        <svg {...props}>
          <rect x="3" y="7" width="18" height="13" rx="2.5" />
          <path d="M3 11.5c3 0 3 1.5 6 1.5s3-1.5 6-1.5 3 1.5 6 1.5" />
          <path d="M3 16h18" />
          <path d="M13 3c-.8 2-1.2 4-.8 6.5" />
        </svg>
      );
    case 'biochem':
      return (
        <svg {...props}>
          <path d="M7 3c0 5 10 5 10 9s-10 4-10 9" />
          <path d="M17 3c0 5-10 5-10 9s10 4 10 9" />
          <path d="M8.5 6h7M8.5 18h7M7.5 12h9" />
        </svg>
      );
    case 'micro':
      return (
        <svg {...props}>
          <path d="M6 18h8" />
          <path d="M3 21h18" />
          <path d="M14 21a7 7 0 0 0 0-14h-1" />
          <path d="M9 14h2" />
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
          <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </svg>
      );
    case 'path':
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <path d="M7 9.5h.01M17 14.5h.01" />
        </svg>
      );
    case 'psych':
      return (
        <svg {...props}>
          <path d="M12 3a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7V20h7v-2h1.5a2 2 0 0 0 2-2v-2.2l1.5-1.3-1.5-1.8A7 7 0 0 0 12 3Z" />
          <path d="M10.5 8.5 12 7l1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5" />
        </svg>
      );
    case 'epi':
      return (
        <svg {...props}>
          <path d="M3 20h18" />
          <path d="M4 18c3 0 4.5-11 8-11s5 11 8 11" />
          <path d="M12 7v13" strokeDasharray="2 2" />
        </svg>
      );
    case 'pharm':
    default:
      return (
        <svg {...props}>
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      );
  }
}

export function IconBookOpen({ size = 16, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function IconAtlas({ size = 16, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
}

export function IconMap({ size = 16, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8.2 7.2 10.8 16M15.8 7.2 13.2 16M8.5 6h7" />
    </svg>
  );
}

export function IconZap({ size = 16, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconScan({ size = 16, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="11" cy="11" r="4" />
      <path d="m14 14 3 3" />
    </svg>
  );
}

export function IconSteps({ size = 16, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M6 7v3M8 12h8M18 14v3" />
    </svg>
  );
}

export function IconVideo({ size = 15, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="5" width="14" height="14" rx="2.5" />
      <path d="m16 10 6-3.5v11L16 14v-4Z" />
    </svg>
  );
}

export function IconImage({ size = 15, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function IconTable({ size = 15, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  );
}

export function IconEye({ size = 15, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ size = 15, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function IconBookmark({ size = 15, className = '', filled = false, strokeWidth = 1.9 }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconFlag({ size = 15, className = '', filled = false, strokeWidth = 1.9 }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export function IconCheck({ size = 14, className = '', strokeWidth = 2.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconCheckCircle({ size = 15, className = '', filled = false, strokeWidth = 2 }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.3 2.3 4.8-5" stroke={filled ? '#fff' : 'currentColor'} />
    </svg>
  );
}

export function IconShield({ size = 15, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconLock({ size = 15, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function IconAlert({ size = 16, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m10.29 3.86-8.47 14.14A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconSliders({ size = 16, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

export function IconZoomIn({ size = 13, className = '', strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export function IconChevronDown({ size = 14, className = '', strokeWidth = 2.2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function IconX({ size = 15, className = '', strokeWidth = 2.2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconArrows({ size = 15, className = '', strokeWidth = 1.9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </svg>
  );
}
