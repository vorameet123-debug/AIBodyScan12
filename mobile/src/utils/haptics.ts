/**
 * Haptic Feedback Utility
 * Provides tactile feedback for key user interactions.
 * Falls back silently on unsupported platforms.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

/** Light tap — for selection changes, toggles */
export const hapticLight = () => {
    if (isSupported) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    }
};

/** Medium tap — for button presses, confirmations */
export const hapticMedium = () => {
    if (isSupported) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    }
};

/** Heavy tap — for important actions (submit, delete) */
export const hapticHeavy = () => {
    if (isSupported) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => { });
    }
};

/** Success — for completed actions (save, purchase) */
export const hapticSuccess = () => {
    if (isSupported) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    }
};

/** Warning — for attention-needed events */
export const hapticWarning = () => {
    if (isSupported) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    }
};

/** Error — for failures */
export const hapticError = () => {
    if (isSupported) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
    }
};

/** Selection tick — for picker/scroll selection changes */
export const hapticSelection = () => {
    if (isSupported) {
        Haptics.selectionAsync().catch(() => { });
    }
};
