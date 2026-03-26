/**
 * About Screen
 * App information, team, and version details
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '24';

interface TeamMember {
    name: string;
    role: string;
    emoji: string;
}

const TEAM: TeamMember[] = [
    { name: 'AI Body Scan', role: 'Development Team', emoji: '👨‍💻' },
];

const FEATURES = [
    { icon: '📸', title: 'Body Scanning', desc: 'AI-powered measurements from photos' },
    { icon: '👕', title: 'Wardrobe Manager', desc: 'Organize your clothing collection' },
    { icon: '📏', title: 'Size Recommendations', desc: 'Perfect fit for any brand' },
    { icon: '🎨', title: 'Fashion Intelligence', desc: 'Style insights and trends' },
    { icon: '📊', title: 'Body Tracker', desc: 'Track your measurements over time' },
];

export const AboutScreen: React.FC = () => {
    const handleLink = (url: string) => {
        Linking.openURL(url).catch(() => { });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* App Logo & Info */}
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>📱</Text>
                    </View>
                    <Text style={styles.appName}>AI Body Scan</Text>
                    <Text style={styles.tagline}>Your Personal Style Intelligence</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>Version {APP_VERSION} ({BUILD_NUMBER})</Text>
                    </View>
                </View>

                {/* Features Overview */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>What We Offer</Text>
                    {FEATURES.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Text style={styles.featureIcon}>{feature.icon}</Text>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </View>
                        </View>
                    ))}
                </Card>

                {/* Mission Statement */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Mission</Text>
                    <Text style={styles.missionText}>
                        We believe everyone deserves to look and feel their best. Our AI-powered
                        technology helps you understand your body, find the perfect fit, and
                        develop your personal style with confidence.
                    </Text>
                </Card>

                {/* Tech Stack */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Powered By</Text>
                    <View style={styles.techGrid}>
                        <View style={styles.techItem}>
                            <Text style={styles.techIcon}>⚛️</Text>
                            <Text style={styles.techName}>React Native</Text>
                        </View>
                        <View style={styles.techItem}>
                            <Text style={styles.techIcon}>🐍</Text>
                            <Text style={styles.techName}>Python AI</Text>
                        </View>
                        <View style={styles.techItem}>
                            <Text style={styles.techIcon}>🧠</Text>
                            <Text style={styles.techName}>Machine Learning</Text>
                        </View>
                        <View style={styles.techItem}>
                            <Text style={styles.techIcon}>☁️</Text>
                            <Text style={styles.techName}>Cloud Services</Text>
                        </View>
                    </View>
                </Card>

                {/* Legal Links */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Legal</Text>

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => handleLink('https://aibodyscan.com/terms')}
                    >
                        <Text style={styles.linkIcon}>📜</Text>
                        <Text style={styles.linkText}>Terms of Service</Text>
                        <Text style={styles.linkArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => handleLink('https://aibodyscan.com/privacy')}
                    >
                        <Text style={styles.linkIcon}>🔒</Text>
                        <Text style={styles.linkText}>Privacy Policy</Text>
                        <Text style={styles.linkArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => handleLink('https://aibodyscan.com/licenses')}
                    >
                        <Text style={styles.linkIcon}>📋</Text>
                        <Text style={styles.linkText}>Open Source Licenses</Text>
                        <Text style={styles.linkArrow}>›</Text>
                    </TouchableOpacity>
                </Card>

                {/* Social Links */}
                <View style={styles.socialSection}>
                    <Text style={styles.socialTitle}>Connect With Us</Text>
                    <View style={styles.socialIcons}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleLink('https://twitter.com/aibodyscan')}
                        >
                            <Text style={styles.socialEmoji}>🐦</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleLink('https://instagram.com/aibodyscan')}
                        >
                            <Text style={styles.socialEmoji}>📸</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleLink('mailto:aibodyscan123@gmail.com')}
                        >
                            <Text style={styles.socialEmoji}>📧</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleLink('https://aibodyscan.com')}
                        >
                            <Text style={styles.socialEmoji}>🌐</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.copyright}>
                        © 2024 AI Body Scan. All rights reserved.
                    </Text>
                    <Text style={styles.madeWith}>
                        Made with ❤️ in India
                    </Text>
                </View>
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
        alignItems: 'center',
        padding: Spacing.xl,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logoText: {
        fontSize: 48,
    },
    appName: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    tagline: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    versionBadge: {
        marginTop: Spacing.md,
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    versionText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
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
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: Spacing.md,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
    },
    featureDesc: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    missionText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    techGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.xs,
    },
    techItem: {
        width: '50%',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    techIcon: {
        fontSize: 28,
        marginBottom: Spacing.xs,
    },
    techName: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    linkIcon: {
        fontSize: 18,
        marginRight: Spacing.md,
    },
    linkText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    linkArrow: {
        fontSize: FontSize.lg,
        color: Colors.textMuted,
    },
    socialSection: {
        alignItems: 'center',
        padding: Spacing.lg,
    },
    socialTitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialEmoji: {
        fontSize: 24,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        paddingBottom: Spacing.xl * 2,
    },
    copyright: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    madeWith: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
    },
});

export default AboutScreen;
