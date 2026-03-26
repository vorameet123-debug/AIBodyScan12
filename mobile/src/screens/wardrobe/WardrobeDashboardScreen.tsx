/**
 * Wardrobe Dashboard Screen
 * Full 4-tab system matching website: Overview, My Items, Colors, Activity
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Alert,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { WardrobeAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = (screenWidth - Spacing.lg * 3) / 2;

// ──── Types ────
type TabId = 'overview' | 'items' | 'colors' | 'activity';
type ViewMode = 'grid' | 'list';
type Category = 'all' | 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'accessories';

interface WardrobeItem {
    id: number;
    name: string;
    category: string;
    color: string;
    brand?: string;
    image_url?: string;
    created_at: string;
    analysis?: { color_analysis?: any; style?: string; occasion?: string[] };
}

interface ColorInfo {
    name: string;
    hex: string;
    count: number;
    percentage: number;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'items', label: 'My Items', icon: '👔' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'activity', label: 'Activity', icon: '📅' },
];

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '🗂️' },
    { id: 'tops', label: 'Tops', icon: '👕' },
    { id: 'bottoms', label: 'Bottoms', icon: '👖' },
    { id: 'dresses', label: 'Dresses', icon: '👗' },
    { id: 'outerwear', label: 'Outerwear', icon: '🧥' },
    { id: 'accessories', label: 'Accessories', icon: '👜' },
];

const COLOR_MAP: Record<string, string> = {
    black: '#171717', white: '#F8FAFC', red: '#EF4444', blue: '#3B82F6',
    navy: '#1E3A8A', green: '#22C55E', yellow: '#FACC15', orange: '#F97316',
    purple: '#A855F7', pink: '#EC4899', brown: '#78350F', gray: '#6B7280',
    grey: '#6B7280', beige: '#F5F5DC', cream: '#FEF3C7', teal: '#14B8A6',
    burgundy: '#7F1D1D', olive: '#65A30D', gold: '#CA8A04', unknown: '#94A3B8',
};

const MOCK_ITEMS: WardrobeItem[] = [
    { id: 1, name: 'Blue Oxford Shirt', category: 'tops', color: '#3B82F6', brand: 'Uniqlo', created_at: '2024-01-15', analysis: { style: 'Casual', occasion: ['Work', 'Casual'] } },
    { id: 2, name: 'Black Chinos', category: 'bottoms', color: '#1F2937', brand: 'Zara', created_at: '2024-01-10', analysis: { style: 'Smart Casual', occasion: ['Work', 'Dinner'] } },
    { id: 3, name: 'White Sneakers', category: 'accessories', color: '#FFFFFF', brand: 'Nike', created_at: '2024-01-05', analysis: { style: 'Sporty', occasion: ['Casual', 'Sport'] } },
    { id: 4, name: 'Navy Blazer', category: 'outerwear', color: '#1E3A5F', brand: 'H&M', created_at: '2024-01-01', analysis: { style: 'Formal', occasion: ['Work', 'Formal'] } },
    { id: 5, name: 'Floral Dress', category: 'dresses', color: '#EC4899', brand: 'Zara', created_at: '2023-12-25', analysis: { style: 'Feminine', occasion: ['Party', 'Date'] } },
    { id: 6, name: 'Gray T-Shirt', category: 'tops', color: '#6B7280', brand: 'Uniqlo', created_at: '2023-12-20', analysis: { style: 'Casual', occasion: ['Casual', 'Home'] } },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export const WardrobeDashboardScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { user } = useAuthStore();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [itemsRes, analyticsRes] = await Promise.all([
                WardrobeAPI.getItems().catch(() => null),
                WardrobeAPI.getAnalytics(user?.id || 1, 'all').catch(() => null),
            ]);
            setItems(itemsRes?.items || itemsRes || []);
            setAnalyticsData(analyticsRes?.data || analyticsRes || null);
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => { setIsRefreshing(true); loadData(); }, []);

    const filteredItems = selectedCategory === 'all'
        ? items
        : items.filter(i => i.category === selectedCategory);

    // ── Color data from analytics ──
    const getColorData = (): ColorInfo[] => {
        if (!analyticsData?.colors?.distribution) return [];
        const dist = analyticsData.colors.distribution;
        const pct = analyticsData.colors.percentages || {};
        return Object.entries(dist)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([name, count]) => ({
                name,
                hex: COLOR_MAP[name.toLowerCase()] || '#94A3B8',
                count: count as number,
                percentage: pct[name] || 0,
            }));
    };

    // ── Activity data from analytics ──
    const getActivityData = () => {
        if (!analyticsData?.fit_history) return [];
        return (analyticsData.fit_history as any[]).slice(0, 20);
    };

    // ── Add item ──
    const handleAddItem = () => {
        Alert.alert('Add Item', 'Choose how to add a new item', [
            { text: 'Take Photo', onPress: () => pickImage('camera') },
            { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const pickImage = async (source: 'camera' | 'gallery') => {
        try {
            let result;
            if (source === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') { Toast.show({ type: 'error', text1: 'Permission needed' }); return; }
                result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
            }
            if (!result.canceled && result.assets[0]) uploadItem(result.assets[0].uri);
        } catch { }
    };

    const uploadItem = async (imageUri: string) => {
        try {
            const formData = new FormData();
            formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'wardrobe_item.jpg' } as any);
            const newItem = await WardrobeAPI.addItem(formData);
            setItems(prev => [newItem, ...prev]);
            Toast.show({ type: 'success', text1: '✅ Item Added', text2: 'Item added to wardrobe!' });
        } catch {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add item.' });
        }
    };

    const handleDeleteItem = (itemId: number) => {
        Alert.alert('Delete Item', 'Remove this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    setItems(prev => prev.filter(i => i.id !== itemId));
                    setIsModalVisible(false);
                    Toast.show({ type: 'success', text1: '✅ Removed', text2: 'Item removed from wardrobe.' });
                },
            },
        ]);
    };

    // ════════ RENDER ════════
    if (isLoading) {
        return (
            <SafeAreaView style={s.container}>
                <View style={s.loadingWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={s.loadingText}>Loading wardrobe...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.container}>
            {/* ── Header ── */}
            <View style={s.header}>
                <View>
                    <Text style={s.title}>My Wardrobe</Text>
                    <Text style={s.subtitle}>{items.length} items • {Object.keys(analyticsData?.colors?.distribution || {}).length} colors</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={handleAddItem}>
                    <LinearGradient colors={['#7C3AED', '#EC4899']} style={s.addBtnGradient}>
                        <Text style={s.addBtnText}>+ Add</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* ── Tab Bar ── */}
            <View style={s.tabBar}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[s.tab, activeTab === tab.id && s.tabActive]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={s.tabIcon}>{tab.icon}</Text>
                        <Text style={[s.tabLabel, activeTab === tab.id && s.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Tab Content ── */}
            {activeTab === 'overview' && (
                <ScrollView style={s.tabContent} showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                >
                    {/* Quick Stats */}
                    <View style={s.statsGrid}>
                        {[
                            { icon: '📦', label: 'Total Items', value: items.length, color: '#7C3AED' },
                            { icon: '🎨', label: 'Colors', value: Object.keys(analyticsData?.colors?.distribution || {}).length, color: '#EC4899' },
                            { icon: '👕', label: 'Categories', value: new Set(items.map(i => i.category)).size, color: '#3B82F6' },
                            { icon: '⭐', label: 'Brands', value: new Set(items.filter(i => i.brand).map(i => i.brand)).size, color: '#10B981' },
                        ].map((stat, i) => (
                            <View key={i} style={s.statCard}>
                                <View style={[s.statIconWrap, { backgroundColor: stat.color + '15' }]}>
                                    <Text style={s.statIconText}>{stat.icon}</Text>
                                </View>
                                <Text style={s.statValue}>{stat.value}</Text>
                                <Text style={s.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Category Breakdown */}
                    <Text style={s.sectionTitle}>Category Breakdown</Text>
                    <View style={s.categoryBreakdown}>
                        {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                            const count = items.filter(i => i.category === cat.id).length;
                            const pct = items.length ? Math.round((count / items.length) * 100) : 0;
                            return (
                                <View key={cat.id} style={s.catRow}>
                                    <View style={s.catLeft}>
                                        <Text style={s.catIcon}>{cat.icon}</Text>
                                        <Text style={s.catName}>{cat.label}</Text>
                                    </View>
                                    <View style={s.catBarWrap}>
                                        <View style={[s.catBar, { width: `${Math.max(pct, 2)}%` }]} />
                                    </View>
                                    <Text style={s.catCount}>{count}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Recent Items */}
                    <Text style={s.sectionTitle}>Recent Items</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recentScroll}>
                        {items.slice(0, 5).map(item => (
                            <TouchableOpacity key={item.id} style={s.recentCard} onPress={() => { setSelectedItem(item); setIsModalVisible(true); }}>
                                <View style={[s.recentColor, { backgroundColor: item.color + '30' }]}>
                                    <View style={[s.recentSwatch, { backgroundColor: item.color }]} />
                                </View>
                                <Text style={s.recentName} numberOfLines={1}>{item.name}</Text>
                                <Text style={s.recentBrand} numberOfLines={1}>{item.brand || 'Unknown'}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            {activeTab === 'items' && (
                <View style={{ flex: 1 }}>
                    {/* Category Filter + View Toggle */}
                    <View style={s.itemsToolbar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[s.catChip, selectedCategory === cat.id && s.catChipActive]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                >
                                    <Text style={s.catChipIcon}>{cat.icon}</Text>
                                    <Text style={[s.catChipText, selectedCategory === cat.id && s.catChipTextActive]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={s.viewToggles}>
                            <TouchableOpacity style={[s.viewBtn, viewMode === 'grid' && s.viewBtnActive]} onPress={() => setViewMode('grid')}>
                                <Text style={s.viewBtnText}>▦</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.viewBtn, viewMode === 'list' && s.viewBtnActive]} onPress={() => setViewMode('list')}>
                                <Text style={s.viewBtnText}>☰</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {filteredItems.length === 0 ? (
                        <View style={s.emptyWrap}>
                            <Text style={{ fontSize: 48 }}>👔</Text>
                            <Text style={s.emptyTitle}>No items</Text>
                            <Text style={s.emptyDesc}>Add items to see them here</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredItems}
                            keyExtractor={i => i.id.toString()}
                            numColumns={viewMode === 'grid' ? 2 : 1}
                            key={viewMode}
                            contentContainerStyle={s.itemsList}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                            renderItem={({ item }) => viewMode === 'grid' ? (
                                <TouchableOpacity style={s.gridItem} onPress={() => { setSelectedItem(item); setIsModalVisible(true); }} activeOpacity={0.7}>
                                    <View style={[s.gridItemImg, { backgroundColor: item.color + '30' }]}>
                                        {item.image_url ? <Image source={{ uri: item.image_url }} style={s.gridImage} /> : <View style={[s.gridSwatch, { backgroundColor: item.color }]} />}
                                    </View>
                                    <Text style={s.gridName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={s.gridBrand} numberOfLines={1}>{item.brand || 'Unknown'}</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={s.listItem} onPress={() => { setSelectedItem(item); setIsModalVisible(true); }} activeOpacity={0.7}>
                                    <View style={[s.listImg, { backgroundColor: item.color + '30' }]}>
                                        {item.image_url ? <Image source={{ uri: item.image_url }} style={s.listImage} /> : <View style={[s.listSwatch, { backgroundColor: item.color }]} />}
                                    </View>
                                    <View style={s.listInfo}>
                                        <Text style={s.listName}>{item.name}</Text>
                                        <Text style={s.listBrand}>{item.brand || 'Unknown'}</Text>
                                        <View style={s.listTags}>
                                            <View style={s.tagPill}><Text style={s.tagPillText}>{item.category}</Text></View>
                                            {item.analysis?.style && <View style={[s.tagPill, { backgroundColor: Colors.primary + '15' }]}><Text style={[s.tagPillText, { color: Colors.primary }]}>{item.analysis.style}</Text></View>}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}

            {activeTab === 'colors' && (
                <ScrollView style={s.tabContent} showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                >
                    <Text style={s.sectionTitle}>🎨 Color Palette</Text>
                    {(() => {
                        const colors = getColorData();
                        if (colors.length === 0) {
                            // Derive from items
                            const colorCounts: Record<string, number> = {};
                            items.forEach(i => { const c = i.color || 'unknown'; colorCounts[c] = (colorCounts[c] || 0) + 1; });
                            return (
                                <View>
                                    <View style={s.colorGrid}>
                                        {items.slice(0, 12).map((item, i) => (
                                            <View key={i} style={s.colorCard}>
                                                <View style={[s.colorCircle, { backgroundColor: item.color }]} />
                                                <Text style={s.colorName} numberOfLines={1}>{item.name}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={s.colorTip}>
                                        <Text style={s.colorTipIcon}>💡</Text>
                                        <Text style={s.colorTipText}>Add more items to see detailed color analytics</Text>
                                    </View>
                                </View>
                            );
                        }
                        const totalItems = colors.reduce((a, c) => a + c.count, 0);
                        return (
                            <View>
                                {/* Visual color bar */}
                                <View style={s.colorBarWrap}>
                                    {colors.slice(0, 8).map((c, i) => (
                                        <View key={i} style={[s.colorBarSegment, { backgroundColor: c.hex, flex: c.count }]} />
                                    ))}
                                </View>

                                {/* Color list */}
                                {colors.map((c, i) => (
                                    <View key={i} style={s.colorRow}>
                                        <View style={[s.colorDot, { backgroundColor: c.hex }]} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.colorRowName}>{c.name}</Text>
                                            <View style={s.colorProgressWrap}>
                                                <View style={[s.colorProgress, { width: `${c.percentage}%`, backgroundColor: c.hex }]} />
                                            </View>
                                        </View>
                                        <View style={s.colorStats}>
                                            <Text style={s.colorCount}>{c.count}</Text>
                                            <Text style={s.colorPct}>{c.percentage.toFixed(0)}%</Text>
                                        </View>
                                    </View>
                                ))}

                                {/* Summary */}
                                <View style={s.colorSummary}>
                                    <View style={s.colorSummaryItem}>
                                        <Text style={s.colorSummaryValue}>{colors.length}</Text>
                                        <Text style={s.colorSummaryLabel}>Unique Colors</Text>
                                    </View>
                                    <View style={s.colorSummaryItem}>
                                        <Text style={s.colorSummaryValue}>{totalItems}</Text>
                                        <Text style={s.colorSummaryLabel}>Total Items</Text>
                                    </View>
                                    <View style={s.colorSummaryItem}>
                                        <Text style={s.colorSummaryValue}>{colors[0]?.name || '-'}</Text>
                                        <Text style={s.colorSummaryLabel}>Most Worn</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })()}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            {activeTab === 'activity' && (
                <ScrollView style={s.tabContent} showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                >
                    <Text style={s.sectionTitle}>📅 Activity History</Text>
                    {(() => {
                        const activities = getActivityData();
                        if (activities.length === 0) {
                            // Show item addition history
                            const sortedItems = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                            return (
                                <View>
                                    {sortedItems.map((item, i) => (
                                        <View key={i} style={s.activityCard}>
                                            <View style={[s.activityDot, { backgroundColor: '#10B981' }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.activityTitle}>Added "{item.name}"</Text>
                                                <Text style={s.activitySub}>{item.category} • {item.brand || 'Unknown brand'}</Text>
                                            </View>
                                            <Text style={s.activityDate}>
                                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </Text>
                                        </View>
                                    ))}
                                    {sortedItems.length === 0 && (
                                        <View style={s.emptyWrap}>
                                            <Text style={{ fontSize: 48 }}>📅</Text>
                                            <Text style={s.emptyTitle}>No activity yet</Text>
                                            <Text style={s.emptyDesc}>Your wardrobe activity will appear here</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        }
                        return (
                            <View>
                                {activities.map((act: any, i: number) => (
                                    <View key={i} style={s.activityCard}>
                                        <View style={[s.activityDot, {
                                            backgroundColor: act.purchased ? '#10B981' : act.score >= 70 ? '#3B82F6' : '#EF4444'
                                        }]} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.activityTitle}>{act.garment || act.item || 'Unknown item'}</Text>
                                            <Text style={s.activitySub}>
                                                {act.purchased ? '✅ Purchased' : `Score: ${act.score || 0}/100`}
                                                {act.size ? ` • Size ${act.size}` : ''}
                                            </Text>
                                        </View>
                                        <Text style={s.activityDate}>
                                            {act.date ? new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        );
                    })()}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            {/* ── FAB (Items tab only) ── */}
            {activeTab === 'items' && (
                <TouchableOpacity style={s.fab} onPress={handleAddItem}>
                    <LinearGradient colors={['#7C3AED', '#EC4899']} style={s.fabGradient}>
                        <Text style={s.fabText}>+</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* ── Item Details Modal ── */}
            <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsModalVisible(false)}>
                <SafeAreaView style={s.modalContainer}>
                    <View style={s.modalHeader}>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                            <Text style={s.modalClose}>✕</Text>
                        </TouchableOpacity>
                        <Text style={s.modalTitle}>Item Details</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    {selectedItem && (
                        <ScrollView style={s.modalBody}>
                            <View style={[s.modalImage, { backgroundColor: selectedItem.color + '30' }]}>
                                {selectedItem.image_url ? (
                                    <Image source={{ uri: selectedItem.image_url }} style={s.modalItemImage} />
                                ) : (
                                    <View style={[s.modalSwatch, { backgroundColor: selectedItem.color }]} />
                                )}
                            </View>
                            <Text style={s.modalItemName}>{selectedItem.name}</Text>
                            <Text style={s.modalItemBrand}>{selectedItem.brand || 'Unknown'}</Text>
                            <View style={s.modalDetails}>
                                {[
                                    { label: 'Category', value: selectedItem.category },
                                    { label: 'Color', value: selectedItem.color, isColor: true },
                                    selectedItem.analysis?.style ? { label: 'Style', value: selectedItem.analysis.style } : null,
                                    selectedItem.analysis?.occasion ? { label: 'Occasions', value: selectedItem.analysis.occasion.join(', ') } : null,
                                ].filter(Boolean).map((row: any, i) => (
                                    <View key={i} style={s.modalRow}>
                                        <Text style={s.modalLabel}>{row.label}</Text>
                                        {row.isColor ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <View style={[s.modalColorDot, { backgroundColor: row.value }]} />
                                                <Text style={s.modalValue}>{row.value}</Text>
                                            </View>
                                        ) : (
                                            <Text style={s.modalValue}>{row.value}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                            <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteItem(selectedItem.id)}>
                                <Text style={s.deleteBtnText}>🗑️ Remove Item</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

// ════════════════════════════════════════
// STYLES
// ════════════════════════════════════════
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: Colors.textSecondary, marginTop: Spacing.md, fontSize: FontSize.sm },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.sm },
    title: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text },
    subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
    addBtn: { borderRadius: 12, overflow: 'hidden' },
    addBtnGradient: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },

    // Tab Bar
    tabBar: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderRadius: 14, padding: 3, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 12 },
    tabActive: { backgroundColor: Colors.primary + '20' },
    tabIcon: { fontSize: 14 },
    tabLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
    tabLabelActive: { color: Colors.primary, fontWeight: '700' },

    // Tab content
    tabContent: { flex: 1, paddingHorizontal: Spacing.lg },

    // Stats Grid (Overview)
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.lg },
    statCard: { width: (screenWidth - Spacing.lg * 2 - 10) / 2, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
    statIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statIconText: { fontSize: 20 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
    statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

    // Section
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },

    // Category Breakdown (Overview)
    categoryBreakdown: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
    catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 110 },
    catIcon: { fontSize: 16 },
    catName: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
    catBarWrap: { flex: 1, height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden', marginHorizontal: 10 },
    catBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
    catCount: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, width: 24, textAlign: 'right' },

    // Recent Items (Overview)
    recentScroll: { gap: 12, paddingBottom: Spacing.md },
    recentCard: { width: 120, backgroundColor: Colors.surface, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: Colors.border },
    recentColor: { width: '100%', height: 80, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    recentSwatch: { width: 32, height: 32, borderRadius: 16 },
    recentName: { fontSize: 12, fontWeight: '600', color: Colors.text },
    recentBrand: { fontSize: 10, color: Colors.textMuted },

    // Items Tab Toolbar
    itemsToolbar: { paddingBottom: Spacing.sm },
    catScroll: { paddingHorizontal: Spacing.lg, gap: 8, marginBottom: Spacing.sm },
    catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    catChipActive: { backgroundColor: Colors.primary + '20', borderWidth: 1, borderColor: Colors.primary },
    catChipIcon: { fontSize: 14 },
    catChipText: { fontSize: 12, color: Colors.textSecondary },
    catChipTextActive: { color: Colors.primary, fontWeight: '600' },
    viewToggles: { flexDirection: 'row', gap: 4, paddingHorizontal: Spacing.lg },
    viewBtn: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 8 },
    viewBtnActive: { backgroundColor: Colors.primary },
    viewBtnText: { fontSize: 16, color: Colors.text },

    // Grid Items
    itemsList: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
    gridItem: { width: itemWidth, marginRight: Spacing.md, marginBottom: Spacing.md },
    gridItemImg: { width: '100%', height: itemWidth * 1.2, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    gridImage: { width: '100%', height: '100%', borderRadius: 14 },
    gridSwatch: { width: 50, height: 50, borderRadius: 25 },
    gridName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
    gridBrand: { fontSize: FontSize.xs, color: Colors.textMuted },

    // List Items
    listItem: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
    listImg: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
    listImage: { width: '100%', height: '100%' },
    listSwatch: { width: 36, height: 36, borderRadius: 18 },
    listInfo: { flex: 1, padding: 12, justifyContent: 'center' },
    listName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
    listBrand: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    listTags: { flexDirection: 'row', gap: 6, marginTop: 6 },
    tagPill: { backgroundColor: Colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    tagPillText: { fontSize: 10, color: Colors.textSecondary, textTransform: 'capitalize' },

    // Empty
    emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.text, marginTop: Spacing.md },
    emptyDesc: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },

    // Colors Tab
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.lg },
    colorCard: { width: (screenWidth - Spacing.lg * 2 - 24) / 3, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
    colorCircle: { width: 40, height: 40, borderRadius: 20, marginBottom: 8, borderWidth: 2, borderColor: '#ffffff20' },
    colorName: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
    colorTip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
    colorTipIcon: { fontSize: 18 },
    colorTipText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
    colorBarWrap: { flexDirection: 'row', height: 24, borderRadius: 12, overflow: 'hidden', marginBottom: Spacing.lg },
    colorBarSegment: { minWidth: 4 },
    colorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#ffffff10' },
    colorRowName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, textTransform: 'capitalize', marginBottom: 4 },
    colorProgressWrap: { height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: 'hidden' },
    colorProgress: { height: '100%', borderRadius: 3 },
    colorStats: { alignItems: 'flex-end' },
    colorCount: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
    colorPct: { fontSize: 10, color: Colors.textMuted },
    colorSummary: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border },
    colorSummaryItem: { flex: 1, alignItems: 'center' },
    colorSummaryValue: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.text, textTransform: 'capitalize' },
    colorSummaryLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

    // Activity Tab
    activityCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
    activityDot: { width: 10, height: 10, borderRadius: 5 },
    activityTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
    activitySub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    activityDate: { fontSize: 11, color: Colors.textMuted },

    // FAB
    fab: { position: 'absolute', bottom: 30, right: 20, borderRadius: 30, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
    fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    fabText: { fontSize: 28, color: '#fff', fontWeight: '300', marginTop: -2 },

    // Modal
    modalContainer: { flex: 1, backgroundColor: Colors.background },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
    modalClose: { fontSize: 24, color: Colors.textSecondary },
    modalTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
    modalBody: { flex: 1, padding: Spacing.lg },
    modalImage: { width: '100%', height: 250, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
    modalItemImage: { width: '100%', height: '100%', borderRadius: 20 },
    modalSwatch: { width: 80, height: 80, borderRadius: 40 },
    modalItemName: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.text, textAlign: 'center' },
    modalItemBrand: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
    modalDetails: { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
    modalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
    modalLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
    modalValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500', textTransform: 'capitalize' },
    modalColorDot: { width: 14, height: 14, borderRadius: 7 },
    deleteBtn: { padding: Spacing.md, alignItems: 'center' },
    deleteBtnText: { color: Colors.error, fontSize: FontSize.md },
});

export default WardrobeDashboardScreen;
