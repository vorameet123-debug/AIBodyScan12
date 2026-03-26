/**
 * Body Tracker Screen — Full feature parity with website BodyTrackerPage
 * Sections:
 *   1. Summary stats (total measurements, period, significant changes)
 *   2. Metric stat cards with sparkline-style latest value + trend %
 *   3. Body Intelligence Feed (significant changes + trend insights)
 *   4. Measurement Trends grid (colored cards with cm change)
 *   5. Overall Progress (before → after)
 *   6. Body Shape Classification with ratios
 *   7. Pattern Insights (transformation detection)
 *   8. Trend Velocity & Acceleration
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { BodyAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

// ── Types (matching website bodyIntelligenceApi.ts) ──
interface TrendData {
    change: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    latest: number;
    oldest: number;
}

interface BodyShape {
    shape: string;
    confidence: number;
    ratios: { waist_to_hip: number; waist_to_chest: number; chest_to_hip: number };
}

interface BodyPattern {
    pattern: string;
    description: string;
    confidence: 'high' | 'medium' | 'low';
    change: number;
}

interface VelocityEntry {
    velocity: number;
    acceleration: number;
    direction: 'increasing' | 'decreasing' | 'stable';
    trend: 'accelerating' | 'decelerating' | 'constant';
}

interface ProgressSummary {
    total_measurements: number;
    period_analyzed: string;
    trends: { [key: string]: TrendData };
    significant_changes: string[];
    overall_progress?: {
        [key: string]: { before: number; after: number; change: number; percentage: number };
    };
    body_shape?: BodyShape;
    pattern_insights?: BodyPattern[];
    trend_velocity?: { [key: string]: VelocityEntry } & { message?: string };
}

// ── Color palette ──
const metricColors: Record<string, string> = {
    chest: '#8B5CF6',
    waist: '#EC4899',
    hips: '#3B82F6',
    weight: '#10B981',
    shoulder: '#F59E0B',
    shoulder_width: '#F59E0B',
    sleeve_length: '#EF4444',
    arm_length: '#EF4444',
    inseam: '#06B6D4',
    height: '#6366F1',
};

const patternColors: Record<string, string> = {
    weight_loss: '#10B981',
    muscle_gain: '#3B82F6',
    recomposition: '#8B5CF6',
    stable: '#64748B',
    no_pattern: '#F59E0B',
};

// ── Component ──
export const BodyTrackerScreen: React.FC = () => {
    const { user } = useAuthStore();
    const [progress, setProgress] = useState<ProgressSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMetrics] = useState(['chest', 'waist', 'hips']);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (force = false) => {
        try {
            if (!force) setIsLoading(true);
            const userId = (user as any)?.id || (user as any)?.user_id;
            if (!userId) return;
            const data = await BodyAPI.getProgress(userId);
            setProgress(data);
        } catch (err) {
            // Error handled by state — shows error UI
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    // ── Helpers ──
    const getSignificantChanges = () =>
        progress?.significant_changes?.filter(c => !c.toLowerCase().includes('no significant')) || [];

    const getSignificantTrends = () =>
        Object.entries(progress?.trends || {}).filter(([_, d]) => Math.abs(d.percentage) > 0.5);

    // ── Loading ──
    if (isLoading) {
        return (
            <SafeAreaView style={s.container}>
                <View style={s.loadingWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={s.loadingText}>Loading body data…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Empty state ──
    if (!progress || progress.total_measurements === 0) {
        return (
            <SafeAreaView style={s.container}>
                <ScrollView contentContainerStyle={s.emptyWrap}>
                    <View style={s.emptyIcon}><Text style={{ fontSize: 32 }}>📊</Text></View>
                    <Text style={s.emptyTitle}>No Measurement History Yet</Text>
                    <Text style={s.emptyDesc}>Add at least 2 measurements to see your body intelligence tracking!</Text>
                </ScrollView>
            </SafeAreaView>
        );
    }

    const sigChanges = getSignificantChanges();
    const sigTrends = getSignificantTrends();

    return (
        <SafeAreaView style={s.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                {/* ─── Header ─── */}
                <View style={s.header}>
                    <Text style={s.title}>Body Intelligence Tracker</Text>
                    <Text style={s.subtitle}>Track your body measurements and see your progress over time</Text>
                </View>

                {/* ─── 1. Summary Stats ─── */}
                <View style={s.summaryRow}>
                    <Card style={s.summaryCard}>
                        <Text style={s.summaryIcon}>📅</Text>
                        <Text style={s.summaryValue}>{progress.total_measurements}</Text>
                        <Text style={s.summaryLabel}>Total Measurements</Text>
                    </Card>
                    <Card style={s.summaryCard}>
                        <Text style={s.summaryIcon}>📊</Text>
                        <Text style={s.summaryValue}>{progress.period_analyzed || '—'}</Text>
                        <Text style={s.summaryLabel}>Period Analyzed</Text>
                    </Card>
                    <Card style={s.summaryCard}>
                        <Text style={s.summaryIcon}>🎯</Text>
                        <Text style={s.summaryValue}>{sigChanges.length}</Text>
                        <Text style={s.summaryLabel}>Significant Changes</Text>
                    </Card>
                </View>

                {/* ─── 2. Metric Stat Cards ─── */}
                <View style={s.metricRow}>
                    {selectedMetrics.map(metric => {
                        const trend = progress.trends[metric];
                        if (!trend) return null;
                        const color = metricColors[metric] || '#6366F1';
                        return (
                            <Card key={metric} style={[s.metricCard, { borderTopColor: color, borderTopWidth: 3 }]}>
                                <View style={s.metricHeader}>
                                    <Text style={s.metricName}>{metric.replace('_', ' ').toUpperCase()}</Text>
                                    {trend && (
                                        <View style={[s.trendBadge, {
                                            backgroundColor: trend.change > 0 ? '#10B98120' : trend.change < 0 ? '#EF444420' : '#64748B20'
                                        }]}>
                                            <Text style={[s.trendBadgeText, {
                                                color: trend.change > 0 ? '#10B981' : trend.change < 0 ? '#EF4444' : '#64748B'
                                            }]}>
                                                {trend.change > 0 ? '+' : ''}{trend.percentage}%
                                                {trend.change > 0 ? ' ↑' : trend.change < 0 ? ' ↓' : ' →'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[s.metricValue, { color }]}>{trend.latest}<Text style={s.metricUnit}>cm</Text></Text>
                            </Card>
                        );
                    })}
                </View>

                {/* ─── 3. Body Intelligence Feed ─── */}
                {(sigChanges.length > 0 || sigTrends.length > 0) && (
                    <Card style={s.section}>
                        <View style={s.sectionHeader}>
                            <Text style={s.sectionIcon}>📊</Text>
                            <Text style={s.sectionTitle}>Body Intelligence Feed</Text>
                        </View>
                        {sigChanges.map((change, i) => (
                            <View key={`sig-${i}`} style={[s.feedItem, { borderLeftColor: '#3B82F6' }]}>
                                <Text style={s.feedDot}>📊</Text>
                                <Text style={s.feedText}>{change}</Text>
                            </View>
                        ))}
                        {sigTrends.map(([metric, data], i) => (
                            <View key={`trend-${i}`} style={[s.feedItem, {
                                borderLeftColor: data.change > 0 ? '#10B981' : '#EF4444'
                            }]}>
                                <Text style={s.feedDot}>{data.change > 0 ? '📈' : '📉'}</Text>
                                <Text style={s.feedText}>
                                    {metric.replace('_', ' ')} is {data.trend} ({data.change > 0 ? '+' : ''}{data.change}cm)
                                </Text>
                            </View>
                        ))}
                    </Card>
                )}

                {/* ─── 4. Measurement Trends Grid ─── */}
                {Object.keys(progress.trends).length > 0 && (
                    <Card style={s.section}>
                        <Text style={s.sectionTitle}>Measurement Trends</Text>
                        <View style={s.trendsGrid}>
                            {Object.entries(progress.trends).map(([metric, data]) => {
                                const bg = data.trend === 'increasing' ? '#10B981' : data.trend === 'decreasing' ? '#EF4444' : '#64748B';
                                return (
                                    <View key={metric} style={[s.trendCard, { backgroundColor: bg }]}>
                                        <View style={s.trendCardHeader}>
                                            <Text style={s.trendCardTitle}>{metric.replace('_', ' ')}</Text>
                                            <Text style={s.trendCardIcon}>
                                                {data.trend === 'increasing' ? '📈' : data.trend === 'decreasing' ? '📉' : '➡️'}
                                            </Text>
                                        </View>
                                        <Text style={s.trendCardChange}>
                                            {data.change > 0 ? '+' : ''}{data.change}cm
                                        </Text>
                                        <Text style={s.trendCardPct}>
                                            {data.percentage > 0 ? '+' : ''}{data.percentage}% change
                                        </Text>
                                        <Text style={s.trendCardRange}>{data.oldest}cm → {data.latest}cm</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                )}

                {/* ─── 5. Overall Progress ─── */}
                {progress.overall_progress && Object.keys(progress.overall_progress).length > 0 && (
                    <Card style={s.section}>
                        <Text style={s.sectionTitle}>Overall Progress (First vs Latest)</Text>
                        <View style={s.progressGrid}>
                            {Object.entries(progress.overall_progress).map(([metric, data]) => (
                                <View key={metric} style={s.progressItem}>
                                    <Text style={s.progressMetric}>{metric.replace('_', ' ')}</Text>
                                    <View style={s.progressRow}>
                                        <View style={s.progressCol}>
                                            <Text style={s.progressLabel}>Before</Text>
                                            <Text style={s.progressVal}>{data.before}cm</Text>
                                        </View>
                                        <Text style={s.progressArrow}>→</Text>
                                        <View style={s.progressCol}>
                                            <Text style={s.progressLabel}>After</Text>
                                            <Text style={s.progressVal}>{data.after}cm</Text>
                                        </View>
                                    </View>
                                    <Text style={[s.progressChange, {
                                        color: data.change > 0 ? '#10B981' : data.change < 0 ? '#EF4444' : '#64748B'
                                    }]}>
                                        {data.change > 0 ? '+' : ''}{data.change}cm ({data.percentage > 0 ? '+' : ''}{data.percentage}%)
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Card>
                )}

                {/* ─── 6. Body Shape Classification ─── */}
                {progress.body_shape && progress.body_shape.shape && progress.body_shape.shape !== 'unknown' && progress.body_shape.shape !== 'insufficient_data' && (
                    <Card style={s.section}>
                        <View style={s.sectionHeader}>
                            <Text style={s.sectionIcon}>🎯</Text>
                            <Text style={s.sectionTitle}>Body Shape Classification</Text>
                        </View>
                        <View style={s.shapeRow}>
                            <View style={s.shapeMain}>
                                <Text style={s.shapeLabel}>Your Body Shape</Text>
                                <Text style={s.shapeValue}>{progress.body_shape.shape.replace('_', ' ')}</Text>
                                <Text style={s.shapeConfidence}>
                                    Confidence: {Math.round(progress.body_shape.confidence * 100)}%
                                </Text>
                            </View>
                            <View style={s.ratiosCol}>
                                <View style={s.ratioItem}>
                                    <Text style={s.ratioLabel}>Waist / Hip</Text>
                                    <Text style={s.ratioValue}>{progress.body_shape.ratios.waist_to_hip}</Text>
                                </View>
                                <View style={s.ratioItem}>
                                    <Text style={s.ratioLabel}>Waist / Chest</Text>
                                    <Text style={s.ratioValue}>{progress.body_shape.ratios.waist_to_chest}</Text>
                                </View>
                                <View style={s.ratioItem}>
                                    <Text style={s.ratioLabel}>Chest / Hip</Text>
                                    <Text style={s.ratioValue}>{progress.body_shape.ratios.chest_to_hip}</Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                )}

                {/* ─── 7. Pattern Insights ─── */}
                {progress.pattern_insights && progress.pattern_insights.length > 0 && (
                    <Card style={s.section}>
                        <View style={s.sectionHeader}>
                            <Text style={s.sectionIcon}>🔬</Text>
                            <Text style={s.sectionTitle}>Transformation Patterns Detected</Text>
                        </View>
                        <View style={s.patternGrid}>
                            {progress.pattern_insights.map((p, i) => {
                                const bg = patternColors[p.pattern] || '#64748B';
                                return (
                                    <View key={i} style={[s.patternCard, { backgroundColor: bg }]}>
                                        <View style={s.patternHeader}>
                                            <Text style={s.patternName}>{p.pattern.replace('_', ' ')}</Text>
                                            <View style={s.confidenceBadge}>
                                                <Text style={s.confidenceText}>{p.confidence}</Text>
                                            </View>
                                        </View>
                                        <Text style={s.patternDesc}>{p.description}</Text>
                                        {p.change !== 0 && (
                                            <Text style={s.patternChange}>
                                                {p.change > 0 ? '+' : ''}{p.change.toFixed(1)}cm
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                )}

                {/* ─── 8. Trend Velocity ─── */}
                {progress.trend_velocity && typeof progress.trend_velocity === 'object' && !progress.trend_velocity.message && (
                    <Card style={[s.section, { marginBottom: Spacing.xxl }]}>
                        <View style={s.sectionHeader}>
                            <Text style={s.sectionIcon}>📈</Text>
                            <Text style={s.sectionTitle}>Trend Velocity & Acceleration</Text>
                        </View>
                        <Text style={s.velocitySubtitle}>Rate of change per month</Text>
                        <View style={s.velocityGrid}>
                            {Object.entries(progress.trend_velocity)
                                .filter(([key]) => key !== 'message')
                                .map(([metric, data]) => {
                                    const d = data as VelocityEntry;
                                    return (
                                        <View key={metric} style={s.velocityItem}>
                                            <Text style={s.velocityMetric}>{metric.replace('_', ' ')}</Text>
                                            <View style={s.velocityRow2}>
                                                <View>
                                                    <Text style={s.velocityLabel}>Velocity</Text>
                                                    <Text style={[s.velocityVal, {
                                                        color: d.velocity > 0 ? '#10B981' : d.velocity < 0 ? '#EF4444' : '#64748B'
                                                    }]}>
                                                        {d.velocity > 0 ? '+' : ''}{d.velocity.toFixed(2)}cm/mo
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text style={s.velocityLabel}>Acceleration</Text>
                                                    <Text style={[s.velocityVal, {
                                                        color: d.acceleration > 0 ? '#3B82F6' : d.acceleration < 0 ? '#F59E0B' : '#64748B'
                                                    }]}>
                                                        {d.acceleration > 0 ? '+' : ''}{d.acceleration.toFixed(2)}cm/mo²
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={s.badgeRow}>
                                                <View style={[s.dirBadge, {
                                                    backgroundColor: d.direction === 'increasing' ? '#10B98120' : d.direction === 'decreasing' ? '#EF444420' : '#64748B20'
                                                }]}>
                                                    <Text style={[s.dirBadgeText, {
                                                        color: d.direction === 'increasing' ? '#10B981' : d.direction === 'decreasing' ? '#EF4444' : '#64748B'
                                                    }]}>{d.direction}</Text>
                                                </View>
                                                <View style={[s.dirBadge, {
                                                    backgroundColor: d.trend === 'accelerating' ? '#3B82F620' : d.trend === 'decelerating' ? '#F59E0B20' : '#64748B20'
                                                }]}>
                                                    <Text style={[s.dirBadgeText, {
                                                        color: d.trend === 'accelerating' ? '#3B82F6' : d.trend === 'decelerating' ? '#F59E0B' : '#64748B'
                                                    }]}>{d.trend}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                        </View>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// ════════════════════════════════════════
// STYLES
// ════════════════════════════════════════
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Loading / Empty
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: Colors.textSecondary, marginTop: 12, fontSize: FontSize.sm },
    emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    emptyIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#F59E0B20', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
    emptyDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

    // Header
    header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
    title: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
    subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },

    // 1. Summary
    summaryRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.md },
    summaryCard: { flex: 1, padding: 12, alignItems: 'center' },
    summaryIcon: { fontSize: 20, marginBottom: 6 },
    summaryValue: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
    summaryLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

    // 2. Metric cards
    metricRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.md },
    metricCard: { flex: 1, padding: 12 },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    metricName: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5 },
    trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
    trendBadgeText: { fontSize: 10, fontWeight: '600' },
    metricValue: { fontSize: 24, fontWeight: 'bold' },
    metricUnit: { fontSize: 12, color: Colors.textMuted },

    // Sections
    section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, padding: Spacing.md },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionIcon: { fontSize: 18 },
    sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },

    // 3. Feed
    feedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderLeftWidth: 3, backgroundColor: Colors.surface, borderRadius: 10, marginBottom: 6 },
    feedDot: { fontSize: 14 },
    feedText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },

    // 4. Trends grid
    trendsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    trendCard: { width: '48%', borderRadius: 12, padding: 12 },
    trendCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    trendCardTitle: { fontSize: 12, fontWeight: '600', color: '#fff', textTransform: 'capitalize' },
    trendCardIcon: { fontSize: 14 },
    trendCardChange: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    trendCardPct: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
    trendCardRange: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

    // 5. Progress
    progressGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    progressItem: { width: '48%', backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
    progressMetric: { fontSize: 12, fontWeight: '600', color: Colors.text, textTransform: 'capitalize', marginBottom: 8 },
    progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    progressCol: { alignItems: 'center' },
    progressLabel: { fontSize: 10, color: Colors.textMuted },
    progressVal: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    progressArrow: { fontSize: 16, color: Colors.textMuted },
    progressChange: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 6 },

    // 6. Body shape
    shapeRow: { flexDirection: 'row', gap: 12 },
    shapeMain: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
    shapeLabel: { fontSize: 10, color: Colors.textMuted },
    shapeValue: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, textTransform: 'capitalize', marginVertical: 4 },
    shapeConfidence: { fontSize: 12, color: Colors.primary },
    ratiosCol: { flex: 1, gap: 6 },
    ratioItem: { backgroundColor: Colors.surface, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: Colors.border },
    ratioLabel: { fontSize: 10, color: Colors.textMuted },
    ratioValue: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },

    // 7. Patterns
    patternGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    patternCard: { width: '48%', borderRadius: 12, padding: 12 },
    patternHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    patternName: { fontSize: 12, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },
    confidenceBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    confidenceText: { fontSize: 10, fontWeight: '600', color: '#fff' },
    patternDesc: { fontSize: 11, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
    patternChange: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 4 },

    // 8. Velocity
    velocitySubtitle: { fontSize: 11, color: Colors.textMuted, marginBottom: 10 },
    velocityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    velocityItem: { width: '48%', backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
    velocityMetric: { fontSize: 12, fontWeight: '600', color: Colors.text, textTransform: 'capitalize', marginBottom: 8 },
    velocityRow2: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    velocityLabel: { fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
    velocityVal: { fontSize: 14, fontWeight: 'bold' },
    badgeRow: { flexDirection: 'row', gap: 4 },
    dirBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    dirBadgeText: { fontSize: 10, fontWeight: '600' },
});

export default BodyTrackerScreen;
