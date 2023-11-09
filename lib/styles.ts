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
    buttonLabel: {
      padding: 1,
    },
    appbarTitle: {
      padding: 1,
    },
    dialog: {
      maxWidth: Math.min(600, dimensions.window.width - 24),
      width: "100%",
      alignSelf: "center",
      backgroundColor: theme.colors.tertiaryContainer,
    },
    dialogText: {
      padding: 1,
      color: theme.colors.onTertiaryContainer,
    },
    snackbar: {
      maxWidth: Math.min(600, dimensions.window.width - 24),
      width: "100%",
      alignSelf: "center",
    },
    aboveNav: {
      marginBottom: 60,
    },
    fabContainer: {
      maxWidth: 600,
      width: "100%",
      alignSelf: "center",
    },
    modal: {
      maxWidth: Math.min(600, dimensions.window.width - 24),
      width: "100%",
      marginHorizontal: 12,
      alignSelf: "center",
      padding: 26,
      borderRadius: 21,
      backgroundColor: theme.colors.tertiaryContainer,
    },
    separator: {
      height: 12,
      width: 12,
    },
  });
};
