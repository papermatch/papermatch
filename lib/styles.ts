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
      backgroundColor: theme.colors.tertiaryContainer,
    },
    dialogText: {
      color: theme.colors.onTertiaryContainer,
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
      backgroundColor: theme.colors.tertiaryContainer,
    },
    separator: {
      height: 12,
      width: 12,
    },
    textInput: {
      fontSize: theme.fonts.bodyLarge.fontSize,
      lineHeight: theme.fonts.bodyLarge.lineHeight,
    },
  });
};
