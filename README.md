# Josan Logistics Customer App

A production-ready React Native (Expo) app for Josan Logistics' customers —
book shipments, track deliveries, calculate rates, and manage addresses,
payment methods, and profile — built with TypeScript, Expo Router, and a
clean service/hook/component architecture.

This is a separate app from the Josan Logistics **Driver** app (a sibling
project). It's a from-scratch native rebuild of the customer-facing design
reference (an 8-screen PDF): Onboarding, Login, Register, Home Dashboard,
Book Shipment (4-step wizard), Track Shipment, Rate Calculator, and Profile.
It does not wrap any HTML/web view — every screen, component, and data flow
here is native React Native.

---

## 1. Install dependencies

From the project root:

```bash
npm install
```

This installs Expo SDK 52, Expo Router, React Native, and the native
modules the app uses (secure storage, image picker, custom Google fonts,
etc.).

If you use `yarn` or `pnpm` instead, delete `package-lock.json` first and use
your tool's install command — Expo doesn't require npm specifically.

---

## 2. Start the app

```bash
npm start
```

This runs `expo start` and opens the Metro bundler / Expo Dev Tools. From
there you can:

- Press `a` to open in a connected Android emulator/device
- Press `i` to open in the iOS simulator (Mac only)
- Press `w` to open in a web browser
- Scan the QR code with the **Expo Go** app on your phone for the fastest way
  to try it on a physical device

## 3. Run on Android specifically

**Option A — Expo Go (fastest, no native build needed):**

```bash
npm run android
```

This starts Metro and launches the app in a connected Android emulator or a
physical device with the Expo Go app installed. This app only uses
Expo-compatible modules, so Expo Go is sufficient for development.

**Option B — a real native build (dev client):**

```bash
npx expo run:android
```

This requires Android Studio and the Android SDK installed locally. It
compiles a native Android project (into `android/`, not checked in) and
installs it on your emulator/device.

---

## 4. Which files control each screen

The app uses **Expo Router** — every file under `app/` is a route, and the
folder structure *is* the navigation structure.

| Screen | File |
|---|---|
| Onboarding | `app/index.tsx` |
| Login | `app/(auth)/login.tsx` |
| Register | `app/(auth)/register.tsx` |
| Forgot Password | `app/(auth)/forgot-password.tsx` |
| Home Dashboard | `app/(tabs)/home.tsx` |
| Track Shipment (tab) | `app/(tabs)/shipments.tsx` |
| Help & Support | `app/(tabs)/support.tsx` |
| Profile | `app/(tabs)/profile.tsx` |
| Book Shipment — Details | `app/book/details.tsx` |
| Book Shipment — Package | `app/book/package.tsx` |
| Book Shipment — Review | `app/book/review.tsx` |
| Book Shipment — Confirmation | `app/book/confirm.tsx` |
| Rate Calculator | `app/rate-calculator.tsx` |
| Shipment Details / Tracking | `app/shipment/[trackingId].tsx` |
| Edit Profile | `app/profile/edit.tsx` |
| Address Book | `app/profile/addresses.tsx` |
| Add / Edit Address | `app/profile/add-address.tsx` |
| Payment Methods | `app/profile/payment-methods.tsx` |
| Change Password | `app/profile/change-password.tsx` |

A few structural files worth knowing:

- **`app/_layout.tsx`** — the root layout. Loads fonts (including icon
  glyph fonts, preloaded up front so icons never flash blank on first
  paint), wraps the app in `AuthProvider`, and contains the "route guard"
  that redirects between the `(auth)` screens and the `(tabs)` screens based
  on sign-in state — except the onboarding screen, which is always reachable
  even when signed out. No individual screen needs to check auth itself.
- **`app/(auth)/_layout.tsx`** and **`app/(tabs)/_layout.tsx`** — the auth
  stack, and the bottom tab bar (`components/TabBar.tsx` — a custom 5-item
  bar where the center "Book" button is a raised action that pushes
  `/book/details`, not a real tab).
- **`app/book/_layout.tsx`** — wraps the 4-step Book Shipment wizard in
  `BookingProvider` (`hooks/useBooking.tsx`), so the in-progress draft is
  shared across the 4 step screens without threading it through router
  params.

Beyond `app/`, the codebase is organized like this:

- **`components/`** — reusable UI: `Header` (brand + title variants),
  `TabBar`, `AppMenu`, `Card`, `PrimaryButton`, `SecondaryButton`,
  `TextField`, `Checkbox`, `StatusPill`/`StatusBadge`, `ShipmentCard`,
  `AddressCard`, `QuickActionTile`, `Stepper`, `AccordionRow`,
  `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmationModal`.
- **`services/`** — all backend I/O lives here. Screens never call
  `fetch`/`axios` directly.
  - `api.ts` — the shared axios client (auth header, error shape, timeouts)
  - `auth.ts` — login/register/forgot-password/logout/session persistence
  - `shipments.ts` — shipment list/detail/tracking lookup, create shipment
  - `addresses.ts` — address book CRUD
  - `payments.ts` — payment methods list/delete
  - `rates.ts` — rate calculation
  - `user.ts` — profile update, avatar upload, change password
- **`hooks/`** — React hooks that wrap the services above for screens
  (`useAuth`, `useShipments`, `useAddresses`, `usePaymentMethods`,
  `useRateCalculator`, `useBooking`).
- **`types/`** — shared TypeScript types (`Shipment`, `Address`,
  `PaymentMethod`, `User`, rate and API request/response shapes).
- **`constants/theme.ts`** — the single source of truth for colors,
  typography, spacing, radii, and shadows, extracted from the design
  reference. Change a value here to re-theme the whole app.
- **`constants/config.ts`** — reads environment variables into one typed
  config object (see next section).
- **`utils/`** — pure helper functions (date/currency formatting, initials,
  email validation, shipment status → color/label/icon mapping).

---

## 5. Where to add your backend API URL

The app never hardcodes a backend URL or any credentials. Everything goes
through an environment variable:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set:
   ```
   EXPO_PUBLIC_API_BASE_URL=https://your-real-api.example.com/v1
   ```
3. Restart `npm start` (environment variables are read at bundle time).

That's the only place you need to touch — `services/api.ts` reads
`EXPO_PUBLIC_API_BASE_URL` via `constants/config.ts` and every service file
builds its requests relative to it.

**Testing from a physical phone:** `localhost` on your phone refers to the
phone itself, not your computer. Use your computer's LAN IP instead, e.g.
`EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:4000`, and make sure your
phone and computer are on the same network.

**Note on Expo's env variable rules:** only variables prefixed with
`EXPO_PUBLIC_` are inlined into the JS bundle — this is intentional, so it's
impossible to accidentally ship a secret key in the app. Auth tokens are
never stored in `.env` or in code; they're written to the device's secure
storage (`expo-secure-store`) only after a real login, via
`services/auth.ts` → `hooks/useAuth.tsx`.

**Until you have a backend:** every read-only screen (home dashboard,
shipment list/tracking, address book, payment methods, rate calculator)
falls back to local sample data in `services/mockData.ts` when the API call
fails, but **only in development** (`__DEV__`). This makes the app fully
browsable out of the box for design/QA review, and the fallback silently
stops being used the moment a real `EXPO_PUBLIC_API_BASE_URL` starts
responding. **Login, Register, Forgot Password, creating a shipment,
creating/editing/deleting an address, deleting a payment method, and
changing your password never use mock data** — there's no fallback path
that lets you perform any of these actions without a real backend, by
design.

---

## 6. How to build an Android APK

Native builds are done with **EAS Build** (Expo's cloud build service),
already configured in `eas.json` with a `preview` profile that produces an
installable `.apk`.

1. Install the EAS CLI and log in (one-time):
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Make sure `app.json`'s `android.package`
   (`com.josanlogistics.customer`) is the identifier you want to ship.
3. Build:
   ```bash
   npm run build:android
   ```
   (this runs `eas build --platform android --profile preview`)
4. EAS builds in the cloud — when it finishes, the terminal prints a URL
   where you can download the `.apk` directly to install on a device.

For a Play Store submission instead of a sideloadable APK, use the
`production` profile (which builds an `.aab`):
```bash
eas build --platform android --profile production
```

**Building locally instead of in the cloud:**
```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```
The resulting APK will be at
`android/app/build/outputs/apk/release/app-release.apk`.

---

## Design notes & known limitations

- **Fonts:** the source design uses a bold serif for headings and a
  friendly rounded sans for body text, but exact Figma font names weren't
  available from the supplied PDF. This app uses the closest available
  Google Fonts pairing — **Merriweather** (headings) + **Nunito** (body) —
  configured in one place (`constants/theme.ts`). Swap them there if you
  have the real font names.
- **Photographic imagery:** the Onboarding screen and Home banner use a
  photographic truck illustration in the design reference. No image assets
  were supplied, so this app uses icon-based visuals (Ionicons /
  MaterialCommunityIcons) in the same brand colors instead. Drop in real
  image assets and swap the `<Ionicons>`/`<MaterialCommunityIcons>` elements
  in `app/index.tsx` and `app/(tabs)/home.tsx` for pixel-exact parity.
- **"Continue with Google"** on the Login screen is UI-only — it renders
  the button from the design but isn't wired to real Google OAuth. Wiring
  it up requires `expo-auth-session` (or a similar library) plus real
  OAuth client credentials, which weren't in scope for this build.
- **Adding a payment method:** the design's Profile → Payment Method
  section shows saved payment methods, but the reference didn't include an
  "add payment method" screen, and there's no such backend endpoint defined
  in `services/payments.ts`. Listing and removing payment methods is fully
  implemented; add a `createPaymentMethod` endpoint and a form screen when
  your backend supports one (likely via a card-tokenizing SDK, since raw
  card numbers should never touch your own server).
- **Backend contract:** no backend is included. Every `services/*.ts` file
  is written against a REST API contract (see the JSDoc/inline comments in
  each file for the expected endpoints) — point `EXPO_PUBLIC_API_BASE_URL`
  at a real implementation of that contract and the app works end to end.
- **Rate Calculator formula:** `services/rates.ts` tries a real
  `/rates/calculate` endpoint first; its `__DEV__`-only fallback formula is
  illustrative only (flat base + per-kg rate) and should be replaced by
  your real pricing engine's response.
