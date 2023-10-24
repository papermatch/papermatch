import { Platform } from "react-native";
import { configureFonts, MD3LightTheme } from "react-native-paper";

const FONT_SCALE = 1.0;

const fontFamilyRegular = Platform.select({
  web: "EduNSWACTFoundation_400Regular",
  ios: "System",
  default: "EduNSWACTFoundation_400Regular",
});

const fontFamilyMedium = Platform.select({
  web: "EduNSWACTFoundation_500Medium",
  ios: "System",
  default: "EduNSWACTFoundation_500Medium",
});

const fontConfig = {
  default: {
    fontFamily: fontFamilyRegular,
    fontSize: 14 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 20 * FONT_SCALE,
  },
  displaySmall: {
    fontFamily: fontFamilyRegular,
    fontSize: 36 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 44 * FONT_SCALE,
  },
  displayMedium: {
    fontFamily: fontFamilyRegular,
    fontSize: 45 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 52 * FONT_SCALE,
  },
  displayLarge: {
    fontFamily: fontFamilyRegular,
    fontSize: 57 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 64 * FONT_SCALE,
  },
  headlineSmall: {
    fontFamily: fontFamilyRegular,
    fontSize: 24 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 32 * FONT_SCALE,
  },
  headlineMedium: {
    fontFamily: fontFamilyRegular,
    fontSize: 28 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 36 * FONT_SCALE,
  },
  headlineLarge: {
    fontFamily: fontFamilyRegular,
    fontSize: 32 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 40 * FONT_SCALE,
  },
  titleSmall: {
    fontFamily: fontFamilyMedium,
    fontSize: 14 * FONT_SCALE,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
    lineHeight: 20 * FONT_SCALE,
  },
  titleMedium: {
    fontFamily: fontFamilyMedium,
    fontSize: 16 * FONT_SCALE,
    fontWeight: "500" as const,
    letterSpacing: 0.15,
    lineHeight: 24 * FONT_SCALE,
  },
  titleLarge: {
    fontFamily: fontFamilyMedium,
    fontSize: 22 * FONT_SCALE,
    fontWeight: "500" as const,
    letterSpacing: 0,
    lineHeight: 28 * FONT_SCALE,
  },
  labelSmall: {
    fontFamily: fontFamilyRegular,
    fontSize: 11 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0.5,
    lineHeight: 16 * FONT_SCALE,
  },
  labelMedium: {
    fontFamily: fontFamilyRegular,
    fontSize: 12 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0.5,
    lineHeight: 16 * FONT_SCALE,
  },
  labelLarge: {
    fontFamily: fontFamilyRegular,
    fontSize: 14 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
    lineHeight: 20 * FONT_SCALE,
  },
  bodySmall: {
    fontFamily: fontFamilyRegular,
    fontSize: 12 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0.4,
    lineHeight: 16 * FONT_SCALE,
  },
  bodyMedium: {
    fontFamily: fontFamilyRegular,
    fontSize: 14 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0.25,
    lineHeight: 20 * FONT_SCALE,
  },
  bodyLarge: {
    fontFamily: fontFamilyRegular,
    fontSize: 16 * FONT_SCALE,
    fontWeight: "400" as const,
    letterSpacing: 0.15,
    lineHeight: 24 * FONT_SCALE,
  },
};

const theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    primary: "hsl(225, 48.70%, 45.90%)",
    onPrimary: "hsl(0, 0.00%, 99.99%)",
    primaryContainer: "hsl(230, 99.99%, 92.90%)",
    onPrimaryContainer: "hsl(222, 99.99%, 14.90%)",
    secondary: "hsl(350, 99.99%, 37.60%)",
    onSecondary: "hsl(0, 0.00%, 99.99%)",
    secondaryContainer: "hsl(4, 99.99%, 92.20%)",
    onSecondaryContainer: "hsl(356, 99.99%, 12.70%)",
    tertiary: "hsl(61, 99.99%, 19.20%)",
    onTertiary: "hsl(0, 0.00%, 99.99%)",
    tertiaryContainer: "hsl(60, 73.30%, 67.60%)",
    onTertiaryContainer: "hsl(60, 99.99%, 5.70%)",
    error: "hsl(0, 75.50%, 41.60%)",
    onError: "hsl(0, 0.00%, 99.99%)",
    errorContainer: "hsl(6, 99.99%, 92.00%)",
    onErrorContainer: "hsl(358, 99.99%, 12.70%)",
    background: "hsl(285, 99.99%, 99.20%)",
    onBackground: "hsl(240, 6.90%, 11.40%)",
    surface: "hsl(240, 41.90%, 93.90%)",
    onSurface: "hsl(240, 6.90%, 11.40%)",
    surfaceVariant: "hsl(245, 22.40%, 90.40%)",
    onSurfaceVariant: "hsl(234, 6.80%, 29.00%)",
    outline: "hsl(235, 4.50%, 48.00%)",
    outlineVariant: "hsl(240, 9.60%, 79.60%)",
    shadow: "hsl(0, 0.00%, 0.00%)",
    scrim: "hsl(0, 0.00%, 0.00%)",
    inverseSurface: "hsl(240, 4.00%, 19.60%)",
    inverseOnSurface: "hsl(270, 15.40%, 94.90%)",
    inversePrimary: "hsl(226, 99.99%, 85.30%)",
    elevation: {
      level0: "transparent",
      level1: "hsl(248, 50.00%, 96.90%)",
      level2: "hsl(245, 47.80%, 95.50%)",
      level3: "hsl(240, 41.90%, 93.90%)",
      level4: "hsl(236, 41.20%, 93.30%)",
      level5: "hsl(236, 43.60%, 92.40%)",
    },
    surfaceDisabled: "hsla(240, 6.90%, 11.40%, 0.12)",
    onSurfaceDisabled: "hsla(240, 6.90%, 11.40%, 0.38)",
    backdrop: "hsla(228, 9.80%, 20.00%, 0.40)",
  },
  fonts: configureFonts({ config: fontConfig }),
};

export default theme;
