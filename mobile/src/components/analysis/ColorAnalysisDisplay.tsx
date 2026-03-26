/**
 * Color Analysis Display Component
 * Shows color analysis results for wardrobe items
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Card } from '../ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface ColorData {
    dominant: string;
    dominantHex: string;
    palette: { name: string; hex: string; percentage: number }[];
    seasonalType?: string;
    harmony?: string;
    complementary?: string;
}

interface Props {
    data: ColorData;
    compact?: boolean;
}

export const ColorAnalysisDisplay: React.FC<Props> = ({ data, compact = false }) => {
    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={[styles.colorDot, { backgroundColor: data.dominantHex }]} />
                <Text style={styles.compactText}>{data.dominant}</Text>
            </View>
        );
    }

    return (
        <Card style={styles.container}>
            <Text style={styles.title}>🎨 Color Analysis</Text>

            {/* Dominant Color */}
            <View style={styles.dominantSection}>
                <View style={[styles.dominantSwatch, { backgroundColor: data.dominantHex }]} />
                <View style={styles.dominantInfo}>
                    <Text style={styles.dominantLabel}>Dominant Color</Text>
                    <Text style={styles.dominantName}>{data.dominant}</Text>
                    <Text style={styles.dominantHex}>{data.dominantHex}</Text>
                </View>
            </View>

            {/* Color Palette */}
            <Text style={styles.sectionTitle}>Color Palette</Text>
            <View style={styles.paletteRow}>
                {data.palette.map((color, index) => (
                    <View key={index} style={styles.paletteItem}>
                        <View style={[styles.paletteSwatch, { backgroundColor: color.hex }]} />
                        <Text style={styles.paletteName}>{color.name}</Text>
                        <Text style={styles.palettePercent}>{color.percentage}%</Text>
                    </View>
                ))}
            </View>

            {/* Additional Info */}
            {(data.seasonalType || data.harmony) && (
                <View style={styles.infoRow}>
                    {data.seasonalType && (
                        <View style={styles.infoPill}>
                            <Text style={styles.infoPillLabel}>Season</Text>
                            <Text style={styles.infoPillValue}>{data.seasonalType}</Text>
                        </View>
                    )}
                    {data.harmony && (
                        <View style={styles.infoPill}>
                            <Text style={styles.infoPillLabel}>Harmony</Text>
                            <Text style={styles.infoPillValue}>{data.harmony}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Complementary */}
            {data.complementary && (
                <View style={styles.complementarySection}>
                    <Text style={styles.complementaryLabel}>Pairs well with:</Text>
                    <Text style={styles.complementaryValue}>{data.complementary}</Text>
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
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
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
    dominantSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        padding: Spacing.sm,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
    },
    dominantSwatch: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.md,
        marginRight: Spacing.md,
    },
    dominantInfo: {
        flex: 1,
    },
    dominantLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    dominantName: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    dominantHex: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontFamily: 'monospace',
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    paletteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    paletteItem: {
        alignItems: 'center',
    },
    paletteSwatch: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    paletteName: {
        fontSize: FontSize.xs,
        color: Colors.text,
        fontWeight: '500',
    },
    palettePercent: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    infoRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    infoPill: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
    },
    infoPillLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    infoPillValue: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.primary,
    },
    complementarySection: {
        backgroundColor: Colors.primary + '10',
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    complementaryLabel: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    complementaryValue: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        color: Colors.text,
    },
});

export default ColorAnalysisDisplay;
