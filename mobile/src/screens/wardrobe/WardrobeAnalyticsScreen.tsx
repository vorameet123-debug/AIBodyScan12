/**
 * Wardrobe Analytics Screen — matches website WardrobeAnalytics.tsx
 * Filter toggle, conversion stats, composition chart, color distribution,
 * fit score timeline, wardrobe gaps, wishlist
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import {
    WardrobeAPI,
    WardrobeAnalyticsData,
} from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const screenWidth = Dimensions.get('window').width;
const CHART_COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#FB7185', '#FDA4AF'];

const COLOR_HEX_MAP: { [key: string]: string } = {
    black: '#000000', white: '#F9FAFB', gray: '#6B7280', grey: '#6B7280',
    blue: '#3B82F6', 'light blue': '#60A5FA', 'dark blue': '#1E40AF', navy: '#1E3A8A',
    red: '#EF4444', 'dark red': '#B91C1C', maroon: '#7F1D1D', burgundy: '#881337',
    green: '#10B981', 'light green': '#4ADE80', 'dark green': '#065F46', olive: '#84CC16',
    yellow: '#F59E0B', gold: '#D97706', orange: '#F97316',
    purple: '#8B5CF6', violet: '#7C3AED', lavender: '#C4B5FD',
    pink: '#EC4899', 'hot pink': '#DB2777', magenta: '#D946EF',
    brown: '#92400E', tan: '#D2B48C', beige: '#D4A574', khaki: '#C3B091', cream: '#FFFDD0',
    teal: '#14B8A6', turquoise: '#2DD4BF', cyan: '#22D3EE', indigo: '#4F46E5',
    charcoal: '#36454F', silver: '#C0C0C0', unknown: '#9CA3AF',
};

type FilterType = 'all' | 'purchased' | 'wishlist';

export const WardrobeAnalyticsScreen: React.FC = () => {
    const [data, setData] = useState<WardrobeAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const { user } = useAuthStore();

    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const response = await WardrobeAPI.getAnalytics(user?.id || 1, filter);
            if (response.success !== false && response.data) {
                setData(response.data);
            } else if (response.composition) {
                // API might return data directly without wrapper
                setData(response as any as WardrobeAnalyticsData);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading analytics...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!data || data.composition?.total_items === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>No Wardrobe Data Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Complete some fit checks to see your wardrobe analytics!
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Prepare chart data
    const compositionData = Object.entries(data.composition.by_type || {}).map(
        ([name, value], index) => ({
            name: name.replace(/_/g, ' '),
            population: value as number,
            color: CHART_COLORS[index % CHART_COLORS.length],
            legendFontColor: Colors.textSecondary,
            legendFontSize: 11,
        })
    );

    const colorEntries = Object.entries(data.colors?.distribution || {});
    const maxColorCount = Math.max(...colorEntries.map(([, v]) => v as number), 1);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Wardrobe Analytics</Text>
                    <Text style={styles.subtitle}>Insights about your wardrobe</Text>
                </View>

                {/* Filter Toggle */}
                <View style={styles.filterRow}>
                    {(['all', 'purchased', 'wishlist'] as FilterType[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            style={[
                                styles.filterBtn,
                                filter === f && (f === 'all'
                                    ? styles.filterBtnActiveAll
                                    : f === 'purchased'
                                        ? styles.filterBtnActivePurchased
                                        : styles.filterBtnActiveWishlist),
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterBtnText,
                                    filter === f && styles.filterBtnTextActive,
                                ]}
                            >
                                {f === 'all' ? 'All Items' : f === 'purchased' ? 'Purchased' : 'Wishlist'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Conversion Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
                        <Text style={styles.statIcon}>🛒</Text>
                        <Text style={styles.statValue}>{data.conversion?.total_checks ?? 0}</Text>
                        <Text style={styles.statLabel}>Total Checks</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                        <Text style={styles.statIcon}>📦</Text>
                        <Text style={styles.statValue}>{data.conversion?.purchased ?? 0}</Text>
                        <Text style={styles.statLabel}>Purchased</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#EC4899' }]}>
                        <Text style={styles.statIcon}>❤️</Text>
                        <Text style={styles.statValue}>{data.conversion?.wishlist ?? 0}</Text>
                        <Text style={styles.statLabel}>Wishlist</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
                        <Text style={styles.statIcon}>📈</Text>
                        <Text style={styles.statValue}>{data.conversion?.conversion_rate ?? 0}%</Text>
                        <Text style={styles.statLabel}>Conversion</Text>
                    </View>
                </View>

                {/* Composition Pie Chart */}
                {compositionData.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderIcon}>📦</Text>
                            <Text style={styles.cardTitle}>Wardrobe Composition</Text>
                        </View>
                        <PieChart
                            data={compositionData}
                            width={screenWidth - Spacing.lg * 4}
                            height={200}
                            chartConfig={{ color: () => Colors.primary }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="0"
                            absolute
                        />
                    </View>
                )}

                {/* Color Distribution (custom bar chart) */}
                {colorEntries.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderIcon}>🎨</Text>
                            <Text style={styles.cardTitle}>Color Distribution</Text>
                        </View>
                        {colorEntries.map(([colorName, count], idx) => {
                            const hex = COLOR_HEX_MAP[colorName.toLowerCase()] || '#9CA3AF';
                            const pct = ((count as number) / maxColorCount) * 100;
                            return (
                                <View key={idx} style={styles.colorRow}>
                                    <View style={styles.colorLabel}>
                                        <View style={[styles.colorSwatch, { backgroundColor: hex }]} />
                                        <Text style={styles.colorName}>{colorName}</Text>
                                    </View>
                                    <View style={styles.colorBarBg}>
                                        <View
                                            style={[
                                                styles.colorBarFill,
                                                { width: `${pct}%`, backgroundColor: hex === '#F9FAFB' ? '#94A3B8' : hex },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.colorCount}>{count as number}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Fit Score Timeline */}
                {data.fit_history && data.fit_history.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderIcon}>📊</Text>
                            <Text style={styles.cardTitle}>Fit Score Timeline (Last 30 Days)</Text>
                        </View>
                        {data.fit_history.slice(-10).map((entry, idx) => (
                            <View key={idx} style={styles.timelineRow}>
                                <View style={styles.timelineDot}>
                                    <View
                                        style={[
                                            styles.timelineDotInner,
                                            { backgroundColor: entry.score >= 70 ? '#10B981' : entry.score >= 40 ? '#F59E0B' : '#EF4444' },
                                        ]}
                                    />
                                </View>
                                <View style={styles.timelineInfo}>
                                    <Text style={styles.timelineGarment}>{entry.garment}</Text>
                                    <Text style={styles.timelineDate}>{entry.date}</Text>
                                </View>
                                <View style={styles.timelineScoreBadge}>
                                    <Text style={styles.timelineScore}>{entry.score}</Text>
                                </View>
                                {entry.purchased && (
                                    <Text style={styles.purchasedBadge}>✓ Bought</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Wardrobe Gaps */}
                {data.gaps && data.gaps.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderIcon}>⚠️</Text>
                            <Text style={styles.cardTitle}>Wardrobe Gaps</Text>
                        </View>
                        {data.gaps.map((gap, idx) => (
                            <View key={idx} style={styles.gapItem}>
                                <Text style={styles.gapName}>{gap.item.replace(/_/g, ' ')}</Text>
                                <Text style={styles.gapReason}>{gap.reason}</Text>
                                <Text style={styles.gapCategory}>{gap.category}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Wishlist */}
                {data.wishlist && data.wishlist.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderIcon}>❤️</Text>
                            <Text style={styles.cardTitle}>Your Wishlist ({data.wishlist.length} items)</Text>
                        </View>
                        {data.wishlist.slice(0, 6).map((item) => (
                            <View key={item.id} style={styles.wishlistItem}>
                                <View style={styles.wishlistTop}>
                                    <Text style={styles.wishlistGarment}>{item.garment}</Text>
                                    <Text style={styles.wishlistScore}>{item.score}</Text>
                                </View>
                                <Text style={styles.wishlistDetail}>Size: {item.size}  •  Color: {item.color}</Text>
                                <Text style={styles.wishlistDate}>{item.days_ago} days ago</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    emptyContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40,
        margin: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: '#334155',
        borderRadius: 20, backgroundColor: '#0F172A',
    },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

    header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
    title: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text },
    subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },

    // Filter
    filterRow: {
        flexDirection: 'row', marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md, gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
        backgroundColor: '#1E293B',
    },
    filterBtnActiveAll: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#6366F1' },
    filterBtnActivePurchased: { backgroundColor: '#059669' },
    filterBtnActiveWishlist: { backgroundColor: '#D97706' },
    filterBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: '#94A3B8' },
    filterBtnTextActive: { color: '#fff', fontWeight: '600' },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        marginHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md,
    },
    statCard: {
        flex: 1, minWidth: '45%', backgroundColor: '#0F172A',
        borderRadius: 16, padding: 16, borderLeftWidth: 3,
    },
    statIcon: { fontSize: 20, marginBottom: 8 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    statLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },

    // Card
    card: {
        marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
        backgroundColor: '#0F172A', borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: '#1E293B',
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
    cardHeaderIcon: { fontSize: 18 },
    cardTitle: { fontSize: FontSize.md, fontWeight: 'bold', color: '#fff' },

    // Color Distribution
    colorRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8,
    },
    colorLabel: { flexDirection: 'row', alignItems: 'center', width: 90, gap: 6 },
    colorSwatch: { width: 14, height: 14, borderRadius: 4 },
    colorName: { fontSize: 12, color: '#94A3B8', textTransform: 'capitalize' },
    colorBarBg: {
        flex: 1, height: 10, backgroundColor: '#1E293B', borderRadius: 5, overflow: 'hidden',
    },
    colorBarFill: { height: '100%', borderRadius: 5 },
    colorCount: { fontSize: 12, color: '#64748B', width: 28, textAlign: 'right' },

    // Timeline
    timelineRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#1E293B', gap: 10,
    },
    timelineDot: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E293B',
        justifyContent: 'center', alignItems: 'center',
    },
    timelineDotInner: { width: 12, height: 12, borderRadius: 6 },
    timelineInfo: { flex: 1 },
    timelineGarment: { fontSize: FontSize.sm, color: '#fff', fontWeight: '500' },
    timelineDate: { fontSize: 11, color: '#64748B' },
    timelineScoreBadge: {
        backgroundColor: '#6366F120', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    },
    timelineScore: { fontSize: 14, fontWeight: 'bold', color: '#6366F1' },
    purchasedBadge: { fontSize: 10, color: '#10B981', fontWeight: '600' },

    // Gaps
    gapItem: {
        backgroundColor: '#F59E0B10', borderWidth: 1, borderColor: '#F59E0B30',
        borderRadius: 14, padding: 14, marginBottom: 8,
    },
    gapName: { fontSize: FontSize.sm, fontWeight: '600', color: '#fff', textTransform: 'capitalize' },
    gapReason: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    gapCategory: { fontSize: 11, color: '#D97706', marginTop: 4, fontWeight: '500' },

    // Wishlist
    wishlistItem: {
        backgroundColor: '#1E293B', borderRadius: 14, padding: 14, marginBottom: 8,
    },
    wishlistTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    wishlistGarment: { fontSize: FontSize.sm, fontWeight: '600', color: '#fff' },
    wishlistScore: { fontSize: 20, fontWeight: 'bold', color: '#8B5CF6' },
    wishlistDetail: { fontSize: 12, color: '#94A3B8' },
    wishlistDate: { fontSize: 11, color: '#64748B', marginTop: 4 },
});

export default WardrobeAnalyticsScreen;
