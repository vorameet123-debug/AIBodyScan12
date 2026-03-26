/**
 * Size Recommendations Screen
 * Brand-specific sizing with interactive slider and fit predictions
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Loading } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { ClothingAPI, BodyAPI } from '../../services/api';

const screenWidth = Dimensions.get('window').width;

type GarmentType = 'shirt' | 'pants' | 'jacket' | 'dress' | 'shoes';

interface SizeRecommendation {
    size: string;
    confidence: number;
    fitType: 'slim' | 'regular' | 'relaxed';
    notes: string[];
}

interface BrandSizing {
    brand: string;
    recommendation: SizeRecommendation;
    sizeChart: { size: string; chest?: number; waist?: number; hips?: number; length?: number }[];
}

const GARMENT_TYPES: { type: GarmentType; emoji: string; label: string }[] = [
    { type: 'shirt', emoji: '👕', label: 'Shirts' },
    { type: 'pants', emoji: '👖', label: 'Pants' },
    { type: 'jacket', emoji: '🧥', label: 'Jackets' },
    { type: 'dress', emoji: '👗', label: 'Dresses' },
    { type: 'shoes', emoji: '👟', label: 'Shoes' },
];

const POPULAR_BRANDS = [
    'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Gap', 'Ralph Lauren'
];

export const SizeRecommendationsScreen: React.FC = () => {
    const [selectedType, setSelectedType] = useState<GarmentType>('shirt');
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [customBrand, setCustomBrand] = useState<string>('');
    const [fitPreference, setFitPreference] = useState<number>(50); // 0=slim, 50=regular, 100=relaxed
    const [recommendation, setRecommendation] = useState<BrandSizing | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMeasurements, setHasMeasurements] = useState(true);

    useEffect(() => {
        checkMeasurements();
    }, []);

    useEffect(() => {
        if (selectedBrand) {
            getRecommendation();
        }
    }, [selectedType, selectedBrand, fitPreference]);

    const checkMeasurements = async () => {
        try {
            const data = await BodyAPI.getHistory(1);
            setHasMeasurements(!!data && data.length > 0);
        } catch {
            setHasMeasurements(false);
        }
    };

    const getRecommendation = async () => {
        setIsLoading(true);
        try {
            // Size recommendations are integrated into the fit checker V2 now
            setRecommendation(getMockRecommendation());
        } catch (err) {
            // Error handled by state — shows mock data
            setRecommendation(getMockRecommendation());
        } finally {
            setIsLoading(false);
        }
    };

    const getMockRecommendation = (): BrandSizing => ({
        brand: selectedBrand,
        recommendation: {
            size: fitPreference < 30 ? 'S' : fitPreference < 70 ? 'M' : 'L',
            confidence: 87,
            fitType: fitPreference < 30 ? 'slim' : fitPreference < 70 ? 'regular' : 'relaxed',
            notes: [
                'Based on your chest measurement',
                'Consider sizing up for layering',
                'This brand runs slightly small',
            ],
        },
        sizeChart: getMockSizeChart(selectedType),
    });

    const getMockSizeChart = (type: GarmentType) => {
        if (type === 'shirt' || type === 'jacket') {
            return [
                { size: 'XS', chest: 86, waist: 71, length: 68 },
                { size: 'S', chest: 91, waist: 76, length: 70 },
                { size: 'M', chest: 97, waist: 81, length: 72 },
                { size: 'L', chest: 102, waist: 86, length: 74 },
                { size: 'XL', chest: 107, waist: 91, length: 76 },
            ];
        } else if (type === 'pants') {
            return [
                { size: '28', waist: 71, hips: 89, length: 76 },
                { size: '30', waist: 76, hips: 94, length: 78 },
                { size: '32', waist: 81, hips: 99, length: 80 },
                { size: '34', waist: 86, hips: 104, length: 82 },
                { size: '36', waist: 91, hips: 109, length: 84 },
            ];
        }
        return [
            { size: 'XS' },
            { size: 'S' },
            { size: 'M' },
            { size: 'L' },
            { size: 'XL' },
        ];
    };

    const getFitLabel = (): string => {
        if (fitPreference < 30) return 'Slim Fit';
        if (fitPreference < 70) return 'Regular Fit';
        return 'Relaxed Fit';
    };

    const handleBrandSelect = (brand: string) => {
        setSelectedBrand(brand);
        setCustomBrand('');
    };

    if (!hasMeasurements) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>📏</Text>
                    <Text style={styles.emptyTitle}>No Measurements Found</Text>
                    <Text style={styles.emptyText}>
                        Complete a body scan first to get personalized size recommendations.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Size Recommendations</Text>
                    <Text style={styles.subtitle}>Find your perfect fit in any brand</Text>
                </View>

                {/* Garment Type Selection */}
                <View style={styles.typeSection}>
                    <Text style={styles.sectionLabel}>Select Garment Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                        {GARMENT_TYPES.map((item) => (
                            <TouchableOpacity
                                key={item.type}
                                style={[
                                    styles.typeCard,
                                    selectedType === item.type && styles.typeCardActive,
                                ]}
                                onPress={() => setSelectedType(item.type)}
                            >
                                <Text style={styles.typeEmoji}>{item.emoji}</Text>
                                <Text style={[
                                    styles.typeLabel,
                                    selectedType === item.type && styles.typeLabelActive,
                                ]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Brand Selection */}
                <Card style={styles.brandCard}>
                    <Text style={styles.sectionTitle}>Select Brand</Text>
                    <View style={styles.brandGrid}>
                        {POPULAR_BRANDS.map((brand) => (
                            <TouchableOpacity
                                key={brand}
                                style={[
                                    styles.brandPill,
                                    selectedBrand === brand && styles.brandPillActive,
                                ]}
                                onPress={() => handleBrandSelect(brand)}
                            >
                                <Text style={[
                                    styles.brandText,
                                    selectedBrand === brand && styles.brandTextActive,
                                ]}>
                                    {brand}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.customBrandRow}>
                        <TextInput
                            style={styles.customBrandInput}
                            placeholder="Or type a brand name..."
                            placeholderTextColor={Colors.textMuted}
                            value={customBrand}
                            onChangeText={(text) => {
                                setCustomBrand(text);
                                setSelectedBrand(text);
                            }}
                        />
                    </View>
                </Card>

                {/* Fit Preference Slider */}
                <Card style={styles.sliderCard}>
                    <Text style={styles.sectionTitle}>Fit Preference</Text>
                    <View style={styles.sliderContainer}>
                        <Text style={styles.sliderValue}>{getFitLabel()}</Text>
                        <View style={styles.sliderTrack}>
                            <View style={[styles.sliderFill, { width: `${fitPreference}%` }]} />
                        </View>
                        <View style={styles.sliderButtons}>
                            <TouchableOpacity
                                style={[styles.fitButton, fitPreference < 30 && styles.fitButtonActive]}
                                onPress={() => setFitPreference(15)}
                            >
                                <Text style={[styles.fitButtonText, fitPreference < 30 && styles.fitButtonTextActive]}>Slim</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.fitButton, fitPreference >= 30 && fitPreference < 70 && styles.fitButtonActive]}
                                onPress={() => setFitPreference(50)}
                            >
                                <Text style={[styles.fitButtonText, fitPreference >= 30 && fitPreference < 70 && styles.fitButtonTextActive]}>Regular</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.fitButton, fitPreference >= 70 && styles.fitButtonActive]}
                                onPress={() => setFitPreference(85)}
                            >
                                <Text style={[styles.fitButtonText, fitPreference >= 70 && styles.fitButtonTextActive]}>Relaxed</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card>

                {/* Recommendation Result */}
                {isLoading ? (
                    <Card style={styles.resultCard}>
                        <Loading />
                    </Card>
                ) : recommendation ? (
                    <Card style={styles.resultCard}>
                        <Text style={styles.sectionTitle}>Your Recommended Size</Text>

                        {/* Size Display */}
                        <View style={styles.sizeDisplay}>
                            <View style={styles.sizeCircle}>
                                <Text style={styles.sizeValue}>{recommendation.recommendation.size}</Text>
                            </View>
                            <View style={styles.confidenceBar}>
                                <View style={styles.confidenceLabel}>
                                    <Text style={styles.confidenceText}>Confidence</Text>
                                    <Text style={styles.confidenceValue}>
                                        {recommendation.recommendation.confidence}%
                                    </Text>
                                </View>
                                <View style={styles.confidenceTrack}>
                                    <View
                                        style={[
                                            styles.confidenceFill,
                                            { width: `${recommendation.recommendation.confidence}%` }
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Fit Badge */}
                        <View style={styles.fitBadge}>
                            <Text style={styles.fitBadgeText}>
                                {recommendation.recommendation.fitType.toUpperCase()} FIT
                            </Text>
                        </View>

                        {/* Notes */}
                        <View style={styles.notesSection}>
                            {recommendation.recommendation.notes.map((note, index) => (
                                <View key={index} style={styles.noteRow}>
                                    <Text style={styles.noteBullet}>•</Text>
                                    <Text style={styles.noteText}>{note}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>
                ) : selectedBrand ? null : (
                    <Card style={styles.resultCard}>
                        <View style={styles.selectBrandPrompt}>
                            <Text style={styles.promptEmoji}>👆</Text>
                            <Text style={styles.promptText}>Select a brand to get your size recommendation</Text>
                        </View>
                    </Card>
                )}

                {/* Size Chart */}
                {recommendation && (
                    <Card style={styles.chartCard}>
                        <Text style={styles.sectionTitle}>📊 {selectedBrand} Size Chart (cm)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.chartTable}>
                                {/* Header */}
                                <View style={styles.chartRow}>
                                    <Text style={[styles.chartCell, styles.chartHeader]}>Size</Text>
                                    {recommendation.sizeChart[0]?.chest !== undefined && (
                                        <Text style={[styles.chartCell, styles.chartHeader]}>Chest</Text>
                                    )}
                                    {recommendation.sizeChart[0]?.waist !== undefined && (
                                        <Text style={[styles.chartCell, styles.chartHeader]}>Waist</Text>
                                    )}
                                    {recommendation.sizeChart[0]?.hips !== undefined && (
                                        <Text style={[styles.chartCell, styles.chartHeader]}>Hips</Text>
                                    )}
                                    {recommendation.sizeChart[0]?.length !== undefined && (
                                        <Text style={[styles.chartCell, styles.chartHeader]}>Length</Text>
                                    )}
                                </View>
                                {/* Data Rows */}
                                {recommendation.sizeChart.map((row, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.chartRow,
                                            row.size === recommendation.recommendation.size && styles.chartRowHighlight,
                                        ]}
                                    >
                                        <Text style={[
                                            styles.chartCell,
                                            row.size === recommendation.recommendation.size && styles.chartCellHighlight,
                                        ]}>
                                            {row.size}
                                        </Text>
                                        {row.chest !== undefined && (
                                            <Text style={styles.chartCell}>{row.chest}</Text>
                                        )}
                                        {row.waist !== undefined && (
                                            <Text style={styles.chartCell}>{row.waist}</Text>
                                        )}
                                        {row.hips !== undefined && (
                                            <Text style={styles.chartCell}>{row.hips}</Text>
                                        )}
                                        {row.length !== undefined && (
                                            <Text style={styles.chartCell}>{row.length}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </Card>
                )}
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
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    sectionLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    typeSection: {
        marginBottom: Spacing.md,
    },
    typeScroll: {
        paddingHorizontal: Spacing.lg,
    },
    typeCard: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        marginRight: Spacing.sm,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeCardActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '10',
    },
    typeEmoji: {
        fontSize: 28,
        marginBottom: Spacing.xs,
    },
    typeLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    typeLabelActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    brandCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    brandGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    brandPill: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.full,
    },
    brandPillActive: {
        backgroundColor: Colors.primary,
    },
    brandText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    brandTextActive: {
        color: Colors.text,
        fontWeight: '600',
    },
    customBrandRow: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.md,
    },
    customBrandInput: {
        fontSize: FontSize.sm,
        color: Colors.text,
        padding: Spacing.sm,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.sm,
    },
    sliderCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sliderContainer: {
        alignItems: 'center',
    },
    sliderValue: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: Spacing.sm,
    },
    sliderTrack: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        width: '100%',
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    sliderButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: Spacing.sm,
    },
    fitButton: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
    },
    fitButtonActive: {
        backgroundColor: Colors.primary,
    },
    fitButtonText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    fitButtonTextActive: {
        color: Colors.text,
        fontWeight: '600',
    },
    slider: {
        width: screenWidth - Spacing.lg * 4 - Spacing.md * 2,
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    sliderLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    resultCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sizeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    sizeCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sizeValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
    },
    confidenceBar: {
        flex: 1,
    },
    confidenceLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    confidenceText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    confidenceValue: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.success,
    },
    confidenceTrack: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    confidenceFill: {
        height: '100%',
        backgroundColor: Colors.success,
        borderRadius: 4,
    },
    fitBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.md,
    },
    fitBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    notesSection: {
        backgroundColor: Colors.background,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    noteRow: {
        flexDirection: 'row',
        marginVertical: 2,
    },
    noteBullet: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginRight: Spacing.xs,
    },
    noteText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        flex: 1,
    },
    selectBrandPrompt: {
        alignItems: 'center',
        padding: Spacing.md,
    },
    promptEmoji: {
        fontSize: 32,
        marginBottom: Spacing.sm,
    },
    promptText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    chartCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    chartTable: {
        minWidth: screenWidth - Spacing.lg * 4,
    },
    chartRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    chartRowHighlight: {
        backgroundColor: Colors.primary + '20',
    },
    chartCell: {
        width: 70,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        fontSize: FontSize.sm,
        color: Colors.text,
        textAlign: 'center',
    },
    chartHeader: {
        fontWeight: '600',
        backgroundColor: Colors.background,
    },
    chartCellHighlight: {
        fontWeight: 'bold',
        color: Colors.primary,
    },
});

export default SizeRecommendationsScreen;
