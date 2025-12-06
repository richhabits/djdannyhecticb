/**
 * Error Boundary Components
 * 
 * Provides error handling and fallback UIs for React components.
 */

import React, { Component, ErrorInfo, ReactNode, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug, ArrowLeft } from "lucide-react";

// ============================================
// ERROR BOUNDARY CLASS
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Class-based Error Boundary for catching React rendering errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state if resetKeys change
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      if (
        prevProps.resetKeys?.length !== this.props.resetKeys?.length ||
        prevProps.resetKeys?.some((key, i) => key !== this.props.resetKeys?.[i])
      ) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.resetError);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// ============================================
// DEFAULT FALLBACK COMPONENTS
// ============================================

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Default error fallback UI
 */
export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="p-6 m-4 max-w-lg mx-auto">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            We're sorry, but something unexpected happened. Please try again.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={resetError} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Bug className="w-4 h-4" />
          {showDetails ? "Hide" : "Show"} error details
        </button>

        {showDetails && (
          <div className="w-full mt-4 p-4 bg-muted rounded-lg text-left">
            <p className="font-mono text-sm break-all text-red-400">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Minimal inline error fallback
 */
export function InlineErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded text-red-500 text-sm">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{error.message}</span>
      <button
        onClick={resetError}
        className="ml-auto flex-shrink-0 hover:text-red-400"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Card error fallback
 */
export function CardErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card className="p-4 border-red-500/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Failed to load</p>
          <p className="text-xs text-muted-foreground truncate">{error.message}</p>
          <Button onClick={resetError} size="sm" variant="ghost" className="mt-2">
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================
// PAGE-LEVEL ERROR FALLBACK
// ============================================

/**
 * Full page error fallback
 */
export function PageErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Oops!</h1>
          <p className="text-lg text-muted-foreground">
            Something went wrong while loading this page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={resetError} size="lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.history.back()} variant="outline" size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If the problem persists, please contact us at{" "}
            <a href="mailto:support@djdannyhecticb.com" className="text-accent hover:underline">
              support@djdannyhecticb.com
            </a>
          </p>
        </div>

        <details className="text-left text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Technical details
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded-lg overflow-x-auto text-xs">
            {error.stack || error.message}
          </pre>
        </details>
      </div>
    </div>
  );
}

// ============================================
// SPECIALIZED ERROR BOUNDARIES
// ============================================

/**
 * Error boundary for feature sections
 */
export function FeatureErrorBoundary({
  children,
  featureName,
}: {
  children: ReactNode;
  featureName: string;
}) {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium">{featureName} unavailable</p>
              <p className="text-sm text-muted-foreground">
                This feature encountered an error and couldn't load.
              </p>
            </div>
            <Button onClick={resetError} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}
      onError={(error) => {
        console.error(`[${featureName}] Error:`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary for async components
 */
export function AsyncErrorBoundary({
  children,
  onRetry,
}: {
  children: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
          <p className="text-center text-muted-foreground">
            Failed to load content
          </p>
          <Button
            onClick={() => {
              resetError();
              onRetry?.();
            }}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// ============================================
// HOOK FOR ERROR HANDLING
// ============================================

/**
 * Hook for handling errors in async operations
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error | unknown) => {
    if (error instanceof Error) {
      setError(error);
    } else {
      setError(new Error(String(error)));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        return await fn();
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    handleError,
    clearError,
    withErrorHandling,
  };
}

export default ErrorBoundary;
