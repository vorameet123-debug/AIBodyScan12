/**
 * Body Scan Screen
 * Upload photos + personal info to get body measurements
 * Aligned with website MeasurementForm flow
 */
import React, { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    ActivityIndicator,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { BodyAPI, PaymentsAPI } from '../../services/api';
import { Body3DViewer } from '../../components/scan/Body3DViewer';
import axios from 'axios';
import { API_URL } from '../../config/env';
import { hapticMedium, hapticSuccess, hapticError } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface MeasurementResponse {
    success: boolean;
    measurements: Record<string, number>;
    size_recommendations?: Record<string, string>;
    metadata?: {
        processing_time?: number;
        measurements_extracted?: number;
        gender?: string;
        user_height_cm?: number;
    };
    error?: string;
}

// Key measurements to highlight
const KEY_MEASUREMENTS = [
    { key: 'height', label: 'Height', icon: '📏', color: '#8B5CF6' },
    { key: 'chest_circumference', label: 'Chest', icon: '📐', color: '#D946EF' },
    { key: 'waist_circumference', label: 'Waist', icon: '📊', color: '#06B6D4' },
    { key: 'hip_circumference', label: 'Hip', icon: '✨', color: '#10B981' },
];

type ScanRouteParams = { measurementId?: number };

export const BodyScanScreen: React.FC = () => {
    const route = useRoute<RouteProp<{ Scan: ScanRouteParams }, 'Scan'>>();

    // Form state
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [sideImage, setSideImage] = useState<string | null>(null);
    const [heightCm, setHeightCm] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | ''>('');
    const [age, setAge] = useState('');

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<MeasurementResponse | null>(null);
    const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Subscription state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeInfo, setUpgradeInfo] = useState<{ message: string; current: number; limit: number } | null>(null);
    const navigation = useNavigation<any>();

    // Auto-load measurement when navigated from Saved Measurements
    useEffect(() => {
        const measurementId = route.params?.measurementId;
        if (measurementId) {
            const loadMeasurement = async () => {
                setIsLoading(true);
                try {
                    const data = await BodyAPI.getMeasurement(measurementId);
                    setResult({
                        success: true,
                        measurements: data.measurements || {},
                        size_recommendations: data.size_recommendations,
                        metadata: data.metadata,
                    });
                } catch (err: any) {
                    Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load measurement' });
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            loadMeasurement();
        }
    }, [route.params?.measurementId]);

    const pickImage = async (type: 'front' | 'side') => {
        const actionSheet = await new Promise<'camera' | 'gallery' | null>((resolve) => {
            Alert.alert(
                type === 'front' ? 'Front View Photo' : 'Side View Photo',
                'Choose a method to add your photo',
                [
                    { text: 'Take Photo', onPress: () => resolve('camera') },
                    { text: 'Choose from Gallery', onPress: () => resolve('gallery') },
                    { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
                ]
            );
        });

        if (!actionSheet) return;

        let result;
        if (actionSheet === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({ type: 'error', text1: 'Permission Needed', text2: 'Camera permission is required to take photos.' });
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: true,
                aspect: [3, 4],
            });
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({ type: 'error', text1: 'Permission Needed', text2: 'Gallery access is required to pick photos.' });
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: true,
                aspect: [3, 4],
            });
        }

        if (!result.canceled && result.assets[0]) {
            if (type === 'front') {
                setFrontImage(result.assets[0].uri);
            } else {
                setSideImage(result.assets[0].uri);
            }
        }
    };

    const handleSubmit = async () => {
        if (!frontImage) {
            Toast.show({ type: 'error', text1: 'Missing Photo', text2: 'Front view photo is required.' });
            return;
        }

        if (!heightCm || parseFloat(heightCm) <= 0) {
            Toast.show({ type: 'error', text1: 'Invalid Height', text2: 'Please enter a valid height in cm.' });
            return;
        }

        // Check subscription limit before processing (like website)
        try {
            const subRes = await axios.get(`${API_URL}/api/v1/payments/subscription-status`);
            const sub = subRes.data;
            const isPro = sub?.plan_id === 'pro' || sub?.plan_id === 'enterprise' || sub?.status === 'active';
            if (!isPro) {
                // Check usage limit for free users
                try {
                    const usageRes = await axios.get(`${API_URL}/api/v1/payments/check-usage?feature=body_scan`);
                    const usage = usageRes.data;
                    if (usage && !usage.can_use) {
                        setUpgradeInfo({
                            message: usage.message || 'You have reached your free scan limit this month.',
                            current: usage.current_count || 0,
                            limit: usage.limit || 3,
                        });
                        setShowUpgradeModal(true);
                        return;
                    }
                } catch {
                    // If check fails, allow the scan
                }
            }
        } catch {
            // If subscription check fails, allow the scan
        }

        setIsLoading(true);
        hapticMedium();
        Toast.show({ type: 'info', text1: '🔄 Processing...', text2: 'Analyzing your body measurements', autoHide: false });

        try {
            const formData = new FormData();

            // Add front image
            formData.append('front_image', {
                uri: frontImage,
                type: 'image/jpeg',
                name: 'front.jpg',
            } as any);

            // Add side image if available
            if (sideImage) {
                formData.append('side_image', {
                    uri: sideImage,
                    type: 'image/jpeg',
                    name: 'side.jpg',
                } as any);
            }

            // Add personal info
            formData.append('height_cm', heightCm);
            if (gender) formData.append('gender', gender);
            if (age) formData.append('age', age);

            const response = await BodyAPI.processScan(formData);

            if (response.success) {
                hapticSuccess();
                Toast.show({ type: 'success', text1: '✅ Measurements Extracted!', text2: `${response.metadata?.measurements_extracted || 21}+ measurements analyzed successfully` });
                setResult(response);
            } else {
                Toast.show({ type: 'error', text1: 'Scan Failed', text2: response.error || 'Failed to extract measurements.' });
            }
        } catch (err: any) {
            const message = err.response?.data?.detail || err.message || 'Failed to process body scan';
            Toast.show({ type: 'error', text1: 'Processing Error', text2: message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFrontImage(null);
        setSideImage(null);
        setHeightCm('');
        setGender('');
        setAge('');
        setResult(null);
        setSelectedMeasurement(null);
    };

    const handleSave = async () => {
        if (!saveName.trim()) {
            Toast.show({ type: 'error', text1: 'Name Required', text2: 'Please enter a name for this measurement.' });
            return;
        }
        setIsSaving(true);
        try {
            await BodyAPI.saveMeasurement({ name: saveName.trim(), measurement_data: result });
            Toast.show({ type: 'success', text1: '✅ Saved!', text2: `Measurement saved as "${saveName.trim()}".` });
            setShowSaveModal(false);
            setSaveName('');
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Failed to save measurement.';
            Toast.show({ type: 'error', text1: 'Save Error', text2: msg });
        } finally {
            setIsSaving(false);
        }
    };



    // ── RESULTS SCREEN ──
    if (result && result.measurements) {
        const measurements = result.measurements;
        const entries = Object.entries(measurements).sort((a, b) => b[1] - a[1]);
        const keyMeasurements = KEY_MEASUREMENTS
            .map(config => ({ ...config, value: measurements[config.key] }))
            .filter(item => item.value !== undefined);

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.resultHeader}>
                        <Text style={styles.resultIcon}>✅</Text>
                        <Text style={styles.resultTitle}>Your Measurements</Text>
                        <Text style={styles.resultSubtitle}>
                            {entries.length} measurements extracted
                            {result.metadata?.processing_time
                                ? ` in ${result.metadata.processing_time.toFixed(1)}s`
                                : ''}
                        </Text>
                    </View>

                    {/* ── 3D BODY MODEL (matching website) ── */}
                    <Body3DViewer
                        measurements={measurements}
                        gender={gender}
                        selectedMeasurement={selectedMeasurement}
                        onMeasurementSelect={setSelectedMeasurement}
                    />

                    {/* Key Metrics */}
                    <View style={styles.keyMetricsGrid}>
                        {keyMeasurements.map((item) => (
                            <View
                                key={item.key}
                                style={[styles.keyMetricCard, { borderColor: item.color + '40' }]}
                            >
                                <View style={styles.keyMetricHeader}>
                                    <Text style={styles.keyMetricLabel}>{item.label}</Text>
                                    <View style={[styles.keyMetricIconBg, { backgroundColor: item.color + '20' }]}>
                                        <Text style={styles.keyMetricIcon}>{item.icon}</Text>
                                    </View>
                                </View>
                                <Text style={styles.keyMetricValue}>
                                    {item.value?.toFixed(1)}
                                    <Text style={styles.keyMetricUnit}> cm</Text>
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* All Measurements */}
                    <View style={styles.allMeasurementsCard}>
                        <View style={styles.allMeasurementsHeader}>
                            <Text style={styles.allMeasurementsIcon}>📊</Text>
                            <View>
                                <Text style={styles.allMeasurementsTitle}>All Measurements</Text>
                                <Text style={styles.allMeasurementsCount}>{entries.length} measurements</Text>
                            </View>
                        </View>

                        {entries.map(([name, value]) => (
                            <TouchableOpacity
                                key={name}
                                style={[
                                    styles.measurementRow,
                                    selectedMeasurement === name && styles.measurementRowActive,
                                ]}
                                onPress={() => {
                                    setSelectedMeasurement(selectedMeasurement === name ? null : name);
                                }}
                            >
                                <View style={[
                                    styles.measurementDot,
                                    selectedMeasurement === name && { backgroundColor: '#8B5CF6' },
                                ]} />
                                <Text style={styles.measurementName}>
                                    {name.replace(/_/g, ' ')}
                                </Text>
                                <Text style={styles.measurementValue}>
                                    {value.toFixed(1)} <Text style={styles.measurementUnit}>cm</Text>
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Size Recommendations */}
                    {result.size_recommendations && Object.keys(result.size_recommendations).length > 0 && (
                        <View style={styles.sizeCard}>
                            <Text style={styles.sizeCardTitle}>👕 Size Recommendations</Text>
                            {Object.entries(result.size_recommendations).map(([brand, sizeData]) => {
                                const sizeText = typeof sizeData === 'string'
                                    ? sizeData
                                    : typeof sizeData === 'object' && sizeData !== null
                                        ? (sizeData as any).recommended_size || (sizeData as any).size || JSON.stringify(sizeData)
                                        : String(sizeData);
                                const confidence = typeof sizeData === 'object' && sizeData !== null
                                    ? (sizeData as any).confidence : null;
                                return (
                                    <View key={brand} style={styles.sizeRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.sizeBrand}>{brand.replace(/_/g, ' ')}</Text>
                                            {confidence != null && (
                                                <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                                                    {Math.round(confidence * 100)}% confidence
                                                </Text>
                                            )}
                                        </View>
                                        <View style={styles.sizeBadge}>
                                            <Text style={styles.sizeText}>{sizeText}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.resultActions}>
                        <Button title="💾 Save Measurement" onPress={() => setShowSaveModal(true)} fullWidth />
                        <View style={{ height: 12 }} />
                        <Button title="🔄 New Scan" onPress={handleReset} variant="outline" fullWidth />
                    </View>
                </ScrollView>

                {/* ── SAVE MEASUREMENT MODAL ── */}
                <Modal
                    visible={showSaveModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowSaveModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <View style={styles.modalHeaderIcon}>
                                    <Text style={{ fontSize: 20 }}>💾</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalHeaderTitle}>Save Measurement</Text>
                                    <Text style={styles.modalHeaderSub}>Give this measurement a name</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => { setShowSaveModal(false); setSaveName(''); }}
                                    style={styles.modalCloseBtn}
                                >
                                    <Text style={styles.modalCloseBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Info Box */}
                            <View style={styles.modalInfo}>
                                <Text style={styles.modalInfoText}>
                                    Save your measurements to access them later for clothing fit checks and body tracking.
                                </Text>
                            </View>

                            {/* Name Input */}
                            <View style={styles.modalInputGroup}>
                                <Text style={styles.modalInputLabel}>Measurement Name <Text style={{ color: '#F43F5E' }}>*</Text></Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={saveName}
                                    onChangeText={setSaveName}
                                    placeholder="e.g., My Current Measurements"
                                    placeholderTextColor={Colors.textMuted}
                                    autoFocus
                                    editable={!isSaving}
                                />
                            </View>

                            {/* Measurement Summary */}
                            <View style={styles.modalSummary}>
                                <Text style={styles.modalSummaryTitle}>Summary</Text>
                                <View style={styles.modalSummaryGrid}>
                                    <Text style={styles.modalSummaryItem}>
                                        <Text style={styles.modalSummaryLabel}>Measurements: </Text>
                                        {Object.keys(measurements).length}
                                    </Text>
                                    {result.metadata?.gender && (
                                        <Text style={styles.modalSummaryItem}>
                                            <Text style={styles.modalSummaryLabel}>Gender: </Text>
                                            {result.metadata.gender}
                                        </Text>
                                    )}
                                    {result.metadata?.user_height_cm && (
                                        <Text style={styles.modalSummaryItem}>
                                            <Text style={styles.modalSummaryLabel}>Height: </Text>
                                            {result.metadata.user_height_cm} cm
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Modal Actions */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.modalCancelBtn}
                                    onPress={() => { setShowSaveModal(false); setSaveName(''); }}
                                    disabled={isSaving}
                                >
                                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalSaveBtn, (!saveName.trim() || isSaving) && { opacity: 0.5 }]}
                                    onPress={handleSave}
                                    disabled={!saveName.trim() || isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text style={styles.modalSaveBtnText}>💾 Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        );
    }

    // ── LOADING SCREEN ──
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingTitle}>Analyzing Your Photos...</Text>
                    <Text style={styles.loadingSubtitle}>
                        Our AI is extracting your body measurements.{'\n'}
                        This may take up to a minute.
                    </Text>
                    <View style={styles.loadingSteps}>
                        <Text style={styles.loadingStep}>✅ Photos uploaded</Text>
                        <Text style={styles.loadingStep}>⏳ Detecting body landmarks...</Text>
                        <Text style={styles.loadingStepPending}>⬜ Calculating measurements</Text>
                        <Text style={styles.loadingStepPending}>⬜ Generating size recommendations</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // ── FORM SCREEN (matching website) ──
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>📸</Text>
                        <Text style={styles.headerTitle}>Body Scan</Text>
                        <Text style={styles.headerSubtitle}>
                            Upload your photos and enter your details to get accurate body measurements
                        </Text>
                    </View>

                    {/* Photo Upload Section */}
                    <View style={styles.photosSection}>
                        {/* Front Photo */}
                        <TouchableOpacity
                            style={[styles.photoCard, frontImage && styles.photoCardFilled]}
                            onPress={() => pickImage('front')}
                        >
                            {frontImage ? (
                                <>
                                    <Image source={{ uri: frontImage }} style={styles.photoPreview} />
                                    <View style={styles.photoOverlay}>
                                        <Text style={styles.photoOverlayText}>📷 Change</Text>
                                    </View>
                                    <View style={styles.photoCheckmark}>
                                        <Text style={styles.photoCheckmarkText}>✓</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Text style={styles.photoPlaceholderIcon}>🧍</Text>
                                    <Text style={styles.photoPlaceholderTitle}>Front View</Text>
                                    <Text style={styles.photoPlaceholderHint}>Required *</Text>
                                    <Text style={styles.photoPlaceholderAction}>Tap to add</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Side Photo */}
                        <TouchableOpacity
                            style={[styles.photoCard, sideImage && styles.photoCardFilled]}
                            onPress={() => pickImage('side')}
                        >
                            {sideImage ? (
                                <>
                                    <Image source={{ uri: sideImage }} style={styles.photoPreview} />
                                    <View style={styles.photoOverlay}>
                                        <Text style={styles.photoOverlayText}>📷 Change</Text>
                                    </View>
                                    <View style={styles.photoCheckmark}>
                                        <Text style={styles.photoCheckmarkText}>✓</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Text style={styles.photoPlaceholderIcon}>🧍‍♂️</Text>
                                    <Text style={styles.photoPlaceholderTitle}>Side View</Text>
                                    <Text style={styles.photoPlaceholderHint}>Optional</Text>
                                    <Text style={styles.photoPlaceholderAction}>Tap to add</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Personal Information Section */}
                    <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Personal Information</Text>

                        {/* Height */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Height (cm) <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={heightCm}
                                onChangeText={setHeightCm}
                                placeholder="e.g., 175"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Gender */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Gender</Text>
                            <View style={styles.genderRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.genderButton,
                                        gender === 'male' && styles.genderButtonActive,
                                    ]}
                                    onPress={() => setGender(gender === 'male' ? '' : 'male')}
                                >
                                    <Text style={[
                                        styles.genderButtonText,
                                        gender === 'male' && styles.genderButtonTextActive,
                                    ]}>♂ Male</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.genderButton,
                                        gender === 'female' && styles.genderButtonActive,
                                    ]}
                                    onPress={() => setGender(gender === 'female' ? '' : 'female')}
                                >
                                    <Text style={[
                                        styles.genderButtonText,
                                        gender === 'female' && styles.genderButtonTextActive,
                                    ]}>♀ Female</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Age */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Age (years)</Text>
                            <TextInput
                                style={styles.input}
                                value={age}
                                onChangeText={setAge}
                                placeholder="e.g., 25"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Tips Section */}
                    <View style={styles.tipsSection}>
                        <View style={styles.tipsHeader}>
                            <Text style={styles.tipsIcon}>💡</Text>
                            <Text style={styles.tipsTitle}>Tips for best results</Text>
                        </View>
                        <View style={styles.tipsList}>
                            {[
                                'Take photos with good lighting and clear visibility',
                                'Wear fitted clothing to show body shape',
                                'Stand straight with arms at sides',
                                'Front view should show full body from head to feet',
                            ].map((tip, i) => (
                                <View key={i} style={styles.tipRow}>
                                    <View style={styles.tipDot} />
                                    <Text style={styles.tipText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, (!frontImage || !heightCm) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!frontImage || !heightCm || isLoading}
                    >
                        <Text style={styles.submitButtonIcon}>✨</Text>
                        <Text style={styles.submitButtonText}>Get Measurements</Text>
                        <Text style={styles.submitButtonArrow}>→</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Upgrade Modal (subscription limit) */}
            <Modal
                visible={showUpgradeModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowUpgradeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.upgradeModal}>
                        <Text style={styles.upgradeEmoji}>🔒</Text>
                        <Text style={styles.upgradeTitle}>Free Scan Limit Reached</Text>
                        <Text style={styles.upgradeMessage}>
                            {upgradeInfo?.message || 'You have used all your free scans this month.'}
                        </Text>
                        <View style={styles.upgradeUsageRow}>
                            <Text style={styles.upgradeUsageLabel}>Scans used</Text>
                            <Text style={styles.upgradeUsageValue}>
                                {upgradeInfo?.current || 0} / {upgradeInfo?.limit || 3}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.upgradeButton}
                            onPress={() => {
                                setShowUpgradeModal(false);
                                navigation.navigate('Pricing');
                            }}
                        >
                            <LinearGradient
                                colors={['#7C3AED', '#EC4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.upgradeButtonGradient}
                            >
                                <Text style={styles.upgradeButtonText}>✨ Upgrade to Pro</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowUpgradeModal(false)}
                            style={styles.upgradeDismiss}
                        >
                            <Text style={styles.upgradeDismissText}>Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },

    // ── Header ──
    header: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    headerIcon: {
        fontSize: 48,
        marginBottom: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },

    // ── Photos Section ──
    photosSection: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    photoCard: {
        flex: 1,
        height: 200,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        backgroundColor: Colors.surface,
        overflow: 'hidden',
    },
    photoCardFilled: {
        borderStyle: 'solid',
        borderColor: Colors.primary,
    },
    photoPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: Spacing.xs,
        alignItems: 'center',
    },
    photoOverlayText: {
        color: 'white',
        fontSize: FontSize.xs,
    },
    photoCheckmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoCheckmarkText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    photoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.md,
    },
    photoPlaceholderIcon: {
        fontSize: 40,
        marginBottom: Spacing.xs,
    },
    photoPlaceholderTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    photoPlaceholderHint: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        marginBottom: Spacing.xs,
    },
    photoPlaceholderAction: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },

    // ── Form Section ──
    formSection: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
    },
    formSectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    required: {
        color: '#F43F5E',
    },
    input: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text,
    },
    genderRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    genderButton: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    genderButtonActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '15',
    },
    genderButtonText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    genderButtonTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },

    // ── Tips Section ──
    tipsSection: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    tipsIcon: {
        fontSize: 20,
    },
    tipsTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
    },
    tipsList: {
        gap: Spacing.sm,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    tipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginTop: 6,
    },
    tipText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },

    // ── Submit Button ──
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md + 2,
        borderRadius: BorderRadius.lg,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonIcon: {
        fontSize: 20,
    },
    submitButtonText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    submitButtonArrow: {
        fontSize: FontSize.md,
        color: Colors.text,
    },

    // ── Loading ──
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingTitle: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    loadingSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        lineHeight: 20,
    },
    loadingSteps: {
        gap: Spacing.sm,
        alignSelf: 'stretch',
        paddingHorizontal: Spacing.lg,
    },
    loadingStep: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    loadingStepPending: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },

    // ── Results ──
    resultHeader: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    resultIcon: {
        fontSize: 48,
        marginBottom: Spacing.sm,
    },
    resultTitle: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    resultSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },

    // Key Metrics
    keyMetricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    keyMetricCard: {
        width: (width - Spacing.lg * 2 - Spacing.md) / 2,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
    },
    keyMetricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    keyMetricLabel: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    keyMetricIconBg: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyMetricIcon: {
        fontSize: 14,
    },
    keyMetricValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
    },
    keyMetricUnit: {
        fontSize: FontSize.sm,
        fontWeight: 'normal',
        color: Colors.textMuted,
    },

    // All Measurements
    allMeasurementsCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
    },
    allMeasurementsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    allMeasurementsIcon: {
        fontSize: 24,
    },
    allMeasurementsTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.text,
    },
    allMeasurementsCount: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    measurementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    measurementDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginRight: Spacing.sm,
    },
    measurementName: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textTransform: 'capitalize',
    },
    measurementValue: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.text,
    },
    measurementUnit: {
        fontSize: FontSize.xs,
        fontWeight: 'normal',
        color: Colors.textMuted,
    },

    // Size Recommendations
    sizeCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
    },
    sizeCardTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    sizeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    sizeBrand: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textTransform: 'capitalize',
    },
    sizeConfidence: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    sizeBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    sizeText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.primary,
    },

    // Result Actions
    resultActions: {
        marginTop: Spacing.md,
    },

    // ── Body Model ──
    bodyModelCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
    },
    bodyModelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    bodyModelTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.text,
    },
    bodyModelContent: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    svgContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    bodyMeasurementsList: {
        flex: 1,
        gap: Spacing.xs,
    },
    bodyMeasurementsListTitle: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    bodyMeasurementBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    bodyMeasurementBtnActive: {
        backgroundColor: Colors.primary + '15',
        borderColor: Colors.primary,
    },
    bodyMeasurementLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    bodyMeasurementLabelActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    bodyMeasurementVal: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.text,
    },
    bodyMeasurementValActive: {
        color: Colors.primary,
    },
    bodyModelTip: {
        marginTop: Spacing.md,
        backgroundColor: Colors.background,
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    bodyModelTipText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        textAlign: 'center',
    },

    // Active measurement row
    measurementRowActive: {
        backgroundColor: Colors.primary + '10',
        borderRadius: BorderRadius.sm,
    },

    // ── Save Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15,15,35,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.lg,
        backgroundColor: Colors.primary,
    },
    modalHeaderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeaderTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    modalHeaderSub: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.8)',
    },
    modalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    modalInfo: {
        margin: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: Colors.primary + '10',
        borderRadius: BorderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    modalInfoText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    modalInputGroup: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    modalInputLabel: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    modalInput: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    modalSummary: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalSummaryTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    modalSummaryGrid: {
        gap: Spacing.xs,
    },
    modalSummaryItem: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    modalSummaryLabel: {
        fontWeight: '600',
        color: Colors.text,
    },
    modalActions: {
        flexDirection: 'row',
        padding: Spacing.lg,
        gap: Spacing.sm,
        backgroundColor: Colors.background,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    modalCancelBtnText: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    modalSaveBtn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSaveBtnText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Upgrade Modal
    upgradeModal: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        marginHorizontal: 24,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    upgradeEmoji: { fontSize: 40, marginBottom: 12 },
    upgradeTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 8, textAlign: 'center' },
    upgradeMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
    upgradeUsageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: Colors.background,
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    upgradeUsageLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
    upgradeUsageValue: { fontSize: FontSize.sm, fontWeight: '700', color: '#EF4444' },
    upgradeButton: { width: '100%', borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
    upgradeButtonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
    upgradeButtonText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
    upgradeDismiss: { paddingVertical: 8 },
    upgradeDismissText: { fontSize: FontSize.sm, color: Colors.textMuted },
});

export default BodyScanScreen;
