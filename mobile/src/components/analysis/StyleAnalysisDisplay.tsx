/**
 * Style Analysis Display Component
 * Shows style classification and recommendations
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Card } from '../ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface StyleData {
    primary: string;
    secondary?: string;
    formality: 'very_casual' | 'casual' | 'smart_casual' | 'business' | 'formal';
    aesthetic: string[];
    season: string[];
    versatility: number; // 1-10
    trendiness: number; // 1-10
    pairingTips: string[];
}

interface Props {
    data: StyleData;
    compact?: boolean;
}

const styleEmojis: Record<string, string> = {
    casual: '👕',
    formal: '👔',
    smart_casual: '🎽',
    business: '💼',
    sporty: '🏃',
    streetwear: '🧢',
    minimalist: '◻️',
    bohemian: '🌸',
    classic: '✨',
    trendy: '🔥',
};

export const StyleAnalysisDisplay: React.FC<Props> = ({ data, compact = false }) => {
    const getFormalityLevel = (formality: string): number => {
        const levels: Record<string, number> = {
            very_casual: 1,
            casual: 2,
            smart_casual: 3,
            business: 4,
            formal: 5,
        };
        return levels[formality] || 3;
    };

    const getFormalityLabel = (formality: string): string => {
        return formality.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <Text style={styles.compactIcon}>
                    {styleEmojis[data.primary.toLowerCase()] || '👗'}
                </Text>
                <Text style={styles.compactText}>{data.primary}</Text>
            </View>
        );
    }

    return (
        <Card style={styles.container}>
            <Text style={styles.title}>👗 Style Analysis</Text>

            {/* Primary Style */}
            <View style={styles.primarySection}>
                <View style={styles.primaryBadge}>
                    <Text style={styles.primaryEmoji}>
                        {styleEmojis[data.primary.toLowerCase()] || '👗'}
                    </Text>
                    <View>
                        <Text style={styles.primaryLabel}>Primary Style</Text>
                        <Text style={styles.primaryName}>{data.primary}</Text>
                    </View>
                </View>
                {data.secondary && (
                    <View style={styles.secondaryBadge}>
                        <Text style={styles.secondaryText}>{data.secondary}</Text>
                    </View>
                )}
            </View>

            {/* Formality Scale */}
            <View style={styles.formalitySection}>
                <Text style={styles.sectionTitle}>Formality</Text>
                <View style={styles.formalityScale}>
                    {[1, 2, 3, 4, 5].map((level) => (
                        <View
                            key={level}
                            style={[
                                styles.formalityDot,
                                level <= getFormalityLevel(data.formality) && styles.formalityDotActive,
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.formalityLabels}>
                    <Text style={styles.formalityLabelText}>Casual</Text>
                    <Text style={styles.formalityLabelText}>Formal</Text>
                </View>
                <Text style={styles.formalityValue}>{getFormalityLabel(data.formality)}</Text>
            </View>

            {/* Aesthetics */}
            {data.aesthetic.length > 0 && (
                <View style={styles.aestheticsSection}>
                    <Text style={styles.sectionTitle}>Aesthetics</Text>
                    <View style={styles.tagRow}>
                        {data.aesthetic.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Season */}
            {data.season.length > 0 && (
                <View style={styles.seasonSection}>
                    <Text style={styles.sectionTitle}>Best Seasons</Text>
                    <View style={styles.tagRow}>
                        {data.season.map((s, index) => (
                            <View key={index} style={[styles.tag, styles.seasonTag]}>
                                <Text style={[styles.tagText, styles.seasonTagText]}>{s}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Scores */}
            <View style={styles.scoresRow}>
                <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Versatility</Text>
                    <Text style={styles.scoreValue}>{data.versatility}/10</Text>
                </View>
                <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Trendiness</Text>
                    <Text style={styles.scoreValue}>{data.trendiness}/10</Text>
                </View>
            </View>

            {/* Pairing Tips */}
            {data.pairingTips.length > 0 && (
                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>💡 Pairing Tips</Text>
                    {data.pairingTips.map((tip, index) => (
                        <Text key={index} style={styles.tipText}>• {tip}</Text>
                    ))}
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    compactIcon: {
        fontSize: 14,
    },
    compactText: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    title: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    primarySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    primaryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    primaryEmoji: {
        fontSize: 36,
    },
    primaryLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    primaryName: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    secondaryBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    secondaryText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    formalitySection: {
        marginBottom: Spacing.md,
    },
    formalityScale: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    formalityDot: {
        flex: 1,
        height: 8,
        backgroundColor: Colors.border,
        marginHorizontal: 2,
        borderRadius: 4,
    },
    formalityDotActive: {
        backgroundColor: Colors.primary,
    },
    formalityLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    formalityLabelText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    formalityValue: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: Spacing.xs,
    },
    aestheticsSection: {
        marginBottom: Spacing.md,
    },
    seasonSection: {
        marginBottom: Spacing.md,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    tag: {
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    tagText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    seasonTag: {
        backgroundColor: Colors.success + '20',
    },
    seasonTagText: {
        color: Colors.success,
    },
    scoresRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    scoreItem: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    scoreValue: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    tipsSection: {
        backgroundColor: Colors.primary + '10',
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    tipText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});

export default StyleAnalysisDisplay;
