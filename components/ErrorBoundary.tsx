import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4" dir="rtl">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🐝</div>
            <h2 className="text-2xl font-bold text-gold-500 mb-2 font-amiri">
              عذراً! حدث خطأ غير متوقع
            </h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              نأسف، لكن حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-zinc-950 font-bold rounded-lg transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-right text-sm text-red-400 bg-zinc-900 p-4 rounded-lg">
                <summary className="cursor-pointer font-bold">تفاصيل الخطأ (للمطورين)</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
