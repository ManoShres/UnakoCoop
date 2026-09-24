import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  /** Optional custom fallback UI. When omitted the built-in recovery card is shown. */
  readonly fallback?: ReactNode;
  /** The component tree to wrap. */
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly errorMessage: string;
}

/**
 * React Error Boundary that prevents uncaught exceptions from crashing
 * the entire portal. Wraps route groups so a failure in one section
 * (e.g. Admin) doesn't tear down the Member portal or public site.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <AdminLayout />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      // Sanitize: show only the message, never the stack trace.
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to server-side error tracker in production (e.g. Sentry).
    // In development, the console output is sufficient.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught:', error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {this.state.errorMessage}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
