/**
 * Design tokens extracted from the Josan Logistics customer-app design PDF.
 * Keep this file as the single source of truth for styling — components
 * should read from here rather than hardcoding hex values or magic numbers.
 *
 * Font note: the source design uses a bold serif for headings (e.g. "Welcome
 * Back!", "Book Shipment") and a friendly rounded sans for body/labels. Exact
 * font names weren't available from the PDF, so this uses the closest
 * available Google Fonts pairing — Merriweather (headings) + Nunito (body).
 * Swap `typography.fontFamily` below if you have the real Figma font names.
 */

export const colors = {
  // Brand — Gold & Dust Orange
  primary: "#C96A32",
  primaryDark: "#A94F22",
  gold: "#D4AF5A",
  goldLight: "#E8D39A",
  navy: "#1F1F1F",
  charcoal: "#1F1F1F",

  // Text
  textPrimary: "#1F1F1F",
  textSecondary: "#6E6B65",
  textMuted: "#A39E93",
  textOnDark: "#FFFFFF",

  // Surfaces
  background: "#FAF8F3",
  surface: "#F2EDE3",
  card: "#FFFFFF",
  cardWarm: "#FAF5EC",
  border: "#E4DCD0",
  borderGold: "#D4AF5A",
  overlay: "rgba(31, 31, 31, 0.5)",

  // Status (shipment states)
  success: "#16A34A",
  successSoft: "rgba(22, 163, 74, 0.12)",
  warning: "#D4AF5A",
  warningSoft: "rgba(212, 175, 90, 0.15)",
  error: "#DC2626",
  errorSoft: "rgba(220, 38, 38, 0.12)",
  info: "#C96A32",
  infoSoft: "rgba(201, 106, 50, 0.12)",
  primarySoft: "rgba(201, 106, 50, 0.12)",
  goldSoft: "rgba(212, 175, 90, 0.15)",
  neutralSoft: "rgba(110, 107, 101, 0.12)",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const typography = {
  fontFamily: {
    headingRegular: "Merriweather_400Regular",
    headingBold: "Merriweather_700Bold",
    bodyRegular: "Nunito_400Regular",
    bodyMedium: "Nunito_600SemiBold",
    bodyBold: "Nunito_700Bold",
    bodyExtraBold: "Nunito_800ExtraBold",
  },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: "700" as const },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: "700" as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  bodyMedium: { fontSize: 15, lineHeight: 20, fontWeight: "600" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  button: { fontSize: 16, lineHeight: 20, fontWeight: "700" as const },
  metric: { fontSize: 26, lineHeight: 32, fontWeight: "700" as const },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  input: 14,
  button: 16,
  card: 18,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: "#1F1F1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  floating: {
    shadowColor: "#C96A32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

/** Minimum touch target size, per accessibility guidance. */
export const MIN_TOUCH_TARGET = 44;

const theme = { colors, typography, spacing, radius, shadow, hitSlop, MIN_TOUCH_TARGET };
export default theme;
