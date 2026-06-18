Astro Mobile (Expo SDK 54 + Expo Router)

Quick start

- Prereqs: Node 18+, npm 9+ (or yarn/pnpm), iOS/Android emulator or Expo Go on device.
- Copy .env example: cp .env.example .env (on Windows, copy manually).
- Install deps: npm install
- Ensure SDK 54-compatible packages: npx expo install --fix
- Start dev: npm start
- Press a to open Android, i to open iOS, w for web.

Environment

- API base URL is read from EXPO_PUBLIC_API_URL.
- Example: http://localhost:5000/api (matches server/index.js routes under /api/*).
- In production, set EXPO_PUBLIC_API_URL to your deployed server API base.

Structure

- app/ (Expo Router)
  - (auth)/login.tsx, signup.tsx
  - (tabs)/_layout.tsx (Home, Services, Wallet, Profile)
  - chat/[chatId].tsx
- src/
  - services/api (axios client + modules)
  - context/AuthContext (auth state + token)
  - hooks (useApi, useAuth)
  - theme (colors from web app)
  - components (Themed wrappers, Loading, ErrorView)

Features

- Auth (login/signup) using /api/auth endpoints, token stored via SecureStore.
- Wallet view + top-up initiation via /api/wallet.
- AI chat using /api/chat (non-stream send; SSE streaming can be added later).
- Tabs mirror web: Home, Services, Wallet, Profile.

Build & Deploy

- Android: expo build:android (via EAS) | iOS: expo build:ios
- Configure EAS and app icons/splash in app.json. Set proper EXPO_PUBLIC_API_URL for prod builds.
