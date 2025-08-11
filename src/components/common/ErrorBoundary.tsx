import React from "react";

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // eslint-disable-next-line no-console
    console.error("Home ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <main className="container py-16">
          <h1 className="text-2xl font-bold mb-3">We hit a snag loading the page</h1>
          <p className="text-muted-foreground mb-6">Please try again or jump straight into writing.</p>
          <a href="/create" className="inline-flex items-center gap-2 rounded-md px-5 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition">Start Writing</a>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
