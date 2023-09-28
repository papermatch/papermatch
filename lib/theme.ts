import { Platform } from "react-native";
import { configureFonts, MD3LightTheme } from "react-native-paper";

const fontConfig = {
  fontFamily: Platform.select({
    web: "Caveat_400Regular",
    ios: "System",
    default: "sans-serif",
  }),
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
};
