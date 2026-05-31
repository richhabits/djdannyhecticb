import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '../ui-components/atoms/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui-components/atoms/card';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden glassmorphism relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle className="text-red-500 w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-white uppercase italic">
                System Interference Detected
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-2">
                A critical exception has occurred in the broadcast matrix.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg bg-zinc-950/50 p-4 border border-white/5 overflow-hidden">
                <p className="text-xs font-mono text-zinc-500 uppercase mb-2">Error Log</p>
                <p className="text-sm font-mono text-red-400 break-all leading-relaxed">
                  {this.state.error?.message || 'Unknown Broadcast Error'}
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pb-8 px-8">
              <Button
                onClick={this.handleReset}
                className="w-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 font-bold uppercase tracking-widest py-6 group"
              >
                <RefreshCcw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Re-Initialize Dashboard
              </Button>

              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="w-full text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all duration-300"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Surface
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
