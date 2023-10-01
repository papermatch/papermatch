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
  centerAligned: {
    alignItems: "center",
  },
  bottom: {
    height: 60,
    justifyContent: "space-between",
    padding: 12,
  },
});

export default styles;
