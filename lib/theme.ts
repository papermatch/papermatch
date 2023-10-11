import { Platform } from "react-native";
import { configureFonts, MD3LightTheme } from "react-native-paper";

const fontFamily = Platform.select({
  web: "Caveat_400Regular",
  ios: "System",
  default: "sans-serif",
});

const fontConfig = {
  default: {
    fontFamily: fontFamily,
    fontWeight: "400" as const,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontFamily,
    fontSize: 36,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  displayMedium: {
    fontFamily: fontFamily,
    fontSize: 45,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displayLarge: {
    fontFamily: fontFamily,
    fontSize: 57,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  headlineSmall: {
    fontFamily: fontFamily,
    fontSize: 24,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  headlineMedium: {
    fontFamily: fontFamily,
    fontSize: 28,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineLarge: {
    fontFamily: fontFamily,
    fontSize: 32,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  titleSmall: {
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  titleMedium: {
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleLarge: {
    fontFamily: fontFamily,
    fontSize: 22,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  labelSmall: {
    fontFamily: fontFamily,
    fontSize: 11,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelMedium: {
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: "400" as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  bodyMedium: {
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: "400" as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: "400" as const,
    letterSpacing: 0.15,
    lineHeight: 24,
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
    tertiary: "rgb(0, 97, 162)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(209, 228, 255)",
    onTertiaryContainer: "rgb(0, 29, 53)",
    error: "rgb(186, 26, 26)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",
    background: "rgb(254, 251, 255)",
    onBackground: "rgb(27, 27, 31)",
    surface: "rgb(254, 251, 255)",
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
