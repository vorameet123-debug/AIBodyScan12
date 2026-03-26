/**
 * Occasion Analysis Display Component
 * Shows suitable occasions for clothing items
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Card } from '../ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface OccasionData {
    primary: string;
    suitable: { occasion: string; score: number }[];
    timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
    weather: string[];
    events: string[];
}

interface Props {
    data: OccasionData;
    compact?: boolean;
}

const occasionEmojis: Record<string, string> = {
    work: '💼',
    casual: '☕',
    formal: '🎩',
    party: '🎉',
    date: '💕',
    wedding: '💒',
    sport: '🏃',
    travel: '✈️',
    beach: '🏖️',
    dinner: '🍽️',
    business: '🤝',
    weekend: '🛋️',
    outdoor: '🌲',
    shopping: '🛍️',
};

const timeEmojis: Record<string, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙',
};

export const OccasionAnalysisDisplay: React.FC<Props> = ({ data, compact = false }) => {
    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <Text style={styles.compactIcon}>
                    {occasionEmojis[data.primary.toLowerCase()] || '📅'}
                </Text>
                <Text style={styles.compactText}>{data.primary}</Text>
            </View>
        );
    }

    return (
        <Card style={styles.container}>
            <Text style={styles.title}>📅 Occasion Analysis</Text>

            {/* Primary Occasion */}
            <View style={styles.primarySection}>
                <Text style={styles.primaryEmoji}>
                    {occasionEmojis[data.primary.toLowerCase()] || '📅'}
                </Text>
                <View>
                    <Text style={styles.primaryLabel}>Best For</Text>
                    <Text style={styles.primaryName}>{data.primary}</Text>
                </View>
            </View>

            {/* Suitable Occasions */}
            <Text style={styles.sectionTitle}>Occasion Suitability</Text>
            <View style={styles.occasionsGrid}>
                {data.suitable.map((item, index) => (
                    <View key={index} style={styles.occasionItem}>
                        <View style={styles.occasionHeader}>
                            <Text style={styles.occasionEmoji}>
                                {occasionEmojis[item.occasion.toLowerCase()] || '📅'}
                            </Text>
                            <Text style={styles.occasionName}>{item.occasion}</Text>
                        </View>
                        <View style={styles.occasionBar}>
                            <View
                                style={[
                                    styles.occasionFill,
                                    { width: `${item.score * 10}%` },
                                    item.score >= 8 && styles.occasionFillHigh,
                                    item.score >= 5 && item.score < 8 && styles.occasionFillMedium,
                                    item.score < 5 && styles.occasionFillLow,
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>

            {/* Time of Day */}
            {data.timeOfDay.length > 0 && (
                <View style={styles.timeSection}>
                    <Text style={styles.sectionTitle}>Best Time</Text>
                    <View style={styles.timeRow}>
                        {data.timeOfDay.map((time, index) => (
                            <View key={index} style={styles.timePill}>
                                <Text style={styles.timeEmoji}>{timeEmojis[time]}</Text>
                                <Text style={styles.timeText}>
                                    {time.charAt(0).toUpperCase() + time.slice(1)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Weather */}
            {data.weather.length > 0 && (
                <View style={styles.weatherSection}>
                    <Text style={styles.sectionTitle}>Weather</Text>
                    <View style={styles.tagRow}>
                        {data.weather.map((w, index) => (
                            <View key={index} style={styles.weatherTag}>
                                <Text style={styles.tagText}>{w}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Events */}
            {data.events.length > 0 && (
                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>Perfect For</Text>
                    <View style={styles.tagRow}>
                        {data.events.map((event, index) => (
                            <View key={index} style={styles.eventTag}>
                                <Text style={styles.eventEmoji}>
                                    {occasionEmojis[event.toLowerCase()] || '🎯'}
                                </Text>
                                <Text style={styles.eventText}>{event}</Text>
                            </View>
                        ))}
                    </View>
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
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
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
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    occasionsGrid: {
        marginBottom: Spacing.md,
    },
    occasionItem: {
        marginBottom: Spacing.sm,
    },
    occasionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    occasionEmoji: {
        fontSize: 16,
    },
    occasionName: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    occasionBar: {
        height: 6,
        backgroundColor: Colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    occasionFill: {
        height: '100%',
        borderRadius: 3,
    },
    occasionFillHigh: {
        backgroundColor: Colors.success,
    },
    occasionFillMedium: {
        backgroundColor: Colors.warning,
    },
    occasionFillLow: {
        backgroundColor: Colors.textMuted,
    },
    timeSection: {
        marginBottom: Spacing.md,
    },
    timeRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    timePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    timeEmoji: {
        fontSize: 16,
    },
    timeText: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '500',
    },
    weatherSection: {
        marginBottom: Spacing.md,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    weatherTag: {
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    tagText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    eventsSection: {
        marginBottom: Spacing.sm,
    },
    eventTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.success + '15',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    eventEmoji: {
        fontSize: 12,
    },
    eventText: {
        fontSize: FontSize.xs,
        color: Colors.success,
        fontWeight: '500',
    },
});

export default OccasionAnalysisDisplay;
