/**
 * Features Showcase Screen
 * Rich cards with gradient icons, staggered animations, touch effects, mini stats
 * Matches website's FeaturesPage with mobile-native interactions
 */
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

// ──── Feature Data (matching website) ────
interface SubFeature { icon: string; text: string }
interface Feature {
    id: string;
    icon: string;
    title: string;
    tagline: string;
    description: string;
    gradient: [string, string];
    accentColor: string;
    subFeatures: SubFeature[];
    stat1: { value: string; label: string };
    stat2: { value: string; label: string };
    isPro?: boolean;
    navTarget?: string;
}

const FEATURES: Feature[] = [
    {
        id: 'body-scan', icon: '🎯', title: 'AI Body Scan',
        tagline: 'Your measurements, perfected',
        description: 'Upload front and side photos to get 21+ precise body measurements powered by PARE 3D reconstruction.',
        gradient: ['#8B5CF6', '#7C3AED'], accentColor: '#A78BFA',
        subFeatures: [
            { icon: '📸', text: 'Simple photo upload – front & side' },
            { icon: '📏', text: '21+ measurements: chest, waist, hips & more' },
            { icon: '🧠', text: 'PARE + SMPL deep learning technology' },
            { icon: '⚡', text: 'Results in under 30 seconds' },
        ],
        stat1: { value: '21+', label: 'Measurements' },
        stat2: { value: '<30s', label: 'Processing' },
        navTarget: 'Scan',
    },
    {
        id: '3d-model', icon: '👁️', title: '3D Body Visualization',
        tagline: 'See yourself in a new dimension',
        description: 'Interactive 3D SMPL body model. Rotate, zoom, and explore your body shape from every angle.',
        gradient: ['#06B6D4', '#0891B2'], accentColor: '#67E8F9',
        subFeatures: [
            { icon: '🔮', text: 'Interactive 3D SMPL body model' },
            { icon: '🔄', text: 'Rotate and zoom controls' },
            { icon: '📊', text: 'Real-time mesh rendering' },
            { icon: '✨', text: 'Personalized to your measurements' },
        ],
        stat1: { value: '3D', label: 'Visualization' },
        stat2: { value: '✨', label: 'Interactive' },
    },
    {
        id: 'fit-checker', icon: '🛍️', title: 'FitChecker AI',
        tagline: 'Get roasted before you shop',
        description: 'Upload any clothing photo and get instant fit analysis with roast-style feedback. Know if it fits before you buy.',
        gradient: ['#D946EF', '#C026D3'], accentColor: '#F0ABFC', isPro: true,
        subFeatures: [
            { icon: '📸', text: 'Upload any clothing product image' },
            { icon: '🔥', text: 'Roast-style fit feedback' },
            { icon: '🎯', text: 'Fit score with detailed breakdown' },
            { icon: '👕', text: 'Size recommendation vs your selected' },
        ],
        stat1: { value: '100%', label: 'Accuracy' },
        stat2: { value: '🔥', label: 'Roasts' },
    },
    {
        id: 'fashion-iq', icon: '🧠', title: 'Fashion IQ',
        tagline: 'Level up your fashion intelligence',
        description: 'Build your Fashion IQ score based on fit knowledge, style consistency, and trend awareness.',
        gradient: ['#A855F7', '#9333EA'], accentColor: '#C084FC', isPro: true,
        subFeatures: [
            { icon: '🏅', text: 'Levels: Novice → Learner → Expert → Master' },
            { icon: '📊', text: 'Fit Knowledge, Style, Trend scores' },
            { icon: '🏆', text: 'Earn badges for achievements' },
            { icon: '👥', text: 'Global leaderboard competition' },
        ],
        stat1: { value: '4', label: 'Levels' },
        stat2: { value: '🏆', label: 'Compete' },
    },
    {
        id: 'body-tracker', icon: '📈', title: 'Body Tracker',
        tagline: 'Track your transformation',
        description: 'Monitor body changes over time with smart trend analysis. Track measurements and see progress.',
        gradient: ['#6366F1', '#4F46E5'], accentColor: '#818CF8',
        subFeatures: [
            { icon: '📉', text: 'Body measurement trends over time' },
            { icon: '⚡', text: 'Velocity & acceleration metrics' },
            { icon: '🎯', text: 'Body shape analysis & changes' },
            { icon: '✨', text: 'Size change predictions' },
        ],
        stat1: { value: '∞', label: 'History' },
        stat2: { value: '📈', label: 'Trends' },
    },
    {
        id: 'wardrobe', icon: '📦', title: 'Wardrobe & Trend Analytics',
        tagline: 'Smart insights for your closet',
        description: 'Analyze wardrobe composition, color distribution, and identify style gaps with personalized recommendations.',
        gradient: ['#3B82F6', '#2563EB'], accentColor: '#93C5FD',
        subFeatures: [
            { icon: '📊', text: 'Wardrobe composition breakdown' },
            { icon: '🎨', text: 'Color distribution analysis' },
            { icon: '🎯', text: 'Style gap identification' },
            { icon: '❤️', text: 'Wishlist & purchase tracking' },
        ],
        stat1: { value: '360°', label: 'Analysis' },
        stat2: { value: '🎨', label: 'Colors' },
        navTarget: 'Wardrobe',
    },
];

// ──── Animated Feature Card ────
const FeatureCard: React.FC<{ feature: Feature; index: number; onNavigate: (target?: string) => void }> = ({ feature, index, onNavigate }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: index * 120,
            useNativeDriver: true,
        }).start();
    }, []);

    const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    return (
        <Animated.View style={{
            opacity: anim,
            transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                { scale: scaleAnim },
            ],
        }}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => onNavigate(feature.navTarget)}
                style={styles.card}
            >
                {/* Gradient glow border */}
                <LinearGradient
                    colors={[feature.gradient[0] + '30', feature.gradient[1] + '10']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.cardGlow}
                />

                {/* PRO badge */}
                {feature.isPro && (
                    <LinearGradient colors={feature.gradient} style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                    </LinearGradient>
                )}

                {/* Icon + Title row */}
                <View style={styles.cardTop}>
                    <LinearGradient colors={feature.gradient} style={styles.iconBox}>
                        <Text style={styles.iconEmoji}>{feature.icon}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{feature.title}</Text>
                        <Text style={[styles.cardTagline, { color: feature.accentColor }]}>{feature.tagline}</Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.cardDesc}>{feature.description}</Text>

                {/* Sub-features */}
                <View style={styles.subFeatures}>
                    {feature.subFeatures.map((sf, i) => (
                        <View key={i} style={styles.subFeatureRow}>
                            <View style={[styles.subFeatureIcon, { backgroundColor: feature.gradient[0] + '15' }]}>
                                <Text style={{ fontSize: 12 }}>{sf.icon}</Text>
                            </View>
                            <Text style={styles.subFeatureText}>{sf.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Mini stats */}
                <View style={[styles.miniStats, { borderTopColor: feature.gradient[0] + '20' }]}>
                    <View style={styles.miniStatItem}>
                        <Text style={[styles.miniStatValue, { color: feature.accentColor }]}>{feature.stat1.value}</Text>
                        <Text style={styles.miniStatLabel}>{feature.stat1.label}</Text>
                    </View>
                    <View style={[styles.miniStatDivider, { backgroundColor: feature.gradient[0] + '20' }]} />
                    <View style={styles.miniStatItem}>
                        <Text style={[styles.miniStatValue, { color: feature.accentColor }]}>{feature.stat2.value}</Text>
                        <Text style={styles.miniStatLabel}>{feature.stat2.label}</Text>
                    </View>
                </View>

                {/* CTA arrow */}
                <View style={styles.cardCta}>
                    <LinearGradient colors={feature.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                        <Text style={styles.ctaText}>Explore →</Text>
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ──── Main Component ────
export const FeaturesShowcaseScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    const handleNavigate = (target?: string) => {
        if (target) {
            try { navigation.navigate('Tabs', { screen: target }); } catch { }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ── Hero Header ── */}
                <Animated.View style={[styles.hero, {
                    opacity: headerAnim,
                    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                }]}>
                    <LinearGradient
                        colors={['#8B5CF620', '#EC489920', 'transparent']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.heroBg}
                    />
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeIcon}>✨</Text>
                        <Text style={styles.heroBadgeText}>All Features</Text>
                    </View>
                    <Text style={styles.heroTitle}>
                        Everything You Need for{'\n'}
                        <Text style={styles.heroTitleGlow}>Body Intelligence</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        From AI-powered measurements to fashion scoring, explore all the tools for your style journey.
                    </Text>
                </Animated.View>

                {/* ── Feature Cards ── */}
                {FEATURES.map((feature, index) => (
                    <FeatureCard key={feature.id} feature={feature} index={index} onNavigate={handleNavigate} />
                ))}

                {/* ── Bottom CTA ── */}
                <Animated.View style={[styles.ctaSection, {
                    opacity: headerAnim,
                    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                }]}>
                    <LinearGradient
                        colors={['#1E1B4B', '#312E81', '#1E1B4B']}
                        style={styles.ctaCard}
                    >
                        <Text style={{ fontSize: 36 }}>👑</Text>
                        <Text style={styles.ctaTitle}>Ready to Experience All Features?</Text>
                        <Text style={styles.ctaDesc}>
                            Start with a free body scan and unlock the full potential of AI-powered body intelligence.
                        </Text>
                        <TouchableOpacity
                            style={styles.ctaPrimaryBtn}
                            onPress={() => { try { navigation.navigate('Tabs', { screen: 'Scan' }); } catch { } }}
                        >
                            <LinearGradient colors={['#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaPrimaryGradient}>
                                <Text style={styles.ctaPrimaryText}>⚡ Get Started Free →</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.ctaSecondaryBtn}
                            onPress={() => { try { navigation.navigate('Pricing'); } catch { } }}
                        >
                            <Text style={styles.ctaSecondaryText}>View Pricing ↗</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

// ──── Styles ────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { paddingBottom: 20 },

    // Hero
    hero: { padding: Spacing.lg, paddingTop: Spacing.md, alignItems: 'center', position: 'relative', overflow: 'hidden' },
    heroBg: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
    heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#8B5CF615', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#8B5CF630', marginBottom: 14 },
    heroBadgeIcon: { fontSize: 14 },
    heroBadgeText: { fontSize: 12, fontWeight: '700', color: '#A78BFA' },
    heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', lineHeight: 36, marginBottom: 10 },
    heroTitleGlow: { color: '#A78BFA' },
    heroSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 340 },

    // Feature Card
    card: { marginHorizontal: Spacing.lg, marginBottom: 20, backgroundColor: Colors.surface, borderRadius: 22, padding: 22, borderWidth: 1, borderColor: Colors.border, position: 'relative', overflow: 'hidden' },
    cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
    proBadge: { position: 'absolute', top: 14, right: 14, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, zIndex: 10 },
    proBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },

    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14, zIndex: 5 },
    iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    iconEmoji: { fontSize: 24 },
    cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
    cardTagline: { fontSize: 12, fontWeight: '600', marginTop: 1 },

    cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },

    // Sub-features
    subFeatures: { gap: 10, marginBottom: 16 },
    subFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    subFeatureIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    subFeatureText: { fontSize: 13, color: Colors.text, flex: 1, lineHeight: 18 },

    // Mini stats
    miniStats: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 14, marginBottom: 14 },
    miniStatItem: { flex: 1, alignItems: 'center' },
    miniStatValue: { fontSize: 22, fontWeight: '800' },
    miniStatLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
    miniStatDivider: { width: 1, marginVertical: 4 },

    // Card CTA
    cardCta: { borderRadius: 12, overflow: 'hidden' },
    ctaGradient: { paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    ctaText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },

    // Bottom CTA Section
    ctaSection: { marginHorizontal: Spacing.lg, marginTop: 10 },
    ctaCard: { borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#4338CA30' },
    ctaTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center', marginTop: 14, marginBottom: 8 },
    ctaDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24, maxWidth: 300 },
    ctaPrimaryBtn: { borderRadius: 14, overflow: 'hidden', width: '100%', marginBottom: 12 },
    ctaPrimaryGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
    ctaPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    ctaSecondaryBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, borderWidth: 1, borderColor: '#ffffff30', width: '100%', alignItems: 'center' },
    ctaSecondaryText: { color: '#ffffffCC', fontWeight: '600', fontSize: 14 },
});

export default FeaturesShowcaseScreen;
