# React Native Boilerplate Guidelines

## Tech Stack
- Framework: Expo (React Native) with Expo Router (File-based navigation)
- Language: TypeScript (Strict mode)
- Styling: NativeWind v4 (Tailwind CSS)
- State Management: Zustand
- Backend/Auth: Supabase (`@supabase/supabase-js`), session persisted via `@react-native-async-storage/async-storage`
- Forms: React Hook Form + Zod (`@hookform/resolvers/zod`)
- Toasts: Burnt

## Coding Rules
1. ALWAYS use TypeScript with strict interfaces. Do not use `any`.
2. ALWAYS use NativeWind `className=""` for styling instead of Inline `style={}` or `StyleSheet.create`.
3. Use Functional Components with Named Exports.
4. Keep navigation inside the `app/` directory using Expo Router standards.
5. Use icons from `@expo/vector-icons`.
6. NEVER use deprecated React Navigation imports.

## Project Structure
```
src/
  app/            # Expo Router routes only (screens + _layout.tsx). No business logic here.
    _layout.tsx   # Root Stack. Owns the auth redirect guard (see Auth Flow below).
    (auth)/       # Unauthenticated group: login, register, forgot-password. Own Stack layout, headerShown: false.
    (tabs)/       # Authenticated group: Tabs layout (Home, Explore, Profile) with @expo/vector-icons.
  components/
    ui/           # Reusable, presentational primitives (Button, Input, etc.)
  lib/
    supabase.ts   # Supabase client singleton
    validations/  # Zod schemas, one file per domain: <domain>.ts (e.g. auth.ts)
  store/          # Zustand stores, one file per domain: use<Domain>Store.ts
  utils/
    toast.ts      # Thin wrapper over Burnt (success/error/info)
```

## Components (`src/components/`)
- Reusable UI primitives live in `src/components/ui/`, PascalCase filenames matching the exported component (e.g. `Button.tsx` exports `Button`).
- Export via named export, never `export default`, for components in `components/`.
- Accept a `className?: string` prop (and `<field>ClassName?: string` for styled sub-elements, e.g. `textClassName`) so callers can extend/override styling — merge it into the base className string, don't replace it.
- Extend the underlying RN component's props via `interface XProps extends PressableProps { ... }` rather than redefining known props.
- For components with visual variants (e.g. `variant?: 'primary' | 'secondary' | 'outline'`), define a `Record<Variant, { container: string; text: string }>` style map above the component and look up classes from it — don't branch styling inline with ternaries in JSX.
- Route screens (`app/**`) use `export default function ScreenName()` (required by Expo Router); everything else uses named exports.

## NativeWind Styles
- `tailwind.config.js` has `darkMode: 'class'` — always pair a light class with a `dark:` variant for any color-bearing className (backgrounds, text, borders). Never ship a screen/component that only looks correct in one color scheme.
- Standard screen container: `flex-1 items-center justify-center bg-white dark:bg-black` (or `bg-white dark:bg-black px-6` for forms).
- Standard text color pair: `text-black dark:text-white`. Secondary/placeholder text: `text-gray-500`/`#8e8e93` (also used for `placeholderTextColor`, which NativeWind can't style directly).
- Inputs: never hand-roll a `TextInput` on a screen — use `components/ui/Input` (`rounded-lg border border-gray-300 px-4 py-3 text-black dark:border-gray-700 dark:text-white`, switches to `border-red-600 dark:border-red-500` when it has an `error`).
- Primary buttons: `rounded-lg bg-black py-3 dark:bg-white` with inverted text `text-white dark:text-black`; for buttons with multiple variants, use the `components/ui/Button` component instead of hand-rolling one.
- Never use `StyleSheet.create` or inline `style={}` for anything expressible in Tailwind; `style` is reserved for values NativeWind cannot express (e.g. dynamic numeric layout from measurements).

## Zustand Stores (`src/store/`)
- One file per domain, named `use<Domain>Store.ts`, exporting a single hook `use<Domain>Store` (e.g. `useAuthStore`).
- Define an explicit `interface <Domain>State { ... }` with state fields first, then actions, and type `create<XState>((set) => ({ ... }))` — no untyped stores.
- Actions call `set({ ... })` with partial state; keep action logic (e.g. calling Supabase) inside the store, not in components — components only call action methods and read state via selectors: `useAuthStore((state) => state.isAuthenticated)`. Avoid destructuring the whole store (causes unnecessary re-renders).
- Async actions (`signIn`, `signUp`, `signOut`, `resetPassword`, ...) always return `Promise<{ error: string | null }>` — never throw. Callers check `error` and forward it to `toast.error(...)`; they do NOT set store state directly.
- Actions that change auth state do not call `set()` themselves — Supabase's `onAuthStateChange` listener (wired in the root `_layout.tsx`) is the single source of truth for `session`/`user`/`isAuthenticated`, pushed through `setSession()`. This avoids double-updating state from both the action call and the listener.
- Current store: `useAuthStore` — `session`, `user`, `isAuthenticated`, `isInitialized`, `setSession(session)`, `signUp(email, password, name)`, `signIn(email, password)`, `signOut()`, `resetPassword(email)`.

## Expo Router Routes (`src/app/`)
- Two top-level route groups: `(auth)` for unauthenticated screens and `(tabs)` for the authenticated app shell. Each group has its own `_layout.tsx` (`Stack` for `(auth)`, `Tabs` for `(tabs)`), both with `headerShown: false`.
- Auth gating lives ONLY in the root `src/app/_layout.tsx`: it reads `isAuthenticated` from `useAuthStore`, compares against `useSegments()[0] === '(auth)'`, and calls `router.replace(...)` inside a `useEffect` to redirect. Do not duplicate redirect logic in individual screens.
- `(tabs)/_layout.tsx` defines tab icons via `@expo/vector-icons` (`Ionicons`), colored using `useColorScheme()` — not NativeWind — since `tabBarActiveTintColor`/`tabBarStyle` are native navigator options, not styleable views.
- Link between screens with `<Link href="/(auth)/register" asChild>` wrapping a `Pressable`, not raw `router.push` unless imperative navigation is required (e.g. post-action redirects, which use `router.replace`).
- Adding a new screen = adding a file under the correct group; adding a new tab = adding both the screen file in `(tabs)/` and a `<Tabs.Screen name="..." />` entry in `(tabs)/_layout.tsx`.

## Supabase (`src/lib/supabase.ts`)
- One client singleton, `supabase`, created with `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (read from `.env`, see `.env.example`). It throws at import time if either is missing — never add fallback/mock defaults here.
- Session persistence uses `@react-native-async-storage/async-storage` (`persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: false` since this is native, not web).
- All Supabase calls go through `useAuthStore` actions — screens and components never import `supabase` directly.
- Root `_layout.tsx` is the only place that calls `supabase.auth.getSession()` / `supabase.auth.onAuthStateChange()`; it shows a full-screen `ActivityIndicator` until `isInitialized` is true, then applies the `(auth)`/`(tabs)` redirect.

## Form Validation (React Hook Form + Zod)
- Schemas live in `src/lib/validations/<domain>.ts` (e.g. `auth.ts`), one `z.object({...})` per form, each exporting both the schema and its inferred type: `export type XFormData = z.infer<typeof xSchema>`.
- Cross-field checks (e.g. `confirmPassword` matching `password`) use `.refine()` with an explicit `path: ['field']` so the error attaches to the right input.
- Screens with a form use `useForm<XFormData>({ resolver: zodResolver(xSchema), defaultValues: {...} })` and wrap every input in `<Controller control={control} name="field" render={...} />` — never manage form fields with raw `useState` once a Zod schema exists for that form.
- Render validation errors via the `Input` component's `error={errors.field?.message}` prop; never show them in a toast (toasts are for API/network outcomes, not per-field validation).

## Toasts (`src/utils/toast.ts`)
- Always call `toast.success(...)` / `toast.error(...)` / `toast.info(...)` from `@/utils/toast` — never import `burnt` directly in a screen/component.
- Use toasts for the outcome of an async action (API error message, "Password reset email sent!", etc.), triggered right after `await` resolves in the submit handler. Do not toast validation errors — those render inline under the relevant `Input`.

## Reusable Form Input (`src/components/ui/Input.tsx`)
- Wraps `TextInput` with an optional `label`, `error` (renders red helper text and switches the border to red), and `isPassword` (renders an eye/eye-off `@expo/vector-icons` toggle and manages visibility internally — don't pass `secureTextEntry` yourself when using `isPassword`).
- Forwards its ref (`forwardRef<TextInput, InputProps>`) so it works as a `Controller` render target and with RHF's `ref` wiring.
- Any new form field type (e.g. a future `Select`) should follow the same shape: `label?`, `error?`, `className?`, forwarded ref, RN props spread last.