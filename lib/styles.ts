import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      maxWidth: 600,
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      padding: 12,
      flex: 1,
    },
    verticallySpaced: {
      marginTop: 6,
      marginBottom: 6,
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
      maxWidth: 600,
      width: "100%",
      alignSelf: "center",
      backgroundColor: theme.colors.tertiaryContainer,
    },
    dialogText: {
      color: theme.colors.onTertiaryContainer,
    },
    snackbar: {
      maxWidth: 600,
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
  });
};
