/**
 * Welcome/Onboarding Screen
 * First screen users see before login
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type WelcomeScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>📏</Text>
                    </View>
                    <Text style={styles.title}>AIBodyScan</Text>
                    <Text style={styles.tagline}>
                        AI-Powered Body Measurements{'\n'}& Fashion Intelligence
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    <FeatureItem
                        emoji="📸"
                        title="Instant Body Scan"
                        description="Get accurate measurements from photos"
                    />
                    <FeatureItem
                        emoji="👔"
                        title="Perfect Fit"
                        description="Find clothes that fit you perfectly"
                    />
                    <FeatureItem
                        emoji="✨"
                        title="Fashion IQ"
                        description="Personalized style recommendations"
                    />
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        title="Get Started"
                        onPress={() => navigation.navigate('Register')}
                        fullWidth
                        size="lg"
                    />
                    <View style={styles.spacer} />
                    <Button
                        title="I Already Have an Account"
                        onPress={() => navigation.navigate('Login')}
                        variant="ghost"
                        fullWidth
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

// Feature Item Component
const FeatureItem: React.FC<{
    emoji: string;
    title: string;
    description: string;
}> = ({ emoji, title, description }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureEmoji}>{emoji}</Text>
        <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
        justifyContent: 'space-between',
    },
    hero: {
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    iconText: {
        fontSize: 48,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.sm,
    },
    tagline: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
    },
    features: {
        marginVertical: Spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    featureEmoji: {
        fontSize: 32,
        marginRight: Spacing.md,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    actions: {
        marginBottom: Spacing.lg,
    },
    spacer: {
        height: Spacing.md,
    },
});

export default WelcomeScreen;
