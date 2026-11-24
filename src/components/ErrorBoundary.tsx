import React from 'react';

/**
 * ErrorBoundary — catches render errors anywhere in the app so a single bad
 * component (or a failed data load that throws during render) shows a friendly
 * recovery screen instead of a blank page.
 */

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Surface in the console for debugging; no data leaves the browser.
    console.error('[RapidSteps] Unhandled render error:', error, info);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = import.meta.env.BASE_URL;
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#080D1A] text-[#0D1321] dark:text-[#F2F5FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="text-5xl" aria-hidden="true">
            🩺
          </div>
          <h1 className="text-xl font-extrabold font-display text-[#0D1321] dark:text-white">
            Something went wrong
          </h1>
          <p className="text-[15px] text-[#526074] dark:text-slate-400 leading-relaxed">
            Rapid Steps hit an unexpected error while loading this view. Your
            bookmarks, mastered topics and drill score are saved in this
            browser and are not affected.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-full bg-orange-DEFAULT text-navy-950 font-semibold text-[15px] hover:bg-orange-hover transition-colors duration-150"
            >
              Reload the app
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-full border border-[#CBD2DF] dark:border-white/15 bg-white dark:bg-[#0E1629] font-semibold text-[15px] hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors duration-150"
            >
              Go to home page
            </button>
          </div>
          <p className="text-[13px] text-[#526074] dark:text-slate-400">
            If this keeps happening, email{' '}
            <a
              href="mailto:support@rapidsteps.tech"
              className="font-semibold text-[#16236E] dark:text-orange-DEFAULT hover:underline"
            >
              support@rapidsteps.tech
            </a>
            .
          </p>
        </div>
      </div>
    );
  }
}
