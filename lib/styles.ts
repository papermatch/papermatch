import { useEffect, useState } from "react";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get("window"),
    screen: Dimensions.get("screen"),
  });
  const theme = useTheme();

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );
    return () => subscription?.remove();
  }, []);

  return StyleSheet.create({
    appView: Platform.select({
      default: {
        backgroundColor: theme.colors.background,
        flex: 1,
      },
      web: {
        backgroundColor: theme.colors.background,
        height: dimensions.window.height,
        overflow: "hidden",
      },
    }),
    container: {
      maxWidth: 600,
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      paddingHorizontal: 12,
      flex: 1,
    },
    verticallySpaced: {
      marginBottom: 12,
    },
    bottom: {
      height: 60,
      justifyContent: "space-between",
      padding: 12,
    },
    buttonLabel: {},
    appbarTitle: {},
    dialog: {
      marginHorizontal: 12,
      backgroundColor: theme.colors.secondaryContainer,
    },
    dialogText: {
      color: theme.colors.onSecondaryContainer,
    },
    snackbar: {
      marginHorizontal: 12,
    },
    aboveNav: {
      marginBottom: 72,
    },
    fabContainer: {
      maxWidth: 600,
      width: "100%",
      alignSelf: "center",
    },
    modal: {
      marginHorizontal: 12,
      padding: 26,
      borderRadius: 21,
      backgroundColor: theme.colors.secondaryContainer,
    },
    separator: {
      height: 12,
      width: 12,
    },
    textInput: {
      fontSize: theme.fonts.bodyLarge.fontSize,
      lineHeight: theme.fonts.bodyLarge.lineHeight,
    },
    portalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarSize: {
      width: Math.min(600, dimensions.window.width) - 48,
    },
    pageIndicatorContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      height: 20,
      marginTop: 10,
    },
    pageIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primaryContainer,
      marginHorizontal: 4,
    },
    pageIndicatorActive: {
      backgroundColor: theme.colors.primary,
    },
  });
};
