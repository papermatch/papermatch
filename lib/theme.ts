import { Platform } from "react-native";
import { configureFonts, MD3LightTheme } from "react-native-paper";

const FONT_SCALE = 1.1;

const fontFamilyRegular = Platform.select({
  web: "Caveat_400Regular",
  ios: "System",
  default: "sans-serif",
});

const fontFamilyMedium = Platform.select({
  web: "Caveat_500Medium",
  ios: "System",
  default: "sans-serif",
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
    primary: "rgb(60, 89, 174)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(219, 225, 255)",
    onPrimaryContainer: "rgb(0, 23, 76)",
    secondary: "rgb(192, 0, 31)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(255, 218, 215)",
    onSecondaryContainer: "rgb(65, 0, 4)",
    tertiary: "rgb(97, 98, 0)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(232, 233, 112)",
    onTertiaryContainer: "rgb(29, 29, 0)",
    error: "rgb(186, 26, 26)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",
    background: "rgb(254, 251, 255)",
    onBackground: "rgb(27, 27, 31)",
    surface: "rgb(233, 233, 246)",
    onSurface: "rgb(27, 27, 31)",
    surfaceVariant: "rgb(226, 225, 236)",
    onSurfaceVariant: "rgb(69, 70, 79)",
    outline: "rgb(117, 118, 128)",
    outlineVariant: "rgb(198, 198, 208)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(48, 48, 52)",
    inverseOnSurface: "rgb(242, 240, 244)",
    inversePrimary: "rgb(180, 197, 255)",
    elevation: {
      level0: "transparent",
      level1: "rgb(244, 243, 251)",
      level2: "rgb(239, 238, 249)",
      level3: "rgb(233, 233, 246)",
      level4: "rgb(231, 232, 245)",
      level5: "rgb(227, 228, 244)",
    },
    surfaceDisabled: "rgba(27, 27, 31, 0.12)",
    onSurfaceDisabled: "rgba(27, 27, 31, 0.38)",
    backdrop: "rgba(46, 48, 56, 0.4)",
  },
  fonts: configureFonts({ config: fontConfig }),
};

export default theme;
