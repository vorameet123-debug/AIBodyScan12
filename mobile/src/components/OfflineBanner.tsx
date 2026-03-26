/**
 * Offline Banner Component
 * Shows a non-intrusive banner when the device has no internet connection.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors } from '../constants/theme';

export const OfflineBanner: React.FC = () => {
    const { isConnected } = useNetworkStatus();
    const slideAnim = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isConnected ? -50 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isConnected, slideAnim]);

    return (
        <Animated.View
            style={[
                styles.banner,
                { transform: [{ translateY: slideAnim }] },
            ]}
            pointerEvents={isConnected ? 'none' : 'auto'}
        >
            <View style={styles.content}>
                <Text style={styles.icon}>📡</Text>
                <Text style={styles.text}>No Internet Connection</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#EF4444',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    icon: {
        fontSize: 14,
        marginRight: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
});

export default OfflineBanner;
