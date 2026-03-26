import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { captureException, showReportDialog, isSentryEnabled } from '../services/sentryService';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    showReportButton?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    eventId: string | null;
}

/**
 * Global Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the error, and displays a fallback UI.
 * 
 * Usage:
 * <GlobalErrorBoundary>
 *   <App />
 * </GlobalErrorBoundary>
 */
export class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log to console in development
        console.error('Error caught by boundary:', error, errorInfo);

        // Capture error to Sentry
        const eventId = captureException(error, {
            componentStack: errorInfo.componentStack,
        });

        this.setState({
            errorInfo,
            eventId: eventId || null,
        });
    }

    handleRefresh = (): void => {
        window.location.reload();
    };

    handleGoHome = (): void => {
        window.location.href = '/';
    };

    handleReportError = (): void => {
        if (this.state.eventId) {
            showReportDialog(this.state.eventId);
        }
    };

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-lg w-full bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/60 shadow-xl"
                    >
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-2xl font-bold text-white text-center mb-3">
                            Something went wrong
                        </h1>

                        {/* Error Description */}
                        <p className="text-slate-400 text-center mb-6">
                            We've encountered an unexpected error. Our team has been notified
                            and is working to fix the issue.
                        </p>

                        {/* Error Details (Development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 overflow-auto max-h-40">
                                <p className="text-red-400 font-mono text-sm">
                                    {this.state.error.message}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-slate-500 text-xs mt-2 whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors"
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                        </div>

                        {/* Report Error Button */}
                        {this.props.showReportButton && isSentryEnabled() && (
                            <button
                                onClick={this.handleReportError}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
                            >
                                <Bug size={16} />
                                Report this error
                            </button>
                        )}

                        {/* Error ID (for support) */}
                        {this.state.eventId && (
                            <p className="text-center text-slate-500 text-xs mt-4">
                                Error ID: {this.state.eventId}
                            </p>
                        )}
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Section Error Boundary
 * 
 * A smaller error boundary for individual sections.
 * Shows a minimal error message without taking over the whole page.
 */
export class SectionErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        const eventId = captureException(error, {
            componentStack: errorInfo.componentStack,
        });
        this.setState({ errorInfo, eventId: eventId || null });
    }

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-red-400 font-medium">
                                This section encountered an error
                            </h3>
                            <p className="text-red-300/70 text-sm mt-1">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                            <button
                                onClick={this.handleRetry}
                                className="mt-3 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                                <RefreshCw size={14} />
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
