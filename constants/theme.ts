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
  // Brand
  primary: "#F77F28",
  primaryDark: "#C85F16",
  navy: "#111827",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textOnDark: "#FFFFFF",

  // Surfaces
  background: "#FFFFFF",
  surface: "#F7F8FA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  overlay: "rgba(17, 24, 39, 0.5)",

  // Status (shipment states)
  success: "#16A34A",
  successSoft: "rgba(22, 163, 74, 0.12)",
  warning: "#F59E0B",
  warningSoft: "rgba(245, 158, 11, 0.12)",
  error: "#DC2626",
  errorSoft: "rgba(220, 38, 38, 0.12)",
  info: "#2563EB",
  infoSoft: "rgba(37, 99, 235, 0.12)",
  primarySoft: "rgba(247, 127, 40, 0.12)",
  neutralSoft: "rgba(107, 114, 128, 0.12)",

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
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  floating: {
    shadowColor: "#F77F28",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

/** Minimum touch target size, per accessibility guidance. */
export const MIN_TOUCH_TARGET = 44;

const theme = { colors, typography, spacing, radius, shadow, hitSlop, MIN_TOUCH_TARGET };
export default theme;
