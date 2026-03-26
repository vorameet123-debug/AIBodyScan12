/**
 * Material Analysis Display Component
 * Shows fabric/material analysis for clothing items
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Card } from '../ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface MaterialData {
    primary: string;
    composition: { material: string; percentage: number }[];
    care: string[];
    quality: 'premium' | 'good' | 'average' | 'budget';
    durability: number; // 1-10
    breathability: number; // 1-10
    stretch: number; // 1-10
}

interface Props {
    data: MaterialData;
    compact?: boolean;
}

export const MaterialAnalysisDisplay: React.FC<Props> = ({ data, compact = false }) => {
    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'premium': return '#10B981';
            case 'good': return '#3B82F6';
            case 'average': return '#F59E0B';
            case 'budget': return '#6B7280';
            default: return Colors.textSecondary;
        }
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <Text style={styles.compactIcon}>🧵</Text>
                <Text style={styles.compactText}>{data.primary}</Text>
            </View>
        );
    }

    return (
        <Card style={styles.container}>
            <Text style={styles.title}>🧵 Material Analysis</Text>

            {/* Primary Material */}
            <View style={styles.primarySection}>
                <Text style={styles.primaryLabel}>Primary Material</Text>
                <Text style={styles.primaryName}>{data.primary}</Text>
            </View>

            {/* Composition */}
            <Text style={styles.sectionTitle}>Composition</Text>
            <View style={styles.compositionContainer}>
                {data.composition.map((item, index) => (
                    <View key={index} style={styles.compositionRow}>
                        <Text style={styles.compositionMaterial}>{item.material}</Text>
                        <View style={styles.compositionBar}>
                            <View
                                style={[styles.compositionFill, { width: `${item.percentage}%` }]}
                            />
                        </View>
                        <Text style={styles.compositionPercent}>{item.percentage}%</Text>
                    </View>
                ))}
            </View>

            {/* Quality Badge */}
            <View style={styles.qualityRow}>
                <Text style={styles.qualityLabel}>Quality Rating</Text>
                <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(data.quality) + '20' }]}>
                    <Text style={[styles.qualityText, { color: getQualityColor(data.quality) }]}>
                        {data.quality.charAt(0).toUpperCase() + data.quality.slice(1)}
                    </Text>
                </View>
            </View>

            {/* Properties */}
            <View style={styles.propertiesGrid}>
                <View style={styles.propertyItem}>
                    <Text style={styles.propertyLabel}>Durability</Text>
                    <View style={styles.propertyBar}>
                        <View style={[styles.propertyFill, { width: `${data.durability * 10}%` }]} />
                    </View>
                    <Text style={styles.propertyValue}>{data.durability}/10</Text>
                </View>
                <View style={styles.propertyItem}>
                    <Text style={styles.propertyLabel}>Breathability</Text>
                    <View style={styles.propertyBar}>
                        <View style={[styles.propertyFill, { width: `${data.breathability * 10}%` }]} />
                    </View>
                    <Text style={styles.propertyValue}>{data.breathability}/10</Text>
                </View>
                <View style={styles.propertyItem}>
                    <Text style={styles.propertyLabel}>Stretch</Text>
                    <View style={styles.propertyBar}>
                        <View style={[styles.propertyFill, { width: `${data.stretch * 10}%` }]} />
                    </View>
                    <Text style={styles.propertyValue}>{data.stretch}/10</Text>
                </View>
            </View>

            {/* Care Instructions */}
            {data.care.length > 0 && (
                <View style={styles.careSection}>
                    <Text style={styles.sectionTitle}>Care Instructions</Text>
                    <View style={styles.careRow}>
                        {data.care.map((instruction, index) => (
                            <View key={index} style={styles.carePill}>
                                <Text style={styles.careText}>{instruction}</Text>
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
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
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
    compositionContainer: {
        marginBottom: Spacing.md,
    },
    compositionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    compositionMaterial: {
        width: 80,
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    compositionBar: {
        flex: 1,
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        marginHorizontal: Spacing.sm,
        overflow: 'hidden',
    },
    compositionFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    compositionPercent: {
        width: 40,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'right',
    },
    qualityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    qualityLabel: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    qualityBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    qualityText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    propertiesGrid: {
        marginBottom: Spacing.md,
    },
    propertyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    propertyLabel: {
        width: 100,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    propertyBar: {
        flex: 1,
        height: 6,
        backgroundColor: Colors.border,
        borderRadius: 3,
        marginHorizontal: Spacing.sm,
        overflow: 'hidden',
    },
    propertyFill: {
        height: '100%',
        backgroundColor: Colors.success,
        borderRadius: 3,
    },
    propertyValue: {
        width: 40,
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        textAlign: 'right',
    },
    careSection: {
        marginTop: Spacing.sm,
    },
    careRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    carePill: {
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.xs,
    },
    careText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
});

export default MaterialAnalysisDisplay;
