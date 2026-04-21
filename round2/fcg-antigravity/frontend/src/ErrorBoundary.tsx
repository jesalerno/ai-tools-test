import { Component, ErrorInfo, ReactNode } from 'react';

// Spec exception: React error boundaries natively require class components.
// We strictly use classes only here to satisfy the mandatory error boundary constraint.

export interface Props {
  children?: ReactNode;
}

export interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 text-red-900 border border-red-200 rounded-lg max-w-md mx-auto mt-20 shadow-sm">
          <h1 className="text-xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">The application encountered an unexpected error and needs to recover.</p>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
