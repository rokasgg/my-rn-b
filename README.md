# React Native Boilerplate

An [Expo](https://expo.dev) + Expo Router boilerplate with Supabase auth, NativeWind theming, Zustand, React Hook Form + Zod, and TanStack Query already wired up. See [CLAUDE.md](./CLAUDE.md) for the full architecture and conventions.

## Get started

1. Install dependencies

   ```bash
   npm install --legacy-peer-deps
   ```

   (`--legacy-peer-deps` is currently needed due to a patch-version peer lag between `react-native` and `jest-expo`/`eslint-config-expo` — see CLAUDE.md's Testing / Linting sections.)

2. Copy `.env.example` to `.env` and fill in your Supabase project's `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Screens live under `src/app/` using [file-based routing](https://docs.expo.dev/router/introduction).

## Checks

```bash
npm test          # Jest + React Native Testing Library
npm run lint      # expo lint
npx tsc --noEmit  # type check
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
