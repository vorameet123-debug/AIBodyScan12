/**
 * Base UI Components
 * Reusable components matching website design
 */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle,
    StyleProp,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';

// ============================================================================
// Button Component
// ============================================================================

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    style,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return Colors.surfaceLight;
        switch (variant) {
            case 'primary': return Colors.primary;
            case 'secondary': return Colors.surface;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return Colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return Colors.textMuted;
        switch (variant) {
            case 'primary': return Colors.text;
            case 'outline': return Colors.primary;
            case 'ghost': return Colors.textSecondary;
            default: return Colors.text;
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'sm': return { paddingVertical: 8, paddingHorizontal: 16 };
            case 'lg': return { paddingVertical: 16, paddingHorizontal: 32 };
            default: return { paddingVertical: 12, paddingHorizontal: 24 };
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                getPadding(),
                {
                    backgroundColor: getBackgroundColor(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderColor: Colors.primary,
                    width: fullWidth ? '100%' : undefined,
                },
                style,
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <View style={styles.buttonContent}>
                    {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
                    <Text style={[styles.buttonText, { color: getTextColor() }]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

// ============================================================================
// Input Component
// ============================================================================

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric';
    autoCapitalize?: 'none' | 'sentences' | 'words';
}

export const Input: React.FC<InputProps> = ({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
}) => {
    return (
        <View style={styles.inputContainer}>
            {label && <Text style={styles.inputLabel}>{label}</Text>}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                style={[
                    styles.input,
                    error ? { borderColor: Colors.error } : null,
                ]}
            />
            {error && <Text style={styles.inputError}>{error}</Text>}
        </View>
    );
};

// ============================================================================
// Card Component
// ============================================================================

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
    const Wrapper = onPress ? TouchableOpacity : View;

    return (
        <Wrapper
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </Wrapper>
    );
};

// ============================================================================
// Loading Spinner
// ============================================================================

interface LoadingProps {
    size?: 'small' | 'large';
    color?: string;
    fullScreen?: boolean;
    text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
    size = 'large',
    color = Colors.primary,
    fullScreen = false,
    text,
}) => {
    if (fullScreen) {
        return (
            <View style={styles.loadingFullScreen}>
                <ActivityIndicator size={size} color={color} />
                {text && <Text style={styles.loadingText}>{text}</Text>}
            </View>
        );
    }

    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={styles.loadingText}>{text}</Text>}
        </View>
    );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    button: {
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        color: Colors.text,
        fontSize: FontSize.sm,
        marginBottom: Spacing.xs,
        fontWeight: FontWeight.medium,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.text,
        fontSize: FontSize.md,
    },
    inputError: {
        color: Colors.error,
        fontSize: FontSize.xs,
        marginTop: Spacing.xs,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    loadingFullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: Spacing.sm,
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
    },
});

export default { Button, Input, Card, Loading };
