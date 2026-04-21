import { Component, type ReactNode } from "react";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fallback">
          <h2>Rendering issue detected</h2>
          <p>Refresh the page to recover. Your session is still safe.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
