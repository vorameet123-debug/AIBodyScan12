/**
 * Register Screen
 * Matches website RegisterForm design with Google OAuth
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button, Input } from '../../components/ui';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { AuthAPI, TokenService } from '../../services/api';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { GOOGLE_OAUTH } from '../../config/env';
import { hapticMedium, hapticSuccess, hapticError } from '../../utils/haptics';

// Required for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

type RegisterScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [googleLoading, setGoogleLoading] = useState(false);

    const { register, isLoading, error, clearError } = useAuthStore();

    // Google OAuth setup
    const [_request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_OAUTH.webClientId,
        androidClientId: GOOGLE_OAUTH.webClientId, // Use web client ID for Expo Go
    });

    // Handle Google OAuth response
    React.useEffect(() => {
        if (response?.type === 'success') {
            handleGoogleResponse(response.authentication?.idToken || response.params?.id_token);
        } else if (response?.type === 'error') {
            setGoogleLoading(false);
            hapticError();
            Toast.show({ type: 'error', text1: 'Google Sign-In Failed', text2: 'Could not authenticate with Google' });
        }
    }, [response]);

    const handleGoogleResponse = async (idToken: string | undefined) => {
        if (!idToken) {
            setGoogleLoading(false);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No authentication token received' });
            return;
        }

        try {
            const res = await AuthAPI.googleAuth(idToken);
            await TokenService.setToken(res.access_token);
            const user = {
                id: res.id,
                email: res.email,
                fullname: res.full_name,
                is_premium: res.is_premium || false,
            };
            await TokenService.setUser(user);
            useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
            hapticSuccess();
            Toast.show({ type: 'success', text1: '🎉 Welcome!', text2: `Signed in as ${res.email}` });
        } catch (err: any) {
            hapticError();
            Toast.show({
                type: 'error',
                text1: 'Google Sign-In Failed',
                text2: err.response?.data?.detail || err.message || 'Authentication failed',
            });
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        clearError();
        setGoogleLoading(true);
        hapticMedium();
        try {
            await promptAsync();
        } catch (err) {
            setGoogleLoading(false);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not open Google Sign-In' });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!fullname || fullname.length < 2) {
            newErrors.fullname = 'Name must be at least 2 characters';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        clearError();
        if (!validate()) return;

        const success = await register(fullname, email, password);
        if (!success && error) {
            Toast.show({ type: 'error', text1: 'Registration Failed', text2: error });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>AIBodyScan</Text>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us to get started</Text>
                    </View>

                    {/* Google Sign Up — shown first for convenience */}
                    <TouchableOpacity
                        style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
                        onPress={handleGoogleSignIn}
                        disabled={googleLoading || isLoading}
                        activeOpacity={0.8}
                    >
                        {googleLoading ? (
                            <ActivityIndicator size="small" color={Colors.text} />
                        ) : (
                            <>
                                <Text style={styles.googleIcon}>G</Text>
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or register with email</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Full Name"
                            value={fullname}
                            onChangeText={setFullname}
                            placeholder="Enter your full name"
                            autoCapitalize="words"
                            error={errors.fullname}
                        />

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            secureTextEntry
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        <Button
                            title={isLoading ? 'Creating Account...' : 'Sign Up'}
                            onPress={handleRegister}
                            loading={isLoading}
                            fullWidth
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logo: {
        fontSize: FontSize.xxxl,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: Spacing.md,
    },
    googleButtonDisabled: {
        opacity: 0.5,
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4285F4',
        marginRight: 10,
    },
    googleButtonText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    form: {
        marginBottom: Spacing.xl,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        color: Colors.textMuted,
        marginHorizontal: Spacing.md,
        fontSize: FontSize.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
    },
    footerLink: {
        color: Colors.primary,
        fontSize: FontSize.md,
        fontWeight: '600',
    },
});

export default RegisterScreen;
