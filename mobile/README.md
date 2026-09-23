# PinoyStars — Expo mobile app

See the [root README](../README.md) for the full setup, the REST API and the Wikipedia integration.

```bash
cp .env.example .env   # set EXPO_PUBLIC_API_URL
npm install
npx expo start         # "a" = Android emulator, or scan the QR code with Expo Go
```

Checks: `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor`.
