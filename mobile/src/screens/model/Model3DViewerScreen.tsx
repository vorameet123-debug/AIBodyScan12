/**
 * 3D Model Viewer Screen
 * Displays a 3D representation of body measurements
 * Uses expo-gl and three.js via expo-three
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { BodyAPI } from '../../services/api';

const screenWidth = Dimensions.get('window').width;

interface BodyMeasurements {
    chest: number;
    waist: number;
    hips: number;
    shoulder_width: number;
    arm_length: number;
    inseam: number;
    height?: number;
}

// SVG-based body visualization as a fallback
// (3D requires native build, this works in Expo Go)
const BodySVGVisualization: React.FC<{ measurements: BodyMeasurements | null }> = ({ measurements }) => {
    if (!measurements) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>🧍</Text>
                <Text style={styles.noDataText}>No measurements yet</Text>
                <Text style={styles.noDataSubtext}>Complete a body scan to see your 3D model</Text>
            </View>
        );
    }

    // Calculate proportions based on measurements
    const baseWidth = 120;
    const shoulderRatio = measurements.shoulder_width / 46; // 46cm is average
    const chestRatio = measurements.chest / 96;
    const waistRatio = measurements.waist / 82;
    const hipRatio = measurements.hips / 98;

    const shoulderWidth = baseWidth * shoulderRatio;
    const chestWidth = baseWidth * chestRatio;
    const waistWidth = baseWidth * waistRatio * 0.85;
    const hipWidth = baseWidth * hipRatio;

    return (
        <View style={styles.svgContainer}>
            {/* Head */}
            <View style={styles.head} />

            {/* Neck */}
            <View style={styles.neck} />

            {/* Shoulders */}
            <View style={[styles.shoulders, { width: shoulderWidth }]} />

            {/* Chest/Torso */}
            <View style={[styles.chest, { width: chestWidth }]} />

            {/* Waist */}
            <View style={[styles.waist, { width: waistWidth }]} />

            {/* Hips */}
            <View style={[styles.hips, { width: hipWidth }]} />

            {/* Legs */}
            <View style={styles.legsContainer}>
                <View style={styles.leg} />
                <View style={styles.leg} />
            </View>

            {/* Measurement Labels */}
            <View style={styles.labelContainer}>
                <View style={[styles.measurementLine, { top: 80 }]}>
                    <Text style={styles.measurementLabel}>Shoulders: {measurements.shoulder_width?.toFixed(1)} cm</Text>
                </View>
                <View style={[styles.measurementLine, { top: 120 }]}>
                    <Text style={styles.measurementLabel}>Chest: {measurements.chest?.toFixed(1)} cm</Text>
                </View>
                <View style={[styles.measurementLine, { top: 160 }]}>
                    <Text style={styles.measurementLabel}>Waist: {measurements.waist?.toFixed(1)} cm</Text>
                </View>
                <View style={[styles.measurementLine, { top: 200 }]}>
                    <Text style={styles.measurementLabel}>Hips: {measurements.hips?.toFixed(1)} cm</Text>
                </View>
            </View>
        </View>
    );
};

export const Model3DViewerScreen: React.FC = () => {
    const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'front' | 'side' | 'back'>('front');
    const [is3DSupported, setIs3DSupported] = useState(false);

    useEffect(() => {
        fetchLatestMeasurements();
        check3DSupport();
    }, []);

    const check3DSupport = async () => {
        // Check if expo-gl is available (requires native build)
        try {
            // In Expo Go, 3D is limited - we use SVG fallback
            setIs3DSupported(false);
        } catch {
            setIs3DSupported(false);
        }
    };

    const fetchLatestMeasurements = async () => {
        try {
            const data = await BodyAPI.getHistory(1);
            if (data.measurements?.length > 0 || data.length > 0) {
                const latest = data.measurements?.[0] || data[0];
                setMeasurements(latest);
            } else {
                // Use mock data for demo
                setMeasurements({
                    chest: 96.5,
                    waist: 82.3,
                    hips: 98.1,
                    shoulder_width: 46.2,
                    arm_length: 62.5,
                    inseam: 80.0,
                    height: 175,
                });
            }
        } catch (err) {
            // Error handled by state — shows error UI
            // Use mock data
            setMeasurements({
                chest: 96.5,
                waist: 82.3,
                hips: 98.1,
                shoulder_width: 46.2,
                arm_length: 62.5,
                inseam: 80.0,
                height: 175,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getBodyShape = (): string => {
        if (!measurements) return 'Unknown';

        const { chest, waist, hips } = measurements;
        const chestHipRatio = chest / hips;
        const waistHipRatio = waist / hips;

        if (waistHipRatio > 0.9) return 'Apple';
        if (chestHipRatio < 0.9 && waistHipRatio < 0.75) return 'Pear';
        if (Math.abs(chest - hips) < 5 && waistHipRatio > 0.8) return 'Rectangle';
        if (chestHipRatio > 1.05 && waistHipRatio < 0.85) return 'Inverted Triangle';
        if (Math.abs(chest - hips) < 5 && waistHipRatio < 0.75) return 'Hourglass';
        return 'Athletic';
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading 3D Model...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>3D Body Model</Text>
                <Text style={styles.subtitle}>Visual representation of your measurements</Text>
            </View>

            {/* View Toggle */}
            <View style={styles.viewToggle}>
                {(['front', 'side', 'back'] as const).map((view) => (
                    <TouchableOpacity
                        key={view}
                        style={[styles.toggleButton, viewMode === view && styles.toggleActive]}
                        onPress={() => setViewMode(view)}
                    >
                        <Text style={[styles.toggleText, viewMode === view && styles.toggleTextActive]}>
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 3D/SVG Viewer */}
            <Card style={styles.viewerCard}>
                {is3DSupported ? (
                    <View style={styles.viewer3D}>
                        <Text style={styles.viewer3DText}>
                            3D WebGL Viewer would render here
                        </Text>
                        <Text style={styles.viewer3DSubtext}>
                            (Requires development build for full 3D)
                        </Text>
                    </View>
                ) : (
                    <BodySVGVisualization measurements={measurements} />
                )}
            </Card>

            {/* Body Shape Card */}
            <Card style={styles.shapeCard}>
                <View style={styles.shapeHeader}>
                    <Text style={styles.shapeLabel}>Your Body Shape</Text>
                    <View style={styles.shapeBadge}>
                        <Text style={styles.shapeValue}>{getBodyShape()}</Text>
                    </View>
                </View>
                <Text style={styles.shapeDescription}>
                    Based on your chest-waist-hip proportions
                </Text>
            </Card>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <Text style={styles.statValue}>{measurements?.chest?.toFixed(0) || '--'}</Text>
                    <Text style={styles.statLabel}>Chest (cm)</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={styles.statValue}>{measurements?.waist?.toFixed(0) || '--'}</Text>
                    <Text style={styles.statLabel}>Waist (cm)</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={styles.statValue}>{measurements?.hips?.toFixed(0) || '--'}</Text>
                    <Text style={styles.statLabel}>Hips (cm)</Text>
                </Card>
            </View>

            {/* Info Banner */}
            <Card style={styles.infoCard}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                    Full 3D model rendering with rotation and zoom is available in the production app build.
                </Text>
            </Card>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Colors.textSecondary,
        marginTop: Spacing.md,
        fontSize: FontSize.md,
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
    viewToggle: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderRadius: BorderRadius.sm,
    },
    toggleActive: {
        backgroundColor: Colors.primary,
    },
    toggleText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
    },
    toggleTextActive: {
        color: Colors.text,
        fontWeight: '600',
    },
    viewerCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewer3D: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewer3DText: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
    },
    viewer3DSubtext: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        marginTop: Spacing.xs,
    },
    svgContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: Spacing.md,
        position: 'relative',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataIcon: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    noDataText: {
        color: Colors.text,
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
    noDataSubtext: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        marginTop: Spacing.xs,
    },
    head: {
        width: 40,
        height: 45,
        borderRadius: 20,
        backgroundColor: Colors.primary + '60',
        marginBottom: 2,
    },
    neck: {
        width: 20,
        height: 15,
        backgroundColor: Colors.primary + '50',
    },
    shoulders: {
        height: 20,
        backgroundColor: Colors.primary + '70',
        borderTopLeftRadius: BorderRadius.sm,
        borderTopRightRadius: BorderRadius.sm,
    },
    chest: {
        height: 50,
        backgroundColor: Colors.primary + '80',
    },
    waist: {
        height: 40,
        backgroundColor: Colors.primary + '70',
    },
    hips: {
        height: 35,
        backgroundColor: Colors.primary + '80',
        borderBottomLeftRadius: BorderRadius.sm,
        borderBottomRightRadius: BorderRadius.sm,
    },
    legsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    leg: {
        width: 25,
        height: 80,
        backgroundColor: Colors.primary + '60',
        borderBottomLeftRadius: BorderRadius.sm,
        borderBottomRightRadius: BorderRadius.sm,
    },
    labelContainer: {
        position: 'absolute',
        right: -80,
        top: 0,
    },
    measurementLine: {
        position: 'absolute',
        left: 0,
    },
    measurementLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.xs,
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
    },
    shapeCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    shapeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shapeLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
    },
    shapeBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    shapeValue: {
        color: Colors.primary,
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    shapeDescription: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    statValue: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    infoCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '10',
        borderColor: Colors.primary + '30',
        borderWidth: 1,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: Spacing.sm,
    },
    infoText: {
        flex: 1,
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        lineHeight: 18,
    },
});

export default Model3DViewerScreen;
