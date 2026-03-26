import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity, Database, Server, Wifi } from 'lucide-react';
import { PageContainer } from './PageContainer';

interface DependencyStatus {
    name: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    latency_ms?: number;
    message?: string;
}

interface HealthData {
    status: string;
    timestamp: string;
    version: string;
    uptime_seconds: number;
    environment?: string;
    dependencies?: DependencyStatus[];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'healthy':
        case 'ready':
            return 'text-emerald-400';
        case 'degraded':
            return 'text-amber-400';
        default:
            return 'text-red-400';
    }
};

const getStatusBg = (status: string) => {
    switch (status) {
        case 'healthy':
        case 'ready':
            return 'bg-emerald-500/20 border-emerald-500/30';
        case 'degraded':
            return 'bg-amber-500/20 border-amber-500/30';
        default:
            return 'bg-red-500/20 border-red-500/30';
    }
};

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'healthy':
        case 'ready':
            return <CheckCircle className="w-5 h-5 text-emerald-400" />;
        case 'degraded':
            return <AlertTriangle className="w-5 h-5 text-amber-400" />;
        default:
            return <XCircle className="w-5 h-5 text-red-400" />;
    }
};

const DependencyIcon = ({ name }: { name: string }) => {
    switch (name.toLowerCase()) {
        case 'database':
            return <Database className="w-4 h-4" />;
        case 'redis':
            return <Server className="w-4 h-4" />;
        case 'razorpay':
            return <Wifi className="w-4 h-4" />;
        default:
            return <Activity className="w-4 h-4" />;
    }
};

const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
};

export const StatusPage = () => {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());

    const fetchHealth = async () => {
        try {
            setLoading(true);
            const response = await fetch('/health/detailed');
            const data = await response.json();
            setHealth(data);
            setError(null);
            setLastChecked(new Date());
        } catch (err) {
            setError('Unable to fetch health status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <PageContainer narrow>
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">System Status</h1>
                <p className="text-slate-400">AIBodyScan service health</p>
            </div>

            {/* Overall Status */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-6 mb-6 ${health ? getStatusBg(health.status) : 'bg-slate-800/50 border-slate-700'}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {health ? (
                            <StatusIcon status={health.status} />
                        ) : (
                            <Activity className="w-5 h-5 text-slate-400 animate-pulse" />
                        )}
                        <div>
                            <h2 className={`text-xl font-semibold ${health ? getStatusColor(health.status) : 'text-slate-300'}`}>
                                {health ? (
                                    health.status === 'healthy' ? 'All Systems Operational' :
                                        health.status === 'degraded' ? 'Partial Outage' :
                                            'Service Disruption'
                                ) : 'Checking...'}
                            </h2>
                            <p className="text-sm text-slate-400">
                                Last checked: {lastChecked.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchHealth}
                        disabled={loading}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </motion.div>

            {/* Stats Row */}
            {health && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-slate-500 text-xs mb-1">Version</p>
                        <p className="text-white font-mono">{health.version}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-slate-500 text-xs mb-1">Uptime</p>
                        <p className="text-white font-mono">{formatUptime(health.uptime_seconds)}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-slate-500 text-xs mb-1">Environment</p>
                        <p className="text-white font-mono">{health.environment || 'dev'}</p>
                    </div>
                </div>
            )}

            {/* Dependencies */}
            {health?.dependencies && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-slate-800">
                        <h3 className="text-white font-medium">Components</h3>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {health.dependencies.map((dep, index) => (
                            <motion.div
                                key={dep.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-6 py-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-slate-400">
                                        <DependencyIcon name={dep.name} />
                                    </div>
                                    <div>
                                        <span className="text-white capitalize">{dep.name}</span>
                                        {dep.message && (
                                            <p className="text-xs text-slate-500">{dep.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {dep.latency_ms !== undefined && (
                                        <span className="text-xs text-slate-500 font-mono">
                                            {dep.latency_ms}ms
                                        </span>
                                    )}
                                    <StatusIcon status={dep.status} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-6">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="text-center mt-10 text-slate-500 text-sm">
                <p>Powered by AIBodyScan</p>
            </div>
        </PageContainer>
    );
};

export default StatusPage;
