/**
 * Fashion IQ Screen
 * Dashboard showing fashion intelligence score and improvements
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Loading } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { FashionAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const screenWidth = Dimensions.get('window').width;

interface FashionIQData {
    overallScore: number;
    breakdown: {
        colorHarmony: number;
        styleConsistency: number;
        wardrobeVersatility: number;
        trendAwareness: number;
        fitAccuracy: number;
    };
    rank: string;
    percentile: number;
    tips: { title: string; description: string; impact: 'high' | 'medium' | 'low' }[];
    achievements: { id: string; emoji: string; title: string; unlocked: boolean }[];
}

export const FashionIQScreen: React.FC = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState<FashionIQData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scoreAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        fetchFashionIQ();
    }, []);

    useEffect(() => {
        if (data) {
            Animated.timing(scoreAnim, {
                toValue: data.overallScore,
                duration: 1500,
                useNativeDriver: false,
            }).start();
        }
    }, [data]);

    const fetchFashionIQ = async () => {
        try {
            const result = await FashionAPI.getIQ(user?.id || 0);
            // Map API response (snake_case) to component format (camelCase)
            const mapped: FashionIQData = {
                overallScore: result?.overall_score || result?.overallScore || 0,
                breakdown: result?.score_breakdown || result?.breakdown || {
                    colorHarmony: 0,
                    styleConsistency: 0,
                    wardrobeVersatility: 0,
                    trendAwareness: 0,
                    fitAccuracy: 0,
                },
                rank: result?.level || result?.rank || 'Beginner',
                percentile: result?.percentile || 50,
                tips: result?.tips || [],
                achievements: result?.achievements || [],
            };
            setData(mapped);
        } catch (err) {
            // Don't set fake data — leave data as null so error UI shows
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#3B82F6';
        if (score >= 40) return '#F59E0B';
        return '#EF4444';
    };

    const getImpactColor = (impact: string): string => {
        switch (impact) {
            case 'high': return Colors.success;
            case 'medium': return Colors.warning;
            case 'low': return Colors.textMuted;
            default: return Colors.textSecondary;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Loading text="Calculating your Fashion IQ..." />
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>📊</Text>
                    <Text style={styles.errorTitle}>Couldn't Load Fashion IQ</Text>
                    <Text style={styles.errorText}>
                        Complete some body scans and fit checks to build your Fashion IQ score.
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => { setIsLoading(true); fetchFashionIQ(); }}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Fashion IQ</Text>
                    <Text style={styles.subtitle}>Your personal style intelligence</Text>
                </View>

                {/* Main Score */}
                <Card style={styles.scoreCard}>
                    <View style={styles.scoreCircle}>
                        <Text style={[styles.scoreValue, { color: getScoreColor(data.overallScore) }]}>
                            {data.overallScore}
                        </Text>
                        <Text style={styles.scoreLabel}>IQ Score</Text>
                    </View>
                    <View style={styles.rankBadge}>
                        <Text style={styles.rankEmoji}>👑</Text>
                        <Text style={styles.rankText}>{data.rank}</Text>
                    </View>
                    <Text style={styles.percentileText}>
                        Better than {data.percentile}% of users
                    </Text>
                </Card>

                {/* Score Breakdown */}
                <Card style={styles.breakdownCard}>
                    <Text style={styles.sectionTitle}>Score Breakdown</Text>

                    {Object.entries(data.breakdown || {}).map(([key, value]) => (
                        <View key={key} style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Text>
                            <View style={styles.breakdownBarContainer}>
                                <View style={styles.breakdownBar}>
                                    <View
                                        style={[
                                            styles.breakdownFill,
                                            { width: `${value}%`, backgroundColor: getScoreColor(value) }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.breakdownValue}>{value}</Text>
                            </View>
                        </View>
                    ))}
                </Card>

                {/* Improvement Tips */}
                <Card style={styles.tipsCard}>
                    <Text style={styles.sectionTitle}>💡 Improvement Tips</Text>

                    {data.tips.map((tip, index) => (
                        <View key={index} style={styles.tipRow}>
                            <View style={[styles.tipImpact, { backgroundColor: getImpactColor(tip.impact) }]} />
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>{tip.title}</Text>
                                <Text style={styles.tipDescription}>{tip.description}</Text>
                            </View>
                            <View style={[styles.tipBadge, { backgroundColor: getImpactColor(tip.impact) + '20' }]}>
                                <Text style={[styles.tipBadgeText, { color: getImpactColor(tip.impact) }]}>
                                    +{tip.impact === 'high' ? 5 : tip.impact === 'medium' ? 3 : 1}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Card>

                {/* Achievements */}
                <Card style={styles.achievementsCard}>
                    <Text style={styles.sectionTitle}>🏆 Achievements</Text>

                    <View style={styles.achievementsGrid}>
                        {data.achievements.map((achievement) => (
                            <View
                                key={achievement.id}
                                style={[
                                    styles.achievementItem,
                                    !achievement.unlocked && styles.achievementLocked,
                                ]}
                            >
                                <Text style={[
                                    styles.achievementEmoji,
                                    !achievement.unlocked && styles.achievementEmojiLocked,
                                ]}>
                                    {achievement.emoji}
                                </Text>
                                <Text style={[
                                    styles.achievementTitle,
                                    !achievement.unlocked && styles.achievementTitleLocked,
                                ]}>
                                    {achievement.title}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Card>

                {/* Leaderboard Teaser */}
                <Card style={styles.leaderboardCard}>
                    <View style={styles.leaderboardHeader}>
                        <Text style={styles.leaderboardTitle}>🏅 Weekly Leaderboard</Text>
                        <View style={styles.proBadge}>
                            <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                    </View>
                    <Text style={styles.leaderboardText}>
                        Compete with others and climb the ranks!
                    </Text>
                    <View style={styles.leaderboardPreview}>
                        <View style={styles.leaderboardRow}>
                            <Text style={styles.leaderboardRank}>1</Text>
                            <Text style={styles.leaderboardName}>StyleMaster99</Text>
                            <Text style={styles.leaderboardScore}>96</Text>
                        </View>
                        <View style={styles.leaderboardRow}>
                            <Text style={styles.leaderboardRank}>2</Text>
                            <Text style={styles.leaderboardName}>FashionGuru</Text>
                            <Text style={styles.leaderboardScore}>94</Text>
                        </View>
                        <View style={[styles.leaderboardRow, styles.leaderboardRowHighlight]}>
                            <Text style={styles.leaderboardRank}>#{Math.floor(100 - data.percentile)}</Text>
                            <Text style={styles.leaderboardName}>You</Text>
                            <Text style={styles.leaderboardScore}>{data.overallScore}</Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorEmoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    errorTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600' as const,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    errorText: {
        color: Colors.textSecondary,
        textAlign: 'center' as const,
        fontSize: FontSize.sm,
        marginBottom: Spacing.lg,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        color: Colors.text,
        fontWeight: '600' as const,
        fontSize: FontSize.sm,
    },
    scoreCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    scoreCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: Colors.primary,
        marginBottom: Spacing.md,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.sm,
    },
    rankEmoji: {
        fontSize: 16,
    },
    rankText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    percentileText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    breakdownCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    breakdownRow: {
        marginBottom: Spacing.sm,
    },
    breakdownLabel: {
        fontSize: FontSize.sm,
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    breakdownBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    breakdownBar: {
        flex: 1,
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    breakdownFill: {
        height: '100%',
        borderRadius: 4,
    },
    breakdownValue: {
        width: 30,
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'right',
    },
    tipsCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tipImpact: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: Spacing.sm,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
    },
    tipDescription: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    tipBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    tipBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
    },
    achievementsCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    achievementItem: {
        width: (screenWidth - Spacing.lg * 4 - Spacing.sm * 3) / 4,
        alignItems: 'center',
        padding: Spacing.sm,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
    },
    achievementLocked: {
        opacity: 0.5,
    },
    achievementEmoji: {
        fontSize: 28,
        marginBottom: Spacing.xs,
    },
    achievementEmojiLocked: {
        filter: 'grayscale(100%)',
    },
    achievementTitle: {
        fontSize: FontSize.xs,
        color: Colors.text,
        textAlign: 'center',
    },
    achievementTitleLocked: {
        color: Colors.textMuted,
    },
    leaderboardCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
        backgroundColor: Colors.primary + '10',
        borderColor: Colors.primary + '30',
        borderWidth: 1,
    },
    leaderboardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    leaderboardTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    proBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
    },
    proBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: Colors.text,
    },
    leaderboardText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    leaderboardPreview: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    leaderboardRowHighlight: {
        backgroundColor: Colors.primary + '20',
        borderRadius: BorderRadius.xs,
        marginHorizontal: -Spacing.xs,
        paddingHorizontal: Spacing.xs,
    },
    leaderboardRank: {
        width: 30,
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    leaderboardName: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    leaderboardScore: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.primary,
    },
});

export default FashionIQScreen;
