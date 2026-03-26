/**
 * Profile Screen
 * User profile, settings, and account management
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    TextInput,
    Modal,
    RefreshControl,
    Linking,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Card, Loading } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { AuthAPI, PaymentsAPI } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticSuccess, hapticMedium, hapticWarning } from '../../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../config/env';

interface UserProfile {
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    dateJoined: string;
    subscription: 'free' | 'pro' | 'enterprise';
    subscriptionDaysRemaining?: number | null;
}

interface Settings {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
    measurementUnit: 'cm' | 'inch';
}

export const ProfileSettingsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuthStore();

    const [profile, setProfile] = useState<UserProfile>({
        name: (user as any)?.name || user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        dateJoined: 'January 2024',
        subscription: 'free',
        subscriptionDaysRemaining: null,
    });

    const { isDark, toggleTheme } = useTheme();

    const [settings, setSettings] = useState<Settings>({
        notifications: true,
        emailUpdates: true,
        darkMode: isDark,
        measurementUnit: 'cm',
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editName, setEditName] = useState(profile.name);
    const [editPhone, setEditPhone] = useState(profile.phone || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const SETTINGS_KEY = '@aibodyscan_settings';

    // Fetch subscription status on mount and when screen focuses
    const fetchSubscriptionStatus = useCallback(async () => {
        try {
            const data = await PaymentsAPI.getSubscription();
            let subscriptionType: 'free' | 'pro' | 'enterprise' = 'free';

            if (data.is_active && data.plan_type) {
                if (data.plan_type === 'premium' || data.plan_type === 'pro') {
                    subscriptionType = 'pro';
                } else if (data.plan_type === 'enterprise') {
                    subscriptionType = 'enterprise';
                }
            }

            setProfile(prev => ({
                ...prev,
                subscription: subscriptionType,
                subscriptionDaysRemaining: data.days_remaining,
            }));
        } catch (err) {
            // Subscription fetch failed — handled by default state
        } finally {
            setIsLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSubscriptionStatus();
        setRefreshing(false);
    }, [fetchSubscriptionStatus]);

    useEffect(() => {
        fetchSubscriptionStatus();
    }, [fetchSubscriptionStatus]);

    // Refetch when screen comes into focus (e.g., after upgrading)
    useFocusEffect(
        useCallback(() => {
            fetchSubscriptionStatus();
        }, [fetchSubscriptionStatus])
    );

    const getSubscriptionBadge = () => {
        switch (profile.subscription) {
            case 'pro':
                return { label: 'PRO', color: Colors.primary };
            case 'enterprise':
                return { label: 'ENTERPRISE', color: '#F59E0B' };
            default:
                return { label: 'FREE', color: Colors.textMuted };
        }
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const result = await AuthAPI.updateProfile({
                full_name: editName,
                phone_number: editPhone || undefined,
            });
            setProfile(prev => ({
                ...prev,
                name: result.full_name || editName,
                phone: result.phone_number || editPhone,
            }));
            setShowEditModal(false);
            hapticSuccess();
            Toast.show({ type: 'success', text1: '✅ Success', text2: 'Profile updated successfully!' });
        } catch (err: any) {
            hapticWarning();
            const message = err?.response?.data?.detail || 'Failed to update profile.';
            Toast.show({ type: 'error', text1: 'Error', text2: message });
        } finally {
            setIsLoading(false);
        }
    };

    // Load persisted settings
    useEffect(() => {
        AsyncStorage.getItem(SETTINGS_KEY).then((saved: string | null) => {
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSettings(prev => ({ ...prev, ...parsed, darkMode: isDark }));
                } catch { }
            }
        });
    }, []);

    // Persist settings when they change
    const persistSettings = (newSettings: Settings) => {
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    };

    const handleToggleSetting = (key: keyof Settings) => {
        if (key === 'darkMode') {
            toggleTheme();
        }
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        persistSettings(newSettings);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'All fields are required' });
            return;
        }
        if (newPassword.length < 6) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'New password must be at least 6 characters' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'New passwords do not match' });
            return;
        }
        setIsSavingPassword(true);
        try {
            await AuthAPI.changePassword(currentPassword, newPassword);
            hapticSuccess();
            Toast.show({ type: 'success', text1: '✅ Done', text2: 'Password changed successfully!' });
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            hapticWarning();
            const message = err?.response?.data?.detail || 'Failed to change password';
            Toast.show({ type: 'error', text1: 'Error', text2: message });
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleContactUs = () => {
        Linking.openURL('mailto:aibodyscan123@gmail.com?subject=Support%20Request');
    };

    const handleHelpCenter = () => {
        Linking.openURL('https://aibodyscan.com/help');
    };

    const handleTermsPrivacy = () => {
        Linking.openURL('https://aibodyscan.com/privacy');
    };

    const handleAbout = () => {
        Alert.alert(
            'About AIBodyScan',
            `Version: ${APP_CONFIG.version}\nEmail: ${APP_CONFIG.supportEmail}\n\nAI-powered body measurement & fashion insights.`,
            [{ text: 'OK' }]
        );
    };

    const handleStats = () => {
        navigation.navigate('BodyTracker');
    };

    const handlePersonalInfo = () => {
        setEditName(profile.name);
        setEditPhone(profile.phone || '');
        setShowEditModal(true);
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent and cannot be undone. All your data will be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Contact Support', 'Please contact aibodyscan123@gmail.com to delete your account.');
                    },
                },
            ]
        );
    };

    const badge = getSubscriptionBadge();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                {/* Profile Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={() => {
                        Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Avatar upload will be available soon' });
                    }}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.editAvatarButton}>
                            <Text style={styles.editAvatarText}>📷</Text>
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>{profile.name}</Text>
                    <Text style={styles.userEmail}>{profile.email}</Text>

                    <View style={[styles.subscriptionBadge, { backgroundColor: badge.color + '20' }]}>
                        <Text style={[styles.subscriptionText, { color: badge.color }]}>
                            {badge.label}
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => setShowEditModal(true)}
                    >
                        <Text style={styles.quickActionIcon}>✏️</Text>
                        <Text style={styles.quickActionText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('Pricing')}
                    >
                        <Text style={styles.quickActionIcon}>💎</Text>
                        <Text style={styles.quickActionText}>Upgrade</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={handleStats}
                    >
                        <Text style={styles.quickActionIcon}>📊</Text>
                        <Text style={styles.quickActionText}>Stats</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={handlePersonalInfo}>
                        <Text style={styles.menuIcon}>👤</Text>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Personal Info</Text>
                            <Text style={styles.menuValue}>{profile.phone || 'Add phone'}</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Pricing')}
                    >
                        <Text style={styles.menuIcon}>💳</Text>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Subscription</Text>
                            <Text style={[styles.menuValue, { color: badge.color }]}>
                                {badge.label} Plan
                                {profile.subscriptionDaysRemaining && profile.subscription !== 'free'
                                    ? ` • ${profile.subscriptionDaysRemaining} days left`
                                    : ''}
                            </Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
                        <Text style={styles.menuIcon}>🔐</Text>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Change Password</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                </Card>

                {/* Preferences Section */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingIcon}>🔔</Text>
                            <Text style={styles.settingLabel}>Push Notifications</Text>
                        </View>
                        <Switch
                            value={settings.notifications}
                            onValueChange={() => handleToggleSetting('notifications')}
                            trackColor={{ false: Colors.border, true: Colors.primary }}
                            thumbColor={Colors.text}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingIcon}>📧</Text>
                            <Text style={styles.settingLabel}>Email Updates</Text>
                        </View>
                        <Switch
                            value={settings.emailUpdates}
                            onValueChange={() => handleToggleSetting('emailUpdates')}
                            trackColor={{ false: Colors.border, true: Colors.primary }}
                            thumbColor={Colors.text}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingIcon}>🌙</Text>
                            <Text style={styles.settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={settings.darkMode}
                            onValueChange={() => handleToggleSetting('darkMode')}
                            trackColor={{ false: Colors.border, true: Colors.primary }}
                            thumbColor={Colors.text}
                        />
                    </View>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingIcon}>📏</Text>
                            <Text style={styles.settingLabel}>Measurement Unit</Text>
                        </View>
                        <View style={styles.unitToggle}>
                            <TouchableOpacity
                                style={[
                                    styles.unitButton,
                                    settings.measurementUnit === 'cm' && styles.unitButtonActive,
                                ]}
                                onPress={() => setSettings(prev => ({ ...prev, measurementUnit: 'cm' }))}
                            >
                                <Text style={[
                                    styles.unitButtonText,
                                    settings.measurementUnit === 'cm' && styles.unitButtonTextActive,
                                ]}>cm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.unitButton,
                                    settings.measurementUnit === 'inch' && styles.unitButtonActive,
                                ]}
                                onPress={() => setSettings(prev => ({ ...prev, measurementUnit: 'inch' }))}
                            >
                                <Text style={[
                                    styles.unitButtonText,
                                    settings.measurementUnit === 'inch' && styles.unitButtonTextActive,
                                ]}>inch</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Card>

                {/* Support Section */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={handleHelpCenter}>
                        <Text style={styles.menuIcon}>❓</Text>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Help Center</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleContactUs}>
                        <Text style={styles.menuIcon}>💬</Text>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Contact Us</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleTermsPrivacy}>
                        <Text style={styles.menuIcon}>📜</Text>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Terms & Privacy</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
                        <Text style={styles.menuIcon}>ℹ️</Text>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>About</Text>
                            <Text style={styles.menuValue}>v{APP_CONFIG.version}</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                </Card>

                {/* Danger Zone */}
                <Card style={styles.dangerSection}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>🚪 Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Text style={styles.deleteText}>🗑️ Delete Account</Text>
                    </TouchableOpacity>
                </Card>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Member since {profile.dateJoined}</Text>
                    <Text style={styles.footerText}>AI Body Scan © 2024</Text>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Your name"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={editPhone}
                                onChangeText={setEditPhone}
                                placeholder="Phone number"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonOutline]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.modalButtonOutlineText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={handleSaveProfile}
                                disabled={isLoading}
                            >
                                <Text style={styles.modalButtonText}>
                                    {isLoading ? 'Saving...' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                visible={showPasswordModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Password</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <TextInput
                                style={styles.input}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter current password"
                                placeholderTextColor={Colors.textMuted}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password (min 6 chars)"
                                placeholderTextColor={Colors.textMuted}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Confirm New Password</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor={Colors.textMuted}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonOutline]}
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmNewPassword('');
                                }}
                            >
                                <Text style={styles.modalButtonOutlineText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={handleChangePassword}
                                disabled={isSavingPassword}
                            >
                                <Text style={styles.modalButtonText}>
                                    {isSavingPassword ? 'Changing...' : 'Change'}
                                </Text>
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
    header: {
        alignItems: 'center',
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.text,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    editAvatarText: {
        fontSize: 16,
    },
    userName: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    userEmail: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    subscriptionBadge: {
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    subscriptionText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    quickAction: {
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        flex: 1,
        marginHorizontal: Spacing.xs,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: Spacing.xs,
    },
    quickActionText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    section: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textMuted,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: Spacing.md,
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    menuValue: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    menuArrow: {
        fontSize: FontSize.lg,
        color: Colors.textMuted,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        fontSize: 20,
        marginRight: Spacing.md,
    },
    settingLabel: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.sm,
        padding: 2,
    },
    unitButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.sm,
    },
    unitButtonActive: {
        backgroundColor: Colors.primary,
    },
    unitButtonText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
    unitButtonTextActive: {
        color: Colors.text,
        fontWeight: '600',
    },
    dangerSection: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    logoutButton: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    logoutText: {
        fontSize: FontSize.sm,
        color: Colors.warning,
        fontWeight: '600',
    },
    deleteButton: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    deleteText: {
        fontSize: FontSize.sm,
        color: Colors.error,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    footerText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginVertical: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
    },
    modalTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.md,
    },
    modalButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    modalButtonOutline: {
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalButtonOutlineText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    modalButtonPrimary: {
        backgroundColor: Colors.primary,
    },
    modalButtonText: {
        fontSize: FontSize.sm,
        color: Colors.text,
        fontWeight: '600',
    },
});

export default ProfileSettingsScreen;
