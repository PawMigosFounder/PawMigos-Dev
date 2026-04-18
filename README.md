# PawMigos Mobile

React Native + Expo app for iOS & Android. Talks to the existing `pawmigos-app` Next.js API.

## Setup

```bash
cd pawmigos-mobile
npm install
```

## Run locally

Start the web API first (in `pawmigos-app`: `npm run dev`), then:

```bash
npx expo start
```

- **iOS simulator:** press `i` (uses `localhost:3000`)
- **Android emulator:** press `a` (uses `10.0.2.2:3000`)
- **Physical device (Expo Go):** scan QR — API base is auto-derived from Expo host URI. Override with `extra.apiBaseUrl` in `app.json` if needed.

## Build for stores

Install EAS:

```bash
npm i -g eas-cli
eas login
eas build:configure
```

Then:

```bash
eas build --platform ios
eas build --platform android
eas submit --platform ios
eas submit --platform android
```

Bundle IDs: `com.pawmigos.app` (both platforms).

## Structure

- `app/` — Expo Router file-based routes
  - `(auth)/` — phone + OTP
  - `(consumer)/onboarding.tsx` — 3-step onboarding
  - `(consumer)/(tabs)/` — marketplace, bookings, pets, community, profile
  - `(provider)/` — dashboard, bookings, services, profile
  - `(admin)/` — admin landing
- `components/ui/` — Button, Input, Card, Badge, Select, Toggle, Screen, EmptyState
- `lib/` — api client, auth context, session, theme, types, constants
- `assets/images/` — logo + Pawl mascot

## Auth

JWT from `POST /api/auth/verify-otp` is stored in iOS Keychain / Android Keystore via `expo-secure-store` (falls back to AsyncStorage on web). Every API request auto-attaches `Authorization: Bearer <token>`.
