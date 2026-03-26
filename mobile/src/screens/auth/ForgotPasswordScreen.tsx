/**
 * Forgot Password Screen
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type ForgotPasswordScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // TODO: Call API to send reset email
            // await AuthAPI.forgotPassword(email);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSent(true);
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (sent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.successIcon}>
                        <Text style={styles.successEmoji}>✉️</Text>
                    </View>
                    <Text style={styles.title}>Check Your Email</Text>
                    <Text style={styles.description}>
                        We've sent a password reset link to{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>
                    <View style={styles.actions}>
                        <Button
                            title="Back to Login"
                            onPress={() => navigation.navigate('Login')}
                            fullWidth
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.description}>
                            Enter your email address and we'll send you a link to reset your password.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={error}
                        />

                        <Button
                            title={isLoading ? 'Sending...' : 'Send Reset Link'}
                            onPress={handleSubmit}
                            loading={isLoading}
                            fullWidth
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: Spacing.md,
        left: Spacing.lg,
    },
    backButtonText: {
        color: Colors.primary,
        fontSize: FontSize.md,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    description: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    emailText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    form: {
        marginBottom: Spacing.xl,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.success,
    },
    successEmoji: {
        fontSize: 40,
    },
    actions: {
        marginTop: Spacing.xl,
    },
});

export default ForgotPasswordScreen;
