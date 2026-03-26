/**
 * Status Page Screen
 * System status, server health, and maintenance info
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface ServiceStatus {
    name: string;
    status: 'operational' | 'degraded' | 'outage' | 'maintenance';
    latency?: number;
    lastChecked: string;
}

interface Incident {
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    date: string;
    updates: string[];
}

const MOCK_SERVICES: ServiceStatus[] = [
    { name: 'API Services', status: 'operational', latency: 45, lastChecked: 'Just now' },
    { name: 'Body Scan Engine', status: 'operational', latency: 120, lastChecked: '1 min ago' },
    { name: 'Image Processing', status: 'operational', latency: 85, lastChecked: '2 min ago' },
    { name: 'Authentication', status: 'operational', latency: 32, lastChecked: 'Just now' },
    { name: 'Payment Gateway', status: 'operational', latency: 156, lastChecked: '3 min ago' },
    { name: 'Database', status: 'operational', latency: 12, lastChecked: 'Just now' },
];

const MOCK_INCIDENTS: Incident[] = [
    {
        id: '1',
        title: 'Scheduled Maintenance',
        status: 'resolved',
        date: 'Feb 5, 2024',
        updates: ['Maintenance completed successfully.'],
    },
];

export const StatusPageScreen: React.FC = () => {
    const [services, setServices] = useState<ServiceStatus[]>(MOCK_SERVICES);
    const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    const getStatusColor = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'operational': return Colors.success;
            case 'degraded': return Colors.warning;
            case 'outage': return Colors.error;
            case 'maintenance': return '#9CA3AF';
            default: return Colors.textMuted;
        }
    };

    const getStatusText = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'operational': return 'Operational';
            case 'degraded': return 'Degraded';
            case 'outage': return 'Outage';
            case 'maintenance': return 'Maintenance';
            default: return 'Unknown';
        }
    };

    const getIncidentStatusColor = (status: Incident['status']) => {
        switch (status) {
            case 'investigating': return Colors.error;
            case 'identified': return Colors.warning;
            case 'monitoring': return Colors.info || Colors.primary;
            case 'resolved': return Colors.success;
            default: return Colors.textMuted;
        }
    };

    const getOverallStatus = () => {
        if (services.some(s => s.status === 'outage')) {
            return { text: 'Major Outage', color: Colors.error, icon: '🔴' };
        }
        if (services.some(s => s.status === 'degraded')) {
            return { text: 'Partial Outage', color: Colors.warning, icon: '🟡' };
        }
        if (services.some(s => s.status === 'maintenance')) {
            return { text: 'Under Maintenance', color: '#9CA3AF', icon: '🔵' };
        }
        return { text: 'All Systems Operational', color: Colors.success, icon: '🟢' };
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLastUpdated(new Date().toLocaleTimeString());
        setIsRefreshing(false);
    };

    const overallStatus = getOverallStatus();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
                {/* Overall Status Header */}
                <View style={[styles.statusHeader, { backgroundColor: overallStatus.color + '15' }]}>
                    <Text style={styles.statusIcon}>{overallStatus.icon}</Text>
                    <Text style={[styles.statusTitle, { color: overallStatus.color }]}>
                        {overallStatus.text}
                    </Text>
                    <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
                </View>

                {/* Uptime Stats */}
                <View style={styles.uptimeRow}>
                    <View style={styles.uptimeStat}>
                        <Text style={styles.uptimeValue}>99.9%</Text>
                        <Text style={styles.uptimeLabel}>30-day uptime</Text>
                    </View>
                    <View style={styles.uptimeDivider} />
                    <View style={styles.uptimeStat}>
                        <Text style={styles.uptimeValue}>45ms</Text>
                        <Text style={styles.uptimeLabel}>Avg. response</Text>
                    </View>
                    <View style={styles.uptimeDivider} />
                    <View style={styles.uptimeStat}>
                        <Text style={styles.uptimeValue}>0</Text>
                        <Text style={styles.uptimeLabel}>Active incidents</Text>
                    </View>
                </View>

                {/* Services List */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>System Status</Text>

                    {services.map((service, index) => (
                        <View key={index} style={styles.serviceItem}>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                {service.latency && (
                                    <Text style={styles.serviceLatency}>{service.latency}ms</Text>
                                )}
                            </View>
                            <View style={styles.serviceStatus}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(service.status) }]} />
                                <Text style={[styles.statusLabel, { color: getStatusColor(service.status) }]}>
                                    {getStatusText(service.status)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Card>

                {/* 90-Day Uptime Graph (Simplified) */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>90-Day Uptime</Text>
                    <View style={styles.uptimeGraph}>
                        {Array.from({ length: 30 }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.uptimeBar,
                                    { backgroundColor: i === 15 ? Colors.warning : Colors.success },
                                ]}
                            />
                        ))}
                    </View>
                    <View style={styles.uptimeLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                            <Text style={styles.legendText}>Operational</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                            <Text style={styles.legendText}>Partial Outage</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                            <Text style={styles.legendText}>Major Outage</Text>
                        </View>
                    </View>
                </Card>

                {/* Past Incidents */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Past Incidents</Text>

                    {incidents.length === 0 ? (
                        <Text style={styles.noIncidents}>No incidents in the past 90 days 🎉</Text>
                    ) : (
                        incidents.map((incident) => (
                            <View key={incident.id} style={styles.incidentItem}>
                                <View style={styles.incidentHeader}>
                                    <Text style={styles.incidentTitle}>{incident.title}</Text>
                                    <View style={[
                                        styles.incidentBadge,
                                        { backgroundColor: getIncidentStatusColor(incident.status) + '20' }
                                    ]}>
                                        <Text style={[
                                            styles.incidentBadgeText,
                                            { color: getIncidentStatusColor(incident.status) }
                                        ]}>
                                            {incident.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.incidentDate}>{incident.date}</Text>
                                {incident.updates.map((update, idx) => (
                                    <Text key={idx} style={styles.incidentUpdate}>• {update}</Text>
                                ))}
                            </View>
                        ))
                    )}
                </Card>

                {/* Subscribe Section */}
                <Card style={styles.subscribeSection}>
                    <Text style={styles.subscribeTitle}>🔔 Get Status Updates</Text>
                    <Text style={styles.subscribeText}>
                        Subscribe to receive notifications when system status changes.
                    </Text>
                    <TouchableOpacity style={styles.subscribeButton}>
                        <Text style={styles.subscribeButtonText}>Subscribe to Updates</Text>
                    </TouchableOpacity>
                </Card>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>AI Body Scan Status Page</Text>
                    <Text style={styles.footerText}>Powered by internal monitoring</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    statusHeader: {
        alignItems: 'center',
        padding: Spacing.xl,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    statusIcon: {
        fontSize: 48,
        marginBottom: Spacing.sm,
    },
    statusTitle: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
    },
    lastUpdated: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
    },
    uptimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: Spacing.lg,
        marginHorizontal: Spacing.lg,
        marginVertical: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
    },
    uptimeStat: {
        alignItems: 'center',
    },
    uptimeValue: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    uptimeLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    uptimeDivider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    section: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textMuted,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    serviceLatency: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    serviceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.xs,
    },
    statusLabel: {
        fontSize: FontSize.xs,
        fontWeight: '500',
    },
    uptimeGraph: {
        flexDirection: 'row',
        height: 32,
        gap: 2,
        marginBottom: Spacing.sm,
    },
    uptimeBar: {
        flex: 1,
        borderRadius: 2,
    },
    uptimeLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    legendText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    noIncidents: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: Spacing.lg,
    },
    incidentItem: {
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    incidentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    incidentTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    incidentBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    incidentBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
    },
    incidentDate: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    incidentUpdate: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    subscribeSection: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        alignItems: 'center',
    },
    subscribeTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    subscribeText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.xs,
        marginBottom: Spacing.md,
    },
    subscribeButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
    },
    subscribeButtonText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
    },
    footer: {
        alignItems: 'center',
        padding: Spacing.lg,
        paddingBottom: Spacing.xl * 2,
    },
    footerText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
});

export default StatusPageScreen;
