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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    justifyContent: "space-between",
    padding: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  textColumn: {
    alignSelf: "flex-start",
    padding: 8,
  },
});

export default styles;
