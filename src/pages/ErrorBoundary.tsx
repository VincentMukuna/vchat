import { Component, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-screen h-screen text-lg text-gray-50 bg-dark-blue1">
          Oops, Something wen't wrong!
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
