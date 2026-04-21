// Top-level React error boundary. FCG-SPECv3 §2.2: render errors must be
// caught and surfaced as a recoverable fallback rather than a blank screen.

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Never expose component-stack details to users; log for dev only.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  private readonly handleReset = (): void => {
    this.setState({ error: null });
  };

  public override render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          data-testid="error-boundary"
          className="mx-auto mt-10 max-w-md rounded-xl bg-red-950/40 p-6 text-white ring-1 ring-red-500/40"
        >
          <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
          <p className="mb-4 text-sm text-white/80">
            The page hit an unexpected render error. You can recover without reloading:
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
