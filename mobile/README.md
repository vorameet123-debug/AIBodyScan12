# BodyScan AI — Mobile App

React Native (Expo) mobile application for AI Body Scan.

## Tech Stack

- **Framework:** React Native + Expo SDK
- **Language:** TypeScript
- **Navigation:** Expo Router

## Prerequisites

- Node.js 18+
- Expo Go app installed on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Backend API running (`python api/app.py` from root folder)

## Quick Start

```bash
cd mobile
npm install
npx expo start --offline
```

> **Note:** Use `--offline` to skip the Expo login prompt. Without it, Expo asks you to log in or proceed anonymously.

Scan the QR code with **Expo Go** app on your phone.

## ⚠️ API Connection Setup (IMPORTANT)

The mobile app needs to connect to the backend API running on your computer. Since your phone is a separate device, `localhost` won't work.

### Step 1: Find your computer's IP address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your Wi-Fi or Ethernet adapter
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig | grep inet
```

### Step 2: Update the IP in the config file

Edit the file: **`mobile/src/config/env.ts`**

Find this line (inside the `getDevApiUrl` function):
```typescript
// Fallback: manual IP (only needed if auto-detect fails)
return 'http://10.201.127.213:8000';
```

Replace `10.201.127.213` with **your computer's IP address**.

### Step 3: Ensure same network

Your phone and computer **must be on the same Wi-Fi network** for the app to reach the API.

### Step 4: Restart Expo

```bash
# Stop Expo (Ctrl+C), then:
npx expo start --offline
```

### Auto-Detection (Usually Works)

The app tries to **auto-detect** your PC's IP from Expo's debug connection. If auto-detect works, you don't need to change anything. The manual IP is only a fallback.

## Project Structure

```
mobile/
├── App.tsx              # Root component
├── src/
│   ├── config/
│   │   └── env.ts       # ← API URL config (change IP here)
│   ├── screens/         # App screens
│   ├── components/      # Reusable components
│   ├── services/        # API service layer
│   └── navigation/      # Navigation setup
├── assets/              # Images & fonts
├── app.json             # Expo config
├── eas.json             # EAS Build config
└── tsconfig.json        # TypeScript config
```

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build Android APK
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Something went wrong" on app open | Check that backend API is running and IP is correct |
| App loads but API calls fail | Ensure phone and PC are on the same Wi-Fi |
| Expo asks for login | Use `npx expo start --offline` to skip |
| QR code doesn't scan | Make sure Expo Go is installed, try the URL manually |
| `ConfigError: package.json not found` | Run command from `mobile/` folder, not root |
