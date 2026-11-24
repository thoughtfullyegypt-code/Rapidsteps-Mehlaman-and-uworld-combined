import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { publicUrl } from '@/lib/paths';

interface FrameworksProps {
  onSelectCase: (caseId: string) => void;
  onBack?: () => void;
}

interface FrameworksPayload {
  css: string;
  html: string;
}

let CACHED_FRAMEWORKS_DATA: FrameworksPayload | null = null;

function attachFrameworkInteractions(
  root: ShadowRoot | HTMLElement,
  scrollContainer: HTMLElement | null,
  onSelectCase: (id: string) => void
): () => void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel: string, base?: Element | null) => (base || root).querySelector(sel);
  const $$ = (sel: string, base?: Element | null) => Array.from((base || root).querySelectorAll(sel));
  const cleanupTasks: Array<() => void> = [];

  const addListener = (
    el: Element | null,
    evt: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => {
    if (el) {
      el.addEventListener(evt, handler, options);
      cleanupTasks.push(() => el.removeEventListener(evt, handler, options));
    }
  };

  const setStepsOpen = (container: Element | null, isOpen: boolean) => {
    if (!container) return;
    $$('details.step', container).forEach((details) => {
      (details as HTMLDetailsElement).open = isOpen;
    });
  };

  const scrollToEl = (target: Element | null) => {
    if (!target) return;
    const scroller = scrollContainer || document.scrollingElement || document.documentElement;
    const scrollMarginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top - scrollerRect.top + scroller.scrollTop - scrollMarginTop;
    scroller.scrollTo({
      top: Math.max(0, targetTop),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  // Expand / collapse all per system
  $$('[data-expand]').forEach((btn) => {
    const sysId = (btn as HTMLElement).dataset.expand;
    addListener(btn, 'click', () => setStepsOpen($('#sys-' + sysId), true));
  });

  $$('[data-collapse]').forEach((btn) => {
    const sysId = (btn as HTMLElement).dataset.collapse;
    addListener(btn, 'click', () => setStepsOpen($('#sys-' + sysId), false));
  });

  // Global expand / collapse all steps
  addListener($('#open-all'), 'click', () => setStepsOpen(root as HTMLElement, true));
  addListener($('#close-all'), 'click', () => setStepsOpen(root as HTMLElement, false));

  // Step flow jump buttons (data-go="sX-stepY")
  $$('.fl').forEach((btn) => {
    addListener(btn, 'click', () => {
      const stepId = (btn as HTMLElement).dataset.go;
      if (!stepId) return;
      const step = (root as DocumentFragment).getElementById(stepId) as HTMLDetailsElement | null;
      if (!step) return;
      step.open = true;
      scrollToEl(step);
      const summary = $('summary', step) as HTMLElement | null;
      if (summary) summary.focus({ preventScroll: true });
    });
  });

  // Navigation pills (both desktop sidebar and mobile chipscroll)
  const navLinks = $$('[data-nav]');
  const setActiveNav = (sysId: string | number) => {
    navLinks.forEach((link) => {
      const isMatch = (link as HTMLElement).dataset.nav === String(sysId);
      link.classList.toggle('on', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    const chipScroll = $('.chipscroll');
    const activeChip = chipScroll && $('.chipscroll a.on') as HTMLElement | null;
    if (chipScroll && activeChip && chipScroll.scrollWidth > chipScroll.clientWidth) {
      chipScroll.scrollTo({
        left: activeChip.offsetLeft - chipScroll.clientWidth / 2 + activeChip.clientWidth / 2,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  navLinks.forEach((link) => {
    addListener(link, 'click', (e) => {
      e.preventDefault();
      const sysId = (link as HTMLElement).dataset.nav;
      if (!sysId) return;
      const targetSys = (root as DocumentFragment).getElementById('sys-' + sysId);
      scrollToEl(targetSys);
      setActiveNav(sysId);
    });
  });

  // ScrollSpy with IntersectionObserver
  let observer: IntersectionObserver | null = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sys = (entry.target as HTMLElement).dataset.sys;
            if (sys) setActiveNav(sys);
          }
        });
      },
      {
        root: scrollContainer || null,
        rootMargin: '-20% 0px -70% 0px',
      }
    );
    $$('[data-sys]').forEach((sysEl) => observer?.observe(sysEl));
  }
  setActiveNav(1);

  // Live filter for the 28 Pathognomonic "Hot Hooks"
  const searchInput = $('#hk-q') as HTMLInputElement | null;
  const hookItems = $$('#hooks .hook');
  const countLabel = $('#hk-count');
  if (searchInput && countLabel) {
    addListener(searchInput, 'input', () => {
      const query = searchInput.value.trim().toLowerCase();
      let matchCount = 0;
      hookItems.forEach((hook) => {
        const isMatch = !query || (hook.textContent || '').toLowerCase().includes(query);
        (hook as HTMLElement).hidden = !isMatch;
        if (isMatch) matchCount++;
      });
      countLabel.textContent = `${matchCount} hook${matchCount === 1 ? '' : 's'}`;
    });
  }

  // Deep-link topic clicks if any
  $$('[data-case-id]').forEach((el) => {
    addListener(el, 'click', (e) => {
      e.preventDefault();
      const cid = (el as HTMLElement).dataset.caseId;
      if (cid) onSelectCase(cid);
    });
  });

  return () => {
    cleanupTasks.forEach((fn) => fn());
    if (observer) observer.disconnect();
  };
}

function decodeLiteralUnicode(html: string): string {
  return html.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

export default function Frameworks({ onSelectCase, onBack }: FrameworksProps) {
  const [data, setData] = useState<FrameworksPayload | null>(CACHED_FRAMEWORKS_DATA);
  const [loading, setLoading] = useState<boolean>(!CACHED_FRAMEWORKS_DATA);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (CACHED_FRAMEWORKS_DATA) return;
    let cancelled = false;
    fetch(publicUrl('/data/frameworks-rapidsteps.json'))
      .then((r) => r.json())
      .then((d: FrameworksPayload) => {
        CACHED_FRAMEWORKS_DATA = d;
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !data) return;

    const isDark = document.documentElement.classList.contains('dark');
    const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${data.css}</style><div class="rsm-root ${isDark ? 'dark-theme' : ''}">${decodeLiteralUnicode(data.html)}</div>`;

    const cleanupInteractions = attachFrameworkInteractions(shadow, scrollRef.current, onSelectCase);

    // Sync dark mode class if theme toggled
    const observer = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains('dark');
      const rootDiv = shadow.querySelector('.rsm-root');
      if (rootDiv) {
        rootDiv.classList.toggle('dark-theme', darkNow);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cleanupInteractions();
      observer.disconnect();
    };
  }, [data, onSelectCase]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onSelectCase('cardio-aortic-stenosis');
    }
  };

  return (
    <div className="rs-mwrap w-full h-full">
      {/* Top Bar matching RapidSteps.tech */}
      <div className="rs-mbar">
        <button
          type="button"
          onClick={handleBack}
          className="rs-back"
          aria-label="Back to Atlas"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Atlas</span>
        </button>
        <b>5-Step Frameworks</b>
      </div>

      {/* Main Scrollable Canvas Host */}
      <div ref={scrollRef} className="rs-mscroll" data-rs-master="true">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#526074] dark:text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin opacity-70" />
            <span className="text-[13px] font-medium">
              Loading 5-Step Master Frameworks…
            </span>
          </div>
        )}
        <div ref={hostRef} className="rs-mhost" />
      </div>
    </div>
  );
}
