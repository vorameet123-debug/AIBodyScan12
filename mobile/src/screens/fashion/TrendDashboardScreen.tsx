/**
 * Trend Dashboard Screen — matches website TrendDashboard.tsx
 * Trending / For-You mode toggle, trend cards, explanations,
 * body shape insights, trending colors, AI research
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Dimensions,
    RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hapticLight, hapticSelection } from '../../utils/haptics';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import {
    TrendAPI,
    TrendItem,
    TrendExplanation,
    ColorTrend,
    BodyInsights,
    ShapeChange,
} from '../../services/api';

const screenWidth = Dimensions.get('window').width;

type Mode = 'trending' | 'foryou';

const COLOR_HEX_MAP: { [key: string]: string } = {
    black: '#000000', white: '#FFFFFF', red: '#EF4444',
    blue: '#3B82F6', green: '#10B981', yellow: '#F59E0B',
    purple: '#8B5CF6', pink: '#EC4899', brown: '#92400E',
    orange: '#F97316', navy: '#1E3A8A', teal: '#14B8A6',
    gray: '#6B7280', beige: '#D4A574', cream: '#FFFDD0',
};

export const TrendDashboardScreen: React.FC = () => {
    const [mode, setMode] = useState<Mode>('trending');
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [trendingColors, setTrendingColors] = useState<ColorTrend[]>([]);
    const [bodyInsights, setBodyInsights] = useState<BodyInsights | null>(null);
    const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<TrendExplanation | null>(null);
    const [explanationLoading, setExplanationLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(7);
    const [refreshing, setRefreshing] = useState(false);

    const loadTrendData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (mode === 'trending') {
                const response = await TrendAPI.getCombinedTrends(days);
                if (response.success) {
                    const mapped: TrendItem[] = [
                        ...(response.data?.external_trends?.trending_items || []).map((t: any) => ({
                            item: t.name || t.item,
                            description: t.data?.description || t.description || 'Global fashion trend.',
                            popularity_score: t.popularity_score || 0,
                            trend_direction: t.trend_direction || 'stable',
                            reasons: t.data?.why_trending ? [t.data.why_trending] : [],
                        })),
                    ];
                    setTrends(mapped);

                    // Also fetch trending colors
                    try {
                        const styleResponse = await TrendAPI.getStyleTrends(days);
                        if (styleResponse.success && styleResponse.style_trends) {
                            const colors = Object.entries(styleResponse.style_trends.trending_colors || {}).map(
                                ([color, score]) => ({
                                    color,
                                    match_score: typeof score === 'number' ? score : 0,
                                    hex: COLOR_HEX_MAP[color.toLowerCase()] || '#CCCCCC',
                                })
                            );
                            setTrendingColors(colors);
                        }
                    } catch { }
                }
            } else {
                const response = await TrendAPI.getTrendsForUser(1, days, 60);
                if (response.success) {
                    setTrends(response.data?.trending_items || []);
                    setTrendingColors(response.data?.trending_colors || []);
                    setBodyInsights(response.data?.body_insights || null);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load trend data');
        } finally {
            setLoading(false);
        }
    }, [mode, days]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTrendData();
        setRefreshing(false);
    }, [loadTrendData]);

    useEffect(() => {
        loadTrendData();
    }, [loadTrendData]);

    const handleAILiveResearch = async () => {
        try {
            setLoading(true);
            const response = await TrendAPI.analyzeExternalTrends();
            if (response.success) {
                await loadTrendData();
            }
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'AI Research Failed', text2: err.message || 'Could not analyze trends' });
        } finally {
            setLoading(false);
        }
    };

    const loadTrendExplanation = async (item: string) => {
        if (selectedTrend === item && explanation) {
            setSelectedTrend(null);
            setExplanation(null);
            return;
        }
        try {
            setExplanationLoading(true);
            setSelectedTrend(item);
            setExplanation(null);
            const response = await TrendAPI.explainTrend(1, item);
            if (response.success && response.explanation) {
                setExplanation(response.explanation);
            }
        } catch {
            setExplanation(null);
        } finally {
            setExplanationLoading(false);
        }
    };

    const getTrendBadge = (trend: TrendItem) => {
        if (mode === 'foryou' && trend.match_score) {
            if (trend.match_score >= 90) return { text: 'Perfect Match', color: '#10B981' };
            if (trend.match_score >= 80) return { text: 'Hot Trend', color: '#F97316' };
            return { text: 'Good Match', color: '#8B5CF6' };
        }
        if (trend.popularity_score >= 80) return { text: 'Global Viral', color: '#EF4444' };
        if (trend.trend_direction === 'rising') return { text: 'Rising Fast', color: '#3B82F6' };
        return { text: 'Fashion Alert', color: '#6366F1' };
    };

    // ---- Renders ----

    const renderTrendingCard = (trend: TrendItem, idx: number) => {
        const badge = getTrendBadge(trend);
        return (
            <View key={idx} style={styles.trendCard}>
                {/* Gradient Header */}
                <View style={styles.trendCardHeader}>
                    <View style={[styles.badge, { backgroundColor: badge.color }]}>
                        <Text style={styles.badgeText}>{badge.text}</Text>
                    </View>
                    <View style={styles.trendCardHeaderBottom}>
                        <Text style={styles.trendName} numberOfLines={1}>{trend.item}</Text>
                        <View style={styles.directionBadge}>
                            <Text style={styles.directionIcon}>
                                {trend.trend_direction === 'rising' ? '📈' : '➖'}
                            </Text>
                            <Text style={styles.directionText}>
                                {trend.trend_direction === 'rising' ? 'Hot' : 'Stable'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.trendCardBody}>
                    <View style={styles.trendStats}>
                        <View>
                            <Text style={styles.trendStatLabel}>VIRAL SCORE</Text>
                            <View style={styles.trendScoreRow}>
                                <Text style={styles.trendScoreValue}>{trend.popularity_score}</Text>
                                <Text style={styles.trendScoreMax}>/ 100</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.trendStatLabel}>GROWTH</Text>
                            <Text style={styles.growthValue}>
                                ⚡ +{Math.floor(Math.random() * 20) + 10}%
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.trendDescription} numberOfLines={2}>
                        {trend.description}
                    </Text>
                    <TouchableOpacity
                        style={styles.exploreBtn}
                        onPress={() => loadTrendExplanation(trend.item)}
                    >
                        <Text style={styles.exploreBtnText}>Explore Trend →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderForYouItem = (trend: TrendItem, idx: number) => {
        const badge = getTrendBadge(trend);
        const isExpanded = selectedTrend === trend.item;
        return (
            <View
                key={idx}
                style={[styles.forYouCard, isExpanded && styles.forYouCardExpanded]}
            >
                <View style={styles.forYouRow}>
                    {/* Match Score Circle */}
                    <View style={styles.matchCircle}>
                        <Text style={styles.matchScore}>{trend.match_score || 0}%</Text>
                        <Text style={styles.matchLabel}>MATCH</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.forYouInfo}>
                        <View style={styles.forYouTitleRow}>
                            <View style={[styles.badge, { backgroundColor: badge.color }]}>
                                <Text style={styles.badgeText}>{badge.text}</Text>
                            </View>
                            <Text style={styles.forYouName}>{trend.item}</Text>
                        </View>
                        <Text style={styles.forYouAdvice}>
                            Tailored advice for your body type.
                        </Text>
                        {trend.reasons && (
                            <View style={styles.reasonsRow}>
                                {trend.reasons.map((r, i) => (
                                    <Text key={i} style={styles.reasonTag}>✓ {r}</Text>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Action */}
                    <TouchableOpacity
                        style={[styles.adviceBtn, isExpanded && styles.adviceBtnActive]}
                        onPress={() => loadTrendExplanation(trend.item)}
                    >
                        <Text style={styles.adviceBtnText}>
                            {isExpanded ? 'Close' : 'Advice'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Expanded Explanation */}
                {isExpanded && explanation && (
                    <View style={styles.explanationBox}>
                        <View style={styles.explanationSection}>
                            <Text style={styles.explanationHeading}>ℹ️ WHY IT WORKS FOR YOU</Text>
                            {explanation.why_for_you?.body_type && (
                                <View style={styles.explanationItem}>
                                    <Text style={styles.explanationLabel}>BODY ARCHITECTURE</Text>
                                    <Text style={styles.explanationValue}>
                                        {explanation.why_for_you.body_type}
                                    </Text>
                                </View>
                            )}
                            {explanation.why_for_you?.colors && (
                                <View style={styles.explanationItem}>
                                    <Text style={styles.explanationLabel}>COLOR PALETTE</Text>
                                    <Text style={styles.explanationValue}>
                                        {explanation.why_for_you.colors}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.explanationSection}>
                            <Text style={styles.explanationHeading}>✨ PRO STYLING SECRET</Text>
                            <View style={styles.stylingTipBox}>
                                <Text style={styles.stylingTipText}>
                                    {explanation.how_to_style?.[0] ||
                                        'Pair this with structured neutrals for an elevated look.'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                {isExpanded && explanationLoading && (
                    <ActivityIndicator color={Colors.primary} style={{ marginTop: 12, marginBottom: 8 }} />
                )}
            </View>
        );
    };

    // ---- Main Render ----

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading trends...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadTrendData}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.headerIcon, mode === 'trending' ? styles.headerIconTrending : styles.headerIconForYou]}>
                            <Text style={{ fontSize: 18 }}>{mode === 'trending' ? '🌐' : '🎯'}</Text>
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>
                                {mode === 'trending' ? 'Global Discovery' : 'Personal Advisor'}
                            </Text>
                            <Text style={styles.headerSubtitle} numberOfLines={2}>
                                {mode === 'trending'
                                    ? 'Real-time viral fashion insights from global runways.'
                                    : 'Hyper-tailored trend matches for your style DNA.'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Mode Toggle + Period */}
                <View style={styles.controlsRow}>
                    <View style={styles.modeToggle}>
                        <TouchableOpacity
                            style={[styles.modeBtn, mode === 'trending' && styles.modeBtnActive]}
                            onPress={() => setMode('trending')}
                        >
                            <Text style={[styles.modeBtnText, mode === 'trending' && styles.modeBtnTextActive]}>
                                🔥 Trending
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modeBtn, mode === 'foryou' && styles.modeBtnActive]}
                            onPress={() => setMode('foryou')}
                        >
                            <Text style={[styles.modeBtnText, mode === 'foryou' && styles.modeBtnTextActive]}>
                                🎯 For You
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.periodRow}>
                        {[7, 30, 90].map((d) => (
                            <TouchableOpacity
                                key={d}
                                style={[styles.periodBtn, days === d && styles.periodBtnActive]}
                                onPress={() => setDays(d)}
                            >
                                <Text style={[styles.periodBtnText, days === d && styles.periodBtnTextActive]}>
                                    {d === 7 ? '1W' : d === 30 ? '1M' : '3M'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* AI Research Button (Trending mode) */}
                {mode === 'trending' && (
                    <TouchableOpacity style={styles.aiResearchBtn} onPress={handleAILiveResearch}>
                        <Text style={styles.aiResearchText}>⚡ Sync Live Trends</Text>
                    </TouchableOpacity>
                )}

                {/* Body Shape Insights (For-You mode) */}
                {mode === 'foryou' && bodyInsights && bodyInsights.shape_changes?.length > 0 && (
                    <View style={styles.bodyInsightCard}>
                        <View style={styles.bodyInsightHeader}>
                            <Text style={styles.bodyInsightIcon}>✨</Text>
                            <View>
                                <Text style={styles.bodyInsightTitle}>Your Body Shape Changed!</Text>
                                <Text style={styles.bodyInsightSubtitle}>New styling recommendations for you</Text>
                            </View>
                        </View>
                        {bodyInsights.shape_changes.map((change: ShapeChange, idx: number) => (
                            <View key={idx} style={styles.shapeChangeRow}>
                                <Text style={styles.shapeChangeMeasure}>{change.measurement}</Text>
                                <Text
                                    style={[
                                        styles.shapeChangeValue,
                                        { color: change.trend === 'up' ? '#10B981' : '#F43F5E' },
                                    ]}
                                >
                                    {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.change)}cm
                                </Text>
                                <Text style={styles.shapeChangeSig}>{change.significance}</Text>
                            </View>
                        ))}
                        {bodyInsights.latest_shape && (
                            <View style={styles.shapeHint}>
                                <Text style={styles.shapeHintText}>
                                    💡 Check trending styles for your {bodyInsights.latest_shape} shape below!
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Trend Items */}
                {trends.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>✨</Text>
                        <Text style={styles.emptyTitle}>
                            {mode === 'foryou'
                                ? 'Your style profile is growing!'
                                : 'No live product trends found'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {mode === 'foryou'
                                ? 'Complete more fit checks to get hyper-personalized recommendations.'
                                : 'Tap "Sync Live Trends" to scan social media and runway data.'}
                        </Text>
                        {mode === 'trending' && (
                            <TouchableOpacity style={styles.emptyActionBtn} onPress={handleAILiveResearch}>
                                <Text style={styles.emptyActionText}>⚡ Unlock Global Trends with AI</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.trendsList}>
                        {mode === 'trending'
                            ? trends.map((t, i) => renderTrendingCard(t, i))
                            : trends.map((t, i) => renderForYouItem(t, i))
                        }
                    </View>
                )}

                {/* Trend Explanation Modal (Trending mode) */}
                {mode === 'trending' && selectedTrend && explanation && (
                    <Modal transparent animationType="fade" visible>
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => { setSelectedTrend(null); setExplanation(null); }}
                        >
                            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text style={styles.modalTitle}>{selectedTrend}</Text>
                                        <Text style={styles.modalSubtitle}>GLOBAL VIRAL BREAKDOWN</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => { setSelectedTrend(null); setExplanation(null); }}>
                                        <Text style={styles.modalClose}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={{ maxHeight: 400 }}>
                                    {/* Why Trending */}
                                    <Text style={styles.modalSectionTitle}>🔥 VIRAL ROOTS</Text>
                                    {explanation.why_trending?.social_media && (
                                        <View style={[styles.modalInfoBox, { borderLeftColor: '#F97316' }]}>
                                            <Text style={styles.modalInfoLabel}>SOCIAL PULSE</Text>
                                            <Text style={styles.modalInfoText}>{explanation.why_trending.social_media}</Text>
                                        </View>
                                    )}
                                    {explanation.why_trending?.runway && (
                                        <View style={[styles.modalInfoBox, { borderLeftColor: '#8B5CF6' }]}>
                                            <Text style={styles.modalInfoLabel}>RUNWAY VERDICT</Text>
                                            <Text style={styles.modalInfoText}>{explanation.why_trending.runway}</Text>
                                        </View>
                                    )}

                                    {/* Styling */}
                                    <Text style={styles.modalSectionTitle}>✨ AESTHETIC GUIDE</Text>
                                    <View style={styles.stylingTipsRow}>
                                        {(explanation.how_to_style || []).map((tip, i) => (
                                            <Text key={i} style={styles.stylingTipTag}>★ {tip}</Text>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )}

                {/* Trending Colors */}
                {trendingColors.length > 0 && (
                    <View style={styles.colorsCard}>
                        <View style={styles.colorsHeader}>
                            <Text style={styles.colorsTitle}>
                                🎨 {mode === 'trending' ? 'Seasonal Color Pulse' : 'Personal Color IQ'}
                            </Text>
                            <Text style={styles.colorsUpdated}>Updated Today</Text>
                        </View>
                        <View style={styles.colorsGrid}>
                            {trendingColors.map((c, idx) => (
                                <View key={idx} style={styles.colorItem}>
                                    <View
                                        style={[
                                            styles.colorSwatch,
                                            { backgroundColor: c.hex || '#CCC' },
                                            (c.hex === '#FFFFFF' || c.hex === '#000000') && styles.colorSwatchBorder,
                                        ]}
                                    />
                                    <Text style={styles.colorLabel}>{c.color}</Text>
                                    <Text style={[styles.colorScore, { color: mode === 'trending' ? '#EC4899' : '#8B5CF6' }]}>
                                        {c.match_score || c.popularity || 0}% {mode === 'trending' ? 'Vol' : 'IQ'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: FontSize.sm, color: '#94A3B8' },
    errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: '#F87171', fontSize: FontSize.md, fontWeight: '500', marginBottom: 16 },
    retryBtn: { backgroundColor: '#1E293B', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
    retryBtnText: { color: '#fff', fontWeight: '600' },

    // Header
    header: { padding: Spacing.lg, paddingBottom: 8 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerIconTrending: { backgroundColor: '#1E293B' },
    headerIconForYou: { backgroundColor: '#6366F1' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 12, color: '#94A3B8', maxWidth: screenWidth - 100 },

    // Controls
    controlsRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginHorizontal: Spacing.lg, marginBottom: 12,
    },
    modeToggle: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 14, padding: 3 },
    modeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 11 },
    modeBtnActive: { backgroundColor: '#6366F1' },
    modeBtnText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
    modeBtnTextActive: { color: '#fff' },
    periodRow: { flexDirection: 'row', gap: 4 },
    periodBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#0F172A' },
    periodBtnActive: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#6366F140' },
    periodBtnText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    periodBtnTextActive: { color: '#fff' },

    // AI Research
    aiResearchBtn: {
        marginHorizontal: Spacing.lg, marginBottom: 16,
        backgroundColor: '#6366F1', borderRadius: 14,
        paddingVertical: 12, alignItems: 'center',
    },
    aiResearchText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    // Body Insights
    bodyInsightCard: {
        marginHorizontal: Spacing.lg, marginBottom: 16,
        backgroundColor: '#6366F110', borderWidth: 1, borderColor: '#6366F130',
        borderRadius: 20, padding: 18,
    },
    bodyInsightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    bodyInsightIcon: { fontSize: 24 },
    bodyInsightTitle: { fontSize: FontSize.md, fontWeight: 'bold', color: '#fff' },
    bodyInsightSubtitle: { fontSize: 12, color: '#94A3B8' },
    shapeChangeRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#1E293B80', borderRadius: 14, padding: 14, marginBottom: 8,
    },
    shapeChangeMeasure: { fontSize: 14, color: '#CBD5E1', fontWeight: '500', textTransform: 'capitalize', flex: 1 },
    shapeChangeValue: { fontSize: 13, fontWeight: '600' },
    shapeChangeSig: { fontSize: 11, color: '#64748B', marginLeft: 8 },
    shapeHint: {
        marginTop: 8, padding: 10, backgroundColor: '#6366F115',
        borderRadius: 12, borderWidth: 1, borderColor: '#6366F120',
    },
    shapeHintText: { fontSize: 13, color: '#A5B4FC' },

    // Trend Cards (Trending mode)
    trendsList: { paddingHorizontal: Spacing.lg, gap: 14 },
    trendCard: {
        backgroundColor: '#0F172A', borderRadius: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: '#1E293B',
    },
    trendCardHeader: {
        height: 100, backgroundColor: '#1E293B', padding: 16,
        justifyContent: 'space-between',
    },
    trendCardHeaderBottom: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    },
    trendName: { fontSize: 18, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize', flex: 1 },
    directionBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#ffffff15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    directionIcon: { fontSize: 12 },
    directionText: { fontSize: 11, color: '#fff', fontWeight: '500' },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
    badgeText: { fontSize: 9, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
    trendCardBody: { padding: 18 },
    trendStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    trendStatLabel: { fontSize: 9, color: '#64748B', fontWeight: '600', letterSpacing: 1, marginBottom: 2 },
    trendScoreRow: { flexDirection: 'row', alignItems: 'baseline' },
    trendScoreValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    trendScoreMax: { fontSize: 12, color: '#64748B', marginLeft: 2 },
    growthValue: { fontSize: 13, fontWeight: 'bold', color: '#10B981' },
    trendDescription: { fontSize: 13, color: '#94A3B8', lineHeight: 19, marginBottom: 16 },
    exploreBtn: {
        backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 12, alignItems: 'center',
    },
    exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // For-You
    forYouCard: {
        backgroundColor: '#0F172A', borderRadius: 20, borderWidth: 1,
        borderColor: '#1E293B', overflow: 'hidden',
    },
    forYouCardExpanded: { borderColor: '#6366F150' },
    forYouRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    matchCircle: {
        width: 64, height: 64, borderRadius: 16,
        backgroundColor: '#6366F115', borderWidth: 1, borderColor: '#6366F130',
        justifyContent: 'center', alignItems: 'center',
    },
    matchScore: { fontSize: 18, fontWeight: 'bold', color: '#A5B4FC' },
    matchLabel: { fontSize: 7, fontWeight: '700', color: '#818CF8', letterSpacing: 1, marginTop: 1 },
    forYouInfo: { flex: 1 },
    forYouTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
    forYouName: { fontSize: 16, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize' },
    forYouAdvice: { fontSize: 12, color: '#94A3B8', marginBottom: 6 },
    reasonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    reasonTag: {
        fontSize: 10, color: '#CBD5E1', backgroundColor: '#334155', paddingHorizontal: 8,
        paddingVertical: 3, borderRadius: 6, overflow: 'hidden',
    },
    adviceBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
        backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#6366F150',
    },
    adviceBtnActive: { backgroundColor: '#334155', borderColor: '#475569' },
    adviceBtnText: { fontSize: 12, fontWeight: '600', color: '#A5B4FC' },

    // Explanation box
    explanationBox: {
        borderTopWidth: 1, borderTopColor: '#1E293B',
        backgroundColor: '#0F172A80', padding: 18,
    },
    explanationSection: { marginBottom: 16 },
    explanationHeading: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1, marginBottom: 10 },
    explanationItem: {
        backgroundColor: '#1E293B80', padding: 14, borderRadius: 14,
        borderWidth: 1, borderColor: '#334155', marginBottom: 8,
    },
    explanationLabel: { fontSize: 9, fontWeight: '700', color: '#64748B', marginBottom: 4, letterSpacing: 1 },
    explanationValue: { fontSize: 13, color: '#CBD5E1', lineHeight: 19 },
    stylingTipBox: {
        backgroundColor: '#F59E0B10', padding: 16, borderRadius: 14,
        borderLeftWidth: 3, borderLeftColor: '#FBBF24',
    },
    stylingTipText: { fontSize: 13, color: '#FCD34D', fontStyle: 'italic', lineHeight: 20 },

    // Empty State
    emptyState: {
        marginHorizontal: Spacing.lg, padding: 40,
        borderWidth: 2, borderStyle: 'dashed', borderColor: '#334155',
        borderRadius: 20, alignItems: 'center',
    },
    emptyIcon: { fontSize: 36, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
    emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
    emptyActionBtn: {
        backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
    },
    emptyActionText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(2,6,23,0.85)',
        justifyContent: 'center', alignItems: 'center', padding: 20,
    },
    modalContent: {
        backgroundColor: '#0F172A', borderRadius: 24, borderWidth: 1,
        borderColor: '#1E293B', width: '100%', maxWidth: 500, padding: 24,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize' },
    modalSubtitle: { fontSize: 10, fontWeight: '700', color: '#8B5CF6', letterSpacing: 1, marginTop: 2 },
    modalClose: { fontSize: 18, color: '#94A3B8', padding: 4 },
    modalSectionTitle: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1, marginBottom: 10, marginTop: 8 },
    modalInfoBox: {
        backgroundColor: '#1E293B', padding: 16, borderRadius: 14,
        borderLeftWidth: 3, marginBottom: 10,
    },
    modalInfoLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', marginBottom: 4 },
    modalInfoText: { fontSize: 13, color: '#CBD5E1', lineHeight: 19 },
    stylingTipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    stylingTipTag: {
        paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#334155',
        color: '#CBD5E1', borderRadius: 14, fontSize: 13, overflow: 'hidden',
    },

    // Trending Colors
    colorsCard: {
        marginHorizontal: Spacing.lg, marginTop: 20,
        backgroundColor: '#0F172A', borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: '#1E293B',
    },
    colorsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    colorsTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    colorsUpdated: {
        fontSize: 9, fontWeight: '600', color: '#64748B', backgroundColor: '#334155',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden',
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
    colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' },
    colorItem: { alignItems: 'center', width: (screenWidth - Spacing.lg * 4 - 56) / 4 },
    colorSwatch: { width: '100%', height: 56, borderRadius: 16, marginBottom: 8 },
    colorSwatchBorder: { borderWidth: 1, borderColor: '#334155' },
    colorLabel: { fontSize: 12, fontWeight: '600', color: '#fff', textTransform: 'capitalize' },
    colorScore: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
});

export default TrendDashboardScreen;
