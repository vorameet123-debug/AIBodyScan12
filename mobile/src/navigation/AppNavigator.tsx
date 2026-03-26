/**
 * Main Navigation Structure
 * Tab Navigator + Stack Navigators for each section
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';

// Auth Screens
import { LoginScreen, RegisterScreen, WelcomeScreen, ForgotPasswordScreen } from '../screens/auth';

// Placeholder screens - will be replaced with actual screens
const PlaceholderScreen = ({ title }: { title: string }) => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>{title}</Text>
        <Text style={styles.placeholderSubtext}>Coming soon...</Text>
    </View>
);

// Main Screens
import { BodyScanScreen } from '../screens/scan';
import { HomeScreen } from '../screens/home';
import { SavedMeasurementsScreen } from '../screens/measurements';
import { BodyTrackerScreen } from '../screens/tracker';
import { Model3DViewerScreen } from '../screens/model';
import { ClothingFitCheckerScreen, WardrobeDashboardScreen, WardrobeAnalyticsScreen } from '../screens/wardrobe';
import { FashionIQScreen, TrendDashboardScreen, SizeRecommendationsScreen } from '../screens/fashion';
import { PricingScreen, ProfileSettingsScreen } from '../screens/profile';
import { AboutScreen, FeaturesShowcaseScreen, StatusPageScreen } from '../screens/info';

// Navigator types
export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Scan: undefined;
    Wardrobe: undefined;
    Fashion: undefined;
    Profile: undefined;
};

export type MainStackParamList = {
    Tabs: undefined;
    SavedMeasurements: undefined;
    BodyTracker: undefined;
    Model3DViewer: undefined;
    ClothingFitChecker: undefined;
    WardrobeAnalytics: undefined;
    TrendDashboard: undefined;
    SizeRecommendations: undefined;
    Pricing: undefined;
    About: undefined;
    Features: undefined;
    Status: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// Tab Icon Component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
            {name === 'Home' ? '🏠' :
                name === 'Scan' ? '📷' :
                    name === 'Wardrobe' ? '👔' :
                        name === 'Fashion' ? '✨' : '👤'}
        </Text>
    </View>
);

// Auth Navigator (for unauthenticated users)
const AuthNavigator = () => (
    <AuthStack.Navigator
        screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
        }}
        initialRouteName="Welcome"
    >
        <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
);

// Tab Navigator (bottom tabs for authenticated users)
const TabNavigator = () => (
    <MainTab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textMuted,
            tabBarLabelStyle: styles.tabBarLabel,
        }}
    >
        <MainTab.Screen
            name="Home"
            component={HomeScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
            }}
        />
        <MainTab.Screen
            name="Scan"
            component={BodyScanScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabIcon name="Scan" focused={focused} />,
            }}
        />
        <MainTab.Screen
            name="Wardrobe"
            component={WardrobeDashboardScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabIcon name="Wardrobe" focused={focused} />,
            }}
        />
        <MainTab.Screen
            name="Fashion"
            component={FashionIQScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabIcon name="Fashion" focused={focused} />,
            }}
        />
        <MainTab.Screen
            name="Profile"
            component={ProfileSettingsScreen}
            options={{
                tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
            }}
        />
    </MainTab.Navigator>
);

// Main Stack Navigator (wraps tabs + additional screens)
const MainNavigator = () => (
    <MainStack.Navigator
        screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: Colors.background },
        }}
    >
        <MainStack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{ headerShown: false }}
        />
        <MainStack.Screen
            name="SavedMeasurements"
            component={SavedMeasurementsScreen}
            options={{ title: 'My Measurements' }}
        />
        <MainStack.Screen
            name="BodyTracker"
            component={BodyTrackerScreen}
            options={{ title: 'Body Tracker' }}
        />
        <MainStack.Screen
            name="Model3DViewer"
            component={Model3DViewerScreen}
            options={{ title: '3D Model' }}
        />
        <MainStack.Screen
            name="ClothingFitChecker"
            component={ClothingFitCheckerScreen}
            options={{ title: 'Fit Checker' }}
        />
        <MainStack.Screen
            name="WardrobeAnalytics"
            component={WardrobeAnalyticsScreen}
            options={{ title: 'Wardrobe Analytics' }}
        />
        <MainStack.Screen
            name="TrendDashboard"
            component={TrendDashboardScreen}
            options={{ title: 'Trend Dashboard' }}
        />
        <MainStack.Screen
            name="SizeRecommendations"
            component={SizeRecommendationsScreen}
            options={{ title: 'Size Guide' }}
        />
        <MainStack.Screen
            name="Pricing"
            component={PricingScreen}
            options={{ title: 'Subscription Plans' }}
        />
        <MainStack.Screen
            name="About"
            component={AboutScreen}
            options={{ title: 'About' }}
        />
        <MainStack.Screen
            name="Features"
            component={FeaturesShowcaseScreen}
            options={{ title: 'Features' }}
        />
        <MainStack.Screen
            name="Status"
            component={StatusPageScreen}
            options={{ title: 'System Status' }}
        />
    </MainStack.Navigator>
);

// Main App Navigator
export const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <Text style={styles.loadingLogo}>AIBodyScan</Text>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    placeholderText: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    placeholderSubtext: {
        color: Colors.textMuted,
        fontSize: 16,
        marginTop: 8,
    },
    tabBar: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 65,
        paddingBottom: 10,
        paddingTop: 8,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    tabIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabIconFocused: {
        backgroundColor: Colors.primary + '20',
    },
    tabIconText: {
        fontSize: 18,
    },
    tabIconTextFocused: {
        fontSize: 20,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingLogo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 16,
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});

export default AppNavigator;
