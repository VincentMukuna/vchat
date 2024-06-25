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
        <div className="flex h-screen w-screen items-center justify-center bg-gray-100 text-lg dark:bg-dark-blue1 dark:text-gray-50">
          Oops, Something wen't wrong!
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
