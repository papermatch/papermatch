import { View, FlatList } from "react-native";
import { Text } from "react-native-paper";
import { useStyles } from "../lib/styles";
import { CreditData } from "../lib/types";
import { ROUTES, Link } from "../lib/routing";
import { toDateTimeString } from "../lib/utils";

type HistoryProps = {
  history: CreditData[];
};

export const History = ({ history }: HistoryProps) => {
  const styles = useStyles();

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
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <Text style={{ flex: 3 }}>
              {toDateTimeString(new Date(item.created_at))}
            </Text>
            <Text style={{ flex: 1, textAlign: "center" }}>{item.credits}</Text>
            {item.creditor === "match" ? (
              <Link
                style={{ flex: 2, textAlign: "right" }}
                to={`../${ROUTES.MATCH}/${item.creditor_id}`}
              >
                <Text style={{ flex: 2, textAlign: "right" }}>Match</Text>
              </Link>
            ) : (
              <Text style={{ flex: 2, textAlign: "right" }}>
                {item.creditor === "init"
                  ? "Initial"
                  : item.creditor === "admin"
                  ? "Admin"
                  : "Purchase"}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};
