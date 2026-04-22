import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

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
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    padding: '24px',
                    fontFamily: "'Inter', sans-serif",
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: '#fee2e2',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        marginBottom: 24
                    }}>
                        <AlertCircle size={40} />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>Something went wrong</h1>
                    <p style={{ fontSize: 16, color: '#64748b', fontWeight: 600, maxWidth: 450, lineHeight: 1.6, margin: '0 0 32px' }}>
                        The application encountered an unexpected error. This usually happens when data from the server is missing or malformed.
                    </p>
                    
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button 
                            onClick={() => window.location.reload()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '12px 24px', background: '#4f46e5', color: '#fff',
                                border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                            }}
                        >
                            <RefreshCw size={18} /> Refresh Page
                        </button>
                        <a 
                            href="/dashboard"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '12px 24px', background: '#fff', color: '#0f172a',
                                border: '1px solid #e2e8f0', borderRadius: 12, textDecoration: 'none',
                                fontWeight: 800, cursor: 'pointer'
                            }}
                        >
                            <Home size={18} /> Back to Dashboard
                        </a>
                    </div>
                    
                    {process.env.NODE_ENV === 'development' && (
                        <div style={{ marginTop: 40, padding: 16, background: '#fff', border: '1px solid #fee2e2', borderRadius: 12, textAlign: 'left', maxWidth: '100%', overflowX: 'auto' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8 }}>Debug Info</div>
                            <pre style={{ fontSize: 12, color: '#475569', margin: 0 }}>{this.state.error?.toString()}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
