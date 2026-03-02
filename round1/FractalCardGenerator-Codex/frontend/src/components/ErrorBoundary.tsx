import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {hasError: false};

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {hasError: true};
  }

  componentDidCatch(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error('React rendering error', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <main className="app-shell">
          <section className="panel">
            <h1>Something went wrong</h1>
            <p>Reload the page to recover.</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
