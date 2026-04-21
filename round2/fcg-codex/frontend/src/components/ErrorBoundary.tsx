import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  public constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-panel" role="alert">
          <h2>Rendering Error</h2>
          <p>Something went wrong while rendering. Refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
