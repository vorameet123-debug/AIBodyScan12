/**
 * Pricing Screen
 * Subscription plans, pricing, and upgrade flow - Aligned with website
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
    Linking,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Card, Button, Loading } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { PaymentsAPI } from '../../services/api';

interface PlanFeature {
    text: string;
    included: boolean;
}

interface Plan {
    id: string;
    name: string;
    description: string;
    price: { monthly: number; yearly: number };
    currency: string;
    features: PlanFeature[];
    popular?: boolean;
    cta: string;
    color: 'slate' | 'violet' | 'amber';
}

interface SubscriptionStatus {
    is_active: boolean;
    plan_type: string | null;
    expires_at: string | null;
    days_remaining: number | null;
}

// Plans matching website PricingPage.tsx exactly
const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        description: 'Perfect for trying out BodyScan AI',
        price: { monthly: 0, yearly: 0 },
        currency: '₹',
        color: 'slate',
        cta: 'Get Started Free',
        features: [
            { text: '3 Body Scans per month', included: true },
            { text: '3 FitChecker analyses', included: true },
            { text: 'Basic 3D visualization', included: true },
            { text: 'Fashion IQ score', included: true },
            { text: 'Save up to 3 measurements', included: true },
            { text: 'Body Tracker (7-day history)', included: true },
            { text: 'Wardrobe & Trend Analytics', included: false },
            { text: 'Trend Dashboard', included: false },
            { text: 'Priority support', included: false },
            { text: 'API access', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'For fashion enthusiasts and regular users',
        price: { monthly: 999, yearly: 666 }, // ₹999/month or ₹666/month (yearly)
        currency: '₹',
        color: 'violet',
        popular: true,
        cta: 'Get Pro Now',
        features: [
            { text: 'Unlimited Body Scans', included: true },
            { text: 'Unlimited FitChecker analyses', included: true },
            { text: 'Advanced 3D visualization', included: true },
            { text: 'Full Fashion IQ with badges', included: true },
            { text: 'Unlimited saved measurements', included: true },
            { text: 'Body Tracker (full history)', included: true },
            { text: 'Wardrobe & Trend Analytics', included: true },
            { text: 'Trend Dashboard', included: true },
            { text: 'Email support', included: true },
            { text: 'API access', included: false },
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For businesses and power users',
        price: { monthly: 4000, yearly: 3333 }, // ₹4000/month or ₹3333/month (yearly)
        currency: '₹',
        color: 'amber',
        cta: 'Contact Sales',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Team accounts (up to 10)', included: true },
            { text: 'White-label options', included: true },
            { text: 'Custom integrations', included: true },
            { text: 'Advanced analytics', included: true },
            { text: 'Priority queue processing', included: true },
            { text: 'Full API access', included: true },
            { text: 'Dedicated support', included: true },
            { text: 'SLA guarantee', included: true },
            { text: 'Custom training', included: true },
        ],
    },
];

const FAQS = [
    {
        q: 'What counts as a Body Scan?',
        a: 'A Body Scan is when you upload photos to get your measurements. Each successful measurement extraction counts as one scan.',
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Your subscription runs for the purchased period (monthly or yearly). Once purchased, the subscription cannot be cancelled mid-term, but it will not auto-renew unless you choose to renew.',
    },
    {
        q: 'What is your refund policy?',
        a: 'Due to the nature of our AI-powered service, all purchases are final and non-refundable. We recommend trying the free tier first to ensure our service meets your needs.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and popular wallets like Paytm, PhonePe, and GPay via Razorpay.',
    },
];

export const PricingScreen: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    useEffect(() => {
        fetchSubscriptionStatus();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const data = await PaymentsAPI.getSubscription();
            setSubscription(data);
        } catch (err) {
            // Subscription fetch failed — use default inactive state
            setSubscription({
                is_active: false,
                plan_type: null,
                expires_at: null,
                days_remaining: null,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPlan = (plan: Plan) => {
        if (plan.id === 'free') {
            Toast.show({ type: 'info', text1: 'Free Plan', text2: 'You are already on the Free plan!' });
            return;
        }

        if (plan.id === 'enterprise') {
            // Contact sales for enterprise
            Linking.openURL('mailto:enterprise@bodyscan.ai?subject=Enterprise Plan Inquiry');
            return;
        }

        setSelectedPlan(plan);
        setShowUpgradeModal(true);
    };

    const handlePurchase = async () => {
        if (!selectedPlan) return;

        setIsProcessing(true);
        try {
            // Create order with Razorpay
            const order = await PaymentsAPI.createSubscription({
                plan_id: selectedPlan.id,
                billing_cycle: billingCycle,
            });

            // Open Razorpay checkout page in browser
            if (order.payment_url) {
                setShowUpgradeModal(false);

                // Open in-app browser for Razorpay checkout
                const result = await WebBrowser.openBrowserAsync(order.payment_url, {
                    showTitle: true,
                    toolbarColor: '#0f0f23',
                    controlsColor: '#8B5CF6',
                });

                // When browser closes, refresh subscription status
                if (result.type === 'cancel' || result.type === 'dismiss') {
                    // User closed the browser, check if payment was successful
                    setTimeout(async () => {
                        await fetchSubscriptionStatus();
                        // Check if subscription was activated
                        const status = await PaymentsAPI.getSubscription();
                        if (status.is_active && status.plan_type !== 'free') {
                            Toast.show({
                                type: 'success',
                                text1: '🎉 Payment Successful!',
                                text2: `Welcome to ${selectedPlan.name}! Your subscription is now active.`,
                            });
                        }
                    }, 1000);
                }
            } else {
                Toast.show({ type: 'error', text1: 'Payment Error', text2: 'Could not initialize payment. Please try again.' });
            }
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Payment Error', text2: err.message || 'Failed to process payment. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const getPlanColor = (color: string) => {
        switch (color) {
            case 'violet': return Colors.primary;
            case 'amber': return '#F59E0B';
            default: return Colors.textMuted;
        }
    };

    const isCurrentPlan = (planId: string) => {
        if (!subscription?.is_active) return planId === 'free';
        return subscription.plan_type === 'premium' && planId === 'pro';
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Loading text="Loading subscription..." />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>✨ Start free with 3 scans/month</Text>
                    </View>
                    <Text style={styles.title}>Simple, Transparent Pricing</Text>
                    <Text style={styles.subtitle}>Choose the plan that fits your needs</Text>
                </View>

                {/* Billing Toggle */}
                <View style={styles.billingToggle}>
                    <TouchableOpacity
                        style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
                        onPress={() => setBillingCycle('monthly')}
                    >
                        <Text style={[styles.billingText, billingCycle === 'monthly' && styles.billingTextActive]}>
                            Monthly
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
                        onPress={() => setBillingCycle('yearly')}
                    >
                        <Text style={[styles.billingText, billingCycle === 'yearly' && styles.billingTextActive]}>
                            Yearly
                        </Text>
                        <View style={styles.saveBadge}>
                            <Text style={styles.saveBadgeText}>Save 33%</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Current Subscription Status */}
                {subscription?.is_active && (
                    <Card style={styles.subscriptionCard}>
                        <View style={styles.subscriptionHeader}>
                            <Text style={styles.subscriptionTitle}>✅ Active Subscription</Text>
                            {subscription.days_remaining && (
                                <Text style={styles.subscriptionDays}>
                                    {subscription.days_remaining} days left
                                </Text>
                            )}
                        </View>
                        <Text style={styles.subscriptionPlan}>
                            Pro Plan • {subscription.plan_type}
                        </Text>
                    </Card>
                )}

                {/* Plan Cards */}
                {PLANS.map((plan) => {
                    const price = plan.price[billingCycle];
                    const isCurrent = isCurrentPlan(plan.id);
                    const planColor = getPlanColor(plan.color);

                    return (
                        <Card
                            key={plan.id}
                            style={[
                                styles.planCard,
                                plan.popular && styles.planCardPopular,
                                isCurrent && styles.planCardCurrent,
                            ]}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularBadgeText}>⭐ Most Popular</Text>
                                </View>
                            )}

                            {/* Plan Header */}
                            <View style={styles.planHeader}>
                                <View style={[styles.planIcon, { backgroundColor: planColor + '20' }]}>
                                    <Text style={[styles.planIconText, { color: planColor }]}>
                                        {plan.id === 'free' ? '✨' : plan.id === 'pro' ? '⚡' : '👑'}
                                    </Text>
                                </View>
                                <View style={styles.planInfo}>
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <Text style={styles.planDescription}>{plan.description}</Text>
                                </View>
                            </View>

                            {/* Price */}
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceAmount}>
                                    {plan.currency}{price}
                                </Text>
                                {price > 0 && (
                                    <Text style={styles.pricePeriod}>/month</Text>
                                )}
                            </View>
                            {billingCycle === 'yearly' && price > 0 && (
                                <Text style={styles.yearlyTotal}>
                                    Billed {plan.currency}{price * 12}/year
                                </Text>
                            )}

                            {/* CTA Button */}
                            {isCurrent ? (
                                <View style={styles.currentPlanButton}>
                                    <Text style={styles.currentPlanText}>✓ Current Plan</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[
                                        styles.ctaButton,
                                        plan.popular && styles.ctaButtonPopular,
                                        plan.color === 'amber' && styles.ctaButtonEnterprise,
                                    ]}
                                    onPress={() => handleSelectPlan(plan)}
                                    disabled={isProcessing}
                                >
                                    <Text style={[
                                        styles.ctaButtonText,
                                        plan.popular && styles.ctaButtonTextPopular,
                                    ]}>
                                        {plan.cta}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Features List */}
                            <View style={styles.featuresContainer}>
                                <Text style={styles.featuresTitle}>What's included:</Text>
                                {plan.features.map((feature, idx) => (
                                    <View key={idx} style={styles.featureRow}>
                                        <Text style={[
                                            styles.featureIcon,
                                            !feature.included && styles.featureIconDisabled,
                                        ]}>
                                            {feature.included ? '✓' : '✗'}
                                        </Text>
                                        <Text style={[
                                            styles.featureText,
                                            !feature.included && styles.featureTextDisabled,
                                        ]}>
                                            {feature.text}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </Card>
                    );
                })}

                {/* Feature Comparison */}
                <View style={styles.comparisonSection}>
                    <Text style={styles.sectionTitle}>What You Get with Each Plan</Text>
                    <View style={styles.comparisonGrid}>
                        {[
                            { title: 'Body Scan', free: '3/month', pro: 'Unlimited', enterprise: 'Unlimited' },
                            { title: 'FitChecker', free: '5/month', pro: 'Unlimited', enterprise: 'Unlimited' },
                            { title: '3D Model', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
                            { title: 'Fashion IQ', free: 'Score only', pro: 'Full + Badges', enterprise: 'Full + Badges' },
                            { title: 'Body Tracker', free: '7 days', pro: 'Full history', enterprise: 'Full history' },
                            { title: 'Wardrobe', free: '—', pro: 'Full access', enterprise: 'Full access' },
                        ].map((row, idx) => (
                            <Card key={idx} style={styles.comparisonCard}>
                                <Text style={styles.comparisonTitle}>{row.title}</Text>
                                <View style={styles.comparisonRow}>
                                    <Text style={styles.comparisonLabel}>Free</Text>
                                    <Text style={styles.comparisonValue}>{row.free}</Text>
                                </View>
                                <View style={styles.comparisonRow}>
                                    <Text style={[styles.comparisonLabel, { color: Colors.primary }]}>Pro</Text>
                                    <Text style={[styles.comparisonValue, { color: Colors.primary }]}>{row.pro}</Text>
                                </View>
                                <View style={styles.comparisonRow}>
                                    <Text style={[styles.comparisonLabel, { color: '#F59E0B' }]}>Enterprise</Text>
                                    <Text style={[styles.comparisonValue, { color: '#F59E0B' }]}>{row.enterprise}</Text>
                                </View>
                            </Card>
                        ))}
                    </View>
                </View>

                {/* Trust Badges */}
                <View style={styles.trustBadges}>
                    {[
                        { icon: '🔒', text: 'Secure Payments' },
                        { icon: '👥', text: '10K+ Users' },
                        { icon: '🎧', text: '24/7 Support' },
                        { icon: '∞', text: 'No Lock-in' },
                    ].map((badge, idx) => (
                        <View key={idx} style={styles.trustBadge}>
                            <Text style={styles.trustBadgeIcon}>{badge.icon}</Text>
                            <Text style={styles.trustBadgeText}>{badge.text}</Text>
                        </View>
                    ))}
                </View>

                {/* FAQs */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {FAQS.map((faq, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.faqCard}
                            onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={styles.faqQuestion}>{faq.q}</Text>
                                <Text style={styles.faqToggle}>
                                    {expandedFaq === idx ? '−' : '+'}
                                </Text>
                            </View>
                            {expandedFaq === idx && (
                                <Text style={styles.faqAnswer}>{faq.a}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom CTA */}
                <View style={styles.bottomCta}>
                    <Text style={styles.bottomCtaTitle}>Ready to Get Started?</Text>
                    <Text style={styles.bottomCtaSubtitle}>
                        Try BodyScan AI free and upgrade whenever you're ready.
                    </Text>
                    <TouchableOpacity style={styles.bottomCtaButton}>
                        <Text style={styles.bottomCtaButtonText}>⚡ Start Free Body Scan</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Upgrade Modal */}
            <Modal
                visible={showUpgradeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowUpgradeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Upgrade to {selectedPlan?.name}</Text>

                        <View style={styles.modalPriceBox}>
                            <Text style={styles.modalPrice}>
                                {selectedPlan?.currency}{selectedPlan?.price[billingCycle]}
                            </Text>
                            <Text style={styles.modalPricePeriod}>/month</Text>
                        </View>

                        {billingCycle === 'yearly' && (
                            <Text style={styles.modalBillingNote}>
                                Billed {selectedPlan?.currency}{(selectedPlan?.price.yearly || 0) * 12}/year
                            </Text>
                        )}

                        <View style={styles.modalFeatures}>
                            {selectedPlan?.features
                                .filter(f => f.included)
                                .slice(0, 5)
                                .map((feature, idx) => (
                                    <View key={idx} style={styles.modalFeatureRow}>
                                        <Text style={styles.modalFeatureCheck}>✓</Text>
                                        <Text style={styles.modalFeatureText}>{feature.text}</Text>
                                    </View>
                                ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButtonOutline}
                                onPress={() => setShowUpgradeModal(false)}
                            >
                                <Text style={styles.modalButtonOutlineText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonPrimary}
                                onPress={handlePurchase}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color={Colors.text} />
                                ) : (
                                    <Text style={styles.modalButtonPrimaryText}>Pay Now</Text>
                                )}
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
    headerBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.md,
    },
    headerBadgeText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    billingToggle: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: 4,
    },
    billingOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    billingOptionActive: {
        backgroundColor: Colors.surfaceLight,
    },
    billingText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    billingTextActive: {
        color: Colors.text,
    },
    saveBadge: {
        backgroundColor: Colors.success + '20',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        marginLeft: Spacing.xs,
    },
    saveBadgeText: {
        fontSize: FontSize.xs,
        color: Colors.success,
        fontWeight: 'bold',
    },
    subscriptionCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        backgroundColor: Colors.success + '10',
        borderColor: Colors.success,
        borderWidth: 1,
    },
    subscriptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subscriptionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.success,
    },
    subscriptionDays: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    subscriptionPlan: {
        fontSize: FontSize.sm,
        color: Colors.text,
        marginTop: Spacing.xs,
    },
    planCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    planCardPopular: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    planCardCurrent: {
        borderColor: Colors.success,
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    popularBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: Colors.text,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.xs,
    },
    planIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    planIconText: {
        fontSize: 24,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.text,
    },
    planDescription: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: Spacing.xs,
    },
    priceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.text,
    },
    pricePeriod: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginLeft: 4,
    },
    yearlyTotal: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
    },
    currentPlanButton: {
        backgroundColor: Colors.success + '20',
        borderWidth: 2,
        borderColor: Colors.success,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    currentPlanText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.success,
    },
    ctaButton: {
        backgroundColor: Colors.surface,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    ctaButtonPopular: {
        backgroundColor: Colors.primary,
    },
    ctaButtonEnterprise: {
        backgroundColor: '#F59E0B',
    },
    ctaButtonText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    ctaButtonTextPopular: {
        color: Colors.text,
    },
    featuresContainer: {
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    featuresTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    featureIcon: {
        fontSize: FontSize.sm,
        color: Colors.success,
        marginRight: Spacing.sm,
        width: 20,
    },
    featureIconDisabled: {
        color: Colors.textMuted,
    },
    featureText: {
        fontSize: FontSize.sm,
        color: Colors.text,
        flex: 1,
    },
    featureTextDisabled: {
        color: Colors.textMuted,
    },
    comparisonSection: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    comparisonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    comparisonCard: {
        width: '48%',
        marginBottom: Spacing.sm,
    },
    comparisonTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    comparisonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    comparisonLabel: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    comparisonValue: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.text,
    },
    trustBadges: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: Spacing.lg,
        marginHorizontal: Spacing.lg,
    },
    trustBadge: {
        alignItems: 'center',
    },
    trustBadgeIcon: {
        fontSize: 24,
        marginBottom: Spacing.xs,
    },
    trustBadgeText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    faqSection: {
        padding: Spacing.lg,
    },
    faqCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    faqToggle: {
        fontSize: FontSize.lg,
        color: Colors.textMuted,
        marginLeft: Spacing.sm,
    },
    faqAnswer: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
        lineHeight: 20,
    },
    bottomCta: {
        alignItems: 'center',
        padding: Spacing.xl,
        paddingBottom: Spacing.xl * 2,
    },
    bottomCtaTitle: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    bottomCtaSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    bottomCtaButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
    },
    bottomCtaButtonText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl * 2,
    },
    modalTitle: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    modalPriceBox: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    modalPrice: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.text,
    },
    modalPricePeriod: {
        fontSize: FontSize.md,
        color: Colors.textMuted,
    },
    modalBillingNote: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    modalFeatures: {
        marginBottom: Spacing.lg,
    },
    modalFeatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    modalFeatureCheck: {
        fontSize: FontSize.md,
        color: Colors.success,
        marginRight: Spacing.sm,
    },
    modalFeatureText: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    modalButtonOutline: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    modalButtonOutlineText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
    modalButtonPrimary: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    modalButtonPrimaryText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
});

export default PricingScreen;
