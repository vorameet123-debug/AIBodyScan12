/**
 * Clothing Fit Checker Screen (V2)
 * Matches website's ClothingFitChecker exactly:
 * - Product image upload (camera/gallery)
 * - Saved measurement picker
 * - Size, fit preference, occasion inputs
 * - 7 rich result sections: Score, Roast, Fit Meters, Garment Info, Color Match, Style Tips, Occasion Check
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
    ActivityIndicator,
    Animated,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import {
    ClothingAPI,
    BodyAPI,
    FitCheckV2Response,
    FitMeter,
} from '../../services/api';
import { hapticMedium, hapticSuccess } from '../../utils/haptics';

// ── Constants (matching website) ──
const OCCASIONS = ['Casual', 'Formal', 'Sports', 'Party', 'Business', 'Wedding', 'Beach', 'Winter', 'Summer'];
const FIT_TYPES = [
    { id: 'slim', label: 'Slim Fit', desc: 'Fitted' },
    { id: 'regular', label: 'Regular Fit', desc: 'Standard' },
    { id: 'loose', label: 'Loose Fit', desc: 'Relaxed' },
];

interface SavedMeasurement {
    id: number;
    name: string;
    measurements: { [key: string]: number };
    created_at: string;
}

export const ClothingFitCheckerScreen: React.FC = () => {
    // ── Form State ──
    const [productImage, setProductImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
    const [selectedMeasurementId, setSelectedMeasurementId] = useState<number>(0);
    const [size, setSize] = useState('');
    const [fitType, setFitType] = useState('slim');
    const [occasion, setOccasion] = useState('');

    // ── Result State ──
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<FitCheckV2Response | null>(null);

    // ── Load saved measurements ──
    useEffect(() => {
        const loadMeasurements = async () => {
            try {
                const res = await BodyAPI.getHistory(30);
                const list = res.measurements || res || [];
                setMeasurements(list);
                if (list.length > 0 && selectedMeasurementId === 0) {
                    setSelectedMeasurementId(list[0].id);
                }
            } catch (err) {
                // Measurement load failed silently — handled by empty state
            }
        };
        loadMeasurements();
    }, []);

    // ── Image Picker ──
    const pickImage = async (useCamera: boolean) => {
        const permission = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Toast.show({ type: 'error', text1: 'Permission Needed', text2: `Please grant ${useCamera ? 'camera' : 'photo library'} access.` });
            return;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true })
            : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, mediaTypes: ['images'] });

        if (!result.canceled && result.assets[0]) {
            setProductImage(result.assets[0]);
        }
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!productImage) { Toast.show({ type: 'error', text1: 'Missing', text2: 'Please upload a product image' }); return; }
        if (!selectedMeasurementId) { Toast.show({ type: 'error', text1: 'Missing', text2: 'Please select a saved measurement' }); return; }
        if (!size.trim()) { Toast.show({ type: 'error', text1: 'Missing', text2: 'Please enter the size' }); return; }
        if (!occasion) { Toast.show({ type: 'error', text1: 'Missing', text2: 'Please select an occasion' }); return; }

        setIsLoading(true);
        setResult(null);
        hapticMedium();
        try {
            const res = await ClothingAPI.checkClothingFitV2(
                productImage,
                selectedMeasurementId,
                size.trim(),
                occasion,
                fitType
            );
            setResult(res);
            hapticSuccess();
        } catch (err: any) {
            const msg = err.response?.data?.detail || err.message || 'Fit check failed';
            Toast.show({ type: 'error', text1: 'Fit Check Error', text2: typeof msg === 'string' ? msg : JSON.stringify(msg) });
            console.error('Fit check error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
    };

    // ── Score Helpers ──
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };
    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Perfect Match!';
        if (score >= 80) return 'Great Fit!';
        if (score >= 70) return 'Good Fit';
        if (score >= 60) return 'Decent Fit';
        return 'Needs Work';
    };

    // ── Zone Colors (matching website) ──
    const getZoneColor = (zone: string) => {
        switch (zone) {
            case 'green': return '#10B981';
            case 'red': return '#F43F5E';
            case 'blue': return '#3B82F6';
            default: return '#64748B';
        }
    };

    const getStampColor = (color: string) => {
        switch (color) {
            case 'green': return { bg: '#10B98120', border: '#10B981', text: '#10B981' };
            case 'red': return { bg: '#F43F5E20', border: '#F43F5E', text: '#F43F5E' };
            case 'blue': return { bg: '#3B82F620', border: '#3B82F6', text: '#3B82F6' };
            default: return { bg: '#64748B20', border: '#64748B', text: '#64748B' };
        }
    };

    // ════════════════════════════════════════
    // RENDER: FORM STATE
    // ════════════════════════════════════════
    if (!result) {
        return (
            <SafeAreaView style={s.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Hero */}
                    <View style={s.hero}>
                        <View style={s.heroBadge}>
                            <Text style={s.heroBadgeText}>✨ AI-Powered Fit Analysis</Text>
                        </View>
                        <Text style={s.heroTitle}>Will It <Text style={s.heroAccent}>Fit?</Text></Text>
                        <Text style={s.heroSub}>Upload any clothing item and get instant AI analysis on how it'll fit your body.</Text>
                    </View>

                    {/* Info Banner */}
                    <View style={s.infoBanner}>
                        <Text style={s.infoBannerIcon}>📸</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={s.infoBannerTitle}>AI-Powered Product Analysis</Text>
                            <Text style={s.infoBannerDesc}>Upload a product image and we'll automatically extract the type, material, and brand using AI!</Text>
                        </View>
                    </View>

                    {/* ── Product Image Upload ── */}
                    <Text style={s.label}>📷 Product Image <Text style={s.required}>*</Text></Text>
                    {!productImage ? (
                        <View style={s.uploadArea}>
                            <View style={s.uploadIconBox}>
                                <Text style={{ fontSize: 28 }}>📷</Text>
                            </View>
                            <Text style={s.uploadTitle}>Upload product image</Text>
                            <Text style={s.uploadHint}>Clear product photo from any store</Text>
                            <View style={s.uploadBtns}>
                                <TouchableOpacity style={s.uploadBtn} onPress={() => pickImage(false)}>
                                    <Text style={s.uploadBtnText}>🖼️ Gallery</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.uploadBtn} onPress={() => pickImage(true)}>
                                    <Text style={s.uploadBtnText}>📸 Camera</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={s.imagePreview}>
                            <Image source={{ uri: productImage.uri }} style={s.previewImg} />
                            <View style={s.imageReadyBadge}>
                                <Text style={s.imageReadyText}>✓ Image Ready</Text>
                            </View>
                            <TouchableOpacity style={s.removeImgBtn} onPress={() => setProductImage(null)}>
                                <Text style={s.removeImgText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── Select Person (Saved Measurement) ── */}
                    <Text style={s.label}>👤 Select Person <Text style={s.required}>*</Text></Text>
                    {measurements.length === 0 ? (
                        <View style={s.warningBox}>
                            <Text style={s.warningText}>⚠️ No saved measurements. Please create measurements first via Body Scan.</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.measurementScroll} contentContainerStyle={{ gap: 8 }}>
                            {measurements.map(m => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[s.measurementChip, selectedMeasurementId === m.id && s.measurementChipActive]}
                                    onPress={() => setSelectedMeasurementId(m.id)}
                                >
                                    <Text style={[s.measurementChipText, selectedMeasurementId === m.id && s.measurementChipTextActive]}>
                                        {m.name || `#${m.id}`}
                                    </Text>
                                    {selectedMeasurementId === m.id && <Text style={s.chipCheck}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* ── Size ── */}
                    <Text style={s.label}>📏 Size <Text style={s.required}>*</Text></Text>
                    <TextInput
                        style={s.textInput}
                        placeholder="e.g. M, L, 32, 40..."
                        placeholderTextColor={Colors.textMuted}
                        value={size}
                        onChangeText={setSize}
                        autoCapitalize="characters"
                    />

                    {/* ── Fit Preference ── */}
                    <Text style={s.label}>✨ Fit Preference</Text>
                    <View style={s.fitTypeRow}>
                        {FIT_TYPES.map(ft => (
                            <TouchableOpacity
                                key={ft.id}
                                style={[s.fitTypeChip, fitType === ft.id && s.fitTypeChipActive]}
                                onPress={() => setFitType(ft.id)}
                            >
                                <Text style={[s.fitTypeLabel, fitType === ft.id && s.fitTypeLabelActive]}>{ft.label}</Text>
                                <Text style={[s.fitTypeDesc, fitType === ft.id && { color: '#C4B5FD' }]}>{ft.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── Occasion ── */}
                    <Text style={s.label}>📅 Occasion <Text style={s.required}>*</Text></Text>
                    <View style={s.occasionGrid}>
                        {OCCASIONS.map(occ => (
                            <TouchableOpacity
                                key={occ}
                                style={[s.occasionChip, occasion === occ && s.occasionChipActive]}
                                onPress={() => setOccasion(occ)}
                            >
                                <Text style={[s.occasionText, occasion === occ && s.occasionTextActive]}>{occ}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── Submit ── */}
                    <TouchableOpacity
                        style={[s.submitBtn, isLoading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <View style={s.submitLoading}>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={s.submitText}>Analyzing Product...</Text>
                            </View>
                        ) : (
                            <Text style={s.submitText}>✨ AI Fit Check</Text>
                        )}
                    </TouchableOpacity>

                    {/* Loading Animation */}
                    {isLoading && (
                        <View style={s.loadingCard}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={s.loadingTitle}>Analyzing your fit...</Text>
                            <Text style={s.loadingSub}>Our AI is measuring every detail</Text>
                        </View>
                    )}

                    {/* Feature Cards */}
                    <View style={s.featuresRow}>
                        {[
                            { icon: '🎯', title: 'Precise Fit', desc: 'Measurements down to the cm' },
                            { icon: '🎨', title: 'Color Match', desc: 'See how colors complement you' },
                            { icon: '📅', title: 'Occasion Ready', desc: 'Style tips for any event' },
                        ].map(f => (
                            <View key={f.title} style={s.featureCard}>
                                <Text style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</Text>
                                <Text style={s.featureTitle}>{f.title}</Text>
                                <Text style={s.featureDesc}>{f.desc}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ════════════════════════════════════════
    // RENDER: RESULTS STATE (7 sections)
    // ════════════════════════════════════════
    const scoreColor = getScoreColor(result.overall_score || 0);

    // Sort fit meters like website
    const priorityOrder = ['chest', 'waist', 'hip', 'shoulder', 'length', 'sleeve_length', 'inseam'];
    const sortedMeters = Object.entries(result.fit_meters?.fit_meters || {}).sort((a, b) => {
        const iA = priorityOrder.indexOf(a[0]);
        const iB = priorityOrder.indexOf(b[0]);
        if (iA !== -1 && iB !== -1) return iA - iB;
        if (iA !== -1) return -1;
        if (iB !== -1) return 1;
        return a[0].localeCompare(b[0]);
    });

    return (
        <SafeAreaView style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* ═══ 1. OVERALL SCORE + HEADER ═══ */}
                <View style={s.scoreSection}>
                    <View style={s.scoreCircleWrap}>
                        <View style={[s.scoreCircle, { borderColor: scoreColor }]}>
                            <Text style={[s.scoreNum, { color: scoreColor }]}>{result.overall_score}</Text>
                            <Text style={s.scoreOf}>/ 100</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.scoreLabelText}>
                            {result.overall_score !== undefined && getScoreLabel(result.overall_score)}
                        </Text>
                        <Text style={s.scoreSubText}>Your fit analysis is ready</Text>
                        <TouchableOpacity style={s.checkAnotherBtn} onPress={handleReset}>
                            <Text style={s.checkAnotherText}>🔄 Check Another</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ═══ 2. ROAST CARD ═══ */}
                {result.roast && (
                    <View style={[s.card, { borderLeftWidth: 3, borderLeftColor: getStampColor(result.roast.stamp_color).border }]}>
                        <Text style={s.cardMeta}>AI VERDICT ON {(result.garment_analysis?.garment_type || 'GARMENT').toUpperCase()}</Text>
                        <Text style={s.roastQuote}>"{result.roast.fit_roast}"</Text>
                        <View style={[s.stamp, {
                            backgroundColor: getStampColor(result.roast.stamp_color).bg,
                            borderColor: getStampColor(result.roast.stamp_color).border,
                        }]}>
                            <Text style={[s.stampText, { color: getStampColor(result.roast.stamp_color).text }]}>
                                {result.roast.verdict_stamp}
                            </Text>
                        </View>
                    </View>
                )}

                {/* ═══ 3. FIT METERS ═══ */}
                {sortedMeters.length > 0 && (
                    <View style={s.card}>
                        <View style={s.cardHeaderRow}>
                            <Text style={{ fontSize: 16 }}>📊</Text>
                            <Text style={s.cardTitle}>Fit Breakdown</Text>
                        </View>
                        {sortedMeters.map(([key, meter], idx) => {
                            const zc = getZoneColor(meter.zone);
                            const statusText = meter.status.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                            return (
                                <View key={key} style={s.meterItem}>
                                    <View style={s.meterHeader}>
                                        <Text style={s.meterLabel}>{key.replace(/_/g, ' ')}</Text>
                                        <View style={[s.meterBadge, { backgroundColor: zc + '20', borderColor: zc + '40' }]}>
                                            <Text style={[s.meterBadgeText, { color: zc }]}>{statusText}</Text>
                                        </View>
                                    </View>
                                    {/* Progress bar with zone markers */}
                                    <View style={s.meterBarBg}>
                                        <View style={s.meterZones}>
                                            <View style={[s.meterZone, { flex: 3, backgroundColor: '#F43F5E30' }]} />
                                            <View style={[s.meterZone, { flex: 4, backgroundColor: '#10B98130' }]} />
                                            <View style={[s.meterZone, { flex: 3, backgroundColor: '#3B82F630' }]} />
                                        </View>
                                        <View style={[s.meterFill, { width: `${Math.min(meter.score, 100)}%`, backgroundColor: zc }]} />
                                    </View>
                                    {/* Measurements detail */}
                                    <View style={s.meterDetail}>
                                        <Text style={s.meterDetailText}>You: {meter.user_measurement}cm</Text>
                                        <Text style={[s.meterDetailText, {
                                            color: meter.ease > 0 ? '#10B981' : meter.ease < 0 ? '#F43F5E' : Colors.textMuted
                                        }]}>
                                            Ease: {meter.ease > 0 ? '+' : ''}{meter.ease}cm
                                        </Text>
                                        <Text style={s.meterDetailText}>Item: {meter.garment_measurement}cm</Text>
                                    </View>
                                </View>
                            );
                        })}
                        <View style={s.meterOverall}>
                            <Text style={s.meterOverallText}>
                                Overall Fit Score: <Text style={s.meterOverallBold}>{result.fit_meters?.overall_fit_score}/100</Text>
                            </Text>
                        </View>
                    </View>
                )}

                {/* ═══ 4. GARMENT INFO ═══ */}
                {result.garment_analysis && (
                    <View style={s.card}>
                        <View style={s.cardHeaderRow}>
                            <Text style={{ fontSize: 16 }}>👕</Text>
                            <Text style={s.cardTitle}>Garment Info</Text>
                        </View>
                        <View style={s.garmentGrid}>
                            {[
                                { icon: '🏷️', label: 'Type', value: result.garment_analysis.garment_type },
                                { icon: '🎨', label: 'Material', value: result.garment_analysis.material },
                                { icon: '⭐', label: 'Style', value: result.garment_analysis.style },
                                { icon: '✂️', label: 'Pattern', value: result.garment_analysis.pattern },
                                { icon: '👕', label: 'Fit Type', value: result.garment_analysis.fit_type },
                                { icon: '💼', label: 'Formality', value: `${result.garment_analysis.formality_level}/10` },
                            ].map(item => (
                                <View key={item.label} style={s.garmentItem}>
                                    <View style={s.garmentItemHeader}>
                                        <Text style={{ fontSize: 12 }}>{item.icon}</Text>
                                        <Text style={s.garmentItemLabel}>{item.label}</Text>
                                    </View>
                                    <Text style={s.garmentItemValue}>{item.value || '—'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ═══ 5. COLOR MATCH ═══ */}
                {result.color_analysis && (
                    <View style={s.card}>
                        <View style={s.cardHeaderRow}>
                            <Text style={{ fontSize: 16 }}>🎨</Text>
                            <Text style={s.cardTitle}>Color Match</Text>
                        </View>
                        {/* Score bar */}
                        <View style={s.scoreBarRow}>
                            <Text style={s.scoreBarLabel}>Skin Tone Match</Text>
                            <Text style={[s.scoreBarValue, { color: result.color_analysis.match_score > 70 ? '#10B981' : result.color_analysis.match_score > 40 ? '#F59E0B' : '#F43F5E' }]}>
                                {result.color_analysis.match_score}/100
                            </Text>
                        </View>
                        <View style={s.progressBg}>
                            <View style={[s.progressFill, {
                                width: `${result.color_analysis.match_score}%`,
                                backgroundColor: result.color_analysis.match_score > 70 ? '#10B981' : result.color_analysis.match_score > 40 ? '#F59E0B' : '#F43F5E',
                            }]} />
                        </View>
                        {/* Primary color */}
                        {result.color_analysis.primary_color?.rgb && (
                            <View style={s.colorSwatchRow}>
                                <View style={[s.colorSwatch, {
                                    backgroundColor: `rgb(${result.color_analysis.primary_color.rgb.r || 0},${result.color_analysis.primary_color.rgb.g || 0},${result.color_analysis.primary_color.rgb.b || 0})`
                                }]} />
                                <View>
                                    <Text style={s.colorSwatchMeta}>Primary Color</Text>
                                    <Text style={s.colorSwatchName}>{result.color_analysis.primary_color.name || 'Detected'}</Text>
                                </View>
                            </View>
                        )}
                        {/* Roast */}
                        <View style={s.quoteBox}>
                            <Text style={s.quoteText}>"{result.color_analysis.roast}"</Text>
                        </View>
                        {/* Suggested colors */}
                        {result.color_analysis.suggested_colors?.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={s.tagSectionLabel}>✨ Try Instead:</Text>
                                <View style={s.tagRow}>
                                    {result.color_analysis.suggested_colors.map((c: string, i: number) => (
                                        <View key={i} style={s.suggestedTag}>
                                            <Text style={s.suggestedTagText}>{c}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* ═══ 6. STYLE TIPS ═══ */}
                {result.style_recommendations && (
                    <View style={s.card}>
                        <View style={s.cardHeaderRow}>
                            <Text style={{ fontSize: 16 }}>⭐</Text>
                            <Text style={s.cardTitle}>Style Tips</Text>
                        </View>
                        <View style={s.scoreBarRow}>
                            <Text style={s.scoreBarLabel}>Style Score</Text>
                            <Text style={[s.scoreBarValue, {
                                color: result.style_recommendations.style_score >= 70 ? '#8B5CF6' : result.style_recommendations.style_score >= 50 ? '#F59E0B' : '#F43F5E'
                            }]}>
                                {result.style_recommendations.style_score}/100
                            </Text>
                        </View>
                        <View style={s.progressBg}>
                            <View style={[s.progressFill, {
                                width: `${result.style_recommendations.style_score}%`,
                                backgroundColor: '#8B5CF6',
                            }]} />
                        </View>
                        {result.style_recommendations.outfit_suggestions?.length > 0 && (
                            <View style={{ marginTop: 16 }}>
                                <Text style={s.tagSectionLabel}>💡 Outfit Ideas</Text>
                                {result.style_recommendations.outfit_suggestions.map((sug: string, i: number) => (
                                    <View key={i} style={s.outfitItem}>
                                        <Text style={s.outfitBullet}>•</Text>
                                        <Text style={s.outfitText}>{sug}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* ═══ 7. OCCASION CHECK ═══ */}
                {result.occasion_analysis && (
                    <View style={s.card}>
                        <View style={s.cardHeaderRow}>
                            <Text style={{ fontSize: 16 }}>📅</Text>
                            <Text style={s.cardTitle}>Occasion Check</Text>
                        </View>
                        <View style={s.occasionResultRow}>
                            <View style={[s.occasionBadge, {
                                backgroundColor: result.occasion_analysis.is_appropriate ? '#10B98120' : '#F59E0B20',
                                borderColor: result.occasion_analysis.is_appropriate ? '#10B98140' : '#F59E0B40',
                            }]}>
                                <Text style={{ fontSize: 24 }}>{result.occasion_analysis.is_appropriate ? '✅' : '⚠️'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.occasionStatus, {
                                    color: result.occasion_analysis.is_appropriate ? '#10B981' : '#F59E0B'
                                }]}>
                                    {result.occasion_analysis.is_appropriate ? 'Appropriate' : 'Questionable Choice'}
                                </Text>
                                <Text style={s.occasionScore}>
                                    Match Score: <Text style={{ color: Colors.text, fontWeight: '600' }}>{result.occasion_analysis.occasion_match_score}/100</Text>
                                </Text>
                            </View>
                        </View>
                        <View style={s.quoteBox}>
                            <Text style={s.quoteText}>"{result.occasion_analysis.recommendation}"</Text>
                        </View>
                        {result.occasion_analysis.alternative_occasions?.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={s.tagSectionLabel}>✨ Better For:</Text>
                                <View style={s.tagRow}>
                                    {result.occasion_analysis.alternative_occasions.map((occ: string, i: number) => (
                                        <View key={i} style={[s.suggestedTag, { backgroundColor: '#06B6D420', borderColor: '#06B6D440' }]}>
                                            <Text style={[s.suggestedTagText, { color: '#06B6D4' }]}>{occ}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* ═══ SIZE RECOMMENDATION ═══ */}
                {result.size_recommendation && (
                    <View style={s.card}>
                        <View style={s.cardHeaderRow}>
                            <Text style={{ fontSize: 16 }}>📐</Text>
                            <Text style={s.cardTitle}>Recommended Size</Text>
                        </View>
                        <View style={s.sizeRecCenter}>
                            <Text style={s.sizeRecSize}>{result.size_recommendation.recommended_size}</Text>
                            <Text style={s.sizeRecScore}>{result.size_recommendation.recommended_score}% fit</Text>
                        </View>
                        {result.size_recommendation.alternatives?.length > 0 && (
                            <View style={s.altSizesRow}>
                                {result.size_recommendation.alternatives.map((alt, i) => (
                                    <View key={i} style={s.altSizeBox}>
                                        <Text style={s.altSizeText}>{alt.size}</Text>
                                        <Text style={s.altSizeScore}>{alt.score}%</Text>
                                        <Text style={s.altSizeDiff}>
                                            {alt.difference > 0 ? '+' : ''}{alt.difference?.toFixed(1)}cm
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* ═══ CHECK ANOTHER ═══ */}
                <TouchableOpacity style={s.submitBtn} onPress={handleReset} activeOpacity={0.8}>
                    <Text style={s.submitText}>👕 Check Another Item →</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

// ════════════════════════════════════════
// STYLES
// ════════════════════════════════════════
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Hero
    hero: { padding: Spacing.lg, alignItems: 'center', paddingTop: Spacing.xl },
    heroBadge: { backgroundColor: Colors.primary + '15', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary + '25', marginBottom: 12 },
    heroBadgeText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '600' },
    heroTitle: { fontSize: 32, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
    heroAccent: { color: Colors.primary },
    heroSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.md },

    // Info Banner
    infoBanner: { flexDirection: 'row', backgroundColor: Colors.primary + '10', borderWidth: 1, borderColor: Colors.primary + '20', borderRadius: BorderRadius.lg, padding: Spacing.md, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, gap: 10, alignItems: 'flex-start' },
    infoBannerIcon: { fontSize: 18, marginTop: 2 },
    infoBannerTitle: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600', marginBottom: 2 },
    infoBannerDesc: { color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 18 },

    // Labels
    label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, paddingHorizontal: Spacing.lg, marginBottom: 8, marginTop: Spacing.md },
    required: { color: '#F43F5E' },

    // Upload
    uploadArea: { marginHorizontal: Spacing.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', backgroundColor: Colors.surface },
    uploadIconBox: { width: 56, height: 56, borderRadius: 14, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.primary + '25' },
    uploadTitle: { color: Colors.text, fontWeight: '600', marginBottom: 4 },
    uploadHint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 16 },
    uploadBtns: { flexDirection: 'row', gap: 12 },
    uploadBtn: { backgroundColor: Colors.primary + '15', paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.primary + '30' },
    uploadBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },

    // Image Preview
    imagePreview: { marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
    previewImg: { width: '100%', height: 200, resizeMode: 'cover' },
    imageReadyBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    imageReadyText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
    removeImgBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#F43F5E', width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    removeImgText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Measurement Chips
    measurementScroll: { paddingHorizontal: Spacing.lg },
    measurementChip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
    measurementChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
    measurementChipText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500' },
    measurementChipTextActive: { color: Colors.primary },
    chipCheck: { color: '#10B981', fontSize: 14, fontWeight: 'bold' },

    // Warning
    warningBox: { marginHorizontal: Spacing.lg, padding: Spacing.md, backgroundColor: '#F59E0B15', borderWidth: 1, borderColor: '#F59E0B40', borderRadius: BorderRadius.md },
    warningText: { color: '#F59E0B', fontSize: FontSize.sm },

    // Text Input
    textInput: { marginHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, color: Colors.text, fontSize: FontSize.md, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 },

    // Fit Type
    fitTypeRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 8 },
    fitTypeChip: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
    fitTypeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
    fitTypeLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
    fitTypeLabelActive: { color: Colors.primary },
    fitTypeDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },

    // Occasion
    occasionGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: 8 },
    occasionChip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 8 },
    occasionChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
    occasionText: { color: Colors.textSecondary, fontSize: FontSize.sm },
    occasionTextActive: { color: Colors.primary, fontWeight: '600' },

    // Submit
    submitBtn: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, backgroundColor: '#7C3AED', paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: 'center' },
    submitLoading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    submitText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },

    // Loading
    loadingCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border },
    loadingTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600', marginTop: Spacing.md },
    loadingSub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },

    // Feature Cards
    featuresRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: 8 },
    featureCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
    featureTitle: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '600', marginBottom: 2 },
    featureDesc: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },

    // ══════════════ RESULTS ══════════════

    // Score Section
    scoreSection: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md, backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border },
    scoreCircleWrap: {},
    scoreCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    scoreNum: { fontSize: 22, fontWeight: 'bold' },
    scoreOf: { fontSize: 10, color: Colors.textMuted },
    scoreLabelText: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.text },
    scoreSubText: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
    checkAnotherBtn: { marginTop: 6 },
    checkAnotherText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '500' },

    // Card (shared)
    card: { backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
    cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
    cardMeta: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 8 },

    // Roast
    roastQuote: { fontSize: FontSize.lg, fontWeight: '500', color: Colors.text, lineHeight: 26, marginBottom: 16, fontStyle: 'italic' },
    stamp: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, borderWidth: 2, transform: [{ rotate: '-6deg' }] },
    stampText: { fontSize: FontSize.md, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },

    // Fit Meters
    meterItem: { marginBottom: 16 },
    meterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    meterLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, textTransform: 'capitalize' },
    meterBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
    meterBadgeText: { fontSize: 10, fontWeight: '600' },
    meterBarBg: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden', position: 'relative' },
    meterZones: { position: 'absolute', flexDirection: 'row', width: '100%', height: '100%' },
    meterZone: { height: '100%' },
    meterFill: { height: '100%', borderRadius: 4, position: 'absolute', top: 0, left: 0 },
    meterDetail: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    meterDetailText: { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace' },
    meterOverall: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12, marginTop: 4, alignItems: 'center' },
    meterOverallText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    meterOverallBold: { color: Colors.text, fontWeight: 'bold' },

    // Garment Grid
    garmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    garmentItem: { width: '48%', backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 10, borderWidth: 1, borderColor: Colors.border },
    garmentItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    garmentItemLabel: { fontSize: 10, color: Colors.textMuted },
    garmentItemValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },

    // Progress Bar (shared)
    scoreBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    scoreBarLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
    scoreBarValue: { fontSize: FontSize.sm, fontWeight: 'bold' },
    progressBg: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },

    // Color
    colorSwatchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 10, marginTop: 12, borderWidth: 1, borderColor: Colors.border },
    colorSwatch: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#ffffff30' },
    colorSwatchMeta: { fontSize: 10, color: Colors.textMuted },
    colorSwatchName: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, textTransform: 'capitalize' },

    // Quote Box
    quoteBox: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 12, marginTop: 12, borderLeftWidth: 2, borderLeftColor: Colors.primary },
    quoteText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 20 },

    // Tags
    tagSectionLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    suggestedTag: { backgroundColor: Colors.primary + '15', borderWidth: 1, borderColor: Colors.primary + '30', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    suggestedTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },

    // Outfit
    outfitItem: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 10, marginTop: 6, borderWidth: 1, borderColor: Colors.border, alignItems: 'flex-start' },
    outfitBullet: { color: Colors.primary, marginRight: 8, fontSize: FontSize.sm },
    outfitText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

    // Occasion Result
    occasionResultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    occasionBadge: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    occasionStatus: { fontSize: FontSize.md, fontWeight: '600' },
    occasionScore: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },

    // Size Recommendation
    sizeRecCenter: { alignItems: 'center', marginBottom: 16 },
    sizeRecSize: { fontSize: 48, fontWeight: 'bold', color: Colors.primary },
    sizeRecScore: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', marginTop: 4 },
    altSizesRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
    altSizeBox: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, minWidth: 70 },
    altSizeText: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.text },
    altSizeScore: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', marginTop: 2 },
    altSizeDiff: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
});

export default ClothingFitCheckerScreen;
