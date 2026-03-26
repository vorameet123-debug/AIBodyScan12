/**
 * Saved Measurements Screen
 * Full website parity: styled confirm modal, toast notifications, card animations
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { BodyAPI } from '../../services/api';

// Matches website's SavedMeasurement interface
interface SavedMeasurement {
    id: number;
    name: string;
    measurements: { [key: string]: number };
    size_recommendations?: { [key: string]: string };
    metadata?: Record<string, unknown>;
    created_at: string;
}

export const SavedMeasurementsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Confirm modal state
    const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

    // Animation refs for staggered card entrance
    const animValues = useRef<Map<number, Animated.Value>>(new Map()).current;
    const getAnimValue = (id: number, index: number) => {
        if (!animValues.has(id)) {
            const val = new Animated.Value(0);
            animValues.set(id, val);
            Animated.timing(val, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }).start();
        }
        return animValues.get(id)!;
    };

    const fetchMeasurements = async () => {
        try {
            const data = await BodyAPI.getHistory(30);
            const list = data.measurements || data || [];
            setMeasurements(list);
            setError(null);
            // Reset animation cache for fresh data
            animValues.clear();
        } catch (err: any) {
            // Error handled by state — shows error UI
            setError('Failed to load measurements');
            Toast.show({ type: 'error', text1: 'Load Error', text2: 'Failed to load measurements' });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMeasurements();
    }, []);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchMeasurements();
    }, []);

    // Show styled confirm modal (like website's ConfirmModal)
    const handleDelete = (id: number, name: string) => {
        setConfirmDelete({ id, name });
    };

    // Actually perform the delete
    const confirmDeleteAction = async () => {
        if (!confirmDelete) return;
        const { id, name } = confirmDelete;
        setConfirmDelete(null);
        setDeletingId(id);
        try {
            await BodyAPI.deleteMeasurement(id);
            // Animate removal
            const val = animValues.get(id);
            if (val) {
                Animated.timing(val, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
                    setMeasurements(prev => prev.filter(m => m.id !== id));
                    animValues.delete(id);
                });
            } else {
                setMeasurements(prev => prev.filter(m => m.id !== id));
            }
            Toast.show({ type: 'success', text1: '✅ Deleted', text2: `"${name}" removed successfully.` });
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Delete Failed', text2: 'Could not delete measurement.' });
        } finally {
            setDeletingId(null);
        }
    };

    const handleViewDetails = async (measurement: SavedMeasurement) => {
        try {
            navigation.navigate('Tabs', { screen: 'Scan', params: { measurementId: measurement.id } });
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load measurement details' });
            console.error('Error loading measurement:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderMeasurementCard = ({ item, index }: { item: SavedMeasurement; index: number }) => {
        const measurementKeys = Object.keys(item.measurements || {});
        const measurementCount = measurementKeys.length;
        const sizeCount = Object.keys(item.size_recommendations || {}).length;
        const previewMeasurements = Object.entries(item.measurements || {}).slice(0, 3);
        const moreCount = measurementCount - 3;
        const anim = getAnimValue(item.id, index);

        return (
            <Animated.View style={[
                styles.card,
                {
                    opacity: anim,
                    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                },
            ]}>
                {/* Header: Name + Delete */}
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardName} numberOfLines={1}>
                            {item.name || `Measurement #${item.id}`}
                        </Text>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateIcon}>📅</Text>
                            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item.id, item.name)}
                        disabled={deletingId === item.id}
                    >
                        {deletingId === item.id ? (
                            <ActivityIndicator size="small" color={Colors.error} />
                        ) : (
                            <Text style={styles.deleteBtnText}>🗑️</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statIcon}>📊</Text>
                        <Text style={styles.statLabel}>Measurements</Text>
                        <Text style={styles.statValue}>{measurementCount}</Text>
                    </View>
                    {sizeCount > 0 && (
                        <View style={styles.statBox}>
                            <Text style={styles.statIcon}>👤</Text>
                            <Text style={styles.statLabel}>Sizes</Text>
                            <Text style={styles.statValue}>{sizeCount}</Text>
                        </View>
                    )}
                </View>

                {/* Key Measurements Preview */}
                {measurementCount > 0 && (
                    <View style={styles.tagsSection}>
                        <Text style={styles.tagsLabel}>Key Measurements:</Text>
                        <View style={styles.tagsRow}>
                            {previewMeasurements.map(([key, value]) => (
                                <View key={key} style={styles.tag}>
                                    <Text style={styles.tagText}>
                                        {key.replace(/_/g, ' ').substring(0, 15)}: {typeof value === 'number' ? value.toFixed(1) : value}cm
                                    </Text>
                                </View>
                            ))}
                            {moreCount > 0 && (
                                <View style={styles.tagMore}>
                                    <Text style={styles.tagMoreText}>+{moreCount} more</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* View Details Button */}
                <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => handleViewDetails(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.viewBtnIcon}>👁️</Text>
                    <Text style={styles.viewBtnText}>View Details</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Loading State
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading saved measurements...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconBox}>
                        <Text style={{ fontSize: 20 }}>💾</Text>
                    </View>
                    <View>
                        <Text style={styles.title}>Saved Measurements</Text>
                        <Text style={styles.subtitle}>
                            {measurements.length} measurement{measurements.length !== 1 ? 's' : ''} saved
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                    <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
                </TouchableOpacity>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchMeasurements}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : measurements.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBox}>
                        <Text style={{ fontSize: 40 }}>📏</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Saved Measurements</Text>
                    <Text style={styles.emptySubtitle}>
                        Save your measurements after processing to access them here later.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={measurements}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderMeasurementCard}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* ── Styled Confirm Delete Modal (matches website ConfirmModal) ── */}
            <Modal
                visible={!!confirmDelete}
                transparent
                animationType="fade"
                onRequestClose={() => setConfirmDelete(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <View style={styles.confirmIconWrap}>
                            <Text style={styles.confirmIcon}>🗑️</Text>
                        </View>
                        <Text style={styles.confirmTitle}>Delete Measurement</Text>
                        <Text style={styles.confirmMessage}>
                            Are you sure you want to delete "{confirmDelete?.name}"? This action cannot be undone.
                        </Text>
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity
                                style={styles.confirmCancelBtn}
                                onPress={() => setConfirmDelete(null)}
                            >
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmDeleteBtn}
                                onPress={confirmDeleteAction}
                            >
                                <LinearGradient
                                    colors={['#EF4444', '#DC2626']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.confirmDeleteGradient}
                                >
                                    <Text style={styles.confirmDeleteText}>🗑️ Delete</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
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

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Colors.textSecondary,
        marginTop: Spacing.md,
        fontSize: FontSize.sm,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    headerIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    subtitle: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    refreshBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
    },
    refreshBtnText: {
        fontSize: FontSize.sm,
        color: Colors.text,
        fontWeight: '500',
    },

    // List
    list: {
        padding: Spacing.lg,
        paddingTop: 0,
    },

    // Card (matching website's card design)
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    cardName: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateIcon: {
        fontSize: 12,
    },
    dateText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    deleteBtn: {
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    deleteBtnText: {
        fontSize: 18,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statIcon: {
        fontSize: 14,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '500',
        marginBottom: 2,
    },
    statValue: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },

    // Tag Pills (matching website's key measurement preview)
    tagsSection: {
        marginBottom: Spacing.md,
    },
    tagsLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '500',
        marginBottom: Spacing.xs,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    tag: {
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    tagText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '500',
    },
    tagMore: {
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tagMoreText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },

    // View Details Button
    viewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
    },
    viewBtnIcon: {
        fontSize: 14,
    },
    viewBtnText: {
        color: '#fff',
        fontSize: FontSize.sm,
        fontWeight: '600',
    },

    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorIcon: {
        fontSize: 40,
        marginBottom: Spacing.md,
    },
    errorText: {
        color: Colors.error,
        fontSize: FontSize.md,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    retryBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: FontSize.sm,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyIconBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },

    // Confirm Delete Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmModal: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 28,
        marginHorizontal: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        width: '85%',
    },
    confirmIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EF444415',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    confirmIcon: { fontSize: 24 },
    confirmTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    confirmMessage: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    confirmCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.background,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    confirmCancelText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    confirmDeleteBtn: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    confirmDeleteGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
    },
    confirmDeleteText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: '#fff',
    },
});

export default SavedMeasurementsScreen;
