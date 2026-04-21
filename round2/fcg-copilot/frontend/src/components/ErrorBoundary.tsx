/**
 * Error boundary component.
 * Catches render errors and displays a recoverable fallback per spec §2.2.
 * Prevents information leakage from unhandled render exceptions per spec §8.
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** React error boundary wrapping the main application. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: unknown, _info: ErrorInfo): void {
    // Log error without exposing details to user
    console.error('[ErrorBoundary] Render error caught');
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please try reloading.</p>
          <button onClick={this.handleReset} type="button">
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
