import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6 text-center">
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md shadow-2xl">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-500/10 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-rose-500" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-4">Something went wrong.</h1>
                        <p className="text-neutral-400 mb-8 leading-relaxed">
                            We encountered an unexpected issue. It might be a momentary glitch or a network interruption.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 w-full"
                        >
                            <RefreshCcw size={18} /> Reload Page
                        </button>
                        <p className="mt-6 text-xs text-neutral-600 font-mono">
                            Error: {this.state.error?.toString()}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
