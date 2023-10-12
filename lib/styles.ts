import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
    padding: 2,
  },
  appbarTitle: {
    padding: 2,
  },
  dialog: {
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
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

export default styles;
