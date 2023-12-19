import React from "react";
import { View, Pressable, FlatList } from "react-native";
import { Text } from "react-native-paper";
import { useStyles } from "../lib/styles";
import { CreditData } from "../lib/types";
import { ROUTES, useNavigate } from "../lib/routing";
import { toDateTimeString } from "../lib/utils";

type HistoryProps = {
  history: CreditData[];
};

export const History = ({ history }: HistoryProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <View>
      <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
        <Text style={{ flex: 3 }}>Date</Text>
        <Text style={{ flex: 1, textAlign: "center" }}>Credits</Text>
        <Text style={{ flex: 2, textAlign: "right" }}>Type</Text>
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.verticallySpaced, { flexDirection: "row" }]}
            onPress={
              item.creditor === "match"
                ? () => navigate(`../${ROUTES.MATCH}/${item.creditor_id}`)
                : null
            }
          >
            <Text style={{ flex: 3 }}>
              {toDateTimeString(new Date(item.created_at))}
            </Text>
            <Text style={{ flex: 1, textAlign: "center" }}>{item.credits}</Text>
            <Text style={{ flex: 2, textAlign: "right" }}>
              {item.creditor === "match"
                ? "Match"
                : item.creditor === "init"
                ? "Initial"
                : "Purchase"}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};
